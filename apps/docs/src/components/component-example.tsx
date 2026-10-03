import './component-example.scss';
import { type ReactNode, useEffect, useId, useRef, useState } from 'react';
import { CopyButton } from './copy-button';
import { useDocsLocale } from './i18n';
import { Icon } from './icon';

const COLLAPSED_HEIGHT = 172;

interface ComponentExampleProps {
  title: string;
  preview: ReactNode;
  children: ReactNode;
  fileName?: string;
}

/** A build-highlighted MDX code fence paired with its live React preview. */
export function ComponentExample({
  title,
  preview,
  children,
  fileName = 'example.tsx',
}: ComponentExampleProps) {
  const { t } = useDocsLocale();
  const [expanded, setExpanded] = useState(false);
  const [collapsible, setCollapsible] = useState(true);
  const [wrapCode, setWrapCode] = useState(false);
  const sourceRef = useRef<HTMLDivElement>(null);
  const codeId = useId();

  useEffect(() => {
    const source = sourceRef.current;
    if (!source) return;
    const measure = () => setCollapsible(source.scrollHeight > COLLAPSED_HEIGHT);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(source);
    return () => observer.disconnect();
  }, []);

  function copySource() {
    return sourceRef.current?.querySelector('code')?.textContent ?? '';
  }

  return (
    <section
      className="leaf-component-example"
      aria-label={t(`${title}示例`, `${title} example`)}
      data-expanded={expanded}
      data-collapsible={collapsible}
      data-wrap-code={wrapCode}
    >
      <div className="leaf-component-example__preview-header">
        <span>
          <i />
          {t('交互预览', 'Live preview')}
        </span>
        <span>{title}</span>
      </div>
      <div className="leaf-component-example__preview rp-not-doc">{preview}</div>
      <div className="leaf-component-example__code-header">
        <span>
          <Icon name="code" width="15" height="15" />
          {fileName}
        </span>
        <div>
          <button
            type="button"
            className="leaf-component-example__wrap"
            aria-label={t('切换代码换行', 'Toggle line wrapping')}
            title={t('切换代码换行', 'Toggle line wrapping')}
            aria-pressed={wrapCode}
            onClick={() => setWrapCode(!wrapCode)}
          >
            <Icon name="wrap" width="16" height="16" />
          </button>
          <CopyButton text={copySource} label={t('复制代码', 'Copy code')} />
        </div>
      </div>
      <div className="leaf-component-example__code-viewport" id={codeId}>
        <div className="leaf-component-example__source" ref={sourceRef}>
          {children}
        </div>
      </div>
      {collapsible && (
        <div className="leaf-component-example__expand">
          <button
            type="button"
            aria-expanded={expanded}
            aria-controls={codeId}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? t('收起代码', 'Collapse code') : t('展开代码', 'Expand code')}
            <Icon name="chevron" width="14" height="14" />
          </button>
        </div>
      )}
    </section>
  );
}
