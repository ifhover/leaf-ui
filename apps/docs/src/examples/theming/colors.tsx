import { Button, Card, ColorPicker, ConfigProvider, Flex, Tabs, Tag } from '@ifhover/leaf-ui';
import { useState } from 'react';

const colorOptions = [
  ['primary', '主题色'],
  ['success', '成功色'],
  ['danger', '危险色'],
  ['warning', '警告色'],
  ['info', '信息色'],
  ['neutral', '中性色'],
  ['mutedSurface', '共享底板'],
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
          <Button variant="solid">保存</Button>
          <Tag color="success" variant="outline">
            成功色
          </Tag>
          <Tag color="danger" variant="outline">
            危险色
          </Tag>
          <Tag color="warning" variant="outline">
            警告色
          </Tag>
          <Tag color="info" variant="outline">
            信息色
          </Tag>
        </Flex>
        <Button onClick={() => setBlackText(!blackText)}>
          {blackText ? '改为白字' : '改为黑字'}
        </Button>
        <Card
          variant="layered"
          size="sm"
          title="共享底板"
          description="Tabs 轨道与卡片外底共用这份底板。"
        >
          <Tabs
            type="segmented"
            size="sm"
            block
            aria-label="表面层级"
            items={[
              {
                key: 'surface',
                label: '内容表面',
                children: '选中的 Tabs 与内嵌内容仍使用内容表面。',
              },
              {
                key: 'muted',
                label: '共享底板',
                children: 'Tabs 轨道和外层画布共享 mutedSurfaceColor。',
              },
            ]}
          />
        </Card>
      </Flex>
    </ConfigProvider>
  );
}
