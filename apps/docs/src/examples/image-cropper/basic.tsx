import { Image, ImageCropper, Space } from '@ifhover/leaf-ui';
import { withBase } from '@rspress/core/runtime';
import { useEffect, useState } from 'react';
export function ImageCropperBasic() {
  const [result, setResult] = useState<Blob | null>(null);
  const [url, setUrl] = useState('');
  useEffect(() => {
    if (!result) return;
    const address = URL.createObjectURL(result);
    setUrl(address);
    return () => URL.revokeObjectURL(address);
  }, [result]);
  return (
    <Space direction="vertical" align="stretch" className="leaf-demo-stack leaf-demo-stack--wide">
      <ImageCropper
        src={withBase('/media/landscape-1.svg')}
        onExport={(result) => setResult(result.blob)}
      />
      {url && <Image src={url} alt="裁剪结果" width={220} fit="contain" />}
    </Space>
  );
}
