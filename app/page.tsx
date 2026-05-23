"use client";

import { useState, useMemo } from "react";
import {
  Search, Filter, ExternalLink, Mail, Building2,
  Users, DollarSign, MapPin, Calendar, ChevronDown,
  CheckSquare, Square, Zap, FolderOpen, Plus,
  TrendingUp, Clock, RefreshCw, X, Copy, Check
} from "lucide-react";
import { initialCompanies, type Company } from "./data/companies";

const STATUS_COLORS: Record<Company["status"], string> = {
  "Not Sent": "text-[#4a4a6a] bg-[#1a1a2a] border-[#1e1e2e]",
  "Sent": "text-amber-400 bg-amber-400/10 border-amber-400/30",
  "Replied": "text-violet-400 bg-violet-400/10 border-violet-400/30",
  "Meeting Booked": "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
  "Closed": "text-[#7a7a9a] bg-[#1a1a2a] border-[#1e1e2e]",
};

const SCORE_COLOR = (n: number) =>
  n >= 8 ? "#3ecf8e" : n >= 6 ? "#f59e0b" : "#f87171";

function ScoreBar({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="w-2 h-3 rounded-sm"
            style={{
              background: i < score ? SCORE_COLOR(score) : "#1e1e2e",
              opacity: i < score ? 1 : 0.5,
            }}
          />
        ))}
      </div>
      <span className="text-xs font-mono" style={{ color: SCORE_COLOR(score) }}>
        {score}/10
      </span>
    </div>
  );
}

function StatusBadge({ status, onChange }: { status: Company["status"]; onChange: (s: Company["status"]) => void }) {
  const [open, setOpen] = useState(false);
  const statuses: Company["status"][] = ["Not Sent", "Sent", "Replied", "Meeting Booked", "Closed"];
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-2 py-1 rounded border text-xs font-mono transition-all ${STATUS_COLORS[status]}`}
      >
        {status}
        <ChevronDown size={10} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 rounded-lg border overflow-hidden" style={{ background: "#111118", borderColor: "#3b3b5c", minWidth: 140 }}>
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => { onChange(s); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-xs font-mono hover:bg-white/5 transition-colors ${STATUS_COLORS[s]}`}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function CompanyCard({ company, selected, onToggle, onStatusChange }: {
  company: Company; selected: boolean; onToggle: () => void; onStatusChange: (s: Company["status"]) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const age = new Date().getFullYear() - company.founded;

  const copyEmail = () => {
    navigator.clipboard.writeText(company.contact.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="rounded-xl border transition-all duration-200" style={{
      background: selected ? "#16161f" : "#111118",
      borderColor: selected ? "#6c63ff" : "#1e1e2e",
      boxShadow: selected ? "0 0 0 1px #6c63ff, 0 4px 24px rgba(108,99,255,0.1)" : "none",
    }}>
      <div className="p-4 flex items-start gap-3">
        <button onClick={onToggle} className="mt-0.5 shrink-0 transition-all" style={{ color: selected ? "#6c63ff" : "#4a4a6a" }}>
          {selected ? <CheckSquare size={18} /> : <Square size={18} />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <h3 className="font-semibold text-sm text-[#e8e8f0]">{company.name}</h3>
              <p className="text-xs mt-0.5 text-[#7a7a9a]">{company.industry}</p>
            </div>
            <StatusBadge status={company.status} onChange={onStatusChange} />
          </div>
          <div className="flex flex-wrap gap-3 mt-3">
            {[
              { icon: <MapPin size={11} />, val: company.location },
              { icon: <Users size={11} />, val: `${company.size} employees` },
              { icon: <DollarSign size={11} />, val: company.revenue },
              { icon: <Calendar size={11} />, val: `Est. ${company.founded} · ${age}y old` },
            ].map(({ icon, val }) => (
              <span key={val} className="flex items-center gap-1 text-xs text-[#7a7a9a]">{icon} {val}</span>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs text-[#4a4a6a]">Automation fit</span>
            <ScoreBar score={company.automationScore} />
          </div>
        </div>
      </div>

      <div className="mx-4 mb-3 px-3 py-2.5 rounded-lg flex items-center justify-between gap-2" style={{ background: "#0a0a0f", border: "1px solid #1e1e2e" }}>
        <div className="min-w-0">
          <p className="text-xs font-medium text-[#e8e8f0]">{company.contact.name}</p>
          <p className="text-[11px] text-[#4a4a6a]">{company.contact.title}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-mono text-[#6c63ff] truncate max-w-[180px]">{company.contact.email}</span>
          <button onClick={copyEmail} className="p-1 rounded hover:bg-white/5 transition-all" style={{ color: copied ? "#3ecf8e" : "#4a4a6a" }}>
            {copied ? <Check size={12} /> : <Copy size={12} />}
          </button>
        </div>
      </div>

      <button onClick={() => setExpanded(!expanded)} className="w-full px-4 pb-3 flex items-center gap-1.5 text-xs text-[#4a4a6a] hover:text-[#e8e8f0] transition-colors">
        <Zap size={11} />
        {expanded ? "Hide" : "Show"} automation opportunities ({company.automationOps.length})
        <ChevronDown size={11} className={`ml-auto transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-2">
          {company.automationOps.map((op, i) => (
            <div key={i} className="flex items-start gap-2 px-3 py-2 rounded-lg text-xs text-[#7a7a9a]" style={{ background: "#0a0a0f", border: "1px solid #1e1e2e" }}>
              <span className="mt-0.5 shrink-0 text-[#6c63ff]">→</span>
              {op}
            </div>
          ))}
          <div className="flex gap-2 mt-3">
            <a href={company.emailDocUrl} target="_blank" rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all hover:opacity-90"
              style={{ background: "#3d3880", color: "#a5a0ff", border: "1px solid #3d3880" }}>
              <Mail size={12} /> View Email Draft
            </a>
            <a href="https://drive.google.com/drive/folders/1Vy0ykzK-jj71M5Fs9SE0IsvdfhabHX0F" target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs transition-all hover:opacity-80"
              style={{ background: "#0a0a0f", color: "#7a7a9a", border: "1px solid #1e1e2e" }}>
              <FolderOpen size={12} />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [companies, setCompanies] = useState<Company[]>(initialCompanies);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [filterScore, setFilterScore] = useState<number>(0);
  const [showPrompt, setShowPrompt] = useState(false);
  const [promptCopied, setPromptCopied] = useState(false);

  const filtered = useMemo(() => companies.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch = !search || c.name.toLowerCase().includes(q) || c.industry.toLowerCase().includes(q) || c.location.toLowerCase().includes(q) || c.contact.name.toLowerCase().includes(q);
    const matchStatus = filterStatus === "All" || c.status === filterStatus;
    const matchScore = c.automationScore >= filterScore;
    return matchSearch && matchStatus && matchScore;
  }), [companies, search, filterStatus, filterScore]);

  const toggleSelect = (id: string) => setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const selectAll = () => setSelected(selected.size === filtered.length && filtered.length > 0 ? new Set() : new Set(filtered.map((c) => c.id)));
  const updateStatus = (id: string, status: Company["status"]) => setCompanies((prev) => prev.map((c) => c.id === id ? { ...c, status } : c));

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
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Topbar */}
      <div className="sticky top-0 z-40 border-b border-[#1e1e2e]" style={{ background: "rgba(10,10,15,0.95)", backdropFilter: "blur(12px)" }}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#6c63ff", boxShadow: "0 0 14px rgba(108,99,255,0.4)" }}>
              <Zap size={14} color="white" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-[#e8e8f0] tracking-tight">Outreach Pipeline</h1>
              <p className="text-[10px] text-[#4a4a6a]">AI Automation Sales</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {selected.size > 0 && (
              <span className="px-3 py-1.5 rounded-lg text-xs font-mono text-[#a5a0ff]" style={{ background: "rgba(108,99,255,0.15)", border: "1px solid #3d3880" }}>
                {selected.size} selected
              </span>
            )}
            <button onClick={() => setShowPrompt(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white hover:opacity-90 transition-all" style={{ background: "#6c63ff" }}>
              <Plus size={12} /> Research New Companies
            </button>
            <a href="https://drive.google.com/drive/folders/1Vy0ykzK-jj71M5Fs9SE0IsvdfhabHX0F" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#7a7a9a] hover:opacity-80 transition-all"
              style={{ background: "#111118", border: "1px solid #1e1e2e" }}>
              <FolderOpen size={12} /> Drive
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: "Total", val: stats.total, icon: <Building2 size={13} /> },
            { label: "Not Sent", val: stats.notSent, icon: <Clock size={13} /> },
            { label: "Sent", val: stats.sent, icon: <Mail size={13} /> },
            { label: "Meetings", val: stats.meetings, icon: <Calendar size={13} /> },
            { label: "High Fit (8+)", val: stats.highFit, icon: <TrendingUp size={13} /> },
          ].map(({ label, val, icon }) => (
            <div key={label} className="rounded-xl p-3 border border-[#1e1e2e] bg-[#111118]">
              <div className="flex items-center gap-1.5 text-[#4a4a6a]">{icon}<span className="text-[11px] font-mono">{label}</span></div>
              <p className="text-2xl font-semibold text-[#e8e8f0] mt-1">{val}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="rounded-xl border border-[#1e1e2e] bg-[#111118] p-3 flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 flex-1 min-w-48 px-3 py-2 rounded-lg bg-[#0a0a0f] border border-[#1e1e2e]">
            <Search size={13} className="text-[#4a4a6a]" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search companies, industries, contacts..."
              className="bg-transparent text-xs flex-1 outline-none font-mono text-[#e8e8f0] placeholder-[#4a4a6a]" />
            {search && <button onClick={() => setSearch("")} className="text-[#4a4a6a]"><X size={11} /></button>}
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs font-mono outline-none px-2 py-2 rounded-lg border border-[#1e1e2e] bg-[#0a0a0f] text-[#7a7a9a] cursor-pointer">
            {["All", "Not Sent", "Sent", "Replied", "Meeting Booked", "Closed"].map((s) => (
              <option key={s} value={s} style={{ background: "#111118" }}>{s}</option>
            ))}
          </select>
          <select value={filterScore} onChange={(e) => setFilterScore(Number(e.target.value))}
            className="text-xs font-mono outline-none px-2 py-2 rounded-lg border border-[#1e1e2e] bg-[#0a0a0f] text-[#7a7a9a] cursor-pointer">
            <option value={0} style={{ background: "#111118" }}>Any fit score</option>
            <option value={7} style={{ background: "#111118" }}>7+ fit</option>
            <option value={8} style={{ background: "#111118" }}>8+ fit</option>
            <option value={9} style={{ background: "#111118" }}>9+ fit</option>
          </select>
          <button onClick={selectAll} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono text-[#7a7a9a] hover:opacity-80 transition-all bg-[#0a0a0f] border border-[#1e1e2e]">
            {selected.size === filtered.length && filtered.length > 0 ? <CheckSquare size={12} /> : <Square size={12} />}
            {selected.size === filtered.length && filtered.length > 0 ? "Deselect all" : "Select all"}
          </button>
          <span className="text-xs font-mono text-[#4a4a6a] ml-auto">{filtered.length} of {companies.length}</span>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((c) => (
            <CompanyCard key={c.id} company={c} selected={selected.has(c.id)} onToggle={() => toggleSelect(c.id)} onStatusChange={(s) => updateStatus(c.id, s)} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-[#4a4a6a]">
            <Search size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-mono">No companies match your filters</p>
          </div>
        )}
      </div>

      {/* Prompt modal */}
      {showPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(4px)" }}
          onClick={(e) => e.target === e.currentTarget && setShowPrompt(false)}>
          <div className="w-full max-w-2xl rounded-2xl border border-[#3b3b5c] bg-[#111118] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-sm text-[#e8e8f0]">Research New Companies</h2>
                <p className="text-xs mt-1 text-[#4a4a6a]">Copy → paste into Claude chat → Claude researches + adds to your Drive folder automatically</p>
              </div>
              <button onClick={() => setShowPrompt(false)} className="p-1.5 rounded-lg hover:bg-white/5 text-[#4a4a6a]"><X size={14} /></button>
            </div>

            <div className="rounded-xl p-4 text-xs font-mono leading-relaxed max-h-64 overflow-y-auto text-[#7a7a9a] bg-[#0a0a0f] border border-[#1e1e2e]" style={{ whiteSpace: "pre-wrap" }}>
              {claudePrompt}
            </div>

            <div className="flex gap-3">
              <button onClick={copyPrompt}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-white hover:opacity-90 transition-all"
                style={{ background: "#6c63ff" }}>
                {promptCopied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy Prompt</>}
              </button>
              <a href="https://claude.ai" target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-[#7a7a9a] hover:opacity-80 transition-all bg-[#0a0a0f] border border-[#1e1e2e]">
                <ExternalLink size={14} /> Open Claude
              </a>
            </div>

            <div className="rounded-xl p-3 flex items-start gap-2" style={{ background: "rgba(62,207,142,0.08)", border: "1px solid rgba(62,207,142,0.2)" }}>
              <RefreshCw size={12} className="mt-0.5 shrink-0 text-emerald-400" />
              <p className="text-[11px] font-mono leading-relaxed text-emerald-400">
                Claude will research the companies, write the emails, create Drive docs, and update the spreadsheet — same workflow as the first 3. Come back here after and the new companies will be in your folder.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
