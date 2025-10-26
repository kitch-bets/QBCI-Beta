# GitHub Pages Deployment Guide

This guide will help you host your QBCI™ calculator on GitHub Pages for free.

## 🌐 What is GitHub Pages?

GitHub Pages is a free static site hosting service that lets you publish websites directly from your GitHub repository. Your site will be accessible at:
```
https://[username].github.io/[repository-name]/
```

For this project:
```
https://kitch-bets.github.io/QBCI-Beta/
```

---

## 🚀 Quick Deployment (Recommended)

### Method 1: Deploy from Main Branch

This is the easiest and most common approach.

#### Step 1: Merge to Main Branch

First, we need to get your calculator code onto the main branch:

```bash
# Fetch the latest main branch
git fetch origin main

# Switch to main branch
git checkout main

# Merge your feature branch
git merge claude/qbci-calculator-development-011CUWCpdXMBJeF2REzANWy7

# Push to main
git push origin main
```

#### Step 2: Enable GitHub Pages

1. Go to your repository on GitHub:
   ```
   https://github.com/kitch-bets/QBCI-Beta
   ```

2. Click **Settings** (top navigation bar)

3. Scroll down and click **Pages** (left sidebar)

4. Under "Build and deployment":
   - **Source**: Select "Deploy from a branch"
   - **Branch**: Select "main" and "/ (root)"
   - Click **Save**

5. Wait 2-3 minutes for deployment

6. Your site will be live at:
   ```
   https://kitch-bets.github.io/QBCI-Beta/
   ```

---

## 📋 Alternative Methods

### Method 2: Deploy from gh-pages Branch

If you want to keep deployment separate from your main branch:

```bash
# Create gh-pages branch from your current work
git checkout -b gh-pages

# Push to remote
git push -u origin gh-pages

# Then in GitHub Settings > Pages:
# - Source: Deploy from a branch
# - Branch: gh-pages / (root)
```

### Method 3: GitHub Actions (Advanced)

For automatic deployments, create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./
```

---

## ✅ Verification Steps

After enabling GitHub Pages:

1. **Check Deployment Status**:
   - Go to Settings > Pages
   - Look for "Your site is live at..." message
   - Click the link to verify

2. **Test the Calculator**:
   - Visit: `https://kitch-bets.github.io/QBCI-Beta/`
   - Click "Launch Calculator"
   - Load sample data and test functionality

3. **Check Developer Console**:
   - Press F12 in browser
   - Look for any errors
   - Verify Chart.js loads from CDN

---

## 🔧 Troubleshooting

### Issue: 404 Page Not Found

**Solution**:
- Verify `index.html` is in the root directory
- Check that GitHub Pages is enabled
- Wait 5-10 minutes for initial deployment

### Issue: CSS/JS Not Loading

**Solution**:
- Check file paths are relative (not absolute)
- Current setup uses relative paths: `ci-calculator.html` ✅
- Avoid paths like: `/ci-calculator.html` ❌

### Issue: Chart.js Not Working

**Solution**:
- Chart.js loads from CDN, requires internet connection
- Check browser console for CORS errors
- Verify CDN link: `https://cdn.jsdelivr.net/npm/chart.js`

### Issue: CSV Upload Not Working

**Solution**:
- This is a client-side feature, should work fine
- Test with sample data first
- Check browser console for FileReader errors

---

## 🎨 Custom Domain (Optional)

Want a custom domain like `qbci.lsxanalytics.com`?

1. Purchase a domain from:
   - Namecheap, GoDaddy, Google Domains, etc.

2. Add CNAME file to repository root:
   ```bash
   echo "qbci.lsxanalytics.com" > CNAME
   git add CNAME
   git commit -m "Add custom domain"
   git push origin main
   ```

3. Configure DNS records:
   - Type: `CNAME`
   - Host: `qbci` (or `@` for root)
   - Value: `kitch-bets.github.io`
   - TTL: 3600

4. In GitHub Settings > Pages:
   - Enter your custom domain: `qbci.lsxanalytics.com`
   - Check "Enforce HTTPS"

---

## 📊 File Structure for GitHub Pages

Your current structure is already GitHub Pages ready:

```
QBCI-Beta/
├── index.html                 ← Landing page (entry point)
├── ci-calculator.html         ← Calculator app
├── herbert_weekly_grades.csv
├── qbci_import_template.csv
├── passing_summary.csv
├── README.md
├── README_DATA.md
└── DEPLOYMENT.md
```

✅ **This structure works perfectly with GitHub Pages!**

---

## 🔄 Updating Your Live Site

After making changes:

```bash
# Make your changes to files
git add .
git commit -m "Update calculator features"

# Push to the branch GitHub Pages is watching
git push origin main  # or gh-pages, depending on your setup

# Wait 1-2 minutes for automatic redeployment
```

---

## 📱 Testing Locally Before Deployment

Want to test before going live?

### Option 1: Simple HTTP Server (Python)

```bash
# Navigate to project directory
cd /home/user/QBCI-Beta

# Start local server
python3 -m http.server 8000

# Open browser to: http://localhost:8000
```

### Option 2: Node.js Server

```bash
# Install http-server globally
npm install -g http-server

# Run server
http-server -p 8000

# Open browser to: http://localhost:8000
```

### Option 3: VS Code Live Server

1. Install "Live Server" extension
2. Right-click `index.html`
3. Select "Open with Live Server"

---

## 🎯 Quick Start Checklist

- [ ] Merge code to `main` branch
- [ ] Push to GitHub
- [ ] Go to Settings > Pages
- [ ] Enable GitHub Pages from `main` branch
- [ ] Wait 2-3 minutes
- [ ] Visit `https://kitch-bets.github.io/QBCI-Beta/`
- [ ] Test calculator functionality
- [ ] Share link with users!

---

## 🌟 What You Get

Once deployed, you'll have:

✅ **Free hosting** - No cost, no server management
✅ **HTTPS enabled** - Automatic SSL certificate
✅ **Fast CDN** - Global content delivery
✅ **Automatic updates** - Push to main = auto deploy
✅ **Professional URL** - Clean, shareable link

---

## 📞 Support

If you run into issues:

1. Check GitHub's official docs: https://docs.github.com/en/pages
2. Verify deployment status in Settings > Pages
3. Check Actions tab for deployment logs
4. Review browser console for errors

---

**Ready to deploy?** Follow Method 1 above to get your QBCI™ calculator live in minutes!

**LSX Analytics** | QBCI™ 2024
