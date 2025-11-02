<script setup lang="ts">
import { ref } from 'vue'
import HelloWorld from './components/HelloWorld.vue'

const count = ref(0)
</script>

<template>
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
  </div>
  <HelloWorld msg="{{projectName}}" />

  <div class="card">
    <button type="button" @click="count++">count is {{ count }}</button>
    <p>
      由 <code>棱镜团队 CLI</code> 创建的 Vue + TypeScript 项目
    </p>
  </div>

  <p>
    查看
    <a href="https://vuejs.org/guide/quick-start.html#local" target="_blank"
      >create-vue</a
    >, 官方的 Vue + Vite 脚手架工具。
  </p>
  <p>
    点击 Vite 和 Vue 图标了解更多
  </p>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>