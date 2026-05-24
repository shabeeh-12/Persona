import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { slug, messages, session_id, user_message } = await req.json();

    // Bot ka system prompt fetch karo
    const { data: bot } = await supabase
      .from('bots')
      .select('system_prompt')
      .eq('slug', slug)
      .single();

    if (!bot) {
      return Response.json({ reply: 'Bot nahi mila.' }, { status: 404 });
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 300,
        messages: [
          { role: 'system', content: bot.system_prompt },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      return Response.json({ reply: `API Error: ${err?.error?.message || 'Unknown'}` }, { status: 500 });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'Kuch samajh nahi aaya.';

    // Messages save karo
    if (session_id) {
      await supabase.from('messages').insert([
        { session_id, role: 'user', content: user_message },
        { session_id, role: 'assistant', content: reply },
      ]);
    }

    return Response.json({ reply });

  } catch (err) {
    console.error('Persona chat error:', err);
    return Response.json({ reply: `Server error: ${err.message}` }, { status: 500 });
  }
}