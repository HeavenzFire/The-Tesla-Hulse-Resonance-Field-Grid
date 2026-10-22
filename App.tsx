import React, { useEffect, useMemo, useState } from 'react';

type Sample = { t: string; resonance: number; flux: number; harmonic: number };
const HARMONICS = [
  { id: 'all', label: 'All harmonics' },
  { id: '1', label: 'H1 · Fundamental' },
  { id: '2', label: 'H2 · Second harmonic' },
  { id: '3', label: 'H3 · Third harmonic' },
  { id: '5', label: 'H5 · Fifth harmonic' },
];
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const stamp = () => new Date().toISOString();

function download(name: string, text: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a');
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}

function exportSamples(format: string, samples: Sample[]) {
  const base = 'heavenzfire-resonance-telemetry';
  if (format === 'json') download(base + '.json', JSON.stringify({ schema: 'heavenzfire.telemetry.v1', generatedAt: stamp(), provenance: 'SIMULATED_DEMO_DATA', samples }, null, 2), 'application/json');
  if (format === 'csv' || format === 'tsv') {
    const sep = format === 'csv' ? ',' : '\t';
    const rows = [['timestamp', 'resonance_index', 'flux_index', 'harmonic'], ...samples.map(s => [s.t, s.resonance.toFixed(5), s.flux.toFixed(5), String(s.harmonic)])];
    download(base + '.' + format, rows.map(r => r.join(sep)).join('\n'), format === 'csv' ? 'text/csv' : 'text/tab-separated-values');
  }
  if (format === 'vtk') {
    const values = samples.map(s => s.flux.toFixed(6)).join('\n');
    download(base + '.vtk', '# vtk DataFile Version 3.0\nHeavenzFire simulated scalar telemetry; not measured field data\nASCII\nDATASET POLYDATA\nPOINTS ' + samples.length + ' float\n' + samples.map((s, i) => i + ' ' + s.resonance.toFixed(5) + ' ' + s.flux.toFixed(5)).join('\n') + '\nPOINT_DATA ' + samples.length + '\nSCALARS flux_index float 1\nLOOKUP_TABLE default\n' + values + '\n', 'text/plain');
  }
}

const App: React.FC = () => {
  const [harmonic, setHarmonic] = useState('all');
  const [gain, setGain] = useState(68);
  const [frequency, setFrequency] = useState(432);
  const [threshold, setThreshold] = useState(82);
  const [running, setRunning] = useState(true);
  const [tick, setTick] = useState(0);
  const [samples, setSamples] = useState<Sample[]>(() => Array.from({ length: 24 }, (_, i) => {
    const phase = i * 0.31;
    return { t: new Date(Date.now() - (23 - i) * 15000).toISOString(), resonance: 38 + 26 * Math.abs(Math.sin(phase)), flux: 18 + 57 * Math.abs(Math.cos(phase * 0.78)), harmonic: [1, 2, 3, 5][i % 4] };
  }));
  const [audit, setAudit] = useState<string[]>(['Dashboard initialized · demo telemetry mode']);
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setTick(n => n + 1);
      setSamples(old => {
        const t = Date.now() / 1000;
        const next: Sample = { t: stamp(), resonance: clamp((24 + Math.abs(Math.sin(t * frequency / 210)) * gain * 0.72), 0, 100), flux: clamp(12 + Math.abs(Math.cos(t * frequency / 260 + 0.6)) * gain, 0, 100), harmonic: [1, 2, 3, 5][Math.floor(t) % 4] };
        return [...old.slice(-59), next];
      });
    }, 1500);
    return () => window.clearInterval(id);
  }, [running, gain, frequency]);
  const filtered = useMemo(() => harmonic === 'all' ? samples : samples.filter(s => s.harmonic === Number(harmonic)), [samples, harmonic]);
  const latest = samples[samples.length - 1];
  const alerting = latest.flux >= threshold || latest.resonance >= threshold;
  const addAudit = (message: string) => setAudit(old => [new Date().toLocaleTimeString() + ' · ' + message, ...old].slice(0, 30));
  const exportData = (format: string) => { exportSamples(format, filtered); addAudit('Export requested: ' + format.toUpperCase() + ' (' + filtered.length + ' records)'); };
  const points = useMemo(() => {
    const rows = 13, cols = 26;
    const project = (x: number, y: number, z: number) => ({ x: 330 + (x - y) * 17, y: 176 + (x + y) * 8 - z * 78 });
    const result: {x:number;y:number;z:number;px:number;py:number}[] = [];
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      const xx = (x / (cols - 1) - 0.5) * 2.7;
      const yy = (y / (rows - 1) - 0.5) * 2.7;
      const k = harmonic === 'all' ? 2 : Number(harmonic);
      const z = (Math.sin(xx * k + tick * 0.14) * Math.cos(yy * k * 0.8 - tick * 0.08) + 1) * 0.5 * (gain / 100);
      const p = project(xx, yy, z);
      result.push({ x, y, z, px: p.x, py: p.y });
    }
    return result;
  }, [harmonic, tick, gain]);
  const gridLines = useMemo(() => {
    const rows = 13, cols = 26, lines: string[] = [];
    for (let y = 0; y < rows; y++) lines.push(Array.from({length: cols}, (_, x) => points[y * cols + x]).map(p => p.px + ',' + p.py).join(' '));
    for (let x = 0; x < cols; x++) lines.push(Array.from({length: rows}, (_, y) => points[y * cols + x]).map(p => p.px + ',' + p.py).join(' '));
    return lines;
  }, [points]);
  const card = 'rounded-xl border border-cyan-900/60 bg-slate-950/75 p-4 sm:p-5';
  const label = 'text-xs uppercase tracking-[0.18em] text-slate-400';
  const button = 'rounded-lg border border-cyan-800 px-3 py-2 text-xs font-semibold text-cyan-100 hover:bg-cyan-950 focus:outline-none focus:ring-2 focus:ring-cyan-400';
  return (
    <div className="min-h-screen bg-[#050b14] text-slate-100">
      <header className="border-b border-cyan-950 bg-slate-950/90">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div><div className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-400">HEAVENZFIRE · FIELD LAB</div><h1 className="mt-1 text-2xl font-bold sm:text-3xl">Resonance Observatory</h1><p className="mt-1 text-sm text-slate-400">Interactive harmonic exploration · synthetic telemetry prototype</p></div>
          <div className="flex flex-wrap items-center gap-2"><span className={'rounded-full px-3 py-1 text-xs ' + (running ? 'bg-emerald-950 text-emerald-300' : 'bg-slate-800 text-slate-300')}>{running ? '● STREAM SIMULATING' : 'Ⅱ STREAM PAUSED'}</span><button className={button} onClick={() => { setRunning(v => !v); addAudit(running ? 'Simulation paused' : 'Simulation resumed'); }}>{running ? 'Pause stream' : 'Resume stream'}</button></div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl space-y-5 px-4 py-5 sm:px-6 sm:py-7">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-semibold">Live field monitor</h2><p className="text-sm text-slate-400">Synthetic signals for interface testing — not physical sensor readings or validated electromagnetic simulation.</p></div><span className="rounded-md border border-amber-700/70 bg-amber-950/50 px-3 py-2 text-xs text-amber-200">DEMO DATA · NO SENSOR CONNECTED</span></div>
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className={card}><div className={label}>Resonance index</div><div className="mt-2 text-3xl font-semibold tabular-nums">{latest.resonance.toFixed(1)}<span className="text-sm text-slate-500"> / 100</span></div><div className="mt-3 h-1.5 rounded bg-slate-800"><div className="h-1.5 rounded bg-cyan-400 transition-all" style={{width: latest.resonance + '%'}} /></div></div>
          <div className={card}><div className={label}>Flux index</div><div className="mt-2 text-3xl font-semibold tabular-nums">{latest.flux.toFixed(1)}<span className="text-sm text-slate-500"> / 100</span></div><div className="mt-3 h-1.5 rounded bg-slate-800"><div className="h-1.5 rounded bg-violet-400 transition-all" style={{width: latest.flux + '%'}} /></div></div>
          <div className={card}><div className={label}>Selected harmonic</div><div className="mt-2 text-3xl font-semibold">{harmonic === 'all' ? 'MULTI' : 'H' + harmonic}</div><p className="mt-2 text-xs text-slate-400">{filtered.length} visible telemetry records</p></div>
          <div className={card}><div className={label}>Threshold monitor</div><div className={'mt-2 text-2xl font-semibold ' + (alerting ? 'text-rose-300' : 'text-emerald-300')}>{alerting ? 'BREACH' : 'NOMINAL'}</div><p className="mt-2 text-xs text-slate-400">Alert when either index ≥ {threshold}</p>{alerting && <p className="mt-1 text-xs text-rose-300">Threshold exceeded in simulated data.</p>}</div>
        </section>
        <section className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(300px,0.8fr)]">
          <div className={card}>
            <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-base font-semibold">3D-projected harmonic surface</h3><p className="mt-1 text-xs text-slate-400">Interactive parameterized surface · perspective projection</p></div><select aria-label="Harmonic filter" className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm" value={harmonic} onChange={e => {setHarmonic(e.target.value); addAudit('Harmonic filter set to ' + e.target.value);}}>{HARMONICS.map(h => <option key={h.id} value={h.id}>{h.label}</option>)}</select></div>
            <div className="mt-4 overflow-hidden rounded-lg border border-slate-800 bg-[#030812]"><svg viewBox="0 0 660 370" role="img" aria-label="Projected synthetic harmonic surface" className="h-auto w-full" style={{minHeight: 260}}><defs><linearGradient id="surfaceGlow" x1="0" x2="1" y1="0" y2="1"><stop offset="0%" stopColor="#22d3ee" stopOpacity=".9"/><stop offset="100%" stopColor="#8b5cf6" stopOpacity=".35"/></linearGradient></defs>{gridLines.map((line,i)=><polyline key={i} points={line} fill="none" stroke="url(#surfaceGlow)" strokeWidth={i < 13 ? 1.15 : .7} opacity={i < 13 ? .85 : .48}/>)}</svg></div>
            <div className="mt-3 flex flex-wrap justify-between gap-2 text-xs text-slate-500"><span>Gain: {gain}%</span><span>Animation frame: {tick}</span><span>Source: synthetic function</span></div>
          </div>
          <aside className={card}>
            <h3 className="font-semibold">Experiment controls</h3><p className="mt-1 text-xs text-slate-400">Changes affect the demo generator only.</p>
            <label className="mt-5 block text-sm">Frequency parameter <span className="float-right text-cyan-300">{frequency} Hz</span><input className="mt-3 w-full accent-cyan-400" type="range" min="50" max="1200" step="1" value={frequency} onChange={e=>setFrequency(Number(e.target.value))}/></label>
            <label className="mt-5 block text-sm">Signal gain <span className="float-right text-cyan-300">{gain}%</span><input className="mt-3 w-full accent-cyan-400" type="range" min="10" max="100" value={gain} onChange={e=>setGain(Number(e.target.value))}/></label>
            <label className="mt-5 block text-sm">Alert threshold <span className="float-right text-cyan-300">{threshold}</span><input className="mt-3 w-full accent-cyan-400" type="range" min="40" max="100" value={threshold} onChange={e=>{setThreshold(Number(e.target.value)); addAudit('Alert threshold changed to ' + e.target.value);}}/></label>
            <div className="mt-6 rounded-lg border border-slate-800 bg-slate-900/70 p-3"><div className={label}>Telemetry stream</div><div className="mt-2 flex justify-between text-sm"><span>Records retained</span><strong>{samples.length}</strong></div><div className="mt-2 flex justify-between text-sm"><span>Update interval</span><strong>1.5 s</strong></div><div className="mt-2 flex justify-between text-sm"><span>Threshold actions</span><strong>{alerting ? 'Breach detected' : 'None'}</strong></div></div>
          </aside>
        </section>
        <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <div className={card}><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-semibold">Telemetry history</h3><p className="mt-1 text-xs text-slate-400">Recent samples · filtered by harmonic selector</p></div><div className="flex flex-wrap gap-2">{['csv','tsv','json','vtk'].map(f=><button key={f} className={button} onClick={()=>exportData(f)}>Export {f.toUpperCase()}</button>)}</div></div>
            <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[460px] text-left text-xs"><thead className="border-b border-slate-800 text-slate-400"><tr><th className="py-2 pr-3">Timestamp (UTC)</th><th className="py-2 pr-3">Resonance</th><th className="py-2 pr-3">Flux</th><th className="py-2">Harmonic</th></tr></thead><tbody>{filtered.slice(-8).reverse().map((s,i)=><tr key={s.t + i} className="border-b border-slate-900"><td className="py-2 pr-3 text-slate-400">{new Date(s.t).toLocaleTimeString()}</td><td className="py-2 pr-3">{s.resonance.toFixed(2)}</td><td className="py-2 pr-3">{s.flux.toFixed(2)}</td><td className="py-2">H{s.harmonic}</td></tr>)}</tbody></table></div>
          </div>
          <div className={card}><div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold">Security & collaboration readiness</h3><p className="mt-1 text-xs text-slate-400">Integration status — not a claim of connected cloud services</p></div><span className="rounded bg-amber-950 px-2 py-1 text-xs text-amber-200">BACKEND NEEDED</span></div>
            <div className="mt-4 space-y-3">{[{name:'Local export formats',state:'Available'},{name:'Session audit trail',state:'In-memory demo'},{name:'Authentication & role permissions',state:'Not configured'},{name:'Cloud sync / backup',state:'Not configured'},{name:'Multi-user review & email alerts',state:'Not configured'}].map(row=><div key={row.name} className="flex flex-wrap justify-between gap-2 border-b border-slate-800 pb-2 text-sm"><span>{row.name}</span><span className="text-xs text-slate-400">{row.state}</span></div>)}</div>
            <div className="mt-4 flex flex-wrap gap-2"><button className={button} onClick={()=>{download('heavenzfire-audit-demo.json',JSON.stringify({exportedAt:stamp(),mode:'local-demo',events:audit},null,2),'application/json');addAudit('Audit log export requested');}}>Export audit log</button><button className={button} onClick={()=>{setAudit(old=>[new Date().toLocaleTimeString()+' · Manual checkpoint',...old].slice(0,30));}}>Add checkpoint</button></div>
            <div className="mt-4 max-h-32 overflow-auto rounded-lg bg-slate-900 p-3">{audit.slice(0,6).map((a,i)=><div key={i} className="py-1 text-xs text-slate-400">{a}</div>)}</div>
          </div>
        </section>
        <footer className="border-t border-slate-800 py-5 text-xs leading-5 text-slate-500">Prototype boundary: values are synthetic, generated in the browser, and not validated physics. This client-only build does not provide authentication, durable audit storage, email, cloud backup, or collaborative sessions. Those features require a secured backend, explicit identity/permission model, and server-side tests before production use.</footer>
      </main>
    </div>
  );
};
export default App;
