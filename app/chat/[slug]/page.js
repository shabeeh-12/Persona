'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function ChatPage() {
  const { slug } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [botName, setBotName] = useState('');
  const [notFound, setNotFound] = useState(false);
  const [sessionId, setSessionId] = useState('');

  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    // Session ID
    const key = `session_${slug}`;
    let id = localStorage.getItem(key);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(key, id);
    }
    setSessionId(id);

    // Load bot info + history
    const init = async () => {
      try {
        // Check bot exists
        const botRes = await fetch(`/api/bot-info?slug=${slug}`);
        const botData = await botRes.json();

        if (!botData.found) {
          setNotFound(true);
          return;
        }

        setBotName(botData.name);

        // Load history
        const histRes = await fetch(`/api/history?session_id=${id}`);
        const histData = await histRes.json();

        if (histData.messages && histData.messages.length > 0) {
          setMessages(histData.messages);
          setStarted(true);
        }
      } catch (err) {
        console.error('Init error:', err);
      }
    };

    init();
  }, [slug]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  };

  const sendMessage = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    const currentSessionId = sessionId || localStorage.getItem(`session_${slug}`);

    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setStarted(true);

    const userMsg = { role: 'user', content: msg };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setLoading(true);

    try {
      const res = await fetch('/api/persona-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          messages: newHistory.slice(-12),
          session_id: currentSessionId,
          user_message: msg,
        }),
      });

      const data = await res.json();
      setMessages([...newHistory, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages([...newHistory, { role: 'assistant', content: 'Kuch masla ho gaya — dobara try karo.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const initials = botName ? botName.slice(0, 2).toUpperCase() : '..';

  if (notFound) {
    return (
      <div className="page">
        <div className="not-found">
          <h2>404</h2>
          <p>Yeh persona nahi mila.</p>
          <a href="/">Apna banao →</a>
        </div>
        <style jsx>{`
          .page { min-height: 100vh; background: #080a0e; display: flex; align-items: center; justify-content: center; font-family: system-ui, sans-serif; }
          .not-found { text-align: center; }
          h2 { font-size: 64px; color: #f0f4f1; margin: 0 0 12px; }
          p { color: rgba(255,255,255,0.4); margin-bottom: 24px; }
          a { color: #4ade9a; font-size: 14px; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="glow g1" />
      <div className="glow g2" />

      <div className="shell">
        <header className="header">
          <div className="header-left">
            <div className="avatar">{initials}</div>
            <div className="head-text">
              <h1>{botName || '...'}</h1>
              <p>Persona AI</p>
            </div>
          </div>
          <div className="status">
            <span className="dot" />
            Online
          </div>
        </header>

        <main className="chat">
          {!started && botName && (
            <div className="landing">
              <div className="big-avatar">{initials}</div>
              <h2>Hey, {botName} is here.</h2>
              <p>Start a conversation — no pressure.</p>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`message-row ${m.role}`}>
              {m.role === 'assistant' && <div className="mini-avatar">{initials}</div>}
              <div className={`bubble ${m.role}`}>{m.content}</div>
            </div>
          ))}

          {loading && (
            <div className="message-row assistant">
              <div className="mini-avatar">{initials}</div>
              <div className="bubble assistant typing">
                <span /><span /><span />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </main>

        <footer className="footer">
          <div className="input-box">
            <textarea
              ref={textareaRef}
              value={input}
              rows={1}
              placeholder="Write something..."
              onChange={(e) => { setInput(e.target.value); autoResize(); }}
              onKeyDown={handleKey}
            />
            <button disabled={!input.trim() || loading} onClick={() => sendMessage()}>➤</button>
          </div>
          <p className="note">Powered by Persona</p>
        </footer>
      </div>

      <style jsx>{`
        .page {
          position: fixed;
          top: 0; left: 0;
          width: 100vw; height: 100dvh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: #080a0e;
          overflow: hidden;
          font-family: system-ui, -apple-system, sans-serif;
        }

        .glow { position: absolute; border-radius: 50%; filter: blur(120px); opacity: 0.07; z-index: 1; }
        .g1 { width: 500px; height: 500px; background: #3d6b56; top: -150px; left: -150px; }
        .g2 { width: 400px; height: 400px; background: #1a3d4f; bottom: -100px; right: -100px; }

        .shell {
          position: relative;
          width: 100%; max-width: 680px; height: 94vh;
          display: flex; flex-direction: column;
          background: rgba(13, 16, 21, 0.85);
          backdrop-filter: blur(30px);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 40px 100px rgba(0,0,0,0.7);
          z-index: 2;
        }

        .header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 20px;
          background: #0f131a;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          flex-shrink: 0;
        }

        .header-left { display: flex; align-items: center; }
        .avatar {
          width: 40px; height: 40px; border-radius: 50%;
          background: linear-gradient(135deg, #4ade9a, #1a5c3a);
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; color: #060c09; font-size: 13px; flex-shrink: 0;
        }
        .head-text { margin-left: 14px; }
        .head-text h1 { font-size: 16px; color: #e8efe9; margin: 0; font-weight: 600; }
        .head-text p { font-size: 12px; color: rgba(255,255,255,0.35); margin: 2px 0 0; }
        .status { font-size: 12px; color: #4ade9a; display: flex; align-items: center; gap: 6px; }
        .dot { width: 6px; height: 6px; background: #4ade9a; border-radius: 50%; }

        .chat {
          flex: 1; overflow-y: auto;
          padding: 40px 20px 30px;
          display: flex; flex-direction: column; gap: 16px;
          -webkit-overflow-scrolling: touch;
        }
        .chat::-webkit-scrollbar { width: 4px; }
        .chat::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 2px; }

        .landing { margin: auto 0; text-align: center; }
        .big-avatar {
          width: 70px; height: 70px; margin: 0 auto 16px; border-radius: 50%;
          background: linear-gradient(135deg, #4ade9a, #1a5c3a);
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 22px; color: #060c09;
        }
        .landing h2 { color: #e8efe9; margin-bottom: 8px; font-size: 22px; }
        .landing p { font-size: 14px; color: rgba(255,255,255,0.4); }

        .message-row { display: flex; width: 100%; gap: 10px; align-items: flex-end; }
        .message-row.user { justify-content: flex-end; }
        .message-row.assistant { justify-content: flex-start; }

        .mini-avatar {
          width: 28px; height: 28px; border-radius: 50%;
          background: #4ade9a;
          display: flex; align-items: center; justify-content: center;
          font-size: 9px; color: #060c09; font-weight: 700; flex-shrink: 0;
        }

        .bubble { max-width: 78%; padding: 12px 16px; font-size: 14.5px; line-height: 1.5; word-break: break-word; }
        .bubble.assistant { background: #1b202a; border: 1px solid rgba(255,255,255,0.04); color: #e8efe9; border-radius: 18px 18px 18px 4px; }
        .bubble.user { background: linear-gradient(135deg, #4ade9a, #1a5c3a); color: #060c09; font-weight: 500; border-radius: 18px 18px 4px 18px; }

        .typing { display: flex; gap: 5px; align-items: center; height: 20px; padding: 4px 6px; }
        .typing span { width: 6px; height: 6px; background: #4ade9a; border-radius: 50%; animation: bounce 1s infinite; }
        .typing span:nth-child(2) { animation-delay: 0.2s; }
        .typing span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes bounce { 0%, 100% { transform: translateY(0); opacity: 0.4; } 50% { transform: translateY(-4px); opacity: 1; } }

        .footer { padding: 14px 16px; background: #0f131a; border-top: 1px solid rgba(255,255,255,0.05); flex-shrink: 0; }
        .input-box {
          display: flex; gap: 10px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 22px; padding: 8px 14px; align-items: flex-end;
        }
        textarea {
          flex: 1; background: transparent; border: none; outline: none;
          color: #e8efe9; resize: none; font-size: 15px; line-height: 1.4;
          padding: 5px 0; max-height: 120px; font-family: inherit;
        }
        .input-box button {
          background: #4ade9a; border: none; width: 36px; height: 36px;
          border-radius: 50%; cursor: pointer; color: #060c09;
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; flex-shrink: 0;
        }
        .input-box button:disabled { opacity: 0.2; cursor: not-allowed; }
        .note { text-align: center; font-size: 11px; color: rgba(255,255,255,0.2); margin-top: 8px; margin-bottom: 0; }

        @media (max-width: 768px) {
          .shell { width: 100vw; height: 100dvh; border-radius: 0; border: none; }
          .chat { padding: 40px 14px 30px; }
          .bubble { max-width: 85%; }
          .footer { padding: 10px 12px calc(16px + env(safe-area-inset-bottom)); }
        }
      `}</style>
    </div>
  );
}