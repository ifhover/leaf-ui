import { X } from 'lucide-react';
import { classes } from './classes';

export interface ClearButtonProps {
  label: string;
  onClear: () => void;
  beforeArrow?: boolean;
  anchored?: boolean;
  inline?: boolean;
  alwaysVisible?: boolean;
  tabIndex?: number;
  className?: string;
}

/** 共用清除按钮：默认在可悬停设备上隐藏，悬停时悬浮在控件末尾且不占用布局宽度。 */
export function ClearButton({
  label,
  onClear,
  beforeArrow = false,
  anchored = false,
  inline = false,
  alwaysVisible = false,
  tabIndex,
  className,
}: ClearButtonProps) {
  const button = (
    <button
      type="button"
      tabIndex={tabIndex}
      aria-label={label}
      className="leaf-clear__button"
      // 阻止按压抢占输入框或触发器焦点，避免打断当前编辑态或误关弹层。
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClear}
    >
      <X size={14} aria-hidden="true" />
    </button>
  );

  return (
    <span
      className={classes(
        'leaf-clear',
        beforeArrow && 'leaf-clear--before-arrow',
        anchored && 'leaf-clear--anchored',
        inline && 'leaf-clear--inline',
        alwaysVisible && 'leaf-clear--always',
        className,
      )}
    >
      {anchored ? <span className="leaf-clear__float">{button}</span> : button}
    </span>
  );
}
