import { Alert, Space } from '@ifhover/leaf-ui';
import { ShieldCheck } from 'lucide-react';

export function NeutralAlerts({ english = false }: { english?: boolean }) {
  const t = (zh: string, en: string) => (english ? en : zh);
  return (
    <Space direction="vertical" align="stretch">
      <Alert
        type="success"
        icon={<ShieldCheck size={20} />}
        title={t('访问范围符合策略', 'Access follows your policy')}
        description={t(
          '默认只读，变更操作需要审批。',
          'Read-only by default. Changes require approval.',
        )}
      />
      <Alert
        type="info"
        title={t('草稿已自动保存', 'Your draft is saved')}
        description={t('你可以稍后继续完成设置。', 'You can finish setting up later.')}
        closable
      />
      <Alert
        type="warning"
        title={t('部分服务仍需配置', 'Some services need setup')}
        description={t(
          '联系管理员完成连接后再试。',
          'Ask your administrator to connect them before retrying.',
        )}
      />
      <Alert
        type="error"
        title={t('连接失败', 'Connection failed')}
        description={t('请检查连接信息后重试。', 'Check the connection settings and retry.')}
      />
    </Space>
  );
}
