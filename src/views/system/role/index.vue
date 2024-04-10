<template>
    <ContentWrap>
        <KTable :config="tableConfig" />
        <KForm :config="formConfig" />
    </ContentWrap>

    <permission :config="state.permission" />
</template>
<script setup>
import { ContentWrap } from '@/components/ContentWrap'
import { onMounted, reactive } from 'vue'
import { WarningConfirm, Success } from '@/utils/dlgs'
import { KTable } from '@/components/KTable'
import { KForm } from '@/components/KForm'
import permission from './permission.vue'
import request from '@/axios'

// const roleApi = useApi({ base: '/system/role' })

const state = reactive({
    permission: {
        open: false,
        roleId: '',
        roleName: '',
    },
})

const tableConfig = reactive({
    columns: [
        { prop: 'id', label: 'ID' },
        { prop: 'roleName', label: '角色名称' },
        { prop: 'roleKey', label: '角色编码' },
        {
            prop: 'status',
            label: '状态',
            changed: (row, to) => {
                // console.log(row, to)
                // row.status = to=='0'?'1':'0'
                let action = to == '0' ? 'disable' : 'enable'
                WarningConfirm(`确定要${action == 'disable' ? '停用' : '启用'}角色 ${row.roleName} 吗`).then(() => {
                    request.put({ url: `/system/role/status/${action}/${row.id}` }).then(res => {
                        if (res.code == 200) {
                            Success(`角色 ${row.roleName} 已成功${action == 'disable' ? '停用' : '启用'}`)
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
                    isEnable: row => {
                        return row.id != 1
                    },
                },
            },
        },
        { prop: 'remark', label: '备注' },
        { prop: 'createInfo.createTime', label: '创建时间', renderer: { type: 'timestamp' } },
        {
            prop: 'operators',
            label: '操作',
            renderer: {
                type: 'buttons',
                options: {
                    buttons: [
                        {
                            type: 'primary',
                            label: '编辑',
                            icon: 'ep:edit',
                            tip: '修改',
                            permissions: [],
                            isVisible: row => row.id != 1,
                            isEnable: row => row.id != 1,
                            action: row => editRole(row.id, row),
                        },
                        {
                            type: 'success',
                            label: '授权',
                            icon: 'ep:key',
                            permissions: [],
                            isVisible: row => row.id != 1,
                            action: row => permissionAssign(row),
                        },
                        {
                            type: 'danger',
                            label: '删除',
                            icon: 'ep:delete',
                            isVisible: row => {
                                return row.id != 1
                            },
                            action: row => {
                                WarningConfirm(`确定要删除角色 ${row.roleName} 吗？`)
                                    .then(() => {
                                        deleteRoles([row.id], [row])
                                    })
                                    .catch(() => { })
                            },
                        },
                    ],
                },
            },
        },
    ],
    data: [],
    buttons: [
        { name: 'add', align: 'left', label: '添加' },
        { name: 'edit', align: 'left', label: '编辑', isEnable: tableStatus => tableStatus.selectedIds.length == 1 },
        { name: 'delete', align: 'left', label: '删除', isEnable: tableStatus => tableStatus.selectedIds.length > 0 },
    ],
    events: {
        onRefresh: ts => refreshData(ts.searchParams),
        onAdd: () => addRole(),
        onEdit: ts => editRole(ts.selectedIds[0]),
        onDelete: ts => {
            WarningConfirm(`确定要删除选中的 ${ts.selectedIds.length} 个角色吗？`)
                .then(() => {
                    deleteRoles(ts.selectedIds, ts.selectedRows)
                })
                .catch(() => { })
        },
    },
})

const formConfig = reactive({
    open: false,
    title: '添加/编辑角色',
    newTitle: '添加角色',
    editTitle: '编辑角色',
    fields: [
        { prop: 'roleName', label: '角色名称', rule: { required: true, message: '请输入角色名称' } },
        { prop: 'roleKey', label: '角色编码', rule: { required: true, message: '请输入角色编码' } },
        { prop: 'remark', label: '备注', type: 'textarea' },
    ],
    layout: [{ roleName: 12, roleKey: 12 }, { remark: 24 }],
    onSave: data => {
        let api = data.id ? request.put : request.post
        api({ url: '/system/role', data: data }).then(res => {
            if (res.code == 200) {
                formConfig.open = false
                Success(`角色 ${data.roleName} 已成功${data.id == 0 ? '添加' : '修改'}`)
                refreshData()
            }
        })
    },
    onCancel: () => { },
})

const addRole = () => {
    formConfig.data = null
    formConfig.open = true
}

const editRole = id => {
    request.get({ url: `/system/role/${id}` }).then(res => {
        formConfig.data = res.data
        formConfig.open = true
    })
}

const deleteRoles = (ids, roles) => {
    console.log('delete roles', ids, roles)
    request.delete({ url: `/system/role/${ids.join(',')}` }).then(res => {
        if (res.code == 200) {
            Success('选中角色已删除')
            refreshData()
        }
    })
}

// 角色授权
const permissionAssign = row => {
    state.permission.roleId = row.id
    state.permission.roleName = row.roleName
    state.permission.open = true
}

const refreshData = params => {
    tableConfig.loading = true
    request.get({ url: '/system/role/list', params: params || {} }).then(res => {
        tableConfig.loading = false
        tableConfig.data = res.data
    })
}

onMounted(() => {
    refreshData()
})
</script>
