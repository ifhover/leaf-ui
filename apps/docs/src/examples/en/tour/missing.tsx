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
        label="When a target is missing"
        value={policy}
        onChange={(event) =>
          setPolicy(event.target.value as NonNullable<TourProps['missingTarget']>)
        }
        options={[
          { label: 'Center', value: 'center' },
          { label: 'Skip', value: 'skip' },
          { label: 'Close', value: 'close' },
        ]}
      />
      <Text ref={target}>Second target: Document list</Text>
      <Space>
        <Button
          onClick={() => {
            setCurrent(0);
            setOpen(true);
          }}
        >
          Test missing target
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
            title: 'The first target is missing',
            description: 'The center policy still displays this step.',
            target: () => null,
          },
          {
            key: 'available',
            title: 'Document list',
            description: 'Skipping the missing target leads to this step.',
            target: () => target.current,
          },
        ]}
      />
    </Space>
  );
}
