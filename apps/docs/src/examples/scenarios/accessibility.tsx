import {
  Button,
  Checkbox,
  ConfigProvider,
  Drawer,
  Form,
  FormField,
  Input,
  Modal,
  RadioGroup,
  Select,
  Slider,
  Space,
  Switch,
  Tabs,
} from '@sudden3/leaf-ui';
import { useId, useRef, useState } from 'react';

/** The documentation and browser acceptance exercise this same interactive sample. */
export function AccessibilityWorkbench({ english = false }: { english?: boolean }) {
  const t = (zh: string, en: string) => (english ? en : zh);
  const id = useId();
  const nameInput = useRef<HTMLInputElement>(null);
  const [dark, setDark] = useState(false);
  const [compact, setCompact] = useState(false);
  const [motion, setMotion] = useState(true);
  const [blur, setBlur] = useState(true);
  const [modal, setModal] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [saved, setSaved] = useState(false);
  return (
    <ConfigProvider
      data-testid="acceptance-workbench"
      className="rp-not-doc"
      locale={english ? 'en-US' : 'zh-CN'}
      density={compact ? 'compact' : 'comfortable'}
      maskBlur={blur}
      theme={{ appearance: dark ? 'dark' : 'light', motion }}
      style={{
        padding: 20,
        border: '1px solid var(--leaf-color-border)',
        borderRadius: 16,
        color: 'var(--leaf-color-text)',
        background: 'var(--leaf-color-surface)',
      }}
    >
      <Space wrap style={{ marginBottom: 20 }}>
        <Switch checked={dark} onChange={(event) => setDark(event.target.checked)}>
          {t('深色', 'Dark')}
        </Switch>
        <Switch checked={compact} onChange={(event) => setCompact(event.target.checked)}>
          {t('紧凑', 'Compact')}
        </Switch>
        <Switch checked={motion} onChange={(event) => setMotion(event.target.checked)}>
          {t('动效', 'Motion')}
        </Switch>
        <Switch checked={blur} onChange={(event) => setBlur(event.target.checked)}>
          {t('遮罩模糊', 'Mask blur')}
        </Switch>
      </Space>
      <Form
        aria-label={t('验收表单', 'Acceptance form')}
        onSubmit={(event) => {
          event.preventDefault();
          setSaved(true);
        }}
      >
        <FormField label={t('姓名', 'Name')} required>
          <Input name="name" required defaultValue="Lin" />
        </FormField>
        <FormField label={t('邮箱', 'Email')} required>
          <Input type="email" name="email" required defaultValue="lin@example.com" />
        </FormField>
        <FormField label={t('负责人', 'Owner')}>
          <Select
            name="owner"
            defaultValue="lin"
            options={[
              { value: 'lin', label: 'Lin' },
              { value: 'alex', label: 'Alex' },
            ]}
          />
        </FormField>
        <FormField label={t('优先级', 'Priority')}>
          <Slider aria-label={t('优先级', 'Priority')} defaultValue={40} />
        </FormField>
        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend>{t('通知方式', 'Notification channel')}</legend>
          <RadioGroup
            name="channel"
            defaultValue="email"
            options={[
              { value: 'email', label: t('邮件', 'Email') },
              { value: 'app', label: t('应用内', 'In app') },
            ]}
          />
        </fieldset>
        <Checkbox name="reminders" defaultChecked>
          {t('启用提醒', 'Enable reminders')}
        </Checkbox>
        <Space wrap>
          <Button type="submit">{t('保存', 'Save')}</Button>
          <Button variant="outline" disabled>
            {t('不可用操作', 'Unavailable action')}
          </Button>
          <Button variant="outline" onClick={() => setModal(true)}>
            {t('打开弹窗', 'Open dialog')}
          </Button>
          <Button variant="outline" onClick={() => setDrawer(true)}>
            {t('打开抽屉', 'Open drawer')}
          </Button>
        </Space>
        <div role="status">{saved ? t('表单已保存', 'Form saved') : ''}</div>
      </Form>
      <Tabs
        aria-label={t('验收标签页', 'Acceptance tabs')}
        items={[
          {
            key: 'overview',
            label: t('概览', 'Overview'),
            children: (
              <p>{t('键盘可在标签页之间移动。', 'Use the keyboard to move between tabs.')}</p>
            ),
          },
          {
            key: 'details',
            label: t('详情', 'Details'),
            children: (
              <p>{t('内容区域与选中标签页关联。', 'The selected tab labels its content panel.')}</p>
            ),
          },
        ]}
      />
      <Modal
        initialFocus={nameInput}
        title={t('编辑信息', 'Edit details')}
        open={modal}
        onClose={() => setModal(false)}
        footer={<Button onClick={() => setModal(false)}>{t('完成', 'Done')}</Button>}
      >
        <Form>
          <FormField label={t('弹窗姓名', 'Dialog name')}>
            <Input ref={nameInput} defaultValue="Lin" />
          </FormField>
          <FormField label={t('弹窗负责人', 'Dialog owner')}>
            <Select
              defaultValue="lin"
              options={[
                { value: 'lin', label: 'Lin' },
                { value: 'alex', label: 'Alex' },
              ]}
            />
          </FormField>
        </Form>
      </Modal>
      <Drawer
        title={t('检查抽屉', 'Inspect drawer')}
        open={drawer}
        onClose={() => setDrawer(false)}
        footer={<Button onClick={() => setDrawer(false)}>{t('完成', 'Done')}</Button>}
      >
        <p id={`${id}-drawer-description`}>
          {t(
            '检查焦点循环、关闭与焦点返回。',
            'Check focus trapping, dismissal and focus restoration.',
          )}
        </p>
        <Input aria-label={t('抽屉备注', 'Drawer notes')} />
      </Drawer>
    </ConfigProvider>
  );
}
