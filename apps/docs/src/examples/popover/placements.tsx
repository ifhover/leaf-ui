import { Button, Grid, Popover, type PopoverProps } from '@ifhover/leaf-ui';

type Placement = NonNullable<PopoverProps['placement']>;

const slots: ReadonlyArray<{ placement: Placement; label: string } | string> = [
  's1',
  { placement: 'top-start', label: '上左' },
  { placement: 'top', label: '上方' },
  { placement: 'top-end', label: '上右' },
  's2',
  { placement: 'left-start', label: '左上' },
  's3',
  's4',
  's5',
  { placement: 'right-start', label: '右上' },
  { placement: 'left', label: '左侧' },
  's6',
  's7',
  's8',
  { placement: 'right', label: '右侧' },
  { placement: 'left-end', label: '左下' },
  's9',
  's10',
  's11',
  { placement: 'right-end', label: '右下' },
  's12',
  { placement: 'bottom-start', label: '下左' },
  { placement: 'bottom', label: '下方' },
  { placement: 'bottom-end', label: '下右' },
  's13',
];

export function PopoverPlacements() {
  return (
    <Grid columns={5} gap={8}>
      {slots.map((slot) =>
        typeof slot === 'string' ? (
          <span key={slot} aria-hidden="true" />
        ) : (
          <Popover
            key={slot.placement}
            placement={slot.placement}
            title={`${slot.label} (${slot.placement})`}
            content="在此查看项目概览和最近更新。"
          >
            <Button variant="outline">{slot.label}</Button>
          </Popover>
        ),
      )}
    </Grid>
  );
}
