import { Progress, Space } from '@sudden3/leaf-ui';
export function Capabilities({ english = false }) {
  return (
    <Space direction="vertical" align="stretch">
      <div>
        <p style={{ margin: '0 0 8px' }}>{english ? 'Segmented tasks' : '分段任务'}</p>
        <Progress
          percent={75}
          segments={[
            { key: 'a', percent: 35, color: '#20834a' },
            { key: 'b', percent: 40, color: '#1677ff' },
          ]}
        />
      </div>
      <div>
        <p style={{ margin: '0 0 8px' }}>{english ? 'Discrete steps' : '分步进度'}</p>
        <Progress percent={60} steps={10} />
      </div>
      <div>
        <p style={{ margin: '0 0 8px' }}>{english ? 'Dashboard' : '仪表盘'}</p>
        <Progress type="circle" dashboard percent={65} successPercent={30} />
      </div>
    </Space>
  );
}
