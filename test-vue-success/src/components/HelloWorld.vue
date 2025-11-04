<script setup lang="ts">
defineProps<{
  msg: string
}>()
</script>

<template>
  <h1>{{ msg }}</h1>

  <div class="card">
    <p>
      推荐的 IDE 设置:
      <a href="https://code.visualstudio.com/" target="_blank">VSCode</a>
      +
      <a href="https://github.com/johnsoncodehk/volar" target="_blank">Volar</a>
    </p>

    <p>
      查看 <code>README.md</code> 了解更多信息。
    </p>

    <p>
      <a href="https://vitejs.dev/guide/features.html" target="_blank">
        Vite 文档
      </a>
      |
      <a href="https://v3.vuejs.org/" target="_blank">Vue 3 文档</a>
    </p>
  </div>
</template>

<style scoped>
.card {
  padding: 2em;
}

.card p {
  margin: 0.5em 0;
}

code {
  background-color: #f9f9f9;
  padding: 2px 4px;
  border-radius: 4px;
  color: var(--color-text);
}

a {
  color: #42b883;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>