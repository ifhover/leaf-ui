import { Check, Copy, Pencil } from 'lucide-react';
import {
  type AnchorHTMLAttributes,
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Button } from '../button';
import { classes } from '../shared/classes';
import { useText } from '../shared/use-text';

export interface TypographyProps extends HTMLAttributes<HTMLDivElement> {
  compact?: boolean;
}
export const Typography = forwardRef<HTMLDivElement, TypographyProps>(function Typography(
  { compact, className, ...props },
  ref,
) {
  return (
    <div
      {...props}
      ref={ref}
      className={classes('leaf-typography', compact && 'leaf-typography--compact', className)}
    />
  );
});
export interface TextProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: 'default' | 'muted' | 'primary' | 'success' | 'warning' | 'danger';
  strong?: boolean;
  italic?: boolean;
  underline?: boolean;
  code?: boolean;
  mark?: boolean;
  ellipsis?: boolean | { rows?: number; expandable?: boolean };
  copyable?:
    | boolean
    | { text?: string; onCopy?: (text: string) => void; onError?: (error: unknown) => void };
  editable?: { onChange: (text: string) => void; text?: string };
}
function TextContent({
  children,
  ellipsis,
  copyable,
  editable,
}: Pick<TextProps, 'children' | 'ellipsis' | 'copyable' | 'editable'>) {
  const t = useText();
  const [expanded, setExpanded] = useState(false),
    [copied, setCopied] = useState(false),
    [editing, setEditing] = useState(false),
    [draft, setDraft] = useState('');
  const text = typeof children === 'string' || typeof children === 'number' ? String(children) : '';
  const rows = typeof ellipsis === 'object' ? (ellipsis.rows ?? 1) : 1;
  const session = useRef(false);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (editing) input.current?.focus();
  }, [editing]);
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);
  const finish = () => {
    if (!session.current) return;
    session.current = false;
    editable?.onChange(draft);
    setEditing(false);
  };
  if (editing)
    return (
      <input
        ref={input}
        className="leaf-text__editor"
        type="text"
        aria-label={t('编辑文本', 'Edit text')}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={finish}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
            event.preventDefault();
            finish();
          }
          if (event.key === 'Escape') {
            event.preventDefault();
            session.current = false;
            setEditing(false);
          }
        }}
      />
    );
  return (
    <>
      <span
        className={classes(
          'leaf-text__content',
          ellipsis && !expanded && 'leaf-text__content--ellipsis',
        )}
        style={
          ellipsis && !expanded
            ? { WebkitLineClamp: rows, display: rows > 1 ? '-webkit-box' : undefined }
            : undefined
        }
      >
        {children}
      </span>
      {typeof ellipsis === 'object' && ellipsis.expandable && (
        <button
          type="button"
          className="leaf-text__action"
          aria-expanded={expanded}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? t('收起', 'Collapse') : t('展开', 'Expand')}
        </button>
      )}
      {copyable && (
        <Button
          variant="ghost"
          size="sm"
          startIcon={copied ? <Check size={14} /> : <Copy size={14} />}
          aria-label={t('复制文本', 'Copy text')}
          onClick={async () => {
            const value = typeof copyable === 'object' ? (copyable.text ?? text) : text;
            try {
              await navigator.clipboard.writeText(value);
              setCopied(true);
              if (typeof copyable === 'object') copyable.onCopy?.(value);
            } catch (error) {
              if (typeof copyable === 'object') copyable.onError?.(error);
            }
          }}
        />
      )}
      {editable && (
        <Button
          variant="ghost"
          size="sm"
          startIcon={<Pencil size={14} />}
          aria-label={t('编辑文本', 'Edit text')}
          onClick={() => {
            setDraft(editable.text ?? text);
            session.current = true;
            setEditing(true);
          }}
        />
      )}
    </>
  );
}
export const Text = forwardRef<HTMLSpanElement, TextProps>(function Text(
  {
    tone = 'default',
    strong,
    italic,
    underline,
    code,
    mark,
    ellipsis,
    copyable,
    editable,
    className,
    children,
    ...props
  },
  ref,
) {
  return (
    <span
      {...props}
      ref={ref}
      className={classes(
        'leaf-text',
        `leaf-text--${tone}`,
        strong && 'leaf-text--strong',
        italic && 'leaf-text--italic',
        underline && 'leaf-text--underline',
        code && 'leaf-text--code',
        mark && 'leaf-text--mark',
        className,
      )}
    >
      <TextContent {...{ children, ellipsis, copyable, editable }} />
    </span>
  );
});
export interface ParagraphProps extends TextProps {}
export const Paragraph = forwardRef<HTMLParagraphElement, ParagraphProps>(function Paragraph(
  {
    tone = 'default',
    strong,
    italic,
    underline,
    code,
    mark,
    ellipsis,
    copyable,
    editable,
    className,
    children,
    ...props
  },
  ref,
) {
  return (
    <p
      {...props}
      ref={ref}
      className={classes(
        'leaf-paragraph',
        'leaf-text',
        `leaf-text--${tone}`,
        strong && 'leaf-text--strong',
        italic && 'leaf-text--italic',
        underline && 'leaf-text--underline',
        code && 'leaf-text--code',
        mark && 'leaf-text--mark',
        className,
      )}
    >
      <TextContent {...{ children, ellipsis, copyable, editable }} />
    </p>
  );
});
export interface TitleProps extends HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}
export const Title = forwardRef<HTMLHeadingElement, TitleProps>(function Title(
  { level = 2, className, ...props },
  ref,
) {
  const Heading = `h${level}` as 'h2';
  return (
    <Heading
      {...props}
      ref={ref}
      className={classes('leaf-title', `leaf-title--${level}`, className)}
    />
  );
});
export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  disabled?: boolean;
  underline?: boolean;
  external?: boolean;
  icon?: ReactNode;
}
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { disabled, underline = true, external, icon, className, children, ...props },
  ref,
) {
  return (
    <a
      {...props}
      ref={ref}
      href={disabled ? undefined : props.href}
      target={external ? '_blank' : props.target}
      rel={external ? 'noopener noreferrer' : props.rel}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : props.tabIndex}
      className={classes('leaf-link', underline && 'leaf-link--underline', className)}
      onClick={(event) => {
        if (disabled) event.preventDefault();
        else props.onClick?.(event);
      }}
    >
      {icon}
      {children}
    </a>
  );
});
