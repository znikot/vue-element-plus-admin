<template>
    <ContentWrap v-show="!state.showDetail">
        <KTable :config="tableConfig" />
    </ContentWrap>
    <ContentDetailWrap v-show="state.showDetail">
        <template #header>
            <div class="flex items-center gap-x-5">
                <div>
                    <el-button type="default" @click="hideDictDetail">
                        <Icon icon="ep:back" />{{ state.currentDictName }}
                    </el-button>
                </div>
                <div>
                    点击按钮返回字典类型
                </div>
            </div>
        </template>
        <DictData ref="dictData" />
    </ContentDetailWrap>
    <KForm :config="formConfig" />
</template>
<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ContentWrap } from '@/components/ContentWrap'
import { ContentDetailWrap } from '@/components/ContentDetailWrap'
import { Success, WarningConfirm } from '@/utils/dlgs'
import { KTable } from '@/components/KTable'
import { KTableProps, KTableLinkRendererOption, KTableSwitchRendererOption } from '@/components/KTable/types'
import { KForm } from '@/components/KForm'
import request from '@/axios'
import DictData from './data.vue'

const dictData = ref(null)

const state = reactive({
    showDetail: false,
    currentDictType: '',
    currentDictName: '',
})

const tableConfig = reactive(<KTableProps>{
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
                type: 'link',
                options: <KTableLinkRendererOption>{
                    // path: row => `/system/dict/data/${row.dictType}`,
                    // path: '/system/dept'
                    action(row) { showDictDetail(row) }
                },
            },
        },
        {
            prop: 'status',
            label: '状态',
            changed: (row, to) => {
                let action = to == '0' ? 'disable' : 'enable'
                WarningConfirm(`确定要${action == 'disable' ? '停用' : '启用'} ${row.dictName} 吗？`).then(() => {
                    request.put({ url: '/system/dict/type/status/' + action + '/' + row.id }).then(res => {
                        if (res.code == 200) {
                            row.status = to == '0' ? '1' : '0'
                            Success(`字典类型 ${row.dictName} 已${action == 'disable' ? '停用' : '启用'}`)
                        }
                    })
                })
            },
            renderer: {
                type: 'switch',
                options: <KTableSwitchRendererOption>{
                    active: '0',
                    inactive: '1',
                    permissions: 'system:dict:status',
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
                        { type: 'success', label: '明细', icon: 'tabler:list-details', action: row => showDictDetail(row) },
                        { type: 'primary', label: '编辑', icon: 'ep:edit', permissions: 'system:dict:edit', action: row => { editDictType(row.id) }, },
                        {
                            type: 'danger', label: '删除', icon: 'ep:delete', permissions: 'system:dict:delete',
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
        { name: 'add', permissions: 'system:dict:create' },
        { name: 'edit', permissions: 'system:dict:edit', isEnable: ts => { return ts.selectedIds.length == 1 }, },
        { name: 'delete', permissions: 'system:dict:delete', isEnable: ts => { return ts.selectedIds.length > 0 }, },
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
        onAdd: _ => {
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
        let api = data.id ? request.put : request.post
        api({ url: '/system/dict/type', data: data }).then(res => {
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
    request.get({ url: `/system/dict/type/${id}` }).then(res => {
        formConfig.data = res.data
        formConfig.open = true
    })
}

const deleteDictTypes = (ids, types) => {
    let msg = ids.length > 1 ? `确定要删除选中的 ${ids.length} 个字典类型吗？` : `确定要删除字典类型 ${types[0].dictName} 吗？`
    WarningConfirm(msg)
        .then(() => {
            request.delete({ url: `/system/dict/type/${ids.join(',')}` }).then(res => {
                if (res.code === 0) {
                    Success('选中的字典类型已删除')
                    refreshData()
                }
            })
        })
        .catch(() => { })
}

const refreshData = (params?) => {
    tableConfig.loading = true
    request.get({ url: '/system/dict/type/list', params: params || {} }).then(res => {
        tableConfig.data = res.data
        tableConfig.loading = false
    })
}

const showDictDetail = (row) => {
    state.showDetail = true
    dictData.value.loadDictData(row.dictType)
    // state.currentDictType = row.dictType
    state.currentDictName = row.dictName
}

const hideDictDetail = () => {
    state.showDetail = false
}

onMounted(() => {
    refreshData()
})
</script>
