import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request) {
  try {
    const { searchParams } = request.nextUrl;
    const session_id = searchParams.get('session_id');

    if (!session_id) {
      return Response.json({ messages: [] });
    }

    const { data, error } = await supabase
      .from('messages')
      .select('role, content')
      .order('created_at', { ascending: true })
      .eq('session_id', session_id);

    if (error) throw error;

    return Response.json({ messages: data || [] });

  } catch (err) {
    console.error('History fetch error:', err);
    return Response.json({ messages: [] });
  }
}