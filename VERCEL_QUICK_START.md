# 🚀 Vercel Quick Start Guide

## Super Quick Steps (5 minutes)

### 1. Go to Vercel
👉 [vercel.com](https://vercel.com) → Log in with GitHub

### 2. Import Project
- Click **"Add New..."** → **"Project"**
- Select **`mariossa90/bugtracker`**
- Click **"Import"**

### 3. Add Environment Variable
⚠️ **CRITICAL STEP:**

In the "Configure Project" screen:
1. Expand **"Environment Variables"**
2. Add:
   - **Name:** `MONDAY_API_KEY`
   - **Value:** Your actual Monday.com API key
   - **Environment:** Check all three (Production, Preview, Development)

### 4. Deploy!
Click **"Deploy"** and wait ~2 minutes

### 5. You're Live! 🎉
You'll get a URL like: `https://bugtracker-xyz123.vercel.app`

---

## What Was Added to Your Repo

✅ **vercel.json** - Vercel configuration
✅ **VERCEL_DEPLOYMENT_GUIDE.md** - Detailed deployment instructions
✅ **package.json** - Updated with new repository info
✅ All files committed and pushed to GitHub ✓

---

## Important Notes

### Environment Variables
- Your app **requires** `MONDAY_API_KEY` to work
- Add it in Vercel's project settings before deploying
- Never commit API keys to Git!

### Automatic Deployments
- Every push to `robot` branch = automatic production deployment
- Every PR = preview deployment with unique URL

### Cost
- **FREE** for your use case
- Free tier: 100GB bandwidth, 100h serverless execution/month

---

## Troubleshooting

**Build fails?**
→ Check you added `MONDAY_API_KEY` environment variable

**App doesn't connect to Monday?**
→ Verify API key is correct in Vercel settings

**Need detailed help?**
→ See `VERCEL_DEPLOYMENT_GUIDE.md` for full documentation

---

## Your Repository
📦 **GitHub:** https://github.com/mariossa90/bugtracker.git
🌐 **Vercel:** (will be assigned after first deployment)

---

**That's it! Your app is ready to deploy to Vercel!** 🎊

