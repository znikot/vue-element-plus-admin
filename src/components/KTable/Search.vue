<template>
  <div class="flex items-center">
    <el-form :model="props.params" @keyup.enter="emit('search')" class="items-center">
      <el-row>
        <FormItem v-for="(field, idx) in props.config.fields" :key="idx" :field="field" :value="props.params" :dicts="state.dicts" class="ml-3"/>
        <!-- <div class="flex items-center">
          <el-button type="primary" @click="emit('search')" size="small">
            <Icon icon="el-icon-Search" />
            搜索
          </el-button>
          <el-button type="default" @click="emit('reset')" size="small">
            <Icon icon="el-icon-Close" />
            重置
          </el-button>
        </div> -->
      </el-row>
    </el-form>
  </div>
</template>
<script setup>
import { reactive, onMounted } from 'vue'
import FormItem from '../KForm/FormItem.vue'
import { useDicts } from '@/utils/dict'

const props = defineProps(['config', 'params'])
const emit = defineEmits(['search', 'reset'])

const state = reactive({
  dicts: {},
})

const initDictObjs = () => {
  let dictTypes = []
  for (let f of props.config.fields) {
    if (f.type == 'dict' && f.options && f.options.dictType) {
      dictTypes.push(f.options.dictType)
    }
  }
  if (dictTypes.length > 0) {
    useDicts(dictTypes).then(dicts => {
      state.dicts = dicts
    })
  }
}

onMounted(() => {
  // mount 时加载字典数据（如果有用到）
  initDictObjs()
})
</script>

<!-- <style scoped lang="scss">
.table-search {
  overflow: hidden;
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  background-color: var(--zk-bg-color-overlay);
  border: 1px solid var(--zk-border-color);
  border-bottom: none;
  padding: 13px 15px;
  font-size: 14px;
  .com-search-col {
    display: flex;
    align-items: center;
    padding-top: 8px;
    color: var(--el-text-color-regular);
    font-size: 13px;
  }
  .search-col-label {
    width: 33.33%;
    padding: 0 15px;
    text-align: right;
    overflow: hidden;
    white-space: nowrap;
  }
  .search-col-input {
    padding: 0 15px;
    width: 66.66%;
  }
  .search-col-input-range {
    display: flex;
    align-items: center;
    padding: 0 15px;
    width: 66.66%;
    .range-separator {
      padding: 0 5px;
    }
  }
  .el-form-item {
    margin-right: 8px;
    margin-bottom: 5px;
  }
}
:deep(.datetime-picker) {
  width: 100%;
}
.pl-20 {
  padding-left: 20px;
}
.w16 {
  width: 16.5% !important;
}
.w83 {
  width: 83.5% !important;
}

.search-button-group {
  display: flex;
  margin-top: 10px;
  margin-right: 0px;
  margin-left: auto;

  .el-button {
    margin-right: 0px;
    margin-left: 5px;
  }
}
</style> -->
