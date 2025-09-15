<script setup lang="ts">
import { ref, provide } from 'vue'
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
const icecreamRef = ref<{ 
  triggerAnimation: () => void,
  priceBg: string,
  textColor: string 
} | null>(null)

// Update section colors when section changes
const updateSectionColors = (section: string) => {
  currentSection.value = section
  
  // Default colors
  let newPriceBg = '#000'
  let newTextColor = '#333'
  
  // Get colors from the active section component
  if (section === 'ice cream' && icecreamRef.value) {
    newPriceBg = icecreamRef.value.priceBg
    newTextColor = icecreamRef.value.textColor
  }
  // Add other sections here when implemented
  
  priceBgColor.value = newPriceBg
  textColor.value = newTextColor
}

// Provide a method to trigger the animation
const triggerIceCreamAnimation = () => {
  if (icecreamRef.value) {
    icecreamRef.value.triggerAnimation()
  }
}

provide('triggerIceCreamAnimation', triggerIceCreamAnimation)
provide('updateSectionColors', updateSectionColors)

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
    <Icecream ref="icecreamRef" />
    
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
