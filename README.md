# Outreach Pipeline

AI automation outreach tool for finding and contacting small businesses that need workflow automation.

## What it does

- Tracks companies researched for outreach (industry, contact, automation opportunities, fit score)
- Status tracking per company: Not Sent → Sent → Replied → Meeting Booked → Closed
- Search + filter by company, industry, status, automation fit score
- One-click access to email drafts in Google Drive
- "Research New Companies" modal generates a Claude prompt — paste it into Claude chat and it researches new companies + adds them to the shared Drive folder automatically

## Stack

- Next.js 15 (App Router)
- Tailwind CSS
- TypeScript
- Lucide React icons
- Deployed on Vercel

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel

```bash
npx vercel deploy --prod
```

Or connect this repo to [vercel.com](https://vercel.com) for automatic deploys on push.

## Adding new companies

1. Click **"Research New Companies"** in the app
2. Copy the generated prompt
3. Paste it into [claude.ai](https://claude.ai)
4. Claude researches companies, writes emails, and creates Google Drive docs automatically
5. Manually add new entries to `app/data/companies.ts` and push — Vercel auto-redeploys

## Google Drive folder

All email drafts and the master spreadsheet live here:
[AI Outreach Pipeline folder](https://drive.google.com/drive/folders/1Vy0ykzK-jj71M5Fs9SE0IsvdfhabHX0F)
