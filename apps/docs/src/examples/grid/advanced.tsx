import { Card, Col, Row, Space } from '@ifhover/leaf-ui';
export function GridColumns() {
  return (
    <Space direction="vertical" align="stretch">
      <Row gutter={12}>
        <Col span={8}>
          <Card>8 / 24</Card>
        </Col>
        <Col span={16}>
          <Card>16 / 24</Card>
        </Col>
      </Row>
      <Row gutter={12}>
        <Col xs={24} md={12}>
          <Card>自适应宽度</Card>
        </Col>
        <Col xs={0} md={12}>
          <Card>窄屏隐藏</Card>
        </Col>
      </Row>
    </Space>
  );
}
