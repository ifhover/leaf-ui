import { withBase } from '@rspress/core/runtime';
import { Image, ImageCropper } from '@sudden3/leaf-ui';
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
    <div className="leaf-demo-stack leaf-demo-stack--wide">
      <ImageCropper
        src={withBase('/media/landscape-1.svg')}
        aspect={4 / 3}
        onExport={(result) => setResult(result.blob)}
      />
      {url && <Image src={url} alt="裁剪结果" width={220} height={165} />}
    </div>
  );
}
