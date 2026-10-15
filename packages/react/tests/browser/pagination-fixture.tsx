import { Button, ConfigProvider, Pagination, Space } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function PaginationFixture() {
  const [pagination, setPagination] = useState({ current: 2, pageSize: 10 });
  const [changes, setChanges] = useState(0);
  return (
    <>
      <h1>Pagination</h1>
      <Space direction="vertical" align="stretch" size="lg">
        <Pagination aria-label="Outline pages" total={120} defaultCurrent={2} />
        <Pagination aria-label="Ghost pages" total={120} defaultCurrent={2} variant="ghost" />
        <section aria-label="Sizes">
          <Space direction="vertical" align="stretch">
            {(['sm', 'md', 'lg'] as const).map((size) => (
              <Pagination
                key={size}
                aria-label={`Size ${size}`}
                total={50}
                size={size}
                showSizeChanger
                showQuickJumper
              />
            ))}
          </Space>
        </section>
        <Pagination
          aria-label="Controlled pages"
          total={120}
          {...pagination}
          showSizeChanger
          showQuickJumper
          showTotal
          onChange={(current, pageSize) => {
            setPagination({ current, pageSize });
            setChanges((count) => count + 1);
          }}
        />
        <output aria-label="Pagination state">
          {pagination.current}/{pagination.pageSize} ({changes})
        </output>
        <Button variant="outline">Outside</Button>
        <Pagination aria-label="Simple pages" total={120} defaultCurrent={2} simple />
        <Pagination
          aria-label="Disabled pages"
          total={120}
          disabled
          showSizeChanger
          showQuickJumper
        />
        <Pagination aria-label="Hidden pages" total={0} hideOnSinglePage />
        <ConfigProvider
          direction="rtl"
          density="compact"
          theme={{ primaryColor: '#7654c6', controlHeight: 44, borderRadius: 4, motion: false }}
        >
          <Pagination aria-label="Custom pages" total={50} defaultCurrent={2} />
        </ConfigProvider>
      </Space>
    </>
  );
}
