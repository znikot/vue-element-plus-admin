export type KFormnFieldType = 'int' | 'float' | 'string' | 'select' | 'treeSelect' | 'switch' | 'radio' | 'password' | 'image'
export type KFormnFieldRuleType = 'int' | 'float' | 'string'

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
  type: KFormnFieldType
  /**
   * 字段选项
   */
  options?: KFormTreeSelectOptions | KFormnDataOptions | KFormnDictOptions | KFormnSelectOptions | KFormnImageOptions
  /**
   * 字段校验规则
   */
  rule?: KFormnFieldRule
  /**
   * 默认值
   */
  default?: any
  /**
   * 字段值类型转换
   */
  as?: string | number | boolean
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
  labelWidth: number | string
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
  onCancel: () => void
}

export interface KFormTreeSelectOptions {
  api: <T = any>() => Promise<IResponse<T>>
  valueField: string
  labelField?: string
  setLabelTo?: string
}

export interface KFormnFieldRule {
  type: KFormnFieldRuleType
  required?: boolean | ((data: any) => boolean)
  default?: any
}

export interface KFormnDataOptions {
  data: KFormnLabelValue[]
}

export interface KFormnLabelValue {
  label: string
  value: string
}

export interface KFormnDictOptions {
  dictType: string
}

export interface KFormnSelectOptions {
  data: KFormnLabelValue[]
  multiple: boolean
}

export interface KFormnImageOptions {
  multiple: boolean
}
