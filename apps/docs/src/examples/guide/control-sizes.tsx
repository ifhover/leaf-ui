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
            aria-label={`${size} 搜索`}
            placeholder="搜索项目"
          />
          <Select
            style={{ flex: '1 1 120px', width: 0 }}
            size={size}
            aria-label={`${size} 状态`}
            defaultValue="all"
            options={[
              { label: '全部状态', value: 'all' },
              { label: '进行中', value: 'active' },
            ]}
          />
          <Button size={size}>查询</Button>
        </Flex>
      ))}
    </Flex>
  );
}
