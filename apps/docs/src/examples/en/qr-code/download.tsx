import { QRCode } from '@ifhover/leaf-ui';

export function QRCodeDownload() {
  return (
    <QRCode
      value="https://ifhover.github.io/leaf-ui/"
      downloadable
      fileName="leaf-ui-docs.svg"
      aria-label="Downloadable documentation QR code"
    />
  );
}
