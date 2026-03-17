import { useState, useRef, useEffect } from "react";

const MODELS = [
  { id: "claude-sonnet-4-20250514", label: "Claude Sonnet 4", provider: "Anthropic", color: "#D97706", tag: "New" },
  { id: "claude-opus-4-20250514",   label: "Claude Opus 4",   provider: "Anthropic", color: "#D97706", tag: "Powerful" },
  { id: "gpt-4o",                   label: "GPT-4o",          provider: "OpenAI",    color: "#10A37F", tag: null },
  { id: "gpt-4-turbo",              label: "GPT-4 Turbo",     provider: "OpenAI",    color: "#10A37F", tag: null },
  { id: "gemini-1.5-pro",           label: "Gemini 1.5 Pro",  provider: "Google",    color: "#4285F4", tag: null },
  { id: "mistral-large",            label: "Mistral Large",   provider: "Mistral",   color: "#FF6B35", tag: null },
  { id: "deepseek-coder",           label: "DeepSeek Coder",  provider: "DeepSeek",  color: "#A78BFA", tag: "Code" },
];

const LEADERBOARD = [
  { rank:1, model:"Claude Opus 4",    provider:"Anthropic", score:1312, wins:2841, losses:891,  winRate:76.1, change:+12 },
  { rank:2, model:"GPT-4o",           provider:"OpenAI",    score:1287, wins:2654, losses:1043, winRate:71.8, change:-3  },
  { rank:3, model:"Claude Sonnet 4",  provider:"Anthropic", score:1261, wins:2398, losses:1102, winRate:68.5, change:+8  },
  { rank:4, model:"Gemini 1.5 Pro",   provider:"Google",    score:1244, wins:2201, losses:1287, winRate:63.1, change:+1  },
  { rank:5, model:"GPT-4 Turbo",      provider:"OpenAI",    score:1228, wins:2089, losses:1341, winRate:60.9, change:-5  },
  { rank:6, model:"Mistral Large",    provider:"Mistral",   score:1198, wins:1876, losses:1589, winRate:54.2, change:+2  },
  { rank:7, model:"DeepSeek Coder",   provider:"DeepSeek",  score:1187, wins:1654, losses:1721, winRate:49.0, change:-4  },
  { rank:8, model:"Claude Haiku 3",   provider:"Anthropic", score:1162, wins:1432, losses:1901, winRate:43.0, change:0   },
];

const SUGGESTIONS = [
  "Explain quantum entanglement like I'm 10",
  "Write a recursive fibonacci in Rust",
  "What makes a great product manager?",
  "Compare REST vs GraphQL vs gRPC",
  "Draft a cold email for a B2B SaaS",
  "How does RLHF work in modern LLMs?",
];

async function callClaude(messages, model) {
  const validModel = model && model.startsWith("claude") ? model : "claude-sonnet-4-20250514";
  const res = await fetch("/api/anthropic/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": import.meta.env.VITE_ANTHROPIC_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: validModel,
      max_tokens: 1000,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    }),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data?.content?.[0]?.text || "No response received.";
}

function Badge({ provider, color }) {
  return (
    <span style={{ fontSize:"10px", fontWeight:600, letterSpacing:"0.05em", color, background:color+"15", padding:"2px 8px", borderRadius:"99px" }}>
      {provider}
    </span>
  );
}

function ModelPicker({ value, onChange, exclude }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  const selected = MODELS.find((m) => m.id === value);
  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);
  return (
    <div ref={ref} style={{ position:"relative" }}>
      <button onClick={() => setOpen(!open)} style={{ background:"#1A1A1A", border:"1px solid #2A2A2A", borderRadius:"10px", padding:"8px 14px", cursor:"pointer", display:"flex", alignItems:"center", gap:"8px", color:"#E8E8E8", fontSize:"13px", fontWeight:500, fontFamily:"inherit", minWidth:"186px" }}>
        <span style={{ width:8, height:8, borderRadius:"50%", background:selected?.color, flexShrink:0 }} />
        <span style={{ flex:1, textAlign:"left" }}>{selected?.label}</span>
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
          <path d={open?"M2 8L6 4L10 8":"M2 4L6 8L10 4"} stroke="#666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div style={{ position:"absolute", top:"calc(100% + 6px)", left:0, zIndex:100, background:"#1A1A1A", border:"1px solid #2A2A2A", borderRadius:"12px", padding:"6px", minWidth:"222px", boxShadow:"0 8px 32px rgba(0,0,0,0.5)" }}>
          {MODELS.filter((m) => m.id !== exclude).map((m) => (
            <button key={m.id} onClick={() => { onChange(m.id); setOpen(false); }} style={{ width:"100%", background:value===m.id?"#252525":"transparent", border:"none", borderRadius:"8px", padding:"9px 12px", cursor:"pointer", display:"flex", alignItems:"center", gap:"10px", color:"#E8E8E8", fontSize:"13px", fontFamily:"inherit", textAlign:"left" }}>
              <span style={{ width:7, height:7, borderRadius:"50%", background:m.color, flexShrink:0 }} />
              <span style={{ flex:1 }}>{m.label}</span>
              {m.tag && <span style={{ fontSize:"10px", color:m.color, background:m.color+"20", padding:"1px 6px", borderRadius:"4px" }}>{m.tag}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Bubble({ msg, color }) {
  const u = msg.role === "user";
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:u?"flex-end":"flex-start", marginBottom:"16px" }}>
      {!u && <div style={{ fontSize:"11px", color:"#555", marginBottom:"5px", paddingLeft:"4px" }}><span style={{ color }}>●</span> AI</div>}
      <div style={{ maxWidth:"85%", background:u?"#1E1E1E":"transparent", border:u?"1px solid #2A2A2A":"none", borderRadius:u?"16px 16px 4px 16px":"0", padding:u?"11px 16px":"0 4px", color:"#E0E0E0", fontSize:"14px", lineHeight:"1.65", whiteSpace:"pre-wrap", wordBreak:"break-word" }}>
        {msg.content}
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab]           = useState("chat");
  const [input, setInput]       = useState("");
  const [modelA, setModelA]     = useState("claude-sonnet-4-20250514");
  const [modelB, setModelB]     = useState("claude-opus-4-20250514");
  const [msgsA, setMsgsA]       = useState([]);
  const [msgsB, setMsgsB]       = useState([]);
  const [loadA, setLoadA]       = useState(false);
  const [loadB, setLoadB]       = useState(false);
  const [voted, setVoted]       = useState(null);
  const [showVote, setShowVote] = useState(false);
  const endA = useRef(), endB = useRef(), taRef = useRef();

  useEffect(() => { endA.current?.scrollIntoView({ behavior:"smooth" }); }, [msgsA]);
  useEffect(() => { endB.current?.scrollIntoView({ behavior:"smooth" }); }, [msgsB]);

  const mA = MODELS.find((m) => m.id === modelA) || MODELS[0];
  const mB = MODELS.find((m) => m.id === modelB) || MODELS[1];

  const clear = () => { setMsgsA([]); setMsgsB([]); setVoted(null); setShowVote(false); };

  const send = async () => {
    if (!input.trim() || loadA || loadB) return;
    const text = input.trim();
    setInput("");
    setVoted(null);
    setShowVote(false);

    if (tab === "chat") {
      const next = [...msgsA, { role:"user", content:text }];
      setMsgsA(next);
      setLoadA(true);
      try {
        const reply = await callClaude(next, modelA);
        setMsgsA([...next, { role:"assistant", content:reply }]);
      } catch(e) {
        setMsgsA([...next, { role:"assistant", content:"⚠️ "+e.message }]);
      }
      setLoadA(false);
    } else {
      const um = { role:"user", content:text };
      const nA = [...msgsA, um], nB = [...msgsB, um];
      setMsgsA(nA); setMsgsB(nB);
      setLoadA(true); setLoadB(true);
      Promise.all([callClaude(nA, modelA), callClaude(nB, modelB)]).then(([rA,rB]) => {
        setMsgsA(a => [...a, { role:"assistant", content:rA }]);
        setMsgsB(b => [...b, { role:"assistant", content:rB }]);
        setLoadA(false); setLoadB(false); setShowVote(true);
      }).catch(() => { setLoadA(false); setLoadB(false); });
    }
  };

  const onKey = (e) => { if (e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); send(); } };

  const Spinner = ({ color }) => (
    <div style={{ color:"#555", fontSize:"13px", display:"flex", gap:"6px", alignItems:"center", marginBottom:"16px" }}>
      <span style={{ color }}>●</span>
      <span style={{ animation:"pulse 1.2s infinite" }}>Generating…</span>
    </div>
  );

  return (
    <div style={{ height:"100vh", background:"#0E0E0E", color:"#E0E0E0", fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", display:"flex", flexDirection:"column", overflow:"hidden" }}>
      <style>{`*{box-sizing:border-box}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#333;border-radius:4px}textarea{resize:none}textarea::placeholder{color:#555}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>

      {/* NAV */}
      <nav style={{ height:"52px", borderBottom:"1px solid #1A1A1A", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 20px", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:"24px" }}>
          <div style={{ fontWeight:700, fontSize:"15px", letterSpacing:"-0.02em" }}>poly<span style={{ color:"#7C7CFF" }}>ai</span></div>
          <div style={{ display:"flex", gap:"2px" }}>
            {[{id:"chat",label:"Chat"},{id:"battle",label:"⚔️ Battle"},{id:"leaderboard",label:"Leaderboard"}].map(t => (
              <button key={t.id} onClick={() => { setTab(t.id); clear(); }} style={{ background:tab===t.id?"#1E1E1E":"transparent", border:"none", borderRadius:"8px", color:tab===t.id?"#E0E0E0":"#666", padding:"6px 14px", cursor:"pointer", fontSize:"13px", fontWeight:500, fontFamily:"inherit" }}>{t.label}</button>
            ))}
          </div>
        </div>
        <div style={{ display:"flex", gap:"8px", alignItems:"center" }}>
          <button onClick={clear} style={{ background:"transparent", border:"1px solid #2A2A2A", borderRadius:"8px", color:"#666", padding:"5px 12px", cursor:"pointer", fontSize:"12px", fontFamily:"inherit" }}>New chat</button>
          <div style={{ width:30, height:30, borderRadius:"50%", background:"linear-gradient(135deg,#7C7CFF,#A78BFA)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"12px", fontWeight:700, color:"#fff" }}>P</div>
        </div>
      </nav>

      {/* LEADERBOARD */}
      {tab==="leaderboard" && (
        <div style={{ flex:1, overflow:"auto", padding:"32px 24px" }}>
          <div style={{ maxWidth:"800px", margin:"0 auto" }}>
            <h1 style={{ margin:"0 0 6px", fontSize:"22px", fontWeight:700, letterSpacing:"-0.03em" }}>Model Leaderboard</h1>
            <p style={{ margin:"0 0 28px", color:"#555", fontSize:"13px" }}>Ranked by Elo score from head-to-head battles</p>
            <div style={{ background:"#131313", border:"1px solid #1E1E1E", borderRadius:"14px", overflow:"hidden" }}>
              <div style={{ display:"grid", gridTemplateColumns:"40px 1fr 90px 80px 80px 80px 70px", padding:"10px 20px", borderBottom:"1px solid #1E1E1E", fontSize:"11px", color:"#555", letterSpacing:"0.06em", textTransform:"uppercase" }}>
                <span>#</span><span>Model</span><span style={{textAlign:"right"}}>Elo</span><span style={{textAlign:"right"}}>Wins</span><span style={{textAlign:"right"}}>Losses</span><span style={{textAlign:"right"}}>Win%</span><span style={{textAlign:"right"}}>Δ</span>
              </div>
              {LEADERBOARD.map((row,i) => {
                const m = MODELS.find(m=>m.label===row.model);
                const c = m?.color||"#7C7CFF";
                return (
                  <div key={i} style={{ display:"grid", gridTemplateColumns:"40px 1fr 90px 80px 80px 80px 70px", padding:"14px 20px", borderBottom:i<LEADERBOARD.length-1?"1px solid #181818":"none", alignItems:"center" }} onMouseEnter={e=>e.currentTarget.style.background="#181818"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <span style={{ color:i<3?["#FFD700","#C0C0C0","#CD7F32"][i]:"#444", fontWeight:700, fontSize:"13px" }}>{i<3?["🥇","🥈","🥉"][i]:row.rank}</span>
                    <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                      <span style={{ width:8,height:8,borderRadius:"50%",background:c,flexShrink:0 }}/>
                      <div><div style={{ fontSize:"13px",fontWeight:500 }}>{row.model}</div><div style={{ fontSize:"11px",color:"#555",marginTop:"1px" }}>{row.provider}</div></div>
                    </div>
                    <span style={{ textAlign:"right",fontWeight:700,fontSize:"14px" }}>{row.score}</span>
                    <span style={{ textAlign:"right",fontSize:"13px",color:"#4CAF50" }}>{row.wins.toLocaleString()}</span>
                    <span style={{ textAlign:"right",fontSize:"13px",color:"#F44336" }}>{row.losses.toLocaleString()}</span>
                    <span style={{ textAlign:"right",fontSize:"13px",color:"#888" }}>{row.winRate}%</span>
                    <span style={{ textAlign:"right",fontSize:"12px",fontWeight:600,color:row.change>0?"#4CAF50":row.change<0?"#F44336":"#555" }}>{row.change>0?`+${row.change}`:row.change===0?"—":row.change}</span>
                  </div>
                );
              })}
            </div>
            <p style={{ textAlign:"center",fontSize:"11px",color:"#444",marginTop:"20px" }}>Updated daily · Based on 50,000+ battles</p>
          </div>
        </div>
      )}

      {/* CHAT / BATTLE */}
      {tab!=="leaderboard" && (
        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>

          {/* Model bar */}
          {tab==="battle" ? (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", borderBottom:"1px solid #1A1A1A", flexShrink:0 }}>
              {[[modelA,setModelA,modelB],[modelB,setModelB,modelA]].map(([mod,set,excl],i)=>{
                const m=MODELS.find(x=>x.id===mod)||MODELS[i];
                return (
                  <div key={i} style={{ padding:"12px 20px", display:"flex", alignItems:"center", gap:"12px", borderRight:i===0?"1px solid #1A1A1A":"none" }}>
                    <ModelPicker value={mod} onChange={set} exclude={excl}/>
                    <Badge provider={m.provider} color={m.color}/>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ padding:"12px 20px", borderBottom:"1px solid #1A1A1A", display:"flex", alignItems:"center", gap:"12px", flexShrink:0 }}>
              <ModelPicker value={modelA} onChange={setModelA}/>
              <Badge provider={mA.provider} color={mA.color}/>
            </div>
          )}

          {/* Messages */}
          <div style={{ flex:1, overflow:"hidden", display:"flex" }}>
            {tab==="chat" && (
              <div style={{ flex:1, overflowY:"auto", padding:"24px 0" }}>
                <div style={{ maxWidth:"680px", margin:"0 auto", padding:"0 20px" }}>
                  {msgsA.length===0 && (
                    <div style={{ textAlign:"center", paddingTop:"60px" }}>
                      <div style={{ fontSize:"32px", marginBottom:"10px" }}><span style={{ color:mA.color }}>●</span></div>
                      <h2 style={{ margin:"0 0 6px", fontSize:"20px", fontWeight:600, letterSpacing:"-0.02em" }}>How can I help you?</h2>
                      <p style={{ margin:"0 0 32px", color:"#555", fontSize:"13px" }}>Chatting with <strong style={{ color:"#E0E0E0" }}>{mA.label}</strong></p>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:"8px", justifyContent:"center" }}>
                        {SUGGESTIONS.map((s,i)=>(
                          <button key={i} onClick={()=>{setInput(s);taRef.current?.focus();}} style={{ background:"#151515", border:"1px solid #222", borderRadius:"10px", color:"#999", padding:"8px 14px", cursor:"pointer", fontSize:"12px", fontFamily:"inherit" }} onMouseEnter={e=>{e.target.style.borderColor="#333";e.target.style.color="#E0E0E0"}} onMouseLeave={e=>{e.target.style.borderColor="#222";e.target.style.color="#999"}}>{s}</button>
                        ))}
                      </div>
                    </div>
                  )}
                  {msgsA.map((m,i)=><Bubble key={i} msg={m} color={mA.color}/>)}
                  {loadA && <Spinner color={mA.color}/>}
                  <div ref={endA}/>
                </div>
              </div>
            )}

            {tab==="battle" && (
              <div style={{ flex:1, display:"grid", gridTemplateColumns:"1fr 1fr", overflow:"hidden" }}>
                {[[msgsA,loadA,modelA,endA,mA],[msgsB,loadB,modelB,endB,mB]].map(([msgs,loading,model,endRef,m],i)=>(
                  <div key={i} style={{ borderRight:i===0?"1px solid #1A1A1A":"none", overflow:"hidden", display:"flex", flexDirection:"column" }}>
                    <div style={{ flex:1, overflowY:"auto", padding:"20px" }}>
                      {msgs.length===0 && (
                        <div style={{ textAlign:"center", paddingTop:"40px", color:"#444" }}>
                          <div style={{ fontSize:"24px", marginBottom:"6px" }}><span style={{ color:m.color }}>●</span></div>
                          <div style={{ fontSize:"13px" }}>{m.label}</div>
                        </div>
                      )}
                      {msgs.map((msg,j)=><Bubble key={j} msg={msg} color={m.color}/>)}
                      {loading && <Spinner color={m.color}/>}
                      <div ref={endRef}/>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Vote bar */}
          {showVote && !voted && tab==="battle" && (
            <div style={{ padding:"14px 20px", borderTop:"1px solid #1A1A1A", background:"#111", display:"flex", alignItems:"center", justifyContent:"center", gap:"12px", flexShrink:0 }}>
              <span style={{ fontSize:"13px", color:"#888" }}>Which response was better?</span>
              {[{label:`👈 ${mA.label}`,w:"A",c:mA.color},{label:"🤝 Tie",w:"tie",c:"#666"},{label:`${mB.label} 👉`,w:"B",c:mB.color}].map(v=>(
                <button key={v.w} onClick={()=>setVoted(v.w)} style={{ background:"#1A1A1A", border:`1px solid ${v.c}40`, borderRadius:"8px", color:v.c, padding:"7px 16px", cursor:"pointer", fontSize:"12px", fontFamily:"inherit", fontWeight:500 }}>{v.label}</button>
              ))}
            </div>
          )}
          {voted && tab==="battle" && (
            <div style={{ padding:"12px 20px", borderTop:"1px solid #1A1A1A", background:"#111", textAlign:"center", fontSize:"13px", color:"#555", flexShrink:0 }}>
              ✓ Vote recorded — {voted==="A"?mA.label:voted==="B"?mB.label:"Tie"} won this round
            </div>
          )}

          {/* Input */}
          <div style={{ padding:"12px 20px 16px", background:"#0E0E0E", borderTop:"1px solid #1A1A1A", flexShrink:0 }}>
            <div style={{ maxWidth:tab==="battle"?"100%":"680px", margin:"0 auto" }}>
              <div style={{ background:"#151515", border:"1px solid #242424", borderRadius:"14px", display:"flex", alignItems:"flex-end", gap:"8px", padding:"10px 12px" }}>
                <textarea ref={taRef} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={onKey}
                  placeholder={tab==="battle"?"Ask both models a question…":`Message ${mA.label}…`}
                  rows={1}
                  style={{ flex:1, background:"transparent", border:"none", outline:"none", color:"#E0E0E0", fontSize:"14px", fontFamily:"inherit", lineHeight:"1.5", maxHeight:"120px", overflow:"auto" }}
                  onInput={e=>{e.target.style.height="auto";e.target.style.height=Math.min(e.target.scrollHeight,120)+"px";}}
                />
                <button onClick={send} disabled={!input.trim()||loadA} style={{ width:32, height:32, borderRadius:"8px", border:"none", background:input.trim()&&!loadA?"#7C7CFF":"#1E1E1E", color:input.trim()&&!loadA?"#fff":"#444", cursor:input.trim()&&!loadA?"pointer":"not-allowed", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all 0.12s" }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 12V2M7 2L3 6M7 2L11 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
              <div style={{ textAlign:"center", fontSize:"11px", color:"#383838", marginTop:"8px" }}>
                {tab==="battle"?"Responses from two models in parallel · Vote for the best":"Enter to send · Shift+Enter for new line"}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
