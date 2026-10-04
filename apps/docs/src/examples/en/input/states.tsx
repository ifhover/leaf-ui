import { Input } from '@sudden3/leaf-ui';

export function InputStates() {
  return (
    <div className="leaf-demo-stack">
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Disabled input</span>
        <Input aria-label="Disabled input" disabled placeholder="Cannot edit right now" />
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Project name error · Error</span>
        <Input
          aria-label="Project name error"
          status="error"
          placeholder="Enter a project name"
          aria-describedby="project-error"
        />
      </div>
      <span id="project-error" className="leaf-demo-error">
        Project name is required.
      </span>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Name warning</span>
        <Input aria-label="Name warning" status="warning" defaultValue="A similar name exists" />
      </div>
    </div>
  );
}
