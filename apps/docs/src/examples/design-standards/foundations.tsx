import {
  Button,
  Card,
  Checkbox,
  ConfigProvider,
  Flex,
  Form,
  FormField,
  Input,
  Modal,
  Select,
  Space,
  Switch,
  Text,
} from '@ifhover/leaf-ui';
import { useState } from 'react';

export function FoundationPreview() {
  const [primaryColor, setPrimaryColor] = useState('#1e964f');
  const [dark, setDark] = useState(false);
  const [open, setOpen] = useState(false);
  return (
    <Space direction="vertical" align="stretch" size={24}>
      <Flex align="center" justify="space-between" gap={16} wrap>
        <Select
          aria-label="主题色"
          value={primaryColor}
          onChange={setPrimaryColor}
          options={[
            { value: '#1e964f', label: '叶绿' },
            { value: '#4c705c', label: '灰绿' },
            { value: '#3568b0', label: '蓝色' },
            { value: '#7654c6', label: '紫色' },
          ]}
          style={{ width: 144 }}
        />
        <Switch checked={dark} onChange={(event) => setDark(event.target.checked)}>
          深色外观
        </Switch>
      </Flex>
      <ConfigProvider theme={{ primaryColor, appearance: dark ? 'dark' : 'light' }}>
        <Card>
          <Space direction="vertical" align="stretch" size={24}>
            <Form layout="vertical">
              <FormField label="名称">
                <Input placeholder="输入名称" />
              </FormField>
              <FormField label="发送方式">
                <Select
                  defaultValue="queue"
                  options={[
                    { value: 'queue', label: '排队发送' },
                    { value: 'immediate', label: '立即发送' },
                  ]}
                />
              </FormField>
            </Form>
            <Flex align="center" justify="space-between" gap={16} wrap>
              <Checkbox>记住选择</Checkbox>
              <Switch defaultChecked>提示建议</Switch>
            </Flex>
            <Flex justify="end" gap={8} wrap>
              <Button>描边按钮</Button>
              <Button danger>
                危险操作
              </Button>
              <Button variant="link">文字操作</Button>
              <Button variant="solid" onClick={() => setOpen(true)}>
                打开弹窗
              </Button>
            </Flex>
            <Modal
              open={open}
              title="保存更改？"
              description="弹窗通过留白组织内容，操作区与正文使用相同的表面色。"
              confirmText="保存更改"
              onClose={() => setOpen(false)}
            >
              <Text tone="muted">确认后将应用当前设置。</Text>
            </Modal>
          </Space>
        </Card>
      </ConfigProvider>
    </Space>
  );
}
