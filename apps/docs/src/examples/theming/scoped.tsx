import { Button, ConfigProvider, Flex } from '@ifhover/leaf-ui';

export function ThemeScoped() {
  return (
    <ConfigProvider theme={{ primaryColor: '#1677ff', borderRadius: 8 }}>
      <Flex direction="column" gap="md" align="start">
        <Button>全局蓝色</Button>
        <ConfigProvider theme={{ primaryColor: '#7654c6' }}>
          <Button>局部紫色</Button>
        </ConfigProvider>
      </Flex>
    </ConfigProvider>
  );
}
