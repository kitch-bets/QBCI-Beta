# Quick Start Guide - Getting the Admin Panel Working

## The Issue

The login doesn't work because **you need to set up your Supabase account first**. The admin panel requires:

1. A Supabase project (free account)
2. Database table created
3. Your API credentials configured
4. An admin user created

Don't worry - it only takes **5-10 minutes**!

## Option 1: Use the Setup Checker (Easiest)

I've created an interactive setup checker to guide you through the process:

1. **Open `setup-checker.html` in your browser**
2. Click "Run Setup Check" to see what's missing
3. Follow the step-by-step instructions on the page
4. The checker will tell you exactly what to do next

## Option 2: Manual Setup

### Step 1: Create Supabase Account (2 minutes)

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub, Google, or email
4. Create a new project:
   - **Name**: QBCI-Analytics
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Pick closest to you
   - **Plan**: Free tier
5. Click "Create new project" and wait ~2 minutes

### Step 2: Get Your API Credentials (30 seconds)

1. In your Supabase project, click the ⚙️ **Settings** icon
2. Go to **API** in the left menu
3. You'll see two values - copy them somewhere:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon/public key**: Long string starting with `eyJ...`

### Step 3: Configure Your App (1 minute)

**Option A: Use Setup Checker**
1. Open `setup-checker.html`
2. Paste your URL and key in the form
3. Click "Copy Config Code"
4. Open `config/supabase-config.js` in a text editor
5. Replace the `SUPABASE_CONFIG` section
6. Save

**Option B: Manual Edit**
1. Open `config/supabase-config.js` in a text editor
2. Replace this:
   ```javascript
   url: 'YOUR_SUPABASE_URL'
   ```
   With your actual URL:
   ```javascript
   url: 'https://xxxxxxxxxxxxx.supabase.co'
   ```
3. Replace this:
   ```javascript
   anonKey: 'YOUR_SUPABASE_ANON_KEY'
   ```
   With your actual key:
   ```javascript
   anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
   ```
4. Save the file

### Step 4: Create Database Table (2 minutes)

1. In Supabase, click **SQL Editor** in the left sidebar
2. Click **+ New Query**
3. Copy the SQL from either:
   - The `setup-checker.html` page (click "Copy SQL"), OR
   - The `SUPABASE_SETUP_GUIDE.md` file (Step 3)
4. Paste it into the SQL Editor
5. Click **Run** (or press Ctrl+Enter)
6. You should see "Success. No rows returned" ✅

### Step 5: Create Admin User (1 minute)

1. In Supabase, go to **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Enter your email and password
4. **IMPORTANT**: Check the box ✅ **"Auto Confirm User"**
5. Click **Create user**

### Step 6: Test Login (30 seconds)

1. Open `admin-login.html` in your browser
2. Enter the email and password you just created
3. Click "Sign In"
4. You should see the admin dashboard! 🎉

## Troubleshooting

### "Supabase not configured" error
- Make sure you saved `config/supabase-config.js` with your actual credentials
- Refresh the page after saving

### "Invalid login credentials" error
- Check you entered the correct email/password
- Verify you checked "Auto Confirm User" when creating the user
- Try creating a new user in Supabase

### "Error loading data" or "relation does not exist"
- The database table wasn't created
- Go back to Step 4 and run the SQL again
- Check for errors in the SQL Editor

### Still not working?
1. Open browser console (F12)
2. Look for red error messages
3. Run the setup checker: `setup-checker.html`
4. Check the full guide: `SUPABASE_SETUP_GUIDE.md`

## What You Get After Setup

Once configured, you can:

✅ **Login securely** to the admin panel
✅ **Add QB games** manually with a form
✅ **Upload CSV files** in bulk
✅ **Edit and delete** game data
✅ **Filter by player** to see specific QBs
✅ **View real-time stats** on your dashboard

## Files Reference

- `setup-checker.html` - Interactive setup guide (START HERE!)
- `SUPABASE_SETUP_GUIDE.md` - Detailed setup documentation
- `ADMIN_PANEL_README.md` - Feature documentation
- `admin-login.html` - Login page
- `admin-panel.html` - Admin dashboard
- `config/supabase-config.js` - Your credentials (needs editing)

## Help Resources

- **Setup Checker**: Open `setup-checker.html` for guided setup
- **Supabase Docs**: https://supabase.com/docs
- **Supabase Dashboard**: https://app.supabase.com

---

**Quick Summary**:
1. Create Supabase account → 2. Copy credentials → 3. Edit config file → 4. Run SQL → 5. Create user → 6. Login!

The whole process takes **5-10 minutes** and then you're good to go! 🚀
