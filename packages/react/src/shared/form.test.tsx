import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import {
  AutoComplete,
  Button,
  Cascader,
  Checkbox,
  DatePicker,
  Input,
  RadioGroup,
  Select,
  Switch,
  Textarea,
  TimePicker,
} from '../index';

describe('Native form integration', () => {
  it('serializes custom field values and restores uncontrolled defaults for an externally associated form', async () => {
    render(
      <>
        <form id="custom-fields" aria-label="自定义表单">
          <Button type="reset">重置自定义字段</Button>
        </form>
        <DatePicker
          form="custom-fields"
          name="date"
          aria-label="日期"
          defaultValue={new Date(2026, 9, 15)}
        />
        <TimePicker form="custom-fields" name="time" aria-label="时间" defaultValue="14:30" />
        <AutoComplete
          form="custom-fields"
          name="title"
          aria-label="项目"
          defaultValue="Leaf"
          options={[]}
        />
        <Cascader
          form="custom-fields"
          name="path"
          aria-label="路径"
          defaultValue={['root', 'leaf']}
          options={[{ value: 'root', label: '根', children: [{ value: 'leaf', label: '叶' }] }]}
        />
        <DatePicker
          form="custom-fields"
          name="excluded"
          aria-label="禁用日期"
          disabled
          defaultValue={new Date(2026, 9, 15)}
        />
      </>,
    );
    const form = screen.getByRole('form') as HTMLFormElement;
    const defaults = { date: '2026-10-15', time: '14:30', title: 'Leaf', path: '["root","leaf"]' };
    expect(Object.fromEntries(new FormData(form))).toEqual(defaults);
    await userEvent.click(screen.getByRole('button', { name: '清除日期' }));
    await userEvent.click(screen.getByRole('button', { name: '清除时间' }));
    await userEvent.click(screen.getByRole('button', { name: '清除级联选择' }));
    await userEvent.clear(screen.getByRole('combobox', { name: '项目' }));
    expect(Object.fromEntries(new FormData(form))).toEqual({
      date: '',
      time: '',
      title: '',
      path: '',
    });
    await userEvent.click(screen.getByRole('button', { name: '重置自定义字段' }));
    expect(Object.fromEntries(new FormData(form))).toEqual(defaults);
    expect(screen.getByRole('combobox', { name: '日期' })).toHaveTextContent('2026年10月15日');
    expect(screen.getByRole('combobox', { name: '路径' })).toHaveTextContent('根 / 叶');
  });

  it('respects prevented resets and keeps controlled fields unchanged', async () => {
    const { rerender } = render(
      <form aria-label="重置表单" onReset={(event) => event.preventDefault()}>
        <AutoComplete name="title" aria-label="项目" defaultValue="Leaf" options={[]} />
        <Select
          name="team"
          aria-label="团队"
          value="design"
          options={[{ value: 'design', label: '设计' }]}
        />
      </form>,
    );
    await userEvent.type(screen.getByRole('combobox', { name: '项目' }), ' UI');
    fireEvent.reset(screen.getByRole('form'));
    await Promise.resolve();
    expect(screen.getByRole('combobox', { name: '项目' })).toHaveValue('Leaf UI');
    rerender(
      <form aria-label="重置表单">
        <AutoComplete name="title" aria-label="项目" defaultValue="Leaf" options={[]} />
        <Select
          name="team"
          aria-label="团队"
          value="design"
          options={[{ value: 'design', label: '设计' }]}
        />
      </form>,
    );
    fireEvent.reset(screen.getByRole('form'));
    await Promise.resolve();
    expect(screen.getByRole('combobox', { name: '团队' })).toHaveTextContent('设计');
  });

  it('submits field names and values, omits disabled controls and restores defaults on reset', async () => {
    render(
      <form aria-label="项目">
        <Input name="title" aria-label="名称" defaultValue="Leaf" />
        <Textarea name="description" aria-label="简介" defaultValue="Garden" />
        <Checkbox name="subscription" value="news" defaultChecked>
          订阅
        </Checkbox>
        <RadioGroup
          name="theme"
          label="外观"
          defaultValue="light"
          options={[
            { value: 'light', label: '浅色' },
            { value: 'dark', label: '深色' },
          ]}
        />
        <Switch name="notifications" value="on" defaultChecked>
          通知
        </Switch>
        <Select
          name="team"
          aria-label="团队"
          defaultValue="design"
          options={[
            { value: 'design', label: '设计' },
            { value: 'product', label: '产品' },
          ]}
        />
        <Input name="excluded" aria-label="禁用项" disabled defaultValue="hidden" />
        <Button type="reset">重置</Button>
      </form>,
    );
    const form = screen.getByRole('form') as HTMLFormElement;
    expect(Object.fromEntries(new FormData(form))).toEqual({
      title: 'Leaf',
      description: 'Garden',
      subscription: 'news',
      theme: 'light',
      notifications: 'on',
      team: 'design',
    });
    await userEvent.type(screen.getByRole('textbox', { name: '名称' }), ' UI');
    await userEvent.click(screen.getByRole('switch'));
    await userEvent.click(screen.getByRole('checkbox'));
    await userEvent.click(screen.getByRole('radio', { name: '深色' }));
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(screen.getByRole('option', { name: '产品' }));
    expect(new FormData(form).has('notifications')).toBe(false);
    expect(new FormData(form).has('subscription')).toBe(false);
    await userEvent.click(screen.getByRole('button', { name: '重置' }));
    expect(screen.getByRole('textbox', { name: '名称' })).toHaveValue('Leaf');
    expect(screen.getByRole('switch')).toBeChecked();
    expect(screen.getByRole('checkbox')).toBeChecked();
    expect(screen.getByRole('radio', { name: '浅色' })).toBeChecked();
    expect(screen.getByRole('combobox')).toHaveTextContent('设计');
  });
});
