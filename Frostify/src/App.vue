<script setup lang="ts">
import { ref, provide, onMounted, onBeforeUnmount } from 'vue'
import About from './components/About.vue'
import Icecream from './components/Icecream.vue'
import Milktea from './components/Milktea.vue'
import Float from './components/Float.vue'
import Juice from './components/Juice.vue'
import StickyHeader from './components/StickyHeader.vue'

// State for sticky header
const currentSection = ref('ice cream')
const icecreamRef = ref<{ 
  triggerAnimation: () => void
} | null>(null)

// Provide a method to trigger the animation
const triggerIceCreamAnimation = () => {
  if (icecreamRef.value) {
    icecreamRef.value.triggerAnimation()
  }
}

// Track if we're currently scrolling programmatically
const isScrolling = ref(false)

// Navigation handler
const handleNavigation = (section: string) => {
  // Update section immediately
  currentSection.value = section
  
  // Only scroll if not already at the target section
  const targetId = `${section === 'ice cream' ? 'icecream' : section === 'milk tea' ? 'milktea' : section}-section`
  const targetElement = document.getElementById(targetId)
  
  if (targetElement) {
    isScrolling.value = true
    window.scrollTo({
      top: targetElement.offsetTop,
      behavior: 'smooth'
    })
    
    // Reset scrolling state after animation completes
    setTimeout(() => {
      isScrolling.value = false
    }, 1000)
  }
}

// Provide methods to child components
provide('triggerIceCreamAnimation', triggerIceCreamAnimation)
provide('navigate', handleNavigation)

// Handle scroll to detect current section
const handleScroll = () => {
  // Skip scroll handling if we're in the middle of a programmatic scroll
  if (isScrolling.value) return
  
  const aboutSection = document.getElementById('about-section')
  const sections = ['icecream', 'milktea', 'float', 'juice']
  const scrollPosition = window.scrollY + 20 // Reduced offset for more accurate detection
  
  // First check if we're in the about section
  if (aboutSection) {
    const aboutRect = aboutSection.getBoundingClientRect()
    const aboutTop = aboutRect.top + window.scrollY
    const aboutBottom = aboutTop + aboutRect.height
    
    if (scrollPosition >= aboutTop && scrollPosition < aboutBottom) {
      if (currentSection.value !== 'about') {
        currentSection.value = 'about'
      }
      return
    }
  }
  
  // Check other sections
  let foundSection = false
  for (const section of sections) {
    const element = document.getElementById(`${section}-section`)
    if (element) {
      const rect = element.getBoundingClientRect()
      const elementTop = rect.top + window.scrollY
      const elementBottom = elementTop + rect.height
      
      if (scrollPosition >= elementTop && scrollPosition < elementBottom) {
        const sectionName = section === 'icecream' ? 'ice cream' : 
                          section === 'milktea' ? 'milk tea' : 
                          section
        if (currentSection.value !== sectionName) {
          currentSection.value = sectionName
        }
        foundSection = true
        break
      }
    }
  }
  
  // If not in any section, keep the current section
}

// Set up scroll listener with debounce
let scrollTimeout: number | null = null
const throttledHandleScroll = () => {
  if (scrollTimeout !== null) {
    cancelAnimationFrame(scrollTimeout)
  }
  scrollTimeout = requestAnimationFrame(handleScroll)
}

onMounted(() => {
  window.addEventListener('scroll', throttledHandleScroll, { passive: true })
  // Initial check
  handleScroll()
})

// Clean up scroll listener
onBeforeUnmount(() => {
  window.removeEventListener('scroll', throttledHandleScroll)
  if (scrollTimeout !== null) {
    cancelAnimationFrame(scrollTimeout)
  }
})
</script>

<template>
  <main class="app-main">
    <!-- Sticky Header -->
    <StickyHeader 
      :current-section="currentSection"
      @navigate="handleNavigation"
    />
    
    <!-- Sections -->
    <section id="about-section">
      <About />
    </section>
    <section id="icecream-section">
      <Icecream ref="icecreamRef" />
    </section>
    <section id="milktea-section">
      <Milktea />
    </section>
    <section id="float-section">
      <Float />
    </section>
    <section id="juice-section">
      <Juice />
    </section>
    
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
