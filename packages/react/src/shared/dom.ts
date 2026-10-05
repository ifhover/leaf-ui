export function deepActiveElement(root: Document | ShadowRoot = document): Element | null {
  const active = root.activeElement;
  return active?.shadowRoot ? deepActiveElement(active.shadowRoot) : active;
}
export function composedEventTarget(event: Event): EventTarget | null {
  return event.composedPath()[0] ?? event.target;
}
export function composedParent(node: HTMLElement): HTMLElement | null {
  if (node.parentElement) return node.parentElement;
  const root = node.getRootNode();
  return root instanceof ShadowRoot && root.host instanceof HTMLElement ? root.host : null;
}
