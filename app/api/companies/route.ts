import type { Company } from "@/app/data/companies";
import { initialCompanies } from "@/app/data/companies";

export const dynamic = "force-dynamic";

// ── CSV helpers ───────────────────────────────────────────────────────────────

function parseCSVRow(row: string): string[] {
  const cells: string[] = [];
  let cur = "";
  let inQuote = false;
  for (let i = 0; i < row.length; i++) {
    const ch = row[i];
    if (ch === '"') {
      if (inQuote && row[i + 1] === '"') { cur += '"'; i++; }
      else inQuote = !inQuote;
    } else if (ch === "," && !inQuote) {
      cells.push(cur.trim());
      cur = "";
    } else {
      cur += ch;
    }
  }
  cells.push(cur.trim());
  return cells;
}

// Flexible header key normalizer — strips spaces, lowercases
function key(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

const VALID_STATUSES = new Set<Company["status"]>([
  "Not Sent", "Sent", "Replied", "Meeting Booked", "Closed",
]);

function toStatus(raw: string): Company["status"] {
  const trimmed = raw.trim();
  if (VALID_STATUSES.has(trimmed as Company["status"])) {
    return trimmed as Company["status"];
  }
  const lower = trimmed.toLowerCase();
  if (lower.includes("meeting") || lower.includes("booked")) return "Meeting Booked";
  if (lower.includes("replied") || lower.includes("reply")) return "Replied";
  if (lower.includes("sent")) return "Sent";
  if (lower.includes("closed") || lower.includes("won") || lower.includes("lost")) return "Closed";
  return "Not Sent";
}

function parseSheet(csv: string): Company[] {
  const lines = csv.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = parseCSVRow(lines[0]).map(key);

  // Map flexible header names to indices
  const col = (candidates: string[]): number => {
    for (const c of candidates) {
      const idx = headers.indexOf(c);
      if (idx !== -1) return idx;
    }
    return -1;
  };

  const I = {
    id:          col(["id"]),
    name:        col(["companyname","name","company"]),
    industry:    col(["industry","sector","vertical"]),
    founded:     col(["founded","est","established","foundedyear","year"]),
    size:        col(["size","employees","employeecount","headcount"]),
    revenue:     col(["revenue","arr","mrr","annualrevenue"]),
    location:    col(["location","city","state","hq","headquarters"]),
    cName:       col(["contactname","contact","poc","pointofcontact","firstname","fullname"]),
    cTitle:      col(["contacttitle","title","role","jobtitle"]),
    cEmail:      col(["contactemail","email","emailaddress"]),
    ops:         col(["automationops","automationopportunities","ops","opportunities"]),
    docUrl:      col(["emaildocurl","emaildoc","emaildoclink","doclink","drafturl","docurl","googledoc","documenturl","link"]),
    status:      col(["status","outreachstatus","pipelinestatus"]),
    score:       col(["automationscore","automationfit","fitscore","fitscore","score","fit"]),
    lastContact: col(["lastcontacted","lastcontact","contacteddate"]),
    followUp:    col(["followupdate","followup","nextfollowup"]),
    notes:       col(["notes","note","comments"]),
  };

  const companies: Company[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cells = parseCSVRow(lines[i]);
    const g = (idx: number) => (idx >= 0 ? cells[idx] ?? "" : "");

    const name = g(I.name);
    if (!name) continue; // skip empty rows

    const score = parseInt(g(I.score)) || 5;
    const ops = g(I.ops)
      .split(/[|;]/)
      .map(s => s.trim())
      .filter(Boolean);

    companies.push({
      id:      g(I.id) || `row-${i}`,
      name,
      industry: g(I.industry),
      founded:  parseInt(g(I.founded)) || 2000,
      size:     g(I.size),
      revenue:  g(I.revenue),
      location: g(I.location),
      contact: {
        name:  g(I.cName),
        title: g(I.cTitle),
        email: g(I.cEmail),
      },
      automationOps: ops,
      emailDocUrl:   g(I.docUrl),
      status:        toStatus(g(I.status)),
      automationScore: Math.min(10, Math.max(1, score)),
      lastContacted: g(I.lastContact) || undefined,
      followUpDate:  g(I.followUp) || undefined,
      notes:         g(I.notes) || undefined,
    });
  }

  return companies;
}

// ── Status overrides (Supabase) ───────────────────────────────────────────────

async function getStatusOverrides(): Promise<Map<string, Company["status"]>> {
  const url     = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!url || !anonKey) return new Map();

  try {
    const res = await fetch(
      `${url}/rest/v1/status_overrides?select=company_id,status`,
      {
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`,
        },
        signal: AbortSignal.timeout(5000),
      }
    );
    if (!res.ok) return new Map();
    const rows: { company_id: string; status: string }[] = await res.json();
    return new Map(rows.map(r => [r.company_id, toStatus(r.status)]));
  } catch {
    return new Map();
  }
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function GET() {
  const csvUrl = process.env.SHEET_CSV_URL;

  const overrides = await getStatusOverrides();
  const applyOverrides = (list: Company[]) =>
    list.map(c => overrides.has(c.id) ? { ...c, status: overrides.get(c.id)! } : c);

  if (!csvUrl) {
    return Response.json({
      companies: applyOverrides(initialCompanies),
      source: "seed",
      updatedAt: new Date().toISOString(),
    });
  }

  try {
    const res = await fetch(csvUrl, {
      headers: { "Cache-Control": "no-cache" },
      // 8-second timeout
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      throw new Error(`Sheet fetch failed: ${res.status}`);
    }

    const csv = await res.text();
    const companies = parseSheet(csv);

    if (companies.length === 0) {
      return Response.json({
        companies: applyOverrides(initialCompanies),
        source: "seed",
        updatedAt: new Date().toISOString(),
        warning: "Sheet returned 0 companies — using seed data",
      });
    }

    return Response.json({
      companies: applyOverrides(companies),
      source: "sheet",
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[/api/companies]", err);
    return Response.json(
      {
        companies: initialCompanies,
        source: "seed",
        updatedAt: new Date().toISOString(),
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 200 } // still 200 so the client gets fallback data
    );
  }
}
