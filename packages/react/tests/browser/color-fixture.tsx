import { Button, ConfigProvider, Tag } from '@sudden3/leaf-ui';
import { type CSSProperties, useState } from 'react';

export function ColorFixture() {
  const [changed, setChanged] = useState(false);
  return (
    <div
      data-testid="color-parent"
      style={
        {
          '--demo-accent': changed ? '#0000ff' : '#ff0000',
          '--demo-surface': changed ? '#000000' : '#ffffff',
        } as CSSProperties
      }
    >
      <Button onClick={() => setChanged(!changed)}>Change custom palette</Button>
      <ConfigProvider
        data-testid="variable-theme"
        theme={{
          primaryColor: 'var(--demo-accent)',
          tokens: { surfaceColor: 'var(--demo-surface)' },
        }}
      >
        <Button>Custom primary</Button>
        <Tag data-testid="variable-tag" color="var(--demo-accent)">
          Custom tag
        </Tag>
      </ConfigProvider>
    </div>
  );
}
