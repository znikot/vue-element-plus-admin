<template>
  <el-form-item :label="props.field.label" :prop="props.field.prop" @change="onChange">
    <!-- 单行文本框 -->
    <template v-if="!props.field.type || props.field.type == 'text' || props.field.type == 'string'">
      <el-input v-model="props.value[props.field.prop]" clearable />
    </template>

    <!-- 多行文本框 -->
    <template v-if="props.field.type == 'textarea'">
      <el-input v-model="props.value[props.field.prop]" type="textarea" />
    </template>

    <!-- 数字 -->
    <template v-if="props.field.type == 'number' || props.field.type == 'int'">
      <el-input-number v-model="props.value[props.field.prop]" controls-position="right" />
    </template>

    <!-- 字典数据（4个及以下选项使用radio） -->
    <template v-if="props.field.type == 'dict' && getProp(props.dicts[props.field.options.dictType], 'count', 0) <= 4 && !getProp(props.field, 'options.multiple', false)
    ">
      <el-radio-group v-model="props.value[props.field.prop]">
        <el-radio v-for="(dict, idx) in getProp(props.dicts, `${props.field.options.dictType}.items`, [])"
          :label="convertDictValue(dict.dictValue)" :key="idx">
          {{ dict.dictLabel }}
        </el-radio>
      </el-radio-group>
    </template>

    <!-- 字典数据（5个及以上使用select） -->
    <template v-if="props.field.type == 'dict' && (getProp(props.dicts[props.field.options.dictType], 'count', 0) >= 5 || getProp(props.field, 'options.multiple', false))
    ">
      <el-select v-model="props.value[props.field.prop]" clearable
        :multiple="getProp(props.field, 'options.multiple', false)">
        <el-option v-for="(dict, idx) in getProp(props.dicts, `${props.field.options.dictType}.items`, [])" :key="idx"
          :label="dict.dictLabel" :value="dict.dictValue"></el-option>
      </el-select>
    </template>

    <!-- 密码 -->
    <template v-if="props.field.type == 'password'">
      <el-input v-model="props.value[props.field.prop]" type="password" />
    </template>

    <!-- 下拉选项，选项支持从api获取 -->
    <template v-if="props.field.type == 'select'">
      <el-select v-model="props.value[props.field.prop]" @change="onChange" clearable
        :multiple="getProp(props.field, 'options.multiple', false)">
        <el-option v-for="(item, idx) in state.optionData" :key="idx" :label="item.label" :value="item.value"
          :disabled="execProp(props.field, 'options.optionEnable', false, item, props.value)" />
      </el-select>
    </template>

    <!-- 单选框，选项支持从api获取 -->
    <template v-if="props.field.type == 'radio'">
      <el-radio-group v-model="props.value[props.field.prop]">
        <el-radio v-for="(item, idx) in state.optionData" :key="idx" :label="item.value">{{ item.label }}</el-radio>
      </el-radio-group>
    </template>

    <!-- 多选框，选项支持从 api 获取 -->
    <template v-if="props.field.type == 'checkbox'">
      <el-checkbox-group v-model="props.value[props.field.prop]">
        <el-checkbox v-for="(item, idx) in state.optionData" :key="idx" :label="item.value"
          :disabled="!execProp(props.field, 'options.optionEnable', true, item, props.value)">
          {{ item.label }}
        </el-checkbox>
      </el-checkbox-group>
    </template>

    <!-- 树形选择 -->
    <template v-if="props.field.type == 'treeSelect'">
      <el-tree-select v-model="props.value[props.field.prop]" :data="state.treeData" :render-after-expand="false"
        :default-expand-all="true" check-strictly @node-click="onTreeNodeClick"></el-tree-select>
      <el-tooltip content="刷新数据" placement="top">
        <el-button @click="loadTreeData(props.field)" link>
          <icon icon="ionicons5:reload" />
        </el-button>
      </el-tooltip>
    </template>

    <!-- 日期 -->
    <template v-if="props.field.type == 'date'">
      <el-date-picker v-model="props.value[props.field.prop]"></el-date-picker>
    </template>

    <!-- 日期+时间 -->
    <template v-if="props.field.type == 'dateTime'">
      <el-date-picker v-model="props.value[props.field.prop]" type="datetime" placeholder="请选择日期时间" />
    </template>

    <!-- 时间 -->
    <template v-if="props.field.type == 'time'">
      <el-time-picker v-model="props.value[props.field.prop]" arrow-control placeholder="请选择时间" />
    </template>

    <!-- 日期范围 -->
    <template v-if="props.field.type == 'dateRange'">
      <el-date-picker v-model="props.value[props.field.prop]" type="daterange" unlink-panels range-separator="~"
        start-placeholder="开始日期" end-placeholder="截至日期" />
    </template>

    <!-- 图片+上传 -->
    <template v-if="props.field.type == 'image'">
      <el-upload class="image-uploader" action=""
        :show-file-list="getProp(props.field, 'options.multiple', false)" :on-success="onImageUploadSuccess"
        :before-upload="beforeImageUpload" :with-credentials="true" :headers="getUploadHeaders()"
        list-type="picture-card">
        <img v-if="state.imageUrl && !getProp(props.field, 'options.multiple', false)" :src="state.imageUrl"
          class="image" width="100" height="100" />
        <Icon v-else class="image-uploader-icon" icon="carbon:plus" />
      </el-upload>
    </template>

    <!-- 文件上传 -->
    <template v-if="props.field.type == 'file'"></template>
  </el-form-item>
</template>
<script setup>
import { onMounted, reactive, onActivated, onUnmounted, inject } from 'vue'
import { convert, getProp, execProp } from '@/utils/common'
// import { useApp } from '@/common/utils/app'
// import AppConfig from '@/common/interface/config'
import { useEventBus } from '@/hooks/event/useEventBus'

// const app = useApp()
const props = defineProps(['field', 'dicts', 'value'])

// const $event = inject('$EventBus')
const $event = useEventBus()

const state = reactive({
  treeData: [],
  optionData: [], //select 和 radio 共用
  imageUrl: '', // 图片URL，上传单个图片时生效
})

const convertDictValue = value => {
  if (props.field.as) {
    return convert(value, props.field.as)
  } else {
    return value
  }
}

const loadTreeData = field => {
  // 清空树数据
  state.treeData.splice(0)
  let parseNodeFunc = src => {
    let target = {
      label: src[field.options.labelField || 'label'],
      value: src[field.options.valueField || 'value'],
      children: [],
    }
    if (src.children) {
      src.children.forEach(child => {
        target.children.push(parseNodeFunc(child))
      })
    }
    return target
  }
  if (typeof field.options.api == 'function') {
    field.options.api().then(res => {
      res.data.forEach(item => {
        state.treeData.push(parseNodeFunc(item))
      })
    })
  }
}

const loadOptionData = (field, val) => {
  state.optionData.splice(0)
  //添加静态数据，静态数据必须是 {label:'',value:''} 的格式
  if (field.options.data) {
    if (typeof field.options.data == 'function') {
      field.options.data().forEach(item => {
        state.optionData.push(item)
      })
    } else {
      field.options.data.forEach(item => {
        state.optionData.push(item)
      })
    }
  }
  if (typeof field.options.optionApi == 'function') {
    const parseItemFunc = src => {
      return {
        label: typeof field.options.labelField === 'function' ? field.options.labelField(src) : src[field.options.labelField || 'label'],
        value: typeof field.options.valueField === 'function' ? field.options.valueField(src) : src[field.options.valueField || 'value'],
        src: src,
      }
    }
    field.options.optionApi(val).then(res => {
      res.data.forEach(item => {
        state.optionData.push(parseItemFunc(item))
      })
    })
  }
}

const onTreeNodeClick = node => {
  setLabelTo(node.label)
}

const setLabelTo = label => {
  if ((props.field.type == 'select' || props.field.type == 'radio' || props.field.type == 'checkbox') && props.field.options.setLabelTo) {
    if (!label) {
      for (let item of state.optionData) {
        if (item.value == props.value[props.field.prop]) {
          label = item.label
          break
        }
      }
    }
    // 将select、treeselect 的标签设置到表单属性中
    if (label) props.value[props.field.options.setLabelTo] = label
  }
}

const onChange = () => {
  //看field配置有没有changed函数
  if (typeof props.field.changed === 'function') {
    props.field.changed(props.value)
  }
  // 触发字段变化事件
  $event.emit('form-field-change-' + props.field.prop, props.value)
  setLabelTo()
}

const getUploadHeaders = () => {
  let h = {}
  // h[AppConfig.API_HEADER_TOKEN_KEY] = app.getToken()
  return h
}
const onImageUploadSuccess = (res, file) => {
  state.imageUrl = URL.createObjectURL(file.raw)
}

const beforeImageUpload = file => { }

onActivated(() => {
  // 在激活时，点击第一个树节点?
  if (props.field.type == 'treeSelect') {
    if (!props.value[props.field.prop] && state.treeData.length > 0) {
      onTreeNodeClick(state.treeData[0])
    }
  }
})

onUnmounted(() => {
  $event.off('form-reset')
  $event.off('form-submit')

  let dependField = getProp(props.field, 'options.depend', '')
  if (dependField != '') {
    $event.off('form-field-change-' + dependField)
  }
})

onMounted(() => {
  // console.log(import.meta.env.VITE_UPLOAD_PATH)
  // 看看有没有依赖的字段
  let dependField = getProp(props.field, 'options.depend', '')

  // 根据字段控件类型进行相应的初始化
  if (props.field.type == 'treeSelect') {
    //加载树结构数据
    loadTreeData(props.field)
    if (dependField != '') {
      $event.on('form-field-change-' + dependField, () => {
        // delete(props.value[props.field.prop]) // 清空选项
        loadTreeData(props.field)
      })
    }
  }

  if (props.field.type == 'select' || props.field.type == 'radio' || props.field.type == 'checkbox') {
    //加载选项数据
    loadOptionData(props.field)
    if (dependField != '') {
      $event.on('form-field-change-' + dependField, val => {
        delete props.value[props.field.prop] // 清空选项
        loadOptionData(props.field, val)
      })
    }
  }

  // 监听事件
  $event.on('form-reset', () => {
    // onChange()
    state.imageUrl = ''
  })
  $event.on('form-submit', () => {
    // onChange()
    setLabelTo()
  })
})
</script>
