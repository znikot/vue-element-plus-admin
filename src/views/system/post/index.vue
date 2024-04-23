<template>
    <ContentWrap>
        <KTable :config="tableConfig" />
    </ContentWrap>
</template>
<script setup lang="ts">
import { onMounted, reactive } from 'vue'
import { ContentWrap } from '@/components/ContentWrap'
// import { useApi } from '@/common/utils/api'
import { KTable } from '@/components/KTable'
import { KTableProps, KTableSwitchRendererOption } from '@/components/KTable/types'
import request from '@/axios'

// const userApi = useApi({ base: '/system/post' })

const tableConfig = reactive(<KTableProps>{
    columns: [
        {
            prop: 'id',
            label: 'ID',
        },
        {
            prop: 'postName',
            label: '岗位名称',
        },
        {
            prop: 'postCode',
            label: '岗位编码',
        },
        {
            prop: 'postType',
            label: '岗位类型',
        },
        {
            prop: 'postSort',
            label: '排序',
        },
        {
            prop: 'status',
            label: '状态',
            renderer: {
                type: 'switch',
                options: <KTableSwitchRendererOption>{
                    active: '0',
                    inactive: '1',
                    permissions: 'system:post:status'
                },
                changed: (from, to) => { },
            },
        },
        {
            prop: 'createInfo.createTime',
            label: '创建时间',
            renderer: {
                type: 'timestamp',
            },
        },
    ],
    data: [],
    buttons: [
        { name: 'add', align: 'left', label: '添加', permissions: 'system:post:create' },
        { name: 'edit', align: 'left', label: '编辑', permissions: 'system:post:edit' },
        { name: 'delete', align: 'left', label: '删除', permissions: 'system:post:delete' },
    ],
    events: {
        onColumnHide: column => { },
        onColumnShow: column => { },
        onRefresh: () => {
            refreshData()
        },
        onAdd: () => { },
        onEdit: () => { },
        onDelete: () => { },
    },
})

const refreshData = () => {
    request.get({ url: '/system/post/list' }).then(res => {
        tableConfig.data = res.data
    })
}

onMounted(() => {
    refreshData()
})
</script>
