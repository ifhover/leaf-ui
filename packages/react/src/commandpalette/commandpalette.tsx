import { Search } from 'lucide-react';
import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { useLeafConfig } from '../config-provider/context';
import { Input } from '../input';
import { Modal } from '../modal';
import { useControllable } from '../shared/use-controllable';
import { useText } from '../shared/use-text';
export interface CommandItem {
  key: string;
  label: ReactNode;
  keywords?: string;
  group?: ReactNode;
  icon?: ReactNode;
  shortcut?: string;
  disabled?: boolean;
  onSelect?: () => void | Promise<void>;
}
export interface CommandPaletteProps {
  items: readonly CommandItem[];
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSelect?: (item: CommandItem) => void;
  shortcut?: string | false;
  placeholder?: string;
  loading?: boolean;
  emptyContent?: ReactNode;
  onSearch?: (query: string) => void;
  onError?: (error: unknown, item: CommandItem) => void;
}
const useBrowserLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;
export function CommandPalette({
  items,
  open: controlled,
  defaultOpen = false,
  onOpenChange,
  onSelect,
  shortcut = 'k',
  placeholder,
  loading,
  emptyContent,
  onSearch,
  onError,
}: CommandPaletteProps) {
  const t = useText(),
    { messages } = useLeafConfig(),
    id = useId();
  const [open, setOpen] = useControllable(controlled, defaultOpen, onOpenChange);
  const callback = useRef(setOpen);
  callback.current = setOpen;
  const [query, setQuery] = useState(''),
    [active, setActive] = useState(0),
    [busy, setBusy] = useState<string>();
  const [error, setError] = useState('');
  const inFlight = useRef(false);
  const generation = useRef(0);
  const input = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [selection, setSelection] = useState<CSSProperties>();
  useEffect(() => {
    if (!shortcut) return;
    const key = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === shortcut.toLowerCase()) {
        event.preventDefault();
        callback.current(!open);
      }
    };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, [shortcut, open]);
  useEffect(() => {
    generation.current++;
    inFlight.current = false;
    setBusy(undefined);
    setError('');
    if (open) {
      setQuery('');
      setActive(0);
      const frame = requestAnimationFrame(() => input.current?.focus());
      return () => cancelAnimationFrame(frame);
    }
  }, [open]);
  useEffect(
    () => () => {
      generation.current++;
    },
    [],
  );
  const list = items.filter((item) =>
    `${typeof item.label === 'string' ? item.label : item.key} ${item.keywords ?? ''}`
      .toLocaleLowerCase()
      .includes(query.toLocaleLowerCase()),
  );
  useBrowserLayoutEffect(() => {
    const node = listRef.current;
    if (!node || !open) return;
    const update = () => {
      const row = node.querySelector<HTMLButtonElement>('[aria-selected="true"]:not(:disabled)');
      setSelection(
        row
          ? ({
              '--leaf-command-selection-y': `${row.offsetTop}px`,
              '--leaf-command-selection-height': `${row.offsetHeight}px`,
            } as CSSProperties)
          : undefined,
      );
    };
    update();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [open, active, query, items, busy]);
  useEffect(() => {
    document.getElementById(`${id}-${active}`)?.scrollIntoView?.({ block: 'nearest' });
  }, [id, active]);
  const select = async (item: CommandItem) => {
    if (item.disabled || inFlight.current) return;
    inFlight.current = true;
    const request = generation.current;
    setError('');
    setBusy(item.key);
    try {
      await item.onSelect?.();
      if (generation.current !== request) return;
      onSelect?.(item);
      setOpen(false);
    } catch (reason) {
      if (generation.current !== request) return;
      setError(reason instanceof Error ? reason.message : String(reason));
      onError?.(reason, item);
    } finally {
      if (generation.current === request) {
        inFlight.current = false;
        setBusy(undefined);
      }
    }
  };
  return (
    <Modal
      open={open}
      title={t('命令搜索', 'Command search')}
      footer={null}
      onClose={() => setOpen(false)}
      width={560}
      className="leaf-command-palette"
    >
      <Input
        ref={input}
        prefix={<Search size={17} />}
        value={query}
        placeholder={placeholder ?? t('搜索命令…', 'Search commands…')}
        aria-label={t('搜索命令', 'Search commands')}
        role="combobox"
        aria-expanded={true}
        aria-controls={id}
        aria-activedescendant={list[active] ? `${id}-${active}` : undefined}
        onChange={(event) => {
          setQuery(event.target.value);
          setActive(0);
          onSearch?.(event.target.value);
        }}
        onKeyDown={(event) => {
          if (event.nativeEvent.isComposing) return;
          if (['ArrowDown', 'ArrowUp'].includes(event.key)) {
            event.preventDefault();
            let next = active;
            for (let i = 0; i < list.length; i++) {
              next = (next + (event.key === 'ArrowDown' ? 1 : -1) + list.length) % list.length;
              if (!list[next]?.disabled) break;
            }
            setActive(next);
          }
          const item = list[active];
          if (event.key === 'Enter' && item) {
            event.preventDefault();
            void select(item);
          }
        }}
      />
      {error && (
        <p role="alert" className="leaf-command-palette__error">
          {error}
        </p>
      )}
      <div
        ref={listRef}
        id={id}
        role="listbox"
        aria-label={t('命令', 'Commands')}
        aria-busy={loading || !!busy}
        className="leaf-command-palette__list"
      >
        <div
          className="leaf-command-palette__selection"
          style={selection}
          data-ready={Boolean(selection)}
          aria-hidden="true"
        />
        {list.map((item, index) => (
          <div key={item.key}>
            {item.group !== undefined && (index === 0 || list[index - 1]?.group !== item.group) && (
              <div className="leaf-command-palette__group">{item.group}</div>
            )}
            <button
              type="button"
              role="option"
              id={`${id}-${index}`}
              aria-selected={active === index}
              disabled={item.disabled || !!busy}
              tabIndex={-1}
              className="leaf-floating__option"
              onMouseEnter={() => setActive(index)}
              onClick={() => void select(item)}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.shortcut && <kbd>{item.shortcut}</kbd>}
            </button>
          </div>
        ))}
        {!list.length && (
          <div className="leaf-floating__empty">
            {loading ? messages.loading : (emptyContent ?? messages.noData)}
          </div>
        )}
      </div>
      <div className="leaf-command-palette__hint" aria-hidden="true">
        <span>
          <kbd>↑</kbd>
          <kbd>↓</kbd> {t('选择', 'Navigate')}
        </span>
        <span>
          <kbd>↵</kbd> {t('执行', 'Run')}
        </span>
        <span>
          <kbd>Esc</kbd> {messages.close}
        </span>
      </div>
    </Modal>
  );
}
