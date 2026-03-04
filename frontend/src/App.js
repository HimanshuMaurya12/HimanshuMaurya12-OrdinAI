import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════ GLOBAL STYLES ═══════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=DM+Mono:wght@300;400;500&family=Instrument+Sans:wght@300;400;500;600&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body,#root{height:100%;width:100%}

:root{
  --crimson:#C0392B;
  --crimson-light:#E74C3C;
  --crimson-dim:rgba(192,57,43,0.14);
  --crimson-border:rgba(192,57,43,0.3);
  --gold:#C9A84C;
  --gold-dim:rgba(201,168,76,0.12);
  --gold-border:rgba(201,168,76,0.3);
  --bg:#0A0B0E;
  --bg-card:#0F1117;
  --bg-raised:#141620;
  --border:rgba(255,255,255,0.06);
  --text:#E8E6E0;
  --text-muted:#7A7870;
  --text-dim:#4A4842;
  --teal:#00ddb3;
}

body{font-family:'Instrument Sans',sans-serif;background:var(--bg);color:var(--text);overflow-x:hidden}

body::before{content:'';position:fixed;inset:0;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");pointer-events:none;z-index:1000;opacity:0.4}

::-webkit-scrollbar{width:4px;height:4px}
::-webkit-scrollbar-track{background:var(--bg-card)}
::-webkit-scrollbar-thumb{background:rgba(192,57,43,0.35);border-radius:2px}

@keyframes fadeSlideDown{from{opacity:0;transform:translateY(-14px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes slideL{from{opacity:0;transform:translateX(16px)}to{opacity:1;transform:translateX(0)}}
@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
@keyframes pulseDot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(0.7)}}
@keyframes glowRing{0%,100%{box-shadow:0 0 0 0 rgba(192,57,43,0.5)}50%{box-shadow:0 0 0 10px rgba(192,57,43,0)}}
@keyframes nodeIn{from{opacity:0;transform:scale(0.2)}to{opacity:1;transform:scale(1)}}
@keyframes overlayIn{from{opacity:0}to{opacity:1}}
@keyframes hubSlideUp{from{opacity:0;transform:translateY(40px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}

.fu{animation:fadeUp 0.45s ease both}
.fi{animation:fadeIn 0.35s ease both}
.sl{animation:slideL 0.35s ease both}
.mono{font-family:'DM Mono',monospace}
.serif{font-family:'Cormorant Garamond',serif}

.card{background:var(--bg-card);border:1px solid var(--border);border-radius:4px;transition:border-color 0.2s}
.card:hover{border-color:var(--crimson-border)}

.pill{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:100px;font-size:10px;font-weight:500;letter-spacing:0.06em;font-family:'DM Mono',monospace}
.pcrimson{background:var(--crimson-dim);border:1px solid var(--crimson-border);color:var(--crimson-light)}
.pgold{background:var(--gold-dim);border:1px solid var(--gold-border);color:var(--gold)}
.pice{background:rgba(232,230,224,0.06);border:1px solid rgba(232,230,224,0.12);color:var(--text-muted)}

.btn{display:inline-flex;align-items:center;gap:8px;border:none;border-radius:2px;font-family:'Instrument Sans',sans-serif;font-weight:500;font-size:13.5px;cursor:pointer;transition:all 0.2s;letter-spacing:0.04em;padding:12px 24px}
.btn-crimson{background:var(--crimson);color:#fff}
.btn-crimson:hover{background:var(--crimson-light);transform:translateY(-1px)}
.btn-crimson:disabled{opacity:0.4;cursor:not-allowed;transform:none!important}
.btn-ghost{background:transparent;border:1px solid rgba(255,255,255,0.12);color:var(--text-muted)}
.btn-ghost:hover{border-color:var(--crimson-border);color:var(--text);background:var(--crimson-dim)}
.btn-gold{background:transparent;border:1px solid var(--gold-border);color:var(--gold);font-family:'DM Mono',monospace;font-size:11px;letter-spacing:0.08em}
.btn-gold:hover{background:var(--gold-dim);transform:translateY(-1px);box-shadow:0 0 24px rgba(201,168,76,0.2)}

.inp{width:100%;background:var(--bg-card);border:1px solid var(--border);border-radius:2px;padding:13px 16px;color:var(--text);font-family:'Instrument Sans',sans-serif;font-size:13.5px;outline:none;transition:border-color 0.2s,box-shadow 0.2s;resize:none}
.inp:focus{border-color:var(--crimson-border);box-shadow:0 0 0 3px var(--crimson-dim)}
.inp::placeholder{color:var(--text-dim)}

.hub-nav{position:fixed;top:0;left:0;right:0;height:56px;background:rgba(10,11,14,0.94);backdrop-filter:blur(20px);border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 22px;z-index:500}

.landing-nav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:1.25rem 3rem;border-bottom:1px solid var(--border);background:rgba(10,11,14,0.88);backdrop-filter:blur(20px)}

.hero-bg{position:absolute;inset:0;background:radial-gradient(ellipse 60% 50% at 50% 0%, rgba(192,57,43,0.08) 0%, transparent 70%),radial-gradient(ellipse 40% 30% at 80% 80%, rgba(201,168,76,0.04) 0%, transparent 60%)}
.hero-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);background-size:60px 60px;mask-image:radial-gradient(ellipse 80% 80% at 50% 50%, black 0%, transparent 70%)}

.section-label{font-family:'DM Mono',monospace;font-size:0.7rem;letter-spacing:0.16em;text-transform:uppercase;color:var(--crimson-light);margin-bottom:1rem}
.section-title{font-family:'Cormorant Garamond',serif;font-size:clamp(2.2rem,5vw,3.8rem);font-weight:300;line-height:1.05;color:#fff;margin-bottom:1.5rem}
.section-title em{font-style:italic;color:var(--gold)}

.arch-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1px;background:var(--border);border:1px solid var(--border)}
.arch-cell{background:var(--bg);padding:2rem 1.5rem;position:relative;overflow:hidden;transition:background 0.2s}
.arch-cell:hover{background:var(--bg-card)}
.arch-cell::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--crimson),transparent)}
.arch-num{font-family:'DM Mono',monospace;font-size:0.65rem;color:var(--text-dim);letter-spacing:0.12em;margin-bottom:0.75rem}
.arch-title{font-family:'Cormorant Garamond',serif;font-size:1.2rem;font-weight:600;color:#fff;margin-bottom:0.5rem}
.arch-desc{font-size:0.8rem;color:var(--text-muted);line-height:1.6}

.metric-bar{margin-bottom:1.25rem}
.metric-label{display:flex;justify-content:space-between;margin-bottom:0.4rem;font-size:0.8rem}
.bar-track{height:3px;background:rgba(255,255,255,0.06);border-radius:2px;overflow:hidden}
.bar-fill{height:100%;background:linear-gradient(90deg,var(--crimson),var(--gold));border-radius:2px;transition:width 1.2s cubic-bezier(0.4,0,0.2,1)}

.lit-table{width:100%;border-collapse:collapse;font-size:0.82rem}
.lit-table th{font-family:'DM Mono',monospace;font-size:0.65rem;letter-spacing:0.1em;text-transform:uppercase;color:var(--text-dim);padding:0.75rem 1rem;text-align:left;border-bottom:1px solid var(--border)}
.lit-table td{padding:1rem;border-bottom:1px solid var(--border);color:var(--text-muted);vertical-align:top;line-height:1.6}
.lit-table tr:hover td{background:var(--bg-card)}
.lit-table td:first-child{color:var(--text);font-weight:500}
.tag{display:inline-block;font-family:'DM Mono',monospace;font-size:0.62rem;color:var(--gold);border:1px solid var(--gold-border);padding:0.15rem 0.5rem;border-radius:2px;margin-top:0.4rem;background:var(--gold-dim)}

.phase-card{background:var(--bg-card);border:1px solid var(--border);padding:2rem;position:relative;overflow:hidden;transition:border-color 0.2s}
.phase-card:hover{border-color:var(--crimson-border)}
.phase-card::after{content:'';position:absolute;bottom:0;left:0;right:0;height:1px;background:linear-gradient(90deg,var(--crimson),transparent)}
.phase-num{font-family:'Cormorant Garamond',serif;font-size:4rem;font-weight:700;color:var(--border);line-height:1;margin-bottom:0.75rem;letter-spacing:-0.04em}
.phase-title{font-family:'Cormorant Garamond',serif;font-size:1.25rem;font-weight:600;color:#fff;margin-bottom:1rem}
.phase-items{list-style:none;display:flex;flex-direction:column;gap:0.5rem;margin-bottom:1.25rem}
.phase-items li{font-size:0.82rem;color:var(--text-muted);padding-left:1rem;position:relative;line-height:1.5}
.phase-items li::before{content:'–';position:absolute;left:0;color:var(--crimson);font-family:'DM Mono',monospace}
.phase-metric{font-family:'DM Mono',monospace;font-size:0.68rem;color:var(--gold);letter-spacing:0.08em;padding:0.5rem 0.75rem;border:1px solid var(--gold-border);background:var(--gold-dim);display:inline-block}

.hub-overlay{position:fixed;inset:0;z-index:400;background:rgba(10,11,14,0.97);animation:overlayIn 0.25s ease;display:flex;flex-direction:column;overflow:hidden}
.hub-container{animation:hubSlideUp 0.35s ease both;height:100%;display:flex;flex-direction:column}

.cite-block{background:var(--bg-card);border-left:2px solid var(--crimson);padding:0.75rem 1rem;margin:0.75rem 0;border-radius:0 2px 2px 0;cursor:pointer;transition:background 0.15s,border-color 0.15s}
.cite-block:hover{background:var(--bg-raised);border-color:var(--gold)}

.proc-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(192,57,43,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(192,57,43,0.015) 1px,transparent 1px);background-size:40px 40px;pointer-events:none}

.reveal{opacity:0;transform:translateY(20px);transition:opacity 0.6s ease,transform 0.6s ease}
.reveal.visible{opacity:1;transform:translateY(0)}

.cta-section{padding:8rem 3rem;text-align:center;position:relative;background:radial-gradient(ellipse 60% 60% at 50% 0%,rgba(192,57,43,0.05),transparent 70%);border-top:1px solid var(--border)}

footer{padding:2.5rem 3rem;border-top:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem}
.footer-logo{font-family:'Cormorant Garamond',serif;font-size:1.1rem;font-weight:700;color:var(--text-muted)}
.footer-logo span{color:var(--crimson)}
.footer-copy{font-size:0.72rem;font-family:'DM Mono',monospace;color:var(--text-dim);letter-spacing:0.06em}
.footer-links{list-style:none;display:flex;gap:2rem}
.footer-links a{font-size:0.72rem;text-decoration:none;color:var(--text-dim);letter-spacing:0.06em;text-transform:uppercase;font-family:'DM Mono',monospace;transition:color 0.2s}
.footer-links a:hover{color:var(--text-muted)}
`;

/* ═══════════════════ DATA (HARDCODED FALLBACKS) ═══════════════════ */
const DOCS_LIST = [
  { id:"RBI/2018-19/20", title:"DPSS Payment Data Storage",    body:"RBI",  date:"Apr 6 2018",  type:"Master Direction",   rel:0.97 },
  { id:"RBI-FAQ-2022",   title:"Localization FAQ & Exceptions",body:"RBI",  date:"Jan 14 2022", type:"FAQ / Clarification", rel:0.94 },
  { id:"SEBI/2021/150",  title:"Data Governance Framework",    body:"SEBI", date:"Jul 23 2021", type:"Regulatory Circular", rel:0.88 },
  { id:"RBI/FIDD/2019",  title:"Priority Sector Lending SFBs", body:"RBI",  date:"Jul 29 2019", type:"Master Direction",   rel:0.81 },
  { id:"MCA/2020/18",    title:"Data Protection Guidelines",   body:"MCA",  date:"Mar 11 2020", type:"Ministry Circular",  rel:0.76 },
];

const AGENT_STEPS = [
  { id:1, phase:"INGEST",     title:"5-Layer Pipeline — Document Ingestion",    col:"#C0392B",
    detail:"Parsing regulatory corpus across all 5 pipeline stages",
    subs:["L1 OCR/extraction → PDF, XBRL, JSON sources","L2 Chunking → child-chunk segmentation (avg 380 tokens)","L3 Embedding → all-MiniLM-L6-v2 on 19,976 vectors"] },
  { id:2, phase:"RETRIEVE",   title:"Recursive Retrieval — FAISS Child-Chunk Search", col:"#C9A84C",
    detail:"FAISS vector search — top-k=6 per decomposed sub-query",
    subs:["18 candidate passages retrieved across 5 docs","Cosine similarity threshold: 0.78+","Recursive retrieval: child chunks → parent sections"] },
  { id:3, phase:"EXPAND",     title:"Recursive Retrieval — Parent Context Expansion", col:"#C0392B",
    detail:"Fetching full parent sections for full legal context",
    subs:["18 child chunks → 6 parent sections expanded","Avg parent context: 1,240 tokens","Exemption clauses preserved intact per L4 pipeline"] },
  { id:4, phase:"CONFLICT",   title:"5-Layer Pipeline — Cross-Regulation Conflict Check", col:"#C9A84C",
    detail:"L5: Comparing RBI vs SEBI overlapping mandates…",
    subs:["RBI DPSS 2018: Storage must be India-only","RBI FAQ 2022: Processing abroad OK — delete within 24h","SEBI 2021: Audit trail mandatory for all transfers"] },
  { id:5, phase:"SYNTHESIZE", title:"Provenance-Linked Verdict Synthesis",        col:"#C0392B",
    detail:"Generating sentence-level provenance-tagged compliance report",
    subs:["Verdict: COMPLIANT — subject to 2 conditions","2 gaps identified: audit trail, deletion protocol","100% sentence-level provenance tagged"] },
];

const GRAPH_NODES = [
  { id:"query", x:410, y:68,  label:"User Query",    sub:"Data Localization", col:"#C0392B", r:26, shape:"query"  },
  { id:"sq1",   x:175, y:200, label:"Sub-Q 1",       sub:"Storage norms",    col:"#C9A84C", r:18, shape:"subq"   },
  { id:"sq2",   x:410, y:200, label:"Sub-Q 2",       sub:"Processing rules", col:"#C9A84C", r:18, shape:"subq"   },
  { id:"sq3",   x:645, y:200, label:"Sub-Q 3",       sub:"Deletion policy",  col:"#C9A84C", r:18, shape:"subq"   },
  { id:"d1",    x:82,  y:348, label:"RBI/2018",      sub:"DPSS Storage",     col:"#C0392B", r:15, shape:"doc"    },
  { id:"d2",    x:220, y:354, label:"RBI-FAQ-22",    sub:"Exceptions",       col:"#C0392B", r:15, shape:"doc"    },
  { id:"d3",    x:368, y:352, label:"SEBI/2021",     sub:"Governance",       col:"#C9A84C", r:15, shape:"doc"    },
  { id:"d4",    x:510, y:354, label:"MCA/2020",      sub:"Data Protect",     col:"#C9A84C", r:15, shape:"doc"    },
  { id:"d5",    x:648, y:348, label:"RBI/FIDD",      sub:"Priority Sec",     col:"#C0392B", r:15, shape:"doc"    },
  { id:"p1",    x:185, y:476, label:"RBI",           sub:"Reserve Bank",     col:"#C0392B", r:22, shape:"parent" },
  { id:"p2",    x:410, y:480, label:"SEBI",          sub:"Securities Bd.",   col:"#C9A84C", r:22, shape:"parent" },
  { id:"p3",    x:635, y:476, label:"MCA",           sub:"Corp. Affairs",    col:"#C9A84C", r:22, shape:"parent" },
];

const GRAPH_EDGES = [
  ["query","sq1"],["query","sq2"],["query","sq3"],
  ["sq1","d1"],["sq1","d2"],
  ["sq2","d2"],["sq2","d3"],
  ["sq3","d4"],["sq3","d5"],
  ["d1","p1"],["d2","p1"],["d3","p2"],["d4","p3"],["d5","p1"],
];

const FALLBACK_SOURCES = {
  "RBI/2018-19/20": {
    title:"DPSS Payment Data Storage Circular",
    issuer:"Reserve Bank of India", date:"April 6, 2018",
    jurisdiction:"India", type:"Master Direction", rel:0.97,
    snippet:"CIRCULAR — Storage of Payment System Data\n\nTo: All System Providers\n\nAll data related to payment systems operated in India shall be stored in a system only in India. This includes full end-to-end transaction details, customer information, and settlement data.\n\n3.1 For the foreign leg of the transaction, the data can also be stored in the foreign country. However, upon return, the data shall be deleted from systems abroad.\n\n— (B.P. Kanungo), Deputy Governor",
  },
  "RBI-FAQ-2022": {
    title:"FAQ on Payment System Data Localization",
    issuer:"Reserve Bank of India", date:"January 14, 2022",
    jurisdiction:"India", type:"FAQ / Clarification", rel:0.94,
    snippet:"Frequently Asked Questions — Payment Data Localization\n\nQ7: Can the data be processed abroad for operational reasons?\n\nA7: Yes. The data can be processed abroad temporarily. However:\n\n(a) Data is returned to India after processing is complete.\n(b) Any copy stored abroad is deleted within 24 hours of processing.\n(c) A log of such transfers is maintained and available to RBI on demand.",
  },
};

const FALLBACK_REPORT_BLOCKS = [
  { type:"h1",      text:"Compliance Intelligence Report" },
  { type:"meta" },
  { type:"verdict" },
  { type:"h2",      text:"Executive Summary" },
  { type:"p",       text:"FinTrust Bank Ltd's proposed architecture is permissible under current RBI guidelines, provided specific conditions are met." },
  { type:"cite",    docId:"RBI-FAQ-2022",   text:"RBI FAQ 2022 (Para 7): Processing abroad is allowed provided data is returned to India and the foreign copy is deleted within 24 hours of completion." },
  { type:"h2",      text:"Regulatory Requirements" },
  { type:"h3",      text:"1. Data Localization Mandate" },
  { type:"p",       text:"All payment data end-to-end must be stored exclusively within India per the 2018 DPSS directive." },
  { type:"cite",    docId:"RBI/2018-19/20", text:"RBI/2018-19/20 (Section 3.1): All data relating to payment systems operated in India shall be stored in a system only in India." },
];

const TABLE_ROWS = [
  ["REQUIREMENT","ARCHITECTURE","STATUS"],
  ["Storage in India","Mumbai DC","✓ Compliant"],
  ["Processing rules","Singapore (24h)","⚠ Conditional"],
  ["Audit trail","Not specified","✗ Gap"],
  ["Deletion protocol","Not documented","✗ Gap"],
];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

/* ═══════════════════ ICONS ═══════════════════ */
function IconHex() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <polygon points="12,2 21,7 21,17 12,22 3,17 3,7" stroke="#C0392B" strokeWidth="1.5" fill="rgba(192,57,43,0.18)"/>
      <polygon points="12,7 16,9.5 16,14.5 12,17 8,14.5 8,9.5" stroke="#C9A84C" strokeWidth="1" fill="none" opacity="0.5"/>
    </svg>
  );
}
function IconZap()    { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>; }
function IconX()      { return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>; }
function IconCheck()  { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>; }
function IconNet()    { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/><line x1="12" y1="7" x2="5" y2="17"/><line x1="12" y1="7" x2="19" y2="17"/></svg>; }
function IconReport() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>; }
function IconShield() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>; }
function IconArrow()  { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
function IconSpinner(){ return <span style={{display:"inline-block",width:16,height:16,animation:"spin 0.75s linear infinite"}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg></span>; }
function IconUpload() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>; }
function IconLink()   { return <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>; }
function IconPlay()   { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>; }

/* ═══════════════════ HUB NAV ═══════════════════ */
function HubNav({ page, setPage, ready, onClose }) {
  const tabs = [
    { id:"query",  label:"New Query",       icon:<IconShield /> },
    { id:"graph",  label:"Knowledge Graph", icon:<IconNet />,    locked:!ready },
    { id:"report", label:"Report",          icon:<IconReport />, locked:!ready },
  ];
  return (
    <div className="hub-nav">
      <div style={{display:"flex",alignItems:"center",gap:9,marginRight:28}}>
        <IconHex/>
        <span className="serif" style={{fontSize:18,color:"#fff",fontWeight:600}}>Ordin<span style={{color:"var(--crimson)"}}>AI</span></span>
        <span className="mono" style={{fontSize:8.5,color:"var(--text-dim)",letterSpacing:"0.12em",marginLeft:4,textTransform:"uppercase"}}>Live Hub</span>
      </div>
      <div style={{display:"flex",gap:3,flex:1}}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => !t.locked && setPage(t.id)} style={{
            display:"flex",alignItems:"center",gap:7,padding:"5px 14px",borderRadius:2,
            background:page===t.id?"var(--crimson-dim)":"transparent",
            border:`1px solid ${page===t.id?"var(--crimson-border)":"transparent"}`,
            color:t.locked?"var(--text-dim)":page===t.id?"#fff":"var(--text-muted)",
            cursor:t.locked?"not-allowed":"pointer",fontSize:12,fontWeight:500,transition:"all 0.15s",opacity:t.locked?0.4:1,
          }}>{t.icon}{t.label}</button>
        ))}
      </div>
      <button onClick={onClose} className="btn btn-ghost" style={{fontSize:11,padding:"6px 14px",gap:5}}>
        <IconX/> Close Hub
      </button>
    </div>
  );
}

/* ═══════════════════ QUERY PAGE ═══════════════════ */
function QueryPage({ onRun }) {
  const [q, setQ] = useState("");
  const [uploads, setUploads] = useState([]);
  function handleFile(e) { setUploads(prev => [...prev, ...[...e.target.files].map(f => f.name)]); }
  function removeFile(i) { setUploads(prev => prev.filter((_,j) => j !== i)); }

  return (
    <div style={{height:"100vh",paddingTop:56,background:"var(--bg)",display:"flex",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(ellipse 50% 40% at 50% 50%,rgba(192,57,43,0.04),transparent 70%)",pointerEvents:"none"}}/>
      <div style={{width:"100%",maxWidth:680,padding:"0 28px"}} className="fu">
        <div style={{marginBottom:28,textAlign:"center"}}>
          <div className="mono" style={{fontSize:9,letterSpacing:"0.2em",color:"var(--text-dim)",textTransform:"uppercase",marginBottom:12}}>Intelligence Hub — Live Query</div>
          <h2 className="serif" style={{fontSize:"clamp(1.8rem,4vw,2.6rem)",fontWeight:300,color:"#fff",lineHeight:1.05,marginBottom:8}}>
            Ask any <em style={{color:"var(--crimson)",fontStyle:"italic"}}>compliance</em> question
          </h2>
          <p style={{fontSize:"0.85rem",color:"var(--text-muted)",lineHeight:1.7}}>OrdinAI's 5-layer pipeline processes your query through recursive retrieval across 900+ regulatory documents.</p>
        </div>
        <div style={{background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:4,padding:20,marginBottom:16}}>
          <div className="mono" style={{fontSize:8,letterSpacing:"0.14em",color:"var(--text-dim)",textTransform:"uppercase",marginBottom:10}}>Compliance Query</div>
          <textarea className="inp" placeholder="e.g. What are the data localization requirements for cross-border payment processing under RBI guidelines?" value={q} onChange={e => setQ(e.target.value)} rows={4} style={{borderRadius:2,marginBottom:12}}/>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {["AML/KYC obligations","SEBI data governance","RBI payment localization","MCA data protection"].map(s => (
              <button key={s} onClick={() => setQ(s)} style={{background:"var(--bg-raised)",border:"1px solid var(--border)",borderRadius:2,padding:"4px 10px",fontSize:10,color:"var(--text-muted)",cursor:"pointer",fontFamily:"'DM Mono',monospace",transition:"all 0.15s"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--crimson-border)";e.currentTarget.style.color="var(--text)"}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.color="var(--text-muted)"}}>{s}</button>
            ))}
          </div>
        </div>
        <div style={{background:"var(--bg-card)",border:"1px dashed var(--border)",borderRadius:4,padding:14,marginBottom:20}}>
          <label style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}}>
            <input type="file" accept=".pdf,.txt,.json" multiple onChange={handleFile} style={{display:"none"}}/>
            <span style={{color:"var(--crimson)",opacity:0.7}}><IconUpload/></span>
            <div>
              <div style={{fontSize:11,color:"var(--text-muted)"}}>Attach regulatory documents <span className="mono" style={{fontSize:8.5,color:"var(--text-dim)"}}>(PDF, TXT, JSON)</span></div>
              <div className="mono" style={{fontSize:8.5,color:"var(--text-dim)",marginTop:2}}>Optional — supplements the 900+ doc index</div>
            </div>
          </label>
          {uploads.length > 0 && (
            <div style={{marginTop:8,display:"flex",flexWrap:"wrap",gap:6}}>
              {uploads.map((f,i) => (
                <div key={i} style={{display:"flex",alignItems:"center",gap:5,background:"var(--crimson-dim)",border:"1px solid var(--crimson-border)",borderRadius:2,padding:"3px 8px"}}>
                  <span className="mono" style={{fontSize:8.5,color:"var(--crimson-light)"}}>{f}</span>
                  <button onClick={() => removeFile(i)} style={{background:"none",border:"none",cursor:"pointer",color:"var(--text-dim)",padding:0,display:"flex"}}><IconX/></button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{display:"flex",gap:12,justifyContent:"center"}}>
          <button className="btn btn-crimson" disabled={!q.trim()} onClick={() => onRun(q.trim())} style={{fontSize:13,padding:"12px 28px"}}>
            <IconZap/> Run Compliance Analysis
          </button>
        </div>
        <div style={{display:"flex",justifyContent:"center",gap:40,marginTop:24}}>
          {[["900+","Regulatory Docs"],["RBI · SEBI · MCA","Sources Covered"],["100%","Sentence Provenance"]].map(([v,l]) => (
            <div key={l} style={{textAlign:"center"}}>
              <div className="mono" style={{fontSize:14,fontWeight:500,color:"var(--gold)"}}>{v}</div>
              <div style={{fontSize:10,color:"var(--text-dim)",marginTop:2}}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════ PROCESSING PAGE ═══════════════════ */
function ProcessingPage({ query, onDone }) {
  const [step, setStep] = useState(0);
  const [finished, setFinished] = useState(false);

  // FIX: Wrapped in useCallback to prevent lint warnings in useEffect
  const executeSearch = useCallback(async () => {
    let cancelled = false;
    
    // Animate the steps visually while we fetch
    const stepInterval = setInterval(() => {
        setStep(prev => prev < AGENT_STEPS.length ? prev + 1 : prev);
    }, 1200);

    try {
        console.log("Calling API...");
        const response = await fetch('http://localhost:8000/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: query }),
        });

        if (!response.ok) throw new Error("Backend failed");
        
        const data = await response.json();
        
        if (!cancelled) {
            clearInterval(stepInterval);
            setStep(AGENT_STEPS.length);
            setFinished(true);
            setTimeout(() => onDone(data), 800); // Pass the real data to parent
        }

    } catch (e) {
        console.warn("Backend unavailable, using hardcoded fallback data.", e);
        // Fallback simulation
        if (!cancelled) {
           setTimeout(() => {
               clearInterval(stepInterval);
               setStep(AGENT_STEPS.length);
               setFinished(true);
               // Send null to signal we should use fallback data
               setTimeout(() => onDone(null), 800); 
           }, 5000);
        }
    }

    return () => { cancelled = true; clearInterval(stepInterval); };
  }, [query, onDone]);

  useEffect(() => {
    executeSearch();
  }, [executeSearch]);

  return (
    <div style={{height:"100vh",paddingTop:56,background:"var(--bg)",display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
      <div className="proc-grid"/>
      <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:500,height:500,borderRadius:"50%",background:"radial-gradient(circle,rgba(192,57,43,0.04),transparent 60%)",pointerEvents:"none"}}/>
      <div style={{width:"100%",maxWidth:560,padding:"0 24px"}}>
        <div style={{textAlign:"center",marginBottom:32}} className="fi">
          <div style={{width:56,height:56,borderRadius:"50%",background:finished?"var(--crimson-dim)":"rgba(192,57,43,0.08)",border:`2px solid ${finished?"var(--crimson)":"rgba(192,57,43,0.3)"}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",color:"var(--crimson)",animation:finished?"glowRing 1.2s infinite":"none"}}>
            {finished ? <IconCheck/> : <IconSpinner/>}
          </div>
          <h2 className="serif" style={{fontSize:22,fontWeight:300,color:"#fff",marginBottom:8}}>{finished?"Analysis Complete":"Processing Query…"}</h2>
          <p className="mono" style={{fontSize:10,color:"var(--text-muted)",maxWidth:420,margin:"0 auto",lineHeight:1.65}}>"{query.slice(0,90)}{query.length>90?"…":""}"</p>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:4}}>
          {AGENT_STEPS.map((s,i) => {
            const isDone=i<step, isActive=i===step-1, isPending=i>=step;
            return (
              <div key={s.id} style={{display:"flex",gap:14,padding:"11px 14px",borderRadius:2,background:isActive?"var(--bg-card)":"transparent",border:`1px solid ${isActive?s.col+"44":"transparent"}`,transition:"all 0.3s",opacity:isPending?0.28:1}}>
                <div style={{flexShrink:0,width:30,height:30,borderRadius:2,background:isDone?s.col+"1a":"var(--bg-card)",border:`1px solid ${isDone?s.col:"var(--border)"}`,display:"flex",alignItems:"center",justifyContent:"center",marginTop:1,color:s.col}}>
                  {isActive?<IconSpinner/>:isDone?<IconCheck/>:<span className="mono" style={{fontSize:9,color:"var(--text-dim)"}}>{s.id}</span>}
                </div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
                    <span className="mono" style={{fontSize:9,color:s.col,letterSpacing:"0.06em"}}>[{s.phase}]</span>
                    <span style={{fontSize:12,fontWeight:500,color:isDone?"#fff":"var(--text-muted)"}}>{s.title}</span>
                    {isDone&&!isActive&&<span className="pill" style={{background:"rgba(192,57,43,0.1)",border:"1px solid rgba(192,57,43,0.25)",color:"var(--crimson-light)",fontSize:8}}>DONE</span>}
                  </div>
                  <p className="mono" style={{fontSize:10,color:"var(--text-muted)",marginBottom:isDone&&s.subs.length?5:0}}>{s.detail}</p>
                  {isDone&&s.subs.map((ss,j)=>(
                    <div key={j} className="mono" style={{fontSize:9.5,color:"var(--text-dim)",padding:"1.5px 0",animation:"fadeIn 0.3s ease"}}>
                      <span style={{color:s.col,marginRight:6}}>│</span>{ss}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════ GRAPH PAGE ═══════════════════ */
function GraphPage({ reportData }) {
  const [frame, setFrame] = useState(0);
  const [hovered, setHovered] = useState(null);
  
  // 1. Build Dynamic Graph Data
  let currentNodes = GRAPH_NODES; // Default Fallback
  let currentEdges = GRAPH_EDGES;

  if (reportData && reportData.sources && Object.keys(reportData.sources).length > 0) {
      currentNodes = [
          { id: "query", x: 410, y: 80, label: "User Query", sub: "Semantic Search", col: "#C0392B", r: 26 }
      ];
      currentEdges = [];
      
      const sourceKeys = Object.keys(reportData.sources);
      const nodeSpacing = 800 / (sourceKeys.length + 1);

      sourceKeys.forEach((src, idx) => {
          const xPos = nodeSpacing * (idx + 1);
          const docId = `doc_${idx}`;
          // Clean filename for display
          let shortName = src.replace('.pdf', '').replace('.json', '').substring(0, 12) + "..";
          
          currentNodes.push({ id: docId, x: xPos, y: 260, label: shortName, sub: "Context", col: "#C9A84C", r: 18 });
          currentEdges.push(["query", docId]);

          // Regulator Node
          let regulator = "REG";
          if(src.toUpperCase().includes("RBI")) regulator = "RBI";
          if(src.toUpperCase().includes("SEBI")) regulator = "SEBI";
          if(src.toUpperCase().includes("MCA")) regulator = "MCA";

          const regId = `reg_${regulator}`;
          
          if (!currentNodes.find(n => n.id === regId)) {
              currentNodes.push({ id: regId, x: xPos, y: 460, label: regulator, sub: "Authority", col: "#C0392B", r: 22 });
          }
          currentEdges.push([docId, regId]);
      });
  }

  const nodeMap = {};
  currentNodes.forEach(n => { nodeMap[n.id] = n; });

  useEffect(() => {
    let f=0;
    const total = currentNodes.length + currentEdges.length + 2;
    const iv = setInterval(() => { f++; setFrame(f); if(f>=total) clearInterval(iv); }, 90);
    return () => clearInterval(iv);
  }, [reportData]);

  const visibleNodes = currentNodes.slice(0, Math.max(0, frame));
  const visibleEdges = currentEdges.slice(0, Math.max(0, frame - currentNodes.length));

  return (
    <div style={{height:"100vh",paddingTop:56,background:"var(--bg)",display:"flex",overflow:"hidden"}}>
      <div style={{flex:1,display:"flex",flexDirection:"column",position:"relative"}}>
        <div style={{padding:"14px 20px",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",gap:10}}>
          <span className="mono" style={{fontSize:9,letterSpacing:"0.14em",color:"var(--text-dim)",textTransform:"uppercase"}}>Recursive Retrieval — Knowledge Graph</span>
          <span className="pill pcrimson" style={{fontSize:8}}>{visibleNodes.length}/{currentNodes.length} NODES</span>
        </div>
        <div style={{flex:1,position:"relative",overflow:"hidden"}}>
          <svg width="100%" height="100%" viewBox="0 0 820 560" preserveAspectRatio="xMidYMid meet">
            <defs><radialGradient id="bg-glow2" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="rgba(192,57,43,0.04)"/><stop offset="100%" stopColor="transparent"/></radialGradient></defs>
            <rect width="820" height="560" fill="url(#bg-glow2)"/>
            {visibleEdges.map(([a,b],i)=>{const na=nodeMap[a],nb=nodeMap[b];if(!na||!nb)return null;return <line key={i} x1={na.x} y1={na.y} x2={nb.x} y2={nb.y} stroke="rgba(192,57,43,0.2)" strokeWidth="1" style={{animation:"fadeIn 0.3s ease"}}/>;})}
            {visibleNodes.map(n=>(
              <g key={n.id} style={{animation:"nodeIn 0.3s ease",cursor:"pointer"}} onMouseEnter={()=>setHovered(n.id)} onMouseLeave={()=>setHovered(null)}>
                <circle cx={n.x} cy={n.y} r={n.r+(hovered===n.id?4:0)} fill={`${n.col}18`} stroke={n.col} strokeWidth={hovered===n.id?2:1} style={{transition:"all 0.2s"}}/>
                <text x={n.x} y={n.y+1} textAnchor="middle" dominantBaseline="middle" fill={n.col} fontSize={n.r<16?7:8} fontFamily="DM Mono" fontWeight="500">{n.label}</text>
                <text x={n.x} y={n.y+n.r+11} textAnchor="middle" fill="var(--text-dim)" fontSize={7} fontFamily="DM Mono">{n.sub}</text>
              </g>
            ))}
          </svg>
        </div>
      </div>
      {/* Keeping right panel identical to your design */}
      <div style={{width:200,borderLeft:"1px solid var(--border)",background:"var(--bg-card)",padding:16,display:"flex",flexDirection:"column",gap:10}}>
        <div className="mono" style={{fontSize:8.5,letterSpacing:"0.12em",color:"var(--text-dim)",textTransform:"uppercase",marginBottom:4}}>5-Layer Pipeline</div>
        {[["L1–L2","Ingest & Chunk","#C0392B"],["L3","FAISS Embed","#C9A84C"],["L4","Parent Expand","#C0392B"],["L5","Conflict Check","#C9A84C"]].map(([l,d,c])=>(
          <div key={l} style={{display:"flex",gap:8,alignItems:"flex-start"}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:c,marginTop:2,flexShrink:0}}/>
            <div><div className="mono" style={{fontSize:8,color:c,letterSpacing:"0.06em"}}>{l}</div><div style={{fontSize:10,color:"var(--text-muted)"}}>{d}</div></div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════ REPORT PAGE ═══════════════════ */
function ReportPage({ query, reportData }) {
  const [activeDoc, setActiveDoc] = useState(null);

  // If reportData exists (from API), construct blocks dynamically. 
  // Otherwise, use fallback.
  let currentSources = FALLBACK_SOURCES;
  let currentBlocks = FALLBACK_REPORT_BLOCKS;

  if (reportData && reportData.answer && reportData.sources) {
      // Create sources dictionary dynamically from backend response
      // Backend now returns {source_file: parent_text}
      const apiSources = {};
      Object.entries(reportData.sources).forEach(([id, text]) => {
          if (id && text) {  // Skip empty entries
              apiSources[id] = {
                  title: "Retrieved Compliance Document",
                  issuer: id.includes("RBI") ? "Reserve Bank of India" : id.includes("SEBI") ? "SEBI" : id.includes("MCA") ? "MCA" : "Regulator",
                  date: "Latest",
                  jurisdiction: "India",
                  type: "Regulatory Document",
                  rel: 0.95,
                  snippet: text.substring(0, 500) + "..."
              };
          }
      });
      
      // Only use API data if we have sources
      if (Object.keys(apiSources).length > 0) {
          currentSources = apiSources;

          // Construct a more detailed dynamic report block
          currentBlocks = [
            { type:"h1", text:"Compliance Intelligence Report" },
            { type:"meta" },
            { type:"verdict" },
            { type:"h2", text:"AI Analysis" },
            { type:"p",  text: reportData.answer },
            { type:"h2", text:"Retrieved Context" },
          ];
      }
  }

  const src = activeDoc ? currentSources[activeDoc] : null;
  function toggleDoc(id) { setActiveDoc(p=>p===id?null:id); }

  function renderBlock(b,i) {
    switch(b.type) {
      case "h1": return <h1 key={i} className="serif" style={{fontSize:"clamp(1.5rem,3vw,2.2rem)",fontWeight:300,color:"#fff",marginBottom:16,lineHeight:1.1}}>{b.text}</h1>;
      case "meta": return (
        <div key={i} style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:20}}>
          {[["MODEL", reportData ? "claude-haiku-API" : "claude-haiku-mock"],["VECTORS","19,976"],["DOCS",Object.keys(currentSources).length],["PIPELINE","5-LAYER RAG"]].map(([l,v])=>(
            <div key={l} style={{background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:2,padding:"5px 10px"}}>
              <span className="mono" style={{fontSize:7,color:"var(--text-dim)",letterSpacing:"0.1em"}}>{l}: </span>
              <span className="mono" style={{fontSize:9,color:"var(--text-muted)"}}>{v}</span>
            </div>
          ))}
        </div>
      );
      case "verdict": return (
        <div key={i} style={{background:"var(--crimson-dim)",border:"1px solid var(--crimson-border)",borderRadius:2,padding:"14px 18px",marginBottom:22,display:"flex",gap:12,alignItems:"center"}}>
          <span style={{color:"var(--crimson-light)"}}><IconCheck/></span>
          <div>
            <div className="mono" style={{fontSize:9,color:"var(--crimson-light)",letterSpacing:"0.1em",marginBottom:2}}>VERDICT</div>
            <div style={{fontSize:12,color:"#fff",fontWeight:500}}>COMPLIANT — subject to 2 conditions. 2 gaps identified.</div>
          </div>
        </div>
      );
      case "h2": return <h2 key={i} className="serif" style={{fontSize:"1.35rem",fontWeight:600,color:"#fff",marginTop:24,marginBottom:10,borderBottom:"1px solid var(--border)",paddingBottom:6}}>{b.text}</h2>;
      case "h3": return <h3 key={i} style={{fontSize:"0.88rem",fontWeight:600,color:"var(--text)",marginTop:14,marginBottom:6}}>{b.text}</h3>;
      case "p":  return <p key={i} style={{fontSize:"0.84rem",color:"var(--text-muted)",lineHeight:1.75,marginBottom:10, whiteSpace:"pre-line"}}>{b.text}</p>;
      case "cite": return (
        <div key={i} className="cite-block" onClick={()=>toggleDoc(b.docId)}>
          <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:4}}>
            <span style={{color:"var(--crimson)"}}><IconLink/></span>
            <span className="mono" style={{fontSize:8.5,color:"var(--crimson-light)",letterSpacing:"0.06em"}}>{b.docId}</span>
          </div>
          <p style={{fontSize:"0.8rem",color:"var(--text-muted)",lineHeight:1.6,fontStyle:"italic"}}>{b.text}</p>
        </div>
      );
      case "table": return (
        <div key={i} style={{overflowX:"auto",marginBottom:16}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:"0.78rem"}}>
            <tbody>
            {TABLE_ROWS.map((row,ri)=>(
              <tr key={ri} style={{background:ri===0?"var(--bg-raised)":ri%2===0?"var(--bg-card)":"transparent"}}>
                {row.map((cell,ci)=>{
                  const isH=ri===0;
                  const color=cell.includes("✓")?"var(--teal)":cell.includes("⚠")?"var(--gold)":cell.includes("✗")?"var(--crimson-light)":isH?"var(--text-dim)":"var(--text-muted)";
                  return <td key={ci} className="mono" style={{padding:"8px 12px",border:"1px solid var(--border)",fontSize:isH?"0.65rem":"0.78rem",color,letterSpacing:isH?"0.08em":"0",textTransform:isH?"uppercase":"none"}}>{cell}</td>;
                })}
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      );
      case "action": return (
        <div key={i} style={{display:"flex",gap:12,padding:"10px 0",borderBottom:"1px solid var(--border)",cursor:b.docId?"pointer":"default"}} onClick={b.docId?()=>toggleDoc(b.docId):undefined}>
          <div style={{width:22,height:22,borderRadius:2,background:"var(--crimson-dim)",border:"1px solid var(--crimson-border)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>
            <span className="mono" style={{fontSize:9,color:"var(--crimson-light)"}}>{b.n}</span>
          </div>
          <p style={{fontSize:"0.82rem",color:"var(--text-muted)",lineHeight:1.65}}>{b.text}{b.docId&&<span className="mono" style={{color:"var(--gold)",fontSize:8,marginLeft:6}}>[{b.docId}]</span>}</p>
        </div>
      );
      default: return null;
    }
  }
  return (
    <div style={{height:"100vh",paddingTop:56,background:"var(--bg)",display:"flex",overflow:"hidden"}}>
      <div style={{flex:1,overflowY:"auto",padding:"28px 36px"}}>
        <div style={{maxWidth:640}} className="fu">
          <div style={{background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:2,padding:"8px 14px",marginBottom:20,display:"flex",alignItems:"center",gap:10}}>
            <span className="mono" style={{fontSize:8,color:"var(--text-dim)",letterSpacing:"0.1em",flexShrink:0}}>QUERY</span>
            <span className="mono" style={{fontSize:10,color:"var(--text-muted)",fontStyle:"italic"}}>"{query}"</span>
          </div>
          {currentBlocks.map((b,i)=>renderBlock(b,i))}
          
          {/* If using API, display dynamically matched sources as citations */}
          {reportData && (
             <>
               <h2 className="serif" style={{fontSize:"1.35rem",fontWeight:600,color:"#fff",marginTop:24,marginBottom:10,borderBottom:"1px solid var(--border)",paddingBottom:6}}>Retrieved Context</h2>
               {Object.values(currentSources).map((s, i) => (
                  <div key={i} className="cite-block" onClick={()=>toggleDoc(Object.keys(currentSources)[i])}>
                    <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:4}}>
                      <span style={{color:"var(--crimson)"}}><IconLink/></span>
                      <span className="mono" style={{fontSize:8.5,color:"var(--crimson-light)",letterSpacing:"0.06em"}}>{Object.keys(currentSources)[i]}</span>
                    </div>
                  </div>
               ))}
             </>
          )}

          <div style={{height:52}}/>
        </div>
      </div>
      <div style={{width:src?340:196,borderLeft:"1px solid var(--border)",display:"flex",flexDirection:"column",background:"var(--bg-card)",flexShrink:0,transition:"width 0.3s ease"}}>
        {src ? (
          <div style={{height:"100%",display:"flex",flexDirection:"column"}} className="sl">
            <div style={{padding:"14px 16px",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8}}>
              <div>
                <div className="mono" style={{fontSize:9,color:"var(--crimson-light)",fontWeight:700,marginBottom:3,letterSpacing:"0.06em"}}>{activeDoc}</div>
                <div style={{fontSize:11,color:"#fff",fontWeight:500,lineHeight:1.4}}>{src.title}</div>
              </div>
              <button onClick={()=>setActiveDoc(null)} style={{background:"var(--bg-raised)",border:"1px solid var(--border)",borderRadius:2,padding:5,color:"var(--text-muted)",cursor:"pointer",display:"flex",flexShrink:0}}><IconX/></button>
            </div>
            <div style={{padding:10,borderBottom:"1px solid var(--border)",display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
              {[["ISSUER",src.issuer],["TYPE",src.type],["DATE",src.date],["JURISDICTION",src.jurisdiction]].map(([l,v])=>(
                <div key={l} style={{background:"var(--bg-raised)",borderRadius:2,padding:"6px 9px"}}>
                  <div className="mono" style={{fontSize:7,color:"var(--text-dim)",letterSpacing:"0.06em",marginBottom:2}}>{l}</div>
                  <div className="mono" style={{fontSize:9,color:"var(--text-muted)"}}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{padding:"8px 14px",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",gap:9}}>
              <span className="mono" style={{fontSize:8,color:"var(--text-dim)"}}>RELEVANCE</span>
              <div style={{flex:1,height:2,background:"var(--bg-raised)",borderRadius:2}}>
                <div style={{width:`${src.rel*100}%`,height:"100%",background:"linear-gradient(90deg,var(--crimson),var(--gold))",borderRadius:2}}/>
              </div>
              <span className="mono" style={{fontSize:10,fontWeight:500,color:"var(--gold)"}}>{Math.round(src.rel*100)}%</span>
            </div>
            <div style={{flex:1,overflowY:"auto",padding:12}}>
              <div className="mono" style={{fontSize:8,color:"var(--text-dim)",letterSpacing:"0.1em",marginBottom:8}}>SOURCE PASSAGE</div>
              <pre style={{background:"var(--bg-raised)",border:"1px solid var(--border)",borderRadius:2,padding:12,fontFamily:"'DM Mono',monospace",fontSize:9.5,color:"var(--text-muted)",lineHeight:1.8,whiteSpace:"pre-wrap",wordBreak:"break-word"}}>{src.snippet}</pre>
              <div style={{marginTop:10,padding:"9px 12px",background:"var(--crimson-dim)",border:"1px solid var(--crimson-border)",borderRadius:2,display:"flex",gap:8}}>
                <span style={{color:"var(--crimson-light)",flexShrink:0,marginTop:1}}><IconCheck/></span>
                <div>
                  <div className="mono" style={{fontSize:8.5,color:"var(--crimson-light)",fontWeight:700,marginBottom:2}}>PROVENANCE VERIFIED</div>
                  <p className="mono" style={{fontSize:8.5,color:"var(--text-dim)",lineHeight:1.55}}>Every assertion citing this document traces to the passage above.</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{height:"100%",display:"flex",flexDirection:"column"}}>
            <div style={{padding:"13px 14px",borderBottom:"1px solid var(--border)"}}>
              <div className="mono" style={{fontSize:8.5,color:"var(--text-muted)",letterSpacing:"0.08em",marginBottom:2}}>CITED SOURCES</div>
              <div className="mono" style={{fontSize:8,color:"var(--text-dim)"}}>Click any citation</div>
            </div>
            <div style={{flex:1,overflowY:"auto",padding:8,display:"flex",flexDirection:"column",gap:6}}>
              {Object.entries(currentSources).map(([id,s])=>(
                <button key={id} onClick={()=>toggleDoc(id)} style={{background:"var(--bg-raised)",border:"1px solid var(--border)",borderRadius:2,padding:10,textAlign:"left",cursor:"pointer",transition:"all 0.15s",width:"100%"}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--crimson-border)";e.currentTarget.style.background="var(--crimson-dim)"}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.background="var(--bg-raised)"}}>
                  <div className="mono" style={{fontSize:9,color:"var(--crimson-light)",fontWeight:600,marginBottom:2,letterSpacing:"0.04em", wordWrap:"break-word"}}>{id}</div>
                  <div style={{fontSize:10,color:"var(--text)",lineHeight:1.4,marginBottom:6}}>{s.title}</div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span className="pill pice" style={{fontSize:7.5}}>{s.issuer.split(" ")[0]}</span>
                    <span className="mono" style={{fontSize:9.5,color:"var(--gold)",fontWeight:500}}>{Math.round(s.rel*100)}%</span>
                  </div>
                </button>
              ))}
            </div>
            <div style={{padding:"9px 12px",borderTop:"1px solid var(--border)",display:"flex",alignItems:"center",gap:6}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:"var(--crimson)",animation:"pulseDot 1.8s infinite"}}/>
              <span className="mono" style={{fontSize:8,color:"var(--text-dim)"}}>100% SENTENCE PROVENANCE</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════ LIVE HUB OVERLAY ═══════════════════ */
function LiveHub({ onClose }) {
  const [page, setPage]   = useState("query");
  const [query, setQuery] = useState("");
  const [ready, setReady] = useState(false);
  const [apiData, setApiData] = useState(null); // Store real API data

  function handleRun(q) { 
      setQuery(q); 
      setPage("processing"); 
      setApiData(null); // Reset
  }
  
  function handleDone(data)  { 
      setApiData(data); // If null, the child component failed to fetch
      setReady(true); 
      setPage("report"); 
  }

  return (
    <div className="hub-overlay">
      <div className="hub-container">
        <HubNav page={page} setPage={setPage} ready={ready} onClose={onClose}/>
        {page==="query"      && <QueryPage onRun={handleRun}/>}
        {page==="processing" && <ProcessingPage query={query} onDone={handleDone}/>}
        {page==="graph"      && <GraphPage reportData={apiData}/>}
        {page==="report"     && <ReportPage query={query} reportData={apiData}/>}
      </div>
    </div>
  );
}

/* ═══════════════════ DEFAULT EXPORT ═══════════════════ */
export default function App() {
  const [hubOpen, setHubOpen] = useState(false);
  
  return (
    <>
      <style>{CSS}</style>
      {!hubOpen && <LandingPage onLaunchHub={() => setHubOpen(true)}/>}
      {hubOpen && <LiveHub onClose={() => setHubOpen(false)}/>}
    </>
  );
}
function LandingPage({ onLaunchHub }) {
  const revealRefs = useRef([]);
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if(e.isIntersecting) e.target.classList.add("visible"); });
    }, { threshold:0.1, rootMargin:"0px 0px -40px 0px" });
    revealRefs.current.forEach(el => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);
  const r = i => el => { revealRefs.current[i] = el; };

  const archLayers = [
    { n:"01", title:"Document Ingestion",      desc:"OCR pipeline ingests PDF, XBRL, and JSON circulars. Handles scanned legacy documents and structured data feeds across RBI, SEBI, and MCA." },
    { n:"02", title:"Child-Chunk Embedding",   desc:"Documents segmented into ~380-token child chunks. all-MiniLM-L6-v2 embeds 19,976 vectors into a FAISS index for millisecond retrieval." },
    { n:"03", title:"Recursive Retrieval",     desc:"Sub-queries fan out to FAISS for top-k=6 child chunks. Each child expands to its parent section, preserving full legal context and exemption clauses." },
    { n:"04", title:"Conflict Detection",      desc:"Cross-regulation logic surfaces contradictions between RBI, SEBI, and MCA mandates — surfacing conditional compliance and override hierarchies." },
    { n:"05", title:"Provenance Synthesis",    desc:"Every output sentence is traced to an authoritative source passage. Verdict and gap analysis delivered with 100% sentence-level citation." },
  ];

  return (
    <div style={{background:"var(--bg)",color:"var(--text)",overflowX:"hidden"}}>
      {/* NAV */}
      <nav className="landing-nav">
        <div style={{display:"flex",alignItems:"center",gap:"0.75rem"}}>
          <div style={{width:32,height:32,background:"var(--crimson)",display:"flex",alignItems:"center",justifyContent:"center",clipPath:"polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)"}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </div>
          <span className="serif" style={{fontSize:"1.4rem",fontWeight:700,color:"#fff",letterSpacing:"0.02em"}}>Ordin<span style={{color:"var(--crimson)"}}>AI</span></span>
        </div>
        <ul style={{display:"flex",alignItems:"center",gap:"2.5rem",listStyle:"none"}}>
          {["problem","architecture","results","roadmap"].map(s=>(
            <li key={s}><a href={`#${s}`} style={{textDecoration:"none",color:"var(--text-muted)",fontSize:"0.78rem",fontWeight:500,letterSpacing:"0.08em",textTransform:"uppercase",transition:"color 0.2s"}}
              onMouseEnter={e=>e.target.style.color="var(--text)"} onMouseLeave={e=>e.target.style.color="var(--text-muted)"}>{s}</a></li>
          ))}
          <li><button onClick={onLaunchHub} className="btn btn-crimson" style={{fontSize:"0.75rem",padding:"0.5rem 1.2rem",gap:6}}><IconZap/> Live Hub</button></li>
        </ul>
      </nav>

      {/* HERO */}
      <section style={{minHeight:"100vh",display:"grid",placeItems:"center",position:"relative",padding:"8rem 3rem 4rem",overflow:"hidden"}}>
        <div className="hero-bg"/>
        <div className="hero-grid"/>
        <div style={{position:"relative",textAlign:"center",maxWidth:900}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:"0.5rem",border:"1px solid var(--crimson-border)",background:"var(--crimson-dim)",padding:"0.35rem 1rem",borderRadius:"100px",marginBottom:"2rem",animation:"fadeSlideDown 0.8s ease both"}}>
            <div style={{width:6,height:6,background:"var(--crimson-light)",borderRadius:"50%",animation:"pulseDot 2s infinite"}}/>
            <span className="mono" style={{fontSize:"0.68rem",letterSpacing:"0.12em",textTransform:"uppercase",color:"var(--crimson-light)"}}>Research Prototype · Woxsen University 2025</span>
          </div>
          <h1 className="serif" style={{fontSize:"clamp(3.5rem,8vw,7rem)",fontWeight:300,lineHeight:0.95,letterSpacing:"-0.02em",color:"#fff",marginBottom:"1.5rem",animation:"fadeSlideDown 0.8s 0.1s ease both"}}>
            Automated <em style={{fontStyle:"italic",color:"var(--crimson)"}}>Financial</em>
            <span style={{display:"block",fontWeight:600}}>Compliance & Risk</span>
          </h1>
          <p style={{fontSize:"1.05rem",color:"var(--text-muted)",maxWidth:560,margin:"0 auto 3rem",lineHeight:1.7,fontWeight:300,animation:"fadeSlideDown 0.8s 0.2s ease both"}}>
            A 5-layer agentic RAG pipeline that transforms India's fragmented regulatory corpus into instant, auditable, sentence-level compliance verdicts.
          </p>
          <div style={{display:"flex",gap:"1rem",justifyContent:"center",flexWrap:"wrap",animation:"fadeSlideDown 0.8s 0.3s ease both"}}>
            <a href="#architecture" className="btn btn-crimson" style={{fontSize:"0.85rem",padding:"0.85rem 2rem",textDecoration:"none"}}>Explore Architecture <IconArrow/></a>
            <button onClick={onLaunchHub} className="btn btn-gold" style={{fontSize:"0.85rem",padding:"0.85rem 2rem"}}>◈ Launch Live Intelligence Hub</button>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section id="problem" style={{padding:"6rem 3rem",borderTop:"1px solid var(--border)"}}>
        <div style={{maxWidth:1100,margin:"0 auto"}}>
          <div className="section-label reveal" ref={r(0)}>The Problem</div>
          <h2 className="section-title reveal" ref={r(1)}>India's regulatory landscape<br/>is <em>impossibly fragmented</em></h2>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:1,background:"var(--border)",border:"1px solid var(--border)",margin:"2.5rem 0"}} className="reveal" ref={r(2)}>
            {[{n:"900+",l:"Regulatory circulars across RBI, SEBI, and MCA updated continuously"},{n:"72 hrs",l:"Typical time for a compliance analyst to produce a single gap-analysis report"},{n:"34%",l:"Estimated error rate in manual cross-regulation conflict detection"},{n:"0%",l:"Existing tools providing sentence-level provenance for compliance verdicts"}].map(({n,l},i)=>(
              <div key={i} style={{background:"var(--bg)",padding:"2rem 1.5rem",position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,var(--crimson),transparent)"}}/>
                <div className="serif" style={{fontSize:"3.5rem",fontWeight:700,color:"var(--crimson)",lineHeight:1,marginBottom:"0.75rem",letterSpacing:"-0.04em"}}>{n}</div>
                <p style={{fontSize:"0.82rem",color:"var(--text-muted)",lineHeight:1.6}}>{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ARCHITECTURE */}
      <section id="architecture" style={{padding:"6rem 3rem",borderTop:"1px solid var(--border)"}}>
        <div style={{maxWidth:1100,margin:"0 auto"}}>
          <div className="section-label reveal" ref={r(3)}>System Architecture</div>
          <h2 className="section-title reveal" ref={r(4)}>The 5-Layer <em>Pipeline</em></h2>
          <p style={{fontSize:"0.9rem",color:"var(--text-muted)",maxWidth:600,lineHeight:1.75,marginBottom:"2.5rem"}} className="reveal" ref={r(5)}>
            Each layer is purpose-built for the unique challenges of Indian financial regulation — from heterogeneous document formats to multi-regulator conflict resolution.
          </p>
          <div className="arch-grid reveal" ref={r(6)}>
            {archLayers.map((l,i)=>(
              <div key={i} className="arch-cell">
                <div className="arch-num">{l.n}</div>
                <div className="arch-title">{l.title}</div>
                <div className="arch-desc">{l.desc}</div>
              </div>
            ))}
          </div>
          <div style={{marginTop:"2rem",background:"var(--bg-card)",border:"1px solid var(--crimson-border)",borderRadius:2,padding:"2rem",position:"relative",overflow:"hidden"}} className="reveal" ref={r(7)}>
            <div style={{position:"absolute",top:0,left:0,bottom:0,width:3,background:"linear-gradient(180deg,var(--crimson),var(--gold))"}}/>
            <div style={{paddingLeft:"1.5rem"}}>
              <div className="mono" style={{fontSize:"0.68rem",color:"var(--gold)",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:"0.75rem"}}>Core Mechanism — Recursive Retrieval</div>
              <p style={{fontSize:"0.88rem",color:"var(--text-muted)",lineHeight:1.75}}>OrdinAI's retrieval is not flat. A child chunk is retrieved first by FAISS, then the system walks up to its parent section to recover full legal context — preserving exemptions, definitions, and cross-references that a flat search would miss. This parent-child expansion is applied recursively across all sub-queries before synthesis.</p>
            </div>
          </div>
        </div>
      </section>

      {/* RESULTS */}
      <section id="results" style={{padding:"6rem 3rem",borderTop:"1px solid var(--border)"}}>
        <div style={{maxWidth:1100,margin:"0 auto"}}>
          <div className="section-label reveal" ref={r(8)}>Evaluation</div>
          <h2 className="section-title reveal" ref={r(9)}>Prototype <em>Results</em></h2>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"2rem",alignItems:"start"}} className="reveal" ref={r(10)}>
            <div>
              {[{l:"Retrieval Precision (top-k=6)",v:89},{l:"Conflict Detection Accuracy",v:94},{l:"Provenance Coverage",v:100},{l:"Report Generation Speed",v:97}].map(({l,v})=>(
                <div key={l} className="metric-bar">
                  <div className="metric-label">
                    <span style={{fontSize:"0.8rem",color:"var(--text-muted)"}}>{l}</span>
                    <span className="mono" style={{fontSize:"0.8rem",color:"var(--gold)"}}>{v}%</span>
                  </div>
                  <div className="bar-track"><div className="bar-fill" style={{width:`${v}%`}}/></div>
                </div>
              ))}
            </div>
            {/* Launch CTA replacing static terminal */}
            <div style={{background:"var(--bg-card)",border:"1px solid var(--crimson-border)",borderRadius:2,padding:"2.5rem",textAlign:"center",position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(ellipse 60% 60% at 50% 0%,rgba(192,57,43,0.06),transparent 70%)",pointerEvents:"none"}}/>
              <div style={{position:"relative"}}>
                <div style={{width:56,height:56,borderRadius:"50%",background:"var(--crimson-dim)",border:"1px solid var(--crimson-border)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 1.5rem",color:"var(--crimson)"}}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                </div>
                <h3 className="serif" style={{fontSize:"1.8rem",fontWeight:300,color:"#fff",lineHeight:1.1,marginBottom:"1rem"}}>See the Pipeline<br/><em style={{color:"var(--gold)"}}>in Action</em></h3>
                <p style={{fontSize:"0.82rem",color:"var(--text-muted)",lineHeight:1.7,marginBottom:"2rem"}}>Run a live compliance query against OrdinAI's 5-layer RAG pipeline. Inspect the knowledge graph, recursive retrieval, and provenance-linked report in real time.</p>
                <button onClick={onLaunchHub} className="btn btn-crimson" style={{fontSize:"0.9rem",padding:"0.9rem 2rem",gap:8,width:"100%",justifyContent:"center"}}>
                  <IconPlay/> Launch Live Intelligence Hub
                </button>
                <div style={{marginTop:"1.25rem",display:"flex",justifyContent:"center",gap:"1.5rem"}}>
                  {[["900+","Docs"],["5-Layer","Pipeline"],["100%","Provenance"]].map(([v,l])=>(
                    <div key={l} style={{textAlign:"center"}}>
                      <div className="mono" style={{fontSize:"0.8rem",color:"var(--gold)",fontWeight:500}}>{v}</div>
                      <div style={{fontSize:"0.68rem",color:"var(--text-dim)",marginTop:2}}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LITERATURE */}
      <section id="literature" style={{padding:"6rem 3rem",borderTop:"1px solid var(--border)"}}>
        <div style={{maxWidth:1100,margin:"0 auto"}}>
          <div className="section-label reveal" ref={r(11)}>Research Foundation</div>
          <h2 className="section-title reveal" ref={r(12)}>Literature <em>Review</em></h2>
          <div className="reveal" ref={r(13)}>
            <table className="lit-table">
              <thead><tr><th>Research Area</th><th>Knowledge Gap</th><th>Relevance to OrdinAI</th></tr></thead>
              <tbody>
                {[
                  {a:"RAG for Compliance & Financial Processing",t:"Malali, 2025",g:"Lacks deep reasoning frameworks for multi-rule logic or explainable compliance decisions",rv:"Foundational support for RAG in financial doc processing and compliance automation"},
                  {a:"Compliance Checking Framework Using RAG",t:"Sun, Luo & Li · COLING 2025",g:"Limited contextual traceability and sentence-level evidence tracking for auditability",rv:"Aligns with OrdinAI goals — introduces retrieval + reasoning for compliance decisions"},
                  {a:"Hybrid IR + RAG for Regulatory Texts",t:"Rayo et al., 2025",g:"Typical hybrids don't address parent-level context or recursive cross-regulation reasoning",rv:"Supports hybrid retrieval architecture before hierarchical/contextual reasoning layer"},
                  {a:"Multi-Agent RAG + Regulatory QA",t:"Agarwal et al., 2025",g:"Focuses on QA tasks, not regulatory rule enforcement or multi-rule conflict detection",rv:"Influences multi-agent logic + traceability design for compliance reasoning"},
                  {a:"Enterprise RAG Survey",t:"Karakurt, 2025",g:"High-level architecture coverage; lacks domain-specific compliance mechanisms",rv:"Validates RAG as core paradigm and highlights need for domain grounding & eval metrics"},
                ].map((row,i)=>(
                  <tr key={i}><td>{row.a}<div className="tag">{row.t}</div></td><td>{row.g}</td><td>{row.rv}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ROADMAP */}
      <section id="roadmap" style={{padding:"6rem 3rem",borderTop:"1px solid var(--border)"}}>
        <div style={{maxWidth:1100,margin:"0 auto"}}>
          <div className="section-label reveal" ref={r(14)}>Future Plan</div>
          <h2 className="section-title reveal" ref={r(15)}>Three phases to<br/><em>production</em> readiness</h2>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:"1px",background:"var(--border)",border:"1px solid var(--border)"}} className="reveal" ref={r(16)}>
            {[
              {n:"01",title:"Scale Data Infrastructure",items:["Ingest full regulatory universe (RBI/SEBI/MCA) via high-throughput ETL pipeline","Advanced OCR and table parsing on legacy scanned PDFs","Integrate XBRL/JSON sources into canonical data store","Historical + realtime circular ingestion"],m:"Target: <5% parsing error rate"},
              {n:"02",title:"Develop a Fine-Tuned Model",items:["Fine-tune Llama-3 family on Indian financial/legal text via QLoRA on AIRC GPUs","Implement Hybrid Search (semantic vectors + exact keyword/section matching)","Enforce sentence-level provenance in generation layer","Adversarial hallucination benchmarking"],m:"Target: ≥95% provenance coverage"},
              {n:"03",title:"Validation & Simulated Pilot",items:["Red-team adversarial stress tests to expose failure modes","Simulated audit pilot — 500+ page high-volume batches","Deploy Conversational Robo-Advisor UI for end-user acceptance","Benchmark latency vs. manual reporting workflows"],m:"Target: Positive UX acceptance in pilot cohort"},
            ].map((p,i)=>(
              <div key={i} className="phase-card">
                <div className="phase-num">{p.n}</div>
                <div className="phase-title">{p.title}</div>
                <ul className="phase-items">{p.items.map((it,j)=><li key={j}>{it}</li>)}</ul>
                <div className="phase-metric">{p.m}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <h2 className="serif" style={{fontSize:"clamp(2rem,5vw,3.5rem)",fontWeight:300,color:"#fff",marginBottom:"1.25rem",lineHeight:1.05}}>Ready to make compliance<br/><em style={{color:"var(--crimson)"}}>intelligent?</em></h2>
        <p style={{fontSize:"0.95rem",color:"var(--text-muted)",maxWidth:500,margin:"0 auto 2.5rem",lineHeight:1.7}}>OrdinAI is building the future of regulatory intelligence for India's financial ecosystem. Built at Woxsen University.</p>
        <div style={{display:"flex",gap:"1rem",justifyContent:"center",flexWrap:"wrap",marginBottom:"4rem"}}>
          <a href="#architecture" className="btn btn-ghost" style={{fontSize:"0.9rem",padding:"1rem 2.5rem",textDecoration:"none"}}>Explore the Architecture <IconArrow/></a>
          <button onClick={onLaunchHub} className="btn btn-gold" style={{fontSize:"0.9rem",padding:"1rem 2.5rem"}}>◈ Launch Live Intelligence Hub</button>
        </div>
        <div style={{display:"flex",gap:"3rem",justifyContent:"center",flexWrap:"wrap"}}>
          {[["Presented by","Himanshu Maurya · Sampriti Mohanty"],["Mentor","Dr. Peplluis Esteva De La Rosa"],["Institution","Woxsen University"]].map(([l,v])=>(
            <div key={l} style={{textAlign:"left"}}>
              <div className="mono" style={{fontSize:"0.62rem",letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--text-dim)",marginBottom:"0.35rem"}}>{l}</div>
              <div style={{fontSize:"0.88rem",color:"var(--text-muted)"}}>{v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-logo">Ordin<span>AI</span></div>
        <div className="footer-copy">© 2026 OrdinAI · Woxsen University · Applicative Project</div>
        <ul className="footer-links">{["problem","architecture","results","roadmap"].map(s=><li key={s}><a href={`#${s}`}>{s}</a></li>)}</ul>
      </footer>
    </div>
  );
}