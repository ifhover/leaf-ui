import { AutoComplete, Select, Space } from '@ifhover/leaf-ui';

const options = [
  { value: 'alice', label: 'Alice Green' },
  { value: 'bob', label: 'Bob Miller' },
  { value: 'archived', label: 'Archived', disabled: true },
];

export function SearchSelectFixture() {
  return (
    <>
      <h1>Searchable selections</h1>
      <form aria-label="Search selections" style={{ maxWidth: 420 }}>
        <Space direction="vertical" align="stretch">
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <Select
              key={size}
              size={size}
              aria-label={`Search ${size}`}
              name={size}
              showSearch
              allowClear
              options={options}
              defaultValue="alice"
            />
          ))}
          <AutoComplete aria-label="Matching suggestions" options={options} filterOption={false} />
          <Select aria-label="Empty selection" options={[]} />
          <Select aria-label="Loading selection" options={[]} loading />
          <AutoComplete aria-label="Empty suggestions" options={[]} />
          <AutoComplete aria-label="Loading suggestions" options={[]} loading />
        </Space>
      </form>
    </>
  );
}
