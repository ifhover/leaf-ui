import { Button, Space, useConfirm } from '@ifhover/leaf-ui';
import { Trash2 } from 'lucide-react';

export function ConfirmIcon() {
  const { confirm } = useConfirm();
  return (
    <Space wrap>
      <Button
        onClick={() =>
          confirm({
            type: 'danger',
            icon: <Trash2 />,
            title: '确认删除该会话？',
            children: '删除后将永久清除这段对话记录及关联记忆。',
            confirmText: '删除',
          })
        }
      >
        自定义图标
      </Button>
      <Button
        onClick={() =>
          confirm({
            icon: null,
            title: '重置筛选条件？',
            children: '当前列表将恢复默认排序与显示列。',
          })
        }
      >
        隐藏图标
      </Button>
      <Button
        onClick={() =>
          confirm({
            type: 'warning',
            showCancel: false,
            confirmText: '我知道了',
            title: '维护窗口提醒',
            children: '服务将在今晚 23:00 进行例行升级，预计耗时 10 分钟。',
          })
        }
      >
        单按钮确认
      </Button>
    </Space>
  );
}
