# Table implementation

`table` contains native semantic parts and surface styling. It has no runtime or declaration dependency on TanStack Table. The root package exports these parts; the TanStack adapter is intentionally absent from the root barrel so installing/importing basic Leaf UI never requires the optional table engine.

`../tabletanstack` consumes a user-owned TanStack v8 instance. Filtering, sorting, pagination, expansion, selection, column order, visibility, pinning and sizing all read from and write to that instance. The adapter does not mutate table options or keep duplicate business state. The optional peer dependency is also installed as a development dependency for examples, tests and type emission.

The mutually exclusive data/columns convenience mode creates a single instance with the usual local row models. It uses the same renderer and accepts native TanStack options, not a second column/state schema. Set pagination=false to display the complete data set.

Optional dnd-kit integration writes column order directly to the instance. Single-level headers reorder within their pin region, including pin-array order. Row reordering returns current-page stable Row objects to the application; it is intentionally unavailable for virtual, hierarchical, grouped, filtered, sorted or expanded rows. Drag autoscroll stays within the table viewport. Ordinary tables do not mount sensors or sortable subscriptions. Application-managed data and stable keys preserve selection and editors after reorder.

Table keeps native table semantics. Sort buttons set aria-sort on the primary sorted column; selection is conveyed through real labeled controls, rather than grid-only aria-selected. Resize handles use a focusable separator with values. Detail content mounts on first expansion and survives collapse. Internal controls use FieldScope to avoid inheriting an unrelated FormField id or required state.

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
