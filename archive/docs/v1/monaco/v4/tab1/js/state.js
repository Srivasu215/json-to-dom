/**
 * Tab 1 (Supplier) — Centralized State & Channel Bus
 * Channel: BroadcastChannel ('keshavsoft-json-to-dom-v4')
 * Storage: localStorage ('keshavsoft_json_to_dom_v4_content')
 */

export const CHANNEL_NAME = 'keshavsoft-json-to-dom-v4';
export const STORAGE_KEY_CONTENT = 'keshavsoft_json_to_dom_v4_content';
export const STORAGE_KEY_META = 'keshavsoft_json_to_dom_v4_meta';

export const channel = new BroadcastChannel(CHANNEL_NAME);

let editorInstance = null;
export let renderWindow = null;

export const $ = (id) => document.getElementById(id);
export const pretty = (v) => typeof v === 'string' ? v : JSON.stringify(v, null, 2) + '\n';

export function getEditor() {
  return editorInstance;
}

export function setEditor(instance) {
  editorInstance = instance;
}

export function setRenderWindow(win) {
  renderWindow = win;
}

export function setStatus(text, isError = false) {
  const el = $('saveStatus');
  if (!el) return;
  el.textContent = text;
  el.className = isError
    ? 'status-badge error'
    : 'status-badge success';
  el.classList.remove('hidden');
  clearTimeout(setStatus._timer);
  setStatus._timer = setTimeout(() => el.classList.add('hidden'), 4000);
}

export function updateTab2Badge(text, isLive = true) {
  const badge = $('tab2SyncStatus');
  if (!badge) return;
  badge.classList.remove('hidden');
  if (isLive) {
    badge.className = 'sync-badge live';
    badge.innerHTML = `<span class="pulse-dot"></span><span>${text}</span>`;
  } else {
    badge.className = 'sync-badge standby';
    badge.innerHTML = `<span class="standby-dot"></span><span>${text}</span>`;
  }
}

/**
 * Beams the active editor JSON spec across the BroadcastChannel and saves to localStorage
 */
export function sendPayload() {
  const ed = getEditor();
  if (!ed) {
    setStatus('Editor instance not ready', true);
    return;
  }

  const rawJson = ed.getValue();
  if (!rawJson || !rawJson.trim()) {
    setStatus('Monaco editor is empty', true);
    return;
  }

  let spec;
  try {
    spec = JSON.parse(rawJson);
  } catch (err) {
    setStatus(`JSON Syntax error: ${err.message}`, true);
    return;
  }

  const formatted = pretty(spec);

  // 1. Persistent Storage
  try {
    localStorage.setItem(STORAGE_KEY_CONTENT, formatted);
    localStorage.setItem(STORAGE_KEY_META, JSON.stringify({
      timestamp: Date.now(),
      length: formatted.length
    }));
  } catch (err) {
    console.warn('[Storage Error]', err);
  }

  // 2. Real-time Channel Message
  channel.postMessage({
    type: 'RENDER_SPEC',
    spec: spec,
    content: formatted,
    timestamp: Date.now()
  });

  setStatus('Beamed to Tab 2: Playing Live HTML ✓');
}

/**
 * Opens Tab 2 in a dedicated browser window/tab
 */
export function openTab2() {
  const url = new URL('../tab2/index.html', location.href);
  const win = window.open(url.href, 'keshavsoft_json_to_dom_v4_tab2');
  if (!win) {
    setStatus('Popup blocked. Please allow popups for localhost.', true);
    return;
  }
  setRenderWindow(win);
  setStatus('Tab 2 opened in separate window');
}

/**
 * Triggers Tab 2 render, opening it if not already active
 */
export function playHtml() {
  if (!renderWindow || renderWindow.closed) {
    const url = new URL('../tab2/', location.href);
    const win = window.open(url.href, 'keshavsoft_json_to_dom_v4_tab2');
    if (!win) {
      setStatus('Popup blocked. Allow popups for localhost.', true);
      return;
    }
    setRenderWindow(win);
  } else {
    try {
      renderWindow.focus();
    } catch (_) {}
  }

  sendPayload();
}
