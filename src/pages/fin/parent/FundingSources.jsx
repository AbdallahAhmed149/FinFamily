import React, { useState, useEffect } from 'react';

export default function FundingSources({ token }) {
  const [sources, setSources] = useState([]);
  const [bankName, setBankName] = useState('');
  const [accountLast4, setAccountLast4] = useState('');

  const fetchSources = async () => {
    const res = await fetch('/api/funding-sources', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) setSources(await res.json());
  };

  const addSource = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/funding-sources', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ bank_name: bankName, account_last4: accountLast4, is_primary: false })
    });
    if (res.ok) {
      setBankName('');
      setAccountLast4('');
      fetchSources();
    }
  };

  useEffect(() => { fetchSources(); }, []);

  return (
    <div className="p-4 bg-white rounded-lg shadow mt-4">
      <h2 className="text-xl font-bold mb-4">Funding Sources (Bank Cards)</h2>
      <ul className="mb-4">
        {sources.map(s => (
          <li key={s.id} className="p-2 border-b flex justify-between">
            <span>{s.bank_name} ending in ****{s.account_last4}</span>
            {s.is_primary && <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">Primary</span>}
          </li>
        ))}
      </ul>
      <form onSubmit={addSource} className="flex gap-2">
        <input 
          type="text" placeholder="Bank Name (e.g. CIB)" required
          value={bankName} onChange={e => setBankName(e.target.value)}
          className="border p-2 rounded flex-1"
        />
        <input 
          type="text" placeholder="Last 4 digits" required maxLength="4"
          value={accountLast4} onChange={e => setAccountLast4(e.target.value)}
          className="border p-2 rounded w-32"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Add</button>
      </form>
    </div>
  );
}
