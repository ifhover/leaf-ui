import { InputMask } from '@sudden3/leaf-ui';

export function InputMaskFormats() {
  return (
    <div className="leaf-demo-stack">
      <strong className="leaf-demo-note">Card number format</strong>
      <InputMask mask="0000 0000 0000 0000" lazy={false} aria-label="Card number" />
      <strong className="leaf-demo-note">Custom letter and digit rules</strong>
      <InputMask
        mask="AA-0000"
        definitions={{ A: /[A-Z]/ }}
        placeholder="AB-1234"
        aria-label="Identifier"
      />
    </div>
  );
}
