/**
 * Customer Journey Tracker
 * Tracks customer interactions and stages throughout the sales process
 */

const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

class CustomerJourneyTracker {
    constructor() {
        this.dataFile = path.join(__dirname, '..', 'data', 'customer_journeys.json');
        this.journeys = new Map();
        this.initialized = false;
    }

    async initialize() {
        try {
            console.log('🗂️ Initializing Customer Journey Tracker...');
            
            // Ensure data directory exists
            const dataDir = path.dirname(this.dataFile);
            try {
                await fs.mkdir(dataDir, { recursive: true });
            } catch (err) {
                // Directory might already exist
            }

            // Load existing journeys
            try {
                const data = await fs.readFile(this.dataFile, 'utf8');
                const journeysData = JSON.parse(data);
                
                for (const [customerId, journey] of Object.entries(journeysData)) {
                    this.journeys.set(customerId, journey);
                }
                
                console.log(`✅ Loaded ${this.journeys.size} customer journeys`);
            } catch (error) {
                // File doesn't exist yet, start fresh
                console.log('📝 Starting with empty journey database');
                await this.saveJourneys();
            }
            
            this.initialized = true;
            console.log('✅ Customer Journey Tracker initialized');
            
        } catch (error) {
            console.error('❌ Journey Tracker initialization failed:', error);
            throw error;
        }
    }

    async recordStage(stageData) {
        const { customerId, sessionId, timestamp, stage } = stageData;
        
        if (!this.journeys.has(customerId)) {
            // Create new customer journey
            this.journeys.set(customerId, {
                customerId,
                createdAt: timestamp,
                lastUpdated: timestamp,
                currentStage: stage,
                stages: [],
                sessions: new Set([sessionId]),
                totalInteractions: 0,
                conversionProbability: 0,
                tags: []
            });
        }

        const journey = this.journeys.get(customerId);
        
        // Update journey
        journey.lastUpdated = timestamp;
        journey.currentStage = stage;
        journey.sessions.add(sessionId);
        journey.totalInteractions++;
        
        // Add stage data
        const stageRecord = {
            id: uuidv4(),
            timestamp,
            sessionId,
            stage,
            ...stageData
        };
        
        journey.stages.push(stageRecord);
        
        // Update tags based on stage
        this.updateJourneyTags(journey, stageData);
        
        // Save to file
        await this.saveJourneys();
        
        return stageRecord;
    }

    async getCustomerJourney(customerId) {
        return this.journeys.get(customerId) || null;
    }

    async getAllJourneys() {
        return Array.from(this.journeys.values());
    }

    async getJourneysByStage(stage) {
        return Array.from(this.journeys.values())
            .filter(journey => journey.currentStage === stage);
    }

    async getJourneysByDateRange(startDate, endDate) {
        return Array.from(this.journeys.values())
            .filter(journey => {
                const created = moment(journey.createdAt);
                return created.isBetween(startDate, endDate, 'day', '[]');
            });
    }

    async getDashboardAnalytics() {
        const journeys = Array.from(this.journeys.values());
        
        const analytics = {
            totalCustomers: journeys.length,
            activeCustomers: journeys.filter(j => 
                moment().diff(moment(j.lastUpdated), 'days') <= 30
            ).length,
            stageDistribution: this.getStageDistribution(journeys),
            conversionFunnel: this.getConversionFunnel(journeys),
            averageJourneyLength: this.getAverageJourneyLength(journeys),
            topTriggers: this.getTopTriggers(journeys),
            personalityDistribution: this.getPersonalityDistribution(journeys),
            recentActivity: this.getRecentActivity(journeys)
        };

        return analytics;
    }

    updateJourneyTags(journey, stageData) {
        const { stage, outcome, excitement, buyingSignals } = stageData;
        
        // Add stage-specific tags
        switch (stage) {
            case 'initial_analysis':
                journey.tags.push('analyzed');
                break;
                
            case 'post_conversation':
                if (outcome === 'interested') {
                    journey.tags.push('hot_lead');
                } else if (outcome === 'skeptical') {
                    journey.tags.push('needs_nurturing');
                }
                break;
                
            case 'test_drive_booked':
                journey.tags.push('test_drive_scheduled');
                break;
                
            case 'post_test_drive':
                if (excitement >= 7) {
                    journey.tags.push('highly_engaged');
                }
                if (buyingSignals && buyingSignals.length > 0) {
                    journey.tags.push('buying_signals');
                }
                break;
        }
        
        // Remove duplicates
        journey.tags = [...new Set(journey.tags)];
    }

    getStageDistribution(journeys) {
        const distribution = {};
        
        journeys.forEach(journey => {
            const stage = journey.currentStage;
            distribution[stage] = (distribution[stage] || 0) + 1;
        });
        
        return distribution;
    }

    getConversionFunnel(journeys) {
        const stages = [
            'initial_analysis',
            'post_conversation', 
            'test_drive_booked',
            'post_test_drive',
            'purchase'
        ];
        
        const funnel = {};
        
        stages.forEach(stage => {
            funnel[stage] = journeys.filter(journey => 
                journey.stages.some(s => s.stage === stage)
            ).length;
        });
        
        return funnel;
    }

    getAverageJourneyLength(journeys) {
        if (journeys.length === 0) return 0;
        
        const totalDays = journeys.reduce((sum, journey) => {
            const start = moment(journey.createdAt);
            const end = moment(journey.lastUpdated);
            return sum + end.diff(start, 'days');
        }, 0);
        
        return Math.round(totalDays / journeys.length);
    }

    getTopTriggers(journeys) {
        const triggerCounts = {};
        
        journeys.forEach(journey => {
            journey.stages.forEach(stage => {
                if (stage.triggers) {
                    stage.triggers.forEach(trigger => {
                        triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1;
                    });
                }
            });
        });
        
        return Object.entries(triggerCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([trigger, count]) => ({ trigger, count }));
    }

    getPersonalityDistribution(journeys) {
        const distribution = { D: 0, I: 0, S: 0, C: 0 };
        
        journeys.forEach(journey => {
            const analysisStage = journey.stages.find(s => s.analysis);
            if (analysisStage && analysisStage.analysis.personality.detected) {
                const discType = analysisStage.analysis.personality.detected.DISC;
                distribution[discType]++;
            }
        });
        
        return distribution;
    }

    getRecentActivity(journeys) {
        return journeys
            .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated))
            .slice(0, 10)
            .map(journey => ({
                customerId: journey.customerId,
                lastStage: journey.currentStage,
                lastUpdated: journey.lastUpdated,
                totalInteractions: journey.totalInteractions,
                tags: journey.tags
            }));
    }

    async saveJourneys() {
        try {
            // Convert Map to object for JSON serialization
            const journeysObj = {};
            for (const [customerId, journey] of this.journeys) {
                // Convert Set to Array for sessions
                journeysObj[customerId] = {
                    ...journey,
                    sessions: Array.from(journey.sessions)
                };
            }
            
            await fs.writeFile(
                this.dataFile,
                JSON.stringify(journeysObj, null, 2),
                'utf8'
            );
            
        } catch (error) {
            console.error('Failed to save journeys:', error);
            throw error;
        }
    }

    // Analysis methods for specific stages
    async getCustomersReadyForTestDrive() {
        return Array.from(this.journeys.values())
            .filter(journey => {
                const hasConversation = journey.stages.some(s => s.stage === 'post_conversation');
                const noTestDrive = !journey.stages.some(s => s.stage === 'test_drive_booked');
                const isInterested = journey.tags.includes('hot_lead') || journey.tags.includes('highly_engaged');
                
                return hasConversation && noTestDrive && isInterested;
            });
    }

    async getCustomersNeedingFollowUp() {
        const threeDaysAgo = moment().subtract(3, 'days');
        
        return Array.from(this.journeys.values())
            .filter(journey => {
                const lastUpdate = moment(journey.lastUpdated);
                const needsNurturing = journey.tags.includes('needs_nurturing');
                const notRecentlyContacted = lastUpdate.isBefore(threeDaysAgo);
                
                return needsNurturing && notRecentlyContacted;
            });
    }

    async getHighValueProspects() {
        return Array.from(this.journeys.values())
            .filter(journey => {
                const hasTestDrive = journey.stages.some(s => s.stage === 'post_test_drive');
                const hasBuyingSignals = journey.tags.includes('buying_signals');
                const highlyEngaged = journey.tags.includes('highly_engaged');
                
                return hasTestDrive && (hasBuyingSignals || highlyEngaged);
            });
    }
}

module.exports = CustomerJourneyTracker;