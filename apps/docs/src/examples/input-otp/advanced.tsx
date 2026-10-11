import { InputOTP, Space } from '@ifhover/leaf-ui';

export function InputOTPOptions() {
  return (
    <Space direction="vertical" align="stretch" className="leaf-demo-stack">
      <strong className="leaf-demo-note">字母与数字</strong>
      <InputOTP
        mode="alphanumeric"
        length={8}
        separator={(index) => (index === 3 ? <span>—</span> : null)}
      />
      <strong className="leaf-demo-note">隐藏字符</strong>
      <InputOTP length={4} mask size="lg" />
      <strong className="leaf-demo-note">禁用</strong>
      <InputOTP defaultValue="123456" disabled />
    </Space>
  );
}
