import './component-example.scss';
import { Button } from '@ifhover/leaf-ui';
import { type CSSProperties, type ReactNode, useEffect, useId, useRef, useState } from 'react';
import { CopyButton } from './copy-button';
import { useDocsLocale } from './i18n';
import { Icon } from './icon';

const COLLAPSED_HEIGHT = 172;

interface ComponentExampleProps {
  title: string;
  preview: ReactNode;
  children: ReactNode;
  fileName?: string;
  /** Preview width in pixels or a CSS length; always limited to the available space. */
  width?: CSSProperties['width'];
}

/** A build-highlighted MDX code fence paired with its live React preview. */
export function ComponentExample({
  title,
  preview,
  children,
  fileName = 'example.tsx',
  width = 480,
}: ComponentExampleProps) {
  const { t } = useDocsLocale();
  const [expanded, setExpanded] = useState(false);
  const [collapsible, setCollapsible] = useState(true);
  const [wrapCode, setWrapCode] = useState(false);
  const [sourceHeight, setSourceHeight] = useState(COLLAPSED_HEIGHT);
  const sourceRef = useRef<HTMLDivElement>(null);
  const codeId = useId();

  useEffect(() => {
    const source = sourceRef.current;
    if (!source) return;
    const measure = () => {
      const height = Math.ceil(source.getBoundingClientRect().height);
      setSourceHeight(height);
      setCollapsible(height > COLLAPSED_HEIGHT);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(source);
    return () => observer.disconnect();
  }, []);

  function copySource() {
    return sourceRef.current?.querySelector('code')?.textContent ?? '';
  }

  function toggleExpanded() {
    const code = sourceRef.current?.closest('.leaf-component-example__code');
    if (expanded && code) {
      const scrollMargin = Number.parseFloat(getComputedStyle(code).scrollMarginTop);
      if (code.getBoundingClientRect().top < scrollMargin) {
        code.scrollIntoView({ block: 'start', behavior: 'instant' });
      }
    }
    setExpanded(!expanded);
  }

  return (
    <section
      className="leaf-component-example"
      aria-label={t(`${title}示例`, `${title} example`)}
      data-expanded={expanded}
      data-collapsible={collapsible}
      data-wrap-code={wrapCode}
    >
      <div className="leaf-component-example__preview rp-not-doc">
        <div className="leaf-component-example__preview-content" style={{ width }}>
          {preview}
        </div>
      </div>
      <div className="leaf-component-example__code">
        <div className="leaf-component-example__code-header">
          <span>
            <Icon name="code" width="15" height="15" />
            {fileName}
          </span>
          <div>
            <Button
              size="sm"
              variant="soft"
              className="leaf-component-example__wrap"
              aria-label={t('切换代码换行', 'Toggle line wrapping')}
              title={t('切换代码换行', 'Toggle line wrapping')}
              aria-pressed={wrapCode}
              onClick={() => setWrapCode(!wrapCode)}
              startIcon={<Icon name="wrap" />}
            />
            <CopyButton text={copySource} label={t('复制代码', 'Copy code')} />
          </div>
        </div>
        <div
          className="leaf-component-example__code-viewport"
          id={codeId}
          style={{ height: collapsible ? (expanded ? sourceHeight : COLLAPSED_HEIGHT) : undefined }}
        >
          <div className="leaf-component-example__source" ref={sourceRef}>
            {children}
          </div>
        </div>
        {collapsible && (
          <div className="leaf-component-example__expand">
            <Button
              size="sm"
              variant="outline"
              aria-expanded={expanded}
              aria-controls={codeId}
              onClick={toggleExpanded}
              endIcon={<Icon name="chevron" />}
            >
              {expanded ? t('收起代码', 'Collapse code') : t('展开代码', 'Expand code')}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
