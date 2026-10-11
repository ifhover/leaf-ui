import { Space, TreeSelect } from '@ifhover/leaf-ui';
import { treeOptions } from './options';
export function TreeSelectStates() {
  return (
    <Space direction="vertical" align="stretch" className="leaf-demo-stack">
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Disabled</span>
        <TreeSelect options={treeOptions} disabled defaultValue="web" />
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Validation feedback</span>
        <TreeSelect options={treeOptions} status="error" placeholder="Select a team" />
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Custom popup width</span>
        <TreeSelect options={treeOptions} popupWidth={320} popupMaxWidth={360} defaultExpandAll />
      </div>
    </Space>
  );
}
