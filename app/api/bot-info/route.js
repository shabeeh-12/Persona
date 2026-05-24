import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request) {
  const { searchParams } = request.nextUrl;
  const slug = searchParams.get('slug');

  if (!slug) return Response.json({ found: false });

  const { data } = await supabase
    .from('bots')
    .select('name, system_prompt')
    .eq('slug', slug)
    .single();

  if (!data) return Response.json({ found: false });

  return Response.json({ found: true, name: data.name, system_prompt: data.system_prompt });
}