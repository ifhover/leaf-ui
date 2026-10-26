import { Button, Space, useConfirm } from '@ifhover/leaf-ui';

export function ConfirmStatus() {
  const { confirm } = useConfirm();
  return (
    <Space wrap>
      <Button
        onClick={() =>
          confirm({ type: 'info', title: '分享链接？', children: '获得链接的人可以查看此页面。' })
        }
      >
        信息提示
      </Button>
      <Button
        onClick={() =>
          confirm({ type: 'success', title: '导出已准备就绪', children: '文件已生成，可以下载。' })
        }
      >
        成功提示
      </Button>
      <Button
        onClick={() =>
          confirm({
            type: 'warning',
            title: '离开当前页面？',
            children: '尚未保存的更改将会丢失。',
          })
        }
      >
        警告确认
      </Button>
    </Space>
  );
}
