import { Card, Col, Row } from '@ifhover/leaf-ui';

export function GridOffset() {
  return (
    <Row gutter={12}>
      <Col span={8}>
        <Card>8/24</Card>
      </Col>
      <Col span={8} offset={8}>
        <Card>8/24</Card>
      </Col>
    </Row>
  );
}
