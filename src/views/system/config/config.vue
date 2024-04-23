<script setup lang="ts">
import { computed } from 'vue'
import { ConfigData } from './types'
import { hasPermissions } from '@/utils/permission'


const props = defineProps<{
  config: ConfigData
}>()

const configChanged = async () => {
  props.config.changed = true
}

// 解析选项数据，格式：[{'label':'','value':''},{'label':'','value':''}]
const labelValueOptions = computed<{ label: string, value: string }[]>(() => {
  try {
    return JSON.parse(props.config.configOptions)
  } catch (e) {
    return []
  }
})
</script>
<template>
  <el-form-item :label="props.config.configName" label-width="120">
    <el-switch v-if="props.config.configType == 'boolean'" v-model="props.config.configValue" :active-value="'true'"
      :inactive-value="'false'" @change="configChanged" :disabled="!hasPermissions('system:config:edit')" />
    <el-select v-else-if="props.config.configType == 'select'" v-model="props.config.configValue"
      @change="configChanged" :disabled="!hasPermissions('system:config:edit')">
      <el-option v-for="(item, i) in labelValueOptions" :key="i" :label="item.label" :value="item.value" />
    </el-select>
    <el-select v-else-if="props.config.configType == 'tags'" v-model="props.config.configValue"
      :disabled="!hasPermissions('system:config:edit')">
    </el-select>
    <el-input v-else v-model="props.config.configValue" @change="configChanged"
      :disabled="!hasPermissions('system:config:edit')" />
  </el-form-item>
</template>