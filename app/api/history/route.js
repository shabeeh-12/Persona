import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request) {
  try {
    const { searchParams } = request.nextUrl;
    const session_id = searchParams.get('session_id');
    const slug = searchParams.get('slug'); // 🌟 Frontend se slug accept karein

    if (!session_id || !slug) {
      return Response.json({ messages: [] });
    }

    // 🌟 FIXED: Ab query session_id aur slug DONO check karegi
    const { data, error } = await supabase
      .from('messages')
      .select('role, content')
      .eq('session_id', session_id)
      .eq('slug', slug)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return Response.json({ messages: data || [] });

  } catch (err) {
    console.error('History fetch error:', err);
    return Response.json({ messages: [] });
  }
}