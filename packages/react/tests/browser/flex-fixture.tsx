import { Button, ConfigProvider, Flex, FloatButtonGroup } from '@ifhover/leaf-ui';

export function FlexFixture() {
  return (
    <ConfigProvider theme={{ spacing: 12 }}>
      <Flex aria-label="Themed spacing" gap="sm">
        <Button>First</Button>
        <Button>Second</Button>
      </Flex>
      <Flex aria-label="Wrapping" gap={[12, 8]} wrap style={{ width: 220 }}>
        <Button style={{ width: 140 }}>Wrap first</Button>
        <Button style={{ width: 140 }}>Wrap second</Button>
      </Flex>
      <Flex aria-label="Alignment" justify="space-between" style={{ width: 300 }}>
        <Button>Start</Button>
        <Button>End</Button>
      </Flex>
      <Flex aria-label="Inline" inline gap="sm">
        <Button>Inline first</Button>
        <Button>Inline second</Button>
      </Flex>
      <Flex
        aria-label="Reversed start"
        direction="row-reverse"
        justify="start"
        align="end"
        gap="sm"
        style={{ width: 300, minHeight: 72 }}
      >
        <Button>Reversed first</Button>
        <Button>Reversed second</Button>
      </Flex>
      <FloatButtonGroup fixed={false} actions={[{ key: 'save', label: 'Save' }]} />
    </ConfigProvider>
  );
}
