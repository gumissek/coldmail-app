'use client';

import { useEffect, useState } from 'react';
import { CalendarClock, Trash2, Mail, Clock, CheckCircle, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';

interface ScheduledEmail {
  id: string;
  to: string;
  from_account: string;
  subject: string;
  html: string;
  scheduled_date: string;
  status: string;
  created_at: string;
  next_send_after?: string;
}

const statusConfig: Record<string, { label: string; color: string; bg: string; border: string; Icon: typeof CheckCircle }> = {
  pending: { label: 'Oczekujący', color: 'var(--accent)', bg: 'rgba(108,99,255,0.1)', border: 'rgba(108,99,255,0.3)', Icon: Clock },
  sent: { label: 'Wysłany', color: 'var(--success)', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.3)', Icon: CheckCircle },
  failed: { label: 'Błąd', color: 'var(--error)', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', Icon: AlertCircle },
};

export default function ScheduledPage() {
  const [emails, setEmails] = useState<ScheduledEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadEmails = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/scheduled-emails');
      const data = await res.json();
      setEmails(Array.isArray(data) ? data : []);
    } catch {
      setEmails([]);
    }
    setLoading(false);
  };

  useEffect(() => { loadEmails(); }, []);

  const deleteEmail = async (id: string) => {
    if (!confirm('Usunąć zaplanowaną wiadomość?')) return;
    try {
      const res = await fetch('/api/scheduled-emails', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        showToast('✓ Usunięto zaplanowany mail');
        loadEmails();
      } else {
        showToast('Błąd usuwania', 'error');
      }
    } catch {
      showToast('Błąd połączenia', 'error');
    }
  };

  const processNow = async () => {
    setProcessing(true);
    try {
      const res = await fetch('/api/process-scheduled', { method: 'POST' });
      const data = await res.json();
      if (data.sent > 0 || data.failed > 0) {
        showToast(`Przetworzono: wysłano ${data.sent}, błędy: ${data.failed}, pozostało: ${data.remaining}`);
      } else {
        showToast('Brak maili do wysłania w tej chwili');
      }
      loadEmails();
    } catch {
      showToast('Błąd przetwarzania', 'error');
    }
    setProcessing(false);
  };

  const pendingCount = emails.filter(e => e.status === 'pending').length;
  const sentCount = emails.filter(e => e.status === 'sent').length;

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }} className="glow-text">
          Zaplanowane maile
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
          Zarządzaj zaplanowanymi wysyłkami e-mail.
        </p>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div className="card" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 10, flex: '1 1 130px' }}>
          <CalendarClock size={18} color="var(--accent)" />
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>{pendingCount}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Oczekujących</div>
          </div>
        </div>
        <div className="card" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 10, flex: '1 1 130px' }}>
          <CheckCircle size={18} color="var(--success)" />
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>{sentCount}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Wysłanych</div>
          </div>
        </div>
        <div className="card" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 10, flex: '1 1 130px' }}>
          <Mail size={18} color="var(--text-muted)" />
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>{emails.length}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Łącznie</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <button
          className="btn-secondary"
          onClick={loadEmails}
          disabled={loading}
          style={{ padding: '9px 16px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <RefreshCw size={14} /> Odśwież
        </button>
        <button
          className="btn-primary"
          onClick={processNow}
          disabled={processing || pendingCount === 0}
          style={{ padding: '9px 18px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
        >
          {processing ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Mail size={14} />}
          {processing ? 'Przetwarzam...' : 'Wyślij zaległe teraz'}
        </button>
      </div>

      {/* Email list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
          <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', marginBottom: 8 }} />
          <div>Ładowanie...</div>
        </div>
      ) : emails.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <CalendarClock size={36} color="var(--text-muted)" style={{ marginBottom: 12 }} />
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
            Brak zaplanowanych maili
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Przejdź do &quot;Wyślij mail&quot; i użyj przycisku &quot;Zaplanuj wysyłkę&quot;
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {emails.map((email) => {
            const cfg = statusConfig[email.status] || statusConfig.pending;
            const StatusIcon = cfg.Icon;
            return (
              <div
                key={email.id}
                className="card"
                style={{ padding: '16px 20px', display: 'flex', gap: 16, alignItems: 'flex-start' }}
              >
                {/* Status dot */}
                <div style={{
                  flexShrink: 0, marginTop: 4,
                  width: 36, height: 36, borderRadius: 10,
                  background: cfg.bg, border: `1px solid ${cfg.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <StatusIcon size={16} color={cfg.color} />
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {email.subject}
                    </div>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                      background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color,
                    }}>
                      {cfg.label}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>
                    <strong>Do:</strong> {email.to}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>
                    <strong>Z konta:</strong> {email.from_account}
                  </div>
                  <div style={{ display: 'flex', gap: 16, fontSize: 11, color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CalendarClock size={11} />
                      Zaplanowano: {new Date(email.scheduled_date).toLocaleString('pl-PL')}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={11} />
                      Utworzono: {new Date(email.created_at).toLocaleString('pl-PL')}
                    </span>
                  </div>
                  {email.next_send_after && email.status === 'pending' && (
                    <div style={{ marginTop: 4, fontSize: 11, color: 'var(--accent)' }}>
                      Następna próba wysyłki po: {new Date(email.next_send_after).toLocaleString('pl-PL')}
                    </div>
                  )}
                </div>

                {/* Delete button — only for pending emails */}
                {email.status === 'pending' && (
                  <button
                    onClick={() => deleteEmail(email.id)}
                    style={{
                      background: 'none', border: '1px solid rgba(239,68,68,0.3)',
                      borderRadius: 8, cursor: 'pointer', padding: '8px 12px',
                      color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5,
                      fontSize: 12, transition: 'all 0.15s',
                    }}
                    title="Usuń zaplanowany mail"
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--error)'; e.currentTarget.style.borderColor = 'var(--error)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; }}
                  >
                    <Trash2 size={13} /> Usuń
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {toast && (
        <div className="toast">
          <div style={{
            background: toast.type === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
            border: `1px solid ${toast.type === 'success' ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}`,
            color: toast.type === 'success' ? 'var(--success)' : 'var(--error)',
            padding: '12px 20px', borderRadius: 10, fontWeight: 500, fontSize: 14,
          }}>
            {toast.msg}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
