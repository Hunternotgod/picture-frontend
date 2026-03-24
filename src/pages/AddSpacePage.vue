<template>
  <div id="addSpacePage">
    <h2>
      {{ route.query?.id ? '修改空间' : '创建空间' }}
    </h2>

    <!-- 空间信息表单-->
    <a-form name="spaceForm" layout="vertical" :model="spaceForm" @finish="handleSubmit">
      <a-form-item name="spaceName" label="空间名称">
        <a-input v-model:value="spaceForm.spaceName" placeholder="输入空间名称" allow-clear />
      </a-form-item>
      <a-form-item label="空间级别" name="spaceLevel">
        <a-select
          v-model:value="spaceForm.spaceLevel"
          :options="SPACE_LEVEL_OPTIONS"
          placeholder="请选择空间级别"
          style="min-width: 180px"
          allow-clear
        />
      </a-form-item>

      <a-form-item>
        <a-button type="primary" html-type="submit" :loading="loading" style="width: 100%"
          >创建空间</a-button
        >
      </a-form-item>
    </a-form>

    <!-- 空间级别介绍-->
    <a-card title="空间级别介绍">
      <a-typography>
        * 目前仅支持开通普通班，如需升级空间，请联系
        <a href="https://github.com/Hunternotgod" target="_blank">肥猫叉烧</a>
      </a-typography>
      <a-typography-paragraph v-for="spaceLevel in spaceLevelList">
        {{ spaceLevel.text }}：空间容量大小 {{ formatSize(spaceLevel.maxSize) }}，空间图片数量
        {{ spaceLevel.maxCount }}
      </a-typography-paragraph>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import {
  addSpaceUsingPost,
  getSpaceVoByIdUsingGet,
  listSpaceLevelUsingGet,
  updateSpaceUsingPost,
} from '@/api/spaceController.ts'
import { useRoute, useRouter } from 'vue-router'
import { SPACE_LEVEL_OPTIONS } from '@/constants/space.ts'
import { formatSize } from '@/utils'

const space = ref<API.SpaceVo>()
const spaceForm = reactive<API.SpaceAddRequest>({})

const spaceLevelList = ref<API.SpaceLevel[]>([])

const router = useRouter()
const loading = ref(false)

// 获取空间级别
const fetcSpaceList = async () => {
  const res = await listSpaceLevelUsingGet()
  if (res.data.code === 0 && res.data.data) {
    spaceLevelList.value = res.data.data
  } else {
    message.error('获取空间级别失败' + res.data.message)
  }
}

onMounted(() => {
  fetcSpaceList()
})

/**
 * 提交表单
 * @param values
 */
const handleSubmit = async (values: any) => {
  const spaceId = space.value?.id
  loading.value = true
  let res
  // 更新
  if (spaceId) {
    res = await updateSpaceUsingPost({
      id: spaceId,
      ...spaceForm,
    })
  } else {
    // 创建
    res = await addSpaceUsingPost({
      ...spaceForm,
    })
  }

  // 操作成功
  if (res.data.code === 0 && res.data.data) {
    message.success('操作成功！')
    // 跳转到空间详情页
    router.push({
      path: `/admin/spaceManage`,
    })
  } else {
    message.error('操作失败，' + res.data.message)
  }
}

const route = useRoute()

// 获取老数据
const getOldSpaceOption = async () => {
  // 获取到id
  const id = route.query?.id
  if (id) {
    const res = await getSpaceVoByIdUsingGet({
      id,
    })
    if (res.data.code === 0 && res.data.data) {
      const data = res.data.data
      // 回显数据
      space.value = data
      spaceForm.spaceName = data.spaceName
      spaceForm.spaceLevel = data.spaceLevel
    }
  }
}

onMounted(() => {
  getOldSpaceOption()
})
</script>

<style scoped>
#addSpacePage {
  max-width: 720px;
  margin: 0 auto;
}
</style>
