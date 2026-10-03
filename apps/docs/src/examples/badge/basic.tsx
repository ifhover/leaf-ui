import { Badge, Button } from '@sudden3/leaf-ui';
import { Bell, Mail } from 'lucide-react';
export function BadgeBasic() {
  return (
    <div className="leaf-demo-stack leaf-demo-stack--wide">
      <div className="leaf-demo-row">
        <Badge count={8} aria-label="8 条通知">
          <Button variant="outline" startIcon={<Bell />} aria-label="通知" />
        </Badge>
        <Badge count={120}>
          <Button variant="outline">收件箱</Button>
        </Badge>
        <Badge dot aria-label="有新消息">
          <Button variant="ghost" startIcon={<Mail />} aria-label="消息" />
        </Badge>
        <Badge count={0} showZero color="#7654c6" />
      </div>
      <div className="leaf-demo-row">
        <Badge status="success" text="运行中" />
        <Badge status="warning" text="待处理" />
        <Badge status="error" text="已停止" />
        <Badge status="info" text="更新中" />
      </div>
    </div>
  );
}
