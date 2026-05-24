import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { createMessageId, sendGalaxyChat, type GalaxyChatMessage } from '../../lib/assistant/chatApi';
import {
  getAssistantAudience,
  getAssistantDisplayName,
  QUICK_PROMPTS,
  WELCOME_MESSAGES,
} from '../../lib/assistant/quickPrompts';
import { SITE } from '../../lib/siteMeta';

function renderMarkdownLite(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-candy-100">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part.split('\n').map((line, j, arr) => (
      <span key={`${i}-${j}`}>
        {line}
        {j < arr.length - 1 ? <br /> : null}
      </span>
    ));
  });
}

const AUDIENCE_LABEL: Record<string, string> = {
  guest: 'visitor guide',
  patient: 'patient guide',
  doctor: 'doctor guide',
  admin: 'admin guide',
};

export function GalaxyAssistant() {
  const { user } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<GalaxyChatMessage[]>([]);
  const [error, setError] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const audience = getAssistantAudience(user);
  const displayName = getAssistantDisplayName(user);
  const prompts = QUICK_PROMPTS[audience];

  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: WELCOME_MESSAGES[audience],
        createdAt: Date.now(),
      },
    ]);
    setError('');
  }, [audience]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (open) {
      window.setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      setError('');
      const userMsg: GalaxyChatMessage = {
        id: createMessageId(),
        role: 'user',
        content: trimmed,
        createdAt: Date.now(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput('');
      setLoading(true);

      const history = [...messages.filter((m) => m.id !== 'welcome'), userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const result = await sendGalaxyChat(history, {
        userName: displayName,
        userRole: audience,
        currentPath: location.pathname,
      });

      setLoading(false);

      if (!('reply' in result)) {
        setError(result.error);
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: createMessageId(),
          role: 'assistant',
          content: result.reply,
          createdAt: Date.now(),
        },
      ]);
    },
    [loading, displayName, audience, messages, location.pathname],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void send(input);
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: WELCOME_MESSAGES[audience],
        createdAt: Date.now(),
      },
    ]);
    setError('');
    setOpen(true);
  };

  return (
    <div className="galaxy-assistant-root" aria-live="polite">
      {open && (
        <div className="galaxy-assistant-panel" role="dialog" aria-label="Galaxy AI chat">
          <header className="galaxy-assistant-header">
            <div className="galaxy-assistant-orb" aria-hidden>
              <span className="galaxy-assistant-orb-core">✦</span>
              <span className="galaxy-assistant-orb-ring" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-candy-200/90">Galaxy AI</p>
              <h2 className="truncate text-lg font-bold text-white">Nova</h2>
              <p className="truncate text-xs text-violet-200/75">
                {SITE.name} · {AUDIENCE_LABEL[audience] ?? 'guide'}
              </p>
            </div>
            <div className="flex shrink-0 gap-1">
              <button
                type="button"
                className="galaxy-assistant-icon-btn"
                onClick={clearChat}
                title="New conversation"
                aria-label="New conversation"
              >
                ↺
              </button>
              <button
                type="button"
                className="galaxy-assistant-icon-btn"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
              >
                ✕
              </button>
            </div>
          </header>

          <div ref={scrollRef} className="galaxy-assistant-messages">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`galaxy-assistant-bubble ${m.role === 'user' ? 'galaxy-assistant-bubble-user' : 'galaxy-assistant-bubble-ai'}`}
              >
                {m.role === 'assistant' && (
                  <span className="galaxy-assistant-bubble-label">Nova</span>
                )}
                <div className="galaxy-assistant-bubble-text">{renderMarkdownLite(m.content)}</div>
              </div>
            ))}
            {loading && (
              <div className="galaxy-assistant-bubble galaxy-assistant-bubble-ai">
                <span className="galaxy-assistant-bubble-label">Nova</span>
                <div className="galaxy-assistant-typing">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}
            {error && <p className="galaxy-assistant-error">{error}</p>}
          </div>

          <div className="galaxy-assistant-prompts">
            {prompts.map((p) => (
              <button
                key={p}
                type="button"
                className="galaxy-assistant-prompt-chip"
                disabled={loading}
                onClick={() => void send(p)}
              >
                {p}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="galaxy-assistant-form">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  void send(input);
                }
              }}
              placeholder={
                audience === 'guest'
                  ? 'Ask about registering, portals, or dental tips…'
                  : 'Ask Nova anything about the clinic or the world…'
              }
              rows={2}
              disabled={loading}
              className="galaxy-assistant-input"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="galaxy-assistant-send"
              aria-label="Send message"
            >
              ↑
            </button>
          </form>
          <p className="galaxy-assistant-footer-note">Powered by Galaxy AI · Not medical advice</p>
        </div>
      )}

      <button
        type="button"
        className={`galaxy-assistant-fab ${open ? 'galaxy-assistant-fab-open' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? 'Close Galaxy AI' : 'Open Galaxy AI'}
      >
        <span className="galaxy-assistant-fab-glow" aria-hidden />
        <span className="galaxy-assistant-fab-icon">{open ? '✕' : '✦'}</span>
        {!open && <span className="galaxy-assistant-fab-pulse" aria-hidden />}
      </button>
    </div>
  );
}
