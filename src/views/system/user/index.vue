<template>
    <ContentWrap>
        <KTable :config="tableConfig" />
    </ContentWrap>
    <KForm :config="formConfig" />
</template>
<script setup lang="ts">
import { ContentWrap } from '@/components/ContentWrap'
import { onMounted, reactive } from 'vue'
import { WarningConfirm, Success, Error } from '@/utils/dlgs'
import { KTable } from '@/components/KTable'
import { KTableProps, KTableColumnProps, KTableButtonsRendererOption, KTableSwitchRendererOption, KTableDictRendererOption } from '@/components/KTable/types'
import { KForm } from '@/components/KForm'
import { KFormProps, KFormnSelectOptions, KFormTreeSelectOptions } from '@/components/KForm/types'
import request from '@/axios'


const tableConfig = reactive(<KTableProps>{
    columns: <KTableColumnProps[]>[
        <KTableColumnProps>{
            prop: 'id',
            label: 'ID',
        },
        {
            prop: 'avator',
            label: '头像',
            renderer: {
                type: 'image',
            },
        },
        {
            prop: 'userName',
            label: '用户名',
            sortable: 'custom',
        },
        {
            prop: 'realName',
            label: '真实姓名',
            sortable: 'custom',
            width: 100,
        },
        {
            prop: 'deptName',
            label: '部门',
        },
        {
            prop: 'phoneNumber',
            label: '电话',
            width: 120,
        },
        {
            prop: 'gender',
            label: '性别',
            width: 55,
            renderer: {
                type: 'dict',
                options: <KTableDictRendererOption>{
                    dictType: 'sys_user_sex',
                    filter: value => {
                        return value == 0 ? '男' : value == 1 ? '女' : '未知'
                    },
                },
            },
        },
        {
            prop: 'status',
            label: '状态',
            sortable: 'custom',
            changed: (row, to) => {
                let action = to == '0' ? 'disable' : 'enable'
                WarningConfirm(`确定要${action == 'disable' ? '停用' : '启用'} ${row.realName} 吗？`).then(() => {
                    request.put({ url: `/system/user/status/${action}/${row.id}` }).then(res => {
                        if (res.code == 200) {
                            row.status = to == '0' ? '1' : '0'
                            Success(`用户 ${row.realName} 已${action == 'disable' ? '停用' : '启用'}`)
                        }
                    })
                })
            },
            renderer: {
                type: 'switch',
                options: <KTableSwitchRendererOption>{
                    active: '0',
                    inactive: '1',
                    isEnable: row => {
                        return row.id != 1
                    },
                },
            },
        },
        { prop: 'createInfo.createTime', label: '创建时间', renderer: { type: 'timestamp' }, sortable: 'custom' },
        { prop: 'updateInfo.updateTime', label: '更新时间', renderer: { type: 'timestamp' }, sortable: 'custom' },
        {
            prop: 'operators',
            label: '操作',
            fixed: 'right',
            renderer: {
                type: 'buttons',
                options: <KTableButtonsRendererOption>{
                    buttons: [
                        {
                            type: 'primary',
                            label: '编辑',
                            icon: 'ep:dit',
                            tip: '修改用户信息',
                            permissions: [],
                            isVisible: row => {
                                return row.id != 1
                            },
                            action: row => {
                                editUser(row.id)
                            },
                        },
                        {
                            type: 'danger',
                            label: '删除',
                            icon: 'ep:delete',
                            tip: '修改用户信息',
                            permissions: [],
                            isVisible: row => {
                                return row.id != 1
                            },
                            action: row => {
                                WarningConfirm(`确定要删除用户 [${row.realName}] 吗？`)
                                    .then(() => {
                                        deleteUsers([row.id], [row])
                                    })
                                    .catch(() => { })
                            },
                        },
                    ],
                },
            },
        },
    ],
    options: {
        size: '',
        layout: 'auto',
    },
    data: null,
    buttons: [
        { name: 'add', label: '添加', action: _ => addUser() },
        {
            name: 'edit',
            label: '编辑',
            isEnable: ts => ts.selectedIds.length == 1 && ts.selectedIds[0] != 1,
            action: ts => {
                editUser(ts.selectedIds[0]) // 上面的isEnable控制必须有选中且选中一个
            },
        },
        {
            name: 'delete',
            label: '删除',
            isEnable: ts => ts.selectedIds.length > 1 || (ts.selectedIds.length == 1 && ts.selectedIds[0] != 1),
        },
        { name: 'import' },
        { name: 'export' },
    ],
    search: {
        fields: [
            { prop: 'userName', label: '用户名' },
            { prop: 'realName', label: '真实姓名' },
            { prop: 'phoneNumber', label: '电话' },
            {
                prop: 'status',
                label: '状态',
                type: 'select',
                options: <KFormnSelectOptions>{
                    data: [
                        { label: '启用', value: '0' },
                        { label: '停用', value: '1' },
                    ],
                    multiple: true,
                },
            },
        ],
    },
    events: {
        onRefresh: ts => {
            refreshData(ts.searchParams)
        },
        onDelete: ts => {
            WarningConfirm(`确定要删除选中的 ${ts.selectedIds.length} 个用户吗？`)
                .then(() => {
                    deleteUsers(ts.selectedIds, ts.selectedRows)
                })
                .catch(() => { })
        },
        onImport: res => {
            console.log('import response', res)
        },
    },
    loading: false,
})

const formConfig = reactive(<KFormProps>{
    open: false,
    title: '添加/编辑用户',
    newTitle: '添加用户',
    editTitle: '编辑用户',
    labelWidth: '80',
    fields: [
        {
            prop: 'deptId',
            label: '所属部门',
            type: 'treeSelect',
            options: <KFormTreeSelectOptions>{
                api: () => {
                    return request.get({ url: '/system/dept/treeselect' })
                },
                valueField: 'id',
                // labelField: 'deptName',
                setLabelTo: 'deptName',
            },
            rule: { type: 'int', required: false },
        },
        { prop: 'userName', label: '用户名', rule: { type: 'string', required: true } },
        { prop: 'realName', label: '真实姓名', rule: { type: 'string', required: true } },
        {
            prop: 'passwd',
            label: '密码',
            type: 'password',
            rule: {
                type: 'string',
                required: data => {
                    return data.id ? false : true
                },
            },
        },
        {
            prop: 'roles',
            label: '角色',
            type: 'select',
            options: { multiple: true, optionApi: () => request.get({ url: '/system/role/list', params: { paging: false } }), valueField: 'id', labelField: 'roleName' },
        },
        { prop: 'gender', label: '性别', type: 'dict', as: 'int', options: { dictType: 'sys_user_sex' } },
        { prop: 'phoneNumber', label: '电话', rule: { type: 'string', required: true } },
        { prop: 'email', label: '邮箱', rule: { type: 'string', required: false } },
        { prop: 'remark', label: '备注', type: 'textarea' },
        { prop: 'avator', label: '头像', type: 'image', options: { multiple: false } },
    ],
    layout: [{ userName: 12, deptId: 12 }, { realName: 12, gender: 12 }, { passwd: 12, roles: 12 }, { phoneNumber: 12, email: 12 }, { avator: 24 }, { remark: 24 }],
    onSubmit: (data: any) => {
        let api = data.id ? request.put : request.post
        api({ url: '/system/user', data: data }).then(res => {
            if (res.code == 200) {
                formConfig.open = false
                Success(data.id ? '用户修改成功' : `用户 ${data.realName} 已成功添加`)
                refreshData()
            } else {
                //console.error(res.message)
                Error(res.message)
            }
        })
    },
    onCancel: () => { },
})

const addUser = () => {
    // 清空数据，并且打开对话框
    formConfig.data = null
    formConfig.open = true
}

const editUser = id => {
    // 加载数据
    request.get({ url: `/system/user/${id}` }).then(res => {
        // 设置到表单数据中，然后打开表单
        formConfig.data = res.data
        formConfig.open = true
    })
}

const refreshData = (params?) => {
    tableConfig.loading = true
    request
        .get({ url: '/system/user/list', params: params })
        .then(res => {
            tableConfig.data = res.data
            tableConfig.loading = false
        })
        .catch(() => {
            tableConfig.loading = false
        })
}

const deleteUsers = (ids, _: any) => {
    request.delete({
        url: `/system/user/${ids.join(',')}`
    }).then(res => {
        if (res.code == 200) {
            Success('选中用户已删除')
            refreshData()
        }
    })
}

onMounted(() => {
    refreshData()
})
</script>
