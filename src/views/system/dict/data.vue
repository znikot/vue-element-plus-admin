<template>
    <div class="default-main zk-table-box">
        <BaseTable :config="table" />
        <BaseForm :config="form" />
    </div>
</template>
<script setup>
import { reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useApi } from '@/common/utils/api'
import { WarningConfirm, Success } from '@/common/utils/dlgs'
import { BaseTable } from '@/common/components/BaseTable'
import { BaseForm } from '@/common/components/BaseForm'

const dataApi = useApi({ base: '/system/dict/data' })
const route = useRoute()

const table = reactive({
    columns: [
        {
            prop: 'dictLabel',
            label: '字典标签',
        },
        {
            prop: 'dictCode',
            label: '字典编码',
        },
        {
            prop: 'dictValue',
            label: '字典值',
        },
        {
            prop: 'dictType',
            label: '字典类型',
        },
        {
            prop: 'dictSort',
            label: '字典排序',
        },
        {
            prop: 'status',
            label: '状态',
            changed: (row, to) => {
                let action = to == '0' ? 'disable' : 'enable'
                WarningConfirm(`确定要${action == 'enable' ? '启用' : '停用'}`).then(() => {
                    dataApi.put(`/status/${action}/${row.id}`).then(res => {
                        if (res.code == 200) {
                            Success(`${action == 'enable' ? '启用' : '停用'}成功`)
                            row.status = to == '0' ? '1' : '0'
                        } else {
                        }
                    })
                })
            },
            renderer: {
                type: 'switch',
                options: {
                    activeValue: 0,
                    inactiveValue: 1,
                },
            },
        },
        { prop: 'remark', label: '备注' },
        {
            prop: 'operation',
            label: '操作',
            width: 100,
            renderer: {
                type: 'buttons',
                options: {
                    buttons: [
                        { type: 'primary', icon: 'el-icon-Edit', label: '编辑', action: row => editData(row.id) },
                        { type: 'danger', icon: 'el-icon-Delete', label: '删除', action: row => deleteData([row.id], [row]) },
                    ],
                },
            },
        },
    ],
    loading: false,
    buttons: [{ name: 'add' }, { name: 'edit', isEnable: ts => ts.selectedIds.length == 1 }, { name: 'delete', isEnable: ts => ts.selectedIds.length > 0 }],
    events: {
        onRefresh: ts => {
            refreshData(ts.searchParams)
        },
        onAdd: () => addData(),
        onEdit: ts => editData(ts.selectedIds[0]),
        onDelete: ts => deleteData(ts.selectedIds, ts.selectedRows),
    },
})

const form = reactive({
    open: false,
    title: '新增/编辑字典数据',
    newTitle: '新增字典数据',
    editTitle: '编辑字典数据',
    fields: [
        { prop: 'dictLabel', label: '字典标签', rule: { required: true } },
        { prop: 'dictCode', label: '字典编码', type: 'int', rule: { required: true } },
        { prop: 'dictValue', label: '字典值', rule: { required: true } },
        { prop: 'dictSort', label: '字典排序', type: 'int', default: 0 },
    ],
    layout: [
        { dictLabel: 12, dictCode: 12 },
        { dictValue: 12, dictSort: 12 },
    ],
    onSave: data => saveData(data),
})

const state = reactive({
    dictType: '',
})

const addData = () => {
    form.data = null
    form.open = true
}

const editData = id => {
    dataApi.get(`/${id}`).then(res => {
        form.data = res.data
        form.open = true
    })
}

const deleteData = (ids, rows) => {
    WarningConfirm(`确定要删除选中的${ids.length > 1 ? ids.length + '个' : ''}字典数据吗？`)
        .then(() => {
            dataApi.delete(`/${ids.join(',')}`).then(res => {
                Success('选中字典数据已删除')
                refreshData()
            })
        })
        .catch(() => {})
}

const saveData = data => {
    data.dictType = state.dictType
    let api = data.id ? dataApi.put : dataApi.post
    api('', data).then(res => {
        if (res.code == 200) {
            Success('字典数据保存成功')
            form.open = false
            refreshData()
        }
    })
}

const refreshData = params => {
    params = params || {}
    params.dictType = state.dictType
    table.loading = true
    dataApi.get('/list', params).then(res => {
        table.loading = false
        table.data = res.data
    })
}

onMounted(() => {
    state.dictType = route.params.type
    refreshData()
})
</script>
