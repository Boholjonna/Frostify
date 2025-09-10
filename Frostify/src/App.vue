<script setup lang="ts">
import About from './components/About.vue'
</script>

<template>
  <main class="app-main">
    <About />
  </main>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  margin: 0;
  padding: 0;
  width: 100%;
  min-height: 100vh;
}

.app-main {
  margin: 0;
  padding: 0;
  height: auto;
  width: 100%;
  display: block;
}
</style>
