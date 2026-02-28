/**
 * Minimal pino-compatible stub for Turbopack SSR bundling.
 * Prevents thread-stream (Node-only, has test files with intentional
 * syntax errors) from being pulled into the Client Component SSR bundle
 * via the chain: @privy-io/react-auth/solana → @walletconnect/logger → pino → thread-stream
 */
const noop = () => { };

function createLogger() {
    const logger = {
        trace: noop,
        debug: noop,
        info: noop,
        warn: noop,
        error: noop,
        fatal: noop,
        silent: noop,
        child: () => createLogger(),
        level: "silent",
        isLevelEnabled: () => false,
        levels: {
            values: { trace: 10, debug: 20, info: 30, warn: 40, error: 50, fatal: 60 },
            labels: { 10: "trace", 20: "debug", 30: "info", 40: "warn", 50: "error", 60: "fatal" },
        },
        on: noop,
        once: noop,
        addListener: noop,
        removeListener: noop,
        removeAllListeners: noop,
        emit: noop,
        bindings: () => ({}),
        flush: noop,
        setBindings: noop,
    };
    return logger;
}

function pino() {
    return createLogger();
}

pino.destination = () => ({ write: noop, flush: noop, end: noop });
pino.transport = () => ({ write: noop, flush: noop, end: noop });
pino.multistream = () => ({ write: noop, flush: noop, end: noop });
pino.levels = {
    values: { trace: 10, debug: 20, info: 30, warn: 40, error: 50, fatal: 60 },
    labels: { 10: "trace", 20: "debug", 30: "info", 40: "warn", 50: "error", 60: "fatal" },
};
pino.stdSerializers = { req: noop, res: noop, err: noop, wrapRequestSerializer: noop, wrapResponseSerializer: noop, wrapErrorSerializer: noop };
pino.stdTimeFunctions = { epochTime: () => `,"time":${Date.now()}`, unixTime: () => `,"time":${Math.round(Date.now() / 1000)}`, nullTime: () => "", isoTime: () => `,"time":"${new Date().toISOString()}"` };
pino.symbols = {};
pino.version = "0.0.0-stub";

export default pino;
export { pino };
module.exports = pino;
module.exports.default = pino;
module.exports.pino = pino;
