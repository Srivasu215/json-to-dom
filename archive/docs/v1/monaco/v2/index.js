import { initRightEditor } from './components/right/js/index.js';
import { initLeftWorkspace } from './components/left/js/index.js';
import { initTab2Workspace } from './components/tab2/js/index.js';
import { initTopbar } from './topbar/js/index.js';

const tab1Workspace = document.getElementById('tab1Workspace');
const tab2Container = document.getElementById('tab2Container');
const tab1NavBtn = document.getElementById('tab1NavBtn');
const tab2NavBtn = document.getElementById('tab2NavBtn');

let activeEditor = null;
let tab2Actions = null;

function handleSwitchTab(targetTab) {
  const isTab1 = targetTab === 'tab1';

  tab1Workspace.classList.toggle('tab-hidden', !isTab1);
  tab2Container.classList.toggle('tab-hidden', isTab1);

  tab1NavBtn.classList.toggle('active', isTab1);
  tab2NavBtn.classList.toggle('active', !isTab1);

  if (isTab1 && activeEditor) {
    setTimeout(() => activeEditor.layout(), 50);
  } else if (!isTab1 && tab2Actions) {
    tab2Actions.render();
  }
}

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

    activeEditor = await initRightEditor(spec);
    await initLeftWorkspace({ spec, editor: activeEditor });
    tab2Actions = await initTab2Workspace({ editor: activeEditor });

    await initTopbar({ onSwitchTab: handleSwitchTab });
  } catch (error) {
    console.error('[json-to-dom Studio V2]', error);
  }
}

boot();
