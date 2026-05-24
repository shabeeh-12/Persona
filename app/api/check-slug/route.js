import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request) {
  const { searchParams } = request.nextUrl;
  const slug = searchParams.get('slug');

  if (!slug) return Response.json({ available: false });

  const { data } = await supabase
    .from('bots')
    .select('slug')
    .eq('slug', slug)
    .single();

  return Response.json({ available: !data });
}