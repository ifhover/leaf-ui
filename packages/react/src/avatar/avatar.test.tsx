import { fireEvent, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { ConfigProvider } from '../config-provider';
import { Avatar } from './avatar';
import { AvatarGroup } from './group';

const names = ['Ada', 'Ben', 'Cara', 'Dan', 'Eva', 'Fran'];
const members = names.map((name) => (
  <Avatar key={name} alt={name}>
    {name.slice(0, 1)}
  </Avatar>
));

describe('AvatarGroup text fallbacks', () => {
  it('assigns repeatable tones before collapsing and preserves member props', () => {
    const { rerender } = render(
      <AvatarGroup size="lg" shape="square" maxCount={3}>
        {members}
      </AvatarGroup>,
    );
    for (const name of names.slice(0, 3)) {
      const member = screen.getByRole('img', { name });
      expect(member).toHaveAttribute('data-text-fallback');
      expect(member).toHaveClass('leaf-avatar--lg', 'leaf-avatar--square');
    }
    const tones = names
      .slice(0, 3)
      .map((name) => screen.getByRole('img', { name }).getAttribute('data-avatar-tone'));
    expect(new Set(tones).size).toBe(3);
    expect(screen.getByText('+3').closest('.leaf-avatar')).not.toHaveAttribute('data-avatar-tone');
    rerender(<AvatarGroup>{members}</AvatarGroup>);
    expect(
      names
        .slice(0, 3)
        .map((name) => screen.getByRole('img', { name }).getAttribute('data-avatar-tone')),
    ).toEqual(tones);
    expect(screen.getByRole('img', { name: 'Fran' })).toHaveAttribute('data-avatar-tone', tones[0]);
  });

  it('uses a text tone after image failure and restores the image when the source changes', () => {
    const onError = vi.fn();
    const view = (src: string) => (
      <AvatarGroup>
        <Avatar src={src} alt="Ada" onError={onError}>
          A
        </Avatar>
        <Avatar alt="Guest" />
      </AvatarGroup>
    );
    const { container, rerender } = render(view('/missing.png'));
    expect(screen.getByRole('img', { name: 'Ada' })).not.toHaveAttribute('data-text-fallback');
    fireEvent.error(container.querySelector('img') as HTMLImageElement);
    expect(onError).toHaveBeenCalledOnce();
    expect(screen.getByRole('img', { name: 'Ada' })).toHaveAttribute('data-text-fallback');
    expect(screen.getByRole('img', { name: 'Guest' })).not.toHaveAttribute('data-text-fallback');
    rerender(view('/retry.png'));
    expect(screen.getByRole('img', { name: 'Ada' })).not.toHaveAttribute('data-text-fallback');
    expect(container.querySelector('img')).toHaveAttribute('src', '/retry.png');
  });

  it('preserves explicit styles, sizes and regional Avatar defaults', () => {
    render(
      <ConfigProvider components={{ Avatar: { style: { background: 'navy', color: 'white' } } }}>
        <AvatarGroup size="lg">
          <Avatar alt="Ada" size="sm" style={{ background: 'pink' }}>
            A
          </Avatar>
          <Avatar alt="Ben">B</Avatar>
        </AvatarGroup>
      </ConfigProvider>,
    );
    expect(screen.getByRole('img', { name: 'Ada' })).toHaveClass('leaf-avatar--sm');
    expect(screen.getByRole('img', { name: 'Ada' }).style.background).toBe('pink');
    expect(screen.getByRole('img', { name: 'Ben' }).style.background).toBe('navy');
  });

  it('renders deterministic colors on the server without changing standalone avatars', () => {
    const content = <AvatarGroup>{members}</AvatarGroup>;
    expect(renderToString(content)).toBe(renderToString(content));
    render(<Avatar>LF</Avatar>);
    expect(screen.getByRole('img')).not.toHaveAttribute('data-avatar-tone');
  });
});
