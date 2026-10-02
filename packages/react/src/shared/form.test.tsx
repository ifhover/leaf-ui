import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Button, Checkbox, Input, RadioGroup, Select, Switch, Textarea } from '../index';

describe('Native form integration', () => {
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
    await userEvent.selectOptions(screen.getByRole('combobox'), 'product');
    expect(new FormData(form).has('notifications')).toBe(false);
    expect(new FormData(form).has('subscription')).toBe(false);
    await userEvent.click(screen.getByRole('button', { name: '重置' }));
    expect(screen.getByRole('textbox', { name: '名称' })).toHaveValue('Leaf');
    expect(screen.getByRole('switch')).toBeChecked();
    expect(screen.getByRole('checkbox')).toBeChecked();
    expect(screen.getByRole('radio', { name: '浅色' })).toBeChecked();
    expect(screen.getByRole('combobox')).toHaveValue('design');
  });
});
