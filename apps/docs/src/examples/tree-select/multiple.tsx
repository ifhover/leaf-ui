import { Space, TreeSelect } from '@ifhover/leaf-ui';
import { treeOptions } from './options';
export function TreeSelectMultiple() {
  return (
    <Space direction="vertical" align="stretch" className="leaf-demo-stack">
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">多选 · 逐项选择</span>
        <TreeSelect options={treeOptions} multiple defaultValue={['visual']} defaultExpandAll />
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">勾选联动 · 提交子节点</span>
        <TreeSelect
          options={treeOptions}
          treeCheckable
          defaultValue={['visual']}
          defaultExpandAll
        />
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">勾选联动 · 合并显示父节点</span>
        <TreeSelect
          options={treeOptions}
          treeCheckable
          showCheckedStrategy="parent"
          defaultValue={['design']}
          defaultExpandAll
        />
      </div>
    </Space>
  );
}
