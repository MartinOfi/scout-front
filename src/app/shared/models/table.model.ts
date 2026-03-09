/**
 * Table Model Types
 *
 * Type definitions for the DataTableComponent reusable table.
 */

/**
 * Configuration for a table column
 */
export interface TableColumn {
  /** Unique key matching the data property */
  key: string;
  /** Display header text */
  header: string;
  /** Column type for specialized rendering */
  type?:
    | 'text'
    | 'image'
    | 'status'
    | 'date'
    | 'time'
    | 'datetime'
    | 'datelong'
    | 'number'
    | 'action'
    | 'phone'
    | 'punctuality'
    | 'onTime'
    | 'late'
    | 'rating';
  /** Whether the column is sortable */
  sortable?: boolean;
  /** Fixed width for the column */
  width?: string;
  /** Actions available when type is 'action' */
  actions?: TableAction[];
  /** Custom formatter function for cell values */
  formatter?: (value: unknown, row: TableData) => string;
}

/**
 * Configuration for a table action button
 */
export interface TableAction {
  /** Unique action key */
  key: string;
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
  enabled?: boolean | ((row: TableData) => boolean);
  /** Whether the action is visible (static or dynamic) */
  visible?: boolean | ((row: TableData) => boolean);
}

/**
 * General configuration options for the data table
 */
export interface DataTableConfig {
  /** Show table header row */
  showHeader?: boolean;
  /** Enable alternating row colors */
  stripedRows?: boolean;
  /** Enable hover effect on rows */
  hoverable?: boolean;
  /** Hide pagination controls */
  hidePagination?: boolean;
}

/**
 * Generic table data row type
 */
export type TableData = Record<string, unknown>;

/**
 * Sort event emitted when a column is sorted
 */
export interface SortEvent {
  /** Column key being sorted */
  column: string;
  /** Sort direction */
  direction: 'asc' | 'desc';
}

/**
 * Action event emitted when an action button is clicked
 */
export interface ActionEvent {
  /** Action key that was clicked */
  action: string;
  /** Row data associated with the action */
  row: TableData;
}
