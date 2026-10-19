import { useState } from 'react';
import { FormSettings as EnglishSettings } from '../../../../apps/docs/src/examples/en/form/settings';
import { FormSettings as ChineseSettings } from '../../../../apps/docs/src/examples/form/settings';
import { Button, Form, FormField, FormGroup, Input, Switch, Textarea } from '../../src';

export function FormSettingsFixture() {
  const [error, setError] = useState(false);
  const english = new URLSearchParams(location.search).get('lang') === 'en';
  return (
    <>
      <h1>Settings form</h1>
      <div data-testid="settings-example">
        {english ? <EnglishSettings /> : <ChineseSettings />}
      </div>
      <h2>Field descriptions and feedback</h2>
      <Form aria-label="Feedback settings" layout="settings">
        <FormField
          label="Workspace name"
          description="The public name of your workspace."
          help="Use a name your team recognizes."
          error={error ? 'This name is already taken.' : undefined}
        >
          <Input name="workspace" defaultValue="Leaf" />
        </FormField>
      </Form>
      <Button onClick={() => setError((value) => !value)}>Toggle error</Button>
      <h2>Grouped settings</h2>
      <Form aria-label="Grouped settings" layout="settings">
        <FormGroup legend="Preferences">
          <FormField label="Auto archive" description="Archive completed conversations.">
            <Switch name="autoArchive" />
          </FormField>
        </FormGroup>
        <FormGroup legend="Personalization">
          <FormField label="Notes" layout="vertical" description="Add context for your team.">
            <Textarea name="notes" rows={2} />
          </FormField>
        </FormGroup>
      </Form>
    </>
  );
}
