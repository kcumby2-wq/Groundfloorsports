// scripts/anomalyDetection.js
// Dummy: In production, analyze real audit logs from DB or log store
function fetchAuditLogs() {
  return [
    { timestamp: new Date().toISOString(), action: 'upload_attempt', details: { userId: 'user2' } },
    { timestamp: new Date().toISOString(), action: 'upload_attempt', details: { userId: 'user2' } },
    { timestamp: new Date().toISOString(), action: 'upload_attempt', details: { userId: 'user2' } },
    { timestamp: new Date().toISOString(), action: 'creator_approved', details: { userId: 'user1' } }
  ];
}

function detectAnomalies(logs) {
  // Example: flag >2 upload attempts in 1 hour by same user
  const attempts = {};
  logs.forEach(l => {
    if (l.action === 'upload_attempt') {
      const id = l.details.userId;
      attempts[id] = (attempts[id] || 0) + 1;
    }
  });
  return Object.entries(attempts).filter(([id, count]) => count > 2).map(([id]) => id);
}

function main() {
  const logs = fetchAuditLogs();
  const anomalies = detectAnomalies(logs);
  if (anomalies.length) {
    console.log('Anomalies detected for users:', anomalies);
    // TODO: Send alert (email, Slack, etc.)
  } else {
    console.log('No anomalies detected.');
  }
}

main();
