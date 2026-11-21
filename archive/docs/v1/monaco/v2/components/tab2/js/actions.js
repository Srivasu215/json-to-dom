export function createTab2Actions({ editor, elements }) {
  const getRenderFunc = () =>
    window.ks?.jsonToDom?.appendToDom ||
    (typeof window.ks?.jsonToDom === 'function' ? window.ks.jsonToDom : null);

  return {
    render: async () => {
      if (!editor) return;

      try {
        const rawJson = editor.getValue();
        const parsed = JSON.parse(rawJson);

        elements.renderTarget.innerHTML = '';
        elements.renderStatus.textContent = 'Rendering DOM with json-to-dom...';

        let renderFunc = getRenderFunc();
        if (typeof renderFunc !== 'function') {
          try {
            const mod = await import('../../../../dist/min.js');
            renderFunc = mod.default || mod.appendToDom || getRenderFunc();
          } catch (_) {
            const mod = await import('https://keshavsoft.github.io/keshavsoft-json-to-dom/dist/min.js');
            renderFunc = mod.default || mod.appendToDom || getRenderFunc();
          }
        }

        if (typeof renderFunc !== 'function') {
          throw new Error('json-to-dom engine is not loaded on window.ks.jsonToDom');
        }

        let mountedCount = 0;

        if (parsed && typeof parsed === 'object' && (parsed.tagName || parsed.tag)) {
          if (!parsed.tagName && parsed.tag) parsed.tagName = parsed.tag;

          renderFunc({
            jsonSpec: parsed,
            targetHtmlId: elements.renderTarget.id
          });
          mountedCount = 1;
        } else if (typeof parsed === 'object' && parsed !== null) {
          const entries = Object.entries(parsed).filter(
            ([_, specNode]) => specNode && typeof specNode === 'object' && (specNode.tagName || specNode.tag)
          );

          if (entries.length > 0) {
            entries.forEach(([key, specNode]) => {
              if (!specNode.tagName && specNode.tag) specNode.tagName = specNode.tag;

              const card = document.createElement('div');
              card.className = 'rendered-spec-card';

              const titleBadge = document.createElement('div');
              titleBadge.className = 'badge-tag';
              titleBadge.textContent = key;
              card.appendChild(titleBadge);

              const mountPoint = document.createElement('div');
              mountPoint.id = `mount-${key.replace(/[^a-zA-Z0-9_-]/g, '_')}-${Math.random().toString(36).substring(2, 7)}`;
              card.appendChild(mountPoint);
              elements.renderTarget.appendChild(card);

              renderFunc({
                jsonSpec: specNode,
                targetHtmlId: mountPoint.id
              });
              mountedCount++;
            });
          }
        }

        if (mountedCount === 0) {
          elements.renderTarget.innerHTML = `
            <div class="render-alert warning">
              <strong>Notice:</strong> Parsed JSON contains no recognizable <code>tagName</code> specification properties.
            </div>
          `;
          elements.renderStatus.textContent = 'No tagName found';
        } else {
          elements.renderStatus.textContent = `Mounted ${mountedCount} DOM component(s) successfully with json-to-dom.`;
        }
      } catch (err) {
        elements.renderTarget.innerHTML = `
          <div class="render-alert error">
            <strong>Compilation Error:</strong> ${err.message}
          </div>
        `;
        elements.renderStatus.textContent = 'Syntax error in Editor JSON';
      }
    },

    clear: () => {
      elements.renderTarget.innerHTML = `
        <div class="empty-render-notice">
          <p>Canvas cleared. Click <strong>"Render Monaco Spec to DOM"</strong> to compile again.</p>
        </div>
      `;
      elements.renderStatus.textContent = 'Canvas cleared';
    }
  };
}

export default createTab2Actions;
