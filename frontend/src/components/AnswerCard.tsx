import React from 'react';

interface AnswerCardProps {
  answer: string | number | null;
}

export function AnswerCard({ answer }: AnswerCardProps) {
  if (answer === null || answer === undefined) return null;

  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      <p className="section-label">Answer</p>
      <p style={{
        color: 'rgba(255,255,255,0.90)',
        fontSize: '1.05rem',
        fontWeight: 500,
        lineHeight: 1.7,
        whiteSpace: 'pre-wrap',
      }}>
        {typeof answer === 'number' ? answer.toLocaleString() : answer}
      </p>
    </div>
  );
}
