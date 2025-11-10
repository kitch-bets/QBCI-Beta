-- QBCI Database Setup SQL
-- Copy and paste this into your Supabase SQL Editor
-- Go to: https://app.supabase.com/project/zaljfpagjzndgudnyggu/sql/new

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

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_qb_weekly_player ON qb_weekly_data(player);
CREATE INDEX IF NOT EXISTS idx_qb_weekly_week ON qb_weekly_data(week);
CREATE INDEX IF NOT EXISTS idx_qb_weekly_created ON qb_weekly_data(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_qb_weekly_data_updated_at ON qb_weekly_data;
CREATE TRIGGER update_qb_weekly_data_updated_at
    BEFORE UPDATE ON qb_weekly_data
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE qb_weekly_data ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to read data" ON qb_weekly_data;
DROP POLICY IF EXISTS "Allow authenticated users to insert data" ON qb_weekly_data;
DROP POLICY IF EXISTS "Allow authenticated users to update data" ON qb_weekly_data;
DROP POLICY IF EXISTS "Allow authenticated users to delete data" ON qb_weekly_data;

-- Create RLS policies for authenticated users
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

-- Insert sample data (optional - remove if you don't want sample data)
INSERT INTO qb_weekly_data (player, week, opponent, passing_yards, accuracy_pct, comp_pct, btt_rate, twp_rate, prop_line, bet_result)
VALUES
    ('Baker Mayfield', 1, '@ATL', 167, 53.1, 53.1, 6.1, 10.5, 244.5, 'Under'),
    ('Baker Mayfield', 2, '@HOU', 215, 65.8, 65.8, 6.8, 3.8, 235.5, 'Under'),
    ('Baker Mayfield', 3, 'NYJ', 233, 65.5, 65.5, 8.8, 2.5, 236.5, 'Under'),
    ('Baker Mayfield', 4, 'PHI', 289, 55.0, 55.0, 7.0, 4.3, 227.5, 'Over'),
    ('Baker Mayfield', 5, '@SEA', 379, 87.9, 87.9, 8.3, 0.0, 229.5, 'Over'),
    ('Baker Mayfield', 6, 'SF', 256, 73.9, 73.9, 4.2, 0.0, 239.5, 'Over'),
    ('Baker Mayfield', 7, '@DET', 228, 56.0, 56.0, 3.2, 3.5, 238.5, 'Under')
ON CONFLICT (id) DO NOTHING;

-- Verification query
SELECT 'Database setup complete! Total records:' as status, COUNT(*) as record_count
FROM qb_weekly_data;
