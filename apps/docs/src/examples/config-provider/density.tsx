import { Button, ConfigProvider, Form, FormField, Input, Select, Space } from '@sudden3/leaf-ui';
import { useDocsLocale } from '../../components/i18n';

export function ConfigProviderDensity() {
  const { t } = useDocsLocale();
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
        gap: 24,
      }}
    >
      {(['comfortable', 'compact'] as const).map((density) => (
        <ConfigProvider key={density} density={density}>
          <h3>{density === 'compact' ? t('紧凑', 'Compact') : t('舒适', 'Comfortable')}</h3>
          <Form onSubmit={(event) => event.preventDefault()}>
            <FormField label={t('项目名称', 'Project name')}>
              <Input aria-label={t('项目名称', 'Project name')} defaultValue="Leaf workspace" />
            </FormField>
            <FormField label={t('负责人', 'Owner')}>
              <Select
                aria-label={t('负责人', 'Owner')}
                options={[
                  { value: 'lin', label: 'Lin' },
                  { value: 'alex', label: 'Alex' },
                ]}
                defaultValue="lin"
              />
            </FormField>
            <Space>
              <Button>{t('保存', 'Save')}</Button>
              <Button variant="outline">{t('取消', 'Cancel')}</Button>
            </Space>
          </Form>
        </ConfigProvider>
      ))}
    </div>
  );
}
