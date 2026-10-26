import {
  type ChangeEvent,
  type ClipboardEvent,
  type CompositionEvent,
  type KeyboardEvent,
  type MouseEvent,
  type RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {
  emptySegments,
  type PickerSegments,
  renderSegments,
  type SegmentEdit,
  type SegmentKind,
  type SegmentLabels,
  segmentAt,
  segmentText,
  segmentValues,
  stepSegment,
  typeSegment,
} from './segments';

const useBrowserLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;
const placeholders = {
  year: 'YYYY',
  quarter: 'Q',
  month: 'MM',
  week: 'WW',
  day: 'DD',
  hour: 'HH',
  hour12: 'hh',
  minute: 'mm',
  second: 'ss',
  period: '--',
};

/** A single native input preserves labels, refs, selection and clipboard support. */
export function useSegmentedInput({
  config,
  input,
  displayValue,
  text,
  dirty,
  readOnly,
  periods,
  weekStartsOn,
  onEdit,
  onSegmentChange,
}: {
  config?: PickerSegments;
  input: RefObject<HTMLInputElement | null>;
  displayValue: string;
  text: string;
  dirty: boolean;
  readOnly?: boolean;
  periods: readonly [string, string];
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  onEdit: (text: string) => void;
  onSegmentChange?: (group: number) => void;
}) {
  const labels: SegmentLabels = { placeholders, periods };
  const [edit, setEdit] = useState<SegmentEdit | null>(null);
  const state = useRef<SegmentEdit | null>(null);
  const selection = useRef<number | null>(null);
  const pendingGroup = useRef<number | null>(null);
  const active = useRef(0);
  const composing = useRef(false);
  const [compositionText, setCompositionText] = useState<string | null>(null);
  const compositionInput = useRef<string | null>(null);
  const reset = useCallback(() => {
    state.current = null;
    setEdit(null);
    composing.current = false;
    setCompositionText(null);
    compositionInput.current = null;
    pendingGroup.current = null;
  }, []);
  const sourceKey = JSON.stringify([displayValue, config?.template]);
  const previousSource = useRef(sourceKey);
  // Values supplied by the owner only replace the editing draft on an external value change.
  // In particular, editing a calendar draft must not reset the keyboard buffer.
  useEffect(() => {
    if (previousSource.current === sourceKey) return;
    previousSource.current = sourceKey;
    state.current = null;
    setEdit(null);
  }, [sourceKey]);
  const values = config
    ? (edit?.values ?? segmentValues(config.template, config.dates, weekStartsOn))
    : [];
  const rendered = config ? renderSegments(config.template, values, labels) : null;
  const value =
    !config || (dirty && !edit)
      ? dirty
        ? text
        : displayValue
      : values.every((value) => value === null)
        ? ''
        : (rendered?.text ?? '');
  useBrowserLayoutEffect(() => {
    if (selection.current !== null && rendered && document.activeElement === input.current) {
      const range = rendered.ranges[selection.current];
      if (range) input.current?.setSelectionRange(range[0], range[1]);
      selection.current = null;
    }
    // The owner must see the newly parsed draft when a native insertion crosses endpoints.
    const group = pendingGroup.current;
    pendingGroup.current = null;
    if (group !== null) onSegmentChange?.(group);
  });
  const select = (index: number) => {
    active.current = index;
    selection.current = index;
    const group = config?.template.segments[index]?.group;
    if (group !== undefined) onSegmentChange?.(group);
    const range = rendered?.ranges[index];
    if (range) input.current?.setSelectionRange(range[0], range[1]);
  };
  const current = (): SegmentEdit =>
    state.current ?? { values: [...values], active: active.current, buffer: '' };
  const update = (next: SegmentEdit) => {
    if (!config) return;
    state.current = next;
    active.current = next.active;
    selection.current = next.active;
    setEdit(next);
    onEdit(segmentText(config.template, next.values, labels));
    pendingGroup.current = config.template.segments[next.active]?.group ?? null;
  };
  const insert = (text: string, replaceAll = false) => {
    if (!config) return;
    const previous = current();
    let next = previous;
    let changed = false;
    if (replaceAll && !next.buffer)
      next = { values: emptySegments(config.template), active: 0, buffer: '' };
    for (const char of text) {
      if (char === ' ') {
        next = {
          ...next,
          active: Math.min(next.active + 1, config.template.segments.length - 1),
          buffer: '',
        };
        changed = true;
      } else {
        const typed = typeSegment(config.template, next, char, periods);
        if (typed) {
          next = typed;
          changed = true;
        }
      }
    }
    if (changed) update(next);
    else {
      selection.current = active.current;
      setEdit({ ...previous });
    }
  };
  return {
    value: compositionText ?? value,
    isComposing: composing.current,
    active: config?.template.segments[active.current],
    reset,
    focus(kind?: SegmentKind, group = 0) {
      if (!config) return;
      const index = kind
        ? config.template.segments.findIndex(
            (segment) => segment.kind === kind && segment.group === group,
          )
        : active.current;
      input.current?.focus({ preventScroll: true });
      select(Math.max(0, index));
    },
    onFocus() {
      if (!config) return;
      select(active.current);
    },
    onClick(event: MouseEvent<HTMLInputElement>) {
      if (!config || (dirty && !edit)) return;
      const index = values.every((value) => value === null)
        ? 0
        : segmentAt(rendered?.ranges ?? [], event.currentTarget.selectionStart ?? 0);
      state.current = { values: [...values], active: index, buffer: '' };
      select(index);
    },
    onChange(event: ChangeEvent<HTMLInputElement>) {
      if (!config || readOnly) return false;
      const incoming = event.currentTarget.value;
      const native = event.nativeEvent as InputEvent;
      if (composing.current || native.isComposing) {
        setCompositionText(incoming);
        return true;
      }
      // Some engines dispatch the final input after compositionend; do not apply it twice.
      if (incoming === compositionInput.current) {
        compositionInput.current = null;
        selection.current = active.current;
        if (state.current) setEdit({ ...state.current });
        return true;
      }
      compositionInput.current = null;
      if (!incoming) {
        update({ values: emptySegments(config.template), active: 0, buffer: '' });
      } else if (native.inputType?.startsWith('delete') && !(dirty && !edit)) {
        const next = current();
        const values = [...next.values];
        values[next.active] = null;
        update({ ...next, values, buffer: '' });
      } else if (
        !(dirty && !edit) &&
        native.inputType !== 'insertFromPaste' &&
        native.inputType !== 'insertReplacementText' &&
        (native.data != null || /^[\d０-９]+$/.test(incoming))
      ) {
        // Virtual keyboards and IMEs may insert several digits without any keydown event.
        insert(native.data ?? incoming, native.data == null || incoming === native.data);
      } else {
        state.current = null;
        setEdit(null);
        onEdit(incoming);
      }
      return true;
    },
    onCompositionStart() {
      if (!config || readOnly) return;
      composing.current = true;
      selection.current = null;
      compositionInput.current = null;
      setCompositionText(input.current?.value ?? value);
    },
    onCompositionEnd(event: CompositionEvent<HTMLInputElement>) {
      if (!config || readOnly || !composing.current) return;
      composing.current = false;
      setCompositionText(null);
      compositionInput.current = event.currentTarget.value;
      if (dirty && !edit) onEdit(event.currentTarget.value);
      else insert(event.data, event.currentTarget.value === event.data);
    },
    onPaste(event: ClipboardEvent<HTMLInputElement>) {
      if (!config || readOnly) return;
      event.preventDefault();
      const value = event.clipboardData.getData('text');
      state.current = null;
      setEdit(null);
      onEdit(value);
    },
    onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
      if (!config || readOnly || composing.current || event.nativeEvent.isComposing || event.altKey)
        return false;
      compositionInput.current = null;
      if (dirty && !edit) return false;
      if (event.ctrlKey || event.metaKey) return false;
      const previous = current();
      const allSelected =
        input.current?.selectionStart === 0 && input.current.selectionEnd === value.length;
      let next: SegmentEdit | null = null;
      if (event.key === 'Tab' || event.key === ' ') {
        const direction = event.key === 'Tab' && event.shiftKey ? -1 : 1;
        const index = previous.active + direction;
        if (index < 0 || index >= config.template.segments.length) {
          if (event.key === 'Tab') return false;
        } else {
          state.current = { ...previous, active: index, buffer: '' };
          select(index);
        }
        event.preventDefault();
        return true;
      }
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        const direction = event.key === 'ArrowLeft' ? -1 : 1;
        next = {
          ...previous,
          active: Math.max(
            0,
            Math.min(config.template.segments.length - 1, previous.active + direction),
          ),
          buffer: '',
        };
        state.current = next;
        select(next.active);
        event.preventDefault();
        return true;
      }
      if (event.key === 'Home' || event.key === 'End') {
        const index = event.key === 'Home' ? 0 : config.template.segments.length - 1;
        state.current = { ...previous, active: index, buffer: '' };
        select(index);
        event.preventDefault();
        return true;
      }
      if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        const now = new Date();
        const fallback = segmentValues(
          config.template,
          config.dates.map((date) => date ?? now),
          weekStartsOn,
        );
        next = stepSegment(config.template, previous, event.key === 'ArrowUp' ? 1 : -1, fallback, {
          minute: config.minuteStep,
          second: config.secondStep,
        });
      } else if (event.key === 'Backspace' || event.key === 'Delete') {
        const values = allSelected ? emptySegments(config.template) : [...previous.values];
        const index = allSelected
          ? 0
          : previous.values[previous.active] == null && event.key === 'Backspace'
            ? Math.max(0, previous.active - 1)
            : previous.active;
        values[index] = null;
        next = { values, active: index, buffer: '' };
      } else if (event.key.length === 1) {
        const initial =
          allSelected && !previous.buffer
            ? { values: emptySegments(config.template), active: 0, buffer: '' }
            : previous;
        next = typeSegment(config.template, initial, event.key, periods);
        // A structured field does not accept arbitrary text through ordinary typing.
        event.preventDefault();
        if (!next) return true;
      } else return false;
      event.preventDefault();
      if (next) update(next);
      return true;
    },
  };
}
