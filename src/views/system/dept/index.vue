<template>
    <div class="default-main zk-table-box">
        <BaseTable :config="tableConfig" />
        <BaseForm :config="formConfig" />
    </div>
</template>
<script setup>
import { onMounted, reactive } from 'vue'
import { useApi } from '@/common/utils/api'
import { WarningConfirm, Success } from '@/common/utils/dlgs'
import { BaseTable } from '@/common/components/BaseTable'
import { BaseForm } from '@/common/components/BaseForm'

const deptApi = useApi({ base: '/system/dept' })

const tableConfig = reactive({
    columns: [
        // {
        //     prop: 'id',
        //     label: 'ID',
        // },
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
                        deptApi.put('/status/' + action + '/' + row.id).then(res => {
                            if (res.code == 200) {
                                row.status = to == '0' ? '1' : '0'
                                Success(`部门 ${row.deptName} 已${action == 'disable' ? '停用' : '启用'}`)
                            }
                        })
                    })
                    .catch(() => {})
            },
            renderer: {
                type: 'switch',
                options: {
                    active: '0',
                    inactive: '1',
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
                            icon: 'el-icon-Edit',
                            action: row => {
                                editDept(row.id)
                            },
                        },
                        {
                            type: 'success',
                            label: '添加',
                            icon: 'el-icon-Plus',
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
        { name: 'add' },
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

const formConfig = reactive({
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
                treeApi: () => {
                    return deptApi.get('/treeselect')
                },
                valueField: 'id',
                // labelField: 'deptName',
                setLabelTo: 'deptName',
            },
            rule: { type: 'int', require: false },
        },
        { prop: 'deptName', label: '部门名称', rule: { type: 'string', require: true } },
        { prop: 'orderNum', label: '排序', type: 'int', default: 1, rule: { type: 'int', require: true } },
        { prop: 'leader', label: '部门领导', rule: { type: 'string', require: true } },
        { prop: 'phone', label: '联系电话', options: {} },
        { prop: 'email', label: '邮箱', rule: { type: 'string', require: false } },
        { prop: 'remark', label: '备注' },
    ],
    layout: [{ deptName: 12, parentId: 12 }, { leader: 12, orderNum: 12 }, { phone: 12, email: 12 }, { remark: 24 }],
    onSave: data => {
        let api = data.id ? deptApi.put : deptApi.post
        api('', data).then(res => {
            if (res.code == 200) {
                formConfig.open = false
                refreshData()
            } else {
                console.error(res.message)
            }
        })
    },
    onCancel: () => {},
})

const refreshData = () => {
    tableConfig.loading = true
    deptApi.get('/tree').then(res => {
        tableConfig.data = res.data
        tableConfig.loading = false
    })
}

const addDept = parentId => {
    formConfig.data = {
        parentId: parentId || 0,
    }
    formConfig.open = true
}
const editDept = id => {
    deptApi.get(id).then(res => {
        formConfig.data = res.data
        formConfig.open = true
    })
}
const deleteDept = (id, row) => {}

onMounted(() => {
    refreshData()
})
</script>
