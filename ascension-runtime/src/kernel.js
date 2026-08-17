/**
 * Runtime Kernel
 * Lifecycle state machine, module registry, event bus integration, telemetry coordination
 */

import { EventBus } from './event-bus.js';
import { Telemetry } from './telemetry.js';

// Lifecycle states
export const LifecycleState = {
    UNINITIALIZED: 'UNINITIALIZED',
    INITIALIZING: 'INITIALIZING',
    RUNNING: 'RUNNING',
    PAUSED: 'PAUSED',
    STOPPING: 'STOPPING',
    STOPPED: 'STOPPED',
    ERROR: 'ERROR'
};

export class RuntimeKernel {
    constructor(options = {}) {
        this.state = LifecycleState.UNINITIALIZED;
        this.modules = new Map(); // moduleId -> { instance, dependencies, lifecycle }
        this.capabilities = new Map(); // capabilityName -> moduleId
        this.eventBus = new EventBus();
        this.telemetry = new Telemetry();
        this.errorHandler = options.errorHandler || console.error;
        this.config = options.config || {};
        
        // Subscribe to internal events
        this.eventBus.subscribe('kernel.lifecycle', (payload) => {
            this._onLifecycleEvent(payload);
        });
    }

    /**
     * Initialize the kernel
     * @returns {Promise<void>}
     */
    async initialize() {
        if (this.state !== LifecycleState.UNINITIALIZED) {
            throw new Error(`Cannot initialize from state: ${this.state}`);
        }
        
        this._transitionState(LifecycleState.INITIALIZING);
        
        try {
            await this._emitLifecycle('init.start');
            this.telemetry.increment('kernel.initializations');
            this.telemetry.setGauge('kernel.state_code', 1);
            await this._emitLifecycle('init.complete');
            
            this._transitionState(LifecycleState.RUNNING);
            this.telemetry.startHistoryRecording(1000);
        } catch (error) {
            this._transitionState(LifecycleState.ERROR);
            this.errorHandler(error);
            throw error;
        }
    }

    /**
     * Register a module
     * @param {string} moduleId - Unique module identifier
     * @param {object} moduleInstance - Module with optional init/start/stop methods
     * @param {Array<string>} dependencies - Required module IDs
     * @param {Array<string>} capabilities - Capabilities this module provides
     */
    registerModule(moduleId, moduleInstance, dependencies = [], capabilities = []) {
        if (this.modules.has(moduleId)) {
            throw new Error(`Module already registered: ${moduleId}`);
        }
        
        this.modules.set(moduleId, {
            instance: moduleInstance,
            dependencies,
            capabilities,
            lifecycle: 'registered'
        });
        
        for (const cap of capabilities) {
            if (this.capabilities.has(cap)) {
                console.warn(`Capability "${cap}" re-registered by module ${moduleId}`);
            }
            this.capabilities.set(cap, moduleId);
        }
        
        this.telemetry.increment('modules.registered');
        this.eventBus.publish('kernel.module.registered', { moduleId, capabilities });
    }

    /**
     * Get a module by ID
     * @param {string} moduleId - Module ID
     * @returns {object|null}
     */
    getModule(moduleId) {
        const mod = this.modules.get(moduleId);
        return mod ? mod.instance : null;
    }

    /**
     * Get module providing a capability
     * @param {string} capability - Capability name
     * @returns {object|null}
     */
    getModuleByCapability(capability) {
        const moduleId = this.capabilities.get(capability);
        if (!moduleId) return null;
        return this.getModule(moduleId);
    }

    /**
     * Start all modules in dependency order
     * @returns {Promise<void>}
     */
    async startModules() {
        if (this.state !== LifecycleState.RUNNING) {
            throw new Error(`Cannot start modules in state: ${this.state}`);
        }
        
        await this._emitLifecycle('modules.starting');
        
        const started = new Set();
        const starting = new Set();
        
        const startModule = async (moduleId) => {
            if (started.has(moduleId)) return;
            if (starting.has(moduleId)) {
                throw new Error(`Circular dependency detected involving: ${moduleId}`);
            }
            
            const mod = this.modules.get(moduleId);
            if (!mod) throw new Error(`Unknown module: ${moduleId}`);
            
            starting.add(moduleId);
            
            // Start dependencies first
            for (const depId of mod.dependencies) {
                await startModule(depId);
            }
            
            // Start this module
            if (mod.instance.start && typeof mod.instance.start === 'function') {
                const opId = this.telemetry.startTiming(`module.start.${moduleId}`);
                try {
                    await mod.instance.start({
                        kernel: this,
                        config: this.config[moduleId] || {}
                    });
                    this.telemetry.endTiming(opId);
                    mod.lifecycle = 'running';
                    started.add(moduleId);
                    this.telemetry.increment('modules.started');
                } catch (error) {
                    this.telemetry.endTiming(opId);
                    mod.lifecycle = 'error';
                    this.errorHandler(`Module ${moduleId} failed to start:`, error);
                    throw error;
                }
            } else {
                mod.lifecycle = 'running';
                started.add(moduleId);
            }
            
            starting.delete(moduleId);
            this.eventBus.publish('kernel.module.started', { moduleId });
        };
        
        for (const [moduleId, _] of this.modules) {
            await startModule(moduleId);
        }
        
        await this._emitLifecycle('modules.started');
    }

    /**
     * Pause the kernel
     */
    async pause() {
        if (this.state !== LifecycleState.RUNNING) {
            throw new Error(`Cannot pause from state: ${this.state}`);
        }
        
        this._transitionState(LifecycleState.PAUSED);
        this.eventBus.pause();
        await this._emitLifecycle('kernel.paused');
        this.telemetry.setGauge('kernel.state_code', 2);
    }

    /**
     * Resume the kernel
     */
    async resume() {
        if (this.state !== LifecycleState.PAUSED) {
            throw new Error(`Cannot resume from state: ${this.state}`);
        }
        
        this.eventBus.resume(true);
        this._transitionState(LifecycleState.RUNNING);
        await this._emitLifecycle('kernel.resumed');
        this.telemetry.setGauge('kernel.state_code', 1);
    }

    /**
     * Stop the kernel and all modules
     * @returns {Promise<void>}
     */
    async stop() {
        if (this.state === LifecycleState.STOPPED || 
            this.state === LifecycleState.STOPPING) {
            return;
        }
        
        this._transitionState(LifecycleState.STOPPING);
        await this._emitLifecycle('kernel.stopping');
        
        // Stop modules in reverse order
        const moduleIds = Array.from(this.modules.keys()).reverse();
        for (const moduleId of moduleIds) {
            const mod = this.modules.get(moduleId);
            if (mod.lifecycle === 'running' && mod.instance.stop) {
                try {
                    const opId = this.telemetry.startTiming(`module.stop.${moduleId}`);
                    await mod.instance.stop();
                    this.telemetry.endTiming(opId);
                    mod.lifecycle = 'stopped';
                } catch (error) {
                    this.errorHandler(`Module ${moduleId} failed to stop:`, error);
                }
            }
        }
        
        this.telemetry.stopHistoryRecording();
        this._transitionState(LifecycleState.STOPPED);
        this.telemetry.setGauge('kernel.state_code', 0);
        await this._emitLifecycle('kernel.stopped');
    }

    /**
     * Internal: transition state
     * @private
     */
    _transitionState(newState) {
        const oldState = this.state;
        this.state = newState;
        this.eventBus.publish('kernel.lifecycle', { 
            type: 'transition', 
            oldState, 
            newState 
        });
    }

    /**
     * Internal: emit lifecycle event
     * @private
     */
    async _emitLifecycle(eventType, payload = {}) {
        this.eventBus.publish('kernel.lifecycle', {
            type: eventType,
            ...payload,
            timestamp: Date.now(),
            uptime: this.telemetry.getUptime()
        });
    }

    /**
     * Internal: handle lifecycle events
     * @private
     */
    _onLifecycleEvent(payload) {
        this.telemetry.increment(`lifecycle.${payload.type}`);
    }

    /**
     * Get kernel status
     * @returns {object}
     */
    getStatus() {
        const moduleStatus = {};
        for (const [id, mod] of this.modules) {
            moduleStatus[id] = {
                lifecycle: mod.lifecycle,
                dependencies: mod.dependencies,
                capabilities: mod.capabilities
            };
        }
        
        return {
            state: this.state,
            uptime: this.telemetry.getUptime(),
            modules: moduleStatus,
            capabilities: Object.fromEntries(this.capabilities),
            telemetry: this.telemetry.snapshot()
        };
    }

    /**
     * Publish an event
     * @param {string} topic - Event topic
     * @param {any} payload - Event payload
     * @param {object} metadata - Optional metadata
     * @returns {{sequence: number, timestamp: number}}
     */
    publish(topic, payload, metadata = {}) {
        return this.eventBus.publish(topic, payload, metadata);
    }

    /**
     * Subscribe to an event
     * @param {string} topic - Event topic
     * @param {Function} callback - Handler function
     * @param {number} priority - Priority level
     * @returns {number} - Subscriber ID
     */
    subscribe(topic, callback, priority = 0) {
        return this.eventBus.subscribe(topic, callback, priority);
    }

    /**
     * Unsubscribe from an event
     * @param {string} topic - Event topic
     * @param {number} subscriberId - Subscriber ID
     * @returns {boolean}
     */
    unsubscribe(topic, subscriberId) {
        return this.eventBus.unsubscribe(topic, subscriberId);
    }
}

export default RuntimeKernel;
