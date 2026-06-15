/**
 * Minimal level-gated logger for server-side code (API routes + lib).
 *
 * Wraps console so all server logging flows through one sink with a
 * consistent format and a configurable level. Set LOG_LEVEL to one of
 * "debug" | "info" | "warn" | "error" (default "info"). In production you
 * can raise it to "warn" to silence informational chatter while still
 * surfacing warnings and errors.
 *
 * Existing call sites already prefix messages with a [Module] tag; this
 * preserves the same arguments so behaviour is unchanged at the default
 * level.
 */

type Level = "debug" | "info" | "warn" | "error";

const ORDER: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };

function currentLevel(): number {
    const raw = (process.env.LOG_LEVEL || "info").toLowerCase() as Level;
    return ORDER[raw] ?? ORDER.info;
}

function enabled(level: Level): boolean {
    return ORDER[level] >= currentLevel();
}

export const logger = {
    debug: (...args: unknown[]) => {
        if (enabled("debug")) console.debug(...args);
    },
    info: (...args: unknown[]) => {
        if (enabled("info")) console.log(...args);
    },
    warn: (...args: unknown[]) => {
        if (enabled("warn")) console.warn(...args);
    },
    error: (...args: unknown[]) => {
        // Errors always surface regardless of level.
        console.error(...args);
    },
};
