import { ChevronDown, Minus, Plus, RotateCcw } from 'lucide-react';
import {
  type HTMLAttributes,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Button } from '../button';
import { classes } from '../shared/classes';
import { inertProps } from '../shared/inert';
import { useListMotion } from '../shared/motion';
import { usePresence } from '../shared/presence';
import { useControllable } from '../shared/use-controllable';
import { useText } from '../shared/use-text';
export interface OrgChartNode {
  key: string;
  label: ReactNode;
  description?: ReactNode;
  children?: readonly OrgChartNode[];
}
export interface OrgChartProps extends HTMLAttributes<HTMLDivElement> {
  data: OrgChartNode | readonly OrgChartNode[];
  collapsedKeys?: readonly string[];
  defaultCollapsedKeys?: readonly string[];
  onCollapseChange?: (keys: string[]) => void;
  renderNode?: (node: OrgChartNode) => ReactNode;
  onNodeClick?: (node: OrgChartNode) => void;
  zoomable?: boolean;
  minZoom?: number;
  maxZoom?: number;
}
function OrgBranch({
  expanded,
  onSettled,
  children,
}: {
  expanded: boolean;
  onSettled: () => void;
  children: ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);
  const present = usePresence(expanded, root);
  const previous = useRef(present);
  useEffect(() => {
    if (previous.current && !present) onSettled();
    previous.current = present;
  }, [present, onSettled]);
  return (
    <div
      ref={root}
      className="leaf-org-chart__branch"
      data-open={expanded || undefined}
      data-present={present || undefined}
      aria-hidden={!expanded || undefined}
      {...inertProps(!expanded)}
    >
      <div className="leaf-org-chart__branch-inner">{present && children}</div>
    </div>
  );
}
export function OrgChart({
  data,
  collapsedKeys,
  defaultCollapsedKeys = [],
  onCollapseChange,
  renderNode,
  onNodeClick,
  zoomable = true,
  minZoom = 0.5,
  maxZoom = 2,
  className,
  ...props
}: OrgChartProps) {
  const t = useText();
  const canvas = useRef<HTMLDivElement>(null);
  const [revision, setRevision] = useState(0);
  const settled = useCallback(() => setRevision((value) => value + 1), []);
  const [zoom, setZoom] = useState(1);
  const [collapsed, setCollapsed] = useControllable<readonly string[]>(
    collapsedKeys,
    defaultCollapsedKeys,
    (value) => onCollapseChange?.([...value]),
  );
  const minimum = Math.max(0.1, minZoom),
    maximum = Math.max(minimum, maxZoom);
  const nodes = Array.isArray(data) ? data : [data as OrgChartNode];
  useListMotion(
    canvas,
    JSON.stringify([collapsed, revision]),
    '.leaf-org-chart__node[data-motion-key]',
    zoom,
  );
  const renderNodes = (entries: readonly OrgChartNode[]): ReactNode => (
    <ul>
      {entries.map((node) => {
        const expanded = !collapsed.includes(node.key);
        const hasChildren = Boolean(node.children?.length);
        return (
          <li key={node.key}>
            <div className="leaf-org-chart__node" data-motion-key={node.key}>
              {onNodeClick ? (
                <button
                  type="button"
                  className="leaf-org-chart__node-content"
                  onClick={() => onNodeClick(node)}
                >
                  {renderNode?.(node) ?? (
                    <>
                      <strong>{node.label}</strong>
                      {node.description && <span>{node.description}</span>}
                    </>
                  )}
                </button>
              ) : (
                <div className="leaf-org-chart__node-content">
                  {renderNode?.(node) ?? (
                    <>
                      <strong>{node.label}</strong>
                      {node.description && <span>{node.description}</span>}
                    </>
                  )}
                </div>
              )}
              {hasChildren && (
                <Button
                  className="leaf-org-chart__toggle"
                  size="sm"
                  variant="ghost"
                  aria-label={t('展开或收起子节点', 'Expand or collapse children')}
                  aria-expanded={expanded}
                  startIcon={<ChevronDown />}
                  onClick={() =>
                    setCollapsed(
                      expanded
                        ? [...collapsed, node.key]
                        : collapsed.filter((key) => key !== node.key),
                    )
                  }
                />
              )}
            </div>
            {hasChildren && (
              <OrgBranch expanded={expanded} onSettled={settled}>
                {renderNodes(node.children ?? [])}
              </OrgBranch>
            )}
          </li>
        );
      })}
    </ul>
  );
  return (
    <div {...props} className={classes('leaf-org-chart', className)}>
      {zoomable && (
        <div className="leaf-org-chart__toolbar">
          <Button
            variant="ghost"
            size="sm"
            startIcon={<Minus />}
            disabled={zoom <= minimum}
            onClick={() => setZoom((value) => Math.max(minimum, value - 0.1))}
            aria-label={t('缩小', 'Zoom out')}
          />
          <output>{Math.round(zoom * 100)}%</output>
          <Button
            variant="ghost"
            size="sm"
            startIcon={<Plus />}
            disabled={zoom >= maximum}
            onClick={() => setZoom((value) => Math.min(maximum, value + 0.1))}
            aria-label={t('放大', 'Zoom in')}
          />
          <Button
            variant="ghost"
            size="sm"
            startIcon={<RotateCcw />}
            onClick={() => setZoom(1)}
            aria-label={t('重置缩放', 'Reset zoom')}
          />
        </div>
      )}
      <section
        className="leaf-org-chart__viewport"
        // biome-ignore lint/a11y/noNoninteractiveTabindex: The scrollable chart must be keyboard-scrollable.
        tabIndex={0}
        aria-label={props['aria-label'] ?? t('组织结构图', 'Organization chart')}
      >
        <div className="leaf-org-chart__canvas" ref={canvas} style={{ zoom }}>
          {renderNodes(nodes)}
        </div>
      </section>
    </div>
  );
}
