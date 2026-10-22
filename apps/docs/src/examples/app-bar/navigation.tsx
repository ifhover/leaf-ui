import { BottomNavigation } from '@ifhover/leaf-ui';
import { Home, Settings, User } from 'lucide-react';
import { useState } from 'react';
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
