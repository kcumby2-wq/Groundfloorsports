// lib/metrics.js
let counters = {};

export function incMetric(name, labels = {}) {
  const key = name + JSON.stringify(labels);
  counters[key] = (counters[key] || 0) + 1;
}

export function getMetrics() {
  return Object.entries(counters)
    .map(([key, value]) => `# TYPE ${key} counter\n${key} ${value}`)
    .join('\n');
}
