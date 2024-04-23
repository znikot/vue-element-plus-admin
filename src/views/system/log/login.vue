<template>
    <ContentWrap>
        <KTable :config="table" />
    </ContentWrap>
</template>
<script setup lang="ts">
import { onMounted, reactive } from 'vue'
import { ContentWrap } from '@/components/ContentWrap'
import { WarningConfirm, Success } from '@/utils/dlgs'
import { KTable } from '@/components/KTable'
import { KTableColumnProps, KTableProps, KTableTagRendererOption } from '@/components/KTable/types'
import request from '@/axios'


const table = reactive(<KTableProps>{
    loading: false,
    columns: <KTableColumnProps[]>[
        { prop: 'userName', label: '用户名' },
        { prop: 'loginTime', label: '时间', width: 160, sortable: 'custom' },
        { prop: 'status', label: '状态', renderer: { type: 'tag', options: <KTableTagRendererOption>{ tagType: { 0: 'success', 1: 'danger' }, tagLabel: { 0: '成功', 1: '失败' } } } },
        { prop: 'msg', label: '消息' },
        { prop: 'os', label: '操作系统' },
        { prop: 'browser', label: '浏览器' },
        { prop: 'ipaddr', label: 'IP' },
        { prop: 'loginLocation', label: '位置' },
    ],
    data: [],
    buttons: [
        { name: 'delete', permissions: 'system:log:login:delete', isEnable: ts => ts.selectedIds.length > 0 },
        { name: 'clean', type: 'danger', label: '清空', permissions: 'system:log:login:clean', icon: 'carbon:clean' },
    ],
    search: {
        fields: [
            { prop: 'userName', label: '用户名' },
            { prop: 'os', label: '操作系统' },
            { prop: 'browser', label: '浏览器' },
            {
                prop: 'status',
                label: '状态',
                type: 'select',
                options: {
                    data: [
                        { value: 0, label: '成功' },
                        { value: 1, label: '失败' },
                    ],
                },
            },
        ],
    },
    options: {
        defaultSort: { prop: 'loginTime', order: 'descending' },
    },
    events: {
        onRefresh: ts => refreshData(ts.searchParams),
        onDelete: ts => deleteLogs(ts.selectedIds),
        onClean: _ => cleanLogs(),
    },
})

const refreshData = (params?: any) => {
    table.loading = true
    request.get({ url: '/system/log/login/list', params: params || { sortField: 'loginTime', sortDirection: 'descending' } }).then(res => {
        table.loading = false
        table.data = res.data
    })
}

const deleteLogs = ids => {
    WarningConfirm(`确定要删除选中的 ${ids.length} 条日志记录吗？`)
        .then(() => {
            request.delete({ url: '/system/log/login/' + ids.join(',') }).then(res => {
                Success('选中日志记录已经删除')
                refreshData()
            })
        })
        .catch(() => { })
}

const cleanLogs = () => {
    WarningConfirm('确定要清除所有的用户登录访问日志记录吗？')
        .then(() => {
            request.delete({ url: '/system/log/login/clean' }).then(res => {
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
