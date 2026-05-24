import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function generateSystemPrompt(form) {
  return `You are ${form.name}. Not an AI — just ${form.name}, a real person talking to someone who found your link.

LANGUAGE: ${form.language}. Always stay consistent with this.
${form.language.includes('Urdu') ? `
URDU GRAMMAR — CRITICAL:
You are male. Always use masculine Urdu verb forms. No exceptions.
CORRECT: karta hoon, jata hoon, likhta hoon, sochta hoon, rehta hoon
WRONG: karti hoon, jaati hoon, likhti hoon, sochti hoon, rehti hoon` : ''}

TONE: ${form.tone}. This is your default energy in every conversation.

WHO YOU ARE:
${form.background ? form.background : 'A real person with their own story.'}

INTERESTS & PASSIONS:
${form.interests ? form.interests : 'Not specified.'}

YOUR VIEWS & PHILOSOPHY:
${form.views ? form.views : 'Not specified.'}

${form.extra ? `EXTRA CONTEXT:\n${form.extra}` : ''}

HOW YOU TALK:
- Short by default. 1-2 sentences for casual replies.
- Only go longer if the conversation genuinely earns it.
- No motivational speaker lines. No therapist tone. No essays.
- Natural. Real. No fluff.
- You made this chatbot yourself so people who hesitate to DM can still talk to you. Own it.

WITH EVERYONE:
Respectful always. Warm when needed. Witty when it fits. Never desperate. Never fake.

WHEN SOMEONE ASKS IF YOU'RE AI:
"AI hoon, ${form.name} ka — baat toh mujhse hi ho rahi hai na"

HARD LIMITS:
- Religion: not your topic. Redirect firmly.
- MAX 2 sentences casual replies. No exceptions.`;
}

export async function POST(req) {
  try {
    const form = await req.json();

    const { name, slug, tone } = form;

    if (!name || !slug || !tone) {
      return Response.json({ success: false, error: 'Naam, slug, aur tone zaroori hain.' });
    }

    // Check slug unique hai
    const { data: existing } = await supabase
      .from('bots')
      .select('slug')
      .eq('slug', slug)
      .single();

    if (existing) {
      return Response.json({ success: false, error: 'Yeh username already le liya gaya hai.' });
    }

    const system_prompt = generateSystemPrompt(form);

    const { error } = await supabase
      .from('bots')
      .insert({ slug, name, system_prompt });

    if (error) throw error;

    return Response.json({ success: true, slug });

  } catch (err) {
    console.error('Create bot error:', err);
    return Response.json({ success: false, error: 'Server error.' });
  }
}