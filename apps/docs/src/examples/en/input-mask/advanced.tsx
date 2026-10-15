import { InputMask, Space, Text } from '@ifhover/leaf-ui';

export function InputMaskFormats() {
  return (
    <Space direction="vertical" align="stretch">
      <Text tone="muted">Card number format</Text>
      <InputMask mask="0000 0000 0000 0000" lazy={false} aria-label="Card number" />
      <Text tone="muted">Custom letter and digit rules</Text>
      <InputMask
        mask="AA-0000"
        definitions={{ A: /[A-Z]/ }}
        placeholder="AB-1234"
        aria-label="Identifier"
      />
    </Space>
  );
}
