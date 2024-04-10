<template>
  <div v-bind="$attrs" class="flex justify-between relative px-1 py-1">
    <div class="flex gap-x-2">
      <!-- <el-tooltip v-for="btn in leftButtons" :key="btn.name" placement="top" :content="btn.tip ?? 'reload table data'"> -->
      <div v-for="btn in leftButtons" :key="btn.name">
        <el-button class="table-header-button" v-if="btn.name == 'add'" type="default" @click="buttonAction(btn)"
          size="small" :disabled="buttonDisabled(btn)">
          <Icon icon="ep:plus" />
          <div>{{ btn.label || '添加' }}</div>
        </el-button>
        <el-button class="table-header-button" v-if="btn.name == 'edit'" type="default" @click="buttonAction(btn)"
          size="small" :disabled="buttonDisabled(btn)">
          <Icon icon="ep:edit" />
          <div>{{ btn.label || '编辑' }}</div>
        </el-button>
        <el-button class="table-header-button" v-if="btn.name == 'delete'" type="danger" @click="buttonAction(btn)"
          size="small" :disabled="buttonDisabled(btn)">
          <Icon icon="ep:delete" />
          <div>{{ btn.label || '删除' }}</div>
        </el-button>
        <el-button class="table-header-button" v-if="btn.name == 'export'" type="success" @click="buttonAction(btn)"
          size="small" :disabled="buttonDisabled(btn)">
          <Icon icon="ph:export" />
          <div>{{ btn.label || '导出' }}</div>
        </el-button>
        <!-- <el-upload
        v-if="btn.name == 'import'"
        :show-file-list="false"
        :action="AppConfig.API_FILE_UPLOAD"
        :headers="getUploadHeaders()"
        :on-progress="() => (state.fullscreenLoading = true)"
        :on-success="onUploadSuccess"
        accept=".xls,.xlsx,.csv"
      >
        <el-button class="table-header-button" type="default" size="small" :disabled="buttonDisabled(btn)" v-loading.fullscreen.lock="state.fullscreenLoading">
          <Icon name="el-icon-Upload" />
          <div>{{ btn.label || '导入' }}</div>
        </el-button>
      </el-upload> -->
        <el-button class="table-header-button" v-if="!builtinButtons.includes(btn.name)" :type="btn.type || 'default'"
          @click="buttonAction(btn)" size="small" :disabled="buttonDisabled(btn)">
          <Icon :icon="btn.icon" :v-if="btn.icon" />
          <div :v-if="btn.label">{{ btn.label }}</div>
        </el-button>
      </div>
    </div>
    <!-- </el-tooltip> -->

    <!-- 右侧搜索框和工具按钮 -->
    <div class="table-search">
      <div class="flex gap-x-1">
        <el-button class="table-header-button" type="default" size="small"
          @click="onEvent(props.events, 'refresh', props.tableStatus)">
          <Icon icon="ep:search" />
        </el-button>
        <el-button type="default" size="small" @click="emit('reset')">
          <Icon icon="bx:reset" />
        </el-button>
        <el-dropdown :max-height="380" :hide-on-click="false" v-if="getProp(props.options, 'columnHidden', true)">
          <el-button class="table-header-button" plain size="small">
            <Icon icon="fluent-mdl2:triple-column-edit" />
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item v-for="(item, idx) in columns" :key="idx">
                <el-checkbox @change="columnVisibleChanged(item)" :checked="!item.visible" :model-value="item.visible"
                  size="small" :label="item.label" />
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
// import { debounce, auth } from '/@/utils/common'
// import ComSearch from '/@/components/table/comSearch/index.vue'
// import { useI18n } from 'vue-i18n'
import { onEvent } from './index'
import { onTableColumnShow, onTableColumnHide, loadHiddenTableColumn } from '@/utils/events'
// import { useApp } from '@/common/utils/app'
import { getProp } from '@/utils/common'
// import AppConfig from '@/common/interface/config'

// const { t } = useI18n()

const router = useRouter()
// const app = useApp()

const props = defineProps(['buttons', 'events', 'tableStatus', 'columns', 'options'])
const emit = defineEmits(['search', 'reset'])

const builtinButtons = ['refresh', 'add', 'edit', 'delete', 'import', 'export']

// const props = withDefaults(defineProps(['buttons']), {
//   buttons: () => {
//     return ['refresh', 'add', 'edit', 'delete']
//   },
//   //   quickSearchPlaceholder: '',
// })

const state = reactive({
  fullscreenLoading: false,
  quickSearch: '',
})

const leftButtons = computed(() => {
  if (props.buttons) {
    return props.buttons.filter(b => !b.align || b.align == '' || b.align == 'left')
  } else {
    return []
  }
})

const initHiddenColumns = reactive([])

const columns = computed(() => {
  // console.log('calc columns in tableheader')
  let cols = []
  for (let c of props.columns) {
    // c.visible = true
    c.visible = !initHiddenColumns.includes(c.prop)
    cols.push(c)
  }
  return cols
})

/**
 * 判断按钮是否禁用状态
 * @param {object} btn
 */
const buttonDisabled = btn => {
  if (typeof btn.isEnable == 'function') {
    return !btn.isEnable(props.tableStatus)
  } else {
    return false
  }
}

// 按钮事件
const buttonAction = btn => {
  if (typeof btn.action == 'function') {
    btn.action(props.tableStatus)
  } else {
    // 从表格事件中查找
    // for (const k in props.events) {
    //     if (k.toLowerCase() == `on${btn.type}`) {
    //         props.events[k]()
    //     }
    // }
    onEvent(props.events, btn.name, props.tableStatus)
  }
}

const columnVisibleChanged = async (col, visible) => {
  col.visible = !col.visible
  if (col.visible) {
    onTableColumnShow(router.currentRoute.value.path, col)
  } else {
    onTableColumnHide(router.currentRoute.value.path, col)
  }

  // nextTick()
}

// const enableBatchOpt = computed(() => (baTable.table.selection!.length > 0 ? true : false))

const onAction = (event, data) => {
  //   baTable.onTableHeaderAction(event, data)
}

const onSearchInput = () => {
  //   baTable.onTableHeaderAction('quick-search', { keyword: state.quickSearch })
}

const getUploadHeaders = () => {
  let h = {}
  // h[AppConfig.API_HEADER_TOKEN_KEY] = app.getToken()
  return h
}

const onUploadSuccess = (res, file) => {
  state.fullscreenLoading = false
  // 文件上传成功后，调用 onImport 事件
  onEvent(props.events, 'import', res)
}

onMounted(() => {
  // 启动的时候，先加载列的隐藏配置
  loadHiddenTableColumn(router.currentRoute.value.path).then(res => {
    if (!res.data) return
    for (let d of res.data) {
      initHiddenColumns.push(d.col)
    }

    // console.log(initHiddenColumns)
  })
})
</script>

<!-- <style scoped lang="scss">
.table-header {
  position: relative;
  overflow-y: scroll;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 100%;
  background-color: var(--zk-bg-color-overlay);
  border: 1px solid var(--zk-border-color);
  border-bottom: none;
  padding: 10px 8px;
  font-size: 14px;
  .table-header-operate-text {
    margin-left: 6px;
  }
}

.table-button {
  // display: flex;
  // align-items: left;
  // justify-content: space-between;
  margin-right: 3px;
}

.mlr-12 {
  margin-left: 12px;
}
.mlr-12 + .el-button {
  margin-left: 12px;
}
.table-search {
  display: flex;
  margin-left: auto;
  .quick-search {
    width: auto;
  }
}
.table-header-group {
  display: flex;
  // margin-left: 12px;
  margin-right: 12px;
  border: 1px solid var(--el-border-color);
  border-radius: var(--el-border-radius-base);
  overflow: hidden;
  button:focus,
  button:active {
    background-color: var(--zk-bg-color-overlay);
  }
  button:hover {
    background-color: var(--el-color-info-light-7);
  }
  .table-header-button {
    border: none;
    border-radius: 0;
  }
  .el-button + .el-button {
    margin: 0;
  }
  .right-border {
    border-right: 1px solid var(--el-border-color);
  }
}

html.dark {
  .table-header-group {
    button:focus,
    button:active {
      background-color: var(--el-color-info-dark-2);
    }
    button:hover {
      background-color: var(--el-color-info-light-7);
    }
    button {
      background-color: #898a8d;
      el-icon {
        color: white !important;
      }
    }
  }
}
</style> -->
