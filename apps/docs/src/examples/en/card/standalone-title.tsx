import { CardTitle, Paragraph, Space } from '@ifhover/leaf-ui';

export function CardStandaloneTitle() {
  return (
    <Space direction="vertical" align="stretch" size="lg">
      <section>
        <CardTitle size="sm" level={2}>
          Recent activity
        </CardTitle>
        <Paragraph>The component guidelines were updated today.</Paragraph>
      </section>
      <section>
        <CardTitle level={2}>Project overview</CardTitle>
        <Paragraph>
          Keep project details together so your team can work from the same plan.
        </Paragraph>
      </section>
      <section>
        <CardTitle size="lg" level={2}>
          Team workspace
        </CardTitle>
        <Paragraph>Share design resources and development progress.</Paragraph>
      </section>
    </Space>
  );
}
