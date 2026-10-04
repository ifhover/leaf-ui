import { Button, Image, SignaturePad } from '@sudden3/leaf-ui';
import { useEffect, useRef, useState } from 'react';
export function SignaturePadBasic() {
  const pad = useRef<import('@sudden3/leaf-ui').SignaturePadHandle>(null);
  const [result, setResult] = useState<Blob | null>(null);
  const [preview, setPreview] = useState('');
  useEffect(() => {
    if (!result) return;
    const url = URL.createObjectURL(result);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [result]);
  return (
    <div className="leaf-demo-stack leaf-demo-stack--wide">
      <SignaturePad ref={pad} />
      <Button
        variant="outline"
        onClick={async () => {
          const blob = await pad.current?.export();
          if (!blob) return;
          setResult(blob);
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'signature.png';
          link.click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        }}
      >
        Download signature
      </Button>
      {preview && (
        <div className="leaf-demo-case">
          <span className="leaf-demo-label">PNG export preview</span>
          <Image
            src={preview}
            alt="Exported signature"
            preview={false}
            fit="contain"
            width="100%"
          />
        </div>
      )}
    </div>
  );
}
