import { InputOTP, Space, Text } from '@ifhover/leaf-ui';

export function InputOTPOptions() {
  return (
    <Space direction="vertical" align="stretch">
      <Text tone="muted">Letters and digits</Text>
      <InputOTP
        mode="alphanumeric"
        length={8}
        separator={(index) => (index === 3 ? <span>—</span> : null)}
      />
      <Text tone="muted">Masked characters</Text>
      <InputOTP length={4} mask size="lg" />
      <Text tone="muted">Disabled</Text>
      <InputOTP defaultValue="123456" disabled />
    </Space>
  );
}
