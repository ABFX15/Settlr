#!/usr/bin/env python3
"""One-shot script to clean up hero headline."""
import sys

path = "/Users/adambryant/x402-hack-payment/app/frontend/src/app/page.tsx"
with open(path, "r") as f:
    content = f.read()

old = '              <h1\n                className="mt-10 text-5xl leading-[1.04] tracking-[-0.03em] sm:text-6xl lg:text-[80px]"\n                style={{\n                  color: p.navy,\n                  fontFamily: "var(--font-fraunces), Georgia, serif",\n                  fontWeight: 800,\n                }}\n              >\n                <BlurText\n                  text="The payment rail cannabis wholesalers"\n                  delay={0.1}\n                  stagger={0.06}\n                />{{" "}}\n                <BlurText\n                  text="can\u2019t be cut off from."\n                  delay={{0.1 + 5 * 0.06}}\n                  stagger={0.06}\n                  wordStyle={{\n                    background:\n                      "linear-gradient(135deg, #1B6B4A 0%, #155939 100%)",\n                    WebkitBackgroundClip: "text",\n                    WebkitTextFillColor: "transparent",\n                  }}\n                />\n              </h1>\n\n              <R delay={{0.5}}>'

# Actually, let me just search for the BlurText pattern more carefully
idx = content.find('text="can\u2019t be cut off from."')
if idx == -1:
    idx = content.find("text=\"can\u2019t be cut off from.\"")
if idx == -1:
    idx = content.find("can\u2019t be cut off")
print(f"Smart apostrophe search at index: {idx}")

# Find the h1 opening tag before BlurText
h1_start = content.rfind("<h1", 0, idx)
h1_close = content.find("</h1>", idx) + len("</h1>")
print(f"h1 tag range: {h1_start} to {h1_close}")
print(f"Content around h1:\n{content[h1_start:h1_close]}")

# Also find the <R delay={0.5}> after it
r_start = content.find("<R delay={0.5}>", h1_close)
print(f"R tag at: {r_start}")

# Replace the whole block
old_block = content[h1_start:r_start + len("<R delay={0.5}>")]

new_block = """<R delay={0.1}>
                <h1
                  className="mt-10 text-5xl leading-[1.04] tracking-[-0.03em] sm:text-6xl lg:text-[80px]"
                  style={{
                    color: p.navy,
                    fontFamily: "var(--font-fraunces), Georgia, serif",
                    fontWeight: 800,
                  }}
                >
                  The payment rail cannabis wholesalers{" "}
                  <span style={{ color: p.green }}>
                    can&rsquo;t be cut off from.
                  </span>
                </h1>
              </R>

              <R delay={0.2}>"""

content = content[:h1_start] + new_block + content[r_start + len("<R delay={0.5}>"):]
with open(path, "w") as f:
    f.write(content)
print("Done")
