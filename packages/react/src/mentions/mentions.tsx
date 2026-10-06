import { forwardRef, type ReactNode, useId, useRef, useState } from 'react';
import { useLeafConfig } from '../config-provider/context';
import { useFormField } from '../form/form';
import { classes } from '../shared/classes';
import { useFieldValue, useMergedRef } from '../shared/field';
import { FloatingPanel, type PopupOptions, useFloatingDismiss } from '../shared/floating';
import { Textarea, type TextareaProps } from '../textarea';
export interface MentionOption {
  value: string;
  label?: ReactNode;
  searchLabel?: string;
  disabled?: boolean;
}
export interface MentionsProps
  extends Omit<TextareaProps, 'value' | 'defaultValue' | 'onChange' | 'onSelect'>,
    PopupOptions {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onSearch?: (query: string, prefix: string) => void;
  onSelect?: (option: MentionOption, prefix: string) => void;
  options: readonly MentionOption[];
  prefixes?: readonly string[];
  split?: string;
  loading?: boolean;
  notFoundContent?: ReactNode;
}
const defaultPrefixes = ['@'];
export const Mentions = forwardRef<HTMLTextAreaElement, MentionsProps>(function Mentions(
  {
    value,
    defaultValue = '',
    onChange,
    onSearch,
    onSelect,
    options,
    prefixes = defaultPrefixes,
    split = ' ',
    loading,
    notFoundContent,
    popupPlacement,
    popupClassName,
    popupStyle,
    popupRender,
    getPopupContainer,
    ...props
  },
  ref,
) {
  const input = useRef<HTMLTextAreaElement>(null),
    panel = useRef<HTMLDivElement>(null),
    merged = useMergedRef(input, ref),
    id = useId(),
    field = useFormField();
  const { messages } = useLeafConfig();
  const [text, setText] = useFieldValue(value, defaultValue, input, props.form);
  const [match, setMatch] = useState<{
      start: number;
      end: number;
      prefix: string;
      query: string;
    } | null>(null),
    [active, setActive] = useState(0);
  const disabled = props.disabled || field?.disabled || props.readOnly;
  const find = (value: string, cursor: number) => {
    const before = value.slice(0, cursor);
    let found: typeof match = null;
    for (const prefix of prefixes) {
      const start = before.lastIndexOf(prefix);
      if (start < 0 || (start > 0 && !/\s/.test(before[start - 1] ?? ''))) continue;
      const query = before.slice(start + prefix.length);
      if (/\s/.test(query)) continue;
      if (!found || start > found.start) found = { start, end: cursor, prefix, query };
    }
    setMatch(found);
    setActive(0);
    if (found) onSearch?.(found.query, found.prefix);
  };
  const list = options.filter((option) =>
    (option.searchLabel ?? (typeof option.label === 'string' ? option.label : option.value))
      .toLocaleLowerCase()
      .includes(match?.query.toLocaleLowerCase() ?? ''),
  );
  const select = (option: MentionOption) => {
    if (!match || disabled || option.disabled) return;
    const insertion = match.prefix + option.value + split;
    const next = text.slice(0, match.start) + insertion + text.slice(match.end);
    setText(next);
    onChange?.(next);
    onSelect?.(option, match.prefix);
    setMatch(null);
    requestAnimationFrame(() => {
      input.current?.focus();
      input.current?.setSelectionRange(
        match.start + insertion.length,
        match.start + insertion.length,
      );
    });
  };
  const open = !!match && !disabled;
  useFloatingDismiss(open, () => setMatch(null), input, panel);
  return (
    <>
      <Textarea
        {...props}
        className={classes('leaf-mentions', props.className)}
        ref={merged}
        value={text}
        role="combobox"
        aria-autocomplete="list"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        aria-activedescendant={open && list[active] ? `${id}-${active}` : undefined}
        onChange={(event) => {
          setText(event.target.value);
          onChange?.(event.target.value);
          if (!(event.nativeEvent as InputEvent).isComposing)
            find(event.target.value, event.target.selectionStart);
        }}
        onCompositionEnd={(event) => {
          props.onCompositionEnd?.(event);
          find(event.currentTarget.value, event.currentTarget.selectionStart);
        }}
        onClick={(event) => {
          props.onClick?.(event);
          find(event.currentTarget.value, event.currentTarget.selectionStart);
        }}
        onSelect={(event) => {
          find(event.currentTarget.value, event.currentTarget.selectionStart);
        }}
        onKeyDown={(event) => {
          props.onKeyDown?.(event);
          if (event.defaultPrevented || event.nativeEvent.isComposing || !open) return;
          if (['ArrowUp', 'ArrowDown'].includes(event.key)) {
            event.preventDefault();
            let next = active;
            for (let i = 0; i < list.length; i++) {
              next = (next + (event.key === 'ArrowDown' ? 1 : -1) + list.length) % list.length;
              if (!list[next]?.disabled) break;
            }
            setActive(next);
          }
          const option = list[active];
          if (event.key === 'Enter' && option) {
            event.preventDefault();
            select(option);
          }
          if (event.key === 'Escape') {
            event.preventDefault();
            setMatch(null);
          }
        }}
      />
      <FloatingPanel
        open={open}
        triggerRef={input}
        panelRef={panel}
        matchWidth
        placement={popupPlacement}
        style={popupStyle}
        render={popupRender}
        container={getPopupContainer}
        className={classes('leaf-floating', 'leaf-mentions__panel', popupClassName)}
        role="listbox"
        id={id}
        aria-label={messages.search}
      >
        {list.length ? (
          list.map((option, index) => (
            <button
              key={option.value}
              id={`${id}-${index}`}
              type="button"
              role="option"
              aria-selected={active === index}
              disabled={option.disabled}
              tabIndex={-1}
              className="leaf-floating__option"
              onMouseDown={(event) => event.preventDefault()}
              onMouseEnter={() => setActive(index)}
              onClick={() => select(option)}
            >
              <span className="leaf-mentions__prefix" aria-hidden="true">
                {match?.prefix}
              </span>
              {option.label ?? option.value}
            </button>
          ))
        ) : (
          <div className="leaf-floating__empty">
            {loading ? messages.loading : (notFoundContent ?? messages.empty)}
          </div>
        )}
      </FloatingPanel>
    </>
  );
});
