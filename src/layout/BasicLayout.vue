<script setup lang="ts">
import GlobalHeader from '@/components/GlobalHeader.vue'
</script>

<template>
  <div id="basicLayout">
    <a-layout style="min-height: 100vh">
      <a-layout-header class="header" :style="headerStyle">
        <global-header />
      </a-layout-header>
      <a-layout-content class="content" :style="contentStyle">
        <router-view />
      </a-layout-content>
      <a-layout-footer class="footer" :style="footerStyle">
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
  margin-bottom: 16px;
  padding-inline: 20px;
}

#basicLayout .content {
  padding: 20px;
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

</style>
