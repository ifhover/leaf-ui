# Table implementation

`DataTable` is the sole public table component, imported from `@ifhover/leaf-ui/table`. The former `@ifhover/leaf-ui/table/tanstack` path aliases the same component. `table.tsx` contains private native semantic controls and surface styling consumed by the adapter in `../tabletanstack`. DataTable is intentionally absent from the package root, so ordinary Leaf UI root imports do not require the optional TanStack engine.

DataTable defaults to `columnDividers=false` and `striped=true`. Every table uses a base-radius outer frame, an untinted header surface, a 1px header divider and a Card-like downward resting shadow; the frame softens the divider color by mixing 70% divider with the table surface. `columnDividers` adds column dividers only; the legacy `bordered` alias is deprecated and explicit `columnDividers` takes precedence. Headers use headingWeight and a slightly muted body color in both modes; sorting icons follow the label with a 4px gap. Stripes start on the first body row and blend 2% table text color into the table surface and suppress horizontal body/footer dividers; `striped=false` restores fine row dividers. Hover blends 3% primary into the table surface for one opaque color across ordinary and striped rows; selected rows keep their dedicated treatment. Pinned-column edge shadows disappear at the corresponding logical horizontal scroll boundary. To retain the previous appearance with row separators, use `striped={false}`. Include these appearance changes in the next release's migration notes.

The native Table composition API and its regional defaults are removed in this development version. Migrate native rows/cells to DataTable data and column definitions, and use `components.DataTable` for regional defaults. Row and cell callbacks use `DataTableRowProps` and `DataTableCellProps`; the `theme.components.Table` visual token slot remains available. Include the API migration in the next release notes.

`../tabletanstack` consumes a user-owned TanStack v8 instance. Filtering, sorting, pagination, expansion, selection, column order, visibility, pinning and sizing all read from and write to that instance. The adapter does not mutate table options or keep duplicate business state. The optional peer dependency is also installed as a development dependency for examples, tests and type emission.

The mutually exclusive data/columns convenience mode creates a single instance with the usual local row models. It uses the same renderer and accepts native TanStack options, not a second column/state schema. Use `localPagination={false}` to keep pagination state while displaying the complete data set; the legacy `pagination={false}` also hides the footer.

The public `useDataTable` hook shares this initialization and returns a stable native instance for custom counters, resets and bulk actions without requiring every state to be controlled. `localPagination=false` bypasses the cached local pagination model through `manualPagination`, including when toggled after mount; the Hook's `pagination` prop is a deprecated compatibility alias. For a supplied instance, DataTable's `pagination` prop only owns the default footer. Native server options remain authoritative when pagination is enabled.

`toolbar` adds content to the automatic layout; `pagination` accepts either a boolean or `DataTablePaginationProps`. `layout="auto"` always renders the automatic layout and ignores children; `layout="custom"` renders children only. Omitting `layout` with children preserves the former replacement behavior but warns in development. These built-in parts do not consume public part defaults; use explicit parts to configure those defaults. Missing row-model capabilities hide or disable the related interactions with development warnings. Unknown-total navigation preserves native attributes and events without leaking pagination-only props to the DOM.

`useDataTableSelection` maps business row keys to TanStack `rowSelection` for controlled or uncontrolled single/multiple selection and exposes `clearSelection`. `DataTable.Search` defaults to a visible clear action and inherits the DataTable size; `DataTable.Pagination` enables its size changer by default. Pinned positioning is internal and cannot be overridden by `getCellProps`.

`DataTableProps<T>` is the mutually exclusive union of `DataTableInstanceProps<T>` and `DataTableDataProps<T>`. Instance-only wrappers should migrate to `DataTableInstanceProps`. `DataTableRowKey<T>` accepts required string/number fields or functions returning either primitive; JavaScript callers retain runtime validation. Optional `DataTableColumnDef<T, TValue>` adds metadata checks to native column definitions without global augmentation. Native `ColumnDef` remains supported; `satisfies DataTableColumnMeta` is another opt-in check. Include these type-contract changes in the next release's migration notes.

Optional dnd-kit integration writes column order directly to the instance. Single-level headers reorder within their pin region, including pin-array order. Row reordering returns current-page stable Row objects to the application; it is intentionally unavailable for virtual, hierarchical, grouped, filtered, sorted or expanded rows. Drag autoscroll stays within the table viewport. Ordinary tables do not mount sensors or sortable subscriptions. Application-managed data and stable keys preserve selection and editors after reorder.

DataTable keeps native table semantics. Sort buttons set aria-sort on the primary sorted column; selection is conveyed through real labeled controls, rather than grid-only aria-selected. Resize handles use a focusable separator with values. Detail content mounts on first expansion and survives collapse. Internal controls use FieldScope to avoid inheriting an unrelated FormField id or required state.

Ordinary grouped tables retain up to 200 rows in stable order so collapsing a group does not flip later stripes or replace child content. Their private row motion uses the shared duration and preference helpers to animate content height, opacity and cell insets, continuing from the current geometry on reversal. Closing rows become aria-hidden and inert immediately, then hidden after finishing; the last visible row owns the final divider. Virtual tables, larger groups and reduced/disabled motion update immediately. Animation completion and unmount cancel all keyframes so natural table layout remains authoritative.

Explicit row virtualization uses TanStack Virtual and spacer rows. It measures natural row/detail heights and grouped header height; retained focused rows can introduce intermediate spacers. This is not a spreadsheet grid or column-virtualization engine. Screen-reader/device acceptance remains distinct from browser axe checks.

Verify with:

```sh
pnpm --filter @ifhover/leaf-ui exec vitest run src/table src/tabletanstack
pnpm --filter @ifhover/leaf-ui exec playwright test table.spec.ts
pnpm check
pnpm build
pnpm --filter @ifhover/leaf-ui measure:bundle
```

Maintain independent style dependencies, exports, documentation metadata, bilingual examples, the static catalog SVG, and AI export discovery together. Developing here does not publish or replace the current stable documentation.
