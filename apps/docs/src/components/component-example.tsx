import './component-example.scss';
import { type ReactNode, useEffect, useId, useRef, useState } from 'react';
import { CopyButton } from './copy-button';
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
      aria-label={`${title}示例`}
      data-expanded={expanded}
      data-collapsible={collapsible}
      data-wrap-code={wrapCode}
    >
      <div className="leaf-component-example__preview-header">
        <span>
          <i />
          交互预览
        </span>
        <span>{title}</span>
      </div>
      <div className="leaf-component-example__preview">{preview}</div>
      <div className="leaf-component-example__code-header">
        <span>
          <Icon name="code" width="15" height="15" />
          {fileName}
        </span>
        <div>
          <button
            type="button"
            className="leaf-component-example__wrap"
            aria-label="切换代码换行"
            title="切换代码换行"
            aria-pressed={wrapCode}
            onClick={() => setWrapCode(!wrapCode)}
          >
            <Icon name="wrap" width="16" height="16" />
          </button>
          <CopyButton text={copySource} label="复制代码" />
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
            {expanded ? '收起代码' : '展开代码'}
            <Icon name="chevron" width="14" height="14" />
          </button>
        </div>
      )}
    </section>
  );
}
