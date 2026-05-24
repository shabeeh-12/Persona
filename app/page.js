'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedSlug, setGeneratedSlug] = useState('');

  const [form, setForm] = useState({
    name: '',
    slug: '',
    language: 'Roman Urdu + English mix',
    tone: '',
    background: '',
    interests: '',
    views: '',
    extra: '',
  });

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const checkSlug = async () => {
    if (!form.slug) return;
    const res = await fetch(`/api/check-slug?slug=${form.slug}`);
    const data = await res.json();
    if (!data.available) {
      setError('Yeh username already le liya gaya hai — koi aur try karo.');
    } else {
      setError('');
    }
  };

  const handleSubmit = async () => {
    if (!form.name || !form.slug || !form.tone) {
      setError('Naam, username, aur tone zaroori hain.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/create-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.success) {
        setGeneratedSlug(form.slug);
        setStep(3);
      } else {
        setError(data.error || 'Kuch masla ho gaya — dobara try karo.');
      }
    } catch {
      setError('Server error — dobara try karo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="glow g1" />
      <div className="glow g2" />

      <div className="container">

        {step === 1 && (
          <div className="hero fade-in">
            <div className="badge">Beta</div>
            <h1>Persona</h1>
            <p className="sub">Apna AI chatbot banao — Instagram bio ke liye.<br />Log tumse baat karein, tum kahin bhi raho.</p>
            <button className="btn-primary" onClick={() => setStep(2)}>
              Shuru karo
            </button>
            <p className="note">Free hai. Koi account nahi chahiye.</p>
          </div>
        )}

        {step === 2 && (
          <div className="form-wrap fade-in">
            <h2>Apna Persona banao</h2>
            <p className="form-sub">Jitna sach likho utna better AI hoga.</p>

            <div className="field">
              <label>Tumhara naam *</label>
              <input
                type="text"
                placeholder="Ali, Sara, Zayan..."
                value={form.name}
                onChange={e => update('name', e.target.value)}
              />
            </div>

            <div className="field">
              <label>Username (link mein yahi aayega) *</label>
              <div className="slug-wrap">
                <span className="slug-prefix">persona.bio/</span>
                <input
                  type="text"
                  placeholder="ali"
                  value={form.slug}
                  onChange={e => update('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  onBlur={checkSlug}
                />
              </div>
              {error && <p className="field-error">{error}</p>}
            </div>

            <div className="field">
              <label>Tone kaisa ho? *</label>
              <div className="chips">
                {['Chill & witty', 'Serious & deep', 'Friendly & warm', 'Mysterious', 'Playful'].map(t => (
                  <button
                    key={t}
                    className={`chip ${form.tone === t ? 'active' : ''}`}
                    onClick={() => update('tone', t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="field">
              <label>Language</label>
              <div className="chips">
                {['Roman Urdu + English mix', 'Pure English', 'Pure Urdu'].map(l => (
                  <button
                    key={l}
                    className={`chip ${form.language === l ? 'active' : ''}`}
                    onClick={() => update('language', l)}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div className="field">
              <label>Tum kaun ho? (background)</label>
              <textarea
                placeholder="CS student hoon, startup chal raha hai, writer hoon... jo bhi sach ho"
                value={form.background}
                onChange={e => update('background', e.target.value)}
                rows={3}
              />
            </div>

            <div className="field">
              <label>Interests / Passions</label>
              <input
                type="text"
                placeholder="mountains, writing, chai, music..."
                value={form.interests}
                onChange={e => update('interests', e.target.value)}
              />
            </div>

            <div className="field">
              <label>Tumhara koi strong view ya philosophy</label>
              <textarea
                placeholder="Love ke baare mein, life ke baare mein, kuch bhi..."
                value={form.views}
                onChange={e => update('views', e.target.value)}
                rows={2}
              />
            </div>

            <div className="field">
              <label>Kuch aur add karna hai?</label>
              <textarea
                placeholder="Koi cheez jo AI ko pata honi chahiye tumhare baare mein..."
                value={form.extra}
                onChange={e => update('extra', e.target.value)}
                rows={2}
              />
            </div>

            <button
              className="btn-primary"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Ban raha hai...' : 'Chatbot banao'}
            </button>

            {error && !form.slug && <p className="field-error" style={{marginTop: '12px'}}>{error}</p>}
          </div>
        )}

        {step === 3 && (
          <div className="success fade-in">
            <div className="tick">✓</div>
            <h2>Tayar hai!</h2>
            <p>Tumhara chatbot live hai — yeh link Instagram bio mein lagao:</p>

            <div className="link-box">
              <span>{typeof window !== 'undefined' ? window.location.origin : ''}/chat/{generatedSlug}</span>
              <button onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/chat/${generatedSlug}`);
              }}>Copy</button>
            </div>

            <button
              className="btn-secondary"
              onClick={() => router.push(`/chat/${generatedSlug}`)}
            >
              Preview karo
            </button>

            <p className="note">Followers is link pe click karke tumse baat kar sakenge.</p>
          </div>
        )}

      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');

        .page {
          min-height: 100vh;
          background: #080a0e;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 40px 20px;
          font-family: 'DM Sans', sans-serif;
          position: relative;
          overflow: hidden;
        }

        .glow {
          position: fixed;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.07;
          pointer-events: none;
        }
        .g1 { width: 600px; height: 600px; background: #3d6b56; top: -200px; left: -200px; }
        .g2 { width: 400px; height: 400px; background: #1a3d4f; bottom: -100px; right: -100px; }

        .container {
          width: 100%;
          max-width: 480px;
          position: relative;
          z-index: 1;
        }

        .fade-in {
          animation: fadeUp 0.5s ease forwards;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* HERO */
        .hero {
          text-align: center;
          padding: 60px 0;
        }

        .badge {
          display: inline-block;
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #4ade9a;
          background: rgba(74, 222, 154, 0.08);
          border: 1px solid rgba(74, 222, 154, 0.15);
          padding: 4px 12px;
          border-radius: 20px;
          margin-bottom: 28px;
        }

        .hero h1 {
          font-family: 'DM Serif Display', serif;
          font-size: 64px;
          color: #f0f4f1;
          margin: 0 0 16px;
          letter-spacing: -1px;
          line-height: 1;
        }

        .sub {
          font-size: 16px;
          color: rgba(255,255,255,0.4);
          line-height: 1.7;
          margin-bottom: 40px;
          font-weight: 300;
        }

        .note {
          font-size: 12px;
          color: rgba(255,255,255,0.2);
          margin-top: 16px;
        }

        /* FORM */
        .form-wrap {
          padding: 8px 0 40px;
        }

        .form-wrap h2 {
          font-family: 'DM Serif Display', serif;
          font-size: 32px;
          color: #f0f4f1;
          margin: 0 0 6px;
        }

        .form-sub {
          font-size: 14px;
          color: rgba(255,255,255,0.35);
          margin-bottom: 32px;
        }

        .field {
          margin-bottom: 22px;
        }

        label {
          display: block;
          font-size: 13px;
          color: rgba(255,255,255,0.5);
          margin-bottom: 8px;
          font-weight: 400;
        }

        input, textarea {
          width: 100%;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px;
          padding: 12px 14px;
          color: #e8efe9;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          resize: none;
          transition: border-color 0.2s;
          box-sizing: border-box;
        }

        input:focus, textarea:focus {
          border-color: rgba(74, 222, 154, 0.3);
        }

        input::placeholder, textarea::placeholder {
          color: rgba(255,255,255,0.2);
        }

        .slug-wrap {
          display: flex;
          align-items: center;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px;
          overflow: hidden;
          transition: border-color 0.2s;
        }

        .slug-wrap:focus-within {
          border-color: rgba(74, 222, 154, 0.3);
        }

        .slug-prefix {
          font-size: 13px;
          color: rgba(255,255,255,0.25);
          padding: 12px 0 12px 14px;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .slug-wrap input {
          border: none;
          background: transparent;
          padding: 12px 14px 12px 4px;
          flex: 1;
          width: auto;
        }

        .slug-wrap input:focus {
          border: none;
        }

        .field-error {
          font-size: 12px;
          color: #f87171;
          margin-top: 6px;
        }

        .chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .chip {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          color: rgba(255,255,255,0.5);
          padding: 7px 14px;
          border-radius: 20px;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.15s;
          font-family: 'DM Sans', sans-serif;
        }

        .chip:hover {
          border-color: rgba(74, 222, 154, 0.2);
          color: rgba(255,255,255,0.8);
        }

        .chip.active {
          background: rgba(74, 222, 154, 0.1);
          border-color: rgba(74, 222, 154, 0.4);
          color: #4ade9a;
        }

        /* BUTTONS */
        .btn-primary {
          width: 100%;
          background: #4ade9a;
          color: #060c09;
          border: none;
          padding: 14px;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: opacity 0.2s;
          margin-top: 8px;
        }

        .btn-primary:hover { opacity: 0.9; }
        .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }

        .btn-secondary {
          width: 100%;
          background: transparent;
          color: rgba(255,255,255,0.6);
          border: 1px solid rgba(255,255,255,0.1);
          padding: 13px;
          border-radius: 10px;
          font-size: 14px;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.2s;
          margin-top: 12px;
        }

        .btn-secondary:hover {
          border-color: rgba(255,255,255,0.2);
          color: rgba(255,255,255,0.9);
        }

        /* SUCCESS */
        .success {
          text-align: center;
          padding: 60px 0;
        }

        .tick {
          width: 56px;
          height: 56px;
          background: rgba(74, 222, 154, 0.1);
          border: 1px solid rgba(74, 222, 154, 0.3);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          color: #4ade9a;
          margin: 0 auto 24px;
        }

        .success h2 {
          font-family: 'DM Serif Display', serif;
          font-size: 36px;
          color: #f0f4f1;
          margin-bottom: 12px;
        }

        .success p {
          font-size: 14px;
          color: rgba(255,255,255,0.4);
          margin-bottom: 20px;
          line-height: 1.6;
        }

        .link-box {
          display: flex;
          align-items: center;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 12px 16px;
          gap: 12px;
          margin-bottom: 8px;
        }

        .link-box span {
          flex: 1;
          font-size: 13px;
          color: #4ade9a;
          word-break: break-all;
          text-align: left;
        }

        .link-box button {
          background: rgba(74, 222, 154, 0.1);
          border: 1px solid rgba(74, 222, 154, 0.2);
          color: #4ade9a;
          padding: 6px 14px;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          white-space: nowrap;
          transition: background 0.15s;
        }

        .link-box button:hover {
          background: rgba(74, 222, 154, 0.2);
        }

        @media (max-width: 480px) {
          .hero h1 { font-size: 48px; }
          .form-wrap h2 { font-size: 26px; }
        }
      `}</style>
    </div>
  );
}