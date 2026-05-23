"use client";

import { useState, useMemo } from "react";
import {
  Search, ExternalLink, Mail, Building2,
  Users, DollarSign, MapPin, Calendar, ChevronDown,
  CheckSquare, Square, Zap, FolderOpen, Plus,
  TrendingUp, Clock, RefreshCw, X, Copy, Check,
} from "lucide-react";
import { initialCompanies, type Company } from "./data/companies";

// ── Config ────────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<
  Company["status"],
  { label: string; dot: string; text: string; bg: string; border: string; bar: string }
> = {
  "Not Sent":       { label: "Not Sent",       dot: "#3e3d58", text: "#5a596e", bg: "rgba(62,61,88,0.08)",   border: "rgba(62,61,88,0.25)",   bar: "#232238" },
  "Sent":           { label: "Sent",            dot: "#f5a623", text: "#f5a623", bg: "rgba(245,166,35,0.1)",  border: "rgba(245,166,35,0.3)",  bar: "#f5a623" },
  "Replied":        { label: "Replied",         dot: "#a78bfa", text: "#a78bfa", bg: "rgba(167,139,250,0.1)", border: "rgba(167,139,250,0.3)", bar: "#a78bfa" },
  "Meeting Booked": { label: "Meeting Booked",  dot: "#10d98a", text: "#10d98a", bg: "rgba(16,217,138,0.1)",  border: "rgba(16,217,138,0.28)", bar: "#10d98a" },
  "Closed":         { label: "Closed",          dot: "#2a2940", text: "#3e3d58", bg: "rgba(26,26,42,0.4)",    border: "rgba(42,42,58,0.4)",    bar: "#1a1930" },
};

const scoreColor = (n: number) =>
  n >= 8 ? "#10d98a" : n >= 6 ? "#f5a623" : "#f87171";

// ── ScoreArc ──────────────────────────────────────────────────────────────────

function ScoreArc({ score }: { score: number }) {
  const r = 17;
  const sw = 2.5;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - score / 10);
  const col = scoreColor(score);
  const S = 46;
  const cx = S / 2;

  return (
    <div className="relative flex-shrink-0 flex items-center justify-center"
      style={{ width: S, height: S }}>
      <svg width={S} height={S} style={{ position: "absolute", transform: "rotate(-90deg)" }}>
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="#1a1924" strokeWidth={sw} />
        <circle
          cx={cx} cy={cx} r={r} fill="none"
          stroke={col} strokeWidth={sw}
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.5s cubic-bezier(.4,0,.2,1)" }}
        />
      </svg>
      <span
        className="relative z-10 font-display text-[13px] font-bold leading-none"
        style={{ color: col }}
      >
        {score}
      </span>
    </div>
  );
}

// ── PipelineBar ───────────────────────────────────────────────────────────────

function PipelineBar({ companies }: { companies: Company[] }) {
  const total = companies.length;
  if (!total) return null;
  const order: Company["status"][] = ["Sent", "Replied", "Meeting Booked", "Not Sent", "Closed"];
  const segments = order
    .map((s) => ({ s, n: companies.filter((c) => c.status === s).length }))
    .filter((x) => x.n > 0);

  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-1 h-[3px] rounded-full overflow-hidden gap-px" style={{ background: "#1a1924" }}>
        {segments.map(({ s, n }) => (
          <div
            key={s}
            title={`${s}: ${n}`}
            style={{
              flex: n / total,
              background: STATUS_CFG[s].bar,
              transition: "flex 0.5s cubic-bezier(.4,0,.2,1)",
            }}
          />
        ))}
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {segments.map(({ s, n }) => (
          <span key={s} className="flex items-center gap-1 text-[10px] font-mono" style={{ color: STATUS_CFG[s].text }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_CFG[s].dot }} />
            {n} {s}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── StatusBadge ───────────────────────────────────────────────────────────────

function StatusBadge({
  status, onChange,
}: { status: Company["status"]; onChange: (s: Company["status"]) => void }) {
  const [open, setOpen] = useState(false);
  const statuses: Company["status"][] = ["Not Sent", "Sent", "Replied", "Meeting Booked", "Closed"];
  const cfg = STATUS_CFG[status];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono cursor-pointer transition-all duration-150"
        style={{ color: cfg.text, background: cfg.bg, border: `1px solid ${cfg.border}` }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />
        {cfg.label}
        <ChevronDown size={9} style={{ opacity: 0.6, marginLeft: 1 }} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
          <div
            role="listbox"
            className="absolute top-full right-0 mt-2 z-50 rounded-xl overflow-hidden animate-slide-down"
            style={{
              background: "#0d0e15",
              border: "1px solid #1f2130",
              minWidth: 158,
              boxShadow: "0 12px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.03)",
            }}
          >
            {statuses.map((s) => {
              const c = STATUS_CFG[s];
              return (
                <button
                  key={s}
                  role="option"
                  aria-selected={s === status}
                  onClick={() => { onChange(s); setOpen(false); }}
                  className="w-full flex items-center gap-2.5 text-left px-3 py-2.5 text-[11px] font-mono cursor-pointer transition-colors hover:bg-white/[0.04]"
                  style={{ color: c.text }}
                >
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: c.dot }} />
                  {c.label}
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

function CompanyCard({
  company, selected, onToggle, onStatusChange,
}: {
  company: Company;
  selected: boolean;
  onToggle: () => void;
  onStatusChange: (s: Company["status"]) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const age = new Date().getFullYear() - company.founded;
  const cfg = STATUS_CFG[company.status];

  const copyEmail = () => {
    navigator.clipboard.writeText(company.contact.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-200"
      style={{
        background: selected ? "#111219" : "#0d0e15",
        border: `1px solid ${selected ? "#2e3050" : "#181924"}`,
        boxShadow: selected
          ? "0 0 0 1px rgba(245,166,35,0.15), 0 8px 32px rgba(0,0,0,0.4)"
          : "0 1px 3px rgba(0,0,0,0.3)",
      }}
    >
      <div className="flex">
        {/* Status accent bar */}
        <div
          className="w-[3px] flex-shrink-0 transition-colors duration-300"
          style={{ background: cfg.bar }}
          aria-hidden
        />

        <div className="flex-1 min-w-0 p-4">
          {/* Header */}
          <div className="flex items-start gap-3">
            <button
              onClick={onToggle}
              className="mt-0.5 shrink-0 cursor-pointer transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded"
              style={{ color: selected ? "#f5a623" : "#3e3d58" }}
              aria-label={selected ? `Deselect ${company.name}` : `Select ${company.name}`}
            >
              {selected ? <CheckSquare size={16} /> : <Square size={16} />}
            </button>

            <div className="flex-1 min-w-0">
              {/* Name + status */}
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div>
                  <h3
                    className="font-display font-bold text-[15px] leading-tight"
                    style={{ color: "#eeedf8", letterSpacing: "-0.02em" }}
                  >
                    {company.name}
                  </h3>
                  <p className="text-[11px] mt-0.5 font-mono" style={{ color: "#7c7b9e" }}>
                    {company.industry}
                  </p>
                </div>
                <StatusBadge status={company.status} onChange={onStatusChange} />
              </div>

              {/* Meta + arc row */}
              <div className="flex items-end justify-between mt-3 gap-3">
                <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                  {[
                    { icon: <MapPin size={10} />, val: company.location },
                    { icon: <Users size={10} />, val: company.size },
                    { icon: <DollarSign size={10} />, val: company.revenue },
                    { icon: <Calendar size={10} />, val: `${company.founded} · ${age}y` },
                  ].map(({ icon, val }) => (
                    <span
                      key={val}
                      className="flex items-center gap-1 text-[11px] font-mono"
                      style={{ color: "#6b6a8a" }}
                    >
                      <span style={{ color: "#3e3d58" }}>{icon}</span>
                      {val}
                    </span>
                  ))}
                </div>
                <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
                  <ScoreArc score={company.automationScore} />
                  <span className="text-[9px] font-mono tracking-widest uppercase" style={{ color: "#3e3d58" }}>
                    fit
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact block */}
          <div
            className="mt-3 ml-7 px-3 py-2.5 rounded-xl flex items-center justify-between gap-2"
            style={{ background: "#07080d", border: "1px solid #181924" }}
          >
            <div className="min-w-0">
              <p className="text-xs font-mono font-medium truncate" style={{ color: "#eeedf8" }}>
                {company.contact.name}
              </p>
              <p className="text-[10px] font-mono mt-0.5 truncate" style={{ color: "#3e3d58" }}>
                {company.contact.title}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span
                className="text-[11px] font-mono truncate max-w-[145px] hidden sm:block"
                style={{ color: "#f5a623" }}
              >
                {company.contact.email}
              </span>
              <button
                onClick={copyEmail}
                className="p-1.5 rounded-lg cursor-pointer hover:bg-white/5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded"
                style={{ color: copied ? "#10d98a" : "#3e3d58" }}
                aria-label="Copy email address"
              >
                {copied ? <Check size={11} /> : <Copy size={11} />}
              </button>
            </div>
          </div>

          {/* Expand toggle */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-3 ml-7 flex items-center gap-1.5 text-[11px] font-mono cursor-pointer transition-all duration-150 hover:opacity-100 focus-visible:outline-none"
            style={{ color: expanded ? "#f5a623" : "#3e3d58" }}
            aria-expanded={expanded}
          >
            <Zap size={10} />
            {expanded ? "Hide" : "Show"} automation opportunities ({company.automationOps.length})
            <ChevronDown
              size={10}
              style={{ marginLeft: "auto", transition: "transform 0.2s ease", transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
            />
          </button>

          {/* Expanded section */}
          {expanded && (
            <div className="mt-2 ml-7 space-y-1.5 animate-fade-in">
              {company.automationOps.map((op, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 px-3 py-2 rounded-xl text-[11px] font-mono"
                  style={{ background: "#07080d", border: "1px solid #181924", color: "#7c7b9e" }}
                >
                  <span className="mt-0.5 flex-shrink-0 font-bold" style={{ color: "#f5a623" }}>→</span>
                  {op}
                </div>
              ))}

              <div className="flex gap-2 pt-2">
                <a
                  href={company.emailDocUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-mono font-medium cursor-pointer transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{
                    background: "rgba(245,166,35,0.1)",
                    color: "#f5a623",
                    border: "1px solid rgba(245,166,35,0.2)",
                  }}
                >
                  <Mail size={11} />
                  View Email Draft
                </a>
                <a
                  href="https://drive.google.com/drive/folders/1Vy0ykzK-jj71M5Fs9SE0IsvdfhabHX0F"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-mono cursor-pointer transition-all hover:opacity-80"
                  style={{ background: "#07080d", color: "#7c7b9e", border: "1px solid #181924" }}
                  aria-label="Open Google Drive folder"
                >
                  <FolderOpen size={11} />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Home ──────────────────────────────────────────────────────────────────────

export default function Home() {
  const [companies, setCompanies] = useState<Company[]>(initialCompanies);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [filterScore, setFilterScore] = useState<number>(0);
  const [showPrompt, setShowPrompt] = useState(false);
  const [promptCopied, setPromptCopied] = useState(false);

  const filtered = useMemo(() =>
    companies.filter((c) => {
      const q = search.toLowerCase();
      const matchSearch =
        !search ||
        c.name.toLowerCase().includes(q) ||
        c.industry.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        c.contact.name.toLowerCase().includes(q);
      return matchSearch && (filterStatus === "All" || c.status === filterStatus) && c.automationScore >= filterScore;
    }),
    [companies, search, filterStatus, filterScore]
  );

  const toggleSelect = (id: string) =>
    setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const selectAll = () =>
    setSelected(
      selected.size === filtered.length && filtered.length > 0
        ? new Set()
        : new Set(filtered.map((c) => c.id))
    );

  const updateStatus = (id: string, status: Company["status"]) =>
    setCompanies((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));

  const claudePrompt = `Research 5 new companies for my AI automation outreach pipeline and add them to my Google Drive folder.

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
    navigator.clipboard.writeText(claudePrompt);
    setPromptCopied(true);
    setTimeout(() => setPromptCopied(false), 2000);
  };

  const stats = {
    total: companies.length,
    notSent: companies.filter((c) => c.status === "Not Sent").length,
    sent: companies.filter((c) => c.status === "Sent").length,
    meetings: companies.filter((c) => c.status === "Meeting Booked").length,
    highFit: companies.filter((c) => c.automationScore >= 8).length,
  };

  return (
    <div className="min-h-dvh" style={{ background: "var(--bg)", position: "relative", zIndex: 1 }}>

      {/* ── Topbar ── */}
      <header
        className="sticky top-0 z-40"
        style={{
          background: "rgba(7,8,13,0.90)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid #181924",
        }}
      >
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #f5a623 0%, #f0b429 100%)",
                boxShadow: "0 0 20px rgba(245,166,35,0.4)",
              }}
            >
              <Zap size={14} color="#07080d" strokeWidth={2.5} aria-hidden />
            </div>
            <div>
              <h1
                className="font-display font-bold text-sm leading-none"
                style={{ color: "#eeedf8", letterSpacing: "-0.025em" }}
              >
                Outreach Pipeline
              </h1>
              <p className="text-[10px] font-mono mt-0.5" style={{ color: "#3e3d58" }}>
                AI Automation Sales
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {selected.size > 0 && (
              <span
                className="px-3 py-1.5 rounded-lg text-[11px] font-mono"
                style={{
                  background: "rgba(245,166,35,0.1)",
                  border: "1px solid rgba(245,166,35,0.2)",
                  color: "#f5a623",
                }}
              >
                {selected.size} selected
              </span>
            )}
            <button
              onClick={() => setShowPrompt(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono font-medium cursor-pointer transition-all hover:opacity-90 active:scale-[0.97]"
              style={{ background: "#f5a623", color: "#07080d" }}
            >
              <Plus size={12} strokeWidth={2.5} />
              Research Companies
            </button>
            <a
              href="https://drive.google.com/drive/folders/1Vy0ykzK-jj71M5Fs9SE0IsvdfhabHX0F"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono cursor-pointer transition-all hover:opacity-80"
              style={{ background: "#0d0e15", color: "#7c7b9e", border: "1px solid #181924" }}
            >
              <FolderOpen size={12} />
              <span className="hidden sm:inline">Drive</span>
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 py-6 space-y-5">

        {/* ── Pipeline health bar ── */}
        <PipelineBar companies={companies} />

        {/* ── Stats grid ── */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {([
            { label: "Total",    val: stats.total,    icon: <Building2 size={12} />, accent: "#7c7b9e" },
            { label: "Queued",   val: stats.notSent,  icon: <Clock size={12} />,     accent: "#3e3d58" },
            { label: "Sent",     val: stats.sent,     icon: <Mail size={12} />,      accent: "#f5a623" },
            { label: "Meetings", val: stats.meetings, icon: <Calendar size={12} />,  accent: "#10d98a" },
            { label: "High Fit", val: stats.highFit,  icon: <TrendingUp size={12} />,accent: "#10d98a" },
          ] as const).map(({ label, val, icon, accent }) => (
            <div
              key={label}
              className="rounded-2xl p-4"
              style={{ background: "#0d0e15", border: "1px solid #181924" }}
            >
              <div className="flex items-center gap-1.5 mb-2.5">
                <span style={{ color: accent }}>{icon}</span>
                <span
                  className="text-[10px] font-mono uppercase tracking-wider"
                  style={{ color: "#3e3d58" }}
                >
                  {label}
                </span>
              </div>
              <p
                className="font-display font-bold leading-none"
                style={{ color: "#eeedf8", fontSize: "clamp(1.75rem, 4vw, 2.25rem)" }}
              >
                {val}
              </p>
            </div>
          ))}
        </div>

        {/* ── Filters ── */}
        <div
          className="rounded-2xl p-3 flex flex-wrap gap-2 items-center"
          style={{ background: "#0d0e15", border: "1px solid #181924" }}
        >
          {/* Search */}
          <div
            className="flex items-center gap-2 flex-1 min-w-52 px-3 py-2 rounded-xl"
            style={{ background: "#07080d", border: "1px solid #181924" }}
          >
            <Search size={12} style={{ color: "#3e3d58", flexShrink: 0 }} aria-hidden />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search companies, industries, contacts…"
              className="bg-transparent text-xs flex-1 outline-none font-mono"
              style={{ color: "#eeedf8" }}
              aria-label="Search companies"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="cursor-pointer transition-colors hover:opacity-70"
                style={{ color: "#3e3d58" }}
                aria-label="Clear search"
              >
                <X size={10} />
              </button>
            )}
          </div>

          {/* Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-[11px] font-mono outline-none px-2.5 py-2 rounded-xl cursor-pointer"
            style={{ background: "#07080d", border: "1px solid #181924", color: "#7c7b9e" }}
            aria-label="Filter by status"
          >
            {["All", "Not Sent", "Sent", "Replied", "Meeting Booked", "Closed"].map((s) => (
              <option key={s} value={s} style={{ background: "#0d0e15" }}>{s}</option>
            ))}
          </select>

          {/* Score */}
          <select
            value={filterScore}
            onChange={(e) => setFilterScore(Number(e.target.value))}
            className="text-[11px] font-mono outline-none px-2.5 py-2 rounded-xl cursor-pointer"
            style={{ background: "#07080d", border: "1px solid #181924", color: "#7c7b9e" }}
            aria-label="Filter by fit score"
          >
            <option value={0}  style={{ background: "#0d0e15" }}>Any fit</option>
            <option value={7}  style={{ background: "#0d0e15" }}>7+ fit</option>
            <option value={8}  style={{ background: "#0d0e15" }}>8+ fit</option>
            <option value={9}  style={{ background: "#0d0e15" }}>9+ fit</option>
          </select>

          {/* Select all */}
          <button
            onClick={selectAll}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-mono cursor-pointer hover:opacity-80 transition-all"
            style={{ background: "#07080d", color: "#7c7b9e", border: "1px solid #181924" }}
          >
            {selected.size === filtered.length && filtered.length > 0
              ? <CheckSquare size={11} />
              : <Square size={11} />}
            {selected.size === filtered.length && filtered.length > 0 ? "Deselect all" : "Select all"}
          </button>

          <span className="ml-auto text-[11px] font-mono" style={{ color: "#3e3d58" }}>
            {filtered.length}
            <span style={{ color: "#1f2130" }}> / </span>
            {companies.length}
          </span>
        </div>

        {/* ── Cards ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {filtered.map((c) => (
            <CompanyCard
              key={c.id}
              company={c}
              selected={selected.has(c.id)}
              onToggle={() => toggleSelect(c.id)}
              onStatusChange={(s) => updateStatus(c.id, s)}
            />
          ))}
        </div>

        {/* ── Empty state ── */}
        {filtered.length === 0 && (
          <div className="text-center py-24 animate-fade-in">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "#0d0e15", border: "1px solid #181924" }}
            >
              <Search size={20} style={{ color: "#3e3d58" }} aria-hidden />
            </div>
            <p className="text-sm font-mono" style={{ color: "#3e3d58" }}>
              No companies match your filters
            </p>
          </div>
        )}
      </main>

      {/* ── Research modal ── */}
      {showPrompt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}
          onClick={(e) => e.target === e.currentTarget && setShowPrompt(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div
            className="w-full max-w-2xl rounded-2xl p-6 space-y-4 animate-scale-in"
            style={{
              background: "#0d0e15",
              border: "1px solid #1f2130",
              boxShadow: "0 32px 80px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.03)",
            }}
          >
            {/* Modal header */}
            <div className="flex items-start justify-between">
              <div>
                <h2
                  id="modal-title"
                  className="font-display font-bold text-base"
                  style={{ color: "#eeedf8", letterSpacing: "-0.025em" }}
                >
                  Research New Companies
                </h2>
                <p className="text-[11px] font-mono mt-1" style={{ color: "#7c7b9e" }}>
                  Copy → paste into Claude → Claude researches + adds to your Drive folder
                </p>
              </div>
              <button
                onClick={() => setShowPrompt(false)}
                className="p-1.5 rounded-lg cursor-pointer hover:bg-white/5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded"
                style={{ color: "#3e3d58" }}
                aria-label="Close modal"
              >
                <X size={14} />
              </button>
            </div>

            {/* Prompt text */}
            <div
              className="rounded-xl p-4 text-[11px] font-mono leading-relaxed max-h-56 overflow-y-auto"
              style={{
                background: "#07080d",
                border: "1px solid #181924",
                color: "#7c7b9e",
                whiteSpace: "pre-wrap",
              }}
            >
              {claudePrompt}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={copyPrompt}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-mono font-medium cursor-pointer transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ background: "#f5a623", color: "#07080d" }}
              >
                {promptCopied
                  ? <><Check size={14} /> Copied!</>
                  : <><Copy size={14} /> Copy Prompt</>}
              </button>
              <a
                href="https://claude.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-mono cursor-pointer transition-all hover:opacity-80"
                style={{ background: "#07080d", color: "#7c7b9e", border: "1px solid #181924" }}
              >
                <ExternalLink size={14} />
                Open Claude
              </a>
            </div>

            {/* Info banner */}
            <div
              className="rounded-xl p-3 flex items-start gap-2.5"
              style={{
                background: "rgba(16,217,138,0.05)",
                border: "1px solid rgba(16,217,138,0.12)",
              }}
            >
              <RefreshCw size={11} className="mt-0.5 flex-shrink-0" style={{ color: "#10d98a" }} aria-hidden />
              <p className="text-[11px] font-mono leading-relaxed" style={{ color: "#10d98a", opacity: 0.85 }}>
                Claude will research the companies, write emails, create Drive docs, and update the spreadsheet.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
