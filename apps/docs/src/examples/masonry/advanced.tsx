import { Image, Masonry } from '@ifhover/leaf-ui';

const landscapes = [
  { background: '#b9d3bf', height: 640 },
  { background: '#dae2eb', height: 960 },
  { background: '#e1d9ca', height: 480 },
  { background: '#d3ddd2', height: 800 },
].map(({ background, height }) => ({
  height,
  src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 ${height}"><rect width="960" height="${height}" fill="${background}"/><circle cx="700" cy="150" r="72" fill="#fff" opacity=".5"/><path d="M0 ${height}V${height * 0.8}L340 ${height * 0.4}L660 ${height * 0.85}L960 ${height * 0.5}V${height}Z" fill="#315242" opacity=".55"/></svg>`,
  )}`,
}));

export function MasonryImages() {
  return (
    <Masonry columns={{ xs: 1, sm: 2 }}>
      {landscapes.map((image, index) => (
        <Image
          key={image.src}
          src={image.src}
          alt={`风景 ${index + 1}`}
          width="100%"
          style={{ aspectRatio: 960 / image.height }}
          preview={false}
        />
      ))}
    </Masonry>
  );
}
