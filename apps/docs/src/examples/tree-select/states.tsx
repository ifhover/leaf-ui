import { TreeSelect } from '@sudden3/leaf-ui';
import { treeOptions } from './options';
export function TreeSelectStates() {
  return (
    <div className="leaf-demo-stack">
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">禁用</span>
        <TreeSelect options={treeOptions} disabled defaultValue="web" />
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">校验反馈</span>
        <TreeSelect options={treeOptions} status="error" placeholder="请选择一个团队" />
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">自定义浮层宽度</span>
        <TreeSelect options={treeOptions} popupWidth={320} popupMaxWidth={360} defaultExpandAll />
      </div>
    </div>
  );
}
