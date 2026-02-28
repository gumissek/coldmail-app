'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Mail, Users, Link2, Send, BarChart2, Zap, ChevronDown,
  Plus, Trash2, Wifi, WifiOff, X, Loader2, CheckCircle, AlertCircle,
  CalendarClock,
} from 'lucide-react';
import { useEffect, useState } from 'react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: BarChart2 },
  { href: '/compose', label: 'Wyślij mail', icon: Send },
  { href: '/scheduled', label: 'Zaplanowane', icon: CalendarClock },
  { href: '/brands', label: 'Lista kontaktów', icon: Users },
  { href: '/links', label: 'Linki', icon: Link2 },
  { href: '/logs', label: 'Historia', icon: Mail },
];

interface Account {
  smtp_server: string;
  smtp_port: string;
  smtp_username: string;
}

const STORAGE_KEY = 'selectedAccount';

const emptyForm = { smtp_server: '', smtp_port: '587', smtp_username: '', smtp_password: '' };

export default function Sidebar() {
  const pathname = usePathname();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedUsername, setSelectedUsername] = useState<string>('');

  // Add account form
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState(emptyForm);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');

  // Test status per account: Record<username, 'testing'|'ok'|'error:msg'>
  const [testStatus, setTestStatus] = useState<Record<string, string>>({});

  const loadAccounts = () => {
    fetch('/api/accounts')
      .then((r) => r.json())
      .then((data: Account[]) => {
        setAccounts(data);
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          try {
            const parsed = JSON.parse(stored) as Account;
            setSelectedUsername(parsed.smtp_username);
          } catch { /* ignore */ }
        } else if (data.length > 0) {
          setSelectedUsername(data[0].smtp_username);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data[0]));
        }
      })
      .catch(() => {});
  };

  useEffect(() => { loadAccounts(); }, []);

  const handleAccountChange = (username: string) => {
    setSelectedUsername(username);
    const account = accounts.find((a) => a.smtp_username === username);
    if (account) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(account));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleAddAccount = async () => {
    if (!addForm.smtp_server || !addForm.smtp_port || !addForm.smtp_username || !addForm.smtp_password) {
      setAddError('Uzupełnij wszystkie pola');
      return;
    }
    setAddLoading(true);
    setAddError('');
    try {
      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm),
      });
      const data = await res.json();
      if (res.ok) {
        setAddForm(emptyForm);
        setShowAddForm(false);
        loadAccounts();
      } else {
        setAddError(data.error || 'Błąd zapisu');
      }
    } catch {
      setAddError('Błąd połączenia z serwerem');
    }
    setAddLoading(false);
  };

  const handleDeleteAccount = async (username: string) => {
    if (!confirm(`Usunąć konto "${username}"?`)) return;
    try {
      await fetch('/api/accounts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ smtp_username: username }),
      });
      if (selectedUsername === username) {
        localStorage.removeItem(STORAGE_KEY);
        setSelectedUsername('');
      }
      loadAccounts();
    } catch { /* ignore */ }
  };

  const handleTestAccount = async (account: Account) => {
    // We need smtp_password too — but API exposes only public fields.
    // Ask user to enter password just for the test, or use stored localStorage creds.
    // For simplicity: test-specific endpoint reads stored password from server (accounts.csv).
    setTestStatus((prev) => ({ ...prev, [account.smtp_username]: 'testing' }));
    try {
      const res = await fetch('/api/accounts/test-existing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ smtp_username: account.smtp_username }),
      });
      const data = await res.json();
      setTestStatus((prev) => ({
        ...prev,
        [account.smtp_username]: data.ok ? 'ok' : `error:${data.error || 'Błąd SMTP'}`,
      }));
    } catch {
      setTestStatus((prev) => ({ ...prev, [account.smtp_username]: 'error:Błąd połączenia' }));
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    borderRadius: 7,
    color: 'var(--text-primary)',
    fontSize: 12,
    padding: '6px 9px',
    outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <nav className="sidebar">
      {/* Logo */}
      <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, var(--accent), #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 15px var(--accent-glow)',
          }}>
            <Zap size={18} color="white" fill="white" />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>ColdMail Sender v.1.0</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ flex: 1, paddingTop: 12 }}>
        <div style={{ padding: '0 8px 8px', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase', paddingLeft: 24 }}>
          Menu
        </div>
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`sidebar-link ${pathname === href ? 'active' : ''}`}
          >
            <Icon size={17} />
            {label}
          </Link>
        ))}
      </div>

      {/* SMTP Account Manager */}
      <div style={{ margin: '0 12px 12px' }}>
        {/* Header row */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 8,
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            Konta SMTP
          </div>
          <button
            onClick={() => { setShowAddForm((p) => !p); setAddError(''); }}
            style={{
              background: showAddForm ? 'rgba(108,99,255,0.2)' : 'rgba(108,99,255,0.1)',
              border: '1px solid rgba(108,99,255,0.3)',
              borderRadius: 6, padding: '3px 8px',
              color: 'var(--accent)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600,
            }}
            title={showAddForm ? 'Zamknij' : 'Dodaj konto'}
          >
            {showAddForm ? <X size={11} /> : <Plus size={11} />}
            {showAddForm ? 'Anuluj' : 'Dodaj'}
          </button>
        </div>

        {/* Account list */}
        {accounts.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
            {accounts.map((a) => {
              const ts = testStatus[a.smtp_username];
              const isSelected = selectedUsername === a.smtp_username;
              return (
                <div
                  key={a.smtp_username}
                  style={{
                    background: isSelected ? 'rgba(108,99,255,0.1)' : 'var(--bg-secondary)',
                    border: `1px solid ${isSelected ? 'rgba(108,99,255,0.4)' : 'var(--border)'}`,
                    borderRadius: 9, padding: '8px 10px',
                  }}
                >
                  {/* Username row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
                    <button
                      onClick={() => handleAccountChange(a.smtp_username)}
                      style={{
                        flex: 1, textAlign: 'left', background: 'none', border: 'none',
                        color: 'var(--text-primary)', fontSize: 11, fontWeight: 600,
                        cursor: 'pointer', padding: 0, overflow: 'hidden',
                        textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}
                      title={a.smtp_username}
                    >
                      {a.smtp_username}
                    </button>
                    <button
                      onClick={() => handleDeleteAccount(a.smtp_username)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--text-muted)', padding: 2, borderRadius: 4,
                        display: 'flex', alignItems: 'center',
                      }}
                      title="Usuń konto"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>

                  {/* Server info */}
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 6 }}>
                    {a.smtp_server}:{a.smtp_port}
                  </div>

                  {/* Test button + status */}
                  <button
                    onClick={() => handleTestAccount(a)}
                    disabled={ts === 'testing'}
                    style={{
                      width: '100%', padding: '4px 0', borderRadius: 6, cursor: 'pointer',
                      background: ts === 'ok'
                        ? 'rgba(34,197,94,0.1)'
                        : ts?.startsWith('error')
                          ? 'rgba(239,68,68,0.1)'
                          : 'rgba(108,99,255,0.07)',
                      border: `1px solid ${ts === 'ok'
                        ? 'rgba(34,197,94,0.3)'
                        : ts?.startsWith('error')
                          ? 'rgba(239,68,68,0.3)'
                          : 'rgba(108,99,255,0.2)'}`,
                      color: ts === 'ok'
                        ? 'var(--success)'
                        : ts?.startsWith('error')
                          ? 'var(--error)'
                          : 'var(--accent)',
                      fontSize: 10, fontWeight: 600,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                    }}
                  >
                    {ts === 'testing' && <Loader2 size={10} style={{ animation: 'spin 1s linear infinite' }} />}
                    {ts === 'ok' && <CheckCircle size={10} />}
                    {ts?.startsWith('error') && <AlertCircle size={10} />}
                    {!ts && <Wifi size={10} />}
                    {ts === 'testing' ? 'Testowanie...'
                      : ts === 'ok' ? 'Połączono ✓'
                        : ts?.startsWith('error') ? ts.replace('error:', '')
                          : 'Testuj połączenie'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {accounts.length === 0 && !showAddForm && (
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>
            Brak kont SMTP. Dodaj pierwsze konto.
          </div>
        )}

        {/* Add account form */}
        {showAddForm && (
          <div style={{
            background: 'rgba(108,99,255,0.05)',
            border: '1px solid rgba(108,99,255,0.25)',
            borderRadius: 10, padding: 12,
            display: 'flex', flexDirection: 'column', gap: 7,
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', marginBottom: 2 }}>
              Nowe konto SMTP
            </div>
            {[
              { label: 'Serwer SMTP', key: 'smtp_server', placeholder: 'smtp.gmail.com' },
              { label: 'Port', key: 'smtp_port', placeholder: '587' },
              { label: 'Użytkownik', key: 'smtp_username', placeholder: 'user@example.com' },
              { label: 'Hasło', key: 'smtp_password', placeholder: '••••••••', type: 'password' },
            ].map(({ label, key, placeholder, type }) => (
              <div key={key}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 3 }}>{label}</div>
                <input
                  style={inputStyle}
                  type={type || 'text'}
                  placeholder={placeholder}
                  value={addForm[key as keyof typeof addForm]}
                  onChange={(e) => setAddForm((p) => ({ ...p, [key]: e.target.value }))}
                />
              </div>
            ))}
            {addError && (
              <div style={{ fontSize: 11, color: 'var(--error)' }}>{addError}</div>
            )}
            <button
              onClick={handleAddAccount}
              disabled={addLoading}
              style={{
                padding: '7px', borderRadius: 7, cursor: 'pointer',
                background: 'linear-gradient(135deg, var(--accent), #8b5cf6)',
                border: 'none', color: 'white', fontSize: 12, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              }}
            >
              {addLoading
                ? <><Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> Zapisywanie...</>
                : <><Plus size={12} /> Zapisz konto</>}
            </button>
          </div>
        )}

        {/* Selected account indicator */}
        {selectedUsername && (
          <div style={{
            marginTop: 8,
            background: 'rgba(34,197,94,0.07)',
            border: '1px solid rgba(34,197,94,0.15)',
            borderRadius: 9, padding: '8px 10px',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <div className="pulse-dot" />
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--success)' }}>SMTP Active</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>{selectedUsername}</div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </nav>
  );
}
