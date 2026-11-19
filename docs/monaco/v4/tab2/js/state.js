/**
 * Tab 2 (Consumer) — Centralized Receiver State & DOM Mounting
 * Pure Consumer Canvas: renders specs received via BroadcastChannel or localStorage
 */

export const CHANNEL_NAME = 'keshavsoft-json-to-dom-v4';
export const STORAGE_KEY_CONTENT = 'keshavsoft_json_to_dom_v4_content';

export const channel = new BroadcastChannel(CHANNEL_NAME);

export function sendAck(nodeCount) {
  try {
    channel.postMessage({
      type: 'RENDER_ACK',
      success: true,
      count: nodeCount,
      timestamp: Date.now()
    });
  } catch (err) {
    console.warn('[Tab 2 ACK Error]', err);
  }
}

const getRenderFunc = () =>
  window.ks?.jsonToDom?.appendToDom ||
  (typeof window.ks?.jsonToDom === 'function' ? window.ks.jsonToDom : null);

export async function renderContent(rawContent) {
  if (!rawContent) return;

  const appEl = document.getElementById('app') || document.body;

  try {
    let parsed = null;
    if (typeof rawContent === 'object') {
      parsed = rawContent;
    } else {
      const trimmed = String(rawContent).trim();
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        parsed = JSON.parse(rawContent);
      } else if (trimmed.startsWith('<')) {
        appEl.innerHTML = trimmed;
        sendAck(appEl.querySelectorAll('*').length);
        return;
      }
    }

    if (!parsed) return;

    let renderFunc = getRenderFunc();
    if (typeof renderFunc !== 'function') {
      try {
        const mod = await import('../../../dist/min.js');
        renderFunc = mod.default || mod.appendToDom || getRenderFunc();
      } catch (_) {
        const mod = await import('https://keshavsoft.github.io/keshavsoft-json-to-dom/dist/min.js');
        renderFunc = mod.default || mod.appendToDom || getRenderFunc();
      }
    }

    if (typeof renderFunc !== 'function') {
      throw new Error('json-to-dom orchestrator is not available on window.ks.jsonToDom');
    }

    // Clear canvas before mounting
    appEl.innerHTML = '';

    let mountedCount = 0;

    // Case 1: Single element specification (e.g. { tagName: 'div', ... })
    if (parsed && (parsed.tagName || parsed.tag)) {
      if (!parsed.tagName && parsed.tag) parsed.tagName = parsed.tag;
      renderFunc({
        jsonSpec: parsed,
        targetHtmlId: appEl.id || 'app'
      });
      mountedCount = 1;
    } 
    // Case 2: Collection of component specifications (e.g. { tableSearchBar: {...}, tableRow: {...} })
    else if (typeof parsed === 'object' && parsed !== null) {
      const entries = Object.entries(parsed).filter(
        ([_, specNode]) => specNode && typeof specNode === 'object' && (specNode.tagName || specNode.tag)
      );

      if (entries.length > 0) {
        entries.forEach(([key, specNode]) => {
          if (!specNode.tagName && specNode.tag) specNode.tagName = specNode.tag;

          const card = document.createElement('div');
          card.className = 'mb-4 p-3 border border-slate-200 rounded-lg shadow-sm bg-white';

          const titleBadge = document.createElement('span');
          titleBadge.className = 'badge bg-primary-subtle text-primary border border-primary-subtle font-monospace mb-2 d-inline-block px-2 py-1';
          titleBadge.textContent = key;
          card.appendChild(titleBadge);

          const mountPoint = document.createElement('div');
          mountPoint.id = `mount-${key.replace(/[^a-zA-Z0-9_-]/g, '_')}-${Math.random().toString(36).substring(2, 7)}`;
          card.appendChild(mountPoint);
          appEl.appendChild(card);

          renderFunc({
            jsonSpec: specNode,
            targetHtmlId: mountPoint.id
          });
          mountedCount++;
        });
      }
    }

    if (mountedCount === 0) {
      appEl.innerHTML = `
        <div class="alert alert-warning" role="alert">
          <strong>Notice:</strong> Parsed JSON contains no recognizable <code>tagName</code> specification properties.
        </div>
      `;
    }

    const nodeCount = appEl.querySelectorAll('*').length;
    sendAck(nodeCount);
  } catch (err) {
    console.error('[Render Error in Tab 2]', err);
    appEl.innerHTML = `
      <div class="alert alert-danger" role="alert">
        <strong>Render Error:</strong> ${err.message}
      </div>
    `;
    channel.postMessage({ type: 'RENDER_ERROR', message: err.message });
  }
}
