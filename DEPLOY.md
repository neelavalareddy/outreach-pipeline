# Deploy in 60 seconds

## Step 1 — Create the GitHub repo

Go to https://github.com/new and create a repo named `outreach-pipeline` (private is fine).

## Step 2 — Push the code

In your terminal, from inside this project folder:

```bash
git init
git add .
git commit -m "init: outreach pipeline"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/outreach-pipeline.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

## Step 3 — Deploy to Vercel

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select `outreach-pipeline`
4. Click Deploy (no env vars needed)

Vercel auto-detects Next.js. Deploy takes ~30 seconds. You get a URL like:
`https://outreach-pipeline.vercel.app`

Share that URL with Ahmed and Pranay — they're in immediately.

## Future updates

Every time you push to `main`, Vercel auto-redeploys. To add new companies:

1. Edit `app/data/companies.ts` — add a new entry to `initialCompanies`
2. `git add . && git commit -m "add: [company name]" && git push`
3. Live in ~30 seconds
