"use client";

import { useState, useMemo } from "react";
import {
  Search, ExternalLink, Mail, Users, DollarSign, MapPin,
  Calendar, ChevronDown, CheckSquare, Square, Zap, FolderOpen,
  Plus, TrendingUp, Clock, RefreshCw, X, Copy, Check, ArrowRight,
} from "lucide-react";
import { initialCompanies, type Company } from "./data/companies";

// ── Config ────────────────────────────────────────────────────────────────────

type StatusCfg = { text: string; bg: string; border: string; dot: string };

const STATUS: Record<Company["status"], StatusCfg> = {
  "Not Sent":       { text: "rgba(241,240,250,0.4)",  bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.09)", dot: "rgba(241,240,250,0.28)" },
  "Sent":           { text: "#fb923c",                 bg: "rgba(251,146,60,0.1)",  border: "rgba(251,146,60,0.25)",  dot: "#fb923c" },
  "Replied":        { text: "#c084fc",                 bg: "rgba(192,132,252,0.1)", border: "rgba(192,132,252,0.25)", dot: "#c084fc" },
  "Meeting Booked": { text: "#4ade80",                 bg: "rgba(74,222,128,0.1)",  border: "rgba(74,222,128,0.25)",  dot: "#4ade80" },
  "Closed":         { text: "rgba(241,240,250,0.28)",  bg: "rgba(255,255,255,0.03)", border: "rgba(255,255,255,0.07)", dot: "rgba(241,240,250,0.2)" },
};

const PALETTE = ["#6366f1","#8b5cf6","#ec4899","#f59e0b","#10b981","#3b82f6","#ef4444","#0ea5e9"];

const fitColor = (n: number) => n >= 8 ? "#4ade80" : n >= 6 ? "#fb923c" : "#f87171";

function hashColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

// ── StatusPill ────────────────────────────────────────────────────────────────

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
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer select-none"
        style={{ color: cfg.text, background: cfg.bg, border: `1px solid ${cfg.border}`, transition: "opacity .15s" }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />
        {status}
        <ChevronDown size={10} style={{ opacity: 0.6 }} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
          <div
            role="listbox"
            className="absolute right-0 top-full mt-2 z-50 rounded-xl overflow-hidden slide-down"
            style={{
              background: "var(--surface-2)",
              border: "1px solid rgba(255,255,255,0.1)",
              minWidth: 168,
              boxShadow: "0 20px 60px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04)",
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
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-left cursor-pointer"
                  style={{ color: c.text, transition: "background .12s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: c.dot }} />
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

// ── CompanyCard ───────────────────────────────────────────────────────────────

function CompanyCard({ company, selected, onToggle, onStatusChange }: {
  company: Company;
  selected: boolean;
  onToggle: () => void;
  onStatusChange: (s: Company["status"]) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const age = new Date().getFullYear() - company.founded;
  const color = hashColor(company.name);
  const fc = fitColor(company.automationScore);

  const copyEmail = () => {
    navigator.clipboard.writeText(company.contact.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <article
      className="rounded-2xl overflow-hidden"
      style={{
        background: "var(--surface)",
        border: `1px solid ${selected ? "rgba(99,102,241,0.45)" : "var(--border)"}`,
        boxShadow: selected
          ? "0 0 0 1px rgba(99,102,241,0.18), 0 8px 32px rgba(0,0,0,0.35)"
          : "0 1px 4px rgba(0,0,0,0.25)",
        transition: "border-color .2s, box-shadow .2s",
      }}
    >
      <div className="p-5">

        {/* ── Top row: checkbox + avatar + name + score ── */}
        <div className="flex items-start gap-3">

          {/* Checkbox */}
          <button
            onClick={onToggle}
            className="mt-1 shrink-0 cursor-pointer"
            style={{ color: selected ? "#818cf8" : "rgba(241,240,250,0.22)", transition: "color .15s" }}
            aria-label={selected ? `Deselect ${company.name}` : `Select ${company.name}`}
          >
            {selected ? <CheckSquare size={16} /> : <Square size={16} />}
          </button>

          {/* Avatar */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
            style={{
              background: `${color}18`,
              color,
              border: `1px solid ${color}28`,
              fontSize: 15,
            }}
            aria-hidden
          >
            {company.name[0].toUpperCase()}
          </div>

          {/* Name block */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2
                  className="text-[15px] font-semibold leading-snug truncate"
                  style={{ color: "var(--text-1)", letterSpacing: "-0.01em" }}
                >
                  {company.name}
                </h2>
                <p className="text-xs mt-0.5 truncate" style={{ color: "var(--text-3)" }}>
                  {company.industry}
                </p>
              </div>

              {/* Fit score */}
              <span
                className="mono text-xs font-medium shrink-0 px-2 py-0.5 rounded-lg"
                style={{
                  color: fc,
                  background: `${fc}14`,
                  border: `1px solid ${fc}22`,
                  marginTop: 1,
                }}
                title="Automation fit score"
              >
                {company.automationScore}/10
              </span>
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2.5">
              {([
                [<MapPin size={11} key="m" />, company.location],
                [<Users size={11} key="u" />, company.size],
                [<DollarSign size={11} key="d" />, company.revenue],
                [<Calendar size={11} key="c" />, `Est. ${company.founded} · ${age}y`],
              ] as [React.ReactNode, string][]).map(([icon, val]) => (
                <span
                  key={val}
                  className="flex items-center gap-1 text-xs"
                  style={{ color: "var(--text-3)" }}
                >
                  {icon} {val}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Divider ── */}
        <div
          style={{ height: 1, background: "var(--border)", margin: "16px 0 16px 52px" }}
          role="separator"
        />

        {/* ── Contact ── */}
        <div className="flex items-center justify-between gap-3" style={{ paddingLeft: 52 }}>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: "var(--text-1)" }}>
              {company.contact.name}
            </p>
            <p className="text-xs mt-0.5 truncate" style={{ color: "var(--text-3)" }}>
              {company.contact.title}
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className="mono text-xs hidden md:block truncate max-w-[200px]"
              style={{ color: "#818cf8" }}
            >
              {company.contact.email}
            </span>
            <button
              onClick={copyEmail}
              className="p-1.5 rounded-lg cursor-pointer"
              style={{
                color: copied ? "#4ade80" : "var(--text-4)",
                background: copied ? "rgba(74,222,128,0.1)" : "transparent",
                border: `1px solid ${copied ? "rgba(74,222,128,0.2)" : "transparent"}`,
                transition: "all .15s",
              }}
              aria-label="Copy email address"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
            </button>
          </div>
        </div>

        {/* ── Divider ── */}
        <div style={{ height: 1, background: "var(--border)", margin: "16px 0" }} role="separator" />

        {/* ── Bottom bar: status + actions ── */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <StatusPill status={company.status} onChange={onStatusChange} />

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setExpanded(v => !v)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs cursor-pointer"
              style={{
                color: expanded ? "#818cf8" : "var(--text-3)",
                background: expanded ? "rgba(99,102,241,0.1)" : "transparent",
                border: `1px solid ${expanded ? "rgba(99,102,241,0.2)" : "var(--border)"}`,
                transition: "all .15s",
              }}
              aria-expanded={expanded}
            >
              <Zap size={11} />
              {company.automationOps.length} ops
              <ChevronDown
                size={10}
                style={{
                  transition: "transform .2s ease",
                  transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </button>

            <a
              href={company.emailDocUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
              style={{
                color: "#818cf8",
                background: "var(--indigo-dim)",
                border: "1px solid var(--indigo-border)",
                transition: "opacity .15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = ".8")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
            >
              <Mail size={11} /> Draft
            </a>

            <a
              href="https://drive.google.com/drive/folders/1Vy0ykzK-jj71M5Fs9SE0IsvdfhabHX0F"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg cursor-pointer"
              style={{ color: "var(--text-3)", border: "1px solid var(--border)", transition: "all .15s" }}
              aria-label="Open Google Drive folder"
              onMouseEnter={e => { e.currentTarget.style.color = "var(--text-2)"; e.currentTarget.style.borderColor = "var(--border-mid)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "var(--text-3)"; e.currentTarget.style.borderColor = "var(--border)"; }}
            >
              <FolderOpen size={13} />
            </a>
          </div>
        </div>

        {/* ── Automation ops ── */}
        {expanded && (
          <div className="mt-3 space-y-2 fade-up">
            {company.automationOps.map((op, i) => (
              <div
                key={i}
                className="flex items-start gap-3 px-3.5 py-2.5 rounded-xl text-sm"
                style={{
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid var(--border)",
                  color: "var(--text-2)",
                }}
              >
                <ArrowRight size={13} className="shrink-0 mt-0.5" style={{ color: "#6366f1" }} />
                {op}
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

// ── StatCard ──────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon, accent }: {
  label: string; value: number; icon: React.ReactNode; accent?: string;
}) {
  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-3"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium" style={{ color: "var(--text-3)" }}>{label}</span>
        <span style={{ color: accent ?? "var(--text-4)" }}>{icon}</span>
      </div>
      <span
        className="text-[2rem] font-bold leading-none tabular-nums"
        style={{ color: "var(--text-1)", fontVariantNumeric: "tabular-nums" }}
      >
        {value}
      </span>
    </div>
  );
}

// ── PipelineBar ───────────────────────────────────────────────────────────────

function PipelineBar({ companies }: { companies: Company[] }) {
  const total = companies.length;
  if (!total) return null;
  const order: Company["status"][] = ["Meeting Booked", "Replied", "Sent", "Not Sent", "Closed"];
  const segs = order
    .map(s => ({ s, n: companies.filter(c => c.status === s).length }))
    .filter(x => x.n > 0);

  return (
    <div
      className="rounded-2xl px-5 py-4 flex items-center gap-5"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <span className="text-xs font-medium shrink-0" style={{ color: "var(--text-3)" }}>Pipeline</span>
      <div
        className="flex flex-1 h-2 rounded-full overflow-hidden gap-px"
        style={{ background: "rgba(255,255,255,0.05)" }}
        role="img"
        aria-label="Pipeline status distribution"
      >
        {segs.map(({ s, n }) => (
          <div
            key={s}
            title={`${s}: ${n}`}
            style={{
              flex: n / total,
              background: STATUS[s].dot,
              opacity: s === "Closed" || s === "Not Sent" ? 0.35 : 1,
              transition: "flex .5s ease",
            }}
          />
        ))}
      </div>
      <div className="hidden sm:flex items-center gap-4 shrink-0">
        {segs.map(({ s, n }) => (
          <span key={s} className="flex items-center gap-1.5 text-xs" style={{ color: STATUS[s].text }}>
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: STATUS[s].dot }} />
            {n} {s}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Home ──────────────────────────────────────────────────────────────────────

export default function Home() {
  const [companies, setCompanies] = useState<Company[]>(initialCompanies);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterScore, setFilterScore] = useState(0);
  const [showPrompt, setShowPrompt] = useState(false);
  const [promptCopied, setPromptCopied] = useState(false);

  const filtered = useMemo(() =>
    companies.filter(c => {
      const q = search.toLowerCase();
      return (
        (!search ||
          c.name.toLowerCase().includes(q) ||
          c.industry.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q) ||
          c.contact.name.toLowerCase().includes(q)) &&
        (filterStatus === "All" || c.status === filterStatus) &&
        c.automationScore >= filterScore
      );
    }),
    [companies, search, filterStatus, filterScore]
  );

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

  const prompt = `Research 5 new companies for my AI automation outreach pipeline and add them to my Google Drive folder.

For each company find:
- Company name, industry, founded year, employee size, revenue range, US location
- Decision maker contact: name, title, email
- 3-4 specific automation opportunities (what manual work they're doing that AI can replace today)
- Automation fit score 1-10 (how urgently they need this)
- Short discovery-call outreach email: human-sounding, specific to that company, ask for 20-min call, no pitch deck, no pricing

Target profile: US-based, 20+ years old, 10-200 employees. Good industries: legal/IP publishing, accounting & HR consulting, specialty insurance, title companies, niche B2B media, regional law firms.

After researching, create a Google Doc per company in this Drive folder:
https://drive.google.com/drive/folders/1Vy0ykzK-jj71M5Fs9SE0IsvdfhabHX0F

Each doc should follow the same format as the existing ones in the folder (contact info at top, email draft, notes section at bottom).

Also add a row per company to the spreadsheet "AI Outreach Tracker" in that same folder.`;

  const copyPrompt = () => {
    navigator.clipboard.writeText(prompt);
    setPromptCopied(true);
    setTimeout(() => setPromptCopied(false), 2000);
  };

  const stats = {
    total:    companies.length,
    notSent:  companies.filter(c => c.status === "Not Sent").length,
    sent:     companies.filter(c => c.status === "Sent").length,
    meetings: companies.filter(c => c.status === "Meeting Booked").length,
    highFit:  companies.filter(c => c.automationScore >= 8).length,
  };

  return (
    <div className="min-h-dvh" style={{ background: "var(--bg)", position: "relative", zIndex: 1 }}>

      {/* ── Header ── */}
      <header
        className="sticky top-0 z-40"
        style={{
          background: "rgba(8,8,16,0.85)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 h-[58px] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: "linear-gradient(135deg, #6366f1, #818cf8)",
                boxShadow: "0 0 22px rgba(99,102,241,0.45)",
              }}
            >
              <Zap size={15} color="white" strokeWidth={2.5} aria-hidden />
            </div>
            <span
              className="text-[15px] font-semibold"
              style={{ color: "var(--text-1)", letterSpacing: "-0.015em" }}
            >
              Outreach Pipeline
            </span>
          </div>

          <div className="flex items-center gap-2">
            {selected.size > 0 && (
              <span
                className="px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{
                  background: "var(--indigo-dim)",
                  border: "1px solid var(--indigo-border)",
                  color: "#818cf8",
                }}
              >
                {selected.size} selected
              </span>
            )}
            <a
              href="https://drive.google.com/drive/folders/1Vy0ykzK-jj71M5Fs9SE0IsvdfhabHX0F"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium cursor-pointer"
              style={{
                color: "var(--text-2)",
                border: "1px solid var(--border)",
                transition: "background .15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <FolderOpen size={14} />
              <span className="hidden sm:inline">Drive</span>
            </a>
            <button
              onClick={() => setShowPrompt(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer"
              style={{
                background: "linear-gradient(135deg, #6366f1, #818cf8)",
                color: "white",
                boxShadow: "0 2px 12px rgba(99,102,241,0.35)",
                transition: "opacity .15s, transform .15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = ".9")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
            >
              <Plus size={14} strokeWidth={2.5} />
              Research
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-5">

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatCard label="Total"    value={stats.total}    icon={<TrendingUp size={14} />} />
          <StatCard label="Queued"   value={stats.notSent}  icon={<Clock size={14} />} />
          <StatCard label="Sent"     value={stats.sent}     icon={<Mail size={14} />}     accent="#fb923c" />
          <StatCard label="Meetings" value={stats.meetings} icon={<Calendar size={14} />} accent="#4ade80" />
          <StatCard label="High Fit" value={stats.highFit}  icon={<Zap size={14} />}      accent="#818cf8" />
        </div>

        {/* ── Pipeline bar ── */}
        <PipelineBar companies={companies} />

        {/* ── Filter bar ── */}
        <div
          className="rounded-2xl p-2.5 flex flex-wrap items-center gap-2"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          {/* Search input */}
          <label
            className="flex items-center gap-2.5 flex-1 min-w-[220px] px-3.5 py-2.5 rounded-xl cursor-text"
            style={{ background: "var(--input)", border: "1px solid var(--border)" }}
          >
            <Search size={13} style={{ color: "var(--text-4)", flexShrink: 0 }} aria-hidden />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search companies, contacts…"
              className="bg-transparent text-sm flex-1 outline-none"
              style={{ color: "var(--text-1)" }}
              aria-label="Search"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{ color: "var(--text-3)" }}
                aria-label="Clear search"
              >
                <X size={12} />
              </button>
            )}
          </label>

          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="text-sm px-3 py-2.5 rounded-xl outline-none cursor-pointer"
            style={{
              background: "var(--input)",
              border: "1px solid var(--border)",
              color: "var(--text-2)",
            }}
            aria-label="Filter by status"
          >
            {["All", "Not Sent", "Sent", "Replied", "Meeting Booked", "Closed"].map(s => (
              <option key={s} value={s} style={{ background: "var(--surface-2)" }}>{s}</option>
            ))}
          </select>

          <select
            value={filterScore}
            onChange={e => setFilterScore(Number(e.target.value))}
            className="text-sm px-3 py-2.5 rounded-xl outline-none cursor-pointer"
            style={{
              background: "var(--input)",
              border: "1px solid var(--border)",
              color: "var(--text-2)",
            }}
            aria-label="Filter by fit score"
          >
            <option value={0} style={{ background: "var(--surface-2)" }}>Any fit score</option>
            <option value={7} style={{ background: "var(--surface-2)" }}>7+ fit</option>
            <option value={8} style={{ background: "var(--surface-2)" }}>8+ fit</option>
            <option value={9} style={{ background: "var(--surface-2)" }}>9+ fit</option>
          </select>

          <button
            onClick={selectAll}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm cursor-pointer"
            style={{
              color: "var(--text-3)",
              border: "1px solid var(--border)",
              transition: "background .15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            {selected.size === filtered.length && filtered.length > 0
              ? <CheckSquare size={13} />
              : <Square size={13} />}
            {selected.size === filtered.length && filtered.length > 0 ? "Deselect all" : "Select all"}
          </button>

          <p className="ml-auto text-xs" style={{ color: "var(--text-4)" }}>
            {filtered.length} of {companies.length} companies
          </p>
        </div>

        {/* ── Card grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map(c => (
            <CompanyCard
              key={c.id}
              company={c}
              selected={selected.has(c.id)}
              onToggle={() => toggleSelect(c.id)}
              onStatusChange={s => updateStatus(c.id, s)}
            />
          ))}
        </div>

        {/* ── Empty state ── */}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center py-24 gap-4 fade-up">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <Search size={22} style={{ color: "var(--text-4)" }} aria-hidden />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium" style={{ color: "var(--text-3)" }}>No companies found</p>
              <p className="text-xs mt-1" style={{ color: "var(--text-4)" }}>Try adjusting your search or filters</p>
            </div>
          </div>
        )}
      </main>

      {/* ── Research modal ── */}
      {showPrompt && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)" }}
          onClick={e => e.target === e.currentTarget && setShowPrompt(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div
            className="w-full max-w-xl rounded-2xl p-6 space-y-4 scale-in"
            style={{
              background: "var(--surface)",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 32px 80px rgba(0,0,0,0.8)",
            }}
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h2
                  id="modal-title"
                  className="text-base font-semibold"
                  style={{ color: "var(--text-1)", letterSpacing: "-0.01em" }}
                >
                  Research New Companies
                </h2>
                <p className="text-xs mt-1" style={{ color: "var(--text-3)" }}>
                  Copy prompt → paste into Claude → Claude handles the rest automatically
                </p>
              </div>
              <button
                onClick={() => setShowPrompt(false)}
                className="p-1.5 rounded-lg cursor-pointer"
                style={{ color: "var(--text-3)", transition: "background .15s" }}
                aria-label="Close"
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <X size={16} />
              </button>
            </div>

            {/* Prompt text */}
            <pre
              className="mono text-xs leading-relaxed rounded-xl p-4 overflow-y-auto"
              style={{
                background: "var(--input)",
                border: "1px solid var(--border)",
                color: "var(--text-2)",
                whiteSpace: "pre-wrap",
                maxHeight: 220,
              }}
            >
              {prompt}
            </pre>

            {/* Actions */}
            <div className="flex gap-2.5">
              <button
                onClick={copyPrompt}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold cursor-pointer"
                style={{
                  background: "linear-gradient(135deg, #6366f1, #818cf8)",
                  color: "white",
                  transition: "opacity .15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = ".9")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
              >
                {promptCopied ? <><Check size={15} /> Copied!</> : <><Copy size={15} /> Copy Prompt</>}
              </button>
              <a
                href="https://claude.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-5 rounded-xl text-sm font-medium cursor-pointer"
                style={{
                  color: "var(--text-2)",
                  border: "1px solid var(--border)",
                  transition: "background .15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <ExternalLink size={14} /> Claude
              </a>
            </div>

            {/* Info */}
            <div
              className="flex items-start gap-3 p-3.5 rounded-xl"
              style={{ background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.14)" }}
            >
              <RefreshCw size={12} className="shrink-0 mt-0.5" style={{ color: "#4ade80" }} aria-hidden />
              <p className="text-xs leading-relaxed" style={{ color: "rgba(74,222,128,0.8)" }}>
                Claude will research companies, write personalized emails, create Drive docs, and update the Outreach Tracker spreadsheet.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
