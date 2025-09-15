<script setup lang="ts">
import { ref } from 'vue'
import About from './components/About.vue'
import Icecream from './components/Icecream.vue'
import Milktea from './components/Milktea.vue'
import Float from './components/Float.vue'
import Juice from './components/Juice.vue'
import StickyHeader from './components/StickyHeader.vue'

// State for sticky header
const currentSection = ref('ice cream')
const priceBgColor = ref('#000')
const textColor = ref('#333')

// Navigation handler
const handleNavigation = (section: string) => {
  currentSection.value = section
}
</script>

<template>
  <main class="app-main">
    <!-- Sticky Header -->
    <StickyHeader 
      :current-section="currentSection"
      :price-bg-color="priceBgColor"
      :text-color="textColor"
      @navigate="handleNavigation"
    />
    
    <!-- Sections -->
    <About />
    <Icecream />
    <Milktea />
    <Float />
    <Juice />
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
