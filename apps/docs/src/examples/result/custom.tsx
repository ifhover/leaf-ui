import { Result } from '@sudden3/leaf-ui';
import { Leaf } from 'lucide-react';
export function ResultCustom() {
  return (
    <Result title="让灵感继续生长" description="图标、内容和操作区都可以替换。" icon={<Leaf />}>
      <p>这里可以放置后续步骤、问题说明或其他补充内容。</p>
    </Result>
  );
}
