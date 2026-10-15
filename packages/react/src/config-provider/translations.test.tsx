import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import {
  DatePicker,
  Pagination,
  Select,
  Statistic,
  useConfirm,
  useMessage,
  useNotification,
} from '../index';
import {
  getMessage,
  localeChain,
  mergeTranslations,
  resolveTranslations,
} from '../locales/resolve';
import type { LeafTranslation, LeafTranslations } from '../locales/types';
import { useFormattedText } from '../shared/use-formatted-text';
import { ConfigProvider, type ConfigProviderProps, useLeafConfig } from './config-provider';

// Private tags keep fallback coverage independent of the built-in Japanese resource.
const resources: LeafTranslations = {
  'ja-JP-x-test': {
    select: { placeholder: '選択してください' },
    common: { confirm: '確認', cancel: 'キャンセル' },
  },
  'fr-FR': { select: { empty: 'Aucune option' }, datePicker: { placeholder: 'Choisir une date' } },
};
function Snapshot() {
  const { locale, localeChain: chain, messages } = useLeafConfig();
  return (
    <output>
      {JSON.stringify({
        locale,
        chain,
        placeholder: messages.select.placeholder,
        empty: messages.select.empty,
        close: messages.common.close,
      })}
    </output>
  );
}
function Sentence({ count = 1 }: { count?: number }) {
  const format = useFormattedText();
  return <output>{format('pagination.total', { total: count })}</output>;
}

describe('scoped JSON translations', () => {
  it('accepts JSON-shaped partial resources and readonly language chains', () => {
    expectTypeOf<ConfigProviderProps['translations']>().toEqualTypeOf<
      LeafTranslations | undefined
    >();
    const language: ConfigProviderProps['locale'] = ['ja-JP-x-test', 'en-US'] as const;
    const pack: LeafTranslation = { select: { placeholder: '' } };
    expect(language[0]).toBe('ja-JP-x-test');
    expect(pack.select?.placeholder).toBe('');
  });
  it('falls back per entry, keeps the first locale for Intl, lang and portalled panels', async () => {
    render(
      <ConfigProvider
        locale={['ja-JP-x-test', 'fr-FR']}
        translations={resources}
        data-testid="scope"
      >
        <Select aria-label="Choice" options={[]} />
        <DatePicker aria-label="Date" defaultValue={new Date(2026, 9, 16)} />
        <Statistic title="Number" value={1234.5} precision={1} />
      </ConfigProvider>,
    );
    expect(screen.getByTestId('scope')).toHaveAttribute('lang', 'ja-JP-x-test');
    expect(screen.getByRole('combobox', { name: 'Choice' })).toHaveAttribute(
      'placeholder',
      '選択してください',
    );
    expect(screen.getByRole('combobox', { name: 'Date' })).toHaveValue('2026-10-16');
    await userEvent.click(screen.getByRole('combobox', { name: 'Date' }));
    expect(
      screen.getByText(
        new Intl.DateTimeFormat('ja-JP-x-test', { month: 'short' }).format(new Date(2026, 9, 16)),
      ),
    ).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    expect(
      screen.getByText(
        new Intl.NumberFormat('ja-JP-x-test', {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        }).format(1234.5),
      ),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole('combobox', { name: 'Choice' }));
    expect(screen.getByText('Aucune option')).toBeInTheDocument();
    expect(screen.getByText('Aucune option').closest('[lang]')).toHaveAttribute(
      'lang',
      'ja-JP-x-test',
    );
  });
  it('merges nested resources but replaces an explicit language chain', () => {
    render(
      <ConfigProvider locale={['ja-JP-x-test', 'fr-FR']} translations={resources}>
        <ConfigProvider translations={{ 'ja-JP-x-test': { select: { empty: '候補なし' } } }}>
          <Snapshot />
        </ConfigProvider>
        <ConfigProvider locale="ja-JP-x-test">
          <Snapshot />
        </ConfigProvider>
        <ConfigProvider locale="fr-CA">
          <Snapshot />
        </ConfigProvider>
      </ConfigProvider>,
    );
    const values = screen
      .getAllByRole('status')
      .map((node) => JSON.parse(node.textContent ?? '{}'));
    expect(values[0]).toMatchObject({
      locale: 'ja-JP-x-test',
      chain: ['ja-JP-x-test', 'fr-FR'],
      placeholder: '選択してください',
      empty: '候補なし',
      close: 'Close',
    });
    expect(values[1]).toMatchObject({ chain: ['ja-JP-x-test'], empty: 'No options' });
    expect(values[2]).toMatchObject({
      locale: 'fr-CA',
      placeholder: 'Please select',
      empty: 'No options',
    });
  });
  it('overrides built-ins, preserves empty strings, and respects instance and component props', () => {
    render(
      <ConfigProvider
        locale="en-US"
        translations={{
          'en-US': { datePicker: { placeholder: 'Project date' }, select: { placeholder: '' } },
        }}
        components={{ DatePicker: { placeholder: 'Configured date' } }}
      >
        <Select aria-label="Empty placeholder" options={[]} />
        <DatePicker aria-label="Configured" />
        <DatePicker aria-label="Explicit" placeholder="Instance date" />
        <ConfigProvider components={{ DatePicker: null }}>
          <DatePicker aria-label="Translated" />
        </ConfigProvider>
      </ConfigProvider>,
    );
    expect(screen.getByLabelText('Empty placeholder')).toHaveAttribute('placeholder', '');
    expect(screen.getByLabelText('Configured')).toHaveAttribute('placeholder', 'Configured date');
    expect(screen.getByLabelText('Explicit')).toHaveAttribute('placeholder', 'Instance date');
    expect(screen.getByLabelText('Translated')).toHaveAttribute('placeholder', 'Project date');
  });
  it('updates inherited translations when resources or language change without leaking to siblings', () => {
    const View = ({ text, locale }: { text: string; locale: string }) => (
      <>
        <ConfigProvider
          locale={locale}
          translations={{ 'ja-JP-x-test': { select: { placeholder: text } } }}
        >
          <ConfigProvider>
            <Select aria-label="Changing" options={[]} />
          </ConfigProvider>
        </ConfigProvider>
        <ConfigProvider locale="ja-JP-x-test">
          <Select aria-label="Sibling" options={[]} />
        </ConfigProvider>
      </>
    );
    const { rerender } = render(<View text="最初" locale="ja-JP-x-test" />);
    expect(screen.getByLabelText('Changing')).toHaveAttribute('placeholder', '最初');
    rerender(<View text="更新" locale="ja-JP-x-test" />);
    expect(screen.getByLabelText('Changing')).toHaveAttribute('placeholder', '更新');
    expect(screen.getByLabelText('Sibling')).toHaveAttribute('placeholder', 'Please select');
    rerender(<View text="更新" locale="en-US" />);
    expect(screen.getByLabelText('Changing')).toHaveAttribute('placeholder', 'Please select');
  });
  it('formats ICU plurals in the language supplying the entry, with repeated arguments', () => {
    const { rerender } = render(
      <ConfigProvider
        locale={['ja-JP-x-test', 'en-US']}
        translations={{
          'en-US': {
            pagination: { total: '{total, plural, one {# item} other {# items}}; {total}' },
          },
        }}
      >
        <Sentence />
      </ConfigProvider>,
    );
    expect(screen.getByRole('status')).toHaveTextContent('1 item; 1');
    rerender(
      <ConfigProvider
        locale={['ja-JP-x-test', 'en-US']}
        translations={{
          'en-US': {
            pagination: { total: '{total, plural, one {# item} other {# items}}; {total}' },
          },
        }}
      >
        <Sentence count={3} />
      </ConfigProvider>,
    );
    expect(screen.getByRole('status')).toHaveTextContent('3 items; 3');
  });
  it('keeps malformed templates from breaking controls and reports the entry once', () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <ConfigProvider
        locale="ja-JP-x-test"
        translations={{ 'ja-JP-x-test': { pagination: { total: '{invalid' } } }}
      >
        <Sentence count={8} />
      </ConfigProvider>,
    );
    expect(screen.getByRole('status')).toHaveTextContent('Total 8 items');
    expect(warning).toHaveBeenCalledTimes(1);
    expect(warning.mock.calls[0]?.[0]).toContain('pagination.total');
    warning.mockRestore();
  });
  it('keeps active regional number and date formats when a sentence falls back', () => {
    function DateSentence() {
      const format = useFormattedText();
      return <output>{format('pagination.total', { total: new Date(2026, 9, 16) })}</output>;
    }
    const { rerender } = render(
      <ConfigProvider
        locale={['de-DE', 'en-US']}
        translations={{
          'en-US': {
            pagination: { total: '{total, plural, one {# item} other {# items}}; {total, number}' },
          },
        }}
      >
        <Sentence count={1234.5} />
      </ConfigProvider>,
    );
    expect(screen.getByRole('status')).toHaveTextContent('1.234,5 items; 1.234,5');
    rerender(
      <ConfigProvider
        locale={['de-DE', 'en-US']}
        translations={{ 'en-US': { pagination: { total: 'Date: {total, date, short}' } } }}
      >
        <DateSentence />
      </ConfigProvider>,
    );
    expect(screen.getByRole('status')).toHaveTextContent(
      `Date: ${new Intl.DateTimeFormat('de-DE', {
        month: 'numeric',
        day: 'numeric',
        year: '2-digit',
      }).format(new Date(2026, 9, 16))}`,
    );
  });
  it('inherits translated actions in Confirm, Message and Notification portals', async () => {
    function Actions() {
      const { confirm } = useConfirm();
      const { message } = useMessage();
      const notification = useNotification();
      return (
        <>
          <button
            type="button"
            onClick={() => void confirm({ title: 'Decision', children: 'Proceed?' })}
          >
            Confirm
          </button>
          <button
            type="button"
            onClick={() => message.open({ content: 'Saved', duration: 0, closable: true })}
          >
            Message
          </button>
          <button type="button" onClick={() => notification.open({ title: 'Notice', duration: 0 })}>
            Notification
          </button>
        </>
      );
    }
    render(
      <ConfigProvider
        locale="ja-JP-x-test"
        translations={{
          'ja-JP-x-test': { common: { confirm: '確認', cancel: 'キャンセル', close: '閉じる' } },
        }}
      >
        <Actions />
      </ConfigProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    const dialog = screen.getByRole('alertdialog', { name: 'Decision' });
    expect(within(dialog).getByRole('button', { name: '確認' })).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole('button', { name: 'キャンセル' }));
    await userEvent.click(screen.getByRole('button', { name: 'Message' }));
    expect(screen.getByRole('button', { name: '閉じる' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Notification' }));
    expect(screen.getAllByRole('button', { name: '閉じる' })).toHaveLength(2);
  });
  it('renders and hydrates per-request resources without sharing mutations', async () => {
    const element = (text: string) => (
      <ConfigProvider
        locale="ja-JP-x-test"
        translations={{
          'ja-JP-x-test': { pagination: { total: '全 {total} 件' }, select: { placeholder: text } },
        }}
      >
        <Select options={[]} />
        <Pagination total={12} showTotal />
      </ConfigProvider>
    );
    const first = renderToString(element('一つ'));
    const second = renderToString(element('二つ'));
    expect(first).toContain('一つ');
    expect(second).not.toContain('一つ');
    const container = document.createElement('div');
    container.innerHTML = first;
    document.body.append(container);
    const onError = vi.fn();
    let root: ReturnType<typeof hydrateRoot>;
    await act(() => {
      root = hydrateRoot(container, element('一つ'), { onRecoverableError: onError });
    });
    expect(onError).not.toHaveBeenCalled();
    expect(container.textContent).toContain('全 12 件');
    await act(() => root.unmount());
    container.remove();
  });
  it('validates explicit chains, canonicalizes tags and never mutates the supplied resources', () => {
    expect(() => localeChain([])).toThrow(/at least one/);
    expect(() => localeChain('bad_locale')).toThrow(RangeError);
    expect(localeChain(['ja-jp', 'en-us', 'ja-JP'])).toEqual(['ja-JP', 'en-US']);
    const own = Object.freeze({
      'en-us': Object.freeze({ select: Object.freeze({ placeholder: 'Custom' }) }),
    });
    const merged = mergeTranslations({}, own);
    expect(getMessage(resolveTranslations(['en-US'], merged).messages, 'select.placeholder')).toBe(
      'Custom',
    );
    expect(own['en-us'].select.placeholder).toBe('Custom');
    expect(mergeTranslations(merged, undefined)).toBe(merged);
    expect(
      resolveTranslations(['fr-CA'], { fr: { select: { empty: 'French' } } }).messages.select.empty,
    ).toBe('No options');
  });
});
