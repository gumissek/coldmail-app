'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Link2, Save, ExternalLink } from 'lucide-react';
import { useSettings } from '@/components/ThemeLanguageProvider';

interface Link {
  'website name': string;
  url: string;
}

export default function LinksPage() {
  const { t } = useSettings();
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [newLink, setNewLink] = useState({ 'website name': '', url: '' });
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [saving, setSaving] = useState(false);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = () => {
    fetch('/api/links').then(r => r.json()).then(data => {
      setLinks(data);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const addLink = async () => {
    if (!newLink['website name'].trim() || !newLink.url.trim()) {
      showToast(t('links.fill_both'), 'error');
      return;
    }
    setSaving(true);
    const res = await fetch('/api/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'add', link: newLink }),
    });
    if (res.ok) {
      setNewLink({ 'website name': '', url: '' });
      load();
      showToast(t('links.added'));
    } else {
      showToast(t('links.add_error'), 'error');
    }
    setSaving(false);
  };

  const deleteLink = async (index: number) => {
    const res = await fetch('/api/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', index }),
    });
    if (res.ok) { load(); showToast(t('links.deleted')); }
    else showToast(t('links.delete_error'), 'error');
  };

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }} className="glow-text">
          {t('links.title')}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
          {t('links.subtitle')}
        </p>
      </div>

      {/* Add new */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Plus size={17} color="var(--accent)" /> {t('links.add_new')}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 12 }}>
          <div>
            <label className="label">{t('links.name_label')}</label>
            <input
              className="input"
              placeholder={t('links.name_placeholder')}
              value={newLink['website name']}
              onChange={e => setNewLink(p => ({ ...p, 'website name': e.target.value }))}
            />
          </div>
          <div>
            <label className="label">URL</label>
            <input
              className="input"
              type="url"
              placeholder="https://..."
              value={newLink.url}
              onChange={e => setNewLink(p => ({ ...p, url: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && addLink()}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button className="btn-primary" onClick={addLink} disabled={saving}>
              <Save size={15} /> {saving ? t('links.saving') : t('links.add')}
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link2 size={17} color="var(--accent)" /> {t('links.list')}
          </h2>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', background: 'var(--bg-secondary)', padding: '4px 12px', borderRadius: 20, border: '1px solid var(--border)' }}>
            {links.length} {t('links.count')}
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>{t('links.loading')}</div>
        ) : links.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            {t('links.empty')}
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>{t('links.name_col')}</th>
                  <th>URL</th>
                  <th>{t('links.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {links.map((link, i) => (
                  <tr key={i}>
                    <td style={{ color: 'var(--text-muted)', width: 40 }}>{i + 1}</td>
                    <td style={{ fontWeight: 500 }}>{link['website name']}</td>
                    <td>
                      <a href={link.url} target="_blank" rel="noopener noreferrer"
                        style={{ color: 'var(--accent)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        {link.url} <ExternalLink size={12} />
                      </a>
                    </td>
                    <td>
                      <button className="btn-danger" onClick={() => deleteLink(i)}>
                        <Trash2 size={13} /> {t('links.delete')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
    </div>
  );
}
