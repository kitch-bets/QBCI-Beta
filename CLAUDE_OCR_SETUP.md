# Setting Up Claude API for OCR

Your admin panel now uses Claude's powerful Vision API for OCR instead of Tesseract.js. This provides much better accuracy for extracting QB stats from screenshots!

## Benefits of Claude OCR

✅ **Higher Accuracy**: Claude understands table structures better
✅ **Faster Processing**: Typically 5-10 seconds vs 20-30 seconds
✅ **Better Table Recognition**: Handles complex layouts
✅ **Smart Formatting**: Automatically formats as tab-separated values
✅ **No Browser Limitations**: Works reliably across all browsers

---

## Setup Instructions (5 minutes)

### Step 1: Get Your Claude API Key

1. **Go to**: https://console.anthropic.com/settings/keys
2. **Sign in** or create an account (if you don't have one)
3. **Click**: "Create Key"
4. **Name it**: "QBCI OCR" (or any name you want)
5. **Copy** the API key (starts with `sk-ant-api03-...`)

**Important**: Copy it now! You won't be able to see it again.

### Step 2: Add API Key to Your Config

1. **Open**: `config/supabase-config.js` in a text editor
2. **Add** these lines after the `SUPABASE_CONFIG` section:

```javascript
// Claude API Configuration for OCR
const CLAUDE_CONFIG = {
    apiKey: 'sk-ant-api03-YOUR-KEY-HERE', // Paste your actual API key
    model: 'claude-3-5-sonnet-20241022',
    useForOCR: true
};
```

3. **Replace** `'sk-ant-api03-YOUR-KEY-HERE'` with your actual API key
4. **Save** the file

### Example of Complete Config File:

```javascript
const SUPABASE_CONFIG = {
    url: 'https://zaljfpagjzndgudnyggu.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
};

// Claude API Configuration for OCR
const CLAUDE_CONFIG = {
    apiKey: 'sk-ant-api03-xxxxxxxxxxxxxxxxxxxxx',
    model: 'claude-3-5-sonnet-20241022',
    useForOCR: true
};

// Initialize Supabase client...
let supabaseClient = null;
// ... rest of the file
```

### Step 3: Test It!

1. **Open**: `admin-login.html` and login
2. **Go to**: 📸 OCR Upload tab
3. **Upload** a screenshot of a QB stats table
4. **Click**: "🔍 Run OCR"
5. **Watch** the progress bar (usually 5-10 seconds)
6. **Review** the extracted data
7. **Click**: "📊 Parse to Table"
8. **Upload** to database or download CSV!

---

## Pricing

Claude API is very affordable:

- **Claude 3.5 Sonnet**: $3 per million input tokens
- **Typical screenshot**: ~1,000 tokens (images) + ~200 tokens (response)
- **Cost per OCR**: ~$0.004 (less than half a cent!)
- **100 screenshots**: ~$0.40
- **1,000 screenshots**: ~$4.00

**Free Tier**: New accounts get $5 in free credits to start!

---

## Troubleshooting

### "Claude API key not configured"

**Problem**: API key is not set or still has placeholder value

**Solution**:
1. Check `config/supabase-config.js`
2. Make sure you added the `CLAUDE_CONFIG` section
3. Verify your API key starts with `sk-ant-api03-`
4. Refresh the admin panel page

### "API Error: Invalid API key"

**Problem**: The API key is incorrect or expired

**Solution**:
1. Go to https://console.anthropic.com/settings/keys
2. Create a new key
3. Update `config/supabase-config.js` with the new key

### "OCR Error: 401 Unauthorized"

**Problem**: API key is invalid or doesn't have proper permissions

**Solution**:
1. Verify the key is copied correctly (no extra spaces)
2. Make sure the key is active in the Claude console
3. Check that your account has available credits

### "OCR taking too long" or "Timeout error"

**Problem**: Network issues or large image file

**Solution**:
1. Check your internet connection
2. Try a smaller/compressed screenshot
3. Crop the image to show only the table

### "Extracted text is not a table"

**Problem**: Image wasn't recognized as a table

**Solution**:
1. Make sure the screenshot clearly shows a table structure
2. Crop out any surrounding text or UI elements
3. Use higher resolution/clearer screenshots
4. Try adjusting the image for better contrast

---

## API Key Security

### ⚠️ Important Security Notes:

1. **Never share** your API key publicly
2. **Never commit** `config/supabase-config.js` to GitHub (it's in `.gitignore`)
3. **Regenerate** your key if you think it's been exposed
4. **Use different keys** for different projects/environments

### The `.gitignore` Protection:

Your `.gitignore` file is configured to exclude:
```
config/supabase-config.js
```

This means your API keys **won't be committed to Git** even if you try! ✅

---

## How It Works

1. **You upload** a screenshot to the admin panel
2. **Browser converts** the image to base64
3. **Admin panel sends** the image to Claude's API
4. **Claude analyzes** the image and extracts the table
5. **API returns** the data as tab-separated text
6. **Parser converts** it to an editable table
7. **You review/edit** and upload to Supabase

All processing happens securely between your browser and Claude's servers. Your Supabase database credentials are never sent to Claude.

---

## Alternative: Using Environment Variables (Advanced)

For production deployments, you might want to use environment variables:

1. Create a `.env` file:
```
CLAUDE_API_KEY=sk-ant-api03-xxx
```

2. Use a build tool to inject it:
```javascript
const CLAUDE_CONFIG = {
    apiKey: import.meta.env.CLAUDE_API_KEY,
    model: 'claude-3-5-sonnet-20241022'
};
```

3. Or use a backend proxy server to keep keys secure

---

## Usage Tips

### For Best OCR Results:

1. **High resolution screenshots** (1920x1080 or better)
2. **Crop tightly** around the table
3. **Good contrast** between text and background
4. **Clear font** (not blurry or pixelated)
5. **Straight alignment** (not rotated or skewed)

### Sample Workflow:

1. Take screenshot of QB stats from ESPN/PFF/etc
2. Crop in your OS image editor
3. Upload to admin panel OCR tab
4. Run OCR → Review → Parse → Upload
5. Data instantly appears in your database!

---

## What's Next?

Once you have Claude OCR set up, you can:

- **Bulk process** multiple screenshots quickly
- **Archive old data** by OCR'ing historical images
- **Share screenshots** with teammates who can upload them
- **Automate workflows** by combining OCR + database

---

## Support

- **Claude API Docs**: https://docs.anthropic.com/
- **API Status**: https://status.anthropic.com/
- **Pricing**: https://www.anthropic.com/pricing
- **Console**: https://console.anthropic.com/

---

## Quick Reference

```javascript
// Your config should look like this:
const CLAUDE_CONFIG = {
    apiKey: 'sk-ant-api03-xxxxxxxxxxxxxxxxxxxxx', // ← Your key here
    model: 'claude-3-5-sonnet-20241022', // ← Claude 3.5 Sonnet
    useForOCR: true // ← Enable OCR
};
```

**API Key Format**: `sk-ant-api03-` followed by ~80 random characters

**Where to Get**: https://console.anthropic.com/settings/keys

**Cost**: ~$0.004 per screenshot (~1/4 of a penny!)

---

✅ **Ready to use!** Once configured, your OCR will be powered by Claude's state-of-the-art vision AI!
