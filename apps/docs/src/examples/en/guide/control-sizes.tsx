import type { ControlSize } from '@ifhover/leaf-ui';
import { Button, Flex, Input, Select, Text } from '@ifhover/leaf-ui';
export function ControlSizes() {
  return (
    <Flex direction="column" gap="md">
      {(['sm', 'md', 'lg'] as const).map((size: ControlSize) => (
        <Flex key={size} align="center" gap="sm" wrap>
          <Text tone="muted">{size}</Text>
          <Input
            style={{ flex: '1 1 120px', width: 0 }}
            size={size}
            aria-label={`${size} search`}
            placeholder="Search projects"
          />
          <Select
            style={{ flex: '1 1 120px', width: 0 }}
            size={size}
            aria-label={`${size} status`}
            defaultValue="all"
            options={[
              { label: 'All statuses', value: 'all' },
              { label: 'Active', value: 'active' },
            ]}
          />
          <Button size={size}>Search</Button>
        </Flex>
      ))}
    </Flex>
  );
}
