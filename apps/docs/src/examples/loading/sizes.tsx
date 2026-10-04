import { Loading } from '@sudden3/leaf-ui';
export function LoadingSizes() {
  return (
    <div className="leaf-demo-row">
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">小尺寸</span>
        <Loading size="sm" />
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">默认尺寸</span>
        <Loading />
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">大尺寸</span>
        <Loading size="lg" />
      </div>
    </div>
  );
}
