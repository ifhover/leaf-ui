import { Card, Col, Row } from '@ifhover/leaf-ui';

export function GridColumns() {
  return (
    <Row gutter={12}>
      <Col span={8}>
        <Card>8/24</Card>
      </Col>
      <Col span={16}>
        <Card>16/24</Card>
      </Col>
    </Row>
  );
}
