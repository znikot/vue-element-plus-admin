import request from '@/axios'


/**
 * 表格列显示逻辑
 * 在 TableHeader.vue 中触发
 * @param {string} code 表格编码
 * @param {object} col 表格列数据
 */
export function onTableColumnShow(code, col) {
  //   gridColApi.delete('', { code: code, col: col.prop }).then(res => {
  //     console.log(res)
  //   })
  request.delete({ url: '/system/grid/col', data: { code: code, col: col.prop } }).then(res => {
    console.log(res)
  })
}

/**
 *  表格列隐藏逻辑
 * 在 TableHeader.vue 中触发
 * @param {string} code
 * @param {object} col
 */
export function onTableColumnHide(code, col) {
  //   gridColApi.post('', { code: code, col: col.prop }).then(res => {
  //     console.log(res)
  //   })
  request.post({ url: '/system/grid/col', data: { code: code, col: col.prop } }).then(res => {
    console.log(res)
  })
}

/**
 * 加载要隐藏的表格列配置，返回 Promise
 * 在 TableHeader.vue 中使用
 * @param {string} code
 * @returns
 */
export function loadHiddenTableColumn(code) {
  //   return gridColApi.get('/list', { code: code, paging: false })
  return request.get({ url: '/system/grid/col/list', params: { code: code, paging: false } })
}
