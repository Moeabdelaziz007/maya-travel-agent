/**
 * CrossTripMemoryAgent - Stub implementation for E-CMW testing
 * This is a placeholder for the actual CrossTripMemoryAgent implementation
 */
export declare class CrossTripMemoryAgent {
    updateMemory(userId: string, result: any, context: any): Promise<void>;
    getUserContext(userId: string): Promise<any>;
    persistAllContexts(): Promise<void>;
    shutdown(): Promise<void>;
}
export default CrossTripMemoryAgent;
//# sourceMappingURL=CrossTripMemoryAgent.d.ts.map