import { Button, type ControlSize, Input, Select } from '@sudden3/leaf-ui';

export function ControlSizes() {
  return (
    <div className="leaf-demo-stack leaf-demo-stack--wide">
      {(['sm', 'md', 'lg'] as const).map((size: ControlSize) => (
        <div key={size} className="leaf-demo-control-row">
          <span className="leaf-demo-size">{size}</span>
          <Input size={size} aria-label={`${size} Search`} placeholder="Search projects" />
          <Select
            size={size}
            aria-label={`${size} Status`}
            defaultValue="all"
            options={[
              { label: 'All statuses', value: 'all' },
              { label: 'In progress', value: 'active' },
            ]}
          />
          <Button size={size}>Search</Button>
        </div>
      ))}
    </div>
  );
}
