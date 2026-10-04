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
      <output className="leaf-demo-note">Stroke count: {strokes.length}</output>
      <Button variant="ghost" onClick={() => setStrokes([])}>
        Clear controlled value
      </Button>
    </div>
  );
}
