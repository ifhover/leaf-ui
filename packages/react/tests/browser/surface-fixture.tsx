import {
  Alert,
  Button,
  Checkbox,
  CheckboxGroup,
  ConfigProvider,
  Modal,
  RadioGroup,
  Space,
  Tag,
  useConfirm,
} from '@ifhover/leaf-ui';
import { HardDrive, Mail, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { NeutralAlerts } from '../../../../apps/docs/src/examples/alert/neutral';
import { CardSections } from '../../../../apps/docs/src/examples/card/sections';
import { DrawerSections } from '../../../../apps/docs/src/examples/drawer/sections';
import { AccessScope } from '../../../../apps/docs/src/examples/modal/access-scope';

function ConfirmationActions() {
  const { confirm } = useConfirm();
  const [deleted, setDeleted] = useState(false);
  return (
    <>
      <Button
        variant="outline"
        onClick={() =>
          confirm({
            title: 'Continue',
            type: 'info',
            children: 'Keep your current settings?',
          })
        }
      >
        Simple confirmation
      </Button>
      <Button
        variant="outline"
        danger
        onClick={async () => {
          if (
            await confirm({
              title: 'Delete project',
              type: 'danger',
              children: 'This cannot be undone.',
            })
          )
            setDeleted(true);
        }}
      >
        Delete project
      </Button>
      {deleted && <span>Project deleted.</span>}
    </>
  );
}

export function SurfaceFixture() {
  const [saved, setSaved] = useState('');
  const [plain, setPlain] = useState(false);
  const tokens = new URLSearchParams(location.search).has('surface-tokens');
  return (
    <div className="surface-fixture">
      <h1>Surface design</h1>
      <ConfigProvider
        theme={
          tokens
            ? {
                primaryColor: '#1265f5',
                borderRadius: 4,
                tokens: { dividerColor: 'rgb(100 110 120)' },
                components: {
                  Modal: {
                    padding: '14px 18px',
                    footerBackground: 'var(--leaf-color-primary-surface-5)',
                  },
                  Drawer: {
                    padding: '14px 18px',
                    footerBackground: 'var(--leaf-color-primary-surface-5)',
                  },
                  Checkbox: { borderRadius: 8, borderColor: 'rgb(100 110 120)' },
                },
              }
            : undefined
        }
      >
        <Space wrap align="start" size="sm">
          <AccessScope english />
          <ConfirmationActions />
          <DrawerSections english />
          <Button variant="outline" onClick={() => setPlain(true)}>
            Spacing only
          </Button>
        </Space>
        <Modal
          open={plain}
          title="Spacing only"
          description="No internal dividers"
          divided={false}
          onClose={() => setPlain(false)}
        >
          Content grouped with spacing.
        </Modal>
        <h2>Choice and notice states</h2>
        <form
          aria-label="Rich choices"
          onSubmit={(event) => {
            event.preventDefault();
            setSaved(JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))));
          }}
        >
          <Space direction="vertical" align="stretch" size={20} style={{ marginBlock: 24 }}>
            <CheckboxGroup
              name="services"
              legend="Services"
              variant="card"
              defaultValue={['mail']}
              required
              options={[
                { value: 'mail', label: 'Mail', description: 'Read messages', icon: <Mail /> },
                { value: 'drive', label: 'Drive', description: 'Read files', icon: <HardDrive /> },
                {
                  value: 'blocked',
                  label: 'Unavailable',
                  description: 'Administrator setup needed',
                  disabled: true,
                },
              ]}
            />
            <RadioGroup
              name="policy"
              label="Policy"
              variant="list"
              defaultValue="read"
              options={[
                {
                  value: 'read',
                  label: 'Read-only',
                  description: 'No changes without approval',
                  extra: (
                    <Tag color="success" size="sm">
                      Recommended
                    </Tag>
                  ),
                },
                { value: 'review', label: 'Always ask', description: 'Review each request' },
              ]}
            />
            <Checkbox
              variant="card"
              indeterminate
              description="Some services are selected"
              icon={<ShieldCheck />}
            >
              Partial selection
            </Checkbox>
            <Space>
              <Button type="submit">Submit choices</Button>
              <Button variant="outline" type="reset">
                Reset choices
              </Button>
            </Space>
            <output aria-label="Submitted choices">{saved}</output>
          </Space>
        </form>
        <NeutralAlerts english />
        <Alert
          title="Neutral surface"
          description="Status icons carry meaning on the same neutral surface."
        />
        <CardSections english />
      </ConfigProvider>
    </div>
  );
}
