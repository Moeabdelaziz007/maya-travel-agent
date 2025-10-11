"use strict";
/**
 * Quantum-Inspired Intent Engine
 * Advanced intent analysis using quantum-inspired algorithms for multi-dimensional intent detection
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuantumIntentEngine = void 0;
const ECMWCore_1 = require("../core/ECMWCore");
class QuantumIntentEngine {
    constructor(config) {
        this.config = config;
        this.intentPatterns = new Map();
        this.contextHistory = [];
        this.initializeBasePatterns();
    }
    /**
     * Analyze user input using quantum-inspired algorithms
     */
    async analyzeIntent(input, context) {
        // Step 1: Preprocess input
        const processedInput = this.preprocessInput(input);
        // Step 2: Create quantum superposition of possible intents
        const superposition = await this.createSuperposition(processedInput, context);
        // Step 3: Apply quantum interference and decoherence
        const interferedStates = this.applyQuantumInterference(superposition);
        // Step 4: Collapse to primary intent with confidence
        const primaryIntent = this.collapseToPrimaryIntent(interferedStates);
        // Step 5: Calculate secondary intents and context factors
        const secondaryIntents = this.extractSecondaryIntents(interferedStates);
        const contextFactors = this.analyzeContextFactors(context, processedInput);
        const emotionalWeight = this.calculateEmotionalWeight(processedInput, context);
        const temporalContext = this.extractTemporalContext();
        return {
            primaryIntent,
            secondaryIntents,
            confidence: primaryIntent.confidence,
            quantumStates: interferedStates,
            contextFactors,
            emotionalWeight,
            temporalContext,
        };
    }
    /**
     * Preprocess user input for analysis
     */
    preprocessInput(input) {
        return input
            .toLowerCase()
            .trim()
            .replace(/[^\w\s\u0600-\u06FF]/g, ' ') // Keep Arabic characters
            .replace(/\s+/g, ' ');
    }
    /**
     * Create quantum superposition of possible intents
     */
    async createSuperposition(input, context) {
        const states = [];
        // Travel-related intents
        const travelIntents = [
            'book_flight',
            'book_hotel',
            'plan_trip',
            'get_recommendations',
            'check_weather',
            'find_restaurants',
            'cultural_info',
            'emergency_help',
        ];
        for (const intent of travelIntents) {
            const amplitude = this.calculateIntentAmplitude(input, intent, context);
            const phase = this.calculateIntentPhase(intent, context);
            const coherence = this.calculateCoherence(intent, context);
            if (amplitude > 0.1) {
                // Only include significant states
                states.push({
                    intent,
                    amplitude,
                    phase,
                    coherence,
                });
            }
        }
        // Limit to max superposition states
        return states
            .sort((a, b) => b.amplitude - a.amplitude)
            .slice(0, this.config.maxSuperpositionStates);
    }
    /**
     * Apply quantum interference between intent states
     */
    applyQuantumInterference(states) {
        const interferedStates = [];
        for (let i = 0; i < states.length; i++) {
            let totalAmplitude = states[i].amplitude;
            let totalPhase = states[i].phase;
            // Calculate interference with other states
            for (let j = 0; j < states.length; j++) {
                if (i !== j) {
                    const interference = this.calculateInterference(states[i], states[j]);
                    totalAmplitude += interference.amplitude;
                    totalPhase += interference.phase;
                }
            }
            // Apply decoherence based on coherence threshold
            const coherenceFactor = states[i].coherence > this.config.coherenceThreshold ? 1 : 0.5;
            interferedStates.push({
                ...states[i],
                amplitude: Math.max(0, Math.min(1, totalAmplitude * coherenceFactor)),
                phase: totalPhase,
                coherence: states[i].coherence * coherenceFactor,
            });
        }
        return interferedStates;
    }
    /**
     * Collapse superposition to primary intent
     */
    collapseToPrimaryIntent(states) {
        if (states.length === 0) {
            return { intent: 'unknown', confidence: 0 };
        }
        // Find state with highest amplitude
        const primaryState = states.reduce((max, current) => current.amplitude > max.amplitude ? current : max);
        // Calculate confidence based on amplitude and coherence
        const confidence = primaryState.amplitude * primaryState.coherence;
        return {
            intent: primaryState.intent,
            confidence: Math.min(1, confidence),
        };
    }
    /**
     * Extract secondary intents from remaining states
     */
    extractSecondaryIntents(states) {
        return states
            .filter((state) => state.amplitude > 0.3)
            .sort((a, b) => b.amplitude - a.amplitude)
            .slice(1, 4) // Top 3 secondary intents
            .map((state) => state.intent);
    }
    /**
     * Calculate intent amplitude based on input matching
     */
    calculateIntentAmplitude(input, intent, context) {
        let amplitude = 0;
        // Keyword matching
        const keywords = this.getIntentKeywords(intent);
        const matches = keywords.filter((keyword) => input.includes(keyword.toLowerCase())).length;
        amplitude += matches * 0.2;
        // Context-based weighting
        if (context.preferences) {
            const contextMatches = Object.values(context.preferences).some((pref) => typeof pref === 'string' &&
                pref.toLowerCase().includes(intent.split('_')[1] || intent));
            if (contextMatches)
                amplitude += 0.3;
        }
        // Historical behavior
        if (context.travelHistory) {
            const historicalRelevance = context.travelHistory.some((trip) => trip.destination.toLowerCase().includes(intent.split('_')[1] || intent));
            if (historicalRelevance)
                amplitude += 0.2;
        }
        return Math.min(1, amplitude);
    }
    /**
     * Calculate quantum phase for interference calculations
     */
    calculateIntentPhase(intent, context) {
        // Use context factors to determine phase
        const contextHash = this.hashContext(context);
        const intentHash = this.hashString(intent);
        return (contextHash + intentHash) % (2 * Math.PI);
    }
    /**
     * Calculate quantum coherence
     */
    calculateCoherence(intent, context) {
        // Higher coherence for intents that match user history
        if (context.travelHistory && context.travelHistory.length > 0) {
            const relevantTrips = context.travelHistory.filter((trip) => trip.destination.toLowerCase().includes(intent.split('_')[1] || intent)).length;
            return Math.min(1, relevantTrips / context.travelHistory.length + 0.5);
        }
        return 0.5; // Default coherence
    }
    /**
     * Calculate quantum interference between two states
     */
    calculateInterference(state1, state2) {
        const phaseDifference = Math.abs(state1.phase - state2.phase);
        const interferenceAmplitude = state1.amplitude *
            state2.amplitude *
            Math.cos(phaseDifference) *
            this.config.interferenceSensitivity;
        return {
            amplitude: interferenceAmplitude,
            phase: phaseDifference,
        };
    }
    /**
     * Analyze context factors influencing intent
     */
    analyzeContextFactors(context, input) {
        const factors = [];
        // User preferences factor
        if (context.preferences) {
            factors.push({
                factor: 'user_preferences',
                weight: 0.8,
                influence: 'positive',
                source: 'user_history',
            });
        }
        // Travel history factor
        if (context.travelHistory && context.travelHistory.length > 0) {
            factors.push({
                factor: 'travel_history',
                weight: Math.min(1, context.travelHistory.length / 10),
                influence: 'positive',
                source: 'user_history',
            });
        }
        // Emotional state factor
        if (context.emotionalState) {
            factors.push({
                factor: 'emotional_state',
                weight: context.emotionalState === 'excited' ? 0.9 : 0.6,
                influence: context.emotionalState === 'stressed' ? 'negative' : 'positive',
                source: 'current_context',
            });
        }
        // Time urgency factor
        const temporalContext = this.extractTemporalContext();
        factors.push({
            factor: 'time_urgency',
            weight: temporalContext.urgency === 'high' ? 0.9 : 0.5,
            influence: temporalContext.urgency === 'critical' ? 'negative' : 'neutral',
            source: 'external_data',
        });
        return factors.slice(0, 5); // Limit to top 5 factors
    }
    /**
     * Calculate emotional weight of the input
     */
    calculateEmotionalWeight(input, context) {
        let weight = 0.5; // Neutral baseline
        // Emotional keywords
        const positiveWords = [
            'excited',
            'happy',
            'amazing',
            'wonderful',
            'love',
            'great',
        ];
        const negativeWords = [
            'worried',
            'stressed',
            'tired',
            'frustrated',
            'problem',
            'issue',
        ];
        const positiveMatches = positiveWords.filter((word) => input.includes(word)).length;
        const negativeMatches = negativeWords.filter((word) => input.includes(word)).length;
        weight += positiveMatches * 0.1 - negativeMatches * 0.1;
        // Context emotional state
        if (context.emotionalState === 'excited')
            weight += 0.2;
        if (context.emotionalState === 'stressed')
            weight -= 0.2;
        return Math.max(0, Math.min(1, weight));
    }
    /**
     * Extract temporal context
     */
    extractTemporalContext() {
        const now = new Date();
        const hour = now.getHours();
        const dayOfWeek = now.getDay();
        let season;
        const month = now.getMonth();
        if (month >= 2 && month <= 4)
            season = 'spring';
        else if (month >= 5 && month <= 7)
            season = 'summer';
        else if (month >= 8 && month <= 10)
            season = 'fall';
        else
            season = 'winter';
        let urgency = 'low';
        if (hour >= 22 || hour <= 6)
            urgency = 'high'; // Late night/early morning
        if (dayOfWeek === 0 || dayOfWeek === 6)
            urgency = 'medium'; // Weekend
        return {
            timeOfDay: hour,
            dayOfWeek,
            season,
            urgency,
        };
    }
    /**
     * Get keywords associated with an intent
     */
    getIntentKeywords(intent) {
        const keywordMap = {
            book_flight: ['flight', 'fly', 'plane', 'ticket', 'book', 'reserve'],
            book_hotel: ['hotel', 'stay', 'room', 'accommodation', 'lodge', 'inn'],
            plan_trip: ['trip', 'travel', 'journey', 'vacation', 'holiday', 'plan'],
            get_recommendations: ['recommend', 'suggest', 'best', 'good', 'advice'],
            check_weather: ['weather', 'rain', 'sunny', 'temperature', 'forecast'],
            find_restaurants: ['restaurant', 'food', 'eat', 'dining', 'cuisine'],
            cultural_info: ['culture', 'history', 'museum', 'tradition', 'local'],
            emergency_help: [
                'emergency',
                'help',
                'problem',
                'issue',
                'urgent',
                'assistance',
            ],
        };
        return keywordMap[intent] || [];
    }
    /**
     * Initialize base intent patterns
     */
    initializeBasePatterns() {
        // Initialize with common travel intent patterns
        const basePatterns = {
            travel_planning: [
                { intent: 'plan_trip', amplitude: 0.8, phase: 0, coherence: 0.9 },
                {
                    intent: 'get_recommendations',
                    amplitude: 0.6,
                    phase: Math.PI / 4,
                    coherence: 0.8,
                },
            ],
            booking: [
                { intent: 'book_flight', amplitude: 0.9, phase: 0, coherence: 0.95 },
                {
                    intent: 'book_hotel',
                    amplitude: 0.7,
                    phase: Math.PI / 3,
                    coherence: 0.85,
                },
            ],
        };
        for (const [pattern, states] of Object.entries(basePatterns)) {
            this.intentPatterns.set(pattern, states);
        }
    }
    /**
     * Simple string hashing for phase calculations
     */
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
    }
    /**
     * Hash context for phase calculations
     */
    hashContext(context) {
        const contextStr = JSON.stringify({
            preferences: context.preferences,
            emotionalState: context.emotionalState,
            travelHistory: context.travelHistory?.slice(-3), // Last 3 trips
        });
        return this.hashString(contextStr);
    }
    /**
     * Update intent patterns based on learning
     */
    updatePatterns(pattern, states) {
        this.intentPatterns.set(pattern, states);
    }
    /**
     * Get current configuration
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Update configuration
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }
    /**
     * Get engine metrics
     */
    async getMetrics() {
        return {
            totalPatterns: this.intentPatterns.size,
            contextHistorySize: this.contextHistory.length,
            config: this.config,
        };
    }
    /**
     * Health check for the engine
     */
    async healthCheck() {
        try {
            // Test basic functionality
            await this.analyzeIntent('test query', {
                userId: 'test',
                sessionId: 'test',
                preferences: {},
                travelHistory: [],
            });
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Cleanup resources
     */
    async cleanup() {
        // Cleanup resources
        this.intentPatterns.clear();
        this.contextHistory = [];
        console.log('✅ QuantumIntentEngine cleaned up');
    }
}
exports.QuantumIntentEngine = QuantumIntentEngine;
exports.default = QuantumIntentEngine;
//# sourceMappingURL=QuantumIntentEngine.js.map