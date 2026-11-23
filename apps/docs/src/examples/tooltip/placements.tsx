import { Button, Grid, Tooltip, type TooltipProps } from '@ifhover/leaf-ui';

type Placement = NonNullable<TooltipProps['placement']>;

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

export function TooltipPlacements() {
  return (
    <Grid columns={5} gap={8}>
      {slots.map((slot) =>
        typeof slot === 'string' ? (
          <span key={slot} aria-hidden="true" />
        ) : (
          <Tooltip
            key={slot.placement}
            placement={slot.placement}
            content={`项目概览：${slot.label}（${slot.placement}）`}
          >
            <Button variant="outline">{slot.label}</Button>
          </Tooltip>
        ),
      )}
    </Grid>
  );
}
