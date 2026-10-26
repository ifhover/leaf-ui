import type { OnChangeFn, RowSelectionState } from '@tanstack/react-table';
import { useCallback, useEffect, useMemo, useState } from 'react';

export type DataTableSelectionMode = 'single' | 'multiple';
export type DataTableRowSelectionKey = string | number;

export interface UseDataTableSelectionOptions {
  /** Single selects the most recently requested key; multiple keeps all selected keys. */
  mode?: DataTableSelectionMode;
  /** Controlled selected row IDs. Row IDs come from useDataTable's rowKey or TanStack getRowId. */
  selectedRowKeys?: readonly DataTableRowSelectionKey[];
  /** Initial selected row IDs for uncontrolled usage. */
  defaultSelectedRowKeys?: readonly DataTableRowSelectionKey[];
  /** Called with normalized, unique string row IDs whenever selection changes. */
  onSelectedRowKeysChange?: (selectedRowKeys: string[]) => void;
}

export interface DataTableSelectionOptions {
  state: { rowSelection: RowSelectionState };
  onRowSelectionChange: OnChangeFn<RowSelectionState>;
  enableMultiRowSelection: boolean;
}

export interface UseDataTableSelectionResult {
  selectedRowKeys: string[];
  rowSelection: RowSelectionState;
  onRowSelectionChange: OnChangeFn<RowSelectionState>;
  selectionOptions: DataTableSelectionOptions;
  clearSelection: () => void;
}

function normalizeKeys(
  keys: readonly DataTableRowSelectionKey[],
  mode: DataTableSelectionMode,
): string[] {
  const unique = [...new Set(keys.map(String))];
  return mode === 'single' ? unique.slice(-1) : unique;
}

/**
 * Keeps business row keys as the single selection state while exposing the native
 * TanStack props needed by useDataTable or DataTable options.
 */
export function useDataTableSelection({
  mode = 'multiple',
  selectedRowKeys,
  defaultSelectedRowKeys = [],
  onSelectedRowKeysChange,
}: UseDataTableSelectionOptions = {}): UseDataTableSelectionResult {
  const [internalSelectedRowKeys, setInternalSelectedRowKeys] = useState(() =>
    normalizeKeys(defaultSelectedRowKeys, mode),
  );
  useEffect(() => {
    if (mode !== 'single') return;
    setInternalSelectedRowKeys((current) => {
      const normalized = normalizeKeys(current, mode);
      return normalized.length === current.length &&
        normalized.every((key, index) => key === current[index])
        ? current
        : normalized;
    });
  }, [mode]);
  const controlledRowKeys = useMemo(
    () => (selectedRowKeys == null ? undefined : normalizeKeys(selectedRowKeys, mode)),
    [mode, selectedRowKeys],
  );
  const selectedKeys = controlledRowKeys ?? normalizeKeys(internalSelectedRowKeys, mode);
  const rowSelection = useMemo<RowSelectionState>(
    () => Object.fromEntries(selectedKeys.map((key) => [key, true])),
    [selectedKeys],
  );

  const onRowSelectionChange = useCallback<OnChangeFn<RowSelectionState>>(
    (updater) => {
      const next = typeof updater === 'function' ? updater(rowSelection) : updater;
      const nextKeys = normalizeKeys(
        Object.entries(next)
          .filter(([, selected]) => selected)
          .map(([key]) => key),
        mode,
      );
      if (controlledRowKeys == null) setInternalSelectedRowKeys(nextKeys);
      onSelectedRowKeysChange?.(nextKeys);
    },
    [controlledRowKeys, mode, onSelectedRowKeysChange, rowSelection],
  );
  const clearSelection = useCallback(() => {
    onRowSelectionChange({});
  }, [onRowSelectionChange]);
  const selectionOptions = useMemo<DataTableSelectionOptions>(
    () => ({
      state: { rowSelection },
      onRowSelectionChange,
      enableMultiRowSelection: mode !== 'single',
    }),
    [mode, onRowSelectionChange, rowSelection],
  );

  return {
    selectedRowKeys: selectedKeys,
    rowSelection,
    onRowSelectionChange,
    selectionOptions,
    clearSelection,
  };
}
