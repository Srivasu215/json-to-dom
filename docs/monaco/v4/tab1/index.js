import { initRightEditor } from './components/right/js/index.js';
import { initLeftWorkspace } from './components/left/js/index.js';
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

    const editor = await initRightEditor(spec);
    setEditor(editor);

    await initLeftWorkspace({ spec, editor });

    // 1. Wire Topbar Buttons
    const openTab2Btn = document.getElementById('openTab2Btn');
    if (openTab2Btn) {
      openTab2Btn.addEventListener('click', openTab2);
    }

    const renderTab2Btn = document.getElementById('renderTab2Btn');
    if (renderTab2Btn) {
      renderTab2Btn.addEventListener('click', playHtml);
    }

    // 2. Keyboard shortcut: Ctrl + Enter / Cmd + Enter renders in Tab 2
    if (window.monaco && editor) {
      editor.addCommand(window.monaco.KeyMod.CtrlCmd | window.monaco.KeyCode.Enter, () => {
        playHtml();
      });
    }

    // 3. Channel Listener for Handshakes from Tab 2
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

    // 4. Ping Tab 2 to check if already open
    try {
      channel.postMessage({ type: 'TAB_PING' });
    } catch (_) {}

    setStatus('Studio ready');
  } catch (error) {
    console.error('[json-to-dom Tab 1 Init Error]', error);
  }
}

boot();
