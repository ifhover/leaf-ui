import { QRCode } from '@ifhover/leaf-ui';

export function QRCodeStatus() {
  return (
    <QRCode
      value="https://ifhover.github.io/leaf-ui/"
      status="loading"
      aria-label="加载中的二维码"
    />
  );
}
