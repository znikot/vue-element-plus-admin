<template>
  <el-dialog :model-value="props.config.open" :width="500" :height="500" @close="props.config.open = false">
    <template #header>
      <div class="title">角色授权</div>
    </template>
    <div>
      <el-scrollbar class="zk-table-form-scrollbar">
        <el-tree ref="treeRef" :data="state.menus" show-checkbox node-key="id" :props="defaultProps"
          default-expand-all />
      </el-scrollbar>
    </div>
    <template #footer>
      <div>
        <el-button @click="props.config.open = false">取消</el-button>
        <el-button @click="saveAction" type="primary" :loading="state.loading">保存</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { reactive, watch, onMounted, ref } from 'vue'
// import { useApi } from '@/common/utils/api'
import { Success } from '@/utils/dlgs'
import request from '@/axios'

const props = defineProps(['config'])
const treeRef = ref()

// const roleMenuApi = useApi('/system/rolemenu')
// const menuApi = useApi('/system/menu')

const defaultProps = {
  children: 'children',
  label: 'menuName',
}

const state = reactive({
  menus: [],
  loading: false,
})

const loadRoleMenu = async () => {
  state.loading = true
  request
    .get({ url: '/system/rolemenu/list', params: { paging: false, roleId: props.config.roleId } })
    .then(res => {
      // console.log(res)
      console.log(
        'set checked nodes: ',
        res.data.map(m => m.menuId)
      )
      treeRef.value.setCheckedKeys(res.data.map(m => m.menuId))
      state.loading = false
    })
    .catch(() => (state.loading = false))
}

const saveAction = async () => {
  state.loading = true
  // console.log('menu id:',node.id, 'self checked:',self,'children checked:', children)
  // console.log(treeRef.value.getCheckedNodes())
  request
    .post(
      {
        url: `/system/rolemenu/${props.config.roleId}`, data:
          treeRef.value.getCheckedNodes().map(n => n.id)
      }
    )
    .then(res => {
      props.config.open = false
      state.loading = false
      Success(`角色 [${props.config.roleName}] 的授权已更新`)
    })
    .catch(() => (state.loading = false))
}

watch(
  () => props.config.open,
  v => {
    // console.log(v)
    if (props.config.open) {
      loadRoleMenu()
    }
  }
)

onMounted(() => {
  // 加载菜单树
  request.get({url:'/system/menu/tree'}).then(res => {
    state.menus = res.data
  })

  // loadRoleMenu()
})
</script>

<style scoped>
.zk-table-form-scrollbar {
  height: 350px;
  overflow: auto;
}
</style>
