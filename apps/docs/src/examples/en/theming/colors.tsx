import { Button, Card, ColorPicker, ConfigProvider, Flex, Tabs, Tag } from '@ifhover/leaf-ui';
import { useState } from 'react';

const colorOptions = [
  ['primary', 'Primary'],
  ['success', 'Success'],
  ['danger', 'Danger'],
  ['warning', 'Warning'],
  ['info', 'Info'],
  ['neutral', 'Neutral'],
  ['mutedSurface', 'Muted surface'],
] as const;

export function ThemeColors() {
  const [colors, setColors] = useState({
    primary: '#1e964f',
    success: '#1e964f',
    danger: '#dd3f2e',
    warning: '#d38b11',
    info: '#1677ff',
    neutral: '#707070',
    mutedSurface: 'rgb(244,243,239)',
  });
  const [blackText, setBlackText] = useState(false);
  const foreground = blackText ? '#000000' : '#ffffff';
  return (
    <ConfigProvider
      theme={{
        primaryColor: colors.primary,
        appearance: 'light',
        tokens: {
          successColor: colors.success,
          dangerColor: colors.danger,
          warningColor: colors.warning,
          infoColor: colors.info,
          neutralColor: colors.neutral,
          mutedSurfaceColor: colors.mutedSurface,
          onPrimaryColor: foreground,
          onSuccessColor: foreground,
          onDangerColor: foreground,
          onWarningColor: foreground,
          onInfoColor: foreground,
        },
      }}
    >
      <Flex direction="column" gap={16}>
        <Flex wrap gap={12}>
          {colorOptions.map(([name, label]) => (
            <Flex key={name} direction="column" gap={4}>
              <span>{label}</span>
              <ColorPicker
                aria-label={label}
                value={colors[name]}
                disableAlpha
                showText
                onChange={(value) => setColors((previous) => ({ ...previous, [name]: value }))}
              />
            </Flex>
          ))}
        </Flex>
        <Flex wrap gap={8}>
          <Button variant="solid">Save</Button>
          <Tag color="success" variant="outline">
            Success
          </Tag>
          <Tag color="danger" variant="outline">
            Danger
          </Tag>
          <Tag color="warning" variant="outline">
            Warning
          </Tag>
          <Tag color="info" variant="outline">
            Info
          </Tag>
        </Flex>
        <Button onClick={() => setBlackText(!blackText)}>
          {blackText ? 'Use white text' : 'Use black text'}
        </Button>
        <Card
          variant="layered"
          size="sm"
          title="Shared muted surface"
          description="The Tabs track and card canvas share this surface."
        >
          <Tabs
            type="segmented"
            size="sm"
            block
            aria-label="Surface levels"
            items={[
              {
                key: 'surface',
                label: 'Content surface',
                children: 'The selected tab and inset content keep using the content surface.',
              },
              {
                key: 'muted',
                label: 'Muted surface',
                children: 'The Tabs track and card canvas share mutedSurfaceColor.',
              },
            ]}
          />
        </Card>
      </Flex>
    </ConfigProvider>
  );
}
