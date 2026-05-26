# Subjectreport Staff Tools - Claude Review Packet (JS-Focused)

## Goal
Review only the operational JavaScript logic for the Staff Tools workflow (not visual CSS), and recommend high-impact improvements.

## Runtime Context
- App type: static HTML pages opened via file://
- Persistence: localStorage
- Data workflow: import CSV -> edit athlete rows -> validate -> export CSV (single or grouped by date)
- Main pages:
  - `staff-tools.html` (landing + printable checklist)
  - `combine-clinic-template.html` (core builder logic)

## Focus Areas Requested
1. UX clarity and speed for staff on mobile and desktop
2. Data integrity and validation robustness
3. CSV compatibility and edge-case handling
4. Performance and maintainability
5. Security/privacy risks (localStorage and file import/export)
6. Accessibility and keyboard-only operation

## JS: staff-tools.html (print checklist logic)
```javascript
(() => {
  const printBtn = document.getElementById("printChecklistBtn");
  if (!printBtn) return;
  printBtn.addEventListener("click", () => window.print());
})();
```

## JS: combine-clinic-template.html (core logic)
```javascript
(() => {
  const headers = [
    "Jersey #",
    "First Name",
    "Last Name",
    "Position",
    "Email",
    "Phone",
    "Class/Yr",
    "Height",
    "Weight",
    "State/Province",
    "School/Team",
    "Rec Team",
    "Instagram",
    "X (Twitter)",
    "TikTok",
    "Video Url",
    "Package",
    "Status",
    "Grade",
    "Transcript",
    "Notes"
  ];

  const keys = [
    "rowEventDate",
    "jersey",
    "firstName",
    "lastName",
    "position",
    "email",
    "phone",
    "classYear",
    "height",
    "weight",
    "stateProvince",
    "schoolTeam",
    "recTeam",
    "instagram",
    "twitterX",
    "tiktok",
    "videoUrl",
    "package",
    "status",
    "grade",
    "transcript",
    "notes"
  ];

  const rowsBody = document.getElementById("rowsBody");
  const rowCount = document.getElementById("rowCount");
  const exportHistoryList = document.getElementById("exportHistoryList");
  const exportSuccessPanel = document.getElementById("exportSuccessPanel");
  const exportSuccessMeta = document.getElementById("exportSuccessMeta");
  const redownloadLastBtn = document.getElementById("redownloadLastBtn");
  const exportHistoryKey = "sr_export_history_v1";
  const draftKey = "sr_builder_draft_v1";
  const requiredFields = ["firstName", "lastName", "position", "classYear", "schoolTeam"];

  const persistedFieldIds = [
    "eventSeries",
    "eventType",
    "eventDate",
    "eventLocation",
    "eventEvaluator",
    "appendContextToNotes",
    "structuredContextFormat",
    "validateEmailFormat",
    "validateUrlFormat"
  ];

  function collectCurrentRows() {
    return Array.from(rowsBody.querySelectorAll("tr")).map((tr) => rowValuesFromElement(tr));
  }

  function saveDraftState() {
    const fields = {};
    persistedFieldIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      if (el.type === "checkbox") {
        fields[id] = Boolean(el.checked);
      } else {
        fields[id] = String(el.value || "");
      }
    });

    const payload = {
      fields,
      rows: collectCurrentRows(),
      at: Date.now()
    };

    localStorage.setItem(draftKey, JSON.stringify(payload));
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
        if (el.type === "checkbox") {
          el.checked = Boolean(fields[id]);
        } else {
          el.value = String(fields[id] || "");
        }
      });

      const rows = Array.isArray(draft.rows) ? draft.rows : [];
      rowsBody.innerHTML = "";
      rows.forEach((rowData) => appendRow(rowData));

      if (!rows.length) {
        appendRow();
      }

      return true;
    } catch (err) {
      return false;
    }
  }

  function clearDraftState() {
    localStorage.removeItem(draftKey);
  }

  function loadExportHistory() {
    try {
      const raw = localStorage.getItem(exportHistoryKey);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      return [];
    }
  }

  function saveExportHistory(entries) {
    localStorage.setItem(exportHistoryKey, JSON.stringify(entries.slice(0, 12)));
  }

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

  function showExportSuccess(entry) {
    if (!entry || !entry.filename) {
      exportSuccessPanel.style.display = "none";
      return;
    }

    const when = new Date(entry.at).toLocaleString();
    exportSuccessMeta.textContent = `${entry.filename} · ${entry.mode} · ${when}`;
    exportSuccessPanel.style.display = "grid";
    redownloadLastBtn.disabled = !entry.csv;
  }

  function renderExportHistory() {
    const entries = loadExportHistory();
    if (!entries.length) {
      exportHistoryList.innerHTML = '<li class="history-empty">No exports yet. Download a CSV to populate history.</li>';
      return;
    }

    exportHistoryList.innerHTML = entries
      .map((entry) => {
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
      })
      .join("");

    showExportSuccess(entries[0] || null);
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

  function downloadSavedEntryById(entryId) {
    const entries = loadExportHistory();
    const entry = entries.find((item) => item.id === entryId);
    if (!entry || !entry.csv) {
      alert("This export is no longer available for re-download.");
      return;
    }
    downloadCsvFile(entry.csv, entry.filename, `${entry.mode}-redownload`, false);
  }

  function eventSummaryText() {
    const series = document.getElementById("eventSeries").value.trim();
    const type = document.getElementById("eventType").value.trim();
    const date = document.getElementById("eventDate").value.trim();
    const location = document.getElementById("eventLocation").value.trim();
    const evaluator = document.getElementById("eventEvaluator").value.trim();

    const parts = [];
    if (type) parts.push(`Type: ${type}`);
    if (series) parts.push(`Series: ${series}`);
    if (date) parts.push(`Date: ${date}`);
    if (location) parts.push(`Location: ${location}`);
    if (evaluator) parts.push(`Evaluator: ${evaluator}`);
    if (!parts.length) return "";

    if (isStructuredContextFormat()) {
      return ["Event Context", ...parts.map((part) => `- ${part}`)].join("\n");
    }

    return `Event Context - ${parts.join(" | ")}`;
  }

  function shouldAppendContextToNotes() {
    const checkbox = document.getElementById("appendContextToNotes");
    return Boolean(checkbox && checkbox.checked);
  }

  function isStructuredContextFormat() {
    const checkbox = document.getElementById("structuredContextFormat");
    return Boolean(checkbox && checkbox.checked);
  }

  function appendSummaryToNotes(existingNotes, summary) {
    if (!summary) return existingNotes;
    if (!existingNotes) return summary;
    const joiner = isStructuredContextFormat() ? "\n" : " | ";
    return `${existingNotes}${joiner}${summary}`;
  }

  function updateRowCount() {
    rowCount.textContent = `${rowsBody.querySelectorAll("tr").length} rows`;
  }

  function createTextCell(key, value) {
    const td = document.createElement("td");
    const input = document.createElement("input");
    input.type = "text";
    input.value = value || "";
    input.dataset.key = key;
    td.appendChild(input);
    return td;
  }

  function createDateCell(key, value) {
    const td = document.createElement("td");
    const input = document.createElement("input");
    input.type = "date";
    input.value = value || "";
    input.dataset.key = key;
    td.appendChild(input);
    return td;
  }

  function createNotesCell(value) {
    const td = document.createElement("td");
    const area = document.createElement("textarea");
    area.value = value || "";
    area.dataset.key = "notes";
    td.appendChild(area);
    return td;
  }

  function rowValuesFromElement(tr) {
    const data = {};
    tr.querySelectorAll("[data-key]").forEach((el) => {
      data[el.dataset.key] = String(el.value || "").trim();
    });
    return data;
  }

  function rowIsEmpty(data) {
    return keys.every((key) => !String(data[key] || "").trim());
  }

  function renderRowIndexing() {
    rowsBody.querySelectorAll("tr").forEach((tr, idx) => {
      const cell = tr.querySelector(".row-index");
      if (cell) cell.textContent = String(idx + 1);
    });
  }

  function appendRow(seed = {}) {
    const tr = document.createElement("tr");

    const idxCell = document.createElement("td");
    idxCell.className = "row-actions row-index";
    idxCell.textContent = "1";
    tr.appendChild(idxCell);

    keys.forEach((key) => {
      if (key === "rowEventDate") {
        tr.appendChild(createDateCell(key, seed[key] || ""));
      } else if (key === "notes") {
        tr.appendChild(createNotesCell(seed[key] || ""));
      } else {
        tr.appendChild(createTextCell(key, seed[key] || ""));
      }
    });

    const removeCell = document.createElement("td");
    removeCell.className = "row-actions";
    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "tiny";
    removeBtn.textContent = "Delete";
    removeBtn.addEventListener("click", () => {
      tr.remove();
      renderRowIndexing();
      updateRowCount();
    });
    removeCell.appendChild(removeBtn);
    tr.appendChild(removeCell);

    rowsBody.appendChild(tr);
    renderRowIndexing();
    updateRowCount();
  }

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

  function exportCsv() {
    const validation = validateRowsForExport();
    if (!validation.hasAnyData) {
      alert("Add at least one athlete row before downloading CSV.");
      return;
    }
    if (validation.invalidRows.length) {
      const rowList = validation.invalidRows.map((row) => row.index).join(", ");
      const hasRequiredIssues = validation.invalidRows.some((row) => row.missing.length);
      const hasFormatIssues = validation.invalidRows.some((row) => row.formatErrors.length);
      const issueParts = [];
      if (hasRequiredIssues) issueParts.push("required fields");
      if (hasFormatIssues) issueParts.push("email/url format");
      alert(`Fix ${issueParts.join(" and ")} in row(s): ${rowList}.`);
      return;
    }

    const summary = eventSummaryText();
    const rows = [];

    rowsBody.querySelectorAll("tr").forEach((tr) => {
      const data = rowValuesFromElement(tr);
      if (rowIsEmpty(data)) return;

      if (summary && shouldAppendContextToNotes()) {
        data.notes = appendSummaryToNotes(data.notes, summary);
      }

      const row = [
        data.jersey,
        data.firstName,
        data.lastName,
        data.position,
        data.email,
        data.phone,
        data.classYear,
        data.height,
        data.weight,
        data.stateProvince,
        data.schoolTeam,
        data.recTeam,
        data.instagram,
        data.twitterX,
        data.tiktok,
        data.videoUrl,
        data.package,
        data.status,
        data.grade,
        data.transcript,
        data.notes
      ];

      rows.push(row);
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

  function exportCsvByDate() {
    const validation = validateRowsForExport();
    if (!validation.hasAnyData) {
      alert("Add at least one athlete row before downloading CSV.");
      return;
    }
    if (validation.invalidRows.length) {
      const rowList = validation.invalidRows.map((row) => row.index).join(", ");
      const hasRequiredIssues = validation.invalidRows.some((row) => row.missing.length);
      const hasFormatIssues = validation.invalidRows.some((row) => row.formatErrors.length);
      const issueParts = [];
      if (hasRequiredIssues) issueParts.push("required fields");
      if (hasFormatIssues) issueParts.push("email/url format");
      alert(`Fix ${issueParts.join(" and ")} in row(s): ${rowList}.`);
      return;
    }

    const globalDate = document.getElementById("eventDate").value.trim();
    const groups = {};

    rowsBody.querySelectorAll("tr").forEach((tr) => {
      const data = rowValuesFromElement(tr);
      if (rowIsEmpty(data)) return;

      const eventDate = (data.rowEventDate || globalDate || "undated").trim();
      if (!groups[eventDate]) groups[eventDate] = [];

      const summaryParts = [];
      const type = document.getElementById("eventType").value.trim();
      const series = document.getElementById("eventSeries").value.trim();
      const location = document.getElementById("eventLocation").value.trim();
      const evaluator = document.getElementById("eventEvaluator").value.trim();

      if (type) summaryParts.push(`Type: ${type}`);
      if (series) summaryParts.push(`Series: ${series}`);
      if (eventDate && eventDate !== "undated") summaryParts.push(`Date: ${eventDate}`);
      if (location) summaryParts.push(`Location: ${location}`);
      if (evaluator) summaryParts.push(`Evaluator: ${evaluator}`);

      let summary = "";
      if (summaryParts.length) {
        summary = isStructuredContextFormat()
          ? ["Event Context", ...summaryParts.map((part) => `- ${part}`)].join("\n")
          : `Event Context - ${summaryParts.join(" | ")}`;
      }
      if (summary && shouldAppendContextToNotes()) {
        data.notes = appendSummaryToNotes(data.notes, summary);
      }

      const row = [
        data.jersey,
        data.firstName,
        data.lastName,
        data.position,
        data.email,
        data.phone,
        data.classYear,
        data.height,
        data.weight,
        data.stateProvince,
        data.schoolTeam,
        data.recTeam,
        data.instagram,
        data.twitterX,
        data.tiktok,
        data.videoUrl,
        data.package,
        data.status,
        data.grade,
        data.transcript,
        data.notes
      ];

      groups[eventDate].push(row);
    });

    const dates = Object.keys(groups);

    const seriesSlug = document.getElementById("eventSeries").value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "series";
    const typeSlug = document.getElementById("eventType").value.trim().toLowerCase() || "event";

    dates.forEach((dateKey, index) => {
      const csv = [
        headers.map(csvEscape).join(","),
        ...groups[dateKey].map((row) => row.map(csvEscape).join(","))
      ].join("\n");

      const safeDate = dateKey === "undated" ? "undated" : dateKey;
      const filename = `subjectreport-${typeSlug}-${seriesSlug}-${safeDate}.csv`;
      setTimeout(() => downloadCsvFile(csv, filename, "by-date"), index * 150);
    });

    alert(`Downloaded ${dates.length} CSV file(s), grouped by event date.`);
  }

  function loadSampleRows() {
    const sample = [
      {
        rowEventDate: "2026-05-22",
        jersey: "7",
        firstName: "Jayden",
        lastName: "Carter",
        position: "QB",
        email: "jayden.carter@email.com",
        phone: "555-0101",
        classYear: "2027",
        height: "6'1\"",
        weight: "188",
        stateProvince: "TX",
        schoolTeam: "Southlake Carroll",
        recTeam: "North DFW Elite",
        instagram: "@jay7carter",
        twitterX: "@jay7carter",
        tiktok: "@jay7carter",
        videoUrl: "https://hudl.com/video/3/123/456",
        package: "Transcript",
        status: "Prospect",
        grade: "A-",
        transcript: "Pending",
        notes: "Strong deep ball, improving pocket movement"
      },
      {
        rowEventDate: "2026-05-22",
        jersey: "18",
        firstName: "Kai",
        lastName: "Howard",
        position: "WR",
        email: "kai.howard@email.com",
        phone: "555-0102",
        classYear: "2028",
        height: "5'11\"",
        weight: "172",
        stateProvince: "TX",
        schoolTeam: "Keller",
        recTeam: "Texas Air 7v7",
        instagram: "@kaihoward18",
        twitterX: "@kaihoward18",
        tiktok: "",
        videoUrl: "https://hudl.com/video/3/999/123",
        package: "Program",
        status: "Evaluating",
        grade: "B+",
        transcript: "In Progress",
        notes: "Top-end acceleration and route tempo"
      },
      {
        rowEventDate: "2026-05-23",
        jersey: "44",
        firstName: "Mason",
        lastName: "Knox",
        position: "LB",
        email: "mason.knox@email.com",
        phone: "555-0103",
        classYear: "2027",
        height: "6'0\"",
        weight: "210",
        stateProvince: "TX",
        schoolTeam: "Keller",
        recTeam: "Keller Elite",
        instagram: "@masonknox44",
        twitterX: "@masonknox44",
        tiktok: "",
        videoUrl: "https://hudl.com/video/3/888/321",
        package: "Transcript",
        status: "Prospect",
        grade: "B",
        transcript: "Pending",
        notes: "Pursuit angle consistency improved"
      }
    ];

    sample.forEach((row) => appendRow(row));
  }

  document.getElementById("addRowBtn").addEventListener("click", () => appendRow());
  document.getElementById("downloadCsvBtn").addEventListener("click", exportCsv);
  document.getElementById("downloadByDateBtn").addEventListener("click", exportCsvByDate);
  document.getElementById("loadSampleBtn").addEventListener("click", loadSampleRows);
  document.getElementById("importCsvBtn").addEventListener("click", () => {
    document.getElementById("importCsvInput").click();
  });

  document.getElementById("importCsvInput").addEventListener("change", async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const text = await file.text();
    const importedRows = parseCsv(text);
    if (!importedRows.length) {
      alert("No valid athlete rows found in this CSV.");
      event.target.value = "";
      return;
    }

    const existingRows = rowsBody.querySelectorAll("tr").length;
    if (existingRows > 0) {
      const replace = confirm("Replace current rows with imported CSV rows? Click Cancel to append instead.");
      if (replace) rowsBody.innerHTML = "";
    }

    importedRows.forEach((rowData) => appendRow(rowData));
    alert(`Imported ${importedRows.length} row(s) from ${file.name}.`);
    event.target.value = "";
  });

  document.getElementById("clearRowsBtn").addEventListener("click", () => {
    if (!confirm("Clear all athlete rows?")) return;
    rowsBody.innerHTML = "";
    updateRowCount();
    saveDraftState();
  });

  document.getElementById("clearHistoryBtn").addEventListener("click", () => {
    if (!confirm("Clear export history?")) return;
    saveExportHistory([]);
    renderExportHistory();
  });

  exportHistoryList.addEventListener("click", (event) => {
    const target = event.target.closest("[data-history-download]");
    if (!target) return;
    downloadSavedEntryById(target.dataset.historyDownload);
  });

  redownloadLastBtn.addEventListener("click", () => {
    const entries = loadExportHistory();
    if (!entries.length || !entries[0].id) {
      alert("No recent export available.");
      return;
    }
    downloadSavedEntryById(entries[0].id);
  });

  document.addEventListener("input", (event) => {
    if (!event.target.closest(".wrap")) return;
    if (event.target.matches("[data-key]")) {
      event.target.classList.remove("invalid-field");
      const row = event.target.closest("tr");
      if (row) {
        const hasInvalid = row.querySelector(".invalid-field");
        if (!hasInvalid) row.classList.remove("invalid-row");
      }
    }
    saveDraftState();
  });

  document.addEventListener("change", (event) => {
    if (!event.target.closest(".wrap")) return;
    saveDraftState();
  });

  const restored = loadDraftState();
  if (!restored) {
    appendRow();
    saveDraftState();
  }

  window.addEventListener("beforeunload", saveDraftState);

  document.getElementById("clearRowsBtn").addEventListener("dblclick", () => {
    clearDraftState();
  });

  renderExportHistory();
})();
```

## Prompt To Paste With This Packet
Use this exact prompt in Claude:

```text
I built a static Staff Tools workflow for event-day athlete intake and CSV export.
Please review this JS-focused packet and tell me what would make it stronger in:
1. UX clarity and speed for staff on mobile and desktop
2. Data integrity and validation robustness
3. CSV compatibility and edge-case handling
4. Performance and maintainability
5. Security/privacy risks (localStorage and file import/export)
6. Accessibility and keyboard-only operation

Please return:
1. Top 10 improvements ranked by impact
2. Quick wins under 30 minutes
3. Medium improvements (1-3 hours)
4. Any risky refactors to avoid right now
5. Concrete code-level suggestions for the top 3 items
```
