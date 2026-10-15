import './component-filter.scss';
import { Input } from '@ifhover/leaf-ui';
import { Search } from 'lucide-react';

export function matchesComponentQuery(query: string, text: string) {
  const normalize = (value: string) => value.toLowerCase().replace(/[\s_-]+/g, '');
  const normalizedText = normalize(text);
  return query
    .trim()
    .split(/\s+/)
    .every((word) => normalizedText.includes(normalize(word)));
}

export function ComponentFilter({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
}) {
  return (
    <div className="leaf-component-filter rp-not-doc">
      <Input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        prefix={<Search size={16} />}
        allowClear
        aria-label={label}
        placeholder={label}
        autoComplete="off"
        spellCheck={false}
      />
    </div>
  );
}
