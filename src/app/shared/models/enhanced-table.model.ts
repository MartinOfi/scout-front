/**
 * Enhanced Table Model Types
 *
 * Type definitions for the EnhancedDataTableComponent with checkboxes and actions.
 */

/**
 * Configuration for an enhanced table column
 */
export interface EnhancedTableColumn {
  /** Unique key matching the data property (supports dot notation for nested) */
  key: string;
  /** Display header text */
  header: string;
  /** Column type for specialized rendering */
  type?: 'text' | 'status' | 'date' | 'number' | 'action';
  /** Whether the column is sortable */
  sortable?: boolean;
  /** Fixed width for the column */
  width?: string;
  /** Actions available when type is 'action' */
  actions?: TableAction[];
  /** Custom formatter function for cell values */
  formatter?: (value: unknown, row: EnhancedTableData) => string;
}

/**
 * Configuration for a table action button
 */
export interface TableAction {
  /** Unique action key */
  key?: string;
  /** Legacy action id */
  id?: string;
  /** Display label */
  label: string;
  /** Material icon name */
  icon?: string;
  /** Custom SVG icon string */
  svgIcon?: string;
  /** CSS classes for styling */
  className?: string;
  /** Tooltip text */
  tooltip?: string;
  /** Whether the action is enabled (static or dynamic) */
  enabled?: boolean | ((row: EnhancedTableData) => boolean);
  /** Whether the action is visible (static or dynamic) */
  visible?: boolean | ((row: EnhancedTableData) => boolean);
  /** Legacy disabled function (inverted logic) */
  disabled?: (row: EnhancedTableData) => boolean;
}

/**
 * General configuration options for the enhanced data table
 */
export interface EnhancedTableConfig {
  /** Show table header row */
  showHeader?: boolean;
  /** Enable alternating row colors */
  stripedRows?: boolean;
  /** Enable hover effect on rows */
  hoverable?: boolean;
}

/**
 * Enhanced table data row type with selection support
 */
export interface EnhancedTableData {
  /** Unique identifier for the row */
  id?: string | number;
  /** Selection state */
  selected?: boolean;
  /** Dynamic data properties */
  [key: string]: unknown;
}

/**
 * State of the "select all" checkbox
 */
export type SelectAllState = 'none' | 'partial' | 'all';
