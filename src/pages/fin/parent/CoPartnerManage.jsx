import React, { useState } from 'react';

export default function CoPartnerManage({ token }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const invitePartner = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    const res = await fetch('/api/auth/partners/invite', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ full_name: fullName, email, password })
    });

    const data = await res.json();
    
    if (res.ok) {
      setMessage(`Successfully added ${data.full_name} as a Co-Partner!`);
      setFullName('');
      setEmail('');
      setPassword('');
    } else {
      setError(data.detail || 'Failed to add partner.');
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow mt-4">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <span role="img" aria-label="family">👨‍👩‍👧</span> Family Co-Partner
      </h2>
      <p className="text-sm text-gray-500 mb-4">You can add up to 1 additional Co-Partner (Max 2 total per family).</p>
      
      {message && <div className="p-2 mb-4 text-green-700 bg-green-100 rounded">{message}</div>}
      {error && <div className="p-2 mb-4 text-red-700 bg-red-100 rounded">{error}</div>}

      <form onSubmit={invitePartner} className="flex flex-col gap-3 max-w-sm">
        <input 
          type="text" placeholder="Partner Full Name" required
          value={fullName} onChange={e => setFullName(e.target.value)}
          className="border p-2 rounded"
        />
        <input 
          type="email" placeholder="Partner Email" required
          value={email} onChange={e => setEmail(e.target.value)}
          className="border p-2 rounded"
        />
        <input 
          type="password" placeholder="Partner Account Password" required minLength="8"
          value={password} onChange={e => setPassword(e.target.value)}
          className="border p-2 rounded"
        />
        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 font-semibold">
          Add Co-Partner
        </button>
      </form>
    </div>
  );
}
