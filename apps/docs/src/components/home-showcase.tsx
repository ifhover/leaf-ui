import {
  Avatar,
  AvatarGroup,
  Badge,
  Breadcrumb,
  Button,
  Card,
  ConfigProvider,
  Input,
  Menu,
  Progress,
  Statistic,
  Tabs,
  Tag,
  Timeline,
} from '@ifhover/leaf-ui';
import {
  ArrowUpRight,
  Bell,
  CalendarDays,
  Check,
  ChevronsUpDown,
  Download,
  FolderKanban,
  Inbox,
  LayoutDashboard,
  Leaf,
  ListChecks,
  Plus,
  Search,
  Settings,
  Sparkles,
  Target,
  UsersRound,
} from 'lucide-react';
import { useState } from 'react';
import { useDocsTheme } from './docs-theme';
import { ComponentShowcase } from './home-components';
import { useDocsLocale } from './i18n';
import { themeColorPresets } from './theme-colors';
import './home-showcase.scss';

export function HomeShowcase() {
  const { t } = useDocsLocale();
  const [scene, setScene] = useState('components');
  const { color: accent, setColor: setAccent } = useDocsTheme();
  return (
    <section
      className="leaf-showroom rp-not-doc"
      aria-label={t('组件场景预览', 'Component scene preview')}
    >
      <div className="leaf-showroom__toolbar">
        <Tabs
          type="card"
          aria-label={t('预览场景', 'Preview scene')}
          activeKey={scene}
          onChange={setScene}
          items={[
            { key: 'components', label: t('组件', 'Components') },
            { key: 'workspace', label: t('工作台', 'Workspace') },
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
      <ConfigProvider theme={{ primaryColor: accent }}>
        <div hidden={scene !== 'components'}>
          <ComponentShowcase />
        </div>
        <div hidden={scene !== 'workspace'}>
          <WorkspaceShowcase />
        </div>
      </ConfigProvider>
    </section>
  );
}

function WorkspaceShowcase() {
  const { t } = useDocsLocale();
  const metrics = [
    {
      key: 'projects',
      title: t('进行中项目', 'Active projects'),
      value: 24,
      change: '+3',
      icon: <FolderKanban size={16} />,
    },
    {
      key: 'tasks',
      title: t('本周完成任务', 'Tasks completed'),
      value: 128,
      change: '+12.5%',
      icon: <ListChecks size={16} />,
    },
    {
      key: 'delivery',
      title: t('准时交付率', 'On-time delivery'),
      value: 96.4,
      suffix: '%',
      precision: 1,
      change: '+2.1%',
      icon: <Target size={16} />,
    },
  ];
  const projects = [
    {
      key: 'brand',
      title: t('品牌官网改版', 'Brand site refresh'),
      description: t('让每一次初见都更清晰', 'A clearer first impression'),
      status: t('进展顺利', 'On track'),
      color: 'success',
      percent: 72,
      initials: ['L', 'Z', 'C'],
      names: [t('林小满', 'Lin Xiaoman'), t('周亦舟', 'Zhou Yizhou'), t('陈予安', 'Chen Yuan')],
    },
    {
      key: 'mobile',
      title: t('移动端 2.0', 'Mobile app 2.0'),
      description: t('更轻盈的日常使用体验', 'A lighter everyday experience'),
      status: t('需要关注', 'At risk'),
      color: 'warning',
      percent: 45,
      initials: ['X', 'C'],
      names: [t('许知远', 'Xu Zhiyuan'), t('陈予安', 'Chen Yuan')],
    },
    {
      key: 'docs',
      title: t('设计系统文档', 'Design system docs'),
      description: t('把团队共识记录下来', 'Make shared decisions easy to find'),
      status: t('审核中', 'In review'),
      color: 'info',
      percent: 88,
      initials: ['L', 'X', 'Z'],
      names: [t('林小满', 'Lin Xiaoman'), t('许知远', 'Xu Zhiyuan'), t('周亦舟', 'Zhou Yizhou')],
    },
  ] as const;

  return (
    <section
      className="leaf-workspace"
      aria-label={t('工作台外观预览', 'Workspace appearance preview')}
    >
      <aside className="leaf-workspace__sidebar">
        <div className="leaf-workspace__brand">
          <span className="leaf-workspace__brand-icon" aria-hidden="true">
            <Leaf size={19} />
          </span>
          <div>
            <strong>Leaf Studio</strong>
            <small>{t('设计工作空间', 'Design workspace')}</small>
          </div>
        </div>
        <Menu
          variant="raised"
          selectedKey="overview"
          aria-label={t('工作台导航', 'Workspace navigation')}
          items={[
            {
              key: 'workspace',
              type: 'group',
              label: t('工作空间', 'Workspace'),
              children: [
                {
                  key: 'overview',
                  label: t('概览', 'Overview'),
                  icon: <LayoutDashboard size={17} />,
                },
                {
                  key: 'projects',
                  label: t('项目', 'Projects'),
                  icon: <FolderKanban size={17} />,
                  extra: <span className="leaf-workspace__menu-count">12</span>,
                },
                { key: 'tasks', label: t('任务', 'Tasks'), icon: <ListChecks size={17} /> },
                { key: 'calendar', label: t('日程', 'Calendar'), icon: <CalendarDays size={17} /> },
                {
                  key: 'inbox',
                  label: t('收件箱', 'Inbox'),
                  icon: <Inbox size={17} />,
                  extra: (
                    <Badge count={3}>
                      <span aria-hidden="true" />
                    </Badge>
                  ),
                },
              ],
            },
            {
              key: 'team',
              type: 'group',
              label: t('团队', 'Team'),
              children: [
                { key: 'members', label: t('成员', 'Members'), icon: <UsersRound size={17} /> },
                { key: 'settings', label: t('设置', 'Settings'), icon: <Settings size={17} /> },
              ],
            },
          ]}
        />
        <div className="leaf-workspace__sidebar-bottom">
          <Card size="sm">
            <div className="leaf-workspace__usage">
              <span className="leaf-workspace__usage-title">
                <Sparkles size={15} />
                {t('专业版空间', 'Pro workspace')}
              </span>
              <div className="leaf-workspace__usage-label">
                <span>{t('已用席位', 'Seats used')}</span>
                <span>8 / 20</span>
              </div>
              <Progress
                percent={40}
                showInfo={false}
                active={false}
                strokeWidth={4}
                aria-label={t('席位用量', 'Seat usage')}
              />
            </div>
          </Card>
          <div className="leaf-workspace__user">
            <Avatar size="sm" alt={t('林小满', 'Lin Xiaoman')}>
              L
            </Avatar>
            <div>
              <strong>{t('林小满', 'Lin Xiaoman')}</strong>
              <small>{t('空间管理员', 'Workspace admin')}</small>
            </div>
            <ChevronsUpDown size={15} aria-hidden="true" />
          </div>
        </div>
      </aside>
      <div className="leaf-workspace__main">
        <header className="leaf-workspace__topbar">
          <Input
            className="leaf-workspace__search"
            prefix={<Search size={16} />}
            aria-label={t('搜索工作空间', 'Search workspace')}
            placeholder={t('搜索项目、任务、成员…', 'Search projects, tasks, people…')}
            readOnly
          />
          <div className="leaf-workspace__topbar-actions">
            <Button
              variant="text"
              aria-label={t('通知', 'Notifications')}
              startIcon={<Bell size={17} />}
            />
            <Avatar size="sm" alt={t('林小满', 'Lin Xiaoman')}>
              L
            </Avatar>
          </div>
        </header>
        <div className="leaf-workspace__content">
          <Breadcrumb items={[{ title: 'Leaf Studio' }, { title: t('概览', 'Overview') }]} />
          <div className="leaf-workspace__heading">
            <div>
              <h2 className="leaf-workspace__title">
                {t('欢迎回来，林小满', 'Welcome back, Lin')}
              </h2>
              <p className="leaf-workspace__description">
                {t(
                  '新的一周，看看团队正在推进的事。',
                  'A new week. Here’s what your team is moving forward.',
                )}
              </p>
            </div>
            <div className="leaf-workspace__actions">
              <Button size="sm" startIcon={<Download size={15} />}>
                {t('导出', 'Export')}
              </Button>
              <Button variant="solid" size="sm" startIcon={<Plus size={15} />}>
                {t('新建项目', 'New project')}
              </Button>
            </div>
          </div>
          <div className="leaf-workspace__metrics">
            {metrics.map((metric) => (
              <Card key={metric.key} size="sm">
                <div className="leaf-workspace__metric">
                  <Statistic
                    title={
                      <span className="leaf-workspace__metric-label">
                        {metric.title}
                        {metric.icon}
                      </span>
                    }
                    value={metric.value}
                    suffix={metric.suffix}
                    precision={metric.precision}
                    animation={false}
                  />
                  <div className="leaf-workspace__trend">
                    <span>
                      <ArrowUpRight size={14} />
                      {metric.change}
                    </span>
                    {t('较上周', 'vs last week')}
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <div className="leaf-workspace__panels">
            <Card
              title={t('进行中的项目', 'Active projects')}
              extra={
                <Button variant="link" size="sm">
                  {t('查看全部', 'View all')}
                </Button>
              }
            >
              <div className="leaf-workspace__projects">
                {projects.map((project) => (
                  <div key={project.key} className="leaf-workspace__project">
                    <div className="leaf-workspace__project-heading">
                      <div>
                        <h3 className="leaf-workspace__project-title">{project.title}</h3>
                        <p className="leaf-workspace__project-description">{project.description}</p>
                      </div>
                      <Tag color={project.color} size="sm">
                        {project.status}
                      </Tag>
                    </div>
                    <Progress percent={project.percent} active={false} aria-label={project.title} />
                    <div className="leaf-workspace__project-footer">
                      <AvatarGroup size={24}>
                        {project.initials.map((initial, index) => (
                          <Avatar key={initial} alt={project.names[index]}>
                            {initial}
                          </Avatar>
                        ))}
                      </AvatarGroup>
                      <span>
                        {t(
                          `${project.initials.length} 位协作者`,
                          `${project.initials.length} collaborators`,
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            <Card
              title={t('今日日程', 'Today')}
              extra={<CalendarDays size={16} aria-hidden="true" />}
            >
              <Timeline
                items={[
                  {
                    key: 'review',
                    label: '09:30',
                    children: (
                      <div className="leaf-workspace__event">
                        <strong>{t('设计评审', 'Design review')}</strong>
                        <span>{t('品牌官网 · 会议室 A', 'Brand site · Room A')}</span>
                      </div>
                    ),
                  },
                  {
                    key: 'roadmap',
                    label: '11:00',
                    children: (
                      <div className="leaf-workspace__event">
                        <strong>{t('路线图同步', 'Roadmap sync')}</strong>
                        <span>{t('产品团队 · 线上会议', 'Product team · Online')}</span>
                      </div>
                    ),
                  },
                  {
                    key: 'release',
                    label: '14:00',
                    color: 'warning',
                    children: (
                      <div className="leaf-workspace__event">
                        <strong>{t('发布前检查', 'Pre-release check')}</strong>
                        <span>{t('移动端 2.0 · 清单确认', 'Mobile app 2.0 · Checklist')}</span>
                      </div>
                    ),
                  },
                  {
                    key: 'catch-up',
                    label: '16:30',
                    children: (
                      <div className="leaf-workspace__event">
                        <strong>{t('一对一交流', 'One-to-one catch-up')}</strong>
                        <span>{t('与周亦舟 · 30 分钟', 'With Yizhou · 30 minutes')}</span>
                      </div>
                    ),
                  },
                ]}
              />
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
