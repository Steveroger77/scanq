import React, { useState, useRef, useCallback } from 'react';
import axios from 'axios';
import type { CancelTokenSource } from 'axios';
import { Upload } from './components/Upload';
import { DatasetInfo } from './components/DatasetInfo';
import { QuestionBox } from './components/QuestionBox';
import { AnswerCard } from './components/AnswerCard';
import { TableView } from './components/TableView';
import Aurora from './components/Aurora';

const API_BASE_URL = '';

interface ColumnInfo {
  name: string;
  type: string;
}

interface DatasetInfo {
  filename: string;
  rows: number;
  columns: number;
  column_list: ColumnInfo[];
  suggested_questions: string[];
}

function App() {
  const [datasetInfo, setDatasetInfo] = useState<DatasetInfo | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAsking, setIsAsking] = useState(false);
  const [lastQuestion, setLastQuestion] = useState<string | null>(null);
  const [answer, setAnswer] = useState<string | number | null>(null);
  const [tableData, setTableData] = useState<Record<string, unknown>[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const askCancelRef = useRef<CancelTokenSource | null>(null);

  const handleUpload = useCallback(async (file: File) => {
    setIsUploading(true);
    setError(null);
    setAnswer(null);
    setTableData(null);

    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await axios.post<DatasetInfo>(`${API_BASE_URL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setDatasetInfo(response.data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail || err.message || 'Failed to upload dataset');
      } else {
        setError('Failed to upload dataset');
      }
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleClear = useCallback(() => {
    askCancelRef.current?.cancel();
    setDatasetInfo(null);
    setAnswer(null);
    setTableData(null);
    setLastQuestion(null);
    setError(null);
  }, []);

  const handleAsk = useCallback(async (question: string) => {
    // Cancel any previous in-flight request
    askCancelRef.current?.cancel();
    const source = axios.CancelToken.source();
    askCancelRef.current = source;

    setIsAsking(true);
    setError(null);
    setAnswer(null);
    setTableData(null);
    setLastQuestion(question);
    try {
      const response = await axios.post<{ answer: string | number; table: Record<string, unknown>[] | null }>(
        `${API_BASE_URL}/ask`,
        { question },
        { cancelToken: source.token }
      );
      setAnswer(response.data.answer);
      setTableData(response.data.table);
    } catch (err: unknown) {
      if (axios.isCancel(err)) return;
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail || err.message || 'Failed to get answer');
      } else {
        setError('Failed to get answer');
      }
    } finally {
      setIsAsking(false);
    }
  }, []);

  return (
    <div style={{ background: '#000', minHeight: '100vh', position: 'relative' }} className="flex flex-col items-center">
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
        <Aurora 
          colorStops={["#000000", "#1e1b4b", "#6b21a8"]}
          blend={0.5}
          amplitude={1.0}
          speed={0.5}
        />
      </div>
      <main className="w-full max-w-3xl px-5 pt-16 pb-24 flex flex-col gap-5" style={{ zIndex: 1, position: 'relative' }}>

        {/* Header */}
        <div className="animate-fade-up text-center mb-8 mt-4">
          <h1 style={{ 
            fontFamily: "'Outfit', sans-serif", 
            fontWeight: 800, 
            fontSize: '4.5rem', 
            letterSpacing: '-0.06em', 
            margin: 0,
            lineHeight: 1,
            background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.5) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'inline-block'
          }}>
            scanq
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.2rem', marginTop: '12px', letterSpacing: '0.01em', fontWeight: 500 }}>
            Ask plain-English questions about your data
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="animate-fade-up glass-card px-5 py-4" style={{ borderColor: 'rgba(255,80,80,0.2)', background: 'rgba(255,40,40,0.06)' }}>
            <p style={{ color: 'rgba(255,160,160,0.9)', fontSize: '0.85rem' }}>{error}</p>
          </div>
        )}

        {!datasetInfo ? (
          <div className="animate-fade-up delay-100">
            <Upload onUpload={handleUpload} isLoading={isUploading} />
          </div>
        ) : (
          <>
            <div className="animate-fade-up delay-100">
              <DatasetInfo
                filename={datasetInfo.filename}
                rows={datasetInfo.rows}
                columns={datasetInfo.columns}
                columnList={datasetInfo.column_list}
                onClear={handleClear}
              />
            </div>

            <div className="animate-fade-up delay-200">
              <QuestionBox 
                onAsk={handleAsk} 
                isLoading={isAsking} 
                suggestions={datasetInfo.suggested_questions}
                placeholder={datasetInfo.suggested_questions?.[0]}
              />
            </div>

            {isAsking && lastQuestion && (
              <div className="animate-fade-up">
                <div className="glass-card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <svg className="spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" style={{ flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.2"/>
                    <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
                  </svg>
                  <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.88rem', fontStyle: 'italic' }}>
                    &ldquo;{lastQuestion}&rdquo;
                  </p>
                </div>
              </div>
            )}

            {!isAsking && (answer !== null || tableData !== null) && (
              <>
                {lastQuestion && (
                  <div className="animate-fade-up">
                    <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem', paddingLeft: 4 }}>
                      ✦ &nbsp;&ldquo;{lastQuestion}&rdquo;
                    </p>
                  </div>
                )}
                <div className="animate-fade-up">
                  <AnswerCard answer={answer} />
                </div>
                <div className="animate-fade-up delay-100">
                  <TableView data={tableData} />
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
