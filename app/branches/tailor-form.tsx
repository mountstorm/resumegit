'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function TailorForm() {
  const router = useRouter();
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [jd, setJd] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const response = await fetch('/api/tailor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ company, role, jd })
    });
    setBusy(false);
    if (!response.ok) {
      const body = await response.json().catch(() => ({ error: response.statusText }));
      setError(body.error ?? 'tailoring failed');
      return;
    }
    setCompany('');
    setRole('');
    setJd('');
    router.refresh();
  }

  return (
    <form onSubmit={submit}>
      <label htmlFor="company">Company</label>
      <input id="company" value={company} onChange={(e) => setCompany(e.target.value)} required />
      <label htmlFor="role">Role</label>
      <input id="role" value={role} onChange={(e) => setRole(e.target.value)} required />
      <label htmlFor="jd">Job description (required — the tailoring and skills match parse it)</label>
      <textarea id="jd" value={jd} onChange={(e) => setJd(e.target.value)} required minLength={40} />
      <p>
        <button disabled={busy}>{busy ? 'Tailoring…' : 'Tailor & create branch'}</button>
      </p>
      {error && <p className="error">{error}</p>}
    </form>
  );
}