import { ChevronDown, ChevronUp, Minus, Plus } from 'lucide-react';
import type { CSSProperties, InputHTMLAttributes, ReactNode, Ref, RefObject } from 'react';
import { ButtonControl, toIconButtonSize } from '../button/button';
import { useLeafConfig } from '../config-provider/context';
import { classes } from '../shared/classes';
import { FormValue } from '../shared/field';
import type { ControlSize, ControlStatus } from '../shared/types';
import type { InputNumberVariant } from './inputnumber';

export interface InputNumberFrameProps {
  variant: InputNumberVariant;
  size: ControlSize;
  status?: ControlStatus;
  disabled?: boolean;
  controls: boolean;
  prefix?: ReactNode;
  suffix?: ReactNode;
  className?: string;
  style?: CSSProperties;
  inputProps: InputHTMLAttributes<HTMLInputElement>;
  inputRef: Ref<HTMLInputElement>;
  formName?: string;
  form?: string;
  formValue: string;
  triggerRef: RefObject<HTMLInputElement | null>;
  increaseDisabled?: boolean;
  decreaseDisabled?: boolean;
  onStep: (direction: 1 | -1) => void;
}

/** 渲染数字输入框外壳、前后缀、原生输入和默认/两侧步进按钮。 */
export function InputNumberFrame({
  variant,
  size,
  status,
  disabled,
  controls,
  prefix,
  suffix,
  className,
  style,
  inputProps,
  inputRef,
  formName,
  form,
  formValue,
  triggerRef,
  increaseDisabled,
  decreaseDisabled,
  onStep,
}: InputNumberFrameProps) {
  const { messages } = useLeafConfig();
  const split = variant === 'split';

  return (
    <div
      className={classes(
        'leaf-input-number',
        `leaf-input-number--${size}`,
        split && 'leaf-input-number--split',
        className,
      )}
      style={style}
      data-status={status}
      data-disabled={disabled ? '' : undefined}
    >
      {split && controls && (
        <ButtonControl
          type="button"
          variant="outline"
          size={toIconButtonSize(size)}
          tabIndex={-1}
          className="leaf-input-number__step leaf-input-number__step--decrease"
          aria-label={messages.inputNumber.decrease}
          disabled={decreaseDisabled}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => onStep(-1)}
        >
          <Minus aria-hidden="true" />
        </ButtonControl>
      )}
      <div
        className={classes('leaf-input-number__field', `leaf-input-number__field--${size}`)}
        data-status={status}
        data-disabled={disabled ? '' : undefined}
      >
        {prefix && (
          <span className="leaf-input__affix" aria-hidden="true">
            {prefix}
          </span>
        )}
        <input
          {...inputProps}
          ref={inputRef}
          type="text"
          role="spinbutton"
          className="leaf-input-number__input"
        />
        <FormValue
          name={formName}
          form={form}
          value={formValue}
          disabled={disabled}
          triggerRef={triggerRef}
        />
        {suffix && (
          <span className="leaf-input__affix" aria-hidden="true">
            {suffix}
          </span>
        )}
        {!split && controls && (
          <span className="leaf-input-number__controls">
            {[1, -1].map((direction) => (
              <button
                key={direction}
                type="button"
                tabIndex={-1}
                aria-label={
                  direction === 1 ? messages.inputNumber.increase : messages.inputNumber.decrease
                }
                disabled={direction === 1 ? increaseDisabled : decreaseDisabled}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => onStep(direction as 1 | -1)}
              >
                {direction === 1 ? (
                  <ChevronUp size={12} aria-hidden="true" />
                ) : (
                  <ChevronDown size={12} aria-hidden="true" />
                )}
              </button>
            ))}
          </span>
        )}
      </div>
      {split && controls && (
        <ButtonControl
          type="button"
          variant="outline"
          size={toIconButtonSize(size)}
          tabIndex={-1}
          className="leaf-input-number__step leaf-input-number__step--increase"
          aria-label={messages.inputNumber.increase}
          disabled={increaseDisabled}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => onStep(1)}
        >
          <Plus aria-hidden="true" />
        </ButtonControl>
      )}
    </div>
  );
}
