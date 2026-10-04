import { Loading } from '@sudden3/leaf-ui';
export function LoadingSizes() {
  return (
    <div className="leaf-demo-row">
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Small</span>
        <Loading size="sm" />
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Medium</span>
        <Loading />
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Large</span>
        <Loading size="lg" />
      </div>
    </div>
  );
}
