import {
  Badge,
  Button,
  Calendar,
  ConfigProvider,
  DatePicker,
  Radio,
  Steps,
  Switch,
  Tag,
} from '@ifhover/leaf-ui';
import type { CSSProperties } from 'react';
import { useState } from 'react';

const tones = ['primary', 'success', 'warning', 'danger', 'info'] as const;
const feedbackTones = ['success', 'warning', 'danger', 'info'] as const;

function SemanticSamples({ name }: { name: string }) {
  return (
    <section aria-label={`${name} semantic samples`} style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {tones.map((tone) => (
          <Tag key={`soft-${tone}`} color={tone} data-testid={`${name}-soft-${tone}`}>
            {tone} soft
          </Tag>
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {feedbackTones.map((tone) => (
          <Badge
            key={`badge-${tone}`}
            count={8}
            status={tone}
            aria-label={`${name} ${tone} badge`}
            data-testid={`${name}-badge-${tone}`}
          />
        ))}
        <span data-testid={`${name}-switch-primary`}>
          <Switch defaultChecked aria-label={`${name} primary switch`} />
        </span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {tones.map((tone) => (
          <Tag
            key={`solid-${tone}`}
            color={tone}
            variant="outline"
            data-testid={`${name}-solid-${tone}`}
          >
            {tone} solid
          </Tag>
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <Button variant="solid" data-testid={`${name}-button-primary`}>
          Primary action
        </Button>
        <Button danger variant="solid" data-testid={`${name}-button-danger`}>
          Danger action
        </Button>
        <Button danger variant="link" data-testid={`${name}-link-danger`}>
          Danger text action
        </Button>
      </div>
    </section>
  );
}

function AppearanceSwitchSamples() {
  const [appearance, setAppearance] = useState<'light' | 'dark'>('light');
  return (
    <section aria-label="Appearance switch samples" style={{ display: 'grid', gap: 12 }}>
      <button
        type="button"
        data-testid="toggle-semantic-appearance"
        onClick={() => setAppearance((current) => (current === 'light' ? 'dark' : 'light'))}
      >
        Switch semantic appearance
      </button>
      <ConfigProvider theme={{ appearance, primaryColor: '#18181b' }}>
        <div
          data-testid="mode-switch-scope"
          data-appearance={appearance}
          style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}
        >
          <Button variant="solid" data-testid="mode-switch-button">
            Primary action
          </Button>
          <Tag color="primary" variant="outline" data-testid="mode-switch-tag">
            Primary tag
          </Tag>
          <Badge color="var(--leaf-color-primary)" count={8} data-testid="mode-switch-badge" />
          <Switch defaultChecked aria-label="Mode switch primary" />
        </div>
      </ConfigProvider>
    </section>
  );
}

function PrimaryColorSamples({ name, primaryColor }: { name: string; primaryColor: string }) {
  return (
    <ConfigProvider
      data-testid={`${name}-primary`}
      theme={{ appearance: 'dark', primaryColor }}
      style={
        {
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          ...(name === 'expression' ? { '--contract-expression-primary': '#18181b' } : {}),
        } as CSSProperties
      }
    >
      <Button variant="solid" data-testid={`${name}-primary-button`}>
        {name} primary action
      </Button>
      <Tag color="primary" variant="outline" data-testid={`${name}-primary-tag`}>
        {name} primary tag
      </Tag>
      <Badge color="var(--leaf-color-primary)" count={8} data-testid={`${name}-primary-badge`} />
    </ConfigProvider>
  );
}

function JsColorConfiguration() {
  const [changed, setChanged] = useState(false);
  const [blackText, setBlackText] = useState(false);
  const foreground = blackText ? '#000000' : '#ffffff';
  return (
    <ConfigProvider
      data-testid="js-color-config"
      theme={{
        appearance: 'dark',
        primaryColor: changed ? '#ff6900' : '#000000',
        tokens: {
          neutralColor: changed ? '#64748b' : '#707070',
          onPrimaryColor: foreground,
          onSuccessColor: foreground,
          onWarningColor: foreground,
          onDangerColor: foreground,
          onInfoColor: foreground,
        },
      }}
    >
      <Button onClick={() => setChanged(!changed)} data-testid="change-js-colors">
        Change JS colors
      </Button>
      <Button onClick={() => setBlackText(!blackText)} data-testid="change-js-foreground">
        Change JS foreground
      </Button>
      <Button data-testid="black-outline">Outline</Button>
      <Button variant="solid" data-testid="js-solid-button">
        Solid
      </Button>
      {(['primary', 'success', 'warning', 'danger', 'info'] as const).map((tone) => (
        <Tag key={tone} color={tone} variant="outline" data-testid={`js-solid-${tone}`}>
          {tone}
        </Tag>
      ))}
      <Tag color="#ffff00" variant="outline" data-testid="js-custom-tag">
        Custom
      </Tag>
      <Badge count={8} color="#ffff00" data-testid="js-custom-badge" />
    </ConfigProvider>
  );
}

export function SemanticColorContractFixture() {
  const localVariables = {
    '--semantic-primary': '#ffeb3b',
    '--semantic-success': '#a3e635',
    '--custom-tag-color': '#ffeb3b',
  } as CSSProperties;

  return (
    <ConfigProvider theme={{ motion: false }} style={{ display: 'grid', gap: 24 }}>
      <h1>Semantic color contracts</h1>
      {(['light', 'dark'] as const).map((appearance) => (
        <ConfigProvider
          key={appearance}
          theme={{ appearance, primaryColor: '#ffffff', tokens: { dangerColor: '#ffffff' } }}
        >
          <Button variant="solid" data-testid={`white-${appearance}-button`}>
            White primary
          </Button>
          <Button danger variant="solid" data-testid={`white-${appearance}-danger`}>
            White danger
          </Button>
          <Button variant="solid" disabled data-testid={`white-${appearance}-disabled`}>
            White disabled
          </Button>
          <Button variant="solid" loading data-testid={`white-${appearance}-loading`}>
            White loading
          </Button>
        </ConfigProvider>
      ))}
      <JsColorConfiguration />
      <ConfigProvider data-testid="hwb-theme" theme={{ primaryColor: 'hwb(146 12% 21%)' }}>
        <Tag data-testid="hwb-themed-tag">HWB theme</Tag>
        <Tag color="hwb(146 12% 21%)" variant="outline" data-testid="hwb-custom-tag">
          HWB custom
        </Tag>
        <Badge color="hwb(146 12% 21%)" count={8} data-testid="hwb-custom-badge" />
      </ConfigProvider>
      <ConfigProvider
        data-testid="solid-selection-theme"
        theme={{ appearance: 'dark', primaryColor: '#18181b', motion: false }}
      >
        <Radio defaultChecked aria-label="Dark solid radio" />
        <Switch defaultChecked loading aria-label="Dark loading switch" />
        <Tag color="#18181b" variant="outline" closable data-testid="dark-custom-solid-tag">
          Dark custom solid
        </Tag>
        <Steps items={[{ title: 'Done' }, { title: 'Next' }]} current={1} />
        <Calendar
          aria-label="Dark solid calendar"
          fullscreen={false}
          defaultValue={new Date(2025, 0, 15)}
        />
        <DatePicker aria-label="Dark solid date picker" defaultValue={new Date(2025, 0, 15)} />
      </ConfigProvider>
      <AppearanceSwitchSamples />
      <PrimaryColorSamples name="concrete" primaryColor="#18181b" />
      <PrimaryColorSamples name="expression" primaryColor="var(--contract-expression-primary)" />
      <SemanticSamples name="default" />
      <ConfigProvider
        theme={{
          primaryColor: '#ffeb3b',
          tokens: {
            successColor: '#8bc34a',
            warningColor: '#ffff00',
            dangerColor: '#ff5252',
            infoColor: '#64b5f6',
            surfaceColor: '#f5f2e8',
            mutedSurfaceColor: '#e9e3d5',
          },
        }}
      >
        <SemanticSamples name="custom" />
        <Tag
          color="var(--custom-tag-color)"
          data-testid="custom-expression-tag"
          style={localVariables}
        >
          Expression custom
        </Tag>
        <Tag
          color="#ffeb3b"
          data-testid="custom-explicit-tag"
          style={{ '--leaf-tag-ink': 'rgb(1, 2, 3)' } as CSSProperties}
        >
          Explicit local variable
        </Tag>
      </ConfigProvider>
      <ConfigProvider
        theme={{
          appearance: 'light',
          primaryColor: 'var(--semantic-primary)',
          tokens: {
            successColor: 'var(--semantic-success)',
            surfaceColor: 'color-mix(in srgb, #f4efe3 90%, white)',
            mutedSurfaceColor: 'color-mix(in srgb, #e4dccb 90%, white)',
          },
        }}
        style={localVariables}
      >
        <SemanticSamples name="expression" />
        <Tag color="oklch(90% 0.15 100)" data-testid="expression-color4-soft">
          Color 4 soft
        </Tag>
        <Tag
          color="var(--custom-tag-color)"
          variant="outline"
          data-testid="expression-dynamic-solid"
        >
          Dynamic solid
        </Tag>
        <Badge color="var(--custom-tag-color)" count={8} data-testid="expression-dynamic-badge" />
      </ConfigProvider>
      <ConfigProvider theme={{ tokens: { onPrimaryColor: '#123456' } }}>
        <Button variant="solid" data-testid="explicit-on-primary">
          Explicit primary label
        </Button>
      </ConfigProvider>
      <ConfigProvider
        theme={{
          components: {
            Tag: { color: '#123456', background: '#f0f0f0' },
            Button: {
              color: '#123456',
              background: '#f0f0f0',
              borderColor: '#234567',
              active: { borderColor: '#345678' },
            },
          },
        }}
      >
        <Tag data-testid="component-override-tag-soft">Component override soft</Tag>
        <Tag variant="outline" data-testid="component-override-tag-solid">
          Component override solid
        </Tag>
        <Button variant="solid" data-testid="component-override-button">
          Component override button
        </Button>
      </ConfigProvider>
    </ConfigProvider>
  );
}
