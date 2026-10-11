import { Button, SignaturePad, Space } from '@ifhover/leaf-ui';
import { useState } from 'react';
export function SignaturePadControlled() {
  const [strokes, setStrokes] = useState<import('@ifhover/leaf-ui').SignatureStroke[]>([]);
  return (
    <Space direction="vertical" align="stretch" className="leaf-demo-stack leaf-demo-stack--wide">
      <SignaturePad
        value={strokes}
        onChange={setStrokes}
        penColor="#2463eb"
        minWidth={1}
        maxWidth={3}
      />
      <output className="leaf-demo-note">笔画数量: {strokes.length}</output>
      <Button variant="ghost" onClick={() => setStrokes([])}>
        清空受控值
      </Button>
    </Space>
  );
}
