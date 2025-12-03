# Vercel Deployment Guide

## Overview
This guide will help you deploy your **Monday Time Tracker App (BugTracker)** to Vercel.

## Prerequisites
- ✅ GitHub repository created: `https://github.com/mariossa90/bugtracker.git`
- ✅ Code pushed to GitHub
- ✅ Vercel account (free tier is sufficient)
- ✅ Monday.com API key

## Deployment Steps

### Step 1: Push Latest Code to GitHub (Already Done ✓)
Your code is already in the new repository!

### Step 2: Log in to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up" or "Log In"
3. **Connect with GitHub** (recommended for easiest deployment)

### Step 3: Import Your Project
1. Click **"Add New..."** → **"Project"**
2. Select **"Import Git Repository"**
3. Find and select: `mariossa90/bugtracker`
4. Click **"Import"**

### Step 4: Configure Your Project

#### Framework Preset
- Vercel should **auto-detect Nuxt.js** ✓
- If not, select **"Nuxt.js"** from the dropdown

#### Build & Development Settings
These are already configured in `vercel.json`:
- **Build Command:** `npm run build` ✓
- **Output Directory:** `.output/public` ✓
- **Install Command:** `npm install` ✓

#### Root Directory
- Leave as: `.` (root) ✓

### Step 5: Add Environment Variables (CRITICAL!)

Click **"Environment Variables"** and add:

| Key | Value | Description |
|-----|-------|-------------|
| `MONDAY_API_KEY` | `your_actual_api_key` | Your Monday.com API key |

**How to add:**
1. Click "+ Add New"
2. Enter the variable name: `MONDAY_API_KEY`
3. Enter your actual Monday.com API key as the value
4. Select which environments (Production, Preview, Development)
   - ✅ Check all three for consistency

⚠️ **IMPORTANT:** Without the `MONDAY_API_KEY`, your app won't be able to connect to Monday.com!

### Step 6: Deploy!
1. Click **"Deploy"**
2. Wait 2-3 minutes for the build to complete
3. Once complete, you'll get a URL like: `https://bugtracker-xyz123.vercel.app`

## After Deployment

### Custom Domain (Optional)
1. Go to your project settings
2. Click **"Domains"**
3. Add your custom domain
4. Follow Vercel's DNS configuration instructions

### Environment Variables Management
To update environment variables later:
1. Go to your project on Vercel
2. Click **"Settings"** → **"Environment Variables"**
3. Edit, add, or remove variables
4. **Redeploy** for changes to take effect

### Automatic Deployments
✅ Every push to your `robot` branch will automatically deploy to Vercel!

**Branch Deployment:**
- `robot` branch → Production
- Other branches → Preview deployments
- Pull requests → Preview deployments

### Preview Deployments
Every time you push to a branch or open a PR:
- Vercel creates a **unique preview URL**
- Test changes before merging to production
- Share preview links with team members

## Monitoring & Logs

### View Deployment Logs
1. Go to your project dashboard
2. Click on any deployment
3. View **"Building"** and **"Runtime"** logs

### Runtime Logs
- Click **"Functions"** tab to see server-side logs
- Monitor API calls, errors, and performance

### Analytics (Optional)
- Enable Vercel Analytics for traffic insights
- Free tier includes basic analytics

## Nuxt-Specific Configuration

### SSR (Server-Side Rendering)
Your Nuxt app is configured for SSR by default:
- ✅ Better SEO
- ✅ Faster initial page loads
- ✅ Monday.com API calls happen server-side (secure)

### API Routes
Your `/server/api/*` routes will work automatically:
- `server/api/monday/tasks.ts` → `https://your-app.vercel.app/api/monday/tasks`
- API key stays secure on the server

## Troubleshooting

### Build Fails
**Error:** `Cannot find module X`
- **Solution:** Make sure all dependencies are in `package.json`
- Run locally: `npm install && npm run build`

**Error:** Environment variable missing
- **Solution:** Add `MONDAY_API_KEY` in Vercel settings

### Runtime Errors
**Error:** API calls fail
- **Solution:** Check environment variables are set
- View runtime logs in Vercel dashboard

**Error:** 500 Internal Server Error
- **Solution:** Check Vercel function logs
- Verify Monday.com API key is valid

### Performance Issues
- Check **Vercel Analytics** for slow pages
- Review **Function Execution** logs
- Consider caching strategies for Monday.com data

## Environment Variables Reference

### Current Configuration (from nuxt.config.ts)
```typescript
runtimeConfig: {
  mondayApiKey: process.env.MONDAY_API_KEY,
}
```

### Required Environment Variables
| Variable | Required | Description |
|----------|----------|-------------|
| `MONDAY_API_KEY` | ✅ Yes | Monday.com API authentication |

### How to Access in Your Code
```typescript
// Server-side (API routes)
const config = useRuntimeConfig()
const apiKey = config.mondayApiKey

// Client-side (not available - secure!)
// API key is NOT exposed to the browser
```

## Vercel Features You Can Use

### 1. Edge Functions (Optional)
- Deploy API routes to edge locations worldwide
- Lower latency for users globally

### 2. Caching
- Vercel automatically caches static assets
- Configure API route caching if needed

### 3. Serverless Functions
- Your API routes run as serverless functions
- Automatic scaling
- Pay only for execution time

### 4. Build Cache
- Faster rebuilds
- Vercel caches `node_modules` and build artifacts

## Quick Reference: Vercel CLI (Optional)

### Install Vercel CLI
```bash
npm install -g vercel
```

### Deploy from Command Line
```bash
vercel login
vercel
```

### Link Local Project
```bash
vercel link
```

### Pull Environment Variables
```bash
vercel env pull
```

## Project Structure for Vercel

```
bugtracker/
├── .output/              # Build output (auto-generated)
├── server/
│   └── api/             # Becomes serverless functions
│       └── monday/
│           └── tasks.ts # → /api/monday/tasks
├── pages/               # Routes
├── components/          # Vue components
├── vercel.json          # Vercel configuration ✓
├── nuxt.config.ts       # Nuxt configuration ✓
└── package.json         # Dependencies ✓
```

## Security Best Practices

### ✅ DO:
- Store API keys in environment variables
- Use runtime config for sensitive data
- Keep dependencies up to date

### ❌ DON'T:
- Commit API keys to Git
- Expose sensitive data client-side
- Use API key in browser code

## Cost Expectations

### Free Tier (Hobby)
- ✅ Unlimited projects
- ✅ 100 GB bandwidth/month
- ✅ 100 hours serverless function execution/month
- ✅ Automatic HTTPS
- ✅ CI/CD included

**For a time tracking app like this, the free tier should be more than sufficient!**

### When to Upgrade
- High traffic (>100GB/month)
- Team collaboration features needed
- Custom domains with advanced features

## Support & Resources

- **Vercel Docs:** [vercel.com/docs](https://vercel.com/docs)
- **Nuxt on Vercel:** [vercel.com/docs/frameworks/nuxt](https://vercel.com/docs/frameworks/nuxt)
- **Vercel Community:** [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)

## Next Steps After Deployment

1. ✅ Test your deployed app thoroughly
2. ✅ Verify Monday.com integration works
3. ✅ Set up custom domain (optional)
4. ✅ Enable analytics (optional)
5. ✅ Share your app URL!

---

## Quick Start Checklist

- [ ] Log in to Vercel
- [ ] Import `mariossa90/bugtracker` repository
- [ ] Add `MONDAY_API_KEY` environment variable
- [ ] Click "Deploy"
- [ ] Wait for build to complete
- [ ] Test your deployment URL
- [ ] (Optional) Set up custom domain

**Your app should be live in ~3 minutes!** 🚀

---

## Need Help?

If you encounter any issues:
1. Check the Vercel deployment logs
2. Verify environment variables are set correctly
3. Test the build locally: `npm run build && npm run preview`
4. Review Nuxt.js + Vercel documentation

