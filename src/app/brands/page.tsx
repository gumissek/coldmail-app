'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Users, Save } from 'lucide-react';
import { useSettings } from '@/components/ThemeLanguageProvider';

interface Brand {
  name: string;
  email: string;
}

export default function BrandsPage() {
  const { t } = useSettings();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [newBrand, setNewBrand] = useState({ name: '', email: '' });
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [saving, setSaving] = useState(false);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = () => {
    fetch('/api/brands').then(r => r.json()).then(data => {
      setBrands(data);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const addBrand = async () => {
    if (!newBrand.name.trim() || !newBrand.email.trim()) {
      showToast(t('brands.fill_both'), 'error');
      return;
    }
    if (!isValidEmail(newBrand.email)) {
      showToast(t('brands.invalid_email'), 'error');
      return;
    }
    const duplicate = brands.some(
      b => b.email.trim().toLowerCase() === newBrand.email.trim().toLowerCase()
    );
    if (duplicate) {
      showToast(t('brands.duplicate'), 'error');
      return;
    }
    setSaving(true);
    const res = await fetch('/api/brands', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'add', brand: newBrand }),
    });
    if (res.ok) {
      setNewBrand({ name: '', email: '' });
      load();
      showToast(t('brands.added'));
    } else {
      showToast(t('brands.add_error'), 'error');
    }
    setSaving(false);
  };

  const deleteBrand = async (index: number) => {
    const res = await fetch('/api/brands', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', index }),
    });
    if (res.ok) { load(); showToast(t('brands.deleted')); }
    else showToast(t('brands.delete_error'), 'error');
  };

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }} className="glow-text">
          {t('brands.title')}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
          {t('brands.subtitle')}
        </p>
      </div>

      {/* Add new */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Plus size={17} color="var(--accent)" /> {t('brands.add_new')}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 12 }}>
          <div>
            <label className="label">{t('brands.name_label')}</label>
            <input
              className="input"
              placeholder={t('brands.name_placeholder')}
              value={newBrand.name}
              onChange={e => setNewBrand(p => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">{t('brands.email_label')}</label>
            <input
              className="input"
              type="email"
              placeholder={t('brands.email_placeholder')}
              value={newBrand.email}
              onChange={e => setNewBrand(p => ({ ...p, email: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && addBrand()}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button className="btn-primary" onClick={addBrand} disabled={saving}>
              <Save size={15} /> {saving ? t('brands.saving') : t('brands.add')}
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={17} color="var(--accent)" /> {t('brands.list')}
          </h2>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', background: 'var(--bg-secondary)', padding: '4px 12px', borderRadius: 20, border: '1px solid var(--border)' }}>
            {brands.length} {t('brands.records')}
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>{t('brands.loading')}</div>
        ) : brands.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            {t('brands.empty')}
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>{t('brands.name_col')}</th>
                  <th>{t('brands.email_col')}</th>
                  <th>{t('brands.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {brands.map((brand, i) => (
                  <tr key={i}>
                    <td style={{ color: 'var(--text-muted)', width: 40 }}>{i + 1}</td>
                    <td style={{ fontWeight: 500 }}>{brand.name}</td>
                    <td>
                      <a href={`mailto:${brand.email}`} style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                        {brand.email}
                      </a>
                    </td>
                    <td>
                      <button className="btn-danger" onClick={() => deleteBrand(i)}>
                        <Trash2 size={13} /> {t('brands.delete')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Toast */}
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
