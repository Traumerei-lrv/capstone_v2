import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const port = Number.parseInt(process.env.PORT || '3001', 10);
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey && supabaseServiceRoleKey);

let authClient = null;
let adminClient = null;

if (hasSupabaseConfig) {
  authClient = createClient(supabaseUrl, supabaseAnonKey);
  adminClient = createClient(supabaseUrl, supabaseServiceRoleKey);
} else {
  console.warn('Supabase env vars are missing. /api/auth/session will return 503 until backend env is configured.');
}

app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, supabaseConfigured: hasSupabaseConfig });
});

app.get('/api/auth/session', async (req, res) => {
  try {
    if (!hasSupabaseConfig || !authClient || !adminClient) {
      return res.status(503).json({
        error: 'Backend Supabase env is not configured. Set SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY in backend/.env.',
      });
    }

    const authorization = req.headers.authorization || '';
    const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : null;

    if (!token) {
      return res.status(401).json({ error: 'Missing access token.' });
    }

    const { data: userData, error: userError } = await authClient.auth.getUser(token);

    if (userError || !userData?.user) {
      return res.status(401).json({ error: userError?.message || 'Invalid session.' });
    }

    const user = userData.user;
    const fallbackName = [user.user_metadata?.first_name, user.user_metadata?.last_name].filter(Boolean).join(' ').trim();
    const defaultFullName = user.user_metadata?.full_name || fallbackName || user.email || 'Unnamed user';

    const { data: existingProfile, error: profileError } = await adminClient
      .from('profiles')
      .select('id, full_name, role')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      return res.status(500).json({ error: profileError.message });
    }

    if (existingProfile) {
      return res.json({
        user: {
          id: user.id,
          email: user.email,
        },
        profile: existingProfile,
      });
    }

    const { data: createdProfile, error: createError } = await adminClient
      .from('profiles')
      .upsert(
        {
          id: user.id,
          full_name: defaultFullName,
          role: 'student',
        },
        { onConflict: 'id' },
      )
      .select('id, full_name, role')
      .single();

    if (createError) {
      return res.status(500).json({ error: createError.message });
    }

    return res.json({
      user: {
        id: user.id,
        email: user.email,
      },
      profile: createdProfile,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Unexpected error.' });
  }
});

app.listen(port, () => {
  console.log(`Instructor auth API running on http://localhost:${port}`);
});
