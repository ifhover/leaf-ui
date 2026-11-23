import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ConfigProvider } from '../config-provider/config-provider';
import { Result } from './result';

describe('Result', () => {
  it('defaults to empty status in a single size and renders localized fallback titles', () => {
    const { container } = render(
      <ConfigProvider locale="en-US">
        <Result description="Create your first project to begin." />
      </ConfigProvider>,
    );
    const root = container.querySelector('.leaf-result');
    expect(root).toHaveClass('leaf-result--empty');
    expect(root).not.toHaveClass('leaf-result--sm', 'leaf-result--md');
    expect(container.querySelector('.leaf-result__icon > svg')).toBeInTheDocument();
    expect(screen.getByText('No data')).toBeInTheDocument();
    expect(screen.getByText('Create your first project to begin.')).toBeInTheDocument();
  });

  it('supports success, warning, danger and error alias without rendering empty icon borders', () => {
    const { container, rerender } = render(<Result status="success" title="Saved" />);
    expect(container.querySelector('.leaf-result')).toHaveClass('leaf-result--success');
    expect(screen.getByText('Saved')).toBeInTheDocument();

    rerender(<Result status="warning" title="Almost full" />);
    expect(container.querySelector('.leaf-result')).toHaveClass('leaf-result--warning');

    rerender(<Result status="error" title="Failed" extra={<button type="button">Retry</button>} />);
    const errorRoot = container.querySelector('.leaf-result');
    expect(errorRoot).toHaveClass('leaf-result--danger');
    expect(errorRoot).not.toHaveClass('leaf-result--error');
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();

    rerender(<Result icon={null} title={null} description="Hidden icon and title" />);
    expect(container.querySelector('.leaf-result__icon')).toBeNull();
    expect(container.querySelector('.leaf-result__title')).toBeNull();
    expect(screen.getByText('Hidden icon and title')).toBeInTheDocument();
  });
});
