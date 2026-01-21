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

  // 画面幅監視（補助用）
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isSmall = windowWidth < 850;

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

  // スタイル定義
  const cardStyle = { backgroundColor: "#fff", padding: isSmall ? "15px" : "20px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", width: "100%", boxSizing: "border-box" };
  const inputStyle = { width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "16px", boxSizing: "border-box" };

  return (
    <div style={{ padding: isSmall ? "10px" : "20px", maxWidth: "1100px", margin: "0 auto", fontFamily: "sans-serif", backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      
      {/* 1. Header */}
      <header style={{ textAlign: "center", marginBottom: "20px" }}>
        <h1 style={{ margin: "0 0 15px 0", color: "#2c3e50", fontSize: isSmall ? "20px" : "26px" }}>パチンコ収支シミュレーター</h1>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", justifyContent: "center", marginBottom: "20px" }}>
          {Object.keys(PRESETS).map(key => (
            <button key={key} onClick={() => applyPreset(key)} style={{padding: "8px 14px", borderRadius: "20px", border: "1px solid #ccc", background: "#fff", fontSize: "12px", cursor: "pointer"}}>
              {PRESETS[key].name}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", background: "#eee", padding: "4px", borderRadius: "30px", maxWidth: "500px", margin: "0 auto" }}>
          <button onClick={() => setMode(0)} style={getModeBtnStyle(mode === 0)}>通常RUSH</button>
          <button onClick={() => setMode(1)} style={getModeBtnStyle(mode === 1)}>RUSH+LT</button>
          <button onClick={() => setMode(2)} style={getModeBtnStyle(mode === 2)}>LT直行</button>
        </div>
      </header>

      {/* 2. Main Layout (Flexboxを使用し、スマホ時は強制100%) */}
      <div style={{ 
        display: "flex", 
        flexDirection: isSmall ? "column" : "row", 
        gap: "20px", 
        marginBottom: "20px",
        alignItems: "flex-start"
      }}>
        
        {/* 左: 基本スペック */}
        <div style={{ ...cardStyle, flex: 1 }}>
          <h3 style={titleStyle("#4CAF50")}>基本スペック</h3>
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

        {/* 右: 振り分け */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", flex: 1, width: "100%" }}>
          {mode !== 2 && (
            <div style={cardStyle}>
              <h3 style={titleStyle("#2196F3")}>通常RUSH 振り分け</h3>
              <div style={{ marginBottom: "15px" }}>
                {payouts.map((p, i) => (
                  <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                    <input type="number" value={p.balls} placeholder="玉" onChange={e => { const n = [...payouts]; n[i].balls = e.target.value; setPayouts(n) }} style={inputStyle} />
                    <input type="number" value={p.rate} placeholder="%" onChange={e => { const n = [...payouts]; n[i].rate = e.target.value; setPayouts(n) }} style={inputStyle} />
                    <button onClick={() => removeRow(setPayouts, payouts, i)} style={{ color: "#ff4d4d", border: "none", background: "none", fontSize: "20px", cursor: "pointer" }}>×</button>
                  </div>
                ))}
              </div>
              <button onClick={() => addRow(setPayouts, payouts)} style={addBtnStyle("#2196F3", "#f0f7ff")}>＋ 追加</button>
              <PieDist dist={payouts} />
            </div>
          )}

          {mode !== 0 && (
            <div style={{ ...cardStyle, border: "2px solid #9966FF" }}>
              <h3 style={titleStyle("#9966FF")}>上位LT 振り分け</h3>
              <div style={{ marginBottom: "15px" }}>
                {upperPayouts.map((p, i) => (
                  <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                    <input type="number" value={p.balls} placeholder="玉" onChange={e => { const n = [...upperPayouts]; n[i].balls = e.target.value; setUpperPayouts(n) }} style={{...inputStyle, borderColor: "#9966FF"}} />
                    <input type="number" value={p.rate} placeholder="%" onChange={e => { const n = [...upperPayouts]; n[i].rate = e.target.value; setUpperPayouts(n) }} style={{...inputStyle, borderColor: "#9966FF"}} />
                    <button onClick={() => removeRow(setUpperPayouts, upperPayouts, i)} style={{ color: "#ff4d4d", border: "none", background: "none", fontSize: "20px", cursor: "pointer" }}>×</button>
                  </div>
                ))}
              </div>
              <button onClick={() => addRow(setUpperPayouts, upperPayouts)} style={addBtnStyle("#9966FF", "#f9f6ff")}>＋ 追加</button>
              <PieDist dist={upperPayouts} />
            </div>
          )}
        </div>
      </div>

      <button onClick={handleSimulate} style={{ width: "100%", padding: "20px", fontSize: "18px", fontWeight: "bold", borderRadius: "50px", border: "none", backgroundColor: "#2c3e50", color: "white", cursor: "pointer", marginBottom: "30px", boxShadow: "0 4px 15px rgba(0,0,0,0.2)" }}>シミュレーションを実行</button>

      {/* 3. Results */}
      {result && result.history && (
        <div style={{ backgroundColor: "#fff", padding: isSmall ? "15px" : "25px", borderRadius: "20px", boxShadow: "0 10px 30px rgba(0,0,0,0.08)" }}>
          <h3 style={{ textAlign: "center", marginTop: 0, color: "#34495e" }}>差玉収支スランプグラフ</h3>
          <ResultChart slumpData={result.history} />
          
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: isSmall ? "1fr 1fr" : "repeat(auto-fit, minmax(150px, 1fr))", 
            gap: "10px", 
            marginTop: "20px", 
            borderTop: "1px solid #eee", 
            paddingTop: "20px" 
          }}>
             <StatBox label="初当たり" value={`${result.stats.jackpotCounts}回`} />
             <StatBox label="最大連チャン" value={`${result.stats.maxCombo}連`} color="#e74c3c" />
             <StatBox label="最大獲得玉" value={`${Number(result.stats.maxJackpotBalls).toLocaleString()}発`} color="#f39c12" />
             <StatBox label="平均連チャン" value={`${result.stats.avgCombo}連`} />
             <StatBox label="理論期待値" value={`${result.stats.totalExpectedValue.toLocaleString()}円`} highlight color={result.stats.totalExpectedValue >= 0 ? "#3498db" : "#e74c3c"} />
             <StatBox label="実収支結果" value={`${result.history[result.history.length-1].y.toLocaleString()}円`} color={result.history[result.history.length-1].y >= 0 ? "#3498db" : "#e74c3c"} />
          </div>
        </div>
      )}
    </div>
  );
}

// 共通パーツ
const titleStyle = (color) => ({ marginTop: 0, borderLeft: `5px solid ${color}`, paddingLeft: "12px", fontSize: "17px", marginBottom: "20px", color: "#333" });
const labelStyle = { display: "block", fontSize: "12px", fontWeight: "bold", color: "#666", marginBottom: "4px" };
const getModeBtnStyle = (active) => ({ padding: "12px", borderRadius: "30px", border: "none", cursor: "pointer", fontWeight: "bold", flex: 1, fontSize: "13px", background: active ? "#2c3e50" : "transparent", color: active ? "white" : "#777", transition: "0.2s" });
const addBtnStyle = (color, bg) => ({ width: "100%", padding: "10px", border: `1px dashed ${color}`, background: bg, color: color, borderRadius: "10px", cursor: "pointer", fontWeight: "bold", marginBottom: "15px" });

function StatBox({ label, value, color = "#2c3e50", highlight = false }) {
  return (
    <div style={{ textAlign: "center", background: highlight ? "#f0f7ff" : "#fbfbfc", padding: "15px 5px", borderRadius: "15px", border: highlight ? "1px solid #3498db" : "1px solid #f0f0f0" }}>
      <div style={{ fontSize: "10px", color: "#95a5a6", marginBottom: "5px", letterSpacing: "0.05em" }}>{label}</div>
      <div style={{ fontSize: "16px", fontWeight: "bold", color: color }}>{value}</div>
    </div>
  );
}