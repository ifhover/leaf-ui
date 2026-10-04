import { Tree } from '@sudden3/leaf-ui';
import { treeData } from './data';
export function TreeStrict() {
  return <Tree data={treeData} checkable checkStrictly selectable={false} defaultExpandAll />;
}
