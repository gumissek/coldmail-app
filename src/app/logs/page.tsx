'use client';

import { useEffect, useState } from 'react';
import { Mail, RefreshCw } from 'lucide-react';
import { useSettings } from '@/components/ThemeLanguageProvider';

interface Log {
  id: string;
  to: string;
  from: string;
  subject: string;
  content: string;
  status: 'sent' | 'failed';
  sentAt: string;
  error?: string;
}

export default function LogsPage() {
  const { t, lang } = useSettings();
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetch('/api/logs').then(r => r.json()).then(data => {
      setLogs(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const sentCount = logs.filter(l => l.status === 'sent').length;
  const failedCount = logs.filter(l => l.status === 'failed').length;

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString(lang === 'pl' ? 'pl-PL' : 'en-US', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    } catch { return iso; }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }} className="glow-text">
            {t('logs.title')}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
            {t('logs.subtitle')}
          </p>
        </div>
        <button className="btn-secondary" onClick={load}>
          <RefreshCw size={14} /> {t('logs.refresh')}
        </button>
      </div>

      {/* Mini stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        <div className="stat-card">
          <div style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('logs.total')}</div>
          <div style={{ fontSize: 28, fontWeight: 800, marginTop: 4 }}>{logs.length}</div>
        </div>
        <div className="stat-card">
          <div style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('logs.sent')}</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--success)', marginTop: 4 }}>{sentCount}</div>
        </div>
        <div className="stat-card">
          <div style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('logs.errors')}</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: failedCount > 0 ? 'var(--error)' : 'var(--text-primary)', marginTop: 4 }}>{failedCount}</div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Mail size={17} color="var(--accent)" /> {t('logs.journal')}
          </h2>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>{t('logs.loading')}</div>
        ) : logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>{t('logs.empty')}</div>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>{t('logs.status')}</th>
                  <th>{t('logs.to')}</th>
                  <th>{t('logs.from')}</th>
                  <th>{t('logs.subject')}</th>
                  <th>{t('logs.send_date')}</th>
                  <th>{t('logs.details')}</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, i) => (
                  <tr key={i}>
                    <td>
                      <span className={`badge ${log.status === 'sent' ? 'badge-success' : 'badge-error'}`}>
                        {log.status === 'sent' ? t('logs.ok') : t('logs.error')}
                      </span>
                    </td>
                    <td style={{ fontWeight: 500 }}>{log.to}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{log.from}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{log.subject}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{formatDate(log.sentAt)}</td>
                    <td>
                      {log.error ? (
                        <span style={{ color: 'var(--error)', fontSize: 12 }} title={log.error}>
                          {log.error.slice(0, 40)}...
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: 12, fontFamily: 'monospace' }}>
                          {log.id?.slice(0, 20)}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
