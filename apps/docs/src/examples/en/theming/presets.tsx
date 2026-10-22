import {
  Button,
  Card,
  ColorPicker,
  ConfigProvider,
  Input,
  type LeafTheme,
  Select,
  Space,
  Tabs,
} from '@ifhover/leaf-ui';
import { useState } from 'react';

export type ThemeStyle = 'default' | 'illustration' | 'windows-xp' | 'material' | 'skeuomorphic';

// Only style differences belong here. The library derives colors and interaction states.
export function createExampleTheme(style: ThemeStyle, primaryColor?: string): LeafTheme {
  const base: LeafTheme = primaryColor ? { primaryColor } : {};
  if (style === 'default') return base;
  if (style === 'illustration') {
    return {
      ...base,
      borderRadius: 4,
      tokens: {
        borderWidth: 2,
        borderColor: 'color-mix(in srgb, var(--leaf-color-primary) 12%, var(--leaf-color-text))',
        mutedSurfaceColor:
          'color-mix(in srgb, var(--leaf-color-primary) 8%, var(--leaf-color-surface))',
        controlShadow: '3px 3px 0 var(--leaf-color-border)',
        surfaceShadow: '6px 6px 0 var(--leaf-color-border)',
      },
    };
  }
  if (style === 'windows-xp') {
    const bevel = 'inset 1px 1px 0 rgb(255 255 255 / 0.7), inset -1px -1px 0 rgb(0 0 0 / 0.18)';
    return {
      ...base,
      borderRadius: 3,
      fontFamily: 'Tahoma, "Microsoft YaHei", sans-serif',
      tokens: {
        borderColor:
          'color-mix(in srgb, var(--leaf-color-primary) 45%, var(--leaf-color-text-muted))',
        mutedSurfaceColor:
          'color-mix(in srgb, var(--leaf-color-primary) 6%, var(--leaf-color-surface))',
        controlShadow: `${bevel}, 0 1px 2px rgb(0 0 0 / 0.12)`,
        surfaceShadow: `${bevel}, 2px 3px 6px rgb(0 0 0 / 0.18)`,
      },
      components: {
        Card: {
          headerBackground:
            'linear-gradient(180deg, var(--leaf-color-primary-surface-28), var(--leaf-color-primary-surface-8) 48%, var(--leaf-color-primary-surface-14))',
        },
        Button: {
          active: { shadow: 'inset 1px 2px 3px rgb(0 0 0 / 0.25)' },
        },
      },
    };
  }
  if (style === 'material') {
    return {
      ...base,
      borderRadius: 4,
      fontFamily: 'Roboto, "Inter Variable", "Microsoft YaHei", sans-serif',
      tokens: {
        surfaceShadow: '0 3px 8px rgb(0 0 0 / 0.12), 0 1px 3px rgb(0 0 0 / 0.1)',
      },
      components: {
        Button: {
          shadow: '0 2px 3px rgb(0 0 0 / 0.16), 0 1px 2px rgb(0 0 0 / 0.1)',
          hover: { shadow: '0 4px 8px rgb(0 0 0 / 0.2)' },
          active: { shadow: '0 1px 2px rgb(0 0 0 / 0.18)' },
        },
      },
    };
  }
  const highlight = 'light-dark(rgb(255 255 255 / 0.95), rgb(255 255 255 / 0.06))';
  const shade = 'light-dark(rgb(0 0 0 / 0.16), rgb(0 0 0 / 0.5))';
  return {
    ...base,
    borderRadius: 14,
    tokens: {
      surfaceColor:
        'light-dark(color-mix(in srgb, var(--leaf-color-primary) 3%, #eef0f3), color-mix(in srgb, var(--leaf-color-primary) 3%, #26282d))',
      mutedSurfaceColor:
        'color-mix(in srgb, var(--leaf-color-primary) 5%, var(--leaf-color-surface))',
      borderColor: 'color-mix(in srgb, var(--leaf-color-text) 12%, var(--leaf-color-surface))',
      controlShadow: `3px 3px 7px ${shade}, -3px -3px 7px ${highlight}, inset 0 1px 0 ${highlight}`,
      surfaceShadow: `6px 6px 14px ${shade}, -6px -6px 14px ${highlight}`,
    },
    components: {
      Button: {
        active: { shadow: `inset 3px 3px 6px ${shade}, inset -3px -3px 6px ${highlight}` },
      },
    },
  };
}

export function ThemePresets() {
  const [preset, setPreset] = useState<ThemeStyle>('illustration');
  const [color, setColor] = useState('#1e964f');
  return (
    <ConfigProvider theme={createExampleTheme(preset, color)}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Tabs
          type="card"
          aria-label="Theme style"
          activeKey={preset}
          onChange={(key) => setPreset(key as ThemeStyle)}
          items={[
            { key: 'default', label: 'Default' },
            { key: 'illustration', label: 'Illustration' },
            { key: 'windows-xp', label: 'Windows XP' },
            { key: 'material', label: 'Material' },
            { key: 'skeuomorphic', label: 'Skeuomorphic' },
          ]}
        />
        <ColorPicker
          aria-label="Primary color"
          value={color}
          onChange={setColor}
          format="hex"
          disableAlpha
          showText
        />
        <Card title="Your next good idea">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Input aria-label="Project name" placeholder="Name your project" />
            <Select
              aria-label="Project type"
              defaultValue="design"
              options={[
                { value: 'design', label: 'Design' },
                { value: 'development', label: 'Development' },
              ]}
            />
            <Space wrap>
              <Button>Create project</Button>
              <Button variant="outline">Maybe later</Button>
            </Space>
          </Space>
        </Card>
      </Space>
    </ConfigProvider>
  );
}
