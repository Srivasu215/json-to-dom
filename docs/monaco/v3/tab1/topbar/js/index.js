import bindings from './bindings.json' with { type: 'json' };
import { createTopbarActions } from './actions.js';

const getBindEvents = () =>
  window.ks?.domPrimitive?.bindings?.bindEvents ||
  window.ks?.domPrimitiveBindings?.bindEvents ||
  window.ks?.bindEvents;

export async function initTopbar({ onSwitchTab }) {
  const actions = createTopbarActions({ onSwitchTab });

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
    const tab1Btn = document.getElementById('tab1NavBtn');
    const tab2Btn = document.getElementById('tab2NavBtn');
    if (tab1Btn) tab1Btn.addEventListener('click', actions.openTab1);
    if (tab2Btn) tab2Btn.addEventListener('click', actions.openTab2);
  }

  return actions;
}

export default initTopbar;
