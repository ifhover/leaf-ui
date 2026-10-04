import { Button, SignaturePad } from '@sudden3/leaf-ui';
import { useState } from 'react';
export function SignaturePadControlled() {
  const [strokes, setStrokes] = useState<import('@sudden3/leaf-ui').SignatureStroke[]>([]);
  return (
    <div className="leaf-demo-stack leaf-demo-stack--wide">
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
    </div>
  );
}
