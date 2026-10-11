import { InputMask, Space } from '@ifhover/leaf-ui';

export function InputMaskFormats() {
  return (
    <Space direction="vertical" align="stretch" className="leaf-demo-stack">
      <strong className="leaf-demo-note">银行卡格式</strong>
      <InputMask mask="0000 0000 0000 0000" lazy={false} aria-label="卡号" />
      <strong className="leaf-demo-note">字母与数字规则</strong>
      <InputMask
        mask="AA-0000"
        definitions={{ A: /[A-Z]/ }}
        placeholder="AB-1234"
        aria-label="编号"
      />
    </Space>
  );
}
