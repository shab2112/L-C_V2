# 🚀 DarieAI - Deployment & Troubleshooting Guide

> **Production deployment instructions and comprehensive troubleshooting solutions**

---

## 📋 Table of Contents

- [Deployment Options](#deployment-options)
- [Vercel Deployment](#vercel-deployment-recommended)
- [Netlify Deployment](#netlify-deployment)
- [Self-Hosted Deployment](#self-hosted-deployment)
- [Post-Deployment Steps](#post-deployment-steps)
- [Monitoring & Analytics](#monitoring--analytics)
- [Troubleshooting Guide](#troubleshooting-guide)
- [Performance Optimization](#performance-optimization)

---

## 🌐 Deployment Options

### Comparison Table

| Platform | Difficulty | Cost | Performance | Best For |
|----------|-----------|------|-------------|----------|
| **Vercel** | Easy | Free tier available | Excellent | Recommended for most users |
| **Netlify** | Easy | Free tier available | Excellent | Alternative to Vercel |
| **Self-Hosted** | Advanced | Variable | Depends on setup | Full control required |

---

## ▲ Vercel Deployment (Recommended)

### Prerequisites
- GitHub account
- Vercel account (free tier sufficient)
- Code pushed to GitHub repository

### Step 1: Push to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - DarieAI platform"

# Add remote
git remote add origin https://github.com/your-username/Darieai.git

# Push to GitHub
git push -u origin main
```

### Step 2: Import to Vercel

**Via Vercel Dashboard**:
1. Go to https://vercel.com/
2. Click "New Project"
3. Import from GitHub
4. Select your repository: `your-username/Darieai`
5. Configure project:
   - **Framework Preset**: Vite
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Click "Deploy"

**Via Vercel CLI**:
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts:
# - Setup and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? Darieai
# - Directory? ./
# - Override settings? No

# Deploy to production
vercel --prod
```

### Step 3: Configure Environment Variables

In Vercel Dashboard → Project → Settings → Environment Variables:

```env
# Add these variables for ALL environments (Production, Preview, Development)

VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_GEMINI_API_KEY=your-gemini-key-here
API_KEY=your-gemini-key-here
VITE_GOOGLE_API_KEY=your-maps-key-here
VITE_GOOGLE_MAPS_API_KEY=your-maps-key-here
```

**Important**: After adding variables, redeploy:
```bash
vercel --prod
```

### Step 4: Configure Custom Domain

1. In Vercel Dashboard → Project → Settings → Domains
2. Add domain: `yourdomain.com`
3. Update DNS records (provided by Vercel):
   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
4. Wait for DNS propagation (~5-60 minutes)
5. SSL certificate auto-provisioned by Vercel

### Step 5: Enable Automatic Deployments

Vercel automatically deploys on every push:
- Push to `main` branch → Production deployment
- Pull requests → Preview deployment

**Configure deployment settings**:
```json
// vercel.json (optional)
{
  "github": {
    "enabled": true,
    "autoAlias": true,
    "silent": true
  },
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "framework": "vite"
}
```

### Step 6: Verify Deployment

1. Visit your deployment URL
2. Check console for errors (F12)
3. Test authentication flow
4. Test map assistant
5. Verify API calls work

**Deployment URL**: `https://Darieai.vercel.app` or your custom domain

---

## 🔵 Netlify Deployment

### Step 1: Build Locally

```bash
npm run build
```

Verify `dist` folder created.

### Step 2: Deploy via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Initialize site
netlify init

# Follow prompts:
# - Create & configure a new site
# - Team: Your team
# - Site name: Darieai
# - Build command: npm run build
# - Directory: dist

# Deploy
netlify deploy --prod
```

### Step 3: Configure Environment Variables

In Netlify Dashboard → Site Settings → Environment Variables:

Add the same variables as Vercel (see above).

### Step 4: Configure Build Settings

In Netlify Dashboard → Site Settings → Build & Deploy:

```
Build command: npm run build
Publish directory: dist
Node version: 18
```

### Step 5: Enable Continuous Deployment

Netlify auto-deploys on Git push:
1. Settings → Build & Deploy → Continuous Deployment
2. Enable: "Deploy site when push to main branch"
3. Add build hooks for manual triggers

---

## 🖥️ Self-Hosted Deployment

### Server Requirements

- **OS**: Ubuntu 22.04 LTS (recommended)
- **RAM**: 2 GB minimum, 4 GB recommended
- **Storage**: 20 GB
- **Processor**: 2 cores minimum
- **Bandwidth**: Unmetered recommended

### Step 1: Server Setup

```bash
# SSH into server
ssh user@your-server-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v18.x.x
npm --version   # Should show 9.x.x

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install Certbot for SSL
sudo apt install -y certbot python3-certbot-nginx
```

### Step 2: Deploy Application

```bash
# Clone repository
cd /var/www
sudo git clone https://github.com/your-username/Darieai.git
cd Darieai

# Install dependencies
sudo npm install

# Create .env file
sudo nano .env
# (Paste your environment variables)

# Build application
sudo npm run build

# Set permissions
sudo chown -R www-data:www-data /var/www/Darieai
```

### Step 3: Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/Darieai
```

Add configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    root /var/www/Darieai/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA routing - send all requests to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy (if needed)
    location /api/ {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/Darieai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 4: Setup SSL Certificate

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow prompts:
# - Email: your@email.com
# - Agree to terms: Yes
# - Share email: No
# - Redirect HTTP to HTTPS: Yes

# Verify auto-renewal
sudo certbot renew --dry-run
```

### Step 5: Setup PM2 (Optional - for API server)

If you have a separate API server:

```bash
# Create ecosystem file
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'Darieai-api',
    script: 'npm',
    args: 'run server',
    cwd: '/var/www/Darieai',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

```bash
# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp /home/$USER
```

### Step 6: Setup Automatic Updates (Optional)

```bash
# Create update script
sudo nano /var/www/Darieai/update.sh
```

```bash
#!/bin/bash
cd /var/www/Darieai
git pull origin main
npm install
npm run build
sudo systemctl reload nginx
```

```bash
# Make executable
sudo chmod +x /var/www/Darieai/update.sh

# Create cron job for weekly updates
crontab -e

# Add line:
0 2 * * 0 /var/www/Darieai/update.sh
```

---

## ✅ Post-Deployment Steps

### 1. Restrict API Keys

**Google Maps API Key**:
1. Go to Google Cloud Console → Credentials
2. Edit API key
3. Application restrictions → HTTP referrers
4. Add: `https://yourdomain.com/*`
5. Remove: `http://localhost:*/*`
6. Save

**Gemini API Key**:
- No restriction needed (used server-side in edge functions)
- Monitor usage in Google AI Studio

### 2. Update Supabase CORS

1. Supabase Dashboard → Settings → API
2. Add allowed origins:
   - `https://yourdomain.com`
   - `https://www.yourdomain.com`

### 3. Configure Email Domain

**Resend**:
1. Dashboard → Domains
2. Add domain: `yourdomain.com`
3. Update DNS records:
   ```
   Type: TXT
   Name: @
   Value: v=spf1 include:_spf.resend.com ~all
   ```
4. Wait for verification

### 4. Update Environment Variables

Update any hardcoded URLs:
- API endpoints
- Callback URLs
- Redirect URLs

### 5. Test Production

**Checklist**:
- [ ] Homepage loads
- [ ] Login works (staff and client)
- [ ] Map assistant loads
- [ ] Voice input works
- [ ] 3D map renders
- [ ] API calls succeed
- [ ] OTP emails received
- [ ] OTP SMS received
- [ ] Documents upload to vault
- [ ] Content generation works
- [ ] All navigation works
- [ ] Responsive on mobile
- [ ] No console errors

### 6. Setup Monitoring

See [Monitoring & Analytics](#monitoring--analytics) section.

---

## 📊 Monitoring & Analytics

### Vercel Analytics

**Enable**:
1. Vercel Dashboard → Project → Analytics
2. Enable Analytics (free tier: 100k events/month)

**Metrics Tracked**:
- Page views
- Unique visitors
- Top pages
- Referrers
- Devices
- Countries

**In Code**:
```typescript
// pages/_app.tsx (or main.tsx)
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <>
      <YourApp />
      <Analytics />
    </>
  );
}
```

### Sentry Error Tracking

**Setup**:
```bash
npm install @sentry/react @sentry/vite-plugin
```

```typescript
// src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: "production",
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

**Error Boundary**:
```typescript
import { ErrorBoundary } from '@sentry/react';

<ErrorBoundary fallback={<ErrorFallback />}>
  <App />
</ErrorBoundary>
```

### Supabase Monitoring

**Dashboard Metrics**:
- Database queries per second
- Database size
- Storage usage
- API requests
- Edge function invocations

**Alerts**:
1. Settings → Billing → Usage alerts
2. Set thresholds:
   - Database: 80% of quota
   - Storage: 80% of quota
   - Bandwidth: 80% of quota

### Custom Logging

```typescript
// lib/logger.ts
export const logger = {
  info: (message: string, data?: any) => {
    if (import.meta.env.PROD) {
      // Send to logging service
      console.log('[INFO]', message, data);
    }
  },
  error: (message: string, error?: Error) => {
    console.error('[ERROR]', message, error);
    // Send to Sentry
    Sentry.captureException(error);
  },
  warn: (message: string, data?: any) => {
    console.warn('[WARN]', message, data);
  }
};
```

---

## 🐛 Troubleshooting Guide

### Issue 1: Build Fails on Vercel/Netlify

**Symptoms**:
```
Error: Build failed with exit code 1
Module not found: Can't resolve 'X'
```

**Solutions**:

**A. Missing Dependencies**:
```bash
# Locally test build
npm run build

# If it fails locally, fix dependencies
npm install missing-package

# Commit and push
git add package.json package-lock.json
git commit -m "fix: add missing dependency"
git push
```

**B. Environment Variables Missing**:
- Check all `VITE_` prefixed variables are set
- Redeploy after adding variables

**C. Node Version Mismatch**:
```json
// package.json
{
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

**D. Memory Issues**:
```json
// package.json
{
  "scripts": {
    "build": "NODE_OPTIONS='--max-old-space-size=4096' vite build"
  }
}
```

---

### Issue 2: Map Not Loading in Production

**Symptoms**:
- 3D map shows blank screen
- Console error: "RefererNotAllowedMapError"
- Or: "ApiNotActivatedMapError"

**Solutions**:

**A. API Key Not Restricted Correctly**:
1. Google Cloud Console → Credentials
2. Edit Maps API key
3. Application restrictions → HTTP referrers
4. Add production domain: `https://yourdomain.com/*`
5. Save and wait 5 minutes

**B. API Not Enabled**:
1. APIs & Services → Library
2. Enable:
   - Maps JavaScript API ✅
   - Map Tiles API ✅
   - Places API (New) ✅
   - Geocoding API ✅

**C. Billing Not Enabled**:
1. Billing → Link billing account
2. Verify credit card added

**D. Environment Variable Not Set**:
```bash
# Verify variable in deployment
echo $VITE_GOOGLE_API_KEY

# Should output your API key
# If empty, add to Vercel/Netlify dashboard
```

---

### Issue 3: Voice Not Working

**Symptoms**:
- Microphone button doesn't activate
- No audio input detected
- Error: "Permission denied"

**Solutions**:

**A. HTTPS Required**:
- Microphone only works on HTTPS in production
- Verify SSL certificate active
- Check URL starts with `https://`

**B. Browser Permissions**:
1. Click lock icon in address bar
2. Permissions → Microphone → Allow
3. Refresh page

**C. Browser Compatibility**:
- **Supported**: Chrome, Edge, Safari (latest)
- **Limited**: Firefox (some issues)
- Test in Chrome first

**D. Gemini API Key Issue**:
```typescript
// Check API key loaded
console.log('API Key:', process.env.API_KEY ? 'Present' : 'Missing');

// Should log: "API Key: Present"
```

---

### Issue 4: Authentication Fails

**Symptoms**:
- Login button does nothing
- Error: "Failed to fetch"
- OTP not received

**Solutions**:

**A. Edge Functions Not Deployed**:
```bash
# Deploy all functions
supabase functions deploy

# Check deployment status
supabase functions list
```

**B. Supabase URL/Key Wrong**:
```bash
# Verify credentials
curl https://your-project.supabase.co/rest/v1/ \
  -H "apikey: your-anon-key"

# Should return: {"message":"Welcome to PostgREST"}
```

**C. CORS Issues**:
1. Supabase Dashboard → Settings → API
2. Add production URL to allowed origins
3. Include trailing slash: `https://yourdomain.com/`

**D. Email/SMS Not Configured**:
```bash
# Check secrets in Supabase
supabase secrets list

# Should show:
# - RESEND_API_KEY
# - TWILIO_ACCOUNT_SID
# - TWILIO_AUTH_TOKEN
# - TWILIO_PHONE_NUMBER
```

---

### Issue 5: Database Queries Failing

**Symptoms**:
- Data not loading
- Error: "permission denied for table X"
- Empty results returned

**Solutions**:

**A. RLS Policies Not Configured**:
```sql
-- Check if RLS enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Should show rowsecurity = true

-- If false, enable:
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```

**B. User Not Authenticated**:
```typescript
// Check if user authenticated
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session);

// Should show session object, not null
```

**C. Wrong Table/Column Names**:
```typescript
// Use exact table names (check database)
const { data, error } = await supabase
  .from('client_profiles')  // Not 'clientProfiles'
  .select('*');

if (error) console.error('DB Error:', error);
```

---

### Issue 6: Slow Performance

**Symptoms**:
- Page loads slowly (>3 seconds)
- Map animations laggy
- UI freezing

**Solutions**:

**A. Optimize Bundle Size**:
```bash
# Analyze bundle
npm run build -- --mode=production

# Check dist/assets folder
ls -lh dist/assets/

# JavaScript bundles should be <500KB each
```

**B. Enable Code Splitting**:
```typescript
// Use lazy loading
import { lazy, Suspense } from 'react';

const DarieAssistant = lazy(() => import('./DarieAssistant'));

<Suspense fallback={<Loading />}>
  <DarieAssistant />
</Suspense>
```

**C. Optimize Images**:
```bash
# Install image optimizer
npm install sharp

# Optimize images before upload
# Max width: 1920px
# Format: WebP
# Quality: 80%
```

**D. Enable Caching**:
```typescript
// Service Worker for caching
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa';

export default {
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ]
}
```

---

### Issue 7: API Rate Limiting

**Symptoms**:
```
Error: 429 Too Many Requests
Quota exceeded
```

**Solutions**:

**A. Gemini AI Limits**:
- Free tier: 60 req/min, 1500 req/day
- **Solution**: Implement request queuing
- **Or**: Upgrade to paid tier

```typescript
// Simple rate limiter
class RateLimiter {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  private requestsPerMinute = 60;
  private interval = 60000; // 1 minute

  async add<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.process();
    });
  }

  private async process() {
    if (this.processing || this.queue.length === 0) return;
    this.processing = true;

    while (this.queue.length > 0) {
      const fn = this.queue.shift()!;
      await fn();
      await this.delay(this.interval / this.requestsPerMinute);
    }

    this.processing = false;
  }

  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

const limiter = new RateLimiter();

// Use it
const response = await limiter.add(() => 
  geminiClient.generateContent(prompt)
);
```

**B. Google Maps Limits**:
- Monitor usage in Cloud Console
- Set budget alerts
- **Solution**: Cache geocoding results
- **Or**: Increase budget

**C. Supabase Limits**:
- Free tier: 500MB database, 1GB storage
- **Solution**: Optimize queries, clean old data
- **Or**: Upgrade to Pro plan ($25/month)

---

## ⚡ Performance Optimization

### Frontend Optimization

**1. Code Splitting**:
```typescript
// Split large components
const ContentStudio = lazy(() => import('./components/ContentStudio'));
const MarketIntelligence = lazy(() => import('./components/MarketIntelligence'));
```

**2. Memo Heavy Components**:
```typescript
import { memo } from 'react';

const ExpensiveComponent = memo(({ data }) => {
  // Heavy computation
  return <div>{/* ... */}</div>;
});
```

**3. Debounce Search**:
```typescript
import { useDeferredValue } from 'react';

const deferredSearch = useDeferredValue(searchQuery);
```

**4. Virtualize Long Lists**:
```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

const virtualizer = useVirtualizer({
  count: items.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 50
});
```

### Backend Optimization

**1. Database Indexes**:
```sql
-- Add indexes on frequently queried columns
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_listings_price ON listings(price);
CREATE INDEX idx_listings_location ON listings(location);
```

**2. Query Optimization**:
```typescript
// Select only needed columns
const { data } = await supabase
  .from('listings')
  .select('id, title, price, bedrooms')  // Not *
  .limit(20);

// Use single query with joins instead of multiple queries
const { data } = await supabase
  .from('clients')
  .select(`
    *,
    client_profiles(*),
    assigned_advisor:users!assigned_advisor_id(name, email)
  `);
```

**3. Caching Strategy**:
```typescript
// Cache frequently accessed data
const cache = new Map();

async function getCachedData(key: string, fetcher: () => Promise<any>, ttl = 3600000) {
  if (cache.has(key)) {
    const { data, timestamp } = cache.get(key);
    if (Date.now() - timestamp < ttl) {
      return data;
    }
  }

  const data = await fetcher();
  cache.set(key, { data, timestamp: Date.now() });
  return data;
}
```

### Asset Optimization

**1. Image Compression**:
```bash
# Use WebP format
# Compress before upload
# Max dimensions: 1920x1080
```

**2. Font Optimization**:
```css
/* Use only needed font weights */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

/* Preload critical fonts */
<link rel="preload" href="/fonts/Inter-Regular.woff2" as="font" type="font/woff2" crossorigin>
```

**3. Lazy Load Images**:
```typescript
<img src={src} loading="lazy" alt={alt} />
```

---

## ✅ Pre-Launch Checklist

- [ ] All environment variables set in production
- [ ] Database migrations applied
- [ ] Edge functions deployed
- [ ] API keys restricted to production domain
- [ ] Custom domain configured with SSL
- [ ] Email domain verified (Resend)
- [ ] SMS tested (Twilio)
- [ ] All features tested in production
- [ ] Error tracking enabled (Sentry)
- [ ] Analytics enabled (Vercel/Google)
- [ ] Monitoring alerts configured
- [ ] Backup strategy in place
- [ ] Performance benchmarks met (<3s load time)
- [ ] Mobile responsiveness verified
- [ ] Accessibility tested (WCAG 2.1)
- [ ] SEO meta tags configured
- [ ] Security headers enabled
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] Documentation updated
- [ ] Team trained on platform usage

---

Part 6: Deployment & Troubleshooting Guide. You now have all 6 comprehensive documentation parts covering every aspect of the DarieAI platform!

