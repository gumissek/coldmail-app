'use client';

import { useEffect, useRef, useState } from 'react';
import { Send, Users, Link2, Eye, EyeOff, Sparkles, ChevronDown, ChevronUp, Check, Loader2, CheckSquare, Square, Paperclip, X, FileText, Trash2, Clock, CalendarClock } from 'lucide-react';

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
      showToast(`Przekroczono limit 15 MB! (aktualne: ${formatBytes(newTotal)})`, 'error');
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
      setImproveError('Najpierw wpisz treść emaila!');
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
      setImproveError('Błąd połączenia z serwerem');
    }
    setImproving(false);
  };

  const applyImproved = () => {
    setForm(p => ({ ...p, html: improvedContent }));
    setImprovedContent('');
    setImproverOpen(false);
    showToast('✓ Poprawiona treść zastosowana!');
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
      showToast('Uzupełnij wszystkie pola!', 'error');
      return;
    }
    if (toError) {
      showToast('Popraw nieprawidłowe adresy email!', 'error');
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
        ? `✓ Wysłano do ${successCount} odbiorców!`
        : `✓ Mail wysłany do ${recipients[0]}!`
      );
      clearForm();
    } else if (successCount > 0) {
      showToast(`Wysłano: ${successCount}, błędy: ${failCount}`, 'error');
    } else {
      showToast('Błąd wysyłania maili', 'error');
    }

    setSending(false);
  };

  /** Schedule emails for future sending */
  const scheduleEmail = async () => {
    if (!scheduledDate) {
      showToast('Wybierz datę i godzinę wysyłki!', 'error');
      return;
    }
    if (new Date(scheduledDate) <= new Date()) {
      showToast('Data musi być w przyszłości!', 'error');
      return;
    }
    if (!modalAccount) {
      showToast('Wybierz konto nadawcy!', 'error');
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
        showToast(`✓ Zaplanowano wysyłkę ${data.count} mail(i) na ${new Date(scheduledDate).toLocaleString('pl-PL')}`);
        clearForm();
        setScheduledDate('');
      } else {
        showToast(data.error || 'Błąd planowania', 'error');
      }
    } catch {
      showToast('Błąd połączenia z serwerem', 'error');
    }

    setSending(false);
  };

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }} className="glow-text">
          Send Mail
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
          Napisz i wyślij cold maila przez SMTP.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24 }}>
        {/* Main compose area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            {/* To */}
            <div style={{ marginBottom: 14 }}>
              <label className="label">Do (adres email odbiorcy)</label>
              <input
                className="input"
                type="text"
                placeholder="odbiorca@firma.pl lub kilka po przecinku"
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
                  setToError(invalid.length > 0 ? `Nieprawidłowe adresy: ${invalid.join(', ')}` : '');
                }}
              />
              {toError && (
                <div style={{ marginTop: 4, fontSize: 11, color: 'var(--error)' }}>{toError}</div>
              )}
              {!toError && selectedBrands.length > 1 && (
                <div style={{ marginTop: 5, fontSize: 11, color: 'var(--accent)' }}>
                  Zaznaczono {selectedBrands.length} odbiorców — wyślę osobne maile do każdego
                </div>
              )}
            </div>

            {/* Subject */}
            <div style={{ marginBottom: 14 }}>
              <label className="label">Temat</label>
              <input
                className="input"
                placeholder="Temat wiadomości..."
                value={form.subject}
                onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
              />
            </div>

            {/* Body */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label className="label" style={{ margin: 0 }}>Treść (HTML)</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className="btn-secondary"
                    style={{ padding: '6px 12px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}
                    onClick={() => setImproverOpen(p => !p)}
                  >
                    <Sparkles size={13} />
                    Popraw AI
                    {improverOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>
                  <button
                    className="btn-secondary"
                    style={{ padding: '6px 12px', fontSize: 12 }}
                    onClick={() => setPreview(p => !p)}
                  >
                    {preview ? <><EyeOff size={13} /> Edytuj</> : <><Eye size={13} /> Podgląd</>}
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
                    <Sparkles size={14} /> Poprawianie treści przez AI
                  </div>

                  <div style={{ marginBottom: 10 }}>
                    <label className="label" style={{ fontSize: 12 }}>Wytyczne dotyczące wyglądu emaila</label>
                    <textarea
                      className="input textarea"
                      style={{ minHeight: 80, fontSize: 13, resize: 'vertical' }}
                      placeholder="Np. Formalny ton, zwięzłe akapity, bez tagów HTML, profesjonalne zakończenie..."
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
                    {improving ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Poprawiam...</> : <><Sparkles size={14} /> Popraw</>}
                  </button>

                  {improveError && (
                    <div style={{ marginTop: 10, color: 'var(--error)', fontSize: 12 }}>{improveError}</div>
                  )}

                  {improvedContent && (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Wynik poprawy:</div>
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
                        <Check size={14} /> Zastosuj
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
                  placeholder="<p>Cześć {{name}},</p><p>Piszę do Ciebie w sprawie...</p>"
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
                  Załączniki
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
                  Przeciągnij pliki tutaj lub{' '}
                  <span style={{ color: 'var(--accent)', textDecoration: 'underline' }}>kliknij, aby wybrać</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                  Maks. łączny rozmiar: 15 MB
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
                        title="Usuń załącznik"
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
                title="Wyczyść cały formularz"
              >
                <Trash2 size={14} /> Wyczyść formularz
              </button>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  className="btn-secondary"
                  onClick={() => openSendModal(true)}
                  disabled={sending}
                  style={{ padding: '12px 20px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 7, borderColor: 'rgba(108,99,255,0.4)', color: 'var(--accent)' }}
                >
                  <CalendarClock size={15} /> Zaplanuj wysyłkę
                </button>
                <button className="btn-primary" onClick={() => openSendModal(false)} disabled={sending} style={{ padding: '12px 28px', fontSize: 15 }}>
                  <Send size={16} /> {sending ? 'Wysyłanie...' : selectedBrands.length > 1 ? `Wyślij do ${selectedBrands.length} osób` : 'Wyślij mail'}
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
                <Users size={14} color="var(--accent)" /> Wybierz kontakt
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
                    ? <><CheckSquare size={10} /> Odznacz</>
                    : <><Square size={10} />Wszyscy</>}
                </button>
              )}
            </div>
            {brands.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>Brak kontaktów</div>
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
                Zaznaczono: {selectedBrands.length} z {brands.length}
              </div>
            )}
          </div>

          {/* Links */}
          <div className="card" style={{ padding: 16 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Link2 size={14} color="var(--accent)" /> Wstaw link
            </h3>
            {links.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>Brak linków</div>
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
                    title={`Kliknij, żeby wstawić: ${l.url}`}
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
              {scheduleMode ? 'Zaplanuj wysyłkę' : 'Potwierdź wysyłkę'}
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 18 }}>
              {scheduleMode ? 'Wybierz datę, godzinę i konto nadawcy.' : 'Z jakiego konta e-mail chcesz wysłać tę wiadomość?'}
            </p>

            {/* Account selector */}
            <div style={{ marginBottom: 18 }}>
              <label className="label" style={{ fontSize: 12, marginBottom: 6 }}>Konto nadawcy</label>
              {accounts.length === 0 ? (
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Brak kont - dodaj konto w sidebarze albo w pliku accounts.csv</div>
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
                  <Clock size={13} color="var(--accent)" /> Data i godzina wysyłki
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
                    Maile zostaną wysłane po {new Date(scheduledDate).toLocaleString('pl-PL')} w losowych odstępach 1-3h
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
              <strong>Do:</strong> {form.to || '—'}<br />
              <strong>Temat:</strong> {form.subject || '—'}<br />
              {attachments.length > 0 && <><strong>Załączniki:</strong> {attachments.length} plik(ów)</>}
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                className="btn-secondary"
                style={{ padding: '10px 20px', fontSize: 13 }}
                onClick={() => setConfirmModalOpen(false)}
              >
                Anuluj
              </button>
              {scheduleMode ? (
                <button
                  className="btn-primary"
                  style={{ padding: '10px 22px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 7, background: 'linear-gradient(135deg, var(--accent), #8b5cf6)' }}
                  onClick={scheduleEmail}
                >
                  <CalendarClock size={14} /> Zaplanuj
                </button>
              ) : (
                <button
                  className="btn-primary"
                  style={{ padding: '10px 22px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 7 }}
                  onClick={sendEmail}
                >
                  <Send size={14} /> Wyślij
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
