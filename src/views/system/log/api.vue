<template>
    <ContentWrap>
        <KTable :config="table" />
    </ContentWrap>
</template>
<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { ContentWrap } from '@/components/ContentWrap'
import { WarningConfirm, Success } from '@/utils/dlgs'
import { KTable } from '@/components/KTable'
import { KTableProps, KTableColumnProps, KTableFilterRendererOption } from '@/components/KTable/types'
import request from '@/axios'

// const logApi = useApi('/monitor/apilog')

const table = reactive(<KTableProps>{
    loading: false,
    columns: <KTableColumnProps[]>[
        { prop: 'userName', label: '用户', width: '100', sortable: 'custom' },
        { prop: 'apiMethod', label: '请求', width: '80', sortable: 'custom' },
        { prop: 'apiUri', label: 'API路径' },
        { prop: 'beginTime', label: '开始时间', sortable: 'custom', renderer: { type: 'timestamp' } },
        { prop: 'endTime', label: '结束时间', sortable: 'custom', renderer: { type: 'timestamp' } },
        {
            prop: 'expendNanos',
            label: '耗时',
            width: '90',
            sortable: 'custom',
            renderer: { type: 'filter', options: <KTableFilterRendererOption>{ filter: v => (v / 1000 / 1000).toFixed(3) + 'ms' } },
        },
    ],
    buttons: [
        { name: 'delete', permissions: 'system:log:api:delete', isEnable: ts => ts.selectedIds.length > 0, },
        { name: 'clean', type: 'danger', label: '清空', permissions: 'system:log:api:clean', icon: 'carbon:clean', },
    ],
    search: {
        fields: [
            { prop: 'userName', label: '用户' },
            {
                prop: 'apiMethod',
                label: '请求',
                type: 'select',
                options: {
                    data: [
                        // { value: 'GET', label: 'GET' },
                        { value: 'POST', label: 'POST' },
                        { value: 'PUT', label: 'PUT' },
                        { value: 'DELETE', label: 'DELETE' },
                    ],
                    multiple: true,
                },
            },
        ],
    },
    options: {
        defaultSort: { prop: 'beginTime', order: 'descending' },
    },
    events: {
        onRefresh: ts => refreshData(ts.searchParams),
        onDelete: ts => deleteLogs(ts.selectedIds),
        onClean: _ => cleanLogs(),
    },
})

const refreshData = (searchParams?) => {
    table.loading = true
    request.get({ url: '/system/log/api/list', params: searchParams || { sortField: 'beginTime', sortDirection: 'descending' } }).then(res => {
        table.loading = false
        table.data = res.data
    })
}

const deleteLogs = ids => {
    WarningConfirm(`确定要删除选中的 ${ids.length} 条日志记录吗？`)
        .then(() => {
            request.delete({ url: '/system/log/api/' + ids.join(',') }).then(res => {
                Success('选中日志记录已经删除')
                refreshData()
            })
        })
        .catch(() => { })
}

const cleanLogs = () => {
    WarningConfirm('确定要清除所有的用户操作日志记录吗？')
        .then(() => {
            request.delete({ url: '/system/log/api/clean' }).then(res => {
                Success('日志已清除')
                refreshData()
            })
        })
        .catch(() => { })
}

onMounted(() => {
    refreshData()
})
</script>
