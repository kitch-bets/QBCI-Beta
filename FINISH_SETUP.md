# ✅ Finish Your Setup (2 Steps Remaining!)

Your Supabase credentials are configured! Now complete these final steps:

---

## Step 1: Create the Database Table (2 minutes)

### Go to Supabase SQL Editor:
👉 **Direct Link**: https://app.supabase.com/project/zaljfpagjzndgudnyggu/sql/new

Or manually:
1. Go to https://app.supabase.com
2. Open your "QBCI" project
3. Click **"SQL Editor"** in the left sidebar
4. Click **"+ New Query"**

### Run the Setup SQL:

**Option A: Copy from file**
1. Open the file `setup-database.sql` in this project
2. Copy all the SQL code
3. Paste it into the SQL Editor
4. Click **"Run"** (or press Ctrl/Cmd + Enter)

**Option B: Copy from here**
```sql
-- Create the main QB weekly data table
CREATE TABLE IF NOT EXISTS qb_weekly_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    player TEXT NOT NULL,
    week INTEGER NOT NULL,
    opponent TEXT NOT NULL,
    passing_yards INTEGER NOT NULL,
    accuracy_pct DECIMAL(5,2) NOT NULL,
    comp_pct DECIMAL(5,2) NOT NULL,
    btt_rate DECIMAL(5,2) DEFAULT 0,
    twp_rate DECIMAL(5,2) DEFAULT 0,
    prop_line DECIMAL(6,2),
    bet_result TEXT CHECK (bet_result IN ('Over', 'Under', NULL)),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_qb_weekly_player ON qb_weekly_data(player);
CREATE INDEX IF NOT EXISTS idx_qb_weekly_week ON qb_weekly_data(week);

ALTER TABLE qb_weekly_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read data"
    ON qb_weekly_data FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert data"
    ON qb_weekly_data FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update data"
    ON qb_weekly_data FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to delete data"
    ON qb_weekly_data FOR DELETE TO authenticated USING (true);
```

### Expected Result:
You should see: **"Success. No rows returned"** ✅

---

## Step 2: Create Your Admin User (1 minute)

### Go to Supabase Authentication:
👉 **Direct Link**: https://app.supabase.com/project/zaljfpagjzndgudnyggu/auth/users

Or manually:
1. In Supabase dashboard
2. Click **"Authentication"** in the left sidebar
3. Click **"Users"** tab

### Create Your User:
1. Click **"Add user"** button (top right)
2. Select **"Create new user"**
3. Fill in the form:
   - **Email**: Your email (e.g., `admin@yourdomain.com`)
   - **Password**: Choose a strong password
   - ✅ **IMPORTANT**: Check **"Auto Confirm User"** checkbox
4. Click **"Create user"**

### Remember These Credentials!
```
Email: _______________________
Password: _______________________
```

---

## Step 3: Test Your Login! 🎉

1. Open `admin-login.html` in your browser
   - Or click "Admin Panel" from the homepage
2. Enter the email and password you just created
3. Click **"Sign In"**
4. You should see the admin dashboard! ✅

---

## What If It Still Doesn't Work?

### Run the Setup Checker:
Open `setup-checker.html` and click "Run Setup Check" to diagnose any issues.

### Common Issues:

**"Invalid login credentials"**
- Did you check "Auto Confirm User"? ✅
- Try the exact email/password you entered
- Create a new user if needed

**"Table does not exist"**
- Go back to Step 1 and run the SQL again
- Check for errors in the SQL Editor

**"Connection error"**
- Check your internet connection
- Verify the Supabase project is active

### Check Browser Console:
1. Press F12 to open Developer Tools
2. Click "Console" tab
3. Look for red error messages
4. Share the error if you need help

---

## What You Can Do After Login:

✅ View all QB game data in a table
✅ Add new games with a form
✅ Edit existing games
✅ Delete games
✅ Filter by player
✅ Upload CSV files in bulk
✅ View real-time stats

---

## Quick Links:

- **Login Page**: `admin-login.html`
- **Setup Checker**: `setup-checker.html`
- **SQL Editor**: https://app.supabase.com/project/zaljfpagjzndgudnyggu/sql/new
- **User Management**: https://app.supabase.com/project/zaljfpagjzndgudnyggu/auth/users
- **Full Guide**: See `SUPABASE_SETUP_GUIDE.md`

---

## Summary:

1. ✅ Supabase credentials configured (DONE!)
2. ⏳ Run SQL to create table (Step 1 above)
3. ⏳ Create admin user (Step 2 above)
4. 🎉 Login and start using the admin panel!

**Total time remaining: ~3 minutes**

---

You're almost there! Just complete Steps 1 and 2, and you'll be managing your QBCI data in no time! 🚀
