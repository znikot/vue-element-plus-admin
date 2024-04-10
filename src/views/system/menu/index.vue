<template>
    <div class="default-main zk-table-box">
        <BaseTable :config="tableConfig" />
        <BaseForm :config="formConfig" />
    </div>
</template>
<script setup>
import { onMounted, reactive } from 'vue'
import { useApi } from '@/common/utils/api'
import { Success, Error, WarningConfirm } from '@/common/utils/dlgs'
import { BaseTable } from '@/common/components/BaseTable'
import { BaseForm } from '@/common/components/BaseForm'

const menuApi = useApi({ base: '/system/menu' })

const tableConfig = reactive({
    columns: [
        // {
        //     prop: 'id',
        //     label: 'ID',
        // },
        {
            prop: 'menuName',
            label: '菜单名称',
            width: 200,
        },
        {
            prop: 'terminalType',
            label: '终端类型',
            renderer: {
                type: 'dict',
                options: {
                    dictType: 'sys_terminal_type',
                    tagLabel: {
                        1: 'WEB',
                        0: 'APP',
                    },
                },
            },
        },
        {
            prop: 'icon',
            label: '图标',
            renderer: {
                type: 'icon',
            },
        },
        {
            prop: 'menuPath',
            label: '菜单路径',
        },
        {
            prop: 'component',
            label: '菜单组件',
        },
        {
            prop: 'perms',
            label: '权限标识',
        },
        {
            prop: 'menuType',
            label: '类型',
            renderer: {
                type: 'tag',
                options: {
                    tagLabel: {
                        M: '目录',
                        C: '菜单',
                        F: '按钮',
                    },
                    tagType: {
                        M: 'success',
                        C: 'info',
                        F: 'warning',
                    },
                },
            },
        },
        {
            prop: 'status',
            label: '状态',
            changed: (row, to) => {
                let action = to == '0' ? 'disable' : 'enable'
                WarningConfirm(`确定要 ${action == 'disable' ? '禁用' : '启用'} ${row.menuName} 吗？`).then(res => {
                    tableConfig.loading = true
                    menuApi.put('/status/' + action + '/' + row.id).then(res => {
                        tableConfig.loading = false
                        if (res.code == 200) {
                            Success(`菜单 ${row.menuName} ${action == 'disable' ? '禁用' : '启用'}成功`)
                            row.status = to == '0' ? '1' : '0'
                        }
                    })
                })
            },
            renderer: {
                type: 'switch',
                options: {
                    active: '0',
                    inactive: '1',
                    labels: {
                        1: '停用',
                        0: '启用',
                    },
                },
            },
        },
        {
            prop: 'createInfo.createTime',
            label: '创建时间',
            renderer: {
                type: 'timestamp',
            },
        },
        {
            prop: 'operators',
            label: '操作',
            fixed: 'right',
            renderer: {
                type: 'buttons',
                options: {
                    buttons: [
                        {
                            type: 'primary',
                            label: '编辑',
                            icon: 'el-icon-Edit',
                            action: row => editMenu(row.id),
                        },
                        {
                            type: 'success',
                            label: '添加子菜单',
                            icon: 'el-icon-Plus',
                            isVisible: row => row.menuType != 'F' && row.status == 0,
                            action: row => {
                                addMenu(row.id)
                            },
                        },
                        {
                            type: 'danger',
                            label: '删除',
                            icon: 'el-icon-Delete',
                            action: row => deleteMenu(row.id,row.menuName),
                        },
                    ],
                },
            },
        },
    ],
    options: {
        selection: 'false',
    },
    data: [],
    buttons: [
        {
            name: 'add',
            action: () => {
                addMenu()
            },
        },
        // {
        //     type: 'edit',
        //     isEnable: ts => {
        //         return ts.selectedIds.length > 0
        //     },
        // },
        // {
        //     type: 'delete',
        //     isEnable: ts => {
        //         return ts.selectedIds.length > 0
        //     },
        // },
    ],
    loading: false,
    events: {
        onRefresh: tableStatus => {
            refreshData()
        },
    },
})

const formConfig = reactive({
    open: false,
    title: '添加/编辑菜单',
    newTitle: '添加菜单',
    editTitle: '编辑菜单',
    fields: [
        {
            prop: 'menuName',
            label: '菜单名称',
        },
        {
            prop: 'parentId',
            label: '上级菜单',
            type: 'treeSelect',
            as: 'string',
            default: '0', //默认为顶层菜单
            options: {
                treeApi: () => {
                    return menuApi.get('/treeselect')
                },
                valueField: 'id',
            },
        },
        {
            prop: 'menuType',
            label: '菜单类型',
            type: 'radio',
            default: 'C',
            options: {
                data: [
                    { label: '目录', value: 'M' },
                    { label: '菜单', value: 'C' },
                    { label: '按钮', value: 'F' },
                ],
            },
        },
        {
            prop: 'visible',
            label: '是否显示',
            type: 'radio',
            default: 0,
            options: {
                data: [
                    { label: '是', value: 0 },
                    { label: '否', value: 1 },
                ],
            },
        },
        {
            prop: 'icon',
            label: '图标',
        },
        {
            prop: 'terminalType',
            label: '终端类型',
            type: 'dict',
            default: '0',
            options: {
                dictType: 'sys_terminal_type',
            },
        },
        {
            prop: 'menuPath',
            label: '菜单路径',
            changed: data => {
                // data['component'] = data['menuPath']
            },
        },
        {
            prop: 'component',
            label: '菜单组件',
        },
        {
            prop: 'perms',
            label: '权限标识',
        },
        {
            prop: 'orderNum',
            label: '排序',
            type: 'int',
        },
    ],
    layout: [
        { menuName: 12, parentId: 12 },
        { terminalType: 12, menuType: 12 },
        { visible: 12, icon: 12 },
        { menuPath: 12, component: 12 },
        { perms: 12, orderNum: 12 },
    ],
    onSave: data => {
        let api = data.id ? menuApi.put : menuApi.post
        api('', data).then(res => {
            if (res.code == 200) {
                formConfig.open = false
                Success(`菜单${data.id ? '编辑' : '添加'}成功`)
                refreshData()
            }
        })
    },
})

const addMenu = parentId => {
    formConfig.data = {
        parentId: parentId || 0,
    }
    formConfig.open = true
}

const editMenu = id => {
    menuApi.get(`/${id}`).then(res => {
        formConfig.data = res.data
        formConfig.open = true
    })
}

const deleteMenu = (id, name) => {
    WarningConfirm(`确定要删除菜单 [${name}] 吗？`)
        .then(res => {
            if (res) {
                menuApi.delete(`/${id}`).then(res => {
                    Success(`菜单 [${name}] 已删除`)
                    refreshData()
                })
            }
        })
        .catch(() => {})
}

const refreshData = () => {
    tableConfig.loading = true
    menuApi.get('/tree').then(res => {
        tableConfig.data = res.data
        tableConfig.loading = false
    })
}

onMounted(() => {
    refreshData()
})
</script>
