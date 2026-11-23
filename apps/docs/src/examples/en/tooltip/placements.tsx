import { Button, Grid, Tooltip, type TooltipProps } from '@ifhover/leaf-ui';

type Placement = NonNullable<TooltipProps['placement']>;

const slots: ReadonlyArray<{ placement: Placement; label: string } | string> = [
  's1',
  { placement: 'top-start', label: 'TL' },
  { placement: 'top', label: 'Top' },
  { placement: 'top-end', label: 'TR' },
  's2',
  { placement: 'left-start', label: 'LT' },
  's3',
  's4',
  's5',
  { placement: 'right-start', label: 'RT' },
  { placement: 'left', label: 'Left' },
  's6',
  's7',
  's8',
  { placement: 'right', label: 'Right' },
  { placement: 'left-end', label: 'LB' },
  's9',
  's10',
  's11',
  { placement: 'right-end', label: 'RB' },
  's12',
  { placement: 'bottom-start', label: 'BL' },
  { placement: 'bottom', label: 'Bottom' },
  { placement: 'bottom-end', label: 'BR' },
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
            content={`Project overview (${slot.placement})`}
          >
            <Button variant="outline" aria-label={slot.placement}>
              {slot.label}
            </Button>
          </Tooltip>
        ),
      )}
    </Grid>
  );
}
