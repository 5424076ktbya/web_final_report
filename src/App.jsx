import { useState, useEffect } from "react";
import { runSlumpSimulation } from "./simulator";
import ResultChart from "./ResultChart";
import PieDist from "./PieDist";

const PRESETS = {
  eva15: { name: "エヴァ15 未来への咆哮", hitProb: 319.7, rushRate: 70, continueRate: 81, firstBonus: 450, payouts: [{ balls: 1500, rate: 100 }], mode: 0 },
  tokyoguru: { name: "P東京喰種", hitProb: 399.9, rushRate: 51, firstBonus: 1500, upperPayouts: [{ balls: 3000, rate: 97 }, { balls: 6000, rate: 3 }], ltContinueRate: 75, mode: 2 },
  mononogatari: { name: "Pもののがたり", hitProb: 149.9, rushRate: 25.5, firstBonus: 300, upperPayouts: [{ balls: 1500, rate: 50 }, { balls: 3000, rate: 25 }, { balls: 6000, rate: 25 }], ltContinueRate: 73, mode: 2 }
};

export default function App() {
  const [mode, setMode] = useState(0); 
  const [hitProb, setHitProb] = useState(319.7);
  const [rushRate, setRushRate] = useState(70);
  const [continueRate, setContinueRate] = useState(81);
  const [firstBonus, setFirstBonus] = useState(450);
  const [totalSpins, setTotalSpins] = useState(5000);
  const [border, setBorder] = useState(18);
  const [exchangeRate, setExchangeRate] = useState(4.0);
  const [ltEntryRate, setLtEntryRate] = useState(10);
  const [ltContinueRate, setLtContinueRate] = useState(90);
  const [payouts, setPayouts] = useState([{ balls: 1500, rate: 100 }]);
  const [upperPayouts, setUpperPayouts] = useState([{ balls: 1500, rate: 100 }]);
  const [result, setResult] = useState(null);

  const applyPreset = (key) => {
    const p = PRESETS[key];
    if (!p) return;
    setHitProb(p.hitProb); setRushRate(p.rushRate); setFirstBonus(p.firstBonus); setMode(p.mode);
    if (p.mode === 2) {
      setUpperPayouts([...p.upperPayouts]); setLtContinueRate(p.ltContinueRate); setLtEntryRate(100); setContinueRate(0); setPayouts([{ balls: 1500, rate: 100 }]);
    } else {
      setPayouts([...p.payouts]); setContinueRate(p.continueRate || 81);
      if (p.upperPayouts) setUpperPayouts([...p.upperPayouts]);
      if (p.ltContinueRate) setLtContinueRate(p.ltContinueRate);
      if (p.ltEntryRate) setLtEntryRate(p.ltEntryRate || 0);
    }
  };

  const addRow = (setter, list) => setter([...list, { balls: "", rate: "" }]);
  const removeRow = (setter, list, i) => setter(list.filter((_, idx) => idx !== i));

  const handleSimulate = () => {
    const data = runSlumpSimulation({ 
      hitProb, rushRate, firstBonus, border, exchangeRate,
      continueRate: mode === 2 ? 0 : continueRate,
      ltEntryRate: mode === 0 ? 0 : (mode === 2 ? 100 : ltEntryRate),
      ltContinueRate: mode === 0 ? 0 : ltContinueRate,
      payouts, upperPayouts: mode === 0 ? [] : upperPayouts
    }, totalSpins);
    setResult(data);
  };

  return (
    <div className="container">
      {/* CSSをここに直接埋め込みます。これが一番確実です。 */}
      <style>{`
        .container { padding: 20px; max-width: 1100px; margin: 0 auto; font-family: sans-serif; background-color: #f8f9fa; min-height: 100vh; }
        header { text-align: center; margin-bottom: 20px; }
        .main-layout { display: flex; gap: 20px; margin-bottom: 20px; flex-wrap: wrap; }
        .card { background: #fff; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); box-sizing: border-box; }
        
        /* PC設定 */
        .card-spec { flex: 1; min-width: 400px; }
        .card-dist-container { flex: 1; min-width: 400px; display: flex; flexDirection: column; gap: 20px; }

        /* スマホ設定（強制的に100%にする） */
        @media (max-width: 900px) {
          .container { padding: 10px; }
          .card-spec, .card-dist-container { flex: 0 0 100% !important; min-width: 100% !important; }
          .main-layout { flex-direction: column !important; }
        }

        .input-group { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        input { width: 100%; padding: 12px; border-radius: 8px; border: 1px solid #ddd; font-size: 16px; box-sizing: border-box; }
        label { display: block; font-size: 12px; font-weight: bold; color: #555; margin-bottom: 4px; }
        .btn-mode-container { display: flex; background: #eee; padding: 4px; border-radius: 30px; max-width: 500px; margin: 0 auto; }
        .btn-mode { padding: 10px; border-radius: 20px; border: none; cursor: pointer; font-weight: bold; flex: 1; font-size: 12px; background: #eee; color: #666; }
        .btn-mode.active { background: #2c3e50; color: white; }
        .btn-simulate { width: 100%; padding: 18px; font-size: 18px; font-weight: bold; border-radius: 50px; border: none; background: #2c3e50; color: white; cursor: pointer; margin-bottom: 30px; }
      `}</style>

      <header>
        <h1 style={{fontSize: "24px", color: "#2c3e50"}}>パチンコ収支シミュレーター</h1>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", justifyContent: "center", marginBottom: "15px" }}>
          {Object.keys(PRESETS).map(key => (
            <button key={key} onClick={() => applyPreset(key)} style={{padding: "6px 12px", borderRadius: "15px", border: "1px solid #ccc", background: "#fff", fontSize: "11px"}}>{PRESETS[key].name}</button>
          ))}
        </div>
        <div className="btn-mode-container">
          <button className={`btn-mode ${mode === 0 ? "active" : ""}`} onClick={() => setMode(0)}>通常RUSH</button>
          <button className={`btn-mode ${mode === 1 ? "active" : ""}`} onClick={() => setMode(1)}>RUSH+LT</button>
          <button className={`btn-mode ${mode === 2 ? "active" : ""}`} onClick={() => setMode(2)}>LT直行</button>
        </div>
      </header>

      <div className="main-layout">
        {/* 基本スペック */}
        <div className="card card-spec">
          <h3 style={{ marginTop: 0, borderLeft: "4px solid #4CAF50", paddingLeft: "10px", fontSize: "16px" }}>基本スペック</h3>
          <div className="input-group">
            <div style={{ gridColumn: "span 2" }}><label>初当たり確率 (1/x)</label><input type="number" value={hitProb} onChange={e => setHitProb(e.target.value)} /></div>
            <div style={{ gridColumn: "span 2" }}><label style={{color: "#e67e22"}}>初当たり出玉 (発)</label><input type="number" value={firstBonus} onChange={e => setFirstBonus(e.target.value)} style={{borderColor: "#e67e22"}} /></div>
            <div><label>RUSH突入率 (%)</label><input type="number" value={rushRate} onChange={e => setRushRate(e.target.value)} /></div>
            {mode !== 2 && (<div><label>通常RUSH継続 (%)</label><input type="number" value={continueRate} onChange={e => setContinueRate(e.target.value)} /></div>)}
            {mode !== 0 && (
              <div style={{ gridColumn: "span 2", padding: "12px", backgroundColor: "#fdfbff", border: "1px solid #9966FF", borderRadius: "10px" }}>
                <label style={{color: "#9966FF"}}>上位LT設定</label>
                <div style={{ display: "flex", gap: "10px" }}>
                  {mode === 1 && <div style={{flex:1}}><label style={{fontSize:"10px"}}>移行率%</label><input type="number" value={ltEntryRate} onChange={e => setLtEntryRate(e.target.value)} /></div>}
                  <div style={{flex:1}}><label style={{fontSize:"10px"}}>継続%</label><input type="number" value={ltContinueRate} onChange={e => setLtContinueRate(e.target.value)} /></div>
                </div>
              </div>
            )}
            <div><label>1k回転数</label><input type="number" value={border} onChange={e => setBorder(e.target.value)} /></div>
            <div><label>換金率 (円)</label><input type="number" step="0.1" value={exchangeRate} onChange={e => setExchangeRate(e.target.value)} /></div>
            <div style={{ gridColumn: "span 2" }}><label>総通常回転数</label><input type="number" value={totalSpins} onChange={e => setTotalSpins(e.target.value)} /></div>
          </div>
        </div>

        {/* 振り分け */}
        <div className="card-dist-container">
          {mode !== 2 && (
            <div className="card">
              <h3 style={{ margin: "0 0 10px 0", borderLeft: "4px solid #2196F3", paddingLeft: "10px", fontSize: "16px" }}>通常RUSH 振り分け</h3>
              {payouts.map((p, i) => (
                <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                  <input type="number" value={p.balls} placeholder="玉" onChange={e => { const n = [...payouts]; n[i].balls = e.target.value; setPayouts(n) }} />
                  <input type="number" value={p.rate} placeholder="%" onChange={e => { const n = [...payouts]; n[i].rate = e.target.value; setPayouts(n) }} />
                  <button onClick={() => removeRow(setPayouts, payouts, i)} style={{ color: "#ff4d4d", border: "none", background: "none", fontSize: "20px" }}>×</button>
                </div>
              ))}
              <button onClick={() => addRow(setPayouts, payouts)} style={{ width: "100%", padding: "10px", border: "1px dashed #2196F3", background: "#f0f7ff", color: "#2196F3", borderRadius: "8px", fontWeight: "bold" }}>＋ 追加</button>
              <PieDist dist={payouts} />
            </div>
          )}
          {mode !== 0 && (
            <div className="card" style={{border: "2px solid #9966FF"}}>
              <h3 style={{ margin: "0 0 10px 0", borderLeft: "4px solid #9966FF", paddingLeft: "10px", fontSize: "16px" }}>上位LT 振り分け</h3>
              {upperPayouts.map((p, i) => (
                <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                  <input type="number" value={p.balls} placeholder="玉" onChange={e => { const n = [...upperPayouts]; n[i].balls = e.target.value; setUpperPayouts(n) }} />
                  <input type="number" value={p.rate} placeholder="%" onChange={e => { const n = [...upperPayouts]; n[i].rate = e.target.value; setUpperPayouts(n) }} />
                  <button onClick={() => removeRow(setUpperPayouts, upperPayouts, i)} style={{ color: "#ff4d4d", border: "none", background: "none", fontSize: "20px" }}>×</button>
                </div>
              ))}
              <button onClick={() => addRow(setUpperPayouts, upperPayouts)} style={{ width: "100%", padding: "10px", border: "1px dashed #9966FF", background: "#f9f6ff", color: "#9966FF", borderRadius: "8px", fontWeight: "bold" }}>＋ 追加</button>
              <PieDist dist={upperPayouts} />
            </div>
          )}
        </div>
      </div>

      <button className="btn-simulate" onClick={handleSimulate}>シミュレーションを実行</button>

      {result && result.history && (
        <div className="card" style={{borderRadius: "16px"}}>
          <h3 style={{ textAlign: "center", marginTop: 0, fontSize: "16px" }}>差玉収支スランプグラフ</h3>
          <ResultChart slumpData={result.history} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "20px", borderTop: "1px solid #eee", paddingTop: "15px" }}>
             <StatBox label="初当たり" value={`${result.stats.jackpotCounts}回`} />
             <StatBox label="最大連チャン" value={`${result.stats.maxCombo}連`} color="#e74c3c" />
             <StatBox label="最大獲得玉" value={`${Number(result.stats.maxJackpotBalls).toLocaleString()}発`} color="#f39c12" />
             <StatBox label="平均連チャン" value={`${result.stats.avgCombo}連`} />
             <StatBox label="期待値" value={`${result.stats.totalExpectedValue.toLocaleString()}円`} highlight color={result.stats.totalExpectedValue >= 0 ? "#3498db" : "#e74c3c"} />
             <StatBox label="実収支" value={`${result.history[result.history.length-1].y.toLocaleString()}円`} color={result.history[result.history.length-1].y >= 0 ? "#3498db" : "#e74c3c"} />
          </div>
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value, color = "#2c3e50", highlight = false }) {
  return (
    <div style={{ textAlign: "center", background: highlight ? "#f0f7ff" : "#f8f9fa", padding: "12px 5px", borderRadius: "12px", border: highlight ? "1px solid #3498db" : "none" }}>
      <div style={{ fontSize: "11px", color: "#7f8c8d", marginBottom: "4px" }}>{label}</div>
      <div style={{ fontSize: "15px", fontWeight: "bold", color: color }}>{value}</div>
    </div>
  );
}