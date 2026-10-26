import { Image } from '@ifhover/leaf-ui';

const source = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 640"><rect width="960" height="640" fill="#b9d3bf"/><path d="M0 520L340 250L660 560L960 330V640H0Z" fill="#315242"/></svg>',
)}`;

export function ImageDisplay() {
  return <Image src={source} width="100%" height={240} alt="Green valley" preview={false} />;
}
