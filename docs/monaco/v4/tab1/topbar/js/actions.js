export function createTopbarActions({ onOpenTab2, onRenderTab2 }) {
  return {
    openTab2: () => {
      if (typeof onOpenTab2 === 'function') onOpenTab2();
    },
    renderTab2: () => {
      if (typeof onRenderTab2 === 'function') onRenderTab2();
    }
  };
}

export default createTopbarActions;
