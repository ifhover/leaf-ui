import { Button, CardTitle, Space, Tag } from '@ifhover/leaf-ui';

export function CardStandaloneTitle() {
  return (
    <Space direction="vertical" align="stretch" size="lg">
      <CardTitle size="sm" description="今天更新了组件规范。">
        最近动态
      </CardTitle>
      <CardTitle description="整理项目资料，让团队围绕同一份计划协作。" extra={<Tag>进行中</Tag>}>
        项目概览
      </CardTitle>
      <CardTitle
        size="lg"
        description="共享设计资源与开发进度。"
        extra={<Button variant="link">查看空间</Button>}
      >
        团队空间
      </CardTitle>
    </Space>
  );
}
