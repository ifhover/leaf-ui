import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Badge } from './badge/badge';
import { Popconfirm } from './popconfirm/popconfirm';
import { Result } from './result/result';
import { Tag } from './tag/tag';
import { Timeline } from './timeline/timeline';

describe('feedback status naming', () => {
  it('emits danger for Badge while accepting error', () => {
    const { rerender } = render(<Badge status="danger" text="Stopped" />);
    expect(document.querySelector('.leaf-badge')).toHaveAttribute('data-status', 'danger');
    rerender(<Badge status="error" text="Stopped" />);
    expect(document.querySelector('.leaf-badge')).toHaveAttribute('data-status', 'danger');
  });

  it('emits danger for Tag while accepting error', () => {
    const { rerender } = render(<Tag color="danger">Stopped</Tag>);
    expect(document.querySelector('.leaf-tag')).toHaveAttribute('data-color', 'danger');
    rerender(<Tag color="error">Stopped</Tag>);
    expect(document.querySelector('.leaf-tag')).toHaveAttribute('data-color', 'danger');
  });

  it('emits danger for Result while accepting error', () => {
    const { rerender } = render(<Result status="danger" title="Failed" />);
    expect(document.querySelector('.leaf-result')).toHaveClass('leaf-result--danger');
    rerender(<Result status="error" title="Failed" />);
    expect(document.querySelector('.leaf-result')).toHaveClass('leaf-result--danger');
    expect(document.querySelector('.leaf-result')).not.toHaveClass('leaf-result--error');
  });

  it('emits danger for Popconfirm while accepting error', () => {
    render(
      <Popconfirm title="Delete?" type="error">
        <button type="button">Delete</button>
      </Popconfirm>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(document.querySelector('.leaf-popconfirm__icon')).toHaveClass(
      'leaf-popconfirm__icon--danger',
    );
    expect(document.querySelector('.leaf-popconfirm__icon')).not.toHaveClass(
      'leaf-popconfirm__icon--error',
    );
  });

  it('resolves Timeline error to the shared danger token', () => {
    const { rerender } = render(
      <Timeline items={[{ key: 'danger', color: 'danger', children: 'Danger' }]} />,
    );
    const danger = document.querySelector<HTMLElement>('.leaf-timeline__item');
    expect(danger?.style.getPropertyValue('--leaf-timeline-color')).toBe(
      'var(--leaf-color-danger)',
    );
    rerender(<Timeline items={[{ key: 'legacy', color: 'error', children: 'Legacy' }]} />);
    expect(danger?.style.getPropertyValue('--leaf-timeline-color')).toBe(
      'var(--leaf-color-danger)',
    );
  });
});
