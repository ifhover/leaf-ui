import {
  Button,
  Card,
  ConfigProvider,
  Input,
  Menu,
  Select,
  Tabs,
  Tag,
  Text,
  Title,
} from '@ifhover/leaf-ui';
import { Folder, House, Plus, Search, Settings } from 'lucide-react';
import { useState } from 'react';
import './workbench-fixture.scss';

const tasks = [
  { title: 'Review the navigation', detail: 'Design system / Navigation', state: 'In progress' },
  { title: 'Prepare the next release', detail: 'Engineering / Release', state: 'Planned' },
  {
    title: 'Update the getting started guide',
    detail: 'Documentation / Onboarding',
    state: 'Planned',
  },
];

export function WorkbenchFixture() {
  const [search, setSearch] = useState('');
  const [active, setActive] = useState('all');
  const [selected, setSelected] = useState('Review the navigation');
  const [saved, setSaved] = useState(false);
  return (
    <div className="workbench">
      <aside className="workbench__sidebar">
        <Text strong>Leaf workspace</Text>
        <Menu
          variant="raised"
          aria-label="Workspace navigation"
          defaultSelectedKey="projects"
          items={[
            {
              key: 'workspace',
              type: 'group',
              label: 'Workspace',
              children: [
                { key: 'home', label: 'Overview', icon: <House /> },
                { key: 'projects', label: 'Projects', icon: <Folder />, extra: '3' },
                { key: 'settings', label: 'Settings', icon: <Settings /> },
              ],
            },
          ]}
        />
        <Text tone="muted">One place for the work that matters.</Text>
      </aside>
      <section className="workbench__main" aria-label="Project workspace">
        <header className="workbench__heading">
          <div>
            <Text tone="muted">Workspace / Projects</Text>
            <Title level={2}>Projects</Title>
          </div>
          <Button variant="solid" startIcon={<Plus />} onClick={() => setSaved(true)}>
            New project
          </Button>
        </header>
        <div className="workbench__toolbar">
          <Input
            aria-label="Search projects"
            placeholder="Search projects"
            prefix={<Search size={16} />}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Select
            aria-label="Project owner"
            defaultValue="all"
            options={[
              { value: 'all', label: 'All owners' },
              { value: 'me', label: 'Assigned to me' },
            ]}
          />
        </div>
        <Tabs
          type="segmented"
          aria-label="Project status"
          activeKey={active}
          onChange={setActive}
          items={[
            { key: 'all', label: 'All projects' },
            { key: 'progress', label: 'In progress' },
          ]}
        />
        <div className="workbench__panels">
          <Card
            variant="layered"
            title="Your projects"
            extra={<Text tone="muted">3 projects</Text>}
            footer={
              <Button
                size="sm"
                onClick={() => {
                  setSearch('');
                  setActive('all');
                }}
              >
                Reset filters
              </Button>
            }
          >
            <div className="workbench__tasks">
              {tasks
                .filter(
                  (task) =>
                    task.title.toLowerCase().includes(search.toLowerCase()) &&
                    (active === 'all' || task.state === 'In progress'),
                )
                .map((task) => (
                  <div className="workbench__task" key={task.title}>
                    <div>
                      <Button
                        variant="link"
                        aria-pressed={selected === task.title}
                        onClick={() => setSelected(task.title)}
                      >
                        {task.title}
                      </Button>
                      <div>
                        <Text tone="muted">{task.detail}</Text>
                      </div>
                    </div>
                    <Tag color={task.state === 'Planned' ? 'default' : 'primary'}>{task.state}</Tag>
                  </div>
                ))}
              {!tasks.some((task) => task.title.toLowerCase().includes(search.toLowerCase())) && (
                <Text tone="muted">No matching projects.</Text>
              )}
            </div>
          </Card>
          <Card
            variant="layered"
            title="Project details"
            footer={
              <Button size="sm" onClick={() => setSaved(true)}>
                Save changes
              </Button>
            }
          >
            <div className="workbench__details">
              <Text strong data-testid="workbench-strong">
                {selected}
              </Text>
              <Text data-testid="workbench-body">
                Keep the interface quiet, consistent and focused on the content.
              </Text>
              <Select
                aria-label="Priority"
                defaultValue="normal"
                options={[
                  { value: 'normal', label: 'Normal priority' },
                  { value: 'high', label: 'High priority' },
                ]}
              />
              <div className="workbench__actions">
                <Button data-testid="workbench-outline">Cancel</Button>
                <Button data-testid="brand-action" variant="solid">
                  Publish
                </Button>
                <Button data-testid="workbench-danger" danger variant="link">
                  Delete
                </Button>
              </div>
              <Button disabled>Archived</Button>
              {saved && <Text role="status">Changes saved</Text>}
            </div>
          </Card>
        </div>
        <ConfigProvider
          style={{ minHeight: 0 }}
          theme={{
            primaryColor: '#1677ff',
            components: { Button: { color: '#843d00', background: '#fff0db' } },
          }}
        >
          <Button data-testid="workbench-override">Explicit palette</Button>
        </ConfigProvider>
      </section>
    </div>
  );
}
