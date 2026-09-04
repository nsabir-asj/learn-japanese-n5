(() => {
  "use strict";

  const STORAGE_KEY = "kanaSprintSpeechV1";
  const supported = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
  let voices = [];
  let speechRun = 0;

  function normalize(value) {
    const source = value && typeof value === "object" ? value : {};
    return {
      version: 1,
      continueOnAdvance: typeof source.continueOnAdvance === "boolean" ? source.continueOnAdvance : false,
      rate: [.75, .85, 1].includes(Number(source.rate)) ? Number(source.rate) : .85,
      jaVoice: typeof source.jaVoice === "string" ? source.jaVoice : "",
      enVoice: typeof source.enVoice === "string" ? source.enVoice : ""
    };
  }

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved?.version === 1) return normalize(saved);
    } catch (error) {
      console.warn("Could not load speech preferences.", error);
    }
    return normalize({});
  }

  let preferences = load();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    window.dispatchEvent(new CustomEvent("kana-sprint-speech-changed", { detail: { ...preferences } }));
  }

  function voicesFor(language) {
    return voices.filter(voice => String(voice.lang || "").toLowerCase().startsWith(language));
  }

  function voiceKey(voice) { return voice.voiceURI || voice.name; }
  function matchesVoice(voice, saved) { return voiceKey(voice) === saved || voice.name === saved; }
  function selectedVoice(language) {
    const saved = language === "ja" ? preferences.jaVoice : preferences.enVoice;
    const available = voicesFor(language);
    return available.find(voice => matchesVoice(voice, saved)) || available.find(voice => voice.default) || available.find(voice => voice.localService) || available[0] || null;
  }

  function stop() {
    speechRun++;
    if (supported) window.speechSynthesis.cancel();
  }

  function utterance(text, language) {
    const item = new SpeechSynthesisUtterance(text);
    item.lang = language === "ja" ? "ja-JP" : "en-US";
    item.rate = preferences.rate;
    const voice = selectedVoice(language);
    if (voice) item.voice = voice;
    return item;
  }

  function speak(text, language, { cancel = true } = {}) {
    if (!supported || !voicesFor(language).length) return false;
    if (cancel) stop();
    window.speechSynthesis.speak(utterance(text, language));
    return true;
  }

  function fillSelect(select, language, emptyLabel) {
    const available = voicesFor(language);
    select.replaceChildren();
    if (!available.length) {
      const option = document.createElement("option");
      option.textContent = emptyLabel;
      select.appendChild(option);
      select.disabled = true;
      return;
    }
    select.disabled = false;
    available.forEach(voice => {
      const option = document.createElement("option");
      option.value = voiceKey(voice);
      option.textContent = `${voice.name} (${voice.localService ? "local" : "online"})`;
      select.appendChild(option);
    });
    const chosen = selectedVoice(language);
    select.value = voiceKey(chosen);
    if (language === "ja") preferences.jaVoice = select.value;
    else preferences.enVoice = select.value;
  }

  function bindSettings(root = document) {
    const status = root.querySelector("#globalSpeechStatus");
    const japanese = root.querySelector("#globalJapaneseVoice");
    const english = root.querySelector("#globalEnglishVoice");
    const rate = root.querySelector("#globalSpeechRate");
    const continueInput = root.querySelector("#globalSpeechContinue");
    if (!status || !japanese || !english || !rate || !continueInput) return;

    function render() {
      rate.value = String(preferences.rate);
      continueInput.checked = preferences.continueOnAdvance;
      status.classList.remove("ready", "unavailable");
      if (!supported) {
        status.classList.add("unavailable");
        status.innerHTML = "<strong>Speech is not supported</strong><span>This browser cannot use built-in pronunciation.</span>";
        [japanese, english, rate, continueInput].forEach(control => { control.disabled = true; });
        return;
      }
      fillSelect(japanese, "ja", "No Japanese voice found");
      fillSelect(english, "en", "No English voice found");
      const japaneseVoice = selectedVoice("ja");
      if (japaneseVoice) {
        status.classList.add("ready");
        status.innerHTML = `<strong>Japanese speech is ready</strong><span>${japaneseVoice.localService ? "The selected voice works locally and should work offline." : "The selected voice may require an internet connection."}</span>`;
      } else {
        status.classList.add("unavailable");
        status.innerHTML = `<strong>${voices.length ? "No Japanese voice found" : "Checking speech voices…"}</strong><span>${voices.length ? "Install a Japanese speech voice, then reopen the app." : "Waiting for the browser to report available voices."}</span>`;
      }
    }

    japanese.addEventListener("change", () => { preferences.jaVoice = japanese.value; save(); render(); });
    english.addEventListener("change", () => { preferences.enVoice = english.value; save(); render(); });
    rate.addEventListener("change", () => { preferences.rate = Number(rate.value); save(); });
    continueInput.addEventListener("change", () => { preferences.continueOnAdvance = continueInput.checked; save(); });
    root.querySelector("#testGlobalJapanese")?.addEventListener("click", () => speak("こんにちは。日本語をれんしゅうしましょう。", "ja"));
    root.querySelector("#testGlobalEnglish")?.addEventListener("click", () => speak("Your English pronunciation voice is ready.", "en"));
    window.addEventListener("kana-sprint-speech-voices-changed", render);
    render();
  }

  function refreshVoices() {
    voices = supported ? window.speechSynthesis.getVoices() : [];
    window.dispatchEvent(new CustomEvent("kana-sprint-speech-voices-changed", { detail: { japaneseAvailable: voicesFor("ja").length > 0 } }));
  }

  window.KANA_SPRINT_SPEECH = {
    bindSettings,
    getPreferences: () => ({ ...preferences }),
    hasJapaneseVoice: () => supported && voicesFor("ja").length > 0,
    isSupported: () => supported,
    openSettings: () => { location.href = "./settings.html#speech"; },
    speakEnglish: (text, options) => speak(text, "en", options),
    speakJapanese: (text, options) => speak(text, "ja", options),
    stop
  };

  refreshVoices();
  if (supported) window.speechSynthesis.addEventListener("voiceschanged", refreshVoices);
})();
