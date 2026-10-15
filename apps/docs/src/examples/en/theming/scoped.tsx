import { Button, ConfigProvider, Flex } from '@ifhover/leaf-ui';

export function ThemeScoped() {
  return (
    <ConfigProvider theme={{ primaryColor: '#1677ff', borderRadius: 8 }}>
      <Flex direction="column" gap="md" align="start">
        <Button>Global blue</Button>
        <ConfigProvider theme={{ primaryColor: '#7654c6' }}>
          <Button>Local purple</Button>
        </ConfigProvider>
      </Flex>
    </ConfigProvider>
  );
}
