import { useState, useEffect, useRef, forwardRef, useImperativeHandle, createContext, useContext } from "react";

// Where the Messages API lives. A host that lets the app call Anthropic
// directly leaves __API_URL__ unset; a deployed build points it at our own
// serverless proxy so the API key never ships to the browser.
const apiUrl = () => (typeof window !== "undefined" && window.__API_URL__) || "https://api.anthropic.com/v1/messages";

const GAMES = [
  { id: "g1", opp: "Utah Tech", home: true, conf: false, date: "2026-09-05T18:00:00-06:00", tv: "ESPN+", tba: false, prob: 97, story: "Season opener under the lights in Provo against an in-state FCS foe. A tune-up to start the campaign on the right foot.", hype: 2, h2h: "1–0", h2hNote: "Lone meeting — BYU rolled 52–26 in 2022." },
  { id: "g2", opp: "Arizona", home: true, conf: true, date: "2026-09-12T13:30:00-06:00", tv: "FOX", tba: false, prob: 60, story: "Early Big 12 test on FOX. The Wildcats open conference play in Provo — first real measuring stick of the year.", hype: 3, h2h: "12–12–1", h2hNote: "Dead even all-time, dating back to 1936." },
  { id: "g3", opp: "Colorado State", home: false, conf: false, date: "2026-09-19T17:30:00-06:00", tv: "CBS", tba: false, prob: 70, story: "Road trip to Fort Collins on CBS. A tricky Mountain West opponent away from home before the bye.", hype: 3, h2h: "39–27–3", h2hNote: "Longtime rival — BYU owns the all-time series." },
  { id: "g4", opp: "TCU", home: false, conf: true, date: "2026-10-03T12:00:00-06:00", tv: "TBA", tba: true, prob: 50, story: "Conference road game in Fort Worth coming out of the bye week. The Horned Frogs are always dangerous at home.", hype: 4, h2h: "5–7", h2hNote: "Tight series; the Frogs hold a slight historical edge." },
  { id: "g5", opp: "Iowa State", home: true, conf: true, date: "2026-10-09T20:15:00-06:00", tv: "ESPN", tba: false, prob: 57, story: "Featured FRIDAY NIGHT primetime on ESPN in LaVell Edwards Stadium. Lights, crowd, national stage — circle it.", hype: 4, h2h: "1–5", h2hNote: "Cyclones lead historically — BYU won 41–27 in 2025." },
  { id: "g6", opp: "Notre Dame", home: true, conf: false, date: "2026-10-17T12:00:00-06:00", tv: "TBA", tba: true, prob: 37, story: "THE marquee home game of the decade. The Fighting Irish come to Provo for the first leg of a home-and-home. LaVell will be electric.", hype: 5, marquee: true, h2h: "2–7", h2hNote: "Irish lead the series; first meeting was back in 1992." },
  { id: "g7", opp: "UCF", home: false, conf: true, date: "2026-10-24T12:00:00-06:00", tv: "TBA", tba: true, prob: 60, story: "Conference road trip to Orlando. Long travel and a hostile dome environment to navigate.", hype: 3, h2h: "4–1", h2hNote: "BYU has controlled this matchup all-time." },
  { id: "g8", opp: "Arizona State", home: true, conf: true, date: "2026-10-31T12:00:00-06:00", tv: "TBA", tba: true, prob: 62, story: "Halloween home game against the Sun Devils. A Big 12 clash with seeding implications down the stretch.", hype: 4, h2h: "7–20", h2hNote: "Sun Devils hold a big edge — last met in 1998." },
  { id: "g9", opp: "Utah", home: false, conf: true, date: "2026-11-07T12:00:00-07:00", tv: "TBA", tba: true, prob: 44, story: "THE HOLY WAR. Now a Big 12 conference game in Salt Lake. Nothing else on the schedule matters quite like this one.", hype: 5, marquee: true, h2h: "34–60–4", h2hNote: "Utah leads the Holy War — but BYU has won the last three." },
  { id: "g10", opp: "Baylor", home: true, conf: true, date: "2026-11-14T12:00:00-07:00", tv: "TBA", tba: true, prob: 64, story: "Home Big 12 matchup against the Bears as the season heads toward the finish line.", hype: 3, h2h: "2–2", h2hNote: "Even series — BYU won a double-OT thriller in 2022." },
  { id: "g11", opp: "Kansas", home: false, conf: true, date: "2026-11-21T12:00:00-07:00", tv: "TBA", tba: true, prob: 55, story: "Late-season road game in Lawrence. Cold-weather conference football with positioning on the line.", hype: 3, h2h: "0–2", h2hNote: "Jayhawks have taken both meetings, incl. a 2024 upset." },
  { id: "g12", opp: "Cincinnati", home: true, conf: true, date: "2026-11-28T12:00:00-07:00", tv: "TBA", tba: true, prob: 66, story: "Regular season finale at home against the Bearcats. Send the seniors out right and lock in the bowl resume.", hype: 4, h2h: "3–0", h2hNote: "BYU is unbeaten against the Bearcats." },
];

const STATS = {
  record: "12–2", conf: "8–1 Big 12", ap: "No. 11", coaches: "No. 12",
  postseason: "Pop-Tarts Bowl champs (25–21 vs Georgia Tech) · Big 12 title game runner-up",
  offPPG: 31.4, offRank: 32, defPPG: 19.1, defRank: 19,
  bars: [
    { label: "Scoring Offense", val: 31.4, unit: "PPG", rank: 32, pct: 62 },
    { label: "Scoring Defense", val: 19.1, unit: "PPG allowed", rank: 19, pct: 78 },
    { label: "Available Yards", val: 24, unit: "nat'l rank", rank: 24, pct: 74, isRank: true },
  ],
  leaders: [
    { name: "Bear Bachmeier", pos: "QB (True FR)", line: "3,000+ pass yds · 3,500+ total", note: "Big 12 Offensive Freshman of the Year — only true frosh to lead a team to 12 wins." },
    { name: "LJ Martin", pos: "RB", line: "1,000+ rush yds", note: "Big 12 Offensive Player of the Year." },
  ],
  notes: [
    "One of just 12 Power 4 teams with both scoring offense AND defense in the top 35.",
    "12 wins — 5th time in school history (1980, 1984, 1996, 2001, 2025).",
    "Elite between the 20s (24th in available yards); red-zone finishing was the growth area.",
    "Kalani Sitake named Big 12 Coach of the Year.",
  ],
};

const OL = [[285,150],[285,180],[285,210],[285,240],[285,270]].map((p,i)=>({ id:"ol"+i, x:p[0], y:p[1], type:"ol" }));
const off = (pos,x,y,route,type="skill") => ({ id:pos, pos, x, y, route, type });
const DEF_GHOST = [[285,150],[285,180],[285,210],[285,240],[285,270],[250,210],[250,250]].map((p,i)=>({ id:"gh"+i, x:p[0], y:p[1], type:"ghost" }));
const dpl = (pos,x,y,route,type="dl") => ({ id:pos, pos, x, y, route, type });

const PLAYBOOK = {
  offense: {
    label: "Power Spread", coord: "OC Aaron Roderick",
    blurb: "BYU's identity under A-Rod: spread the field, lean on a physical zone run game, and marry runs to quick throws. Bear Bachmeier reads it out; LJ Martin makes it go.",
    plays: [
      { key: "rpo", name: "RPO Slant / Bubble", tag: "The staple", desc: "Inside-zone blocking up front with a slant and a bubble screen attached. Bachmeier reads the box: hand it off, throw the bubble, or fire the slant.",
        players: [...OL, off("QB",250,210,[[250,210],[268,212]]), off("RB",250,250,[[250,250],[300,235],[350,225]]), off("X",285,70,[[285,70],[330,105],[370,120]]), off("SL",285,110,[[285,110],[268,120],[250,135],[285,150]]), off("Z",285,330,[[285,330],[335,320]]), off("TE",285,300,[[285,300],[330,290]]) ] },
      { key: "pa", name: "Play-Action Shot", tag: "Take the top off", desc: "Fake the zone, boot the pocket, and take a deep swing to a big body like Kyler Kasper. Off the run game, this is where the explosives live.",
        players: [...OL, off("QB",250,210,[[250,210],[235,225],[215,225]]), off("RB",250,250,[[250,250],[285,235],[270,255]]), off("X",285,70,[[285,70],[350,58],[430,48],[510,44]]), off("SL",285,110,[[285,110],[350,150],[420,150]]), off("Z",285,330,[[285,330],[345,300],[400,260]]), off("TE",285,300,[[285,300],[330,285]]) ] },
      { key: "iz", name: "Inside Zone", tag: "LJ Martin downhill", desc: "The engine of the offense. Double-teams at the point of attack, Martin presses the hole and cuts off the block. Big 12 OPOY stuff.",
        players: [...OL, off("QB",250,210,[[250,210],[262,214]]), off("RB",250,250,[[250,250],[292,232],[345,220],[410,222],[470,215]]), off("X",285,70,[[285,70],[320,95]]), off("SL",285,110,[[285,110],[315,130]]), off("Z",285,330,[[285,330],[318,312]]), off("TE",285,300,[[285,300],[330,275],[360,255]]) ] },
      { key: "mesh", name: "Mesh", tag: "Beat man coverage", desc: "Two crossers rub underneath — the 'mesh' point — springing a receiver free. Easy completions and yards after catch for a young QB.",
        players: [...OL, off("QB",250,210,[[250,210],[258,212]]), off("RB",250,250,[[250,250],[290,262],[340,268]]), off("SL",285,110,[[285,110],[340,175],[420,185]]), off("TE",285,300,[[285,300],[340,225],[430,215]]), off("X",285,70,[[285,70],[350,60],[420,55]]), off("Z",285,330,[[285,330],[320,315],[300,340]]) ] },
      { key: "screen", name: "Tunnel Screen", tag: "Playmakers in space", desc: "Slow the rush, let a receiver settle behind a wall of releasing blockers. Get the ball to a playmaker like Tei Nacua and let him run.",
        players: [...OL, off("QB",250,210,[[250,210],[240,215]]), off("RB",250,250,[[250,250],[288,250]]), off("Z",285,330,[[285,330],[300,300],[335,270],[390,255]]), off("TE",285,300,[[285,300],[350,280]]), off("X",285,70,[[285,70],[340,95]]), off("SL",285,110,[[285,110],[360,150]]) ] },
    ],
  },
  defense: {
    label: "Multiple 4-3", coord: "DC Kelly Poppinga",
    blurb: "The 2025 defense (No. 19 in scoring) carried BYU. A multiple 4-3 that disguises coverage and manufactures pressure — Poppinga takes the reins in 2026 after Jay Hill's departure.",
    plays: [
      { key: "c3", name: "Base 4-3 Cover 3", tag: "Bend, don't break", desc: "Four-man rush, three deep zones, four underneath. The sound foundation of the defense — make you drive the length of the field.",
        players: [...DEF_GHOST, dpl("E",315,160,[[315,160],[295,168]]), dpl("T",315,195,[[315,195],[298,198]]), dpl("T",315,225,[[315,225],[298,225]]), dpl("E",315,260,[[315,260],[295,255]]), dpl("W",365,175,[[365,175],[380,150]],"lb"), dpl("M",365,215,[[365,215],[375,215]],"lb"), dpl("S",365,255,[[365,255],[380,275]],"lb"), dpl("CB",330,70,[[330,70],[400,70]],"db"), dpl("CB",330,330,[[330,330],[400,330]],"db"), dpl("FS",430,150,[[430,150],[470,120]],"db"), dpl("SS",430,290,[[430,290],[470,200]],"db") ] },
      { key: "fire", name: "Fire Zone Blitz", tag: "Manufactured pressure", desc: "Send a linebacker, drop an end into coverage. Simulated pressure to confuse the QB and generate the rush BYU sometimes lacked (only 20 sacks in '24).",
        players: [...DEF_GHOST, dpl("E",315,160,[[315,160],[295,150],[275,135]]), dpl("T",315,195,[[315,195],[296,196]]), dpl("T",315,225,[[315,225],[296,226]]), dpl("E",315,260,[[315,260],[350,250],[370,225]]), dpl("W",365,175,[[365,175],[320,190],[290,205]],"blitz"), dpl("M",365,215,[[365,215],[380,240]],"lb"), dpl("S",365,255,[[365,255],[385,255]],"lb"), dpl("CB",330,70,[[330,70],[360,90]],"db"), dpl("CB",330,330,[[330,330],[360,310]],"db"), dpl("FS",430,150,[[430,150],[455,175]],"db"), dpl("SS",430,290,[[430,290],[455,215]],"db") ] },
      { key: "nickel", name: "Nickel Cover 2", tag: "Passing downs", desc: "Bring a 5th DB and roll to two deep safeties. The obvious-pass package that leaned on ball-hawks like safety Faletau Satuala.",
        players: [...DEF_GHOST, dpl("E",315,160,[[315,160],[296,166]]), dpl("T",315,205,[[315,205],[298,206]]), dpl("T",315,245,[[315,245],[298,244]]), dpl("E",315,285,[[315,285],[296,280]]), dpl("M",365,215,[[365,215],[385,215]],"lb"), dpl("N",365,120,[[365,120],[395,140]],"db"), dpl("N",365,300,[[365,300],[395,280]],"db"), dpl("CB",330,70,[[330,70],[380,80]],"db"), dpl("CB",330,330,[[330,330],[380,320]],"db"), dpl("FS",430,150,[[430,150],[480,130]],"db"), dpl("SS",430,290,[[430,290],[480,310]],"db") ] },
      { key: "cover1", name: "Cover 1 Press + Edge", tag: "High risk, high reward", desc: "Tight man across the board, single-high safety, and an extra edge rusher looping in. Get home or get exposed — it's a gambler's call.",
        players: [...DEF_GHOST, dpl("E",315,160,[[315,160],[290,145],[272,150]]), dpl("T",315,200,[[315,200],[295,200]]), dpl("T",315,235,[[315,235],[295,235]]), dpl("E",315,275,[[315,275],[292,268]]), dpl("W",365,175,[[365,175],[330,160],[300,150]],"blitz"), dpl("M",365,215,[[365,215],[320,235],[292,245]],"blitz"), dpl("S",365,255,[[365,255],[350,300]],"db"), dpl("CB",330,70,[[330,70],[300,90]],"db"), dpl("CB",330,330,[[330,330],[300,310]],"db"), dpl("FS",430,170,[[430,170],[440,215]],"db") ] },
    ],
  },
};

const ROYAL = "#2A4FE0";
const CONFETTI_COLORS = ["#ffffff", "#2A4FE0", "#6E8BFF", "#dbe4ff", "#0a1130"];

const THEMES = {
  night: {
    text: "#ffffff", pageBg: "linear-gradient(180deg, #ffffff 0%, #dbe6ff 12%, #4568ea 40%, #2A4FE0 50%, #16215e 74%, #05060e 100%)",
    glow1: "rgba(120,150,255,0.55)", glow2: "rgba(60,90,220,0.4)", watermark: "#6E8BFF", watermarkOp: 0.07,
    glass: { background: "linear-gradient(155deg, rgba(46,64,150,0.5), rgba(6,10,26,0.72))", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", border: "1px solid rgba(255,255,255,0.15)", boxShadow: "0 12px 34px rgba(0,0,0,0.4)" },
    glassDeep: { background: "linear-gradient(155deg, rgba(26,38,110,0.82), rgba(4,6,16,0.85))", border: "1px solid rgba(255,255,255,0.14)", boxShadow: "0 12px 34px rgba(0,0,0,0.5)" },
    accent: { background: "linear-gradient(150deg,#ffffff,#e7eeff)", boxShadow: "0 12px 30px rgba(10,20,80,0.3)" }, accentText: ROYAL,
    idleBtn: "rgba(255,255,255,0.1)", idleBorder: "1px solid rgba(255,255,255,0.3)",
    input: { background: "rgba(255,255,255,0.14)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)" },
    inputFaint: { background: "rgba(255,255,255,0.07)", color: "#fff", border: "1px solid rgba(255,255,255,0.22)" },
    barTrack: "rgba(255,255,255,0.14)", barFill: "linear-gradient(90deg,#ffffff,#9fb4ff)", barText: ROYAL,
    oppActive: "linear-gradient(135deg,#2a3aa0,#141d5e)", leaderLine: "#bcc9ff", bullet: "#8ea6ff",
  },
  day: {
    text: "#0e1638", pageBg: "linear-gradient(180deg, #ffffff 0%, #eef3ff 28%, #c7d6ff 66%, #9fb6ff 100%)",
    glow1: "rgba(120,150,255,0.4)", glow2: "rgba(90,120,230,0.3)", watermark: "#2A4FE0", watermarkOp: 0.05,
    glass: { background: "rgba(255,255,255,0.72)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", border: "1px solid rgba(42,79,224,0.18)", boxShadow: "0 12px 30px rgba(20,40,120,0.14)" },
    glassDeep: { background: "linear-gradient(155deg, rgba(224,233,255,0.94), rgba(188,206,255,0.88))", border: "1px solid rgba(42,79,224,0.25)", boxShadow: "0 12px 30px rgba(20,40,120,0.18)" },
    accent: { background: "linear-gradient(150deg,#2f57e6,#1a2fb0)", boxShadow: "0 12px 28px rgba(26,47,176,0.35)" }, accentText: "#fff",
    idleBtn: "rgba(255,255,255,0.6)", idleBorder: "1px solid rgba(42,79,224,0.25)",
    input: { background: "rgba(20,40,120,0.06)", color: "#0e1638", border: "1px solid rgba(42,79,224,0.28)" },
    inputFaint: { background: "rgba(20,40,120,0.04)", color: "#0e1638", border: "1px solid rgba(42,79,224,0.18)" },
    barTrack: "rgba(20,40,120,0.12)", barFill: "linear-gradient(90deg,#3a63ff,#1a2fb0)", barText: "#fff",
    oppActive: "linear-gradient(135deg,#3a63ff,#1a2fb0)", leaderLine: "#1a2fb0", bullet: "#2a4fe0",
  },
};

let _ctx;
function playFanfare(kind, on) {
  if (!on) return;
  try {
    _ctx = _ctx || new (window.AudioContext || window.webkitAudioContext)(); const ctx = _ctx; if (ctx.state === "suspended") ctx.resume();
    const now = ctx.currentTime; const notes = kind === "big" ? [392, 523.25, 659.25, 783.99, 1046.5] : [392, 523.25, 659.25];
    notes.forEach((f, i) => { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = "triangle"; o.frequency.value = f; const t = now + i * 0.11; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.22, t + 0.02); g.gain.exponentialRampToValueAtTime(0.001, t + 0.38); o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + 0.42); });
  } catch (e) {}
}

const ConfettiLayer = forwardRef((props, ref) => {
  const canvasRef = useRef(null), parts = useRef([]), raf = useRef(null);
  useEffect(() => { const c = canvasRef.current; const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight; }; resize(); window.addEventListener("resize", resize); return () => window.removeEventListener("resize", resize); }, []);
  useImperativeHandle(ref, () => ({
    fire() { const c = canvasRef.current, W = c.width, H = c.height; [{ x: W * 0.15, y: H }, { x: W * 0.85, y: H }].forEach(cn => { for (let i = 0; i < 70; i++) { const ang = (-Math.PI / 2) + (Math.random() - 0.5) * 0.9, sp = 9 + Math.random() * 11; parts.current.push({ x: cn.x, y: cn.y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.4, size: 6 + Math.random() * 7, color: CONFETTI_COLORS[(Math.random() * CONFETTI_COLORS.length) | 0], life: 0, max: 120 + Math.random() * 40 }); } }); if (!raf.current) loop(); }
  }));
  const loop = () => {
    const c = canvasRef.current, ctx = c.getContext("2d"); ctx.clearRect(0, 0, c.width, c.height);
    parts.current = parts.current.filter(p => p.life < p.max && p.y < c.height + 40);
    parts.current.forEach(p => { p.life++; p.vy += 0.28; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.rot += p.vr; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.globalAlpha = Math.max(0, 1 - p.life / p.max); ctx.fillStyle = p.color; ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6); ctx.restore(); });
    if (parts.current.length) raf.current = requestAnimationFrame(loop); else { cancelAnimationFrame(raf.current); raf.current = null; ctx.clearRect(0, 0, c.width, c.height); }
  };
  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 60 }} />;
});

function OvalY({ stroke = ROYAL, style }) {
  return (
    <svg viewBox="0 0 100 112" style={style} aria-hidden="true">
      <ellipse cx="50" cy="56" rx="45" ry="51" fill="none" stroke={stroke} strokeWidth="6.5" />
      <text x="50" y="77" textAnchor="middle" fontSize="60" fontWeight="900" fontFamily="Georgia, 'Times New Roman', serif" fill={stroke}>Y</text>
    </svg>
  );
}

function useStorage(key, initial) {
  const [val, setVal] = useState(initial); const loaded = useRef(false);
  useEffect(() => { (async () => { try { const r = await window.storage.get(key); if (r && r.value) setVal(JSON.parse(r.value)); } catch (e) {} loaded.current = true; })(); }, [key]);
  useEffect(() => { if (!loaded.current) return; (async () => { try { await window.storage.set(key, JSON.stringify(val)); } catch (e) {} })(); }, [key, val]);
  return [val, setVal];
}

const fmtDate = iso => new Date(iso).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
const fmtTime = iso => new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
const Label = ({ children }) => <div className="text-xs font-black tracking-[0.2em]" style={{ opacity: 0.6 }}>{children}</div>;

function sliceAlong(pts, t) {
  if (!pts || pts.length < 2) return { head: pts ? pts[0] : [0, 0], trail: pts || [] };
  let total = 0; for (let i = 1; i < pts.length; i++) total += Math.hypot(pts[i][0] - pts[i-1][0], pts[i][1] - pts[i-1][1]);
  let target = total * t, acc = 0, trail = [pts[0]];
  for (let i = 1; i < pts.length; i++) { const seg = Math.hypot(pts[i][0] - pts[i-1][0], pts[i][1] - pts[i-1][1]); if (acc + seg >= target) { const r = seg ? (target - acc) / seg : 0; const x = pts[i-1][0] + (pts[i][0] - pts[i-1][0]) * r, y = pts[i-1][1] + (pts[i][1] - pts[i-1][1]) * r; trail.push([x, y]); return { head: [x, y], trail }; } acc += seg; trail.push(pts[i]); }
  return { head: pts[pts.length - 1], trail: pts.slice() };
}

function PlayField({ play, side, T }) {
  const [t, setT] = useState(1); const raf = useRef(null);
  const run = () => { cancelAnimationFrame(raf.current); const start = performance.now(), dur = 2200; const step = now => { const p = Math.min(1, (now - start) / dur); setT(p); if (p < 1) raf.current = requestAnimationFrame(step); }; raf.current = requestAnimationFrame(step); };
  useEffect(() => { run(); return () => cancelAnimationFrame(raf.current); }, [play.key]);
  const offense = side === "offense";
  const dotColor = tp => tp === "ghost" ? "#8aa0d8" : tp === "ol" ? "#c9d4f5" : (tp === "blitz" ? "#ff5b4d" : tp === "db" || tp === "lb" ? "#ff8a3d" : tp === "dl" ? "#ff5b4d" : "#fff");
  const isOff = tp => tp === "skill" || tp === "ol";
  return (
    <div>
      <svg viewBox="0 0 720 380" style={{ width: "100%", borderRadius: 20, display: "block", boxShadow: "0 14px 40px rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.12)" }}>
        <defs><linearGradient id="turf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#218a41" /><stop offset="1" stopColor="#12561f" /></linearGradient><filter id="pshadow" x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.5" /></filter></defs>
        <rect x="0" y="0" width="720" height="380" fill="url(#turf)" />
        {[0,1,2,3,4,5].map(i => <rect key={i} x={i*120} y="0" width="60" height="380" fill="#ffffff" opacity="0.04" />)}
        {[60,120,180,240,360,420,480,540,600,660].map(x => <line key={x} x1={x} y1="20" x2={x} y2="360" stroke="#ffffff" strokeOpacity="0.2" strokeWidth="2" />)}
        <line x1="300" y1="16" x2="300" y2="364" stroke="#dbe4ff" strokeOpacity="0.95" strokeWidth="3" strokeDasharray="2 6" />
        <text x="306" y="30" fill="#eaf0ff" fontSize="12" fontWeight="700" opacity="0.85">LOS</text>
        {play.players.filter(p => p.route && p.route.length > 1).map(p => { const { trail } = sliceAlong(p.route, t); const isBlitz = p.type === "blitz" || p.type === "dl"; return <polyline key={"r" + p.id} points={trail.map(q => q.join(",")).join(" ")} fill="none" stroke={offense ? "#ffe14d" : (isBlitz ? "#ff5b4d" : "#ffd0a3")} strokeWidth="3.5" strokeOpacity="0.95" strokeLinejoin="round" strokeLinecap="round" strokeDasharray={isBlitz ? "6 5" : "0"} />; })}
        {play.players.map(p => { const posv = p.route && p.route.length > 1 ? sliceAlong(p.route, t).head : [p.x, p.y]; const ghost = p.type === "ghost"; const square = p.type === "ol" || p.type === "ghost"; return (<g key={p.id} opacity={ghost ? 0.38 : 1} filter="url(#pshadow)">{square ? <rect x={posv[0] - 8} y={posv[1] - 8} width="16" height="16" rx="3" fill={dotColor(p.type)} stroke="#0d2b16" strokeWidth="1.5" /> : <circle cx={posv[0]} cy={posv[1]} r="10.5" fill={dotColor(p.type)} stroke="#0d2b16" strokeWidth="1.5" />}{p.pos && <text x={posv[0]} y={posv[1] + 4} textAnchor="middle" fontSize="10" fontWeight="800" fill={isOff(p.type) || p.type === "ol" ? "#1E3AB8" : "#3a1400"}>{p.pos}</text>}</g>); })}
      </svg>
      <button onClick={run} className="btn-lift mt-3 w-full py-3 rounded-full font-black text-sm" style={{ ...T.accent, color: T.accentText }}>▶ RUN PLAY</button>
    </div>
  );
}

function Playbook({ T }) {
  const [side, setSide] = useState("offense"); const [playKey, setPlayKey] = useState("rpo");
  const unit = PLAYBOOK[side]; const play = unit.plays.find(p => p.key === playKey) || unit.plays[0];
  const switchSide = s => { setSide(s); setPlayKey(PLAYBOOK[s].plays[0].key); };
  const tabStyle = on => on ? { ...T.accent, color: T.accentText } : { ...T.glass, color: T.text };
  return (
    <div className="py-2" style={{ color: T.text }}>
      <div className="flex gap-2 mb-3">{["offense", "defense"].map(s => <button key={s} onClick={() => switchSide(s)} className="btn-lift flex-1 py-3 rounded-2xl font-black text-sm" style={tabStyle(side === s)}>{s === "offense" ? "🏈 OFFENSE" : "🛡 DEFENSE"}</button>)}</div>
      <div className="rounded-3xl p-4 mb-3" style={T.glass}><div className="flex justify-between items-baseline"><div className="font-black text-lg">{unit.label}</div><div className="text-xs font-bold opacity-80">{unit.coord}</div></div><div className="text-xs opacity-85 mt-1 leading-relaxed">{unit.blurb}</div></div>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-1">{unit.plays.map(p => <button key={p.key} onClick={() => setPlayKey(p.key)} className="btn-lift px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap shrink-0" style={tabStyle(playKey === p.key)}>{p.name}</button>)}</div>
      <PlayField play={play} side={side} T={T} />
      <div className="rounded-3xl p-4 mt-3" style={T.glassDeep}><div className="flex items-center gap-2 mb-1 flex-wrap"><div className="font-black">{play.name}</div><span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(128,128,128,0.18)" }}>{play.tag}</span></div><div className="text-sm opacity-90 leading-relaxed">{play.desc}</div></div>
      <div className="text-xs opacity-50 mt-3 text-center">Concept diagrams for fun — generic schemes reflecting BYU's identity, not actual team play calls.</div>
    </div>
  );
}

function Analytics({ picks, T }) {
  const [sim] = useState(() => simulateSeasons(0, {}, 10000));
  const pGe = w => Math.round((sim.winDist.slice(w).reduce((a, b) => a + b, 0) / sim.n) * 100);
  const picked = GAMES.filter(g => picks[g.id]?.winner);
  const bold = picked.map(g => ({ g, side: picks[g.id].winner, p: picks[g.id].winner === "byu" ? g.prob : 100 - g.prob }));
  const upsets = bold.filter(b => b.p < 50);
  const avgConf = bold.length ? Math.round(bold.reduce((s, b) => s + b.p, 0) / bold.length) : null;
  const margins = GAMES.map(g => { const p = picks[g.id]; if (!p || p.byuScore === undefined || p.byuScore === "" || p.oppScore === undefined || p.oppScore === "") return null; return { g, m: Number(p.byuScore) - Number(p.oppScore) }; }).filter(Boolean);
  const maxM = Math.max(14, ...margins.map(x => Math.abs(x.m)));
  const W = 640, HT = 170;
  const px = i => 34 + i * ((W - 58) / (GAMES.length - 1));
  const py = p => 18 + (100 - p) * 1.28;
  return (
    <div className="py-2" style={{ color: T.text }}>
      <div className="rounded-3xl p-5 mb-3 text-center card-hover" style={{ ...T.accent, color: T.accentText }}><Label>2025 SEASON</Label><div className="text-5xl font-black my-1" style={{ letterSpacing: "-1px" }}>{STATS.record}</div><div className="text-xs font-black opacity-80">{STATS.conf} · AP {STATS.ap}</div><div className="text-xs opacity-70 mt-1">{STATS.postseason}</div></div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="rounded-3xl p-4 text-center card-hover" style={T.glass}><Label>OFFENSE</Label><div className="text-3xl font-black mt-1">{STATS.offPPG}</div><div className="text-xs opacity-75">PPG · No. {STATS.offRank}</div></div>
        <div className="rounded-3xl p-4 text-center card-hover" style={T.glass}><Label>DEFENSE</Label><div className="text-3xl font-black mt-1">{STATS.defPPG}</div><div className="text-xs opacity-75">PPG allowed · No. {STATS.defRank}</div></div>
      </div>
      <div className="rounded-3xl p-4 mb-3 text-center" style={T.glassDeep}><Label>SCORING MARGIN</Label><div className="text-3xl font-black mt-1">+{(STATS.offPPG - STATS.defPPG).toFixed(1)}</div><div className="text-xs opacity-75">points per game</div></div>
      <div className="mb-2"><Label>NATIONAL STANDING</Label></div>
      <div className="flex flex-col gap-2 mb-4">{STATS.bars.map(b => (<div key={b.label} className="flex items-center gap-3"><div className="text-xs font-bold w-32 shrink-0">{b.label}</div><div className="flex-1 h-7 rounded-full overflow-hidden" style={{ background: T.barTrack, boxShadow: "inset 0 1px 3px rgba(0,0,0,0.3)" }}><div className="h-full rounded-full flex items-center justify-end pr-2" style={{ width: `${b.pct}%`, background: T.barFill, boxShadow: "0 0 14px rgba(150,175,255,0.6)" }}><span className="text-xs font-black" style={{ color: T.barText }}>{b.isRank ? `#${b.val}` : `${b.val} ${b.unit}`}</span></div></div></div>))}</div>
      <div className="mb-2"><Label>STAT LEADERS</Label></div>
      <div className="flex flex-col gap-2 mb-4">{STATS.leaders.map(l => (<div key={l.name} className="rounded-2xl p-3 card-hover" style={T.glass}><div className="flex justify-between items-baseline"><div className="font-black">{l.name}</div><div className="text-xs font-bold opacity-75">{l.pos}</div></div><div className="text-sm font-bold mt-0.5" style={{ color: T.leaderLine }}>{l.line}</div><div className="text-xs opacity-80 mt-0.5">{l.note}</div></div>))}</div>
      <div className="mb-2"><Label>BY THE NUMBERS</Label></div>
      <div className="flex flex-col gap-2">{STATS.notes.map((n, i) => <div key={i} className="rounded-xl p-3 text-sm flex gap-2" style={T.glass}><span style={{ color: T.bullet }}>▸</span><span className="opacity-90">{n}</span></div>)}</div>

      <div className="mb-2 mt-5"><Label>DEEP ANALYTICS · 2026</Label></div>
      <div className="rounded-3xl p-4 mb-3" style={T.glassDeep}>
        <div className="text-xs font-black tracking-widest mb-1" style={{ color: T.leaderLine }}>SCHEDULE DIFFICULTY CURVE</div>
        <div className="text-xs opacity-65 mb-2">Preseason win probability, game by game — the valleys are the season.</div>
        <svg viewBox={`0 0 ${W} ${HT}`} style={{ width: "100%" }}>
          {[25, 50, 75].map(gl => (<g key={gl}>
            <line x1="30" x2={W - 22} y1={py(gl)} y2={py(gl)} stroke="currentColor" strokeOpacity="0.18" strokeDasharray="3 5" />
            <text x="2" y={py(gl) + 3} fontSize="10" fill="currentColor" opacity="0.5">{gl}%</text>
          </g>))}
          <polyline points={GAMES.map((g, i) => `${px(i)},${py(g.prob)}`).join(" ")} fill="none" stroke={T.leaderLine} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" opacity="0.9" />
          {GAMES.map((g, i) => (<g key={g.id}>
            <circle cx={px(i)} cy={py(g.prob)} r="4.5" fill={g.home ? T.leaderLine : "transparent"} stroke={T.leaderLine} strokeWidth="2" />
            {g.marquee && <text x={px(i)} y={py(g.prob) - 9} textAnchor="middle" fontSize="11" fill={T.leaderLine}>★</text>}
            <text x={px(i)} y={HT - 4} textAnchor="middle" fontSize="9" fontWeight="700" fill="currentColor" opacity="0.6">{g.opp.slice(0, 3).toUpperCase()}</text>
          </g>))}
        </svg>
        <div className="text-xs opacity-55 mt-1 text-center">● home · ○ road · ★ marquee — the Oct 17–Nov 7 gauntlet (ND, UCF, ASU, Utah) decides everything</div>
      </div>

      <div className="rounded-3xl p-4 mb-3" style={T.glass}>
        <div className="text-xs font-black tracking-widest mb-1" style={{ color: T.leaderLine }}>SEASON PATHS · 10,000 SIMS</div>
        <div className="text-xs opacity-65 mb-2">Chance of reaching each win total (cumulative, at the Vegas line).</div>
        <div className="flex flex-col gap-1.5">
          {[8, 9, 10, 11, 12].map(w => (
            <div key={w} className="flex items-center gap-2">
              <div className="text-xs font-black w-16 shrink-0">{w}+ wins</div>
              <div className="flex-1 h-5 rounded-full overflow-hidden" style={{ background: T.barTrack }}>
                <div className="h-full rounded-full flex items-center justify-end pr-2" style={{ width: `${Math.max(3, pGe(w))}%`, background: T.barFill }}><span className="text-[10px] font-black" style={{ color: T.barText }}>{pGe(w)}%</span></div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-xs opacity-55 mt-2 text-center">Tilt the odds yourself in the 🎲 Simulator — this panel uses the neutral line.</div>
      </div>

      <div className="rounded-3xl p-4 mb-3" style={T.glassDeep}>
        <div className="text-xs font-black tracking-widest mb-1" style={{ color: T.leaderLine }}>YOUR PICK'EM PROFILE</div>
        {!picked.length ? <div className="text-xs opacity-70">Make winner picks in the ✅ Pick'Em tab and this panel starts grading your style — boldness, upset calls, and predicted margins.</div> : (<>
          <div className="grid grid-cols-3 gap-2 mb-3 text-center">
            <div className="rounded-2xl p-2.5" style={T.glass}><div className="text-2xl font-black">{picked.length}</div><div className="text-[10px] font-black opacity-65">GAMES PICKED</div></div>
            <div className="rounded-2xl p-2.5" style={T.glass}><div className="text-2xl font-black">{upsets.length}</div><div className="text-[10px] font-black opacity-65">UPSET CALLS</div></div>
            <div className="rounded-2xl p-2.5" style={T.glass}><div className="text-2xl font-black">{avgConf}%</div><div className="text-[10px] font-black opacity-65">AVG WIN PROB OF PICKS</div></div>
          </div>
          <div className="text-xs opacity-80 mb-2">{avgConf >= 62 ? "You pick chalk — sensible, boring, probably right." : avgConf >= 50 ? "Balanced ballot — a little faith, a little math." : "Riding with the underdogs. Respect. The math is nervous."}{upsets.length > 0 && ` Boldest call: taking ${upsets.sort((a, b) => a.p - b.p)[0].side === "byu" ? "BYU" : upsets.sort((a, b) => a.p - b.p)[0].g.opp} at ${upsets.sort((a, b) => a.p - b.p)[0].p}%.`}</div>
        </>)}
        {margins.length > 0 && (<>
          <div className="text-xs font-black tracking-widest mb-1.5 mt-3" style={{ color: T.leaderLine }}>YOUR PREDICTED MARGINS</div>
          <div className="flex flex-col gap-1">
            {margins.map(({ g, m }) => (
              <div key={g.id} className="flex items-center gap-2">
                <div className="text-[10px] font-black w-9 shrink-0 opacity-70">{g.opp.slice(0, 3).toUpperCase()}</div>
                <div className="flex-1 flex items-center" style={{ height: 16 }}>
                  <div style={{ width: "50%", display: "flex", justifyContent: "flex-end" }}>{m < 0 && <div className="h-3.5 rounded-l-full" style={{ width: `${(Math.abs(m) / maxM) * 100}%`, background: T.oppActive }} />}</div>
                  <div style={{ width: 1, alignSelf: "stretch", background: "rgba(128,128,160,0.4)" }} />
                  <div style={{ width: "50%" }}>{m >= 0 && <div className="h-3.5 rounded-r-full" style={{ width: `${(Math.max(1, m) / maxM) * 100}%`, background: T.barFill }} />}</div>
                </div>
                <div className="text-[10px] font-black w-10 shrink-0 text-right" style={{ color: m >= 0 ? T.leaderLine : undefined, opacity: m >= 0 ? 1 : 0.7 }}>{m >= 0 ? `+${m}` : m}</div>
              </div>
            ))}
          </div>
          <div className="text-xs opacity-55 mt-1.5 text-center">BYU margin by your predicted scores — right of the line is a win</div>
        </>)}
      </div>

      <div className="text-xs opacity-50 mt-3 text-center">2025 season data from official BYU Athletics and reported figures. Deep analytics computed live from the schedule model, the simulator, and your own picks.</div>
    </div>
  );
}

const GD_DEMO = { status: "live", byu: 24, opp: 17, clock: "Q3 · 7:42", possession: "BYU", lastPlay: "Bachmeier hits Phillips down the seam for 23 — Cougars knocking on the door again." };
const GD_CACHE = { data: null, ts: 0, gameId: null };

function GameDay({ game, T, celebrate, demo }) {
  const fresh = !demo && GD_CACHE.data && GD_CACHE.gameId === game.id && Date.now() - GD_CACHE.ts < 120000;
  const [live, setLive] = useState(demo ? GD_DEMO : fresh ? GD_CACHE.data : null);
  const [ts, setTs] = useState(fresh ? GD_CACHE.ts : null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(false);
  const prevStatus = useRef(live?.status);
  const load = async () => {
    if (demo) return;
    setLoading(true); setErr(false);
    try {
      const res = await fetch(apiUrl(), {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-5", max_tokens: 3000, tools: [{ type: "web_search_20260209", name: "web_search" }], messages: [{ role: "user", content: `Search the web for the score of today's BYU football game ${game.home ? "vs" : "at"} ${game.opp} (${fmtDate(game.date)}). Respond with ONLY a JSON object (no prose, no markdown): {"status":"pre" or "live" or "final","byu":number,"opp":number,"clock":string (e.g. "Q3 7:42", "Halftime", "Final"),"possession":"BYU" or "${game.opp}" or "","lastPlay":string describing the most recent notable play}. If the game hasn't kicked off yet, use status "pre" with 0-0 and put the kickoff time in "clock".` }] }),
      });
      const data = await res.json();
      const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("\n");
      const m = text.match(/\{[\s\S]*\}/);
      let obj = null;
      if (m) { try { obj = JSON.parse(m[0]); } catch (e2) {} }
      if (obj && obj.status) { GD_CACHE.data = obj; GD_CACHE.ts = Date.now(); GD_CACHE.gameId = game.id; setLive(obj); setTs(GD_CACHE.ts); }
      else setErr(true);
    } catch (e) { setErr(true); }
    setLoading(false);
  };
  useEffect(() => { if (demo) return; if (!fresh) load(); const t = setInterval(load, 180000); return () => clearInterval(t); }, [game.id]);
  useEffect(() => { if (!demo && live?.status === "final" && Number(live.byu) > Number(live.opp) && prevStatus.current !== "final") celebrate("big"); prevStatus.current = live?.status; }, [live]);
  const pill = live?.status === "live" ? { txt: "🔴 LIVE", anim: true } : live?.status === "final" ? { txt: "FINAL" } : { txt: "PREGAME" };
  const stamp = ts ? new Date(ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : null;
  const Score = ({ label, val, hasBall }) => (
    <div className="text-center flex-1">
      <div className="text-xs font-black tracking-widest opacity-70">{hasBall && "🏈 "}{label}</div>
      <div className="font-black tabular-nums" style={{ fontSize: 56, lineHeight: 1.1 }}>{live ? val : "–"}</div>
    </div>
  );
  return (
    <div className="w-full max-w-md rounded-3xl p-5 mb-6" style={{ ...T.glassDeep, color: T.text }}>
      <div className="flex items-center justify-between mb-2">
        <span className={"text-xs font-black px-2.5 py-1 rounded-full" + (pill.anim ? " animate-pulse" : "")} style={live?.status === "live" ? { background: "#ff5b4d", color: "#fff" } : { ...T.accent, color: T.accentText }}>{pill.txt}</span>
        <div className="flex items-center gap-2">
          {stamp && <span className="text-xs opacity-55">upd {stamp}</span>}
          {!demo && <button onClick={load} disabled={loading} className="btn-lift rounded-full px-3 py-1 text-xs font-black" style={{ ...T.accent, color: T.accentText, opacity: loading ? 0.6 : 1 }}>{loading ? "…" : "Refresh"}</button>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Score label="BYU" val={live?.byu} hasBall={live?.possession === "BYU"} />
        <div className="text-2xl font-black opacity-40">–</div>
        <Score label={game.opp.toUpperCase()} val={live?.opp} hasBall={live && live.possession && live.possession !== "BYU"} />
      </div>
      <div className="text-center text-sm font-black mt-1" style={{ color: T.leaderLine }}>{live?.clock || (loading ? "Pulling the score…" : err ? "Couldn't reach the scoreboard — Refresh to retry" : "…")}</div>
      {live?.lastPlay && <div className="rounded-2xl p-3 mt-3 text-xs" style={{ ...T.glass }}><span className="font-black">LAST PLAY · </span><span className="opacity-90">{live.lastPlay}</span></div>}
      {demo && <div className="text-xs opacity-55 mt-2 text-center">Demo preview — Game Day Mode switches on automatically within 4 hours of kickoff and refreshes every 3 minutes.</div>}
    </div>
  );
}

function Countdown({ T, celebrate }) {
  const [now, setNow] = useState(Date.now()); const [target, setTarget] = useState("auto");
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  let game;
  if (target === "auto") game = GAMES.find(g => new Date(g.date).getTime() > now) || GAMES[GAMES.length - 1];
  else if (target === "nd") game = GAMES.find(g => g.opp === "Notre Dame"); else game = GAMES.find(g => g.opp === "Utah");
  const diff = Math.max(0, new Date(game.date).getTime() - now); const gameDay = diff > 0 && diff < 86400000;
  const kickMs = new Date(game.date).getTime() - now;
  const gameWindow = kickMs < 4 * 3600000 && kickMs > -5 * 3600000;
  const [gdPreview, setGdPreview] = useState(false);
  const units = [["DAYS", Math.floor(diff / 86400000)], ["HRS", Math.floor((diff % 86400000) / 3600000)], ["MIN", Math.floor((diff % 3600000) / 60000)], ["SEC", Math.floor((diff % 60000) / 1000)]];
  const Btn = ({ id, label }) => <button onClick={() => setTarget(id)} className="btn-lift px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide" style={target === id ? { ...T.accent, color: T.accentText } : { ...T.glass, color: T.text }}>{label}</button>;
  return (
    <div className="flex flex-col items-center py-6" style={{ color: T.text }}>
      {gameDay && <div className="mb-5 px-5 py-2 rounded-full font-black tracking-widest animate-pulse" style={{ ...T.accent, color: T.accentText }}>🏈 GAME DAY IS HERE</div>}
      {(gameWindow || gdPreview) && <GameDay game={game} T={T} celebrate={celebrate} demo={!gameWindow} />}
      <div className="flex gap-2 mb-8 flex-wrap justify-center"><Btn id="auto" label="NEXT GAME" /><Btn id="nd" label="☘ NOTRE DAME" /><Btn id="utah" label="⚔ HOLY WAR" /></div>
      <div className="text-xs font-black tracking-[0.3em] opacity-70 mb-2">COUNTDOWN TO</div>
      <div className="text-3xl sm:text-4xl font-black mb-1 text-center px-4">{game.home ? "vs" : "at"} {game.opp.toUpperCase()}</div>
      <div className="text-sm opacity-80 mb-9">{fmtDate(game.date)}{!game.tba && ` · ${fmtTime(game.date)} MT · ${game.tv}`}{game.tba && " · Time TBA"}</div>
      <div className="flex gap-3 sm:gap-5">{units.map(([label, v]) => (<div key={label} className="flex flex-col items-center"><div className="digit flex items-center justify-center font-black tabular-nums" style={{ ...T.accent, color: T.accentText, width: 76, height: 90, fontSize: 42, borderRadius: 20 }}>{String(v).padStart(2, "0")}</div><div className="text-xs font-black tracking-widest mt-2.5 opacity-90">{label}</div></div>))}</div>
      <div className="mt-11 w-full max-w-md rounded-3xl p-5 card-hover" style={T.glass}><div className="flex justify-between items-center mb-1"><Label>UP NEXT</Label><div className="text-xs font-black opacity-80">All-time: {game.h2h}</div></div><div className="font-black text-lg">{game.home ? "vs" : "at"} {game.opp}</div><div className="text-sm opacity-80 mt-1 leading-relaxed">{game.story}</div></div>
      {!gameWindow && <button onClick={() => setGdPreview(v => !v)} className="mt-6 text-xs font-bold" style={{ opacity: 0.45, color: T.text }}>👀 {gdPreview ? "Hide" : "Preview"} Game Day Mode</button>}
    </div>
  );
}

function Schedule({ T }) {
  const [flipped, setFlipped] = useState({});
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2" style={{ color: T.text }}>
      {GAMES.map(g => (
        <div key={g.id} className="flip-wrap" style={{ height: 172 }} onClick={() => setFlipped(f => ({ ...f, [g.id]: !f[g.id] }))}>
          <div className={"flip-inner" + (flipped[g.id] ? " flipped" : "")}>
            <div className="flip-face rounded-3xl p-4 flex flex-col justify-between cursor-pointer overflow-hidden" style={g.marquee ? { ...T.accent, color: T.accentText, boxShadow: "0 0 30px rgba(150,175,255,0.5), 0 12px 30px rgba(10,20,80,0.3)" } : { ...T.glass, color: T.text }}>
              {g.marquee && <div className="shine" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />}
              <div className="flex justify-between items-start relative"><div className="text-xs font-black tracking-widest" style={{ opacity: 0.7 }}>{fmtDate(g.date)}</div><div className="flex gap-1 items-center">{g.marquee && <span className="text-xs font-black">★</span>}<span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: g.marquee ? "rgba(42,79,224,0.85)" : "rgba(128,128,128,0.22)", color: "#fff" }}>{g.home ? "HOME" : "AWAY"}</span></div></div>
              <div className="relative"><div className="text-xs font-bold opacity-70">{g.home ? "vs" : "at"}</div><div className="text-2xl font-black leading-tight">{g.opp}</div><div className="text-xs font-black mt-1" style={{ opacity: 0.75 }}>BYU all-time: {g.h2h}</div></div>
              <div className="flex justify-between items-center text-xs relative"><span className="font-black">{g.conf ? "BIG 12" : "NON-CONF"}</span><span style={{ opacity: 0.65 }}>tap for hype →</span></div>
            </div>
            <div className="flip-face flip-back rounded-3xl p-4 flex flex-col justify-between cursor-pointer" style={{ ...T.glassDeep, color: T.text }}>
              <div><div className="font-black text-sm mb-1">{g.home ? "vs" : "at"} {g.opp}</div><div className="text-xs leading-snug opacity-90">{g.story}</div></div>
              <div className="rounded-xl p-2 text-xs" style={{ background: "rgba(128,128,128,0.14)" }}><span className="font-black">Series {g.h2h}</span><span className="opacity-85"> · {g.h2hNote}</span></div>
              <div><Label>HYPE RATING</Label><div className="text-lg tracking-widest mt-0.5">{"🔥".repeat(g.hype)}{"·".repeat(5 - g.hype)}</div></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function PickEm({ picks, setPicks, actuals, setActuals, celebrate, T }) {
  const setPick = (id, field, value) => { if (field === "winner" && value === "byu" && picks[id]?.winner !== "byu") celebrate("small"); setPicks(p => ({ ...p, [id]: { ...p[id], [field]: value } })); };
  const setActual = (id, field, value) => setActuals(a => ({ ...a, [id]: { ...a[id], [field]: value } }));
  const wins = GAMES.filter(g => picks[g.id]?.winner === "byu").length, losses = GAMES.filter(g => picks[g.id]?.winner === "opp").length;
  const results = GAMES.map(g => { const a = actuals[g.id], p = picks[g.id]; const has = a && a.byu !== undefined && a.byu !== "" && a.opp !== undefined && a.opp !== "" && p && p.winner; if (!has) return null; const aw = Number(a.byu) > Number(a.opp) ? "byu" : "opp"; return { correct: p.winner === aw, conf: p.conf || 1 }; }).filter(Boolean);
  const gradedN = results.length, correctN = results.filter(r => r.correct).length, pts = results.filter(r => r.correct).reduce((s, r) => s + r.conf, 0), acc = gradedN ? Math.round((correctN / gradedN) * 100) : 0;
  let streak = 0; for (let i = results.length - 1; i >= 0; i--) { if (results[i].correct) streak++; else break; }
  const starIdle = { background: T.idleBtn, color: T.text, border: T.idleBorder };
  return (
    <div className="py-2" style={{ color: T.text }}>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="rounded-3xl p-4 text-center" style={{ ...T.accent, color: T.accentText }}><Label>PREDICTED</Label><div className="text-4xl font-black">{wins}–{losses}</div><div className="text-xs opacity-70">{12 - wins - losses} left to pick</div></div>
        <div className="rounded-3xl p-4 text-center" style={T.glassDeep}><Label>REPORT CARD</Label>{gradedN ? (<><div className="text-4xl font-black">{acc}%</div><div className="text-xs opacity-80">{correctN}/{gradedN} right · {pts} pts{streak > 1 ? ` · 🔥${streak}` : ""}</div></>) : (<><div className="text-2xl font-black mt-2">—</div><div className="text-xs opacity-70">log finals below</div></>)}</div>
      </div>
      <div className="flex flex-col gap-3">
        {GAMES.map(g => {
          const p = picks[g.id] || {}, a = actuals[g.id] || {};
          const graded = a.byu !== undefined && a.byu !== "" && a.opp !== undefined && a.opp !== "" && p.winner;
          const aw = graded ? (Number(a.byu) > Number(a.opp) ? "byu" : "opp") : null, correct = graded ? p.winner === aw : null;
          return (
            <div key={g.id} className="rounded-3xl p-3.5" style={graded && correct ? { ...T.glass, boxShadow: "0 0 20px rgba(120,150,255,0.4)" } : T.glass}>
              <div className="flex justify-between items-center mb-2"><div className="font-black">{g.home ? "vs" : "at"} {g.opp} {g.marquee && "★"}</div>{graded ? <span className="text-xs font-black px-2 py-0.5 rounded-full" style={{ ...T.accent, color: T.accentText }}>{correct ? "✓ NAILED IT" : "✗ MISS"}</span> : <div className="text-xs opacity-70">{fmtDate(g.date)}</div>}</div>
              <div className="flex gap-2 mb-2">
                <button onClick={() => setPick(g.id, "winner", "byu")} className="btn-lift flex-1 py-2 rounded-xl text-sm font-black" style={p.winner === "byu" ? { ...T.accent, color: T.accentText } : starIdle}>BYU WINS</button>
                <button onClick={() => setPick(g.id, "winner", "opp")} className="btn-lift flex-1 py-2 rounded-xl text-sm font-black" style={p.winner === "opp" ? { background: T.oppActive, color: "#fff" } : starIdle}>{g.opp.toUpperCase()}</button>
              </div>
              <div className="flex items-center gap-2 text-xs mb-1">
                <span className="opacity-70 font-bold w-12">PREDICT</span>
                <input type="number" placeholder="BYU" value={p.byuScore ?? ""} onChange={e => setPick(g.id, "byuScore", e.target.value)} className="w-14 px-2 py-1 rounded-lg text-center" style={T.input} />
                <span className="opacity-70">–</span>
                <input type="number" placeholder={g.opp.slice(0, 3)} value={p.oppScore ?? ""} onChange={e => setPick(g.id, "oppScore", e.target.value)} className="w-14 px-2 py-1 rounded-lg text-center" style={T.input} />
                <div className="flex-1 flex justify-end gap-1">{[1, 2, 3].map(c => <button key={c} onClick={() => setPick(g.id, "conf", c)} title="confidence" className="w-7 h-7 rounded-full text-xs font-bold" style={(p.conf >= c) ? { ...T.accent, color: T.accentText } : starIdle}>★</button>)}</div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="opacity-70 font-bold w-12">FINAL</span>
                <input type="number" placeholder="BYU" value={a.byu ?? ""} onChange={e => setActual(g.id, "byu", e.target.value)} className="w-14 px-2 py-1 rounded-lg text-center" style={T.inputFaint} />
                <span className="opacity-70">–</span>
                <input type="number" placeholder={g.opp.slice(0, 3)} value={a.opp ?? ""} onChange={e => setActual(g.id, "opp", e.target.value)} className="w-14 px-2 py-1 rounded-lg text-center" style={T.inputFaint} />
                <span className="flex-1 text-right opacity-55">actual score</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Dashboard({ picks, T }) {
  const projWin = g => picks[g.id]?.winner ? picks[g.id].winner === "byu" : g.prob >= 50;
  const wins = GAMES.filter(projWin).length, losses = 12 - wins, confWins = GAMES.filter(g => g.conf).filter(projWin).length;
  let tier, tierMsg;
  if (confWins >= 8) { tier = "CHAMPIONSHIP FAVORITE"; tierMsg = "Arlington is calling. This is a special team."; }
  else if (confWins >= 7) { tier = "CONTENDER"; tierMsg = "Right in the thick of the Big 12 title race."; }
  else if (confWins >= 5) { tier = "BOWL BOUND"; tierMsg = "Solid season, quality bowl on the horizon."; }
  else { tier = "BUILDING"; tierMsg = "Growing pains, but the future is bright in Provo."; }
  return (
    <div className="py-2" style={{ color: T.text }}>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-3xl p-4 text-center" style={{ ...T.accent, color: T.accentText }}><Label>PROJECTED</Label><div className="text-3xl font-black">{wins}–{losses}</div><div className="text-xs opacity-70">overall</div></div>
        <div className="rounded-3xl p-4 text-center card-hover" style={T.glass}><Label>BIG 12</Label><div className="text-3xl font-black">{confWins}–{9 - confWins}</div><div className="text-xs opacity-70">conference</div></div>
      </div>
      <div className="rounded-3xl p-5 mb-4 text-center" style={T.glassDeep}><Label>ROAD TO ARLINGTON</Label><div className="text-2xl font-black mb-1 mt-1">{tier}</div><div className="text-xs opacity-85 mb-3">{tierMsg}</div><div className="h-3 rounded-full overflow-hidden" style={{ background: T.barTrack }}><div className="h-full rounded-full transition-all" style={{ width: `${(confWins / 9) * 100}%`, background: T.barFill, boxShadow: "0 0 14px rgba(150,175,255,0.7)" }} /></div><div className="text-xs opacity-70 mt-1">{confWins} of 9 Big 12 wins projected</div></div>
      <div className="mb-2"><Label>PRESEASON WIN PROBABILITY</Label></div>
      <div className="flex flex-col gap-2">{GAMES.map(g => (<div key={g.id} className="flex items-center gap-3"><div className="text-xs font-bold w-28 shrink-0">{g.home ? "vs" : "at"} {g.opp}{g.marquee ? " ★" : ""}</div><div className="flex-1 h-6 rounded-full overflow-hidden" style={{ background: T.barTrack, boxShadow: "inset 0 1px 3px rgba(0,0,0,0.3)" }}><div className="h-full rounded-full flex items-center justify-end pr-2" style={{ width: `${g.prob}%`, background: T.barFill, boxShadow: "0 0 12px rgba(150,175,255,0.5)" }}><span className="text-xs font-black" style={{ color: T.barText }}>{g.prob}%</span></div></div></div>))}</div>
      <div className="text-xs opacity-55 mt-3 text-center">Preseason estimates for fun — your Pick'Em picks drive the projected record above.</div>
    </div>
  );
}

function simulateSeasons(delta, locks, n) {
  const clamp = p => Math.min(0.97, Math.max(0.03, p));
  const logit = p => Math.log(p / (1 - p));
  const sig = x => 1 / (1 + Math.exp(-x));
  const probs = GAMES.map(g => {
    if (locks[g.id] === "byu") return 1;
    if (locks[g.id] === "opp") return 0;
    return sig(logit(clamp(g.prob / 100)) + delta);
  });
  // The other 15 Big 12 teams come straight from the Big 12 Race projections,
  // regressed toward .500 (projections always run hot) — so the Simulator and
  // the Race tab tell one story.
  const SHRINK = 0.7;
  const rivals = BIG12_RACE.filter(t => !t.you).map(t => 0.5 + (t.w / 9 - 0.5) * SHRINK);
  const winDist = new Array(13).fill(0);
  let titleGame = 0, titleWin = 0, cfp = 0, confSum = 0, unbeaten = 0;
  const swing = GAMES.map(() => ({ wC: 0, wN: 0, lC: 0, lN: 0 }));
  for (let s = 0; s < n; s++) {
    let w = 0, cw = 0; const res = [];
    for (let i = 0; i < GAMES.length; i++) { const win = Math.random() < probs[i]; res.push(win); if (win) { w++; if (GAMES[i].conf) cw++; } }
    winDist[w]++; if (w === 12) unbeaten++;
    confSum += cw;
    // Play out every rival's 9-game conference slate; top two records reach Arlington
    // (random jitter breaks ties, standing in for tiebreakers).
    const byuScore = cw + Math.random() * 0.9;
    let above = 0, bestW = 0;
    for (let r = 0; r < rivals.length; r++) {
      let tw = 0;
      for (let k = 0; k < 9; k++) if (Math.random() < rivals[r]) tw++;
      if (tw + Math.random() * 0.9 > byuScore) above++;
      if (tw > bestW) bestW = tw;
    }
    const inTG = above < 2; if (inTG) titleGame++;
    // Title game itself: win odds scale with how BYU's record stacks up vs the best rival
    const wonTitle = inTG && Math.random() < 1 / (1 + Math.exp(-(cw - bestW) * 0.35));
    if (wonTitle) titleWin++;
    let made = wonTitle;
    if (!made) { const al = w >= 12 ? 0.96 : w === 11 ? 0.85 : w === 10 ? 0.45 : w === 9 ? 0.08 : 0.004; made = Math.random() < al; }
    if (made) cfp++;
    for (let i = 0; i < res.length; i++) { const t = swing[i]; if (res[i]) { t.wN++; if (made) t.wC++; } else { t.lN++; if (made) t.lC++; } }
  }
  let acc = 0, median = 0;
  for (let i = 0; i <= 12; i++) { acc += winDist[i]; if (acc >= n / 2) { median = i; break; } }
  const mode = winDist.indexOf(Math.max(...winDist));
  const swings = GAMES.map((g, i) => { const t = swing[i]; const d = (t.wN ? t.wC / t.wN : 0) - (t.lN ? t.lC / t.lN : 0); return { g, d }; })
    .filter(x => !locks[x.g.id] && x.d > 0).sort((a, b) => b.d - a.d).slice(0, 3);
  return { n, winDist, median, mode, avgConf: confSum / n, titleGame: titleGame / n, titleWin: titleWin / n, cfp: cfp / n, unbeaten: unbeaten / n, swings };
}

function SeasonSimulator({ picks, celebrate, T }) {
  const [delta, setDelta] = useStorage("byu26_sim_delta", 0);
  const [useLocks, setUseLocks] = useStorage("byu26_sim_locks", false);
  const [result, setResult] = useState(null);
  const locks = useLocks ? Object.fromEntries(GAMES.filter(g => picks[g.id]?.winner).map(g => [g.id, picks[g.id].winner])) : {};
  const lockCount = Object.keys(locks).length;
  const run = () => { const r = simulateSeasons(Number(delta) || 0, locks, 10000); setResult(r); return r; };
  useEffect(() => { run(); }, [delta, useLocks]);
  const bigRun = () => { const r = run(); if (r.median >= 11) celebrate("small"); };
  const d = Number(delta) || 0;
  const vibe = d <= -0.8 ? "Full Doomer" : d < -0.2 ? "Skeptic" : d <= 0.2 ? "The Vegas line" : d < 0.8 ? "Believer" : "Full Homer";
  const pc = x => (x > 0 && x * 100 < 1 ? "<1" : Math.round(x * 100)) + "%";
  if (!result) return null;
  const maxD = Math.max(...result.winDist, 1);
  return (
    <div className="py-2" style={{ color: T.text }}>
      <div className="rounded-3xl p-5 mb-3 text-center card-hover" style={{ ...T.accent, color: T.accentText }}>
        <Label>10,000 SIMULATED SEASONS</Label>
        <div className="text-5xl font-black my-1" style={{ letterSpacing: "-1px" }}>{result.median}–{12 - result.median}</div>
        <div className="text-xs font-black opacity-80">median record · avg {result.avgConf.toFixed(1)} Big 12 wins</div>
      </div>
      <div className="rounded-3xl p-4 mb-3" style={T.glass}>
        <div className="flex justify-between items-baseline mb-1"><Label>HOW GOOD IS THIS TEAM?</Label><span className="text-xs font-black" style={{ color: T.leaderLine }}>{vibe}</span></div>
        <input type="range" min="-1.2" max="1.2" step="0.1" value={d} onChange={e => setDelta(Number(e.target.value))} style={{ width: "100%", accentColor: ROYAL }} />
        <div className="flex justify-between text-xs opacity-60 font-bold"><span>Doomer</span><span>Vegas</span><span>Homer</span></div>
        <div className="flex gap-2 mt-3">
          <button onClick={() => setUseLocks(v => !v)} className="btn-lift flex-1 py-2 rounded-xl text-xs font-black" style={useLocks ? { ...T.accent, color: T.accentText } : { background: T.idleBtn, color: T.text, border: T.idleBorder }}>{useLocks ? "🔒" : "🔓"} PICK'EM LOCKS {useLocks ? `ON (${lockCount})` : "OFF"}</button>
          <button onClick={bigRun} className="btn-lift flex-1 py-2 rounded-xl text-xs font-black" style={{ ...T.accent, color: T.accentText }}>🎲 RE-SIM</button>
        </div>
        {useLocks && !lockCount && <div className="text-xs opacity-65 mt-2">No winners picked yet — make calls in the Pick'Em tab and they'll be locked in here.</div>}
      </div>
      <div className="mb-2"><Label>WIN TOTAL DISTRIBUTION</Label></div>
      <div className="rounded-3xl p-4 mb-3" style={T.glassDeep}>
        <div className="flex items-end gap-1" style={{ height: 130 }}>
          {result.winDist.map((c, w) => (
            <div key={w} className="flex-1 flex flex-col items-center justify-end h-full">
              {c / result.n >= 0.03 && <div className="text-[10px] font-black opacity-75 mb-0.5">{Math.round((c / result.n) * 100)}%</div>}
              <div className="w-full rounded-t-md" style={{ height: Math.max(c > 0 ? 2 : 0, (c / maxD) * 92), background: w === result.mode ? T.barFill : T.barTrack, boxShadow: w === result.mode ? "0 0 14px rgba(150,175,255,0.7)" : "none" }} />
            </div>
          ))}
        </div>
        <div className="flex gap-1 mt-1">{result.winDist.map((c, w) => <div key={w} className="flex-1 text-center text-[10px] font-black" style={{ opacity: w === result.mode ? 1 : 0.55 }}>{w}</div>)}</div>
        <div className="text-xs opacity-60 mt-1 text-center">wins per season · most common: {result.mode}–{12 - result.mode}</div>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="rounded-3xl p-4 text-center card-hover" style={T.glass}><Label>BIG 12 TITLE GAME</Label><div className="text-3xl font-black mt-1">{pc(result.titleGame)}</div><div className="text-xs opacity-70">reach Arlington</div></div>
        <div className="rounded-3xl p-4 text-center card-hover" style={T.glass}><Label>WIN THE BIG 12</Label><div className="text-3xl font-black mt-1">{pc(result.titleWin)}</div><div className="text-xs opacity-70">cut the nets… er, confetti</div></div>
        <div className="rounded-3xl p-4 text-center card-hover" style={T.glass}><Label>MAKE THE CFP</Label><div className="text-3xl font-black mt-1">{pc(result.cfp)}</div><div className="text-xs opacity-70">playoff berth</div></div>
        <div className="rounded-3xl p-4 text-center card-hover" style={T.glass}><Label>PERFECT 12–0</Label><div className="text-3xl font-black mt-1">{pc(result.unbeaten)}</div><div className="text-xs opacity-70">run the table</div></div>
      </div>
      {result.swings.length > 0 && (<>
        <div className="mb-2"><Label>SEASON SWING GAMES</Label></div>
        <div className="flex flex-col gap-2 mb-2">
          {result.swings.map(({ g, d: sw }) => (
            <div key={g.id} className="rounded-2xl p-3 flex items-center gap-3 card-hover" style={T.glass}>
              <div className="rounded-lg px-2 py-1 text-xs font-black shrink-0" style={{ ...T.accent, color: T.accentText }}>{g.home ? "vs" : "at"}</div>
              <div className="flex-1 min-w-0"><div className="font-black">{g.opp}{g.marquee ? " ★" : ""}</div><div className="text-xs opacity-70">{fmtDate(g.date)}</div></div>
              <div className="text-right shrink-0"><div className="font-black" style={{ color: T.leaderLine }}>+{Math.round(sw * 100)}%</div><div className="text-[10px] opacity-65">CFP swing</div></div>
            </div>
          ))}
        </div>
      </>)}
      <div className="text-xs opacity-50 mt-2 text-center">A toy model for fun — BYU's games use the preseason win probabilities, and the other 15 Big 12 teams are simulated from the Big 12 Race projections (regressed toward .500), so this tab and the Race tab tell one story. Not gambling advice. Rise and Shout responsibly.</div>
    </div>
  );
}

const BIG12_RACE = [
  { rk: 1, team: "BYU", w: 8, l: 1, you: true, note: "12–2 core returns — the hunted, not the hunter" },
  { rk: 2, team: "Texas Tech", w: 7, l: 2, note: "Beat BYU in Arlington in '25 — the rematch everyone wants" },
  { rk: 3, team: "Utah", w: 7, l: 2, sched: "A", note: "Holy War in SLC · Nov 7" },
  { rk: 4, team: "Arizona State", w: 6, l: 3, sched: "H", note: "Halloween in Provo · Oct 31" },
  { rk: 5, team: "TCU", w: 6, l: 3, sched: "A", note: "Trip to Fort Worth · Oct 3" },
  { rk: 6, team: "Iowa State", w: 5, l: 4, sched: "H", note: "Friday night in LaVell · Oct 9" },
  { rk: 7, team: "Kansas State", w: 5, l: 4 },
  { rk: 8, team: "Baylor", w: 5, l: 4, sched: "H", note: "Provo · Nov 14" },
  { rk: 9, team: "Arizona", w: 4, l: 5, sched: "H", note: "Big 12 opener · Sept 12" },
  { rk: 10, team: "Houston", w: 4, l: 5 },
  { rk: 11, team: "Cincinnati", w: 4, l: 5, sched: "H", note: "Finale in Provo · Nov 28" },
  { rk: 12, team: "Kansas", w: 3, l: 6, sched: "A", note: "Lawrence · Nov 21" },
  { rk: 13, team: "Colorado", w: 3, l: 6 },
  { rk: 14, team: "UCF", w: 3, l: 6, sched: "A", note: "Orlando · Oct 24" },
  { rk: 15, team: "West Virginia", w: 2, l: 7 },
  { rk: 16, team: "Oklahoma State", w: 1, l: 8 },
];

const B12_CACHE = { data: null, ts: 0 };

function Big12Race({ T }) {
  const fresh = B12_CACHE.data && Date.now() - B12_CACHE.ts < 300000;
  const [live, setLive] = useState(fresh ? B12_CACHE.data : null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(false);
  const load = async () => {
    setLoading(true); setErr(false);
    try {
      const res = await fetch(apiUrl(), {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-5", max_tokens: 3000, tools: [{ type: "web_search_20260209", name: "web_search" }], messages: [{ role: "user", content: `Search the web for the current 2026 Big 12 Conference football standings. Respond with ONLY a JSON array (no prose, no markdown) of {"team": string, "conf": string, "overall": string} for all 16 teams in standings order. If the 2026 season hasn't started and there are no standings yet, return [].` }] }),
      });
      const data = await res.json();
      const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("\n");
      let items = [];
      const m = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (m) { try { items = JSON.parse(m[0]); } catch (e2) {} }
      items = Array.isArray(items) ? items.slice(0, 16) : [];
      B12_CACHE.data = items; B12_CACHE.ts = Date.now();
      setLive(items);
    } catch (e) { setErr(true); }
    setLoading(false);
  };
  const contenders = BIG12_RACE.filter(t => t.sched && t.rk <= 6);
  return (
    <div className="py-2" style={{ color: T.text }}>
      <div className="rounded-3xl p-5 mb-3 text-center relative overflow-hidden card-hover" style={{ ...T.accent, color: T.accentText }}>
        <div className="shine" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
        <Label>RACE TO ARLINGTON</Label>
        <div className="text-2xl font-black my-1">BIG 12 CHAMPIONSHIP</div>
        <div className="text-xs font-black opacity-80">Dec 5, 2026 · AT&T Stadium · top two records meet</div>
      </div>
      <div className="mb-2"><Label>PROJECTED PECKING ORDER</Label></div>
      <div className="rounded-3xl p-4 mb-3" style={T.glassDeep}>
        <div className="flex flex-col gap-1.5">
          {BIG12_RACE.map(t => (
            <div key={t.team} className="flex items-center gap-2">
              <div className="text-xs font-black w-6 shrink-0 opacity-60">{t.rk}</div>
              <div className="text-xs font-black w-28 shrink-0 truncate" style={t.you ? { color: T.leaderLine } : {}}>{t.team}{t.you ? " ◂" : ""}</div>
              <div className="flex-1 h-5 rounded-full overflow-hidden" style={{ background: T.barTrack }}>
                <div className="h-full rounded-full flex items-center justify-end pr-2" style={{ width: `${Math.max(10, (t.w / 9) * 100)}%`, background: t.you ? T.barFill : T.barTrack, boxShadow: t.you ? "0 0 14px rgba(150,175,255,0.7)" : "inset 0 0 0 1px rgba(128,128,160,0.25)" }}>
                  <span className="text-[10px] font-black" style={{ color: t.you ? T.barText : T.text, opacity: t.you ? 1 : 0.75 }}>{t.w}–{t.l}</span>
                </div>
              </div>
              <div className="w-7 shrink-0 text-center">{t.sched && <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full" style={{ background: "rgba(128,128,160,0.2)" }}>{t.sched}</span>}</div>
            </div>
          ))}
        </div>
        <div className="text-xs opacity-55 mt-2 text-center">H/A = on BYU's schedule · projected conference records, for fun</div>
      </div>
      <div className="mb-2"><Label>THE PATH</Label></div>
      <div className="rounded-3xl p-4 mb-2" style={T.glass}>
        <div className="text-sm font-black mb-2">Four games decide it</div>
        <div className="flex flex-col gap-2 mb-3">
          {contenders.map(t => (
            <div key={t.team} className="flex items-center gap-3 rounded-2xl p-2.5" style={T.glassDeep}>
              <div className="rounded-lg px-2 py-1 text-xs font-black shrink-0" style={{ ...T.accent, color: T.accentText }}>{t.sched === "H" ? "vs" : "at"}</div>
              <div className="flex-1"><div className="font-black text-sm">{t.team}</div><div className="text-xs opacity-70">{t.note}</div></div>
              <div className="text-xs font-black opacity-60 shrink-0">#{t.rk} proj.</div>
            </div>
          ))}
        </div>
        <div className="text-xs opacity-85 leading-relaxed">Split these four and BYU likely needs help. Win three and Provo controls its own road back to Arlington — head-to-head is the first tiebreaker, so every one of these doubles as a tiebreaker chip. Texas Tech isn't on the slate; if both keep winning, the rematch happens in December.</div>
      </div>
      <div className="flex items-center justify-between mb-2 mt-4">
        <Label>LIVE STANDINGS</Label>
        <button onClick={load} disabled={loading} className="btn-lift rounded-full px-3 py-1.5 text-xs font-black" style={{ ...T.accent, color: T.accentText, opacity: loading ? 0.6 : 1 }}>{loading ? "Loading…" : live ? "Refresh" : "Check now"}</button>
      </div>
      {err && <div className="text-xs opacity-70 mb-2">Couldn't load standings — try again in a moment.</div>}
      {live && !live.length && !loading && <div className="rounded-2xl p-3 text-xs opacity-75 mb-2" style={T.glass}>No standings yet — the 2026 season hasn't kicked off. This lights up in September.</div>}
      {live && live.length > 0 && (
        <div className="rounded-3xl p-4 mb-2" style={T.glassDeep}>
          <div className="flex text-[10px] font-black opacity-55 mb-1"><span className="w-6" /><span className="flex-1">TEAM</span><span className="w-12 text-center">CONF</span><span className="w-12 text-center">OVR</span></div>
          <div className="flex flex-col gap-1">
            {live.map((t, i) => {
              const isByu = /byu|brigham/i.test(String(t.team));
              return (
                <div key={i} className="flex items-center text-sm rounded-lg px-1 py-0.5" style={isByu ? { background: "rgba(120,150,255,0.16)" } : {}}>
                  <span className="w-6 text-xs font-black opacity-60">{i + 1}</span>
                  <span className="flex-1 font-black truncate" style={isByu ? { color: T.leaderLine } : {}}>{t.team}</span>
                  <span className="w-12 text-center text-xs font-bold">{t.conf}</span>
                  <span className="w-12 text-center text-xs opacity-75">{t.overall}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {!live && !loading && !err && <div className="rounded-2xl p-3 text-xs opacity-70 mb-2" style={T.glass}>Tap "Check now" to pull the live Big 12 standings from the web once the season is rolling.</div>}
      <div className="text-xs opacity-50 mt-2 text-center">Projections are preseason guesses for fun — they also power the Simulator's title odds, so the two tabs agree. Live standings pull from the web and cache for ~5 minutes.</div>
    </div>
  );
}

const VAULT = {
  eras: [
    { key: "early", name: "Early Years", span: "1922–1971", pct: 43, blurb: "Five decades of hard living before the revolution — BYU football existed mostly as the punchline of the Rockies. Then a defensive assistant named LaVell got the keys." },
    { key: "lavell", name: "LaVell Edwards", span: "1972–2000", rec: "257–101–3", pct: 72, gold: true, blurb: "The revolution. LaVell turned a doormat into the most famous passing offense in America: 19 conference titles, a Heisman, the 1984 national championship, and a coaching tree that reshaped football. The stadium bears his name for a reason." },
    { key: "crowton", name: "Gary Crowton", span: "2001–2004", rec: "26–23", pct: 53, blurb: "Started 12–0 in 2001 behind Luke Staley's Doak Walker season — then three straight losing years. A short, strange chapter." },
    { key: "bronco", name: "Bronco Mendenhall", span: "2005–2015", rec: "99–43", pct: 70, blurb: "Restored the standard: 11 straight bowl trips, two 11-win seasons, and the 2006–09 golden run of Beck, Hall, Unga and the answered prayer." },
    { key: "kalani", name: "Kalani Sitake", span: "2016–now", rec: "84–45", pct: 65, blurb: "Navigated independence, landed the Big 12 invite, and built the 2024–25 juggernaut — 23–4 across two seasons, a Big 12 Coach of the Year award, and the best recruiting class in school history." },
  ],
  trophies: [
    { v: "1984", l: "National Title", s: "13–0 · consensus", star: true },
    { v: "1990", l: "Heisman Trophy", s: "Ty Detmer" },
    { v: "4×", l: "O'Brien Award", s: "McMahon · Young · Detmer ×2" },
    { v: "2×", l: "Outland Trophy", s: "Buck '86 · Elewonibi '89" },
    { v: "2001", l: "Doak Walker", s: "Luke Staley" },
    { v: "59", l: "NCAA records", s: "Detmer's haul at BYU" },
  ],
  legends: [
    { name: "LaVell Edwards", pos: "HC '72–'00", note: "257 wins — the name on the stadium and the father of the modern passing game." },
    { name: "Steve Young", pos: "QB '81–'83", note: "Pro Football Hall of Famer · 2× NFL MVP · Super Bowl XXIX MVP." },
    { name: "Jim McMahon", pos: "QB '77–'81", note: "First-ever O'Brien winner · hero of the Miracle Bowl · '85 Bears Super Bowl QB." },
    { name: "Ty Detmer", pos: "QB '88–'91", note: "1990 Heisman · College Football Hall of Fame · rewrote the NCAA record book." },
    { name: "Luke Staley", pos: "RB '99–'01", note: "2001 Doak Walker winner — the engine of the 12–0 start." },
    { name: "Kyle Van Noy", pos: "LB '10–'13", note: "2× Super Bowl champ · scored two defensive TDs in the '12 Poinsettia Bowl." },
  ],
  holyWar: {
    series: "34–60–4", streakNote: "BYU has won the last three — and now it's a conference game.",
    moments: [
      { yr: "2006", score: "BYU 33, Utah 31", tag: "Answered Prayer", note: "John Beck to Jonny Harline, alone on his knees in the end zone as time expired in Rice-Eccles." },
      { yr: "2007", score: "BYU 17, Utah 10", tag: "4th and 18", note: "Max Hall to Austin Collie down the sideline to keep the winning drive alive. \"Magic happens.\"" },
      { yr: "2009", score: "BYU 26, Utah 23 (OT)", tag: "George in OT", note: "Andrew George catches, spins, and rumbles in to win it in overtime in Provo." },
      { yr: "1984", score: "BYU 24, Utah 14", tag: "Title run", note: "Win No. 11 on the way to 13–0 and the national championship." },
    ],
  },
  bowls: [
    { yr: "1980", name: "Holiday Bowl", score: "BYU 46, SMU 45", tag: "The Miracle Bowl", note: "Down 20 with four minutes left — McMahon's Hail Mary to Clay Brown caps the wildest comeback in bowl history." },
    { yr: "1984", name: "Holiday Bowl", score: "BYU 24, Michigan 17", tag: "The clincher", note: "Robbie Bosco, hobbled on two bad legs, seals the 13–0 championship season." },
    { yr: "1996", name: "Cotton Bowl", score: "BYU 19, Kansas St 15", tag: "14–1", note: "The most wins in a season in school history." },
    { yr: "2024", name: "Alamo Bowl", score: "BYU 36, Colorado 14", tag: "Statement", note: "A dismantling to finish the 11–2 Big 12 breakthrough." },
    { yr: "2025", name: "Pop-Tarts Bowl", score: "BYU 25, Georgia Tech 21", tag: "Back-to-back", note: "Caps 12–2 — and a 23–4 run over two seasons." },
  ],
  traditions: [
    { t: "The Y on Y Mountain", d: "A 380-foot whitewashed block Y above campus since 1906 — hiked by freshmen, lit for big games." },
    { t: "Cosmo the Cougar", d: "Mascot since 1953 — part gymnast, part dance-crew captain, all menace." },
    { t: "The ROC", d: "The Roar of Cougars — thousands of students in royal blue making LaVell one of the loudest stops in the Big 12." },
    { t: "The Cougar Song", d: "\"Rise and Shout\" has echoed through the stadium since 1947 — sung loud after every score." },
  ],
};

function HistoryVault({ celebrate, T }) {
  const [era, setEra] = useState("lavell");
  const cur = VAULT.eras.find(e => e.key === era);
  const chip = on => on ? { ...T.accent, color: T.accentText } : { background: T.idleBtn, color: T.text, border: T.idleBorder };
  return (
    <div className="py-2" style={{ color: T.text }}>
      <button onClick={() => celebrate("big")} className="w-full rounded-3xl p-5 mb-3 text-center relative overflow-hidden card-hover" style={{ ...T.accent, color: T.accentText, boxShadow: "0 0 30px rgba(150,175,255,0.5), 0 12px 30px rgba(10,20,80,0.3)" }}>
        <div className="shine" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
        <Label>DECEMBER 21, 1984 · HOLIDAY BOWL</Label>
        <div className="text-3xl font-black my-1">NATIONAL CHAMPIONS</div>
        <div className="text-xs font-black opacity-80">13–0 · the only non-power champion of the poll era · tap to celebrate 🎉</div>
      </button>
      <div className="mb-2"><Label>THE ERAS</Label></div>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-1">
        {VAULT.eras.map(e => <button key={e.key} onClick={() => setEra(e.key)} className="btn-lift px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap shrink-0" style={chip(era === e.key)}>{e.gold ? "★ " : ""}{e.name}</button>)}
      </div>
      <div className="rounded-3xl p-4 mb-3" style={T.glassDeep}>
        <div className="flex justify-between items-baseline flex-wrap gap-1"><div className="font-black text-lg">{cur.name}{cur.gold ? " ★" : ""}</div><div className="text-xs font-black opacity-75">{cur.span}{cur.rec ? ` · ${cur.rec}` : ""}</div></div>
        <div className="text-sm opacity-90 mt-1 leading-relaxed">{cur.blurb}</div>
      </div>
      <div className="rounded-3xl p-4 mb-4" style={T.glass}>
        <div className="flex flex-col gap-1.5">
          {VAULT.eras.map(e => (
            <div key={e.key} className="flex items-center gap-2">
              <div className="text-xs font-bold w-20 shrink-0 truncate">{e.name}</div>
              <div className="flex-1 h-5 rounded-full overflow-hidden" style={{ background: T.barTrack }}>
                <div className="h-full rounded-full flex items-center justify-end pr-2" style={{ width: `${e.pct}%`, background: T.barFill, boxShadow: e.gold ? "0 0 14px rgba(150,175,255,0.8)" : "none" }}><span className="text-[10px] font-black" style={{ color: T.barText }}>{e.pct}%{e.gold ? " ★" : ""}</span></div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-xs opacity-55 mt-1.5 text-center">win percentage by era</div>
      </div>
      <div className="mb-2"><Label>TROPHY CASE</Label></div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
        {VAULT.trophies.map(t => (
          <div key={t.l} className="rounded-2xl p-3 card-hover" style={t.star ? { ...T.glass, boxShadow: "0 0 20px rgba(120,150,255,0.4)" } : T.glass}>
            <div className="text-lg font-black" style={{ color: T.leaderLine }}>{t.v}{t.star ? " ★" : ""}</div>
            <div className="text-xs font-black opacity-85">{t.l}</div>
            <div className="text-xs opacity-60">{t.s}</div>
          </div>
        ))}
      </div>
      <div className="mb-2"><Label>THE HOLY WAR LEDGER</Label></div>
      <div className="rounded-3xl p-4 mb-2 text-center" style={T.glassDeep}>
        <div className="text-xs font-black tracking-widest opacity-70">BYU vs UTAH · ALL-TIME</div>
        <div className="text-4xl font-black my-1">{VAULT.holyWar.series}</div>
        <div className="text-xs opacity-80">{VAULT.holyWar.streakNote}</div>
      </div>
      <div className="flex flex-col gap-2 mb-4">
        {VAULT.holyWar.moments.map(m => (
          <div key={m.yr} className="rounded-2xl p-3 card-hover" style={T.glass}>
            <div className="flex items-center gap-2 flex-wrap"><span className="text-xs font-black px-2 py-0.5 rounded-full" style={{ ...T.accent, color: T.accentText }}>{m.yr}</span><span className="font-black text-sm">{m.tag}</span><span className="text-xs font-bold opacity-70 ml-auto">{m.score}</span></div>
            <div className="text-xs opacity-85 mt-1 leading-snug">{m.note}</div>
          </div>
        ))}
      </div>
      <div className="mb-2"><Label>LEGENDS WALL</Label></div>
      <div className="flex flex-col gap-2 mb-4">
        {VAULT.legends.map(l => (
          <div key={l.name} className="rounded-2xl p-3 flex items-center gap-3 card-hover" style={T.glass}>
            <div className="rounded-lg px-2 py-1 text-xs font-black shrink-0" style={{ ...T.accent, color: T.accentText }}>{l.pos.split(" ")[0]}</div>
            <div className="flex-1 min-w-0"><div className="font-black">{l.name} <span className="text-xs font-bold opacity-60">{l.pos}</span></div><div className="text-xs opacity-80">{l.note}</div></div>
          </div>
        ))}
      </div>
      <div className="mb-2"><Label>BOWL CLASSICS</Label></div>
      <div className="flex flex-col gap-2 mb-4">
        {VAULT.bowls.map(b => (
          <div key={b.yr + b.name} className="rounded-2xl p-3 card-hover" style={T.glass}>
            <div className="flex items-center gap-2 flex-wrap"><span className="text-xs font-black px-2 py-0.5 rounded-full" style={{ ...T.accent, color: T.accentText }}>{b.yr}</span><span className="font-black text-sm">{b.name}</span><span className="text-xs font-black opacity-75 ml-auto">{b.tag}</span></div>
            <div className="text-xs font-bold mt-1" style={{ color: T.leaderLine }}>{b.score}</div>
            <div className="text-xs opacity-80 mt-0.5 leading-snug">{b.note}</div>
          </div>
        ))}
      </div>
      <div className="mb-2"><Label>TRADITIONS</Label></div>
      <div className="flex flex-col gap-2">
        {VAULT.traditions.map(tr => (
          <div key={tr.t} className="rounded-xl p-3 text-sm flex gap-2" style={T.glass}><span style={{ color: T.bullet }}>▸</span><span><span className="font-black">{tr.t}.</span> <span className="opacity-85">{tr.d}</span></span></div>
        ))}
      </div>
      <div className="text-xs opacity-50 mt-3 text-center">The vault is open. Series and era numbers are approximate where records disagree — history is like that.</div>
    </div>
  );
}

function AskCosmo({ T }) {
  const [msgs, setMsgs] = useState([]); const [input, setInput] = useState(""); const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  useEffect(() => { scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight); }, [msgs, loading]);
  const scheduleCtx = GAMES.map(g => `${g.home ? "vs" : "at"} ${g.opp} ${fmtDate(g.date)} (all-time BYU ${g.h2h})`).join("; ");
  const system = `You are Cosmo the Cougar, BYU's mascot and the ultimate hype-man for BYU football. Personality: electric, funny, unshakably loyal, bleeds royal blue. Keep replies short and punchy (2-4 sentences), high energy, family-friendly and clean (no profanity). Toss in the occasional "Rise and Shout!" or roar. You know BYU: 1984 national champs, Ty Detmer's 1990 Heisman, LaVell Edwards Stadium, joined the Big 12 in 2023. In 2025 BYU went 12-2 behind true-freshman QB Bear Bachmeier and RB LJ Martin (Big 12 OPOY); OC is Aaron Roderick (power spread), and Kelly Poppinga is the 2026 DC (multiple 4-3). Use the 2026 schedule when relevant. Predictions are just for fun. 2026 schedule: ${scheduleCtx}.`;
  const send = async (text = null) => {
    const qy = (text ?? input).trim(); if (!qy || loading) return;
    const next = [...msgs, { role: "user", content: qy }]; setMsgs(next); setInput(""); setLoading(true);
    try { const res = await fetch(apiUrl(), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "claude-sonnet-5", max_tokens: 2000, system, messages: next.map(m => ({ role: m.role, content: m.content })) }) }); const data = await res.json(); const txt = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("\n").trim() || "Roar! My voice cracked — hit me again!"; setMsgs(m => [...m, { role: "assistant", content: txt }]); }
    catch (e) { setMsgs(m => [...m, { role: "assistant", content: "Fumble! I couldn't connect that time. Give it another shot in a sec. 🐾" }]); }
    setLoading(false);
  };
  const chips = ["How do we beat Notre Dame?", "Hype up the Holy War", "Toughest game on the slate?", "Why is BYU the best?"];
  return (
    <div className="py-2 flex flex-col" style={{ height: 520, color: T.text }}>
      <div ref={scrollRef} className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1">
        {msgs.length === 0 && (
          <div className="rounded-3xl p-6 text-center" style={T.glass}><div className="text-5xl mb-2" style={{ animation: "floaty 3s ease-in-out infinite" }}>🐾</div><div className="font-black text-lg mb-1">Ask Cosmo!</div><div className="text-sm opacity-80 mb-3">Your AI Cougar hype-man. Ask me anything about BYU's 2026 run.</div><div className="flex flex-wrap gap-2 justify-center">{chips.map(c => <button key={c} onClick={() => send(c)} className="btn-lift px-3 py-1.5 rounded-full text-xs font-bold" style={{ background: T.idleBtn, color: T.text, border: T.idleBorder }}>{c}</button>)}</div></div>
        )}
        {msgs.map((m, i) => (<div key={i} className={"flex " + (m.role === "user" ? "justify-end" : "justify-start")}><div className="max-w-[80%] rounded-2xl px-4 py-2.5 text-sm" style={m.role === "user" ? { ...T.accent, color: T.accentText, fontWeight: 600 } : { ...T.glass }}>{m.role === "assistant" && <span className="mr-1">🐾</span>}{m.content}</div></div>))}
        {loading && <div className="flex justify-start"><div className="rounded-2xl px-4 py-2.5 text-sm" style={T.glass}>🐾 <span className="animate-pulse">Cosmo is firing up...</span></div></div>}
      </div>
      <div className="flex gap-2 mt-3">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Ask Cosmo..." className="flex-1 px-4 py-3 rounded-full text-sm" style={{ ...T.input, outline: "none" }} />
        <button onClick={() => send()} disabled={loading} className="btn-lift px-5 py-3 rounded-full font-black" style={{ ...T.accent, color: T.accentText, opacity: loading ? 0.6 : 1 }}>Send</button>
      </div>
    </div>
  );
}

const RECRUITING = {
  live: { year: 2027, natRank: 66, commits: 14, big12: "TBD", updated: "July 2026",
    board: [
      { name: "Uhila Wolfgramm", pos: "Edge", stars: 4, natl: 104, town: "Spanish Fork, UT", date: "Jul 2, 2026", phase: "July 2026", profile: "Top-105 national edge rusher — BYU won a recruiting battle with Oklahoma." },
      { name: "Kyle Nabrotzky", pos: "OL", stars: 3, town: "Utah", date: "Jul 2026", phase: "July 2026", profile: "In-state offensive lineman; an early-July pledge that boosted the class." },
      { name: "Peyton Higginson", pos: "ATH", stars: 3, date: "Jul 2026", phase: "July 2026", profile: "Versatile athlete added during BYU's July surge." },
      { name: "Lakepa Satuala", pos: "ATH", stars: 3, date: "Jul 2026", phase: "July 2026", profile: "Utah athlete from the well-known Satuala football family." },
      { name: "Blake Wong", pos: "WR", stars: 4, natl: 243, town: "Norco, CA", date: "Jun 27, 2026", phase: "June 2026", profile: "Explosive California wideout — the receiver headliner of the class (#243)." },
      { name: "Kamoni Adams", pos: "CB", stars: 3, date: "Jun 2026", phase: "June 2026", profile: "Track-fast corner (10.7 100m) who chose BYU over Maryland." },
      { name: "Ryan Wooten", pos: "CB", stars: 3, town: "New Jersey", date: "Jun 2026", phase: "June 2026", profile: "East Coast cover corner, one of three CBs in the class." },
      { name: "Demichael Burks", pos: "CB", stars: 3, town: "Las Vegas, NV", date: "Jun 2026", phase: "June 2026", profile: "Nevada cover corner out of Desert Pines." },
      { name: "Jeremiah Williams", pos: "DL", stars: 3, town: "Tustin, CA", date: "Spring 2026", phase: "Spring 2026", profile: "Massive interior lineman (6-0.5, 315) anchoring the D-line haul." },
      { name: "Moa Havili", pos: "DL", stars: 3, date: "Spring 2026", phase: "Spring 2026", profile: "Trench defender adding depth to the defensive front." },
      { name: "Ezra Sanelivi", pos: "RB", stars: 3, town: "Henderson, NV", date: "Spring 2026", phase: "Spring 2026", profile: "Nevada running back out of Liberty HS." },
      { name: "Jaxson Rex", pos: "ATH", stars: 3, date: "Spring 2026", phase: "Spring 2026", profile: "Do-it-all athlete with positional flexibility." },
      { name: "Tytan DeJong", pos: "ATH", stars: 3, town: "Herriman, UT", date: "Spring 2026", phase: "Spring 2026", profile: "In-state athlete out of Mountain Ridge (Herriman, UT)." },
      { name: "James Thorley", pos: "K", stars: 3, date: "Spring 2026", phase: "Spring 2026", profile: "The class's specialist — a scholarship-level kicker." },
    ] },
  history: [
    { yr: 2018, rank: 62, approx: true }, { yr: 2019, rank: 65, approx: true }, { yr: 2020, rank: 66, approx: true },
    { yr: 2021, rank: 57, approx: true }, { yr: 2022, rank: 61, approx: true }, { yr: 2023, rank: 39 },
    { yr: 2024, rank: 62 }, { yr: 2025, rank: 59 }, { yr: 2026, rank: 22, best: true }, { yr: 2027, rank: 66, live: true },
  ],
  classes: [
    { yr: 2026, rank: "No. 22", big12: "1st", commits: 22, tag: "Best class in school history", stars: "9 four-stars", head: "QB Ryder Lyons · TE Brock Harris · IOL Bott Mulitalo (94)" },
    { yr: 2025, rank: "No. 59", big12: "—", commits: 24, head: "Edge Nusi Taumoepeau (91)" },
    { yr: 2024, rank: "No. 62", big12: "—", commits: 25, head: "S Faletau Satuala (94, #131)" },
    { yr: 2023, rank: "No. 39", big12: "—", commits: 21, head: "TE Jackson Bowers (90) · Edge Hunter Clegg (92)" },
  ],
};

function Recruiting({ T }) {
  const R = RECRUITING;
  const barW = rank => Math.max(8, Math.round((76 - rank) / 75 * 100));
  const posOrder = ["ATH", "CB", "DL", "Edge", "WR", "RB", "OL", "K"];
  const posCount = {}; R.live.board.forEach(c => { posCount[c.pos] = (posCount[c.pos] || 0) + 1; });
  const posMax = Math.max(1, ...Object.values(posCount).map(Number));
  const phases = ["July 2026", "June 2026", "Spring 2026"];
  return (
    <div className="py-2" style={{ color: T.text }}>
      <div className="rounded-3xl p-5 mb-3 text-center" style={{ ...T.accent, color: T.accentText }}>
        <Label>{R.live.year} CLASS · LIVE BOARD</Label>
        <div className="text-4xl font-black my-1">No. {R.live.natRank}</div>
        <div className="text-xs font-black opacity-80">{R.live.commits} commits · Big 12 {R.live.big12} · updated {R.live.updated}</div>
      </div>
      <div className="mb-2"><Label>2027 POSITION BREAKDOWN</Label></div>
      <div className="rounded-3xl p-4 mb-2" style={T.glassDeep}>
        <div className="flex flex-col gap-1.5">
          {posOrder.filter(p => posCount[p]).map(pos => (
            <div key={pos} className="flex items-center gap-2">
              <div className="text-xs font-black w-12 shrink-0">{pos}</div>
              <div className="flex-1 h-6 rounded-full overflow-hidden" style={{ background: T.barTrack }}>
                <div className="h-full rounded-full flex items-center justify-end pr-2" style={{ width: `${(posCount[pos] / posMax) * 100}%`, background: T.barFill }}><span className="text-xs font-black" style={{ color: T.barText }}>{posCount[pos]}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-2xl p-3 mb-4 text-sm" style={T.glass}><span className="font-black">Filling needs: </span><span className="opacity-90">defense-heavy so far — three cornerbacks and a three-man Edge/D-line front, plus four versatile athletes. Offense is thin (one each at WR, RB, OL), the clear priority for the rest of the cycle.</span></div>

      <div className="mb-2"><Label>COMMITMENT FEED</Label></div>
      <div className="rounded-3xl p-4 mb-4" style={T.glassDeep}>
        {phases.map(ph => {
          const items = R.live.board.filter(c => c.phase === ph);
          if (!items.length) return null;
          return (
            <div key={ph} className="mb-4 last:mb-0">
              <div className="flex items-center gap-2 mb-2"><span className="text-xs font-black tracking-widest" style={{ color: T.leaderLine }}>{ph.toUpperCase()}</span><span className="text-xs opacity-60">· {items.length} pledge{items.length > 1 ? "s" : ""}</span></div>
              <div className="flex flex-col gap-2">
                {items.map(c => (
                  <div key={c.name} className="rounded-2xl p-2.5" style={T.glass}>
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg px-2 py-1 text-xs font-black shrink-0" style={{ ...T.accent, color: T.accentText }}>{c.pos}</div>
                      <div className="flex-1 min-w-0"><div className="font-black text-sm truncate">{c.name} <span className="opacity-80">{"★".repeat(c.stars || 3)}</span></div>{c.town && <div className="text-xs opacity-70 truncate">{c.town}{c.natl ? ` · #${c.natl}` : ""}</div>}</div>
                      <div className="text-xs font-bold opacity-70 shrink-0">{c.date}</div>
                    </div>
                    {c.profile && <div className="text-xs opacity-75 mt-1.5 leading-snug">{c.profile}</div>}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="text-xs opacity-55 mb-4 text-center">14 hard commits · No. {R.live.natRank} nationally (247Sports). Dates exact where shown, otherwise grouped by month — the board is live and will change.</div>
      <div className="mb-2"><Label>CLASS RANKINGS · LAST 10 YEARS</Label></div>
      <div className="rounded-3xl p-4 mb-2" style={T.glassDeep}>
        <div className="flex flex-col gap-1.5">
          {R.history.map(h => (
            <div key={h.yr} className="flex items-center gap-2">
              <div className="text-xs font-bold w-8 shrink-0">'{String(h.yr).slice(2)}</div>
              <div className="flex-1 h-6 rounded-full overflow-hidden" style={{ background: T.barTrack }}>
                <div className="h-full rounded-full flex items-center justify-end pr-2" style={{ width: barW(h.rank) + "%", background: T.barFill, boxShadow: h.best ? "0 0 16px rgba(150,175,255,0.9)" : "none", opacity: h.approx ? 0.62 : 1 }}>
                  <span className="text-xs font-black" style={{ color: T.barText }}>{h.approx ? "~" : ""}#{h.rank}{h.best ? " ★" : ""}</span>
                </div>
              </div>
              <div className="text-[10px] w-11 shrink-0 opacity-60">{h.best ? "best ever" : h.live ? "live" : h.approx ? "approx" : ""}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="text-xs opacity-55 mb-4 text-center">Lower number = better class. 2026 was BYU's best-ever, jumping from the 50s–60s into the top 25.</div>
      <div className="mb-2"><Label>RECENT SIGNED CLASSES</Label></div>
      <div className="flex flex-col gap-2">
        {R.classes.map(c => (
          <div key={c.yr} className="rounded-2xl p-3 card-hover" style={c.tag ? { ...T.glass, boxShadow: "0 0 20px rgba(120,150,255,0.4)" } : T.glass}>
            <div className="flex justify-between items-baseline"><div className="font-black">{c.yr} Class {c.tag && <span className="text-xs">★</span>}</div><div className="text-xs font-black">{c.rank}{c.big12 !== "—" ? ` · Big 12 ${c.big12}` : ""}</div></div>
            {c.tag && <div className="text-xs font-bold mt-0.5" style={{ color: T.leaderLine }}>{c.tag} · {c.stars}</div>}
            <div className="text-xs opacity-80 mt-0.5">{c.commits} commits · {c.head}</div>
          </div>
        ))}
      </div>
      <div className="text-xs opacity-50 mt-3 text-center">Rankings via 247Sports. 2018–2022 are approximate (BYU sat in the ~50s–60s, never inside the top 35 before 2026). The 2027 board is live and will change.</div>
    </div>
  );
}

const LOGOS = {
  byufootball: "data:image/png;base64,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",
  byubball: "data:image/png;base64,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",
  jazz: "data:image/png;base64,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",
  mammoth: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4NzAuMjUyIDYzOS4xMSIgd2lkdGg9IjM2OS4wMTIiIGhlaWdodD0iMjcwLjk5NCI+PHBhdGggZmlsbD0iIzZjYWNlNCIgZD0iTTg3MC4yNSAzOTUuNDY1Yy42NDMtMTIzLjUxMy0xMjguNDE3LTIwMC40MDYtMTY5LjU5LTIxMy43NSAwIDAgNzguMDc4IDExMy4yOCA3Mi4zMTUgMTkxLjM1OC0yLjU0NCAzNC40MjctMTkuNjI0IDQ1LjY1Mi0zNi44MyA0Ny45NjItLjM0LTY3Ljc0NC0yOC41MzgtMTI0LjIyMS00OC4zNzgtMTU1LjYxM2wxNS4wMDMtMTYuMzJzLTMxLjIwOC04My4wMzEtMTU3Ljc3NC0xODMuNjg1bC0yMC4xNTcgMTMuMDZMNDAzLjY5NiAwIDI4Mi43MTkgNzguMzY5bC0xOC44MjMtMTIuMTkzTDAgMjM3LjExNmwxNTIuODM1IDgyLjM0LTMxLjI1IDIwLjI0MSAxNjcuOTkgOTAuNTItMzAuNDc0IDE5Ljc0czExNy4yNTggNjUgMjMzLjQzIDU1LjU5NGMxMC45NTEgNi44MjEgMjIuMzQzIDEzLjMwMSAzNC4wNDQgMTkuMTk4LTU4LjE3OSAzMC40NjUtMTI2LjM0OCAxMy44NTItMTI2LjM0OCAxMy44NTJsLTgyLjc3MyA1Mi4xMzNjMjEyLjA5OCAxMDIuNjM3IDMzMC43NDkgMTcuODQ3IDM3My4xMTUtMzMuNDY4IDk2LjAxNi01LjExMiAxNzkuMTA2LTUwLjM5OCAxNzkuNjgxLTE2MS44WiIvPjxwYXRoIGZpbGw9IiMwMTAxMDEiIGQ9Ik04NTMuMzU0IDM5OS45ODFjMC02OS45MTItNDguMzA0LTE0NC41Mi0xMTQuNTIzLTE4Mi44NzUgNTguNzM3IDEwNy4xIDY2LjY4NiAxNzguMjMgMjguMjIyIDIwOC41Mi0xMi4wNTIgOS40OS0yOS45NzMgMTQuMTI4LTUwLjA0IDEzLjk0NC40Ni01Ljg4LjcyNy0xMS44MDguNzI3LTE3Ljc4IDAtNTkuOTIyLTIyLjMxLTExNC41My01My42MzQtMTU4LjAxNWwxNi4zNTUtMTguMDEzUzY0Ni4zMzQgMTczLjM5NyA1NDMuNjYzIDg4LjY0bC0xOC44MjMgMTIuMTkyLTEyMS4xNDQtNzguNDc3LTEyMC45ODYgNzguMzY5LTE4LjgyMy0xMi4xOTNMMzYuODExIDIzNS42MzdsMTUyLjgzNiA4Mi4zMzktMzEuMjUgMjAuMjQ5IDE2Ny45OTcgOTAuNTItMjkuMjMxIDE4Ljk0IDQuNzUzIDIuMzI3YzM0LjMzNiAxNS41NDUgMTEwLjc3OCA0NC4yODQgMTkyLjYwOCAzNi40NDVhMzE2IDMxNiAwIDAgMCA2NS4xNjggMzMuOTVjLTM3LjQ4IDM4Ljc5OC0xMDYuMzMyIDQ0LjY3OC0xNTUuOTk2IDM1Ljk3MWwtNDkuMjcyIDMxLjkxN2M0Ni4zMiAyMS40NzQgOTkuOTYgMzEuNzMzIDE0Ni41OTcgMzEuNzMzIDYzLjUgMCAxMjEuMzM2LTE5LjAyNCAxNjEuNjE4LTU4Ljg2M2ExNzcuNSAxNzcuNSAwIDAgMCAxNy4zOTYtMjAuMDU4YzEwMC4xNy0xLjMyNSAxNzMuMzE5LTUyLjA0IDE3My4zMTktMTQxLjEyNVoiLz48cGF0aCBmaWxsPSIjZmZmIiBkPSJNNjUzLjE4MSAzOTAuNzkyczE3LjE0Ni01LjIxMyAzMy45ODUtMS4yODRxLS44NC01LjY2Ni0xLjk2LTExLjI4NWMtMi4xMTktOC43MDYtMTAuODY3LTI3LjE5NS00OS4yMzktMzguMzc5IDAgMCAxMy4xNjEtNy41MzEgMzcuMTItMi45MnEtMi4wNDItNS4yNS00LjMxMS0xMC40MDdjLTQuNDAzLTguNi0xOC4xMy0yOC4wNTYtNTIuODY2LTMwLjE1IDAgMCAxNC40Ny04LjQ1NiAzMS43NTktOC44M2EyNzMgMjczIDAgMCAwLTIwLjU1OC0yNy42NjRsMTYuMDM3LTE4LjEzOGMtMTQuNDUyLTIyLjgxOS00NS44ODUtNjYuMDkzLTEwMS45NDUtMTE1LjMzMmwtMTYuMzU1IDEwLjU5MS0xMjEuMTQ0LTc4LjQ3Ny0xMDcuNTkzIDY5LjY5NSAxNTIuNzcgMjEuODQyIDc5Ljg2MSA1MS43MzItNjguMzg2LTE3LjI4OC0xMzkuNDY3IDUyLjc1NyA4Mi44MDYgMzAuMTQ4LTEwMS41MjkgMzEuNjUgMTM1LjI2NCA3Mi41MzJzMTQuNzEtMTQuMTk1IDM5LjQ1Ni0yNi4wMmgtLjAxYTE1Ni44IDE1Ni44IDAgMCAxIDU4LjcyMS0xNS40NzlzLTIzLjg0My00My43Ni03OC40MjYtNjcuNjI4bDEwLjgwOC0xMi42NjhzLTE5LjA5LTcuMDMtNjQuMjg0LTEwLjQ2NmMwIDAgNTIuNzc1LTI1Ljg4NyAxMDcuMDE3LTIyLjIxbDY1Ljk5MyA0Mi43NTFoMjguMjYzbC0zMC4yNDggMzUuNDM2YTI0My42IDI0My42IDAgMCAxIDUwLjQ0NyAxMTEuMjk1IDE2NiAxNjYgMCAwIDAgMTkuNjczIDEzLjE0MyAxNTcuNCAxNTcuNCAwIDAgMCA0NC4xOTQgMTYuNjYzYy4wOTEtMS4zMTguMTUtMi42NDQuMjI1LTMuOTYyLS4xMzQtOC43MDYtMy42NzktMzEuMzkxLTM2LjA3OS00MS42NDhaTTU5OC45NiA1MzIuMjc1cS0xLjc5OCAyLjE4Ni0zLjY5NSA0LjI4N2MtMjYuMjYyIDI5LjIzMS02NC45MjUgNDQuNTUxLTEwNC43MTUgNDkuODg5YTI1NyAyNTcgMCAwIDEtMzQuMDkzIDIuMjg0IDMyNyAzMjcgMCAwIDAgNDQuNTUxIDMuMTI4YzU3LjQ4NyAwIDEwNy4zMTctMTYuNjA1IDE0MS44MjctNTAuNzIzLjUxOC0uNTA4Ljk5My0xLjA1IDEuNS0xLjU2OC0xMi4xODMtMS4xNzYtNDIuNzI0LTYuNjg5LTQ1LjM3NS03LjI5NyIvPjxwYXRoIGZpbGw9IiM2Y2FjZTQiIGQ9Im01MjguNzMyIDIwMS43ODctODAuNTk1LTc2LjQ3Ny05NS4yMDgtMTQuNzg2IDUwLjc1Ny01Mi4wMDctMTA3LjU4NCA2OS42OTUgMTUyLjc2OSAyMS44NDNabS02OC4zNzktMTcuMjg4LTEzOS40NjcgNTIuNzY2IDgyLjgwNiAzMC4xNC00Ny40NzgtMzAuNzU3Wm02NC40ODItNDcuNTEzIDMxLjYyNCAyMC40ODItMTUuMjYxLTMxLjA3NFptLTg3LjQwOSAyMzQuNjA5czE0LjcxMS0xNC4xOTUgMzkuNDU1LTI2LjAybC0xNzQuNzE5LTQ2LjUxMlptMTg3LjczNSAzNC45OWExNjYgMTY2IDAgMCAwIDE5LjY3NCAxMy4xNDRjMS42NjcuOTQzIDMuMzYgMS44MzUgNS4wNTQgMi43MTFhMjM2IDIzNiAwIDAgMC04Ljg1LTUwLjM5OCAyNTUuNiAyNTUuNiAwIDAgMC00MC43NTUtODEuOTA1bDQuNjc4LTMwLjI4Mi0zMC4yNDkgMzUuNDUyYTI0My41NiAyNDMuNTYgMCAwIDEgNTAuNDQ4IDExMS4yNzlabTE5LjIzMSAxMzIuOTkxcy0xOS43MzMtMi42NzctNDUuNDM1LTcuMzA1cS0xLjc5OCAyLjE4Ni0zLjY5NSA0LjI4N2MtMjYuMjYyIDI5LjIzMS02NC45MjYgNDQuNTUtMTA0LjcxNSA0OS44ODlhMjU2IDI1NiAwIDAgMS0zNC4wOTMgMi4yODRzMjAuNDkxIDEuNDkzIDM2LjM1NC40NTlxMy4wODctLjIyNyA2LjExMy0uNTE3IDIuNTg5LS4yMzcgNS4xNjItLjU1Yy4xLS4wMDkuMi0uMDI1LjMtLjAzM2ExOTQgMTk0IDAgMCAwIDcuNjA2LTEuMDQzYzM4LjQzLTUuODEzIDY5LjYxMi0yMC4zODMgOTIuNTg5LTQxLjU5MVoiLz48cGF0aCBmaWxsPSIjZmZmIiBkPSJNNDYyLjcxMiAzOTUuMDkyYzQxLjA0OC0zMy4zMTcgODAuOTIxLTM3LjAzNyA4MC45MjEtMzcuMDM3czkuNTkgMTQuOTIgMjYuOTk2IDMzLjQxOGMzOC4yOTYgNDAuNjk4IDg4LjIxIDcwLjY5NiAxNDQuMDk0IDcwLjY5NiAzNS43OTUgMCA2OC4yNzktMTMuMTkzIDg0LjI0MS00Mi42IDIyLjgxLTQyLjAxNiA1LjI1NS0xMDIuMzctMTcuMDgtMTQ3LjQwNiAxOS42NSAyMi41OTIgMzkuOTE1IDU2LjE5NCA0Ny4xMjggOTIuNzA2IDUuNTE0IDI3LjkyMSA1LjAzOCA2MC45NTYtMTIuNjQyIDkwLjAwMi0yNC41NyA0MC4zMzMtNzYuMDc2IDU4LjkyMi0xMzIuMzg2IDU4LjkyMi03Ni4yMjYtLjAxLTE1OC4yNjUtNDAuNTA2LTIyMS4yNzItMTE4LjdaIi8+PHBhdGggZmlsbD0iIzZjYWNlNCIgZD0iTTQ5NS40NTMgMzczLjgxNGExODQgMTg0IDAgMCAwLTMyLjc0MSAyMS4yNzRjNDUuNzg0IDU2LjgyIDEwNC40MTQgOTcuODY4IDE3Mi4yNDEgMTEzLjMzOWEyMjQgMjI0IDAgMCAwIDUzLjA0MiA1LjMyYzMxLjYtNS41NjIgNDUuNzg1LTE4Ljk2NCA0NS43ODUtMTguOTY0LTEzNS44NTYgMTcuMzgtMjEzLjY2NS04Mi40MTUtMjM4LjMyNy0xMjAuOTdabTExLjQ5My0xMjcuODMyLS4wNDItLjAxNnMxMC45OTIgMjYuODM4IDMwLjk4MiAzOC44NzJsMTMuNjQ0LTkuOTY2IDExLjg4NS0xLjI3N1oiLz48cGF0aCBmaWxsPSIjZmZmIiBkPSJtMjc3LjcwNiAxODkuNDU2LTU1Ljk4NSA3MS44MyAxMDAuOTItNjIuMjIzLTMwLjE5LTE5LjU1NiAyNy40MzgtMTguNTQtNTUuNDI2LTM1LjkwMy0zMi4wNjYgNzEuNzA3WiIvPjxwYXRoIGZpbGw9IiM2Y2FjZTQiIGQ9Im0xOTAuNjc4IDIxOC43NTQgNTEuOTU3LTguODY2LTIwLjkwOCA1MS4zOTkgNTUuOTg1LTcxLjgzLTQ1LjMxIDcuMzEzIDMyLjA2Ni03MS43MDZMOTUuMDI5IDIzMi40NTZsMTA5Ljk2LTQ0LjYzNVoiLz48L3N2Zz4=",
  eagles: "data:image/webp;base64,UklGRkL6AABXRUJQVlA4TDb6AAAv/wTdEFUP47aNHA37L3vThMO9I2IC4r+iSWMFHoZLIGeuDGRkiibWDE8QqU8QWy+ZO9HQGsWWL1WH5ajgWuxJwen/+0P+//7vNNZ2q/FQz8Y01XjWeGiNUdNE29rWMZ5qPLSeUk09RGtibWOq1vHQ2CRGqzGHlbVWVhJNYg7LaIxnTWOt8WxsPFvP51Or1raeDzO2U9/s3/r9vt/X6/V+fz7fz/f3WzDfAS1up6JMB2rs3KYwVSq3YeKd3lSoYLgTTO9TmwYrZiJpmZhYg5mIXYJsnNmBaFMwMGLFZEsVC5PB7KPa0Clt7mU3yWA7BNuEinIKsqMdhSD7EG8cWukcQid3+Iy0WoJ7EZmxoyRIIFoiunfN7ZqkWUQSnJZptTtW2QcJsTYZYVuUIY1zT6VTmzlIknKnNqyJmYOT4j3LRCVhkLmLhzigf1jRTAl2ZvyhoFQxQXcJNL/aTuSuJQtHGoetoWp+Wmcru4ZYQ1ZFh0YNRaQlmqZO/pjuGuJsxEo57JRd0cJi8A+rmdGSYhMiSXMiLWSPZo5ZOmlEKisGR3t4g44jmdK1sZqpkBtS5jsgO2ErbZpob41OdMfxkFqhuyinO0joDmhBMIOZxn0KNu2SKClExtNspE0wo7GWSRHtqnLoGEysO0O7hOpkwhy6MG1kj4dQnSa4W5QyZpb3od8mqC2t0sEcoKht27TiuvZ/i5bZSsZUP0JIhlRChpD3fUaFbdu2Idrp9AAMAEIltq3tYZmIgbIHcyvusGuzxwS7FRsn7e7uwm4Fu7u7QR1zb2KPbOxe7unO5XR+tGDbrts25xg1S0lUmziKRF7cFy7wYdX+/3WTmzAzMzMzOWZmZmZmZmZmTspMYWZmZvKFC9jnef7///P9fn9znsvoGVWmqeLWV8WV5gRVKeyq2EWVq8LxcUXFrWIeVV5VdOvKqFZ948etylm4gXIVu72ArWJ8VpXrV038njCqHVVUG1/mKnxuYK+g7MOseuqZq7hVzFXMVUFZZoUj41iVA1PVO8BfwTGGo+KKqlXcwJy9gDKqPfEbRjWr4uviyqi4VdxewriVAVl6XBXfQE9QFU9E/2ExkuS06hUSfjkiY27j7fnD4tkfv6f/cKoHQx6GfzL0Y1jNMMtzPTAUYKjPMIJhO8Mthl8YSMnQynO8d5sMVRh6MqQw/IfhZ2mfDPcZXvBs774OwDDAM7oP2gwNGEYy7GS4x/CbNEqGzxnyex73bpOhNsOwNR+neAkjwxzP325jKMmQWELqDD9IOBl+YijuWRsYSjAkMCQxnGb4QiLJsMGztfsyFGSIYxjFsOs4koAMfzBU8hwNDLnSbYZh43EYfpdEZDjpGdtJRiowNPScDItj6MQwn+EiwzeSmgxveT72SZthYILHCSp5kKG752BgiM6mnZ0zfC95keHtAj3zAkPA0wWWoJInP8jiRA+GvzD0ZyhiAsDwIkMHhoUMV3OVvMnwFUOE0/yeAlJfLENdk/F2kzsqdoLfwxDDMPGAUjJ8yfAvi4qD4c/ZMCxguMLwnRSFe7m+UzsYyhaQelBPnzYvZkLfbnpW0OWOoZz9PVIyfMpQzaLGYCjE0Lydgy5WisbiGf7uhA6GCgzTGG5KB2T4SH072lbLUJ1h8JoZHkshyXDA6fxcYwGpSwNk+JihskVVwRBuZZh00E1JYckQ6zQOhvKG90jJ8C7D39S0G102DItS34sUmQxpTuF70m3HqOYphndKV82/LexdYRGdDI2dwPcwPAB0M2vMooJgyD2vAhgO3VwqgQz/dfLew/BQAnhkhlJqeHV55ww/SqVwF07ZWP/PYXgqQTyOylnYmBVDb4ZtDI+kkvg6DGFO1mCo5YUhKIFkuHMMi2qhjYIZhm+f4UMpKB+lxHjeRhx3S2y3GxA5O1l/3Ea8d3tRhii10hg4rwLaq0kKye/uTOKr4hoN9xfHQxxe/d/4+vHfZ7PFOVpgYHi/Jafrc41gMPyPoZhaSRUyhKSInJ4ykY8a5cMS2ekW3t7Vr9XPZp8PuPnM0IGhAKfqq8wIMNxgKKpCl1gElSp8tBrxvpTHwRZh+xhE47EZ5ohuFwnCptbkJC1fiELqZ1MZa8DplcCQnbEUjo8eTGpRo3taornYhnh4PcD6ZzPO+1/7pq0Bg9Oyp20nel4C87rbVJO3WZmsIsG5SeH4GMEkv+q53PSOwe5eYax8NiCju9wkCAzfbtepuU8xGs+pGq30ehLctxSN3yOZwk/FPR7RXm5DOLz6s/rYEOzXyjO1UjAwLHdCVqVF1MF2nmpx2xMId9tUl2F33/6ufTYso+wdEoRZHsQpfY+UDOcY8qnBbe3dXMTLKwPY+GwUvL+Vb4o/AQPDVifgPQx/ZZjMkCPJyHBM4RJ21V6MYSzDqcUKeN8BbX42Mg6ze0gQMmao6ARsOIlSJ0t7qSr5NjuR6sWKd9+F22g5qa+CgeGgE/oeKbdfoJK7kzB8LUXidJVzj3CwtD7grcdGz6G1DqCnWQU75RpOYhj3udTa+Bh2VKtMH0+tDDN2nqtgl5bdnh/hNJ+ANj6c4PuAgeG4k+0ehtIMYxgy6VWRMmxWoHKVAj/tCRnOly/YJ+2hto5CbPwY/v4F/D4vp1lst5mDFi/pWZDSWhvp1iPUZ+0ZeOyh6fIG/v9j48xxvgwYGM44xe5hiGzmoAy/Sh5kWJ+20mRrBDKQNKNk8t+xw88bTPPq58pn48+ZzghgmLGTKxgKN3PQLCUfMixTlkw1wwfi3DYDYw9xDJfWB7jx2ARh3JNFgvD9nFj3zDObBPldwWBYrCALSQL1pbv72J5HPjUEtInDgW4/j5EBA0O8UyryyCbBZiU/NqcQ/TEFiaND4bs5e2h6WP+OMDcfm2CM83EANVA4ne5hyJtNggzPJU8yzFSAt5PpFXQckd5uHi0lm3gcyNYzwwgYGJo6kSJVhjb7P6zky7IsYqNOhq4M64QxkdTRRD9qZPfbMLpHhjZBOaqHRYLAkO4kuqcNhrgSti05MyjDaKHPhFbaXOqnFOS26Rvjn48012VPY5agGPDWkxEMDK2cRPf8OCm5tw8SuCNxdjtvRLQrLAJj5PcL0PhK2k6f+vMZnkkpQNuSsIKFoihReMxkrXGNRnkD+/+xic+LnwCGbJw69yxYCsGMGfoIeoGZ4T1Rri430fq+bMpgE0DTo2k7bRoMFsaZSIZeFtGw9Gyam5MUgtOoUVeM19vRUrIphpe7GQwMXZwwVUifU0phGsMbghkGrrQ5MQzEzQjW+jCjJbLTbRD/PzbhSWFs8zhtOFkqEpQCcZbfJthFlr0IcpoxlYvbFMf+rz/TU2BgeMUpcg9Dmff4XCkU9/L44pwGePqXa1YIjYGnaDqV09oUyTQlCIGrdXLE4r4qddF8i2yEoa0gAc0wvPbf+hbC7Zc9NNF6/9Y/m1J5rOlowNCME+OezOzr0hILuTK0EEFtqlWME40nSCLNdfV79bMpmTFfLxKEQxToxKhRIVduL2mLmREgGkMzESQL5yfAbdMW4pmN6Prbg+1dCdkUzgdYew4Ew1s5He6ptlJ+GhWSrKu8QTaeKf6EBKN8hiacP2ynV9ATiCBaY683iQowhqtNgrDvlpwO+9UxfMbtIsZ4Xivys+PstoFtX1NZhgTjsAz1+HYlnpMAJ0Af+S/GMB5RnB1hNx6bSrCQaUjAsHwnQunq5rh1Ki53D/kMePOx2WwbvJME49oMdTh+2D6oAF2Jp14j6zbDaT42FeHw+psE4cfl4QQIhmoVM/xf8uJa07QvtfyOU/0LCUZN67dwwUZyZti7bQE+azu4TUWw9kcrAcOzOgFKV5+T455BNS6bfQ5q51mnBON5GGrw6FIixIftudqdZ7y//z6b6vDNJQi+5+mkoNRUibnQeHp+0tVT+4umt2VzyEHvXHeXYDB8kq6FGGkf+gkZLvPvUjJNCWXe1rfV7z72r3s73/q+8qHRr5VnTjAwDHFC2GKIZpjIUFMljWZKKW8ysrulBpshDmb3WaUE467EbbsiXGFeZdadDrr52JTH77L19Obf0YOHpRsf1RnnH4Bg58OGhvvzDXiUipwO/LUqgSHE0E5pduPay1Jy4nQ0ElmXkbd1g917DiTBWN2piPsSn5K7XGFdFSrw/WYHvetcPR0swb2Ozgm6PYZ0duBvvwkMj+1kEI9MgsUXr6hEi1TE0W7cFRJpPQ+bEW5r2hoSjH2vmlC0MMFNcbcJnESFypMr7Ova0/vDq5eXW3cmS5d/QjfA6vuy/vC5vfGWnAZgPaiUQRn6KkrA8ObcupaMabpE2LkA+vke/OC6ggSj8dKp3MBqh/tVlhOM63VsdaNKu63vK0/h93qxhTAep7+HRDfCbk+HDYv+rD7rhOE8TgLyztm8pLRrypG+nVcJd+XYteT4NgCPVocEg+HJAkl8k66nvcNy1x/TxLpSUtwn7R4PF7uTjBCG2jrQyESCwBB0AuhxXFEzG5OeyDBBMTqkm+f2+nbu/Z3dBuKQjq4TSDACb4SkTwlvH2BOMdK75SGPj0KUdd/QN76kPJ1khLILJdCP7s/aN/UaThMKZ3ZdgIM3gQzTleEaYHYMDyQvnsJT1xLqlhZDSdH7lNwprtFIZUAbj0JPMoLRk9vNhkX0/QX41tyx//vLlODQDz6GlRbxsZECUg/KT7oa0Wu30IwkGAy3boPKsWmlJTTOXai6zQ0q6b6++ti8qqiqq4vyo6N5P40Hi0POFQaG1x35O7slOEvpgAxrLKKjTvuuAXLB1Eo1vS0bghG0rxlGSDBKXTrik392O8+St+JAO+EaRZ5kRKOb72XDIsarTYJwZEd9ddPLeTlDbwP/27QFD6OtmQtyE+ibtobL0XAvca0/eoAInLxjqEJXhu7759yZOKMk0lxXHso6ydg5CZ2OVaC/r9KJwdpI2tkwpEtDZDjKkEtwAUNuvuZOz8K+gCEGw/x3JCbBuPrZgFmW4Hzcx0zsLjBvVjH37evaZ+8kIy0747FkLGK63iQIt2/DsR4tzdnI9Q+GU6kKLNFTK8OmxXJzOmjszyOS7oF/kYv0ZEtDgsFwfQ4ATQrZ/HXOHgDm1vTRj6Wkk4zd+Kh7DHR6dvdpQVsbWS8MDN0c6bfWVIAxPwkYLjHkUx9POfIe79vYH8WrXGRnR94SDIZrawLIFjbLV3vWGCejvAwV1Icu2PmoXufEPhxcWMR6s0gQGG47zn+/TTtGO5gxZKxJVKuZBZTKUcaGJogON72jXKJAMhkCVs6yhRkp5yJLX9YfeycZObJLv2FDYl/TVWBI3DF+q7EScjXub0rHgl5m3jlHGZtBNh4bDaM6PxCNIXWehv6Oaaa9w3KWLGx9swo5ydiL/nIvz6OLf6HzZs+vNixiHy5OBX4GLiJBwPXfwAzRIuqTYUg8KMMv3JRpNX00GxWfD2Fh7uXycHDKc17ZpR6Ur/qsNsPafpR1kpE3Uuzz5oN1NAvoaczmHeF1K0BehxZ8fRENxzUrhDItgj4UcB7Unha9OtMr6Mdx/7CtEIVZwSi6KLyaDYlR3i8ShJ07uutW2ABMLd+TiqdS4STcPDHIunVSeb6TSTiWlao9+ZpZ8tyzVkVI1/Rl/cvRR9Wdr6EDKea9w9p6MoLhLR3XBW2aSUuCuG3BgizdejsL5qhP5pA2UlYo4WDYf7ZKS1gd5+50m1PCJ+3ujcbp/eiisSvfZUOiYAkCwylHdd0KTwhVdMXwebpCBf7GMPHk3GRskojybDs7vd9ocDCEGC7thavuwHzOpxDt+ELy3s43JLYIE0/PeBGO6MZE2rk22Br5xQTqWMfRfMhaK8zQZhOjcdef1cS61q4YhVlCorNGvUgk4rifV8VVl5Aw3BWXHYpzpYVfx7rD/0we7/S8juJ+EW/POh/2aaQyoI1HKX3oxEX3HxcbDrOGyacXfyLH8jxbJYjQ9pIlQ2thrrRsm1uw0J4uM/NocxTstrxPkWYNXhUgViM+72v3QSJrCcJTO5YbE0E5YZqNGAbTs9sYt17F8b5UKpx01XsdzeMi1J5LxjUaqZxd/cRqRNC49ZTlwn7qSncER4FfynBLYlh8eiL4HP6sG+DnJ0ybO7ZxYsDRjxdxbpthRBIV1iC4WE1RuoIY8smBRLyvQ4LAsNYx3JgIMhu5QVfB3zlAjjaDv+SdPaXIgBMS+hxR9jzSb8wxguOjP2ufAsRqFISi+rb64fDuQB9cN+LoPaw6BaCdw22Ru9nMghhC3JRIN/HAO4/NxrEFESPjdElUeD6hxWruMUJXIHO24TDBecHAsMSxW9DGC0rZgAgm5hiqv9QTcOtYh1UibcM7zTL22RAhGUMura9deOcPBMTP/f7/4OAXKJ65dMftOD1KIPBatx2+xpPmxPFKC2+F9SmNc1bcwzqqq813FV2sRlSCex3I61STXhQMmTpqm1Ji2EMhAP3WHBW2NsPwZsa8xFvsXWnh3R7+ZUjJuTNxSmKL1SgaobQPHIZ9cgA98VqT4zVmfFASTVNPnTa/k43z49e3ZKY2/kxvfG/F8bb1Zt3m3MRWEa10pOALd6piysuAgWGo47aYIQEYdnNStn6idrj5hfpIy0rz620i8JCvyk2ueuKfFetgC3//CihgH7p7Pz5CvFk6KkpXDfbserOh4O58kyD8ay05VuvVOqCk4QcUyEWLdD2pc73SouBWVtZtzlQ8d4eSvLfz42qn96OrCasPfePBvVl/1BIwMLzqSK1XK7AkIsOFinjYzWyPlxa/jLJuXRgTvWef6GdxucTc9LryEFesRlXQvdHCwdbmydtwlDYkR5fZltTL5tCt+ObctGmVd3ybMNzXZ3LQG53PuwooVhOMhq5OrBz3+1UWDAdzpDYkRwWGrDlQm47LbmNcvSQSqP0h+t7ExxfU3SF1Qrfehg2FNwCaZHaE9pyIMkitk9dJm9Ihfqbjjn1bwWKMuelkv4vUN7cJvdfJwm1ewonV3EOGrm4MpX1x0Lb/wo7MmFVBpOcEj7w4Wl2CufLSpmXvSotQWHhulPI15Z1WSLEadcM9LQt3ZBdgoi0dl7c+jeEE7TtDhiBDSUJthQzJ2+ZmPyQV8aSbB7z5rJVQsDpzgcRqejrYOipKV0leyYbB18O07Re/dUdnMUNKPEFjZKEw1HNOficbRQyhfKZT/AkiVQr5PND2I57WGJVEg0umV7fKsNUxWcyQPFqZ5zkR1edtbuq0tnPbQTQem4jc4FSWQfE//OzrSkkgxzeCUXSVZY/uFhsG4e1fMMP0jRzEUdmMJjGufWgaw5nNnYRbJAzr4nSysdRe9bYcsO1O+O7MoihPXWPhPro9XTg7vqFKGmcmMC9gtvEcjcUMOSi+YggxvGTBI7N6UlfYycYWetHfuvFRKfb69LDh8I6XlChMSyIRQbTm92n7yamH90u1y9dVmlXjPNKUIMzvGI7CYIjaNCpAGH4m5gpkaM9whNPnbZeJftbzccoDYh+bT4g3Wye6ftScbDi09Wg1MP+7k/qq29bgVYi3m59cdZm6mrNwlIrayf8UDAzTHYXTEdEcFxuXWb48WqlCc3flpkWak06FPjavIjqx5ytQb7uHDYdZw9sMI8S4zLJku7OMnbXQVZ7LxDklB4wvs2zHYCPCiFARkDaW0J+3lXWyMckiHPTiSLF3ncOGw/mmUQMuXHgsIToQd+JHNwEMpX2gFC7cxHE6uQhfnCAn1+0z/lLU5etKE8yVW7fiQjjtWbYBhSnYKIme6UBQXQqZ8xesKe1qKegmgsv2hUHMNxtwMKUKdORFpQyXJCcGfSvMMHc055ubhOHCubzk3efeVcQ9LcOgvqjQjg4bDttaL+ga8/n49yCusqMGdRPCXvUOlJuBFcPwto68buJvQHIjw3i45UyGRF79im/SxIm57Ant6JpPp0Ykhvtw8NhwyKUso5LVdbXJW5FDnze/Fnt4v3TiRzct7LRvqw8Go35YgOMr4rgrZM0z9WAMU+H6tDbFKRQGPicbfeVYVadGO0wUbsPhaHUYCS/dzlicIKcZTQx6dr3YEBjE/0+2sI8fF3PEDYW/mcCSIxnmQS+1MOQo6GTjGvfU3acRCGApHOsoy0McXjcz3J+Ysx6HHKoIYbxUpwtE1dQ3PdbnIUFg2Ot460BCPXyTesiwGmg/KVde1pMWzufxIA0GnSZpw+EOJxBFwCaHKro3GinopotVoRKKD+txl+WqHW27mHBOtOn+2wBkOSI7TqGALKTpjfLYE2rr2jvQFHkXSmE72/m1ry7vQImkwtNUp6/73Ht8BD8bRekmjX5yIPc0oVFH2i4m7fBOZinDEaNR9bWUTXunVMzJRl/1d/9xgF/4qmvBhsPQ20dH/AVskvSRPKmOfBPU5S6izgHsdr5dx1gcox3uww64IGPhdH1Lc9vmdbLxkHwutCDE5Qqz2ZCRFNoJ2Mya52ft0q5G2ZPORHW5S2itMDBMcJR1nyNhyZs7z8NwLCC8pGwm9VVcJAw7tNuDYJd+qwMbDoUG2cVpuZ5nFO42dTY38seAOifn6eiKEyV4SsmdDNcZwi0GwFCbYUuzfBzSjWO4hNN8uPQsQV7n7eoisPHB2AJylK0pMgXdlLJ+BHa8SRgYeji2bhWcYPGSP180MwMC1s3wkVrsKOvWOZz6K7yH99tRdCS79lXp20RkYVWEMB5H0U0su/FRNgRGPNyAIbi34ciqT/+CUgQW69DE3CKegyHEqWfdXHk8/iwErxfG/aMXQn1Mzp3o5DRtGhdWO3MYKnW0tiayU4RRoo1d377QYno757JnTisaZOPhpFBBca2va19SRVz9HjJ0k8wt2xD4SuDY8jmmbr08Q7ok5FSWkc+wT47EwGB4+9L2Tl4yJC+Wk7ccCYm5R9eXuWShTAJ3WGWw86HC2qK7mnQv6FXEfXuEYRGWxoNqDVUqUhndSXgjJ2qR6+ILdkRVLUNqS2kPqSQ0lNbVkYTC96otlpbS23lQZXhEft87T+ld+g0y/yCNu8fMVbDwnl+GmqpM7Rx0O+llcF8R9l5sh1dqxGXEUYYDRlWHwAq39iBBWJjjqXIFSo9Oy61r8AeXzXahE8BNzG3dsurmts1HjTS9wwiFHYnwrF/yorQOen26dWcyOtXVkJ2FbhA9jggloi8eA7QKR2vIWsORGl4dIynDCuAALcRVuPXQ/w6gsZHrO5Jupfc6lBGyxTUaJ/akmXS6Cvg/67DvUGl7PK5b18Ghc0n6IZ0dHVGqc1nGGoU40aiCF1nuCRrobUToXkWGqzUUqchqRV/KiqLrvSScUWbzCNdcG4SBYYrjqGqZOS+YMjbKNO1ZOnrKaWsgXGvzzefz9iHJXwNz6ojW4dyf6Yv/nhxK60jFTjQGkwSf9CLiPjz66xW2xuC1GouplJWGEcrQOaOXlxt1OJ6N5+EoakV4wZT5z2jTflC8l596DSkQp/RbHgcb+RDeNb+3q51Vp2X3RoN3KzWnIstUqw/XyfbTI3Alnj5b0/J+PTgjkHeEg0oVw8DwsmOoYi1KK8Ljm49CvTowyXsTKQyu8FzhHzzkl3yTugq99vqq+H7Y3lMP75cu/5SuNuxS0sOIUCOqG4TWQ2gNu1ZTrlY+jKVU5xNh9a2O9nGRIGwgbcdOlF2Ab0Kn0sY0GQZ0X21uKssQJt7UK+6CPACjJHPulId7GFw/bFedoapcQg4+CSnCZ2BPn645c9BWvF2NQfTcCaf5pAHTNj1jR0+1goQGfx89SMSQjd+LQ7wR4mVB5FM5dC3hExcRx6ssp1er11veCDHgjBBvNhscjytB2I3j5lbHlGoFK27aYHjSZz+FGIEHZk1+nbmwXl5u1ep82NPBxu24Z9WVz2DA/uttU1axGIUMYb8PuXVJEBI+iKNmbHDZXZuwI1w+hq8KFzLhjxJh6xTk8tXzKK1anRc/WY2Pew/QreTeIkL3CDwErYXGVIdVTPbbQtTvCeUGA8NcR8yts1Fu5Tbc08OIA/XpLYb/noX89K+n9kitiuBeB8f+vT7UVbymM7DhkCP67jVwjSFLuakVWx1WkZn7KkX9PgtggElnc7TEdtsh3NpD68Y+HudhKI5cfm5iEevTqntvV+Ppf66fXvUO8uOuXbESNPY/YcdWhlUBfDAtnS++1QbGADa+ncIwZ8fLrcMS9q8bwsFl/PPVWKeD89ZaK7w4tQL9Ivle9/VTBfFxU1TmqcUSmgxHa+hS7utwtSqHWxH1e9NA1ZNtOPZuZZsIQO+z1wNw3TNdxeVB9y5q00l7522/6Kg50WkP7F3n2LvytEZ3hQgxo+21hKc1TKkY6rAqjo3pfFE6wkmlxBxP1Q0yRBFunWDk98vmbID2XJIf0vjAiLtXHtQChvyVOae4Warj9qK/BTsvZR03OXvvNIdfh1Wp7JMH5+9HhAMYlOKXO05u0SmBLuuFYIqfR3a/8dua0k9Ef7UR++3SgScZG/5tb0S+GClJk0KXiHR8Bm6lnNjLsCqaMZW6AOfvxKY2s2T4h2Pu1jQlPA42oEu5sQ0WniKG1CoV/AjhGEZSBP9/eytSKbbRuwg9ychzwBqVNDzCMqxqwIFY6VyxDvjtKR3bcbR8QhiiGZaVTxc5Vj7pQfMGrggRQ19JXU0QgeezhnZ0qMNllprbyjNwK+W4WlWDXoJNBP0+gusNmFOpjh0bg4NrLle6S8PlgeVijjAj4HOpZaPUJxuFeSfYYB8OLsV/2r5FSBE+F1/iDq1qwwoE/b7eOmCox5HRhQSGFXRbk1lUeXCrH+WVy0Grwvjng9gj/BxKP4suDDsndIjR1nrqbk+XQILLTjeQ7AAswtcarpR/qzqxRxmCfk8EmHZphoDjoqRN3oRC1jY4h9E90qDvXdLEOxIrkb66LhCLuq/dS5mftu8R7K4oV9CYf6uKMUIpzn+VwY321QD7+zjochwV+xeTSdrMCOp6dxuCQzu+Hj2g7l1CbD2u7lPf80tx6FiX/X3B0CAMcAZrhr/vnQsqxvjSyxb5U3Z1uUUi5bEOq+qxBHsQrv+210l8hiOnl4FroutfXO5YpmMwzcuG4exnGEG7NdlFvPlpif2EWRu9YoLewJBg9DA9mDL0FXRdp/Orre6kqhLVXFJwSW89+mOR77BlBLGqI93WcuaKTr3Ds48MjDPlII6GWlWz2xTZVtZIp8Lf/QSkXrLFNRpHo9WmVSX9ycZ7hgHC8OCRQEo5CugWwBOhAWjp53Q1IbWnptbzoK9eg9aoP5ZSVjVl6F46V5QGH0bHu0OdLXYcBEM4nVbVxBLBujK+0ekqlFI2tAaU6qU/2ZhaX2A4MF6wd/V7BhA+0PnV1ufNpwoRTzXeooQmK4iyDler2jKBYIArUmiedgi9D+E4aGuppXp+HNk5wtE+LughnAi3eR2ILkHiv/jytBKG5AplegzhwGjhu4G0z3FDz0AH4/QdGLnO8g/2XxHOsGU6PsPWqD/WMqzqzH5Z6FwR8slmgyLsxpMkDAwdHQe3yFIhMfOmUUnBoTUxV+65n4S0Y3EG1PZDugoDgJhgaiAd8ntAJNBZIPGrzVeHRYilPtW52xn36TFgq21EU4dVxRljHV0ArriGL9riWVmxo6Cr+GTePZ+/aYI856728ET3b4I07t9SP3nL5MedIUhDnALcD1D41ebr3o+vIjsVSpQwz8CtjKAOq7pSOGcTetc54NIIEoRTMlRzBPQhYcFkQzXWNEVecBb+GkQC1nmQGg2+l+dBKmQTqI9wmomCNMI4oBuAcizLgLf5It138fUHsZoCeiwjea4oAz6OcI/4GzB8X8e/LbI6CK0jjuFCIh2zr5VSDGwqrfm4HIskNRq89SeLFaYF0hj380CAcyzLnp7qEMZDlOC2uph4OsWYu9VkcKAaOleE2rrAuC0wl9QMRRz5AuR6PTL/Yaat8YMx6hBITcw9ZhLvSx2dUsC6A1ohm3uDIcM44DFBGuc44RegnGHu69rnSUn/OsQQqZlNfy0eXGv2rlaTQv+3QOXq8PiSMnKEHEbCShmyybbsFGuRsJAJvxe6QjVI+9Y1T6pOq0vQXxg+TBkkhFt7bn8ov9pC3/j2drUMBfmg3Zir1fRw4FZiJtX9Ax0fOxy/5UcLtmVL6XHRZxszp3QJuvuPC+Gn4e7Dg8LDQvwSxolAbwGnaeZXVS+COGHg+g1pB9QQ3/cB99Ef9rMR1DGvdHRqaE+0LVsedSGdwt8g6XXmaxBeYw4f1uUC7hb9UnkJ7bBaJgO0aqUYqwnjQK34Gq+qHPyYYwOzqueIFylDe0FF27IlNJbpwARDQ3p/X0nRXWf2FwpEBBMHCedUoZ8grum3dA63eQ+1rCaO3rpGcMUWbFCMcLA4LnY4ZohZc/FEWwf6DMKcgHl9uPFA+If6lway9ZDKV5OJwHQe/vS/+8ggMRwRdB3EvK0bSe89BmY1rFojKkOR+p9jLhV9HdHV4b6WOyk3Ut6i0LKjGy03Gu41Ko/aIjovT4zOImYP+4zJYyQecXjYZxwRdvsPUIsdo/dI2Y7urCqvvHJ3GheMUst3FFLevLUWdS2/me7OCyXCsuJrv6AwcI+TGUY4JjpZeZvm9kJ3D9LamBHhbGP6dN5ydA0eEEYC0wGJ4jTgI0XUEtiDoG8e4WmVY1UAE8k02lqtRSkjSqlEg7i18mAxPItaYo8YVcToIuKJGHfGxJMpJVMjEpei8FHhkYmCx58x1uBhIhqOxSN6i491qxHAd6JRyaghhlL+wf/vfH1N6PFwo02n9sYqcpRDnc3lKuKWbSTDBeolYFyjcT4B+xV3E8KGh4GtSSTHAN0F0W7LuNcRa3lIHeJqjIm1VLR1uJWRaBRaUVotK+XtP06cztgyJpw8UhK/VBj3M6nk4YP6RhwRo8fHRqXlOyqpQos1hJXzVWF7RCgi7hzA/++DOWYqFiwrpuuNOBt+zyZBmNhnlUc4IjI55EzlqWlwMGgYPTw6SCwbHxw4C3XbPSdtD8oqslrC2b70WIZft1KJBojKKhqLEViMzOPhIsYbTCGJX6oDp5aML4gzYoQeW3IjFUsZDhyt7EpiB+H8tunP2ndJx8KxtGipnpNQ9bBrYl82WuYDsp4Z93g8E6WIIZU+rWBhYHDmaiSeE4Jeg0C3BZ/kmdtVBRJlKcatVGRaASqPwSM2j7gixh9MgZCqwRkkPyOZWmupPIAbKQ91fJ3VMPtnofPEPS2jedKxF5mf41s23VMlUy5z/ibIg6n8AoDsy04qvBzlpRYiPdIhQHgwVshKEjDxYUH2oqiN6X5GPzwGryWEGbjc/Rbne4XD94rdI+6IR8iYJkgV4XRhAhl7vM7HBohSR9QydmcFci51cEWLYFVEwMe8h6NbB+NnPASZZi36nGm8oVFTOtnaGU4XTZXq2wwe4oGsJAknC/cJYlxi6VFGGBZD0qrRypcx11FDogGitorJq9ZxBY+YSDWhSzZjyYjDY/gWUWn4LjqmUkKrm+76Z9mgGPfrkCAw3GXI7djWxY4qmsts4xoNDgPL84lpGO1ct1pCEyLdGw0ao+kLGQKMC6hMGLtEC10GAfrRhZjRX4uhSMVchpUbXTP173smMXiNymM8GY8GUlXY+IQy6rvO+wVwIyO6WmTyQocKxBU5QhFJ9wD2OHFkK5XqizG8SbU12seFR8rDIzg+sjUsZjOe1yLUq5B+aTTaBIOHB4OxQ1aSio8IfQPu7zd7EjR5WU46ol2byj/A+8XqMbrg7WeQSHXhFJMxR4zIw4NVAG/Dr0XeKTpUD50ngp8NcG/0i8KwZse1ZMcmGJTInsjonpYN2jhwSEdXRgbFtN9gEI2H0kNAEimbbsA3nfkxQNLxmt+f8zUWn5XwUJU6ojKiq8ObG62UG05mP1JdOIOk4HZrqdx3a7HWYeXDiGXw9VvufhoXFCO9W4CZ1XNMC69r6VRi1uVmzScra+EfPIaS7jK7NgshVKhVHYlw9cAhLqhGEvKRoT/A1Rjmd/FolNxZ8RGUuqDvqC08esQdTDZxkerCqUMyG2gmwME5d4d27VkEV1RlA+IpE3Pkq52QNWVH5EWCS9Y8sgdhOJq4x0zGMRt3oOxY7IdClV+/IVaYPkhSXnPr/ByaTDZsjeFI0XaB8+tthbW0m41UGcZfcLsxeATx5tfVKgAvxXc0zaA5Cgj4mcA4uwt0NBO1IRM0TCK8/cvGh1+/SYdxNtApFMyBxIBSF+A1l5WupOUrHEHnwwtseuAakdUifLGKvlTkUpFpROsVh8cEMqqR6sJqJpbE5VHL+/kfXi1XgTo4H0/ECJM8XGzA3MK9paOZTn2qojm4wZBbl40T39V+XZAcO59Dkt2/xW69FcH9A900FriLpOaZ7wV0HlhSv71KpPL5xUu0tXy7t7rVOCKmkUiV4bSScWTUWblvDzK8WEXjwKy4tjKhnibM9ArAGvp0LBO1oUrX1RR/Ylj/Dq+8Wljbz+HtKVaIsH14pTvbeBQK7fmnmQpIck4beOztSpJsbquzkrAYbyusZUwR00mkyvBRk2TsHtuxoKquM82LK8A5WX1jYKVU38ZRDAy1qbRKX7TNhPhlmP197YwxxTUasxbpbOPbPPckQHLgGOBtyKVr2mqyRC9Uj92PVBku8zC1uNF4Kr9CK/lvSESR6wjal3S0szXCUIFKr+pOK+SYI7p9TXpR8u0q3BeZJukqCRy1Dw4eFMYJXC7jvtZgwZlYi8LJhiSFVyATUx3eVphjMqrzXnP5h4nJ44LF7c4qPIctw5mrtunCoSKHhwfWDXgbjl+4fkGnpFKvwDNXYMe6AeGxe394VX1Ugist1+R0RaOMH0N63HQCN4Z+sxmgmYY/30VtrqwUPKqIZhx+yhYerulw/X4VGxAju1tgv5bFM8Q6frmPxTCLKG1D5499uHDN+7/XVMjSOZl+adfAvyB+9kvdhZe8yXMHohSveTCtpHEC1B0HiMGj3akm6vMxu9kgbqUUZcM9X75P0QFUKisNR7lBJGyDoeePI+pkEtdobM6mBHZI0L0kNHALjwySFx8eeg5kOmTOO0Cr2jHv3HaXqDur2D0mELQg1YWJv8iIPdxaJVqjVWmMpY5bCDiM8gHfDVhZQI5dHpZXynCLqpPJ5ZWwp16CnsXdgVImCBw/kUYERHs7DyXkNhcrmB/jf4V1fn5WavM5+/PrvOBTKdRnmf5aiKhu8M0lDOk5bm0xVHk5KjHrZ1LCVuFXQd//Zk92Zp7v9x4BegM0Hep8ttIqWPezp/smLtWF3x0+v84V+g9iVSzd18pPwMQ6DWTruYLjW1aJGEoVRGRObqKf9RBHlxKKKiontAkl58+OAc7A9e3Z0CE5gk/bbYVpsQIrjEEO7sZqt+NL1OaDduNjjWjWt3sZXqzKZm8iRHS0AzjukLkyxDhm9TBmSEqYKC7gVJRQogFVoq2I9BAeCiYDkisvg9+bXMjOA2sVagUxmjoCjMAr3gy16To3I5hgstvyD567VfkMX4qvvpn73nlIRQ7X4+jXw3gn5QVUwLWW7kwWrJhNak+2Dc7CLS2cBqsavuZkK4i5DOAn7YannEiV4dPV6sEqwPys6sCWd8MVPbxfSEUOGW6n6nh1uWW5RKmLcNM7wlj5hN9Td0hnB/Zai78+QyzwWpIzJwr3DkjT6H31gvQqcfUgI0BMFhdSm0/a+/n0/fpuyqoi7LMHX1Ob6dtsdDE3ZvxpjlVbT8TwbyJLwhVyHL5jQq0ywWige9a9k+TNrHDuxOy5nx4lelHDt5vZ1Opew7/aOCgYsQxnrrizDYbB7V/AKjthSBHTlmJjZZv9OAiRWunzvz5dJxNuKQfztSesp2zhZlevxJdJwn2ADmcIGf2ziLSWcT0CiTarOm83qxlnRAxevpuyqg9zDyHg2jrxBXRBLDdgweztWqw0iKRbaT3NJbjzQxR/+1TNfHTcXCM0goZxjwedPaVQW0d3n5YOeAkZYt0WT6ry1VK4SBEVpKZD0aOMB7Q6lNUI3yxArB4TTlSn83CcEbtK9GOs6sQiRcwp6usLPD1oGPIxlK+UoWd2Be38OAa6VgVlaGLuX255HiJBwwfZvchOG97b+dal37qHjBz55NZv72dFKlXIt3lJQaYEoYMOZI+CgViVY+Q0Yw3lx+4xOUJtbpsi8ThuNNxLxV6GVbWYf35csQyorv1sxYssPVWGkvNiSMyuhPYYsn8cZGy6HEMut3zJdz26yN479vJy61TXr8Tj2El1hLzUMtRPjAsUhrthpQaKvLXVEHPxUIcbrYanQqjO1eU4Ii7oTsrVqmZ0nQ3fDseFwZD5lwD9TFgg30/X0o6ODzoMv+XliDQLlueVamShqvL03jGE8aDfSn9pR0GKGBb9WCpehQYEOoTdywjT4tYGFUQXt6s/pTqqAqeUbODneqjDqnocjBbffT5IC02EYQSnT9d4nsecd5/tOWiUa5VFplnwvnavqx3VXiQyfV37qNFCzjgHeYe3Dwyo3MbBl6xzFWnoXKPrwSOzavjRQHXebzbsTiMDV6sKstAuJXxTKgt8zKB2HqCD5QdkCNBcQ14OQw+Gqc/BcHq516ZMV7X5nqi2VBlG0fxwZts0lWbUHB18cg7UArmINe5Kczxl0jkUvtcxjEuGdD1Zdu1Wh1xdkIankqjNbfuptfyoZbha1ZGuIUfw9bH3ikB1M8BES53y0LSfrumQpfk+MI+VHodIuwxRiB++curE4R+kUFsX7enGU3ftq3BSNllcWNKR39ELMPp2NtlWHMoXxljKdy2TTNTmtsSTSdmNlJrGH3JjEUdROZrLTQJrB4Ho0zUOjgpzjuZEDKkiaZfxldPp+WQdrF4fOFX6f6ditVE22Hp2JRu5jBNSRAUOvOP4GG8pJ+OiOjLVdQ5HK1OrqjLqOrqY8I0tHTiYKhsEFg3RvtcEu4bMnwyP8jDTA+MvoXiahEi0TiRjXYXB2GaWIcrpxq7Dl00EJCWZJPQeDGuT6XkwKI3r2ZcVjlLG+uLJSFxtbpt6MvKIIOobaKFrLyP4fq/CBsNjSWCVfMM+XfNHUIY4s3wrjyecH00aD4jMyXn3Uabhs+jexTjd+Hde6rWkUIwVDPqStZ4i3dZh/1pBEPW5yCKfq5YAuZvaABv0bnwU5RDqyZuv+aMXvBcpHgsyy1s2h6BJgpPHwUbTw7heH8YGVysHqtONe0OpFDzToGG8IMXir+sHGDIW7DMSKVer1TrCMtxKxeg1wQjVuW1FDxtxQW9WdWb+JfN9zB6Bylanq0hB6WigwX/9DNeITIosnCY3iUU0aOzP0Z2outehshHxAaf5GikYRwcOPUrIL9mhSeXiSTvyf1rr9BPV2fPbGnYrtQarWtPLefl+z9kGQzyzIQWFY4EG/yPS6JWeEWRNk47xDl76rICREaNAn7avl+6sgVGj/03xgBSNr3UEhz5yLL5Gq3UNvq8z6QypOnzVrz14LlYVZ5hWOt/Q+r3DMJyTQ4oKxwEN/hXtiiYTTu9Gk8aINVXVGQcQLhqJVq2qUtTh/NVRwNdI4fh9frX9tBH33WI4UlbX1jYTd0Q1qnOby1gi3GoUalV3riA5AWOrvvg0JZSEZg9idj8JQ1Cci83307i2AFEMffp6CewoBT8bfjDdS7bhIuDL2pE9nRRzDikYnFZsZfiPQip6i8kkUnWY+JgiVvjXrWpPj3V0N6FtVH9Nj3k6pJJQgJm99SYMZyUFp14jqt5GcrG5he6NBuj1M8M+Nh+CjikYj/Cf+xFBCsgpQZ9A1/VuJk2WM4JST1Xn16jPnseAMUWsMFOrCWBDfFv1wP5JK5OiAtqNz8w2qZQlTR+7YxFtQQMmQGJvXf8shJts77EJUSz3AqLlDxSax2Xdy3Bn9TmJq8+e6Scj9/C9O6tJYKMilk/ITRW175SHNquDQ2+GxqRSvC9F0scuhxDGww+PGgj11evT4xoIr8gjACHvL+VdBgH6LQZgMUyt312wVKHHtxtgDRzDTbpedHW0VlwAe7ET2qdve4xcK0odbqQO3pqHOvzucHdKMznstlbGfHF6oGryccyGVBKaM6vDo35JmhEnG+LhRXYPGLr1Vr5wHVMQgjaf5hFWJMXkHXsKIWcM0eNxfpNUIf57586U/KV2eLXcyohSKoBbq/3uttbMJpI8akKjXWKZk8qYQDCOoN2l7PbVU67cjZbvy+RfQ6YivxTn3qOAb/OTI3RahCkJDEGGcHPahSyS2slZZ5sBeW7pZ8EMr9aSfcAtCNfxTb9D2EsaR15M3EQ1arRnwhnv50EGXcpeVuhG6tzRetUZZ0S8wWQyROh/438Kye/69Dg87vB+bqx851950oJhUZz3LR2YcJXpKUpC0J9vRmvXIvGafOZxDJfjU2xtAXHV+KxJIoa/tye3S4PwWGiGCT9IXHGWR4DpghrtebpvnT1BF95i3MkIcO7hed1qaRPPeC8pKuP/H151NB6xenxsgNrFwBC1dAFFDgNO8H1IJYFhvfmsXYskKxzljn68UDiQVWrOKfIYF6cOcoY7DnO/MFJ4DJCmlC2MJsI3LmijGEq5lXKj9bEj9Ig7WPSKpPCcTvIvj9jDvVWAaOrwIka7apcSzrj34wsaeqN4WOWkFzXOl/GToMF8M3xgLufq5FQ0avUn/lmDP7gotpZ+jxE8hpmij81nCynCjz1BkCaVk0tS9gv2VXD4dbTmKeiaM0gF8MTJNBythljOV3rpeaDr4vlYOeuMxEFGU11GEnGPRxNtth7e3uXJSqzXR3gvIB7fTPaesp29CGJTZB5FINNLEuy8fBFrlvkFkcEzmNQ9jY/EI1HIy12NBw+yvqWMK5h6IhXBKSejj9h+VBr5F2MVjpfg3DqFnaXO/AaSOx49uNMesm4in1RqOK2RgEahw7NrJsva3JVGvQxBYNNLrrJB7DmkPm9+pELWzn2D0UBWJnXrd527Zcjxxh2cQSma+8eeMd+Z5C+q75XfVcqZM1rExd3NJdW2k1pU1qN8WCpM5WhbhF04vNxOgepmGIqaxY50fK4k4GMmcY4Wgsmt5N0HOo0Ry+8QpFcLrE7/Ob9sEmBS9yReq6H7f4x7qSDRWow0QjHHk9VMIKPh90v0zUS2WnKo1EQcQuAXTIwcea/zM8c+G00Pv7+tewgHV1jbD7Kj1OieFmmuzziVOmkUS4/vrQbTvAh0SvsoikO0GN7h6vRDhOGAaT32NJNaOnYQf0OQO7RbcFYmxdXoWEotg3MLRqNUWE5h5k+XTflHLTHRz3qKUdwv0fW3VB5vtUTuPz3E4eVipkfr30YzN5cEPHYqBPpRQzrbjsIhVL4O/j40BnR/r/lw4GJStz7UjdbXeYlGhjcPViOJGHfEeylIdeu7e/RYWHHK6M/n+uS6LqCu/b+MV4T5aDVOEe9LxTUaFZY31NaxRWKvx9a+SeCsHGCINn9Vq5KU7MF6F0eQuLqktkyiOd1Y96n6qqoemtarwcIkQZpU/tFbRWuxlAkGK1JSIEljCH53gAUoyOnU+7fg3U5nA+FL84ZihhF3mvBHjWkyRnq35BNx9xrc/jWQrYcgrilS32We0ez1oojkUYm53JRgqwyaK4gd0FxsuReICE4sNSt/Rq0pB7ALKkRRTJj3EaqHmWY45CMty+iVlCn8lH3BmQx5e/g56ySBdepq9l5tJvGiKAmCWmUq/HREI61QuOHexWDdCr0Dj7A1qUnZwviT2Dxm4k2J+msiq1UH7+/3erFhygQ1I/tyM0fbojCefQb8eOAgTTKUNv8fNbnvGkrrsqGZQdX0DjOWWmWnYI+JzqxR3216sAoQUx1Kda83+IR36/pn+YJFljny+2V4/W3YJ8e8w248Anr0+eZQL2PM/kdNW3i+hPAdjEMYDz/kTgPc1+5zlRTBhkQmBmbCfUXqb3JvEbzb8t/fpiC+KdB6O8OltM38R6XhcnF8F7uqUqR7D2H/CL561zlOhzjdqEHv27JV4bw/CwFqxk5JeB3gdIQp3cx/1GLwzlN6r3IdhN5yF4Z0FvWHxwbVSA3J3zjKCPdW+V/aqgJ8EC3urZO+rzxKwrqBv4Efbt4/aiHl4QUNq+iUMlYMT+7S5gB2nsPfa25DakauKJ6IZh1cWVYBRCSVn877iPXZFISz3x1YeNVtmPOPmjmBJwmhto6ufAf1BcQcwYFQnykcmDhoxdsmntTpVkNV/Mvffc06/yMqCaN/GsCQlU5ltj6KIYPEqAg+rxF9OHi6+V46KbszGc1XAX6V7h4MF15BakFmMwqPZXn7Oqu6sKngEu4t2PlQVBvS0TUjAOYpy4x/1GQXgQ8Urr7kqVUnLR0cHkioMGKoRgNKFI47iNHjqcpxtaoOi92KzhsNFqYkrP01gEXYZ54a2kz7rWoSQdamz5tfzinqYvCztZ+U4SuM0Rmelf+vs6oSYy8jlAidO5aqqO9NAKeh2NbN0+wg3EkEWRvvVaL0qvYa/NGhsxAWPAJovNsmRuw2Co0opLyol3uBoXvwb8kL2yiVeDFMM0s1SzMsYfhFAFkbX/d6caB0a30XeILPpkskcXgwedB0F5c/Yr+JXs+qanwAL/6t03koCSkBlXidM1Vz1JEYhndIZG24apf57LhhRrB2nQhdg1J+nXa7bTrJYVIOcGmr2nFQVkIUS6uSMOLbBbiPoZoZGiM1w2ERZG0y6Ai3JeUQQadBD8AtvJZWu+3/3q4HK3X0sHx5ziJUi6eSMNi9B7gvO7NziyEXwyiG5wLI2nRQJKaH8VOPFaSUbkAnQUjgEVrQaJI1j+PGyn0tV6s6MgKp5Pi3Lv5FvUpC5sDK492A2XlEhrjlCiBr472ng616zNbYQNoxGnCmwP3Cj3bRYre97m4DqKmD5ZFI1cG/+clRjDIx7NP21cfmdcU95VRa4QZAm57yRrZudooaErjSUVY+CaGDZUgBeRw7jAAIju7vNeMBDXbbX43Dw61Ga67q6lyl0e4mihmIf+8dJJnj3nKqwkcRVXVnsnR09W581Ok79eNAc01haCwxWxie3uzsZSeArE2orasTzNYYQdpjzIBvJQ8MJgqa67YpJ7W617C7TWUZea2uJAK0a9RN8zKbg93rrP2XWbtXWYSp15fG7wOOW0nq5uW+N1kxhaxN9vjLLQRb8pros01nKuURQXNdY3Fwm8rCbR031PkjRZh7+Wss9f2veKelXinEm+2lr1L11Tu5p2WszY9OxQwrQyOWmw2obWtWZuXYvlE4UHl3tCsJpXb/cUH8mIcOYwfpgCMBbFvtsGE/muq2aSejjYjKyp0MV6sq8xyeBs5WEGWDvkqt7657OvWV5r30LQQ/q2VuuUx+Q51bBLptFLjv75qVooYMbxPYVEI7j9p8L/oLQrVgH+DK0iFjA2T7BUeeAWipbsTJpOwttjKsak0PddxWhOZnrcl38318UQoZ6mKw8zXQcf3kcQpzV9c0Q8kEKR6FtqmUFMIF1N7Cj5YGGB3gHhEyHC0r7bRnQsmTrMGTlnw1b2rDPfORuGYIHcScFjW8e3lo9TKIJ/mAWMHgi6kHQD1rqdfUTII262o4SO1WdedVg8vQ1QZb9oXFthIzby0tvTDDHYpH7Rgb4DlCvczfiwkMuyc+LEB1RP5gjXTbDJLRBTMp2tWq9nRXR7AZuuogKbS2LWBVQjGcMxf3MRT+6wSihhOcF7ZqwnxVURQ8qRGniV8aZISAvCithTCxJGavhan/aEq5Rl8qilpDlVqb+rRfZWgfZaJ2FrsRc/F6C0Gt0qwT/ajQjg64goXvHxEYSVqiy+ABIWT9OzSRFoV2K+9YxQeLq6nGWqlg8U3mGUpEjyNu0RlQp9LbSxKLIRxcj5mYsRNN6ogMRygehfUcurDuTBYdyi7Bc7+CNNLCA/DWk2khIesPjdEiKqkRlWFVWRZbaGS1hi5jee8yIKv782q7NxHxdSspWVc7zgfbCtmOBOGfMA/dyKqH4HrLBOZ1PqxUfxFgv3lTeyWj0Skk/k3QLibhwGRB89x24pF6BFDLUJI8ltFxYw8pNYuwrdbSD4/78uh1RA8jtnIBXU2ZIbqC5X4msCC1zEIPKxmqPw1/5YI5lQkeAbIjzNG4y44DAKCj0Ed4RNA8BuLULmZq/03tvv5WwtEaoFU/PfIsIZ0G8tKVS9EnGtKQWxdMGiIoQxszcIshP0E/k4zQygWvCPYgyzlMAKTuL/7XhHmLOhT4QRrnEnOcTlQab6ZGL7W5FxppraFqhac1CK3+W1wk2Qt3P+MW+ekmgV38C2zn5bMDJxgmwxpzsC7XCPqZ1LVFbCe7EMZDh/I+AJLDsPcCjbvHj03qazTNnqeLzSMKLVUxkxRTKQdvL0OKaOAWzrrJ4am5rCoDDEGGCPOvdC0SJKhFuNaxsja9vNzAnezuFUAW4s5w3wDpXhwZpKthbnMZR0TUFqrQmbjGQ0UsI+FBWRW54mQ3voyuJs4msPIAMUWqAIys0OzLUWDaBO7zZoR2Gz+0owtsG707MDwAqYp+hj4AIMl/WqZ78QyTuCPcaYlXyirEg3fx0FJDlhq01Vp8hhIR3y0C6SaSfvaIxEC2nvWapUvI2awY3uQeKGYHVwMnNOePw8yEXMpRPU7yf7wazbJnxrd6KmVaSsq9qcZaya1InyWkE3ziTze5rMqGg1fgsEwx5LRk5sULlx0+aJq3G3r7sOHY95XHR2cN8MXmPyBBbHONrEKML9WCVtnz52oJoDDhQv8OXm3buoWzbrpZVPo8PKzcC0NVM8+uyHHwj4rlZls7VrE01B825/4D1APyFtSqEuZSXccaZc9/5t4q6lrKCWr/UCUOVmtAVqF79dZDsXIyKqtv5oF3npmbn1H1Z0ZgV2Qxs+bUzaT3MDaQQDY+kYpZQRPlLRK/erRWSsgUgpdzRCiVb5hWffUKxaOeLie6pmAZvpCq9v8QUNmgWediWzZnxKcHoTy0Ix1Qi3I/Bq4y6wHKBUmM07NJ8hYtHGaFMZSyCs1Wy4lEavBaYWn4zCTNQLoWoR+srTngSspzWHNO2eCTXhAfJ2tco4HVLN3b7pUCVL+CO4C/m6z5lorzNlOjKWJU9S4j8wiwO3HfZ7qvFYHUpzyAxRJ6HtzCWdcy3Du2ZKMTMzMLD7WND2L4Fl+pNOHvX9icmHQE9YroGAgvoKeaQqnQf883QfammYwoItEgYo7SQsMJP5DVybYafEYgXQMxGI3KcDjksSUIH2a+tVVvU2JZMdaesPceD7cUoYbUMT5hVX9MhbcwQT7OXWr9reLZDCmm/nwHYNF2iBldS3QNxSpsOIxuNIBhVW/XfNOsjx/R5LFMBzb5xaG0D+ijegLXlAhW6Gq67KVbawBvgp1abCWwz0xq0zUXu/leNht9ufVn/FfMtoHcPyC+l10ExwcfQeuyk4pfIvBew4/juWMT9iUxlao/tyZDiUjTn67NmCIynz8Ln0YNc3KWSaWaXZbowLpjGyzIXna+oILW/v79PyAxXNAgusqpTAxnSnd5nESLFcRb0w191sr76LHLknVNx57cLsgOJ+N5G+ZkhxOGWqXi8yGGNSuSI7SP8c8eJ+BUB+RjoGNiWrxFC+0GECK7402VGLaGz3Tq0LUfU/DOYVLJN1KDeaZesLni0S4Exni9JYQ0KdeDh8UPMKNXy3LBtdH0rCuYFqOsEx9jxG/lnwTAaOpoJXCePY64gK4VeScbCoNpXjOMMB+9TGBo3LzEckLv9fXIvVCTcqn9HmTYz96z19X/pcLxTIm9sQduNDgLV3vZfSUDtCphN7qmZNXIaZUNHJqBg6ZtjiUCtTl0N7vpKW0iPYnZIzSpYWHA5AD7FitL5q+WuU4T4iX/5828Gddg9COWEbZVQ23lp2tOZlgYDsCaxNs2Q3FzzLAIw228fq2wth9kYjiWDnzU24wSJJLe/8x2N+7XhMjs7VvdSfG77w6HIhWmRe8j0nTWtSl9IAtWHWhpxAybbAcF4i83b/KvYTNadxSgdq1S7iKxyNvNwXRIEOm14vAI4IXXu836w9bIswFdw7Lrn+ELhc0dSILAsMoM62iSusQy67nitnKA9rK7HyDI2/MwYLQOTYYrLYdxo8XnMnOsZXi6r7OubZliH5sXLqr08c8HcDHhmKfZpVqfYSA6E6iHH1rrQOpWnXf1wGT+LYtAivAP/AFTYe8f4qJOJrYyhlVrkFp5NuBP18As3YZChUBdq2bX3BI9CDpqpHKfHTkeyR12AhS0/ibtFO/0iWtxK8VBnLCVJtPJXtfIzLVvqx9O20y20NllaGaBIXGx6L3PjFSx0OPh4gfoF9sdtdKexA8TxBu1VE1ji8/ztrqGpp8r4rTN7ARYgM1m1nPd5sslki5xjcbxkddbgM4kvPeRE9dKkS+kXCint5taGi/NIazgmx/RvGp/heFDdELYhto6kCoWoKnhGAhcXSOFujVCDzdSlAaDvdxy4BqhedSma3CmsGT6oPqDmlfVd1YgQxJa1Dpr5JD+lgZUsdBt+DhttJXMCpMmNH5Uf+ASupToJpLq6mPlFisGTrkO80q3PkM6uta8I+4cyDHaAvYzcf6mZ9BCe35jDB7ua9HJFJbYZDr56dqdV8F5V/6ZwCoMMaueK71ro/fioqapuwigaulfoIU84q3mT/mnkq++ar6he6xH1/bsfI306ScVNcP3JzKnCtMR7U3MdJXhnh5I/1HPAjQrMiRoXPtsPUIykxqJ1Mbku7/gMnTtz952D2R/O3NvjiG9w4IlEuN+HZvD6dfq3mhAY7/8hdrn/qPycCPD1UrAQitoKE1d7eicmklEdybDhsEDbT8HMvMMLaVdALabccWRnR1IDyqB+rWyf+6taZ2tyWUMz6oYgtvm0uiSN6wrivnV3K3kwG2lk0kfPJJdss/9N3n/FoED7ywcrfYHr1XJ0KRKjFiqMTu6rVWOHWMqZUdMFa948WGPxZRjxyhqNdbYsGqVWGKJlVRSSfu55bb4wIG312Q/PHzmmex2MllQW20dOM3d1KxA23a0k1TP/OMlbDqBm0/+pS4O3dPkBoNsPLiMYHXrbUDDRdI6HkEn3m5x+KH9aHmIUn31Op7gtYHalSTNHmXcW3DvEffjsajtBR601fKGLFXiLSOrVc4OfSjMTS0fhW6osYhllFhJBbmFZRWmRZMXaSjZTV+4rfVcoebsVXpf7MPFzPOwjaERdqSs0mgiD5RdkSMBOxmnNhxIXNtsPXISg1d0daB7EQ9dxkrPK2In4i4mV4gv5IiT3p/FAK3CtprF3G85+wTUq44AfTRVzkKHIbWNWcwscJN99Tpp7yLSWVJwSWVqgbWi2pCPjsdMzLrq60q7AGyaJC75pThhm+/QYfyd76RttuIOotBC+gPtuoFj9DpCJKtIdRw4nXWc5/PC1cpi3VHISKBVq1ozpjoyiLxWGR8SvtTMAjd5kZOupucRIWTsNJD6HHHAm88mgTNMylwKq3W7aIc6st4Xam+VKQKPGRFomr1fE7MXMtH35whX4z4iukIIcR3kFvGF4tFQ/63a2UQZz+SxDKspYl1Xbeyyy3uXMC3CsMgzYM8izrVKf4qZWpP0yraex1zqb3exfw37bJGeHjjN+tAwqVcxPtAyW+PMcKOBMp1Z7JWrO5fOmZV1PyMUj4usPDytos/RqtWUMmn3tW555UZPsb2GSmhwwxkLjO6Nhs0OtHWnGJQhwUxqDAOzxDrStlqUekHoXn8PAd8dNIyYzeMcHJU351OE7PC85rCbO+f5vcPVGKrWN5dkNfn0X+gGcq7gFCttKKBR33/FTtHEJwDvxLDCTCo7eYaD2GfzONhQVjWvCHWh8pPGDBpGn2CzTSGijimxupPzK+nnZJusoLGYy7BqEvrYff2VLL5JT+7ui4A92RAIc/NZJzCfOhWZR0bVsbLWOwlv7+KgXlB/Mu3Sy3hCGe404GcAlxJ441zeI91wNj6vm8V3FmvVRryw0MF1eQWW3WP5DBXMosbQtxGJw+ifRiEodxKggzYTHGgWFTMu7RbnCv2ceOVXoe9O53zPyab77TUYrWFKJW3VUuzYWeh9I7jepNm2jI609BzY2n1BPVu90G52ej9gyqBRttKNzesvWGH0m9tHUTuCsLZNN9noBoJYtRe3x1/XNGZ+NdmeOQ2zreweb7NN7EC/oQLl3xM08e1nigE0ytakk5nAvEN1HZaMox+C9O1QFyDEIHSvnUUk5cOq0djqTkVOUMx6gYn03Jg5NNEOXhjb1STu8cDcLX3w3lVMBLTJVjwBTKdWbGVswzulHxzJV729TRTtatVynAX/vMw2j+luDCzI0kYYapp94jbTNx765EAaFgHiQSF+TdK3OI4IkAW5litYx810Ku5000fPomOr5qPrLnlj+Sg7wyO9W6SZpmyrIobN2LEuC7vxYOIlBEfO0DWIHbTIVvyxeVwVcgkgtxI6C2TVyV9dBbt3tWpCtsL9+71eHCj3Ul2Aiw6EGZQaO2QuoF1G+bCkZIMj5JMNntdTLdLN+BkKAijV+uYBWhG9BbpFwLUMWcqvVUOy54HA80l+g2UBp9XxHMyfhU7lJMhsoD5U+8Ac87RgSZBSqtEgaQz7ty9tPFNWA7BYEEmaLEN25tNKU1btRGVMr6GiOsA42AZMpV2uX232NIb+yGN8CKajXSjtq1MdiLmNHlRzsKEUhAknkWsYlYfefZEUe4JP7FX6rgblVnljb7jR8zHLJhlItc1h79avlYde1lAPHVTRV5j3GhtECsOFH31ixeCHGh3TrUhrbe/A+JOMmz7CZY9k1ai8I+/W/ceBaT9VwsCwz+wxrsRwCilrjRn0nlBbB3iwe5L7G1mp3m1Liw3Cgx9+b/DikwGpGI42wo2UsaIHazJNdN2z9tUirfxdrRqW6XDGPS0DY2b9KWdult2JoTwybszXmCl9L2P9BGMHlbttjh5hkPAs+k7DylBQXnZcRhnhrpZhiY9f1G+v2yIlCgM+oNVDSZWE0KCyu6b8upNyK8Nbor4DRGm1JfdWKUfvVYsneoyIw8MTRxrRrgOOwsPuP8Kjh91/zvA9Uk455c2416h8hW60LuPb28GLthvqVVcNgc/i3O4ho3BEO/5rALsbM1Qxd9ZDgW1LFMY8HYdEqJg5iw7lD1C1u71WnPBlP8bOtsYpIwkmmaGgrZFFFG1wzx37ZYFTJXPyReZ2KGO9I67nQcbBEw0QlUbUVp84Qo9Re4wp+F1TJL4P91OsUyMmlfGzkhlD8Kcavs763Fr93CikvLXmdw0mG17WI+yAXHh9YwkDQy8zpzH0wx0/jQptcPbycjuqDsWDg4pdb54wRAZ9AU/RJTQwUI8ReJxBQULWDbuXYXAgeArBpMfKeRl99WrUQXnseUngglFoubHyYBWrx6gj4s1Y9H6Ej9phKsnPGlvEaCL+g4K+diYBAhSdaS4mFDPjnVUEXwgMv79J4CqaYc4df52IYb4sDD7yAWU/sVrdtrWHgy/7JHumn0L3eEiL0TkuCtoacUTUMgzZSB+IVfcyEKbeehqx2R1dz2688xIt/2Ov09qr/hYXpYYwMoVkXEGuu11fVFa+8+84aVOHWMuojXNK8vu0fWEmIEG2wOVDhyHcvDk+w1lkhogQI77VIrzikEKE4lTKqscIYUDwi+29udv4g2i40ZhYoqRXsjorN6DtM1yNjYP1KZR83O+dRWRSAb72Vh/xdFJFOP1k0slYg1FGxOTh3sK3N7+tmiYM0ErYnJos/FFLAO90IvNmmJPPiRS3yRz+bD14WHQw+wP7UaM9Pyha6DMkZ9/8RhgWw5ERjZWSyq2umhwdpqs494S3kx80qRR9hyEQHoJROuPLULVsobQwWWJMQewe6wuS6ArXYFKQQBdAVF2rmb+AGaZr8Kv3jVOzEFHnQFjVhI95ir8/7iJVB48Mf+S7gAP1zfG1H3WtGL3OIJV0HAdbrhFJLbky4PmJvsE+Hx7UNIam7/NrRhWxsplEoRWVVMsmAfvjnJZe7wg0Lc2vmqNkaMkQwk0ZeIS4TS/6W4o6FD/2YUHF9uSXbCRSWzqAoq4HjTLCnQyHXUtgAoaprfGPjwPUulPioyRjjxixh3uv4Wq9TseqjkhkOHPFWd+fXOCa4c48zRkw9MEZVh/Pa+0LnlJvxKCn/Em1GcyFdGOFhTs03HG8gVslHZVUu1JJfNjA/rh1J/CyPcgAGTy/X4gIxgomwARffWONuNVmfLuV2p0qI5ceRogaVvVGgQLX8zNn7pQ2QxLuGE3ARxGxcEQGyMMCdVEx2MJ3/CN5ORRo2eo2XIsbSyCVxI/wZk94ZrYfFQjQHed3RgBXNi0ux+3jI3Lcle+relFXhG3Fo9FUqszlgJMQPyhDV3NGySDDHtwIJyOiRyoNfjfnpFTlGBOF556bgcu6oXt9szXRsQVSSRxfYE+pav6XqA0yQSKuaapiZ1rR58fhEY1GcX5d1fIxlXHFWRCGlhJ6LLOrXBAYijJcx0WM/pRwLQuIMW4se+SgJr3qhgk9Bd0hu5msvEart3EEUkmcREYAV6s1kfbvbDyk2IHDskzfWIecYRwROc4kURXMXW+yfENLcjBffwinHNVHF2jG5MaT4TYubFa4tGGH1elg3GQ8oB467ccAT2ZIg3Nb4Ut5cU1UWVtTI9xr2HlOVH9DxgQ7yrY3HVRMJqeRxBPE5hG1hv8YSqkYZiuqqulIuocLcMS8r2++tK3jZgt2XKMBlzasAjH0Fb0H1XhT1doQ4S/qBrjVEq1WNzriDZSV1MThWyRtTSAsKyN9WpP7AX/8jibZ2aQpJaOJ8OB1Gb/q5JnR2gQdjKQlnh/2iz9LM6ZMiJ4IlSK7jH4qXNZ6GTqcq3kvlVCges1dOhuSgHwJu7Kscytj9BHKMqLecFOuQ5MK1SOQ4TwIDgyuadqD5XxUYoxBDBZutKKt5aoyeBW+VtbTpz6CZBhmvrTHZ/gBlSQneJ50csgVoTBAJYStJwhHOJPBvmwXsStNOA8yapWK4hgi3NW63jHSNKgq//4gKpgEaASvaj79jL6jlpGLaqAMZzEj6wr4uOaWqlWG3gy/oob5d4PwHMEgBlcjr5GCKuhUiA1+p2Gp5gfwskuqblO3SlxZVtQTrb9tQ13rVvFKDwcaw9zotJLD3MFurL1VAB7L2DDfTMqS1+D/cs2X8ijMLijKi3x4jrB6dr350cHoLqxADVRIDxX+omFt9WvxYbX6ePUVKSs0Lnde73I7A8Xz/WTfoFXy3nukT//aKKRqVDgWJehcyo64e7mYVwLX1eLcihnlwxIQLG6TPKbsrpR//Kw+6z0Mn+tLrMikrVYvHjSmnijrSUaS9NujZgfqsz7t98QDiUttw4kQu41CI1Hl6rI5Idd9ZSLSiTXr6RvmlcB1RR+GypRO5GeHDcr3x8w3xrdTvM6UV4gCPkM3yJ0ew1PsB8VNIkNZr/sf5+Aj/5v+vJ+slUIofoUf8bGXaVmRRwwu4appH3GnB1j/pvQTEobfbraMAw1DGqruReAV3HTq6nU4BgVKV5wyWQgfvt3IzGkemJUn56vcyVBWF7t03UJPwJ54zetHCo8ALlJT0WUCyXwD1OCqtGLzFHPlcAoY7+swrwSuGYqg0oYwf3haZKvEaIp/calsltF/CGTk+k+YFp7ukUDsHooyeDclGBJ4mu8f3YIHgp/8DFKb8cSjjdiMkgZyb0eCRpYUx3CRZpXANUM0qkaBH+vs4DyZYI6R/QhA2f1LrtkHMKbNZaWePsrl/sTTS6SCOC74yOR0/Wn/mzISl5qOd2l3M25ktKoIzKUrBNeY+r3DEdnpJs0qgWuGshuTCIzqYUkILG14DR2OM/1oRf9pfSljFUgdyKc9tzSKm2CipNONZ96lntoujzxFkJqQdxlTRMriP41rSBFc86nz/gg7IzOMkOZUkeGfCDMYII+Z5AP3o7coHY7VKlne5tclZWxyRTk3ZE8P6F+PzUNJpxtf6ld/0hGuma7UktzP6JwnFlsy8bpiBtYV1tazTmlOOZjF8BJmxJPP/61wJVtH1eH480uTisXE4JuMxqGQyXCl7Kn5+ykKqp7x3/R7+gH7nAhILcojjSbCjdXrtCooIq2VHOep9QKeXSXAcvOUDLfLNk+w+flhUkU0uP0LHD2SnXElOH6Acq80NNY/MBpQUA8jIpCyeqJbGRPKUJDYyJhhRPDIIDUsv0+tbjXcyxCxw8m5eLZuvg9fcBvr0IkHVJOZUmnLL4/parxW8HivzuNldASeTLHdyrIxPtYMa8vNXp/WS9fpoqQrPlL7crJJLV+8O/WwtFRmqfDvHgcb8Nes+IOZJ+1tGX7EjH/UvsDHX7uOwINAVgqVVTuz8WlGktoO7DuyVtxfldqeMySmTUyNsOOjEWL9MFbzvdxZXXAkZahCqaEeNUeUqkEzKoHkvwJjYGkM4wH2JvWKRekIPCQoVNDmJxufYTPODSVg9cRjjtpDamBOL5lMxrgi4o4YdUTsHjF7pbyZcwdwo+VGqjh3UlFL+a19d7GUAXULaXe7q9GvX79v1lpr7qWK81acXc2dLcy9RuXRWqX8o2qppeGGR+PR7lgjkplIMPHkkYmpE4ROatbpu0YxEFmtkoWsPoTB7j3nlzAkaJ40hjcQimZc0vQKDhkdU7pSzp+pTMUy0cNn6EYZYsawa9mXqHCrNY1EalV8t+R1Mxulx5/1YLWwRL0t4K97rEM002+7u55fDzJacytVnDc3WkGWFbVVyv9hrF5xeIzW45WT+WmTSH4kqMQWEx9bsCtv/K9Gx1LqeELaWRrw1gOdWeXnnKdZAobBiKTBZFseh74meiBFSltX8+++DcAL5wrsfyyrfWlSc/KRk3Fl1JrWZgLkvyVFOh9z6ev5jVrKXS1vQbwFWdaTprwyjx4NtzvmiHFHFDzj+H/kSDx8J8AX9xEhpJH1/qw+0LWW6CTmSZnAMEwIirAuB06McfOn1RGo4+OUaEIzJngW3SjzW6mDHBe41XoFqR3xR3/YoqOxCuItmloe61AhQ8G7a6pyj2UI4WeTtjoFofPreJbLMU/UDGLkbbYFrmsGXKF1KjBfMFl5hBBBN85MZu9gGHdGGyG1IF0mmRFnREG5J3rVIFYTxWHVyo+npunedQ7qoOJkPWZJY5iDMa4JTppEDqhK6+wGjBMUeK35aXXjrM3Bo6xupH6b1HhYUcG1puxGy62UxzKsJo07XJuQs2g8gvaVtzSfJtgBw1wJxx8CG9csHPWUIcBEQXFbHxcS6Mbp7/4sHLgiHnMdDUsNx30srZaZBHBoKd2kodU7C2lm7nwVA38vU2/JHAHDPEwZc+3YBsRmq9cR6Ckozq+YM4NmUt56HVbb+AVfV2ozTB3GGMToEeSCJjQ61756kTeaqqQd0MYDnVX++zZLVk0ehvkSjtE9LWDbwr3qHX50BJ5Wad5Ef1ZoAIqzcpBaDt4ruT5xC1J7YdLJqDy+1tN7TZPKcLW4jp9FDvDxsoXOK/pGLmaOtJ8j4YhjuNig7Olg0TH8kydWWP/ip9YhDDmiY4cTQeh7SW3FGcLnN/xvI6uASIMc4ajwmIK9ghdXtmc0RxrDQoSarT/GQ95G39R+lKVQ/yNBNnK6nORrdcAgM5baCekeJnqvIFsacRlW08wEupkIqWh/RLeLNJvsjKTNkIyQth7WvwPsUCCufLleX1FK9n7T4ADWUypZhxOjzEtamilXqX9ihB5RaazQiynPNUfPIoQcPJ8vkEAwXGAImCGNIQWhZfAhjw9wcjxxs+369ympvddw4BfDMkiShYGhkBlLoJHKXuqJ3Ul9namPK3gJXCNraB4eTn+2QPxrDMXMkPb/Q+QJ8PHAaRI7i47B28WvIDHrWKE7oIO4DgPRqh78j2ofDc6HaTaAJojKukiuHsbAdW2F03ygtebJ8JyhihnS/jlEZxNwYdPc1+6DK2KpfoGCnDjYxvV1EPPKzeqQ0WhVo21ue0TCbo4vtGrVBhy8Fk8j69Xf594FV7YwJ+BvdsaPb05tHx7c2SS0oyNDHYOPVI6MS32frcNYtQEXzj7mv9Yyt00k2W2AaOvQEnFlZi9iYCHp3UAC8fRmSGNYg9AxDc4SZYu4Su1cfOKKudjcf3AGanqYmQFZuaYmkCE1Clp4+Iw7BCjGqil41d0QNeKizA0IXlnt3scMaQxrEX3twKMicCU/OgbhQlZKERAZKkDDYTnEra0O6X/G2qTz8BqitXAj9TFWrcG69sq1wpZ9gTFHCcRztmR+tOdARNF1fB7S1vrKXRTSw/iabwNV8hqGlyGDtG60VqRBJGvGGxGLxQI0SYqdvHCdVTTXsHOtnHZa+TM8Yog0P4aCkGGrBCOe2QCP/erSdRSml2LIeOF36kCucihShtTPpaVBhk/et1bJspNrQ0J2t3uo9gHVNVPTrMyo7ThHS0Codc2rqED7dQMH8EXCkJ0ErAaO/3COtrhtUkmOAYqxahf234qrmaXnhU+f+/NDNa1u3ox6RBPgvnbIqk0cTYjXrmifZwJr+N+BISUBx9yPhrjtUZORegR5M6umYW5ChpX0jpsEa1o1n57IJYarDexM+RZ13NGE2M5coQ6+W4kG85KjYCVbajTJF1q1ahxuI5CIR+/f+gdeXd4YFppP4tZ5/21wymCq1VF4sgjbJODtdDA33pTVABbwKIQ22PN0DQfJ1Kp9OOxadYg4bmb9WnnGPx8SiJczP3ob/3a4pgVwGF2ldnUROgo/FWD7mvAA7g+K8/YM+ipf3HdPtECynl7ZnYadm5JaiG7rWCXf3sbUU0yYIadss0nR1gw8wLXb2cE1dBRyob+5lB8c6GDWvA2rIbrTysr0Fz3XdXx7LMOqkZjpi3FNpkmfNx9EbWABwfARQxmzSc3qtDXC37/Amhaq01HInv42SegL6HAeL3+Df5b+gqnf8/kp+3e1aibW1RbXJ4TX2ePzSSASZqhtNtkYmYbEEsHBo3eqo3BA7+StayWF8YbiyQ0nWygGDdOuNLVdtxoJWLUUi73XCK4xFVYCXzUz8gYi6O83myzMTb1GOM0HbF8ukI5CTuT3RwNvo8PpfC1XgzK0OZrywUZ69USLtWorjriMj9J5otenG7wmHjuSQDyh2dEYZsMXhRZwsgDrz1DRT/QoMGDQEaxjCFpWgy12C5O953/04IEbbCTN0t1EyCUT5SnB82pjzWZHY5gFz5ExOF9svetcyOWTZafUX3vN6nUEbmF4siC6jsjCVJ9qbKZjqxbj4YSMJ/1T05dA/NKKzA0wTIMv6CJgPVsfcFQdBfuOiWvZPQDoGHY/I5o6jDQTXTIICVi1GcO04Dta6M1DcfGdSCA2xhBlbjSGcRKKSS8KPCJI93a++dFRSI+4mdVv6CroGITikYjhFruH6d0zg2T2vmOug9QfIYN0Nf24MdfWpd8CR9Ta37Xv3aA/HjW9idnhWRZ8/lldzgbEd+o4jj4e7ZeGATqK58nFcFu0qd0z/WSUEfCKdhxRGdHX0bHbWt58B3Fn9bUF5TjyiHaTSWb8ScETS6ZGLNM/wDPKZS6z4IJ3ncxHtBtHxG5f3c49yiC+o9RxwULXIAxMXbEpBgJPIOA8Hgv8hGbHuKkwjIXnihLsWkfPrzYdhx5pW/cbCfxYHQPngVtZDfPPmtg9iRrf46WYBQQIUvmPWvToI3bN1bukxKeS/KyPSLSg94vC6jIHT6BV04Yrc/Urf/lXBHc3GcN4SKiZEbOjENIZxsATB5Me3KdKHLqcjbSa3UfqKHYGwtOyGsbwrEzpnmpGExHAoI3Mli8Y4C/M92GD/0i8d/8u/9N4ggXsdhFRWvmOWoZJ6sISiYwL8C0xVOqZRS8LMJdavK8DXPYCPR4uOg7u/ZL2Kdcd0FGo48pWw4hay4S6/XcYN1YOilh0d1FJLexH/dfjzTiDMmbotAevf9yNlElR4RB5rZr5JhEQ5VugWTRwFk8PL/mIPLgomebEKf/XV/NdwZ+OQpeTYdWyGsZvNZlbv2ZZfj25SOC+VoD9xhkx+UQ5PreNPXic4VssK4g3U5JKsXJuyLXtHT65yl2gYDjFEDCT2hgnA+xXll0oNTjXiihHsTspuHfQcVzb7q2G4VbKRFoX/nPReK3QWkyAZkbqMeFEKXZNHy3JbL7uNKKUqsEE9WVp6sV0Ea0sHScNCcTnXtTcaGLp2Od4h5Z0iRnOpOMQXEY5xswmmsQyUZxxWol628wvm2yGUvov/8Fa3Grlf0yriWLL9fAVOKwbvEJ+nd9MEjgsICgUI71bbNAWwnjoOMTxfcL/95nq2HYOI3+Uiplihgm80vIHN/BnxxFRjUISJPYjovOIQsu0uaJQ13n5JtEOLHA407IkEM9zKjOjMQwKSmxixNdpdRzuR3h2QJp2YSQWZGyqwH7dBDNMoe0QhUhxjzXiRwWo3Wrq6LGOVXFtZa4JPMGi5wT9jZzf+s2NQWIAtxiuNrCFpeR1HDw+IslSTdhGb00Z6z+/AKkF+TNqrdx/bGWYxLEDeXK+S+XNfe1eYMd6weul2iwZWplHzSW6/gZu+9BxmIhu08nPdi42VvZ6PasRvLrUeniFMQYFuZWq0WRq2uI7be6X3/vDC2xk6Uugv59BGXqZSe3NwQbmTqfjEGGTdK1LO7KxnMvoek+Qu7a77e2vEyBqGaa0C3IuS9B5wg84nOr0XkBCsR4zoz02tOX9BeDMwSxTx+HbG5RUWfGAxi8NbKO+UrX23RPthu3H7OVbWLN0Jqq8qjcH7mw8rtchodiamdTA42B7xK5/lo5DamMCsjoV73VlY1lbOVYjqHHyiWar+XY3Wk1ZTS/77aXrAgZVExC+mmow7G/DvMDfBTdwztjS7/pn6Dhkf2ZhM3GYJhstXUtmb/ST1BgCLXbbRIOs3WmZaB88ji5k9oy9xjUaEgqGN1syi+QNsx1G9wA37KzUCCRs4sSadQJYCfu7tRpD9Baa67b/cWWRazVlNdU8BaAJsdCyHVNCcc6zmReNYSI4b07gPEGXumUdB+eYQAqKVe2ZjSbQ3K3GUNyMQFuVhfGixasdShOaPtlg56N5YgvDcsEM0WZRJJkzH1rrADf0BA0QNoxq3wCRzzoPVstqDD7+qJYqD16Tb424fWe+FbLi3YaYQZjAwsBiKGcWGdg8/5BbF7hdQ0fixpImHR+bASQsDatRjMpDK+2ZWNJocabfDYXBaPFt15gHfDnBAKvZNy/KQDvt7wseCGBwOA0dnF63g/JyiLDE7hiAPK1WLSZxuB8HldJq6pEv31YmuDx+XrFcCQTD9y9sFjnWNj0FvDzLrak6HYktSpp8xJEBuLPxTCs1tR/t82H7D+4sCimN4HTb4KX88R0xLrCVkWF2D7CmrSzNi9521TLsAAdTM7j9C+FaDBKZYTsY9v6pJTQupLfIGYDgkkyNS9FmpnH2TCepVUM43TZ4rUB8OxuDgwqJuHuBp1JT8QzdzYv6B2HYDU4Z4BLBDb38EwTFNvjZcoBzSU1UNwUD0AWITIbVKH6yptkzuWQEHmvI3aodeCm+rTNOjtQLZ1TQxzYvkkbJcBIcS9Jgmhe4bp/L1JFIGjubrurdLJqW7MflLgHzoFAlgEgxtEsxNriMM+Nji3a1WrViS3FPNiBeMCNpDrkXc9HvB55d518PTpdnpzoSZ1oCOVzoJzPvTtOnvCeDSBgWVuP7ktEoe+KPMyJKjb9u1RjMgm87KrgwxB5vBh5mkZElhgIrlkBMdRnghFH2sfmg28G6Rs6NVff0hlSnlqNxegxCiBlejOO3apI9UyXi8GjNm1VzcEfJ8VU1A46oa1eeUidr/lTCLUNhcPG/vAa4zLnuc+9BL28qO2sX2ZT0dXSrFUeLpvF3GYSuEIBVgMLHQTVI7sG+1a7+LjQINxFIyNWxalvwuRO75jbMiskbwJAFXkUtwKVN2CF6+Qj7aovIJefUix9Bw6TaLpIEg+A8FCmrcSxaa+x5JCI2L/dSrlZNwuVxbksDZxBrvRKKf8KsSJ7sMcDjxDCpRV2cV5urKWQP6ma9Vhr4oirOARmGvnpZjcOdDBfe+Tr8jaYFvzFGj6hkuFo1CsPT8qeL6FrgRuGN4XSqZkXKUMGLZdMewHkivyK6curDRq6fzntuqVFhufltMAwH9lgGQH36BAKO9tviCa4zEzdSM4nTI3ETgikRfzZ/5e7x0nI5K2jshEOXGqqUp3pYuXHgwAOwaLJJnz7zXKRPYzxZk9sLfN3cBqNVSRYlRiijsX2WU6gPj2WoZ19jPWdwg68aWQyXzIo57nwi8DBZvADYs6Ic0W34VSK/h51+hz/fTLVSHJEyDJ2B1VtFecwMk3EE+41Kh8cyrFuK1uvpTMieqSZZt5aLkrQ2F+Om1rqHqJXvILUGbNXkydoOJeK4bQWfdDXhF6hv9rWFkNHgk7e9qGsNzKr9LGa/Ag91CD1Mrrk5C1kLvEuEt6eZgznRGOoyfAnOEj7YtZj6z6oj4bociUorBouD+LSq5+JuDMTRrcYRWxl/lAfGnyyiOP9Way4BMjMl6V6L2cuNlAL2uGa6+3UPQcuu7pVf4rgN7MafLiidu5K8WIhBCT7XMmiN2e620FYFw7twblchbwx3zIqpLsnQdH4SiId/GeA4Mu/9+MKvfRblI09lmUER2Lp3VmElYPn+HNg/AB6s6D9sv5NbjTezZ3PWjdXEMkyIfOGhxS6F71Y91BqG1Cyue39eoXn0NOKGzrrCuMq9bjXP/lqUsrx15y/EUvx1XWfOxQED1bM662nUkHAyPGPYyJC4dHMBDJ0akUB8Jdi1mD0tX8fiGciqxkc2DM5XLXu44cHulpzQahwfMzWCWPnAaCMcVFVsy1/720zH1q9fmA9B32VGU0fEMsLTCnyeUD3iq81ZVz4Ta6sPHpe48ZVvnbtia6ShamRD3mTGZE0xrtEICB4gEHzLUcIDLHP+OpQZGC7bszytAERnJSnxw6LSuJ4DQcXoLdI1HZeZF+FBhoDvM93WGqrWzvrpEYpHCIEa1SGW8wJ7EbHI+aQVkVQG9CcYXC+i80Xws4Fs+JsYem5E24NhhoRyFPeLV3BLUcfi3B0jf0LDh6s6Uh4qsxq4mZzsUgKxEJT0fugw8YyorQp1+FbVg5XJSPR94rn69iJWfon3mfB1vzGkiNv601WPgTa81ZOVcmXC6Srl5aQ6XwQ/q76vPNCQGuimDXDQ5TKsfr1jaPdRAiFPHFZOR9WxeC6yrYVJFCxqlat8MO6NwXhZKwDro5sSoVHqcPjH1L87jakkJkOdTDNNCeR+0OrbL6S3HsFlOOsqy/y6n/ElR6/glt4IwkkqQeeLLUKNjDzTgaQBUj2NFo8zLg/4KIHEOtjAbal+dCwSwDZuaq8wcHFGJWo3Mxj3nOQOQO77oMH4MgxNiVDXAJPJMBX6ZB42CCDIdeaWI5EKV2PZITvBJrqa0znNElY6ixXkjvmFTUfni269Vd3Qznb2xa3NnJsYiv5SCXctBhxOCL45TYLtSo4NyVwqUK8bw/HgWlY+MoctjMrj4FYDdC9jjIGpqA/jmL1+oAinFyOt1f55Qgpq000FA53rS8K0mG0GIGTQ3UTnbGLOO7QSCqejIXnxEAkyDDyIdl4trxgeges78W/bEEkDxCJS7AV1OaaTAjUrzf5HuAxHfJATTa7NEqzhDvs1qG85ljJi8KjGNGxNOIha6+u4f8xed9ga++thRCDdBLHm2dwt38hqeTHiU/QCxWxDPLzsT/NBnje9jCYucNEzgictxGvbwNmD0dHcM/pUMfxLKUi3jhV08CA3fUdWANxKSSzGEhieA7+ubrRMg2HOFg7NOaS4pj7kjb7kxZx1k8bOQo8yfJY+XCkHd805Nd63QtuQW5d9t1LNnJsqBY8JcJJg5xJsS9PRGP7C6N6UhlfgXwoTGR8hA7IkVwgOjRSwHolH/laDrP3TTcOxf7dfjvdNeu4Dsnry3eimkiU3eJ58d++6eH9itqEdXxlJTxTjpifV3mMCPAMPeIEnVklwfrs6iU2WrEDjBrQRFTPu6y8dP0qza8pGnCZ1LX9aiUnIl8lMLs1NKcIGXinP9TjrJpcX0MVsEbSvjqRIZAi+D0MPTXotJu2fA184c8Lbu2zweBrwKBU/gkAlk7+vvJzBoTEgQ3Jb0Hf3GhKOHP6CsVNz0dcanWMKtv49/5yEDKOtdanDpXMB3TRT0HasMU3GTh4zkYLxEO+jOdPtngfDXvic1Zg1uHX/cSH4KcxTomOvmJawgXd1K4MyECsrBHC1CXEHkWsZlUkJ8jUm4HRjHB7+uXgWORypgVv13uMWuh21WoNzs9t6xWef8Efxeog2Hl5ghuIHhA8F+gYRDuXj0bd3dJq2KOFX/0iSEvCj6ZlC4AP4ixH/rQ5uNcaY6zi0CTAbHKOXXw5iNfWvfNOp6RqOW6wbP9NXzzfc0+PZc56Bhxg4Z0tas6C9Gd4hz5pd31a/4Gel4/FcAtkU+lN0GjymHjkyLG9htVppPO34nz42AYBa6kkk6q9Q8GNbJu9AV+IALN6zZF3bMbjXqttGw4RmGtnp1vQesuUNhu+/RWM2hlYM30iwkul9IXJHhEdIQCChpEkULSu4Sx27ZWA+BIQDADDOIHItiF6u3L9bovZbk8iISoNYO3NJrRSylUC65mNwr6NuGyWPf4cYrrZxzMZCeIJhkMZsH1Q8PJBCcM039XXtoZh1ut2DOUp8CmMl8tGxfFdgKmsVhIlkGJWzGUlEpFquELVcv0ztty5Eq1kh9jIaC0sjpIjktGEFVK/RRs+BbD0Rtg+Pgy3el6qCDxiOa8xyRkfkTWz04wWsZjD9rn+WjkcTIqQLfw2RKFKTJ5owMzCLhKlTMnLLlIlFwE7NeZAxsUTlt8YcJEooY+26lFJ6F3EzXSOy29Phy8aJCQ2mebnpHaMbjcl/R7kYaOAiemQohpi9H017RTiVisfidZPIG44VaU3Ko76boRmSFAzVGLr/KCOeChgmjBsplVew9bBBVFKEsjXtt12brh15Wl82rjz+EA6vGK+3ug5EiIy1ZebtCv7XyNPGZltTl36Dokc7jRnhf7Ryd0lIOd5z4Y2LADUrOxg2kBnC6CPKT8AKpDsrVbco5zJqD7e1qG7zf9nqzqVrSnZvNOgarlhky2t6UosqlwYfpykbQ3eG7+DF/xJl77Ah/GojQHk05jNeZaqBpfwpg9P9DKhKpSeJN+NP/Ncpr6FluOTJCD1UXaNqwwsg2pPBoK0+qg5dY7L7j8MmDHd8tArrKgsNhmvVasm+JogBoT5/gTawazFl6gQoWJIgb5XCTMgaGJ5XsfKgj1+p5luLplGm7yWVOdWjazTCrSt/8d+ALlZL6uCaw6shSv5qV/DJVxuMhk6ALC5HgvNeUKUmTy2Fi0D7XNLm//bqvZVVw1HLIBkRmcFqJVuZrkXZ08FiE5GXG3r7GNHtsl6peYvH+FSI0kc6/APvPOAfhz2RLOVoXRIJ529EVuZICTIC9XNA5SquXjquCIpiCS4nbI10nHVtyi7/xLz6vPnYhORDHF7Qnd9XS5bCwGElPHkwD7j5wJVMp6gTwErFO1tQtZCNGINi6LGA+lR7a9QR7mpZ0dz9AK16HKFrWpZ5zy8jxJvlTsLd9exTKyU1bhE9Voup6+cPLMSGyJU2AWKmkkn60KESaOxV+lbctBO13vpT6GvNXiKQusgCNXIpGHdURKitw7tA+GFS4xbR4212LuEc7eOSEEbNIAE6J9NVXAszPlsnRxC17mo3+iB/K46xllHJSSvTtTT9nL47k6WXl9t97l2+hMBDnxxSatvZ8sIQj6hpb5c0wT8Jvrr7tOgUWIbOzChbCfAJagTYmjpvjSXiqZDWI1vJswuga3Guo1tv9a2hHV3euc8JdOhTrVkDl7dttpGebPBipg5+VjQOQdFpgp/mmABDUbcVqfLW2AJcHxOPdVwq2QvoGp4pduOjejxc5sXzpswn+lnQWOTOphXd6WU4LuGsAl7I8kumWbz+LFVLMvyLAi+khbcZJKpcEf1RaLli+pW0kmfGuvann64uKuek1ogE9UgjNaIVF4IQhpoLlnBMdRnw2ZnXwZZ1EpRBaAyxB4kIpGibGj/iERLMlv8dnVRZe/KruebgkuCTc7XV1nFDigg5Itlk9+fTp89FJuuAm87Ejsdtq540b1iz6dbqFYySfK96R6kc8AlQJf2PrRWTh4AZDuoCFm5DDJAPCfKTdFgNDa/arpRP9F4q7CuqGy24Zi3XCGX02UPwCy2BbhhCxla2mmzoHocbkFUp7Q9RqsRhy3BbR/SliiW0WxxTqXIilTH7HeUbtlWYVv32Ct0r2ZCCJd0wkEk9bBEZEGMAG99Ftez4Ap+NYb9EcKzTAZ+1Mx0WpZMg88sR4iVMQtzVQQd3UndR30gIPVjBR/1jKU0KOhcub/ZiPQ9C9fD+vdtZXiq7FyncdB+3jkRqR6U/oNX+a+pZxAJN4kvw6assjBLQwVZheDQHbbhSzB1C4sZDGexT6jp0EvinVMmqRaZAYBxNeSaRwa/qiltXE5MXOBo4vy97O+GcmNxI5vt/2QfXikRGx8UKn8uNuaw+i8XP6aQN7sbEPbza0gCF0k+6jOzJ8hkqa9zrzXKGEfCntLWYok6CJPuVhCib4fmQJr28OUE1jboaRYx1/BnV7WIXTR3Qj7VpLchZnBOJ59pqQ0W2X+Kti1VgRoeWMttBaO0/FI8GSjZZO6okQrjNKyPtKnHIEP39JIKbtJurVoiEoZLgV7SMlSYATigl5amtsligGy7bD48ajcvm3V5lt/4gUNTGtcSTlizG8ULI+Kh+Wdy4xKsqP/ga144vm8Q3HrdrielBV75jjTToz+ozue/Srik4YWh5EonA7N7VZsMOkA9BQF2UaISh8ai3WtYmWRjvgLa88wYMYvy/Jc4IlQ3/PADsYtI51nJy/m63dDfJ/HAzK/GqrlZ1YctfVHohVddmmqaJBYe5QiMZbmlAK+sVMaQElQiMfTbgE7ii+W5PF50G0RDrCIl7QpNc10P2pjXXro4No+jP27PeEOBqrUcLVd2aShKVFciQVLHhac3Gme9l5GUkW+SlDuXFqmLc4WXDsjrpMkzDlZmqiNpfkzBcm6G89msMNRhu8yl4s/SpllqBQxObG+WhFwcm147fqN0hyW6GJOXqcE8SnmbFfyGAN1ZuNdR0K92vAmVtcvXfmJfOjf6OV9O1Nr8UtQwq3X/t4Wot6rxqf9ej1EuDsBtPxRpV1yBDWAF7QZV45zC6hw0ubtil39JpMOADJC1KBD56rElebnQ2Qq7wKgO1CkcriSZDjbCvd+VaEBfcVLSzceK7/euQD6YDt2pA58TUNh6GRb5GvC5Vy7sOUyqJJQSfqDh61zmIloOBSS9Ko44wK0MMwzXc7ES0q3U9xHB40+CWdVE7wvwDdkBcTZBXqedsNY7oa/1j6tnGEUAmvVAkUovMno8oTcjOSgcvtSFXq4qzmKFIzafq1FQZ3Z4OrndiyEhV801dHNxEpRvP2zitzYYYDm8amOuUxDgWQ9J5Q1I2uTgQzilATtnFG6Geg6ASwNW4O4A726tOz7V9VJGzVaVRcuTkGdKNklcg0J9LTHguBRLb1npBOCzuoBLFphHljF6aH6p3fvSeQCOskARsQ8p+44DadmYFQDVz7B7/fr/O+NnGhsg1ylxg45cYotZcTE0C2L75xm+hqt5xnZqmDbLxTN8AWhlOSevN4A/cqqMw82GfHPCfAV92XrXRIPRVSmrslQH5lW6wTw4MxMA1rFbVPsJoPFZnVJPqzIireND5XHneOFIZXqwmihsKVyPZLicqBfSKywTOPuDstKiVYYao9pArqwq81vVs6Qc7L50Ix+xDkuPRgFjfKKWs1YL2HtaOp5uo5MiuJmr0pWbZpBeaU+tNxFqGquXD5OVBcfVhWq1KBS9Id05wuI/HBPmTDGltaLv5KYmcujgfuC8bGPfTeLr8E2SNYPnYJmY4vM4opZzxOgxDvywgf2BzH1+GOuazMyqr3I11L0mW0POknYYSEZZG/V6sJpIeyyixSbWzKpWToUZfPMEM799G0x2T4YhEVnesVxui9IfIbvUr6bFhOFIYUwK+rJ8eVghi9pIqCJfYPDI10rN48cfTqXiFRYarkb/V1PIciw8pCKTy+5Y4c2DeZRkaaLpJWVuTRGGaEnY5EwMjpLMtRbKPdRRbvnNEBuPkB5eALwvdyxVkZUkVZW2M2JPLf1FUulRDyPhGu0q6NdFMenlL6FKi4vt2vBPNOb7KDDE7lzhO+L0yRBy/R3eLTkU3isva4OAxg5H0bHqxKQB9xJOCWqaPkqihZlVXg8eOQKp5mr9hgs3YX6NNWU07vZywujRVep9X6ILixHAybe1mVZhhLMP33IqaOv0v1Knwi68nCVIqQ5HU7iE1VGYD61r2MB7q5zH57zYYLEPu7ZO4CtOVpPcRN569VRtwKWsJIUONJa4/Q8KwsV1rt9qOxc5E7LIi6hyYSRlKdnyOkGTZeI86IBRrta/k6xHhTCTobgK78Low1WsPH2HQX/yYy1g8QYSDF8gksMaok+/dD9BqPWriksI8SPAiwAS0NfvVmk3FDHomYt8AMxuJ5xWMolMhSppPoRvZMhC9ghNLe6BZ8i1uAdNS2vKPVLs6cY9SIxdDcjbV4UWs0/TZSu5WDcLdF3kupYN2mZEb8NYz9Rracpj1GBofR+KYN2rqzlTpR6eCC812MJnHAsTbNO0gKgcSGZSMV2AFYRQRKtdG5pGAoaJtDMUD+1uRWu89wtWgucgSaxkxlLpqVDI+JwqtKDXO/a+k/LtrGXHE32/3leOJSCaZ5Uw8KXhiySSJvzBxomB7fK5/Jpn/Rbvt/tcNx+oRo0XKy3rcIL6jkCrOfa1MTUJJ1ERaa07BJWrpklsYKx+0rEIYlmq1qi5OMKjE4VFKfIINzrq7Mxl0P00B3kjTm5AfhuH7TwwMeWZEkmVZ9d03qcSAoLXrkKXujOxQssuVpoISLHQtprVE3Wh4sIjBI3aPdi802YTTOpp2l8klv+Z7jTSi2agtAlwmKhmrU/FMZLlGKKV8vxuuUTcJnh1cR3sabQbGoxeRqnG+jLnaEFq2uroInQxpzSZJkg2UmQeHl3uelZ/rgUn/X1TNptJ+Hb7Iecm3AZzE543ah15hbnV4tYrzvcLoLR7nV/65+MUqVr3xJqOOePVlBUg0A1UeVYFE8p2Ns5Kx/PvafUjaLqC+lWuzsPsZYg8okewoH682OEI7OorSyZAL0cicB7bAEGg0IB0gdKDAtaxWtZW4zsyh47zekuhWgjqX6nMoUpBXwI8p2rd7K48eY474jS6CC4JPhni4IBaPZV3GrVTLarsjgzkfT3GALbJ55MUTvBeG2pp0scl4jY3aRDiG5caSpkyiSycTNKLpsYBOgBu5whC1jMTVCye+oINfKB8DtEoM405N/62GLcPYL2eQon0v6zpxB79FYfnaGVswX7dWkWtlkIuqloSET4V6IXJ1gx5okRcQ6mNr0cUmw2XUj0t6NoS0YXCvg1DT6ZOonnDqKdyBZnL4P6N4wpKsMBxGvdpIPBz0srveA3jBFYsG2uq7GDal4mVLiX7Vf/xvSeXyX7r9iD2WFblUoa5quVHSzG6nRGWDJLbWExrffGhGB7MOzZAusdykvVm8AE4Y4D0tg9DGG9n1C5YH0Hf9mokbKD9Hgl6mqR3KCoMbLRUzKedAsXKR4K3sQ4nILVNDUSG6k3KvleM4IqaXqMRw1nz68DyGq6GWg3U7HCmfF1AaWjSyjzbr7gesSIOuk39jex6XsyHQ69Ojep0MSVxKEqVahqG3kK7BXDyNDoYBL5QcMtOAUNPek8tQq34m+w1iPxaa85QMfbf/EndNxGGXQd/RWozG44PVRzXsP11LFBruZKihlpuWT7EeBS4DCOjpcO8CzLr2k2qvpYPssBLL6Sk/1YZg31a/qnQ6+qMZnR9gRl1v2rQ0xjNsZo3+4GjSCkR0Vmo1lgEHt68K0Sfwb5Ka85yt/essQdzIWGEcEa+rakXOur7ItYZXSwUlcU4ZSDnPReJ24PmAmqaL11yaph9/wRLN8bwN1Ex9y6FrX0VonXtNkqq0ATTiMDXYR/7JwKAgeyDS8QLE9e6iTntTLtbePfrqBduquaG5e/oldPUgI8DK/q/VSBXk/3AAN1ZuZXhRuR2rm1NlykD1fWw+JA5mvZ2EgWG8xtr6FoLlsm4GBm5S1rbYoE4Gu5olVYI5AV3vHjGAUzPxp2Em18EGhipQp7Xny56+hLmsOD9Qt5m2hyzVqtWai1upmYw64lESqab8mtE47izcSBWrbrKIYVttWAnoVe+gaPe38gFnA79k2Ku11k8uhl8lGhN6L9TiA1A35d1mOIukyiRQlUT4tZhB5joT2Z2s0ddSoxH2qWZ9nj5TJ7BsyPnGkvvgcalirbGXccEVjiriaxS+Io5MjXi6gl93ysm6ppIs0wGnmUgivtb3cm/lrVU1O/SQpN5TGfMBmM8i6CFfVFMNM2GB9dxcollHPgFtCLz/lindO6AbmPPQgRiGJ0NJFE8QFmIUF7FCEZuHGs3lX08aZq5XCOCKaKBQIsLTKsnVfa2ZjDLiNylKyf8HF/E5o404QMxeKbvXiErDmzd3Uq25lxFdHX5jrGN3wHePXnZXjN+rthaVlKcCJ3SnsYg/2/CPuP0kMsBVGPgM/3X5araYmDTWdiCxvUxInwKRdA8X7VdDlAwJDA8lnuN6HQPdfmw2jIJpwuvNAxJudOWeoDJK6qEEMs+xTb+80TSjgh3za0F99n6tncoYb3MGXHXqWcS7XC/TKLVeZ5mKcGdhSsmvGZ1zq+i9NhPEjdQCOA8SsKuP1b1gkCCbidHrv/6DU0gSN3oecrdryFS1NvweDt0pmUrP8FJXkeIsGRppKR8qtynxXGV5NgzrJVSzwH0SXsw4MyYOZbv8fv9/bPff+AZzsbmdVzwW1SDG28ew35WBhlXLCsXfV58RYH1Bq9XLjY27VnXgIg9e3FeNK0P4/GpfaFQeabmz8vaCMZQS8W2h6zGL9uZWK+VbjSEo2MDPSFY/dFmqldXeGvtvVZm4SyAFAS5+eK1XONoMFdoLKqXkOjsvC+/SbxCars2dcFIK/boDW2/rX+MZ1vOYoCOhjB0IuhtbrYVmpTZ7PXjFVofVdfMHNuoXx4ojkArwgScWeVwcJxCMwmO/iil0Qi9+vbnVWtkeJ5KxNfueM9QSuZRKLR0/da18lUKiI4qWx4TeS+P1N2EoybDxlBLPSz7k8YGcg+cpErq0O6KkK7MdGUF/Pbz+Nm4LCeRrGrI8BFdDGquXyrT/d2tW69Cl2jIm2BSax+CsdjbuQArKrX3oaCI+cWHF1a7E939e/LrRMZO0/uM/J2X8cQUB1MkoSpCBWy1QmaqmoYPNxZBZkUYCQ0R285N4louclLUtdOOjdDpeknLn6+2+S5weHP6udwtQBiVvh0J7zhFLwXsdqIt3+Ymvb0RlWIcjZawwdW838IjoPCaeIeb/4Z/5ZdFYBfiBypcF/JjWorKqJbNnGEtw7h+oRhu5f0qagiHFwilaPtDaMdZIHsa0VM+2JQEn9VX2R0UFXs3yhKs8zOKlUT5ZvVkAsNWWZVSC///xMCUkiHtzgG+zOoC6jTLI63qzuq3jPiKcDefnbQBJ9BkiZrJ88ske/1U3Wq2piwRgU948WG3Gd9EqtBFzGZ0HgedCNnjMLdIAHoEhXhtpVmVIPIQk4BWQa69AX9Yfyme7KukVTTJ0wmDmO1oAWCmM7q1gT+XA34KWwSi2PlVRMRNTHU1dxKDYh7++QyzwX4pX8H+/LGqrADVaVYojrCNp9cHLKk7i8B0PpN10baXN0JHhtiTgjCDu8XjAzQe54EaUqZPhRwuSjktykkBgnmsqsUEYyWSREP5sexiMlhUMdxpq4k1HAI91FFmHQVU+v1a0MxtP8Mui1vDWslVTMchuhMJZ6qWwsT5/7eZaeaUHlBSc7CLshoMLA+92k/CcDLHQ7njMtmOFW3Yd1XbUvdHwEdrRZTyRrW5fCxyq6+1ygcuDTDRRD4w1iKaO8KUMBUcT6DVHA4kLlWqs77WIRNXwvqbt+z1G3OfeQ9Hd7uFfhmarIcqDMWRJskehZqkfpbRNTv1KypwFvIgwZw1+NkJpH8aU+I78NyClMO8JEUhZwbigeihZcO/x0LUMJfX17+1ijlIcTpp4nCg1vOVu1WRMOjGhUBrFvtiHi1arIUqGuG1KmkcNePMRZu8nCT6fU5p/JSPIsls0jP5ufZDLFB+g65tG/Ok6gGokBGtYWnk6O1Sk2n/4LGGuabmML4jRw/cxrdqNcxJrRpyS+JflAiysC81TQ5QzZrgkSTipRX2pDbn3LITHDB/SlaTZRaRYhT0zXIn1D3a5gdLU5vzNcMRch1oc+T8I08thX68TRAhTBnFuC9CyVdMxg+xFQifeCfB4wAxUBtU6Q232lgynJQnX2WZCwuw91rNKsdmHGU+d3fDEuxuLhHF8pp6sFY5lqYRhpSFG3NahMOdIQBAdguNPHNym7dC2UIZG7vf/h+Lo05SQGmzJ53oioq2ZN7FjYfbWEQmIruDTW8iYtW0wWKlGgz69AIMP5xypDAT+IVXA2KA3iQOHveYshjTTPg7gRisBqxbkMKScBYKfPRlq1NXU9WFpa5rzjQznJAnLTQS73lDU24OHhXDvZ4u+KK55vw3j9muLwU82E/AwirjhyRF/uq6qCtI2DwqB7Lss8r8+gwi96OKOiMorMqkRl2HVhoy9DKHM0YV4s1BYmYOOsPfnzlPLbBHdQ05wXoPde2zYlcaDUNbwOf+IixQbS/gn5M1mOM/DKCYEZSAwfC/lw8Uj2EufvnPf4bNcBBgerpg8fH+MVTty8UJpW/BFgNE8LtBqwmIorV36mDAkfK6k4bHtJukbDoV9u07HC89RCs6zOOKf3BjaFebuY/wsHEYZ1OsqHhMFe0lzyytc4F9pBIn/0F0V7WrVkmwqL4FQXfoE7Z01VjVhpcrQk+GBpOE0JF48Dxt+ubUgg1NgSV1q02+CGjLTmWP0wGNOECha6Vuv9cs9XdtcyD6/hvsn96VEqXU9q9bkOkSys2Rw4ZMhriPAoM+oVbQrNLMxScMZGE0cy4bkHgntyoVRxGzkTz5v3D0TIENDN4/6L4xhNAECMVsoHP+oJxnzvzMiqIb3ZZZYPIar5bEMq/ZkKyLtWypBC6f5VCxhYEjSKJq1CmD4QNLw/E0MYOOzIen9NITXW1Juhf6wkw8xDdmTAXh4L2OoBXFyfR+KxuShX6Drzv2AK/NWU9Os3QBJaVEmfQtFRdU64K0Hmk2JfyJtTeJFQjsMX0oaZhvXaMzUhmWLXfwLwn4mAjS3d/3XofdskxDJZBhDZFZw/J8UrV/QDZStZz9QmBBw9shjfW5ruVo1KkP3EKgFOy9DR0CUDbl2KiQ7hhiGFIbvJJGoTdZbtGHZx+ZzOp2Mwy84Jn1926LpjO/vzmQxgCENF2OIXAqO2D0UDP99AP1MizkM38cvx42Uq1WzcmhSzuIgBQJN017HNF2gmlYZymgQ1wETZPiVamvM0/H1NiyPuPSj6mRIviUBmp1QtaOfiSzHmO86XIxpsY61DLiiu+kkisXWIoKS3/vXcjUiMkUiBi9tOw8coy+1U0UdYcTDDZpJIoa62kPQJnWyKxjxzMYSbWhWQehHpZ/lSvLifeNmJslQ7hcjGEWEFYwgim3P2isIDoYFPGWsTzzfKGXkYtW0dF2NoiIL+WMSeHSG17XGKP8yDGcISqp7xPtS27KhWXjXP0Mno3kzApgkaCpJJiXJG0DE48UIhmsFMvozCyUHGbLOd1hIFMBRc1k1o/aIQqpYq9blKwm18qHgEcHxAR1geYa5GiMrJu3UJIn4GBlxj8esbWh2cBVCL1IzDSbAqLvbAI+2KZnyEl+0H2XEQQyABoJcwtM614I8WZetRploPFUPED/HGQIclUYxVu3L/DufKKm/yWB2H+gTtqcpjv4mJSQsqa41JzLIxmND03vpZ9XJmHgDIoy6g77c/CwxAOW8TBjlXxjGCCKM3yPf4+n6ce3gQUOZ2lXPWvV4/EyiD9+raKsWZqs9yhCndem3CBTth7X9QBOMf0At4WBMpQxpQSWVnOEoH5a52dD0VUXna+hk9Djr5SR5WkmDgWXHmT0c4GGoigEmGRg+E5uoESQQplU3EwcOyLhOOlEilmgEzWGLy+gjfMdWhlUb8/4txGkZZkCgawaaSZ1DaIqIWrOWRJyBR9MGlMtgIke6hk7G3i7RrwARmOU9PAPTB/gaGQ/gXfDw5RD9//9yMYg4A6shxFSq0U078McyXA1PwyylovyrXxVNHVatzIikxHkuP4bWC0DqChplCH21thjxIxps8i+dlmCrw2DnQ6d7ko90FmDYyZrsGFoW/lp2EjqEVfv1ELeL4TdsfU+WPAitE87FYx3WWMtwW8cQpQZgcWdDzqjaVQz+qCNUdDwcL9OqVTMz6W4lCoqswesYJ0MCbQxXqjEm59FeKHTL5NOftY9gq7C1Enay+9njAAVomlre/RhcHgRa8PRqnT0WVzSAkS/D8NlNHcadulqLaUEtx8Mxaq/VWTU0Xbcj4upHQV407gyDLRqDr4bGHlr3asOzsh4PF0I32t4mVshK/K0VJcDgEui/l/a4YyS6/lk2h+j32mNQpi+rHcOHnLV0dRwugTgjfHuxamq+kbHGt1jS8XDTO7TSqCGlhLzUPLbn4cmJDjTmQbnVNRgONK6AybuAsKc/538k7aMUrNYFoNT1CEAH4lLWr5tmooKYTrKyoq0amyf0J053uz5vPtwEDhmOaJBkSpwc4zhq04YXXAF4WmR7dr0Rug9d8kuK78uo9+VviTHkaESpl7i6zQDG62HQhY9uAVSRWCylrNFYqeFcaG+ZWmBkd3b0oe26462uq4k4RyeIKm4wzQsqcMiQrUWULdQDzwB+Pock2erZ9RKMBuHllgGA+Nq1+vUWhHHkIw28bKP+u6s3pHU63PPD8PDswattIJYylql2GGNG5FrYY3+MBxlRSfkO4F5jv9cZeUS7v/5CBf/VExu5pj85YkIZ8US88igjFl3L+nblRusyUUlFW4eWktZpNcQMBR19btCZ8nJGTeJe1jxvDoWBCNFRcYOURihoqP9O8Sfxx0YdImQscTbwS/K/JpqTNuPQMDgIwc5QRF7Lul+1mw3o8LX/oFgPdUQptbDhW8TuMcZg+6QKI57ut7d2nV35jlJGjRoIixLnTr3oLzY09jV/+BNqEj4huIw7veLv8cmUWz2D3yz86cY6e0AyrrVse4YBnuXEDuV1/lck87Jj8IPFYLj+YCcWNm6t8S5qht/0tSCHnL1EUyuAe6s6xxLB1wO33zam4DpuNSLXirqWFw2DRsVpWyDQNAgNp7p4rbLw58wTrGg6ku6BRPo9HWyEx9GDg/+16B1wJ3lvrFjnL0v3nrx9g5+v4NBAL/jE+JaXbABhrH+G+py49AN0+L1H4qFmM25mJkazCOj6ZgEW4e1DxfnJ2E/cGcP3ilzLnQxtctcoanUelHP0hMY5K6mxPIt+VvDq0oLa3UGP7pYMCX9OUnvfMwguY33rtaPZVT1LjnajF+yg051DB9T+D9D/wg5sBhDdZxleGJyguJ2rWxkqVrNh/7hhz5+9uJfhRmtlnyPkCI/u5/OXs4YRlNIaqOt44liZqwz//SskEG+tYdxJBQ+AVGy3G8J33u4/LvcYoROyjtjAReguEzVnOxeeycoQb7bmPWmKKMpBCgMfGhqXiPElrM5gGKMPfLYlbgBxQmcAjFZy/1D1Spi7F0P9o91IlT6mQOwEaCX+T0dvsQYtcS7S9UbieNhx3zsPvq0IPGJwDGEW7cLDgKUOoWNA8/4hjMdRdWJ+0n8zPhAU49X+gsgZT0J4qT5tX0aH9KKJUsYKnlQWuLwvZG0FMyjkdf+Nb3KJIXdT4QPys1Xrf6hSWz90Da4OXgRqcKt16CkkUhHMaqwR/0pxWkFQZ3viuBZdP749n4SmUHGeFi1DsGtZHw/zpqjUDHUe/KT/Z9wgXAQNR63a09qaRpS/M2aI+LkcXjs3GABT2QcaGAwRdnGapzXue7lBhzvub/UbsyAdYsoAD9mws3Brt1JZqRL+mSikXO3dtkK3VqPyUFgocZNPanmqYjUAHkxLpJVOC42IOwc0c/gMQY3jXOCb7IW0qBNDOtt0TszrTx9ZnGonnK32Z+wLdwT/KkYEWcmH9zBgIgorN169kZLFi/ErDEUf/Od1MPpv1bIqRRg87uSpPG01FZXGKCIelZBK5H/p0cPkV1JSJFL5CYOe3G749szQYVa++ak0WhV7P3oAtDFyd50fg4MLRw7jhGq4K9br4juXxL6CZ53K09tCl4F0DwNucZ0VNxHbcrAZRFTzMjS7sRFefPQ4othfqUJbu7Y7jsc63EilJeLZ0P/llJKJZjx8hO8/1bBHr5WlnHLKw7cYnkbl9hidVcrD96qllg00fOh3ijeYRMajJi4GBqM1eq/iTDmuulPlZNJpMLvPFaAOdrylRetgnuCHzA5W7SC+gnsdOlem9tlfVums60QaLdyQt512hK+5mbRhuSpHVcKQfwwpIK5MG7NrM+zZMPSpPyRAdC7M//+oQpplIrcacRm1u7N65cZFqoG4ZEYR4dHiJ7vVcCNVXA01UsjXfF0CNfgvzq3WfmPz+D4/bZrE7dcQxHRPjAjlPOEgGs8moQKHDJ0s2ocpgdVPx/k4gOr1u/5ZOnd2HyjT4DU+YBHAO5tN9rW+tINQSNex+4wbVbomMNCTzZAM5d2h6Uqvwli+0t29l6GIg3sGOhz5Vq4+uXRyZxGVjEWMJ0KUAvkZU8StFrEwbxxzAFNsdHVELcNEX4PJ5cmV84Rhbj470XJjZQufuDhRnB3ALicvowvCcawZDFHmk+Zpop11aj3ctlBXTeM69H2mCzIRCe+3KkUqH7/Tz7XHZmhn1cavpWe4BaNRN5Tg8SekQ6zgXkCHY1ELc1EZuGy/4dcVwZbJh9b6r7rRcicj5jqsWo1hWCjnCR9g/ZvUoiQQDPM0UsrEwPpnMnrQvQu42ZEuGpe5n9XqNbmhgtrb7/TJGdqvfSivCTjN5cq0JMi46qpwbj/LyOX0e73Ygp9VIAO3Vduju+V5jX/E6d/ONRYNQ3nawYxE4XsGaMHkzIzBuIM7BKjBi1XTMRwtEZ+QunKgGfYxvKCRQopjqNIIWO000Lus5pehqyyTvbWWsTCJD+FhMS5SlGPvOldOOfW2e1yxT9sPyJzhoM+PpzPweX0YgPn7YEmRa5mUghI7bJwe6/PmVwuqGuwMCJhAY+oiotxmRRatRIbx8NRJZA6tfAY/qoreupy+ylknuZzqakKMP9yrxUbFfq0/Hj6rBQNKp/40KuumUVhkZTpKWnSEHkE6drVqQrqt1eVEOQEF/yQJBMM9DVVTP22AC31NPuzTAFe8TzAauurymH505/ZdOn7/z3ZYWxwP/rAQ4YEvjkkE0iHHDs+CqjWEaDxMRHXA/Gdn9ObDqhmZ6YspJ5UwsQ0WCc0e70Y01WCwMtyTUMZ0vYHzZrJlXbX59wx8iI5sXv1Y/Qgw4Nb1yS6GPNrwh8q2U1yBSXi/uTK76Z2iJemxDnE0rQY/K18GQFxFjwwhjbXaX53q2uCLl+XBc8eh2qjD0MXhhzce8PjAIsyjK5afMiQo3tgqcJ1ZJgmqf9tvuxXvcBo0ypSgEQXz9Y5ukZ8dLnAbmxqLP794cP8TeCDpobaOMtX6a44GO/ENfxH3v3thMOiLY7QlEjfU0+6f9YdLx/EZ1L6mRaP1iELKiwY1stmQLgrOUhm6DevfAZ4uDBpsFSx4Qgn+Gnr7wEQVos7YhBG3AUfwUwM93YAYyPH1PzeYWrX494msrNFSEpcqjvjbjUpDvOvLGlPXTFE5oNvQWkeSEojsLMao6cSvZ+gMpXXZ4ONB3YkqY5/SGH+au88Kp7/1c+0ygv7vP0MYLgv8t4yYcn8W5AWdf1jF96xoAf+vGq0alYPWEMe3ysLRbfAH1/klQTjBGurg8NHRmzkiW+S+9typCuMjQS9AjxCMooT7jxrWyxjaaAzpfnm8IT4uEU+Hu48a0W+MTTmxMdXWP3cV2KAhxgmOEHus1tkK023Az97w6aOcrqIti4eXITc8mVjnR2zaltzTwdJZQ3URAriQKpGPFNChuv68u6j2orcUIOY6rBqWEcvIXjHxBJ9vWhLg4uGtyKLROE+G6/DhEmgT5XuC+m7QzaRfl3HADp4TnRSya6r01gSCmfi1alruvmZdFMwbP07A4LL5ZniLIcKi2ZjZi2LGxxFlianHw6VBdcWsiDBheF+CoUjqPzStzmUPF6OHN1ertqXfbiWKkbd+wM0HrGqG4SFDlDadsN1jGA9cnF19Wf960d/KVFPsksI6728OD/68jmcv4PlVuUQkXjlR7etmW9LiaBqs2hfawPpkFiWhDiZovDJJYghnSJVgjm8+kCvNnK+kOlJP+Pu/GZ4gEb92E0bePTY9RviHvywkcNYJeKZIYWtqXBUw+9XCbrZ5LMNI8XRxniIg6KrhuIEEguGbRVg0HltiOIhIHvmFbEjeT+NST300L24Qjf8YO8VfP2ap/YKBwxH+2Sd7zV0+bdlkvZgHCXNU4a1f+cUe69DEnkVvWpxg+tGORfdr9YPPlQ2GOA1YGwMFSTCzHV5/84rD3gKpJp7FsIqYxvLiocOhkcmC+u5pPFYPvO0PrRhQdbLi6JnuAJ01/A+U0N52DG0tGpAtMTzGRFr9pph/LUJNe6EYiXbuH+0MkG8NCv4L9d16Ovde0F7FZkxvu6LQeqYTGvN0QH/AgmrCgbJlKIAKuX8GxnHg6NP2ZWePREXRKzCiIzAWSI5Wgf+DggpvjS+JTCOIVSu3i+iiIMMO0XpW4x4PLVsy8wzFGDIkAgvZFiqRsupKjyAN84PnRodV/BEVlrOOO+Iyroo55Xa9ciKtFZFUK+FLfUrgB/A6T588kk3W09DHt7XX4JM0u57UXPMq03TA28WXyZMne78effG4xEoCD0KrgqFIDVPq1sXkollyCZPi86K9Kn+Y0QL+GWtOCzaGGMyt8uPh6dVpXn2VcFW4Ii6ROvzYwcDYQYXlbBZQnOjn2RKIvNYJZxG2xrVC9wrV487dzuAzLpddStI8b8gReR59kFqzveVccjEJCNNKmD8UftARxXkd7eMioWDYnbYWLIWpM0rMFK5NCe6LUdc/Q1dfvpLxzCQc472x2PoDwZmrUeEK6BqJh7taVlFZzAZmG7bVJd7izlsJJJAsVDeTEIPtFDJojQikoq4jF02QTIle9TabQ1DXjDvD6QK14KSNPyxm5GhivN5Qd1Nh+AMUYH/jm/lP4G+dSl7q71HlNSUj8Vt5kCGiMuXIag1RaiBW35bJuUrWxWWgA2+6Hx4Dt5q7Og/U6INoOSvGyshIhouEgiGzbA3YGLpgZi17xUM7vuDXm3PWFcpAPY/gnE6ElwcVKNaKxgYv/tTf36h49d/5RyKHeCB+dS4GopF6RF1LsOH3/c4swrLyflwFVX1izRu/yMyGIZW0ytaItj/FxJMZ+3CRUCyXIVILTu4UzAiCrBOeYpgO+Fxv7goxUKvD9SwiOb7YcF+9soillLUCzn/ThwHgd5L/cjzwcT9lOPBrn/u5d3GaaOFn3VHtpKu3hkGtLyhQgjgXWsGcehOxZ2ddkQw2IxSPMC3m3rJaYqhSySmmmIheX0LBEGQoqW2XZ5XZwaNwyJGP3sGTFuPpnUwkUtfNfG1ccIE7F5KFAym6AVnpfDlYkGrPu/yUSQMcryzIYMC5bmiIWidLNoQgkK50HrjtxQ9Tyr8KLm5L4pyJ6PZ08YXFvyPBnY0b036tQIYtEoFxzqq/ax9mvSrggD1/iEG3dH7RYLWazPzAgahQ8l6303+rS7mtlYvBF4b96Xw5eFB3bO2l1grPI9afWJgIMjS3fGCtPnvEdwFdPRiowe1d1pu6pRHLcC61uc8TASS2Cv5Rex4NWB8NZTOk4lapDPgCNcKlygxW4g3yp/wc9W8ibKuV5Fn1XmurDOQv0W7O1YuIL9n/gK3yjUgKpCvPS0gB700VNxiSePk9gGd5J7Cvk9yj6fIyXKlwtb6xreR0FWKgngcrUa+b6hdnfH2W6Z1P4nilXOwitF9jiPhozFN6uNjgARd27at0Dti02zrwJ/h9nCP/4UhFKDV0qRLrb6yxxm5dTjl+sX/USuJt3PVOZ1BrjBJWofcEoDoPX8GdFdfXplyikJHvijMsWVczBlrVyhtWpfFFSk0XBVtOH9uivthcwPVgpwF1LWS2AQnHowcP/e/AjJMtPdKcrYBa3ngvqlsVjhdUGROB+wVd/yRgzSW4jDAiU44SNRHKOFlvIlLTVZFr8zkkqVjLUJtJj52aOLGkl4ptUfaOcrVrwfR3fEBM1NVDax2IdZmGg8XzB7QS8vx5MbyrtbTkL1qR6iLdd8jeznYKcDgy4snIn5uHGFn0y0JlC2Avv15HLN6vimD14iQ3pAul0PlTjPzsALdZvq32awzRDHcw6RV70L1LHGlD52Q91CFqIle4D/Xkrz6zyuKankb7Ym6wJA1OmYhCg0+njaYq8dmAs67CdE5n8XNRi3F2FMe5ojJbQNtXB0+Xg+J/hQasfsfbY6bs/hbB0QYvUydHfJHIsArLjm+r8+Znxw18MAkYPbgoES293p65J1BGnbJaGQ8JvXOUvgRVrzoV543vrCkVwLBliDOGDJ3Wh22vnYZ2nS8CB1mwhGPy3xHW1oNYsQCoUVv7Qis/KVSAwT7tNcQI6RL35z3Sfz8AuBdYRdMK3BpzfVPoJfYKUv8w7sCNFP3b9bf/ttvq6k/nrb69f4WjsZrFqZSfDrFt2CdHGtpV0xZDuUNIOF7g7ODjd07QiZHcJeqyis0dilDUb+Ye/PYLpM7WSvXTP1r3SJP/U4q3l9XPvQm8vPjOEJVVq8QZr9/R/hvQTQZrfpXaFX2rOK2zFoWjRwkTXkCjDFO1X2OocEaMtDW4In561TvIha1D8Xgmq/CsMT40PunvkVwWSq742pcw6rDnXIuXA97RzcD29PYFfO02nhZRXnytZUAbA+AxjhtINzGsp5TrKRULFecR1eeIjqO/XCm1aj2wnYjhQ0lf/45FkFei1FCkrEpgIviVNe+z97ljIsE2l7U77GCvTU3yRaXQ7Z2b2Os9TpT7h1ymUD5Pb1y8vQnC2+kO+MulUfygL3YldP/e0/LWZ5KYX54NKxINJy9OC+3oQOcPC94Y1mq/xlDLbgSlqAue2nvws6J2endgVl6UYu6wVxE6lt2Ao/2sXZKqBvnRXB5OO5trLo1Rlofv5YviXW75SH+IOlMahQedSRH3tZII2clPN2E8bha5KA6RyRCnpYgOJd3d+Qb/jJMgQ5jmw/oXizi/Nrz+Bp+z9sTnxdtW0JVB/wTJHB0kpPtfRAA30QnIgAseVbi9pTViqBvcGqsx6kXCU5G9SKxlSbrJ420HahVzGQrbXqU4aqZbxDb3Fwe8fVi12k/JNGI7MXBnkz42ny7+hU6KJUUsQ1lGbw5H0MlkLCATjxMycEMmkuA3E27v14UHdRj8pTux0UVfimav624v8WK6aWRlA7BoWUH4RTWL007NS9OMZLhQkeZr33IShIHhiLsXeJYb0D5lZYtXnDejg9LwRzCoDWeQcp2Bs40Ub5iH17f2K95b7MCwSpNvN6Zq5gz5UxwzlxO+ikmt592MV1qMYlzLSk2chk6dbAxXmwRjmwz5NV9btd0TUc9rphY745C+RvXJY4dKTOhtHQTapr9DepKOr7K+Rx8TgS8E348UTvb484z88jj/j8aqu5hi3T6pPQyvG+qmlnXcrSlFIJsLiNPQwbTGeL1JMBjS56D5GkOZf01K6nnN1MvLzQ+ptsyhy7AqkvukUOR6dYMz137X+7CkzIDYnbv8q0nxZAKwGn8Yf0Fk4h48csePbULgc+kmmRdoUgFPtw2jo8YgxLKnQD0/pCRDhvZrDNF2tT4On9dMAsjbZB+mhSDeTXkZnBa9vHbHFPLEXz2rUgo2zS+U/1CRGs3iM/gr01bInGqeMgxwNu7mm4th9YJRSKF1KSx+K7rpZteSQVmNuAzlzAcf/mtaHz6MfriNpbNpvwpQRJQJwgmeGV4LU4RYkCCC1q6Nblg/3lKs1DwSiSbWAI2oPXrX5FQPzfWfd4xZNZV1S5SJpPHTE9XU3BcFDYq3fEgKoa5vuG/gwwRIBVu5fEjvPQLppp3Hy0JsC3MCBcV3JfwQiYJxTu1nYykzhhzECPo8+MEFdSzwdDodVlmBqyC+G9dj7zRS+/TvVfdPYnTz8xrblPKL3/+Nra1tbbVceFu2rW60J6HT6Lp6RDA3kNV3g/5+VOPWKhdcqM/zCTZD1wBc1TeLi7CsnJXSvD67BKNUhqLarwYKGW5ISTyvmdIntC7n3JAgsg8nNKBQuncR9OfR882exHuYUm2yqAEv8+/XAfv9/NFUd2t18FJXc9a1AQOtNIig4l12k6BOIQaGvY7qYZFgvKj2a2UzXJeSeF4zddCV79DJEFyGINdbVm/403PN7XghVwayZxp1gyu1qaLBf2JwofP+coO1+o0RNmyq/1Y71TUEb/shIsJLnoopiDivcY4WCQbDLe239kdcFFEQWHOFzmum+uikrZ0XJYZK9KWEGuFs9CJ2wq7UuqiJzDFt6Sc2EC04TARPDaih/ia1IK4337Lt5HSNwS9pSjgUG0qEYrYTGv3T0LCtWkQBUG4ynOYDnrfidNbQI5ayikD3tdp2BsU1OGgr4g9RsZcxQCt/RFW7d1gbxqB+ZcYsZp/qDRiA/5fgHe28PLhWzyJ0DcLkExYMMZValWK2U3pjCQbDw81qP/PqiOX64NFqDLLxgAugkGzv3YJYBcBc+uoVCFzhM3cbphTt3U9Ym05D96/bHDR4wGWM+pUaOEkwSQLsR1ZJL7s2XaOwoZJEwlVDyFDMMGEecnzzgWiL065Tdl9OSwK6HUr7IOtsEkIghGL9GgspGeeGRRgWQ5eiNCqZwGzICsnp1t5tAs4S3NjkluZsoOJPoceocS1dTnTtwtsOQ0oc1F6bYtq+Pl6CEVgDrvNNDMMQzwr1qfLUfqj2XkIEBeglFZkahQMCTX4ImcmxXFZOJnrnVFJPghOsbHejrxR/RroO8DhBgO/VhRzK7ToW2ECPIzYeUsSNkv02nz4P16R93s2nT595JtubiNm01UCayavr+U1/RboKgiFL1aErpbfJwie7CAkGw+Mjar/2jHDXiqZvhL9/8W17jlCGCIqzBmaVPKlTUiW6reWf4mnXo1NxmRyaF5c3VjOUBcBtwS90oAstai9X2IfBbxRHm2BXkyU1n+fhXrKCude+oesRXOn3Vmjktda9o8FqvWQheTZ/OzUs5s6AMdUhilYPpcgbvutOJBgb04CNoele4H2Nh3R02WDoVW+jaksQ4Ac7l/Y5ROtT22pmi1a1GeRVnOnem4y+1y8K+ZJKuoQ5Zv0NB44RfjHM5Mp5RHgLmFiIQdvfu/S5H6pYnpNcaAXPv7M5LcGTF5aqxQMvRYA/F/2y0HWlqFoYxP/PVJeBaBvRfu1i8FqwyzaC9sW1+ifzatTKn59Fbz3duUcZ19qtK4k7ZLVRqlZ4cmOCceeyh4LS3u8t2H+uE4OErZNeCefPgs4brulaja5eJF19Xsq57Ctt9qOWkb0afd3srrxR12qU02Z6dwkGwzsvo/0aw99OAlezGmH7sMHQi/6i03DjAthTX3eD5NrlahqMFp1AWcu0crIn8NK1MEFj1X6bgwFGxjAhsD/ubxBX2oIMxKpmngr6Nn639msPIqwG3AwuW0roXneuWW0sdL4RX5TTgK4rRc/g4PavaWsg2pNqv3ZEhrfhnhU99MnBseKV9eR2wP+sdgbUuUk612YPTazUZqhatJ1wu7+J70sJYExw4VTDZkj549ITxptRKODVrX1uKgWT63mw7EaVMbI0TZXYTkO3C6QiGyvm+Uu97uRFqg2EnLCpY0PMkYhDaMBthkLwmDLLHe7pwbOtJ9JaVv7cNKk+r6rD1iiax2emkzkTX6a84/aboTwdXFV/Hnzqg/+kvfOhv75GgK9n8elcePmAO4hYhsIslRd7x3bybMCfSnwlyy//d6WLdJU9xRaRrfUZRiAewVBa+zWG3PAxtHVxd76Bp+05CdoWwRO859fJsJVvnK03bl6Brken5v3yXnZGivc3//Su62DcSZwASDt8+u6Mv1d/C2ce/wvHfaPaXa3KZCIRSa1lVaogqXPhuvig1ZPpArH6PWGtqyeGELe+vkX7gWGDBCOay80GQ4+HG80psXA1rCKwLaI3g+lwdjiv1R1wuD7xI8cn/6QnOsx4wvf6x3J2shh7Q7uXiNE3c/Ph4BzggqobipQ3q7IZ5LL3b9HTCOU/zZ259Ir3m6FQDRtPjYeLrVwJBsMDLdh2JcGAVnx2T24XGmkGMYxdD1eKpPNo2+FLCXBtNIOa+Khu6jOPqpr6IjYf8fsq+yCMJwu5ix3iiDD6STkbcityqb1E+2oRyEJdWewveaVvFsvhGEI5phSM0oeDi5eJEfmit9GAjSERLm8d12hw1LF/HxF1CaLFEn29sEfB0e+YiyjjvXZgbiIbZ8rRdz89YfDFlpctY2PuAzKy/GZPzdj5skzb1mmZ1yKfP3d1Ccxy3YfbsKK/mqf+PXAtRajrRkXd1+7Fy8SIPOd2teBaHAYvCLtxzEZCnGZ2j67ntzOrILwI7iVvO6UL5Vxe7i9bGVd7w///86v6sr1UxxCM10Y9C+322KkdjMbouzAA0Fzbp+1hXFme6lQdbN/8gFbLUPBXqB5eSJF0TbpI7HyNJJF6tgqWcDBk16kB25OeBF4dNUDXij6ZpDe7ON4+zRlhOuJuJbYqnntG1fE/++/qK76bZOnw3go9j1hLP83e2VCGtK215p94LusSOWeQ9K+uZCGl/PtOxts5jkv6+P19iIrF2B9pLQXbAz0PJW4plmNyKeSALH3Wp0C01M+mAVtm8KG0nf8ANj5uLXOBspPmvtYFgI7VJrEhq5jcUO8j2EaVXy5lrYYf4RqOFqGD886ryjeI2kUoPfe269CVydzo7ha2hliXyrv0G4UhFc1M+L0QbZtr0oAtVXgxKB5+IFsP0LwwxR9qSk0eIKpxRj9IBgoxY3slCv2SUX8vIlQUf3E/8nMMXymdS/OEXbL7a3FrdcxJ7CvVo0gEikiKSnd55oJVgHYHyJmgMjtEY0idp0XDPuG0BWBuya9E8XFwE1axGHMZOwt4Q3t/IG5xiCc/XL4rUMBnxWzurJr4T2W8GYb1WQxOi6wnm7+An+XFqpochtRJ81OiLupz0EjDCuaQcNc/Yx7I7OlMrRSiMZzShHPCkWEKXNXMhXhlVvvkDQtpziamUj58WBXEbK6gjnjaxLefqcE3aUsgE7Lpl4XaTlfiYsLSUKDC7CsQCDIk4l20iYG0ZFx79wMhGsO+VLVgY+gcFKxrAZhPu951Dj8EBl0ztZoCXlYVbXTEDf+YwcgxG9swlf7HgVrVhXuH3/EKIpRKuJJPzC23T8nNjo1Wkk3EMhpzX6sYVxVI1cZgtZTnBPCc8avbg2huegU/q7qRyXLPCNEYNjGEacF2IoYQuLcdcOKyP+/ydTRC9zAZebtJpQRntcMap5cYcqXcNQmij6fxha8FO/YOd7u8HXzjpuPbcFcS6C+08yrXk846qkthefVnoOBXYNdWVqW0+zSG/HtgJZD+MWJMBUfwHKD+HgmiMaxJWws2hsgFS9K04hd+VvxPbNhWJmUMPH1mr25YV6RahuSFPorI2xHjFxS87LOCflk8+TIou+jlt4wbFZJbKj6syuQXbVVXFEPIQOme2P1GdMGYM4G0tZZNIoKl2gvS5lM2yWA08GpLSrSaFma6llWqGF4zSitDQnrBZegUeE8jNk+DRCyjnYY2wu2Sxp57F7G9ze9eiVduin5PddjVapgWwv1lvDRu0tbyN1g0Id4aHlEDLIUIOXSKV/m3IavJ4QjLSEsFLsHUkecsQH/UnYcZ4WrAjxCSd46rilDK4EWDK2/vCgJ0F8vvvOeZxVWtSuOhG1QQbgbuz7TuBemC0Q+yEM7W/saIraAMIzTiOgwHX6VL9mWDoM+bDz6YmgZrtJokLmX/NSs7dqL2SwKuGWH3mfF1Dt8ILUon4HpLNPC26bKXWK9IXWVr2851y1BYv70sDqwrhnkC+yU1ZP9ctGLUDJ52D4hW/Ftpw8ZQK1ewwCFsiWpJH18AmSUEsZoqFltBOkpF9zLmXI4npe6BQLijQ+XNd6bQx9ioq8OBbz1laiJ6Mdl8Cvt0VdI16FIUY0DZGdJv1LUC8c7CnDXU1oFrYW09k/8ORNsLQ1dt2BiiwZO4NqMLwfJHOV/8U3qxmjLeWok1A/tiR3dgDG2RsLOIDiN7IRDKq2NAVkHsv0AnMRuBddzvpu20ErAqhi1XpxRV/R8FuN4yG104doqshp9wm9ejlEA0hu9+vkac2Vtg94pcXtsGQd9XHvyULpuP1eRxBU0Gl6Goxx+9MQOusgYCYahaDj6H4rvmOufp136dh4bsCK/T1PnOKZRjVQq/Mx2FfDNmx6qYiwj4ct+l30IGknmH6SmItliGuhZtiIIkFBXaQNgCui/Xp5jGtFHdcf9rUwT83fllDV+/KgQ4eGf2ENgZLz+ybk+/XHM/qVIyhNDDiCN8p1J+/9NShvNwFzGsku26eeni8TtKxbWIu1dGiMbw/ok0Ynsr+BNy0bNa8o6sJpMND9gqHX9io7Y8l2fs6lVJMGWIs7B3Dm5/NN5dt/yyyoopZEkDs1LIB3AfDSkBFzDw++96qeATIcueGplChMWVi2j/2qq14swGyxWsaRD2hL3qHWhxw/qtJpUtL69tUcUR66h6Bwt1pcnW0m29eHpBzgSvRP6ZrNbGGipZeWpbVnNXZRium/uedfG5eIf/i/HpIvIquM4mXj0ONong7Y+oEVtm4GJCODbsCeflByuIeygTnEC52kupaTeCIbWqV35H4IWrvYLgSaV3pmh7VCUv3tWazWyUGt5RGBaKkD8tqa9ezsJj4/bFvQXt8lcE0qu2cb4MTGPIYiimFed4z6uB8wYYbvOCDRv6WbHS1iZ7kQebffsNHU+QM/wNNFT6Ulzh4VtBBy7YWg5aAi++Q7leqi0li0uu5rJKkMWZbfLC/+IlYLXW3psIXUj6KQ2pZXBSX4VpDKcYwjXuis1QboSdC5Y1Nmx3k3p2aDXlzHTux2h7SYF49t5oa8k7KwPp+OPJQPBpta6gNuxLRv8svMy2Hl3hPNcrKeDQfi+sC86ZfXNNgr63rR4ZR+ZgmtfU/gLT1pyqVmwMjcBVFPKDYWnTXruOQ1taIDnrXvbZaH8tNr2gkqmVe4YY7C/wjmbvhUDkOy8QFmqNUAb2MuhOs0lFFfSG3fAlxbdk7PpGgcRG8qJeYSuqcOQ4CVSMaQwpaWvFtlnfYCNzoLTJ1o2tBcAGk7ZqB+5w9Xe97quspoEb4l6AE2sgpKDtQtp5/qXQGfjehA7BVqybwGpM2Pgt7yNCVwmucgcliZ/TFzXOjcI9LaM+ZATpCNcSZFCG8dpx0T4AC1zPDjaYtsjVmEt/z0SsWoT+mzpUJDI+pNGdBbbH7TXZZJNHCHzjcDUqufLq3dYqhkPXnJcAIa2ZYd8PfVuYVnXo6sEuJy8pvBrKljNRXSwzfW5PmeUzWjQjGJaCV2WpQTQeDv4lbNybVeMyCMhh3prnhJXarkltgil8sUpcRT/p0U8PlcVacYkT68/qM5bpwLRmD6YdG0N7qKL9NF4ENnundRzSScSq2cD139HWHtemQuqyex7s1io4209OVChQ3ubiH49pDJ8yxGrHxlDq5pTuFXVYPfIPVElWzYtF6qaBzj5FPzmdjbNqIsWlIp/ykpj2r72JdmwMgW1KIEb/NGDhdJWpo9CjDB8aOEvhyeumgrupQGyUrqslgtEI7ehC+hQ4AwPTGG4wFLdoR/wG8BFA9cPhHZk3u/iOZNW++CLdhHDTIo/owA4vbxqeMh/UFABmSJuDhmwMcVCJw+kqsCMgs6Z4vB1q4TyFr0Q3JcyrUXGxBF0lMd9ScRr2H248JIYMmwvUkC2zxqGqBmF5lOjpYEP2Nc7AqoVxO920MFlRDzl3k/CUF8f4FSODMiRZtCQZjkkgRnS7wJIooaNwi3I0cSvU2eREuHVLMUWTgk9MwVMuEdXVbi/PqCnbh0sgJvg+EiI/evLfbNXECEdLVwyOWtTpu7qobnxUsPMR3Ouo2o4dXb2Ta5RZvS4q8wtXS8z6nFRFdNa4E7Ly4aZvYBrDlwzxmrIxVIFWUdImB7z1kB+9C3BLqzZG5sKj+tN/4d5/y1JzbKFeiJGZFq4Y8sk276t0870C6eJxUV7E63jXGVDH4yeJ62tSYbmYxvCMoYKmbBVB00eZ2JeCzIzgehsHGpqURm65i9x9LhhlmT14WHrV2wonqFEIm62Dez++qvxVot11VTUKhqRvq4qtm+8D51XWZsc4GajjPw2qIgY05LgRRtffyFclKOf2rRoZJepioot/UfW8e9e5WrDRso/N514vjo6qF6of3oZM7xH3vkZcEayglAzKL7+otmyVBoWWATQsmkwdhTeyamUUIiBO373RWGqfti8bH9a9p6s0KJBllYWKNXyNKgg/V0JO49W5oloJDGHasmW2b2jmUM8O8i+meuRiuaGZsSTB0NVFVNViqTaubL7F4GfDjzASiEUL5BJEyWrY1wQZSkib2WK2iv8qi8YkwwHond4dVBp2Z8HZo85FM6MpkY5a/T5K68AmAgvr8XArSheDNytamOfqbqKC7Ro54IStD4Da2yxDgtZsDD0kELD0Ae5Dx6BHgTft/D1fcU40dv9x2VPdNmHY/L2db0fRhWDGgtgpdG1bBVvVS8Yd4waoxvDB+rVmW+BioUsSmVcIfgtO3rpQq3bGSQVxZ76ng83BHBsRaOM7yxTja/ViRGShgsdYGvIYm0Q1hszFac3WBjRt+Ou8OMi1VD8oW9S1m0qzmj4SKOdQjdVf4vNX4om55ZZbuFqVeGIrJdbf2O7LmYtS9E24imDbuNOqcrSJSO9FLF8IjfwiZJ6rEmfVQ+eEpJDHSAzVtj9Pjbwir5ULyiDbmtaGesJLmS7LSX4bTmVH+SYxQKt+euSZ+Xve7uR5ERjW3fNer9CbiLbDsJhz6TuKRIbbWkGERWP8RQuv8ry+bKIyh46EeNJMueOW6neEMtaEkzYc/XhBbTH8/mfS1pyNoULCdCEV1l2GKX1C1wQW2kq4GgO08hlwI5yXIZCa97oan0fIt+gEVKYKwU6XU902odmr3pGhzp/n5V1wMKu7oeq1q+B+4x9o+5nkV6Fa+QydLZqTbfxSqIsdCUGwd9yCAeBqMt5llhOB1MwK2U6IGcEmonXZutku++CxUqFC1Z8N1/v38H6pzyY8c6hWBM8m+SKRXaqehmmkZfWhHV8Hwh3/Ypp5Oa4ra27UymaWZAKO7n/3zz9wjUU1TzCMNdxTFTEAi0qEcEjXC8dOd52U5t0mFEUeTaudcf0BurDatTKviBsUwjTLRTWGnAVaLFp5HyiZCC2gehfUrO51qFbSHXNb8YWDzVDQmfqd2g0IFG+rBKvnpkFmrYXbFMOQzo4UuSMQx0QkeVmN2rXT4STcB7TxjOdtSBTbu6hFM+8bw3iA3kygfEt1HqqUen/IbqXIZBU6chTBJz4rKJQjBmrFSb66qsJsSmKODfLXQ1gXN3Msb6F24jY9HWy4C17h7V+HR20FbS5ti2bed0lQyZjkjIzFR4WR9NwDt307hRtldN7reZ4/CCdsh4tyu6p4dC7xOpCtJ/z9K5Lu8Xw/eGT329tmHe/rGP98JDGvxSTxuFlfeuT3ywiutyh7R+vnW7uNhkl2qtD7uDakcq2oIyMdCswWd/zXs2hRZgIcK728500tcXgjtT2Cl9rfJc9zqYVgWsmrmdnqeLy27JSDkGEv+ovdFAIlxYA3nxd5vlE+LI81lWWAi3Kh3Kn9RRLHHNa/4x1teNbHXwb7UnxwHrW7Wwe46qcZ63RIiVIyWLAmbWlD08nx00FxNaDeRqSpqu7FXHV5d7uC6gil7fIU5L9v+dO/2enl5WZXa4N0yHAY3SO2221cr+PukoLTkij8C8LaetAqubgrJbwhjx9n1xWr3N2K8IVzpfw1JArbvI1Fk+KtoIUTBxok+V+lI9BZuKVqGur9RTsIJUKtRkrmAndLQGRTutXnfES628JtXu7Ot7gny1SXIUk5u88wUFKg4EDMOPMiHH6y8lS5uyHzZvKG50cegyGgTRtDFNDLhJmfjzqa9EFoqaMU9T5LKSEvXc14gTCtcqfE/mhl3KoiU6g10zeMezzuLjkw73MP++TYrA3BUNoHb2VczqunRqs1qZxPRbi79XftG91o4H53m2VItGhUQtftjXcG2VlCiVEEVME7lZNbnmo4i+s3PHdCUPpK7qc7k0GlRXpQO89nTPKrXCQ3Tlsjpuvt+DY4Q7zZdM4MMYP4RzpIbyLU7W49ud1wd8t+Cj8lUVgwQzVhmkaqHMqPh4wT4ZJRQXUFl6F2dyom30Wq58gBLJLMUaWmKNWpXpFmTzjNx+Ngc1B2TBw30jyWDcxv1zlzE7SCBOnoaoajIL3qKG/mEgWGVIZIrdrmCfSufAYeICcTujNZUPKxv0jdgmMNy8qunk/VlPVQCa9XQjccRVfyRSFaM4TDa+T3y+ElAXlOFpt5dPEvOOPAXghxDnXTs9rt6cD5E7ivrCX6GFoVzUkY3F8coAqYV2eJw1zW3W+vA+uqy8sPQ0oo0ZKOCqM415jP/KUwPDe4pgBCOzp0zmyU0MRm1xJVMyxcGjJZdg0ij/F6Fs3KGhh+gWEC8/IKeS6UQvV0clGrnnSXyrMria7K7GrSKgmIgpw7y5Hxe8JY+b413pdKQ4rEio9gA/IqnBFCBtnNg9cqWdV0bOHU6wes8DEykMf4au3a2tgAMIGoGyQ+d5TaOdTJH9PNh+qRn67WDAZIEE0dNGf5c8ZLGp44zamVksLxAMCRZU+ft/g1VeqfAzurtrDhTR9X4vhqmVm0K7YkYfhjoC70OgZpqdCeVp//pKq+QFn0PBBF6jCF+tFnGyM4PsY/Hy5SRC4GOE/aPoAz3pPmL1pVszGSAlK7t99NShRO2U4bGrYxlLg28E8OZF9hqA7021Gfrd03qfaZsy+EBMlSeDGF7WSX0n8+fykqH2lZsJCUbbzLK6hhijfi8amaQ1n14mbt71cg//Y7I0OcRcsSOL9rMwLljvwLUXaWalQbTQrvYgIWqohKSK4n4R2JbPADsCXlnM+jlpAC8yYbhKUenTP2TzCMMzWrWU+TuyFd6bVf3M+IkZG6jaZtDE0lDDFebaDk8SIXiRFVwUJ91qGbABZKcoEVX2J+SP0yb9r0CaTY3Als+ux8IWctjdgDu6raMa6WPvLZssWL22hZFAh0sugUkLEibAFlQ+KkqnK2sdEQM3STwAVaKXAy9Goqgnu2hT97klJ4TnYR+xLvG3IsNpoSIrKQoxQh6l5k2hA2OKH3kjgyfH4wrbsi/wFja9gWRNfqMlFvCFRkXyylrrtAkzHSEyRIB3mRE5eS+uNXOH1DKoG+Qcaqv4Mvvg13t1UKMtcQOxLTqjoyW1iplCVxOOCTatxWJ8MXZGPleCSkWji1QFP9tchLNxkkyUtPXYFwxmxDOzpQPftjvNrKksKR0FOxnPiiZoQskv/9i3G303lSKqe0vfsay3RI5N0YUlqyaFwUJEGY2l8cEqI5rnoMeh+hGvG8heFVsm5CuE+SHJvjuhljepok9HxTryEVw2whOej3xVn2sER4ihEE8bz6HjIy8KQgRzh0e7og9/rFXvliCDEkWrQuGWoVD8MnQv64lIGKEXCH6oAa+2thWlYjlcu7cs406Hwxp/kvNJlFSV5c7HIv+D4MSQz9X6/St2SI9USGZgztGN5gmMCQ/GEMt/YikZzyMiCauF6HLx7AC6o8fM6iGE14aftRFAgma3gn5IX/A2BlPhkyGGK076LUBxw4pHNTKxvMVx3055dSs25aGKqHlQKY9Ha8DMKNn8s1Xa7kAIb3GM4294w1QO2cVbvqZ/znXjJjieCzQXTw80XPIoBetcUnzGukfcHADoJRBMI9ZPTobvGODJ0V29+n+L9coEXz4vcDRQ4h6mYKQ6kNXpWrGmAbpmdgBAdmxTfRyB3B/7QHLO9AkpoMn3/5039DxwR5mH/6p4Ejo3cU7M6BIBGceXkjcXpWOvT8714vDnEw38pxW4U0jd37BAyNLdqXLQHVbf0lYg/bAi1FBbbmEpqHbno4HCkKrAVR3tBweZvw9q9JfRXxbSc5aHYMsXS9vS62TQkOURmUj0yuvDIg5Ka96uJVJ5evZQuCBkuz4Tjk1nVJie1nvF2LBkYBwB5Tayf2MmFOKqBHv4LLm6CWGokOn3rgiRrxBVYuU2G2lLcVz3CNYfy3WIjJ0BEcozdg2WNqgS8CG+1fVJ2zQD7fezd0bVwMnLZU5N44hgv2/AfDD3/XoonJkA0DpDTi6kVdK9xKIsrvX5yObooYSgSJBQF4ZxPv4GnxP/HPItxzWIaDDK/XyaX7OkM6EE9hM85rcEXbxnInXZtIOmEM66fo2leJ4Mfh8yL35orWcLvcdC3aGAxvgrBM6iW6KQvFX28JnJ9ukhC2FUeHE84CFvP423Sd7Bier5mhVarczuIw7AaaY7q8cZyGK3oUGO52mKG4WU0MpX1xR2ctjtQ8bmuucY+HxAobMqydp0UjA1QfgBm9K6QoCv1gEHKE4tONuyDdRPFQFFgV7Tx6uOk4XwbZx+2dM/Tkmp5mhgAwSSvPJVbfu5INXOQruvceglmCM3ayoss/wfkt7N6x9v12MS0J9LUuhg4Wzcx/DoLYBgtE5BBXGZ4XUTZiLgN21slkdjrO1B/pZPEd7N4ztb8g2mLI3tLSuRcdCsMNmP7eQoy75MvXEaOWHfjTNkArwdI6WZRRDRWl8S35l8ptyCzZjXNWEkuG1CNatDMYpkMCyzw+bNhU1ErdYCsmbBy498dP5ereoatgzMxJ9jB8z7D1HYQYkCFYkqYAq0PCfLnCnpSD/7A1RNMp6ce4ZQLva+OHs+SE3ErondHnP8pnGJy2RUODoa8EEKArpIXqkYKwSrYnErqHbsI4OC0KrAZ4th92hIAjul1cKLYYHme3XYF9dwoAWPG2uMJuXNZy35l4f+H2dLDZhDk3Gozyyc0j2xJvILF8GnDc/Bra2vDXGwc2j4C3VfAxg09MWXPOlOJvnfyAksMwFTMfTLAn6P9OoKVQqcAXBYWsclOjyIkr5p77KwmY07zkfQGwRz6o/qWxIdodaxT3C9q6VZZ/plqLtka6EByNNrIuXS9ZsZebm/SnmzLs0kqAB9eimzORNyXoZjzL9sRy4Pb1JIRvKJTkYU216fYp/HTL68p3cECK8+kAXfIgeGdGbr9+i9bmrikKpb9qHUuFJhWhnJ5G6KaNl6DAjWC9XFsAneV/X7yYzVuLNneW2jgyBHGPh80oz6qrCjsFquipkv7UZXefFnSkdrOe4LwklhkzLKnIor3ZLAD5GMVLo5G/MrPsUrNu4hCRFEU+EWH/vgWQ52xTWQb6LH9z21XEFJyYeg3j+lc7URVU36ENhhaot66WA3brkO+dLboxPGOIt2hxQsaMP467hXzwLGavRFvCS9ZNHfPyQoBwNXQQ3h+SkOHJf4fEoRGGZCHHnrfjLCWAxhfIiu5MhqrYAoZrRT096X971RngJykx3rJz0ILmYNHkWDEAX2k8qwhoLE95cFfHknSTh/uIsBIAllrx+UKsau4BacqWYYOonsu/HATGB2QtxJtFTYBQjlAV4Vzl7N5o1IfeWiL+UZIhyNDEotG5ZkiMIcbnNDsapSgOs1WJxRmi5DSFVvKaL69ES5QGmR25SFuO4lbYFkMvCB5mtAj1QOVks/1OZPGy9uR2KRW9dbmm88b39nlrhnCLVgfDfEh4wcZ1LqDRpNI8KNqeWvQ08RdpLWuQc9xxE9cKxWNtCj3qdWH3BnQ4/gKcEyvpiVx9RqBphGvcE331QM42BLynSKOq1Yd39FZKw+9v01Pwe2//RBbtzg+HrO0Cxs+RoyXw81RYRzuB3WlMscxOvrDqq8wnZzsuvchldOOjCFQPz8bqgNebbUOrFA0hBlYC7JJmtiDP7QqYPiYME8W25gOpv6AkjXpvnINqoEgbit9B4UVRTgTezA21dUzhp/BbWf7hliwaHgwdJYAXN4oysAg5QlnHWJCIr7dd+Y59LN3HnTIAmOko7NRbwBoIysawW2+LqkMoDMiKQtUY0czpw8hbM1x/E8WdzJHnM/qeTjU84fCFw97RXUzm06ENzwfdu8Y3HxLPF12/RdPz0BBs1CiWgcXtFNXVRLA3eH6WfS/Po4ic6vOFKwDXZaRItyIAXm+AViLpfl0opzQ7VV+vUYS/f8F72x12FWkrMGk1xitOurMGB4if0mJqNyv0l1lq3QRb7xrXaOSN30qYYTxDwKLtkRkEx6EeNtHdKAhpiRQG3No6mndSNNF3lNqDhyVFulXRraSVJCcKbuhKoGj7tjR9TsYxG+A/6itmKKVIR07e3CiWrQrYuw3Lu2KihbtyDjYCXrzpbAn2nmZWFs3PxRI4m9qr3oa+AuFFOcVo6SxMN4PTVnE/jYs0bsqq4QgpAmD+rAFB8I0UI35Go3Drckkq2IeVS0Mw8vvF+MkcNcB8COLG9gO90HyVPfmyEfCQf4nCsQeGj5uxmAE8JwDHNB5kko5lU0rpaOxTkD4GW+xFf9mjjZynXgf48jAgd/ZBBMn/0Nw5xdqQoXfjxaUGLSs/ZVTWW9oQ5Vtjnw2jWKYKYOk2AoJOPHd69z2t0UbBlKK+2ChM22ecYJ0WcwAfBsAbG48vHX+aTBnI/Ua6AAh0lVDaFyrmIh4r20BDkL8cXkIEVOaF4OI7bHAErkZ078BKGXNohocE0qxbVA95Q9IH+imj9A5tNMwjstONJGKdl2SItZgHfCmIx1k2o6wei6FqKaOrXcgRAigW7t5oJEUTXT5tpcTkB3G3IZe2BUDbvGZcXyjtw7gfj+eH6ZVWTHaWIPGL5mYUySsd95BRhQ0GzC/OUcvo0d1yJ1jITjA1j8P6d7wdiWWrAqq1mAlgGAzJrKKNupN8uFqKULG6ce4ft7fAO7UGvqAiGJ9nBdD/kvgjC05Ch4HWaBQRdQ7Y/KBVTtdWSD16rNN49BZKV7UQSvuCqgUE9rw7aydrvVIfDi7C5AQkFNnZYafpggAMexdnMRt4BQrN06dVxDiq0O4JxU42V68AwZMDf+03DLpCfCjuEogXCEKQRwiia6igJH2dREGBijNshsRvJpYH+gJ8BunDwQM1hP6qxrvcF9nTwRbS2ZYUcf6hUipvJyRbDPf/isWM4KoheEHqgKn65KFyBSi9ju4/jg5tHEiXXreIZYhYNLA1WfEAjuTiFY1f9jwBBFdQ9iCFGQ1gagtqlOKhXWSbUUI2zjx+9P2FJlq7TX1VgRZzAgyBvQDw0P8Oas0zsxH/EVxTR5DClcRJrUEHZZK5AdlqtxLRg4sp6WawlxKSxQCE4YO0lR3FT0rGsFYloyPop5Do+lu5UobdePhiri9E48zhKQu6jcXMIGQkgWO52YxHDY7FhoV/1k3z9KTCR/M2gfi8MIfjvIiXBMrkksYjN6Lp0wdaEh3+OYuCwDAXgkMaVTyoOkusntc4hou049BaB08MsvH8pPNLEjJc0lIRUwv8GPnnGL/s6gcbH4yr2HDNk+PpxhZ92cRikTqEl4X9RVEb3+Est+IRH6zztHHVTwtPA4LNKzxly/syhmUoFin2qndAXbKxn83dKHsHPzzzOF9GuQa2xFX2o6EjjruBjbqT1A7FRpM6L3Ttq/ZkE46hb3yg0Ml9ijcz0ggy1bhP6Hw2M4rh9zfQguhQoLLNWcu5GrVmozJpLikkgLSHf4cTUnpFKk82GUIME1qymCM4D8Wh9oHFLYVGbtyOc2qbiPQBSg2iK2wgWnkiv6Q5zbXceRnH+0LwPhaF/8uxjP4oKxTdeiuoWczLvZvDHBNwwTvGPlymIUG0leU/dxuLeUKGOAngTak1L2xCZKTCSdXCWZdGf75xABtf+PvXT83n2UZ2v41uNLJe9Bgnw+UNXuhvf8KxoAcEPWQFsFMFuxHZ29TrlQx7N+XLKI7GAIJaFS7ML9dutN+dqkT99q5T/AkDNnfokVBEneNxyyXaCtrerCzmCo9BYXo4pLMDvSYsiZwYCU6KtpZBm1OXQ96hwjGMx7sdyLirVJNa1LO9o43I9+CwrKwgfhRHEBR1yucRFVjykUCPrlZRYEiBuHPiVQUMz60NfCYm/P3LUBfhFZHf3+NgowvbacWoTnZmhuYZ4OnnK6ILEEBc+N8lH1GbpGx0HMT/z3BPjx/yTXBHANI428UhIbdDtFGHFBgD9yo2vhle6NoLMKgS43J0Z5+54td+q4IgiqdtxlCdAnE68N/G687IoMO1tEKGkZ8dj/Be5ZJtvegVLGYNUydQklSvH6Vqnr4IH7EKsj4mebzIUY+NjpsNMrJee6cKjnUoUligZu80OC1gsByAqtKVEDBUU7oyjwMZRYOqcTevsQ42+9ppye+S0LouTRizGMPbDG+0YTFvwLAegMeyEb9LCD4RFoPX4nJd0a7uLElwufKeYnoWkoCXPDuJJs7VwzxC5YdW8Fgv0VwyAoWSOVPFz8C2R1qWUfhRGpbdITirf18pDXOeVHteJM7RMk0JSpf9l9+Sxdwhw3BQJ3liLSH+chfVmfKaOeBX0SySQmGsfK2/MVnEbU3bKP4CKgU2Blwcoyrio3C10zUaF4KTEDyr4meh5h8yasxQcbLW3sEpNTLqivAwugcF1v6Qx0ecj2OupJ6rZ8eQz2L+sFYJ4GlpB5ZB1w8lqMD1pjkoU/JBsrXRZ6f8Y5MGwGPcpVPZSE+NF3wShBlMNF303xhk3qJjhWF1+I8y768wYcM90Y1iAH5+lN50f4umDdXzjM9akcUcIkMUxQN7272w2JFKSByu7Xkp3jRE2TtWKmk5uqeFovNdcAkMx+OFCKXwKZQMRNPnZLVpgOrI3qIsMIRlifdmIilF4V6eR+gbH+H4zeCmhe9m1xXHcDkFccg6z5MdQ36LmUSGjwjcpGgBi5cVEpnSu5fQCYG0zWljut7o423L1vg4E6wRoIPWGZYSOl4Djr/AkZTBZ+QU1kpTYojfoLTRqpMAjOxuMYZen24KwlHgOafw+hl5AwoGzCsYxyp0RYvJSBJz3x9kt2UuYecAfIWN2Exi6F5CIk/6Y+AVzLwjnyij39lmw8sL7xaE83LC9vBhZtYMQ+HG31vPFeRUqtJcuZ0XwW9glcq53Nz9xwUuhnB2kCPqi7GB/JYrNMarbYyTMbnvyluSc8EFVGQxo8iwguIHEJs80vcUEZHIcBbMhKxtg5+ThuTCGxhHzkQ9hUPM4DV+0fiEaug0zhZ9gRqsBDQMCRAM899h1KchpaCriyjcBj/GdmDJ8jDYOSahsLafd3+SfJp+1WlrSC5kSH98jOvQZlLP47K8EjuKfAsRQa5qtcfDDX2cY84wQnKiywYJdDAeDgRO9RiSjhWLYndDc2SvmwTde7sqMAU/B39wKdLsyFl70d98IRK7NnPoj9k6TzHh90rig5N4gVPMbp15S24M+r9jaGgxt/gOEsBB/P9QO9/bsuIX1ICe3G5YEes2Vyn5sTyCoClDiRBn92C00NgZ0ZEj7FwSAoZtFqWBYTUEMzWGL1IEvh2hMT/zJqS4bIRha8EW84sM+SBJJxpm9zA+EV7Q6SAQ7yl2KdTiGPXQJwdlMq0oHEbzBfBDYSMgbJjPWFKXhO5yt2eiCRUES2HBxVTgRPYJvCrP795lY+L9fdMbiLvF8DFD0m0sZhkZbgHw023E/aQGaiXeCGGJ1D71sSRfzp/AG9GdggBVF4Edv1f7Os2RB7d/wVJTb1EcngCSlEWjRgzE3wpGw4cvjI7UuQq7xZDdTKoWM42vSBF49emwtnKFw4LEmVVACcVwtc1ccka5RuMmh6TlwblVCPIT0dfo2Ms4HpG5uTcGYUPKK8bNoJDgW/knn4PcCehSMb2ORny75C3qsdd8MYv5xg+H5E7ORqx6sLuJcOXEJM6sAvrUPUj+fOCdh2C6eF4VIiDDJ732IymDS5wNfp7L+LrHB3pReR7ldf1av8R/jilNcAQ7H3tEzanLzxR0K63sGKIs5hyfSAL4psSO0vorVrQ5BinMcjER2dkhRG5JIjg+CIYXd/UQ28NcEKYF+kzs7YhmEChsHqEwzFFgRR4SZO77NEJjvjnikppYh5B7yn9qYxMy1Dy8Y8Sdw7gbkjqSqxfMx5jEBFkyDTYb12hIIfh8BEGTnxAyvKlchA6jqYPPhfgOjZt+PD/oA6ECRySrHYJ37/sQGKe/G2rrWEGE3HrJv7tri/nHmVJEn1kmEp8iFoYiJcgMmq1spZIeNAmYWSoAzw9xkJAHeuuB/t7jCOgKhmAUsMGI/uuqMG5DM0/IGLr4F8Kiuip84ZbMksMLuIfhPYYUhpoWIzQf7zi+tzKOZWB95RMLDYkxb94fb1oSkgNoguZtkSTwiAFa8cDz44dVGYb6jZtPA/1aZ/wmCsRx8Fq3jijsVkhnG24rIbukJoqGTT3HjI31LzEr71hxQOLwa86r1HGUSaFeRMeCJKUouLRR7IlEXvqUHBBcRi7YowDzaFoGjb7pL1fixIPMGKK/RxGPPArWyP4D7zwT/SzR9ix2zQwJLVnMRz4RRaRAHSLRGfAmEvapEwKhaatCgVKJ+BQEESPsDJIQCQ7YAZ8JN9y7zmH8ndXbgfDCSizVAgKve68k5PnGKtaI1LV78xlGiLVn2wXZpSbArGRFjRCo3vKF7SpwQpEwCC0RPKddkRSI8b4UgQ2qGwN6iHAQO8wvU2yXkxcDvtQALAjBVABYFAiGcRB8gtEpJyzgtebN+rIhs/o3ya8Sas+Rv2+tnHwGNLdsLyVCLXl9MpHwFoTukx0RjL8sRcL45sP4Pyj+5dY6CLjj1j+F6JJTwPmDwNBRiVgWRHj97II7Hf2F9aNNbN02WykMEt55dieymKVsjsBQju3vK8f2XAgZ/JdGq2eTQuEFbPhzZhUYRxYcgB1XFP/Aes88iy/j6ZuDvUdqQ4k4BAArMfoRpnqhUH33Hwc+5MEXnJ0UhAy/MmQyLGRoyZDPYq7y8SEqiG5qFElhLea2KpDUYSAylOELXF36UiyM+3UQaN7fvAADIXU7KxID1wD+xy6V5jvDQEXONq+gAPxM46ewBUIKS0sfvdWf1WevaUgRsBeGDC8HY4iwmLPcblACyWvvKSol/FZ3dehkAJvYjKhzlCsYxjodRhFK+6JwlLdt0Qo4z9tuYLgGzfdtK1L3+8EkALsQ9Z5+gp0PCs/CHqp92HnByx0/rj2GUQxxeVjMXjI8pMi84jKxSuMFqhkrunPt4MTZC9ez6gAEGhgjkOKvdTCvWMvgkl6sFmm+M8ywOITCfc7aoJg+BwajVJUDhWMc43wZki+vnfpfX/6MGQpZzGO+D4XK+Xljq8pEHCyPDElBNUxvR4qGpgmCsfpO41eJSwaAr98i0dXReQBambKRfC9/u4oEZNYV3cRmDGcR4v6ny6l5CiuDsdxsBLaSykiUIY3h7aCQ3y+GBwyX1vyHGXq85W0s5jQZ+gCQ92mJvY9xFsf7wHA1OH8vXAqHEd0uBIVUaVxmZqE6NfxtiIsBqr0ZV7e/EhD+fxYlosD54W1uliqCTtV50zhDPuTW9b4SzVz/rqd+I6kylFzEFdJj6FtPPfUwTCzgPOlV+kQnYig9B4s5zjeRBDf4whqfK1IYlMJ3AjG/oRQPFeKzJhnI1bjBZMESLNuYM7AUmWi+n5KhvDJXEy8JwIsbhAh57Wxw71ck8gkrntmQkl+KX8xypL1tAuOb6IzcblphYtfBaDQP1Kg+PUVAuOkdxr3vJUiRU589yLFbJKARl9z78UVz+5ot1KBbd52ZipR3zwy7Mxl3ap7IsZyR3W9JEojRNKfwriPmkPvR70tdRZn5xVJKFLwL16jRFi0FxLrwf/lshHsNNGzcikMW0NTa0XwvHj8S+cIUHWEhNmFcrqy+29PRYt9WHypHeNukULrB8OgdLI4MfFYJ4Gqp/c9/e2VNLv/6gWeapIj4ehvaYtqXGA8TojMglK9ZrW4YiBxpbmfYr9AwLq4NuXLPIZx9oIG9Iu9EFvuR11Qoon4LWlDZFscGZAIBoJ4Uq1PGvw5NiujzF6yXfUJT+CkR4bJZoyjKONZiPDhsnRghBK48cgv47TTfg9bgAMp3OWHdIrgcs+Wc+3DwEMYQsK7Fk7iDxdDe4gjBfVN0Pa4Ke/10LoLgO2mwDxsIuxDy+zRqGI9BgmB4BEoRytH8GmsG+tdVH83tDEcsygTDGIj8wuV431JUt6dLFR3YCHk0ikD3ZVCGrR1bHCPwPpDqwTeOpNApIRUErXYWOOUJzWbzOn8hcQMbPmEQu+dc4Aa3aBUHn1B1O0Tfv1ihOCgAn8k153bBaOyjF/2lQ1820q14X4rGJxiGJhbHCf5+Ct2DzWMPei5XQb4a4LZS2Ayje0gh8RT4bnedAS+cba6HZWVF4RcBn2Idfd78aL4znLQoEy01i7fgUK8fui7Fy7hS5dSB89xhMTTaE0oo2+JIAYaojGEBeBFHy3JlQfASJEgShABi4ph49dsNGA+MwZl4WOFxcYa49jSCap4V7A/2/R0Uir9CkHbeedFcY/nCIkJpH6XayHm08c8HkZWkRVgcL3hOgmzZ2KrAImTHalXMKOF3AMFcExMCAEVYmA9eZeA2RBpbmhtD34/Vbbx72SVh39WjUKFu4pV2ouV3vkY3Pqp7o3Gl0I6O0DceGwcm9NeI1OonnJ0wGlPNZd2DLsYPWhn6Q9M+BZl8dyTwDvIiVIoHWCR+3XorfIJ4+2dB7GvMDnGPgZofDflkAwRMqSa3W5YLwKgeFptReu/DwbW5qpLv2ld1asR7kLVd43TdmSyn+eS7Vc4tSNAdt7kTScNtnspi1lGUaolg/XA/nc7B/w5BR5LWFwQxXW+C4lONIgV8r5GQImjRXwvsiGISGVs6/jQlVOQoFoZSQQF4ZhuY9XaQQ4eemENl3IMDDWvrSXO6CpUnqAzdLY4cbKl8UAAO1Dk4cV6oGF/7o0C9EDQtJh4jI3N0KkaSM+pzv2tqpOgCZIrzMd+ZSuD8hSTI2CZDdfUYuthpa2RuE5xeP2FszyNvKo35zTFEWBw9+L+D+N1sPAC39NGdBlYjBoaoxWn3V4iJ7eCzUXpegNE8UlwLZ2pzlzqRpx0Ln4EB7HKiVLQHmXJjgm/dNPr+shNJxfZexuIIwscmGXH5b9d1Baif9pYXAUBhtLy3mHhcvPs1i+I6DMB5tcyhx0mGhRnHHGE9jr9FqUj12gAUKjICrusp6OwppcXQyuIoQoYXiwdgzNNhHDmhsWFvQnz104OP1q0vEBNfgdc9my9Pnxn0tSCLaJsqWy6DaDywl541q0gWg6clkbm42OAPJhwV5sUyjCrQ4khCyBisVGy8yLq8Z4iflARCwG0dzlymlOtg9x4x8c5GcVr8lXbSAU+tGZWxWtfZ6EBTw2s0jqxheeRdtWLBsAa04GAIigFvPm/+8YSG9bMsoU6LowmfHpgycOqEOThfVoivTeNxOtAZ+JsIidZtWIu5+RntdVKSMyXmbMUgNzI/Gy4Ee/k5gXJ1V64OYnBdSOzrC5KhdJ0y4/ZWbXFE4csEJTA7aUuKwIWWkkRANgSpHgXpYBr5/SIkzoeOv6QtniGnd4VA/f7MpUsJ1WO8wqSNy1+cHdRC58zhvYqHzbUZ7+ug9Shn50C3sBxVup6kMeCtxwbKmJwCorAhqB3nI4PORKUhIo6PNpnhHZcPT55aKm4EjSMB8Jh1q8xqIMUwB4DbirYnnOZT4R6IjaoypC/H4tjCvy8BHH5/41BM7s6tiICFOnNZIO4SERAVGx88feN4F34+g+i38IbB4KV0qsf0a/WDGdWtadcq4r1iuRsUSsRm3Q8zWsgHB5ch52AWxxduHYLZGUdf1p+zElxQKEeEr7bRyBDURWsgW4+ATtVO8SfwV93vyHEU5NtHdbjbDfQxzRPNndz3UPB6MwHpc1yDV0Fw9gg717OvxEVSc6YMiWlbHGOYFkUaPm171/Fsy78A8FBH54HLhNt5c/EwvvlAG910NmoxPaZShPdcUi70dfTjJ0eAjeXpaMBiPWXIry512neTryj0+Lz7lcw68rNjtI/LN/HwFP+cdluOM/w5kiAIf1sGNAH0CsCd4Z0M9QX6QxrvSwmHt0VrnTkXR4ejL0tvakmfD1VPQ4beFuXi9hLIND7zDY6zXj5I6MQrW9FjcTIkmDpDgsXRhl8M0jyfuQ1sOEzwMah2zYSL6tW5Nii60fWO0OMN+UYGwc9GS1NQdTNl1gu4CgFTNHb7apWLr5Yo3j3IT/9rYTeezOmw9lkfJ4ar7dKTWlRGkhMzZjj+DhbHHC6XZAwe70aSPbqGBfgqug70t+Zh3tWWJRieDz1gWv2z4LYMygX6Zly47WAnU40DaGGDoY1FufjhEs80Dr+Y0T+NWG62Nzzam/Zn7YP7BxjW9hPe/tW6m97xbGd7gZtw9ZwpyzWna3HcYXag0efnMyQbW/ErggMefJZMq6MJNpTIEXYutNhho8YHwpEMYVggfaykGlGQbwWm9cuiYGxMEnLmF/2mV/U91umIazS+Io7hYo9Nu7iMcTLqmtB7rXSqy6hCCsCTNMdQ2uLYw40UD9G+ej7jODVNPWQnLcDXt6EPUhiwSKvOLxS2hc4WdqS1ePU66VqSNALldDEBorMWHQA+mzYI+8y5fgXjYlIFyJBdj3Zyj01rLR4/P8Q4fNEMnF3Ijhf+8I8eOvSObDCGf/BwDKsPwPN8DuhHRiJDgAhbYy+j5wHYxVYqNbPvo+gSfVU8smyvUouppgauurObndZm4+I6T0MipN2pKwmfaZX/jiKZX08P63P0DXl5XHReVwTeiK6bdVhbD+z8QvlKHrCxtBtXOP61j7u+xbGIDPk3JSnsz9mIVsyb7y3A1xeVjHVEBVqlh2dPQhjMHB1zzRU4FcGFP0ye3lYfCNrhLgcAPkeCwDDLomDMWNF7Gmmv0rQtjkgsAYJVAiZLe4dE1mPDtBLga0f+sAW5nj70Amacj0MU3MSGdRi3bU42R/aPqo1EOhnzebuAwPBh2UoGwxoF42kYBu3a4rjEr5awrNEjRo5N+GgciuQVdOswuse0NcTAZBaFjjnzWkZxcqIOx0dCYAngtaoLEkYM0JV6hr6KDlylJqXijAzLtm5xfCJo9FAvChiJ2yUfhehr5QJ87QA9uLE2KFf7AkIgCeM+B2Kvn+TujwY7on+uYDQ6ACD6/gLsa9aGoidjkTL3MHyeYDbVWhyjOF+iUgs+sh+ygLL4MzCvxYUg4CwfI0NAn/OrxnpcfijeeTX+zpLpbAysFvaYoC9sUTIOqkAwfPz/W04bFkcqtnRX0M2Q3vOnIRtCN1f+X9flNvXunrIA/vghRhHsfGA9Lm+FZjjlm8LURiLhKqn0xlLCUuukaDDEf2ojygJD8J+rtQ2LIxY/TkL4GQD0bfUrg+prCbkL4ImvM6+l8y1gm1WI1u24DKO4Ho+VkG9wWvRS5p3OA4BCgTU5o/jBSmWI/CqGzKBKETDc+XswVLA4cvEYjUBQxU1txtkBWfTMFxagB8qDa+XHbeycBrz5fKVgPpdXZ9zjcg4ud4TmwcHd1jtBIikChhbxhKow7dTfQwE7Vrcwhs5rsjiC8RWpZhVXkmTJg9yrAJWUHKFUXvwGD+sT/hBXLA47AlXBJhz8ZUge4WdMwxcgHBuZNIHO9FWkFt023+rDri0u9p3geWZlcSRjuhlDUC4oJ3sddk4g62d7aAGcUb0tdolx8IXyQpmnLq4jYJMlGZ9RXI1nKa0kDVZYfQ3vENU6wAh61UTTXrUz/uFPw/CLgCcaGXYw9GaIsTim8Z+AleCUV9BmmWShxayc/+Gvd1wdx9PNA6XFru6yiEBgdNQ7OtbOJXHsiegKnoSq1VcOOZn68cD4iVRnProuJ7sFbVsc0cIPYJjG0Gq7Fsc2rt/B+SOCpIz2efN7GZ2Kq/EhwEDbYrUQZoAsspKyxFC7NQ/jKackF7s+cEn062zHvV4cZLYF9qJOEcTMar7/HMOlk3C+wsJwZ/sfl831LY5zhC0bOue3G5UDyPMUSZdXnC8SICAHpCLWdYTSvmwCbgy5dWFzjxK6h1FcHov8VmAFIwIpf1B8O8jubsUw/GE1C2h0OQyD/38Mb3J46F03wLAvU4Yumdj3lsORDi8MLcMpvqumgr/+WvAXwDnUXnUce/CwNI+0XfaD58oBF8Kq3TqcUQRCz84MRK0MgYsmvcx5QBDv6wCelVO/FEd2zFCLoeMHvXV7v5ThEUMIiVkyfMhwq4wEm1v+wb7FmPpAR8RvMrr+xnvVfGhgOFLcv4KE7oWv6SocN9vmdsixRGOoHDs+hP51JHof4Qr/1exRAP0P9RNq6wKNXLQEKttX0wz/MJRZf60MCQyvLT87hqTmmmNILsgTt9Zcc81lt6WcX6/STzvRdi2OimSoVjyq9HiND0wXXRLVA10rCP9BZ90p8l6nRntq9iR7IMassVbXSzGGRLBFwwW/k2uylAXYPaCNB5hAwQ+zOElx/0BFVBfnvmpmnHwT/NMxix3at3t5Hnh35Z/JZeakMXdhU44wM6PvH5F1xJG/FYwjIAqBAYKZAKNHZSjrNIWNAEvQ84rgJePnSoQVVnvhpXDfaGUryOQbh3yyEThwUSHhoQfZeLD4ROP/wqcOZ7NwBve3A/0NsjLwesHgRMXfLmH8SrAnFXskHKXsQIvyy/vrSBdxRiagtwUbnuHtXS7n5+N0eWhHB9bnylb5eNi7AvDF9HvIyBE0kJXAK0fFFuhUhYs2Di68eQFWD6xgYNnkMapTl5pL9UXUTTHOIG8+OxJs0GjKObA6FFwxD1sC/AiZnhylTIJoIEUzfmGLkxXTk9B67BJi0YCp4xJz4V5sJqmhc05KwSUes2I83tQo0L3oakPMUlD/cMt68LkaFvxs2CCI9PQwteulg6PlM0jZhA3Mwkgjau4sJHtH7hNfMhA6+YYEXFkaeMwN63LmZ5GlGyv4JFP6eqA+CyijRpsDSo43zhDhlIVTNQJfPFEEWTCDVnWpVjkn5xM7BN9V14fGsE8OCr3UA9l60KDKlupOEZXz3CSpPT2v434dEgaGlhYnLTKMkVCO82UgfCnrsBOdlF1J+uFRO9+NE64KW/wtyETk/zESZ87mhn3Y5onm/kfNDWPsjICxVNiSESFh+G8tTltgCPtoCeVKNmiD76ySOqlUDbzR7vnqI9w4tg40MOq4XnxGQPMwbOJR8qWxkNIFuCNiGhcHIs2pQjjNZ+ZAy0MMUU5csCxwsRLKqdcIf/+ywZnD6XRqHnhOX5QLPxGcTSwJhWvsEaGM8IX4eF1euPFMo5CEnJlfiYgnhM/80Kv7AvUZXImEIT2LkxcZekkwM3ptG4IhnR0caqw2r49KYp+u5Eh6qFLbS6czwEsPw9o/RxJho9igu3Zm3FdWkP9xiFCMO4aXh1wKfd78CJcDuFezOIGxIAlnXKORB+KrAz5p9e9yEnJE/yw+yy8VfJxwoFZt4wtkedn12+Ac0MaDKHM848MQg805fgoECQPNGJFM7WLOpeuUdUMUQfuaEQD3MRR3CkOqqUs4J/xeKG9qk9qyzomJ3XnJL9tK5LV8YBbposFLrbyh91ygTsCj9uR2wchef/2xJRmGeHhhR59lzniHoS//i6xglBQf/GpR7zoHzHwUVGUYQ3eLkxiv/+MknAvBHMLmq7SidJ6sI4SMjd+oocN9XuB3yc2OA9cIHPjzmrw/iyVceK+1+dPJ2I2PShJV62mUriwPpXVh9U4fDm077hb7hLfcQ4qgXSDCAkL9SGLY9w/gT05kZIhLWMLZ0fPZMOzL+tfj4bJ8Xans4l/kZMPwzRHR2RBUYIIv/IAzF+NsxLV8RCq1XU+JkJakzKOl7zqdymBhaM/wq0QwntnYlw3DwgQeXHKO3Y77s/qM7mkhtruEHYD6UDysxml4hJgz94aZImYIzbHeQXjBvIFgaGtxOiNDb5Q17UvuyoZi4QpcQcT8dG80cJoHT7wSVHohKdwu7xRfck+XMqRoq99erjyGEjcF2K/Zu0IrxW5hFqc0thhUYu4VzeXmFbexx6qVhaNeDVlREuuegYGybMtQDeRsCDbkugND9EE4rMKVvCqxIngEHX70ymEyQtCUEf9rc3BSg2UVxUsMxzcfc7NhN/woBinOB5mOw/6sfU1LDG+/kYtC8N7YlAldHmFAs+dBBlzqxP2owCxyQ2twuvjlWJzY+PgJSwynpwz75LAhmeQy6DfELCX58PYvnLjNAZduYQhQ5Bx/HwQjrpKIJ5mgQEf3gkomjDMijcikiWRsx+Lkxlo3JVF82KdxLIJ5OCI8Ou3pYCsVa3LpM3BqZhjSPHmsWzyoAu+w+RIv2gpgeFq6vkucMol8nYmdpwlv78oIiF9ardMbLKteLtJDZyPDkwKzz77U+QqNMpbavA3JtpAG577cntNCCRNkXeJ18BnntVpdQ444Ba4TdaMI0cll2ECY2zqh+dB9GYtTHOfwahLHsT2PAW08NjQ7LLJ6QZFhkR3iR5o1H6Sdkbe278PjtQnyDvXJ/EdbpAJE6+b7aB52phTsNNcLWJzmmHZ2DL8jQ+uLuHvZ8Ky3im69DT/iydlcvQrvBBr25yVRLH5LiNHSWic63qYm6VOKHIh4bYAL+MHwNXLHyY7/yfyQOz9wgzYCzqOKqwuF01fZgQ3P/q59I75dkAqmD5sSZrB80wiIVbx6HxH060kY9doAd0wJRLHzdLqDhaHC7ZFfGXkcbP1a/WwUbKHKbnyUGA8/6ul6ebm1YKNg65fEpt/VUIpyGK5KABeOVbwQnzCtqBxsNsJEypSfrsUpj/N8RfQw5b0gVQkz5HSVTrnXzs+p07eR8OvPLZG8YGYGM+9LoHjQlx+jJVIDAZ9nPWvhNhBeJDEoyrM48ZFhYJYSyQ+mq12PPVYZ3OsIRoMTAu3DRx+bD9nQ4P90bI5GgjZn2Hv5p6YYdDPjwZZ0TOo9P6KleGRgF0Gwo3AMyRYnP74DwzPsV5JvcCwbHevr9ek2n0780F5l6WQ+VdRnI2MeUV9saE/bFmtsUFIYlkHwBejhx90RZfQk5GsD3OXAzoGknqrTHywMhRj2SSzLqnCzNkp6L3ypr5N8l38iRfxjz5L865x6j83bKNk63r2YAxr1ZPkJQdNNB510owFaCbGSEe0Z+HfGBOYFdkiSoaTFSZDNNCuxnNpfRHZ2BLRR01d9obauXp9uS+vh/bKMbr7Xsrv4F8EoBl+CG0yhk9Pdy/OYT5Uhn2w5FubLRs0XIRhpooIqopha33GPBzrtYjeiQi6he9GvmyejfxrgpMEux+JEyG95UYnm/If17wjItcJLOmghfTv2de2x8ePsX1Wiee3Xoxl//z2g8w4TXAYRcu+DB6bNm3jcqJ7e4mTIlhgWFk+Qs5zITreEbErlut6NIgOllwb5CQ7BOtE1yOdMM+DMLaeDSp8+8cgBMey1OCXy0zYmCTYiPztSUiIC/jWKvKufsh2GAMwnXIh2RZf0jCYegctwo53jXPQDh/bQJ0e54LwaXNRJERaG/AwpQSWe64zhajuW0nD8Tt+XJAuR4OxEMHxBMGQUtuo43PE7F0g/WPRDax3gbEr63ojFqZEH27ck4PSNZ5+1ktDWHCuWBCz++8L7rZ2TIvEmydOPuP/QZaRGX/V5g9u/wJlDafaLLU6PvGhzGUsKTmpRbaankGOvqy4XScEFfwNtEQpXiJ5V5J0FtCPp4Wl1BujbIBsPWFgyY4ZOFidJvnBakoTTkjjm5cVHZWleUpLwlM1VRDxevmOcDOOjzkp9Q9gazvTDBb45+C9fdhYnSubBMC9LSUKXJFIR+u4D2niivtjezYUqMzeLIB8v6ZXih52hfxY471j76oVfFvko62R0/xanS2bCcEkSMaN4X6q844uJtbeedbaSqu6Xnp4hF/14mSeZOXrYVe6MkreZDaotA9jSm/BHSSju1JLFKZMMCU8gqXiCsUzHkwj38IuXl3UdkowHvTSP8dKXs0bnXToQYsz0lhJ8wmE7pQDwQlVjiLQ4bTIzhhWzlIQ7Ij09Brz1iINwm9dnfDxlRg5PTlLVtI0T1MuGbWl0cyFlqFp5cah9sH6tPB8MNwl/EIuTJ0/VniSkS26juF8eqn0I8An8pp/4FYeXlCy/HcwHV6TmwffGD7vtSRHHpxe3zvyNJRS5MtS2OIWy0uVKUiY24Y+KdbA987H44VNfcXRPy/tKWs6yIIZofpnjnMC88CXj3cXEP6yncZ480gSQ0EzggpIMHS1OoyyQYfCPk8R0OfZXDr+/3WHH1DjtJyxumeuU1Ay6/VXzrBeVigPih80INMviVndeXJs3VGwS4QtrPRYnU140u2tLepb7Gm/83m56xzOv1isBBrL1HK289x736+CTWnKG9BlTxlonKe64dIpg+k+4Gx5pQgl4NgnGx1mcUskQxbCC4QfJiRnN/wPjfBwryue1X3CJmzP8adzraTN8yhcZ9snx5h4H2w8JsEl+w+Z+cuKYfLdNMfhyLUJqbw8w+Vt4LJ8YXhE14rA1ixMrb9NcwiKku266ShVTXcadpiFRxfmlADx5M9QOajCcpMg9Ual+sEXHUgwy+xzV7w3afogE4wOqtTi58oglNCLVggyZDO3o09HHMJEk79zfoePSjxCR1A35LJ8YbyDh8tYVWZxieYx2FqsKSD0bQbKHWK5xf0JKB0RWU5IhBftvFAjXiuqQfFkwO3lmFidaMhQq68cpHQy/X/AbhKm/BPmJkNzjw92PWd17YnODAnUK0+tXIIzCH8PidMuKGHpsQMlgCJVwKoEKhlU+u824973wYeO/VJcTPtNpPaExjIcEo3GGMhanXa7/fXJVKAI/6xx4luE2UPUMvmREa7dXbDWL1JFMHuofUkqLlmDcdVYWJ1/uuh6G+wo89s6z4ZuDV4YmoBsoJk2AT5LlHaMHD4svYEvvcRGW8RhqWZyC2QZDqwUVrygwBBlmNSbg2MvJNzTuPVyKkOXdImmfzpzm1PUhESnynR9DbYtTMY/IMOZzlYLDMmxmiEtbzFjbv5Ji/NUXWZuucxE3tO0LYSE012+wOCWToSzDKIYcJXzebqZsYYeeajoaxu0nn5qDl1yFQ9vlJvlViPZXLE7N/OLfvm+RMcudP6s46Uk7ETD9WEatD6+DGtXlAG3v+r6ItnmLEzTTfsu/fM6gYn7c3v4ziiWdvGAI9mozyrUKsn5YPOU6Uc2pmrdhSExwU4Jh2wlmU5ECxg/g2ICcI9OiyDWCyx9segqiMTS1OGWz2hn/5QOeUhA0+3LvsYi0hUygPcX4g/uidJo1xV71Nhs4M+YZOa1tq1BaNl/tJJyx2JdjmDrjAkWVFLorBK/Pcd64dAqvEYvFlYtqTuRkKH8YhtWfOz8uyPVzF1ZPumkrLNMAOzGOHPxQoauLWhOHVQOk/FotTuo8CEPLpy+I4XpNdJeXmz9oxellIr4ivr8C/FdOZdP+M72DPQL+HFxziudt3vIFvurnrHnnx4Gq7W/E93Kfc//Py9BrOQdRigrSan2DqgaTz8Cz+KkSPkzm43srXHPa50W3WzpDtXeo9PS/op566mHok54dd7Gcr96IAqOM+akQTEMic+N3ro7CPf6kwG1u34RrngORobakCMDBtjSCUBBbALfwDx7M9AK99owtngdxYyRzUSx9u/Fn5pT0nWGfHBgLUj+uBotnQmCYBvK/aOHEhWiY4am5LB0WDG+fyuK5EBiKn5JkiTmax1lR4jY5wH3kQhW+33E2YvF8iAynQCMPlBCl7HV3Jgs8EtiLT/ijkJH/e0aE05OMQLqtg+rBtjURyY/eKGryq330HCyeE6FA3xAkY7MRTcipMuqDt9dGZTy6vZYsnhfxN0jQbGygqUN8P4jrzQk1gXINeM0FWjwzwm0agblgTlGHTynUj3CNOgmJXCWGPDvimkGuEr6rcazxLIAKn0ak+/3wKJMBLVo8Q+KhJYRztGF7Hzd4akwBpGaEaY38fotnSQQtOEcdbc5mQ4Wh9IWItBf1a/X7SbihQmaobfE8CYlLCH8SAB00SDLHSt90op+Fahs7lcVzJZYK+rZam80GLaDdfXSAaBF2rrJQjeFSZhbPlnAYCeHDjQd4CUYoCjPYF5mnWS6q7b8li+dLKPAQJGMvZ2+WNvvZe/qIttqPxzmE/hvStnjORIbeEsJ3g/iHnmMZV7QhOJTWhct8R5YMPSyeN7FamM9c6yaOiG5k9xsuGsRNfYPFcye+Hiy/eIVQYtbIBAAEzsTi2RPShvnL9ZcIEdnphvSb/6Bns3gGxYPB4kbcIFlcdB+IT/iTZ1GETaXpJLzSoFDkDGeY3wtYPJPijCWIs6BAf9Y+7JySXnC6Fs+m+HLA4SfF40LYjGcxpGZm8XwKJ4LFk/2q2F39WX2awAaDXUK1Fs+p+FLSPilnp4wrNiTiZn+/xfMqMkScEYQkw9u7MLPJHL03ra+2eG7FXwFMKx48x8gRtC908mMSLNvi+RXvBF1PFGBYL7rwsRphGGXxHItbn6UkKkMHm9coe0dZ2MbwmKG6xfMsMiyDodwnAST+KQmJ5Zfv2uKZFuYADJgkowsZ8yS1wo6wW3v5cIvnW2RoCYyWZKeVGU4V4BR/Ah8Lp5add2ROd2MvN5VlrNZAquwIqls8wTVZPOtC2dBMS2/Hvh3OQ6bZEXrr2r/C4rkXGZpC4wXbyQZttoD/efr4vR/NUNri+Rf/ugRyGjW2tS57PpQTrRcqnnntYghKICnGcC/w+i2eh3HGvEKlC/ocZVs8FyPDVD5ovFKL52Ns4/vxQIJzsHhOxmMwfEiOH/e2Fs/M+A3FE6O9ji2enfEP09ZH08tbPENjGwclTIJHQWezeJbGORyHCsV+msVzNb4JTV5BE26nJYvna2RoVTwB2srE4lkbnxAvbLOhtC2eufE5sHMa4GwWz95Y7YJQj2KoZvEcjnOAp5DM9zOmbfE8jkdsHHi1ueI1WTyb46zuCnIjtTGL53SsYVPGh7OGId7imR29z89IviTqacPi2R2X06whDQurYMhl8RyPM3awWZO9uTXsed6Xpy7I82OYNQeL53tM94zza267Fs/6uMCzWTz74/f0H9/TF1gA",
  dodgers: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAADwAAAAhwAgMAAADt0CPhAAAADFBMVEVHcEwAWpwAWpwAWpzb4My1AAAAA3RSTlMAYbU9m9k7AAAgAElEQVR42uzTMQqCcBjGYQOloUWhAxXYAYJsqBPUkZxDyENEl+gcLW0NJk5BRPKXcHke3hN8H78oAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABgqTpftsjjP0nw1X7crvtgdqrJdda6PZf3u5IoQLun62pZdYHVXWP3heb+0a/7h4QUQbtaMS8AgYBCwgEHAAgYBAwIGAQsYBCxgEDAgYBCwgEHAgIBBwAIGAQsYBAwIGAQsYBCwgEHAgIBBwAIGAQMCBgELGAQsYBAwIGAQsIBBwAIGAYOABQwCFjAIGBAwCFjAIGABg4ABAYOABQwCBgQMAhYwCFjAIGBAwCBgAYOABQwCBgQMAhYwCBgQMAhYwCBgAYOAAQGDgAUMAhYwCBgELGAQsIBBwICAQcACBgELGAQMCBgELGAQsIBBwCBgAYOABQwCBgQMAhYwCFjAIGBAwCBgAYOAAQGDgAUMAhYwCBgQMAhYwCBgAYOAAQGDgAUMAgYEDAIWMAhYwCBgQMAgYAGDgAUMAgYBCxgELGAQMCBgELCAQcACBgEDAgYBCxgELGAQMAhYwCBgAYOAAQGDgAUMAhYwCBgQMAhYwCBgQMAgYAGDgAUMAgYEDAIWMAhYwCBgQMAgYAGDgAEBg4AFDAIWMAgYEDAIWMAgYAGDgEHAAgYBCxgEDAgYBCxgELCAQcCAgEHAAgYBewEIGAQsYBCwgEHAgIBBwAIGAQsYBAwIGAQsYBAwIGAQsIBBwAIGAQMCBgELGAQsYBAwCFjAIGABg4ABAYOABQwCFjAIGBAwCFjAIGABg4BBwAIGAQsYBAwIGAQsYBCwgEHAgIBBwAIGAQMCBgELGAQsYBAwIGAQsIBBwAIGAQMCBgELGMaSFD3sA8q8Fb1svAAGSCe/Nw0I+LqIoz4D/iwoYGcDAQMCBgELGAQMCBgQMAhYwCBgQMCAgEHAgIABAYOABQwCBgQMCBgELGAQMCBgQMAgYEDAgIBBwAIGAQMCBgQMAhYwCBgQMAhYwCBgQMCAgEHAAgYBAwIGBAwCBgQMCBgELGAQMCBgQMAgYAGDgAEBAwIGAQMCBgQMAhYwCBgQMCBgELCAQcCAgAEBg4ABAQMCBgELGAQMCBgQMAhYwCBgQMAgYAGDgAEBAwIGAQsYBAwIGBAwCBgQMCBgELCAQcCAgAEBg4AFDAIGBAwIGAQMCBgQMAhYwCBgQMCAgEHAAgYBAwIGBAwCBgQMCBgELGAQMCBgQMAgYAGDgAEBg4AFDAIGBAwIGAQsYBAwIGBAwCBgQMCAgEHAAgYBAwIGBAwCFjAIGBAwIGAQMCBgQMAgYAGDgAEBAwIGAQsYBAwIGAQsYBAwIGBAwCBgAYOAAQEDAgYBAwIGBAwCFjAIGBAwIGAQsIBBwICAAQGDgAEBAwIGAQsYBAwIGBAwCFjAIGBAwICAQcCAgAEBg4AFDAIGBAwIGAQsYBAwIGAQsIBBwICAAQGDgAUMAgYEDAgYBAwIGBAwCFjAIGBAwICAQcACBgEDAgYEDAIGBAwIGAQsYBAwIGBAwCBgAYOAAQEDAgYBAwIGBAwCFjAIGBAwIGAQsIBBwICAQcACBgEDAgYEDAIWMAgYEDAgYBAwIGBAwCBgAYOAAQEDAgYBCxgEDAgYEDAIGBAwIGAQsIBBwICAAQGDgAUMAgYEDAIWMAgYEDAgYBCwgEHAgIABAYOAnQ0EDAgYBCxgEDAgYEDAIGABg4ABAQMCBgEDAgYEDAIWMAgYEDAgYBCwgEHAgIABAYOAAQEDAgYBCxgEDAgYEDAIWMAgYEDAIGABg4ABAQMv9u0YV5EsCcPo8NLAwGAJ+OOwBHJnsJixehPkEnIJLCGNMsroKUY1o3Z7nu6NuElI5/NRlRQ6ggf5AywBDLAEsCSAJQEsASwJYEkASwADLAEsCWBJnwz4n3+E9S9nFMCDAd/eYf1wRgE8GPA9DvBPZxTAgwE/4wD/6YwCeDDgOL/vfzujAAZYAvibHQIB/3JGATwW8Fcg4LczCmCAJYC/2RQJeHZHATwU8DES8MMdBfBQwKdIwIs7CmCAJYC/1zkS8OqOAngo4Esk4Jc7CuC6gDd3FMBDAV8BluoCvkUCNggWwIUBGwQL4LGA7wBLdQE/IwFb9AvgsYAj/RoEC+DKgA2CBfBQwAeApbqAQ+fABsECeCzgKRbw7JACGGAJ4Kx/1qJf+hDAp1jAi0MK4LqAV4cUwAMBnwGW6gK+xAJ+OaQAHgj4Ggt4c0gBDLAE8He6xQK26BfAIwHfYwEbBAvgwoANggXwSMBPgKW6gGP9WvQL4MqADYIF8EDAB4CluoCD9/wW/QJ4JOApGvDskgK4LuCHSwrgYYCPAEt1AZ+iAS8uKYCHaTlHA15dUgDXBfxySQE8DPAFYKku4Gs04M0lBXBdwAbBAngc4BvAUl3A92jAFv0CeBzgZzRgg2ABDLAE8DeK9mvRL4DHAT6EAzYIFsCFARsEC+BhgL8AluoCnuIBz04pgAcBPsYDfjilAK4LeHFKATwIywlgqS7gczzg1SkFcF3AL6cUwIMAXwCW6gK+xgPenFIADwJ8iwdsECyACwM2CBbAowDfAZbqAn7GAzYIFsCFARsEC+BRgN8AS2UBJ8yBLfoF8CjACXNgg2ABDLAE8P9tygA8u6UAHgL4mAH44ZYCuC7gxS0F8BArJ4CluoDPGYBXtxTAQwBfMgC/3FIA1wW8uaUAHgL4CrBUF/AtA7BFvwAuDNggWACPAXwHWKoL+JkB2KJfAI8BnOHXIFgAVwZsECyAhwA+ACzVBZwyBzYIFsBjAE85gGfHFMAASwBH/5MW/dKHAD7lAF4cUwDXBbw6pgAeAPgMsFQX8CUH8MsxBfAAwNccwJtjCmCAJYD/rlsOYIt+ATwC8D0HsEGwAC4M2CBYAI8A/ARYqgs4x69FvwCuDNggWAAPAHxIAmwQLIAHAP4CWKoLeMoCPLumAK4L+OGaAjgd8BFgqS7gUxbgxTUFcLqUcxbg1TUFcF3AL9cUwOmALwBLdQFfswBvrimA6wI2CBbA+YBvAEt1Ad+zAFv0C+B8wM8swAbBAhhgCeC/KcuvRb8AzgecNge26BfAlQEbBAvgdMBfAEt1AU95gGfnFMB1AT+cUwAnAz7mAV6cUwAnQzkBLNUFfM4DvDqnAK4L+OWcAjgZ8AVgqS7gax7gzTkFcDLgWx5gg2ABXBiwQbAAzgZ8B1iqC/iZB9ggWAAXBmwQLICzAb8BlsoCTpwDW/QL4GzAiXNgg2ABXBrw7J4COBXwBLBUF/AxE/DDPQVwXcCLewrgVCcngKW6gM+ZgFf3FMB1Ab/cUwCnAr5kAt7cUwCnAr4CLNUFfMsEbNEvgAsDNggWwLmA75mADYIFcC7gJ8BSXcCZfg2CBXBlwAbBAjgV8AFgqS7g1DmwRb8ALg14dlABnAh4ygX8cFABnAj4CLBUF/ApF/DioAK4LuDVQQVwIuAzwFJdwJdcwC8HFcB1AW8OKoATAV8BluoCvuUCtugXwJmA77mALfoFcGHABsECOBPwE2CpLuBcvxb9ArgyYINgAZwI+JAM2CBYACcC/gJYqgt4ygY8u6gArgv44aICOA3wEWCpLuBTNuDFRQVwXcCriwrgNMDnbMAvFxXAaYAvAEt1AV+zAW8uKoDrAjYIFsB5gG8AS3UB37MBW/QL4MKADYIFcB7gZzZgg2ABnAf4DbBUFnD6HNiiXwBXBmwQLIDTAH8BLNUFPOUDnp1UANcF/HBSAZwE+JgPeHFSAZyE5ASwVBfwOR/w6qQCuC7gl5MK4CTAF4CluoCv+YA3JxXASYBv+YANggVwYcAGwQI4C/AdYKku4Gc+YIt+AVwYsEGwAM4CnO/XIFgAZwE+ACzVBTxgDmwQLIBLA57dVACnAJ4AluoCPo4A/HBTAVwX8OKmAjjFyAlgqS7g8wjAq5sK4LqAX24qgFMAX0YA3txUAKcAvgIs1QV8GwHYol8AFwZsECyAcwDfRwA2CBbAOYCfAEt1AY/wa9EvgCsDNggWwCmADwBLdQEPmQNb9Avg0oBnRxXACYCnMYAfjiqAEwAfAZbqAj6NAbw4qgCuC3h1VAGcAPgMsFQX8GUM4JejCuC6gDdHFcAJgK8AS3UB38YAtugXwIUBW/QL4AzA9zGADYIFcAbgJ8BSXcBj/Fr0C+DKgA2CBXAC4MMgwAbBAjgB8BfAUl3A0yjAs6sK4LqAH64qgMMBHwGW6gI+jQK8uKoArgt4dVUBHA74PArwy1UFcDjgC8BSXcDXUYA3VxXAdQEbBAvgeMA3gKW6gO+jAFv0C+DCgA2CBXA84OcowAbBAjge8BtgCWCLfmk84GF7foNgARwP+AtgqS7gaRzg2VkFcF3AD2cVwMGAj+MAL84qgIOBnACW6gI+jwO8OqsArgv45awCOBjwZRzgzVkFcDDgK8ASwAbB0g6Ab+MAGwQL4GjAd4CluoCf4wBb9AvgjwD8yyBY+gjAbRTb2DurAI4F3DYH/hNgqTDgtq++nFUAxwJu2/P/bPvxaXZXARwKuG0O/ANg6RMAt82Bt7bntx7uKoA/AXDbBGJxVwEc6qNtz/8CWPoEwG1z4LXxZe4qgD8BcOMbt7sK4FDAjZ+F2wBv7iqAQwE3fp18BFj6AMBtP+g+Gn8+dlcB/AGA5zbABsECOBZw40PNbU9gGgQL4FjAbXv+1g2Euwrg/QH/ap0Ru6sADgXcCvHdCF8COA7woRWwRb+0P+DmL6Ms+qWqgH+2Ap4dVgAHAm7+PbfxARCHFcCBgNseifzR/Aimwwrg3QFvrYAXhxXAgTyaV0VtK6bVYQVwIOC2OfCreUfssAI4EHDzG2mzfAngnQEvHZ+9JYDDADd/F9X89bUEcBjg5p9zLfqlqoDnjidAJIDDADc/EWnRL+0PuHHP/w+LfukDADfPept3iBLA+wO26Jd2B9zxPtr84VsCOAhwx1dRAEt7A57aAVv0SzUB//fXXIt+aW/AHQ9EtgFeXFYAh+k4tQO26JdqAt5+v9SiX9obcMeq1yBY2hvwBWCpLuBr++dgi36pJuCl8/svCeAQwB2/BbX9AmUQLIDjALc9TvX4/VKLfqkm4Pn3Sy36pb0BdywS2gAbBAvgOMDvdsAW/VJJwL/6XysB3A+46120491bAjgAcNffsRb90r6Ap55vki36pYqAf/YAfjitAA4C3PU0lUW/tC/grueZLfqlfQG3TQK3HsCr0wrgTwDcsSWWAA4A3GWwS78EcDfgrk/BAEsVAS8B34BJAHcD7volyKJf2hdw17MYFv3SvoCf4wFb9AvgfQHP/3uxRb+0L+CuRWDbFtEgWAAHAe4jCLBUGLBFv7Qr4M6/Yrv+gpYA7gTc+T0ywFJhwBb90p6AO5+lsuiX9gTc+TRzG+DVbQVwCOBzH2CLfqke4O2vl1v0S3sC7hRoECztCfgKsFQXcOe3UBb9Uj3AS89/0SBYAEcBvu8B2CBYAMcA7trzW/RLFQHPf73col/aE3DnHrANsEGwAA4BfOgEbNEv7Qi4+x3Uol+qBvg/7N3NUSNpFoXhBhbEBAtMwARMQO6MFWDHGDBuIBMwQSawqEUtuorZzXTXUJD55T03U+TzRq9VikgepPw59I+lgA8OrgAuAHy1FPDCq9gSwAsAL76Pa9EvnRvg70sBHx1cAVxA42YpYIt+aT3AC/f8i9dMEsDtgF8BlrYA+G4p4MUvIAE8DHjxB+ji7+ASwMOAF1+DsuiXdgfYol8AVwBefBvXol9aD/DiJyEt+qX1AL+tA9iiXwCvB/jwvxew6JdWA7x0z1/xChLAg4AvAZb2Bvhn6ZdwCeBBwAWXoCz6pbUAF9zFHQN8dHQF8GIZN8sBW/RL5wX4bw9CWvRLawEu2BKNAT45ugJ4MeC75YAt+qXzAvxa/BISwEOACz4+LfqltQA/rAXYIFgALwf8uPwSskW/dF6Aj0vfpEGwAK4A/LwWYINgAbwc8OI9v0W/dG6AD399CYt+aSXAFWPey4LXkAAeAFyBz6JfWgnwVcXXX4t+aXeAnxxeAbwQcMktIIt+aR3ABXt+i37pvAD/8hikRb+0DuDb9QCfHF4BvBBwwZ5/dJL46vAK4IWAS+wBLJ0x4JKPcQng2YBLTl8t+qV1AD9WXEC26Jd2B9iiXwAvBVzyEJVFv7QO4JLHmEseqJYAngv4AmBpd4APf38Vi35pFcA19Gp+DUgAzwR8BbC0N8A/I5fCJIBnAi66AWTRL60BuOgRjDHAL46vAF4E+LYG8CPA0tkA/r+nmC36pTUAFw0BxwC/Or4CeBHg+xrAFv3SGoCLPjot+qXzAXwKnUpLAM8C/LgmYINgAbwMcNENXIt+6XwAHyvepkW/AF4K+G1NwAbBAngR4Jo9f9WoSQJ4FuDBOfCh6HUcXwG8AuDYLwIJ4BmAq776Vn0VlwA+Zl/+3YtPAEvnAvhHFeCjAyyAF7C4qQJs0S/1Ay57BLLokUwJ4Djgd0YIFv1SP+C7dQG/OsACeAHgoj1/4QtJAE+u7IPTol/aHWCLfgG8BHDZxWOLfqkfcNntW4t+qR/w27qALfoFcD/gY837tOgXwIsA142ILPqldsCXAEu7A3xIvpIE8MTqPjct+qV2wNdrAz46wgJ4WMVN3bVjgKXzAPzu3VuLfqkbcOEDkGOAT46wAB4GfFcH2J/kkM4D8LsbIot+qRtw4Qzfol/qBvywNmCDYAHcDfg1/G1cAnhShVeeLPqlbsDPawM2CBbA44DL9vwW/dK5AD5WvVGLfgG8APDF6oANggXwMOC6Pf/wMvHgEAvgQcCV6Cz6pfMAHP80lwAOvfjvAFv0S82AbyqvHAMsnQPgH5WAXxxiATwIuPTpKYt+qRdw4Z5/9LnqV4dYAA8CLp0AWvRLuwNs0S+ARwGXmrPol3oBl562WvRLuwNs0S+ARwGX3vmx6Jd6AZc+e1H6WJcEcAjwEWBpA4Br9wcW/VIr4NoFoEW/1Ar4aguAnxxjAdwJ+NDxeS4BHHjt35+1WvRLrYCLrxsbBEudgG8BlvYG+LfPTln0S52Ai59eHgP86hgL4CHA97WA/UkOafuAfzsAtOiXOgEXi7PolzoBP24BsEGwAB4DXHzVyaJf2j7g0+9ezqJf6gT8tgXABsECeAjw4MPLL797vbEnMw2CBXAn4GPlWwVYAA8CvtwG4IODLIAHAFcv8C36pe0DPhR/ogMsgEcAV5+zVn8llwD+oOqrxtVXtSWAP6j8vm3xfWUJ4HLAPwCWtgD4rhqwRb/UB7h8PVS8bpIA/qCxOfD36hcEWACfMWCLfgE8Arj8G69Fv9QHuPyak0W/tDvAFv0CeARw+W1bi36pDXD9k48W/VIb4PrtAcDSGQO26JfaANfv7y36pTbA9Z+XV+Wf6RLAbYAt+qU2wPWXnCz6pTbAgbu2BsFSF+A7gKW9Af7wwUeLfqkLcGA7ZNEvdQF+2Apgg2AB3AX4e/NLSgB3fd+16Je6AD9vBbBBsACeD/it/pKxRb+0bcCnj17Sol9qAnyxGcAGwQJ4NuDB5cHLR685+Hj1wWEWwD2Aj9VvFmABPAA4Md616JeaAF8HsFn0S02AE+erFv3StgG3XxiTAH6nxC2fxK0pCeB3Cuz5I093SQCXAf7ksUeLfqkH8P12AFv0C+C5gAN7fot+qQtwxJpFv7Q7wBb9Angu4MjpqkW/1AM4cscncm9KAhhg6QsBzjw0ZdEvtQDOPLZs0S+1AM4s/wYBPznOAngDgK8BljoAZ6hZ9EstgDNnq1eRM2sJ4BbAFv1SC+DMDR+LfqkFcOiRC4t+qQPwPcDS3gB/Ojuw6Jc6AIeGfxb9Ugfgxy0BNggWwB2AP/2otOiXOgCHTlYt+qUOwG9bAmwQLIBnAb4I3e8Zu71sECyAOwCfPntdi36pAfDltgAfHGgBPANwajZk0S9tF/Ax8XYBFsAzAV+HAFv0Sw2AU191LfqlBsCpi02pi2MSwMsBf/q6Fv1SA+C7bQF+daAF8AzAsUceQ49oSgD/pbHV0ITRgUW/tDvAFv0CeA7g2PDeol/KA459UFr0S7sDbNEvgOcAjl0stuiX4oBzt2st+qU44EuApd0BPn3+fi36pTjg3GjIol+KA07NgYcBHx1pAbwBwNcAS2nAuS+6Fv1SHHDuUtNV7PKYBHAcsD/JIcUB5+7WWvRLccDBBx4t+qU04IetATYIFsBpwJM2Qxb9UhpwcHZv0S+lAT9vDbBBsACeDjh4omrRL20T8KRLxRb9Uhhw8mbtGGCDYAE8GfBlEPDgMyIHh1oAZwGfprxhi34pDPhqe4CfHGoBPBHw4Gj3ZcobtuiXwoCTyCz6pW0CnvQ116JfCgO+3R7gk0MtgCcCTt7qSd6ikgD+I/vX1y36pTDg++0BtugXwFMBB/f8Fv3SNgFPXAwFp4oSwH+EN7sAS1nAUWMW/VIWcPQ0NXqCLQEMsHTGgLN3eiz6pSjg7MNSFv1SFPDVFgE/OdYCOAn4NO0dW/RLUcDJPb9FvxQGnCV2E/31IAEcBXwNsJQEnD1LteiXooCzN3qy17il3QO+jwL2JzmkLQKe+I4t+qUo4PDTyhb9UhLw4xYBGwQL4CTgyYtdi34pCTgszKJfSgJ+2yJgg2ABnAQ8+SrTQ/Qit7RzwOn7PBb9UhBw+kmL7HMi0s4Bp591tOiXtgf4NPUtW/RLQcDpvd8g4KODLYAnUEgv7i36pSDg9CfkdfgrugRw8BzVol8KAr7bJuBXB1sATwCcvk87eJ/ZIFgABwFPfssW/VIQ8MM2AVv0C+ApgONrIYt+KQd4bA48Y69r0S9tDfCfacAW/QJ4CuD4N1yLfikGOH+NyaJf2hrgbwBLGwCcf84i+KTIP/79r3/O/8+Pkb4O4PyTjsFnNW99tgvg8NYgOHcCWHsHfL0/wAc/R/oygPN7++C/4BNYewec/4s3N7nPeIAFcBrwNcBSCnD+r74Gr3M7B9beAaf3/NE7zT6BtXfAD1sF/B1gAZwCPOM9XwAspQA3bIVyeyfnwNo74OetAv4RA+zHSHsHPGtu/wywFALc8Berct/SAdbOAV9sFvBbDLBzYH0ZwMF7PP8td6fKJ7AADu/5k8+KAKydA+74PxcNAn4CWAB/Avi6AfDg49ZH58ACOAP4NOdN324MsB8jfRnA+T3/MOAXgAXwJ4BvGwDnFv0Aa+eAc+enHefZzoEFcHjPn7zS7RNYOwd8v13A3wAWwJ8Azu/5k097ASyA4wZyz1s7B9bOAT/uELAfI30ZwA17/uCiH2DtHHDur2V0/JYAWACn58CbA+wcWF8F8EUL4NiJtk9g7Rtwx54/eK8KYAGc3vMPA34CWAB/CPiqBfD9tgA7B9ZXAdyx5w8uJnwCa9+Ag//v3sXOJmwWARbAAEtnCrhjzx/8NeEcWPsG3LHnHwb8GgLsx0gAp981wAL4U20de/7gzSqAtW/AHXv+4PNezoG1b8Adc+BhwH+GAPsxEsBzugBYSgBu2fPnVscAa9+AW/b8o//MzxBg58ACeFbPoW/qPoG1a8A9e/7cqTbA2jXgnj3/MOADwAL4A8BXTYBTi37nwAI4vufPPfDlE1i7Btyz5x8GfARYAH/A4KYJ8OBm4gVgAVwP+DT3bd+G/h3nwNo14J49/9YA+zHSFwF81wQ49VUdYO0acOriUtHFsm8AC+B6wE9z3/bVpgA7B9YXAfywbcDfM4D9GOmLAE494vhrqUU/wNo14NRK6NcGRxM/ABbA5YB/njlg58D6IoDfmgCn/iGfwNoz4NQHY9t3dYAFcH7PD7AUAHzZBjh0uds5sPYMuGvPH7vh7BNYAOf3/MOAjwAL4NJXGwN8D7BUDbhrzx+bPTkH1p4Bp2a6bf+ST2ABDLB0loC79vyxL+sAa8+Au/b8w4C/RQA7B9bXAPzQBnjwevf3CGA/RvoPe3eP3NaVBGDUJMulgAGXoCVwCeQm7O2A65nEOzC5BC6B8SSDQIFc5s9EM0XLtADdd7tfP/Q55VhEFfGp0QBabh3w3Y8/7gsBw+yAs+75w760KWA6B5x1zz8c8EtIwHZgBPxjzioF7GnEaQScds8f9aMETOOA8+75RwN+EzACTl5MZ75av7UDI+C5AT+PPPBdoYA9jTiJgPPu+YcDvhMwAp74h40GHPOlLwEj4IR7/qivXduBaRxw3j3/cMCPJjACnvr0Hwt48HLxScAIeG7ATyMPPOYvCwHTOOC8e/5aAduBOYmA8+75oy76TWAaB3yTGHDMR1YCRsAJ9/zDXxp5FjAC/gd59/y1ArYDcxIB3ycGHHM4YQLTOOCYE7+PDZ4uvgoYAU8N+FXAUCDgs8yAY8a9HZi+AWfe8wct3CYwAs645x8O+E7ACPhDF6kB7wQMMwPOvOcP+tqXHZi+AQf9D8fmBvxoAiPgmQHvxx75tYBhZsBXqQGHXPQLmL4Bx/wjGT9l/nVhB0bA7QL2NOIUAg7ZSv9RyFtmAqZvwJn3/EEfWgkYAWfc8w8H/GwHRsAf2qUGfFEnYE8jTiHgzHv+oNMJAdM34Mx7/uGAXwWMgAsEfBbx4+zAtA04954/5u8LE5i2Aefe8w8HfCtgBPyBi+SAIy76BYyAU+75Yz61sgPTNuDce/7hgB9MYAT8gcvkgCMu+gWMgFP+QY7h24knASPgaU/+t/32A7YDcwIBf04OOOLnmcC0DThiIs6P7fsv2QWMgFPu+QUMUwPOveePedfbDkzbgHfJAUdc9JvACDjlnj/mq5sCpm3Auff8AoapAb8lBxxx0W8HRsBJ4yviot8EpmvA2ff8AoaJAZ9nBxzxml3AdA04+54/5KLfDoyAc+75hwN+MIER8JQ/aVnAOwEj4FkFZN/zh1z0C5iuAUfcFoQE/GQHRsCzAt6PP/brKgF7GrH9gD+nBxzwEwVM14Cz7/lDXptpEwcAABaNSURBVLQLGAHn3PMPB/zVDoyAZ72ltCDgyyoBexqx/YCz7/lDPnkWMF0DDvhiY0zALwJGwAUCHvzy5qsdGAH/TfY9f8j9kwlM04AjrnNjAn4TMAIuEPDZ/KEvYJoGnH/PH/Gq3Q5M04Dz7/mHA74zgRHwnICflzz4+Rf9AqZpwJ9WCHgnYAQ8J4D8e/7hgB/twAh4ylN/yT1/xEW/CYyA0wIePIDaCxgBfyP/nl/AMC3g/Hv+4b80vtiBEXD4PnrY/It+ExgBJ93zDwf8LGAE/I38e/7hj64EjIC/db9CwPMv+u3ACDjpnj/iot8EpmnA+ff8AoZZAa9wDhxx0S9gegZ8vkbA8y/67cAIOOuefzjgOxMYAc9YR1+WPXoBI+ApAX9aJeDpn10JGAFn3fMPB/xoB0bAf7HGPX/ARb8JTM+Ar1YJePoFhYARcNY9/3DAewEj4L9Y454/4KLfDkzPgK9XCXj6Rb8JTM+A17jnD9i8BYyAs+75Ay76BUzPgNe45w+46LcD0zPg+1UCnv79LxOYngFP/1ZyZMCvAkbAMwJe+OJz8ITiTcAI+L2zdQI+rxGwHZiNB7zKPf/4j701gRHw8pJeFz766Rf9AqZlwBfrBPyTgBHwhIDXuecfDvjBDoyA35n//0g4zuyLfhMYAScGPPgFsCcBI+DFT/yl9/wCRsBTAp5+13ek2Rf9dmAEnHYOPHyG/MUERsDLQxIwVAh4nXv+4cn/VcAIePmbSY9LH/7si347MAKuH/CLCYyA31nnnn/482cBI+D31rnnn3/RL2AEnBjw7It+OzAdA17pnr9KwJ5GbDvgle7551/0C5iOAV+sFfDsi34BI+C8e/7hgB/swAh40Z8y455/+kW/CUzHgNc6B55+0S9gOgZ8tbWAnwSMgJcG/HX54x/8DufeDoyA/2+te/7pF/0mMB0Dvt5awF8EjICXBrxf/viv5754FzAdA17rnn/6Rb8dmI4B71YLePL73yYwHQOe/GlsfMAvAqZtwP/+17cGvw/19z/oh/02+KPf/xl//uf3//13L2BOPmDswAj4dHgaIWABg4AFjICxAyNgExgELGAQsIARMHZgMlz+/u4LRt/5T34mMBUD1pWAETACRsB2YBCwCYyAETACRsAI2A4MAjaBETACRsACBgHbgREwJjACRsAIWMAgYDswAsYERsAIGAELGARsB0bAmMAIWMAgYAEjYOzACBgTGAELGAQsYASMHRgBm8AgYAGDgAWMgLEDI2ATGAQsYASMgBEwdmAEbAKDgAWMgBEwArYDg4BNYASMgBEwAkbAdmAQsAmMgBEwAkbACNgODAI2gREwAkbAAgYB24ERMCYwAkbACFjAIGA7MALGBEbAAgYBCxgEbAdGwJjACFjAIGABI2DswAgYExgBCxgELGAEjB0YAZvAIGABg4AFjICxAyNgExgELGAEjIARMHZgBGwCg4AFjIARMAK2A4OATWAEjIARMAJGwHZgELAJjIARMAJGwAjYDgwCNoERMAJGwAIGAduBETAmMAJGwAhYwCBgOzACxgRGwAIGAQsYBGwHRsCYwAhYwCBgASNg7MAIGBMYAQsYBCxgBIwdGAGbwCBgAYOABYyAsQMjYBMYBCxgBIyAETB2YARsAoOABYyAETACtgODgE1gBIyAETACRsB2YBCwCYyAETACRsAI2A4MAjaBETACRsACBgHbgREwJjACRsAIWMAgYDswAsYERsACBgELGARsB0bAmMAIWMAgYAEjYOzACBgTGAELGAQsYASMHRgBm8AgYAEjYASMgLEDI2ATGAQsYASMgBEwdmAEbAKDgAWMgBEwArYDg4BNYASMgBEwAkbAdmAQsAmMgBEwAsazDQHbgUHAJjACRsAIWMAgYDswAsYERsAIGAELGARsB0bAmMAIWMAgYAGDgO3ACBgTGAELGAQsYASMHRgBYwIjYAGDgAWMgLEDI2ATGAQsYASMgBEwdmAEbAKDgAWMgBEwAsYOjIBNYBCwgBEwAkbAdmAQsAmMgBEwAkbACNgODIf9/Eus3eCTPfAh/Tr4kP5Y+oM929icm3ovN88HH9Kz3ybt7OoFfCZgONL9WCyvkY9pMOAXv03aqRjLW8G/VOCUAg59uXrvYyDY7r65EzAcZfQd36+RD+rG57gQGvCXigHf+X3SzEXFgK8HH9SD3yfNfBpsZR/5oD4LGI4y+lXrp4oBP/p9IuD1A76q+KCgoKuKw+5SwLDddfOy4mIOAj7Op4pvjUNB1xU/cr2o+O0SKKjkl54EDMfZVQzYRT/EBhz6oEYvLBwE003Fe34X/RCbymvHRwWnEnDwrHPRD5HbZvDbRS764RjnpxXwrd8orRT9xNVFP0QGHPylRRf9cIyS9/wChuMUvftx0Q/HKHo676IfIkt5rPmw9n6jtFL0taqLfjhG0XeLXPRDZMB3sQ/LQTAc40bAsF1Fv7Pooh+OUfTsx0U/NAzYQTC9VA1FwLDhl6ou+qFhwLd+pzRS9t1eF/1wWNnPW130Q8OAH/xOaaTsd45d9MNhZa9+XPTDYWXvbl30w4Y7cdEPG36l6qIfDiv7XpGLfjjs5tQCdhCMgAt8X2L0A2oHwXRS9huLLvrhsPtTC9hFPwIucLXnoh8Oq5uJgGHDc+6t6msDKKPwpumiH6ICTnivd1f1Ay4oo/CnrS764ZDC33dy0Q9RASd843j0W9qPfqu0UfjmR8BwSOGr29FDxye/VdooXImLfthwwC76YcOL5mXd99egiMKf1bjoh6iA7+Ifmot+OGQnYNiuwhcDLvrhkMI3ey76oWHADoJpo/SUEzBseM900Q/f91/27hg5keyO4/gI1ZqAgMTlVEfQEUTi3Fu168QncG2wR0BHcODIN/AkcwR0BI6gwAcg0FbNTsmDVzQgQKB1MdDv/ZrPJ9qZVcAUfPX6db+/dN3FgO+9rwi4/KMaP5ID3lf1aScT/fC+QRcDnnpfEXD5gYFjBy0eva9ciKpnbk30w3kamV38dxeoQNVXqcOar+8hOODpxW/QoQJVP6kx0Q/vG3cxYAPBCLiCw04m+uF9Vc8LmOiH9827GLCJfgRcwcitiX44SyJffXuB8nrdDHjkneUiXNd9m8hEP5wj4JYe1FT9lBqKq/yohIl+eE/V8/wm+uF9lc/7mOiHcwQ8a+flmeiHcxQy8/KgvMqvUU30Q3DAld9jg8Iqv80rYHhP5SclTPTDeyo/q1j5SU8QsIDhWJWP+5joh3fUPjFvoh/OsMK1FoiAIfgS1UQ/HFb9TSIT/XBYv6sBP3hvEXD5gxJ+JAccVv1RRRP9cNiw9oBN9MPpA36qPeCZ95YLUP3AvIl+CF7gTPTDYXe1bzGr36RDYMDTtl6giX44rPrHrCb64bBJVwM2EMwlOHZW4L6tF3jsYW0DwQi4gmEfE/1w0FVnAzYQzAWoP4/6v8VAXMAtXqAKGA657m7A995dOi/gIY2JfjhkUP8xiWOPmky9uwi4fMAm+uGQgFGB6sctoJhjp21bHNYz0Q+nDnjmJUJ5t90N2EQ/3RewwTTRD4eM6w844EY5hAU8FTCUF3DMyUQ/HBJw0NhEPwgYuidh2NZEPwTHYaIfTnx52urqZiAYgveXAob9Ih7RmOiH/QYJAZvoh9MG/CxgKC9iUMBEP+x3kxCwiX44bRtPXiTkBtzq4maiH067vWw1YBP9sN844f7QMOFWORQwSXhCY6IfThvwQ5sv0kQ/7DfvcsAGgum4oyf17tt8lREjUxAU8KjNV2miH06bxsirhOIyLk4zLvQhJuCWbw8JGPbpdzvgB+8wnTbIeMIacdwEWhdySDHiwCcIeD8T/bBPxDx/yMwUtC5kVN5EPwQvbSEXCiBgAcP/K+T2rol+2GeSEXDI42oICXgqYCgv5IyiiX7YI2XMx0Q/7NETMFxgwCOvE4pLWdlM9MMe/ZRLUwPBcLqAvwoYyot5vmqiH94apgRsoh9OF/BzSsAz7zEdFjPlY6If3rpNCdhEP5xuYXvynQZyA279ytREP7wVc2/IRD+8NUl5OhPzvAtaNE85H3HsiRMDwQi4ghOKJvrhjavOB2wgmA5Lmef/hrnHkXcZARfPwkQ/BK9rOdcKYGcZvFuH1gQ9nBEwXGDAU+8ynRV0vinmzBi05tgRgQInjE30Q3DAJvphV9CUbczkMqgi+nsN2FgGX+2DgAUMvyfo2YyJftg1zwnYRD+cKuCpgKG4pAkBE/2wI2lGz0Q/nCqKe68VcgMusKqZ6IfgfaWJftgxSLoxZCAYThPwVwFDeVGnm0z0w7abSwh45n2mo44d0SsyIOBHcsBpAi4yY2uiH07TxGffbaC8cdKiFnW9D7aV20z0w7aoG7sm+mHbPOnR6rEBGwimo44+Xjwt8Wqjzn1CxQE/lHi1JvphS+8yAh55p+mkrBl5E/0QnISJfgi+KM264Iezy7qvm3XPHM4u7Mlq1FNrELCA4bCoeX4T/bAtbL4nanYKzu4uK2AT/XCKIj57uVBe2DWpiX7YNMkKOOyeG1Qa8EzAUF7Yg1UT/bDhKixgE/2w4ejpgKmAITfghzKv10Q/bLgOC9hEP5xiRbv3DQdyAy50SWqiHzak3RQy0Q8bhpcS8KP3GgGXPxghYHgVdzTRRD+8ur2UgA0E00Vh8/zHjz8aCEbAFfRgoh+CF7S4SwawpQzetEOFAc9KvWAT/fBqnhawiX5YyzvYlHZ0DM4obZ7fRD9cZsAj7zadkzdemzbADHKI/pYDAv72i34B0z15O8q8XTucTd5DGRP9EBxw3tETOJtjDyZ+FTCUFzgaYKIfVgKH80z0g4ChAwJrMNEPwRtKE/2wMr+cgA0EI+AKnsncCBgaiceaTPTDUu+SAh55vxFw8ckAE/2wlDhca6IfvjWGB990oLhB4GomYAjeT5roh6XhJQX86P2mY24Cn6ke/ex65v1GwOVPNQkYGreXFLCJfrrm2NG8opM9x05QGQhGwBXM1proh29r4dl3HSgv8mo08rof3A9qmOiH4IBN9KPMFnzNfNmutBGwgEHAAkbAOQFfCRiswAJGwAIGAQsY7IEFjICtwAJGwAIGAQsY7IEFjICtwAJGwAIGAQsYAdsDCxgBW4FBwAIGAQsYAdsDCxgBW4FBwAIGAQsYAdsDCxgBW4FBwAJGwAIWMAK2BwYBW4FBwAJGwAIWMAK2BwYBW4FBwAJGwAIGAdsDgxVYwAhYwAJGwAIGAdsDgxVYwAhYwAJGwAIGe2ABgxVYwAhYwCBgAYM9sIARsBVYwAhYwCBgAYM9sIARsBVYwAhYwCBgASNge2ABI2ArMAhYwCBgASNge2ABI2ArMAhYwCBgASNge2ABI2ArMAhYwAhYwAJGwPbAIGArMAhYwAhYwAJGwPbAIGArMAhYwAhYwCBge2CwAgsYAQtYwAhYwCBge2CwAgsYAQtYwAhYwGAPLGCwAgsYAQsYBCxgsAcWMAK2AgsYAQsYBCxgsAcWMAK2AgsYAQsYBCxgBGwPLGAEbAUGAQsYBCxgBGwPLGAEbAUGAQsYBCxgBGwPDALu5gr83Y8/+HAh4MyAr3767f9/+YuPFwJODPhT8+/6h88XAs7bA/+8+oqRDxgCTluB++svefIBQ8BpAU9ev+beJwwBZwU82Piazz5hCDhrDzzZ/CK7YAQctQL3t77ILhgBRwV8+63/NhBwsYB3r+6nPmMIOGcP3N/5KtfQCDhoBW6uoL/88OG7n1xDI+C0gBf3oL8sbj7/zaNgBJwV8PXiHzRqLvQXRypnPmQIOGUPPHz5P/9Z/uEPL3949iFDwCkr8N3Wv2exIfYhQ8ApAb/8j8f1n3ovf3zwKUPAGQH3do5Pjrd6BgFXvQce7AwwDAw0IOCcFfhmZ8W98iQYAecEPN4dQBqbSELAMQG/+euhu1gIOGUP3HtzcOPaXSwEnLIC99+ut+YZEHBKwMPFjvdPPzYWe987Z7EQcEjAt4u/Ha++4p/NfWm3oRFwxB74bvHUdx3wy/3nvsOUCDhkBZ4s7li9BvzU3Ne69zlDwAEBN/ewxlv/Ms+REHBGwL3mqvk14Je1d+w5EgKO2ANfN/+WjYCnixtbM58zBFz/CjxoHhltBDxbPFoyzoCAAwJetroR8Od11SDgygO+aa6WNwJ+XlxX/9fnDAHXvwe+be5X/Rbwvz/+/eOn5mt6TnIg4IgV+K75RQzj5dGNn9fPkXzOEHD9AY+bMxurgHtNuhMTwQg4IeBlqquAl2vv2FEsBJywB15eLK8Dbv7jzlEsBJywAi//KeuA7xYr8q1fUYiAAwK+Wv7d5go8WjxcEjACrj7g3vLIxs4KPHQYGgEH7IHfBNyswIP5fOaDhoBrX4Gvl6eeBYyAuxBwc1e6L2AEHBBwf/kDKHcOclz7uZQIOGAPvBvwoPmnCRgBh6zAs2XA3//5j9//dbIO2EAwAq4+4MFrwJtf0xMwAs4M+FnACDhkD7wn4CcBI+DcFfhRwAg4J+DHnYAfBIyAc1fgDwJGwLF74M8CRsC5K/BUwAg4NuBfPwgYAacEvHES6+O/Ps3nvzR/7SQWAk7YA2+dhR4ua3YWGgHHrMCvAffX666AEXBCwFvzwL31F5gHRsBxAV/NV2P9fiIHAk7YA2//TKzJ6ue5D/xQOwQcsAL3tn6s7N3q57kPBYyAAwK+2vrB7rerbm/8XGgEHBDw9m9mGK5uPt/61SoIOGAPvP27kfrLHbHfjYSAM172ZPPXi65/sffYbyf8X3t3r9s0FIYBGPo7ZAiV2BhyCVxCWqnsIOGld0BvwlwCc2dUKeEecC6FgYmlHUGoNfU5p0mdqlR0AH/0eWRVSvqjL6lfH58fOwhwhLLr3NbmAC/nkRqfD4wARyh7moercoCX80jLCWEQ4CH3gcvAcwlwifPGg45QoAX+22VP8sBzCfDVo/MnaX3Whf0MAR5+2aO8lrIEeJwfja5Ho0GAB132bm5sS4DLPNLExUgIcIg+8GYer6qXN7O7zB3jc/sZAjz8srvjyvvVh5u1af6othQaAY5RdpsGnuvVBPAiPbewnyHAAcqu0+nydYCnXdu70VqIhQCH6AN3kf2+CnAavhpZx4EAByl7kp6tqio92q6qt90YlmlgBDhE2aP21rrn2k1lEeAgZW+26xfvdyf753YzBDhCH7irq79qY7d1Pw4EOErZzfrTE4PQCHCYsqfreW0MQiPAYcoer3V5d1qD0AhwlD5w6vJerJ1Bu5QBAQ5SdjqyLPpn0MawEOAoZXeJXc37dvPCxrAQ4DBlv+xFtmndTwcBjtMHzm3uj5sPrMNCgMOUnQ8tudu73bS6wAhwqLLr9L0PXZZTft0TGgEOVPY4f/NbddzcfaIN+sCD7AOnC/hv+mIfQ4ADlV33f8oZNAIcqewXvR8yBo0Ahyq7f3pvDBoBjtQHLms5Hn5sAi3wvyx7wxAWAhy47Mm9jTQI8GDLLis4ynoOEOBIfeB8GX/nq/0LAQ5Y9k5qgz/avRDgkGU/PZrPXtu7EOD/qmwQ4OH3gUGAtcAwsCRc/jz73G3zvj9vgfu//yn/1bNGgHlk5utOZ/Pjk9PZ6cm7vFW/9/zNq7RtHTw73Lv6crCVtmG9yOuq9nKVh6Xme17aUXkHyjty652a2XsIYH+r2x7fK973rwcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACCIX534JAS9oUHZAAAAAElFTkSuQmCC",
  sailor: "data:image/png;base64,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",
}; // __LOGOS_INJECT__

// Throwback art. Only teams with genuine vintage marks appear here:
// BYU 1982 wordmark, BYU 1977 cougar head, Eagles 1987 kelly-green eagle,
// and the classic Jazz note. The Mammoth (est. 2024) and the Dodgers
// (LA monogram essentially unchanged) have no throwback, by design.
const LOGOS_RETRO = {
  byufootball: "data:image/webp;base64,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",
  byubball: "data:image/webp;base64,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",
  eagles: "data:image/webp;base64,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",
  jazz: "data:image/webp;base64,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",
}; // __LOGOS_RETRO_INJECT__

// Throwback palettes, for the teams whose retro era had a distinct look.
// A team absent here keeps its current colors in retro mode rather than
// getting an arbitrary recolor.
const RETRO_COLORS = {
  byubball: { c1: "#0033A0", c2: "#001a52", accent: "#ffffff" },
  jazz: { c1: "#5f259f", c2: "#1c0b33", accent: "#f9a01b" },
  eagles: { c1: "#046A38", c2: "#02301a", accent: "#e8e8e8" },
};

const RetroCtx = createContext(false);

// Resolve a team's mark, honoring retro mode. Teams without throwback art
// fall through to their current logo, so retro mode never blanks a team out.
const markFor = (teamKey, retro) => (retro && LOGOS_RETRO[teamKey]) || LOGOS[teamKey] || null;

function TeamMark({ teamKey, size = 24, emoji = "🏟", style = {}, className = "" }) {
  const retro = useContext(RetroCtx);
  const src = markFor(teamKey, retro);
  if (!src) return <span className={className} style={{ fontSize: size, lineHeight: 1, ...style }}>{emoji}</span>;
  return <img src={src} alt="" aria-hidden="true" className={className} style={{ width: size, height: size, objectFit: "contain", flexShrink: 0, ...style }} />;
}

// Live feeds identify teams by name string, not key — map back to a card.
function TeamMarkByName({ name, size = 18, className = "" }) {
  const c = cardOf(String(name || ""));
  return <TeamMark teamKey={c && c.key} size={size} emoji={(c && c.emoji) || "🏟"} className={className} />;
}

const TEAMS = {
  cfb: { key: "cfb", name: "CFB Hub", tab: "🏆 CFB", custom: true, c1: "#14532d", c2: "#052012", accent: "#7ddf87" },
  byufootball: { key: "byufootball", name: "BYU Football", tab: "🏈 BYU FB", custom: true },
  byubball: { key: "byubball", name: "BYU Basketball", tab: "🏀 BYU BB", emoji: "🏀", league: "NCAA · Big 12", coach: "HC Kevin Young",
    c1: "#1f45c4", c2: "#0c1846", accent: "#ffffff", record: "23–12", recordLabel: "2025-26 season",
    status: "Offseason — reloading around a new core",
    snapshot: [{ label: "2025-26", value: "23–12" }, { label: "Big 12", value: "9–9" }, { label: "NCAA", value: "6-seed · R1" }, { label: "Preseason", value: "No. 8 · best ever" }],
    players: [{ name: "AJ Dybantsa", pos: "F", line: "Led nation 25.5 ppg · off to the NBA" }, { name: "Robert Wright III", pos: "PG", line: "Star point guard — returns for 2026-27" }, { name: "Richie Saunders", pos: "G/F", line: "All-around wing" }, { name: "Keba Keita", pos: "C", line: "Elite rim protector" }, { name: "Kennard Davis Jr.", pos: "G", line: "18.1 ppg scorer" }],
    notes: ["The 'Season of AJ' — Dybantsa led the nation in scoring and was a First-Team All-American.", "Earned the program's highest-ever preseason ranking (No. 8).", "Fell in the NCAA first round to Texas as a 6-seed.", "Reloading for 2026-27: Wright III returns, plus 5-star Bruce Branch III and portal adds.", "Still chasing the program's elusive first Final Four (31+ tourney trips)."] },
  jazz: { key: "jazz", name: "Utah Jazz", tab: "🎷 Jazz", emoji: "🎷", league: "NBA · Western Conf", coach: "HC Will Hardy",
    c1: "#4a2a86", c2: "#0b0713", accent: "#7ec8f0", record: "22–60", recordLabel: "2025-26 season",
    status: "Offseason — building through the draft",
    snapshot: [{ label: "2025-26", value: "22–60" }, { label: "West", value: "15th" }, { label: "Phase", value: "Rebuild" }, { label: "2026 Draft", value: "No. 2 pick" }],
    players: [{ name: "Lauri Markkanen", pos: "F", line: "All-Star scorer · 51-point game" }, { name: "Keyonte George", pos: "G", line: "Breakout lead guard (23.6 ppg)" }, { name: "Jaren Jackson Jr.", pos: "F/C", line: "2× All-Star · added at the deadline" }, { name: "Ace Bailey", pos: "F", line: "2025 No. 5 pick · 15.3 ppg rookie" }, { name: "Darryn Peterson", pos: "G", line: "2026 No. 2 pick (Kansas)" }],
    notes: ["Another development year — 22–60, 15th in the West.", "Selected guard Darryn Peterson No. 2 overall in the 2026 NBA Draft.", "Keyonte George emerged as an All-Star-caliber lead guard.", "Young core (George, Bailey, Kessler, Collier) building around Markkanen."] },
  mammoth: { key: "mammoth", name: "Utah Mammoth", tab: "🦣 Mammoth", emoji: "🦣", league: "NHL · Central", coach: "HC André Tourigny",
    c1: "#123a5e", c2: "#08182a", accent: "#6CACE4", record: "43–33–6", recordLabel: "2025-26 season",
    status: "Offseason — building on a breakthrough first playoff run",
    snapshot: [{ label: "2025-26", value: "43–33–6" }, { label: "West", value: "6th" }, { label: "Playoffs", value: "1st Rd · VGK" }, { label: "Milestone", value: "1st postseason" }],
    players: [{ name: "Clayton Keller", pos: "C · Capt", line: "88 points — team leader" }, { name: "Dylan Guenther", pos: "RW", line: "40 goals — first 40-goal season" }, { name: "Logan Cooley", pos: "C", line: "24 G · franchise's 1st playoff goal" }, { name: "Karel Vejmelka", pos: "G", line: "38 wins · 2.75 GAA" }, { name: "Mikhail Sergachev", pos: "D", line: "Two-way anchor" }],
    notes: ["First season under the 'Utah Mammoth' name (renamed May 2025 from Utah HC).", "Clinched the franchise's FIRST-EVER playoff berth (top wild card in the West).", "Lost a hard-fought first round to the Vegas Golden Knights in six games.", "Logan Cooley scored the franchise's first-ever playoff goal."] },
  eagles: { key: "eagles", name: "Philadelphia Eagles", tab: "🦅 Eagles", emoji: "🦅", league: "NFL · NFC East", coach: "HC Nick Sirianni",
    c1: "#004c54", c2: "#04211d", accent: "#A5ACAF", record: "11–6", recordLabel: "2025 regular season",
    status: "Offseason — 2026 opens at home vs Washington (Sept)",
    snapshot: [{ label: "2025 Record", value: "11–6" }, { label: "NFC East", value: "Champions" }, { label: "Playoffs", value: "Wild Card L" }, { label: "Last Title", value: "SB LIX · '24" }],
    players: [{ name: "Jalen Hurts", pos: "QB", line: "Franchise QB · Super Bowl LIX MVP" }, { name: "Saquon Barkley", pos: "RB", line: "All-Pro workhorse" }, { name: "DeVonta Smith", pos: "WR", line: "Now the No. 1 target (A.J. Brown traded to NE)" }, { name: "Makai Lemon", pos: "WR", line: "2026 first-round rookie" }, { name: "Jalen Carter", pos: "DT", line: "Disruptive interior force" }, { name: "Cooper DeJean", pos: "CB", line: "1st-team All-Pro (2025)" }],
    notes: ["Repeated as NFC East champs — first NFC East repeat since the 2004 Eagles.", "Entered 2025 as defending Super Bowl champs (beat KC 40–22 in SB LIX).", "Fell in the Wild Card round to the 49ers, 23–19.", "Open 2026 at home vs Washington; travel to London to face Jacksonville."] },
  dodgers: { key: "dodgers", name: "Los Angeles Dodgers", tab: "⚾ Dodgers", emoji: "⚾", league: "MLB · NL West", coach: "Mgr Dave Roberts",
    c1: "#005a9c", c2: "#022546", accent: "#ffffff", record: "62–36", recordLabel: "2026 season · in progress", live: true,
    status: "In season — 1st in the NL West, best record in the National League",
    snapshot: [{ label: "2026 Record", value: "62–36" }, { label: "NL West", value: "1st" }, { label: "NL", value: "Best record" }, { label: "Titles", value: "Back-to-back" }],
    players: [{ name: "Shohei Ohtani", pos: "DH/SP", line: "Two-way superstar" }, { name: "Mookie Betts", pos: "SS", line: "MVP-level table-setter" }, { name: "Freddie Freeman", pos: "1B", line: "Elite contact bat" }, { name: "Yoshinobu Yamamoto", pos: "SP", line: "2025 World Series MVP" }, { name: "Will Smith", pos: "C", line: "Clutch backstop" }],
    notes: ["Back-to-back World Series champions (2024 & 2025) — first repeat since the 2000 Yankees.", "Won a classic 2025 Series over Toronto in seven (Game 7 in 11 innings).", "9th title in franchise history; chasing a three-peat in 2026.", "Sitting atop the NL at 62–36 — the best record in the National League."] },
};

const DEPTH = {
  byubball: [
    { grp: "GUARDS", rows: [{ pos: "PG", players: ["Robert Wright III", "Dovydas Buika"] }, { pos: "SG", players: ["Collin Chandler"] }] },
    { grp: "WINGS & BIGS", rows: [{ pos: "SF", players: ["Bruce Branch III", "Dean Rueckert"] }, { pos: "PF", players: ["Tyler Betsey", "Jake Wahlin"] }, { pos: "C", players: ["Khadim Mboup", "center search ongoing"] }] },
  ],
  jazz: [
    { grp: "STARTERS", rows: [{ pos: "PG", players: ["Keyonte George"] }, { pos: "SG", players: ["Ace Bailey"] }, { pos: "SF", players: ["Brice Sensabaugh"] }, { pos: "PF", players: ["Lauri Markkanen"] }, { pos: "C", players: ["Jaren Jackson Jr."] }] },
    { grp: "KEY RESERVES", rows: [{ pos: "G", players: ["Darryn Peterson (R)", "Isaiah Collier", "Svi Mykhailiuk"] }, { pos: "F", players: ["Cody Williams", "John Konchar", "Josh Okogie"] }, { pos: "C", players: ["Jusuf Nurkić", "Kyle Filipowski", "Mo Bamba"] }] },
  ],
  mammoth: [
    { grp: "TOP-6 FORWARDS", rows: [{ pos: "LW", players: ["Lawson Crouse"] }, { pos: "C", players: ["Nick Schmaltz"] }, { pos: "RW", players: ["Clayton Keller (C)"] }, { pos: "LW", players: ["Anders Lee"] }, { pos: "C", players: ["Logan Cooley"] }, { pos: "RW", players: ["Dylan Guenther"] }] },
    { grp: "DEPTH · D · GOAL", rows: [{ pos: "F", players: ["Barrett Hayton", "JJ Peterka", "Kailer Yamamoto"] }, { pos: "D", players: ["Mikhail Sergachev", "John Marino", "Ian Cole"] }, { pos: "G", players: ["Karel Vejmelka"] }] },
  ],
  eagles: [
    { grp: "OFFENSE", rows: [{ pos: "QB", players: ["Jalen Hurts", "Tanner McKee"] }, { pos: "RB", players: ["Saquon Barkley", "Tank Bigsby"] }, { pos: "WR", players: ["DeVonta Smith", "Makai Lemon (R)", "Hollywood Brown"] }, { pos: "TE", players: ["Dallas Goedert", "Grant Calcaterra"] }, { pos: "OL", players: ["Mailata · Dickerson · Jurgens · Steen · Johnson"] }] },
    { grp: "DEFENSE", rows: [{ pos: "EDGE", players: ["Nolan Smith Jr.", "Jalyx Hunt"] }, { pos: "DT", players: ["Jalen Carter", "Jordan Davis"] }, { pos: "LB", players: ["Zack Baun", "Jihaad Campbell"] }, { pos: "CB", players: ["Quinyon Mitchell", "Kelee Ringo"] }, { pos: "NB", players: ["Cooper DeJean"] }, { pos: "S", players: ["Reed Blankenship", "Andrew Mukuba"] }] },
  ],
  dodgers: [
    { grp: "EVERYDAY LINEUP", rows: [{ pos: "DH", players: ["Shohei Ohtani"] }, { pos: "RF", players: ["Kyle Tucker"] }, { pos: "SS", players: ["Mookie Betts"] }, { pos: "1B", players: ["Freddie Freeman"] }, { pos: "C", players: ["Will Smith"] }, { pos: "3B", players: ["Max Muncy"] }, { pos: "2B", players: ["Tommy Edman", "Miguel Rojas"] }, { pos: "CF", players: ["Andy Pages"] }] },
    { grp: "PITCHING", rows: [{ pos: "SP", players: ["Yamamoto", "Snell", "Glasnow", "Sasaki", "Ohtani"] }, { pos: "CL", players: ["Edwin Díaz"] }] },
  ],
  byufootball: [
    { grp: "OFFENSE", rows: [
      { pos: "QB", players: ["Bear Bachmeier", "Treyson Bourguet", "Enoch Watson"] },
      { pos: "RB", players: ["LJ Martin", "Sione Moa", "DeVaughn Eka", "Preston Rex"] },
      { pos: "WR", players: ["Jojo Phillips", "Legend Glasker"] },
      { pos: "WR", players: ["Kyler Kasper", "Tiger Bachmeier"] },
      { pos: "SLOT", players: ["Tei Nacua", "Cody Hagen", "Reggie Frischknecht"] },
      { pos: "TE", players: ["Walker Lyons", "Roger Saleapaga", "Keayen Nead"] },
      { pos: "LT", players: ["Paki Finau", "Siosiua Latu-Finau"] },
      { pos: "LG", players: ["Trevin Ostler", "Joe Brown", "Zak Yamauchi"] },
      { pos: "C", players: ["Bruce Mitchell", "Sonny Makasini"] },
      { pos: "RG", players: ["Kyle Sfarcioc", "JR Sia"] },
      { pos: "RT", players: ["Andrew Gentry", "Bott Mulitalo", "Ethan Thomason"] },
    ] },
    { grp: "DEFENSE", rows: [
      { pos: "EDGE", players: ["Bodie Schoonover", "Hunter Clegg", "Kini Fonohema"] },
      { pos: "EDGE", players: ["Nusi Taumoepeau", "Tausili Akana", "Braxton Lindsey"] },
      { pos: "DT", players: ["Keanu Tanuvasa", "Viliami Po'uha", "Anisi Purcell"] },
      { pos: "DT", players: ["Justin Kirkland", "Ulavai Fetuli", "Nehemiah Kolone"] },
      { pos: "LB", players: ["Cade Uluave", "Jake Clifton"] },
      { pos: "LB", players: ["Isaiah Glasker", "Ace Kaufusi", "Ephraim Asiata"] },
      { pos: "LB", players: ["Siale Esera", "Miles Hall"] },
      { pos: "CB", players: ["Evan Johnson", "Jordyn Criss"] },
      { pos: "CB", players: ["Tre Alexander", "Jayven Williams"] },
      { pos: "NICKEL", players: ["Jonathan Kabeya", "Cannon DeVries"] },
      { pos: "FS", players: ["Faletau Satuala", "Tommy Prassas"] },
      { pos: "S", players: ["Raider Damuni", "Kennan Pula", "Jarinn Kalama"] },
    ] },
    { grp: "SPECIAL TEAMS", rows: [
      { pos: "K", players: ["Matthias Dunn", "Brody Laga (ret. '27)"] },
      { pos: "P", players: ["Fuller Shurtz"] },
      { pos: "LS", players: ["Ty Smith", "Rayden Heintz"] },
      { pos: "KR/PR", players: ["Camp battle — TBD"] },
    ] },
  ],
};

const LEADERSHIP = {
  byufootball: [["Ownership", "The Church of Jesus Christ of Latter-day Saints"], ["Athletics Office", "Pres. C. Shane Reese · AD Brian Santiago · GM Justin Anderson"], ["Coaches", "HC Kalani Sitake · OC Aaron Roderick · DC Kelly Poppinga"]],
  byubball: [["Ownership", "The Church of Jesus Christ of Latter-day Saints"], ["Athletics Office", "Pres. C. Shane Reese · AD Brian Santiago"], ["Coaches", "HC Kevin Young"]],
  jazz: [["Ownership", "Ryan Smith — Smith Entertainment Group"], ["Front Office", "Danny Ainge — CEO, Basketball Ops · Justin Zanik — GM"], ["Coaches", "HC Will Hardy"]],
  mammoth: [["Ownership", "Smith Entertainment Group (Ryan & Ashley Smith)"], ["Front Office", "Chris Armstrong — Pres. Hockey Ops · Bill Armstrong — GM"], ["Coaches", "HC André Tourigny"]],
  eagles: [["Ownership", "Jeffrey Lurie — Chairman & Owner"], ["Front Office", "Howie Roseman — EVP & GM"], ["Coaches", "HC Nick Sirianni · OC Kevin Patullo · DC Vic Fangio"]],
  dodgers: [["Ownership", "Guggenheim Baseball — Mark Walter, Chairman"], ["Front Office", "Andrew Friedman — Pres. Baseball Ops · Brandon Gomes — GM"], ["Coaches", "Mgr Dave Roberts"]],
};

const WRITERS = {
  cfb: [{ name: "Pete Thamel", handle: "PeteThamel", outlet: "ESPN" }, { name: "Bruce Feldman", handle: "BruceFeldman", outlet: "The Athletic" }, { name: "Joel Klatt", handle: "joelklatt", outlet: "FOX" }, { name: "Chris Vannini", handle: "ChrisVannini", outlet: "The Athletic" }],
  byufootball: [{ name: "Jay Drew", handle: "drewjay", outlet: "Deseret News" }, { name: "Dick Harmon", handle: "Harmonwrites", outlet: "Deseret News" }, { name: "Brandon Judd", handle: "brandoncjudd", outlet: "Deseret News" }],
  byubball: [{ name: "Jay Drew", handle: "drewjay", outlet: "Deseret News" }, { name: "Sarah Todd", handle: "NBASarah", outlet: "Deseret News" }, { name: "Brandon Judd", handle: "brandoncjudd", outlet: "Deseret News" }],
  jazz: [{ name: "Tony Jones", handle: "Tjonesonthenba", outlet: "The Athletic" }, { name: "Sarah Todd", handle: "NBASarah", outlet: "Deseret News" }, { name: "Andy Larsen", handle: "andyblarsen", outlet: "SL Tribune" }],
  mammoth: [{ name: "Chase Beardsley", handle: "ChaseBeardsley_", outlet: "Mammoth reporter" }, { name: "Frank Seravalli", handle: "frank_seravalli", outlet: "Daily Faceoff" }, { name: "Emily Kaplan", handle: "emilymkaplan", outlet: "ESPN NHL" }],
  eagles: [{ name: "Jeff McLane", handle: "Jeff_McLane", outlet: "The Inquirer" }, { name: "Tim McManus", handle: "espn_mcmanus", outlet: "ESPN" }, { name: "Dave Zangaro", handle: "DZangaroNBCS", outlet: "NBC Sports Philly" }, { name: "Jimmy Kempski", handle: "JimmyKempski", outlet: "PhillyVoice" }],
  dodgers: [{ name: "Fabian Ardaya", handle: "Fabian_Ardaya", outlet: "The Athletic" }, { name: "Jack Harris", handle: "Jack_Harris", outlet: "LA Times" }, { name: "Bill Plunkett", handle: "billplunkettocr", outlet: "OC Register" }],
};

const NEWS_CACHE = {};
const NEWS_TTL = 300000;

function TeamNews({ teamKey, teamName, ui }) {
  const c0 = NEWS_CACHE[teamKey];
  const fresh0 = c0 && Date.now() - c0.ts < NEWS_TTL;
  const [news, setNews] = useState(fresh0 ? c0.news : null);
  const [ts, setTs] = useState(fresh0 ? c0.ts : null);
  const [loading, setLoading] = useState(!fresh0);
  const [err, setErr] = useState(false);
  const writers = WRITERS[teamKey] || [];
  const xSearch = `https://x.com/search?q=${encodeURIComponent(teamName)}&f=live`;
  const load = async () => {
    setLoading(true); setErr(false);
    try {
      const res = await fetch(apiUrl(), {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-5", max_tokens: 3000, tools: [{ type: "web_search_20260209", name: "web_search" }], messages: [{ role: "user", content: `Search the web for the 5 most recent news items about the ${teamName} from beat writers and major outlets. Respond with ONLY a JSON array (no prose, no markdown) of objects: {"headline": string, "source": string, "url": string}. Use real, current article URLs from your search results.` }] }),
      });
      const data = await res.json();
      const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("\n");
      let items = [];
      const m = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (m) { try { items = JSON.parse(m[0]); } catch (e2) {} }
      items = (Array.isArray(items) ? items : []).slice(0, 6);
      const now = Date.now();
      NEWS_CACHE[teamKey] = { news: items, ts: now };
      setNews(items); setTs(now);
    } catch (e) { setErr(true); }
    setLoading(false);
  };
  useEffect(() => { if (!fresh0) load(); }, [teamKey]);
  const stamp = ts ? new Date(ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : null;
  return (
    <div style={{ color: ui.text }}>
      <div className="text-xs font-black tracking-[0.2em] mb-2 mt-4" style={{ color: ui.accentColor }}>BEAT WRITERS · X</div>
      <div className="flex flex-wrap gap-2 mb-2">
        {writers.map(w => (
          <a key={w.handle} href={`https://x.com/${w.handle}`} target="_blank" rel="noopener noreferrer" className="btn-lift rounded-2xl px-3 py-2 text-xs no-underline" style={ui.glass}>
            <div className="font-black">{w.name}</div>
            <div className="opacity-70">@{w.handle} · {w.outlet}</div>
          </a>
        ))}
      </div>
      <a href={xSearch} target="_blank" rel="noopener noreferrer" className="btn-lift inline-block rounded-full px-3 py-1.5 text-xs font-black no-underline mb-4" style={{ ...ui.accentBg }}>🔎 Live posts on X →</a>
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="text-xs font-black tracking-[0.2em]" style={{ color: ui.accentColor }}>LATEST NEWS</div>
          {stamp && <div className="text-xs opacity-55">Updated {stamp}</div>}
        </div>
        <button onClick={load} disabled={loading} className="btn-lift rounded-full px-3 py-1.5 text-xs font-black" style={{ ...ui.accentBg, opacity: loading ? 0.6 : 1 }}>{loading ? "Loading…" : news ? "Refresh" : "Load news"}</button>
      </div>
      {err && <div className="text-xs opacity-70 mb-2">Couldn't load news right now — try again in a moment.</div>}
      {news && !news.length && !loading && <div className="text-xs opacity-70 mb-2">No items found.</div>}
      <div className="flex flex-col gap-2">
        {(news || []).map((n, i) => (
          <a key={i} href={n.url} target="_blank" rel="noopener noreferrer" className="btn-lift rounded-2xl p-3 block no-underline" style={ui.glass}>
            <div className="font-black text-sm">{n.headline}</div>
            <div className="text-xs opacity-70 mt-0.5">{n.source} ↗</div>
          </a>
        ))}
      </div>
      {!news && !loading && !err && <div className="text-xs opacity-60">Pulling the latest headlines…</div>}
    </div>
  );
}

const DEEPSTATS = {
  byubball: [
    { v: "23–12", l: "Record", s: "9–9 Big 12" },
    { v: "No. 8", l: "Preseason", s: "highest ever" },
    { v: "25.5", l: "Dybantsa PPG", s: "led the nation", r: "1st D-I" },
    { v: "6-seed", l: "NCAA Tourney", s: "R1 L vs Texas" },
    { v: "93", l: "Big 12 Tourney pts", s: "single-tourney", r: "record" },
    { v: "31+", l: "Tourney trips", s: "no Final Four yet" },
  ],
  jazz: [
    { v: "22–60", l: "Record", s: "15th in West" },
    { v: "26.7", l: "Markkanen PPG", s: "when healthy" },
    { v: "23.6", l: "K. George PPG", s: "6.1 apg breakout" },
    { v: "Bottom 5", l: "Defense", s: "def. rating", r: "~28th" },
    { v: "Up-tempo", l: "Pace", s: "below-avg offense" },
    { v: "15.3", l: "Ace Bailey PPG", s: "rookie (2025 #5)" },
  ],
  mammoth: [
    { v: "43–33–6", l: "Record", s: "92 points", r: "6th West" },
    { v: "268 / 240", l: "Goals For / Ag.", s: "+28 differential", r: "10th" },
    { v: "20.0%", l: "Power Play", s: "special teams", r: "18th" },
    { v: ".896", l: "Vejmelka SV%", s: "2.75 GAA · 38 W" },
    { v: "88", l: "Keller Points", s: "team leader" },
    { v: "40", l: "Guenther Goals", s: "first 40-goal yr" },
  ],
  eagles: [
    { v: "11–6", l: "Record", s: "NFC East champs" },
    { v: "379 / 325", l: "Points For / Ag.", s: "+54 differential" },
    { v: "22.3", l: "PPG scored", s: "19.1 allowed" },
    { v: "46", l: "Touchdowns", s: "on offense" },
    { v: "Top 5", l: "Defense", s: "unit ranking" },
    { v: "No. 1", l: "O-line", s: "in football" },
  ],
  dodgers: [
    { v: "62–36", l: "Record", s: "1st NL West", r: "1st NL" },
    { v: "+126", l: "Run Differential", s: "elite margin", r: "1st NL" },
    { v: "3.19", l: "Bullpen ERA", s: "top run value", r: "7th" },
    { v: ".254", l: "BABIP allowed", s: "best defense", r: "1st MLB" },
    { v: "2×", l: "World Series", s: "'24 & '25 champs" },
    { v: "2-way", l: "Ohtani", s: "fully unleashed" },
  ],
};

const PRED = {
  byufootball: { games: "12-game slate", unit: "wins", tiers: ["Middle of pack", "Bowl team", "Big 12 title game", "Playoff berth", "National champs"] },
  byubball: { games: "~33 games", unit: "wins", tiers: ["Bubble", "NCAA Tourney", "Sweet 16", "Final Four", "National champs"] },
  jazz: { games: "82 games", unit: "wins", tiers: ["Lottery again", "Play-In", "Playoffs", "Conf. Finals", "NBA champs"] },
  mammoth: { games: "82 games", unit: "wins", tiers: ["Miss playoffs", "Wild Card", "2nd Round", "Conf. Finals", "Stanley Cup"] },
  eagles: { games: "17 games", unit: "wins", tiers: ["Miss playoffs", "Wild Card", "Divisional", "Conf. Champ.", "Super Bowl"] },
  dodgers: { games: "162 games", unit: "wins", tiers: ["Miss playoffs", "Wild Card", "NLDS", "NLCS", "World Series"] },
};

function SeasonPredictor({ teamKey, teamName, ui }) {
  const cfg = PRED[teamKey];
  const [pred, setPred] = useStorage("sportshq_pred_" + teamKey, {});
  if (!cfg) return null;
  const set = (k, v) => setPred(p => ({ ...p, [k]: v }));
  const made = pred.wins || pred.outcome !== undefined;
  return (
    <div style={{ color: ui.text }}>
      <div className="text-xs font-black tracking-[0.2em] mb-2 mt-4" style={{ color: ui.accentColor }}>🔮 SEASON PREDICTOR</div>
      <div className="rounded-3xl p-4" style={ui.glass}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-black opacity-70">PREDICTED {cfg.unit.toUpperCase()}</span>
          <input type="number" value={pred.wins ?? ""} onChange={e => set("wins", e.target.value)} placeholder="—" className="w-16 px-2 py-1 rounded-lg text-center" style={ui.input} />
          <span className="text-xs opacity-55">/ {cfg.games}</span>
        </div>
        <div className="text-xs font-black opacity-70 mb-1.5">HOW FAR DO THEY GO?</div>
        <div className="flex flex-wrap gap-1.5">
          {cfg.tiers.map((t, i) => (
            <button key={t} onClick={() => set("outcome", i)} className="btn-lift px-2.5 py-1.5 rounded-full text-xs font-black" style={pred.outcome === i ? { ...ui.accentBg } : { background: ui.idleBtn, color: ui.text, border: ui.idleBorder }}>{t}</button>
          ))}
        </div>
        {made && <div className="text-xs opacity-85 mt-3">Your call: <span className="font-black">{pred.wins ? `${pred.wins} ${cfg.unit}` : "—"}</span>{pred.outcome !== undefined ? ` · ${cfg.tiers[pred.outcome]}` : ""}</div>}
      </div>
      <div className="text-xs opacity-45 mt-2 text-center">Saved automatically — game-by-game Pick'Em comes online as each schedule drops.</div>
    </div>
  );
}

const SCHED_CACHE = {};

function LivePickem({ teamKey, teamName, shortName, ui }) {
  const c0 = SCHED_CACHE[teamKey];
  const fresh0 = c0 && Date.now() - c0.ts < 300000;
  const [games, setGames] = useState(fresh0 ? c0.games : null);
  const [loading, setLoading] = useState(!fresh0);
  const [err, setErr] = useState(false);
  const [picks, setPicks] = useStorage("sportshq_lpick_" + teamKey, {});
  const load = async () => {
    setLoading(true); setErr(false);
    try {
      const res = await fetch(apiUrl(), {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-5", max_tokens: 3000, tools: [{ type: "web_search_20260209", name: "web_search" }], messages: [{ role: "user", content: `Search the web for the ${teamName}'s next 6 upcoming scheduled games. Respond with ONLY a JSON array (no prose, no citations, no markdown) like [{"date":"Jul 20","opp":"Giants","ha":"vs"}], where "ha" is "vs" for home or "at" for away. If there are genuinely no upcoming games (offseason / schedule unreleased), return [].` }] }),
      });
      const data = await res.json();
      const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("\n");
      let items = [];
      const m = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (m) { try { items = JSON.parse(m[0]); } catch (e2) {} }
      items = (Array.isArray(items) ? items : []).slice(0, 6).map(g => ({
        date: g.date || g.when || g.day || "",
        opp: g.opp || g.opponent || g.vs || g.team || "TBD",
        ha: /at|away/i.test(String(g.ha || g.homeAway || g.location || "")) || g.home === false ? "at" : "vs",
      }));
      SCHED_CACHE[teamKey] = { games: items, ts: Date.now() };
      setGames(items);
    } catch (e) { setErr(true); }
    setLoading(false);
  };
  useEffect(() => { if (!fresh0) load(); }, [teamKey]);
  const pick = (id, who) => setPicks(p => ({ ...p, [id]: who }));
  const curPicks = (games || []).map(g => picks[`${g.date}|${g.opp}`]).filter(Boolean);
  const teamWins = curPicks.filter(v => v === "team").length;
  const oppActive = { background: "rgba(8,12,32,0.85)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)" };
  return (
    <div style={{ color: ui.text }}>
      <div className="flex items-center justify-between mb-2 mt-4">
        <div className="text-xs font-black tracking-[0.2em]" style={{ color: ui.accentColor }}>🗳️ GAME PICK'EM</div>
        <button onClick={load} disabled={loading} className="btn-lift rounded-full px-3 py-1.5 text-xs font-black" style={{ ...ui.accentBg, opacity: loading ? 0.6 : 1 }}>{loading ? "Loading…" : "Refresh"}</button>
      </div>
      {loading && !games && <div className="text-xs opacity-70 mb-2">Pulling the upcoming schedule…</div>}
      {err && <div className="text-xs opacity-70 mb-2">Couldn't load the schedule — try Refresh.</div>}
      {games && !games.length && !loading && <div className="rounded-2xl p-3 text-xs opacity-75" style={ui.glass}>No upcoming games yet — {teamName} is between seasons or the schedule isn't out. This lights up automatically once games are set.</div>}
      <div className="flex flex-col gap-2">
        {(games || []).map((g, i) => {
          const id = `${g.date}|${g.opp}`; const pk = picks[id];
          return (
            <div key={i} className="rounded-2xl p-3" style={ui.glass}>
              <div className="flex justify-between items-center mb-2 text-xs">
                <span className="font-black">{g.ha === "at" ? "at" : "vs"} {g.opp}</span>
                <span className="opacity-60">{g.date}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => pick(id, "team")} className="btn-lift flex-1 py-2 rounded-xl text-sm font-black" style={pk === "team" ? { ...ui.accentBg } : { background: ui.idleBtn, color: ui.text, border: ui.idleBorder }}>{shortName}</button>
                <button onClick={() => pick(id, "opp")} className="btn-lift flex-1 py-2 rounded-xl text-sm font-black" style={pk === "opp" ? oppActive : { background: ui.idleBtn, color: ui.text, border: ui.idleBorder }}>{g.opp}</button>
              </div>
            </div>
          );
        })}
      </div>
      {games && games.length > 0 && <div className="text-xs opacity-75 mt-2 text-center">{curPicks.length} of {games.length} picked · <span className="font-black" style={{ color: ui.accentColor }}>{teamWins} {shortName} wins</span> called</div>}
    </div>
  );
}

const TEAM_HONORS = {
  byubball: {
    trophies: [{ yr: "1951", label: "NIT Champs" }, { yr: "1966", label: "NIT Champs" }],
    retired: ["22 Ainge", "32 Fredette", "11 Cosic"],
    awards: [["AJ Dybantsa", "First-Team All-American '26 · Big 12 tourney record 93 pts"], ["Danny Ainge", "Wooden Award '81"], ["Jimmer Fredette", "National Player of the Year '11"]],
  },
  jazz: {
    trophies: [{ yr: "1997", label: "West Champs" }, { yr: "1998", label: "West Champs" }],
    retired: ["12 Stockton", "32 Malone", "7 Maravich", "53 Eaton", "1223 Sloan"],
    awards: [["Karl Malone", "2× NBA MVP ('97, '99)"], ["John Stockton", "All-time assists & steals leader"], ["Lauri Markkanen", "Most Improved Player '23 · All-Star"]],
  },
  mammoth: {
    trophies: [],
    retired: [],
    awards: [["Clayton Keller", "NHL All-Star · franchise's first captain"], ["Dylan Guenther", "First 40-goal season ('25-26)"], ["Mikhail Sergachev", "2× Stanley Cup champion (TB)"]],
  },
  eagles: {
    trophies: [{ yr: "1948", label: "NFL Champs" }, { yr: "1949", label: "NFL Champs" }, { yr: "1960", label: "NFL Champs" }, { yr: "2018", label: "Super Bowl LII" }, { yr: "2025", label: "Super Bowl LIX" }],
    retired: ["20 Dawkins", "60 Bednarik", "92 White", "15 Van Buren", "99 J. Brown"],
    awards: [["Jalen Hurts", "Super Bowl LIX MVP"], ["Saquon Barkley", "NFL Off. Player of the Year '24 · 2,000-yd season"], ["Cooper DeJean", "First-Team All-Pro '25"]],
  },
  dodgers: {
    trophies: [{ yr: "1955", label: "World Series" }, { yr: "1959", label: "World Series" }, { yr: "1963", label: "World Series" }, { yr: "1965", label: "World Series" }, { yr: "1981", label: "World Series" }, { yr: "1988", label: "World Series" }, { yr: "2020", label: "World Series" }, { yr: "2024", label: "World Series" }, { yr: "2025", label: "World Series" }],
    retired: ["42 Robinson", "32 Koufax", "24 Alston", "2 Lasorda", "34 Valenzuela"],
    awards: [["Shohei Ohtani", "3× MVP ('21, '23, '24)"], ["Yoshinobu Yamamoto", "World Series MVP '25"], ["Freddie Freeman", "World Series MVP '24 · NL MVP '20"], ["Mookie Betts", "AL MVP '18"]],
  },
};

const FRANCHISE = {
  byufootball: { founded: "1922", legends: ["Ty Detmer (1990 Heisman)", "Steve Young", "Jim McMahon", "LaVell Edwards (HC '72–'00)"], timeline: [{ yr: "1984", ev: "National champions at 13–0" }, { yr: "1990", ev: "Ty Detmer wins the Heisman" }, { yr: "1996", ev: "Cotton Bowl win, 14–1 season" }, { yr: "2023", ev: "Joins the Big 12" }, { yr: "2025", ev: "12–2, best recruiting class ever" }] },
  byubball: { founded: "1902", legends: ["Danny Ainge ('81 Nat'l POY)", "Jimmer Fredette ('11 POY)", "Kresimir Cosic", "Michael Smith"], timeline: [{ yr: "1981", ev: "Danny Ainge wins the Wooden Award" }, { yr: "2011", ev: "Jimmer-mania; Fredette national POY" }, { yr: "2023", ev: "Joins the Big 12" }, { yr: "2026", ev: "Jimmer's No. 32 retired; Dybantsa era" }] },
  jazz: { founded: "1974 · Utah since '79", legends: ["John Stockton", "Karl Malone", "Jerry Sloan (HC)", "Pete Maravich"], timeline: [{ yr: "1979", ev: "Franchise moves to Salt Lake City" }, { yr: "1997", ev: "First NBA Finals vs the Bulls" }, { yr: "1998", ev: "Second straight Finals run" }, { yr: "2025", ev: "New Mountain Purple identity" }] },
  mammoth: { founded: "2024 (Salt Lake City)", legends: ["Clayton Keller (1st captain)", "Dylan Guenther", "Logan Cooley"], timeline: [{ yr: "2024", ev: "NHL arrives in Utah (as Utah HC)" }, { yr: "2025", ev: "Rebrand to the Utah Mammoth" }, { yr: "2026", ev: "First-ever playoff berth" }] },
  eagles: { founded: "1933", legends: ["Reggie White", "Brian Dawkins", "Chuck Bednarik", "Steve Van Buren"], timeline: [{ yr: "1960", ev: "NFL champions (Bednarik era)" }, { yr: "2018", ev: "Super Bowl LII win over the Patriots" }, { yr: "2025", ev: "Super Bowl LIX champs (Hurts)" }, { yr: "2026", ev: "Wild Card exit as defending champs" }] },
  dodgers: { founded: "1883 · LA since '58", legends: ["Jackie Robinson", "Sandy Koufax", "Vin Scully (voice)", "Clayton Kershaw"], timeline: [{ yr: "1947", ev: "Jackie Robinson breaks the color barrier" }, { yr: "1988", ev: "Gibson's walk-off HR, WS title" }, { yr: "2020", ev: "World Series title" }, { yr: "2024", ev: "World Series champs" }, { yr: "2025", ev: "Back-to-back champs" }] },
};

function MiniJersey({ num, name, color }) {
  return (
    <div className="text-center" style={{ width: 64 }}>
      <svg viewBox="0 0 100 92" style={{ width: 64, display: "block", margin: "0 auto", filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.35))" }}>
        <path d="M32 6 L44 2 Q50 12 56 2 L68 6 L94 22 L84 42 L72 36 L72 88 L28 88 L28 36 L16 42 L6 22 Z" fill={color + "2e"} stroke={color} strokeWidth="3" strokeLinejoin="round" />
        <text x="50" y="62" textAnchor="middle" fontSize={String(num).length > 2 ? 20 : 30} fontWeight="900" fill={color}>{num}</text>
      </svg>
      <div className="font-bold opacity-80 mt-0.5" style={{ fontSize: 9 }}>{name}</div>
    </div>
  );
}

function HonorsWall({ teamKey, ui }) {
  const H = TEAM_HONORS[teamKey];
  if (!H) return null;
  return (
    <div style={{ color: ui.text }}>
      <div className="text-xs font-black tracking-[0.2em] mb-2 mt-4" style={{ color: ui.accentColor }}>🏆 HONORS WALL</div>
      <div className="rounded-2xl p-3 mb-2" style={ui.glass}>
        <div className="text-xs font-black opacity-55 mb-1.5">CHAMPIONSHIPS</div>
        {H.trophies.length ? (
          <div className="flex flex-wrap gap-1.5">
            {H.trophies.map((t, i) => (
              <div key={i} className="rounded-xl px-2.5 py-1.5 text-center" style={{ background: "rgba(255,215,90,0.1)", border: "1px solid rgba(255,215,90,0.4)" }}>
                <div className="text-lg leading-none">🏆</div>
                <div className="text-xs font-black mt-0.5">{t.yr}</div>
                <div className="opacity-65" style={{ fontSize: 9 }}>{t.label}</div>
              </div>
            ))}
          </div>
        ) : <div className="text-xs opacity-65">The case is empty — for now. This franchise's story is just starting. 🦣</div>}
      </div>
      <div className="rounded-2xl p-3 mb-2" style={ui.glass}>
        <div className="text-xs font-black opacity-55 mb-2">RETIRED JERSEYS</div>
        {H.retired.length ? (
          <div className="flex flex-wrap gap-3">
            {H.retired.map(r => { const sp = String(r).split(" "); return <MiniJersey key={r} num={sp[0]} name={sp.slice(1).join(" ")} color={ui.accentColor} />; })}
          </div>
        ) : <div className="text-xs opacity-65">No numbers in the rafters yet.</div>}
      </div>
      <div className="rounded-2xl p-3" style={ui.glass}>
        <div className="text-xs font-black opacity-55 mb-1.5">🥇 INDIVIDUAL HARDWARE</div>
        <div className="flex flex-col gap-1.5">
          {H.awards.map(([nm, aw]) => (
            <div key={nm} className="flex items-start gap-2 text-sm">
              <span className="shrink-0">🥇</span>
              <span><span className="font-black">{nm}</span> <span className="opacity-80">— {aw}</span></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Franchise({ data, ui }) {
  if (!data) return null;
  return (
    <div style={{ color: ui.text }}>
      <div className="text-xs font-black tracking-[0.2em] mb-2 mt-4" style={{ color: ui.accentColor }}>🏛️ FRANCHISE HISTORY <span className="opacity-70">· founded {data.founded}</span></div>
      <div className="rounded-2xl p-3 mb-2" style={ui.glass}><div className="text-xs font-black opacity-55 mb-1">LEGENDS</div><div className="text-sm">{data.legends.join(" · ")}</div></div>
      <div className="rounded-2xl p-3" style={ui.glass}>
        <div className="text-xs font-black opacity-55 mb-1.5">TIMELINE</div>
        <div className="flex flex-col gap-1.5">{data.timeline.map((t, i) => (<div key={i} className="flex gap-2 text-sm"><span className="font-black shrink-0" style={{ color: ui.accentColor, width: 42 }}>{t.yr}</span><span className="opacity-85">{t.ev}</span></div>))}</div>
      </div>
    </div>
  );
}

// Uncontrolled by default; pass `open` + `onToggle` to drive it from outside
// (the BYU rail needs to open a section when it jumps to it).
function Collapse({ icon, title, children, T, defaultOpen = false, open: openProp = undefined, onToggle = null, note = null }) {
  const [openLocal, setOpenLocal] = useState(!!defaultOpen);
  const controlled = openProp !== undefined;
  const open = controlled ? !!openProp : openLocal;
  const toggle = () => { if (controlled) { if (onToggle) onToggle(); } else setOpenLocal(o => !o); };
  return (
    <div className="rounded-3xl mb-2 overflow-hidden" style={T.glass}>
      <button onClick={toggle} aria-expanded={open} className="w-full flex items-center justify-between px-4 py-3.5 font-black text-sm btn-lift" style={{ color: T.text, background: "transparent" }}>
        <span>{icon} {title}{note && <span className="opacity-50 font-bold ml-2">{note}</span>}</span><span className="opacity-55 text-base">{open ? "▾" : "▸"}</span>
      </button>
      {open && <div className="px-3 pb-3" style={{ animation: "fadein .3s ease" }}>{children}</div>}
    </div>
  );
}

const PLAYER_CACHE = {};

function PlayerModal({ name, teamName, onClose, ui }) {
  const cached = PLAYER_CACHE[name];
  const [prof, setProf] = useState(cached || null);
  const [loading, setLoading] = useState(!cached);
  const [err, setErr] = useState(false);
  useEffect(() => {
    if (cached) return;
    (async () => {
      try {
        const res = await fetch(apiUrl(), {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ model: "claude-sonnet-5", max_tokens: 3000, tools: [{ type: "web_search_20260209", name: "web_search" }], messages: [{ role: "user", content: `Search the web for current info on ${name} of the ${teamName}. Then output ONLY a JSON object as your entire final message (no prose before or after, no citations, no markdown fences): {"bio": "2-3 sentence current bio", "stats": [{"label": string, "value": string}] (4-6 key current/recent stats), "news": [{"headline": string, "source": string}] (2-3 recent news items)}.` }] }),
        });
        const data = await res.json();
        const blocks = (data.content || []).filter(b => b.type === "text").map(b => b.text);
        let p = null;
        for (let i = blocks.length - 1; i >= 0 && !p; i--) {
          const mm = blocks[i].match(/\{[\s\S]*\}/);
          if (mm) { try { const cand = JSON.parse(mm[0]); if (cand && cand.bio) p = cand; } catch (e2) {} }
        }
        if (!p) {
          const joined = blocks.join("\n"); const mj = joined.match(/\{[\s\S]*\}/);
          if (mj) { try { const cand = JSON.parse(mj[0]); if (cand && cand.bio) p = cand; } catch (e3) {} }
        }
        if (p) { PLAYER_CACHE[name] = p; setProf(p); } else setErr(true);
      } catch (e) { setErr(true); }
      setLoading(false);
    })();
  }, [name]);
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 90, background: "rgba(3,5,14,0.75)", backdropFilter: "blur(6px)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={e => e.stopPropagation()} className="w-full max-w-lg rounded-t-3xl p-5 pb-8" style={{ background: "linear-gradient(165deg, #141b3f, #07091a)", border: "1px solid rgba(255,255,255,0.16)", color: "#fff", maxHeight: "82vh", overflowY: "auto", animation: "teamin .3s ease" }}>
        <div className="flex justify-between items-start mb-1">
          <div><div className="text-xl font-black">{name}</div><div className="text-xs opacity-60">{teamName}</div></div>
          <button onClick={onClose} className="btn-lift w-9 h-9 rounded-full font-black shrink-0" style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)", color: "#fff" }}>✕</button>
        </div>
        {loading && <div className="text-sm opacity-70 py-6 text-center animate-pulse">Pulling live profile…</div>}
        {err && !loading && <div className="text-sm opacity-70 py-4">Couldn't load a profile right now — try again in a moment.</div>}
        {prof && (<>
          <div className="text-sm opacity-90 leading-relaxed mt-2 mb-3">{prof.bio}</div>
          {prof.stats?.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mb-3">
              {prof.stats.map((s, i) => (
                <div key={i} className="rounded-2xl p-2.5" style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}>
                  <div className="text-base font-black" style={{ color: ui?.accentColor || "#8ea6ff" }}>{s.value}</div>
                  <div className="text-xs opacity-65">{s.label}</div>
                </div>
              ))}
            </div>
          )}
          {prof.news?.length > 0 && (<>
            <div className="text-xs font-black tracking-[0.2em] opacity-55 mb-1.5">LATEST</div>
            <div className="flex flex-col gap-1.5">
              {prof.news.map((n, i) => <div key={i} className="rounded-xl p-2.5 text-sm" style={{ background: "rgba(255,255,255,0.07)" }}><div className="font-bold">{n.headline}</div><div className="text-xs opacity-55">{n.source}</div></div>)}
            </div>
          </>)}
          <div className="text-xs opacity-40 mt-3 text-center">Live-fetched profile — verify big claims against the source.</div>
        </>)}
      </div>
    </div>
  );
}

const SCHEDULES = {
  mammoth: { title: "2026-27 OPENING SLATE", note: "Season opens Oct 1 · dates from the published NHL schedule", games: [
    { date: "Thu Oct 1", opp: "Blackhawks", ha: "vs", time: "7:00 PM MT", tag: "Opener" },
    { date: "Sat Oct 3", opp: "Blue Jackets", ha: "at", time: "5:00 PM MT" },
    { date: "Sun Oct 4", opp: "Rangers", ha: "at", time: "4:00 PM MT" },
    { date: "Tue Oct 6", opp: "Devils", ha: "at", time: "5:00 PM MT" },
    { date: "Thu Oct 8", opp: "Bruins", ha: "at", time: "5:00 PM MT" },
    { date: "Sat Oct 10", opp: "Sabres", ha: "at", time: "5:00 PM MT" },
    { date: "Tue Oct 13", opp: "Maple Leafs", ha: "vs", time: "7:00 PM MT" },
    { date: "Thu Oct 15", opp: "Oilers", ha: "at", time: "7:00 PM MT" },
    { date: "Sat Oct 17", opp: "Oilers", ha: "vs", time: "8:00 PM MT" },
    { date: "Mon Oct 19", opp: "Penguins", ha: "vs", time: "7:00 PM MT" },
    { date: "Thu Oct 22", opp: "Kraken", ha: "at", time: "7:40 PM MT" },
    { date: "Sat Oct 24", opp: "Lightning", ha: "vs", time: "7:00 PM MT" },
    { date: "Tue Oct 27", opp: "Wild", ha: "vs", time: "7:00 PM MT" },
    { date: "Thu Oct 29", opp: "Penguins", ha: "at", time: "5:00 PM MT" },
    { date: "Sun Nov 1", opp: "Flyers", ha: "at", time: "2:00 PM MT" },
  ] },
  eagles: { title: "2026 SCHEDULE", note: "Preseason opens Aug 15 · Week 1 is Sep 13 · dates from the published NFL schedule", games: [
    { date: "Sat Aug 15", opp: "Ravens", ha: "at", time: "5:00 PM MT", tag: "Preseason" },
    { date: "Sat Aug 22", opp: "Patriots", ha: "at", time: "5:00 PM MT", tag: "Preseason" },
    { date: "Fri Aug 28", opp: "Bengals", ha: "vs", time: "6:00 PM MT", tag: "Preseason" },
    { date: "Sun Sep 13", opp: "Commanders", ha: "vs", time: "2:25 PM MT", tag: "Week 1" },
    { date: "Sun Sep 20", opp: "Titans", ha: "at", time: "11:00 AM MT" },
    { date: "Mon Sep 28", opp: "Bears", ha: "at", time: "6:15 PM MT", tag: "MNF" },
    { date: "Sun Oct 4", opp: "Rams", ha: "vs", time: "11:00 AM MT" },
    { date: "Sun Oct 11", opp: "Jaguars", ha: "at", time: "7:30 AM MT", tag: "London" },
    { date: "Sun Oct 18", opp: "Panthers", ha: "vs", time: "11:00 AM MT" },
    { date: "Mon Oct 26", opp: "Cowboys", ha: "vs", time: "6:15 PM MT", tag: "MNF" },
    { date: "Sun Nov 1", opp: "Commanders", ha: "at", time: "6:20 PM MT", tag: "SNF" },
    { date: "Sun Nov 8", opp: "Giants", ha: "vs", time: "11:00 AM MT" },
    { date: "Sun Nov 22", opp: "Steelers", ha: "vs", time: "2:25 PM MT" },
    { date: "Thu Nov 26", opp: "Cowboys", ha: "at", time: "2:30 PM MT", tag: "Thanksgiving" },
    { date: "Sun Dec 6", opp: "Cardinals", ha: "at", time: "2:05 PM MT" },
  ] },
  jazz: { title: "2026-27 OPENING SLATE", note: "Season opens Oct 21 · home opener Oct 23 · dates from the published NBA schedule", games: [
    { date: "Wed Oct 21", opp: "Grizzlies", ha: "at", time: "6:00 PM MT" },
    { date: "Fri Oct 23", opp: "Pelicans", ha: "vs", time: "7:30 PM MT", tag: "Home opener" },
    { date: "Sun Oct 25", opp: "Lakers", ha: "vs", time: "3:00 PM MT" },
    { date: "Mon Oct 26", opp: "Grizzlies", ha: "vs", time: "7:00 PM MT" },
    { date: "Wed Oct 28", opp: "Spurs", ha: "vs", time: "7:00 PM MT" },
    { date: "Sat Oct 31", opp: "Trail Blazers", ha: "vs", time: "1:00 PM MT" },
    { date: "Mon Nov 2", opp: "Spurs", ha: "at", time: "6:30 PM MT" },
    { date: "Wed Nov 4", opp: "Pelicans", ha: "at", time: "6:00 PM MT" },
    { date: "Fri Nov 6", opp: "Mavericks", ha: "at", time: "6:00 PM MT" },
    { date: "Sun Nov 8", opp: "Timberwolves", ha: "at", time: "5:00 PM MT" },
    { date: "Tue Nov 10", opp: "Heat", ha: "vs", time: "7:00 PM MT" },
    { date: "Wed Nov 11", opp: "Magic", ha: "vs", time: "7:00 PM MT" },
    { date: "Fri Nov 13", opp: "Rockets", ha: "at", time: "6:30 PM MT" },
    { date: "Sun Nov 15", opp: "Spurs", ha: "vs", time: "3:00 PM MT" },
    { date: "Tue Nov 17", opp: "Clippers", ha: "at", time: "9:00 PM MT" },
  ] },
};

const ANALYSTS = {
  byubball: { name: "Cosmo (Hoops Mode)", emoji: "🏀", vibe: "BYU's mascot in basketball mode — electric, loyal, hyped on the Kevin Young era and the reload after Dybantsa. Family-friendly, punchy, drops 'Rise and Shout!'", chips: ["Can Wright III carry us?", "Do we finally make a Final Four?", "Hype the Big 12 race"] },
  jazz: { name: "Jazz Bear", emoji: "🐻", vibe: "The Jazz's legendary mischievous mascot — playful, prank-loving, but sneaky-smart about basketball. Honest about the rebuild while hyped on the young core and the new Mountain Purple era.", chips: ["Is Peterson the future?", "When are we good again?", "Grade the rebuild"] },
  mammoth: { name: "Tusky", emoji: "🦣", vibe: "The Mammoth's mascot — big, warm, stomping with excitement about hockey in Utah. Proud of the first playoff run, hyped on Keller, Cooley, and Guenther.", chips: ["Can we win a playoff round?", "Is Cooley a superstar?", "Hype opening night"] },
  eagles: { name: "Swoop", emoji: "🦅", vibe: "The Eagles' mascot — gritty Philly energy, zero patience for doubters, bleeds midnight green. Confident about the Hurts-Barkley core, honest that the WR room changed after the A.J. Brown trade.", chips: ["Are we winning the East again?", "How's life after A.J.?", "Hype the Dallas games"] },
  dodgers: { name: "Blue", emoji: "🔵", vibe: "A smooth LA broadcast-booth analyst voice — classy, poetic about baseball, casually confident the way back-to-back champs get to be. Loves Ohtani theater and October baseball.", chips: ["Can we three-peat?", "Is this the best lineup ever?", "Who's our October X-factor?"] },
};

function TeamSchedule({ data, ui }) {
  if (!data) return null;
  return (
    <div style={{ color: ui.text }}>
      <div className="text-xs font-black tracking-[0.2em] mb-2 mt-4" style={{ color: ui.accentColor }}>📅 {data.title}</div>
      <div className="rounded-3xl p-3" style={ui.glass}>
        {data.games.map((g, i) => (
          <div key={i} className="flex items-center gap-2 py-1.5 text-sm border-b last:border-0" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
            <span className="text-xs font-black opacity-60 shrink-0" style={{ width: 78 }}>{g.date}</span>
            <span className="font-black flex-1">{g.ha} {g.opp}{g.tag && <span className="ml-1.5 font-black px-1.5 py-0.5 rounded-full align-middle" style={{ fontSize: 9, background: ui.accentColor, color: "#0c1226" }}>{g.tag.toUpperCase()}</span>}</span>
            <span className="text-xs opacity-55 shrink-0">{g.time}</span>
          </div>
        ))}
      </div>
      <div className="text-xs opacity-50 mt-1.5 text-center">{data.note}</div>
    </div>
  );
}

function TeamAnalyst({ teamKey, team, ui }) {
  const A = ANALYSTS[teamKey];
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  useEffect(() => { scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight); }, [msgs, loading]);
  if (!A) return null;
  const sched = (SCHEDULES[teamKey]?.games || []).map(g => `${g.date} ${g.ha} ${g.opp}`).join("; ");
  const system = `You are ${A.name}, AI analyst for the ${team.name}. Personality: ${A.vibe} Keep replies short (2-4 sentences), high-energy, family-friendly and clean (no profanity). Facts you know — record: ${team.record} (${team.recordLabel}); status: ${team.status}; key players: ${team.players.map(x => `${x.name} (${x.pos}, ${x.line})`).join("; ")}; storylines: ${team.notes.join(" | ")}.${sched ? ` Upcoming schedule: ${sched}.` : ""} Predictions are just for fun.`;
  const send = async (text = null) => {
    const qy = (text ?? input).trim(); if (!qy || loading) return;
    const next = [...msgs, { role: "user", content: qy }]; setMsgs(next); setInput(""); setLoading(true);
    try {
      const res = await fetch(apiUrl(), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "claude-sonnet-5", max_tokens: 1000, system, messages: next.map(m => ({ role: m.role, content: m.content })) }) });
      const data = await res.json();
      const txt = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("\n").trim() || "Static in the booth — run that by me again!";
      setMsgs(m => [...m, { role: "assistant", content: txt }]);
    } catch (e) { setMsgs(m => [...m, { role: "assistant", content: "Lost the feed for a second — try me again. " + A.emoji }]); }
    setLoading(false);
  };
  return (
    <div style={{ color: ui.text }}>
      <div className="text-xs font-black tracking-[0.2em] mb-2 mt-4" style={{ color: ui.accentColor }}>{A.emoji} TEAM ANALYST</div>
      {!open ? (
        <button onClick={() => setOpen(true)} className="btn-lift w-full rounded-3xl p-4 text-left" style={ui.glass}>
          <div className="font-black">{A.emoji} Talk to {A.name}</div>
          <div className="text-xs opacity-70 mt-0.5">Your live AI voice for the {team.name} — takes, breakdowns, hype.</div>
        </button>
      ) : (
        <div className="rounded-3xl p-3 flex flex-col" style={{ ...ui.glass, height: 420 }}>
          <div className="flex justify-between items-center mb-2">
            <div className="font-black text-sm">{A.emoji} {A.name}</div>
            <button onClick={() => setOpen(false)} className="btn-lift text-xs font-black px-2.5 py-1 rounded-full" style={{ background: ui.idleBtn, color: ui.text, border: ui.idleBorder }}>Close</button>
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1">
            {msgs.length === 0 && (
              <div className="flex flex-wrap gap-1.5">{A.chips.map(c => <button key={c} onClick={() => send(c)} className="btn-lift px-2.5 py-1.5 rounded-full text-xs font-bold" style={{ background: ui.idleBtn, color: ui.text, border: ui.idleBorder }}>{c}</button>)}</div>
            )}
            {msgs.map((m, i) => (
              <div key={i} className={"flex " + (m.role === "user" ? "justify-end" : "justify-start")}>
                <div className="max-w-[82%] rounded-2xl px-3 py-2 text-sm" style={m.role === "user" ? { ...ui.accentBg, fontWeight: 600 } : { background: "rgba(255,255,255,0.09)", border: "1px solid rgba(255,255,255,0.14)" }}>{m.role === "assistant" && <span className="mr-1">{A.emoji}</span>}{m.content}</div>
              </div>
            ))}
            {loading && <div className="text-xs opacity-70 animate-pulse">{A.emoji} thinking…</div>}
          </div>
          <div className="flex gap-2 mt-2">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder={`Ask ${A.name}…`} className="flex-1 px-3 py-2.5 rounded-full text-sm" style={{ background: "rgba(255,255,255,0.1)", color: ui.text, border: ui.idleBorder, outline: "none" }} />
            <button onClick={() => send()} disabled={loading} className="btn-lift px-4 py-2.5 rounded-full font-black text-sm" style={{ ...ui.accentBg, opacity: loading ? 0.6 : 1 }}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
}

function TeamPage({ team: p }) {
  const [playerOpen, setPlayerOpen] = useState(null);
  const retro = useContext(RetroCtx);
  const mark = markFor(p.key, retro);
  const glass = { background: "linear-gradient(155deg, rgba(255,255,255,0.13), rgba(0,0,0,0.34))", backdropFilter: "blur(13px)", WebkitBackdropFilter: "blur(13px)", border: "1px solid rgba(255,255,255,0.16)", boxShadow: "0 12px 34px rgba(0,0,0,0.4)" };
  const isWhite = p.accent === "#ffffff";
  const accentBg = { background: isWhite ? "linear-gradient(150deg,#ffffff,#eaf0ff)" : `linear-gradient(150deg, ${p.accent}, ${p.accent}cc)`, color: "#0c1226" };
  const valColor = isWhite ? "#ffffff" : p.accent;
  return (
    <div style={{ color: "#fff" }}>
      <div className="rounded-3xl p-6 mb-3 text-center relative overflow-hidden card-hover" style={accentBg}>
        {mark ? (
          <div className="mx-auto mb-2 flex items-center justify-center" style={{ width: 92, height: 92, borderRadius: 24, background: "rgba(255,255,255,0.94)", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 8px 22px rgba(0,0,0,0.22)" }}>
            <img src={mark} alt={p.name + " logo"} style={{ maxWidth: 72, maxHeight: 72, objectFit: "contain" }} />
          </div>
        ) : <div className="text-5xl mb-1">{p.emoji}</div>}
        <div className="text-2xl font-black" style={{ letterSpacing: "-0.5px" }}>{p.name}</div>
        <div className="text-xs font-black opacity-70 tracking-widest mt-0.5">{p.league} · {p.coach}</div>
        <div className="text-5xl font-black mt-3" style={{ letterSpacing: "-1px" }}>{p.record}</div>
        <div className="text-xs font-bold opacity-70">{p.recordLabel}</div>
      </div>
      <div className="rounded-2xl p-3 mb-3 text-sm text-center font-bold" style={glass}>{p.live ? "🟢 " : "🗓️ "}{p.status}</div>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {p.snapshot.map(s => <div key={s.label} className="rounded-2xl p-3 text-center card-hover" style={glass}><div className="text-xs font-black tracking-widest opacity-55">{s.label}</div><div className="text-xl font-black mt-1" style={{ color: valColor }}>{s.value}</div></div>)}
      </div>
      {DEEPSTATS[p.key] && (<>
        <div className="text-xs font-black tracking-[0.2em] opacity-55 mb-2">DEEP STATS</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
          {DEEPSTATS[p.key].map(st => (
            <div key={st.l} className="rounded-2xl p-3 card-hover" style={glass}>
              <div className="flex items-center gap-1.5 flex-wrap">
                <div className="text-lg font-black" style={{ color: valColor }}>{st.v}</div>
                {st.r && <span className="font-black px-1.5 py-0.5 rounded-full" style={{ fontSize: 10, background: valColor, color: "#0c1226" }}>{st.r}</span>}
              </div>
              <div className="text-xs font-black opacity-80">{st.l}</div>
              <div className="text-xs opacity-60">{st.s}</div>
            </div>
          ))}
        </div>
      </>)}
      <div className="text-xs font-black tracking-[0.2em] opacity-55 mb-2">KEY PLAYERS <span className="opacity-60 font-bold">· tap for live profile</span></div>
      <div className="flex flex-col gap-2 mb-4">
        {p.players.map(pl => <button key={pl.name} onClick={() => setPlayerOpen(pl.name)} className="rounded-2xl p-3 flex items-center gap-3 card-hover btn-lift text-left w-full" style={{ ...glass, color: "#fff" }}><div className="rounded-lg px-2 py-1 text-xs font-black shrink-0" style={accentBg}>{pl.pos}</div><div className="flex-1 min-w-0"><div className="font-black">{pl.name}</div><div className="text-xs opacity-75">{pl.line}</div></div><span className="text-xs opacity-45 shrink-0">→</span></button>)}
      </div>
      {playerOpen && <PlayerModal name={playerOpen} teamName={p.name} onClose={() => setPlayerOpen(null)} ui={{ accentColor: valColor }} />}
      <div className="text-xs font-black tracking-[0.2em] opacity-55 mb-2">THE LATEST</div>
      <div className="flex flex-col gap-2">
        {p.notes.map((n, i) => <div key={i} className="rounded-xl p-3 text-sm flex gap-2" style={glass}><span style={{ color: valColor }}>▸</span><span className="opacity-90">{n}</span></div>)}
      </div>
      {DEPTH[p.key] && (<>
        <div className="text-xs font-black tracking-[0.2em] opacity-55 mb-2 mt-4">ROSTER · DEPTH CHART</div>
        {DEPTH[p.key].map(g => (
          <div key={g.grp} className="rounded-3xl p-4 mb-2" style={glass}>
            <div className="text-xs font-black tracking-widest mb-2" style={{ color: valColor }}>{g.grp}</div>
            <div className="flex flex-col gap-1.5">
              {g.rows.map((r, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <div className="text-xs font-black w-12 shrink-0 opacity-65 pt-0.5">{r.pos}</div>
                  <div className="flex-1"><span className="font-black">{r.players[0]}</span>{r.players.length > 1 && <span className="opacity-60">{"  ·  " + r.players.slice(1).join("  ·  ")}</span>}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </>)}
      {MISSIONARIES[p.key] && (<>
        <div className="text-xs font-black tracking-[0.2em] opacity-55 mb-2 mt-4">RETURNING MISSIONARIES</div>
        {MISSIONARIES[p.key].map(m => (
          <div key={m.name} className="rounded-2xl p-3 mb-2" style={glass}>
            <div className="flex justify-between items-baseline gap-2"><div className="font-black">{m.name} <span className="text-xs font-bold opacity-70">{m.pos} · {"★".repeat(m.stars)}</span></div><div className="text-xs font-black px-2 py-0.5 rounded-full shrink-0" style={accentBg}>{m.ret}</div></div>
            <div className="text-xs opacity-80 mt-1">{m.info}</div>
          </div>
        ))}
        <div className="text-xs opacity-55 mb-1 text-center">Under Kevin Young, the returned-missionary pipeline is thin — Bahr is the first.</div>
      </>)}
      {LEADERSHIP[p.key] && (<>
        <div className="text-xs font-black tracking-[0.2em] opacity-55 mb-2 mt-4">FRONT OFFICE</div>
        <div className="rounded-3xl p-4 mb-2" style={glass}>
          {LEADERSHIP[p.key].map(([label, value]) => (
            <div key={label} className="mb-2 last:mb-0">
              <div className="text-xs font-black tracking-widest" style={{ color: valColor }}>{label.toUpperCase()}</div>
              <div className="text-sm font-bold">{value}</div>
            </div>
          ))}
        </div>
      </>)}
      <TeamSchedule data={SCHEDULES[p.key]} ui={{ glass, accentColor: valColor, text: "#fff" }} />
      <HonorsWall teamKey={p.key} ui={{ glass, accentColor: valColor, text: "#fff" }} />
      <Franchise data={FRANCHISE[p.key]} ui={{ glass, accentColor: valColor, text: "#fff" }} />
      <SeasonPredictor teamKey={p.key} teamName={p.name} ui={{ glass, accentBg, accentColor: valColor, text: "#fff", idleBtn: "rgba(255,255,255,0.12)", idleBorder: "1px solid rgba(255,255,255,0.25)", input: { background: "rgba(255,255,255,0.14)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)" } }} />
      <LivePickem teamKey={p.key} teamName={p.name} shortName={p.key === "byubball" ? "BYU" : p.name.split(" ").pop()} ui={{ glass, accentBg, accentColor: valColor, text: "#fff", idleBtn: "rgba(255,255,255,0.12)", idleBorder: "1px solid rgba(255,255,255,0.25)" }} />
      <TeamAnalyst teamKey={p.key} team={p} ui={{ glass, accentBg, accentColor: valColor, text: "#fff", idleBtn: "rgba(255,255,255,0.12)", idleBorder: "1px solid rgba(255,255,255,0.25)" }} />
      <TeamNews teamKey={p.key} teamName={p.name} ui={{ glass, accentBg, accentColor: valColor, text: "#fff", idleBtn: "rgba(255,255,255,0.12)", idleBorder: "1px solid rgba(255,255,255,0.25)" }} />
      <div className="text-xs opacity-45 mt-3 text-center">Rosters/depth charts current as of July 2026 — offseason moves may shift them. Starters listed first.</div>
    </div>
  );
}

const HOME_CARDS = [
  { key: "byufootball", emoji: "🏈", name: "BYU Football", league: "NCAA Football", record: "23–4", note: "last 2 seasons", c1: "#2A4FE0", accent: "#ffffff" },
  { key: "byubball", emoji: "🏀", name: "BYU Basketball", league: "NCAA Hoops", record: "23–12", note: "2025-26", c1: "#1f45c4", accent: "#ffffff" },
  { key: "jazz", emoji: "🎷", name: "Utah Jazz", league: "NBA", record: "22–60", note: "rebuild mode", c1: "#4a2a86", accent: "#7ec8f0" },
  { key: "mammoth", emoji: "🦣", name: "Utah Mammoth", league: "NHL", record: "43–33–6", note: "1st playoff berth", c1: "#123a5e", accent: "#6CACE4" },
  { key: "eagles", emoji: "🦅", name: "Philadelphia Eagles", league: "NFL", record: "11–6", note: "NFC East champs", c1: "#004c54", accent: "#A5ACAF" },
  { key: "dodgers", emoji: "⚾", name: "LA Dodgers", league: "MLB", record: "62–36", note: "1st NL West", c1: "#005a9c", accent: "#ffffff", live: true },
];

const SCORES_CACHE = { data: null, ts: 0 };
const WEEK_CACHE = { data: null, ts: 0 };

const cardOf = name => HOME_CARDS.find(c => c.name === name || name.includes(c.name.split(" ").pop()));

function ThisWeek({ glassH }) {
  const fresh = WEEK_CACHE.data && Date.now() - WEEK_CACHE.ts < 300000;
  const [games, setGames] = useState(fresh ? WEEK_CACHE.data : null);
  const [loading, setLoading] = useState(!fresh);
  const [err, setErr] = useState(false);
  const load = async () => {
    setLoading(true); setErr(false);
    try {
      const teamList = HOME_CARDS.map(c => c.name).join(", ");
      const res = await fetch(apiUrl(), {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-5", max_tokens: 3000, tools: [{ type: "web_search_20260209", name: "web_search" }], messages: [{ role: "user", content: `Search the web for scheduled games in the NEXT 7 DAYS for these teams: ${teamList}. Today is ${new Date().toDateString()}. Respond with ONLY a JSON array (no prose, no markdown) of {"team": string, "day": "Tue Aug 11", "opp": string, "ha": "vs" or "at", "time": string} sorted chronologically, using the exact team names I gave. Omit teams with no games this week. If none of the teams play, return [].` }] }),
      });
      const data = await res.json();
      const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("\n");
      let items = [];
      const m = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (m) { try { items = JSON.parse(m[0]); } catch (e2) {} }
      items = Array.isArray(items) ? items.slice(0, 14) : [];
      WEEK_CACHE.data = items; WEEK_CACHE.ts = Date.now();
      setGames(items);
    } catch (e) { setErr(true); }
    setLoading(false);
  };
  useEffect(() => { if (!fresh) load(); }, []);
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-black tracking-[0.2em] opacity-60">📅 THIS WEEK</div>
        <button onClick={load} disabled={loading} className="btn-lift rounded-full px-3 py-1.5 text-xs font-black" style={{ background: "#fff", color: ROYAL, opacity: loading ? 0.6 : 1 }}>{loading ? "Loading…" : "Refresh"}</button>
      </div>
      <div className="rounded-3xl p-3" style={glassH}>
        {loading && !games && <div className="text-xs opacity-70 p-2">Building the week's slate…</div>}
        {err && <div className="text-xs opacity-70 p-2">Couldn't load the week — try Refresh.</div>}
        {games && !games.length && !loading && <div className="text-xs opacity-70 p-2">Quiet week — none of your six teams have a game in the next 7 days.</div>}
        {(games || []).map((g, i) => (
          <div key={i} className="flex items-center gap-2.5 py-1.5 text-sm border-b last:border-0" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
            <TeamMarkByName name={g.team} size={20} />
            <span className="font-black shrink-0" style={{ width: 96 }}>{String(g.team || "").replace("Philadelphia ", "").replace("Los Angeles ", "LA ")}</span>
            <span className="opacity-85 flex-1 truncate">{g.ha === "at" ? "at" : "vs"} {g.opp}</span>
            <span className="text-xs opacity-60 shrink-0 text-right">{g.day}{g.time ? ` · ${g.time}` : ""}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const HOMENEWS_CACHE = { data: null, ts: 0 };

function HomeNews({ glassH }) {
  const fresh = HOMENEWS_CACHE.data && Date.now() - HOMENEWS_CACHE.ts < 300000;
  const [news, setNews] = useState(fresh ? HOMENEWS_CACHE.data : null);
  const [ts, setTs] = useState(fresh ? HOMENEWS_CACHE.ts : null);
  const [loading, setLoading] = useState(!fresh);
  const [err, setErr] = useState(false);
  const load = async () => {
    setLoading(true); setErr(false);
    try {
      const teamList = HOME_CARDS.map(c => c.name).join(", ");
      const res = await fetch(apiUrl(), {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-5", max_tokens: 3000, tools: [{ type: "web_search_20260209", name: "web_search" }], messages: [{ role: "user", content: `Search the web for the most recent notable news story for EACH of these teams: ${teamList}. Respond with ONLY a JSON array (no prose, no markdown) of up to 9 items: {"team": string using the exact team names I gave, "headline": string, "source": string, "url": string} — at least one item per team when news exists, newest first. Use real, current article URLs from your search results.` }] }),
      });
      const data = await res.json();
      const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("\n");
      let items = [];
      const m = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (m) { try { items = JSON.parse(m[0]); } catch (e2) {} }
      items = Array.isArray(items) ? items.slice(0, 9) : [];
      HOMENEWS_CACHE.data = items; HOMENEWS_CACHE.ts = Date.now();
      setNews(items); setTs(HOMENEWS_CACHE.ts);
    } catch (e) { setErr(true); }
    setLoading(false);
  };
  useEffect(() => { if (!fresh) load(); }, []);
  const stamp = ts ? new Date(ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : null;
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <div><div className="text-xs font-black tracking-[0.2em] opacity-60">📰 AROUND THE FANDOM</div>{stamp && <div className="text-xs opacity-45">Updated {stamp}</div>}</div>
        <button onClick={load} disabled={loading} className="btn-lift rounded-full px-3 py-1.5 text-xs font-black" style={{ background: "#fff", color: ROYAL, opacity: loading ? 0.6 : 1 }}>{loading ? "Loading…" : "Refresh"}</button>
      </div>
      <div className="rounded-3xl p-3" style={glassH}>
        {loading && !news && <div className="text-xs opacity-70 p-2">Gathering headlines across your six teams…</div>}
        {err && <div className="text-xs opacity-70 p-2">Couldn't load news right now — try Refresh.</div>}
        {news && !news.length && !loading && <div className="text-xs opacity-70 p-2">No fresh headlines found — try again in a bit.</div>}
        {(news || []).map((n, i) => {
          const inner = (
            <div className="flex items-start gap-2.5 py-2 border-b last:border-0" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
              <TeamMarkByName name={n.team} size={18} />
              <div className="flex-1 min-w-0">
                <div className="font-black text-sm leading-snug">{n.headline}</div>
                <div className="text-xs opacity-60 mt-0.5">{String(n.team || "").replace("Philadelphia ", "").replace("Los Angeles ", "LA ")}{n.source ? ` · ${n.source}` : ""}{n.url ? " ↗" : ""}</div>
              </div>
            </div>
          );
          return n.url ? <a key={i} href={n.url} target="_blank" rel="noopener noreferrer" className="block no-underline" style={{ color: "#fff" }}>{inner}</a> : <div key={i}>{inner}</div>;
        })}
      </div>
    </div>
  );
}

function compareData(key) {
  if (key === "byufootball") return { key, name: "BYU Football", emoji: "🏈", league: "NCAA · Big 12", coach: "HC Kalani Sitake", record: "12–2", recordLabel: "2025 season", status: "Preseason — opener Sept 5 vs Utah Tech", star: "Bear Bachmeier", starPos: "QB", starLine: "Big 12 Off. Freshman of the Year" };
  const t = TEAMS[key];
  return { key, name: t.name, emoji: t.emoji, league: t.league, coach: t.coach, record: t.record, recordLabel: t.recordLabel, status: t.status, star: t.players[0].name, starPos: t.players[0].pos, starLine: t.players[0].line };
}

function TeamCompare({ glassH }) {
  const [pair, setPair] = useStorage("sportshq_compare", { a: "byufootball", b: "jazz" });
  const keys = HOME_CARDS.map(c => c.key);
  const pickSide = (side, k) => setPair(p => ({ ...p, [side]: k }));
  const Side = ({ side }) => (
    <div className="flex gap-1 flex-wrap">
      {keys.map(k => { const c = HOME_CARDS.find(x => x.key === k); const on = pair[side] === k; return (
        <button key={k} onClick={() => pickSide(side, k)} title={c.name} className="btn-lift w-9 h-9 rounded-xl text-lg" style={on ? { background: "#fff", boxShadow: "0 0 14px rgba(150,175,255,0.6)" } : { background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.16)" }}><TeamMark teamKey={k} size={22} emoji={c.emoji} style={{ margin: "0 auto" }} /></button>
      ); })}
    </div>
  );
  const A = compareData(pair.a || "byufootball"), B = compareData(pair.b || "jazz");
  const rows = [
    ["RECORD", A.record + " · " + A.recordLabel.split(" ")[0], B.record + " · " + B.recordLabel.split(" ")[0]],
    ["LEAGUE", A.league, B.league],
    ["COACH", A.coach, B.coach],
    ["STAR", `${A.star} (${A.starPos})`, `${B.star} (${B.starPos})`],
    ["STATUS", A.status, B.status],
  ];
  return (
    <div className="mb-6">
      <div className="text-xs font-black tracking-[0.2em] opacity-60 mb-2">⚔️ HEAD TO HEAD</div>
      <div className="rounded-3xl p-4" style={glassH}>
        <div className="flex justify-between gap-3 mb-3 flex-wrap"><Side side="a" /><Side side="b" /></div>
        <div className="grid grid-cols-2 gap-2 mb-2">
          {[A, B].map((t, i) => (
            <div key={i} className="rounded-2xl p-3 text-center" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}>
              <TeamMark teamKey={t.key} size={38} emoji={t.emoji} style={{ margin: "0 auto" }} />
              <div className="font-black text-sm leading-tight mt-1">{t.name}</div>
              <div className="text-2xl font-black mt-1" style={{ color: "#8ea6ff" }}>{t.record}</div>
            </div>
          ))}
        </div>
        <div className="flex flex-col">
          {rows.map(([l, a, b]) => (
            <div key={l} className="grid items-center py-1.5 border-b last:border-0" style={{ gridTemplateColumns: "1fr 64px 1fr", borderColor: "rgba(255,255,255,0.08)" }}>
              <div className="text-xs opacity-90 pr-1">{a}</div>
              <div className="text-[10px] font-black tracking-widest opacity-50 text-center">{l}</div>
              <div className="text-xs opacity-90 pl-1 text-right">{b}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HomeHub({ setActive }) {
  const fresh = SCORES_CACHE.data && Date.now() - SCORES_CACHE.ts < 120000;
  const [scores, setScores] = useState(fresh ? SCORES_CACHE.data : null);
  const [ts, setTs] = useState(fresh ? SCORES_CACHE.ts : null);
  const [loading, setLoading] = useState(!fresh);
  const load = async () => {
    setLoading(true);
    try {
      const teamList = HOME_CARDS.map(c => c.name).join(", ");
      const res = await fetch(apiUrl(), {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-5", max_tokens: 3000, tools: [{ type: "web_search_20260209", name: "web_search" }], messages: [{ role: "user", content: `For each of these teams: ${teamList}. If the team has a game IN PROGRESS right now, give the current score plus the clock/quarter/period/inning. Otherwise, if their season is active, their most recent final score; otherwise their next scheduled game or the word "offseason". Respond with ONLY a JSON array (no prose, no markdown) of {"team": string, "line": string, "live": boolean} using the exact team names I gave — "live" is true ONLY for a game in progress right now.` }] }),
      });
      const data = await res.json();
      const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("\n");
      let parsed = [];
      const m = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (m) { try { parsed = JSON.parse(m[0]); } catch (e2) {} }
      const items = Array.isArray(parsed) ? parsed : [];
      SCORES_CACHE.data = items; SCORES_CACHE.ts = Date.now();
      setScores(items); setTs(SCORES_CACHE.ts);
    } catch (e) { setScores([]); }
    setLoading(false);
  };
  useEffect(() => { if (!fresh) load(); }, []);
  // Auto-refresh only while a game is actually live — quiet days make zero background calls.
  const anyLive = (scores || []).some(x => x && x.live);
  useEffect(() => { if (!anyLive) return; const t = setInterval(load, 120000); return () => clearInterval(t); }, [anyLive]);
  const stamp = ts ? new Date(ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : null;
  const glassH = { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.14)", boxShadow: "0 12px 30px rgba(0,0,0,0.4)" };
  const [favs, setFavs] = useStorage("sportshq_favs", []);
  const toggleFav = k => setFavs(f => f.includes(k) ? f.filter(x => x !== k) : [...f, k]);
  const cards = [...HOME_CARDS].sort((a, b) => Number(favs.includes(b.key)) - Number(favs.includes(a.key)));
  return (
    <div style={{ color: "#fff" }}>
      <div className="text-center mb-5">
        <div className="text-xs font-black tracking-[0.4em]" style={{ color: "#8ea6ff" }}>YOUR</div>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight" style={{ background: "linear-gradient(120deg,#ffffff,#8ea6ff)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>FANDOM FIVE</h1>
        <div className="text-xs opacity-70">Five fandoms · one command center</div>
      </div>

      <div className="flex items-center justify-between mb-2">
        <div><div className="text-xs font-black tracking-[0.2em] opacity-60">🔴 LIVE SCOREBOARD</div><div className="text-xs opacity-45">{stamp ? `Updated ${stamp} · ` : ""}{anyLive ? "game on — auto-refreshing every 2 min" : "auto-refresh paused · no live games"}</div></div>
        <button onClick={load} disabled={loading} className="btn-lift rounded-full px-3 py-1.5 text-xs font-black" style={{ background: "#fff", color: ROYAL, opacity: loading ? 0.6 : 1 }}>{loading ? "Loading…" : "Refresh"}</button>
      </div>
      <div className="rounded-3xl p-3 mb-6" style={glassH}>
        {loading && !scores && <div className="text-xs opacity-70 p-2">Pulling the latest scores…</div>}
        {(scores || []).map((x, i) => (
          <div key={i} className="flex items-center gap-2 py-1.5 text-sm border-b last:border-0" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
            <TeamMarkByName name={x.team} size={18} />
            <span className="font-black shrink-0" style={{ width: 96 }}>{String(x.team || "").replace("Philadelphia ", "").replace("Los Angeles ", "LA ").replace("Utah ", "")}</span>
            <span className="opacity-85 flex-1" style={x.live ? { fontWeight: 700 } : {}}>{x.line}</span>
            {x.live && <span className="animate-pulse font-black px-2 py-0.5 rounded-full shrink-0" style={{ fontSize: 10, background: "#ff5b4d", color: "#fff" }}>LIVE</span>}
          </div>
        ))}
        {scores && !scores.length && !loading && <div className="text-xs opacity-70 p-2">Couldn't load scores right now — try Refresh.</div>}
      </div>

      <ThisWeek glassH={glassH} />

      <div className="text-xs font-black tracking-[0.2em] opacity-60 mb-2">YOUR TEAMS{favs.length > 0 && <span className="opacity-60"> · ★ FIRST</span>}</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {cards.map(c => {
          const fav = favs.includes(c.key);
          return (
            <div key={c.key} role="button" tabIndex={0} onClick={() => setActive(c.key)} onKeyDown={e => e.key === "Enter" && setActive(c.key)} className="btn-lift rounded-3xl p-4 text-left relative overflow-hidden cursor-pointer" style={{ background: `linear-gradient(150deg, ${c.c1}, #05060e)`, border: fav ? "1px solid rgba(255,215,120,0.5)" : "1px solid rgba(255,255,255,0.14)", color: "#fff", boxShadow: fav ? "0 0 18px rgba(255,215,120,0.18)" : "none" }}>
              <div className="flex items-center gap-2">
                <TeamMark teamKey={c.key} size={30} emoji={c.emoji} />
                <div className="flex-1 min-w-0"><div className="font-black leading-tight">{c.name}</div><div className="text-xs opacity-70">{c.league}</div></div>
                {c.live && <span className="font-black px-2 py-0.5 rounded-full" style={{ fontSize: 10, background: "#ff5b4d", color: "#fff" }}>LIVE</span>}
                <span onClick={e => { e.stopPropagation(); toggleFav(c.key); }} title={fav ? "Unfavorite" : "Favorite"} className="btn-lift text-lg px-1 select-none" style={{ color: fav ? "#ffd778" : "rgba(255,255,255,0.35)" }}>★</span>
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <div className="text-2xl font-black" style={{ color: c.accent }}>{c.record}</div>
                <div className="text-xs opacity-70">{c.note}</div>
              </div>
              <div className="text-xs opacity-55 mt-1">Open {c.name} →</div>
            </div>
          );
        })}
      </div>

      <HomeNews glassH={glassH} />
      <TeamCompare glassH={glassH} />
      <div className="text-xs opacity-45 mt-4 text-center">The scoreboard auto-refreshes every 2 minutes only while a game is live; otherwise it loads once on open — use Refresh to check in. News and the weekly slate cache ~5 min. Tap ★ to pin favorites first.</div>
    </div>
  );
}

const COACHES_25 = [
  { team: "Ohio State", conf: "B1G", note: "38 of 66 first-place votes" },
  { team: "Oregon", conf: "B1G" },
  { team: "Georgia", conf: "SEC" },
  { team: "Texas", conf: "SEC", note: "Arch Manning's team now" },
  { team: "Notre Dame", conf: "IND", note: "In Provo Oct 17 🚨" },
  { team: "Indiana", conf: "B1G", note: "Defending national champs — 14 first-place votes" },
  { team: "Miami", conf: "ACC" },
  { team: "Texas A&M", conf: "SEC" },
  { team: "Oklahoma", conf: "SEC" },
  { team: "Ole Miss", conf: "SEC" },
  { team: "Alabama", conf: "SEC" },
  { team: "Texas Tech", conf: "B12", note: "The Big 12's top-ranked team — the Arlington rematch looms" },
  { team: "LSU", conf: "SEC" },
  { team: "USC", conf: "B1G" },
  { team: "BYU", conf: "B12", you: true, note: "No. 15 · 781 points — the coaches say prove it again" },
  { team: "Michigan", conf: "B1G" },
  { team: "Penn State", conf: "B1G" },
  { team: "Tennessee", conf: "SEC" },
  { team: "Washington", conf: "B1G" },
  { team: "SMU", conf: "ACC" },
  { team: "Utah", conf: "B12", note: "Holy War: Nov 7 in SLC" },
  { team: "Iowa", conf: "B1G" },
  { team: "Clemson", conf: "ACC" },
  { team: "Houston", conf: "B12", note: "Fourth Big 12 team in the poll" },
  { team: "Missouri", conf: "SEC" },
];
const POLLS = {
  // The official AP preseason poll drops Aug 17 — until then the AP tab carries a
  // projection mirroring the official Coaches Poll (released Aug 4).
  ap: COACHES_25.map(t => t.you ? { ...t, note: "Projected 15th — the real AP ballot lands Aug 17" } : t),
  coaches: COACHES_25,
};
const RANK_POOL = [...new Set([...POLLS.coaches.map(t => t.team), "Kansas State", "Florida", "Auburn", "Georgia Tech", "Nebraska", "Arizona", "Arizona State", "Iowa State", "Vanderbilt", "Boise State", "Louisville", "South Florida"])];

const POLL_CACHE = {};

function PollBoard({ kind, ui }) {
  const cfg = {
    ap: { title: "AP TOP 25", ask: "the current AP Top 25 college football poll for the 2026 season" },
    coaches: { title: "COACHES POLL", ask: "the current US LBM Coaches Poll college football top 25 for the 2026 season" },
    cfp: { title: "CFP RANKINGS", ask: "the current College Football Playoff committee top 25 rankings for the 2026 season. If the CFP committee has not released rankings yet this season, return []" },
  }[kind];
  const c0 = POLL_CACHE[kind];
  const fresh0 = c0 && Date.now() - c0.ts < 300000;
  const [live, setLive] = useState(fresh0 ? c0.items : null);
  const [ts, setTs] = useState(fresh0 ? c0.ts : null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(false);
  const [traj, setTraj] = useStorage("cfb_ap_traj", []);
  const load = async () => {
    setLoading(true); setErr(false);
    try {
      const res = await fetch(apiUrl(), {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-5", max_tokens: 3000, tools: [{ type: "web_search_20260209", name: "web_search" }], messages: [{ role: "user", content: `Search the web for ${cfg.ask}. Respond with ONLY a JSON array (no prose, no markdown) of {"rk": number, "team": string, "rec": string} for all 25 teams in order.` }] }),
      });
      const data = await res.json();
      const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("\n");
      let items = [];
      const m = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (m) { try { items = JSON.parse(m[0]); } catch (e2) {} }
      items = Array.isArray(items) ? items.slice(0, 25) : [];
      POLL_CACHE[kind] = { items, ts: Date.now() };
      setLive(items); setTs(Date.now());
      if (kind === "ap" && items.length) {
        const b = items.find(t => /byu|brigham/i.test(String(t.team || "")));
        const rk = b ? Number(b.rk) || items.indexOf(b) + 1 : 26;
        const d = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
        setTraj(tr => [...tr.filter(p => p.d !== d), { d, rk }].slice(-20));
      }
    } catch (e) { setErr(true); }
    setLoading(false);
  };
  const staticList = POLLS[kind];
  const rows = live && live.length ? live : staticList;
  const stamp = ts ? new Date(ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : null;
  const isByu = name => /byu|brigham/i.test(String(name || ""));
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="text-xs font-black tracking-widest" style={{ color: ui.green }}>{cfg.title}</div>
          <div className="text-xs opacity-55">{live && live.length ? `live · updated ${stamp}` : kind === "cfp" ? "committee hasn't convened" : kind === "coaches" ? "official preseason poll · Aug 4" : "projected · official AP drops Aug 17"}</div>
        </div>
        <button onClick={load} disabled={loading} className="btn-lift rounded-full px-3 py-1.5 text-xs font-black" style={{ ...ui.accentBg, opacity: loading ? 0.6 : 1 }}>{loading ? "Loading…" : "Check live"}</button>
      </div>
      {err && <div className="text-xs opacity-70 mb-2">Couldn't reach the polls — try again in a moment.</div>}
      {!rows && (
        <div className="rounded-2xl p-4 text-xs opacity-80" style={ui.glass}>
          <div className="font-black text-sm mb-1">Not released yet</div>
          The committee's first rankings drop in late October, once there's a season to judge. Tap "Check live" to see if they're out — until then, the AP and Coaches tabs have you covered.
        </div>
      )}
      {rows && (
        <div className="flex flex-col gap-1">
          {rows.map((t, i) => (
            <div key={(t.team || "") + i} className="flex items-center gap-2 rounded-xl px-2 py-1" style={isByu(t.team) ? { background: "rgba(125,223,135,0.14)" } : {}}>
              <div className="text-sm font-black w-7 shrink-0 text-center" style={{ color: isByu(t.team) ? ui.green : "#fff", opacity: isByu(t.team) ? 1 : 0.6 }}>{t.rk || i + 1}</div>
              <div className="flex-1 min-w-0">
                <div className="font-black text-sm truncate" style={isByu(t.team) ? { color: ui.green } : {}}>{t.team} {t.conf && <span className="text-[10px] font-black opacity-50">{t.conf}</span>}{t.rec && <span className="text-xs font-bold opacity-60 ml-1">{t.rec}</span>}</div>
                {t.note && <div className="text-xs opacity-65 truncate">{t.note}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
      {kind === "ap" && (
        <div className="mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <div className="text-xs font-black tracking-widest mb-1" style={{ color: ui.green }}>BYU RANKING TRAJECTORY</div>
          {(() => {
            const pts = [{ d: "Pre", rk: 15 }, ...traj];
            if (pts.length === 1) return <div className="text-xs opacity-60">Starts at the projected preseason No. 15 — every live AP check in-season adds a dot to the line automatically. Come back each week.</div>;
            const X = i => 16 + i * (268 / (pts.length - 1));
            const Y = r => 14 + ((Math.min(r, 26) - 1) / 25) * 54;
            return (
              <svg viewBox="0 0 300 92" style={{ width: "100%" }}>
                <polyline points={pts.map((p, i) => `${X(i)},${Y(p.rk)}`).join(" ")} fill="none" stroke={ui.green} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" opacity="0.85" />
                {pts.map((p, i) => (
                  <g key={i}>
                    <circle cx={X(i)} cy={Y(p.rk)} r="3.5" fill={ui.green} />
                    <text x={X(i)} y={Y(p.rk) - 7} textAnchor="middle" fontSize="9" fontWeight="800" fill="#fff">{p.rk > 25 ? "NR" : "#" + p.rk}</text>
                    <text x={X(i)} y={88} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.5)">{p.d}</text>
                  </g>
                ))}
              </svg>
            );
          })()}
        </div>
      )}
    </div>
  );
}

function MyRankings({ ui, mine, setMine }) {
  const apRank = name => { const i = POLLS.ap.findIndex(t => t.team === name); return i < 0 ? null : i + 1; };
  const move = (i, dir) => setMine(m => { const n = [...m]; const j = i + dir; if (j < 0 || j >= n.length) return m; [n[i], n[j]] = [n[j], n[i]]; return n; });
  const remove = i => setMine(m => m.filter((_, x) => x !== i));
  const add = t => setMine(m => m.length >= 25 || m.includes(t) ? m : [...m, t]);
  const pool = RANK_POOL.filter(t => !mine.includes(t));
  const btn = { background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.22)" };
  return (
    <div>
      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
        <div>
          <div className="text-xs font-black tracking-widest" style={{ color: ui.green }}>MY TOP 25</div>
          <div className="text-xs opacity-55">{mine.length}/25 ranked · deltas vs projected AP</div>
        </div>
        <div className="flex gap-1.5">
          <button onClick={() => setMine(POLLS.ap.map(t => t.team))} className="btn-lift rounded-full px-3 py-1.5 text-xs font-black" style={ui.accentBg}>Start from AP</button>
          {mine.length > 0 && <button onClick={() => setMine([])} className="btn-lift rounded-full px-3 py-1.5 text-xs font-black" style={btn}>Clear</button>}
        </div>
      </div>
      {mine.length === 0 && <div className="rounded-2xl p-3 text-xs opacity-75 mb-2" style={ui.glass}>Blank ballot. Seed it from the AP poll and tweak, or build it from scratch with the team chips below.</div>}
      <div className="flex flex-col gap-1 mb-3">
        {mine.map((t, i) => {
          const ap = apRank(t); const d = ap === null ? null : ap - (i + 1);
          return (
            <div key={t} className="flex items-center gap-2 rounded-xl px-2 py-1" style={/byu/i.test(t) ? { background: "rgba(125,223,135,0.14)" } : {}}>
              <div className="text-sm font-black w-7 shrink-0 text-center" style={{ color: /byu/i.test(t) ? ui.green : "#fff", opacity: /byu/i.test(t) ? 1 : 0.6 }}>{i + 1}</div>
              <div className="flex-1 min-w-0 font-black text-sm truncate" style={/byu/i.test(t) ? { color: ui.green } : {}}>{t}</div>
              <div className="text-[10px] font-black w-12 text-right shrink-0" style={{ color: d === null ? "rgba(255,255,255,0.4)" : d > 0 ? "#7ddf87" : d < 0 ? "#ff8a80" : "rgba(255,255,255,0.4)" }}>{d === null ? "AP NR" : d > 0 ? `▲${d}` : d < 0 ? `▼${-d}` : "= AP"}</div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => move(i, -1)} disabled={i === 0} className="btn-lift w-7 h-7 rounded-lg text-xs font-black" style={{ ...btn, opacity: i === 0 ? 0.3 : 1 }}>▲</button>
                <button onClick={() => move(i, 1)} disabled={i === mine.length - 1} className="btn-lift w-7 h-7 rounded-lg text-xs font-black" style={{ ...btn, opacity: i === mine.length - 1 ? 0.3 : 1 }}>▼</button>
                <button onClick={() => remove(i)} className="btn-lift w-7 h-7 rounded-lg text-xs font-black" style={btn}>✕</button>
              </div>
            </div>
          );
        })}
      </div>
      {mine.length < 25 ? (
        <div>
          <div className="text-xs font-black opacity-60 mb-1.5">ADD TEAMS</div>
          <div className="flex flex-wrap gap-1.5">
            {pool.map(t => <button key={t} onClick={() => add(t)} className="btn-lift px-2.5 py-1 rounded-full text-xs font-bold" style={btn}>+ {t}</button>)}
          </div>
        </div>
      ) : <div className="text-xs opacity-60 text-center">Ballot full — 25 of 25. Ship it to the committee.</div>}
      <div className="text-xs opacity-50 mt-3 text-center">Saved automatically. ▲ means you're higher on them than the AP voters; nobody has ever been fired for ranking BYU too high.</div>
    </div>
  );
}

const SB_CACHE = { data: null, ts: 0 };

function CFBScoreboard({ ui }) {
  const fresh = SB_CACHE.data && Date.now() - SB_CACHE.ts < 300000;
  const [games, setGames] = useState(fresh ? SB_CACHE.data : null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(false);
  const load = async () => {
    setLoading(true); setErr(false);
    try {
      const res = await fetch(apiUrl(), {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-5", max_tokens: 3000, tools: [{ type: "web_search_20260209", name: "web_search" }], messages: [{ role: "user", content: `Search the web for the most recent week of 2026 college football final scores involving AP Top 25 teams. Respond with ONLY a JSON array (no prose, no markdown), up to 14 items: {"matchup": string like "#3 Texas at #1 Ohio State", "score": string like "Ohio State 31, Texas 24", "note": string — "UPSET" if a lower-ranked or unranked team won, otherwise "" }. If the season hasn't started and there are no results yet, return [].` }] }),
      });
      const data = await res.json();
      const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("\n");
      let items = [];
      const m = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (m) { try { items = JSON.parse(m[0]); } catch (e2) {} }
      items = Array.isArray(items) ? items.slice(0, 14) : [];
      SB_CACHE.data = items; SB_CACHE.ts = Date.now();
      setGames(items);
    } catch (e) { setErr(true); }
    setLoading(false);
  };
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-black tracking-[0.2em] opacity-60">🏟 TOP 25 SCOREBOARD</div>
        <button onClick={load} disabled={loading} className="btn-lift rounded-full px-3 py-1.5 text-xs font-black" style={{ ...ui.accentBg, opacity: loading ? 0.6 : 1 }}>{loading ? "Loading…" : games ? "Refresh" : "Load scores"}</button>
      </div>
      <div className="rounded-3xl p-3" style={ui.glass}>
        {err && <div className="text-xs opacity-70 p-2">Couldn't load the scoreboard — try again in a moment.</div>}
        {!games && !loading && !err && <div className="text-xs opacity-70 p-2">Every Top 25 result from the latest week, one tap away. First scoreboard lands with Week 0 on Aug 29.</div>}
        {loading && !games && <div className="text-xs opacity-70 p-2">Collecting the week's finals…</div>}
        {games && !games.length && !loading && <div className="text-xs opacity-70 p-2">No results yet — the season hasn't kicked off. Check back Aug 29.</div>}
        {(games || []).map((g, i) => (
          <div key={i} className="flex items-center gap-2 py-1.5 border-b last:border-0" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
            <div className="flex-1 min-w-0">
              <div className="text-xs opacity-65 truncate">{g.matchup}</div>
              <div className="font-black text-sm truncate">{g.score}</div>
            </div>
            {g.note && <span className="text-[10px] font-black px-2 py-0.5 rounded-full shrink-0" style={{ background: "#ff5b4d", color: "#fff" }}>🚨 {g.note}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

function BracketPredictor({ ui, ballot }) {
  const usingBallot = ballot.length >= 12;
  const seeds = (usingBallot ? ballot : POLLS.ap.map(t => t.team)).slice(0, 12);
  const [bp, setBp] = useStorage("cfb_bracket", {});
  const s = i => seeds[i - 1];
  const seedOf = t => seeds.indexOf(t) + 1;
  const w = (id, pair) => { const v = bp[id]; return v && pair.includes(v) ? v : null; };
  const m1 = [s(8), s(9)], m2 = [s(5), s(12)], m3 = [s(6), s(11)], m4 = [s(7), s(10)];
  const q1 = [s(1), w("m1", m1)], q2 = [s(4), w("m2", m2)], q3 = [s(3), w("m3", m3)], q4 = [s(2), w("m4", m4)];
  const s1 = [w("q1", q1), w("q2", q2)], s2 = [w("q3", q3), w("q4", q4)];
  const f = [w("s1", s1), w("s2", s2)];
  const champ = w("f", f);
  const pick = (id, team) => setBp(b => ({ ...b, [id]: team }));
  const Matchup = ({ id, pair, bye = null }) => (
    <div className="rounded-2xl p-2 flex flex-col gap-1.5" style={ui.glass}>
      {pair.map((t, i) => {
        const on = t && bp[id] === t && pair.includes(bp[id]);
        const byu = t && /byu/i.test(t);
        return (
          <button key={i} disabled={!t} onClick={() => t && pick(id, t)} className="btn-lift w-full px-2.5 py-2 rounded-xl text-left text-sm font-black flex items-center gap-2" style={on ? ui.accentBg : { background: "rgba(255,255,255,0.07)", color: t ? (byu ? ui.green : "#fff") : "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.14)" }}>
            {t ? <><span className="text-[10px] opacity-60 w-5">{seedOf(t) || ""}</span><span className="truncate">{t}</span>{bye === i && <span className="text-[9px] font-black ml-auto opacity-55">BYE</span>}</> : <span className="opacity-60 text-xs">Winner TBD</span>}
          </button>
        );
      })}
    </div>
  );
  const Round = ({ title, sub = null, children }) => (
    <div className="mb-3">
      <div className="flex items-baseline gap-2 mb-1.5"><span className="text-xs font-black tracking-widest" style={{ color: ui.green }}>{title}</span>{sub && <span className="text-[10px] opacity-50">{sub}</span>}</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{children}</div>
    </div>
  );
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
        <div>
          <div className="text-xs font-black tracking-[0.2em] opacity-60">🏆 PLAYOFF BRACKET PREDICTOR</div>
          <div className="text-xs opacity-55">seeds from {usingBallot ? "your Top 25 ballot" : "the projected AP (build a 12+ team ballot to take over)"}</div>
        </div>
        {Object.keys(bp).length > 0 && <button onClick={() => setBp({})} className="btn-lift rounded-full px-3 py-1.5 text-xs font-black" style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.22)" }}>Reset</button>}
      </div>
      <div className="rounded-3xl p-4" style={ui.glassDeep || ui.glass}>
        <Round title="FIRST ROUND" sub="campus sites · Dec 18–19"><Matchup id="m1" pair={m1} /><Matchup id="m2" pair={m2} /><Matchup id="m3" pair={m3} /><Matchup id="m4" pair={m4} /></Round>
        <Round title="QUARTERFINALS" sub="New Year's bowls"><Matchup id="q1" pair={q1} bye={0} /><Matchup id="q2" pair={q2} bye={0} /><Matchup id="q3" pair={q3} bye={0} /><Matchup id="q4" pair={q4} bye={0} /></Round>
        <Round title="SEMIFINALS"><Matchup id="s1" pair={s1} /><Matchup id="s2" pair={s2} /></Round>
        <Round title="NATIONAL CHAMPIONSHIP" sub="Jan 18, 2027"><Matchup id="f" pair={f} /></Round>
        {champ && (
          <div className="rounded-3xl p-4 text-center relative overflow-hidden mt-1" style={{ ...ui.accentBg }}>
            <div className="shine" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
            <div className="text-xs font-black tracking-[0.2em] opacity-70 relative">YOUR NATIONAL CHAMPION</div>
            <div className="text-3xl font-black relative">{champ} 🏆</div>
            {/byu/i.test(champ) && <div className="text-xs font-black mt-1 relative">Correct answer. Rise and Shout.</div>}
          </div>
        )}
      </div>
      <div className="text-xs opacity-50 mt-2 text-center">Straight seeding, top four byes. Picks save automatically; reseeding your ballot keeps every pick that's still valid.</div>
    </div>
  );
}

const CFB = {
  sched: [
    { m: "AUGUST", games: [
      { date: "Sat 8/29", matchup: "Week 0 — the season returns", time: "10:00 AM", tv: "multiple", note: "Ireland games and appetizers before the feast" },
    ] },
    { m: "SEPTEMBER", games: [
      { date: "Sat 9/5", matchup: "Ohio State vs Texas", time: "10:00 AM", tv: "FOX", note: "No. 1 vs No. 3 to open the season" },
      { date: "Sat 9/5", matchup: "BYU vs Utah Tech", time: "6:00 PM", tv: "ESPN+", note: "The Cougars open under the lights in Provo", you: true },
      { date: "Sat 9/12", matchup: "Arizona at BYU", time: "1:30 PM", tv: "FOX", note: "Big 12 play opens in LaVell", you: true },
      { date: "Sat 9/26", matchup: "Georgia at Alabama", time: "5:30 PM", tv: "ABC", note: "The SEC's heavyweight bout" },
    ] },
    { m: "OCTOBER", games: [
      { date: "Sat 10/3", matchup: "Texas vs Oklahoma", time: "1:30 PM", tv: "ABC", note: "Red River — fair week in Dallas" },
      { date: "Fri 10/9", matchup: "Iowa State at BYU", time: "8:15 PM", tv: "ESPN", note: "Friday night lights in Provo", you: true },
      { date: "Sat 10/17", matchup: "Notre Dame at BYU", time: "TBA", tv: "TBA", note: "The Irish in LaVell. The one you circled.", marquee: true },
      { date: "Sat 10/31", matchup: "Arizona State at BYU", time: "TBA", tv: "TBA", note: "Halloween in Provo", you: true },
    ] },
    { m: "NOVEMBER", games: [
      { date: "Sat 11/7", matchup: "BYU at Utah", time: "TBA", tv: "TBA", note: "The Holy War, now with Big 12 stakes", marquee: true },
      { date: "Sat 11/28", matchup: "Ohio State at Michigan", time: "10:00 AM", tv: "FOX", note: "The Game. Enough said." },
    ] },
    { m: "DECEMBER & BEYOND", games: [
      { date: "Sat 12/5", matchup: "Big 12 Championship", time: "10:00 AM", tv: "ABC", note: "AT&T Stadium, Arlington — the one BYU wants back", marquee: true },
      { date: "Fri 12/18", matchup: "CFP First Round begins", time: "varies", tv: "TNT · ABC", note: "Playoff football on campus" },
      { date: "Mon 1/18", matchup: "National Championship", time: "5:30 PM", tv: "ESPN", note: "One team leaves happy" },
    ] },
  ],
  heisman: [
    { name: "Arch Manning", team: "Texas · QB", pct: 92, line: "The favorite until further notice" },
    { name: "Jeremiah Smith", team: "Ohio State · WR", pct: 78, line: "Best player in the sport, any position" },
    { name: "Bear Bachmeier", team: "BYU · QB", pct: 60, line: "The sophomore leap could make history", you: true },
    { name: "LJ Martin", team: "BYU · RB", pct: 42, line: "Big 12 OPOY runs it back", you: true },
    { name: "The Field", team: "Everyone else", pct: 30, line: "September always produces a crasher" },
  ],
  confs: [
    { name: "SEC", pct: 94, note: "Depth for days" },
    { name: "Big Ten", pct: 92, note: "Top-heavy titans" },
    { name: "Big 12", pct: 78, note: "Chaos league — and BYU's league", you: true },
    { name: "ACC", pct: 70, note: "Clemson, Miami and the pack" },
    { name: "Group of 5", pct: 45, note: "One auto-bid, all gas" },
  ],
};

function CFBHub({ setActive }) {
  const glass = { background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", boxShadow: "0 12px 30px rgba(0,0,0,0.4)" };
  const glassDeep = { background: "linear-gradient(155deg, rgba(16,60,34,0.85), rgba(3,14,8,0.9))", border: "1px solid rgba(255,255,255,0.14)", boxShadow: "0 12px 34px rgba(0,0,0,0.5)" };
  const accentBg = { background: "linear-gradient(150deg,#7ddf87,#3ba55d)", color: "#052012" };
  const green = "#7ddf87";
  const barTrack = "rgba(255,255,255,0.13)";
  const barFill = "linear-gradient(90deg,#b8f5be,#3ba55d)";
  const ui = { glass, accentBg, accentColor: green, text: "#fff" };
  const pollUi = { glass, glassDeep, accentBg, green };
  const [poll, setPoll] = useState("ap");
  const [myrank, setMyrank] = useStorage("cfb_myrank", []);
  const CD = {
    cfb: { label: "COLLEGE FOOTBALL RETURNS IN", date: "2026-08-29T10:00:00-06:00", sub: "Week 0 · Sat Aug 29 · first kicks at 10:00 AM MT" },
    byu: { label: "BYU KICKS OFF IN", date: "2026-09-05T18:00:00-06:00", sub: "Sept 5 vs Utah Tech · 6:00 PM MT · LaVell Edwards Stadium" },
  };
  const [cdKey, setCdKey] = useState("cfb");
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const cd = CD[cdKey];
  const diff = Math.max(0, new Date(cd.date).getTime() - now);
  const units = [["DAYS", Math.floor(diff / 86400000)], ["HRS", Math.floor((diff % 86400000) / 3600000)], ["MIN", Math.floor((diff % 3600000) / 60000)], ["SEC", Math.floor((diff % 60000) / 1000)]];
  return (
    <div style={{ color: "#fff" }}>
      <div className="text-center mb-5">
        <div className="text-xs font-black tracking-[0.4em]" style={{ color: green }}>2026 SEASON</div>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight" style={{ background: "linear-gradient(120deg,#ffffff,#7ddf87)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>CFB HUB</h1>
        <div className="text-xs opacity-70">The national picture · the road to the Playoff</div>
      </div>
      <div className="rounded-3xl p-5 mb-4 text-center relative overflow-hidden card-hover" style={accentBg}>
        <div className="shine" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
        <div className="flex justify-center gap-2 mb-3 relative">
          {[["cfb", "🏈 WEEK 0"], ["byu", "🔵 BYU OPENER"]].map(([k, l]) => (
            <button key={k} onClick={() => setCdKey(k)} className="btn-lift px-3 py-1.5 rounded-full text-xs font-black" style={cdKey === k ? { background: "#052012", color: "#7ddf87" } : { background: "rgba(5,32,18,0.15)", color: "#052012", border: "1px solid rgba(5,32,18,0.35)" }}>{l}</button>
          ))}
        </div>
        <div className="text-xs font-black tracking-[0.2em] opacity-70 relative">{cd.label}</div>
        <div className="flex justify-center gap-2 my-2 relative">
          {units.map(([l, v]) => (
            <div key={l} className="text-center">
              <div className="flex items-center justify-center font-black tabular-nums mx-auto" style={{ width: 58, height: 62, fontSize: 26, borderRadius: 14, background: "#052012", color: "#7ddf87", borderTop: "2px solid rgba(125,223,135,0.55)" }}>{String(v).padStart(2, "0")}</div>
              <div className="text-[10px] font-black tracking-widest mt-1 opacity-70">{l}</div>
            </div>
          ))}
        </div>
        <div className="text-xs font-black opacity-75 relative">{cd.sub}</div>
      </div>

      <CFBScoreboard ui={pollUi} />

      <div className="text-xs font-black tracking-[0.2em] opacity-60 mb-2">THE POLLS</div>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-1">
        {[["ap", "AP Top 25"], ["coaches", "Coaches Poll"], ["cfp", "CFP Rankings"], ["mine", "📝 My Top 25"]].map(([k, l]) => (
          <button key={k} onClick={() => setPoll(k)} className="btn-lift px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap shrink-0" style={poll === k ? accentBg : { background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.22)" }}>{l}</button>
        ))}
      </div>
      <div className="rounded-3xl p-4 mb-2" style={glassDeep}>
        {poll === "mine" ? <MyRankings ui={pollUi} mine={myrank} setMine={setMyrank} /> : <PollBoard key={poll} kind={poll} ui={pollUi} />}
      </div>
      <div className="text-xs opacity-50 mb-4 text-center">Coaches Poll is the official Aug 4 preseason ballot; the AP tab is a projection until the real one drops Aug 17 — "Check live" pulls the current poll any time. CFP rankings arrive late October. Your ballot is yours alone.</div>

      <BracketPredictor ui={pollUi} ballot={myrank} />

      <div className="text-xs font-black tracking-[0.2em] opacity-60 mb-2">SEASON OUTLINE · GAMES OF THE YEAR <span style={{ opacity: 0.6 }}>· TIMES MT</span></div>
      <div className="flex flex-col gap-3 mb-4">
        {CFB.sched.map(mo => (
          <div key={mo.m}>
            <div className="flex items-center gap-2 mb-1.5"><span className="text-xs font-black tracking-widest" style={{ color: green }}>{mo.m}</span><span className="flex-1" style={{ height: 1, background: "rgba(255,255,255,0.12)" }} /></div>
            <div className="flex flex-col gap-2">
              {mo.games.map(g => (
                <div key={g.date + g.matchup} className="rounded-2xl p-3 card-hover relative overflow-hidden" style={g.marquee ? { ...glass, boxShadow: "0 0 20px rgba(125,223,135,0.35)", border: "1px solid rgba(125,223,135,0.4)" } : glass}>
                  {g.marquee && <div className="shine" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />}
                  <div className="flex items-center gap-2 flex-wrap relative">
                    <span className="text-xs font-black px-2 py-0.5 rounded-full" style={g.you || g.marquee ? accentBg : { background: "rgba(255,255,255,0.12)", color: "#fff" }}>{g.date}</span>
                    <span className="font-black text-sm">{g.matchup}{g.marquee ? " ★" : ""}</span>
                    <span className="text-xs font-black ml-auto shrink-0" style={{ color: g.time === "TBA" ? "rgba(255,255,255,0.45)" : green }}>{g.time === "TBA" ? "Time & TV TBA" : `${g.time} · ${g.tv}`}</span>
                  </div>
                  <div className="text-xs opacity-75 mt-1 relative">{g.note}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="text-xs font-black tracking-[0.2em] opacity-60 mb-2">HEISMAN BUZZ METER</div>
      <div className="rounded-3xl p-4 mb-4" style={glassDeep}>
        <div className="flex flex-col gap-2">
          {CFB.heisman.map(h => (
            <div key={h.name}>
              <div className="flex justify-between items-baseline mb-0.5">
                <div className="text-sm font-black" style={h.you ? { color: green } : {}}>{h.name} <span className="text-[10px] font-bold opacity-55">{h.team}</span></div>
              </div>
              <div className="h-4 rounded-full overflow-hidden" style={{ background: barTrack }}>
                <div className="h-full rounded-full" style={{ width: `${h.pct}%`, background: h.you ? "linear-gradient(90deg,#fff,#7ddf87)" : barFill, boxShadow: h.you ? "0 0 12px rgba(125,223,135,0.7)" : "none" }} />
              </div>
              <div className="text-xs opacity-60 mt-0.5">{h.line}</div>
            </div>
          ))}
        </div>
        <div className="text-xs opacity-50 mt-2 text-center">Buzz, not betting odds. Cougar entries may be slightly inflated. We stand by it.</div>
      </div>

      <div className="text-xs font-black tracking-[0.2em] opacity-60 mb-2">CONFERENCE POWER METER</div>
      <div className="rounded-3xl p-4 mb-4" style={glass}>
        <div className="flex flex-col gap-1.5">
          {CFB.confs.map(c => (
            <div key={c.name} className="flex items-center gap-2">
              <div className="text-xs font-black w-20 shrink-0" style={c.you ? { color: green } : {}}>{c.name}</div>
              <div className="flex-1 h-5 rounded-full overflow-hidden" style={{ background: barTrack }}>
                <div className="h-full rounded-full" style={{ width: `${c.pct}%`, background: barFill, boxShadow: c.you ? "0 0 12px rgba(125,223,135,0.6)" : "none" }} />
              </div>
              <div className="text-xs opacity-60 w-40 shrink-0 truncate hidden sm:block">{c.note}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-xs font-black tracking-[0.2em] opacity-60 mb-2">THE PLAYOFF, EXPLAINED</div>
      <div className="rounded-3xl p-4 mb-2" style={glassDeep}>
        <div className="text-sm opacity-90 leading-relaxed mb-2">Twelve teams: the five highest-ranked conference champions plus seven at-larges, straight seeding, first-round byes for the top four. Win the Big 12 and BYU is dancing — likely with a bye in reach. Miss in Arlington and it's an at-large resume fight, where 10+ wins and the Notre Dame result loom large.</div>
        <button onClick={() => setActive("byufootball")} className="btn-lift w-full py-3 rounded-full font-black text-sm" style={accentBg}>🎲 PRICE BYU'S PATH IN THE SIMULATOR →</button>
      </div>
      <div className="text-xs opacity-50 mb-4 text-center">The Simulator tab (BYU FB → 🎲) runs the full Big 12 race 10,000 times.</div>

      <TeamNews teamKey="cfb" teamName="college football" ui={ui} />
      <div className="text-xs opacity-45 mt-3 text-center">National board, games and buzz are preseason fun — the news feed below is live.</div>
    </div>
  );
}

export default function FandomFive() {
  const [active, setActive] = useStorage("sportshq_team", "home");
  const [retro, setRetro] = useStorage("sportshq_retro", false);
  const order = ["home", "cfb", "byufootball", "byubball", "jazz", "mammoth", "eagles", "dodgers"];
  const baseCur = TEAMS[active] || TEAMS.byufootball;
  const cur = retro && RETRO_COLORS[active] ? { ...baseCur, ...RETRO_COLORS[active] } : baseCur;
  const teamBg = active === "byufootball" ? null : active === "home" ? "linear-gradient(180deg, #0a1030 0%, #070a1a 60%, #05060e 100%)" : `linear-gradient(180deg, ${cur.c1} 0%, ${cur.c2} 55%, #05060e 100%)`;
  const watermark = teamBg ? markFor(active, retro) : null;
  return (
    <RetroCtx.Provider value={!!retro}>
    <div className="min-h-screen w-full relative" style={{ fontFamily: "system-ui, sans-serif", background: teamBg || "#05060e" }}>
      <style>{`
        .btn-lift{transition:transform .14s ease,filter .2s ease,box-shadow .2s ease}
        .btn-lift:hover{filter:brightness(1.08);transform:translateY(-1px)}
        .btn-lift:active{transform:scale(.97)}
        .card-hover{transition:transform .2s ease,box-shadow .2s ease}
        .card-hover:hover{transform:translateY(-3px)}
        ::-webkit-scrollbar{width:8px;height:8px}
        ::-webkit-scrollbar-thumb{background:rgba(128,128,160,.35);border-radius:8px}
        @keyframes teamin{from{opacity:0;transform:translateY(12px) scale(.98)}to{opacity:1;transform:none}}
        @keyframes fadein{from{opacity:0}to{opacity:1}}
      `}</style>
      {teamBg && <div style={{ position: "fixed", inset: 0, zIndex: 0, background: teamBg }} />}
      {teamBg && <div style={{ position: "fixed", top: "24%", left: "-12%", width: 400, height: 400, background: `radial-gradient(circle, ${cur.accent}55, transparent 70%)`, filter: "blur(55px)", zIndex: 0, pointerEvents: "none" }} />}
      {watermark && <img key={active + (retro ? "-r" : "")} src={watermark} alt="" aria-hidden="true" style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "min(82vw, 540px)", maxHeight: "60vh", objectFit: "contain", opacity: 0.07, zIndex: 0, pointerEvents: "none", animation: "teamin .6s ease" }} />}

      <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 70, background: "rgba(6,10,22,0.85)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
        <div className="max-w-2xl mx-auto px-3 py-2 flex items-center gap-1.5 sm:gap-2 overflow-x-auto">
          <span className="hidden sm:inline text-xs font-black tracking-widest shrink-0 mr-1" style={{ color: "#fff" }}>FANDOM FIVE</span>
          {order.map(k => { const home = k === "home"; const t = TEAMS[k]; const on = active === k; const em = home ? "🏠" : t.tab.split(" ")[0]; const lbl = home ? "Home" : t.tab.split(" ").slice(1).join(" "); return <button key={k} onClick={() => setActive(k)} title={home ? "Home" : t.name} className="btn-lift px-2.5 sm:px-3 py-1.5 rounded-full text-sm sm:text-xs font-black whitespace-nowrap shrink-0" style={on ? { background: "#fff", color: "#12193a" } : { background: "rgba(255,255,255,0.12)", color: "#fff", border: "1px solid rgba(255,255,255,0.25)" }}>{home ? <span>{em}</span> : <TeamMark teamKey={k} size={18} emoji={em} style={{ display: "inline-block", verticalAlign: "-4px" }} />}{lbl && <span className="hidden sm:inline sm:ml-1">{lbl}</span>}</button>; })}
          <button onClick={() => setRetro(r => !r)} title="Throwback mode — vintage logos and colors for BYU, the Eagles and the Jazz" aria-pressed={!!retro} className="btn-lift px-2.5 py-1.5 rounded-full text-sm sm:text-xs font-black shrink-0 ml-auto" style={retro ? { background: "#ffd75a", color: "#12193a", boxShadow: "0 0 14px rgba(255,215,90,0.5)" } : { background: "rgba(255,255,255,0.12)", color: "#fff", border: "1px solid rgba(255,255,255,0.25)" }}>🕰<span className="hidden sm:inline sm:ml-1">{retro ? "Retro ON" : "Retro"}</span></button>
        </div>
      </div>

      <div style={{ paddingTop: 50, position: "relative", zIndex: 1 }}>
        {active === "byufootball" ? <BYUFootballHQ /> : (
          <div key={active} className="max-w-2xl mx-auto px-4 pb-16 pt-4" style={{ animation: "teamin .4s cubic-bezier(.2,.7,.2,1)" }}>
            {active === "home" ? <HomeHub setActive={setActive} /> : active === "cfb" ? <CFBHub setActive={setActive} /> : <TeamPage team={cur} />}
          </div>
        )}
      </div>
    </div>
    </RetroCtx.Provider>
  );
}

const MISSIONARIES = {
  byufootball: [
    { name: "Ryder Lyons", pos: "QB", stars: 4, ret: "2027", info: "Former 5-star and prized QB of the record 2026 class; serving a 12-month mission in Orlando, FL." },
    { name: "Brock Harris", pos: "TE", stars: 4, ret: "2027", info: "One of the highest-rated recruits in BYU history (top-140 national); serving in Spokane, WA." },
    { name: "Ryner Swanson", pos: "TE", stars: 4, ret: "2027", info: "Played as a true freshman in 2024 before his mission; back after the 2026 season." },
    { name: "Adam Bywater", pos: "LB", stars: 4, ret: "2027–28", info: "Olympus (UT) standout and younger brother of former BYU LB Ben Bywater." },
    { name: "Ty Goettsche", pos: "TE", stars: 4, ret: "2027–28", info: "The top-rated player in Colorado's 2026 class; part of a loaded future TE room." },
    { name: "Lopeti Moala", pos: "Edge", stars: 4, ret: "2027–28", info: "Disruptive edge rusher out of Orem, UT." },
    { name: "Alai Kalaniuvalu", pos: "OL", stars: 4, ret: "2027–28", info: "National-recruit O-lineman who flipped from Oregon back to BYU." },
    { name: "Brody Laga", pos: "K", stars: 5, ret: "2027", info: "Five-star kicking recruit — takes over the job from Matthias Dunn when he's back from his mission." },
  ],
  byubball: [
    { name: "Brooks Bahr", pos: "G", stars: 3, ret: "2026-27", info: "First returned missionary of the Kevin Young era; Keller (TX) standout who averaged 17/6/6 with offers from Utah, USC, Wake Forest & Nebraska." },
  ],
};

function FootballRoster({ T }) {
  const [retFilter, setRetFilter] = useState("all");
  const retYears = [...new Set(MISSIONARIES.byufootball.map(m => m.ret))];
  const mishies = MISSIONARIES.byufootball.filter(m => retFilter === "all" || m.ret === retFilter);
  const chip = on => on ? { ...T.accent, color: T.accentText } : { background: T.idleBtn, color: T.text, border: T.idleBorder };
  return (
    <div className="py-2" style={{ color: T.text }}>
      <div className="rounded-3xl p-4 mb-3 text-center" style={{ ...T.accent, color: T.accentText }}>
        <Label>2026 DEPTH CHART</Label>
        <div className="text-lg font-black mt-1">Kalani Sitake's Cougars</div>
        <div className="text-xs font-bold opacity-75">OC Aaron Roderick · DC Kelly Poppinga</div>
      </div>
      {DEPTH.byufootball.map(g => (
        <div key={g.grp} className="rounded-3xl p-4 mb-2" style={T.glass}>
          <div className="text-xs font-black tracking-widest mb-2" style={{ color: T.leaderLine }}>{g.grp}</div>
          <div className="flex flex-col gap-1.5">
            {g.rows.map((r, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <div className="text-xs font-black w-12 shrink-0 opacity-65 pt-0.5">{r.pos}</div>
                <div className="flex-1"><span className="font-black">{r.players[0]}</span>{r.players.length > 1 && <span className="opacity-60">{"  ·  " + r.players.slice(1).join("  ·  ")}</span>}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="flex items-center justify-between flex-wrap gap-2 mb-2 mt-4">
        <div className="text-xs font-black tracking-widest" style={{ color: T.leaderLine }}>RETURNING MISSIONARIES</div>
        <div className="flex gap-1.5">
          <button onClick={() => setRetFilter("all")} className="btn-lift px-2.5 py-1 rounded-full text-xs font-black" style={chip(retFilter === "all")}>All</button>
          {retYears.map(y => <button key={y} onClick={() => setRetFilter(y)} className="btn-lift px-2.5 py-1 rounded-full text-xs font-black" style={chip(retFilter === y)}>{y}</button>)}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {mishies.map(m => (
          <div key={m.name} className="rounded-2xl p-3" style={T.glass}>
            <div className="flex justify-between items-baseline gap-2"><div className="font-black">{m.name} <span className="text-xs font-bold opacity-70">{m.pos} · {"★".repeat(m.stars)}</span></div><div className="text-xs font-black px-2 py-0.5 rounded-full shrink-0" style={{ ...T.accent, color: T.accentText }}>{m.ret}</div></div>
            <div className="text-xs opacity-80 mt-1">{m.info}</div>
          </div>
        ))}
        {!mishies.length && <div className="text-xs opacity-60 text-center py-3">No returnees in that window.</div>}
      </div>
      <div className="text-xs font-black tracking-widest mb-2 mt-4" style={{ color: T.leaderLine }}>FRONT OFFICE</div>
      <div className="rounded-3xl p-4 mb-2" style={T.glass}>
        {LEADERSHIP.byufootball.map(([label, value]) => (
          <div key={label} className="mb-2 last:mb-0">
            <div className="text-xs font-black tracking-widest" style={{ color: T.leaderLine }}>{label.toUpperCase()}</div>
            <div className="text-sm font-bold">{value}</div>
          </div>
        ))}
      </div>
      <SeasonPredictor teamKey="byufootball" teamName="BYU football" ui={{ glass: T.glass, accentBg: { ...T.accent, color: T.accentText }, accentColor: T.leaderLine, text: T.text, idleBtn: T.idleBtn, idleBorder: T.idleBorder, input: T.input }} />
      <TeamNews teamKey="byufootball" teamName="BYU football" ui={{ glass: T.glass, accentBg: { ...T.accent, color: T.accentText }, accentColor: T.leaderLine, text: T.text }} />
      <div className="text-xs opacity-50 mt-3 text-center">Return year = when each is expected back on campus; exact timing can shift with mission dates. Full depth chart projected from spring-camp reporting (Cougars on SI, Deseret News) as of Aug 2026 — fall camp will settle the battles. Starters listed first.</div>
    </div>
  );
}

const SECTION_IDS = ["countdown", "schedule", "pickem", "dashboard", "simulator", "big12", "stats", "playbook", "roster", "recruiting", "vault", "cosmo"];

function BYUFootballHQ() {
  const retro = useContext(RetroCtx);
  const byuMark = markFor("byufootball", retro);
  const [picks, setPicks] = useStorage("byu26_picks", {});
  const [actuals, setActuals] = useStorage("byu26_actuals", {});
  const [soundOn, setSoundOn] = useStorage("byu26_sound", true);
  const [theme, setTheme] = useStorage("byu26_theme", "night");
  const [activeSec, setActiveSec] = useState("countdown");
  const confettiRef = useRef(null);
  const T = THEMES[theme] || THEMES.night;
  const celebrate = (kind) => { confettiRef.current?.fire(); playFanfare(kind, soundOn); };
  // One continuous page — every section is rendered; the rail scrolls between them.
  const sections = [
    { id: "countdown", icon: "⏱", name: "Countdown", el: <Countdown T={T} celebrate={celebrate} /> },
    { id: "schedule", icon: "🏈", name: "Schedule", el: <Schedule T={T} /> },
    { id: "pickem", icon: "✅", name: "Pick'Em", el: <PickEm picks={picks} setPicks={setPicks} actuals={actuals} setActuals={setActuals} celebrate={celebrate} T={T} /> },
    { id: "dashboard", icon: "📊", name: "Projections", el: <Dashboard picks={picks} T={T} /> },
    { id: "simulator", icon: "🎲", name: "Simulator", el: <SeasonSimulator picks={picks} celebrate={celebrate} T={T} /> },
    { id: "big12", icon: "🏆", name: "Big 12 Race", el: <Big12Race T={T} /> },
    { id: "stats", icon: "📈", name: "Stats", el: <Analytics picks={picks} T={T} /> },
    { id: "playbook", icon: "📋", name: "Playbook", el: <Playbook T={T} /> },
    { id: "roster", icon: "🧬", name: "Roster", el: <FootballRoster T={T} /> },
    { id: "recruiting", icon: "🎯", name: "Recruiting", el: <Recruiting T={T} /> },
    { id: "vault", icon: "🏛️", name: "History", el: <HistoryVault celebrate={celebrate} T={T} /> },
    { id: "cosmo", icon: "🐾", name: "Cosmo", el: <AskCosmo T={T} /> },
  ];
  // Sections stay collapsed until opened, so the page reads as a short index
  // and the heavy panels (two 10k-run simulations) only compute on demand.
  const [openSecs, setOpenSecs] = useStorage("byu26_open_secs", { countdown: true });
  const isOpen = id => !!(openSecs || {})[id];
  const toggleSec = id => setOpenSecs(s => ({ ...(s || {}), [id]: !(s || {})[id] }));
  const setAll = val => setOpenSecs(Object.fromEntries(SECTION_IDS.map(id => [id, val])));
  const openCount = SECTION_IDS.filter(isOpen).length;
  // Jumping from the rail opens the section too — scrolling to something
  // still folded shut would be a dead end.
  const jump = id => {
    setOpenSecs(s => ({ ...(s || {}), [id]: true }));
    const el = typeof document !== "undefined" && document.getElementById("sec-" + id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  // Highlight whichever section is currently in view. Degrades to a static
  // highlight where IntersectionObserver isn't available.
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined" || typeof document === "undefined") return;
    const els = SECTION_IDS.map(id => document.getElementById("sec-" + id)).filter(Boolean);
    if (!els.length) return;
    const io = new IntersectionObserver(entries => {
      const top = entries.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (top) setActiveSec(top.target.id.slice(4));
    }, { rootMargin: "-15% 0px -75% 0px" });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
  const toggleBtn = { background: theme === "day" ? "rgba(42,79,224,0.12)" : "rgba(255,255,255,0.7)", border: "1px solid rgba(42,79,224,0.4)", boxShadow: "0 4px 14px rgba(10,20,80,0.2)" };
  return (
    <div className={"min-h-screen w-full relative overflow-hidden theme-" + theme} style={{ fontFamily: "system-ui, sans-serif" }}>
      <style>{`
        .flip-wrap { perspective: 1200px; }
        .flip-inner { position: relative; width: 100%; height: 100%; transition: transform 0.55s cubic-bezier(.4,.2,.2,1); transform-style: preserve-3d; }
        .flip-inner.flipped { transform: rotateY(180deg); }
        .flip-face { position: absolute; width: 100%; height: 100%; backface-visibility: hidden; -webkit-backface-visibility: hidden; }
        .flip-back { transform: rotateY(180deg); }
        @keyframes tabin { 0%{opacity:0; transform: translateY(22px) scale(0.955); filter: blur(7px);} 55%{filter: blur(0);} 100%{opacity:1; transform: none; filter: blur(0);} }
        @keyframes floaty { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
        @keyframes glowpulse { 0%,100%{box-shadow:0 10px 26px rgba(10,20,80,0.3), 0 0 18px rgba(120,150,255,0.25)} 50%{box-shadow:0 10px 26px rgba(10,20,80,0.3), 0 0 34px rgba(120,150,255,0.6)} }
        @keyframes shimmer { 0%{background-position:-160% 0} 100%{background-position:160% 0} }
        .digit { animation: glowpulse 2.6s ease-in-out infinite; border-top: 2px solid rgba(255,255,255,0.85); }
        @media (max-width: 640px){ .digit{ width:52px !important; height:66px !important; font-size:29px !important; } }
        .shine { background: linear-gradient(110deg, transparent 35%, rgba(255,255,255,0.5) 50%, transparent 65%); background-size: 200% 100%; animation: shimmer 3.4s linear infinite; }
        .card-hover { transition: transform .2s ease, box-shadow .2s ease; }
        .card-hover:hover { transform: translateY(-3px); }
        .btn-lift { transition: transform .14s ease, filter .2s ease, box-shadow .2s ease; }
        .btn-lift:hover { filter: brightness(1.08); transform: translateY(-1px); }
        .btn-lift:active { transform: scale(0.97); }
        .tab-btn { transition: transform .15s ease, box-shadow .2s ease, background .2s ease; }
        .tab-btn:hover { transform: translateY(-1px); }
        .theme-night input::placeholder { color: rgba(255,255,255,0.5); }
        .theme-day input::placeholder { color: rgba(20,30,80,0.4); }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-thumb { background: rgba(128,128,160,0.35); border-radius: 8px; }
      `}</style>

      <div style={{ position: "fixed", inset: 0, zIndex: 0, background: T.pageBg, transition: "background .5s ease" }} />
      <div style={{ position: "fixed", top: "26%", left: "-12%", width: 420, height: 420, background: `radial-gradient(circle, ${T.glow1}, transparent 70%)`, filter: "blur(50px)", zIndex: 0, pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: "6%", right: "-14%", width: 460, height: 460, background: `radial-gradient(circle, ${T.glow2}, transparent 70%)`, filter: "blur(55px)", zIndex: 0, pointerEvents: "none" }} />
      {LOGOS.sailor ? (
        <img src={LOGOS.sailor} alt="" aria-hidden="true" style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "min(80vw, 560px)", opacity: theme === "night" ? 0.085 : 0.06, filter: theme === "night" ? "brightness(0) invert(1)" : "none", pointerEvents: "none", zIndex: 0 }} />
      ) : (
        <OvalY stroke={T.watermark} style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "min(72vw, 480px)", opacity: T.watermarkOp, pointerEvents: "none", zIndex: 0 }} />
      )}
      <ConfettiLayer ref={confettiRef} />

      <div className="max-w-2xl mx-auto px-4 pb-12 relative" style={{ zIndex: 1 }}>
        <div className="pt-8 pb-4 text-center flex flex-col items-center relative">
          <button onClick={() => setTheme(v => v === "night" ? "day" : "night")} title="toggle theme" className="btn-lift absolute left-0 top-8 w-11 h-11 rounded-full text-lg" style={toggleBtn}>{theme === "night" ? "☀️" : "🌙"}</button>
          <button onClick={() => setSoundOn(s => !s)} title="toggle sound" className="btn-lift absolute right-0 top-8 w-11 h-11 rounded-full text-lg" style={toggleBtn}>{soundOn ? "🔊" : "🔇"}</button>
          {byuMark ? (
            <img src={byuMark} alt={retro ? "BYU 1982 cougar logo" : "BYU stretch Y"} style={{ width: retro ? 168 : 104, marginBottom: 8, filter: "drop-shadow(0 6px 14px rgba(42,79,224,0.4))" }} />
          ) : <OvalY stroke={ROYAL} style={{ width: 58, height: 64, marginBottom: 8, filter: "drop-shadow(0 6px 14px rgba(42,79,224,0.4))" }} />}
          <div className="text-xs font-black tracking-[0.4em]" style={{ color: "#3a56c8" }}>BRIGHAM YOUNG UNIVERSITY</div>
          <h1 className="text-5xl sm:text-6xl font-black tracking-tight" style={{ background: "linear-gradient(120deg,#0a1130 0%, #2A4FE0 55%, #6E8BFF 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", letterSpacing: "-1.5px" }}>COUGAR HQ '26</h1>
          <div className="text-sm font-black tracking-[0.25em] mt-0.5" style={{ color: "#2a3aa0" }}>RISE AND SHOUT</div>
        </div>

        <div className="flex gap-3">
          <div className="flex flex-col gap-1.5 shrink-0 w-14 sm:w-36" style={{ position: "sticky", top: 56, alignSelf: "flex-start" }}>
            {sections.map(t => <button key={t.id} onClick={() => jump(t.id)} title={"Jump to " + t.name} className="tab-btn px-0 sm:px-3 py-2 rounded-xl text-sm sm:text-xs font-black text-center sm:text-left" style={activeSec === t.id ? { background: "linear-gradient(135deg,#3a63ff,#1a2fb0)", color: "#fff", boxShadow: "0 6px 18px rgba(26,47,176,0.5)" } : { background: theme === "day" ? "rgba(255,255,255,0.72)" : "rgba(255,255,255,0.6)", color: "#17225e", border: "1px solid rgba(42,79,224,0.35)" }}><span className="sm:mr-1.5">{t.icon}</span><span className="hidden sm:inline">{t.name}</span></button>)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="text-xs font-black tracking-[0.2em] opacity-60" style={{ color: T.text }}>{openCount} OF {SECTION_IDS.length} OPEN</div>
              <button onClick={() => setAll(openCount < SECTION_IDS.length)} className="btn-lift text-xs font-black px-3 py-1.5 rounded-full" style={{ background: theme === "day" ? "rgba(255,255,255,0.72)" : "rgba(255,255,255,0.6)", color: "#17225e", border: "1px solid rgba(42,79,224,0.35)" }}>
                {openCount < SECTION_IDS.length ? "Expand all" : "Collapse all"}
              </button>
            </div>
            {sections.map(s => (
              <section key={s.id} id={"sec-" + s.id} style={{ scrollMarginTop: 64 }}>
                <Collapse icon={s.icon} title={s.name} T={T} open={isOpen(s.id)} onToggle={() => toggleSec(s.id)}>
                  {s.el}
                </Collapse>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
