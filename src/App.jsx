
import { useState } from "react";
import { runSlumpSimulation } from "./simulator";
import ResultChart from "./ResultChart";
import PieDist from "./PieDist";

export default function App() {
  // --- モード設定 (0: 通常のみ, 1: 通常+LT, 2: LTのみ) ---
  const [mode, setMode] = useState(1); 

  // --- 基本スペック ---
  const [hitProb, setHitProb] = useState(319);
  const [rushRate, setRushRate] = useState(70);
  const [continueRate, setContinueRate] = useState(81);
  const [firstBonus, setFirstBonus] = useState(450);
  const [totalSpins, setTotalSpins] = useState(5000);
  const [border, setBorder] = useState(18);
  const [exchangeRate, setExchangeRate] = useState(4.0);
  
  // --- LT設定 ---
  const [ltEntryRate, setLtEntryRate] = useState(10);
  const [ltContinueRate, setLtContinueRate] = useState(90);

  // --- 振り分け設定 ---
  const [payouts, setPayouts] = useState([{ balls: 1500, rate: 100 }]);
  const [upperPayouts, setUpperPayouts] = useState([{ balls: 1500, rate: 100 }]);
  const [result, setResult] = useState(null);

  const addRow = (setter, list) => setter([...list, { balls: "", rate: "" }]);
  const removeRow = (setter, list, i) => setter(list.filter((_, idx) => idx !== i));
  const calcTotal = (list) => list.reduce((sum, p) => sum + Number(p.rate), 0);

  const totalRate = calcTotal(payouts);
  const totalUpperRate = calcTotal(upperPayouts);

  const handleSimulate = () => {
    // バリデーション
    if (mode !== 2 && totalRate !== 100) { alert("通常RUSHの振り分けを100%にしてください"); return; }
    if (mode !== 0 && totalUpperRate !== 100) { alert("上位LTの振り分けを100%にしてください"); return; }

    const data = runSlumpSimulation({ 
      hitProb, rushRate, firstBonus, border, exchangeRate,
      // モードによって継続率や移行率を調整してシミュレーターに渡す
      continueRate: mode === 2 ? 0 : continueRate, // LTのみモードなら通常RUSHは即終了（実質スキップ）
      ltEntryRate: mode === 0 ? 0 : (mode === 2 ? 100 : ltEntryRate), // モード0なら0%、モード2なら100%移行
      ltContinueRate: mode === 0 ? 0 : ltContinueRate,
      payouts,
      upperPayouts: mode === 0 ? [] : upperPayouts
    }, totalSpins);
    setResult(data);
  };

  // スタイル
  const inputStyle = { width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "15px", boxSizing: "border-box" };
  const labelStyle = { display: "block", fontSize: "12px", fontWeight: "bold", color: "#555", marginBottom: "4px" };
  const cardStyle = { backgroundColor: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", height: "100%", boxSizing: "border-box" };

  // モード選択ボタンのスタイル
  const getBtnStyle = (active) => ({
    padding: "10px 15px", borderRadius: "20px", border: "none", cursor: "pointer", fontWeight: "bold", transition: "0.3s",
    background: active ? "#2c3e50" : "#eee", color: active ? "white" : "#666", flex: 1, fontSize: "12px"
  });

  return (
    <div style={{ padding: "20px", maxWidth: "1100px", margin: "0 auto", fontFamily: "sans-serif", backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <header style={{ textAlign: "center", marginBottom: "30px" }}>
        <h1 style={{ margin: 0, color: "#2c3e50", fontSize: "28px" }}>パチンコ収支シミュレーター</h1>
        
        {/* 3モード切替スイッチ */}
        <div style={{ marginTop: "20px", display: "flex", background: "#eee", padding: "5px", borderRadius: "30px", maxWidth: "600px", margin: "20px auto 0" }}>
          <button onClick={() => setMode(0)} style={getBtnStyle(mode === 0)}>通常RUSHのみ</button>
          <button onClick={() => setMode(1)} style={getBtnStyle(mode === 1)}>通常RUSH + LT</button>
          <button onClick={() => setMode(2)} style={getBtnStyle(mode === 2)}>LT直行・LTのみ</button>
        </div>
        <p style={{fontSize: "13px", color: "#7f8c8d", marginTop: "10px"}}>
          {mode === 0 && "※上位RUSHのない王道スペック"}
          {mode === 1 && "※右打ち中の移行抽選で上位を目指すスペック"}
          {mode === 2 && "※突入＝上位RUSH確定のスペック"}
        </p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "20px", marginBottom: "30px" }}>
        
        {/* 左側：スペック設定 */}
        <div style={cardStyle}>
          <h3 style={{ marginTop: 0, borderLeft: "4px solid #4CAF50", paddingLeft: "10px", fontSize: "18px", marginBottom: "15px" }}>基本スペック</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
            <div style={{ gridColumn: "span 2" }}>
              <label style={labelStyle}>初当たり確率 (1/x)</label>
              <input type="number" value={hitProb} onChange={e => setHitProb(e.target.value)} style={inputStyle} />
            </div>
            <div style={{ gridColumn: "span 2" }}>
              <label style={{ ...labelStyle, color: "#e67e22" }}>初当たり出玉 (発)</label>
              <input type="number" value={firstBonus} onChange={e => setFirstBonus(e.target.value)} style={{ ...inputStyle, borderColor: "#e67e22" }} />
            </div>
            <div><label style={labelStyle}>RUSH突入率 (%)</label><input type="number" value={rushRate} onChange={e => setRushRate(e.target.value)} style={inputStyle} /></div>
            
            {/* モードが「LTのみ」以外なら表示 */}
            {mode !== 2 && (
              <div><label style={labelStyle}>通常RUSH継続 (%)</label><input type="number" value={continueRate} onChange={e => setContinueRate(e.target.value)} style={inputStyle} /></div>
            )}
            
            {/* LT関連の設定（モードが0以外の時に表示） */}
            {mode !== 0 && (
              <div style={{ gridColumn: "span 2", padding: "15px", backgroundColor: "#fdfbff", border: "1px solid #9966FF", borderRadius: "10px" }}>
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

        {/* 右側：振り分け設定 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* 通常RUSH振り分け（モード2以外で表示） */}
          {mode !== 2 && (
            <div style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                <h3 style={{ margin: 0, borderLeft: "4px solid #2196F3", paddingLeft: "10px", fontSize: "17px" }}>通常RUSH 振り分け</h3>
                <span style={{ fontSize: "14px", fontWeight: "bold", color: totalRate === 100 ? "#28a745" : "#dc3545" }}>合計: {totalRate}%</span>
              </div>
              {/* 入力欄とPieDistは以前と同じ... */}
              <div style={{ maxHeight: "160px", overflowY: "auto", paddingRight: "5px" }}>
                {payouts.map((p, i) => (
                  <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                    <input type="number" value={p.balls} placeholder="玉数" onChange={e => { const n = [...payouts]; n[i].balls = e.target.value; setPayouts(n) }} style={inputStyle} />
                    <input type="number" value={p.rate} placeholder="%" onChange={e => { const n = [...payouts]; n[i].rate = e.target.value; setPayouts(n) }} style={inputStyle} />
                    <button onClick={() => removeRow(setPayouts, payouts, i)} style={{ border: "none", background: "none", color: "#ff4d4d", cursor: "pointer" }}>×</button>
                  </div>
                ))}
              </div>
              <button onClick={() => addRow(setPayouts, payouts)} style={{ width: "100%", marginTop: "10px", padding: "8px", border: "1px dashed #2196F3", borderRadius: "6px", background: "#f0f7ff", color: "#2196F3", fontWeight: "bold", cursor: "pointer" }}>＋ 追加</button>
              <PieDist dist={payouts} />
            </div>
          )}

          {/* 上位LT振り分け（モード0以外で表示） */}
          {mode !== 0 && (
            <div style={{ ...cardStyle, border: "2px solid #9966FF" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                <h3 style={{ margin: 0, borderLeft: "4px solid #9966FF", paddingLeft: "10px", fontSize: "17px" }}>上位LT 振り分け</h3>
                <span style={{ fontSize: "14px", fontWeight: "bold", color: totalUpperRate === 100 ? "#28a745" : "#dc3545" }}>合計: {totalUpperRate}%</span>
              </div>
              {/* 入力欄とPieDist... */}
              <div style={{ maxHeight: "160px", overflowY: "auto", paddingRight: "5px" }}>
                {upperPayouts.map((p, i) => (
                  <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                    <input type="number" value={p.balls} placeholder="玉数" onChange={e => { const n = [...upperPayouts]; n[i].balls = e.target.value; setUpperPayouts(n) }} style={{...inputStyle, borderColor: "#9966FF"}} />
                    <input type="number" value={p.rate} placeholder="%" onChange={e => { const n = [...upperPayouts]; n[i].rate = e.target.value; setUpperPayouts(n) }} style={{...inputStyle, borderColor: "#9966FF"}} />
                    <button onClick={() => removeRow(setUpperPayouts, upperPayouts, i)} style={{ border: "none", background: "none", color: "#ff4d4d", cursor: "pointer" }}>×</button>
                  </div>
                ))}
              </div>
              <button onClick={() => addRow(setUpperPayouts, upperPayouts)} style={{ width: "100%", marginTop: "10px", padding: "8px", border: "1px dashed #9966FF", borderRadius: "6px", background: "#f9f6ff", color: "#9966FF", fontWeight: "bold", cursor: "pointer" }}>＋ 追加</button>
              <PieDist dist={upperPayouts} />
            </div>
          )}
        </div>
      </div>

      {/* シミュレーション実行ボタン */}
      <button onClick={handleSimulate} style={{ width: "100%", padding: "20px", fontSize: "22px", fontWeight: "bold", borderRadius: "50px", border: "none", backgroundColor: "#2c3e50", color: "white", cursor: "pointer", boxShadow: "0 6px 20px rgba(0,0,0,0.1)", marginBottom: "40px" }}>シミュレーションを実行</button>

      {/* --- 結果表示エリア（変更なし） --- */}
      {result && result.history && (
        <div style={{ backgroundColor: "#fff", padding: "25px", borderRadius: "16px", boxShadow: "0 15px 35px rgba(0,0,0,0.1)" }}>
          <h3 style={{ textAlign: "center", marginTop: 0 }}>差玉収支スランプグラフ</h3>
          <ResultChart slumpData={result.history} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "10px", marginTop: "30px", borderTop: "1px solid #eee", paddingTop: "20px" }}>
             <div style={{textAlign:"center", background:"#f8f9fa", padding:"15px", borderRadius:"12px"}}><div style={{fontSize:"11px", color:"#7f8c8d"}}>初当たり</div><div style={{fontSize:"18px", fontWeight:"bold"}}>{result.stats.jackpotCounts}回</div></div>
             <div style={{textAlign:"center", background:"#f8f9fa", padding:"15px", borderRadius:"12px"}}><div style={{fontSize:"11px", color:"#7f8c8d"}}>最大連チャン</div><div style={{fontSize:"18px", fontWeight:"bold", color:"#e74c3c"}}>{result.stats.maxCombo}連</div></div>
             <div style={{textAlign:"center", background:"#f8f9fa", padding:"15px", borderRadius:"12px"}}><div style={{fontSize:"11px", color:"#7f8c8d"}}>最大獲得玉</div><div style={{fontSize:"18px", fontWeight:"bold", color:"#f39c12"}}>{result.stats.maxJackpotBalls.toLocaleString()}発</div></div>
             <div style={{textAlign:"center", background:"#f8f9fa", padding:"15px", borderRadius:"12px"}}><div style={{fontSize:"11px", color:"#7f8c8d"}}>平均連チャン</div><div style={{fontSize:"18px", fontWeight:"bold"}}>{result.stats.avgCombo}連</div></div>
             <div style={{textAlign:"center", background:"#f8f9fa", padding:"15px", borderRadius:"12px"}}><div style={{fontSize:"11px", color:"#7f8c8d"}}>収支結果</div><div style={{fontSize:"18px", fontWeight:"bold", color: result.history[result.history.length-1].y >= 0 ? "#3498db" : "#e74c3c"}}>{result.history[result.history.length-1].y.toLocaleString()}円</div></div>
          </div>
        </div>
      )}
    </div>
  );
}