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

const dictApi = useApi({ base: '/system/dict/type' })

const tableConfig = reactive({
    columns: [
        {
            prop: 'id',
            label: 'ID',
        },
        {
            prop: 'dictName',
            label: '字典类型',
        },
        {
            prop: 'dictType',
            label: '类型编码',
            renderer: {
                type: 'router',
                options: {
                    path: row => `/system/dict/data/${row.dictType}`,
                },
            },
        },
        {
            prop: 'status',
            label: '状态',
            changed: (row, to) => {
                let action = to == '0' ? 'disable' : 'enable'
                WarningConfirm(`确定要${action == 'disable' ? '停用' : '启用'} ${row.dictName} 吗？`).then(() => {
                    dictApi.put('/status/' + action + '/' + row.id).then(res => {
                        if (res.code == 200) {
                            row.status = to == '0' ? '1' : '0'
                            Success(`字典类型 ${row.dictName} 已${action == 'disable' ? '停用' : '启用'}`)
                        }
                    })
                })
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
        { prop: 'remark', label: '备注' },
        {
            prop: 'updateInfo.updateTime',
            label: '更新时间',
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
                                editDictType(row.id)
                            },
                        },
                        {
                            type: 'danger',
                            label: '删除',
                            icon: 'el-icon-Delete',
                            action: row => {
                                deleteDictTypes([row.id], [row])
                            },
                        },
                    ],
                },
            },
        },
    ],
    options: {
        selection: 'true',
    },
    data: [],
    buttons: [
        { name: 'add' },
        {
            name: 'edit',
            isEnable: ts => {
                return ts.selectedIds.length == 1
            },
        },
        {
            name: 'delete',
            isEnable: ts => {
                return ts.selectedIds.length > 0
            },
        },
    ],
    loading: false,
    search: {
        fields: [
            { prop: 'dictName', label: '字典类型' },
            { prop: 'dictType', label: '类型编码' },
        ],
    },
    events: {
        onRefresh: ts => {
            refreshData(ts.searchParams)
        },
        onEdit: ts => {
            editDictType(ts.selectedIds[0])
        },
        onDelete: ts => {
            deleteDictTypes(ts.selectedIds, ts.selectedRows)
        },
        onAdd: ts => {
            addDictType()
        },
    },
})

const formConfig = reactive({
    open: false,
    title: '添加/编辑字典类型',
    newTitle: '添加字典类型',
    editTitle: '编辑字典类型',
    fields: [
        { prop: 'dictName', label: '字典类型', rule: { required: true, message: '请输入字典类型' } },
        { prop: 'dictType', label: '类型编码', rule: { required: true, message: '请输入字典类型编码' } },
        { prop: 'remark', label: '备注', type: 'textarea' },
    ],
    layout: [{ dictName: 12, dictType: 12 }, { remark: 24 }],
    onSave: data => {
        let api = data.id ? dictApi.put : dictApi.post
        api('', data).then(res => {
            if (res.code === 0) {
                formConfig.open = false
                Success(`${data.id ? '编辑' : '添加'}字典类型成功`)
                refreshData()
            }
        })
    },
})

const addDictType = () => {
    formConfig.data = null
    formConfig.open = true
}

const editDictType = id => {
    dictApi.get(`/${id}`).then(res => {
        formConfig.data = res.data
        formConfig.open = true
    })
}

const deleteDictTypes = (ids, types) => {
    let msg = ids.length > 1 ? `确定要删除选中的 ${ids.length} 个字典类型吗？` : `确定要删除字典类型 ${types[0].dictName} 吗？`
    WarningConfirm(msg)
        .then(() => {
            dictApi.delete(`/${ids.join(',')}`).then(res => {
                if (res.code === 0) {
                    Success('选中的字典类型已删除')
                    refreshData()
                }
            })
        })
        .catch(() => {})
}

const refreshData = params => {
    tableConfig.loading = true
    dictApi.get('/list', params || {}).then(res => {
        tableConfig.data = res.data
        tableConfig.loading = false
    })
}

onMounted(() => {
    refreshData()
})
</script>
