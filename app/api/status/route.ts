import type { Company } from "@/app/data/companies";

export const dynamic = "force-dynamic";

const SUPABASE_URL      = process.env.SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!;

export async function PATCH(req: Request) {
  const { company_id, status } = (await req.json()) as {
    company_id: string;
    status: Company["status"];
  };

  if (!company_id || !status) {
    return Response.json({ error: "company_id and status required" }, { status: 400 });
  }

  const res = await fetch(`${SUPABASE_URL}/rest/v1/status_overrides`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify({
      company_id,
      status,
      updated_at: new Date().toISOString(),
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    return Response.json({ error: err }, { status: 500 });
  }

  return Response.json({ ok: true });
}
