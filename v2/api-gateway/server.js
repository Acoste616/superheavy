/**
 * Tesla Customer Decoder - API Gateway
 * Centralna brama API dla architektury mikro-usługowej
 * 
 * @version 2.0
 * @author TRAE AI Assistant
 */

const express = require('express');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

class APIGateway {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 8080;
        this.services = {
            'customer-analysis': {
                url: process.env.CUSTOMER_ANALYSIS_URL || 'http://localhost:3001',
                healthPath: '/health',
                timeout: 5000
            },
            'trigger-detection': {
                url: process.env.TRIGGER_DETECTION_URL || 'http://localhost:3002',
                healthPath: '/health',
                timeout: 3000
            },
            'fuzzy-inference': {
                url: process.env.FUZZY_INFERENCE_URL || 'http://localhost:3003',
                healthPath: '/health',
                timeout: 2000
            },
            'scoring-aggregation': {
                url: process.env.SCORING_AGGREGATION_URL || 'http://localhost:3004',
                healthPath: '/health',
                timeout: 2000
            },
            'recommendation-engine': {
                url: process.env.RECOMMENDATION_ENGINE_URL || 'http://localhost:3005',
                healthPath: '/health',
                timeout: 3000
            },
            'transparency-xai': {
                url: process.env.TRANSPARENCY_XAI_URL || 'http://localhost:3006',
                healthPath: '/health',
                timeout: 4000
            }
        };
        
        this.setupMiddleware();
        this.setupRoutes();
        this.setupProxies();
    }

    setupMiddleware() {
        // Compression
        this.app.use(compression());
        
        // CORS
        this.app.use(cors({
            origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:8080'],
            credentials: true
        }));
        
        // Rate limiting
        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 1000, // limit each IP to 1000 requests per windowMs
            message: {
                error: 'Too many requests from this IP, please try again later.',
                retryAfter: '15 minutes'
            }
        });
        this.app.use('/api/', limiter);
        
        // Body parsing
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
        
        // Request logging
        this.app.use((req, res, next) => {
            const requestId = uuidv4();
            req.requestId = requestId;
            
            console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - Request ID: ${requestId}`);
            
            // Add request ID to response headers
            res.setHeader('X-Request-ID', requestId);
            
            next();
        });
        
        // Serve static files (frontend)
        this.app.use(express.static(path.join(__dirname, '../frontend'), {
            maxAge: '1d',
            etag: true
        }));
        
        // Serve v1 files for backward compatibility
        this.app.use('/v1', express.static(path.join(__dirname, '../../v1'), {
            maxAge: '1h'
        }));
    }

    setupRoutes() {
        // Health check for API Gateway
        this.app.get('/health', async (req, res) => {
            const serviceHealth = await this.checkServicesHealth();
            
            res.json({
                service: 'api-gateway',
                status: 'healthy',
                version: '2.0',
                timestamp: new Date().toISOString(),
                requestId: req.requestId,
                services: serviceHealth
            });
        });

        // Orchestrated analysis endpoint - combines multiple services
        this.app.post('/api/v2/analyze', async (req, res) => {
            try {
                const { customerId, sessionId, inputData } = req.body;
                const analysisId = uuidv4();
                
                console.log(`[${req.requestId}] Starting orchestrated analysis for customer: ${customerId}`);
                
                // Validate input
                if (!inputData || !inputData.selectedTriggers) {
                    return res.status(400).json({
                        success: false,
                        error: 'Invalid input data',
                        requestId: req.requestId
                    });
                }

                // Step 1: Customer Analysis
                const customerAnalysis = await this.callService('customer-analysis', '/analyze', {
                    customerId,
                    sessionId,
                    inputData
                });

                // Step 2: Trigger Detection (parallel)
                const triggerDetection = await this.callService('trigger-detection', '/detect', {
                    triggers: inputData.selectedTriggers,
                    demographics: inputData.demographics
                });

                // Step 3: Fuzzy Inference
                const fuzzyInference = await this.callService('fuzzy-inference', '/infer', {
                    discProfile: customerAnalysis.analysis.discProfile,
                    triggers: inputData.selectedTriggers,
                    demographics: inputData.demographics
                });

                // Step 4: Scoring Aggregation
                const scoring = await this.callService('scoring-aggregation', '/aggregate', {
                    customerAnalysis: customerAnalysis.analysis,
                    triggerDetection,
                    fuzzyInference,
                    inputData
                });

                // Step 5: Recommendations
                const recommendations = await this.callService('recommendation-engine', '/generate', {
                    scoring,
                    customerAnalysis: customerAnalysis.analysis,
                    inputData
                });

                // Step 6: Transparency/XAI (parallel)
                const transparency = await this.callService('transparency-xai', '/explain', {
                    analysisResults: {
                        scoring,
                        customerAnalysis: customerAnalysis.analysis,
                        triggerDetection,
                        fuzzyInference,
                        recommendations
                    },
                    inputData,
                    explanationType: 'detailed',
                    audienceLevel: 'technical'
                });

                // Combine results
                const finalAnalysis = {
                    analysisId,
                    customerId,
                    sessionId,
                    timestamp: new Date().toISOString(),
                    
                    // Core results
                    conversionProbability: scoring.conversionProbability,
                    discProfile: customerAnalysis.analysis.discProfile,
                    customerSegment: customerAnalysis.analysis.customerSegment,
                    
                    // Detailed analysis
                    triggerAnalysis: triggerDetection,
                    fuzzyInference,
                    scoring,
                    recommendations,
                    transparency,
                    
                    // Metadata
                    processingTime: Date.now() - req.startTime,
                    requestId: req.requestId,
                    version: '2.0'
                };

                console.log(`[${req.requestId}] Analysis completed successfully`);
                
                res.json({
                    success: true,
                    analysis: finalAnalysis
                });
                
            } catch (error) {
                console.error(`[${req.requestId}] Analysis failed:`, error);
                
                res.status(500).json({
                    success: false,
                    error: 'Analysis orchestration failed',
                    details: error.message,
                    requestId: req.requestId,
                    timestamp: new Date().toISOString()
                });
            }
        });

        // Backward compatibility endpoint for v1
        this.app.post('/api/analyze', async (req, res) => {
            console.log(`[${req.requestId}] Backward compatibility request - redirecting to v2`);
            
            // Redirect to v2 endpoint
            req.url = '/api/v2/analyze';
            this.app.handle(req, res);
        });

        // Service discovery endpoint
        this.app.get('/api/services', (req, res) => {
            res.json({
                services: Object.keys(this.services),
                gateway: {
                    version: '2.0',
                    endpoints: [
                        'GET /health',
                        'POST /api/v2/analyze',
                        'POST /api/analyze (v1 compatibility)',
                        'GET /api/services'
                    ]
                },
                requestId: req.requestId
            });
        });

        // Fallback to v1 frontend for unknown routes
        this.app.get('*', (req, res) => {
            if (req.path.startsWith('/api/')) {
                return res.status(404).json({
                    error: 'API endpoint not found',
                    requestId: req.requestId
                });
            }
            
            // Serve main.html for SPA routes
            res.sendFile(path.join(__dirname, '../../v1/main.html'));
        });
    }

    setupProxies() {
        // Setup proxy for each microservice
        Object.entries(this.services).forEach(([serviceName, config]) => {
            const proxyPath = `/api/v2/${serviceName}`;
            
            this.app.use(proxyPath, createProxyMiddleware({
                target: config.url,
                changeOrigin: true,
                pathRewrite: {
                    [`^${proxyPath}`]: ''
                },
                timeout: config.timeout,
                onError: (err, req, res) => {
                    console.error(`Proxy error for ${serviceName}:`, err.message);
                    res.status(503).json({
                        error: `Service ${serviceName} unavailable`,
                        requestId: req.requestId
                    });
                },
                onProxyReq: (proxyReq, req, res) => {
                    console.log(`[${req.requestId}] Proxying to ${serviceName}: ${req.method} ${req.path}`);
                }
            }));
        });
    }

    async callService(serviceName, endpoint, data) {
        const service = this.services[serviceName];
        if (!service) {
            throw new Error(`Service ${serviceName} not configured`);
        }

        const url = `${service.url}${endpoint}`;
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data),
                timeout: service.timeout
            });

            if (!response.ok) {
                throw new Error(`Service ${serviceName} returned ${response.status}`);
            }

            return await response.json();
            
        } catch (error) {
            console.error(`Failed to call ${serviceName}:`, error.message);
            throw new Error(`Service ${serviceName} call failed: ${error.message}`);
        }
    }

    async checkServicesHealth() {
        const healthChecks = {};
        
        for (const [serviceName, config] of Object.entries(this.services)) {
            try {
                const response = await fetch(`${config.url}${config.healthPath}`, {
                    timeout: 2000
                });
                
                healthChecks[serviceName] = {
                    status: response.ok ? 'healthy' : 'unhealthy',
                    url: config.url,
                    responseTime: Date.now()
                };
                
            } catch (error) {
                healthChecks[serviceName] = {
                    status: 'unreachable',
                    url: config.url,
                    error: error.message
                };
            }
        }
        
        return healthChecks;
    }

    async start() {
        // Add request timing
        this.app.use((req, res, next) => {
            req.startTime = Date.now();
            next();
        });
        
        this.app.listen(this.port, () => {
            console.log('🚀 Tesla Customer Decoder API Gateway v2.0 started');
            console.log(`🌐 Gateway running on port ${this.port}`);
            console.log(`🔍 Health check: http://localhost:${this.port}/health`);
            console.log(`📊 Analysis endpoint: http://localhost:${this.port}/api/v2/analyze`);
            console.log(`🔄 V1 compatibility: http://localhost:${this.port}/api/analyze`);
            console.log(`📋 Services: http://localhost:${this.port}/api/services`);
        });
    }
}

// Start gateway if run directly
if (require.main === module) {
    const gateway = new APIGateway();
    gateway.start().catch(console.error);
}

module.exports = APIGateway;