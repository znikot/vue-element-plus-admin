import { KFormnFieldType, KFormTreeSelectOptions, KFormnDataOptions, KFormnDictOptions, KFormnSelectOptions } from '../KForm/types'

export type KTableSortableType = '' | 'custom'
export type KTableRendererType = '' | 'timestamp' | 'dict' | 'buttons' | 'switch'
export type KTableFixedType = 'left' | 'right'

export interface KTableProps {
  columns: KTableColumnProps[]
  options: KTableOption
  data: any
  buttons: KTableButton[]
  search: KTableSearch
  events: KTableEvent
  // events:any
  loading: boolean
}

export interface KTableEvent {
  [key: string]: (ts: KTableStatus) => void
}

export interface KTableOption {
  size: string
  layout: string
}
export interface KTableButton {
  name: string
  label: string
  isEnable: (ts: KTableStatus) => boolean
  action: (ts: KTableStatus) => void
}
export interface KTableSearch {
  fields: KTableSearchField[]
}
export interface KTableSearchField {
  prop: string
  label: string
  type: KFormnFieldType
  options: KFormTreeSelectOptions | KFormnDataOptions | KFormnDictOptions | KFormnSelectOptions | any
}

export interface KTableColumnProps {
  prop: string
  label: string
  width: number
  sortable: KTableSortableType
  fixed: KTableFixedType
  renderer: KTableColumnRenderer
  changed: (row: any, to: any) => void
}

export interface KTableColumnRenderer {
  type: KTableRendererType
  options: KTableButtonsRendererOption | KTableSwitchRendererOption | KTableDictRendererOption
}

export interface KTableButtonsRendererOption {
  buttons: ButtonsRendererOptionButton[]
}
export interface ButtonsRendererOptionButton {
  type: 'primary' | 'danger'
  label: string
  icon: string
  tip: string
  permissions: string[]
  isVisible: (row: any) => boolean
  action: (row: any) => void
}

export interface KTableSwitchRendererOption {
  active: string | number
  inactive: string | number
  isEnable: (row: any) => boolean
}

export interface KTableDictRendererOption {
  dictType: string
  filter: (value: any) => any
}

export interface KTableStatus {
  selectedIds: number[] | string[]
  searchParams: { [key: string]: any }
  selectedRows: any[]
}
