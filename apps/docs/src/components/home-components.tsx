import {
  Avatar,
  AvatarGroup,
  Button,
  Card,
  Checkbox,
  Form,
  FormField,
  Input,
  Progress,
  RadioGroup,
  Statistic,
  Switch,
  Tabs,
  Tag,
} from '@ifhover/leaf-ui';
import {
  ArrowRight,
  Download,
  Leaf,
  Link,
  LockKeyhole,
  Mail,
  Plus,
  Send,
  ShieldCheck,
  Sprout,
  Trash2,
  UsersRound,
} from 'lucide-react';
import { useId } from 'react';
import { useDocsLocale } from './i18n';
import './home-components.scss';

export function ComponentShowcase() {
  const { t } = useDocsLocale();
  const id = useId();
  const notifications = [
    {
      key: 'projects',
      title: t('项目动态', 'Project updates'),
      description: t('掌握团队的最新进展', 'Keep up with your team'),
      checked: true,
    },
    {
      key: 'digest',
      title: t('每周摘要', 'Weekly digest'),
      description: t('每周一，一封邮件刚刚好', 'A little perspective, every Monday'),
      checked: true,
    },
    {
      key: 'mentions',
      title: t('提及我', 'Mentions'),
      description: t('只关注与你有关的消息', 'Focus on what needs your attention'),
      checked: false,
    },
  ];

  return (
    <section
      className="leaf-component-scene"
      aria-label={t('组件组合展示', 'Component compositions')}
    >
      <div className="leaf-component-scene__column">
        <Card size="lg" role="region" aria-label={t('登录卡片', 'Sign-in card')}>
          <div className="leaf-component-scene__sign-in">
            <span className="leaf-component-scene__brand" aria-hidden="true">
              <Leaf size={22} />
            </span>
            <div>
              <h3 className="leaf-component-scene__sign-in-title">
                {t('登录 Leaf 工作台', 'Sign in to Leaf')}
              </h3>
              <p className="leaf-component-scene__description">
                {t('使用团队邮箱继续。', 'Continue with your team email.')}
              </p>
            </div>
            <Form
              layout="vertical"
              aria-label={t('登录预览', 'Sign-in preview')}
              onSubmit={(event) => event.preventDefault()}
            >
              <FormField label={t('邮箱', 'Email')}>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  prefix={<Mail size={16} />}
                  autoComplete="off"
                  readOnly
                />
              </FormField>
              <FormField label={t('密码', 'Password')}>
                <Input
                  type="password"
                  placeholder={t('输入密码', 'Enter your password')}
                  prefix={<LockKeyhole size={16} />}
                  visibilityToggle={false}
                  autoComplete="off"
                  readOnly
                />
              </FormField>
              <div className="leaf-component-scene__remember">
                <Checkbox checked readOnly>
                  {t('保持登录', 'Remember me')}
                </Checkbox>
                <Button variant="link" size="sm">
                  {t('忘记密码？', 'Forgot password?')}
                </Button>
              </div>
              <Button type="button" variant="solid" fullWidth endIcon={<ArrowRight size={16} />}>
                {t('登录', 'Sign in')}
              </Button>
            </Form>
            <p className="leaf-component-scene__sign-in-note">
              {t(
                '还没有账号？请联系团队管理员开通。',
                'Need an account? Ask your team administrator.',
              )}
            </p>
          </div>
        </Card>
        <Card
          title={t('常用操作', 'Quick actions')}
          role="region"
          aria-label={t('常用操作', 'Quick actions')}
        >
          <div className="leaf-component-scene__action-groups">
            <div className="leaf-component-scene__action-row">
              <Button variant="solid" startIcon={<Plus size={16} />}>
                {t('新建', 'New')}
              </Button>
              <Button startIcon={<Download size={16} />}>{t('导出', 'Export')}</Button>
            </div>
            <div className="leaf-component-scene__action-row">
              <Button variant="text" size="sm" startIcon={<Link size={15} />}>
                {t('复制链接', 'Copy link')}
              </Button>
              <Button variant="text" size="sm" danger startIcon={<Trash2 size={15} />}>
                {t('删除', 'Delete')}
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <div className="leaf-component-scene__column">
        <Card
          title={t('团队概况', 'Team pulse')}
          extra={
            <Tabs
              type="segmented"
              size="sm"
              aria-label={t('统计周期', 'Reporting period')}
              activeKey="week"
              items={[
                { key: 'week', label: '7D' },
                { key: 'month', label: '30D' },
                { key: 'quarter', label: '90D' },
              ]}
            />
          }
        >
          <div className="leaf-component-scene__pulse">
            <div className="leaf-component-scene__stats">
              <Statistic title={t('完成任务', 'Tasks completed')} value={128} animation={false} />
              <Statistic
                title={t('准时率', 'On-time rate')}
                value={96}
                suffix="%"
                animation={false}
              />
            </div>
            <div className="leaf-component-scene__progress">
              <div className="leaf-component-scene__progress-label">
                <span>{t('本周目标', 'Weekly goal')}</span>
                <span>72%</span>
              </div>
              <Progress
                percent={72}
                showInfo={false}
                active={false}
                aria-label={t('本周目标完成度', 'Weekly goal progress')}
              />
            </div>
            <div className="leaf-component-scene__activity">
              <div className="leaf-component-scene__activity-row">
                <Avatar size="sm" alt={t('周亦舟', 'Zhou Yizhou')}>
                  Z
                </Avatar>
                <div>
                  <span>{t('周亦舟完成了首页设计', 'Yizhou finished the home page')}</span>
                  <small>{t('设计 · 12 分钟前', 'Design · 12 minutes ago')}</small>
                </div>
              </div>
              <div className="leaf-component-scene__activity-row">
                <Avatar size="sm" alt={t('陈予安', 'Chen Yuan')}>
                  C
                </Avatar>
                <div>
                  <span>{t('陈予安加入了工作空间', 'Yuan joined the workspace')}</span>
                  <small>{t('团队 · 1 小时前', 'Team · 1 hour ago')}</small>
                </div>
              </div>
            </div>
          </div>
        </Card>
        <Card title={t('通知', 'Notifications')}>
          <div className="leaf-component-scene__notifications">
            {notifications.map((notification) => (
              <div key={notification.key} className="leaf-component-scene__notification">
                <label htmlFor={`${id}-${notification.key}`}>
                  <span>{notification.title}</span>
                  <small>{notification.description}</small>
                </label>
                <Switch id={`${id}-${notification.key}`} checked={notification.checked} readOnly />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="leaf-component-scene__column leaf-component-scene__column--plans">
        <RadioGroup
          aria-label={t('工作空间方案', 'Workspace plan')}
          variant="card"
          direction="vertical"
          value="team"
          onChange={() => {}}
          options={[
            {
              value: 'starter',
              label: t('个人版', 'Starter'),
              description: t('为独立项目留一点空间', 'A little room for your own ideas'),
              icon: <Sprout size={20} />,
              extra: <span className="leaf-component-scene__price">{t('免费', 'Free')}</span>,
            },
            {
              value: 'team',
              label: t('团队版', 'Team'),
              description: t('与最多 20 位成员一起协作', 'Work together with up to 20 people'),
              icon: <UsersRound size={20} />,
              extra: (
                <span className="leaf-component-scene__price">{t('¥99 / 月', '$15 / mo')}</span>
              ),
            },
            {
              value: 'business',
              label: t('企业版', 'Business'),
              description: t('单点登录与完整审计日志', 'Single sign-on and audit logs'),
              icon: <ShieldCheck size={20} />,
              extra: (
                <span className="leaf-component-scene__price">{t('联系我们', 'Let’s talk')}</span>
              ),
            },
          ]}
        />
        <Card
          title={t('邀请成员', 'Invite teammates')}
          description={t('协作者会收到一封邀请邮件。', 'Send a little invitation to collaborate.')}
        >
          <div className="leaf-component-scene__invite">
            <Form
              layout="vertical"
              aria-label={t('邀请预览', 'Invitation preview')}
              onSubmit={(event) => event.preventDefault()}
            >
              <div className="leaf-component-scene__invite-field">
                <Input
                  className="leaf-component-scene__invite-input"
                  type="email"
                  aria-label={t('成员邮箱', 'Teammate email')}
                  placeholder="name@example.com"
                  readOnly
                />
                <Button type="button" variant="solid" startIcon={<Send size={15} />}>
                  {t('邀请', 'Invite')}
                </Button>
              </div>
            </Form>
            <div className="leaf-component-scene__teammates">
              <AvatarGroup size="sm">
                <Avatar alt={t('林小满', 'Lin Xiaoman')}>L</Avatar>
                <Avatar alt={t('周亦舟', 'Zhou Yizhou')}>Z</Avatar>
                <Avatar alt={t('许知远', 'Xu Zhiyuan')}>X</Avatar>
                <Avatar alt={t('陈予安', 'Chen Yuan')}>C</Avatar>
              </AvatarGroup>
              <span>{t('8 位成员已加入', '8 people have joined')}</span>
            </div>
          </div>
        </Card>
        <Card
          className="leaf-component-scene__tags"
          title={t('状态与标签', 'Status & tags')}
          role="region"
          aria-label={t('状态与标签', 'Status & tags')}
        >
          <div className="leaf-component-scene__tag-groups">
            <div className="leaf-component-scene__tag-row">
              <Tag color="success">{t('已完成', 'Done')}</Tag>
              <Tag color="warning">{t('进行中', 'In progress')}</Tag>
              <Tag color="info">{t('待审核', 'In review')}</Tag>
            </div>
            <div className="leaf-component-scene__tag-row">
              <Tag variant="outline" color="default" dot={false}>
                {t('设计', 'Design')}
              </Tag>
              <Tag variant="outline" color="default" dot={false}>
                {t('开发', 'Build')}
              </Tag>
              <Tag variant="outline" color="default" dot={false}>
                {t('文档', 'Docs')}
              </Tag>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
