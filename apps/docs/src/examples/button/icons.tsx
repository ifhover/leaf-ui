import { Button } from '@leaf-ui/react';

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M4 12h16m-6-6 6 6-6 6" />
    </svg>
  );
}

export function ButtonIcons() {
  return (
    <>
      <Button startIcon={<PlusIcon />}>新建项目</Button>
      <Button variant="outline" endIcon={<ArrowIcon />}>
        继续下一步
      </Button>
      <Button variant="soft" aria-label="添加项目" startIcon={<PlusIcon />} />
    </>
  );
}
