import { type LeafComponentDefaults, Menu, type MenuProps } from '../src';
import { Menu as SubpathMenu } from '../src/menu';

export function menuTypeContracts() {
  const items = [{ key: 'home', label: 'Home' }];
  const neutral = <Menu items={items} variant="neutral" />;
  const raised = <SubpathMenu items={items} variant="raised" />;
  const primary: MenuProps = { items, variant: 'primary' };
  const defaults: LeafComponentDefaults = { Menu: { variant: 'neutral' } };
  // @ts-expect-error The non-default appearance is now named neutral.
  const invalidMenu = <Menu items={items} variant="default" />;
  // @ts-expect-error Regional defaults use the renamed appearance too.
  const invalidDefaults: LeafComponentDefaults = { Menu: { variant: 'default' } };
  return { neutral, raised, primary, defaults, invalidMenu, invalidDefaults };
}
