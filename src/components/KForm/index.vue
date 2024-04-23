<template>
  <el-dialog class="zk-operate-dialog" :close-on-click-modal="false" :model-value="props.config.open"
    @close="props.config.open = false">
    <template #header>
      <div class="title">
        {{ getFormTitle }}
      </div>
    </template>
    <el-scrollbar class="zk-table-form-scrollbar">
      <div class="zk-operate-form" :style="'width: calc(100% - ' + (props.config.labelWidth ?? 80) / 2 + 'px)'">
        <el-form :label-width="`${props.config.labelWidth ?? 80}px`" :model="state.formData" :rules="state.rules"
          ref="formRef">
          <template v-if="state.layout.enable">
            <el-row v-for="(row, idx) in state.layout.rows" :key="idx">
              <el-col v-for="(field, idx) in row" :key="idx" :span="field.$layoutCol">
                <FormItem :field="field" :value="state.formData" :dicts="state.dicts" />
              </el-col>
            </el-row>
          </template>
          <template v-else>
            <FormItem v-for="(field, idx) in props.config.fields" :key="idx" :field="field" :value="state.formData"
              :dicts="state.dicts" />
          </template>
        </el-form>
      </div>
    </el-scrollbar>
    <template #footer>
      <div :style="'width: calc(100% - ' + (props.config.labelWidth ?? 80) / 1.8 + 'px)'">
        <el-button @click="props.config.open = false">取消</el-button>
        <el-button @click="saveAction" type="primary">保存</el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
import { onMounted, computed, reactive, watch, ref } from 'vue'
import FormItem from './FormItem.vue'
import { KFormProps, KFormFieldProps } from './types'
import { useDicts } from '@/utils/dict'
import { convert } from '@/utils/common'
import { Warn, Error } from '@/utils/dlgs'
import { useEventBus } from '@/hooks/event/useEventBus'

const props = defineProps<{ config: KFormProps }>()
const formRef = ref()

const $event = useEventBus()

const getFormTitle = computed(() => {
  if (props.config.data) {
    return props.config.editTitle || props.config.title || '编辑数据'
  } else {
    return props.config.newTitle || props.config.title || '添加数据'
  }
})

const state = reactive({
  dicts: {},
  formData: {},
  fieldAs: {},
  rules: {},
  layout: {
    enable: false,
    rows: [], // 自定义了布局
  },
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
      // console.log(dicts)
      state.dicts = dicts
    })
  }
}

/**
 * 缓存目标类型
 */
const cacheFieldAs = () => {
  for (let f of props.config.fields) {
    if (f.as) {
      // console.log(`------------- ${f.prop} as type ${f.as}`)
      state.fieldAs[f.prop] = f.as
    }
  }
}

/**
 * 处理自定义布局
 */
const analyzeLayout = () => {
  if (!props.config.layout || props.config.layout.length == 0) return

  state.layout.rows.splice(0, state.layout.rows.length)

  //
  let fieldCache = {}
  for (let idx in props.config.fields) {
    fieldCache[props.config.fields[idx].prop] = props.config.fields[idx]
  }

  //
  for (let ridx in props.config.layout) {
    let row = props.config.layout[ridx]
    let layoutRow = []
    for (let f in row) {
      fieldCache[f].$layoutCol = row[f]
      layoutRow.push(fieldCache[f])
    }
    if (layoutRow.length > 0) {
      state.layout.rows.push(layoutRow)
    }
  }
  state.layout.enable = true
  // console.log('layout rows: ', state.layout.rows)
}

/**
 * 分析校验规则
 */
const analyzeRules = () => {
  for (let field of props.config.fields) {
    if (field.rule) {
      let rule = {
        message: field.rule.message || '',
        trigger: field.rule.trigger || 'blur',
      }
      switch (typeof field.rule.required) {
        case 'boolean':
          rule.required = field.rule.required
          break
        case 'string':
          rule.required = field.rule.required.toLowerCase() == 'true'
          break
        case 'function':
          rule.required = field.rule.required(state.formData)
          break
        default:
          rule.required = false
      }
      if (rule.message == '') {
        rule.message = defaultRuleMessage(field, rule)
      }
      state.rules[field.prop] = [rule]
    }
  }
  // console.log('field rules', state.rules)
}

/**
 * 校验规则默认消息
 * @param {object} rule 校验规则
 */
const defaultRuleMessage = (field, rule) => {
  if (rule.required) return `${field.label}不能为空`
  return rule.message
}

/**
 * 更新校验规则，主要是针对函数函数部分的规则进行校验
 */
const updateRule = () => {
  for (let field of props.config.fields) {
    if (field.rule && typeof field.rule.required == 'function') {
      let rule = state.rules[field.prop][0]
      rule.required = field.rule.required(state.formData)
      if (rule.message == '') {
        rule.message = defaultRuleMessage(field, rule)
      }
    }
  }
}

const resetFormData = () => {
  // 清空表单
  for (let k in state.formData) {
    delete state.formData[k]
  }
  // 设置默认值
  for (let f of props.config.fields) {
    if (f.default != null) {
      state.formData[f.prop] = f.default
    }
  }
  // 如果有传入数据，那么复制一下数据
  if (props.config.data) {
    for (let k in props.config.data) {
      state.formData[k] = props.config.data[k]
    }
  }

  // 触发事件
  $event.emit('form-reset')
}

watch([() => props.config.open, () => props.config.layout], ([o, l]) => {
  // 重置表单数据
  if (o) {
    resetFormData()
    updateRule()
  }
  if (l) {
    analyzeLayout()
  }
  if (formRef.value) {
    formRef.value.clearValidate()
  }
})

const saveAction = async () => {
  // 触发事件
  $event.emit('form-submit')
  // 进行校验
  formRef.value.validate((ok, fields) => {
    if (ok) {
      // 校验通过
      if (typeof props.config.onSubmit == 'function') {
        // 转换类型
        for (let k in state.formData) {
          if (state.fieldAs[k]) {
            state.formData[k] = convert(state.formData[k], state.fieldAs[k])
          }
        }
        props.config.onSubmit(state.formData)
      } else {
        Error('表单的 onSave 未配置')
      }
    } else {
      // console.log(fields)
      // scrollToField(fields[0])
      Warn('请正确填写表单后再次提交')
    }
  })
}

onMounted(() => {
  // mount 时加载字典数据（如果有用到）
  initDictObjs()

  // 重置表单数据
  resetFormData()

  // 缓存目标类型
  cacheFieldAs()

  // 分析布局
  analyzeLayout()

  // 分析校验规则
  analyzeRules()
})
</script>

<style scoped>
.image-uploader .image {
  width: 100px;
  height: 100;
  display: block;
}
</style>

<style>
.image-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.image-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.image-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  text-align: center;
}
</style>
