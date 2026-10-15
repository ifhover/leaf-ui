import { InputOTP, Space, Text } from '@ifhover/leaf-ui';

export function InputOTPOptions() {
  return (
    <Space direction="vertical" align="stretch">
      <Text tone="muted">字母与数字</Text>
      <InputOTP
        mode="alphanumeric"
        length={8}
        separator={(index) => (index === 3 ? <span>—</span> : null)}
      />
      <Text tone="muted">隐藏字符</Text>
      <InputOTP length={4} mask size="lg" />
      <Text tone="muted">禁用</Text>
      <InputOTP defaultValue="123456" disabled />
    </Space>
  );
}
