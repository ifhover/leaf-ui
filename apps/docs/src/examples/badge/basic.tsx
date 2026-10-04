import { Badge, Button } from '@sudden3/leaf-ui';
import { Bell, Mail } from 'lucide-react';
export function BadgeBasic() {
  return (
    <div className="leaf-demo-stack leaf-demo-stack--wide">
      <div className="leaf-demo-row">
        <div className="leaf-demo-case">
          <span className="leaf-demo-label">8 条通知</span>
          <Badge count={8} aria-label="8 条通知">
            <Button variant="outline" startIcon={<Bell />} aria-label="通知" />
          </Badge>
        </div>
        <div className="leaf-demo-case">
          <span className="leaf-demo-label">数量上限</span>
          <Badge count={120}>
            <Button variant="outline">收件箱</Button>
          </Badge>
        </div>
        <div className="leaf-demo-case">
          <span className="leaf-demo-label">有新消息</span>
          <Badge dot aria-label="有新消息">
            <Button variant="ghost" startIcon={<Mail />} aria-label="消息" />
          </Badge>
        </div>
        <div className="leaf-demo-case">
          <span className="leaf-demo-label">显示零值</span>
          <Badge count={0} showZero color="#7654c6" />
        </div>
      </div>
      <div className="leaf-demo-row">
        <div className="leaf-demo-case">
          <span className="leaf-demo-label">通知数量</span>
          <Badge status="success" text="运行中" />
        </div>
        <div className="leaf-demo-case">
          <span className="leaf-demo-label">警告反馈</span>
          <Badge status="warning" text="待处理" />
        </div>
        <div className="leaf-demo-case">
          <span className="leaf-demo-label">错误反馈</span>
          <Badge status="error" text="已停止" />
        </div>
        <div className="leaf-demo-case">
          <span className="leaf-demo-label">通知数量</span>
          <Badge status="info" text="更新中" />
        </div>
      </div>
    </div>
  );
}
