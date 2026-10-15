import { Button, ConfigProvider } from '@ifhover/leaf-ui';

export function ThemeBasic() {
  return (
    <ConfigProvider theme={{ primaryColor: '#7654c6', borderRadius: 8 }}>
      <Button>Save changes</Button>
    </ConfigProvider>
  );
}
