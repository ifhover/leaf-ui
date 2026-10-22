import { Badge, Button, ConfigProvider, Tag } from '@ifhover/leaf-ui';
import type { CSSProperties } from 'react';

const tones = ['primary', 'success', 'warning', 'danger', 'info'] as const;

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
        {tones.map((tone) => (
          <Tag
            key={`solid-${tone}`}
            color={tone}
            variant="solid"
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

export function SemanticColorContractFixture() {
  const localVariables = {
    '--semantic-primary': '#ffeb3b',
    '--semantic-success': '#a3e635',
    '--custom-tag-color': '#ffeb3b',
  } as CSSProperties;

  return (
    <ConfigProvider theme={{ motion: false }} style={{ display: 'grid', gap: 24 }}>
      <h1>Semantic color contracts</h1>
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
        <Tag color="var(--custom-tag-color)" variant="solid" data-testid="expression-dynamic-solid">
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
            Button: { color: '#123456', background: '#f0f0f0' },
          },
        }}
      >
        <Tag data-testid="component-override-tag-soft">Component override soft</Tag>
        <Tag variant="solid" data-testid="component-override-tag-solid">
          Component override solid
        </Tag>
        <Button variant="solid" data-testid="component-override-button">
          Component override button
        </Button>
      </ConfigProvider>
    </ConfigProvider>
  );
}
