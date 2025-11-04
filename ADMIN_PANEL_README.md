# QBCI Admin Panel

A fully functional admin dashboard with Supabase authentication for managing your QBCI quarterback data.

## Features

### Authentication
- Secure login/logout with Supabase Auth
- Session management and protected routes
- Email/password authentication
- Auto-redirect for authenticated users

### Data Management
- **View All Games**: Browse all QB game data in a sortable table
- **Filter by Player**: Quick player-specific data filtering
- **Add New Games**: Form-based game entry with validation
- **Edit Games**: Update any game record inline
- **Delete Games**: Remove records with confirmation
- **Real-time Stats**: Dashboard shows total games and unique players

### Bulk Upload
- **CSV Import**: Drag-and-drop or click to upload
- **Preview**: See record count before importing
- **Validation**: Format checking before database insert
- **Bulk Insert**: Upload hundreds of games at once

### Settings
- **Account Info**: View user email, ID, and creation date
- **Database Status**: Connection health monitoring
- **Data Management**: Clear all data (with safety confirmation)

## Quick Start

### 1. Set Up Supabase

Follow the comprehensive guide in `SUPABASE_SETUP_GUIDE.md`:
- Create a Supabase project
- Set up the database table
- Create your admin user
- Configure API credentials

### 2. Configure Your Application

```bash
# Copy the example config
cp config/supabase-config.example.js config/supabase-config.js

# Edit with your credentials
# Replace YOUR_SUPABASE_URL and YOUR_SUPABASE_ANON_KEY
```

### 3. Access the Admin Panel

1. Open `admin-login.html` in your browser
2. Log in with your Supabase user credentials
3. You'll be redirected to the admin panel dashboard

## File Structure

```
QBCI-Beta/
├── admin-login.html              # Login page
├── admin-panel.html              # Main admin dashboard
├── config/
│   ├── supabase-config.js        # Your credentials (gitignored)
│   └── supabase-config.example.js # Template
├── SUPABASE_SETUP_GUIDE.md       # Setup instructions
└── ADMIN_PANEL_README.md         # This file
```

## Pages

### admin-login.html
- Clean, modern login interface
- Password visibility toggle
- Error handling and validation
- Auto-redirect if already logged in
- Loading states and animations

### admin-panel.html
- Top navigation with user info
- Stats dashboard (total games, players, DB status)
- Three main tabs:
  - **Data Management**: CRUD operations on QB data
  - **Bulk Upload**: CSV import functionality
  - **Settings**: Account and database management

## Database Schema

The admin panel uses the `qb_weekly_data` table:

```sql
CREATE TABLE qb_weekly_data (
    id UUID PRIMARY KEY,
    player TEXT NOT NULL,
    week INTEGER NOT NULL,
    opponent TEXT NOT NULL,
    passing_yards INTEGER NOT NULL,
    accuracy_pct DECIMAL(5,2) NOT NULL,
    comp_pct DECIMAL(5,2) NOT NULL,
    btt_rate DECIMAL(5,2) DEFAULT 0,
    twp_rate DECIMAL(5,2) DEFAULT 0,
    prop_line DECIMAL(6,2),
    bet_result TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

## API Helpers

The `config/supabase-config.js` file provides helper functions:

### Authentication
```javascript
await SupabaseAuth.signIn(email, password)
await SupabaseAuth.signOut()
await SupabaseAuth.getSession()
await SupabaseAuth.getCurrentUser()
```

### Database Operations
```javascript
await SupabaseDB.getQBData(playerId)      // Get all or filtered data
await SupabaseDB.insertQBData(gameData)   // Add new game
await SupabaseDB.updateQBData(id, updates) // Update existing
await SupabaseDB.deleteQBData(id)         // Delete game
await SupabaseDB.getPlayers()             // Get unique players
await SupabaseDB.bulkInsertCSV(csvArray)  // Bulk upload
```

## Security Features

### Row Level Security (RLS)
- Only authenticated users can access data
- Policies enforce user-level permissions
- No anonymous access to database

### Protected Routes
- Session validation on page load
- Auto-redirect to login if not authenticated
- Secure token storage in browser

### API Key Protection
- Config file excluded from git (.gitignore)
- Template file for safe sharing
- Environment-based configuration support

## CSV Upload Format

### Required Columns
- player
- week
- opponent
- passing_yards
- accuracy_pct
- comp_pct

### Optional Columns
- btt_rate (default: 0)
- twp_rate (default: 0)
- prop_line
- bet_result (Over/Under)

### Example CSV
```csv
player,week,opponent,passing_yards,accuracy_pct,comp_pct,btt_rate,twp_rate,prop_line,bet_result
Baker Mayfield,1,@ATL,167,53.1,53.1,6.1,10.5,244.5,Under
Baker Mayfield,2,@HOU,215,65.8,65.8,6.8,3.8,235.5,Under
```

## Troubleshooting

### "Supabase not configured" Error
- Check that `config/supabase-config.js` exists
- Verify URL and API key are correct
- Make sure the Supabase JS library is loaded

### Login Fails
- Verify user exists in Supabase dashboard
- Check "Auto Confirm User" was enabled
- Ensure correct password

### Data Doesn't Load
- Check browser console for errors
- Verify RLS policies are set up correctly
- Confirm table name is `qb_weekly_data`

### CSV Upload Fails
- Verify CSV format matches expected columns
- Check for data type mismatches
- Look for special characters in player names

## Development

### Local Testing
```bash
# Serve with any static server
python -m http.server 8000
# or
npx serve
```

### Production Deployment
1. Set up production Supabase project
2. Use environment-based config
3. Enable email confirmation
4. Set up custom domain for Supabase
5. Configure CORS if needed

## Best Practices

1. **Regular Backups**: Export CSV of your data regularly
2. **Strong Passwords**: Use unique, complex passwords for admin accounts
3. **Limited Access**: Only create necessary admin accounts
4. **Monitor Usage**: Check Supabase dashboard for usage stats
5. **Test First**: Try changes on sample data before bulk operations

## Future Enhancements

Potential features to add:
- Multi-user roles (admin, editor, viewer)
- Activity logs and audit trail
- Advanced filtering and search
- Data export functionality
- Batch edit operations
- Custom reporting
- Real-time data sync
- Mobile-responsive improvements

## Support

- See `SUPABASE_SETUP_GUIDE.md` for setup help
- Check Supabase docs: [https://supabase.com/docs](https://supabase.com/docs)
- Report issues in the project repository

---

Built with Supabase, vanilla JavaScript, and modern CSS.
