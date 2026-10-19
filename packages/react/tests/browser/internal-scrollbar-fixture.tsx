import {
  AutoComplete,
  Cascader,
  Drawer,
  Mentions,
  Select,
  Textarea,
  TimePicker,
  Transfer,
  TreeSelect,
  VirtualList,
} from '@ifhover/leaf-ui';
import { useRef, useState } from 'react';

const options = Array.from({ length: 120 }, (_, index) => ({
  value: String(index),
  label: `Option ${index}`,
}));
const tree = options.map(({ value, label }) => ({ value, label }));

export function InternalScrollbarFixture() {
  const [scroll, setScroll] = useState('');
  const [drawer, setDrawer] = useState(false);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const [editorEvent, setEditorEvent] = useState('');
  const editorValue = options.map((option) => option.label).join('\n');
  return (
    <main style={{ padding: 24 }}>
      <h1>Internal component scrollbars</h1>
      <div style={{ display: 'grid', gap: 20, maxWidth: 420 }}>
        <Textarea
          ref={textarea}
          aria-label="Native scrolling editor"
          defaultValue={editorValue}
          rows={3}
          resize="both"
          style={{ width: '80%' }}
          onScroll={(event) =>
            setEditorEvent(
              `${event.currentTarget === textarea.current}:${event.currentTarget.selectionStart}:${event.currentTarget.selectionEnd}`,
            )
          }
        />
        <output aria-label="Editor scroll event">{editorEvent}</output>
        <Mentions
          aria-label="Scrolling mentions editor"
          defaultValue={editorValue}
          options={options}
          rows={3}
        />
        {[false, true].map((virtual) => (
          <Select
            key={String(virtual)}
            aria-label={virtual ? 'Virtual selection' : 'Selection'}
            options={options}
            virtual={virtual}
            listHeight={180}
            onPopupScroll={(event) =>
              setScroll(
                `${event.currentTarget.classList.contains('leaf-scrollbar__viewport')}:${Math.round(event.currentTarget.scrollTop)}`,
              )
            }
          />
        ))}
        <output aria-label="Popup scroll event">{scroll}</output>
        <AutoComplete aria-label="Suggestions" options={options} virtual listHeight={180} />
        <TreeSelect aria-label="Tree selection" options={tree} virtual listHeight={180} />
        <Cascader aria-label="Cascading selection" options={tree} />
        <TimePicker aria-label="Time selection" minuteStep={1} showSeconds />
        <button type="button" onClick={() => setDrawer(true)}>
          Open scrolling drawer
        </button>
        <Transfer
          items={options.map(({ value, label }) => ({ key: value, label }))}
          height={160}
          searchable={false}
        />
        <VirtualList
          aria-label="Virtual rows"
          role="region"
          items={options}
          itemKey={(item) => item.value}
          height={180}
          renderItem={(item) => <div style={{ height: 40 }}>{item.label}</div>}
        />
      </div>
      <Drawer
        open={drawer}
        onClose={() => setDrawer(false)}
        title="Scrolling drawer"
        footer="Pinned footer"
      >
        <div style={{ height: 1600 }}>Tall body content</div>
      </Drawer>
    </main>
  );
}
