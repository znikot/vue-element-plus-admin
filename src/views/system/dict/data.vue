<template>
    <div class="default-main zk-table-box">
        <KTable :config="table" />
    </div>
</template>
<script setup lang="ts">
import { reactive, onMounted, onUnmounted, toRaw } from 'vue'
import { WarningConfirm, Success, Error } from '@/utils/dlgs'
import { KTable } from '@/components/KTable'
import { KTableProps } from '@/components/KTable/types'
import request from '@/axios'

const table = reactive(<KTableProps>{
    options: {
        columnHidden: false,
        defaultSort: { prop: 'dictSort', order: 'ascending' },
    },
    columns: [
        {
            prop: 'dictLabel',
            label: '标签',
            changed: (r, f) => fieldChanged(r, f),
            renderer: {
                type: 'text-input'
            }
        },
        {
            prop: 'dictCode',
            label: '编码',
            changed: (r, f) => fieldChanged(r, f),
            renderer: {
                type: 'text-input'
            }
        },
        {
            prop: 'dictValue',
            label: '值',
            changed: (r, f) => fieldChanged(r, f),
            renderer: {
                type: 'text-input'
            }
        },
        {
            prop: 'dictType',
            label: '类型',
            visible: false,
        },
        {
            prop: 'dictSort',
            label: '排序',
            changed: (r, f) => fieldChanged(r, f),
            renderer: {
                type: 'number-input'
            }
        },
        {
            prop: 'status',
            label: '状态',
            changed: (r, f) => fieldChanged(r, f),
            renderer: {
                type: 'switch',
                options: {
                    bind: true,
                    active: '0',
                    inactive: '1',
                },
            },
        },
        { prop: 'remark', label: '备注', renderer: { type: 'text-input' } },
        {
            prop: 'operation',
            label: '操作',
            width: 100,
            renderer: {
                type: 'buttons',
                options: {
                    buttons: [
                        { type: 'danger', icon: 'ep:delete', label: '删除', action: row => deleteData([row.id], [row]) },
                    ],
                },
            },
        },
    ],
    loading: false,
    buttons: [
        { name: 'add' },
        { name: 'delete', isEnable: ts => ts.selectedIds.length > 0 },
        { name: 'save', label: '保存', type: 'success', icon: 'ep:check', isEnable: _ => isChanged(), action: _ => saveData() },
        { name: 'cancel', label: '取消', type: 'danger', icon: 'ep:close', isEnable: _ => isChanged(), action: _ => refreshData() },
    ],
    events: {
        onRefresh: _ => { refreshData() },
        onAdd: () => addData(),
        onDelete: ts => deleteData(ts.selectedIds, ts.selectedRows),
    },
})

const state = reactive({
    dictType: '',
    changed: false,
    deleteIds: []
})

const addData = () => {
    table.data.push({ id: getNewId(), status: '0', editType: 'new', dictType: state.dictType, dictSort: getMaxSort() })

    state.changed = true
}

const deleteData = (ids, rows) => {
    WarningConfirm(`确定要删除选中的${ids.length > 1 ? ids.length + '个' : ''}字典数据吗？`)
        .then(() => {
            // request.delete({ url: `/${ids.join(',')}` }).then(res => {
            //     Success('选中字典数据已删除')
            //     refreshData()
            // })
            for (let i = 0; i < table.data.length; i++) {
                const item = table.data[i]
                if (ids.includes(item.id)) {
                    table.data.splice(table.data.indexOf(item), 1)
                    if (BigInt(item.id) > 0) {
                        state.deleteIds.push(item.id)
                    }
                    state.changed = true
                    i--
                }
            }
        })
        .catch(() => { })
}

const saveData = async () => {
    const rawData = toRaw(table.data)
    let dictDatas = {
        deleteIds: toRaw(state.deleteIds),
        newDatas: rawData.filter(item => item.editType == 'new'),
        editDatas: rawData.filter(item => item.editType == 'edit').map(item => {
            return {
                dictLabel: item.dictLabel,
                dictCode: item.dictCode,
                dictValue: item.dictValue,
                id: item.id,
                dictSort: item.dictSort,
                status: item.status,
                remark: item.remark
            }
        }),
    }

    try {
        table.loading = true
        await request.post({ url: '/system/dict/data/edit', data: dictDatas })
        refreshData()
        Success('字典数据保存成功')
    } catch (e) {
        Error('字典数据保存失败')
    } finally {
        table.loading = false
    }
}

const refreshData = () => {
    const params = { dictType: state.dictType, paging: false }
    table.loading = true
    request.get({ url: '/system/dict/data/list', params: params }).then(res => {
        table.loading = false
        table.data = res.data
        state.changed = false
    })
}


onMounted(() => {
    // state.dictType = route.params.type
    // refreshData()
})

onUnmounted(() => { })

const loadDictData = (dictType: string) => {
    state.dictType = dictType
    refreshData()
}

defineExpose({ loadDictData })


const isChanged = () => {
    return state.changed
}

const fieldChanged = (row, field) => {
    state.changed = true
    if (row.editType != 'new') {
        row.editType = 'edit'
    }
}

const getMaxSort = () => {
    let maxSort = 0
    toRaw(table.data).forEach(item => {
        if (item.dictSort > maxSort) {
            maxSort = item.dictSort
        }
    })
    return maxSort + 1
}

const getNewId = () => {
    let id = BigInt(0)
    toRaw(table.data).forEach(item => {
        if (BigInt(item.id) < id) {
            id = BigInt(item.id)
        }
    })
    if (id > 0)
        id = 0
    return (id - BigInt(1)).toString()
}

</script>
