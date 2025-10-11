"use strict";
/**
 * CarbonConsciousAgent - Stub implementation for E-CMW testing
 * This is a placeholder for the actual CarbonConsciousAgent implementation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CarbonConsciousAgent = void 0;
class CarbonConsciousAgent {
    async analyzeTrip(output) {
        // Stub implementation - would contain actual carbon analysis logic
        return {
            carbonFootprint: 0,
            carbonSaved: 0,
            sustainability: 'medium'
        };
    }
    async shutdown() {
        // Stub implementation
        return Promise.resolve();
    }
}
exports.CarbonConsciousAgent = CarbonConsciousAgent;
exports.default = CarbonConsciousAgent;
//# sourceMappingURL=CarbonConsciousAgent.js.map