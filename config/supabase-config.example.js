// Supabase Configuration Template
//
// Instructions:
// 1. Copy this file to 'supabase-config.js' in the same directory
// 2. Replace the placeholder values with your actual Supabase credentials
// 3. Get your credentials from: https://app.supabase.com/project/YOUR_PROJECT/settings/api
// 4. Add your Claude API key for OCR functionality
// 5. Get Claude API key from: https://console.anthropic.com/settings/keys
//
// IMPORTANT: Never commit supabase-config.js to version control!
// The .gitignore file is configured to exclude it automatically.

const SUPABASE_CONFIG = {
    url: 'YOUR_SUPABASE_URL', // e.g., https://abcdefghijklmnop.supabase.co
    anonKey: 'YOUR_SUPABASE_ANON_KEY' // Your anon/public key (starts with eyJ...)
};

// Claude API Configuration for OCR (Optional but recommended)
// Get your API key from: https://console.anthropic.com/settings/keys
const CLAUDE_CONFIG = {
    apiKey: 'YOUR_CLAUDE_API_KEY', // e.g., sk-ant-api03-xxx
    model: 'claude-3-5-sonnet-20241022', // Claude 3.5 Sonnet with vision capabilities
    useForOCR: true // Set to false to use Tesseract.js instead
};

// Initialize Supabase client (will be used across admin pages)
let supabaseClient = null;

function initSupabase() {
    if (typeof supabase !== 'undefined') {
        supabaseClient = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        return supabaseClient;
    } else {
        console.error('Supabase library not loaded. Make sure to include the Supabase JS library.');
        return null;
    }
}

// Authentication helpers
const SupabaseAuth = {
    // Sign in with email and password
    async signIn(email, password) {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password
        });
        return { data, error };
    },

    // Sign up new user
    async signUp(email, password, metadata = {}) {
        const { data, error } = await supabaseClient.auth.signUp({
            email,
            password,
            options: {
                data: metadata
            }
        });
        return { data, error };
    },

    // Sign out
    async signOut() {
        const { error } = await supabaseClient.auth.signOut();
        return { error };
    },

    // Get current session
    async getSession() {
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        return { session, error };
    },

    // Get current user
    async getCurrentUser() {
        const { data: { user }, error } = await supabaseClient.auth.getUser();
        return { user, error };
    },

    // Listen to auth state changes
    onAuthStateChange(callback) {
        return supabaseClient.auth.onAuthStateChange(callback);
    }
};

// Database helpers
const SupabaseDB = {
    // QB Data operations
    async getQBData(playerId = null) {
        let query = supabaseClient.from('qb_weekly_data').select('*');

        if (playerId) {
            query = query.eq('player', playerId);
        }

        const { data, error } = await query.order('week', { ascending: true });
        return { data, error };
    },

    async insertQBData(gameData) {
        const { data, error } = await supabaseClient
            .from('qb_weekly_data')
            .insert(gameData)
            .select();
        return { data, error };
    },

    async updateQBData(id, updates) {
        const { data, error } = await supabaseClient
            .from('qb_weekly_data')
            .update(updates)
            .eq('id', id)
            .select();
        return { data, error };
    },

    async deleteQBData(id) {
        const { data, error } = await supabaseClient
            .from('qb_weekly_data')
            .delete()
            .eq('id', id);
        return { data, error };
    },

    // Get all unique players
    async getPlayers() {
        const { data, error } = await supabaseClient
            .from('qb_weekly_data')
            .select('player')
            .order('player');

        if (data) {
            const uniquePlayers = [...new Set(data.map(row => row.player))];
            return { data: uniquePlayers, error };
        }
        return { data: [], error };
    },

    // Bulk insert from CSV
    async bulkInsertCSV(csvArray) {
        const { data, error } = await supabaseClient
            .from('qb_weekly_data')
            .insert(csvArray)
            .select();
        return { data, error };
    }
};
