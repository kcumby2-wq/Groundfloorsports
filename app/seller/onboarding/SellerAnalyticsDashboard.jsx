import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend } from 'chart.js';
import { CSVLink } from 'react-csv';
Chart.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

export default function SellerAnalyticsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/seller/uploads/analytics')
      .then(res => res.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading analytics...</div>;
  if (error) return <div>Error loading analytics.</div>;
  if (!data) return null;

  // Only show analytics for opt-in mentorship users
  if (!data.user?.mentorshipOptIn) {
    return <div>Mentorship analytics are only available for participants in the mentorship program.</div>;
  }

  const uploadsPerDay = getUploadsPerDay(data.uploads);
  const growthData = getGrowthData(data.uploads);
  const chartData = {
    labels: uploadsPerDay.labels,
    datasets: [
      {
        label: 'Uploads per day',
        data: uploadsPerDay.data,
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };
  const growthChartData = {
    labels: growthData.labels,
    datasets: [
      {
        label: 'Cumulative Published Uploads (Growth)',
        data: growthData.data,
        fill: true,
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        tension: 0.1
      }
    ]
  };
  const csvData = data.uploads.map(u => ({
    ID: u.id,
    Status: u.status,
    Created: u.createdAt,
    Title: u.title || '',
    SizeMB: u.size ? (u.size / (1024 * 1024)).toFixed(2) : '',
    Moderation: u.moderation || '',
  }));

  return (
    <div>
      <h2>Seller Upload Analytics</h2>
      <div className="kpis">
        <div><strong>{data.total}</strong> Total uploads</div>
        <div><strong>{data.published}</strong> Published</div>
        <div><strong>{data.failed}</strong> Failed</div>
        <div><strong>{data.pending}</strong> Pending</div>
        <div><strong>{(data.storage?.usage / (1024 * 1024)).toFixed(1)}MB</strong> Used ({data.storage?.percent}% of quota)</div>
      </div>
      <h3>Uploads</h3>
      <table>
        <thead>
          <tr><th>ID</th><th>Status</th><th>Created</th></tr>
        </thead>
        <tbody>
          {data.uploads.map(u => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.status}</td>
              <td>{u.createdAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3>Moderation Actions</h3>
      <pre>{JSON.stringify(data.moderation, null, 2)}</pre>
      <h3>Uploads Over Time</h3>
      <div style={{ maxWidth: 600 }}>
        <Line data={chartData} />
      </div>
      <h3>Growth Over Time (Opt-in Kids Only)</h3>
      <div style={{ maxWidth: 600 }}>
        <Line data={growthChartData} />
      </div>
      <div style={{ margin: '1em 0' }}>
        <CSVLink data={csvData} filename="uploads-analytics.csv" className="btn btn-primary">
          Export Uploads to CSV (Share with Parents/Mentors)
        </CSVLink>
      </div>
    </div>
  );
}

function getUploadsPerDay(uploads) {
  const counts = {};
  uploads.forEach(u => {
    const day = new Date(u.createdAt).toISOString().slice(0, 10);
    counts[day] = (counts[day] || 0) + 1;
  });
  const days = Object.keys(counts).sort();
  return {
    labels: days,
    data: days.map(d => counts[d])
  };
}

function getGrowthData(uploads) {
  // Only count published uploads for growth
  const counts = {};
  uploads.filter(u => u.status === 'published').forEach(u => {
    const day = new Date(u.createdAt).toISOString().slice(0, 10);
    counts[day] = (counts[day] || 0) + 1;
  });
  const days = Object.keys(counts).sort();
  let cumulative = 0;
  const growth = days.map(d => {
    cumulative += counts[d];
    return cumulative;
  });
  return { labels: days, data: growth };
}
