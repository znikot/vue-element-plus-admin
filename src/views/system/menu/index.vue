<template>
    <ContentWrap>
        <KTable :config="tableConfig" />
    </ContentWrap>
    <KForm :config="formConfig" />
</template>
<script setup lang="ts">
import { onMounted, reactive } from 'vue'
import { ContentWrap } from '@/components/ContentWrap'
import { Success, WarningConfirm } from '@/utils/dlgs'
import { KTable } from '@/components/KTable'
import { KTableProps, KTableColumnProps, KTableTagRendererOption, KTableDictRendererOption, KTableSwitchRendererOption, KTableButtonsRendererOption } from '@/components/KTable/types'
import { KForm } from '@/components/KForm'
import { KFormProps, KFormTreeSelectOption } from '@/components/KForm/types'
import request from '@/axios'


const tableConfig = reactive(<KTableProps>{
    columns: <KTableColumnProps[]>[
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
                options: <KTableDictRendererOption>{
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
                options: <KTableTagRendererOption>{
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
                    request.put({ url: `/system/menu/status/${action}/${row.id}` }).then(res => {
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
                options: <KTableSwitchRendererOption>{
                    active: '0',
                    inactive: '1',
                    labels: {
                        1: '停用',
                        0: '启用',
                    },
                    permissions: ['sys:menu:status'],
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
                options: <KTableButtonsRendererOption>{
                    buttons: [
                        { type: 'primary', label: '编辑', icon: 'ep:edit', permissions: 'system:menu:edit', action: row => editMenu(row.id), },
                        {
                            type: 'success', label: '添加子菜单', icon: 'ep:plus', permissions: 'system:menu:create',
                            isVisible: row => row.menuType != 'F' && row.status == 0, action(row) { addMenu(row.id) },
                        },
                        {
                            type: 'danger', label: '删除', icon: 'ep:delete', permissions: 'system:menu:delete',
                            action: row => deleteMenu(row.id, row.menuName),
                        },
                    ],
                },
            },
        },
    ],
    options: {
        selection: 'false',
        defaultExpandAll: false,
    },
    data: [],
    buttons: [
        {
            name: 'add',
            permissions: 'system:menu:create',
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
        onRefresh: _ => {
            refreshData()
        },
    },
})

const formConfig = reactive(<KFormProps>{
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
            options: <KFormTreeSelectOption>{
                api: () => {
                    return request.get({ url: '/system/menu/treeselect' })
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
            type: 'icon'
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
        { menuPath: 12, icon: 12 },
        { component: 24 },
        { perms: 12, orderNum: 12 },
        { terminalType: 12, visible: 12 },
        { menuType: 24 },
    ],
    onSubmit: data => {
        let api = data.id ? request.put : request.post
        api({ url: '/system/menu', data: data }).then(res => {
            if (res.code == 200) {
                formConfig.open = false
                Success(`菜单${data.id ? '编辑' : '添加'}成功`)
                refreshData()
            }
        })
    },
})

const addMenu = (parentId?) => {
    formConfig.data = {
        parentId: parentId || 0,
    }
    formConfig.open = true
}

const editMenu = id => {
    request.get({ url: `/system/menu/${id}` }).then(res => {
        formConfig.data = res.data
        formConfig.open = true
    })
}

const deleteMenu = (id, name) => {
    WarningConfirm(`确定要删除菜单 [${name}] 吗？`)
        .then(res => {
            if (res) {
                request.delete({ url: `/system/menu/${id}` }).then(res => {
                    Success(`菜单 [${name}] 已删除`)
                    refreshData()
                })
            }
        })
        .catch(() => { })
}

const refreshData = () => {
    tableConfig.loading = true
    request.get({ url: '/system/menu/tree', params: { sortField: 'OrderNum', sortDirection: 'ascending' } }).then(res => {
        tableConfig.data = res.data
        tableConfig.loading = false
    })
}

onMounted(() => {
    refreshData()
})
</script>
