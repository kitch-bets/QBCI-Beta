# Supabase Setup Guide for QBCI Admin Panel

This guide will walk you through setting up Supabase authentication and database for your QBCI Admin Panel.

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up for a free account
2. Click "New Project"
3. Fill in your project details:
   - **Name**: QBCI-Analytics (or any name you prefer)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the closest region to you
   - **Pricing Plan**: Free tier is sufficient to start
4. Click "Create new project" and wait for it to initialize (takes ~2 minutes)

## Step 2: Get Your API Keys

1. In your Supabase project dashboard, go to **Settings** (gear icon) → **API**
2. You'll see two important values:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon/public key**: A long JWT token starting with `eyJ...`

3. Copy these values - you'll need them in Step 5

## Step 3: Create the Database Table

1. In Supabase dashboard, go to **SQL Editor** (in the left sidebar)
2. Click **+ New Query**
3. Copy and paste the following SQL:

```sql
-- Create the qb_weekly_data table
CREATE TABLE qb_weekly_data (
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

-- Create an index for faster queries
CREATE INDEX idx_qb_weekly_player ON qb_weekly_data(player);
CREATE INDEX idx_qb_weekly_week ON qb_weekly_data(week);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_qb_weekly_data_updated_at
    BEFORE UPDATE ON qb_weekly_data
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE qb_weekly_data ENABLE ROW LEVEL SECURITY;

-- Create policies (allow authenticated users to do everything)
CREATE POLICY "Allow authenticated users to read data"
    ON qb_weekly_data FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to insert data"
    ON qb_weekly_data FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update data"
    ON qb_weekly_data FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to delete data"
    ON qb_weekly_data FOR DELETE
    TO authenticated
    USING (true);
```

4. Click **Run** (or press Ctrl/Cmd + Enter)
5. You should see "Success. No rows returned" - this is correct!

## Step 4: Create Your Admin User

1. In Supabase dashboard, go to **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Enter your admin credentials:
   - **Email**: Your email address
   - **Password**: Choose a strong password
   - **Auto Confirm User**: ✅ Check this box (important!)
4. Click **Create user**

You can add more users later using this same process.

## Step 5: Configure Your Application

1. Open the file `config/supabase-config.js` in your QBCI project
2. Replace the placeholder values with your actual Supabase credentials:

```javascript
const SUPABASE_CONFIG = {
    url: 'https://xxxxxxxxxxxxx.supabase.co', // Your Project URL from Step 2
    anonKey: 'eyJxxxxxxxxx...' // Your anon/public key from Step 2
};
```

3. Save the file

## Step 6: Test Your Admin Panel

1. Open `admin-login.html` in your browser
2. Log in with the credentials you created in Step 4
3. You should be redirected to the admin panel

If you see a login error, check:
- Your credentials are correct
- You checked "Auto Confirm User" when creating the user
- Your API keys are correctly copied into `supabase-config.js`

## Step 7: (Optional) Seed Sample Data

You can quickly populate your database with sample data:

1. Go to the admin panel
2. Click the **Bulk Upload** tab
3. Upload one of the sample CSV files:
   - `mayfield_weekly_with_props.csv`
   - `qbci_import_template_with_props.csv`
4. Click **Upload to Database**

## Step 8: Using the Admin Panel

### Data Management
- **View all games**: See all QB game data in a table
- **Filter by player**: Use the dropdown to view specific QBs
- **Add new game**: Click "+ Add New Game" button
- **Edit game**: Click "Edit" button on any row
- **Delete game**: Click "Delete" button on any row

### Bulk Upload
- **Upload CSV**: Drag and drop or click to upload CSV files
- **Preview**: See how many records will be uploaded
- **Confirm**: Click "Upload to Database" to save

### Settings
- **View account info**: See your email, user ID, and account creation date
- **Manage data**: Clear all data (use with caution!)

## Security Best Practices

### 1. Protect Your API Keys
- Never commit `supabase-config.js` with real credentials to public repositories
- Add `config/supabase-config.js` to your `.gitignore`
- Use environment variables for production deployments

### 2. Use Row Level Security (RLS)
- The SQL script above enables RLS by default
- Only authenticated users can access/modify data
- Customize policies based on your needs

### 3. Email Verification
- For production, enable email confirmation in Supabase settings
- Go to **Authentication** → **Providers** → **Email**
- Enable "Confirm email" option

### 4. Password Policies
- Enforce strong passwords in Supabase settings
- Go to **Authentication** → **Policies**
- Set minimum password length and complexity requirements

## Troubleshooting

### "Supabase not configured" error
- Check that `config/supabase-config.js` has the correct URL and key
- Make sure you're loading the file before the admin pages

### "Invalid login credentials" error
- Verify the user exists in Supabase → Authentication → Users
- Make sure "Auto Confirm User" was checked
- Check that the password is correct

### "Error loading data" message
- Verify the SQL table was created successfully
- Check that RLS policies are set up correctly
- Look in browser console for detailed error messages

### Data not appearing in the table
- Make sure you're logged in as an authenticated user
- Check the browser console for errors
- Verify the table name matches in `supabase-config.js` (should be `qb_weekly_data`)

## Advanced Configuration

### Custom Email Templates
1. Go to **Authentication** → **Email Templates**
2. Customize the confirmation, reset password, and invite emails
3. Use your own SMTP server if desired

### Multiple Environments
For development and production environments:

```javascript
// config/supabase-config.js
const ENV = 'development'; // or 'production'

const SUPABASE_CONFIGS = {
    development: {
        url: 'YOUR_DEV_URL',
        anonKey: 'YOUR_DEV_KEY'
    },
    production: {
        url: 'YOUR_PROD_URL',
        anonKey: 'YOUR_PROD_KEY'
    }
};

const SUPABASE_CONFIG = SUPABASE_CONFIGS[ENV];
```

### Backup Your Data
1. In Supabase dashboard, go to **Database** → **Backups**
2. Enable daily backups (available on paid plans)
3. Or export data manually via SQL Editor:

```sql
COPY (SELECT * FROM qb_weekly_data) TO STDOUT WITH CSV HEADER;
```

## Next Steps

1. ✅ Set up Supabase project
2. ✅ Create database table
3. ✅ Create admin user
4. ✅ Configure application
5. ✅ Test login and data management
6. 📊 Start adding your QB data!
7. 🎯 Use the QBCI Calculator with your database

## Support

- **Supabase Documentation**: [https://supabase.com/docs](https://supabase.com/docs)
- **Supabase Discord**: [https://discord.supabase.com](https://discord.supabase.com)
- **QBCI Issues**: Check the project README

---

**That's it!** Your QBCI Admin Panel is now fully integrated with Supabase. You can securely manage your quarterback data, track prop lines, and analyze betting performance all from one centralized dashboard.
