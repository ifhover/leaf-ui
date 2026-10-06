import { useDark } from '@rspress/core/runtime';
import {
  Alert,
  Button,
  Card,
  ConfigProvider,
  Form,
  FormField,
  Input,
  Layout,
  List,
  ListItem,
  Menu,
  Modal,
  Result,
  Segmented,
  Select,
  Space,
  Statistic,
  Switch,
  Tag,
  Textarea,
  useMessage,
} from '@sudden3/leaf-ui';
import { Folder, Plus, Settings } from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import { useDocsLocale } from '../../components/i18n';
import './workspace.scss';

type Project = { id: number; name: string; owner: string; description: string; archived: boolean };
type Preferences = {
  team: string;
  email: string;
  dark: boolean;
  compact: boolean;
  blur: boolean;
  notifications: boolean;
};
const pause = () => new Promise((resolve) => setTimeout(resolve, 350));

export function BusinessWorkspace() {
  const dark = useDark();
  const [preferences, setPreferences] = useState<Preferences>({
    team: 'Leaf Studio',
    email: 'team@example.com',
    dark,
    compact: false,
    blur: true,
    notifications: true,
  });
  return (
    <ConfigProvider
      className="leaf-business rp-not-doc"
      density={preferences.compact ? 'compact' : 'comfortable'}
      maskBlur={preferences.blur}
      theme={{ appearance: preferences.dark ? 'dark' : 'light' }}
    >
      <Workspace preferences={preferences} onPreferencesChange={setPreferences} />
    </ConfigProvider>
  );
}

function Workspace({
  preferences,
  onPreferencesChange,
}: {
  preferences: Preferences;
  onPreferencesChange: (next: Preferences) => void;
}) {
  const { t } = useDocsLocale();
  const { message } = useMessage();
  const id = useId();
  const [page, setPage] = useState('projects');
  const [query, setQuery] = useState('');
  const [view, setView] = useState('active');
  const [projects, setProjects] = useState<Project[]>([
    {
      id: 1,
      name: t('品牌网站', 'Brand website'),
      owner: 'Lin',
      description: t('设计与发布团队的新网站。', 'Design and launch the team website.'),
      archived: false,
    },
    {
      id: 2,
      name: t('移动体验', 'Mobile experience'),
      owner: 'Alex',
      description: t('完善移动端的关键流程。', 'Improve the core mobile flows.'),
      archived: false,
    },
    {
      id: 3,
      name: t('春季活动', 'Spring campaign'),
      owner: 'Lin',
      description: t('已完成的活动资料。', 'Completed campaign resources.'),
      archived: true,
    },
  ]);
  const [editing, setEditing] = useState<Project | null>(null);
  const [dialog, setDialog] = useState(false);
  const [draft, setDraft] = useState({ name: '', owner: 'Lin', description: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState(preferences);
  const [saved, setSaved] = useState(false);
  const visible = projects.filter(
    (project) =>
      project.archived === (view === 'archived') &&
      `${project.name} ${project.owner}`.toLowerCase().includes(query.toLowerCase()),
  );
  const changed = JSON.stringify(settings) !== JSON.stringify(preferences);
  useEffect(() => {
    if (error) document.getElementById(`${id}-name`)?.focus();
  }, [error, id]);

  function open(project?: Project) {
    setEditing(project ?? null);
    setDraft(project ?? { name: '', owner: 'Lin', description: '' });
    setError('');
    setDialog(true);
  }
  async function saveProject() {
    if (saving) return;
    if (!draft.name.trim()) {
      setError(t('请填写项目名称。', 'Enter a project name.'));
      document.getElementById(`${id}-name`)?.focus();
      return;
    }
    setSaving(true);
    setError('');
    await pause();
    if (
      projects.some(
        (project) =>
          project.id !== editing?.id &&
          project.name.toLowerCase() === draft.name.trim().toLowerCase(),
      )
    ) {
      setError(
        t(
          '已有同名项目，请修改名称后重试。',
          'A project with this name exists. Choose another name and retry.',
        ),
      );
      setSaving(false);
      document.getElementById(`${id}-name`)?.focus();
      return;
    }
    const next = {
      ...draft,
      name: draft.name.trim(),
      id: editing?.id ?? Date.now(),
      archived: editing?.archived ?? false,
    };
    setProjects((previous) =>
      editing
        ? previous.map((project) => (project.id === editing.id ? next : project))
        : [...previous, next],
    );
    setQuery('');
    setView(next.archived ? 'archived' : 'active');
    setSaving(false);
    setDialog(false);
    message.success(t('项目已保存', 'Project saved'));
  }

  return (
    <Layout>
      <Layout.Header className="leaf-business__header">
        <strong>{preferences.team}</strong>
        <Tag color="primary">{t('工作空间', 'Workspace')}</Tag>
      </Layout.Header>
      <Layout direction="horizontal" className="leaf-business__body">
        <Layout.Sider width={172} className="leaf-business__nav">
          <Menu
            aria-label={t('工作空间导航', 'Workspace navigation')}
            selectedKey={page}
            onSelect={(key) => setPage(key)}
            items={[
              { key: 'projects', label: t('项目管理', 'Projects'), icon: <Folder /> },
              { key: 'settings', label: t('团队设置', 'Team settings'), icon: <Settings /> },
            ]}
          />
        </Layout.Sider>
        <div className="leaf-business__content">
          {page === 'projects' ? (
            <>
              <div className="leaf-business__heading">
                <div>
                  <h2>{t('项目管理', 'Projects')}</h2>
                  <p>{t('管理团队正在推进的工作。', 'Keep the team’s work organized.')}</p>
                </div>
                <Button startIcon={<Plus />} onClick={() => open()}>
                  {t('新建项目', 'New project')}
                </Button>
              </div>
              <div className="leaf-business__metrics">
                <Card>
                  <Statistic
                    title={t('进行中', 'Active')}
                    value={projects.filter((project) => !project.archived).length}
                  />
                </Card>
                <Card>
                  <Statistic
                    title={t('已归档', 'Archived')}
                    value={projects.filter((project) => project.archived).length}
                  />
                </Card>
              </div>
              <Card>
                <div className="leaf-business__filters">
                  <Input
                    aria-label={t('搜索项目', 'Search projects')}
                    placeholder={t('搜索项目或负责人', 'Search by project or owner')}
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    allowClear
                  />
                  <Segmented
                    aria-label={t('项目状态', 'Project status')}
                    value={view}
                    onChange={setView}
                    options={[
                      { value: 'active', label: t('进行中', 'Active') },
                      { value: 'archived', label: t('已归档', 'Archived') },
                    ]}
                  />
                </div>
                <div aria-live="polite" className="leaf-business__count">
                  {t(`找到 ${visible.length} 个项目`, `${visible.length} projects found`)}
                </div>
                <List
                  divider
                  items={visible}
                  itemKey={(project) => project.id}
                  aria-label={t('项目列表', 'Project list')}
                  emptyContent={
                    <Result
                      status="empty"
                      title={t('没有匹配的项目', 'No matching projects')}
                      description={t(
                        '调整筛选条件，或创建新的项目。',
                        'Change the filters or create a project.',
                      )}
                      extra={
                        <Button
                          variant="outline"
                          onClick={() => {
                            setQuery('');
                            setView('active');
                          }}
                        >
                          {t('清除筛选', 'Clear filters')}
                        </Button>
                      }
                    />
                  }
                  renderItem={(project) => (
                    <ListItem
                      title={project.name}
                      description={
                        <>
                          {project.description}
                          <br />
                          <span>
                            {t('负责人：', 'Owner: ')}
                            {project.owner}
                          </span>
                        </>
                      }
                      actions={[
                        <Button
                          key="edit"
                          size="sm"
                          variant="outline"
                          aria-label={t(`编辑 ${project.name}`, `Edit ${project.name}`)}
                          onClick={() => open(project)}
                        >
                          {t('编辑', 'Edit')}
                        </Button>,
                        <Button
                          key="archive"
                          size="sm"
                          variant="ghost"
                          aria-label={t(
                            `${project.archived ? '恢复' : '归档'} ${project.name}`,
                            `${project.archived ? 'Restore' : 'Archive'} ${project.name}`,
                          )}
                          onClick={() => {
                            setProjects((previous) =>
                              previous.map((item) =>
                                item.id === project.id
                                  ? { ...item, archived: !item.archived }
                                  : item,
                              ),
                            );
                            message.success(
                              project.archived
                                ? t('项目已恢复', 'Project restored')
                                : t('项目已归档', 'Project archived'),
                            );
                          }}
                        >
                          {project.archived ? t('恢复', 'Restore') : t('归档', 'Archive')}
                        </Button>,
                      ]}
                    />
                  )}
                />
              </Card>
            </>
          ) : (
            <>
              <div className="leaf-business__heading">
                <div>
                  <h2>{t('团队设置', 'Team settings')}</h2>
                  <p>
                    {t(
                      '保存后应用到整个工作空间。',
                      'Saved preferences apply to the whole workspace.',
                    )}
                  </p>
                </div>
              </div>
              <Card>
                {saved && <Alert type="success" title={t('设置已保存', 'Settings saved')} />}
                <Form
                  disabled={saving}
                  aria-label={t('团队设置表单', 'Team settings form')}
                  onSubmit={async (event) => {
                    event.preventDefault();
                    if (saving) return;
                    setSaving(true);
                    await pause();
                    onPreferencesChange(settings);
                    setSaved(true);
                    setSaving(false);
                    message.success(t('设置已保存', 'Settings saved'));
                  }}
                >
                  <FormField label={t('团队名称', 'Team name')} required>
                    <Input
                      required
                      value={settings.team}
                      onChange={(event) => {
                        setSaved(false);
                        setSettings({ ...settings, team: event.target.value });
                      }}
                    />
                  </FormField>
                  <FormField label={t('联系邮箱', 'Contact email')} required>
                    <Input
                      type="email"
                      required
                      value={settings.email}
                      onChange={(event) => {
                        setSaved(false);
                        setSettings({ ...settings, email: event.target.value });
                      }}
                    />
                  </FormField>
                  {(
                    [
                      ['dark', t('深色外观', 'Dark appearance')],
                      ['compact', t('紧凑密度', 'Compact density')],
                      ['blur', t('背景模糊', 'Background blur')],
                      ['notifications', t('邮件提醒', 'Email reminders')],
                    ] as const
                  ).map(([key, label]) => (
                    <FormField key={key} label={label}>
                      <Switch
                        aria-label={label}
                        checked={settings[key]}
                        onChange={(event) => {
                          setSaved(false);
                          setSettings({ ...settings, [key]: event.target.checked });
                        }}
                      />
                    </FormField>
                  ))}
                  <p aria-live="polite">
                    {changed
                      ? t('有尚未保存的修改', 'You have unsaved changes')
                      : t('设置已同步', 'Preferences are up to date')}
                  </p>
                  <Space>
                    <Button type="submit" loading={saving} disabled={!changed}>
                      {t('保存设置', 'Save preferences')}
                    </Button>
                    <Button
                      variant="outline"
                      disabled={saving || !changed}
                      onClick={() => {
                        setSettings(preferences);
                        setSaved(false);
                      }}
                    >
                      {t('放弃修改', 'Discard changes')}
                    </Button>
                  </Space>
                </Form>
              </Card>
            </>
          )}
        </div>
      </Layout>
      <Modal
        open={dialog}
        onClose={() => {
          if (!saving) setDialog(false);
        }}
        title={editing ? t('编辑项目', 'Edit project') : t('新建项目', 'New project')}
        footer={
          <>
            <Button variant="outline" disabled={saving} onClick={() => setDialog(false)}>
              {t('取消', 'Cancel')}
            </Button>
            <Button type="submit" form={`${id}-project`} loading={saving}>
              {t('保存项目', 'Save project')}
            </Button>
          </>
        }
      >
        <Form
          disabled={saving}
          id={`${id}-project`}
          onSubmit={(event) => {
            event.preventDefault();
            void saveProject();
          }}
        >
          <FormField
            label={t('项目名称', 'Project name')}
            htmlFor={`${id}-name`}
            required
            error={error}
          >
            <Input
              id={`${id}-name`}
              autoFocus
              required
              maxLength={60}
              value={draft.name}
              onChange={(event) => {
                setError('');
                setDraft({ ...draft, name: event.target.value });
              }}
            />
          </FormField>
          <FormField label={t('负责人', 'Owner')}>
            <Select
              value={draft.owner}
              onChange={(owner) => setDraft({ ...draft, owner })}
              options={[
                { value: 'Lin', label: 'Lin' },
                { value: 'Alex', label: 'Alex' },
              ]}
            />
          </FormField>
          <FormField label={t('项目说明', 'Description')}>
            <Textarea
              rows={3}
              value={draft.description}
              onChange={(event) => setDraft({ ...draft, description: event.target.value })}
            />
          </FormField>
        </Form>
      </Modal>
    </Layout>
  );
}
