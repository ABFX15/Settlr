/**
 * Reddit Payment-Pain Research Scraper
 * ------------------------------------
 * Zero-dependency (native fetch, Node 18+). Searches public Reddit submission
 * data via the PullPush.io aggregator (api.pullpush.io) for payment-pain
 * signals across high-risk verticals, then aggregates which verticals + pain
 * points show the strongest demand for a settlement product.
 *
 * Reddit's own *.json endpoints now hard-block unauthenticated access (403 at
 * the edge), so this uses PullPush.io — the public successor to Pushshift —
 * which serves historical Reddit submissions with no auth. Read-only research,
 * polite pacing with backoff, no PII storage beyond public post metadata.
 *
 * Usage (from repo root):
 *   app/frontend/node_modules/.bin/tsx scripts/reddit-research/scrape.ts
 *   app/frontend/node_modules/.bin/tsx scripts/reddit-research/scrape.ts --time=month --pages=2
 *   app/frontend/node_modules/.bin/tsx scripts/reddit-research/scrape.ts --vertical=cbd,firearms
 *
 * Flags:
 *   --time=hour|day|week|month|year|all   (default: year)
 *   --pages=N                              pagination depth per query (default: 1, ~100 posts)
 *   --vertical=a,b,c                       restrict to named verticals (default: all)
 *   --limit=N                              posts per request, max 100 (default: 100)
 *   --min-score=N                          min pain-signal score to keep a post (default: 1)
 */

import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// ---------------------------------------------------------------------------
// Config — edit these to retarget the research
// ---------------------------------------------------------------------------

/** Pain-signal phrases. Each match in title/body adds to a post's score. */
const PAIN_SIGNALS: { phrase: string; weight: number }[] = [
    { phrase: "high risk merchant", weight: 3 },
    { phrase: "high-risk merchant", weight: 3 },
    { phrase: "payment processor", weight: 2 },
    { phrase: "merchant account", weight: 2 },
    { phrase: "processor dropped", weight: 3 },
    { phrase: "dropped by stripe", weight: 3 },
    { phrase: "stripe banned", weight: 3 },
    { phrase: "stripe shut", weight: 3 },
    { phrase: "stripe closed", weight: 3 },
    { phrase: "stripe froze", weight: 3 },
    { phrase: "paypal banned", weight: 3 },
    { phrase: "paypal froze", weight: 3 },
    { phrase: "paypal limited", weight: 2 },
    { phrase: "square closed", weight: 3 },
    { phrase: "account frozen", weight: 2 },
    { phrase: "funds held", weight: 2 },
    { phrase: "rolling reserve", weight: 3 },
    { phrase: "chargeback", weight: 2 },
    { phrase: "can't accept payment", weight: 3 },
    { phrase: "cant accept payment", weight: 3 },
    { phrase: "can't take payment", weight: 3 },
    { phrase: "no payment processor", weight: 3 },
    { phrase: "won't process", weight: 2 },
    { phrase: "declined our account", weight: 2 },
    { phrase: "shut down my account", weight: 2 },
    { phrase: "crypto payment", weight: 2 },
    { phrase: "accept crypto", weight: 2 },
    { phrase: "accept usdc", weight: 3 },
    { phrase: "accept usdt", weight: 3 },
    { phrase: "stablecoin", weight: 2 },
];

/** Search queries — broad payment-pain terms used for subreddit-restricted search. */
const QUERIES = [
    "payment processor",
    "high risk merchant",
    "stripe banned",
    "paypal froze",
    "chargeback",
    "accept crypto",
    "can't accept payments",
];

interface Vertical {
    id: string;
    label: string;
    subreddits: string[];
}

const VERTICALS: Vertical[] = [
    { id: "cbd", label: "CBD / Hemp", subreddits: ["CBD", "hempflowers", "CBDinfo"] },
    { id: "cannabis", label: "Cannabis B2B", subreddits: ["weedbiz", "cannabusiness", "CannabisExtracts", "dispensary", "uktrees"] },
    { id: "firearms", label: "Firearms", subreddits: ["gunpolitics", "gundeals", "Firearms"] },
    { id: "adult", label: "Adult / Creators", subreddits: ["onlyfansadvice", "CreatorsAdvice", "Tgirls"] },
    { id: "supplements", label: "Supplements / Nootropics", subreddits: ["Nootropics", "Supplements", "moreplatesmoredates"] },
    { id: "peptides", label: "Peptides", subreddits: ["Peptides", "PeptidesUK"] },
    { id: "vape", label: "Vape / Tobacco", subreddits: ["electronic_cigarette", "Vaping"] },
    { id: "kratom", label: "Kratom", subreddits: ["kratom", "quittingkratom"] },
    { id: "gambling", label: "Gambling / Gaming", subreddits: ["sportsbook", "problemgambling"] },
    { id: "creditrepair", label: "Credit / Debt", subreddits: ["CRedit", "personalfinance"] },
    { id: "ecommerce", label: "E-commerce (general)", subreddits: ["ecommerce", "shopify", "smallbusiness", "Entrepreneur"] },
    { id: "crypto-b2b", label: "Crypto-native B2B", subreddits: ["ethdev", "solana", "CryptoCurrency", "ethfinance"] },
];

const REDDIT_BASE = "https://www.reddit.com"; // used only to build human-clickable permalinks
const PULLPUSH_BASE = "https://api.pullpush.io/reddit/search/submission/";
const USER_AGENT = "offbank-research/1.0 (payment-pain demand research; contact: founder)";
const REQUEST_DELAY_MS = 1200; // polite pacing between requests

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

function arg(name: string, def: string): string {
    const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
    return hit ? hit.split("=")[1] : def;
}

const TIME = arg("time", "year");
const PAGES = Math.max(1, parseInt(arg("pages", "1"), 10));
const LIMIT = Math.min(100, Math.max(1, parseInt(arg("limit", "100"), 10)));
const MIN_SCORE = Math.max(0, parseInt(arg("min-score", "1"), 10));
const VERTICAL_FILTER = arg("vertical", "all")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

const selectedVerticals =
    VERTICAL_FILTER.length === 1 && VERTICAL_FILTER[0] === "all"
        ? VERTICALS
        : VERTICALS.filter((v) => VERTICAL_FILTER.includes(v.id));

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RedditPost {
    id: string;
    subreddit: string;
    title: string;
    selftext: string;
    url: string;
    permalink: string;
    score: number;
    num_comments: number;
    created_utc: number;
    author: string;
}

interface ScoredPost extends RedditPost {
    painScore: number;
    matched: string[];
    vertical: string;
}

// ---------------------------------------------------------------------------
// Fetch helpers
// ---------------------------------------------------------------------------

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Convert a Reddit-style time window to a Unix epoch cutoff (seconds). */
function timeWindowToAfterEpoch(t: string): number | null {
    const now = Math.floor(Date.now() / 1000);
    const day = 86400;
    switch (t) {
        case "hour": return now - 3600;
        case "day": return now - day;
        case "week": return now - 7 * day;
        case "month": return now - 30 * day;
        case "year": return now - 365 * day;
        case "all": return null;
        default: return now - 365 * day;
    }
}
const AFTER_EPOCH = timeWindowToAfterEpoch(TIME);

async function fetchJson(url: string, attempt = 0): Promise<any> {
    try {
        const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
        if (res.status === 429) {
            const backoff = 4000 * (attempt + 1);
            console.warn(`  ↳ rate-limited (429), backing off ${backoff}ms...`);
            await sleep(backoff);
            if (attempt < 3) return fetchJson(url, attempt + 1);
            return null;
        }
        if (!res.ok) {
            console.warn(`  ↳ HTTP ${res.status} for ${url}`);
            return null;
        }
        return await res.json();
    } catch (err) {
        console.warn(`  ↳ fetch error: ${(err as Error).message}`);
        if (attempt < 2) {
            await sleep(2000);
            return fetchJson(url, attempt + 1);
        }
        return null;
    }
}

/** Map a PullPush `before` epoch for crude pagination (older than the oldest seen). */
function oldestEpoch(posts: RedditPost[]): number | null {
    if (!posts.length) return null;
    return posts.reduce((min, p) => (p.created_utc && p.created_utc < min ? p.created_utc : min), posts[0].created_utc);
}

/** Search a subreddit for a query via PullPush, paginating up to PAGES by time window. */
async function searchSubreddit(sub: string, query: string): Promise<RedditPost[]> {
    const posts: RedditPost[] = [];
    let before: number | null = null;

    for (let page = 0; page < PAGES; page++) {
        const params = new URLSearchParams({
            q: query,
            subreddit: sub,
            size: String(LIMIT),
            sort: "desc",
            sort_type: "created_utc",
        });
        // NOTE: PullPush's `after` param is unreliable (silently returns 0 for
        // many queries), so we page with `before` and filter the time window
        // client-side against AFTER_EPOCH below.
        if (before) params.set("before", String(before));

        const url = `${PULLPUSH_BASE}?${params.toString()}`;
        const data = await fetchJson(url);
        await sleep(REQUEST_DELAY_MS);

        const items = data?.data ?? [];
        if (!items.length) break;

        for (const d of items) {
            if (!d?.id) continue;
            const createdUtc = d.created_utc ?? 0;
            // Client-side time-window filter (PullPush `after` is unreliable).
            if (AFTER_EPOCH && createdUtc && createdUtc < AFTER_EPOCH) continue;
            posts.push({
                id: d.id,
                subreddit: d.subreddit ?? sub,
                title: d.title ?? "",
                selftext: d.selftext ?? "",
                url: d.url ?? "",
                permalink: d.permalink ? `${REDDIT_BASE}${d.permalink}` : `${REDDIT_BASE}/comments/${d.id}`,
                score: d.score ?? 0,
                num_comments: d.num_comments ?? 0,
                created_utc: createdUtc,
                author: d.author ?? "[unknown]",
            });
        }

        const next = oldestEpoch(posts);
        if (!next || next === before) break;
        before = next;
    }
    return posts;
}

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

function scorePost(post: RedditPost, vertical: string): ScoredPost {
    const haystack = `${post.title}\n${post.selftext}`.toLowerCase();
    let painScore = 0;
    const matched: string[] = [];
    for (const sig of PAIN_SIGNALS) {
        if (haystack.includes(sig.phrase)) {
            painScore += sig.weight;
            matched.push(sig.phrase);
        }
    }
    return { ...post, painScore, matched, vertical };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
    console.log("Reddit Payment-Pain Research");
    console.log("============================");
    console.log(`time=${TIME} pages=${PAGES} limit=${LIMIT} min-score=${MIN_SCORE}`);
    console.log(`verticals: ${selectedVerticals.map((v) => v.id).join(", ")}\n`);

    const seen = new Set<string>();
    const scored: ScoredPost[] = [];

    for (const vertical of selectedVerticals) {
        console.log(`▶ ${vertical.label} (${vertical.subreddits.join(", ")})`);
        for (const sub of vertical.subreddits) {
            for (const query of QUERIES) {
                const found = await searchSubreddit(sub, query);
                for (const post of found) {
                    if (seen.has(post.id)) continue;
                    seen.add(post.id);
                    const sp = scorePost(post, vertical.id);
                    if (sp.painScore >= MIN_SCORE) scored.push(sp);
                }
            }
        }
        const vCount = scored.filter((p) => p.vertical === vertical.id).length;
        console.log(`  ✓ ${vCount} qualifying posts\n`);
    }

    // Aggregate by vertical
    const byVertical = selectedVerticals
        .map((v) => {
            const posts = scored.filter((p) => p.vertical === v.id);
            const totalPain = posts.reduce((s, p) => s + p.painScore, 0);
            const engagement = posts.reduce((s, p) => s + p.score + p.num_comments, 0);
            return {
                id: v.id,
                label: v.label,
                posts: posts.length,
                totalPainScore: totalPain,
                avgPainScore: posts.length ? +(totalPain / posts.length).toFixed(2) : 0,
                engagement,
                topPosts: posts
                    .sort((a, b) => b.painScore - a.painScore || b.num_comments - a.num_comments)
                    .slice(0, 5),
            };
        })
        .sort((a, b) => b.totalPainScore - a.totalPainScore);

    // Aggregate by pain phrase
    const phraseCounts = new Map<string, number>();
    for (const p of scored) for (const m of p.matched) phraseCounts.set(m, (phraseCounts.get(m) ?? 0) + 1);
    const byPhrase = [...phraseCounts.entries()].map(([phrase, count]) => ({ phrase, count })).sort((a, b) => b.count - a.count);

    // Output
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const outDir = join(__dirname, "out");
    mkdirSync(outDir, { recursive: true });
    const stamp = new Date().toISOString().slice(0, 10);

    const jsonPath = join(outDir, `reddit-payment-pain-${stamp}.json`);
    writeFileSync(jsonPath, JSON.stringify({ generatedAt: new Date().toISOString(), params: { TIME, PAGES, LIMIT, MIN_SCORE }, byVertical, byPhrase, allPosts: scored }, null, 2));

    const csvPath = join(outDir, `reddit-payment-pain-${stamp}.csv`);
    const csvRows = [
        "vertical,subreddit,painScore,upvotes,comments,title,permalink",
        ...scored
            .sort((a, b) => b.painScore - a.painScore)
            .map((p) =>
                [p.vertical, p.subreddit, p.painScore, p.score, p.num_comments, `"${p.title.replace(/"/g, "'")}"`, p.permalink].join(",")
            ),
    ];
    writeFileSync(csvPath, csvRows.join("\n"));

    const htmlPath = join(outDir, `reddit-payment-pain-${stamp}.html`);
    writeFileSync(htmlPath, renderHtml(byVertical, byPhrase, scored.length));

    // Console summary
    console.log("\n══════════ RANKED VERTICALS (by total pain score) ══════════");
    for (const v of byVertical) {
        console.log(`${v.label.padEnd(26)} posts=${String(v.posts).padStart(3)}  pain=${String(v.totalPainScore).padStart(4)}  avg=${v.avgPainScore}  engagement=${v.engagement}`);
    }
    console.log("\n══════════ TOP PAIN PHRASES ══════════");
    for (const p of byPhrase.slice(0, 12)) console.log(`${p.phrase.padEnd(26)} ${p.count}`);

    console.log(`\nTotal qualifying posts: ${scored.length}`);
    console.log(`\nOutputs:\n  ${jsonPath}\n  ${csvPath}\n  ${htmlPath}`);
}

function esc(s: string): string {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function renderHtml(byVertical: any[], byPhrase: any[], total: number): string {
    const maxPain = Math.max(1, ...byVertical.map((v) => v.totalPainScore));
    const rows = byVertical
        .map((v) => {
            const pct = Math.round((v.totalPainScore / maxPain) * 100);
            const top = v.topPosts
                .map(
                    (p: ScoredPost) =>
                        `<li><a href="${esc(p.permalink)}" target="_blank">${esc(p.title || "(no title)")}</a> <span class="meta">r/${esc(p.subreddit)} · pain ${p.painScore} · ${p.num_comments} comments</span></li>`
                )
                .join("");
            return `<tr><td><strong>${esc(v.label)}</strong><div class="bar"><span style="width:${pct}%"></span></div></td>
              <td class="num">${v.posts}</td><td class="num">${v.totalPainScore}</td><td class="num">${v.avgPainScore}</td><td class="num">${v.engagement}</td></tr>
              <tr class="detail"><td colspan="5"><ul>${top || "<li class='meta'>no qualifying posts</li>"}</ul></td></tr>`;
        })
        .join("");
    const phrases = byPhrase.slice(0, 15).map((p) => `<tr><td>${esc(p.phrase)}</td><td class="num">${p.count}</td></tr>`).join("");
    return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Reddit Payment-Pain Research</title><style>
:root{--bg:#0a0c10;--panel:#12161d;--ink:#e8edf4;--muted:#93a1b3;--line:#222a35;--green:#34d399;--blue:#60a5fa}
body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.6 -apple-system,Segoe UI,Roboto,sans-serif}
.wrap{max-width:960px;margin:0 auto;padding:40px 24px 80px}
h1{font-size:26px;margin:0 0 4px}.sub{color:var(--muted);margin:0 0 24px}
table{width:100%;border-collapse:collapse;margin:12px 0}
th,td{text-align:left;padding:9px 12px;border-bottom:1px solid var(--line);vertical-align:top}
th{color:var(--muted);font-size:12px;text-transform:uppercase;letter-spacing:.08em}
.num{text-align:right;font-variant-numeric:tabular-nums}
.bar{height:6px;background:#0d1117;border-radius:4px;margin-top:6px;overflow:hidden}
.bar span{display:block;height:100%;background:linear-gradient(90deg,var(--blue),var(--green))}
.detail td{padding-top:0;border-bottom:1px solid var(--line)}
.detail ul{margin:0 0 8px;padding-left:18px}.detail a{color:var(--blue);text-decoration:none}
.meta{color:var(--muted);font-size:12px}
.two{display:grid;grid-template-columns:2fr 1fr;gap:24px}@media(max-width:720px){.two{grid-template-columns:1fr}}
</style></head><body><div class="wrap">
<h1>Reddit Payment-Pain Research</h1>
<p class="sub">${total} qualifying posts · generated ${new Date().toISOString().slice(0, 16).replace("T", " ")} · ranked by total pain score</p>
<div class="two"><div>
<table><thead><tr><th>Vertical</th><th class="num">Posts</th><th class="num">Pain</th><th class="num">Avg</th><th class="num">Engage</th></tr></thead>
<tbody>${rows}</tbody></table>
</div><div>
<h3 style="font-size:13px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted)">Top pain phrases</h3>
<table><tbody>${phrases}</tbody></table>
</div></div>
<p class="meta" style="margin-top:32px;border-top:1px solid var(--line);padding-top:16px">Read-only research against Reddit's public JSON API. Pain score = sum of weighted payment-pain phrases matched in each post's title+body. Higher total pain = stronger concentration of payment-rejection signal in that vertical. Validate top verticals with direct outreach before committing.</p>
</div></body></html>`;
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
