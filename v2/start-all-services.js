/**
 * Tesla Customer Decoder v2.0 - Service Orchestrator
 * Uruchamia wszystkie mikro-usługi w odpowiedniej kolejności
 * 
 * @version 2.0
 * @author TRAE AI Assistant
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

class ServiceOrchestrator {
    constructor() {
        this.services = [
            {
                name: 'customer-analysis',
                path: './services/customer-analysis',
                port: 3001,
                healthEndpoint: '/health',
                startupDelay: 2000
            },
            {
                name: 'trigger-detection',
                path: './services/trigger-detection',
                port: 3002,
                healthEndpoint: '/health',
                startupDelay: 2500
            },
            {
                name: 'fuzzy-inference',
                path: './services/fuzzy-inference',
                port: 3003,
                healthEndpoint: '/health',
                startupDelay: 3000
            },
            {
                name: 'scoring-aggregation',
                path: './services/scoring-aggregation',
                port: 3004,
                healthEndpoint: '/health',
                startupDelay: 3500
            },
            {
                name: 'recommendation-engine',
                path: './services/recommendation-engine',
                port: 3005,
                healthEndpoint: '/health',
                startupDelay: 4000
            },
            {
                name: 'transparency-xai',
                path: './services/transparency-xai',
                port: 3006,
                healthEndpoint: '/health',
                startupDelay: 4500
            },
            {
                name: 'api-gateway',
                path: './api-gateway',
                port: 3000,
                healthEndpoint: '/health',
                startupDelay: 5000
            }
        ];
        
        this.runningProcesses = new Map();
        this.healthCheckInterval = null;
        this.isShuttingDown = false;
        
        // Graceful shutdown handling
        process.on('SIGINT', () => this.gracefulShutdown());
        process.on('SIGTERM', () => this.gracefulShutdown());
    }

    async startAllServices() {
        console.log('🚀 Tesla Customer Decoder v2.0 - Starting all microservices...');
        console.log('=' .repeat(70));
        
        try {
            // Check if all service directories exist
            await this.validateServiceDirectories();
            
            // Install dependencies for all services
            await this.installDependencies();
            
            // Start services in order
            for (const service of this.services) {
                await this.startService(service);
                await this.delay(service.startupDelay);
            }
            
            // Start health monitoring
            this.startHealthMonitoring();
            
            // Display service status
            await this.displayServiceStatus();
            
            console.log('\n✅ All services started successfully!');
            console.log('🌐 API Gateway available at: http://localhost:3000');
            console.log('📊 Service health monitoring active');
            console.log('\n💡 Press Ctrl+C to stop all services');
            
        } catch (error) {
            console.error('❌ Failed to start services:', error.message);
            await this.gracefulShutdown();
            process.exit(1);
        }
    }

    async validateServiceDirectories() {
        console.log('🔍 Validating service directories...');
        
        for (const service of this.services) {
            const servicePath = path.resolve(__dirname, service.path);
            const packageJsonPath = path.join(servicePath, 'package.json');
            const serviceJsPath = path.join(servicePath, 'service.js');
            
            if (!fs.existsSync(servicePath)) {
                throw new Error(`Service directory not found: ${servicePath}`);
            }
            
            if (!fs.existsSync(packageJsonPath)) {
                throw new Error(`package.json not found for service: ${service.name}`);
            }
            
            if (service.name !== 'api-gateway' && !fs.existsSync(serviceJsPath)) {
                throw new Error(`service.js not found for service: ${service.name}`);
            }
        }
        
        console.log('✅ All service directories validated');
    }

    async installDependencies() {
        console.log('📦 Installing dependencies for all services...');
        
        const installPromises = this.services.map(service => {
            return this.installServiceDependencies(service);
        });
        
        try {
            await Promise.all(installPromises);
            console.log('✅ Dependencies installed for all services');
        } catch (error) {
            console.warn('⚠️  Some dependencies may not have installed correctly:', error.message);
            console.log('📝 You may need to run "npm install" manually in service directories');
        }
    }

    async installServiceDependencies(service) {
        return new Promise((resolve, reject) => {
            const servicePath = path.resolve(__dirname, service.path);
            
            console.log(`  📦 Installing dependencies for ${service.name}...`);
            
            const npmInstall = spawn('npm', ['install'], {
                cwd: servicePath,
                stdio: 'pipe',
                shell: true
            });
            
            let output = '';
            let errorOutput = '';
            
            npmInstall.stdout.on('data', (data) => {
                output += data.toString();
            });
            
            npmInstall.stderr.on('data', (data) => {
                errorOutput += data.toString();
            });
            
            npmInstall.on('close', (code) => {
                if (code === 0) {
                    console.log(`  ✅ Dependencies installed for ${service.name}`);
                    resolve();
                } else {
                    console.warn(`  ⚠️  Warning: npm install failed for ${service.name} (code ${code})`);
                    resolve(); // Continue even if some installs fail
                }
            });
            
            npmInstall.on('error', (error) => {
                console.warn(`  ⚠️  Warning: Could not install dependencies for ${service.name}:`, error.message);
                resolve(); // Continue even if some installs fail
            });
        });
    }

    async startService(service) {
        return new Promise((resolve, reject) => {
            const servicePath = path.resolve(__dirname, service.path);
            const scriptName = service.name === 'api-gateway' ? 'server.js' : 'service.js';
            
            console.log(`🚀 Starting ${service.name} on port ${service.port}...`);
            
            const serviceProcess = spawn('node', [scriptName], {
                cwd: servicePath,
                stdio: 'pipe',
                shell: true,
                env: {
                    ...process.env,
                    PORT: service.port.toString()
                }
            });
            
            let startupOutput = '';
            let hasStarted = false;
            
            serviceProcess.stdout.on('data', (data) => {
                const output = data.toString();
                startupOutput += output;
                
                // Check for startup success indicators
                if (output.includes('started') || output.includes('running') || output.includes('listening')) {
                    if (!hasStarted) {
                        hasStarted = true;
                        console.log(`  ✅ ${service.name} started successfully`);
                        resolve();
                    }
                }
            });
            
            serviceProcess.stderr.on('data', (data) => {
                const errorOutput = data.toString();
                console.error(`  ❌ ${service.name} error:`, errorOutput);
            });
            
            serviceProcess.on('close', (code) => {
                if (code !== 0 && !this.isShuttingDown) {
                    console.error(`  ❌ ${service.name} exited with code ${code}`);
                    this.runningProcesses.delete(service.name);
                }
            });
            
            serviceProcess.on('error', (error) => {
                console.error(`  ❌ Failed to start ${service.name}:`, error.message);
                reject(error);
            });
            
            // Store process reference
            this.runningProcesses.set(service.name, {
                process: serviceProcess,
                service: service,
                startTime: new Date()
            });
            
            // Timeout fallback
            setTimeout(() => {
                if (!hasStarted) {
                    console.log(`  ⏱️  ${service.name} startup timeout - assuming started`);
                    resolve();
                }
            }, 10000);
        });
    }

    startHealthMonitoring() {
        console.log('🔍 Starting health monitoring...');
        
        this.healthCheckInterval = setInterval(async () => {
            await this.performHealthChecks();
        }, 30000); // Check every 30 seconds
    }

    async performHealthChecks() {
        if (this.isShuttingDown) return;
        
        const healthResults = [];
        
        for (const [serviceName, processInfo] of this.runningProcesses) {
            try {
                const isHealthy = await this.checkServiceHealth(processInfo.service);
                healthResults.push({
                    service: serviceName,
                    healthy: isHealthy,
                    uptime: Date.now() - processInfo.startTime.getTime()
                });
            } catch (error) {
                healthResults.push({
                    service: serviceName,
                    healthy: false,
                    error: error.message
                });
            }
        }
        
        // Log unhealthy services
        const unhealthyServices = healthResults.filter(result => !result.healthy);
        if (unhealthyServices.length > 0) {
            console.log('⚠️  Unhealthy services detected:');
            unhealthyServices.forEach(service => {
                console.log(`  - ${service.service}: ${service.error || 'Health check failed'}`);
            });
        }
    }

    async checkServiceHealth(service) {
        return new Promise((resolve) => {
            const http = require('http');
            
            const options = {
                hostname: 'localhost',
                port: service.port,
                path: service.healthEndpoint,
                method: 'GET',
                timeout: 5000
            };
            
            const req = http.request(options, (res) => {
                resolve(res.statusCode === 200);
            });
            
            req.on('error', () => {
                resolve(false);
            });
            
            req.on('timeout', () => {
                req.destroy();
                resolve(false);
            });
            
            req.end();
        });
    }

    async displayServiceStatus() {
        console.log('\n📊 Service Status:');
        console.log('-'.repeat(50));
        
        for (const [serviceName, processInfo] of this.runningProcesses) {
            const isHealthy = await this.checkServiceHealth(processInfo.service);
            const status = isHealthy ? '🟢 HEALTHY' : '🔴 UNHEALTHY';
            const uptime = Math.round((Date.now() - processInfo.startTime.getTime()) / 1000);
            
            console.log(`${serviceName.padEnd(20)} | ${status.padEnd(12)} | Port: ${processInfo.service.port} | Uptime: ${uptime}s`);
        }
    }

    async gracefulShutdown() {
        if (this.isShuttingDown) return;
        
        this.isShuttingDown = true;
        console.log('\n🛑 Shutting down all services...');
        
        // Stop health monitoring
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
        }
        
        // Terminate all processes
        const shutdownPromises = [];
        
        for (const [serviceName, processInfo] of this.runningProcesses) {
            shutdownPromises.push(this.stopService(serviceName, processInfo));
        }
        
        try {
            await Promise.all(shutdownPromises);
            console.log('✅ All services stopped successfully');
        } catch (error) {
            console.error('❌ Error during shutdown:', error.message);
        }
        
        console.log('👋 Tesla Customer Decoder v2.0 shutdown complete');
    }

    async stopService(serviceName, processInfo) {
        return new Promise((resolve) => {
            console.log(`🛑 Stopping ${serviceName}...`);
            
            processInfo.process.kill('SIGTERM');
            
            const timeout = setTimeout(() => {
                console.log(`  ⚠️  Force killing ${serviceName}...`);
                processInfo.process.kill('SIGKILL');
                resolve();
            }, 5000);
            
            processInfo.process.on('exit', () => {
                clearTimeout(timeout);
                console.log(`  ✅ ${serviceName} stopped`);
                resolve();
            });
        });
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Individual service management methods
    async startSingleService(serviceName) {
        const service = this.services.find(s => s.name === serviceName);
        if (!service) {
            throw new Error(`Service ${serviceName} not found`);
        }
        
        await this.startService(service);
        console.log(`✅ ${serviceName} started individually`);
    }

    async stopSingleService(serviceName) {
        const processInfo = this.runningProcesses.get(serviceName);
        if (!processInfo) {
            throw new Error(`Service ${serviceName} is not running`);
        }
        
        await this.stopService(serviceName, processInfo);
        this.runningProcesses.delete(serviceName);
    }

    async restartSingleService(serviceName) {
        console.log(`🔄 Restarting ${serviceName}...`);
        
        try {
            await this.stopSingleService(serviceName);
            await this.delay(2000);
            await this.startSingleService(serviceName);
            console.log(`✅ ${serviceName} restarted successfully`);
        } catch (error) {
            console.error(`❌ Failed to restart ${serviceName}:`, error.message);
        }
    }

    getServiceStatus() {
        const status = {};
        
        for (const [serviceName, processInfo] of this.runningProcesses) {
            status[serviceName] = {
                running: true,
                port: processInfo.service.port,
                uptime: Date.now() - processInfo.startTime.getTime(),
                pid: processInfo.process.pid
            };
        }
        
        return status;
    }
}

// CLI interface
if (require.main === module) {
    const orchestrator = new ServiceOrchestrator();
    
    const command = process.argv[2];
    const serviceName = process.argv[3];
    
    switch (command) {
        case 'start':
            if (serviceName) {
                orchestrator.startSingleService(serviceName).catch(console.error);
            } else {
                orchestrator.startAllServices().catch(console.error);
            }
            break;
            
        case 'stop':
            if (serviceName) {
                orchestrator.stopSingleService(serviceName).catch(console.error);
            } else {
                orchestrator.gracefulShutdown().then(() => process.exit(0));
            }
            break;
            
        case 'restart':
            if (serviceName) {
                orchestrator.restartSingleService(serviceName).catch(console.error);
            } else {
                console.log('Please specify a service name for restart');
            }
            break;
            
        case 'status':
            console.log('Service Status:', orchestrator.getServiceStatus());
            break;
            
        default:
            orchestrator.startAllServices().catch(console.error);
    }
}

module.exports = ServiceOrchestrator;