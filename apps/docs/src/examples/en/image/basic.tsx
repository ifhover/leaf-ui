import { Image, Space } from '@ifhover/leaf-ui';
import { withBase } from '@rspress/core/runtime';

export function ImageBasic() {
  return (
    <Space wrap className="leaf-demo-row">
      <Image src={withBase('/media/landscape-1.svg')} width={240} height={160} alt="Green valley" />
      <Image
        src="data:image/png;base64,invalid"
        width={140}
        height={160}
        alt="Failed image example"
        fallback={<span>No image</span>}
      />
    </Space>
  );
}
