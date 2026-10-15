import { Flex, Image } from '@ifhover/leaf-ui';
import { withBase } from '@rspress/core/runtime';

export function ImageBasic() {
  return (
    <Flex gap="md" align="center" wrap justify="center">
      <Image src={withBase('/media/landscape-1.svg')} width={240} height={160} alt="绿色山谷" />
      <Image
        src="data:image/png;base64,invalid"
        width={140}
        height={160}
        alt="加载失败示例"
        fallback={<span>暂无图片</span>}
      />
    </Flex>
  );
}
