import React, { useEffect, useState } from 'react';

export default function CreatorApprovalAdmin() {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/admin/creators/pending')
      .then(res => res.json())
      .then(setCreators)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  const approve = async (userId) => {
    await fetch(`/api/admin/creators/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    setCreators(creators.filter(c => c.id !== userId));
  };

  if (loading) return <div>Loading pending creators...</div>;
  if (error) return <div>Error loading creators.</div>;

  return (
    <div>
      <h2>Pending Creator Approvals</h2>
      <table>
        <thead>
          <tr><th>User ID</th><th>Name</th><th>Email</th><th>Action</th></tr>
        </thead>
        <tbody>
          {creators.map(c => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.name}</td>
              <td>{c.email}</td>
              <td><button onClick={() => approve(c.id)}>Approve</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
