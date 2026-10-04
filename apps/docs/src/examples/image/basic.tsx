import { withBase } from '@rspress/core/runtime';
import { Image } from '@sudden3/leaf-ui';

export function ImageBasic() {
  return (
    <div className="leaf-demo-row">
      <Image src={withBase('/media/landscape-1.svg')} width={240} height={160} alt="绿色山谷" />
      <Image
        src="data:image/png;base64,invalid"
        width={140}
        height={160}
        alt="加载失败示例"
        fallback={<span>暂无图片</span>}
      />
    </div>
  );
}
