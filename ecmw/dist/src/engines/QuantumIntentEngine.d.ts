/**
 * Quantum-Inspired Intent Engine
 * Advanced intent analysis using quantum-inspired algorithms for multi-dimensional intent detection
 */
import { UserContext } from '../core/ECMWCore';
export interface IntentAnalysis {
    primaryIntent: string;
    secondaryIntents: string[];
    confidence: number;
    quantumStates: QuantumState[];
    contextFactors: ContextFactor[];
    emotionalWeight: number;
    temporalContext: TemporalContext;
}
export interface QuantumState {
    intent: string;
    amplitude: number;
    phase: number;
    coherence: number;
}
export interface ContextFactor {
    factor: string;
    weight: number;
    influence: 'positive' | 'negative' | 'neutral';
    source: 'user_history' | 'current_context' | 'external_data';
}
export interface TemporalContext {
    timeOfDay: number;
    dayOfWeek: number;
    season: 'winter' | 'spring' | 'summer' | 'fall';
    urgency: 'low' | 'medium' | 'high' | 'critical';
}
export interface QuantumIntentConfig {
    maxSuperpositionStates: number;
    coherenceThreshold: number;
    interferenceSensitivity: number;
    contextWindowSize: number;
    learningRate: number;
}
export declare class QuantumIntentEngine {
    private config;
    private intentPatterns;
    private contextHistory;
    constructor(config: QuantumIntentConfig);
    /**
     * Analyze user input using quantum-inspired algorithms
     */
    analyzeIntent(input: string, context: UserContext): Promise<IntentAnalysis>;
    /**
     * Preprocess user input for analysis
     */
    private preprocessInput;
    /**
     * Create quantum superposition of possible intents
     */
    private createSuperposition;
    /**
     * Apply quantum interference between intent states
     */
    private applyQuantumInterference;
    /**
     * Collapse superposition to primary intent
     */
    private collapseToPrimaryIntent;
    /**
     * Extract secondary intents from remaining states
     */
    private extractSecondaryIntents;
    /**
     * Calculate intent amplitude based on input matching
     */
    private calculateIntentAmplitude;
    /**
     * Calculate quantum phase for interference calculations
     */
    private calculateIntentPhase;
    /**
     * Calculate quantum coherence
     */
    private calculateCoherence;
    /**
     * Calculate quantum interference between two states
     */
    private calculateInterference;
    /**
     * Analyze context factors influencing intent
     */
    private analyzeContextFactors;
    /**
     * Calculate emotional weight of the input
     */
    private calculateEmotionalWeight;
    /**
     * Extract temporal context
     */
    private extractTemporalContext;
    /**
     * Get keywords associated with an intent
     */
    private getIntentKeywords;
    /**
     * Initialize base intent patterns
     */
    private initializeBasePatterns;
    /**
     * Simple string hashing for phase calculations
     */
    private hashString;
    /**
     * Hash context for phase calculations
     */
    private hashContext;
    /**
     * Update intent patterns based on learning
     */
    updatePatterns(pattern: string, states: QuantumState[]): void;
    /**
     * Get current configuration
     */
    getConfig(): QuantumIntentConfig;
    /**
     * Update configuration
     */
    updateConfig(newConfig: Partial<QuantumIntentConfig>): void;
    /**
     * Get engine metrics
     */
    getMetrics(): Promise<any>;
    /**
     * Health check for the engine
     */
    healthCheck(): Promise<boolean>;
    /**
     * Cleanup resources
     */
    cleanup(): Promise<void>;
}
export default QuantumIntentEngine;
//# sourceMappingURL=QuantumIntentEngine.d.ts.map