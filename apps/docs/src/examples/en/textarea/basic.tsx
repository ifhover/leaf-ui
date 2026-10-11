import { Space, Textarea } from '@ifhover/leaf-ui';

export function TextareaBasic() {
  return (
    <Space direction="vertical" align="stretch" className="leaf-demo-stack">
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Project description</span>
        <Textarea
          aria-label="Project description"
          placeholder="Describe your new idea…"
          rows={3}
          maxLength={200}
        />
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Read-only introduction</span>
        <Textarea
          aria-label="Read-only introduction"
          defaultValue="Plant your ideas in the interface."
          readOnly
          rows={2}
        />
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Disabled introduction</span>
        <Textarea
          aria-label="Disabled introduction"
          placeholder="Cannot edit right now"
          disabled
          rows={2}
        />
      </div>
    </Space>
  );
}
