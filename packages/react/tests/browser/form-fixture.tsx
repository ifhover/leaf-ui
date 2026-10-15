import { useState } from 'react';
import { Button, ConfigProvider, Form, FormField, FormGroup, Input, Space } from '../../src';

export function FormFixture() {
  const [saved, setSaved] = useState('');
  return (
    <Form
      aria-label="Profile"
      onSubmit={(event) => {
        event.preventDefault();
        setSaved(String(new FormData(event.currentTarget).get('name')));
      }}
      onReset={() => setSaved('')}
    >
      <FormField label="Name" required>
        <Input name="name" defaultValue="Leaf Studio" />
      </FormField>
      <Space>
        <Button type="submit">Save profile</Button>
        <Button type="reset" variant="outline">
          Reset profile
        </Button>
      </Space>
      <output aria-label="Saved name">{saved}</output>
    </Form>
  );
}

export function FormHelpFixture() {
  const params = new URLSearchParams(window.location.search);
  const [feedback, setFeedback] = useState<'none' | 'short' | 'wrapped' | 'error' | 'url'>('none');
  const help = {
    none: undefined,
    short: 'A short hint.',
    wrapped:
      'Use an address that your teammates can reach. Project updates, invitations and important account notices will be sent to this address. You can change it later in your workspace settings.',
    error: 'A short hint.',
    url: `https://example.com/${'very-long-workspace-address-'.repeat(12)}`,
  }[feedback];
  const fields = (
    <>
      <FormField
        label="Primary"
        help={help}
        error={feedback === 'error' ? 'Check this value.' : undefined}
      >
        <Input name="primary" />
      </FormField>
      <FormField label="Next" help="Another hint at the end of the group.">
        <Input name="next" />
      </FormField>
    </>
  );
  return (
    <ConfigProvider
      style={{ minHeight: 0 }}
      theme={{
        ...(params.get('large-text') ? { fontSize: 18, tokens: { fontSizeSm: 17 } } : {}),
        ...(params.get('small-gap') ? { components: { Form: { gap: 8 } } } : {}),
      }}
    >
      <Space wrap>
        <Button onClick={() => setFeedback('none')}>No help</Button>
        <Button onClick={() => setFeedback('short')}>One line</Button>
        <Button onClick={() => setFeedback('wrapped')}>Wrapped help</Button>
        <Button onClick={() => setFeedback('error')}>Show error</Button>
        <Button onClick={() => setFeedback('url')}>Long address</Button>
      </Space>
      <Form
        aria-label="Help spacing"
        layout={params.get('layout') === 'vertical' ? 'vertical' : 'horizontal'}
        style={{ width: '100%', maxWidth: 360, marginBlockStart: 24 }}
      >
        {params.get('nested') ? <FormGroup legend="Contact">{fields}</FormGroup> : fields}
        <FormField label="Last" help="This last hint must stay inside the form.">
          <Input name="last" />
        </FormField>
      </Form>
      <p data-testid="after-form">Content after the form</p>
    </ConfigProvider>
  );
}
