import { Button, Space, useConfirm } from '@ifhover/leaf-ui';
import { CircleX } from 'lucide-react';

export function ConfirmStatus() {
  const { confirm } = useConfirm();
  return (
    <Space wrap>
      <Button
        onClick={() =>
          confirm({
            title: '确认发布文章？',
            children: '发布后所有工作区成员都可以查看内容。',
          })
        }
      >
        默认确认
      </Button>
      <Button
        onClick={() =>
          confirm({
            type: 'success',
            title: '导出已准备就绪',
            children: '文件已生成，可以立即下载。',
          })
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
      <Button
        onClick={() =>
          confirm({
            type: 'danger',
            title: '删除项目？',
            children: '删除后关联资源将一并清除，无法恢复。',
            confirmText: '删除',
          })
        }
      >
        危险确认
      </Button>
      <Button
        onClick={() =>
          confirm({
            type: 'danger',
            icon: <CircleX />,
            showCancel: false,
            title: '导入失败',
            children: '文件格式不受支持，请检查后重新上传。',
          })
        }
      >
        失败提示
      </Button>
    </Space>
  );
}
