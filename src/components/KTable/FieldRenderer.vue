<template>
  <!-- Icon -->
  <Icon class="zk-icon-dark" v-if="state.renderer == 'icon'" :icon="getIcon(field)" />

  <!-- switch bind=true -->
  <el-switch v-if="state.renderer == 'switch' && getProp(column, 'renderer.options.bind', false)"
    @change="onFieldChanged" v-model="props.row[props.column.prop]" :loading="row.loading"
    :active-value="options?.active || '0'" :inactive-value="options.inactive || '1'"
    :before-change="getProp(column, 'renderer.options.beforeChange', null)"
    :disabled="!execProp(column, 'renderer.options.isEnable', true, row)" />
  <!-- switch bind=false -->
  <el-switch v-if="state.renderer == 'switch' && !getProp(column, 'renderer.options.bind', false)"
    @change="onFieldChanged" :model-value="field" :loading="row.loading" :active-value="options.active || '0'"
    :inactive-value="options.inactive || '1'" :before-change="getProp(column, 'renderer.options.beforeChange', null)"
    :disabled="!hasPermissions(getProp(column, 'renderer.options.permissions', true)) || !execProp(column, 'renderer.options.isEnable', true, row)" />
  <span v-if="state.renderer == 'switch' && options.labels" style="margin-left: 5px">
    {{ options.labels[field] || '' }}
  </span>

  <!-- image -->
  <div v-if="state.renderer == 'image' && field" class="zk-render-image">
    <!-- <el-image :hide-on-click-modal="true" :preview-teleported="true" :preview-src-list="[fullUrl(field)]"
      :src="fullUrl(field)"></el-image> -->
  </div>

  <!-- images -->
  <div v-if="state.renderer == 'images'" class="zk-render-image">
    <!-- <template v-if="Array.isArray(field) && field.length">
      <el-image v-for="(item, idx) in field" :key="idx" :initial-index="idx" :preview-teleported="true"
        :preview-src-list="arrayFullUrl(field)" class="images-item" :src="fullUrl(item)"
        :hide-on-click-modal="true"></el-image>
    </template> -->
  </div>

  <!-- filter -->
  <div v-if="state.renderer == 'filter'">
    {{ execProp(options, 'filter', field, field, row) }}
  </div>

  <!-- tag -->
  <div v-if="state.renderer == 'tag' && field !== ''">
    <el-tag :type="options.tagType ? options.tagType[field] ?? 'success' : 'success'"
      :effect="options.tagEffect ?? 'light'" :size="options.tagSize ?? 'default'">
      {{ options.tagLabel ? options.tagLabel[field] ?? field : field }}
    </el-tag>
  </div>

  <!-- tags -->
  <div v-if="state.renderer == 'tags'">
    <!-- <template v-if="Array.isArray(field)">
      <template v-for="(tag, idx) in field" :key="idx">
        <el-tag v-if="tag" class="m-10" :type="getTagType(tag, field.custom)" :effect="field.effect ?? 'light'"
          :size="field.size ?? 'default'">
          {{ field.replaceValue ? field.replaceValue[tag] ?? tag : tag }}
        </el-tag>
      </template>
    </template>
    <template v-else>
      <el-tag class="m-10" v-if="field !== ''" :type="getTagType(field, field.custom)" :effect="field.effect ?? 'light'"
        :size="field.size ?? 'default'">
        {{ field.replaceValue ? field.replaceValue[field] ?? field : field }}
      </el-tag>
    </template> -->
  </div>

  <!-- dict 字典数据 -->
  <div v-if="state.renderer == 'dict'">
    {{ row['$' + column.prop] }}
  </div>

  <!-- url -->
  <div v-if="state.renderer == 'url' && field">
    <!-- <el-input :model-value="field" :placeholder="t('Link address')">
      <template #append>
        <el-button
          @click="typeof field.click == 'function' ? field.click(row, field, field, column, index) : openUrl(field, field)">
          <Icon :color="'#606266'" name="el-icon-Position" />
        </el-button>
      </template>
    </el-input> -->
  </div>

  <!-- datetime -->
  <div v-if="state.renderer == 'datetime'">
    <!-- {{ !field ? '-' : timeFormat(field, state.options.format ?? undefined) }} -->
  </div>

  <!-- timestamp -->
  <div v-if="state.renderer == 'timestamp'">
    {{ !field ? '-' : timestampFormat(field, options?.format) }}
  </div>

  <!-- color -->
  <div v-if="state.renderer == 'color'">
    <div :style="{ background: field }" class="zk-render-color"></div>
  </div>

  <!-- router 路由 -->
  <div v-if="state.renderer == 'router'">
    <el-link @click="routerClick(props.row)" type="primary">{{ field }}</el-link>
  </div>

  <!-- link -->
  <div v-if="state.renderer == 'link'">
    <el-link @click="execProp(props.column, 'renderer.options.action', '', props.row)" type="primary">{{ field
      }}</el-link>
  </div>

  <!-- text-input -->
  <div v-if="state.renderer == 'text-input'">
    <el-input v-model="props.row[props.column.prop]" @change="onFieldChanged"
      :disabled="!hasPermissions(getProp(props.column, 'renderer.options.permissions', true))" />
  </div>

  <!-- number-input -->
  <div v-if="state.renderer == 'number-input'">
    <el-input-number v-model="props.row[props.column.prop]" @change="onFieldChanged" class="max-w-full"
      :disabled="!hasPermissions(getProp(props.column, 'renderer.options.permissions', true))" />
  </div>

  <!-- customTemplate 自定义模板 -->
  <div v-if="state.renderer == 'customTemplate'"
    v-html="field.customTemplate ? field.customTemplate(row, field, field, column, index) : ''"></div>

  <!-- 自定义组件/函数渲染 -->
  <!-- <component v-if="state.renderer == 'customRender'" :is="field.customRender" :renderRow="row" :renderField="field"
    :renderValue="field" :renderColumn="column" :renderIndex="index" /> -->

  <!-- 操作按钮 -->
  <div v-if="state.renderer == 'buttons' && options.buttons">
    <template v-for="(btn, idx) in options.buttons" :key="idx">
      <!-- <template v-if="btn.isVisible ? btn.isVisible(props.row) : true"> -->
      <!-- <el-tooltip :content="btn.label || btn.type" placement="top"> -->
      <el-button @click="onButtonClick(btn)" class="table-operate" :type="btn.type ?? 'default'"
        :disabled="btn.isEnable && !btn.isEnable(row, field)" v-bind="btn.attr" link
        v-if="btn.isVisible ? btn.isVisible(props.row) : true" v-hasPermi="btn.permissions">
        <Icon :icon="btn.icon" />
        <!-- <div v-if="btn.label" class="table-operate-text">{{ btn.label }}</div> -->
      </el-button>
      <!-- </el-tooltip> -->
      <!-- </template> -->
    </template>
  </div>
</template>
<script setup lang="ts">
import { onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { timestampFormat } from '@/utils/time'
import { useDicts } from '@/utils/dict'
import { getProp, execProp } from '@/utils/common'
import { Error } from '@/utils/dlgs'
import { KTableColumnProps } from './types'
import { hasPermissions } from '@/utils/permission'

// const props = defineProps(['row', 'field', 'column', 'options'])
const props = defineProps<{
  row: any
  field: any
  column: KTableColumnProps
  options?: any
}>()

const router = useRouter()

const state = reactive({
  renderer: '',
  options: {},
})

const getIcon = value => {
  return value || props.options?.defaultIcon || ''
  // if (value && value != '') return value
  // if (props.column.renderer.options && props.column.renderer.options.default) return props.column.renderer.options.default
  // return ''
}

const getTagType = value => {
  let tt = ''
  if (props.options?.tagType) {
    tt = props.options?.tagType[value]
  }
  return tt || 'success'
}

const routerClick = row => {
  const pathOpt = getProp(props.column, 'renderer.options.path', null)
  if (!pathOpt) return
  let path = ''
  if (typeof pathOpt == 'function') { path = pathOpt(row) }
  else { path = props.options?.path }
  // console.log('go to ', path)
  if (!path)
    return
  router.push(path)
}

const onButtonClick = btn => {
  if (typeof btn.action == 'function') {
    btn.action(props.row)
  } else {
    Error('按钮未配置 action')
  }
}

const onFieldChanged = item => {
  if (typeof props.column.changed === 'function') {
    props.column.changed(props.row, props.field)
  }
}

onMounted(() => {
  state.renderer = getProp(props.column, 'renderer.type', '')
  state.options = getProp(props.column, 'renderer.options', {})
})
</script>