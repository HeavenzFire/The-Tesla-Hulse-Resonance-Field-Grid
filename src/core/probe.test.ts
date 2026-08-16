import { describe, it, expect, test } from 'vitest';

describe('HeavenzFire V&V Probes', () => {
  it('should verify JavaScript runtime environment', () => {
    const result = {
      runtime: typeof window !== "undefined" ? "browser" : "node",
      crypto: typeof crypto !== "undefined",
      subtleCrypto: typeof crypto !== "undefined" && typeof crypto.subtle !== "undefined",
      performance: typeof performance !== "undefined",
      timestamp: new Date().toISOString()
    };

    console.log("[HF-VV] JavaScript execution test");
    console.table(result);

    // Runtime can be either browser or node - both are valid
    expect(['browser', 'node']).toContain(result.runtime);
    expect(result.performance).toBe(true);
    expect(result.crypto).toBe(true);
    
    return result;
  });

  it('should verify mathematical substrate (log2(9216))', () => {
    const a = 9216;
    const entropy = Math.log2(a);
    const expected = 13.169925001442312;

    console.log("[HF-VV] Basis:", a);
    console.log("[HF-VV] log2(9216):", entropy);

    expect(Math.abs(entropy - expected)).toBeLessThan(1e-12);
    
    console.log("[HF-VV] Mathematical substrate test: PASS");
    
    return entropy;
  });

  it('should verify U†U reversibility on |0>', () => {
    const phaseAngles = [
      1.2079,
      2.3056,
      0.2927,
      0.4259,
      1.4945,
      0.6169,
      0.0192,
      0.0110
    ];

    const theta = phaseAngles.reduce((a, b) => a + b, 0);
    const c = Math.cos(theta);
    const s = Math.sin(theta);

    // |0>
    const psi = { re: 1, im: 0 };

    // U|0>
    const forward = {
      re: psi.re * c - psi.im * s,
      im: psi.re * s + psi.im * c
    };

    // U†U|0>
    const restored = {
      re: forward.re * c + forward.im * s,
      im: -forward.re * s + forward.im * c
    };

    const error = Math.hypot(restored.re - psi.re, restored.im - psi.im);
    const normForward = Math.hypot(forward.re, forward.im);
    const normRestored = Math.hypot(restored.re, restored.im);
    const fidelity = restored.re * psi.re + restored.im * psi.im;

    console.table({
      theta,
      normForward,
      normRestored,
      restorationError: error,
      fidelity
    });

    const PASS =
      error <= 1e-12 &&
      Math.abs(normForward - 1) <= 1e-12 &&
      Math.abs(normRestored - 1) <= 1e-12 &&
      Math.abs(fidelity - 1) <= 1e-12;

    console.log(PASS ? "[HF-VV] REVERSIBILITY: PASS" : "[HF-VV] REVERSIBILITY: FAIL");

    expect(PASS).toBe(true);

    return {
      pass: PASS,
      theta,
      restorationError: error,
      fidelity,
      normForward,
      normRestored
    };
  });
});
