import type { TreeNode } from './tree';

export interface TreeRecord {
  node: TreeNode;
  parent?: string;
  level: number;
}
export function treeModel(data: readonly TreeNode[]) {
  const records = new Map<string, TreeRecord>();
  const visit = (nodes: readonly TreeNode[], level: number, parent?: string) => {
    for (const node of nodes) {
      records.set(node.key, { node, level, parent });
      if (node.children) visit(node.children, level + 1, node.key);
    }
  };
  visit(data, 1);
  return records;
}
const canCheck = (node: TreeNode) =>
  !node.disabled && !node.disableCheckbox && node.checkable !== false;
export function treeChecks(
  records: Map<string, TreeRecord>,
  keys: readonly string[],
  strict = false,
  toggle?: { key: string; checked: boolean },
) {
  const checked = new Set(keys.filter((key) => records.has(key)));
  const half = new Set<string>();
  if (strict) {
    if (toggle) {
      if (toggle.checked) checked.add(toggle.key);
      else checked.delete(toggle.key);
    }
    return { checked: [...checked], half: [] as string[] };
  }
  const descend = (key: string, state: boolean) => {
    const record = records.get(key);
    if (!record || !canCheck(record.node)) return;
    if (state) checked.add(key);
    else checked.delete(key);
    for (const child of record.node.children ?? []) descend(child.key, state);
  };
  for (const key of keys) descend(key, true);
  if (toggle) {
    descend(toggle.key, toggle.checked);
    if (!toggle.checked) {
      let parent = records.get(toggle.key)?.parent;
      while (parent) {
        const record = records.get(parent);
        if (!record || !canCheck(record.node)) break;
        checked.delete(parent);
        parent = record.parent;
      }
    }
  }
  for (const [key, { node }] of [...records].reverse()) {
    if (!canCheck(node)) continue;
    const children = (node.children ?? []).filter(canCheck);
    if (!children.length) continue;
    const all = children.every((child) => checked.has(child.key));
    const some = children.some((child) => checked.has(child.key) || half.has(child.key));
    if (all) checked.add(key);
    else {
      checked.delete(key);
      if (some) half.add(key);
    }
  }
  return { checked: [...records.keys()].filter((key) => checked.has(key)), half: [...half] };
}
export function treeMatches(
  records: Map<string, TreeRecord>,
  query: string,
  filter?: (node: TreeNode, query: string) => boolean,
) {
  const matched = new Set<string>();
  const visible = new Set<string>();
  const text = query.trim().toLocaleLowerCase();
  if (!text) return undefined;
  for (const [key, { node }] of records) {
    const title =
      node.searchLabel ??
      (typeof node.title === 'string' || typeof node.title === 'number' ? String(node.title) : key);
    if (!(filter ? filter(node, query) : title.toLocaleLowerCase().includes(text))) continue;
    matched.add(key);
    visible.add(key);
    let parent = records.get(key)?.parent;
    while (parent) {
      visible.add(parent);
      parent = records.get(parent)?.parent;
    }
  }
  return { matched, visible };
}
