<template>
    <ContentWrap>
        <KTable :config="tableConfig" />
    </ContentWrap>
    <KForm :config="formConfig" />
</template>
<script setup lang="ts">
import { onMounted, reactive } from 'vue'
import { ContentWrap } from '@/components/ContentWrap'
// import { useApi } from '@/common/utils/api'
import { WarningConfirm, Success } from '@/utils/dlgs'
import { KTable } from '@/components/KTable'
import { KTableProps } from '@/components/KTable/types'
import { KForm } from '@/components/KForm'
import request from '@/axios'
import { KFormProps } from '@/components/KForm/types'

const tableConfig = reactive(<KTableProps>{
    columns: [
        {
            prop: 'deptName',
            label: '部门名称',
        },
        {
            prop: 'leader',
            label: '部门领导',
        },
        {
            prop: 'phone',
            label: '联系电话',
        },
        {
            prop: 'email',
            label: '电子邮箱',
        },
        {
            prop: 'status',
            label: '状态',
            changed: (row, to) => {
                let action = to == '0' ? 'disable' : 'enable'
                WarningConfirm(`确定要${action == 'disable' ? '停用' : '启用'}部门 ${row.deptName} 吗？`)
                    .then(() => {
                        request.put({ url: '/system/dept/status/' + action + '/' + row.id }).then(res => {
                            if (res.code == 200) {
                                row.status = to == '0' ? '1' : '0'
                                Success(`部门 ${row.deptName} 已${action == 'disable' ? '停用' : '启用'}`)
                            }
                        })
                    })
                    .catch(() => { })
            },
            renderer: {
                type: 'switch',
                options: {
                    active: '0',
                    inactive: '1',
                    permissions: 'system:dept:status',
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
            renderer: {
                type: 'buttons',
                options: {
                    buttons: [
                        {
                            type: 'primary',
                            label: '编辑',
                            icon: 'ep:edit', permissions: 'system:dept:edit',
                            action: row => {
                                editDept(row.id)
                            },
                        },
                        {
                            type: 'success',
                            label: '添加',
                            icon: 'ep:plus', permissions: 'system:dept:create',
                            isVisible: row => row.status == 0,
                            action: row => {
                                addDept(row.id)
                            },
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
        { name: 'add', permissions: 'system:dept:create' },
        // {
        //     name: 'edit',
        //     isEnable: ts => {
        //         return ts.selectedIds.length == 1
        //     },
        // },
        // {
        //     name: 'delete',
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
        onAdd: () => {
            addDept()
        },
    },
})

const formConfig = reactive<KFormProps>({
    open: false,
    title: '添加/编辑部门',
    newTitle: '添加部门',
    editTitle: '编辑部门',
    labelWidth: '80',
    fields: [
        {
            prop: 'parentId',
            label: '上级部门',
            type: 'treeSelect',
            options: {
                api: () => {
                    return request.get({ url: '/system/dept/treeselect' })
                },
                valueField: 'id',
                // labelField: 'deptName',
                setLabelTo: 'deptName',
            },
            rule: { type: 'int', required: false },
        },
        { prop: 'deptName', label: '部门名称', rule: { type: 'string', required: true } },
        { prop: 'orderNum', label: '排序', type: 'int', default: 1, rule: { type: 'int', required: true } },
        { prop: 'leader', label: '部门领导', rule: { type: 'string', required: true } },
        { prop: 'phone', label: '联系电话' },
        { prop: 'email', label: '邮箱', rule: { type: 'string', required: false } },
        { prop: 'remark', label: '备注' },
    ],
    layout: [{ deptName: 12, parentId: 12 }, { leader: 12, orderNum: 12 }, { phone: 12, email: 12 }, { remark: 24 }],
    onSubmit: data => {
        let api = data.id ? request.put : request.post
        api({ url: '/system/dept', data: data }).then(res => {
            if (res.code == 200) {
                formConfig.open = false
                refreshData()
            } else {
                console.error(res.message)
            }
        })
    },
    onCancel: () => { },
})

const refreshData = () => {
    tableConfig.loading = true
    request.get({ url: '/system/dept/tree' }).then(res => {
        tableConfig.data = res.data
        tableConfig.loading = false
    })
}

const addDept = (parentId?) => {
    formConfig.data = {
        parentId: parentId || 0,
    }
    formConfig.open = true
}
const editDept = id => {
    request.get({ url: `/system/dept/${id}` }).then(res => {
        formConfig.data = res.data
        formConfig.open = true
    })
}
const deleteDept = (id, row) => { }

onMounted(() => {
    refreshData()
})
</script>
