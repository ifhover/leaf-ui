import { InputMask, Space, Text } from '@ifhover/leaf-ui';

export function InputMaskFormats() {
  return (
    <Space direction="vertical" align="stretch">
      <Text tone="muted">银行卡格式</Text>
      <InputMask mask="0000 0000 0000 0000" lazy={false} aria-label="卡号" />
      <Text tone="muted">字母与数字规则</Text>
      <InputMask
        mask="AA-0000"
        definitions={{ A: /[A-Z]/ }}
        placeholder="AB-1234"
        aria-label="编号"
      />
    </Space>
  );
}
