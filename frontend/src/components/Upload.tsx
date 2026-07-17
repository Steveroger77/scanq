import React, { useRef, useState } from 'react';

interface UploadProps {
  onUpload: (file: File) => void;
  isLoading: boolean;
}

export function Upload({ onUpload, isLoading }: UploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
    // Reset input so the same file can be re-selected
    e.target.value = '';
  };

  const isValidFile = (file: File) =>
    file.name.endsWith('.csv') || file.name.endsWith('.xlsx');

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      if (!isValidFile(file)) {
        return; // silently ignore; backend will also reject
      }
      onUpload(file);
    }
  };

  return (
    <div
      className="glass-card"
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      style={{
        padding: '52px 32px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        borderColor: isDragging ? 'rgba(255,255,255,0.3)' : undefined,
        background: isDragging ? 'rgba(255,255,255,0.07)' : undefined,
        transition: 'all 0.25s ease',
        cursor: 'default',
      }}
    >
      {/* Upload icon */}
      <div style={{
        width: 56, height: 56,
        borderRadius: 14,
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 20,
      }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
      </div>

      <p style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 600, fontSize: '1.05rem', marginBottom: 6 }}>
        Upload your dataset
      </p>
      <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.82rem', marginBottom: 28, lineHeight: 1.6 }}>
        Drag & drop or click to browse<br/>Supports .csv and .xlsx
      </p>

      <input
        type="file"
        accept=".csv,.xlsx"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isLoading}
        className="btn-glass"
      >
        {isLoading ? (
          <>
            <svg className="spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/></svg>
            Uploading…
          </>
        ) : 'Select File'}
      </button>
    </div>
  );
}
