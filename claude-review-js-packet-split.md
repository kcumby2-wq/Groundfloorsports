# Subjectreport CSV Builder - Split JS Review Packet

## Scope
This packet isolates the CSV builder JavaScript into 3 logical modules for focused review.

- Source page: combine-clinic-template.html
- Runtime: static file:// page
- Storage: localStorage

## Module 1 - Validation Engine
```javascript
const requiredFields = ["firstName", "lastName", "position", "classYear", "schoolTeam"];

function clearValidationMarks() {
  rowsBody.querySelectorAll("tr").forEach((tr) => tr.classList.remove("invalid-row"));
  rowsBody.querySelectorAll(".invalid-field").forEach((el) => {
    el.classList.remove("invalid-field");
    el.removeAttribute("title");
  });
}

function validateRowsForExport() {
  clearValidationMarks();

  const invalidRows = [];
  let hasAnyData = false;
  const strictEmail = Boolean(document.getElementById("validateEmailFormat")?.checked);
  const strictUrl = Boolean(document.getElementById("validateUrlFormat")?.checked);
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  rowsBody.querySelectorAll("tr").forEach((tr, index) => {
    const data = rowValuesFromElement(tr);
    if (rowIsEmpty(data)) return;

    hasAnyData = true;
    const missing = [];
    const formatErrors = [];

    requiredFields.forEach((key) => {
      if (String(data[key] || "").trim()) return;
      missing.push(key);
      const input = tr.querySelector(`[data-key="${key}"]`);
      if (input) {
        input.classList.add("invalid-field");
        input.title = "Required for export";
      }
    });

    if (strictEmail && data.email) {
      const isValidEmail = emailPattern.test(String(data.email).trim());
      if (!isValidEmail) {
        formatErrors.push("email");
        const emailInput = tr.querySelector('[data-key="email"]');
        if (emailInput) {
          emailInput.classList.add("invalid-field");
          emailInput.title = "Invalid email format";
        }
      }
    }

    if (strictUrl && data.videoUrl) {
      let isValidUrl = true;
      try {
        const parsed = new URL(String(data.videoUrl).trim());
        isValidUrl = parsed.protocol === "http:" || parsed.protocol === "https:";
      } catch (err) {
        isValidUrl = false;
      }

      if (!isValidUrl) {
        formatErrors.push("videoUrl");
        const urlInput = tr.querySelector('[data-key="videoUrl"]');
        if (urlInput) {
          urlInput.classList.add("invalid-field");
          urlInput.title = "Invalid URL format";
        }
      }
    }

    if (missing.length || formatErrors.length) {
      tr.classList.add("invalid-row");
      invalidRows.push({ index: index + 1, missing, formatErrors });
    }
  });

  return { hasAnyData, invalidRows };
}
```

## Module 2 - CSV Import/Export Engine
```javascript
function csvEscape(value) {
  const raw = String(value == null ? "" : value);
  const escaped = raw.replace(/"/g, '""');
  return `"${escaped}"`;
}

function normalizeHeader(value) {
  return String(value || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i += 1;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(cell);
      cell = "";
    } else if (ch === '\n') {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (ch !== '\r') {
      cell += ch;
    }
  }

  if (cell.length || row.length) {
    row.push(cell);
    rows.push(row);
  }

  if (!rows.length) return [];

  const headersRaw = rows[0].map((h) => String(h || "").trim());
  const normalizedHeaders = headersRaw.map(normalizeHeader);

  const map = {
    jersey: ["jersey", "jerseynumber"],
    firstName: ["firstname", "first"],
    lastName: ["lastname", "last"],
    position: ["position", "pos"],
    email: ["email"],
    phone: ["phone"],
    classYear: ["classyr", "classyear", "class"],
    height: ["height", "ht"],
    weight: ["weight", "wt"],
    stateProvince: ["stateprovince", "state", "province"],
    schoolTeam: ["schoolteam", "school", "team"],
    recTeam: ["recteam", "recruitteam"],
    instagram: ["instagram", "ig"],
    twitterX: ["xtwitter", "x", "twitter"],
    tiktok: ["tiktok"],
    videoUrl: ["videourl", "video", "videolink", "url"],
    package: ["package"],
    status: ["status"],
    grade: ["grade"],
    transcript: ["transcript"],
    notes: ["notes", "note"]
  };

  function getValue(record, aliases) {
    for (let i = 0; i < aliases.length; i += 1) {
      const idx = normalizedHeaders.indexOf(aliases[i]);
      if (idx >= 0) return String(record[idx] || "").trim();
    }
    return "";
  }

  return rows
    .slice(1)
    .map((record) => ({
      rowEventDate: "",
      jersey: getValue(record, map.jersey),
      firstName: getValue(record, map.firstName),
      lastName: getValue(record, map.lastName),
      position: getValue(record, map.position),
      email: getValue(record, map.email),
      phone: getValue(record, map.phone),
      classYear: getValue(record, map.classYear),
      height: getValue(record, map.height),
      weight: getValue(record, map.weight),
      stateProvince: getValue(record, map.stateProvince),
      schoolTeam: getValue(record, map.schoolTeam),
      recTeam: getValue(record, map.recTeam),
      instagram: getValue(record, map.instagram),
      twitterX: getValue(record, map.twitterX),
      tiktok: getValue(record, map.tiktok),
      videoUrl: getValue(record, map.videoUrl),
      package: getValue(record, map.package),
      status: getValue(record, map.status),
      grade: getValue(record, map.grade),
      transcript: getValue(record, map.transcript),
      notes: getValue(record, map.notes)
    }))
    .map((rowData) => {
      const match = rowData.notes.match(/Date:\s*(\d{4}-\d{2}-\d{2})/i);
      if (match) rowData.rowEventDate = match[1];
      return rowData;
    })
    .filter((rowData) => !rowIsEmpty(rowData));
}

function downloadCsvFile(csv, filename, mode, shouldRecord = true) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  if (shouldRecord) {
    recordExport(filename, mode || "single", csv);
  }
}

function exportCsv() {
  const validation = validateRowsForExport();
  if (!validation.hasAnyData) return alert("Add at least one athlete row before downloading CSV.");
  if (validation.invalidRows.length) {
    const rowList = validation.invalidRows.map((row) => row.index).join(", ");
    const hasRequiredIssues = validation.invalidRows.some((row) => row.missing.length);
    const hasFormatIssues = validation.invalidRows.some((row) => row.formatErrors.length);
    const issueParts = [];
    if (hasRequiredIssues) issueParts.push("required fields");
    if (hasFormatIssues) issueParts.push("email/url format");
    return alert(`Fix ${issueParts.join(" and ")} in row(s): ${rowList}.`);
  }

  const summary = eventSummaryText();
  const rows = [];

  rowsBody.querySelectorAll("tr").forEach((tr) => {
    const data = rowValuesFromElement(tr);
    if (rowIsEmpty(data)) return;
    if (summary && shouldAppendContextToNotes()) data.notes = appendSummaryToNotes(data.notes, summary);

    rows.push([
      data.jersey, data.firstName, data.lastName, data.position, data.email, data.phone,
      data.classYear, data.height, data.weight, data.stateProvince, data.schoolTeam,
      data.recTeam, data.instagram, data.twitterX, data.tiktok, data.videoUrl,
      data.package, data.status, data.grade, data.transcript, data.notes
    ]);
  });

  const csv = [
    headers.map(csvEscape).join(","),
    ...rows.map((row) => row.map(csvEscape).join(","))
  ].join("\n");

  const series = document.getElementById("eventSeries").value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const type = document.getElementById("eventType").value.trim().toLowerCase() || "event";
  const date = document.getElementById("eventDate").value.trim() || new Date().toISOString().slice(0, 10);
  const base = ["subjectreport", type, series || "series", date].join("-");

  downloadCsvFile(csv, `${base}.csv`, "single");
}
```

## Module 3 - Persistence and History
```javascript
const exportHistoryKey = "sr_export_history_v1";
const draftKey = "sr_builder_draft_v1";
const persistedFieldIds = [
  "eventSeries", "eventType", "eventDate", "eventLocation", "eventEvaluator",
  "appendContextToNotes", "structuredContextFormat", "validateEmailFormat", "validateUrlFormat"
];

function collectCurrentRows() {
  return Array.from(rowsBody.querySelectorAll("tr")).map((tr) => rowValuesFromElement(tr));
}

function saveDraftState() {
  const fields = {};
  persistedFieldIds.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    fields[id] = el.type === "checkbox" ? Boolean(el.checked) : String(el.value || "");
  });

  localStorage.setItem(draftKey, JSON.stringify({
    fields,
    rows: collectCurrentRows(),
    at: Date.now()
  }));
}

function loadDraftState() {
  try {
    const raw = localStorage.getItem(draftKey);
    if (!raw) return false;
    const draft = JSON.parse(raw);
    if (!draft || typeof draft !== "object") return false;

    const fields = draft.fields || {};
    persistedFieldIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el || !(id in fields)) return;
      if (el.type === "checkbox") el.checked = Boolean(fields[id]);
      else el.value = String(fields[id] || "");
    });

    const rows = Array.isArray(draft.rows) ? draft.rows : [];
    rowsBody.innerHTML = "";
    rows.forEach((rowData) => appendRow(rowData));
    if (!rows.length) appendRow();

    return true;
  } catch {
    return false;
  }
}

function loadExportHistory() {
  try {
    const raw = localStorage.getItem(exportHistoryKey);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveExportHistory(entries) {
  localStorage.setItem(exportHistoryKey, JSON.stringify(entries.slice(0, 12)));
}

function recordExport(filename, mode, csv) {
  const entries = loadExportHistory();
  const safeCsv = typeof csv === "string" && csv.length <= 220000 ? csv : "";
  entries.unshift({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    filename,
    mode,
    at: Date.now(),
    csv: safeCsv
  });
  saveExportHistory(entries);
  renderExportHistory();
}

function renderExportHistory() {
  const entries = loadExportHistory();
  if (!entries.length) {
    exportHistoryList.innerHTML = '<li class="history-empty">No exports yet. Download a CSV to populate history.</li>';
    return;
  }

  exportHistoryList.innerHTML = entries.map((entry) => {
    const when = new Date(entry.at).toLocaleString();
    return `
      <li class="history-item">
        <div class="history-row">
          <div class="history-name">${entry.filename}</div>
          <button class="history-download" type="button" data-history-download="${entry.id}" ${entry.csv ? "" : "disabled"}>Re-download</button>
        </div>
        <div class="history-meta">${entry.mode} · ${when}</div>
      </li>
    `;
  }).join("");

  showExportSuccess(entries[0] || null);
}
```

## Prompt To Paste Into Claude
```text
Review these 3 JS modules from a static CSV builder.
Rank the top improvements by impact and include concrete implementation suggestions.

Focus on:
1) validation architecture and false positives/negatives
2) CSV parsing/export correctness under malformed and large inputs
3) localStorage reliability and data-loss scenarios
4) accessibility + keyboard workflows for error recovery
5) maintainability boundaries between module responsibilities

Return:
1. Top 10 recommendations by impact
2. Quick wins (<30 min)
3. Medium changes (1-3 hrs)
4. Risky refactors to defer
5. Code-level diffs for your top 3 recommendations
```
