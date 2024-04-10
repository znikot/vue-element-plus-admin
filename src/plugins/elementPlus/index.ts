import type { App } from 'vue'

// 需要全局引入一些组件，如ElScrollbar，不然一些下拉项样式有问题
// import {
//   ElLoading,
//   ElScrollbar,
//   ElTable,
//   ElTableColumn,
//   ElPagination,
//   ElAlert,
//   ElLink,
//   ElImage,
//   ElSwitch,
//   ElTag,
//   ElButton,
//   ElDropdown,
//   ElDropdownMenu,
//   ElInput,
//   ElInputNumber,
//   ElRadio,
//   ElRadioGroup,
//   ElSelect,
//   ElOption,
//   ElCheckbox,
//   ElCheckboxGroup,
//   ElTreeSelect,
//   ElDatePicker,
//   ElTimePicker,
//   ElUpload,
//   ElForm,
//   ElFormItem,
//   ElRow,
//   ElCol,
//   ElDialog,
// } from 'element-plus'

import ElementPlus from 'element-plus'

// const plugins = [ElLoading]

// const components = [
//   ElScrollbar,
//   ElTable,
//   ElTableColumn,
//   ElPagination,
//   ElAlert,
//   ElLink,
//   ElImage,
//   ElSwitch,
//   ElTag,
//   ElButton,
//   ElDropdown,
//   ElDropdownMenu,
//   ElInput,
//   ElInputNumber,
//   ElRadio,
//   ElRadioGroup,
//   ElSelect,
//   ElOption,
//   ElCheckbox,
//   ElCheckboxGroup,
//   ElTreeSelect,
//   ElDatePicker,
//   ElTimePicker,
//   ElUpload,
//   ElForm,
//   ElFormItem,
//   ElRow,
//   ElCol,
//   ElDialog,
// ]

export const setupElementPlus = (app: App<Element>) => {
  app.use(ElementPlus)
  // plugins.forEach(plugin => {
  //   app.use(plugin)
  // })

  // 为了开发环境启动更快，一次性引入所有样式
  if (import.meta.env.VITE_USE_ALL_ELEMENT_PLUS_STYLE === 'true') {
    import('element-plus/dist/index.css')
    return
  }

  // components.forEach(component => {
  //   app.component(component.name!, component)
  // })
}
