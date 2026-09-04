(() => {
  "use strict";

  const COMPLETE_FORMAT = "kana-sprint-complete-backup";
  const COMPONENT_FORMAT = "kana-sprint-component-backup";
  const STORES = {
    "hiragana-sprint-v3": { label: "Hiragana", version: 3 },
    "katakana-sprint-v1": { label: "Katakana", version: 1 },
    "kana-sprint-mix-v1": { label: "Kana Mix", version: 1 },
    kanaSprintVocabularyV1: { label: "Vocabulary", version: 1 },
    kanaSprintNumbersV1: { label: "Numbers", version: 1 },
    kanaSprintGuidedLessonsV1: { label: "Guided lessons", version: 1 },
    kanaSprintSpeechV1: { label: "Speech & voices", version: 1 }
  };
  const $ = selector => document.querySelector(selector);
  let stagedBackup = null;

  function readStore(key) {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return value && typeof value === "object" ? value : null;
    } catch {
      return null;
    }
  }

  function storedData() {
    return Object.fromEntries(Object.keys(STORES).map(key => [key, readStore(key)]).filter(([, value]) => value));
  }

  function summary(key, value) {
    if (!value) return "No saved data yet";
    if (key === "kanaSprintVocabularyV1") {
      const introduced = Object.values(value.items || {}).filter(item => item.introduced).length;
      return `${value.total || 0} answers · ${introduced} words introduced`;
    }
    if (key === "kanaSprintNumbersV1") {
      const patterns = Object.values(value.concepts || {}).filter(item => item.seen > 0).length;
      return `${value.total || 0} answers · ${patterns} patterns assessed`;
    }
    if (key === "kanaSprintGuidedLessonsV1") {
      const completed = Object.values(value.activities || {}).filter(item => item.completed).length;
      return `${value.total || 0} answers · ${completed} activities completed`;
    }
    if (key === "kanaSprintSpeechV1") return "Shared pronunciation preferences";
    const answers = value.stats?.answered ?? value.total ?? 0;
    const words = Object.values(value.wordItems || {}).filter(item => item.seen > 0).length;
    return `${answers} answers${words ? ` · ${words} words assessed` : ""}`;
  }

  function renderOverview() {
    $("#dataOverview").innerHTML = Object.entries(STORES).map(([key, definition]) => {
      return `<div class="data-overview-item"><strong>${definition.label}</strong><span>${summary(key, readStore(key))}</span></div>`;
    }).join("");
  }

  function download(payload, filename) {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  }

  function exportAll() {
    const stamp = new Date().toISOString().slice(0, 10);
    download({
      app: "Japanese N5 Practice",
      format: COMPLETE_FORMAT,
      formatVersion: 1,
      exportedAt: new Date().toISOString(),
      stores: storedData()
    }, `japanese-n5-complete-backup-${stamp}.json`);
    $("#backupStatus").textContent = "Complete backup exported successfully.";
  }

  function validateComplete(data) {
    if (!data || data.format !== COMPLETE_FORMAT || data.formatVersion !== 1 || !data.stores || typeof data.stores !== "object") {
      throw new Error("This is not a supported complete-backup file.");
    }
    const stores = {};
    Object.entries(data.stores).forEach(([key, value]) => {
      const definition = STORES[key];
      if (!definition || !value || typeof value !== "object") return;
      if (value.version !== definition.version) throw new Error(`${definition.label} uses an unsupported data version.`);
      stores[key] = value;
    });
    if (!Object.keys(stores).length) throw new Error("The backup contains no recognized app data.");
    return { ...data, stores };
  }

  function previewBackup(data) {
    const exported = new Date(data.exportedAt);
    const date = Number.isNaN(exported.getTime()) ? "Backup date unavailable" : `Exported ${exported.toLocaleString()}`;
    $("#backupStatus").innerHTML = `<strong>Ready to restore</strong><div class="tiny">${date}</div><ul>${Object.entries(data.stores).map(([key, value]) => `<li>${STORES[key].label}: ${summary(key, value)}</li>`).join("")}</ul><div class="tiny">Only the listed areas will be replaced.</div>`;
    $("#restoreBackup").classList.remove("hidden");
  }

  function prepareBackup(file) {
    stagedBackup = null;
    $("#restoreBackup").classList.add("hidden");
    const reader = new FileReader();
    reader.onload = () => {
      try {
        stagedBackup = validateComplete(JSON.parse(reader.result));
        previewBackup(stagedBackup);
      } catch (error) {
        $("#backupStatus").textContent = `Import failed: ${error.message}`;
      }
    };
    reader.onerror = () => { $("#backupStatus").textContent = "Import failed: the selected file could not be read."; };
    reader.readAsText(file);
  }

  function restoreBackup() {
    if (!stagedBackup) return;
    Object.entries(stagedBackup.stores).forEach(([key, value]) => localStorage.setItem(key, JSON.stringify(value)));
    $("#backupStatus").textContent = "Backup restored successfully.";
    $("#restoreBackup").classList.add("hidden");
    stagedBackup = null;
    renderOverview();
    setTimeout(() => location.reload(), 350);
  }

  function exportComponent() {
    const key = $("#componentStore").value;
    const value = readStore(key);
    if (!value) {
      $("#componentStatus").textContent = `${STORES[key].label} has no saved data to export.`;
      return;
    }
    const stamp = new Date().toISOString().slice(0, 10);
    download({ format: COMPONENT_FORMAT, formatVersion: 1, exportedAt: new Date().toISOString(), storageKey: key, state: value }, `${key}-${stamp}.json`);
    $("#componentStatus").textContent = `${STORES[key].label} exported successfully.`;
  }

  function importComponent(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        const wrapped = data?.format === COMPONENT_FORMAT && data.formatVersion === 1;
        const storageKey = wrapped ? data.storageKey : $("#componentStore").value;
        const state = wrapped ? data.state : data?.state || data;
        if (!STORES[storageKey] || !state || typeof state !== "object") throw new Error("This is not a supported component-backup file.");
        const definition = STORES[storageKey];
        if (state.version !== definition.version) throw new Error(`${definition.label} uses an unsupported data version.`);
        localStorage.setItem(storageKey, JSON.stringify(state));
        $("#componentStore").value = storageKey;
        $("#componentStatus").textContent = `${definition.label} restored successfully.`;
        renderOverview();
        if (storageKey === "kanaSprintSpeechV1") setTimeout(() => location.reload(), 350);
      } catch (error) {
        $("#componentStatus").textContent = `Import failed: ${error.message}`;
      }
    };
    reader.readAsText(file);
  }

  function resetComponent() {
    const key = $("#componentStore").value;
    const label = STORES[key].label;
    if (!confirm(`Reset ${label} data on this device? This cannot be undone.`)) return;
    localStorage.removeItem(key);
    $("#componentStatus").textContent = `${label} data was reset.`;
    renderOverview();
  }

  function resetAll() {
    if (!confirm("Reset all Japanese N5 Practice progress and settings on this device? This cannot be undone.")) return;
    Object.keys(STORES).forEach(key => localStorage.removeItem(key));
    $("#resetStatus").textContent = "All app progress and settings were reset.";
    renderOverview();
    setTimeout(() => location.reload(), 350);
  }

  window.KANA_SPRINT_SPEECH?.bindSettings(document);
  renderOverview();
  $("#exportAll").addEventListener("click", exportAll);
  $("#chooseBackup").addEventListener("click", () => $("#backupFile").click());
  $("#backupFile").addEventListener("change", event => { if (event.target.files?.[0]) prepareBackup(event.target.files[0]); event.target.value = ""; });
  $("#restoreBackup").addEventListener("click", restoreBackup);
  $("#exportComponent").addEventListener("click", exportComponent);
  $("#chooseComponent").addEventListener("click", () => $("#componentFile").click());
  $("#componentFile").addEventListener("change", event => { if (event.target.files?.[0]) importComponent(event.target.files[0]); event.target.value = ""; });
  $("#resetComponent").addEventListener("click", resetComponent);
  $("#resetAll").addEventListener("click", resetAll);
})();
