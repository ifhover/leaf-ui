import { CardTitle, Paragraph, Space } from '@ifhover/leaf-ui';

export function CardStandaloneTitle() {
  return (
    <Space direction="vertical" align="stretch" size="lg">
      <section>
        <CardTitle size="sm" level={2}>
          最近动态
        </CardTitle>
        <Paragraph>今天更新了组件规范。</Paragraph>
      </section>
      <section>
        <CardTitle level={2}>项目概览</CardTitle>
        <Paragraph>整理项目资料，让团队围绕同一份计划协作。</Paragraph>
      </section>
      <section>
        <CardTitle size="lg" level={2}>
          团队空间
        </CardTitle>
        <Paragraph>共享设计资源与开发进度。</Paragraph>
      </section>
    </Space>
  );
}
