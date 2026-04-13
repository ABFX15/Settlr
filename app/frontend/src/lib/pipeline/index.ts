/**
 * Data Pipeline — Public barrel export
 */

export { emitEvent, getRecentEvents, getEventsByMerchant, getEventCount, getOldestPendingEvent } from "./events";
export { processEvents, getMerchantStats, getPlatformStats, getLastProcessedAt, getTotalProcessedCount } from "./processor";
export { generateExport } from "./exporter";
export type {
    PipelineEvent,
    PipelineEventType,
    EntityType,
    MerchantDailyStats,
    PlatformDailyStats,
    PipelineHealth,
    ExportFormat,
    ExportRequest,
    ExportResult,
} from "./types";
