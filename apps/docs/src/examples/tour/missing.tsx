import { Button, RadioGroup, Space, Text, Tour, type TourProps } from '@ifhover/leaf-ui';
import { useRef, useState } from 'react';

export function TourMissing() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(0);
  const [policy, setPolicy] = useState<NonNullable<TourProps['missingTarget']>>('center');
  const target = useRef<HTMLSpanElement>(null);
  return (
    <Space direction="vertical" align="stretch">
      <RadioGroup
        label="目标缺失时"
        value={policy}
        onChange={(event) =>
          setPolicy(event.target.value as NonNullable<TourProps['missingTarget']>)
        }
        options={[
          { label: '居中', value: 'center' },
          { label: '跳过', value: 'skip' },
          { label: '关闭', value: 'close' },
        ]}
      />
      <Text ref={target}>第二步目标：文档列表</Text>
      <Space>
        <Button
          onClick={() => {
            setCurrent(0);
            setOpen(true);
          }}
        >
          测试缺失目标
        </Button>
      </Space>
      <Tour
        open={open}
        current={current}
        onChange={setCurrent}
        onClose={() => setOpen(false)}
        missingTarget={policy}
        steps={[
          {
            key: 'missing',
            title: '第一步目标不存在',
            description: '选择居中时，仍会显示这一步。',
            target: () => null,
          },
          {
            key: 'available',
            title: '文档列表',
            description: '跳过缺失目标后，会进入这一步。',
            target: () => target.current,
          },
        ]}
      />
    </Space>
  );
}
