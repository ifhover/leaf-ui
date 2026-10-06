import { AppBar, BottomNavigation, Button, Toolbar } from '@sudden3/leaf-ui';
import { Home, Menu, Search, Settings, User } from 'lucide-react';
import { useState } from 'react';
export function AppBarBasic({ english = false }: { english?: boolean }) {
  return (
    <AppBar elevation>
      <Toolbar>
        <Button
          variant="ghost"
          startIcon={<Menu size={18} />}
          aria-label={english ? 'Menu' : '菜单'}
        />
        <strong style={{ marginInlineEnd: 'auto' }}>Leaf workspace</strong>
        <Button
          variant="ghost"
          startIcon={<Search size={18} />}
          aria-label={english ? 'Search' : '搜索'}
        />
        <Button size="sm">{english ? 'Create' : '新建'}</Button>
      </Toolbar>
    </AppBar>
  );
}
export function AppBarNavigation({ english = false }: { english?: boolean }) {
  const [value, setValue] = useState('home');
  return (
    <BottomNavigation
      style={{ width: '100%', maxWidth: 560 }}
      aria-label={english ? 'Workspace navigation' : '工作区导航'}
      value={value}
      onChange={setValue}
      items={[
        { key: 'home', label: english ? 'Home' : '首页', icon: <Home size={20} /> },
        { key: 'profile', label: english ? 'Profile' : '个人资料', icon: <User size={20} /> },
        { key: 'settings', label: english ? 'Settings' : '设置', icon: <Settings size={20} /> },
      ]}
    />
  );
}
