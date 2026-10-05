import { Button, Card, Space, Tour } from '@sudden3/leaf-ui';
import { useRef, useState } from 'react';
export function TourBasic({ english = false }: { english?: boolean }) {
  const [open, setOpen] = useState(false),
    [current, setCurrent] = useState(0);
  const create = useRef<HTMLButtonElement>(null),
    settings = useRef<HTMLButtonElement>(null);
  return (
    <Card title={english ? 'Your workspace' : '你的工作区'}>
      <Space wrap>
        <Button ref={create}>{english ? 'Create project' : '新建项目'}</Button>
        <Button ref={settings} variant="outline">
          {english ? 'Settings' : '工作区设置'}
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            setCurrent(0);
            setOpen(true);
          }}
        >
          {english ? 'Start tour' : '开始引导'}
        </Button>
      </Space>
      <Tour
        open={open}
        current={current}
        onChange={setCurrent}
        onClose={() => setOpen(false)}
        steps={[
          {
            key: 'create',
            title: english ? 'Create your first project' : '创建第一个项目',
            description: english
              ? 'Keep related tasks in one place.'
              : '把相关任务放在同一个项目中。',
            target: () => create.current,
          },
          {
            key: 'settings',
            title: english ? 'Make it yours' : '按团队习惯设置',
            description: english
              ? 'Adjust preferences in workspace settings.'
              : '在工作区设置中调整团队偏好。',
            target: () => settings.current,
          },
        ]}
      />
    </Card>
  );
}
export function TourCentered({ english = false }: { english?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        {english ? 'Show welcome' : '查看欢迎说明'}
      </Button>
      <Tour
        open={open}
        onClose={() => setOpen(false)}
        steps={[
          {
            title: english ? 'Welcome to Leaf' : '欢迎来到 Leaf',
            description: english
              ? 'A step without a target is displayed in the center.'
              : '未指定目标的说明会显示在页面中央。',
          },
        ]}
      />
    </>
  );
}
