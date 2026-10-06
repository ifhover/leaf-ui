import {
  Avatar,
  AvatarGroup,
  Button,
  Card,
  Checkbox,
  Form,
  FormField,
  Input,
  InputOTP,
  Modal,
  Segmented,
  Select,
  Slider,
  Switch,
  useMessage,
} from '@sudden3/leaf-ui';
import { ArrowRight, Check, CheckCheck, Leaf, Mail, Save, Sparkles, Users } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useDocsLocale } from './i18n';
import './home-components.scss';

export function ComponentShowcase() {
  const { t } = useDocsLocale();
  const { message } = useMessage();
  const [email, setEmail] = useState('');
  const [team, setTeam] = useState('designer');
  const [code, setCode] = useState('432');
  const [budget, setBudget] = useState(250);
  const [period, setPeriod] = useState('week');
  const [channel, setChannel] = useState('chat');
  const [notify, setNotify] = useState(true);
  const [collaborate, setCollaborate] = useState(true);
  const [dirty, setDirty] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [workspace, setWorkspace] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const workspaceName = useRef<HTMLInputElement>(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  function save() {
    setSaving(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setSaving(false);
      setDirty(false);
      message.success(t('更改已保存', 'Changes saved'));
    }, 900);
  }
  function createSpace(name?: string) {
    if (name) setWorkspace(name);
    setOpen(true);
  }
  return (
    <div className="leaf-component-scene">
      <div className="leaf-component-scene__column">
        <div className="leaf-component-scene__intro">
          <h3>{t('按你的节奏', 'Make it yours')}</h3>
          <p>{t('从一点简单的设置开始。', 'Start with a few simple preferences.')}</p>
        </div>
        <Form
          layout="vertical"
          className="leaf-component-scene__fields"
          onSubmit={(event) => event.preventDefault()}
        >
          <FormField
            label={t('你的邮箱', 'Your email')}
            required
            help={t('只用来接收重要的项目消息。', 'Only the project updates that matter.')}
          >
            <Input
              type="email"
              placeholder="you@studio.com"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setDirty(true);
              }}
            />
          </FormField>
          <FormField label={t('你的角色', 'Your role')} required>
            <Select
              value={team}
              onChange={(value) => {
                setTeam(value);
                setDirty(true);
              }}
              options={[
                { value: 'designer', label: t('设计师', 'Designer') },
                { value: 'developer', label: t('开发者', 'Developer') },
                { value: 'creator', label: t('创作者', 'Creator') },
              ]}
            />
          </FormField>
          <Checkbox
            checked={collaborate}
            onChange={(event) => {
              setCollaborate(event.target.checked);
              setDirty(true);
            }}
          >
            {t('接受伙伴的协作邀请', 'Allow collaboration invites')}
          </Checkbox>
        </Form>
        <div className="leaf-component-scene__slider">
          <label htmlFor="showcase-budget">{t('项目预算', 'Project budget')}</label>
          <Slider
            id="showcase-budget"
            aria-label={t('项目预算', 'Project budget')}
            min={50}
            max={500}
            step={10}
            value={budget}
            onChange={(value) => {
              setBudget(value);
              setDirty(true);
            }}
            marks={[
              { value: 50, label: t('轻量', 'Small') },
              { value: 250, label: t('适中', 'Medium') },
              { value: 500, label: t('充足', 'Large') },
            ]}
          />
        </div>
        <div className="leaf-component-scene__preferences">
          <Segmented
            block
            aria-label={t('消息渠道', 'Channel')}
            value={channel}
            onChange={(value) => {
              setChannel(value);
              setDirty(true);
            }}
            options={[
              { value: 'chat', label: t('协作消息', 'Chats'), icon: <Users size={16} /> },
              { value: 'email', label: t('邮件', 'Emails'), icon: <Mail size={16} /> },
            ]}
          />
          <div className="leaf-component-scene__notifications">
            <label htmlFor="showcase-notifications">
              <strong>{t('项目通知', 'Project notifications')}</strong>
              <small>
                {channel === 'email'
                  ? t('通过邮件接收进展', 'Updates delivered by email')
                  : t('在协作消息中接收进展', 'Updates in your team chat')}
              </small>
            </label>
            <Switch
              id="showcase-notifications"
              checked={notify}
              onChange={(event) => {
                setNotify(event.target.checked);
                setDirty(true);
              }}
              aria-label={t('项目通知', 'Project notifications')}
            />
          </div>
        </div>
        <div className="leaf-component-scene__buttons">
          <Button loading={saving} onClick={save}>
            {t('应用设置', 'Apply settings')}
          </Button>
          <Button
            variant="outline"
            disabled={saving}
            onClick={() => {
              setEmail('');
              setTeam('designer');
              setBudget(250);
              setChannel('chat');
              setNotify(true);
              setCollaborate(true);
              setDirty(false);
            }}
          >
            {t('重置', 'Reset')}
          </Button>
        </div>
      </div>
      <div className="leaf-component-scene__column">
        <Card className="leaf-component-scene__profile">
          <div className="leaf-component-scene__profile-heading">
            <Avatar size={40} className="leaf-component-scene__brand">
              <Leaf size={21} />
            </Avatar>
            <div className="leaf-component-scene__profile-identity">
              <strong>
                Leaf Studio <CheckCheck size={15} aria-hidden />
              </strong>
              <span>{t('好想法，一起完成。', 'Good ideas, made together.')}</span>
            </div>
          </div>
          <Segmented
            block
            aria-label={t('查看周期', 'Period')}
            value={period}
            onChange={setPeriod}
            options={[
              { value: 'day', label: '1D' },
              { value: 'week', label: '7D' },
              { value: 'month', label: '1M' },
              { value: 'year', label: '1Y' },
            ]}
          />
          <div className="leaf-component-scene__profile-stats">
            <div>
              <strong>
                {period === 'day' ? 4 : period === 'week' ? 12 : period === 'month' ? 28 : 96}
              </strong>
              <span>{t('个新想法', 'new ideas')}</span>
            </div>
            <div>
              <strong>8</strong>
              <span>{t('位伙伴', 'teammates')}</span>
            </div>
            <span className="leaf-component-scene__growth">+18%</span>
          </div>
          <div className="leaf-component-scene__activity">
            <div>
              <Avatar size={30} className="leaf-component-scene__avatar--1">
                J
              </Avatar>
              <p>
                {t('Jamie 分享了新的灵感', 'Jamie shared a new idea')}
                <small>{t('刚刚 · 品牌方向', 'Just now · Brand direction')}</small>
              </p>
              <Sparkles size={16} aria-hidden />
            </div>
            <div>
              <Avatar size={30} className="leaf-component-scene__avatar--2">
                S
              </Avatar>
              <p>
                {t('Sam 完成了第一个原型', 'Sam finished the first prototype')}
                <small>{t('20 分钟前 · 产品设计', '20 min ago · Product design')}</small>
              </p>
              <Check size={16} aria-hidden />
            </div>
          </div>
        </Card>
        <div className="leaf-component-scene__verification">
          <h3>{t('每一步，都安心。', 'One step closer.')}</h3>
          <p>{t('输入验证码，开始你的下一段旅程。', 'Enter your code to start something good.')}</p>
          <InputOTP
            length={6}
            aria-label={t('验证码', 'Verification code')}
            value={code}
            onChange={setCode}
          />
          <p>
            {code.length === 6
              ? t('已准备好继续', 'Ready to continue')
              : t('没有收到验证码？', 'Didn’t get a code?')}
            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                message.success(t('示例验证码是 432100', 'The example code is 432100'))
              }
            >
              {t('重新发送', 'Resend')}
            </Button>
          </p>
        </div>
      </div>
      <div className="leaf-component-scene__column">
        <Card className="leaf-component-scene__welcome">
          <div className="leaf-component-scene__welcome-heading">
            <span className="leaf-component-scene__symbol">
              <Users size={20} aria-hidden />
            </span>
            <span>{t('你的创作空间', 'YOUR CREATIVE SPACE')}</span>
          </div>
          <h3>{workspace || t('给好想法一点空间。', 'Room for a good idea.')}</h3>
          <p>{t('和伙伴一起，把下一个产品做好。', 'Make your next product together.')}</p>
          <Button fullWidth endIcon={<ArrowRight size={16} />} onClick={() => createSpace()}>
            {workspace ? t('编辑空间', 'Edit workspace') : t('创建你的空间', 'Create your space')}
          </Button>
          <div className="leaf-component-scene__teammates">
            <AvatarGroup size={24}>
              <Avatar className="leaf-component-scene__avatar--0">A</Avatar>
              <Avatar className="leaf-component-scene__avatar--1">J</Avatar>
              <Avatar className="leaf-component-scene__avatar--2">S</Avatar>
            </AvatarGroup>
            <span>{t('8 位伙伴，已经在路上', '8 teammates, already on their way')}</span>
          </div>
        </Card>
        <Card className="leaf-component-scene__communities">
          <span className="leaf-component-scene__muted">
            {t('找到同频的伙伴', 'FIND YOUR PEOPLE')}
          </span>
          <div>
            <span className="leaf-component-scene__tile leaf-component-scene__tile--design">
              <Leaf size={20} aria-hidden />
            </span>
            <p>
              <strong>{t('设计伙伴', 'Design circle')}</strong>
              <small>{t('把灵感变成作品', 'Ideas into experiences')}</small>
            </p>
            <Button
              variant="ghost"
              size="sm"
              aria-label={t('加入设计伙伴', 'Join Design circle')}
              startIcon={<ArrowRight size={16} />}
              onClick={() => createSpace(t('设计伙伴的好想法', 'Design circle ideas'))}
            />
          </div>
          <div>
            <span className="leaf-component-scene__tile leaf-component-scene__tile--build">
              <Sparkles size={20} aria-hidden />
            </span>
            <p>
              <strong>{t('独立创造者', 'Indie makers')}</strong>
              <small>{t('一步步，做点不同', 'Make something different')}</small>
            </p>
            <Button
              variant="ghost"
              size="sm"
              aria-label={t('加入独立创造者', 'Join Indie makers')}
              startIcon={<ArrowRight size={16} />}
              onClick={() => createSpace(t('创造者的好想法', 'Indie maker ideas'))}
            />
          </div>
        </Card>
        <div className="leaf-component-scene__save">
          <div className="leaf-component-scene__save-heading">
            {dirty ? <Save size={17} aria-hidden /> : <Check size={17} aria-hidden />}
            <strong>
              {dirty
                ? t('好想法，记下来。', 'Keep that good idea.')
                : t('一切都已保存。', 'All saved.')}
            </strong>
          </div>
          <p>
            {dirty
              ? t('保存当前设置，继续下一步。', 'Save your changes and keep going.')
              : t('可以专心做下一件事了。', 'You can focus on what comes next.')}
          </p>
          <div className="leaf-component-scene__save-actions">
            <Button variant="soft" size="sm" loading={saving} onClick={save}>
              {t('保存更改', 'Save changes')}
            </Button>
            <Button variant="ghost" size="sm" disabled={saving} onClick={() => setDirty(false)}>
              {t('暂时放下', 'Discard')}
            </Button>
          </div>
        </div>
      </div>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={t('创建你的空间', 'Create your space')}
        initialFocus={workspaceName}
        width={420}
        footer={
          <Button
            disabled={!workspace.trim()}
            onClick={() => {
              setOpen(false);
              message.success(t('空间已准备好', 'Your space is ready'));
            }}
          >
            {t('完成', 'Done')}
          </Button>
        }
      >
        <label className="leaf-component-scene__muted" htmlFor="showcase-workspace-name">
          {t('空间名称', 'Workspace name')}
        </label>
        <Input
          ref={workspaceName}
          id="showcase-workspace-name"
          value={workspace}
          onChange={(event) => setWorkspace(event.target.value)}
          placeholder={t('你的下一个好想法', 'Your next good idea')}
        />
      </Modal>
    </div>
  );
}
