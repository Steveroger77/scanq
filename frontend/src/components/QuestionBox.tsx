import React, { useState } from 'react';

interface QuestionBoxProps {
  onAsk: (question: string) => void;
  isLoading: boolean;
  suggestions?: string[];
  placeholder?: string;
}

export function QuestionBox({ onAsk, isLoading, suggestions, placeholder }: QuestionBoxProps) {
  const [question, setQuestion] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = question.trim();
    if (trimmed && !isLoading) {
      onAsk(trimmed);
      setQuestion('');
    }
  };

  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      <p className="section-label">Ask a Question</p>

      <form onSubmit={handleSubmit} style={{ position: 'relative' }}>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={placeholder || 'Ask anything about your data…'}
          className="glass-input"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !question.trim()}
          className="btn-send"
        >
          {isLoading ? (
            <svg className="spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2">
              <circle cx="12" cy="12" r="10" strokeOpacity="0.2"/>
              <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          )}
        </button>
      </form>

      {/* Suggestion chips */}
      {suggestions && suggestions.length > 0 && (
        <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 7 }}>
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => { setQuestion(s); }}
              disabled={isLoading}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: 100,
                padding: '5px 13px',
                color: 'rgba(255,255,255,0.45)',
                fontSize: '0.73rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontWeight: 500,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)';
                (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.75)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)';
                (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.45)';
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
