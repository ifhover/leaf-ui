import { InputOTP } from '@sudden3/leaf-ui';

export function InputOTPOptions() {
  return (
    <div className="leaf-demo-stack">
      <strong className="leaf-demo-note">Letters and digits</strong>
      <InputOTP
        mode="alphanumeric"
        length={8}
        separator={(index) => (index === 3 ? <span>—</span> : null)}
      />
      <strong className="leaf-demo-note">Masked characters</strong>
      <InputOTP length={4} mask size="lg" />
      <strong className="leaf-demo-note">Disabled</strong>
      <InputOTP defaultValue="123456" disabled />
    </div>
  );
}
