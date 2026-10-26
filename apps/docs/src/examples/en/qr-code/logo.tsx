import { QRCode } from '@ifhover/leaf-ui';

const logo = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="#fff"/><path d="M8 16l5 5 11-11" fill="none" stroke="#315242" stroke-width="4"/></svg>',
)}`;

export function QRCodeLogo() {
  return (
    <QRCode
      value="https://ifhover.github.io/leaf-ui/"
      logo={logo}
      level="H"
      aria-label="Documentation QR code with a logo"
    />
  );
}
