<template>
  <div v-loading="props.config.loading">
    <el-alert :title="getProp(props.config, 'options.alert', '')" type="warning" :closable="false"
      v-if="getProp(props.config, 'options.alert', '') != ''" />
    <Search :config="props.config.search" :params="state.searchParams"
      v-if="getProp(props.config, 'search.fields', []).length > 0"
      @search="onEvent(props.config.events, 'refresh', state)" @reset="resetSearch" />
    <TableHeader :buttons="props.config.buttons" :events="props.config.events" :columns="props.config.columns"
      :onColumnStatus="columnStatusChange" :tableStatus="state" :options="props.config.options"
      :search="props.config.search" @search="onEvent(props.config.events, 'refresh', state)" @reset="resetSearch"
      v-if="getProp(props.config, 'options.header', true)">
    </TableHeader>
    <el-table :data="tableDatas" row-key="id" style="width: 100%" max-height="100%" class="w-full" :fit="true"
      :border="false" :size="getProp(props.config, 'options.size', 'default')" stripe
      :table-layout="getProp(props.config, 'options.layout', 'fixed')"
      :default-sort="getProp(props.config, 'options.defaultSort', {})" @select="onSelect" @select-all="onSelectAll"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }" @selection-change="onSelectionChange"
      @sort-change="onSortChange" v-bind="$attrs" :default-expand-all="props.config.options?.defaultExpandAll || false">
      <!-- 选择框 -->
      <el-table-column type="selection" width="50" align="center"
        v-if="getProp(props.config, 'options.selection', 'true').toString() != 'false'"></el-table-column>
      <el-table-column v-for="col in visibleColumns" :key="col.prop" :prop="col.prop" :label="col.label"
        :show-overflow-tooltip="shouldShowOverflowTooltip(col)"
        :fixed="['true', 'right', 'left'].includes(col.fixed as string) ? col.fixed : false"
        :sortable="col.sortable ?? false" :width="getPreferedColWidth(col)">
        <template #default="scope">
          <FieldRenderer :field="getProp(scope.row, col.prop, '')" :column="col" :options="col.renderer?.options"
            :row="scope.row" v-if="col.renderer && col.renderer.type != ''"></FieldRenderer>
        </template>
      </el-table-column>
    </el-table>
  </div>
  <div class="my-2" v-if="state.paging">
    <el-pagination :currentPage="state.searchParams.pageNum" :page-size="state.searchParams.pageSize"
      :page-sizes="getProp(props.config, 'pageSizes', [10, 20, 50, 100])" background
      :layout="'sizes,total, ->, prev, pager, next, jumper'" :total="state.searchParams.$total"
      @size-change="onPageSizeChange" @current-change="onPageNumChange"></el-pagination>
  </div>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted, watch, computed, reactive, nextTick } from 'vue'
import { onEvent } from './index'
import { KTableProps, KTableColumnProps, KTableDictRendererOption } from './types'
import FieldRenderer from './FieldRenderer.vue'
import TableHeader from './TableHeader.vue'
import Search from './Search.vue'
import { useDicts } from '@/utils/dict'
import { getProp } from '@/utils/common'

const props = defineProps<{ config: KTableProps }>()

const tableDatas = computed(() => {
  if (!props.config.data) return []
  return props.config.data.rows || props.config.data || []
})

const visibleColumns = computed<KTableColumnProps[]>(() => {
  // console.log('calulate col visible')
  let vCols: KTableColumnProps[] = []
  for (let c of props.config.columns) {
    if (c.visible == undefined || c.visible == null) {
      // console.log('set column visible to true', c)
      c.visible = true
    }
    if (c.visible) {
      vCols.push(c)
    }
  }
  return vCols
})

/**
 * 获取表格列的首选宽度
 * @param {object} col 表格列配置
 */
const getPreferedColWidth = col => {
  //如果列指定了宽度，使用列指定的
  if (col.width) {
    return col.width
  }
  // 根据列的类型来获取首选宽度
  let colType = (col.renderer && col.renderer.type) || ''
  switch (colType) {
    case 'buttons':
      //根据按钮数量来计算
      return col.renderer.options.buttons ? col.renderer.options.buttons.length * 50 : 20
    case 'switch':
      return col.renderer.options.labels ? 100 : 70
    case 'tag':
      return 70
    case 'timestamp':
      return 160
    case 'icon':
      return 80
    default:
      return 'auto'
  }
}

const columnStatusChange = col => {
  // console.log('col status change', col)
  for (let c of props.config.columns) {
    if (c.prop == col.prop) {
      c.visible = col.visible
      break
    }
  }
}

const state = reactive({
  selectedIds: [],
  selectedRows: [],
  paging: false,
  searchParams: {
    pageNum: 1,
    pageSize: 10,
    $total: 0,
    sortField: '',
    sortDirection: '',
  },
  dictTypes: <string[]>[],
  dictColumns: {}, // prop: dictType
  dicts: {},
  dictLoaded: false,
})

// 重置搜索条件
const resetSearch = () => {
  // 删除所有的查询条件
  for (let key in state.searchParams) {
    if (key != 'pageNum' && key != 'pageSize' && key != 'sortField' && key != 'sortDirection' && key != '$total') {
      delete state.searchParams[key]
    }
  }

  // 刷新
  onEvent(props.config.events, 'refresh', state)
}

// 检查表格头部是否应当显示
const headerVisible = computed(() => {
  return props.config && props.config.buttons && props.config.buttons.length > 0
})

const shouldShowOverflowTooltip = col => {
  return !col.renderer || (col.renderer.type != 'buttons' && col.renderer.type != 'switch')
}

// 解析表格信息
const resolveTableDataInfo = () => {
  if (!props.config || !props.config.data) {
    return
  }
  // 解析分页信息
  const { pageNum, pageSize, total } = props.config.data
  if (pageNum && pageSize && total) {
    state.paging = true
    state.searchParams.pageNum = pageNum
    state.searchParams.pageSize = pageSize
    state.searchParams.$total = total
  } else {
    state.paging = false
  }
}

const analyzeDictColumns = () => {
  for (let c of props.config.columns) {
    if (!c.renderer || c.renderer.type != 'dict' || !c.renderer.options) {
      continue
    }
    let options = c.renderer.options as KTableDictRendererOption
    state.dictTypes.push(options.dictType)
    state.dictColumns[c.prop] = options.dictType
    // if (c.renderer && c.renderer.type == 'dict' && c.renderer.options && c.renderer.options.dictType) {
    // let dt = c.renderer.options.dictType
    // state.dictTypes.push(dt)
    // state.dictColumns[c.prop] = dt
    // }
  }
}

const updateDictColumns = (rows?: any) => {
  if (Object.keys(state.dictColumns).length == 0 || !state.dictLoaded) return
  if (rows == null || rows == undefined) rows = tableDatas.value
  for (let row of rows) {
    // let row = rows[ridx]
    for (let cidx in state.dictColumns) {
      row['$' + cidx] = state.dicts[state.dictColumns[cidx]].get(row[cidx])
    }
    // 看看有没有下级
    if (row.children && row.children.length > 0) {
      updateDictColumns(row.children)
    }
  }
}

const loadDicts = () => {
  useDicts(state.dictTypes).then(dicts => {
    state.dicts = dicts
    state.dictLoaded = true

    updateDictColumns()

    nextTick()
  })
}

const setDefaultSort = () => {
  if (!props.config || !props.config.options || !props.config.options.defaultSort) {
    return
  }
  let defaultSort = props.config.options.defaultSort
  if (defaultSort.field && defaultSort.direction) {
    state.searchParams.sortField = defaultSort.prop
    state.searchParams.sortDirection = defaultSort.order
  }
}

const unwatch = watch(
  () => props.config.data,
  v => {
    //更新字典类型的字段数据
    updateDictColumns([])
    // 更新表格信息
    resolveTableDataInfo()

    nextTick()
  }
)


onMounted(() => {
  // console.log(state)
  // state.searchParams.sortField = getProp(props.config, 'defaultSort.prop', '')
  // state.searchParams.sortDirection = getProp(props.config, 'defaultSort.order', '')
  // 解析字典字段信息
  analyzeDictColumns()

  // loadDicts
  loadDicts()

  // set default sort
  setDefaultSort()

  // onEvent(props.config.events, 'refresh', state)
})

onUnmounted(() => {
  unwatch()
})

// 表格事件
const onSelect = (selection, row) => { }
const onSelectAll = val => { }
const onSelectionChange = val => {
  // console.log('selection changed', val)
  state.selectedIds = val.map(item => item.id)
  state.selectedRows = val
  // console.log('table status', state)
}
const onSortChange = val => {
  // 如果 sortable 不是 custom，那么不进行处理
  if (getProp(val, 'column.sortable', '') != 'custom') {
    return
  }
  let dotIndex = val.prop.lastIndexOf('.')
  let sortField = dotIndex == -1 ? val.prop : val.prop.substring(dotIndex + 1)
  state.searchParams.sortField = val.order ? sortField : ''
  state.searchParams.sortDirection = val.order
  onEvent(props.config.events, 'refresh', state)
}

const onPageNumChange = (val: number | string) => {
  // console.log('page changed', val)
  state.searchParams.pageNum = val

  // 触发刷新事件
  onEvent(props.config.events, 'refresh', state)
}
const onPageSizeChange = (val: number | string) => {
  // console.log('page size changed', val)
  state.searchParams.pageSize = val
  state.searchParams.pageNum = 1
  //触发刷新事件
  onEvent(props.config.events, 'refresh', state)
}
</script>
<!-- <style scoped lang="scss">
.base-table :deep(.el-button + .el-button) {
  margin-left: 6px;
}
.base-table :deep(.table-header-cell) .cell {
  color: var(--el-text-color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.table-pagination {
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  background-color: var(--zk-bg-color-overlay);
  padding: 13px 15px;
}
</style> -->
