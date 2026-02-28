'use client';

import { useEffect, useRef, useState } from 'react';
import { Send, Users, Link2, Eye, EyeOff, Sparkles, ChevronDown, ChevronUp, Check, Loader2, CheckSquare, Square, Paperclip, X, FileText, Trash2, Clock, CalendarClock } from 'lucide-react';
import { useSettings } from '@/components/ThemeLanguageProvider';

interface Brand {
  name: string;
  email: string;
}

interface LinkItem {
  'website name': string;
  url: string;
}

interface Account {
  smtp_server: string;
  smtp_port: string;
  smtp_username: string;
}

const ACCOUNT_KEY = 'selectedAccount';
const MAX_TOTAL_SIZE = 15 * 1024 * 1024; // 15 MB

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function ComposePage() {
  const { t, lang } = useSettings();
  const locale = lang === 'pl' ? 'pl-PL' : 'en-US';

  const [brands, setBrands] = useState<Brand[]>([]);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [form, setForm] = useState({
    to: '',
    subject: '',
    html: '',
  });
  const [sending, setSending] = useState(false);
  const [preview, setPreview] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [toError, setToError] = useState<string>('');

  // Attachments
  const [attachments, setAttachments] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI Improver state
  const [improverOpen, setImproverOpen] = useState(false);
  const [instructions, setInstructions] = useState('');
  const [improving, setImproving] = useState(false);
  const [improvedContent, setImprovedContent] = useState('');
  const [improveError, setImproveError] = useState('');

  // Accounts for modal
  const [accounts, setAccounts] = useState<Account[]>([]);
  // Send confirmation modal
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [modalAccount, setModalAccount] = useState<Account | null>(null);

  // Schedule state
  const [scheduleMode, setScheduleMode] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    fetch('/api/brands').then(r => r.json()).then(setBrands).catch(() => {});
    fetch('/api/links').then(r => r.json()).then(setLinks).catch(() => {});
    fetch('/api/accounts').then(r => r.json()).then(setAccounts).catch(() => {});
  }, []);

  // Sync "To" field whenever selectedBrands changes (only when something is actually selected)
  useEffect(() => {
    if (selectedBrands.length > 0) {
      setForm(p => ({ ...p, to: selectedBrands.join(', ') }));
      setToError('');
    }
  }, [selectedBrands]);

  const toggleBrand = (email: string) => {
    setSelectedBrands(prev =>
      prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]
    );
  };

  const selectAllBrands = () => {
    setSelectedBrands(brands.map(b => b.email));
  };

  const deselectAllBrands = () => {
    setSelectedBrands([]);
  };

  const allSelected = brands.length > 0 && selectedBrands.length === brands.length;

  const insertLink = (url: string) => {
    setForm(p => ({ ...p, html: p.html + ` <a href="${url}">${url}</a>` }));
  };

  // ── Attachment helpers ────────────────────────────────────────────────────────

  const totalAttachmentSize = attachments.reduce((sum, f) => sum + f.size, 0);

  const addFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const incoming = Array.from(files);
    const newTotal = totalAttachmentSize + incoming.reduce((s, f) => s + f.size, 0);
    if (newTotal > MAX_TOTAL_SIZE) {
      showToast(t('compose.size_exceeded').replace('{size}', formatBytes(newTotal)), 'error');
      return;
    }
    // Avoid duplicates by name+size
    const existing = new Set(attachments.map(f => `${f.name}-${f.size}`));
    const unique = incoming.filter(f => !existing.has(`${f.name}-${f.size}`));
    setAttachments(prev => [...prev, ...unique]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  // ── AI Improver ───────────────────────────────────────────────────────────────

  const improveEmail = async () => {
    if (!form.html.trim()) {
      setImproveError(t('compose.ai_empty_error'));
      return;
    }
    setImproveError('');
    setImprovedContent('');
    setImproving(true);
    try {
      const res = await fetch('/api/improve-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: form.html, instructions }),
      });
      const data = await res.json();
      if (res.ok) {
        setImprovedContent(data.improved);
      } else {
        setImproveError(data.error || 'Błąd OpenAI');
      }
    } catch {
      setImproveError(t('compose.server_error'));
    }
    setImproving(false);
  };

  const applyImproved = () => {
    setForm(p => ({ ...p, html: improvedContent }));
    setImprovedContent('');
    setImproverOpen(false);
    showToast(t('compose.ai_applied'));
  };

  // ── Clear form ────────────────────────────────────────────────────────────────

  const clearForm = () => {
    setForm({ to: '', subject: '', html: '' });
    setSelectedBrands([]);
    setAttachments([]);
    setImprovedContent('');
    setImproveError('');
    setInstructions('');
    setImproverOpen(false);
    setPreview(false);
  };

  // ── Send ──────────────────────────────────────────────────────────────────────

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  /** Open modal: pre-load the currently selected localStorage account */
  const openSendModal = (isSchedule = false) => {
    if (!form.to || !form.subject || !form.html) {
      showToast(t('compose.fill_all'), 'error');
      return;
    }
    if (toError) {
      showToast(t('compose.fix_emails'), 'error');
      return;
    }
    let current: Account | null = null;
    try {
      const raw = localStorage.getItem(ACCOUNT_KEY);
      if (raw) current = JSON.parse(raw) as Account;
    } catch { /* ignore */ }
    setModalAccount(current);
    setScheduleMode(isSchedule);
    if (!isSchedule) setScheduledDate('');
    setConfirmModalOpen(true);
  };

  /** Called after user confirms in modal */
  const sendEmail = async () => {
    setConfirmModalOpen(false);
    setSending(true);

    const fromAccount = modalAccount;

    // Convert attachments to base64
    const attachmentPayload = await Promise.all(
      attachments.map(async (file) => ({
        filename: file.name,
        content: await fileToBase64(file),
        contentType: file.type || 'application/octet-stream',
      }))
    );

    // Determine recipients: split comma-separated or single
    const recipients = form.to.split(',').map(e => e.trim()).filter(Boolean);

    let successCount = 0;
    let failCount = 0;

    for (const recipient of recipients) {
      try {
        // Replace {{name}} with the recipient's name from the brands list
        const brand = brands.find(b => b.email.trim() === recipient.trim());
        const personalizedHtml = brand
          ? form.html.replace(/\{\{name\}\}/g, brand.name.trim())
          : form.html;

        const res = await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, html: personalizedHtml, to: recipient, fromAccount, attachments: attachmentPayload }),
        });
        if (res.ok) {
          successCount++;
        } else {
          failCount++;
        }
      } catch {
        failCount++;
      }
    }

    if (failCount === 0) {
      showToast(recipients.length > 1
        ? t('compose.sent_to_many').replace('{count}', String(successCount))
        : t('compose.sent_to_one').replace('{email}', recipients[0])
      );
      clearForm();
    } else if (successCount > 0) {
      showToast(t('compose.sent_partial').replace('{success}', String(successCount)).replace('{fail}', String(failCount)), 'error');
    } else {
      showToast(t('compose.send_error'), 'error');
    }

    setSending(false);
  };

  /** Schedule emails for future sending */
  const scheduleEmail = async () => {
    if (!scheduledDate) {
      showToast(t('compose.select_date'), 'error');
      return;
    }
    if (new Date(scheduledDate) <= new Date()) {
      showToast(t('compose.date_future'), 'error');
      return;
    }
    if (!modalAccount) {
      showToast(t('compose.select_sender'), 'error');
      return;
    }
    setConfirmModalOpen(false);
    setSending(true);

    try {
      const res = await fetch('/api/schedule-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: form.to,
          from_account: modalAccount.smtp_username,
          subject: form.subject,
          html: form.html,
          scheduled_date: new Date(scheduledDate).toISOString(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(t('compose.scheduled_ok').replace('{count}', data.count).replace('{date}', new Date(scheduledDate).toLocaleString(locale)));
        clearForm();
        setScheduledDate('');
      } else {
        showToast(data.error || t('compose.schedule_error'), 'error');
      }
    } catch {
      showToast(t('compose.server_error'), 'error');
    }

    setSending(false);
  };

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }} className="glow-text">
          {t('compose.title')}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
          {t('compose.subtitle')}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24 }}>
        {/* Main compose area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            {/* To */}
            <div style={{ marginBottom: 14 }}>
              <label className="label">{t('compose.to_label')}</label>
              <input
                className="input"
                type="text"
                placeholder={t('compose.to_placeholder')}
                value={form.to}
                style={toError ? { borderColor: 'var(--error)' } : undefined}
                onChange={e => {
                  const val = e.target.value;
                  setForm(p => ({ ...p, to: val }));
                  setSelectedBrands([]);
                  // Validate emails on-the-fly
                  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                  const parts = val.split(',').map(s => s.trim()).filter(Boolean);
                  const invalid = parts.filter(p => !emailRegex.test(p));
                  setToError(invalid.length > 0 ? `${t('compose.invalid_emails')}: ${invalid.join(', ')}` : '');
                }}
              />
              {toError && (
                <div style={{ marginTop: 4, fontSize: 11, color: 'var(--error)' }}>{toError}</div>
              )}
              {!toError && selectedBrands.length > 1 && (
                <div style={{ marginTop: 5, fontSize: 11, color: 'var(--accent)' }}>
                  {t('compose.selected_recipients').replace('{count}', String(selectedBrands.length))}
                </div>
              )}
            </div>

            {/* Subject */}
            <div style={{ marginBottom: 14 }}>
              <label className="label">{t('compose.subject')}</label>
              <input
                className="input"
                placeholder={t('compose.subject_placeholder')}
                value={form.subject}
                onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
              />
            </div>

            {/* Body */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label className="label" style={{ margin: 0 }}>{t('compose.body_label')}</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className="btn-secondary"
                    style={{ padding: '6px 12px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}
                    onClick={() => setImproverOpen(p => !p)}
                  >
                    <Sparkles size={13} />
                    {t('compose.ai_improve')}
                    {improverOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>
                  <button
                    className="btn-secondary"
                    style={{ padding: '6px 12px', fontSize: 12 }}
                    onClick={() => setPreview(p => !p)}
                  >
                    {preview ? <><EyeOff size={13} /> {t('compose.edit')}</> : <><Eye size={13} /> {t('compose.preview')}</>}
                  </button>
                </div>
              </div>

              {/* AI Improver Panel */}
              {improverOpen && (
                <div style={{
                  border: '1px solid rgba(108,99,255,0.3)',
                  borderRadius: 10,
                  background: 'rgba(108,99,255,0.05)',
                  padding: 16,
                  marginBottom: 12,
                }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Sparkles size={14} /> {t('compose.ai_title')}
                  </div>

                  <div style={{ marginBottom: 10 }}>
                    <label className="label" style={{ fontSize: 12 }}>{t('compose.ai_instructions')}</label>
                    <textarea
                      className="input textarea"
                      style={{ minHeight: 80, fontSize: 13, resize: 'vertical' }}
                      placeholder={t('compose.ai_placeholder')}
                      value={instructions}
                      onChange={e => setInstructions(e.target.value)}
                    />
                  </div>

                  <button
                    className="btn-primary"
                    style={{ padding: '9px 18px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 7 }}
                    onClick={improveEmail}
                    disabled={improving}
                  >
                    {improving ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> {t('compose.ai_improving')}</> : <><Sparkles size={14} /> {t('compose.ai_improve_btn')}</>}
                  </button>

                  {improveError && (
                    <div style={{ marginTop: 10, color: 'var(--error)', fontSize: 12 }}>{improveError}</div>
                  )}

                  {improvedContent && (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>{t('compose.ai_result')}</div>
                      <div style={{
                        border: '1px solid var(--border)',
                        borderRadius: 8,
                        padding: 12,
                        background: 'var(--bg-secondary)',
                        fontSize: 13,
                        lineHeight: 1.6,
                        maxHeight: 200,
                        overflowY: 'auto',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}>
                        {improvedContent}
                      </div>
                      <button
                        className="btn-primary"
                        style={{ marginTop: 8, padding: '8px 16px', fontSize: 13, background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 6 }}
                        onClick={applyImproved}
                      >
                        <Check size={14} /> {t('compose.ai_apply')}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {preview ? (
                <div style={{
                  border: '1px solid var(--border)',
                  borderRadius: 10, padding: 16,
                  background: '#fff', color: '#111',
                  minHeight: 200, fontFamily: 'serif',
                  fontSize: 14, lineHeight: 1.6,
                }}
                  dangerouslySetInnerHTML={{ __html: form.html }}
                />
              ) : (
                <textarea
                  className="input textarea"
                  style={{ minHeight: 200, fontFamily: 'monospace', fontSize: 13 }}
                  placeholder={t('compose.body_placeholder')}
                  value={form.html}
                  onChange={e => setForm(p => ({ ...p, html: e.target.value }))}
                />
              )}
            </div>

            {/* ── Attachments ───────────────────────────────── */}
            <div style={{ marginTop: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label className="label" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Paperclip size={13} color="var(--accent)" />
                  {t('compose.attachments')}
                </label>
                <span style={{ fontSize: 11, color: totalAttachmentSize > MAX_TOTAL_SIZE * 0.9 ? 'var(--error)' : 'var(--text-muted)' }}>
                  {formatBytes(totalAttachmentSize)} / 15 MB
                </span>
              </div>

              {/* Drag & Drop zone */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${dragOver ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: 10,
                  padding: '18px 16px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: dragOver ? 'rgba(108,99,255,0.07)' : 'var(--bg-secondary)',
                  transition: 'all 0.18s',
                  marginBottom: attachments.length > 0 ? 10 : 0,
                }}
              >
                <Paperclip size={20} color={dragOver ? 'var(--accent)' : 'var(--text-muted)'} style={{ marginBottom: 6 }} />
                <div style={{ fontSize: 13, color: dragOver ? 'var(--accent)' : 'var(--text-muted)', fontWeight: 500 }}>
                  {t('compose.drag_drop')}{' '}
                  <span style={{ color: 'var(--accent)', textDecoration: 'underline' }}>{t('compose.click_to_select')}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                  {t('compose.max_size')}
                </div>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                style={{ display: 'none' }}
                onChange={e => addFiles(e.target.files)}
                onClick={e => (e.currentTarget.value = '')}
              />

              {/* File list */}
              {attachments.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {attachments.map((file, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '7px 10px',
                        borderRadius: 8,
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      <FileText size={14} color="var(--accent)" style={{ flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {file.name}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatBytes(file.size)}</div>
                      </div>
                      <button
                        onClick={() => removeAttachment(i)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          padding: 2,
                          borderRadius: 4,
                          transition: 'color 0.15s',
                        }}
                        title={t('compose.remove_attachment')}
                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--error)')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Send / Schedule / Clear buttons */}
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <button
                className="btn-secondary"
                onClick={clearForm}
                style={{ padding: '10px 18px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--error)', borderColor: 'rgba(239,68,68,0.35)' }}
                title={t('compose.clear_form')}
              >
                <Trash2 size={14} /> {t('compose.clear_form')}
              </button>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  className="btn-secondary"
                  onClick={() => openSendModal(true)}
                  disabled={sending}
                  style={{ padding: '12px 20px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 7, borderColor: 'rgba(108,99,255,0.4)', color: 'var(--accent)' }}
                >
                  <CalendarClock size={15} /> {t('compose.schedule_send')}
                </button>
                <button className="btn-primary" onClick={() => openSendModal(false)} disabled={sending} style={{ padding: '12px 28px', fontSize: 15 }}>
                  <Send size={16} /> {sending ? t('compose.sending') : selectedBrands.length > 1 ? t('compose.send_to_many').replace('{count}', String(selectedBrands.length)) : t('compose.send_mail')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar panels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Brands */}
          <div className="card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Users size={14} color="var(--accent)" /> {t('compose.select_contact')}
              </h3>
              {brands.length > 0 && (
                <button
                  onClick={allSelected ? deselectAllBrands : selectAllBrands}
                  style={{
                    background: allSelected ? 'rgba(108,99,255,0.15)' : 'rgba(108,99,255,0.07)',
                    border: '1px solid rgba(108,99,255,0.3)',
                    borderRadius: 6, padding: '3px 8px',
                    color: 'var(--accent)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 4,
                    fontSize: 10, fontWeight: 700,
                  }}
                >
                  {allSelected
                    ? <><CheckSquare size={10} /> {t('compose.deselect')}</>
                    : <><Square size={10} />{t('compose.select_all')}</>}
                </button>
              )}
            </div>
            {brands.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{t('compose.no_contacts')}</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {brands.map((b, i) => {
                  const selected = selectedBrands.includes(b.email);
                  return (
                    <button
                      key={i}
                      onClick={() => toggleBrand(b.email)}
                      style={{
                        textAlign: 'left', padding: '8px 10px', borderRadius: 8, cursor: 'pointer',
                        border: `1px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
                        background: selected ? 'rgba(108,99,255,0.1)' : 'var(--bg-secondary)',
                        transition: 'all 0.15s',
                        display: 'flex', alignItems: 'center', gap: 8,
                      }}
                    >
                      <div style={{
                        width: 14, height: 14, borderRadius: 4, flexShrink: 0,
                        border: `1.5px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
                        background: selected ? 'var(--accent)' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {selected && <Check size={9} color="white" strokeWidth={3} />}
                      </div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{b.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{b.email}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
            {selectedBrands.length > 0 && (
              <div style={{
                marginTop: 8, fontSize: 11,
                color: 'var(--accent)', fontWeight: 600,
              }}>
                {t('compose.selected_count').replace('{selected}', String(selectedBrands.length)).replace('{total}', String(brands.length))}
              </div>
            )}
          </div>

          {/* Links */}
          <div className="card" style={{ padding: 16 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Link2 size={14} color="var(--accent)" /> {t('compose.insert_link')}
            </h3>
            {links.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{t('compose.no_links')}</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {links.map((l, i) => (
                  <button
                    key={i}
                    onClick={() => insertLink(l.url)}
                    style={{
                      textAlign: 'left', padding: '8px 10px', borderRadius: 8, cursor: 'pointer',
                      border: '1px solid var(--border)',
                      background: 'var(--bg-secondary)',
                      transition: 'all 0.15s',
                    }}
                    title={`${t('compose.click_to_insert')}: ${l.url}`}
                  >
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{l['website name']}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.url}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

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

      {/* ── Send Confirmation Modal ───────────────────────────────────────────── */}
      {confirmModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
          onClick={() => setConfirmModalOpen(false)}
        >
          <div
            style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border)',
              borderRadius: 16,
              padding: 28,
              width: 440,
              maxWidth: '95vw',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
              {scheduleMode ? <CalendarClock size={16} color="var(--accent)" /> : <Send size={16} color="var(--accent)" />}
              {scheduleMode ? t('compose.confirm_schedule') : t('compose.confirm_send')}
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 18 }}>
              {scheduleMode ? t('compose.confirm_schedule_desc') : t('compose.confirm_send_desc')}
            </p>

            {/* Account selector */}
            <div style={{ marginBottom: 18 }}>
              <label className="label" style={{ fontSize: 12, marginBottom: 6 }}>{t('compose.sender_account')}</label>
              {accounts.length === 0 ? (
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t('compose.no_accounts')}</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {accounts.map((acc, i) => (
                    <button
                      key={i}
                      onClick={() => setModalAccount(acc)}
                      style={{
                        textAlign: 'left', padding: '9px 12px', borderRadius: 8,
                        border: `1px solid ${modalAccount?.smtp_username === acc.smtp_username ? 'var(--accent)' : 'var(--border)'}`,
                        background: modalAccount?.smtp_username === acc.smtp_username ? 'rgba(108,99,255,0.1)' : 'var(--bg-secondary)',
                        cursor: 'pointer', transition: 'all 0.15s',
                        display: 'flex', alignItems: 'center', gap: 8,
                      }}
                    >
                      <div style={{ width: 12, height: 12, borderRadius: '50%', flexShrink: 0,
                        border: `2px solid ${modalAccount?.smtp_username === acc.smtp_username ? 'var(--accent)' : 'var(--border)'}`,
                        background: modalAccount?.smtp_username === acc.smtp_username ? 'var(--accent)' : 'transparent' }} />
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{acc.smtp_username}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{acc.smtp_server}:{acc.smtp_port}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Schedule date picker */}
            {scheduleMode && (
              <div style={{ marginBottom: 18 }}>
                <label className="label" style={{ fontSize: 12, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Clock size={13} color="var(--accent)" /> {t('compose.schedule_date')}
                </label>
                <input
                  type="datetime-local"
                  className="input"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  style={{ fontSize: 13 }}
                />
                {scheduledDate && (
                  <div style={{ marginTop: 6, fontSize: 11, color: 'var(--accent)' }}>
                    {t('compose.schedule_info').replace('{date}', new Date(scheduledDate).toLocaleString(locale))}
                  </div>
                )}
              </div>
            )}

            {/* Summary */}
            <div style={{
              padding: '10px 14px', borderRadius: 8,
              background: 'var(--bg-secondary)', border: '1px solid var(--border)',
              fontSize: 12, color: 'var(--text-secondary)', marginBottom: 20,
            }}>
              <strong>{t('compose.to')}</strong> {form.to || '—'}<br />
              <strong>{t('compose.subject_label')}</strong> {form.subject || '—'}<br />
              {attachments.length > 0 && <><strong>{t('compose.attachments_label')}</strong> {t('compose.files_count').replace('{count}', String(attachments.length))}</>}
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                className="btn-secondary"
                style={{ padding: '10px 20px', fontSize: 13 }}
                onClick={() => setConfirmModalOpen(false)}
              >
                {t('compose.cancel')}
              </button>
              {scheduleMode ? (
                <button
                  className="btn-primary"
                  style={{ padding: '10px 22px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 7, background: 'linear-gradient(135deg, var(--accent), #8b5cf6)' }}
                  onClick={scheduleEmail}
                >
                  <CalendarClock size={14} /> {t('compose.schedule_btn')}
                </button>
              ) : (
                <button
                  className="btn-primary"
                  style={{ padding: '10px 22px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 7 }}
                  onClick={sendEmail}
                >
                  <Send size={14} /> {t('compose.send_btn')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
