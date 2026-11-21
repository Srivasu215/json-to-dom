import { initTopbar } from './topbar/js/index.js';
import { initLeftWorkspace } from './components/left/js/index.js';
import { initRightEditor } from './components/right/js/index.js';
import {
  channel,
  setEditor,
  openTab2,
  playHtml,
  updateTab2Badge,
  setStatus,
  sendPayload
} from './js/state.js';

async function boot() {
  try {
    let spec = window.ks?.declarative?.spec?.data;
    if (!spec) {
      try {
        const mod = await import('https://keshavsoft.github.io/declarative-spec/dist/v2/min.js');
        spec = mod.spec || mod.default || window.ks?.declarative?.spec?.data;
      } catch (_) {
        const mod = await import('https://keshavsoft.github.io/declarative-spec/docs/dist/v2/min.js');
        spec = mod.spec || mod.default || window.ks?.declarative?.spec?.data;
      }
    }

    // 1. Right: Editable Monaco Editor Component
    const editor = await initRightEditor(spec);
    setEditor(editor);

    // 2. Left: Instruction-Driven Spec Element Selectors
    await initLeftWorkspace({ spec, editor });

    // 3. Topbar: Instruction-Driven Actions via bindings.json
    await initTopbar({
      onOpenTab2: openTab2,
      onRenderTab2: playHtml
    });

    // 4. Channel Listener for Handshakes from Tab 2 Canvas
    channel.onmessage = ({ data: msg }) => {
      if (!msg) return;
      if (msg.type === 'TAB_READY') {
        updateTab2Badge('Tab 2 Live', true);
        setStatus('Tab 2 Canvas Connected ✓');
      } else if (msg.type === 'RENDER_ACK') {
        updateTab2Badge('Tab 2 Live', true);
        setStatus(`Rendered in Tab 2 (${msg.count} elements) ✓`);
      } else if (msg.type === 'RENDER_ERROR') {
        setStatus(`Tab 2 Error: ${msg.message}`, true);
      } else if (msg.type === 'REQUEST_CONTENT') {
        sendPayload();
      }
    };

    // 5. Ping Tab 2 to check if already open
    try {
      channel.postMessage({ type: 'TAB_PING' });
    } catch (_) {}

    setStatus('Studio ready');
  } catch (error) {
    console.error('[json-to-dom V4 Tab 1 Init Error]', error);
  }
}

boot();
