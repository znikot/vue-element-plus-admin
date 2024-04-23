<script setup lang="ts">
import { reactive, onMounted, toRaw } from 'vue'
import { ContentWrap } from '@/components/ContentWrap'
import { ConfigData } from './types'
import Config from './config.vue'
import { SUCCESS_CODE } from '@/constants'
import { Success } from '@/utils/dlgs'
import request from '@/axios'


const state = reactive({
  groups: <string[]>[],
  configs: <{ [key: string]: ConfigData[] }>{},
  currentGroup: <string>'',
  saving: false
})

const loadGroups = async () => {
  try {
    const res = await request.get<string[]>({ url: '/system/config/group/list' })
    state.groups = res.data

    // 加载第一个组
    if (state.groups.length > 0) {
      loadConfigByGroupName(state.groups[0])
      state.currentGroup = state.groups[0]
    }
  } finally { }
}

const loadConfigByGroupName = async (groupName: string) => {
  // 如果已经加载了这个组，则直接返回
  if (state.configs[groupName]) {
    return
  }

  try {
    const res = await request.get<ConfigData[]>({ url: `/system/config/groupName/${groupName}` })
    state.configs[groupName] = res.data
  } finally { }
}


onMounted(() => {
  // loadData()
  loadGroups()
})

const tabChanged = async (tabName: string) => {
  loadConfigByGroupName(tabName)
}

const saveConfig = async () => {
  state.saving = true

  // 过滤修改过的参数
  let changedConfigs: any[] = []
  for (const groupName in state.configs) {
    if (state.configs.hasOwnProperty(groupName)) {
      state.configs[groupName].forEach(config => {
        if (config.changed) {
          const { id, configValue } = toRaw(config)
          changedConfigs.push({ id, configValue })
        }
      })
    }
  }

  try {
    const res = await request.put({ url: '/system/config', data: changedConfigs })
    if (res.code == SUCCESS_CODE) {
      Success('参数保存成功')
    }
  } finally {
    state.saving = false
  }
}
</script>
<template>
  <ContentWrap>
    <el-tabs @tab-change="tabChanged" v-model="state.currentGroup">
      <el-tab-pane v-for="(g, i) in state.groups" :key="i" :label="g" :name="g">
        <el-row v-for="(c, j) in state.configs[g]" :key="j">
          <el-col>
            <Config :config="c" />
          </el-col>
        </el-row>
      </el-tab-pane>
    </el-tabs>
    <div class="flex justify-center">
      <el-button type="primary" @click="saveConfig" :loading="state.saving" v-hasPermi="'system:config:edit'">
        <div>保存</div>
      </el-button>
    </div>
  </ContentWrap>
</template>