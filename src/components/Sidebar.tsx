'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Mail, Users, Link2, Send, BarChart2, Zap, ChevronDown,
  Plus, Trash2, Wifi, WifiOff, X, Loader2, CheckCircle, AlertCircle,
  CalendarClock, Sun, Moon, Globe,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSettings } from '@/components/ThemeLanguageProvider';

interface Account {
  smtp_server: string;
  smtp_port: string;
  smtp_username: string;
}

const STORAGE_KEY = 'selectedAccount';

const emptyForm = { smtp_server: '', smtp_port: '587', smtp_username: '', smtp_password: '' };

const navKeys = [
  { href: '/', labelKey: 'nav.dashboard', icon: BarChart2 },
  { href: '/compose', labelKey: 'nav.compose', icon: Send },
  { href: '/scheduled', labelKey: 'nav.scheduled', icon: CalendarClock },
  { href: '/brands', labelKey: 'nav.brands', icon: Users },
  { href: '/links', labelKey: 'nav.links', icon: Link2 },
  { href: '/logs', labelKey: 'nav.logs', icon: Mail },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme, lang, setLang, t } = useSettings();

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
      setAddError(t('sidebar.fill_all'));
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
        setAddError(data.error || t('sidebar.save_error'));
      }
    } catch {
      setAddError(t('sidebar.connection_error'));
    }
    setAddLoading(false);
  };

  const handleDeleteAccount = async (username: string) => {
    if (!confirm(`${t('sidebar.delete_confirm')} "${username}"?`)) return;
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
        [account.smtp_username]: data.ok ? 'ok' : `error:${data.error || t('sidebar.test_error_smtp')}`,
      }));
    } catch {
      setTestStatus((prev) => ({ ...prev, [account.smtp_username]: `error:${t('sidebar.test_error_connection')}` }));
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

  const toggleBtnStyle: React.CSSProperties = {
    background: 'rgba(108,99,255,0.1)',
    border: '1px solid rgba(108,99,255,0.25)',
    borderRadius: 8,
    padding: '5px 8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--accent)',
    transition: 'all 0.2s',
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

        {/* Theme & Language toggles */}
        <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
          <button onClick={toggleTheme} style={toggleBtnStyle} title={theme === 'dark' ? t('theme.light') : t('theme.dark')}>
            {theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
            {theme === 'dark' ? t('theme.light') : t('theme.dark')}
          </button>
          <button
            onClick={() => setLang(lang === 'pl' ? 'en' : 'pl')}
            style={toggleBtnStyle}
            title={lang === 'pl' ? 'English' : 'Polski'}
          >
            <Globe size={13} />
            {lang === 'pl' ? 'ENG' : 'PL'}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ flex: 1, paddingTop: 12 }}>
        <div style={{ padding: '0 8px 8px', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase', paddingLeft: 24 }}>
          {t('sidebar.menu')}
        </div>
        {navKeys.map(({ href, labelKey, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`sidebar-link ${pathname === href ? 'active' : ''}`}
          >
            <Icon size={17} />
            {t(labelKey)}
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
            {t('sidebar.smtp_accounts')}
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
            title={showAddForm ? t('sidebar.close') : t('sidebar.add_account')}
          >
            {showAddForm ? <X size={11} /> : <Plus size={11} />}
            {showAddForm ? t('sidebar.cancel') : t('sidebar.add')}
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
                      title={t('sidebar.delete_account')}
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
                    {ts === 'testing' ? t('sidebar.testing')
                      : ts === 'ok' ? t('sidebar.connected')
                        : ts?.startsWith('error') ? ts.replace('error:', '')
                          : t('sidebar.test_connection')}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {accounts.length === 0 && !showAddForm && (
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>
            {t('sidebar.no_accounts')}
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
              {t('sidebar.new_smtp')}
            </div>
            {[
              { label: t('sidebar.smtp_server'), key: 'smtp_server', placeholder: 'smtp.gmail.com' },
              { label: t('sidebar.port'), key: 'smtp_port', placeholder: '587' },
              { label: t('sidebar.username'), key: 'smtp_username', placeholder: 'user@example.com' },
              { label: t('sidebar.password'), key: 'smtp_password', placeholder: '••••••••', type: 'password' },
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
                ? <><Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> {t('sidebar.saving')}</>
                : <><Plus size={12} /> {t('sidebar.save_account')}</>}
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
              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--success)' }}>{t('sidebar.smtp_active')}</div>
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
