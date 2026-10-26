import { Image } from '@ifhover/leaf-ui';

const landscape = (background: string) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 640"><rect width="960" height="640" fill="${background}"/><circle cx="480" cy="180" r="72" fill="#fff" opacity=".5"/><path d="M0 520L340 250L660 560L960 330V640H0Z" fill="#315242" opacity=".55"/></svg>`,
  )}`;

export function ImageBasic() {
  return <Image src={landscape('#b9d3bf')} width="100%" height={240} alt="绿色山谷" />;
}
