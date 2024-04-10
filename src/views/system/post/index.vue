<template>
    <div class="default-main zk-table-box">
        <BaseTable :config="tableConfig" />
    </div>
</template>
<script setup>
import { onMounted, reactive } from 'vue'
import { useApi } from '@/common/utils/api'
import { BaseTable } from '@/common/components/BaseTable'

const userApi = useApi({ base: '/system/post' })

const tableConfig = reactive({
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
                options: {
                    active: '0',
                    inactive: '1',
                },
                changed: (from, to) => {},
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
        {
            name: 'add',
            align: 'left',
            label: '添加',
        },
        {
            name: 'edit',
            align: 'left',
            label: '编辑',
        },
        {
            name: 'delete',
            align: 'left',
            label: '删除',
        },
    ],
    events: {
        onColumnHide: column => {},
        onColumnShow: column => {},
        onRefresh: () => {
            refreshData()
        },
        onAdd: () => {},
        onEdit: () => {},
        onDelete: () => {},
    },
})

const refreshData = () => {
    userApi.get('/list').then(res => {
        tableConfig.data = res.data
    })
}

onMounted(() => {
    refreshData()
})
</script>
