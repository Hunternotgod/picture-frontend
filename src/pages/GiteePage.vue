<template>
  <div id="osc-gitee-widget-tag">
    <div v-if="loading" class="osc_git_box osc_border_color">
      <div class="osc_git_title osc_panel_color osc_border_color">
        <h3 class="pro_name">
          <div class="row_left">
            <div style="width: 24px; height: 24px; background: #4183c4; border-radius: 4px"></div>
          </div>
          <div class="row_left osc_git_proname pro_name git_left_div" style="height: 20px">
            加载中...
          </div>
          <div class="row_right osc_git_forkstar osc_pro_color forkstar">Star - | Fork -</div>
          <div class="row_clear"></div>
        </h3>
      </div>
      <div class="osc_git_main">
        <div class="osc_background_color">
          <div class="osc_git_info osc_desc_color">加载仓库信息...</div>
        </div>
      </div>
      <div class="osc_git_footer osc_panel_color osc_border_color">
        <div class="row_left"><span class="osc_link_color">加载中...</span></div>
        <div class="row_clear"></div>
      </div>
    </div>

    <div v-else-if="error" class="osc_git_box osc_border_color">
      <div class="osc_git_main">
        <div class="osc_background_color">
          <div class="osc_git_info osc_desc_color">⚠️ 无法加载 Gitee 仓库信息</div>
        </div>
      </div>
    </div>

    <div v-else class="osc_git_box osc_border_color">
      <!-- Title -->
      <div class="osc_git_title osc_panel_color osc_border_color">
        <h3 class="pro_name">
          <div class="row_left">
            <img src="https://gitee.com/static/images/logo-en.svg" width="24" />
          </div>
          <div class="row_left osc_git_proname pro_name git_left_div">
            <a class="osc_pro_color" :href="repo.html_url" target="_blank">
              {{ repo.full_name }}
            </a>
          </div>
          <div class="row_right osc_git_forkstar osc_pro_color forkstar">
            <a class="osc_pro_color" :href="repo.html_url" target="_blank"
              >Star {{ repo.stargazers_count }}</a
            >
            |
            <a class="osc_pro_color" :href="`${repo.html_url}/forks`" target="_blank"
              >Fork {{ repo.forks_count }}</a
            >
          </div>
          <div class="row_clear"></div>
        </h3>
      </div>

      <!-- Main -->
      <div class="osc_git_main">
        <div class="osc_background_color">
          <div class="osc_git_info osc_desc_color">
            {{ repo.description || '暂无描述' }}
          </div>
          <div class="osc_git_issuecommits">
            <b
              ><a class="osc_link_color" :href="`${repo.html_url}/issues`" target="_blank"
                >issues:</a
              ></b
            >
            暂不支持动态获取
          </div>
          <div class="osc_git_issuecommits">
            <b
              ><a class="osc_link_color" :href="`${repo.html_url}/commits`" target="_blank"
                >最近提交:</a
              ></b
            >
            <ul>
              <li v-for="commit in recentCommits" :key="commit.sha">
                <div class="row_left">
                  <a class="commit_short_id osc_link_color" :href="commit.html_url" target="_blank">
                    {{ commit.sha.substring(0, 8) }}
                  </a>
                  &nbsp;
                  <a class="osc_link_color" :href="commit.html_url" target="_blank">
                    {{ commit.commit.message.split('\n')[0].substring(0, 30) }}...
                  </a>
                </div>
                <div class="row_right">
                  <a
                    class="commit-author-link osc_link_color"
                    :href="commit.author.html_url"
                    target="_blank"
                  >
                    {{ commit.author.login }}
                  </a>
                  <span class="timeago osc_link_color">{{
                    formatDate(commit.commit.author.date)
                  }}</span>
                </div>
                <div class="row_clear"></div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="osc_git_footer osc_panel_color osc_border_color">
        <div class="row_left">
          <a class="osc_link_color" :href="repo.html_url" target="_blank"
            >{{ repo.default_branch }} 分支：</a
          >
          <span class="osc_link_color">{{ latestCommitDate }}</span>
        </div>
        <div class="row_right right_span">
          <a
            class="osc_link_color"
            :href="`${repo.html_url}/archive/${repo.default_branch}.zip`"
            target="_blank"
            >源码下载</a
          >
        </div>
        <div class="row_clear"></div>
      </div>

      <div class="osc_git_footer osc_git_copyright osc_panel_color osc_border_color osc_link_color">
        <a class="osc_link_color" href="https://gitee.com/" target="_blank">GITEE.COM</a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// 配置你的仓库
const owner = 'fat-cat-barbecue'
const repoName = 'picture-backend'

const loading = ref(true)
const error = ref(false)
const repo = ref({})
const recentCommits = ref([])
const latestCommitDate = ref('')

// 工具函数：格式化日期为 YYYY-MM-DD HH:mm
function formatDate(isoString) {
  const date = new Date(isoString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

onMounted(async () => {
  try {
    // 获取仓库信息
    const repoRes = await fetch(`https://gitee.com/api/v5/repos/${owner}/${repoName}`)
    if (!repoRes.ok) throw new Error('仓库信息获取失败')
    repo.value = await repoRes.json()

    // 获取最近提交（最多 3 条）
    const commitsRes = await fetch(
      `https://gitee.com/api/v5/repos/${owner}/${repoName}/commits?per_page=3`,
    )
    if (!commitsRes.ok) throw new Error('提交记录获取失败')
    const commits = await commitsRes.json()
    recentCommits.value = commits

    if (commits.length > 0) {
      latestCommitDate.value = formatDate(commits[0].commit.author.date)
    }

    loading.value = false
  } catch (err) {
    console.error('Gitee API Error:', err)
    error.value = true
    loading.value = false
  }
})
</script>

<style scoped>
/* ========== 复用你提供的样式 ========== */
.osc_pro_color {
  color: #4183c4 !important;
}
.osc_panel_color,
.osc_background_color {
  background-color: #ffffff !important;
}
.osc_border_color {
  border-color: #e3e9ed !important;
}
.osc_desc_color {
  color: #666666 !important;
}
.osc_link_color,
.osc_link_color * {
  color: #9b9b9b !important;
}

/* ========== Gitee Widget 布局样式 ========== */
.osc_git_box {
  padding: 0 !important;
  border: 1px solid #e3e9ed;
  background-color: #fff;
  border-radius: 3px;
  font-family: helvetica, arial, sans-serif;
  font-size: 14px;
}
.osc_git_box a {
  color: #9b9b9b;
  text-decoration: none;
}
.row_left {
  float: left;
}
.row_right {
  float: right;
}
.row_clear {
  clear: both;
}

.osc_git_title {
  position: relative;
  border-bottom: 1px solid #ddd;
  border-radius: 3px 3px 0 0;
  overflow: hidden;
  padding: 0 15px 0 10px;
  height: 46px;
  line-height: 46px;
}
.osc_git_title h3 {
  font-size: 16px;
  color: #0088cc;
  margin: 0;
  padding: 13px 1px 1px 1px;
  line-height: 20px;
}
.osc_git_proname {
  height: 20px;
  overflow: hidden;
  line-height: 20px;
  margin-left: 10px;
  max-width: 65%;
}
.osc_git_forkstar {
  font-size: 12px;
  font-weight: normal;
}
.osc_git_main ul {
  width: 100%;
  margin: 0;
  padding: 0;
  padding-top: 2px;
  list-style: none;
}
.osc_git_main ul li {
  width: inherit;
  white-space: nowrap;
}
.osc_git_main ul li .row_left {
  overflow: hidden;
  max-width: 85%;
}
.osc_git_footer {
  padding: 10px;
  line-height: 1.2;
  border-top: 1px solid #ddd;
}
.osc_git_copyright {
  text-align: center;
  font-weight: bold;
}
</style>
