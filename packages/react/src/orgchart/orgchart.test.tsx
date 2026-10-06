import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ConfigProvider } from '../config-provider';
import { OrgChart } from './orgchart';

const data = { key: 'parent', label: 'Parent', children: [{ key: 'child', label: 'Child' }] };
afterEach(() => vi.useRealTimers());

describe('OrgChart branch transitions', () => {
  it('makes a collapsing branch inactive immediately and removes it after its transition', () => {
    vi.useFakeTimers();
    const onNodeClick = vi.fn();
    const { container } = render(
      <ConfigProvider locale="en-US">
        <OrgChart data={data} onNodeClick={onNodeClick} />
      </ConfigProvider>,
    );
    const branch = container.querySelector<HTMLElement>('.leaf-org-chart__branch');
    if (!branch) throw new Error('Expected a branch');
    branch.style.transitionDuration = '200ms';
    fireEvent.click(screen.getByRole('button', { name: 'Expand or collapse children' }));
    expect(branch).toHaveAttribute('aria-hidden', 'true');
    expect(branch).toHaveAttribute('inert');
    expect(screen.queryByRole('button', { name: 'Child' })).toBeNull();
    expect(screen.getByText('Child')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(240));
    expect(screen.queryByText('Child')).toBeNull();
    expect(onNodeClick).not.toHaveBeenCalled();
  });

  it('keeps the reopened branch interactive when a previous close timer expires', () => {
    vi.useFakeTimers();
    const { container } = render(
      <ConfigProvider locale="en-US">
        <OrgChart data={data} onNodeClick={() => {}} />
      </ConfigProvider>,
    );
    const branch = container.querySelector<HTMLElement>('.leaf-org-chart__branch');
    if (!branch) throw new Error('Expected a branch');
    branch.style.transitionDuration = '200ms';
    const toggle = screen.getByRole('button', { name: 'Expand or collapse children' });
    fireEvent.click(toggle);
    act(() => vi.advanceTimersByTime(100));
    fireEvent.click(toggle);
    act(() => vi.advanceTimersByTime(400));
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(branch).not.toHaveAttribute('inert');
    expect(screen.getByRole('button', { name: 'Child' })).toBeEnabled();
  });
});
