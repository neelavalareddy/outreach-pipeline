"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Search, ExternalLink, Mail, Users, DollarSign, MapPin,
  Calendar, ChevronDown, CheckSquare, Square, Zap, FolderOpen,
  Plus, TrendingUp, Clock, RefreshCw, X, Copy, Check, ArrowRight, Trash2,
} from "lucide-react";
import { initialCompanies, type Company } from "./data/companies";

// ── Status config ─────────────────────────────────────────────────────────────

type SCfg = { text: string; bg: string; border: string; dot: string };

const STATUS: Record<Company["status"], SCfg> = {
  "Not Sent":       { text: "rgba(255,255,255,0.38)", bg: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.10)", dot: "rgba(255,255,255,0.3)"  },
  "Sent":           { text: "#ffa502",                bg: "rgba(255,165,2,0.12)",   border: "rgba(255,165,2,0.28)",   dot: "#ffa502" },
  "Replied":        { text: "#c084fc",                bg: "rgba(192,132,252,0.12)", border: "rgba(192,132,252,0.28)", dot: "#c084fc" },
  "Meeting Booked": { text: "#2ed573",                bg: "rgba(46,213,115,0.12)",  border: "rgba(46,213,115,0.28)",  dot: "#2ed573" },
  "Closed":         { text: "rgba(255,255,255,0.25)", bg: "rgba(255,255,255,0.03)", border: "rgba(255,255,255,0.07)", dot: "rgba(255,255,255,0.18)" },
};

const PALETTE = ["#4361ee","#7c3aed","#ec4899","#f59e0b","#2ed573","#0ea5e9","#ef4444","#8b5cf6"];

const fitColor = (n: number) => n >= 8 ? "#2ed573" : n >= 6 ? "#ffa502" : "#ff4757";

function hashColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

// ── Score gauge (large circular arc) ─────────────────────────────────────────

function ScoreGauge({ score, label }: { score: number; label: string }) {
  const SIZE = 160;
  const CX   = SIZE / 2;
  const R    = 62;
  const SW   = 11;
  // 240° arc: starts at 150° (bottom-left), ends at 30° (bottom-right)
  const GAP  = Math.PI / 6;                     // 30° gap at bottom
  const TOTAL= 2 * Math.PI - 2 * GAP;           // 300° of arc
  const circ = 2 * Math.PI * R;
  const arcLen   = (TOTAL / (2 * Math.PI)) * circ;
  const fillLen  = (score / 10) * arcLen;
  const dashArr  = `${fillLen} ${circ - fillLen}`;
  const rotation = 90 + (GAP * 180) / Math.PI;  // start angle in degrees
  const col = fitColor(score);
  const label2 = score >= 8 ? "High Fit" : score >= 6 ? "Medium Fit" : "Low Fit";

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg
          width={SIZE} height={SIZE}
          style={{ transform: `rotate(${rotation}deg)`, position: "absolute", top: 0, left: 0 }}
        >
          {/* Track */}
          <circle
            cx={CX} cy={CX} r={R}
            fill="none"
            stroke="rgba(255,255,255,0.07)"
            strokeWidth={SW}
            strokeDasharray={`${arcLen} ${circ - arcLen}`}
            strokeLinecap="round"
          />
          {/* Fill */}
          <circle
            cx={CX} cy={CX} r={R}
            fill="none"
            stroke={col}
            strokeWidth={SW}
            strokeDasharray={dashArr}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 0.7s cubic-bezier(.16,1,.3,1)", filter: `drop-shadow(0 0 8px ${col}66)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
          <span className="text-[42px] font-bold leading-none" style={{ color: "#fff" }}>
            {score.toFixed(1)}
          </span>
          <span className="text-xs font-medium" style={{ color: col }}>{label2}</span>
        </div>
      </div>
      <span className="text-xs mt-1 font-medium" style={{ color: "rgba(255,255,255,0.38)" }}>{label}</span>
    </div>
  );
}

// ── Status pill + dropdown ────────────────────────────────────────────────────

function StatusPill({ status, onChange }: {
  status: Company["status"];
  onChange: (s: Company["status"]) => void;
}) {
  const [open, setOpen] = useState(false);
  const all: Company["status"][] = ["Not Sent", "Sent", "Replied", "Meeting Booked", "Closed"];
  const cfg = STATUS[status];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer"
        style={{ color: cfg.text, background: cfg.bg, border: `1px solid ${cfg.border}` }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: cfg.dot }} />
        {status}
        <ChevronDown size={10} style={{ opacity: 0.6 }} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
          <div
            role="listbox"
            className="absolute right-0 top-full mt-2 z-50 rounded-2xl overflow-hidden slide-down"
            style={{
              background: "var(--surface-3)",
              border: "1px solid var(--border-mid)",
              minWidth: 172,
              boxShadow: "0 24px 64px rgba(0,0,0,0.7)",
            }}
          >
            {all.map(s => {
              const c = STATUS[s];
              return (
                <button
                  key={s}
                  role="option"
                  aria-selected={s === status}
                  onClick={() => { onChange(s); setOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-left cursor-pointer"
                  style={{ color: c.text }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: c.dot }} />
                  {s}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ── Company card ──────────────────────────────────────────────────────────────

function CompanyCard({ company, selected, onToggle, onStatusChange, onDelete }: {
  company: Company;
  selected: boolean;
  onToggle: () => void;
  onStatusChange: (s: Company["status"]) => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const age  = new Date().getFullYear() - company.founded;
  const color = hashColor(company.name);
  const fc    = fitColor(company.automationScore);

  const copyEmail = () => {
    navigator.clipboard.writeText(company.contact.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <article
      style={{
        background: selected ? "var(--surface-2)" : "var(--surface)",
        border: `1px solid ${selected ? "rgba(67,97,238,0.5)" : "var(--border)"}`,
        borderRadius: 20,
        boxShadow: selected ? "0 0 0 1px rgba(67,97,238,0.2), 0 8px 32px rgba(0,0,0,0.4)" : "none",
        transition: "border-color .2s, box-shadow .2s, background .2s",
      }}
    >
      <div style={{ padding: "20px 20px 16px" }}>

        {/* Row 1: checkbox + avatar + name/industry + score */}
        <div className="flex items-start gap-3">
          <button
            onClick={onToggle}
            style={{ color: selected ? "#738ef5" : "rgba(255,255,255,0.2)", marginTop: 2, flexShrink: 0 }}
            aria-label={selected ? `Deselect ${company.name}` : `Select ${company.name}`}
          >
            {selected ? <CheckSquare size={16} /> : <Square size={16} />}
          </button>

          {/* Avatar */}
          <div
            style={{
              width: 40, height: 40, borderRadius: 12,
              background: `${color}20`, color,
              border: `1px solid ${color}35`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, fontSize: 15, flexShrink: 0,
            }}
            aria-hidden
          >
            {company.name[0].toUpperCase()}
          </div>

          {/* Name + industry */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="flex items-start justify-between gap-3">
              <div style={{ minWidth: 0 }}>
                <h2 style={{ fontSize: 15, fontWeight: 600, color: "#fff", letterSpacing: "-0.01em", lineHeight: 1.3 }}>
                  {company.name}
                </h2>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                  {company.industry}
                </p>
              </div>
              {/* Fit score badge */}
              <span
                className="mono shrink-0"
                style={{
                  fontSize: 12, fontWeight: 600, marginTop: 1,
                  color: fc, background: `${fc}18`,
                  border: `1px solid ${fc}28`,
                  borderRadius: 8, padding: "2px 8px",
                }}
              >
                {company.automationScore}/10
              </span>
            </div>

            {/* Meta chips */}
            <div className="flex flex-wrap gap-x-4 gap-y-1" style={{ marginTop: 10 }}>
              {([
                [<MapPin key="p" size={10} />,      company.location],
                [<Users key="u" size={10} />,        company.size],
                [<DollarSign key="d" size={10} />,   company.revenue],
                [<Calendar key="c" size={10} />,     `Est. ${company.founded} · ${age}y`],
              ] as [React.ReactNode, string][]).map(([icon, val]) => (
                <span
                  key={val}
                  className="flex items-center gap-1"
                  style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}
                >
                  {icon} {val}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "16px 0 16px 52px" }} />

        {/* Contact row */}
        <div className="flex items-center justify-between gap-3" style={{ paddingLeft: 52 }}>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: "#fff", lineHeight: 1.3 }}>
              {company.contact.name}
            </p>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.38)", marginTop: 2 }}>
              {company.contact.title}
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className="mono hidden md:block"
              style={{ fontSize: 11, color: "#738ef5", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
            >
              {company.contact.email}
            </span>
            <button
              onClick={copyEmail}
              style={{
                padding: "6px", borderRadius: 8, cursor: "pointer",
                color: copied ? "#2ed573" : "rgba(255,255,255,0.3)",
                background: copied ? "rgba(46,213,115,0.1)" : "transparent",
                border: `1px solid ${copied ? "rgba(46,213,115,0.25)" : "transparent"}`,
                transition: "all .15s",
              }}
              aria-label="Copy email"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
            </button>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "16px 0" }} />

        {/* Bottom: status pill + action buttons */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <StatusPill status={company.status} onChange={onStatusChange} />

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setExpanded(v => !v)}
              className="flex items-center gap-1.5"
              style={{
                padding: "6px 10px", borderRadius: 10, fontSize: 12, cursor: "pointer",
                color: expanded ? "#738ef5" : "rgba(255,255,255,0.38)",
                background: expanded ? "rgba(67,97,238,0.12)" : "transparent",
                border: `1px solid ${expanded ? "rgba(67,97,238,0.3)" : "rgba(255,255,255,0.09)"}`,
                transition: "all .15s",
              }}
              aria-expanded={expanded}
            >
              <Zap size={11} />
              {company.automationOps.length} ops
              <ChevronDown
                size={10}
                style={{ transition: "transform .2s", transform: expanded ? "rotate(180deg)" : "none" }}
              />
            </button>

            <a
              href={company.emailDocUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5"
              style={{
                padding: "6px 12px", borderRadius: 10, fontSize: 12, fontWeight: 500, cursor: "pointer",
                color: "#738ef5", background: "rgba(67,97,238,0.12)", border: "1px solid rgba(67,97,238,0.28)",
                transition: "opacity .15s", textDecoration: "none",
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = ".75")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
            >
              <Mail size={11} /> Draft
            </a>

            <a
              href="https://drive.google.com/drive/folders/1Vy0ykzK-jj71M5Fs9SE0IsvdfhabHX0F"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: "6px 10px", borderRadius: 10, cursor: "pointer",
                color: "rgba(255,255,255,0.35)",
                border: "1px solid rgba(255,255,255,0.09)", transition: "all .15s",
                textDecoration: "none", display: "flex", alignItems: "center",
              }}
              aria-label="Drive folder"
              onMouseEnter={e => { e.currentTarget.style.color = "rgba(255,255,255,0.65)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.35)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)"; }}
            >
              <FolderOpen size={13} />
            </a>

            <button
              onClick={onDelete}
              style={{
                padding: "6px 10px", borderRadius: 10, cursor: "pointer",
                color: "rgba(255,255,255,0.25)",
                border: "1px solid rgba(255,255,255,0.09)", transition: "all .15s",
                display: "flex", alignItems: "center", background: "transparent",
              }}
              aria-label={`Remove ${company.name}`}
              onMouseEnter={e => { e.currentTarget.style.color = "#ff4757"; e.currentTarget.style.borderColor = "rgba(255,71,87,0.35)"; e.currentTarget.style.background = "rgba(255,71,87,0.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.25)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)"; e.currentTarget.style.background = "transparent"; }}
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* Expanded automation ops */}
        {expanded && (
          <div className="fade-up" style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            {company.automationOps.map((op, i) => (
              <div
                key={i}
                className="flex items-start gap-3"
                style={{
                  padding: "10px 14px", borderRadius: 12, fontSize: 13,
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                  color: "rgba(255,255,255,0.62)",
                }}
              >
                <ArrowRight size={13} style={{ color: "#4361ee", flexShrink: 0, marginTop: 1 }} />
                {op}
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon, accent }: {
  label: string; value: number; icon: React.ReactNode; accent?: string;
}) {
  return (
    <div
      style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 20, padding: "18px 20px",
        display: "flex", flexDirection: "column", gap: 10,
      }}
    >
      <div className="flex items-center justify-between">
        <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.38)" }}>{label}</span>
        <span style={{ color: accent ?? "rgba(255,255,255,0.22)" }}>{icon}</span>
      </div>
      <span
        style={{ fontSize: 36, fontWeight: 800, color: "#fff", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}
      >
        {value}
      </span>
    </div>
  );
}

// ── Pipeline bar ──────────────────────────────────────────────────────────────

function PipelineBar({ companies }: { companies: Company[] }) {
  const total = companies.length;
  if (!total) return null;

  const order: Company["status"][] = ["Meeting Booked", "Replied", "Sent", "Not Sent", "Closed"];
  const segs = order
    .map(s => ({ s, n: companies.filter(c => c.status === s).length }))
    .filter(x => x.n > 0);

  return (
    <div
      className="flex items-center gap-4"
      style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: "16px 22px" }}
    >
      <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.38)", flexShrink: 0 }}>Pipeline</span>
      <div
        className="flex flex-1 rounded-full overflow-hidden gap-px"
        style={{ height: 8, background: "rgba(255,255,255,0.06)" }}
        role="img"
        aria-label="Pipeline status breakdown"
      >
        {segs.map(({ s, n }) => (
          <div
            key={s}
            title={`${s}: ${n}`}
            style={{
              flex: n / total,
              background: STATUS[s].dot,
              opacity: s === "Closed" || s === "Not Sent" ? 0.3 : 1,
              transition: "flex .6s ease",
            }}
          />
        ))}
      </div>
      <div className="hidden sm:flex items-center gap-4 shrink-0">
        {segs.filter(x => x.s !== "Not Sent" && x.s !== "Closed").map(({ s, n }) => (
          <span key={s} className="flex items-center gap-1.5" style={{ fontSize: 11, color: STATUS[s].text }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS[s].dot }} />
            {n} {s}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Live indicator ────────────────────────────────────────────────────────────

function LiveDot({ source, updatedAt, loading }: {
  source: "sheet" | "seed";
  updatedAt: string | null;
  loading: boolean;
}) {
  const [ago, setAgo] = useState("");

  useEffect(() => {
    if (!updatedAt) return;
    const update = () => {
      const diff = Math.round((Date.now() - new Date(updatedAt).getTime()) / 1000);
      setAgo(diff < 60 ? `${diff}s ago` : `${Math.floor(diff / 60)}m ago`);
    };
    update();
    const t = setInterval(update, 5000);
    return () => clearInterval(t);
  }, [updatedAt]);

  return (
    <div className="flex items-center gap-2">
      {loading ? (
        <RefreshCw size={11} className="spin" style={{ color: "rgba(255,255,255,0.4)" }} />
      ) : (
        <span
          className="w-2 h-2 rounded-full"
          style={{ background: source === "sheet" ? "#2ed573" : "#ffa502" }}
          aria-label={source === "sheet" ? "Live — synced from Google Sheet" : "Offline — using local data"}
        />
      )}
      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
        {loading ? "Syncing…" : source === "sheet" ? `Live · ${ago}` : `Local · ${ago}`}
      </span>
    </div>
  );
}

// ── Home ──────────────────────────────────────────────────────────────────────

const REFRESH_MS = 30_000;

export default function Home() {
  const [companies, setCompanies] = useState<Company[]>(initialCompanies);
  const [source, setSource]       = useState<"sheet" | "seed">("seed");
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading]     = useState(false);

  const [hiddenIds, setHiddenIds] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem("outreach-hidden");
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch { return new Set(); }
  });

  const [selected, setSelected]   = useState<Set<string>>(new Set());
  const [search, setSearch]       = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterScore, setFilterScore]   = useState(0);
  const [showPrompt, setShowPrompt]     = useState(false);
  const [promptCopied, setPromptCopied] = useState(false);

  // ── Fetch from API route ──
  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/companies", { cache: "no-store" });
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      setCompanies(data.companies ?? initialCompanies);
      setSource(data.source ?? "seed");
      setUpdatedAt(data.updatedAt ?? new Date().toISOString());
    } catch {
      setSource("seed");
      setUpdatedAt(new Date().toISOString());
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch + 30-second polling
  useEffect(() => {
    fetchCompanies();
    const interval = setInterval(fetchCompanies, REFRESH_MS);
    return () => clearInterval(interval);
  }, [fetchCompanies]);

  const hideCompany = (id: string) =>
    setHiddenIds(prev => {
      const next = new Set(prev);
      next.add(id);
      localStorage.setItem("outreach-hidden", JSON.stringify([...next]));
      return next;
    });

  const showAll = () => {
    setHiddenIds(new Set());
    localStorage.removeItem("outreach-hidden");
  };

  // ── Filter ──
  const filtered = useMemo(() =>
    companies.filter(c => {
      const q = search.toLowerCase();
      return (
        !hiddenIds.has(c.id) &&
        (!search ||
          c.name.toLowerCase().includes(q) ||
          c.industry.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q) ||
          c.contact.name.toLowerCase().includes(q)) &&
        (filterStatus === "All" || c.status === filterStatus) &&
        c.automationScore >= filterScore
      );
    }),
    [companies, hiddenIds, search, filterStatus, filterScore]
  );

  const avgScore = useMemo(() => {
    if (!filtered.length) return 0;
    return filtered.reduce((a, c) => a + c.automationScore, 0) / filtered.length;
  }, [filtered]);

  const toggleSelect = (id: string) =>
    setSelected(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const selectAll = () =>
    setSelected(
      selected.size === filtered.length && filtered.length > 0
        ? new Set()
        : new Set(filtered.map(c => c.id))
    );

  const updateStatus = (id: string, status: Company["status"]) =>
    setCompanies(p => p.map(c => c.id === id ? { ...c, status } : c));

  const stats = {
    total:    companies.length,
    notSent:  companies.filter(c => c.status === "Not Sent").length,
    sent:     companies.filter(c => c.status === "Sent").length,
    meetings: companies.filter(c => c.status === "Meeting Booked").length,
    highFit:  companies.filter(c => c.automationScore >= 8).length,
  };

  const prompt = `Research 2 new companies for my AI automation outreach pipeline and add them to my Google Drive folder.

For each company find:
- Company name, industry, founded year, employee size, revenue range, US location
- Decision maker contact: name, title, email
- 3-4 specific automation opportunities (what manual work they're doing that AI can replace today)
- Automation score 1-10 (how urgently they need AI automation — 10 = critical)
- Short discovery-call outreach email: human-sounding, specific to that company, ask for 20-min call, no pitch deck, no pricing

Target profile: US-based, 20+ years old, 10-200 employees. Good industries: legal/IP publishing, accounting & HR consulting, specialty insurance, title companies, niche B2B media, regional law firms.

After researching, create a Google Doc per company in this Drive folder:
https://drive.google.com/drive/folders/1Vy0ykzK-jj71M5Fs9SE0IsvdfhabHX0F

Each doc should follow the same format as the existing ones in the folder (contact info at top, email draft, notes section at bottom).

COMPLETED FOLDER RULE:
If a company's status is Closed (deal won, lost, or no longer active), move its Google Doc to the Completed folder instead:
https://drive.google.com/drive/folders/17IsKj4gt9qmZPznbp33EKj38A0NOMm5T

SPREADSHEET RULE — read this carefully:
There is ONE tracker spreadsheet. You must ONLY ever write to this exact file:
https://docs.google.com/spreadsheets/d/1hgJAjxsJIJ1jeya-LdIBMNuzTC2VNMZEeGhYSELDOXg/edit?gid=744490762#gid=744490762

Do NOT create a new spreadsheet. Do NOT duplicate it. Do NOT write to any other file. Open this URL directly and append one new row per company. If anything prevents you from writing to it, stop and report the error — do not fall back to creating a new file.

The spreadsheet columns are (in order):
Company Name | Industry | Founded | Size | Revenue | Location | Contact Name | Contact Title | Contact Email | Automation Opportunities | Email Doc Link | Status | Last Contacted | Follow-Up Date | Notes | Automation Score

Automation Opportunities should be a single cell with opportunities separated by semicolons.
Status should be one of: Not Sent, Sent, Replied, Meeting Booked, Closed (default: Not Sent).`;

  const copyPrompt = () => {
    navigator.clipboard.writeText(prompt);
    setPromptCopied(true);
    setTimeout(() => setPromptCopied(false), 2000);
  };

  return (
    <div className="min-h-dvh" style={{ background: "var(--bg)", position: "relative", zIndex: 1 }}>

      {/* ── Header ── */}
      <header
        className="sticky top-0 z-40"
        style={{
          background: "rgba(7,12,32,0.88)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between gap-4" style={{ height: 58 }}>
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              style={{
                width: 34, height: 34, borderRadius: 10,
                background: "linear-gradient(135deg, #4361ee, #738ef5)",
                boxShadow: "0 0 24px rgba(67,97,238,0.5)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}
            >
              <Zap size={16} color="white" strokeWidth={2.5} />
            </div>
            <div>
              <span style={{ fontSize: 15, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>
                Outreach Pipeline
              </span>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2.5">
            <LiveDot source={source} updatedAt={updatedAt} loading={loading} />

            {selected.size > 0 && (
              <span
                style={{
                  padding: "6px 12px", borderRadius: 10, fontSize: 12, fontWeight: 500,
                  background: "rgba(67,97,238,0.12)", border: "1px solid rgba(67,97,238,0.3)",
                  color: "#738ef5",
                }}
              >
                {selected.size} selected
              </span>
            )}

            <a
              href="https://drive.google.com/drive/folders/1Vy0ykzK-jj71M5Fs9SE0IsvdfhabHX0F"
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5"
              style={{
                padding: "7px 14px", borderRadius: 10, fontSize: 13, fontWeight: 500,
                color: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.09)",
                textDecoration: "none", transition: "background .15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <FolderOpen size={14} />
              <span className="hidden sm:inline">Drive</span>
            </a>

            <button
              onClick={() => setShowPrompt(true)}
              className="flex items-center gap-1.5"
              style={{
                padding: "7px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer",
                background: "linear-gradient(135deg, #4361ee, #738ef5)", color: "#fff",
                boxShadow: "0 2px 14px rgba(67,97,238,0.4)", transition: "opacity .15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = ".88")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
            >
              <Plus size={14} strokeWidth={2.5} />
              Research
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-5">

        {/* ── Hero: stats + gauge ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard label="Total"    value={stats.total}    icon={<TrendingUp size={14} />} />
          <StatCard label="Queued"   value={stats.notSent}  icon={<Clock size={14} />} />
          <StatCard label="Sent"     value={stats.sent}     icon={<Mail size={14} />}     accent="#ffa502" />
          <StatCard label="Meetings" value={stats.meetings} icon={<Calendar size={14} />} accent="#2ed573" />
          <StatCard label="High Fit" value={stats.highFit}  icon={<Zap size={14} />}      accent="#738ef5" />

          {/* Score gauge — spans last col */}
          <div
            style={{
              background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20,
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "12px 0",
            }}
          >
            <ScoreGauge score={avgScore || 0} label="Avg Fit Score" />
          </div>
        </div>

        {/* ── Pipeline bar ── */}
        <PipelineBar companies={companies} />

        {/* ── Filters ── */}
        <div
          style={{
            background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20,
            padding: 10, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center",
          }}
        >
          {/* Search */}
          <label
            className="flex items-center gap-2.5 flex-1"
            style={{
              minWidth: 220, padding: "10px 14px", borderRadius: 14,
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", cursor: "text",
            }}
          >
            <Search size={13} style={{ color: "rgba(255,255,255,0.25)", flexShrink: 0 }} aria-hidden />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search companies, contacts…"
              className="bg-transparent flex-1 outline-none"
              style={{ fontSize: 13, color: "#fff" }}
              aria-label="Search companies"
            />
            {search && (
              <button onClick={() => setSearch("")} aria-label="Clear search" style={{ color: "rgba(255,255,255,0.3)" }}>
                <X size={12} />
              </button>
            )}
          </label>

          {[
            {
              value: filterStatus,
              onChange: (v: string) => setFilterStatus(v),
              options: [["All", "All Status"], ["Not Sent", "Not Sent"], ["Sent", "Sent"],
                        ["Replied", "Replied"], ["Meeting Booked", "Meeting Booked"], ["Closed", "Closed"]],
              label: "Filter by status",
            },
            {
              value: String(filterScore),
              onChange: (v: string) => setFilterScore(Number(v)),
              options: [["0", "Any Fit Score"], ["7", "7+ fit"], ["8", "8+ fit"], ["9", "9+ fit"]],
              label: "Filter by fit score",
            },
          ].map(({ value, onChange, options, label }) => (
            <select
              key={label}
              value={value}
              onChange={e => onChange(e.target.value)}
              aria-label={label}
              style={{
                padding: "10px 12px", borderRadius: 14, fontSize: 13, outline: "none", cursor: "pointer",
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.62)",
              }}
            >
              {options.map(([val, text]) => (
                <option key={val} value={val} style={{ background: "#131d3f" }}>{text}</option>
              ))}
            </select>
          ))}

          <button
            onClick={selectAll}
            className="flex items-center gap-2"
            style={{
              padding: "10px 14px", borderRadius: 14, fontSize: 13, cursor: "pointer",
              color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.08)",
              transition: "background .15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            {selected.size === filtered.length && filtered.length > 0 ? <CheckSquare size={13} /> : <Square size={13} />}
            {selected.size === filtered.length && filtered.length > 0 ? "Deselect all" : "Select all"}
          </button>

          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
            {hiddenIds.size > 0 && (
              <button
                onClick={showAll}
                style={{
                  fontSize: 12, cursor: "pointer", background: "transparent",
                  color: "rgba(255,71,87,0.7)", border: "none", padding: 0,
                  display: "flex", alignItems: "center", gap: 4,
                }}
                onMouseEnter={e => (e.currentTarget.style.color = "#ff4757")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,71,87,0.7)")}
              >
                <Trash2 size={11} />
                {hiddenIds.size} hidden · Show all
              </button>
            )}
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.28)" }}>
              {filtered.length} of {companies.length - hiddenIds.size}
            </span>
          </div>
        </div>

        {/* ── Company cards ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(460px, 1fr))", gap: 14 }}>
          {filtered.map(c => (
            <CompanyCard
              key={c.id}
              company={c}
              selected={selected.has(c.id)}
              onToggle={() => toggleSelect(c.id)}
              onStatusChange={s => updateStatus(c.id, s)}
              onDelete={() => hideCompany(c.id)}
            />
          ))}
        </div>

        {/* ── Empty state ── */}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center py-24 gap-4 fade-up">
            <div
              style={{
                width: 56, height: 56, borderRadius: 18,
                background: "var(--surface)", border: "1px solid var(--border)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <Search size={22} style={{ color: "rgba(255,255,255,0.2)" }} />
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.38)" }}>No companies found</p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", marginTop: 4 }}>
                Try adjusting your search or filters
              </p>
            </div>
          </div>
        )}
      </main>

      {/* ── Research modal ── */}
      {showPrompt && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}
          onClick={e => e.target === e.currentTarget && setShowPrompt(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div
            className="w-full max-w-xl scale-in"
            style={{
              background: "var(--surface-2)", borderRadius: 24,
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: "0 40px 100px rgba(0,0,0,0.85)",
              padding: 24,
              display: "flex", flexDirection: "column", gap: 16,
            }}
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 id="modal-title" style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>
                  Research New Companies
                </h2>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
                  Copy → paste into Claude → it researches and adds to your Drive automatically
                </p>
              </div>
              <button
                onClick={() => setShowPrompt(false)}
                style={{
                  padding: 6, borderRadius: 8, cursor: "pointer",
                  color: "rgba(255,255,255,0.35)", transition: "background .15s",
                }}
                aria-label="Close"
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <X size={16} />
              </button>
            </div>

            <pre
              className="mono"
              style={{
                fontSize: 11, lineHeight: 1.7, borderRadius: 14, padding: 16,
                background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.07)",
                color: "rgba(255,255,255,0.55)", whiteSpace: "pre-wrap",
                maxHeight: 220, overflowY: "auto",
              }}
            >
              {prompt}
            </pre>

            <div className="flex gap-2.5">
              <button
                onClick={copyPrompt}
                className="flex-1 flex items-center justify-center gap-2"
                style={{
                  padding: "13px 0", borderRadius: 14, fontSize: 14, fontWeight: 600, cursor: "pointer",
                  background: "linear-gradient(135deg, #4361ee, #738ef5)", color: "#fff",
                  boxShadow: "0 4px 16px rgba(67,97,238,0.4)", transition: "opacity .15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = ".88")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
              >
                {promptCopied ? <><Check size={15} /> Copied!</> : <><Copy size={15} /> Copy Prompt</>}
              </button>
              <a
                href="https://claude.ai"
                target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2"
                style={{
                  padding: "13px 20px", borderRadius: 14, fontSize: 14, fontWeight: 500, cursor: "pointer",
                  color: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.1)",
                  textDecoration: "none", transition: "background .15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <ExternalLink size={14} /> Claude
              </a>
            </div>

            <div
              className="flex items-start gap-3"
              style={{
                padding: "12px 14px", borderRadius: 14,
                background: "rgba(46,213,115,0.07)", border: "1px solid rgba(46,213,115,0.18)",
              }}
            >
              <RefreshCw size={12} style={{ color: "#2ed573", flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 12, lineHeight: 1.65, color: "rgba(46,213,115,0.85)" }}>
                Claude researches companies, writes personalized emails, creates Drive docs, and updates the Outreach Tracker spreadsheet — then this dashboard syncs automatically.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
