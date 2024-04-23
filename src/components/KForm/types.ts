export type KFormFieldType = 'int' | 'float' | 'string' | 'select' | 'treeSelect' | 'switch' | 'radio' | 'password' | 'image' | 'icon'
export type KFormFieldRuleType = 'int' | 'float' | 'string'

export interface KFormFieldProps {
  /**
   * 表单字段名称
   */
  prop: string
  /**
   * 表单字段标题
   */
  label: string
  /**
   * 字段类型
   */
  type?: KFormFieldType
  /**
   * 字段选项
   */
  options?: KFormTreeSelectOption | KFormDataOption | KFormDictOption | KFormSelectOption | KFormImageOption
  /**
   * 字段校验规则
   */
  rule?: KFormFieldRule
  /**
   * 默认值
   */
  default?: any
  /**
   * 字段值类型转换
   */
  as?: string | number | boolean
  /**
   * 依赖字段，当依赖字段变化时，当前字段会重置
   */
  depend?: string
  /**
   * 字段值变更事件
   * @param value
   * @returns
   */
  changed?: (value: any) => void
}

export interface KFormProps {
  /**
   * 是否对话框
   */
  dialog?: boolean
  /**
   * 模态
   */
  modal?: boolean
  /**
   * 对话框标题
   */
  title?: string
  /**
   * 新建标题
   */
  newTitle?: string
  /**
   * 编辑标题
   */
  editTitle?: string
  /**
   * 表单字段
   */
  fields: KFormFieldProps[]
  /**
   * 表单字段布局
   */
  layout?: { [key: string]: number | string }[]
  /**
   * 表单数据
   */
  data?: any
  /**
   * 是否打开
   */
  open?: boolean
  /**
   * 表单字段标题宽度
   */
  labelWidth?: number | string
  /**
   * 表单提交
   * @param data 表单数据
   * @returns
   */
  onSubmit: (data: any) => void
  /**
   * 表单取消
   * @returns
   */
  onCancel?: () => void
}

export interface KFormTreeSelectOption {
  api: <T = any>() => Promise<IResponse<T>>
  valueField: string
  labelField?: string
  setLabelTo?: string
}

export interface KFormFieldRule {
  type: KFormFieldRuleType
  required?: boolean | ((data: any) => boolean)
  default?: any
}

export interface KFormDataOption {
  data: KFormLabelValue[]
}

export interface KFormLabelValue {
  label: string
  value: string
  /**
   * 标签值分组
   */
  group?: string
}

export interface KFormLabelValueGroup {
  label: string
  values: KFormLabelValue[]
}

export interface KFormDictOption {
  dictType: string
}

export interface KFormSelectOption {
  data: KFormLabelValue[] | (() => KFormLabelValue[] | KFormLabelValueGroup[]) | KFormLabelValueGroup[]
  group?: boolean
  multiple: boolean
  placeholder?: string
  // remote?: boolean
  filterable?: boolean
  labelField?: string | ((item: any) => string)
  valueField?: string | ((item: any) => string)
  groupField?: string | ((item: any) => string)
  // remoteMethod?: (query: string) => void
  // filterMethod?: (query: string) => void
  optionEnable?: (item: any, value: any) => boolean
  optionApi?: <T = any>(query?: string) => Promise<IResponse<T>>
}

export interface KFormImageOption {
  multiple: boolean
}
