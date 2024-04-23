import { KFormFieldType, KFormTreeSelectOption, KFormDataOption, KFormDictOption, KFormSelectOption } from '../KForm/types'

export type KTableSortableType = '' | 'custom'

export type KTableFixedType = 'left' | 'right'

export type KTableRendererType =
  | ''
  | 'timestamp'
  | 'dict'
  | 'buttons'
  | 'switch'
  | 'tag'
  | 'icon'
  | 'filter'
  | 'router'
  | 'link'
  | 'text-input'
  | 'number-input'

export interface KTableProps {
  columns: KTableColumnProps[]
  options?: KTableOption
  data?: any
  buttons?: KTableButton[]
  search?: KTableSearch
  events?: KTableEvent
  // events:any
  loading?: boolean
  pageSizes?: number[]
}

export interface KTableEvent {
  [key: string]: (ts: KTableStatus) => void
}

export interface KTableOption {
  size?: string
  layout?: string
  alert?: string
  header?: boolean
  defaultSort?: { prop: string; order: string }
  defaultExpandAll?:boolean
  selection?: boolean | string
  columnHidden?: boolean | ((ts: KTableStatus) => boolean)
}
export interface KTableButton {
  name: string
  label?: string
  align?: 'left' | 'right' | ''
  type?: 'primary' | 'danger' | 'default'
  icon?: string
  permissions?: string[] | string
  isEnable?: (ts: KTableStatus) => boolean
  action?: (ts: KTableStatus) => void
}
export interface KTableSearch {
  fields: KTableSearchField[]
}
export interface KTableSearchField {
  prop: string
  label?: string
  type?: KFormFieldType
  options?: KFormTreeSelectOption | KFormDataOption | KFormDictOption | KFormSelectOption | any
}

export interface KTableColumnProps {
  prop: string
  label: string
  width?: number | string
  visible?: boolean
  sortable?: KTableSortableType
  fixed?: KTableFixedType
  renderer?: KTableColumnRenderer
  changed?: (row: any, to: any) => void
}

export interface KTableColumnRenderer {
  type: KTableRendererType
  options?:
    | KTableButtonsRendererOption
    | KTableSwitchRendererOption
    | KTableDictRendererOption
    | KTableTagRendererOption
    | KTableFilterRendererOption
    | KTableRouterRendererOption
    | KTableLinkRendererOption
    | KTableTextInputRendererOption
    | KTableNumberInputRendererOption
    | KTableIconRendererOption
}

export interface KTableButtonsRendererOption {
  buttons: ButtonsRendererOptionButton[]
}
export interface ButtonsRendererOptionButton {
  type: 'primary' | 'danger'
  label: string
  icon: string
  tip?: string
  permissions?: string[] | string
  isVisible?: (row: any) => boolean
  action: (row: any) => void
}

export interface KTableSwitchRendererOption {
  active: string | number
  inactive: string | number
  labels?: { [key: string | number]: string }
  permissions?: string[] | string
  isEnable?: (row: any) => boolean
  beforeChange?: boolean | (() => Promise<boolean>)
  bind?: boolean
}

export interface KTableDictRendererOption {
  dictType: string
  tagLabel?: { [key: string | number]: string }
  filter?: (value: any) => any
}

export interface KTableTagRendererOption {
  tagLabel: { [key: string | number]: string }
  tagType: { [key: string | number]: string }
}

export interface KTableFilterRendererOption {
  filter: (v: any) => any
}

export interface KTableRouterRendererOption {
  path: string | ((row: any) => string)
}

export interface KTableLinkRendererOption {
  action: (row: any) => void
}

export interface KTableTextInputRendererOption {
  permissions?: string | string[]
}

export interface KTableNumberInputRendererOption {
  permissions?: string | string[]
}

export interface KTableIconRendererOption {
  defaultIcon?: string
}

export interface KTableStatus {
  selectedIds: number[] | string[]
  searchParams: { [key: string]: any }
  selectedRows: any[]
}
