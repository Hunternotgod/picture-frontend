<script setup lang="ts">
import GlobalHeader from '@/components/GlobalHeader.vue'
import GlobalSider from '@/components/GlobalSider.vue'
</script>

<template>
  <div id="basicLayout">
    <a-layout style="min-height: 100vh">
      <!--      导航栏-->
      <a-layout-header class="header">
        <global-header />
      </a-layout-header>

      <a-layout>
        <!-- 侧边栏-->
        <GlobalSider class="sider" />
        <!-- 中间内容-->
        <a-layout-content class="content">
          <router-view />
        </a-layout-content>
      </a-layout>

      <!-- 底边栏-->
      <a-layout-footer class="footer">
        <a href="https://gitee.com/fat-cat-barbecue/picture-backend" target="_blank">
          云图库 by 肥猫叉烧
        </a>
      </a-layout-footer>
    </a-layout>
  </div>
</template>

<style scoped>
#basicLayout .header {
  background: white;
  color: unset;
  padding-inline: 20px;
  margin-bottom: 1px;
}

#basicLayout .content {
  padding: 28px;
  background: linear-gradient(to right, #fefefe, #fff);
  margin-bottom: 28px;
}

#basicLayout .footer {
  background: #efefef;
  padding: 16px;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  text-align: center;
}

#basicLayout .sider {
  background: #fff;
  padding-top: 20px;
  border-right: 0.5px solid #eee;
}

#basicLayout :deep(.ant-menu-root) {
  border-bottom: none !important;
  border-inline-end: none !important;
}
</style>
