import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";

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

const TRIVIA = [
  { q: "In what year did BYU win its consensus national championship?", a: "1984", opts: ["1980", "1984", "1990", "1996"] },
  { q: "Which BYU quarterback won the Heisman Trophy in 1990?", a: "Ty Detmer", opts: ["Steve Young", "Jim McMahon", "Ty Detmer", "Robbie Bosco"] },
  { q: "BYU's home stadium is named after which legendary head coach?", a: "LaVell Edwards", opts: ["LaVell Edwards", "Bronco Mendenhall", "Cosmo", "Brian Santiago"] },
  { q: "What is BYU's rivalry game against Utah commonly called?", a: "The Holy War", opts: ["The Border War", "The Holy War", "The Beehive Bowl", "The Cougar Clash"] },
  { q: "Which conference did BYU join in 2023?", a: "Big 12", opts: ["Pac-12", "Big Ten", "SEC", "Big 12"] },
  { q: "What is the name of BYU's cougar mascot?", a: "Cosmo", opts: ["Sparky", "Cosmo", "Brutus", "Willie"] },
  { q: "Which Pro Football Hall of Fame QB played at BYU?", a: "Steve Young", opts: ["Joe Montana", "Steve Young", "John Elway", "Dan Marino"] },
  { q: "In what city is BYU located?", a: "Provo, Utah", opts: ["Salt Lake City", "Ogden", "Provo, Utah", "Orem"] },
  { q: "BYU's fight song famously begins with which two words?", a: "Rise and Shout", opts: ["Rise and Shout", "Go Cougars", "Roar Up", "Stand and Cheer"] },
  { q: "From 2011 to 2022, BYU football competed as a what?", a: "Independent", opts: ["WAC member", "Mountain West member", "Independent", "Pac-12 member"] },
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
      { key: "screen", name: "Tunnel Screen", tag: "Playmakers in space", desc: "Slow the rush, let a receiver settle behind a wall of releasing blockers. Get the ball to a burner like Cody Hagen and let him run.",
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

function OvalY() { return null; }

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
  const [t, setT] = useState(1); const raf = useRef();
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

function Analytics({ T }) {
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
      <div className="text-xs opacity-50 mt-3 text-center">2025 season data from official BYU Athletics and reported figures.</div>
    </div>
  );
}

function Countdown({ T }) {
  const [now, setNow] = useState(Date.now()); const [target, setTarget] = useState("auto");
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  let game;
  if (target === "auto") game = GAMES.find(g => new Date(g.date).getTime() > now) || GAMES[GAMES.length - 1];
  else if (target === "nd") game = GAMES.find(g => g.opp === "Notre Dame"); else game = GAMES.find(g => g.opp === "Utah");
  const diff = Math.max(0, new Date(game.date).getTime() - now); const gameDay = diff > 0 && diff < 86400000;
  const units = [["DAYS", Math.floor(diff / 86400000)], ["HRS", Math.floor((diff % 86400000) / 3600000)], ["MIN", Math.floor((diff % 3600000) / 60000)], ["SEC", Math.floor((diff % 60000) / 1000)]];
  const Btn = ({ id, label }) => <button onClick={() => setTarget(id)} className="btn-lift px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide" style={target === id ? { ...T.accent, color: T.accentText } : { ...T.glass, color: T.text }}>{label}</button>;
  return (
    <div className="flex flex-col items-center py-6" style={{ color: T.text }}>
      {gameDay && <div className="mb-5 px-5 py-2 rounded-full font-black tracking-widest animate-pulse" style={{ ...T.accent, color: T.accentText }}>🏈 GAME DAY IS HERE</div>}
      <div className="flex gap-2 mb-8 flex-wrap justify-center"><Btn id="auto" label="NEXT GAME" /><Btn id="nd" label="☘ NOTRE DAME" /><Btn id="utah" label="⚔ HOLY WAR" /></div>
      <div className="text-xs font-black tracking-[0.3em] opacity-70 mb-2">COUNTDOWN TO</div>
      <div className="text-3xl sm:text-4xl font-black mb-1 text-center px-4">{game.home ? "vs" : "at"} {game.opp.toUpperCase()}</div>
      <div className="text-sm opacity-80 mb-9">{fmtDate(game.date)}{!game.tba && ` · ${fmtTime(game.date)} MT · ${game.tv}`}{game.tba && " · Time TBA"}</div>
      <div className="flex gap-3 sm:gap-5">{units.map(([label, v]) => (<div key={label} className="flex flex-col items-center"><div className="digit flex items-center justify-center font-black tabular-nums" style={{ ...T.accent, color: T.accentText, width: 76, height: 90, fontSize: 42, borderRadius: 20 }}>{String(v).padStart(2, "0")}</div><div className="text-xs font-black tracking-widest mt-2.5 opacity-90">{label}</div></div>))}</div>
      <div className="mt-11 w-full max-w-md rounded-3xl p-5 card-hover" style={T.glass}><div className="flex justify-between items-center mb-1"><Label>UP NEXT</Label><div className="text-xs font-black opacity-80">All-time: {game.h2h}</div></div><div className="font-black text-lg">{game.home ? "vs" : "at"} {game.opp}</div><div className="text-sm opacity-80 mt-1 leading-relaxed">{game.story}</div></div>
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

function Trivia({ highScore, setHighScore, celebrate, T }) {
  const [order, setOrder] = useState(() => [...TRIVIA].sort(() => Math.random() - 0.5));
  const [idx, setIdx] = useState(0); const [score, setScore] = useState(0); const [picked, setPicked] = useState(null); const [done, setDone] = useState(false);
  const q = order[idx];
  const choose = opt => { if (picked) return; setPicked(opt); if (opt === q.a) setScore(s => s + 1); };
  const next = () => { if (idx + 1 >= order.length) { if (score > highScore) setHighScore(score); if (score >= 8) celebrate("big"); setDone(true); } else { setIdx(i => i + 1); setPicked(null); } };
  const restart = () => { setOrder([...TRIVIA].sort(() => Math.random() - 0.5)); setIdx(0); setScore(0); setPicked(null); setDone(false); };
  if (done) return (
    <div className="py-10 text-center" style={{ color: T.text }}><Label>FINAL SCORE</Label><div className="text-6xl font-black my-2">{score}/{order.length}</div><div className="text-sm opacity-80 mb-1">{score === order.length ? "Perfect! True Cougar." : score >= 7 ? "Strong showing! Rise and Shout." : "Keep studying the Cougar history!"}</div><div className="text-xs opacity-70 mb-6">Best score: {Math.max(highScore, score)}/{order.length}</div><button onClick={restart} className="btn-lift px-6 py-3 rounded-full font-black" style={{ ...T.accent, color: T.accentText }}>PLAY AGAIN</button></div>
  );
  return (
    <div className="py-4" style={{ color: T.text }}>
      <div className="flex justify-between text-xs font-black opacity-70 mb-3"><span>QUESTION {idx + 1} / {order.length}</span><span>SCORE {score} · BEST {highScore}</span></div>
      <div className="rounded-3xl p-5 mb-4 text-lg font-black" style={T.glassDeep}>{q.q}</div>
      <div className="flex flex-col gap-2">{q.opts.map(opt => { let st = { background: T.idleBtn, color: T.text, border: T.idleBorder }; if (picked) { if (opt === q.a) st = { ...T.accent, color: T.accentText }; else if (opt === picked) st = { background: T.oppActive, color: "#fff" }; } return <button key={opt} onClick={() => choose(opt)} className="btn-lift py-3 px-4 rounded-2xl text-left font-bold" style={st}>{opt}{picked && opt === q.a && " ✓"}</button>; })}</div>
      {picked && <button onClick={next} className="btn-lift mt-4 w-full py-3 rounded-full font-black" style={{ ...T.accent, color: T.accentText }}>{idx + 1 >= order.length ? "SEE RESULTS" : "NEXT →"}</button>}
    </div>
  );
}

function AskCosmo({ T }) {
  const [msgs, setMsgs] = useState([]); const [input, setInput] = useState(""); const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  useEffect(() => { scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight); }, [msgs, loading]);
  const scheduleCtx = GAMES.map(g => `${g.home ? "vs" : "at"} ${g.opp} ${fmtDate(g.date)} (all-time BYU ${g.h2h})`).join("; ");
  const system = `You are Cosmo the Cougar, BYU's mascot and the ultimate hype-man for BYU football. Personality: electric, funny, unshakably loyal, bleeds royal blue. Keep replies short and punchy (2-4 sentences), high energy, family-friendly and clean (no profanity). Toss in the occasional "Rise and Shout!" or roar. You know BYU: 1984 national champs, Ty Detmer's 1990 Heisman, LaVell Edwards Stadium, joined the Big 12 in 2023. In 2025 BYU went 12-2 behind true-freshman QB Bear Bachmeier and RB LJ Martin (Big 12 OPOY); OC is Aaron Roderick (power spread), and Kelly Poppinga is the 2026 DC (multiple 4-3). Use the 2026 schedule when relevant. Predictions are just for fun. 2026 schedule: ${scheduleCtx}.`;
  const send = async (text) => {
    const qy = (text ?? input).trim(); if (!qy || loading) return;
    const next = [...msgs, { role: "user", content: qy }]; setMsgs(next); setInput(""); setLoading(true);
    try { const res = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1000, system, messages: next.map(m => ({ role: m.role, content: m.content })) }) }); const data = await res.json(); const txt = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("\n").trim() || "Roar! My voice cracked — hit me again!"; setMsgs(m => [...m, { role: "assistant", content: txt }]); }
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
  const posMax = Math.max(1, ...Object.values(posCount));
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

const TEAMS = {
  byufootball: { key: "byufootball", name: "BYU Football", tab: "🏈 BYU FB", custom: true },
  byubball: { key: "byubball", name: "BYU Basketball", tab: "🏀 BYU BB", emoji: "🏀", league: "NCAA · Big 12", coach: "HC Kevin Young",
    c1: "#1f45c4", c2: "#0c1846", accent: "#ffffff", record: "23–12", recordLabel: "2025-26 season",
    status: "Offseason — reloading around a new core",
    snapshot: [{ label: "2025-26", value: "23–12" }, { label: "Big 12", value: "9–9" }, { label: "NCAA", value: "6-seed · R1" }, { label: "Preseason", value: "No. 8 · best ever" }],
    players: [{ name: "AJ Dybantsa", pos: "F", line: "Led nation 25.5 ppg · off to the NBA" }, { name: "Robert Wright III", pos: "PG", line: "Star point guard — returns for 2026-27" }, { name: "Richie Saunders", pos: "G/F", line: "All-around wing" }, { name: "Keba Keita", pos: "C", line: "Elite rim protector" }, { name: "Kennard Davis Jr.", pos: "G", line: "18.1 ppg scorer" }],
    notes: ["The 'Season of AJ' — Dybantsa led the nation in scoring and was a First-Team All-American.", "Earned the program's highest-ever preseason ranking (No. 8).", "Fell in the NCAA first round to Texas as a 6-seed.", "Reloading for 2026-27: Wright III returns, plus 5-star Bruce Branch III and portal adds.", "Still chasing the program's elusive first Final Four (31+ tourney trips)."] },
  jazz: { key: "jazz", name: "Utah Jazz", tab: "🎷 Jazz", emoji: "🎷", league: "NBA · Western Conf", coach: "HC Will Hardy",
    c1: "#4a2a86", c2: "#0b0713", accent: "#7ec8f0", record: "22–60", recordLabel: "2025-26 season",
    status: "2026-27 schedule is out — opener Oct 21 at Memphis, home opener Oct 23",
    snapshot: [{ label: "2025-26", value: "22–60" }, { label: "West", value: "15th" }, { label: "Phase", value: "Rebuild" }, { label: "2026 Draft", value: "No. 2 pick" }],
    players: [{ name: "Lauri Markkanen", pos: "F", line: "All-Star scorer · 51-point game" }, { name: "Keyonte George", pos: "G", line: "Breakout lead guard (23.6 ppg)" }, { name: "Jaren Jackson Jr.", pos: "F/C", line: "2× All-Star · added at the deadline" }, { name: "Ace Bailey", pos: "F", line: "2025 No. 5 pick · 15.3 ppg rookie" }, { name: "Darryn Peterson", pos: "G", line: "2026 No. 2 pick (Kansas)" }],
    notes: ["Another development year — 22–60, 15th in the West.", "Selected guard Darryn Peterson No. 2 overall in the 2026 NBA Draft.", "Keyonte George emerged as an All-Star-caliber lead guard.", "Young core (George, Bailey, Kessler, Collier) building around Markkanen."] },
  mammoth: { key: "mammoth", name: "Utah Mammoth", tab: "🦣 Mammoth", emoji: "🦣", league: "NHL · Central", coach: "HC André Tourigny",
    c1: "#123a5e", c2: "#08182a", accent: "#6CACE4", record: "43–33–6", recordLabel: "2025-26 season",
    status: "2026-27 schedule is out — opener Oct 1 vs Chicago, then a 5-game East road trip",
    snapshot: [{ label: "2025-26", value: "43–33–6" }, { label: "West", value: "6th" }, { label: "Playoffs", value: "1st Rd · VGK" }, { label: "Milestone", value: "1st postseason" }],
    players: [{ name: "Clayton Keller", pos: "C · Capt", line: "88 points — team leader" }, { name: "Dylan Guenther", pos: "RW", line: "40 goals — first 40-goal season" }, { name: "Logan Cooley", pos: "C", line: "24 G · franchise's 1st playoff goal" }, { name: "Karel Vejmelka", pos: "G", line: "38 wins · 2.75 GAA" }, { name: "Mikhail Sergachev", pos: "D", line: "Two-way anchor" }],
    notes: ["First season under the 'Utah Mammoth' name (renamed May 2025 from Utah HC).", "Clinched the franchise's FIRST-EVER playoff berth (top wild card in the West).", "Lost a hard-fought first round to the Vegas Golden Knights in six games.", "Logan Cooley scored the franchise's first-ever playoff goal."] },
  eagles: { key: "eagles", name: "Philadelphia Eagles", tab: "🦅 Eagles", emoji: "🦅", league: "NFL · NFC East", coach: "HC Nick Sirianni",
    c1: "#004c54", c2: "#04211d", accent: "#A5ACAF", record: "11–6", recordLabel: "2025 regular season",
    status: "Preseason opens Aug 15 at Baltimore — Week 1 is Sep 13 vs Washington", live: true,
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
    { grp: "OFFENSE", rows: [{ pos: "QB", players: ["Bear Bachmeier", "Treyson Bourguet"] }, { pos: "RB", players: ["LJ Martin", "Sione Moa"] }, { pos: "WR", players: ["Jojo Phillips", "Cody Hagen", "Tei Nacua"] }, { pos: "TE", players: ["Walker Lyons", "Roger Saleapaga"] }, { pos: "OL", players: ["Finau · Yamauchi · Mitchell · Sfarcioc · Gentry"] }] },
    { grp: "DEFENSE", rows: [{ pos: "EDGE", players: ["Tausili Akana", "Nusi Taumoepeau"] }, { pos: "DL", players: ["Keanu Tanuvasa", "Bodie Schoonover"] }, { pos: "LB", players: ["Isaiah Glasker", "Siale Esera", "Harrison Taggart"] }, { pos: "CB", players: ["Tre Alexander", "Evan Johnson"] }, { pos: "NB", players: ["Jonathan Kabeya"] }, { pos: "S", players: ["Faletau Satuala", "Raider Damuni", "Tommy Prassas"] }] },
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
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1024, tools: [{ type: "web_search_20250305", name: "web_search" }], messages: [{ role: "user", content: `Search the web for the 5 most recent news items about the ${teamName} from beat writers and major outlets. Respond with ONLY a JSON array (no prose, no markdown) of objects: {"headline": string, "source": string, "url": string}. Use real, current article URLs from your search results.` }] }),
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
  const [grading, setGrading] = useState(false);
  const [picks, setPicks] = useStorage("sportshq_lpick_" + teamKey, {});
  const [results, setResults] = useStorage("sportshq_lresults_" + teamKey, null);
  const load = async () => {
    setLoading(true); setErr(false);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 2000, tools: [{ type: "web_search_20250305", name: "web_search" }], messages: [{ role: "user", content: `Search the web for the ${teamName}'s next 6 upcoming scheduled games. Respond with ONLY a JSON array (no prose, no citations, no markdown) like [{"date":"Jul 20","opp":"Giants","ha":"vs"}], where "ha" is "vs" for home or "at" for away. If there are genuinely no upcoming games (offseason / schedule unreleased), return [].` }] }),
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
  const grade = async () => {
    setGrading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1500, tools: [{ type: "web_search_20250305", name: "web_search" }], messages: [{ role: "user", content: `Search the web for the ${teamName}'s last 10 completed games. For each, the opponent and whether ${teamName} won that game. Respond with ONLY a JSON array (no prose, no citations) like [{"opp":"Giants","won":true}]. If no completed games, return [].` }] }),
      });
      const data = await res.json();
      const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("\n");
      let items = [];
      const m = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (m) { try { items = JSON.parse(m[0]); } catch (e2) {} }
      items = (Array.isArray(items) ? items : []).map(g => ({ opp: g.opp || g.opponent || "", won: g.won === true || /^(true|w|won|win)/i.test(String(g.won ?? g.result ?? "")) }));
      setResults(items);
    } catch (e) {}
    setGrading(false);
  };
  useEffect(() => { if (!fresh0) load(); }, [teamKey]);
  const pick = (id, who) => setPicks(p => ({ ...p, [id]: who }));
  const curPicks = (games || []).map(g => picks[`${g.date}|${g.opp}`]).filter(Boolean);
  const teamWins = curPicks.filter(v => v === "team").length;
  const oppActive = { background: "rgba(8,12,32,0.85)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)" };
  const norm = s => String(s || "").toLowerCase().trim();
  const lastWord = s => norm(s).split(" ").pop();
  let correct = 0, graded = 0;
  if (results) Object.entries(picks).forEach(([id, who]) => {
    const opp = id.split("|")[1] || "";
    const r = results.find(x => x.opp && (norm(x.opp).includes(lastWord(opp)) || norm(opp).includes(lastWord(x.opp))));
    if (r) { graded++; if ((who === "team") === !!r.won) correct++; }
  });
  const acc = graded ? Math.round(correct / graded * 100) : 0;
  return (
    <div style={{ color: ui.text }}>
      <div className="flex items-center justify-between mb-2 mt-4">
        <div className="text-xs font-black tracking-[0.2em]" style={{ color: ui.accentColor }}>🗳️ GAME PICK'EM</div>
        <div className="flex gap-1.5">
          <button onClick={grade} disabled={grading} className="btn-lift rounded-full px-3 py-1.5 text-xs font-black" style={{ background: ui.idleBtn, color: ui.text, border: ui.idleBorder, opacity: grading ? 0.6 : 1 }}>{grading ? "Grading…" : "Grade"}</button>
          <button onClick={load} disabled={loading} className="btn-lift rounded-full px-3 py-1.5 text-xs font-black" style={{ ...ui.accentBg, opacity: loading ? 0.6 : 1 }}>{loading ? "Loading…" : "Refresh"}</button>
        </div>
      </div>
      {graded > 0 && (
        <div className="rounded-2xl p-3 mb-2 text-center" style={{ ...ui.accentBg }}>
          <div className="text-xs font-black tracking-widest" style={{ opacity: 0.7 }}>PICK'EM REPORT CARD</div>
          <div className="text-2xl font-black">{acc}%</div>
          <div className="text-xs" style={{ opacity: 0.8 }}>{correct}/{graded} correct{correct === graded && graded > 2 ? " · 🔥 perfect" : ""}</div>
        </div>
      )}
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
      {games && games.length > 0 && <div className="text-xs opacity-75 mt-2 text-center">{curPicks.length} of {games.length} picked · <span className="font-black" style={{ color: ui.accentColor }}>{teamWins} {shortName} wins</span> called · tap Grade to score past picks</div>}
    </div>
  );
}

const FRANCHISE = {
  byufootball: { founded: "1922", titles: "1 national title", titleNote: "1984 (consensus)", legends: ["Ty Detmer (1990 Heisman)", "Steve Young", "Jim McMahon", "LaVell Edwards (HC '72–'00)"], retired: [], timeline: [{ yr: "1984", ev: "National champions at 13–0" }, { yr: "1990", ev: "Ty Detmer wins the Heisman" }, { yr: "1996", ev: "Cotton Bowl win, 14–1 season" }, { yr: "2023", ev: "Joins the Big 12" }, { yr: "2025", ev: "12–2, best recruiting class ever" }] },
  byubball: { founded: "1902", titles: "0 titles", titleNote: "still chasing a first Final Four", legends: ["Danny Ainge ('81 Nat'l POY)", "Jimmer Fredette ('11 POY)", "Kresimir Cosic", "Michael Smith"], retired: ["22 Ainge", "32 Fredette", "11 Cosic"], timeline: [{ yr: "1981", ev: "Danny Ainge wins the Wooden Award" }, { yr: "2011", ev: "Jimmer-mania; Fredette national POY" }, { yr: "2023", ev: "Joins the Big 12" }, { yr: "2026", ev: "Jimmer's No. 32 retired; Dybantsa era" }] },
  jazz: { founded: "1974 · Utah since '79", titles: "0 titles", titleNote: "2 Finals ('97, '98)", legends: ["John Stockton", "Karl Malone", "Jerry Sloan (HC)", "Pete Maravich"], retired: ["12 Stockton", "32 Malone", "7 Maravich", "53 Eaton", "1223 Sloan"], timeline: [{ yr: "1979", ev: "Franchise moves to Salt Lake City" }, { yr: "1997", ev: "First NBA Finals vs the Bulls" }, { yr: "1998", ev: "Second straight Finals run" }, { yr: "2025", ev: "New Mountain Purple identity" }] },
  mammoth: { founded: "2024 (Salt Lake City)", titles: "0 titles", titleNote: "new NHL franchise", legends: ["Clayton Keller (1st captain)", "Dylan Guenther", "Logan Cooley"], retired: [], timeline: [{ yr: "2024", ev: "NHL arrives in Utah (as Utah HC)" }, { yr: "2025", ev: "Rebrand to the Utah Mammoth" }, { yr: "2026", ev: "First-ever playoff berth" }] },
  eagles: { founded: "1933", titles: "5 titles", titleNote: "3 NFL ('48/'49/'60) + SB LII & LIX", legends: ["Reggie White", "Brian Dawkins", "Chuck Bednarik", "Steve Van Buren"], retired: ["20 Dawkins", "60 Bednarik", "92 White", "15 Van Buren", "99 J. Brown"], timeline: [{ yr: "1960", ev: "NFL champions (Bednarik era)" }, { yr: "2018", ev: "Super Bowl LII win over the Patriots" }, { yr: "2025", ev: "Super Bowl LIX champs (Hurts)" }, { yr: "2026", ev: "Wild Card exit as defending champs" }] },
  dodgers: { founded: "1883 · LA since '58", titles: "9 World Series", titleNote: "'55 '59 '63 '65 '81 '88 '20 '24 '25", legends: ["Jackie Robinson", "Sandy Koufax", "Vin Scully (voice)", "Clayton Kershaw"], retired: ["42 Robinson", "32 Koufax", "24 Alston", "2 Lasorda", "34 Valenzuela"], timeline: [{ yr: "1947", ev: "Jackie Robinson breaks the color barrier" }, { yr: "1988", ev: "Gibson's walk-off HR, WS title" }, { yr: "2020", ev: "World Series title" }, { yr: "2024", ev: "World Series champs" }, { yr: "2025", ev: "Back-to-back champs" }] },
};

const TROPHIES = {
  byufootball: [{ yr: "1984", label: "National Champs", icon: "🏆" }],
  byubball: [{ yr: "1951", label: "NIT Champs", icon: "🏅" }, { yr: "1966", label: "NIT Champs", icon: "🏅" }],
  jazz: [{ yr: "1997", label: "West Champs", icon: "🏅" }, { yr: "1998", label: "West Champs", icon: "🏅" }],
  mammoth: [],
  eagles: [{ yr: "1948", label: "NFL Champs", icon: "🏆" }, { yr: "1949", label: "NFL Champs", icon: "🏆" }, { yr: "1960", label: "NFL Champs", icon: "🏆" }, { yr: "2018", label: "Super Bowl LII", icon: "🏆" }, { yr: "2025", label: "Super Bowl LIX", icon: "🏆" }],
  dodgers: [{ yr: "1955", label: "World Series", icon: "🏆" }, { yr: "1959", label: "World Series", icon: "🏆" }, { yr: "1963", label: "World Series", icon: "🏆" }, { yr: "1965", label: "World Series", icon: "🏆" }, { yr: "1981", label: "World Series", icon: "🏆" }, { yr: "1988", label: "World Series", icon: "🏆" }, { yr: "2020", label: "World Series", icon: "🏆" }, { yr: "2024", label: "World Series", icon: "🏆" }, { yr: "2025", label: "World Series", icon: "🏆" }],
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

function Franchise({ data, teamKey, ui }) {
  if (!data) return null;
  const trophies = TROPHIES[teamKey] || [];
  const retired = data.retired || [];
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

const SCHEDULES = {
  mammoth: { title: "2026-27 OPENING SLATE", note: "Season opens Oct 1 · synced from live NHL data", games: [
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
  eagles: { title: "2026 SCHEDULE", note: "Preseason opens Aug 15 · Week 1 is Sep 13 · synced from live NFL data", games: [
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
  jazz: { title: "2026-27 OPENING SLATE", note: "Season opens Oct 21 · home opener Oct 23 · synced from live NBA data", games: [
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

function TeamSchedule({ data, ui }) {
  if (!data) return null;
  return (
    <div style={{ color: ui.text }}>
      <div className="text-xs font-black tracking-[0.2em] mb-2 mt-4" style={{ color: ui.accentColor }}>📅 {data.title}</div>
      <div className="rounded-3xl p-3" style={ui.glass}>
        {data.games.map((g, i) => (
          <div key={i} className="flex items-center gap-2 py-1.5 text-sm border-b last:border-0" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
            <span className="text-xs font-black opacity-60 shrink-0" style={{ width: 78 }}>{g.date}</span>
            <span className="font-black flex-1">{g.ha} {g.opp}{g.tag && <span className="ml-1.5 font-black px-1.5 py-0.5 rounded-full" style={{ fontSize: 9, background: ui.accentColor, color: "#0c1226" }}>{g.tag.toUpperCase()}</span>}</span>
            <span className="text-xs opacity-55 shrink-0">{g.time}</span>
          </div>
        ))}
      </div>
      <div className="text-xs opacity-50 mt-1.5 text-center">{data.note}</div>
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
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 3000, tools: [{ type: "web_search_20250305", name: "web_search" }], messages: [{ role: "user", content: `Search the web for current info on ${name} of the ${teamName}. Then output ONLY a JSON object as your entire final message (no prose before or after, no citations, no markdown fences): {"bio": "2-3 sentence current bio", "stats": [{"label": string, "value": string}] (4-6 key current/recent stats), "news": [{"headline": string, "source": string}] (2-3 recent news items)}.` }] }),
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

const ANALYSTS = {
  byubball: { name: "Cosmo (Hoops Mode)", emoji: "🏀", vibe: "BYU's mascot in basketball mode — electric, loyal, hyped on the Kevin Young era and the reload after Dybantsa. Family-friendly, punchy, drops 'Rise and Shout!'", chips: ["Can Wright III carry us?", "Do we finally make a Final Four?", "Hype the Big 12 race"] },
  jazz: { name: "Jazz Bear", emoji: "🐻", vibe: "The Jazz's legendary mischievous mascot — playful, prank-loving, but sneaky-smart about basketball. Honest about the rebuild while hyped on the young core and the new Mountain Purple era.", chips: ["Is Peterson the future?", "When are we good again?", "Grade the rebuild"] },
  mammoth: { name: "Tusky", emoji: "🦣", vibe: "The Mammoth's mascot — big, warm, stomping with excitement about hockey in Utah. Proud of the first playoff run, hyped on Keller, Cooley, and Guenther.", chips: ["Can we win a playoff round?", "Is Cooley a superstar?", "Hype opening night"] },
  eagles: { name: "Swoop", emoji: "🦅", vibe: "The Eagles' mascot — gritty Philly energy, zero patience for doubters, bleeds midnight green. Confident about the Hurts-Barkley core, honest that the WR room changed after the A.J. Brown trade.", chips: ["Are we winning the East again?", "How's life after A.J.?", "Hype the Dallas games"] },
  dodgers: { name: "Blue", emoji: "🔵", vibe: "A smooth LA broadcast-booth analyst voice — classy, poetic about baseball, casually confident the way back-to-back champs get to be. Loves Ohtani theater and October baseball.", chips: ["Can we three-peat?", "Is this the best lineup ever?", "Who's our October X-factor?"] },
};

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
  const send = async (text) => {
    const qy = (text ?? input).trim(); if (!qy || loading) return;
    const next = [...msgs, { role: "user", content: qy }]; setMsgs(next); setInput(""); setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1000, system, messages: next.map(m => ({ role: m.role, content: m.content })) }) });
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

function TeamPage({ team: p }) {
  const [playerOpen, setPlayerOpen] = useState(null);
  const glass = { background: "linear-gradient(155deg, rgba(255,255,255,0.13), rgba(0,0,0,0.34))", backdropFilter: "blur(13px)", WebkitBackdropFilter: "blur(13px)", border: "1px solid rgba(255,255,255,0.16)", boxShadow: "0 12px 34px rgba(0,0,0,0.4)" };
  const isWhite = p.accent === "#ffffff";
  const accentBg = { background: isWhite ? "linear-gradient(150deg,#ffffff,#eaf0ff)" : `linear-gradient(150deg, ${p.accent}, ${p.accent}cc)`, color: "#0c1226" };
  const valColor = isWhite ? "#ffffff" : p.accent;
  return (
    <div style={{ color: "#fff" }}>
      <div className="rounded-3xl p-6 mb-3 text-center relative overflow-hidden card-hover" style={{ background: `linear-gradient(155deg, ${p.c1} 0%, ${p.c2} 72%)`, border: `1px solid ${p.accent}66`, boxShadow: `0 14px 40px rgba(0,0,0,0.5), 0 0 36px ${p.accent}26`, color: "#fff" }}>
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.12, pointerEvents: "none" }} preserveAspectRatio="none" viewBox="0 0 100 100" aria-hidden="true"><path d="M-10 88 L110 36" stroke={p.accent} strokeWidth="13" /><path d="M-10 106 L110 54" stroke={p.accent} strokeWidth="8" /></svg>
        <div className="flex justify-center mb-2 relative"><TeamLogo teamKey={p.key} size={76} /></div>
        <div className="text-2xl font-black relative" style={{ letterSpacing: "-0.5px" }}>{p.name}</div>
        <div className="text-xs font-black opacity-75 tracking-widest mt-0.5 relative">{p.league} · {p.coach}</div>
        <div className="text-5xl font-black mt-3 relative" style={{ letterSpacing: "-1px", color: p.accent, textShadow: "0 4px 18px rgba(0,0,0,0.45)" }}>{p.record}</div>
        <div className="text-xs font-bold opacity-75 relative">{p.recordLabel}</div>
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
      <Franchise data={FRANCHISE[p.key]} teamKey={p.key} ui={{ glass, accentColor: valColor, text: "#fff", idleBtn: "rgba(255,255,255,0.12)", idleBorder: "1px solid rgba(255,255,255,0.25)" }} />
      <SeasonPredictor teamKey={p.key} teamName={p.name} shortName={p.key === "byubball" ? "BYU" : p.name.split(" ").pop()} ui={{ glass, accentBg, accentColor: valColor, text: "#fff", idleBtn: "rgba(255,255,255,0.12)", idleBorder: "1px solid rgba(255,255,255,0.25)", input: { background: "rgba(255,255,255,0.14)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)" } }} />
      <LivePickem teamKey={p.key} teamName={p.name} shortName={p.key === "byubball" ? "BYU" : p.name.split(" ").pop()} ui={{ glass, accentBg, accentColor: valColor, text: "#fff", idleBtn: "rgba(255,255,255,0.12)", idleBorder: "1px solid rgba(255,255,255,0.25)" }} />
      <TeamAnalyst teamKey={p.key} team={p} ui={{ glass, accentBg, accentColor: valColor, text: "#fff", idleBtn: "rgba(255,255,255,0.12)", idleBorder: "1px solid rgba(255,255,255,0.25)" }} />
      <TeamNews teamKey={p.key} teamName={p.name} ui={{ glass, accentBg, accentColor: valColor, text: "#fff", idleBtn: "rgba(255,255,255,0.12)", idleBorder: "1px solid rgba(255,255,255,0.25)" }} />
      <div className="text-xs opacity-45 mt-3 text-center">Rosters/depth charts current as of July 2026 — offseason moves may shift them. Starters listed first.</div>
    </div>
  );
}

function TeamCrest({ teamKey, size = 56 }) {
  const M = {
    byufootball: { ini: "Y", c1: "#2A4FE0", c2: "#0a1130", ac: "#8ea6ff" },
    byubball: { ini: "BYU", c1: "#1f45c4", c2: "#0c1846", ac: "#8ea6ff" },
    jazz: { ini: "UTA", c1: "#4a2a86", c2: "#0b0713", ac: "#7ec8f0" },
    mammoth: { ini: "UM", c1: "#123a5e", c2: "#08182a", ac: "#6CACE4" },
    eagles: { ini: "PHI", c1: "#004c54", c2: "#04211d", ac: "#A5ACAF" },
    dodgers: { ini: "LA", c1: "#005a9c", c2: "#022546", ac: "#9fd0ff" },
  };
  const m = M[teamKey];
  if (!m) return null;
  const gid = "crest_" + teamKey;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.45))" }} aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={m.c1} /><stop offset="1" stopColor={m.c2} /></linearGradient>
      </defs>
      <circle cx="50" cy="50" r="47" fill={`url(#${gid})`} stroke={m.ac} strokeWidth="3.5" />
      <circle cx="50" cy="50" r="39" fill="none" stroke={m.ac} strokeOpacity="0.35" strokeWidth="1.5" />
      <path d="M4 68 L96 28" stroke={m.ac} strokeOpacity="0.15" strokeWidth="11" />
      <path d="M4 84 L96 44" stroke={m.ac} strokeOpacity="0.08" strokeWidth="7" />
      <text x="50" y="50" dy="0.36em" textAnchor="middle" fontSize={m.ini.length > 2 ? 27 : 36} fontWeight="900" fill="#ffffff" fontFamily="system-ui, sans-serif" letterSpacing="-1">{m.ini}</text>
    </svg>
  );
}

// Logo sources, tried in order: your local files (drop them in /public/logos/ after the
// Claude Code migration) → ESPN CDN → built-in crest fallback.
const LOGO_SOURCES = {
  byufootball: ["/logos/byufootball.png", "https://a.espncdn.com/i/teamlogos/ncaa/500/252.png"],
  byubball: ["/logos/byubball.png", "https://a.espncdn.com/i/teamlogos/ncaa/500/252.png"],
  jazz: ["/logos/jazz.png", "https://a.espncdn.com/i/teamlogos/nba/500/utah.png"],
  mammoth: ["/logos/mammoth.png", "https://a.espncdn.com/i/teamlogos/nhl/500/utah.png"],
  eagles: ["/logos/eagles.png", "https://a.espncdn.com/i/teamlogos/nfl/500/phi.png"],
  dodgers: ["/logos/dodgers.png", "https://a.espncdn.com/i/teamlogos/mlb/500/lad.png"],
};

let RETRO_MODE = false;

function TeamLogo({ teamKey, size = 56 }) {
  const [idx, setIdx] = useState(0);
  const modeRef = useRef(RETRO_MODE);
  if (modeRef.current !== RETRO_MODE) { modeRef.current = RETRO_MODE; if (idx !== 0) setIdx(0); }
  const base = LOGO_SOURCES[teamKey] || [];
  const srcs = RETRO_MODE ? [`/logos/throwback/${teamKey}.png`, ...base] : base;
  if (idx >= srcs.length) return <TeamCrest teamKey={teamKey} size={size} />;
  return <img key={(RETRO_MODE ? "r" : "m") + idx} src={srcs[idx]} alt="" width={size} height={size} onError={() => setIdx(i => i + 1)} style={{ width: size, height: size, objectFit: "contain", filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.45))" }} />;
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

const WIN_LINES = {
  byufootball: "RISE AND SHOUT! 🏈", byubball: "RISE AND SHOUT! 🏀",
  jazz: "TAKE NOTE — the young core delivered! 🎷", mammoth: "THE HERD STAMPEDES ON! 🦣",
  eagles: "FLY EAGLES FLY! 🦅", dodgers: "THREE-PEAT WATCH ROLLS ON! ⚾",
};

function VictoryWatch() {
  const [celebs, setCelebs] = useState([]);
  const [celebMap, setCelebMap] = useStorage("sportshq_celeb", {});
  const confRef = useRef(null);
  const firedRef = useRef(false);
  useEffect(() => {
    (async () => {
      let items = SCORES_CACHE.data && Date.now() - SCORES_CACHE.ts < 300000 ? SCORES_CACHE.data : null;
      if (!items) {
        try {
          const teamList = HOME_CARDS.map(c => c.name).join(", ");
          const res = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1024, tools: [{ type: "web_search_20250305", name: "web_search" }], messages: [{ role: "user", content: `For each of these teams: ${teamList}. Give one very short status line — if their season is currently active, their most recent final score; otherwise their next scheduled game or the word "offseason". Respond with ONLY a JSON array (no prose, no markdown) of {"team": string, "line": string} using the exact team names I gave.` }] }),
          });
          const data = await res.json();
          const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("\n");
          const m = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
          if (m) { try { items = JSON.parse(m[0]); } catch (e2) {} }
          if (items) { SCORES_CACHE.data = items; SCORES_CACHE.ts = Date.now(); }
        } catch (e) { return; }
      }
      if (!items) return;
      setTimeout(() => {
        setCelebMap(prev => {
          const upd = { ...prev }; const fresh = [];
          items.forEach(it => {
            const card = HOME_CARDS.find(c => c.name === it.team) || HOME_CARDS.find(c => it.team && String(it.team).includes(c.name.split(" ").pop()));
            if (!card || !it.line) return;
            const win = /\b(won|win|beat|defeated|victory)\b/i.test(it.line) || /\bW\b\s*\d/.test(it.line);
            const nums = (String(it.line).match(/\d+/g) || []).map(Number).filter(n => n <= 200);
            const margin = nums.length >= 2 ? Math.abs(nums[nums.length - 2] - nums[nums.length - 1]) : 0;
            const thresh = card.key === "dodgers" ? 6 : card.key === "mammoth" ? 4 : 17;
            const blowout = win && margin >= thresh;
            if (upd[card.key] !== it.line) {
              upd[card.key] = it.line;
              if (win) fresh.push({ key: card.key, name: card.name, emoji: card.emoji, color: card.accent, line: it.line, hype: WIN_LINES[card.key], blowout, margin });
            }
          });
          if (fresh.length && !firedRef.current) {
            firedRef.current = true;
            setCelebs(fresh);
            const big = fresh.some(f => f.blowout);
            setTimeout(() => {
              confRef.current?.fire(); playFanfare("big", true);
              if (big) { setTimeout(() => confRef.current?.fire(), 650); setTimeout(() => confRef.current?.fire(), 1300); }
            }, 350);
          }
          return upd;
        });
      }, 800);
    })();
  }, []);
  return (
    <>
      <ConfettiLayer ref={confRef} />
      {celebs.length > 0 && (
        <div className="rounded-3xl p-4 mb-4" style={{ background: "linear-gradient(150deg, rgba(255,215,90,0.2), rgba(6,10,26,0.88))", border: "1px solid rgba(255,215,90,0.55)", boxShadow: "0 0 34px rgba(255,215,90,0.3)", color: "#fff", animation: "teamin .4s ease" }}>
          <div className="flex justify-between items-center mb-1.5">
            <div className="text-xs font-black tracking-[0.25em]" style={{ color: "#ffd75a" }}>🎉 VICTORY ALERT</div>
            <button onClick={() => setCelebs([])} className="btn-lift w-7 h-7 rounded-full text-xs font-black" style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)", color: "#fff" }}>✕</button>
          </div>
          {celebs.map(c => (
            <div key={c.key} className="mb-2 last:mb-0">
              <div className="text-lg font-black">{c.emoji} {c.name.toUpperCase()} WON!{c.blowout && <span className="ml-2 align-middle text-xs font-black px-2 py-0.5 rounded-full" style={{ background: "#ff5b4d", color: "#fff", animation: "glowpulse 1.6s ease-in-out infinite" }}>💥 STATEMENT WIN +{c.margin}</span>}</div>
              <div className="text-sm opacity-85">{c.line}</div>
              <div className="text-xs font-black mt-0.5 tracking-wide" style={{ color: c.color }}>{c.hype}</div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function buildTimeline() {
  const MON = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
  const parse = (dstr, tstr) => {
    const parts = String(dstr).replace(",", "").split(" ");
    const mo = MON[parts[1]], day = parseInt(parts[2]);
    if (mo === undefined || isNaN(day)) return null;
    let h = 12, mi = 0;
    const m = /(\d+):(\d+)\s*(AM|PM)/i.exec(tstr || "");
    if (m) { h = (parseInt(m[1]) % 12) + (/pm/i.test(m[3]) ? 12 : 0); mi = parseInt(m[2]); }
    return new Date(2026, mo, day, h, mi);
  };
  const ev = [];
  GAMES.forEach(g => ev.push({ team: "BYU FB", key: "byufootball", emoji: "🏈", color: "#8ea6ff", d: new Date(g.date), label: `${g.home ? "vs" : "at"} ${g.opp}`, tag: g.marquee ? "★ Marquee" : "" }));
  [["Jazz", "jazz", "🎷", "#7ec8f0"], ["Mammoth", "mammoth", "🦣", "#6CACE4"], ["Eagles", "eagles", "🦅", "#8fd8c8"]].forEach(([nm, key, em, col]) => {
    (SCHEDULES[key]?.games || []).forEach(g => { const d = parse(g.date, g.time); if (d) ev.push({ team: nm, key, emoji: em, color: col, d, label: `${g.ha} ${g.opp}`, tag: g.tag || "" }); });
  });
  return ev.sort((a, b) => a.d - b.d);
}

const TIMELINE = buildTimeline();

function HomeHub({ setActive }) {
  const [nowT, setNowT] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNowT(Date.now()), 1000); return () => clearInterval(t); }, []);
  const upcoming = TIMELINE.filter(e => e.d.getTime() > nowT);
  const next = upcoming[0];
  const nDiff = next ? next.d.getTime() - nowT : 0;
  const nD = Math.floor(nDiff / 86400000), nH = Math.floor((nDiff % 86400000) / 3600000), nM = Math.floor((nDiff % 3600000) / 60000), nS = Math.floor((nDiff % 60000) / 1000);
  const gameDay = next && nDiff < 86400000;
  const fresh = SCORES_CACHE.data && Date.now() - SCORES_CACHE.ts < 300000;
  const [scores, setScores] = useState(fresh ? SCORES_CACHE.data : null);
  const [ts, setTs] = useState(fresh ? SCORES_CACHE.ts : null);
  const [loading, setLoading] = useState(!fresh);
  const load = async () => {
    setLoading(true);
    try {
      const teamList = HOME_CARDS.map(c => c.name).join(", ");
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1024, tools: [{ type: "web_search_20250305", name: "web_search" }], messages: [{ role: "user", content: `For each of these teams: ${teamList}. Give one very short status line — if their season is currently active, their most recent final score; otherwise their next scheduled game or the word "offseason". Respond with ONLY a JSON array (no prose, no markdown) of {"team": string, "line": string} using the exact team names I gave.` }] }),
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
  const stamp = ts ? new Date(ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : null;
  const glassH = { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.14)", boxShadow: "0 12px 30px rgba(0,0,0,0.4)" };
  return (
    <div style={{ color: "#fff" }}>
      <div className="text-center mb-5">
        <div className="text-xs font-black tracking-[0.4em]" style={{ color: "#8ea6ff" }}>YOUR</div>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight" style={{ background: "linear-gradient(120deg,#ffffff,#8ea6ff)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>SPORTS HQ</h1>
        <div className="text-xs opacity-70">Six teams · one command center</div>
      </div>

      <div className="flex items-center justify-between mb-2">
        <div><div className="text-xs font-black tracking-[0.2em] opacity-60">🔴 AROUND YOUR TEAMS</div>{stamp && <div className="text-xs opacity-45">Updated {stamp}</div>}</div>
        <button onClick={load} disabled={loading} className="btn-lift rounded-full px-3 py-1.5 text-xs font-black" style={{ background: "#fff", color: ROYAL, opacity: loading ? 0.6 : 1 }}>{loading ? "Loading…" : "Refresh"}</button>
      </div>
      <div className="rounded-3xl p-3 mb-6" style={glassH}>
        {loading && !scores && <div className="text-xs opacity-70 p-2">Pulling the latest scores…</div>}
        {(scores || []).map((x, i) => (
          <div key={i} className="flex items-start gap-2 py-1.5 text-sm border-b last:border-0" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
            <span className="font-black shrink-0" style={{ width: 110 }}>{x.team}</span>
            <span className="opacity-85 flex-1">{x.line}</span>
          </div>
        ))}
        {scores && !scores.length && !loading && <div className="text-xs opacity-70 p-2">Couldn't load scores right now — try Refresh.</div>}
      </div>

      {next && (
        <button onClick={() => setActive(next.key)} className="btn-lift w-full rounded-3xl p-4 mb-3 text-left" style={{ background: `linear-gradient(150deg, ${next.color}22, rgba(6,10,26,0.85))`, border: `1px solid ${next.color}66`, boxShadow: gameDay ? `0 0 26px ${next.color}55` : "0 12px 30px rgba(0,0,0,0.4)", color: "#fff" }}>
          <div className="flex items-center justify-between mb-1">
            <div className="text-xs font-black tracking-[0.2em]" style={{ color: next.color }}>{gameDay ? "🚨 GAME DAY" : "⏱ NEXT UP ACROSS YOUR TEAMS"}</div>
            {next.tag && <span className="text-xs font-black px-2 py-0.5 rounded-full" style={{ background: next.color, color: "#0c1226" }}>{next.tag}</span>}
          </div>
          <div className="text-xl font-black">{next.emoji} {next.team} {next.label}</div>
          <div className="flex items-baseline gap-3 mt-1">
            <div className="text-2xl font-black tabular-nums" style={{ color: next.color }}>{nD > 0 ? `${nD}d ${nH}h ${nM}m` : `${nH}h ${nM}m ${nS}s`}</div>
            <div className="text-xs opacity-65">{next.d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} · {next.d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</div>
          </div>
        </button>
      )}
      <div className="text-xs font-black tracking-[0.2em] opacity-60 mb-2">📅 UNIFIED TIMELINE</div>
      <div className="rounded-3xl p-3 mb-6" style={glassH}>
        {upcoming.slice(0, 14).map((e, i) => (
          <button key={i} onClick={() => setActive(e.key)} className="w-full flex items-center gap-2 py-1.5 text-sm border-b last:border-0 text-left btn-lift" style={{ borderColor: "rgba(255,255,255,0.08)", color: "#fff", background: "transparent" }}>
            <span className="shrink-0">{e.emoji}</span>
            <span className="text-xs font-black shrink-0" style={{ width: 62, color: e.color }}>{e.team}</span>
            <span className="font-bold flex-1 truncate">{e.label}{e.tag && <span className="ml-1.5 font-black px-1.5 py-0.5 rounded-full" style={{ fontSize: 9, background: e.color, color: "#0c1226" }}>{e.tag.toUpperCase()}</span>}</span>
            <span className="text-xs opacity-55 shrink-0">{e.d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
          </button>
        ))}
        <div className="text-xs opacity-45 pt-2 text-center">Every synced game, all teams, in order · Dodgers play daily — see their page. Tap a row to open the team.</div>
      </div>

      <VictoryWatch />

      <div className="text-xs font-black tracking-[0.2em] opacity-60 mb-2">YOUR TEAMS</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {HOME_CARDS.map(c => (
          <button key={c.key} onClick={() => setActive(c.key)} className="btn-lift rounded-3xl p-4 text-left relative overflow-hidden" style={{ background: `linear-gradient(150deg, ${c.c1}, #05060e)`, border: `1px solid ${c.accent}55`, boxShadow: `0 10px 26px rgba(0,0,0,0.4), inset 0 1px 0 ${c.accent}33`, color: "#fff" }}>
            <div className="flex items-center gap-2.5">
              <TeamLogo teamKey={c.key} size={44} />
              <div className="flex-1 min-w-0"><div className="font-black leading-tight">{c.name}</div><div className="text-xs opacity-70">{c.league}</div></div>
              {c.live && <span className="font-black px-2 py-0.5 rounded-full" style={{ fontSize: 10, background: "#ff5b4d", color: "#fff" }}>LIVE</span>}
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <div className="text-2xl font-black" style={{ color: c.accent }}>{c.record}</div>
              <div className="text-xs opacity-70">{c.note}</div>
            </div>
            <div className="text-xs opacity-55 mt-1">Open {c.name} →</div>
          </button>
        ))}
      </div>
      <div className="text-xs opacity-45 mt-4 text-center">Scores auto-load on open (cached ~5 min) and pull live from the web.</div>
    </div>
  );
}

const RETRO_COLORS = {
  eagles: { c1: "#046A38", c2: "#02301a", accent: "#e8e8e8" },
  jazz: { c1: "#5f259f", c2: "#1c0b33", accent: "#7fd4de" },
};

export default function SportsHQ() {
  const [active, setActive] = useStorage("sportshq_team", "home");
  const [retro, setRetro] = useStorage("sportshq_retro", false);
  RETRO_MODE = !!retro;
  const order = ["home", "byufootball", "byubball", "jazz", "mammoth", "eagles", "dodgers"];
  const baseCur = TEAMS[active] || TEAMS.byufootball;
  const cur = retro && RETRO_COLORS[active] ? { ...baseCur, ...RETRO_COLORS[active] } : baseCur;
  const teamBg = active === "byufootball" ? null : active === "home" ? "linear-gradient(180deg, #0a1030 0%, #070a1a 60%, #05060e 100%)" : `linear-gradient(180deg, ${cur.c1} 0%, ${cur.c2} 55%, #05060e 100%)`;
  return (
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
      `}</style>
      {teamBg && <div style={{ position: "fixed", inset: 0, zIndex: 0, background: teamBg }} />}
      {teamBg && <div style={{ position: "fixed", top: "24%", left: "-12%", width: 400, height: 400, background: `radial-gradient(circle, ${cur.accent}55, transparent 70%)`, filter: "blur(55px)", zIndex: 0, pointerEvents: "none" }} />}
      {teamBg && active !== "home" && (<>
        <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%) rotate(-12deg)", opacity: 0.07, zIndex: 0, pointerEvents: "none" }}><TeamLogo teamKey={active} size={440} /></div>
        <div style={{ position: "fixed", bottom: "-4%", right: "-3%", transform: "rotate(14deg)", opacity: 0.05, zIndex: 0, pointerEvents: "none" }}><TeamLogo teamKey={active} size={190} /></div>
      </>)}
      {active === "home" && [
        ["byufootball", { top: "11%", left: "3%" }], ["jazz", { top: "19%", right: "5%" }], ["mammoth", { top: "46%", left: "-3%" }],
        ["eagles", { top: "56%", right: "-3%" }], ["dodgers", { bottom: "7%", left: "9%" }], ["byubball", { bottom: "11%", right: "11%" }],
      ].map(([k, pos], i) => (
        <div key={k} style={{ position: "fixed", ...pos, opacity: 0.05, zIndex: 0, pointerEvents: "none", transform: `rotate(${i % 2 ? 13 : -13}deg)` }}><TeamLogo teamKey={k} size={150} /></div>
      ))}

      <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 70, background: "rgba(6,10,22,0.85)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
        <div className="max-w-2xl mx-auto px-3 py-2 flex items-center gap-1.5 sm:gap-2 overflow-x-auto">
          <span className="hidden sm:inline text-xs font-black tracking-widest shrink-0 mr-1" style={{ color: "#fff" }}>SPORTS HQ</span>
          <button onClick={() => setRetro(r => !r)} title="Throwback logo mode" className="btn-lift px-2.5 py-1.5 rounded-full text-sm sm:text-xs font-black shrink-0" style={retro ? { background: "#ffd75a", color: "#12193a", boxShadow: "0 0 14px rgba(255,215,90,0.5)" } : { background: "rgba(255,255,255,0.12)", color: "#fff", border: "1px solid rgba(255,255,255,0.25)" }}>🕰<span className="hidden sm:inline sm:ml-1">{retro ? "Retro ON" : "Retro"}</span></button>
          {order.map(k => { const home = k === "home"; const t = TEAMS[k]; const on = active === k; const em = home ? "🏠" : t.tab.split(" ")[0]; const lbl = home ? "Home" : t.tab.split(" ").slice(1).join(" "); return <button key={k} onClick={() => setActive(k)} title={home ? "Home" : t.name} className="btn-lift px-2.5 sm:px-3 py-1.5 rounded-full text-sm sm:text-xs font-black whitespace-nowrap shrink-0" style={on ? { background: "#fff", color: "#12193a" } : { background: "rgba(255,255,255,0.12)", color: "#fff", border: "1px solid rgba(255,255,255,0.25)" }}><span>{em}</span>{lbl && <span className="hidden sm:inline sm:ml-1">{lbl}</span>}</button>; })}
        </div>
      </div>

      <div style={{ paddingTop: 50, position: "relative", zIndex: 1 }}>
        {active === "byufootball" ? <BYUFootballHQ /> : (
          <div key={active} className="max-w-2xl mx-auto px-4 pb-16 pt-4" style={{ animation: "teamin .4s cubic-bezier(.2,.7,.2,1)" }}>
            {active === "home" ? <HomeHub setActive={setActive} /> : <TeamPage team={cur} />}
          </div>
        )}
      </div>
    </div>
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
  ],
  byubball: [
    { name: "Brooks Bahr", pos: "G", stars: 3, ret: "2026-27", info: "First returned missionary of the Kevin Young era; Keller (TX) standout who averaged 17/6/6 with offers from Utah, USC, Wake Forest & Nebraska." },
  ],
};

function FootballRoster({ T }) {
  const [retFilter, setRetFilter] = useState("all");
  const [playerOpen, setPlayerOpen] = useState(null);
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
                <div className="flex-1">{r.players[0].includes("·") ? <span className="font-black">{r.players[0]}</span> : <button onClick={() => setPlayerOpen(r.players[0])} className="font-black underline decoration-dotted underline-offset-2 btn-lift" style={{ color: "inherit" }}>{r.players[0]}</button>}{r.players.length > 1 && <span className="opacity-60">{"  ·  " + r.players.slice(1).join("  ·  ")}</span>}</div>
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
            <div className="flex justify-between items-baseline gap-2"><button onClick={() => setPlayerOpen(m.name)} className="font-black text-left underline decoration-dotted underline-offset-2 btn-lift" style={{ color: "inherit" }}>{m.name} <span className="text-xs font-bold opacity-70 no-underline">{m.pos} · {"★".repeat(m.stars)}</span></button><div className="text-xs font-black px-2 py-0.5 rounded-full shrink-0" style={{ ...T.accent, color: T.accentText }}>{m.ret}</div></div>
            <div className="text-xs opacity-80 mt-1">{m.info}</div>
          </div>
        ))}
        {!mishies.length && <div className="text-xs opacity-60 text-center py-3">No returnees in that window.</div>}
      </div>
      {playerOpen && <PlayerModal name={playerOpen} teamName="BYU football team" onClose={() => setPlayerOpen(null)} ui={{ accentColor: "#8ea6ff" }} />}
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
      <div className="text-xs opacity-50 mt-3 text-center">Return year = when each is expected back on campus; exact timing can shift with mission dates. Depth chart is a projected two-deep, starters first.</div>
    </div>
  );
}

function FootballHonors({ T }) {
  const jerseys = ["8 Young", "9 McMahon", "14 Detmer"];
  const awards = [
    ["Ty Detmer", "Heisman Trophy '90 · 2× Davey O'Brien ('90, '91)"],
    ["Jason Buck", "Outland Trophy '86"],
    ["LJ Martin", "Big 12 Offensive Player of the Year '25"],
    ["Bear Bachmeier", "Big 12 Offensive Freshman of the Year '25"],
    ["Kalani Sitake", "Big 12 Coach of the Year '25"],
    ["LaVell Edwards", "College Football Hall of Fame · 257 wins"],
  ];
  return (
    <div className="py-2" style={{ color: T.text }}>
      <div className="rounded-3xl p-4 mb-3 text-center" style={{ ...T.accent, color: T.accentText }}>
        <Label>HONORS WALL</Label>
        <div className="text-lg font-black mt-1">A Century of Cougar Glory</div>
        <div className="text-xs font-bold opacity-75">est. 1922 · LaVell Edwards Stadium</div>
      </div>
      <div className="rounded-3xl p-4 mb-2" style={T.glass}>
        <div className="text-xs font-black tracking-widest mb-2" style={{ color: T.leaderLine }}>CHAMPIONSHIPS</div>
        <div className="flex flex-wrap gap-2">
          <div className="rounded-2xl px-4 py-2.5 text-center" style={{ background: "rgba(255,215,90,0.12)", border: "1.5px solid rgba(255,215,90,0.5)", boxShadow: "0 0 18px rgba(255,215,90,0.2)" }}>
            <div className="text-2xl leading-none">🏆</div>
            <div className="text-sm font-black mt-1">1984</div>
            <div className="text-xs opacity-70">National Champions · 13–0</div>
          </div>
          <div className="rounded-2xl px-4 py-2.5 text-center" style={{ background: "rgba(255,215,90,0.08)", border: "1px solid rgba(255,215,90,0.35)" }}>
            <div className="text-2xl leading-none">🏅</div>
            <div className="text-sm font-black mt-1">20+</div>
            <div className="text-xs opacity-70">Conference titles (WAC/MWC)</div>
          </div>
        </div>
      </div>
      <div className="rounded-3xl p-4 mb-2" style={T.glass}>
        <div className="text-xs font-black tracking-widest mb-2" style={{ color: T.leaderLine }}>HONORED JERSEYS</div>
        <div className="flex flex-wrap gap-3">
          {jerseys.map(r => { const sp = r.split(" "); return <MiniJersey key={r} num={sp[0]} name={sp.slice(1).join(" ")} color={T.leaderLine} />; })}
        </div>
        <div className="text-xs opacity-55 mt-2">BYU honors its legends' numbers rather than formally retiring most of them.</div>
      </div>
      <div className="rounded-3xl p-4" style={T.glass}>
        <div className="text-xs font-black tracking-widest mb-2" style={{ color: T.leaderLine }}>🥇 INDIVIDUAL HARDWARE</div>
        <div className="flex flex-col gap-1.5">
          {awards.map(([nm, aw]) => (
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

function Collapse({ icon, title, children, T, defaultOpen }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="rounded-3xl mb-2 overflow-hidden" style={T.glass}>
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between px-4 py-3.5 font-black text-sm btn-lift" style={{ color: T.text, background: "transparent" }}>
        <span>{icon} {title}</span><span className="opacity-55 text-base">{open ? "▾" : "▸"}</span>
      </button>
      {open && <div className="px-3 pb-3" style={{ animation: "fadein .3s ease" }}>{children}</div>}
    </div>
  );
}

function BYUFootballHQ() {
  const [picks, setPicks] = useStorage("byu26_picks", {});
  const [actuals, setActuals] = useStorage("byu26_actuals", {});
  const [soundOn, setSoundOn] = useStorage("byu26_sound", true);
  const [theme, setTheme] = useStorage("byu26_theme", "night");
  const confettiRef = useRef(null);
  const T = THEMES[theme] || THEMES.night;
  const celebrate = (kind) => { confettiRef.current?.fire(); playFanfare(kind, soundOn); };
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
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%) rotate(-10deg)", opacity: T.watermarkOp + 0.02, pointerEvents: "none", zIndex: 0 }}><TeamLogo teamKey="byufootball" size={440} /></div>
      <ConfettiLayer ref={confettiRef} />

      <div className="max-w-2xl mx-auto px-4 pb-12 relative" style={{ zIndex: 1 }}>
        <div className="pt-8 pb-4 text-center flex flex-col items-center relative">
          <button onClick={() => setTheme(v => v === "night" ? "day" : "night")} title="toggle theme" className="btn-lift absolute left-0 top-8 w-11 h-11 rounded-full text-lg" style={toggleBtn}>{theme === "night" ? "☀️" : "🌙"}</button>
          <button onClick={() => setSoundOn(s => !s)} title="toggle sound" className="btn-lift absolute right-0 top-8 w-11 h-11 rounded-full text-lg" style={toggleBtn}>{soundOn ? "🔊" : "🔇"}</button>
          <div className="mb-2"><TeamLogo teamKey="byufootball" size={60} /></div>
          <div className="text-xs font-black tracking-[0.4em]" style={{ color: "#3a56c8" }}>BRIGHAM YOUNG UNIVERSITY</div>
          <h1 className="text-5xl sm:text-6xl font-black tracking-tight" style={{ background: "linear-gradient(120deg,#0a1130 0%, #2A4FE0 55%, #6E8BFF 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", letterSpacing: "-1.5px" }}>COUGAR HQ '26</h1>
          <div className="text-sm font-black tracking-[0.25em] mt-0.5" style={{ color: "#2a3aa0" }}>RISE AND SHOUT</div>
        </div>

        <Countdown T={T} />
        <Collapse icon="📋" title="Playbook — Offense & Defense" T={T} defaultOpen><Playbook T={T} /></Collapse>
        <Collapse icon="🎯" title="Recruiting Tracker" T={T} defaultOpen><Recruiting T={T} /></Collapse>
        <Collapse icon="🏈" title="Schedule & Hype Board" T={T}><Schedule T={T} /></Collapse>
        <Collapse icon="✅" title="Pick'Em" T={T}><PickEm picks={picks} setPicks={setPicks} actuals={actuals} setActuals={setActuals} celebrate={celebrate} T={T} /></Collapse>
        <Collapse icon="📊" title="Season Projections" T={T}><Dashboard picks={picks} T={T} /></Collapse>
        <Collapse icon="📈" title="Stats & Analytics" T={T}><Analytics T={T} /></Collapse>
        <Collapse icon="🧬" title="Roster & Missionaries" T={T}><FootballRoster T={T} /></Collapse>
        <Collapse icon="🏆" title="Honors Wall" T={T}><FootballHonors T={T} /></Collapse>
        <Collapse icon="🐾" title="Ask Cosmo" T={T}><AskCosmo T={T} /></Collapse>
      </div>
    </div>
  );
}
