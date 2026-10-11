import { Alert, Button, CheckboxGroup, Modal, Space, Steps, Tag } from '@ifhover/leaf-ui';
import { Bot, HardDrive, Mail, MessageSquare, ShieldCheck, Snowflake } from 'lucide-react';
import { useState } from 'react';

export function AccessScope({ english = false }: { english?: boolean }) {
  const t = (zh: string, en: string) => (english ? en : zh);
  const [open, setOpen] = useState(false);
  const [services, setServices] = useState<string[]>(['mail', 'drive']);
  const [permissions, setPermissions] = useState<string[]>(['read', 'labels']);
  const [saved, setSaved] = useState(false);
  return (
    <Space direction="vertical" align="start" size="sm">
      <Button variant="outline" startIcon={<ShieldCheck />} onClick={() => setOpen(true)}>
        {t('设置访问权限', 'Configure access')}
      </Button>
      {saved && <span role="status">{t('访问权限已保存。', 'Access settings saved.')}</span>}
      <Modal
        open={open}
        width={680}
        title={t('注册智能体', 'Register agent')}
        description={t(
          '设置身份，再授予工作所需的访问权限。',
          'Give the agent an identity, then grant the access it needs.',
        )}
        icon={<Bot />}
        cancelText={t('返回', 'Back')}
        confirmText={t('保存权限', 'Save access')}
        onClose={() => setOpen(false)}
        onConfirm={() => {
          setSaved(true);
          setOpen(false);
        }}
        footer={({ cancelButton, confirmButton }) => (
          <>
            <span
              style={{
                flex: '1 1 180px',
                color: 'var(--leaf-color-text-muted)',
                fontSize: 'var(--leaf-font-size-sm)',
              }}
            >
              {t('第 2 步，共 4 步 · 草稿已保存', 'Step 2 of 4 · Draft saved')}
            </span>
            <Space size="sm" wrap={false}>
              {cancelButton}
              {confirmButton}
            </Space>
          </>
        )}
      >
        <Space direction="vertical" align="stretch" size={20}>
          <Steps
            size="sm"
            current={1}
            items={[
              { title: t('身份', 'Identity') },
              { title: t('访问范围', 'Access scope') },
              { title: t('凭证', 'Credentials') },
              { title: t('确认', 'Review') },
            ]}
          />
          <CheckboxGroup
            legend={t('连接服务', 'Integrations')}
            variant="card"
            value={services}
            onChange={setServices}
            options={[
              {
                value: 'mail',
                label: t('邮件', 'Mail'),
                description: t('读取与整理邮件', 'Read and organize messages'),
                icon: <Mail />,
              },
              {
                value: 'drive',
                label: t('云端文件', 'Cloud drive'),
                description: t('查找与整理文件', 'Find and organize files'),
                icon: <HardDrive />,
              },
              {
                value: 'chat',
                label: t('团队沟通', 'Team chat'),
                description: t('尚未连接', 'Not connected'),
                icon: <MessageSquare />,
              },
              {
                value: 'warehouse',
                label: t('数据仓库', 'Data warehouse'),
                description: t('需要管理员配置', 'Administrator setup required'),
                icon: <Snowflake />,
                disabled: true,
              },
            ]}
          />
          <CheckboxGroup
            legend={t('邮件权限', 'Mail permissions')}
            variant="list"
            value={permissions}
            onChange={setPermissions}
            options={[
              {
                value: 'read',
                label: t('读取邮件', 'Read messages'),
                description: 'mail.readonly',
              },
              {
                value: 'labels',
                label: t('管理标签', 'Manage labels'),
                description: 'mail.labels',
              },
              {
                value: 'send',
                label: t('发送邮件', 'Send messages'),
                description: 'mail.send',
                extra: (
                  <Tag color="warning" size="sm">
                    {t('需要审批', 'Needs approval')}
                  </Tag>
                ),
              },
              {
                value: 'delete',
                label: t('删除邮件', 'Delete messages'),
                description: 'mail.modify',
                extra: <Tag size="sm">{t('策略已限制', 'Blocked by policy')}</Tag>,
                disabled: true,
              },
            ]}
          />
          <Alert
            type="success"
            icon={<ShieldCheck size={20} />}
            title={t(
              `已选择 ${services.length} 项服务、${permissions.length} 项权限`,
              `${services.length} services and ${permissions.length} permissions selected`,
            )}
            description={t(
              '默认仅授予读取权限，发送邮件仍需审批。',
              'Read-only by default. Outbound messages still require approval.',
            )}
          />
        </Space>
      </Modal>
    </Space>
  );
}
