import type { TreeDropInfo, TreeNode } from './tree';

export function moveTreeNode(
  data: readonly TreeNode[],
  key: string,
  target: string,
  position: TreeDropInfo['position'],
): TreeNode[] | null {
  let moved: TreeNode | undefined;
  const find = (nodes: readonly TreeNode[]): TreeNode | undefined => {
    for (const node of nodes) {
      if (node.key === key) return node;
      const nested = find(node.children ?? []);
      if (nested) return nested;
    }
    return undefined;
  };
  moved = find(data);
  if (!moved || key === target) return null;
  const contains = (node: TreeNode): boolean =>
    node.key === target || (node.children ?? []).some(contains);
  if (contains(moved)) return null;
  const remove = (nodes: readonly TreeNode[]): TreeNode[] =>
    nodes
      .filter((node) => node.key !== key)
      .map((node) => (node.children ? { ...node, children: remove(node.children) } : { ...node }));
  let inserted = false;
  const insert = (nodes: readonly TreeNode[]): TreeNode[] =>
    nodes.flatMap((node) => {
      const next = node.children ? { ...node, children: insert(node.children) } : { ...node };
      if (node.key !== target) return [next];
      inserted = true;
      if (position === 'inside')
        return [
          { ...next, isLeaf: false, children: [...(next.children ?? []), moved as TreeNode] },
        ];
      return position === 'before' ? [moved as TreeNode, next] : [next, moved as TreeNode];
    });
  const result = insert(remove(data));
  return inserted ? result : null;
}
