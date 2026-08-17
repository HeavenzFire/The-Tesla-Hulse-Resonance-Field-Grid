/**
 * Event Bus with Deterministic Ordering
 * Pub/sub system with sequence numbers, priority queues, and replay capability
 */

export class EventBus {
    constructor() {
        this.subscribers = new Map(); // topic -> Set<{callback, priority, id}>
        this.eventLog = []; // Immutable event log for replay
        this.sequenceNumber = 0;
        this.subscriberIdCounter = 0;
        this.paused = false;
        this.pendingEvents = []; // Priority queue when paused
    }

    /**
     * Subscribe to a topic
     * @param {string} topic - Topic name
     * @param {Function} callback - Handler function
     * @param {number} priority - Higher priority executes first (default: 0)
     * @returns {number} - Subscriber ID for unsubscribe
     */
    subscribe(topic, callback, priority = 0) {
        if (!this.subscribers.has(topic)) {
            this.subscribers.set(topic, new Set());
        }
        
        const id = ++this.subscriberIdCounter;
        this.subscribers.get(topic).add({ id, callback, priority });
        return id;
    }

    /**
     * Unsubscribe from a topic
     * @param {string} topic - Topic name
     * @param {number} subscriberId - ID returned from subscribe
     * @returns {boolean} - True if unsubscribed
     */
    unsubscribe(topic, subscriberId) {
        if (!this.subscribers.has(topic)) return false;
        
        const subs = this.subscribers.get(topic);
        for (const sub of subs) {
            if (sub.id === subscriberId) {
                subs.delete(sub);
                return true;
            }
        }
        return false;
    }

    /**
     * Publish an event
     * @param {string} topic - Topic name
     * @param {any} payload - Event data
     * @param {object} metadata - Optional metadata
     * @returns {{sequence: number, timestamp: number}}
     */
    publish(topic, payload, metadata = {}) {
        const timestamp = performance.now();
        const sequence = ++this.sequenceNumber;
        
        const event = {
            topic,
            payload,
            metadata,
            sequence,
            timestamp,
            delivered: false
        };
        
        if (this.paused) {
            this.pendingEvents.push(event);
            // Sort by priority (if available in metadata) then sequence
            this.pendingEvents.sort((a, b) => {
                const pA = a.metadata.priority || 0;
                const pB = b.metadata.priority || 0;
                if (pB !== pA) return pB - pA;
                return a.sequence - b.sequence;
            });
        } else {
            this._deliverEvent(event);
        }
        
        // Log event immutably
        this.eventLog.push(Object.freeze({ ...event }));
        
        return { sequence, timestamp };
    }

    /**
     * Internal: deliver event to subscribers
     * @private
     */
    _deliverEvent(event) {
        const subs = this.subscribers.get(event.topic);
        if (!subs || subs.size === 0) return;
        
        // Sort subscribers by priority (descending), then by subscription order
        const sortedSubs = Array.from(subs).sort((a, b) => {
            if (b.priority !== a.priority) return b.priority - a.priority;
            return a.id - b.id;
        });
        
        let deliveryIndex = 0;
        for (const sub of sortedSubs) {
            try {
                sub.callback(event.payload, {
                    topic: event.topic,
                    sequence: event.sequence,
                    timestamp: event.timestamp,
                    deliveryIndex: deliveryIndex++
                });
            } catch (error) {
                // Log error but continue delivery
                console.error(`[EventBus] Error in subscriber ${sub.id} for topic "${event.topic}":`, error);
            }
        }
        
        event.delivered = true;
    }

    /**
     * Pause event delivery (events queued)
     */
    pause() {
        this.paused = true;
    }

    /**
     * Resume event delivery (flush pending events)
     * @param {boolean} flushAll - If true, deliver all pending; if false, drop pending
     */
    resume(flushAll = true) {
        this.paused = false;
        
        if (flushAll) {
            for (const event of this.pendingEvents) {
                this._deliverEvent(event);
            }
        }
        
        this.pendingEvents = [];
    }

    /**
     * Replay events from the log
     * @param {number} fromSequence - Start sequence number (default: 1)
     * @param {number} toSequence - End sequence number (default: latest)
     * @param {string} topicFilter - Optional topic filter
     */
    replay(fromSequence = 1, toSequence = Infinity, topicFilter = null) {
        const results = [];
        
        for (const event of this.eventLog) {
            if (event.sequence >= fromSequence && 
                event.sequence <= toSequence &&
                (topicFilter === null || event.topic === topicFilter)) {
                
                this._deliverEvent({ ...event, delivered: false });
                results.push(event.sequence);
            }
        }
        
        return results;
    }

    /**
     * Get event statistics
     * @returns {{total: number, byTopic: object, pending: number}}
     */
    getStats() {
        const byTopic = {};
        for (const event of this.eventLog) {
            byTopic[event.topic] = (byTopic[event.topic] || 0) + 1;
        }
        
        return {
            total: this.eventLog.length,
            byTopic,
            pending: this.pendingEvents.length,
            subscribers: this.subscribers.size,
            paused: this.paused
        };
    }

    /**
     * Clear event log (use with caution)
     * @param {boolean} keepLast - Keep last N events
     */
    clearLog(keepLast = 0) {
        if (keepLast > 0 && this.eventLog.length > keepLast) {
            this.eventLog = this.eventLog.slice(-keepLast);
        } else {
            this.eventLog = [];
        }
    }

    /**
     * Export event log for persistence
     * @returns {Array}
     */
    exportLog() {
        return this.eventLog.map(e => ({
            topic: e.topic,
            payload: e.payload,
            metadata: e.metadata,
            sequence: e.sequence,
            timestamp: e.timestamp
        }));
    }

    /**
     * Import event log
     * @param {Array} logData - Previously exported log
     */
    importLog(logData) {
        for (const item of logData) {
            this.eventLog.push(Object.freeze(item));
            if (item.sequence > this.sequenceNumber) {
                this.sequenceNumber = item.sequence;
            }
        }
    }
}

export default EventBus;
