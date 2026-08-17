/**
 * Balanced Ternary Arithmetic Logic Unit
 * Implements true ternary computation with states: -1 (FALSE), 0 (UNKNOWN), +1 (TRUE)
 */

export class BalancedTernary {
    /**
     * Normalize any value to ternary state: -1, 0, or +1
     * @param {number} x - Input value
     * @returns {number} - Normalized ternary state
     */
    static normalize(x) {
        if (x > 0) return 1;
        if (x < 0) return -1;
        return 0;
    }

    /**
     * Encode boolean/number to ternary
     * @param {boolean|number} val - Input value
     * @returns {number} - Ternary state
     */
    static encode(val) {
        if (typeof val === 'boolean') return val ? 1 : -1;
        return this.normalize(val);
    }

    /**
     * Decode ternary to human-readable form
     * @param {number} t - Ternary state
     * @returns {string} - Readable representation
     */
    static decode(t) {
        if (t > 0) return 'TRUE';
        if (t < 0) return 'FALSE';
        return 'UNKNOWN';
    }

    /**
     * Ternary NOT operation
     * @param {number} a - Input ternary value
     * @returns {number} - Negated ternary value
     */
    static NOT(a) {
        return -this.normalize(a);
    }

    /**
     * Ternary AND operation (Kleene logic)
     * Truth table:
     *   AND |  1   0  -1
     *   ----+-----------
     *    1  |  1   0  -1
     *    0  |  0   0   0
     *   -1  | -1   0  -1
     * @param {number} a - First operand
     * @param {number} b - Second operand
     * @returns {number} - Result
     */
    static AND(a, b) {
        a = this.normalize(a);
        b = this.normalize(b);
        // Kleene logic: if either is FALSE (-1), result is FALSE
        // if either is UNKNOWN (0), result is UNKNOWN (unless other is FALSE)
        if (a === -1 || b === -1) return -1;
        if (a === 0 || b === 0) return 0;
        return 1;
    }

    /**
     * Ternary OR operation (Kleene logic)
     * Truth table:
     *   OR  |  1   0  -1
     *   ----+-----------
     *    1  |  1   1   1
     *    0  |  1   0   0
     *   -1  |  1   0  -1
     * @param {number} a - First operand
     * @param {number} b - Second operand
     * @returns {number} - Result
     */
    static OR(a, b) {
        a = this.normalize(a);
        b = this.normalize(b);
        // Kleene logic: if either is TRUE (1), result is TRUE
        // if either is UNKNOWN (0), result is UNKNOWN (unless other is TRUE)
        if (a === 1 || b === 1) return 1;
        if (a === 0 || b === 0) return 0;
        return -1;
    }

    /**
     * Ternary XOR operation
     * @param {number} a - First operand
     * @param {number} b - Second operand
     * @returns {number} - Result
     */
    static XOR(a, b) {
        a = this.normalize(a);
        b = this.normalize(b);
        if (a === 0 || b === 0) return 0;
        return this.normalize(a * b * -1);
    }

    /**
     * Ternary NAND (universal gate)
     * @param {number} a - First operand
     * @param {number} b - Second operand
     * @returns {number} - Result
     */
    static NAND(a, b) {
        return this.NOT(this.AND(a, b));
    }

    /**
     * Ternary NOR (universal gate)
     * @param {number} a - First operand
     * @param {number} b - Second operand
     * @returns {number} - Result
     */
    static NOR(a, b) {
        return this.NOT(this.OR(a, b));
    }

    /**
     * Vector operation: apply function across array
     * @param {number[]} values - Array of values
     * @returns {number[]} - Normalized ternary vector
     */
    static vector(values) {
        return values.map(v => this.normalize(v));
    }

    /**
     * Vector AND across two arrays
     * @param {number[]} a - First vector
     * @param {number[]} b - Second vector
     * @returns {number[]} - Result vector
     */
    static vectorAND(a, b) {
        const len = Math.min(a.length, b.length);
        const result = [];
        for (let i = 0; i < len; i++) {
            result.push(this.AND(a[i], b[i]));
        }
        return result;
    }

    /**
     * Vector OR across two arrays
     * @param {number[]} a - First vector
     * @param {number[]} b - Second vector
     * @returns {number[]} - Result vector
     */
    static vectorOR(a, b) {
        const len = Math.min(a.length, b.length);
        const result = [];
        for (let i = 0; i < len; i++) {
            result.push(this.OR(a[i], b[i]));
        }
        return result;
    }

    /**
     * Count distribution of states in vector
     * @param {number[]} vector - Ternary vector
     * @returns {{negative: number, zero: number, positive: number}}
     */
    static countStates(vector) {
        return {
            negative: vector.filter(v => v < 0).length,
            zero: vector.filter(v => v === 0).length,
            positive: vector.filter(v => v > 0).length
        };
    }

    /**
     * Calculate entropy of ternary distribution
     * H = -Σ p_i * log2(p_i) for i in {-1, 0, +1}
     * @param {number[]} vector - Ternary vector
     * @returns {number} - Entropy in bits
     */
    static entropy(vector) {
        const counts = this.countStates(vector);
        const total = vector.length;
        let entropy = 0;
        
        for (const key of ['negative', 'zero', 'positive']) {
            const p = counts[key] / total;
            if (p > 0) {
                entropy -= p * Math.log2(p);
            }
        }
        return entropy;
    }
}

// Export singleton instance for convenience
export const TernaryALU = BalancedTernary;
export default BalancedTernary;
