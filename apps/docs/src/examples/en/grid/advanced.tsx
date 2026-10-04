import { Col, Row } from '@sudden3/leaf-ui';

export function GridColumns() {
  return (
    <div className="leaf-demo-stack leaf-demo-stack--wide">
      <Row gutter={[12, 12]}>
        <Col span={8}>
          <div
            style={{
              padding: 18,
              borderRadius: 'var(--leaf-radius)',
              background: 'var(--leaf-color-surface-muted)',
            }}
          >
            8 / 24
          </div>
        </Col>
        <Col span={16}>
          <div
            style={{
              padding: 18,
              borderRadius: 'var(--leaf-radius)',
              background: 'var(--leaf-color-surface-muted)',
            }}
          >
            16 / 24
          </div>
        </Col>
      </Row>
      <Row gutter={12}>
        <Col xs={24} md={12}>
          <div
            style={{
              padding: 18,
              borderRadius: 'var(--leaf-radius)',
              background: 'var(--leaf-color-surface-muted)',
            }}
          >
            Responsive column
          </div>
        </Col>
        <Col xs={0} md={12}>
          <div
            style={{
              padding: 18,
              borderRadius: 'var(--leaf-radius)',
              background: 'var(--leaf-color-surface-muted)',
            }}
          >
            Visible on wider screens
          </div>
        </Col>
      </Row>
    </div>
  );
}
