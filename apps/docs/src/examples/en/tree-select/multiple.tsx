import { Space, TreeSelect } from '@ifhover/leaf-ui';
import { treeOptions } from './options';
export function TreeSelectMultiple() {
  return (
    <Space direction="vertical" align="stretch" className="leaf-demo-stack">
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Multiple · Select individual items</span>
        <TreeSelect options={treeOptions} multiple defaultValue={['visual']} defaultExpandAll />
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Linked checks · Child values</span>
        <TreeSelect
          options={treeOptions}
          treeCheckable
          defaultValue={['visual']}
          defaultExpandAll
        />
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Linked checks · Parent values</span>
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
