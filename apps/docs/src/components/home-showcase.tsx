import {
  Avatar,
  AvatarGroup,
  Button,
  Card,
  Checkbox,
  ConfigProvider,
  DatePicker,
  Dropdown,
  FileList,
  Input,
  Menu,
  Modal,
  Progress,
  Segmented,
  Select,
  Statistic,
  Switch,
  Tag,
  Tooltip,
  useMessage,
} from '@ifhover/leaf-ui';
import {
  ArrowRight,
  Bell,
  Check,
  CheckCheck,
  Ellipsis,
  Inbox,
  Layers,
  Leaf,
  Plus,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { type CSSProperties, useRef, useState } from 'react';
import { useDocsTheme } from './docs-theme';
import { ComponentShowcase } from './home-components';
import { useDocsLocale } from './i18n';
import { themeColorPresets } from './theme-colors';
import './home-showcase.scss';

interface Task {
  id: number;
  zh: string;
  en: string;
  done: boolean;
  category: string;
}
const initialTasks: Task[] = [
  {
    id: 1,
    zh: '把好想法变成第一个原型',
    en: 'Turn a good idea into a first prototype',
    done: true,
    category: 'design',
  },
  {
    id: 2,
    zh: '让每一次交互都有回应',
    en: 'Give every interaction a response',
    done: false,
    category: 'design',
  },
  {
    id: 3,
    zh: '照顾键盘和小屏幕上的体验',
    en: 'Make room for keyboards and small screens',
    done: false,
    category: 'build',
  },
  {
    id: 4,
    zh: '和团队分享这一次进展',
    en: 'Share this progress with the team',
    done: false,
    category: 'team',
  },
];

/** A small working product made from the same public components as the docs. */
export function HomeShowcase() {
  const { t } = useDocsLocale();
  const [scene, setScene] = useState('components');
  const { color: accent, setColor: setAccent } = useDocsTheme();
  return (
    <section
      className="leaf-showroom rp-not-doc"
      aria-label={t('可交互的组件场景', 'Interactive component scenes')}
      style={
        {
          '--leaf-showroom-accent': accent,
        } as CSSProperties
      }
    >
      <div className="leaf-showroom__toolbar">
        <Segmented
          aria-label={t('预览场景', 'Preview scene')}
          value={scene}
          onChange={setScene}
          options={[
            { value: 'components', label: t('组件', 'Components') },
            { value: 'project', label: t('工作台', 'Workspace') },
            { value: 'files', label: t('文件', 'Files') },
          ]}
        />
        <fieldset className="leaf-showroom__colors" aria-label={t('场景主题色', 'Scene accent')}>
          {themeColorPresets.map(({ color, zh, en }) => (
            <button
              key={color}
              type="button"
              aria-label={t(zh, en)}
              aria-pressed={accent === color}
              style={{ background: color }}
              onClick={() => setAccent(color)}
            >
              {accent === color && <Check size={14} />}
            </button>
          ))}
        </fieldset>
      </div>
      <ConfigProvider
        theme={{
          primaryColor: accent,
          tokens: { onPrimaryColor: '#fff' },
        }}
      >
        <div hidden={scene !== 'components'}>
          <ComponentShowcase />
        </div>
        <div hidden={scene !== 'project'}>
          <ProjectShowcase />
        </div>
        <div className="leaf-showroom__files" hidden={scene !== 'files'}>
          <div>
            <span className="leaf-eyebrow">YOUR CREATIVE SPACE</span>
            <h2>{t('好想法，都放在这里。', 'A home for every good idea.')}</h2>
            <p>
              {t('预览文件，管理项目资料。', 'Preview files and keep project materials together.')}
            </p>
          </div>
          <FileList
            downloadable={false}
            previewable={false}
            items={[
              { uid: 'design', name: 'Brand direction.pdf', size: 2480000, status: 'done' },
              { uid: 'notes', name: 'Product notes.md', size: 18400, status: 'ready' },
              {
                uid: 'assets',
                name: 'Studio assets.zip',
                size: 8200000,
                status: 'uploading',
                percent: 64,
              },
            ]}
          />
        </div>
      </ConfigProvider>
    </section>
  );
}

function ProjectShowcase() {
  const { t } = useDocsLocale();
  const { message } = useMessage();
  const [tasks, setTasks] = useState(initialTasks);
  const [filter, setFilter] = useState('all');
  const [view, setView] = useState('project');
  const [project, setProject] = useState('studio');
  const [reminder, setReminder] = useState(true);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('design');
  const [due, setDue] = useState<Date>();
  const nextId = useRef(5);
  const firstInput = useRef<HTMLInputElement>(null);
  const completed = tasks.filter((task) => task.done).length;
  const visible = tasks.filter((task) =>
    filter === 'done' ? task.done : filter === 'open' ? !task.done : true,
  );
  function create() {
    setName('');
    setCategory('design');
    setDue(undefined);
    setStep(0);
    setOpen(true);
  }
  function save() {
    if (!name.trim()) {
      firstInput.current?.focus();
      return;
    }
    setTasks((rows) => [
      ...rows,
      { id: nextId.current++, zh: name.trim(), en: name.trim(), done: false, category },
    ]);
    setFilter('all');
    setView('project');
    setOpen(false);
    message.success(
      t('任务已添加，留一点空间给好想法。', 'Task added. Make room for a good idea.'),
    );
  }
  return (
    <section
      className="leaf-workspace rp-not-doc"
      aria-label={t('可交互的项目示例', 'Interactive project example')}
    >
      <header className="leaf-workspace__bar">
        <span className="leaf-workspace__brand">
          <Leaf size={17} /> Leaf Studio
        </span>
        <span className="leaf-workspace__live">
          <span />
          {t('真实组件 · 可以操作', 'Real components · Try it')}
        </span>
        <Tooltip content={t('恢复示例', 'Reset example')}>
          <Button
            size="sm"
            variant="ghost"
            aria-label={t('恢复示例', 'Reset example')}
            startIcon={<RotateCcw size={15} />}
            onClick={() => {
              setTasks(initialTasks);
              setFilter('all');
              setView('project');
            }}
          />
        </Tooltip>
      </header>
      <div className="leaf-workspace__layout">
        <aside className="leaf-workspace__sidebar">
          <div className="leaf-workspace__team">
            <Avatar size={30} shape="square">
              S
            </Avatar>
            <span>
              Studio<small>{t('一起，把想法做好', 'Make good ideas happen')}</small>
            </span>
          </div>
          <span className="leaf-workspace__label">WORKSPACE</span>
          <Menu
            aria-label={t('示例导航', 'Example navigation')}
            selectedKey={view}
            onSelect={setView}
            items={[
              { key: 'project', label: t('我的项目', 'My project'), icon: <Layers size={16} /> },
              { key: 'inbox', label: t('收件箱', 'Inbox'), icon: <Inbox size={16} /> },
            ]}
          />
          <div className="leaf-workspace__sidebar-note">
            <Sparkles size={16} />
            <p>
              {t(
                '小小的细节，组成每天顺手的体验。',
                'Small details make the everyday feel effortless.',
              )}
            </p>
          </div>
          <div className="leaf-workspace__user">
            <Avatar size={25}>A</Avatar>
            <span>Alex Morgan</span>
            <span className="leaf-workspace__status-dot" />
          </div>
        </aside>
        <div className="leaf-workspace__main">
          <div className="leaf-workspace__heading">
            <div>
              <span className="leaf-workspace__label">
                {t('你的下一个好想法', 'YOUR NEXT GOOD IDEA')}
              </span>
              <h2>
                {view === 'inbox'
                  ? t('一切进展，都在这里。', 'All caught up, right here.')
                  : project === 'studio'
                    ? t('给灵感一点空间。', 'Room for your next idea.')
                    : t('慢慢来，也在向前。', 'Small steps. Real progress.')}
              </h2>
              <p>
                {t(
                  '试试完成任务、切换筛选，或创建一项新任务。',
                  'Complete a task, switch filters, or create something new.',
                )}
              </p>
            </div>
            <Button size="sm" startIcon={<Plus size={16} />} onClick={create}>
              {t('新任务', 'New task')}
            </Button>
          </div>
          {view === 'project' ? (
            <div className="leaf-workspace__columns">
              <div className="leaf-workspace__tasks">
                <div className="leaf-workspace__toolbar">
                  <Segmented
                    size="sm"
                    aria-label={t('任务筛选', 'Task filter')}
                    value={filter}
                    onChange={setFilter}
                    options={[
                      { value: 'all', label: t('全部', 'All tasks') },
                      { value: 'open', label: t('进行中', 'In progress') },
                      { value: 'done', label: t('已完成', 'Done') },
                    ]}
                  />
                  <span className="leaf-workspace__count">
                    {visible.length} {t('项', 'items')}
                  </span>
                </div>
                {visible.length ? (
                  <ul className="leaf-workspace__list" aria-label={t('任务列表', 'Task list')}>
                    {visible.map((task) => (
                      <li
                        key={task.id}
                        className="leaf-workspace__task"
                        data-done={task.done || undefined}
                      >
                        <Checkbox
                          aria-label={t(task.zh, task.en)}
                          checked={task.done}
                          onChange={(event) =>
                            setTasks((rows) =>
                              rows.map((row) =>
                                row.id === task.id ? { ...row, done: event.target.checked } : row,
                              ),
                            )
                          }
                        />
                        <div className="leaf-workspace__task-copy">
                          <span>{t(task.zh, task.en)}</span>
                          <small>LEAF-{String(task.id).padStart(3, '0')}</small>
                        </div>
                        <Tag size="sm" color={task.category === 'design' ? 'primary' : 'default'}>
                          {task.category === 'design'
                            ? t('设计', 'Design')
                            : task.category === 'build'
                              ? t('开发', 'Build')
                              : t('协作', 'Team')}
                        </Tag>
                        <Dropdown
                          placement="bottom-end"
                          items={[
                            { key: 'top', label: t('移到最前', 'Move to top') },
                            { key: 'delete', label: t('删除任务', 'Delete task'), danger: true },
                          ]}
                          onSelect={(key) =>
                            setTasks((rows) =>
                              key === 'top'
                                ? [task, ...rows.filter((row) => row.id !== task.id)]
                                : rows.filter((row) => row.id !== task.id),
                            )
                          }
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            aria-label={`${t('任务操作', 'Task actions')}: ${t(task.zh, task.en)}`}
                            startIcon={<Ellipsis size={16} />}
                          />
                        </Dropdown>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="leaf-workspace__empty">
                    <CheckCheck size={24} />
                    <span>{t('这里已经整理好了。', 'Everything is in order.')}</span>
                    <Button size="sm" variant="ghost" onClick={() => setFilter('all')}>
                      {t('查看全部任务', 'View all tasks')}
                    </Button>
                  </div>
                )}
                <Button
                  className="leaf-workspace__add"
                  size="sm"
                  variant="ghost"
                  startIcon={<Plus size={15} />}
                  onClick={create}
                >
                  {t('再记一个好想法', 'Add one more good idea')}
                </Button>
                <div className="leaf-workspace__collaborators">
                  <AvatarGroup size={24}>
                    <Avatar alt="Alex">A</Avatar>
                    <Avatar alt="Jamie">J</Avatar>
                    <Avatar alt="Sam">S</Avatar>
                  </AvatarGroup>
                  <span>{t('和 3 位伙伴一起推进', 'Moving forward with 3 teammates')}</span>
                  <span>{t('刚刚更新', 'Updated just now')}</span>
                </div>
              </div>
              <aside className="leaf-workspace__insights">
                <Card
                  className="leaf-workspace__progress"
                  title={t('一点点，也算进展', 'A little progress counts')}
                >
                  <Statistic
                    value={tasks.length ? Math.round((completed / tasks.length) * 100) : 0}
                    suffix="%"
                  />
                  <Progress
                    percent={tasks.length ? (completed / tasks.length) * 100 : 0}
                    showInfo={false}
                    aria-label={t('项目进度', 'Project progress')}
                  />
                  <p>
                    {t(
                      `已完成 ${completed} 项，共 ${tasks.length} 项`,
                      `${completed} of ${tasks.length} tasks completed`,
                    )}
                  </p>
                </Card>
                <div className="leaf-workspace__settings">
                  <label htmlFor="showcase-project">{t('当前项目', 'Current project')}</label>
                  <Select
                    id="showcase-project"
                    value={project}
                    onChange={setProject}
                    options={[
                      { value: 'studio', label: 'Leaf Studio' },
                      { value: 'personal', label: t('个人计划', 'Personal plans') },
                    ]}
                  />
                  <div>
                    <span>
                      <Bell size={14} />
                      {t('进度提醒', 'Progress reminders')}
                    </span>
                    <Switch
                      size="sm"
                      aria-label={t('进度提醒', 'Progress reminders')}
                      checked={reminder}
                      onChange={(event) => setReminder(event.target.checked)}
                    />
                  </div>
                </div>
              </aside>
            </div>
          ) : (
            <div className="leaf-workspace__inbox">
              <div className="leaf-workspace__inbox-icon">
                <CheckCheck size={32} />
              </div>
              <h3>{t('可以专心做下一件事了。', 'Space to focus on what comes next.')}</h3>
              <p>{t('所有任务的进展都已同步。', 'Your project progress is up to date.')}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setView('project')}
                endIcon={<ArrowRight size={15} />}
              >
                {t('回到项目', 'Back to the project')}
              </Button>
            </div>
          )}
        </div>
      </div>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={
          step === 0
            ? t('记下你的下一个好想法', 'Your next good idea')
            : t('准备好，开始吧', 'Ready when you are')
        }
        initialFocus={firstInput}
        width={430}
        footer={
          <>
            <Button variant="ghost" onClick={() => (step ? setStep(0) : setOpen(false))}>
              {step ? t('上一步', 'Back') : t('取消', 'Cancel')}
            </Button>
            <Button
              disabled={!name.trim()}
              onClick={() => (step ? save() : setStep(1))}
              endIcon={step ? <Check size={16} /> : <ArrowRight size={16} />}
            >
              {step ? t('创建任务', 'Create task') : t('继续', 'Continue')}
            </Button>
          </>
        }
      >
        {step === 0 ? (
          <div className="leaf-workspace__form">
            <label htmlFor="showcase-task-name">{t('任务名称', 'Task name')}</label>
            <Input
              id="showcase-task-name"
              ref={firstInput}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={t('比如：画出第一个原型', 'For example: sketch the first prototype')}
            />
            <label htmlFor="showcase-category">{t('分类', 'Category')}</label>
            <Select
              id="showcase-category"
              value={category}
              onChange={setCategory}
              options={[
                { value: 'design', label: t('设计', 'Design') },
                { value: 'build', label: t('开发', 'Build') },
                { value: 'team', label: t('协作', 'Team') },
              ]}
            />
            <label htmlFor="showcase-date">
              {t('计划日期（可选）', 'Planned date (optional)')}
            </label>
            <DatePicker
              id="showcase-date"
              value={due}
              onChange={(date) => setDue(date ?? undefined)}
              allowClear
            />
          </div>
        ) : (
          <div className="leaf-workspace__review">
            <span>
              <Check size={24} />
            </span>
            <h3>{name}</h3>
            <p>
              {t(
                '新的任务会加入你的项目，准备好后随时出发。',
                'Your task will join the project. Take the next step whenever you are ready.',
              )}
            </p>
          </div>
        )}
      </Modal>
    </section>
  );
}
