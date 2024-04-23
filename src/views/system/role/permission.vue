<template>
  <el-dialog :model-value="state.open" :width="750" :height="500" @close="state.open = false">
    <template #header>
      <div class="title">角色授权</div>
    </template>
    <div>
      <el-scrollbar class="zk-table-form-scrollbar">
        <el-tree ref="treeRef" :data="state.menus" node-key="id" :props="defaultProps" default-expand-all
          :v-loading="state.loading">
          <template #default="{ node, data }">
            <div class="flex justify-between w-full">
              <div><el-checkbox v-model="data.checked" @click.stop="menuClick(data)"></el-checkbox>{{ node.label }}
              </div>
              <div class="flex px-2">
                <el-checkbox v-for="(b, i) in data.buttons" :key="i" class="mr-1" v-model="b.checked"
                  @change="menuButtonCheck(b)">{{ b.menuName
                  }}</el-checkbox>
              </div>
            </div>
          </template>
        </el-tree>
      </el-scrollbar>
    </div>
    <template #footer>
      <div>
        <el-button @click="state.open = false">取消</el-button>
        <el-button @click="saveAction" type="primary" :loading="state.loading">保存</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { reactive, watch, onMounted, ref } from 'vue'
// import { useApi } from '@/common/utils/api'
import { Success } from '@/utils/dlgs'
import request from '@/axios'

const treeRef = ref(null)

const defaultProps = {
  children: 'children',
  label: 'menuName',
}

const state = reactive({
  open: false,
  roleId: '',
  roleName: '',
  menus: [],
  loading: false,
})

const openRoleMenu = async (roleId: string, roleName: string) => {
  state.open = true
  state.roleId = roleId
  state.roleName = roleName
  loadRoleMenu()
}

const loadRoleMenu = async () => {
  state.loading = true
  request
    .get({ url: '/system/rolemenu/list', params: { paging: false, roleId: state.roleId } })
    .then(res => {
      // treeRef.value.setCheckedKeys(res.data.map(m => m.menuId))
      checkAllMenus(res.data.map(m => m.menuId))
      console.log(state.menus)
      state.loading = false
    })
    .catch(() => (state.loading = false))
}

const getCheckedMenuIds = (menus?: any) => {
  const isRoot = (menus == undefined)

  if (isRoot) {
    menus = state.menus
  }

  const ids: string[] = []

  menus.forEach(m => {
    if (m.checked) {
      ids.push(m.id)
      if (m.children) {
        ids.push(...getCheckedMenuIds(m.children))
      }
      if (m.buttons) {
        ids.push(...getCheckedMenuIds(m.buttons))
      }
    }
  })


  return ids
}



const saveAction = async () => {
  state.loading = true
  // console.log('menu id:',node.id, 'self checked:',self,'children checked:', children)
  // console.log(treeRef.value.getCheckedNodes())
  request
    .post(
      {
        url: `/system/rolemenu/${state.roleId}`, data: getCheckedMenuIds()
      }
    )
    .then(res => {
      state.open = false
      state.loading = false
      Success(`角色 [${state.roleName}] 的授权已更新`)
    })
    .catch(() => (state.loading = false))
}

const processMenu = (menu: any) => {
  for (let j = 0; j < menu.length; j++) {
    // 无需授权或者隐藏的菜单不用展示出来
    const node = menu[j]
    if ((node.visible != 0 || node.perms == '') && (!node.children || node.children.length == 0)) {
      // 删除
      menu.splice(j, 1)
      j--
    } else if (node.children) {
      node.buttons = []
      for (let i = 0; i < node.children.length; i++) {
        node.children[i].parent = node
        // 如果子菜单是按钮，则加入到按钮中
        if (node.children[i].menuType == 'F') {
          node.buttons.push(node.children[i])
          //删除子菜单
          node.children.splice(i, 1)
          i--
        }
      }
      // 处理其余子菜单
      processMenu(node.children)
    }
  }
}

const checkParent = (node: any) => {
  if (node.parent && !node.parent.checked) {
    node.parent.checked = true
    checkParent(node.parent)
  }
}

const checkAllMenus = (checkedMenus: string[], menus?: any) => {
  if (!menus) {
    console.log('set check menus:', checkedMenus)
    menus = state.menus
  }
  if (!menus) return
  menus.forEach(m => {
    if (checkedMenus.includes(m.id)) {
      // console.log('check menu:', m.menuName)
      m.checked = true
      checkParent(m)
    } else {
      m.checked = false
    }
    if (m.children) {
      checkAllMenus(checkedMenus, m.children)
    }
    if (m.buttons) {
      checkAllMenus(checkedMenus, m.buttons)
    }
  })
}

const menuButtonCheck = async (button: any) => {
  if (button.checked) {
    // 选中上级菜单
    // treeRef.value.setChecked(button.parentId, true, false)
    checkParent(button)
  }
}

const menuClick = async (menu: any) => {
  if (menu.buttons) {
    menu.buttons.forEach(b => (b.checked = !menu.checked))
  }
  if (menu.children) {
    checkChildren(menu.children, !menu.checked)
  }
  if (!menu.checked) {
    checkParent(menu)
  }
}

const checkChildren = async (children: any, checked: boolean) => {
  children.forEach(c => {
    if (c.buttons) {
      c.buttons.forEach(b => (b.checked = checked))
    }
    c.checked = checked
    if (c.children) {
      checkChildren(c.children, checked)
    }
  })
}

onMounted(() => {
  // 加载菜单树
  request.get({ url: '/system/menu/tree',params:{status:0} }).then(res => {
    // 处理数据
    processMenu(res.data)
    // console.log(res.data)
    state.menus = res.data
  })
})

defineExpose({ openRoleMenu })
</script>

<style scoped>
.zk-table-form-scrollbar {
  height: 350px;
  overflow: auto;
}

.el-checkbox {
  margin-right: 5px !important;
}
</style>
