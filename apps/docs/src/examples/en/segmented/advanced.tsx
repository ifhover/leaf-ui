import { Segmented } from '@sudden3/leaf-ui';

export function SegmentedOptions() {
  return (
    <div className="leaf-demo-stack">
      <strong className="leaf-demo-note">Fill container</strong>
      <Segmented
        block
        options={[
          { value: 'list', label: 'List' },
          { value: 'grid', label: 'Grid' },
          { value: 'archived', label: 'Archive (unavailable', disabled: true },
        ]}
      />
      <strong className="leaf-demo-note">Small size</strong>
      <Segmented size="sm" options={['A', 'B', 'C']} />
    </div>
  );
}
