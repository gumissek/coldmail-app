'use client';

import { useEffect, useState } from 'react';
import { Send, Users, Link2, Mail, TrendingUp, Clock } from 'lucide-react';
import Link from 'next/link';

interface Log {
  id: string;
  to: string;
  subject: string;
  status: 'sent' | 'failed';
  sentAt: string;
}

export default function DashboardPage() {
  const [brands, setBrands] = useState<{ name: string; email: string }[]>([]);
  const [links, setLinks] = useState<{ 'website name': string; url: string }[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);

  useEffect(() => {
    fetch('/api/brands').then(r => r.json()).then(setBrands).catch(() => {});
    fetch('/api/links').then(r => r.json()).then(setLinks).catch(() => {});
    fetch('/api/logs').then(r => r.json()).then(setLogs).catch(() => {});
  }, []);

  const sentCount = logs.filter(l => l.status === 'sent').length;
  const failedCount = logs.filter(l => l.status === 'failed').length;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }} className="glow-text">
          Dashboard
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
          Witaj! Zarządzaj kampaniami cold mail w jednym miejscu.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Kontakty</div>
              <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)' }}>{brands.length}</div>
            </div>
            <div style={{ background: 'rgba(108,99,255,0.15)', borderRadius: 10, padding: 10 }}>
              <Users size={20} color="var(--accent)" />
            </div>
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 8 }}>Kontakty w bazie</div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Linki</div>
              <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)' }}>{links.length}</div>
            </div>
            <div style={{ background: 'rgba(139,92,246,0.15)', borderRadius: 10, padding: 10 }}>
              <Link2 size={20} color="#8b5cf6" />
            </div>
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 8 }}>Zapisanych linków</div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Wysłane</div>
              <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--success)' }}>{sentCount}</div>
            </div>
            <div style={{ background: 'rgba(34,197,94,0.15)', borderRadius: 10, padding: 10 }}>
              <Send size={20} color="var(--success)" />
            </div>
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 8 }}>Maili wysłanych</div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Błędy</div>
              <div style={{ fontSize: 32, fontWeight: 800, color: failedCount > 0 ? 'var(--error)' : 'var(--text-primary)' }}>{failedCount}</div>
            </div>
            <div style={{ background: 'rgba(239,68,68,0.15)', borderRadius: 10, padding: 10 }}>
              <TrendingUp size={20} color="var(--error)" />
            </div>
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 8 }}>Nieudanych wysyłek</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
        <div className="card">
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Mail size={18} color="var(--accent)" /> Szybkie akcje
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Link href="/compose">
              <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                <Send size={15} /> Napisz nowy mail
              </button>
            </Link>
            <Link href="/brands">
              <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                <Users size={15} /> Zarządzaj kontaktami
              </button>
            </Link>
            <Link href="/links">
              <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                <Link2 size={15} /> Zarządzaj linkami
              </button>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock size={18} color="var(--accent)" /> Ostatnia aktywność
          </h2>
          {logs.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>
              Brak historii wysyłek
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {logs.slice(0, 5).map((log) => (
                <div key={log.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 12px', background: 'var(--bg-secondary)',
                  borderRadius: 8, border: '1px solid var(--border)',
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{log.to}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{log.subject}</div>
                  </div>
                  <span className={`badge ${log.status === 'sent' ? 'badge-success' : 'badge-error'}`}>
                    {log.status === 'sent' ? '✓ OK' : '✗ ERR'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
