import { useState } from "react";
import { runSlumpSimulation } from "./simulator";
import ResultChart from "./ResultChart";
import PieDist from "./PieDist";

// 1. 機種プリセットデータ
const PRESETS = {
  eva15: {
    name: "エヴァ15 未来への咆哮",
    hitProb: 319.7, rushRate: 70, continueRate: 81, firstBonus: 450,
    payouts: [{ balls: 1500, rate: 100 }],
    mode: 0
  },
  tokyoguru: {
    name: "P東京喰種",
    hitProb: 399.9, 
    rushRate: 51, 
    firstBonus: 1500,
    upperPayouts: [
      { balls: 3000, rate: 97 },
      { balls: 6000, rate: 3 }
    ],
    ltContinueRate: 75,
    mode: 2
  },
  mononogatari: {
    name: "Pもののがたり",
    hitProb: 149.9,
    rushRate: 25.5,
    firstBonus: 300,
    upperPayouts: [
      { balls: 1500, rate: 50 },
      { balls: 3000, rate: 25 },
      { balls: 6000, rate: 25 }
    ],
    ltContinueRate: 73,
    mode: 2
  }
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
    setHitProb(p.hitProb);
    setRushRate(p.rushRate);
    setFirstBonus(p.firstBonus);
    setMode(p.mode);
    if (p.mode === 2) {
      setUpperPayouts([...p.upperPayouts]);
      setLtContinueRate(p.ltContinueRate);
      setLtEntryRate(100);
      setContinueRate(0);
      setPayouts([{ balls: 1500, rate: 100 }]);
    } else {
      setPayouts([...p.payouts]);
      setContinueRate(p.continueRate || 81);
      if (p.upperPayouts) setUpperPayouts([...p.upperPayouts]);
      if (p.ltContinueRate) setLtContinueRate(p.ltContinueRate);
      if (p.ltEntryRate) setLtEntryRate(p.ltEntryRate || 0);
    }
  };

  const addRow = (setter, list) => setter([...list, { balls: "", rate: "" }]);
  const removeRow = (setter, list, i) => setter(list.filter((_, idx) => idx !== i));
  const calcTotal = (list) => list.reduce((sum, p) => sum + Number(p.rate || 0), 0);

  const handleSimulate = () => {
    const totalRate = calcTotal(payouts);
    const totalUpperRate = calcTotal(upperPayouts);
    if (mode !== 2 && totalRate !== 100) { alert("通常RUSHの振り分けを100%にしてください"); return; }
    if (mode !== 0 && totalUpperRate !== 100) { alert("上位LTの振り分けを100%にしてください"); return; }
    const data = runSlumpSimulation({ 
      hitProb, rushRate, firstBonus, border, exchangeRate,
      continueRate: mode === 2 ? 0 : continueRate,
      ltEntryRate: mode === 0 ? 0 : (mode === 2 ? 100 : ltEntryRate),
      ltContinueRate: mode === 0 ? 0 : ltContinueRate,
      payouts, upperPayouts: mode === 0 ? [] : upperPayouts
    }, totalSpins);
    setResult(data);
  };

  const inputStyle = { width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "15px", boxSizing: "border-box" };
  const labelStyle = { display: "block", fontSize: "12px", fontWeight: "bold", color: "#555", marginBottom: "4px" };
  const cardStyle = { backgroundColor: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", height: "100%", boxSizing: "border-box" };
  const getBtnStyle = (active) => ({
    padding: "10px 15px", borderRadius: "20px", border: "none", cursor: "pointer", fontWeight: "bold", transition: "0.3s",
    background: active ? "#2c3e50" : "#eee", color: active ? "white" : "#666", flex: 1, fontSize: "11px"
  });

  return (
    <div style={{ padding: "15px", maxWidth: "1100px", margin: "0 auto", fontFamily: "sans-serif", backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <header style={{ textAlign: "center", marginBottom: "20px" }}>
        <h1 style={{ margin: 0, color: "#2c3e50", fontSize: "24px" }}>パチンコ収支シミュレーター</h1>
        <div style={{ marginTop: "15px", display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center" }}>
          <span style={{fontSize: "12px", width: "100%", color: "#888"}}>実在機種プリセットを適用:</span>
          {Object.keys(PRESETS).map(key => (
            <button key={key} onClick={() => applyPreset(key)} style={{padding: "6px 12px", borderRadius: "15px", border: "1px solid #ccc", background: "#fff", fontSize: "11px", cursor: "pointer"}}>
              {PRESETS[key].name}
            </button>
          ))}
        </div>
        <div style={{ marginTop: "20px", display: "flex", background: "#eee", padding: "5px", borderRadius: "30px", maxWidth: "600px", margin: "20px auto 0" }}>
          <button onClick={() => setMode(0)} style={getBtnStyle(mode === 0)}>通常RUSH</button>
          <button onClick={() => setMode(1)} style={getBtnStyle(mode === 1)}>RUSH+LT</button>
          <button onClick={() => setMode(2)} style={getBtnStyle(mode === 2)}>LT直行</button>
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 450px), 1fr))", gap: "15px", marginBottom: "20px" }}>
        {/* 左カラム：基本スペック */}
        <div style={cardStyle}>
          <h3 style={{ marginTop: 0, borderLeft: "4px solid #4CAF50", paddingLeft: "10px", fontSize: "16px", marginBottom: "15px" }}>基本スペック</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div style={{ gridColumn: "span 2" }}>
              <label style={labelStyle}>初当たり確率 (1/x)</label>
              <input type="number" value={hitProb} onChange={e => setHitProb(e.target.value)} style={inputStyle} />
            </div>
            <div style={{ gridColumn: "span 2" }}>
              <label style={{ ...labelStyle, color: "#e67e22" }}>初当たり出玉 (発)</label>
              <input type="number" value={firstBonus} onChange={e => setFirstBonus(e.target.value)} style={{ ...inputStyle, borderColor: "#e67e22" }} />
            </div>
            <div><label style={labelStyle}>RUSH突入率 (%)</label><input type="number" value={rushRate} onChange={e => setRushRate(e.target.value)} style={inputStyle} /></div>
            {mode !== 2 && (
              <div><label style={labelStyle}>通常RUSH継続 (%)</label><input type="number" value={continueRate} onChange={e => setContinueRate(e.target.value)} style={inputStyle} /></div>
            )}
            {mode !== 0 && (
              <div style={{ gridColumn: "span 2", padding: "12px", backgroundColor: "#fdfbff", border: "1px solid #9966FF", borderRadius: "10px" }}>
                <label style={{ ...labelStyle, color: "#9966FF" }}>上位RUSH (LT) 設定</label>
                <div style={{ display: "flex", gap: "10px" }}>
                  {mode === 1 && (
                    <div style={{ flex: 1 }}><label style={{ fontSize: "11px" }}>LT移行率 %</label><input type="number" value={ltEntryRate} onChange={e => setLtEntryRate(e.target.value)} style={{...inputStyle, borderColor: "#9966FF"}} /></div>
                  )}
                  <div style={{ flex: 1 }}><label style={{ fontSize: "11px" }}>上位継続 %</label><input type="number" value={ltContinueRate} onChange={e => setLtContinueRate(e.target.value)} style={{...inputStyle, borderColor: "#9966FF"}} /></div>
                </div>
              </div>
            )}
            <div><label style={labelStyle}>1k回転数</label><input type="number" value={border} onChange={e => setBorder(e.target.value)} style={inputStyle} /></div>
            <div><label style={labelStyle}>換金率 (円)</label><input type="number" step="0.1" value={exchangeRate} onChange={e => setExchangeRate(e.target.value)} style={inputStyle} /></div>
            <div style={{ gridColumn: "span 2" }}><label style={labelStyle}>総通常回転数</label><input type="number" value={totalSpins} onChange={e => setTotalSpins(e.target.value)} style={inputStyle} /></div>
          </div>
        </div>

        {/* 右カラム：振り分け設定 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {mode !== 2 && (
            <div style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <h3 style={{ margin: 0, borderLeft: "4px solid #2196F3", paddingLeft: "10px", fontSize: "16px" }}>通常RUSH 振り分け</h3>
                <span style={{ fontSize: "12px", fontWeight: "bold", color: calcTotal(payouts) === 100 ? "#28a745" : "#dc3545" }}>{calcTotal(payouts)}%</span>
              </div>
              <div style={{ maxHeight: "140px", overflowY: "auto" }}>
                {payouts.map((p, i) => (
                  <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                    <input type="number" value={p.balls} placeholder="玉" onChange={e => { const n = [...payouts]; n[i].balls = e.target.value; setPayouts(n) }} style={inputStyle} />
                    <input type="number" value={p.rate} placeholder="%" onChange={e => { const n = [...payouts]; n[i].rate = e.target.value; setPayouts(n) }} style={inputStyle} />
                    <button onClick={() => removeRow(setPayouts, payouts, i)} style={{ border: "none", background: "none", color: "#ff4d4d" }}>×</button>
                  </div>
                ))}
              </div>
              <button onClick={() => addRow(setPayouts, payouts)} style={{ width: "100%", padding: "6px", border: "1px dashed #2196F3", borderRadius: "6px", background: "#f0f7ff", color: "#2196F3", fontSize: "12px", cursor: "pointer", marginBottom: "10px" }}>＋ 追加</button>
              {/* 円グラフコンポーネントを復活 */}
              <PieDist dist={payouts} />
            </div>
          )}

          {mode !== 0 && (
            <div style={{ ...cardStyle, border: "2px solid #9966FF" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <h3 style={{ margin: 0, borderLeft: "4px solid #9966FF", paddingLeft: "10px", fontSize: "16px" }}>上位LT 振り分け</h3>
                <span style={{ fontSize: "12px", fontWeight: "bold", color: calcTotal(upperPayouts) === 100 ? "#28a745" : "#dc3545" }}>{calcTotal(upperPayouts)}%</span>
              </div>
              <div style={{ maxHeight: "140px", overflowY: "auto" }}>
                {upperPayouts.map((p, i) => (
                  <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                    <input type="number" value={p.balls} placeholder="玉" onChange={e => { const n = [...upperPayouts]; n[i].balls = e.target.value; setUpperPayouts(n) }} style={{...inputStyle, borderColor: "#9966FF"}} />
                    <input type="number" value={p.rate} placeholder="%" onChange={e => { const n = [...upperPayouts]; n[i].rate = e.target.value; setUpperPayouts(n) }} style={{...inputStyle, borderColor: "#9966FF"}} />
                    <button onClick={() => removeRow(setUpperPayouts, upperPayouts, i)} style={{ border: "none", background: "none", color: "#ff4d4d" }}>×</button>
                  </div>
                ))}
              </div>
              <button onClick={() => addRow(setUpperPayouts, upperPayouts)} style={{ width: "100%", padding: "6px", border: "1px dashed #9966FF", borderRadius: "6px", background: "#f9f6ff", color: "#9966FF", fontSize: "12px", cursor: "pointer", marginBottom: "10px" }}>＋ 追加</button>
              {/* 円グラフコンポーネントを復活 */}
              <PieDist dist={upperPayouts} />
            </div>
          )}
        </div>
      </div>

      <button onClick={handleSimulate} style={{ width: "100%", padding: "15px", fontSize: "18px", fontWeight: "bold", borderRadius: "50px", border: "none", backgroundColor: "#2c3e50", color: "white", cursor: "pointer", boxShadow: "0 4px 15px rgba(0,0,0,0.1)", marginBottom: "30px" }}>シミュレーションを実行</button>

      {/* 結果表示 */}
      {result && result.history && (
        <div style={{ backgroundColor: "#fff", padding: "15px", borderRadius: "16px", boxShadow: "0 10px 25px rgba(0,0,0,0.05)" }}>
          <h3 style={{ textAlign: "center", marginTop: 0, fontSize: "16px" }}>差玉収支スランプグラフ</h3>
          <ResultChart slumpData={result.history} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "10px", marginTop: "20px", borderTop: "1px solid #eee", paddingTop: "15px" }}>
             <div style={{textAlign:"center", background:"#f8f9fa", padding:"10px", borderRadius:"12px"}}><div style={{fontSize:"10px", color:"#7f8c8d"}}>初当たり</div><div style={{fontSize:"16px", fontWeight:"bold"}}>{result.stats.jackpotCounts}回</div></div>
             <div style={{textAlign:"center", background:"#f8f9fa", padding:"10px", borderRadius:"12px"}}><div style={{fontSize:"10px", color:"#7f8c8d"}}>最大連チャン</div><div style={{fontSize:"16px", fontWeight:"bold", color:"#e74c3c"}}>{result.stats.maxCombo}連</div></div>
             <div style={{textAlign:"center", background:"#f8f9fa", padding:"10px", borderRadius:"12px"}}><div style={{fontSize:"10px", color:"#7f8c8d"}}>最大獲得玉</div><div style={{fontSize:"16px", fontWeight:"bold", color:"#f39c12"}}>{result.stats.maxJackpotBalls.toLocaleString()}発</div></div>
             <div style={{textAlign:"center", background:"#f8f9fa", padding:"10px", borderRadius:"12px"}}><div style={{fontSize:"10px", color:"#7f8c8d"}}>平均連チャン</div><div style={{fontSize:"16px", fontWeight:"bold"}}>{result.stats.avgCombo}連</div></div>
             <div style={{textAlign:"center", background:"#f0f7ff", padding:"10px", borderRadius:"12px", border: "1px solid #3498db"}}><div style={{fontSize:"10px", color:"#3498db", fontWeight:"bold"}}>理論上の期待値</div><div style={{fontSize:"16px", fontWeight:"bold", color: result.stats.totalExpectedValue >= 0 ? "#3498db" : "#e74c3c"}}>{result.stats.totalExpectedValue.toLocaleString()}円</div></div>
             <div style={{textAlign:"center", background:"#f8f9fa", padding:"10px", borderRadius:"12px"}}><div style={{fontSize:"10px", color:"#7f8c8d"}}>実収支結果</div><div style={{fontSize:"16px", fontWeight:"bold", color: result.history[result.history.length-1].y >= 0 ? "#3498db" : "#e74c3c"}}>{result.history[result.history.length-1].y.toLocaleString()}円</div></div>
          </div>
        </div>
      )}
    </div>
  );
}