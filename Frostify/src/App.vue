<script setup lang="ts">
import About from './components/About.vue'
import Icecream from './components/Icecream.vue'
import Milktea from './components/Milktea.vue'
</script>

<template>
  <main class="app-main">
    <About />
    <Icecream />
    <Milktea />
  </main>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
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
  display: flex;
  flex-direction: column;
}
</style>
