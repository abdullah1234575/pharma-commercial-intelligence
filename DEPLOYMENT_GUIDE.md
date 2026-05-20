# AI-Powered Forecasting Module - Deployment Guide

## Quick Start (5 Minutes)

### Prerequisites
- Node.js 18+ installed
- Git configured with GitHub access
- Vercel account with project created
- Custom domain configured in Vercel

### Step 1: Set Environment Variables

Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

Create `.env.production` or set in Vercel project:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
VERCEL_TOKEN=your_vercel_api_token
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_vercel_project_id
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Build Locally
```bash
npm run build
```

### Step 4: Verify Forecasting Works
```bash
# Start development server
npm run dev

# Navigate to http://localhost:3000
# Look for "AI-Powered Forecasting Module" section
```

### Step 5: Deploy

**Option A: Automatic Deployment via GitHub**
```bash
git add .
git commit -m "feat: Deploy AI-Powered Forecasting Module"
git push origin main
# GitHub Actions will automatically deploy to Vercel
```

**Option B: Manual Deployment - Linux/Mac**
```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

**Option C: Manual Deployment - Windows PowerShell**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\scripts\deploy.ps1
```

## Detailed Deployment Steps

### 1. GitHub Configuration

#### Clone Repository
```bash
git clone https://github.com/yourusername/pharma-commercial-intelligence.git
cd pharma-commercial-intelligence
```

#### Configure Git User
```bash
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

### 2. Vercel Setup

#### Create Vercel Project (if not exists)
```bash
npm i -g vercel
vercel link
# Follow prompts to link to Vercel project
```

#### Get Vercel Token
1. Go to vercel.com → Settings → Tokens
2. Create new token
3. Copy and save securely

#### Get Project IDs
```bash
# From Vercel dashboard or:
vercel projects list

# Note the PROJECT_ID and ORG_ID
```

### 3. Environment Configuration

#### Set GitHub Secrets (for auto-deployment)
1. Go to GitHub repo → Settings → Secrets → Actions
2. Add new secrets:
   - `VERCEL_TOKEN`: Your Vercel API token
   - `VERCEL_ORG_ID`: Your Vercel organization ID
   - `VERCEL_PROJECT_ID`: Your project ID
   - `SLACK_WEBHOOK_URL`: (optional) For deployment notifications

### 4. Build & Test Locally

```bash
# Install dependencies
npm ci

# Run linting
npm run lint

# Build for production
npm run build

# Start production server
npm start

# Test endpoints
curl http://localhost:3000/api/forecast
```

### 5. Deploy to Production

#### Via GitHub (Recommended)
1. Push to main branch:
```bash
git add .
git commit -m "feat: Deploy AI-Powered Forecasting Module"
git push origin main
```

2. Watch GitHub Actions:
   - Go to repo → Actions
   - View "Deploy AI-Powered Forecasting Module" workflow
   - Wait for ✅ completion

3. Verify deployment:
   - Check Vercel dashboard for green "Ready" status
   - Visit https://pharmacommercialintelligence.synaptic-group.online

#### Via Script

**Linux/Mac:**
```bash
# Make script executable
chmod +x scripts/deploy.sh

# Run deployment
./scripts/deploy.sh

# Output should show:
# ✓ Git repository initialized
# ✓ Changes committed
# ✓ Pushed to GitHub
# ✓ Custom domain is accessible
```

**Windows PowerShell:**
```powershell
# Allow script execution
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Run deployment
.\scripts\deploy.ps1

# Output should show:
# ✓ Prerequisites OK
# ✓ Git repository initialized
# ✓ Changes committed
# ✓ Pushed to GitHub
# ✓ Forecasting Module Deployment Complete
```

### 6. Verify Production Deployment

```bash
# Test API endpoint
curl -s https://pharmacommercialintelligence.synaptic-group.online/api/forecast | jq '.metadata'

# Expected response includes:
# {
#   "generatedAt": "2026-05-20T15:30:00Z",
#   "dataPoints": 432,
#   "forecastPeriods": 3,
#   "confidence": "85%",
#   "method": "Multi-Method Ensemble"
# }

# Check dashboard
open https://pharmacommercialintelligence.synaptic-group.online
# Should show "AI-Powered Forecasting Module" section
```

## Post-Deployment Checklist

- [ ] GitHub Actions workflow completed successfully
- [ ] Vercel deployment shows "Ready" status
- [ ] Custom domain is accessible (https://...)
- [ ] API endpoints responding (check `/api/forecast`)
- [ ] Dashboard displays forecast module
- [ ] Forecasts generate without errors
- [ ] Confidence scores are reasonable (50-99%)
- [ ] Risk alerts display correctly
- [ ] Database connections are working
- [ ] No error logs in Vercel console

## Monitoring & Maintenance

### Daily Checks
```bash
# Monitor API response time
curl -w "@curl-format.txt" -o /dev/null -s \
  https://pharmacommercialintelligence.synaptic-group.online/api/forecast
```

### Weekly Reviews
- Check Vercel analytics for errors
- Review forecast accuracy (actual vs. forecast)
- Monitor deployment history
- Check GitHub Actions logs

### Monthly Tasks
- Update forecast business rules based on actual performance
- Review confidence score trends
- Validate risk assessments
- Test disaster recovery procedures

### Commands for Troubleshooting

```bash
# View Vercel logs
vercel logs

# Check deployment status
vercel deployments

# Rebuild without git push
vercel deploy --prod

# View environment variables (hidden)
vercel env ls

# Scale function memory if needed
# Edit vercel.json and redeploy

# Clear all Vercel caches
curl -X POST \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  https://api.vercel.com/v1/projects/$VERCEL_PROJECT_ID/purge-cache
```

## Rollback Procedures

### Rollback to Previous Deployment

```bash
# List recent deployments
vercel deployments --limit=10

# Promote previous deployment to production
vercel promote <deployment-url>

# Or revert git commit and push
git revert HEAD --no-edit
git push origin main
```

### Emergency Hotfix

```bash
# Create hotfix branch
git checkout -b hotfix/critical-issue

# Make changes
# ...

# Commit and push
git commit -am "fix: Critical issue"
git push origin hotfix/critical-issue

# Create Pull Request and merge to main
# Vercel will auto-deploy
```

## Performance Optimization

### API Response Time Optimization

In `vercel.json`:
```json
{
  "functions": {
    "app/api/forecast/**/*.ts": {
      "memory": 1024,
      "maxDuration": 30
    }
  }
}
```

### Database Query Optimization

```typescript
// Use indexes for common queries
// Batch forecast calculations
// Cache results for 1 hour
```

### Build Time Optimization

```bash
# Enable build cache
vercel env add VERCEL_BUILD_COMMAND_ARGS=--cache

# Check build time
vercel inspect
```

## Scaling for Production

### High Traffic Scaling

1. **Increase API memory** in `vercel.json`:
```json
{
  "functions": {
    "app/api/forecast/**/*.ts": {
      "memory": 3008,
      "maxDuration": 60
    }
  }
}
```

2. **Add regional deployment**:
```json
{
  "regions": ["iad1", "sfo1", "lhr1"],
  "functions": {
    "app/api/**/*.ts": {
      "memory": 1024
    }
  }
}
```

3. **Enable caching** for forecasts:
```typescript
// Set Cache-Control headers
response.headers.set('Cache-Control', 'public, max-age=3600');
```

### Database Optimization

- Enable connection pooling
- Add database indexes for queries
- Archive old forecast data
- Implement data retention policies

## Security Considerations

### Environment Variables
- Never commit `.env.local`
- Store sensitive keys only in Vercel secrets
- Rotate API tokens regularly
- Use minimal required permissions

### API Security
- Add rate limiting to `/api/forecast`
- Implement CORS policies
- Validate all inputs
- Use HTTPS only

### Data Protection
- Encrypt data in transit (✓ Vercel default)
- Implement access controls
- Log API usage
- Regular security audits

## Support & Issues

### Common Issues & Solutions

**Issue: "VERCEL_TOKEN not found"**
```bash
# Solution: Set environment variable
export VERCEL_TOKEN=your_token_here
./scripts/deploy.sh
```

**Issue: Build fails with "Module not found"**
```bash
# Solution: Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Issue: Forecast API timeout**
```bash
# Solution: Increase timeout in vercel.json
"maxDuration": 60  # Increase to 60 seconds
```

**Issue: Custom domain not resolving**
```bash
# Solution: Wait for DNS propagation (up to 48 hours)
# Or verify Vercel nameservers in domain registrar settings
nslookup pharmacommercialintelligence.synaptic-group.online
```

### Getting Help

- Check deployment logs: `vercel logs`
- View error details: GitHub Actions → Workflow
- Review code for issues: Check recent commits
- Test locally: `npm run dev`

---

## Summary

✅ **Deployment Complete!**

Your AI-Powered Forecasting Module is now live at:
- **Live URL**: https://pharmacommercialintelligence.synaptic-group.online
- **Dashboard**: Includes new "AI-Powered Forecasting Module" section
- **API**: `/api/forecast` endpoint ready for use
- **Auto-Deploy**: GitHub Actions triggers on every push to main

The system will automatically:
- Generate forecasts from uploaded data
- Update forecasts on new uploads
- Clear old data when uploads are deleted
- Refresh the dashboard in real-time
- Monitor performance and errors

**Next Steps:**
1. Upload pharma sales data to test forecasts
2. Review forecasts in dashboard
3. Monitor prediction accuracy weekly
4. Adjust business rules based on performance
5. Share insights with stakeholders
