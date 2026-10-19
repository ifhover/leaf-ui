import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Carousel } from '../carousel';
import { ConfigProvider } from '../config-provider';
import { Statistic } from '../statistic';
import { Tree } from '../tree';
import { Tabs } from './tabs';

const animateDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'animate');
afterEach(() => {
  vi.restoreAllMocks();
  if (animateDescriptor) Object.defineProperty(HTMLElement.prototype, 'animate', animateDescriptor);
  else Reflect.deleteProperty(HTMLElement.prototype, 'animate');
});

function animationRecorder() {
  const recorded: { node: HTMLElement; keyframes: Keyframe[]; animation: Animation }[] = [];
  const animate = vi.fn(function (this: HTMLElement, keyframes: Keyframe[]) {
    const animation = {
      playState: 'running',
      cancel: vi.fn(),
      addEventListener: vi.fn(),
    } as unknown as Animation;
    recorded.push({ node: this, keyframes, animation });
    return animation;
  });
  Object.defineProperty(HTMLElement.prototype, 'animate', { configurable: true, value: animate });
  return { animate, recorded };
}

describe('Navigation motion contracts', () => {
  it('keeps one indicator and uses local geometry under external scale and negative RTL scroll offsets', async () => {
    let secondWidth = 120;
    let scrollLeft = -40;
    vi.spyOn(Element.prototype, 'scrollLeft', 'get').mockImplementation(function (this: Element) {
      return this.classList.contains('leaf-tabs__list') ? scrollLeft : 0;
    });
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (
      this: HTMLElement,
    ) {
      if (this.classList.contains('leaf-tabs__list')) return 150;
      if (this.classList.contains('leaf-tabs__track')) return secondWidth + 82;
      return 100;
    });
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(34);
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: HTMLElement,
    ) {
      if (this.classList.contains('leaf-tabs__list')) return new DOMRect(100, 80, 120, 28.8);
      // The list scrolls; the indicator and entries share the inner track's local coordinates.
      // Model a 150px list with 1px borders, a 70px first tab and a 12px gap at 0.8 scale.
      const trackWidth = secondWidth + 82;
      const trackLeft = 100 + (1 + 148 - trackWidth - scrollLeft) * 0.8;
      if (this.classList.contains('leaf-tabs__track'))
        return new DOMRect(trackLeft, 80.8, trackWidth * 0.8, 27.2);
      if (this.dataset.tabKey === 'first')
        return new DOMRect(trackLeft + (secondWidth + 12) * 0.8, 80.8, 56, 27.2);
      if (this.dataset.tabKey === 'second')
        return new DOMRect(trackLeft, 80.8, secondWidth * 0.8, 27.2);
      return new DOMRect(0, 0, 300, 100);
    });
    const { container } = render(
      <ConfigProvider direction="rtl">
        <Tabs
          overflow={false}
          items={[
            { key: 'first', label: 'First', children: <input aria-label="Draft" /> },
            { key: 'second', label: 'Second', children: 'Second content' },
          ]}
        />
      </ConfigProvider>,
    );
    const marker = container.querySelector<HTMLElement>('.leaf-tabs__indicator');
    const geometry = (property: 'x' | 'y' | 'width' | 'height') =>
      Number.parseFloat(marker?.style.getPropertyValue(`--leaf-indicator-${property}`) ?? '');
    expect(geometry('x')).toBeCloseTo(132);
    expect(geometry('y')).toBeCloseTo(0);
    expect(geometry('width')).toBeCloseTo(70);
    expect(geometry('height')).toBeCloseTo(34);
    await userEvent.type(screen.getByRole('textbox'), 'Saved draft');
    fireEvent.click(screen.getByRole('tab', { name: 'Second' }));
    expect(geometry('x')).toBeCloseTo(0);
    expect(geometry('width')).toBeCloseTo(120);
    expect(marker).toHaveAttribute('data-animate', 'true');
    fireEvent.click(screen.getByRole('tab', { name: 'First' }));
    fireEvent.click(screen.getByRole('tab', { name: 'Second' }));
    expect(container.querySelector('.leaf-tabs__indicator')).toBe(marker);
    expect(container.querySelectorAll('.leaf-tabs__indicator')).toHaveLength(1);
    scrollLeft = -20;
    const list = screen.getByRole('tablist');
    fireEvent.scroll(list);
    expect(list.scrollLeft).toBe(-20);
    expect(geometry('x')).toBeCloseTo(0);
    secondWidth = 155;
    fireEvent(window, new Event('resize'));
    await waitFor(() => expect(geometry('width')).toBeCloseTo(155));
    expect(marker).toHaveAttribute('data-animate', 'false');
    fireEvent.click(screen.getByRole('tab', { name: 'First' }));
    expect(geometry('x')).toBeCloseTo(167);
    expect(screen.getByRole('textbox')).toHaveValue('Saved draft');
  });

  it('switches tab content immediately without animating panels or their container', () => {
    const { animate } = animationRecorder();
    render(
      <Tabs
        overflow={false}
        items={[
          { key: 'short', label: 'Short', children: 'Short panel' },
          { key: 'tall', label: 'Tall', children: 'Tall panel' },
        ]}
      />,
    );
    fireEvent.click(screen.getByRole('tab', { name: 'Tall' }));
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Tall panel');
    fireEvent.click(screen.getByRole('tab', { name: 'Short' }));
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Short panel');
    expect(animate).not.toHaveBeenCalled();
  });

  it('keeps RTL card tabs selection aligned while skipping disabled items', async () => {
    render(
      <ConfigProvider direction="rtl">
        <Tabs
          type="card"
          items={[
            { key: 'first', label: 'First' },
            { key: 'disabled', label: 'Disabled', disabled: true },
            { key: 'last', label: 'Last' },
          ]}
        />
      </ConfigProvider>,
    );
    screen.getByRole('tab', { name: 'First' }).focus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(screen.getByRole('tab', { name: 'Last' })).toHaveFocus();
    expect(screen.getByRole('tab', { name: 'Last' })).toHaveAttribute('aria-selected', 'true');
  });

  it('preserves carousel slide state and moves forward through the last-to-first wrap', async () => {
    const { recorded } = animationRecorder();
    const { container } = render(
      <ConfigProvider locale="en-US">
        <Carousel>
          <input aria-label="Slide draft" />
          <button type="button">Second content</button>
          <button type="button">Third content</button>
        </Carousel>
      </ConfigProvider>,
    );
    await userEvent.type(screen.getByRole('textbox'), 'Saved');
    for (let index = 0; index < 3; index++)
      fireEvent.click(screen.getByRole('button', { name: 'Next slide' }));
    const current = container.querySelector<HTMLElement>('[data-slide-index="0"]');
    const wrap = recorded.filter((entry) => entry.node === current).at(-1);
    expect(String(wrap?.keyframes[0]?.transform)).toContain('translateX(12%)');
    expect(screen.getByRole('textbox')).toHaveValue('Saved');
    expect(
      container.querySelectorAll('.leaf-carousel__slide[inert][aria-hidden="true"]'),
    ).toHaveLength(2);
  });

  it('honors motion:false while preserving carousel selection and statistic updates', () => {
    const { animate } = animationRecorder();
    const { rerender } = render(
      <ConfigProvider theme={{ motion: false }}>
        <Carousel>
          <span>First content</span>
          <span>Second content</span>
        </Carousel>
        <Statistic value={10} />
      </ConfigProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: '下一张' }));
    expect(screen.getByText('Second content')).toBeInTheDocument();
    rerender(
      <ConfigProvider theme={{ motion: false }}>
        <Statistic value={20} />
      </ConfigProvider>,
    );
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(animate).not.toHaveBeenCalled();
  });

  it('uses natural carousel heights under external scale after completed transitions and mirrors RTL motion', () => {
    const { recorded } = animationRecorder();
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function (
      this: HTMLElement,
    ) {
      if (this.classList.contains('leaf-carousel__track'))
        return this.querySelector('[data-active]')?.textContent === 'Tall slide' ? 200 : 80;
      return 34;
    });
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: HTMLElement,
    ) {
      if (this.classList.contains('leaf-carousel__track'))
        return new DOMRect(0, 0, 240, this.offsetHeight * 0.8);
      return new DOMRect(0, 0, 300, 34);
    });
    const { container } = render(
      <ConfigProvider direction="rtl" locale="en-US">
        <Carousel>
          <span>Short slide</span>
          <span>Tall slide</span>
        </Carousel>
      </ConfigProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Next slide' }));
    const track = container.querySelector('.leaf-carousel__track');
    expect(recorded.find((entry) => entry.node === track)?.keyframes).toEqual([
      { height: '80px' },
      { height: '200px' },
    ]);
    expect(
      String(
        recorded.find((entry) => entry.node.dataset.slideIndex === '1')?.keyframes[0]?.transform,
      ),
    ).toContain('translateX(-12%)');
    for (const entry of recorded)
      Object.defineProperty(entry.animation, 'playState', {
        value: 'finished',
        configurable: true,
      });
    fireEvent.click(screen.getByRole('button', { name: 'Next slide' }));
    expect(recorded.filter((entry) => entry.node === track).at(-1)?.keyframes).toEqual([
      { height: '200px' },
      { height: '80px' },
    ]);
  });

  it('reveals tree children without losing their state and makes closed groups inert', async () => {
    const data = [
      {
        key: 'root',
        title: 'Root',
        children: [{ key: 'draft', title: <input aria-label="Tree draft" /> }],
      },
    ];
    const { container } = render(<Tree data={data} defaultExpandedKeys={['root']} />);
    const draft = screen.getByRole('textbox', { name: 'Tree draft' });
    await userEvent.type(draft, 'Saved');
    fireEvent.click(screen.getByRole('button', { name: '收起 Root' }));
    const group = container.querySelector('.leaf-tree__group');
    expect(group).toHaveAttribute('inert');
    expect(group).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryByRole('textbox')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: '展开 Root' }));
    expect(screen.getByRole('textbox')).toBe(draft);
    expect(draft).toHaveValue('Saved');
  });

  it('updates the authoritative statistic text immediately and does not repeat unchanged animations', () => {
    const { animate } = animationRecorder();
    const { rerender, container } = render(<Statistic value={10} aria-live="polite" />);
    expect(animate).not.toHaveBeenCalled();
    rerender(<Statistic value={20} aria-live="polite" />);
    expect(container.querySelector('.leaf-statistic__number')?.textContent).toBe('20');
    expect(animate).toHaveBeenCalledTimes(1);
    rerender(<Statistic value={20} aria-live="polite" />);
    expect(animate).toHaveBeenCalledTimes(1);
    act(() => {
      fireEvent(window, new Event('resize'));
    });
  });
});
