import { Card, Col, Row } from '@ifhover/leaf-ui';

export function GridResponsiveSpans() {
  return (
    <Row gutter={12}>
      <Col xs={24} md={12}>
        <Card>主要内容</Card>
      </Col>
      <Col xs={0} md={12}>
        <Card>补充内容</Card>
      </Col>
    </Row>
  );
}
