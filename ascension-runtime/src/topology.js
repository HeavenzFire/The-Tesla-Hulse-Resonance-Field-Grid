/**
 * Topology Engine
 * Graph representation, node/edge routing, connectivity metrics, path evaluation
 */

export class TopologyEngine {
    constructor() {
        this.nodes = new Map(); // nodeId -> { id, data, edges: Map<neighborId, weight> }
        this.edgeCount = 0;
    }

    /**
     * Add a node to the graph
     * @param {string|number} id - Node identifier
     * @param {object} data - Optional node data
     * @returns {TopologyEngine} - Self for chaining
     */
    addNode(id, data = {}) {
        if (!this.nodes.has(id)) {
            this.nodes.set(id, {
                id,
                data,
                edges: new Map()
            });
        } else {
            // Update existing node data
            const node = this.nodes.get(id);
            node.data = { ...node.data, ...data };
        }
        return this;
    }

    /**
     * Add an edge between two nodes
     * @param {string|number} from - Source node ID
     * @param {string|number} to - Target node ID
     * @param {number} weight - Edge weight (default: 1)
     * @returns {TopologyEngine} - Self for chaining
     */
    addEdge(from, to, weight = 1) {
        if (!this.nodes.has(from)) this.addNode(from);
        if (!this.nodes.has(to)) this.addNode(to);
        
        const sourceNode = this.nodes.get(from);
        sourceNode.edges.set(to, weight);
        this.edgeCount++;
        return this;
    }

    /**
     * Remove a node and all its edges
     * @param {string|number} id - Node ID to remove
     * @returns {boolean} - True if removed
     */
    removeNode(id) {
        if (!this.nodes.has(id)) return false;
        
        // Remove all edges pointing to this node
        for (const [_, node] of this.nodes) {
            if (node.edges.has(id)) {
                node.edges.delete(id);
                this.edgeCount--;
            }
        }
        
        // Remove the node itself
        const node = this.nodes.get(id);
        this.edgeCount -= node.edges.size;
        this.nodes.delete(id);
        return true;
    }

    /**
     * Get neighbors of a node
     * @param {string|number} id - Node ID
     * @returns {Array<{id: string|number, weight: number}>}
     */
    getNeighbors(id) {
        if (!this.nodes.has(id)) return [];
        const node = this.nodes.get(id);
        return Array.from(node.edges.entries()).map(([nid, w]) => ({ id: nid, weight: w }));
    }

    /**
     * Breadth-first search path finding
     * @param {string|number} start - Start node ID
     * @param {string|number} end - End node ID
     * @returns {{path: Array, distance: number, found: boolean}}
     */
    findPathBFS(start, end) {
        if (!this.nodes.has(start) || !this.nodes.has(end)) {
            return { path: [], distance: Infinity, found: false };
        }
        
        if (start === end) {
            return { path: [start], distance: 0, found: true };
        }
        
        const visited = new Set([start]);
        const queue = [{ node: start, path: [start] }];
        
        while (queue.length > 0) {
            const { node, path } = queue.shift();
            const neighbors = this.getNeighbors(node);
            
            for (const neighbor of neighbors) {
                if (neighbor.id === end) {
                    const fullPath = [...path, end];
                    return { 
                        path: fullPath, 
                        distance: fullPath.length - 1, 
                        found: true 
                    };
                }
                
                if (!visited.has(neighbor.id)) {
                    visited.add(neighbor.id);
                    queue.push({ node: neighbor.id, path: [...path, neighbor.id] });
                }
            }
        }
        
        return { path: [], distance: Infinity, found: false };
    }

    /**
     * Dijkstra's shortest path (weighted)
     * @param {string|number} start - Start node ID
     * @param {string|number} end - End node ID
     * @returns {{path: Array, distance: number, found: boolean}}
     */
    findPathDijkstra(start, end) {
        if (!this.nodes.has(start) || !this.nodes.has(end)) {
            return { path: [], distance: Infinity, found: false };
        }
        
        const distances = new Map();
        const previous = new Map();
        const unvisited = new Set(this.nodes.keys());
        
        for (const id of this.nodes.keys()) {
            distances.set(id, Infinity);
        }
        distances.set(start, 0);
        
        while (unvisited.size > 0) {
            // Find unvisited node with minimum distance
            let current = null;
            let minDist = Infinity;
            for (const id of unvisited) {
                if (distances.get(id) < minDist) {
                    minDist = distances.get(id);
                    current = id;
                }
            }
            
            if (current === null || minDist === Infinity) break;
            if (current === end) break;
            
            unvisited.delete(current);
            
            const neighbors = this.getNeighbors(current);
            for (const neighbor of neighbors) {
                if (unvisited.has(neighbor.id)) {
                    const alt = distances.get(current) + neighbor.weight;
                    if (alt < distances.get(neighbor.id)) {
                        distances.set(neighbor.id, alt);
                        previous.set(neighbor.id, current);
                    }
                }
            }
        }
        
        // Reconstruct path
        const path = [];
        let current = end;
        while (current !== undefined && previous.has(current)) {
            path.unshift(current);
            current = previous.get(current);
        }
        if (current === start) {
            path.unshift(start);
        }
        
        const found = path.length > 0 && path[0] === start && path[path.length - 1] === end;
        return { 
            path: found ? path : [], 
            distance: found ? distances.get(end) : Infinity, 
            found 
        };
    }

    /**
     * Calculate degree centrality for all nodes
     * @returns {Map<string|number, number>} - Node ID -> centrality score
     */
    degreeCentrality() {
        const centrality = new Map();
        const n = this.nodes.size - 1; // Normalization factor
        
        for (const [id, node] of this.nodes) {
            const degree = node.edges.size;
            centrality.set(id, n > 0 ? degree / n : 0);
        }
        return centrality;
    }

    /**
     * Check if graph is connected (undirected interpretation)
     * @returns {boolean}
     */
    isConnected() {
        if (this.nodes.size === 0) return true;
        if (this.nodes.size === 1) return true;
        
        // Build undirected adjacency
        const undirected = new Map();
        for (const [id, node] of this.nodes) {
            undirected.set(id, new Set());
        }
        for (const [id, node] of this.nodes) {
            for (const [neighborId, _] of node.edges) {
                undirected.get(id).add(neighborId);
                undirected.get(neighborId).add(id);
            }
        }
        
        // BFS from first node
        const startId = this.nodes.keys().next().value;
        const visited = new Set([startId]);
        const queue = [startId];
        
        while (queue.length > 0) {
            const node = queue.shift();
            for (const neighbor of undirected.get(node)) {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    queue.push(neighbor);
                }
            }
        }
        
        return visited.size === this.nodes.size;
    }

    /**
     * Get graph statistics
     * @returns {{nodes: number, edges: number, density: number, connected: boolean}}
     */
    getStats() {
        const n = this.nodes.size;
        const maxEdges = n * (n - 1); // Directed graph
        const density = maxEdges > 0 ? this.edgeCount / maxEdges : 0;
        
        return {
            nodes: n,
            edges: this.edgeCount,
            density,
            connected: this.isConnected()
        };
    }

    /**
     * Export graph as adjacency list
     * @returns {object}
     */
    toJSON() {
        const result = {};
        for (const [id, node] of this.nodes) {
            result[id] = {
                data: node.data,
                edges: Object.fromEntries(node.edges)
            };
        }
        return result;
    }

    /**
     * Import graph from adjacency list
     * @param {object} data - JSON structure
     * @returns {TopologyEngine} - Self for chaining
     */
    fromJSON(data) {
        for (const [id, nodeData] of Object.entries(data)) {
            this.addNode(id, nodeData.data);
            for (const [neighborId, weight] of Object.entries(nodeData.edges)) {
                this.addEdge(id, neighborId, weight);
            }
        }
        return this;
    }
}

export default TopologyEngine;
