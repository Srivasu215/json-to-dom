import bindings from './bindings.json' with { type: 'json' };
import { createTopbarActions } from './actions.js';

const getBindEvents = () =>
  window.ks?.domPrimitive?.bindings?.bindEvents ||
  window.ks?.domPrimitiveBindings?.bindEvents ||
  window.ks?.bindEvents;

export async function initTopbar({ onOpenTab2, onRenderTab2 }) {
  const actions = createTopbarActions({ onOpenTab2, onRenderTab2 });

  let bindEvents = getBindEvents();
  if (typeof bindEvents !== 'function') {
    try {
      const mod = await import('https://keshavsoft.github.io/dom-primitive-bindings/dist/v8/min.js');
      bindEvents = mod.bindEvents || mod.default || getBindEvents();
    } catch (_) {}
  }

  if (typeof bindEvents === 'function') {
    bindEvents('topbarContainer', bindings, actions);
  } else {
    // Fallback if bindings library is unavailable
    const openBtn = document.getElementById('openTab2Btn');
    const renderBtn = document.getElementById('renderTab2Btn');
    if (openBtn) openBtn.addEventListener('click', actions.openTab2);
    if (renderBtn) renderBtn.addEventListener('click', actions.renderTab2);
  }

  return actions;
}

export default initTopbar;
