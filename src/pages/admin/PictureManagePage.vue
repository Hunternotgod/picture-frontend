<template>
  <div class="pictureManagePage">
    <h2>图片管理</h2>
    <a-flex justify="space-between" style="margin-bottom: 16px">
      <a-space>
        <a-button type="primary" href="/add_picture" target="_blank">+ 创建图片</a-button>
        <a-button type="primary" href="/add_picture/batch" target="_blank" ghost
          >+ 批量创建图片</a-button
        >
      </a-space>
    </a-flex>
    <!-- 搜索表单-->
    <a-form layout="inline" :model="searchParams" @finish="doSearch">
      <a-form-item label="关键词" name="searchText">
        <a-input
          v-model:value="searchParams.searchText"
          placeholder="从名称和简介搜索"
          allow-clear
        />
      </a-form-item>
      <a-form-item label="类型" name="category">
        <a-input v-model:value="searchParams.category" placeholder="请输入类型" allow-clear />
      </a-form-item>
      <a-form-item label="标签" name="tags">
        <a-select
          v-model:value="searchParams.tags"
          mode="tags"
          placeholder="请输入标签"
          style="min-width: 180px"
          allow-clear
        />
      </a-form-item>
      <a-form-item label="审核状态" name="reviewStatus">
        <a-select
          v-model:value="searchParams.reviewStatus"
          :options="PIC_REVIEW_STATUS_OPTIONS"
          placeholder="请选择审核状态"
          style="min-width: 150px"
          allow-clear
        />
      </a-form-item>
      <a-form-item>
        <a-space>
          <a-button type="primary" html-type="submit">搜索</a-button>
          <a-button @click="resetSearch">重置</a-button>
        </a-space>
      </a-form-item>
    </a-form>
    <!-- 表格-->
    <a-table
      :columns="columns"
      :data-source="dataList"
      :pagination="pagination"
      @change="doTableChange"
      :scroll="{ x: 1600 }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'url'">
          <a-image :src="record.url" :width="120" :height="80" style="object-fit: cover" />
        </template>
        <!-- 标签 -->
        <template v-if="column.dataIndex === 'tags'">
          <a-space wrap>
            <a-tag v-for="tag in parseTags(record.tags)" :key="tag">{{ tag }}</a-tag>
          </a-space>
        </template>
        <!-- 图片信息 -->
        <template v-if="column.dataIndex === 'picInfo'">
          <div style="font-size: 12px; line-height: 1.6">
            <div>格式：{{ record.picFormat }}</div>
            <div>宽：{{ record.picWidth }}</div>
            <div>高：{{ record.picHeight }}</div>
            <div>比：{{ record.picScale }}</div>
            <div>大小：{{ formatSize(record.picSize) }}</div>
          </div>
        </template>
        <!-- 审核信息 -->
        <template v-if="column.dataIndex === 'reviewMessage'">
          <div style="font-size: 12px; line-height: 1.6; max-width: 200px">
            <div>{{ PIC_REVIEW_STATUS_MAP[record.reviewStatus] }}</div>
            <div style="color: #999">{{ record.reviewMessage || '-' }}</div>
            <div style="color: #666; font-size: 11px">ID: {{ record.reviewerId || '-' }}</div>
          </div>
        </template>
        <template v-if="column.dataIndex === 'createTime'">
          {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
        <template v-if="column.dataIndex === 'editTime'">
          {{ dayjs(record.editTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
        <template v-if="column.key === 'action'">
          <a-space wrap>
            <a-tooltip title="通过">
              <a-button
                v-if="record.reviewStatus !== PIC_REVIEW_STATUS_ENUM.PASS"
                type="link"
                size="small"
                @click="handleReview(record, PIC_REVIEW_STATUS_ENUM.PASS)"
              >
                ✓
              </a-button>
            </a-tooltip>
            <a-tooltip title="拒绝">
              <a-button
                v-if="record.reviewStatus !== PIC_REVIEW_STATUS_ENUM.REJECT"
                type="link"
                size="small"
                danger
                @click="handleReview(record, PIC_REVIEW_STATUS_ENUM.REJECT)"
              >
                ✗
              </a-button>
            </a-tooltip>
            <a-button type="link" size="small" :href="`/add_picture?id=${record.id}`" target="_blank"
              >编辑
            </a-button>
            <a-popconfirm title="确定删除吗？" @confirm="doDelete(record.id)">
              <a-button type="link" size="small" danger>删除</a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from 'vue'
import {
  deletePictureUsingPost,
  doPictureReviewUsingPost,
  listPictureByPageUsingPost,
} from '@/api/pictureController.ts'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import {
  PIC_REVIEW_STATUS_MAP,
  PIC_REVIEW_STATUS_ENUM,
  PIC_REVIEW_STATUS_OPTIONS,
} from '../../constants/picture.ts'
import { formatSize } from '@/utils'

const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    width: 70,
    fixed: 'left',
  },
  {
    title: '图片',
    dataIndex: 'url',
    width: 140,
    fixed: 'left',
  },
  {
    title: '名称',
    dataIndex: 'name',
    width: 150,
    ellipsis: true,
  },
  {
    title: '简介',
    dataIndex: 'introduction',
    width: 200,
    ellipsis: true,
  },
  {
    title: '类型',
    dataIndex: 'category',
    width: 100,
  },
  {
    title: '标签',
    dataIndex: 'tags',
    width: 150,
    ellipsis: true,
  },
  {
    title: '图片信息',
    dataIndex: 'picInfo',
    width: 120,
  },
  {
    title: '空间 ID',
    dataIndex: 'spaceId',
    width: 80,
  },
  {
    title: '审核信息',
    dataIndex: 'reviewMessage',
    width: 180,
    ellipsis: true,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 160,
    sorter: true,
  },
  {
    title: '编辑时间',
    dataIndex: 'editTime',
    width: 160,
  },
  {
    title: '操作',
    key: 'action',
    width: 200,
    fixed: 'right',
  },
]

// 定义数据
const dataList = ref<API.Picture[]>([])
const total = ref(0)
const loading = ref(false)

// 搜索条件
const searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 10,
  sortField: 'createTime',
  sortOrder: 'descend',
})

// 分页参数
const pagination = computed(() => {
  return {
    current: searchParams.current,
    pageSize: searchParams.pageSize,
    total: total.value,
    showSizeChanger: true,
    showTotal: (total) => `共 ${total} 条`,
    pageSizeOptions: ['10', '20', '50', '100'],
  }
})

// 表格变化之后，重新获取数据
const doTableChange = (page: any) => {
  searchParams.current = page.current
  searchParams.pageSize = page.pageSize
  fetchData()
}

// 解析标签
const parseTags = (tags: any) => {
  if (!tags) return []
  if (Array.isArray(tags)) return tags
  try {
    return JSON.parse(tags)
  } catch {
    return []
  }
}

// 搜索数据
const doSearch = () => {
  // 每次搜索都重置页码
  searchParams.current = 1
  fetchData()
}

// 重置搜索
const resetSearch = () => {
  searchParams.current = 1
  searchParams.searchText = undefined
  searchParams.category = undefined
  searchParams.tags = undefined
  searchParams.reviewStatus = undefined
  fetchData()
}

/**
 * 删除操作
 * @param id
 */
const doDelete = async (id: number) => {
  if (!id) {
    return
  }
  const res = await deletePictureUsingPost({ id })
  if (res.data.code === 0) {
    message.success(`删除成功！`)
    // 刷新数据
    fetchData()
  } else {
    message.error(`删除失败！`)
  }
}

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    const res = await listPictureByPageUsingPost({
      ...searchParams,
    })
    if (res.data.code === 0 && res.data.data) {
      dataList.value = res.data.data.records ?? []
      total.value = res.data.data.total ?? 0
    } else {
      message.error(`获取数据失败，${res.data.message}`)
    }
  } catch (e: any) {
    message.error('请求失败：' + e.message)
  } finally {
    loading.value = false
  }
}

// 页面加载时获取数据，请求一次
onMounted(() => {
  fetchData()
})

/**
 * 审核图片
 * @param record
 * @param reviewStatus
 */
const handleReview = async (record: API.Picture, reviewStatus: number) => {
  const reviewMessage =
    reviewStatus === PIC_REVIEW_STATUS_ENUM.PASS ? '管理员操作通过' : '管理员操作拒绝'
  const res = await doPictureReviewUsingPost({
    id: record.id,
    reviewStatus,
    reviewMessage,
  })
  if (res.data.code === 0) {
    message.success('审核操作成功')
    // 重新获取列表
    fetchData()
  } else {
    message.error('审核操作失败，' + res.data.message)
  }
}
</script>

