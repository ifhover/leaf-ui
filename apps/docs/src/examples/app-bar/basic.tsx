import { AppBar, Button, Toolbar } from '@ifhover/leaf-ui';
import { Menu, Search } from 'lucide-react';
export function AppBarBasic({ english = false }: { english?: boolean }) {
  return (
    <AppBar elevation>
      <Toolbar>
        <Button startIcon={<Menu size={18} />} aria-label={english ? 'Menu' : '菜单'} />
        <strong style={{ marginInlineEnd: 'auto' }}>Leaf workspace</strong>
        <Button startIcon={<Search size={18} />} aria-label={english ? 'Search' : '搜索'} />
        <Button size="sm">{english ? 'Create' : '新建'}</Button>
      </Toolbar>
    </AppBar>
  );
}
