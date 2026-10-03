import { Tag } from '@sudden3/leaf-ui';
import { Check } from 'lucide-react';
export function TagBasic() {
  return (
    <div className="leaf-demo-stack leaf-demo-stack--wide">
      <div className="leaf-demo-row">
        {(['default', 'primary', 'success', 'info', 'warning', 'error'] as const).map((color) => (
          <Tag key={color} color={color}>
            {color}
          </Tag>
        ))}
      </div>
      <div className="leaf-demo-row">
        <Tag color="primary" variant="solid">
          已发布
        </Tag>
        <Tag color="success" variant="outline" icon={<Check />}>
          已完成
        </Tag>
        <Tag color="#7654c6" closable>
          可移除
        </Tag>
        <Tag size="lg" color="primary">
          大标签
        </Tag>
      </div>
    </div>
  );
}
