<script setup lang="ts">
import { ref, provide, onMounted, onBeforeUnmount } from 'vue'
import About from './components/About.vue'
import Icecream from './components/Icecream.vue'
import Milktea from './components/Milktea.vue'
import Float from './components/Float.vue'
import Juice from './components/Juice.vue'
import StickyHeader from './components/StickyHeader.vue'
import { preloadAllData, preloadAllImages, preloadCriticalImages, type PreloadedData } from './services/dataPreloader'
import type { DatabaseRow } from './components/Getdata.vue'

// Global loading state
const isLoading = ref(true)
const loadingError = ref('')
const preloadedData = ref<PreloadedData | null>(null)

// Reload handler
const handleReload = () => {
  window.location.reload()
}

// State for sticky header
const showHeader = ref(false) // Only show header after View Products is clicked
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
  // Show header when navigating to products
  if (section !== 'about') {
    showHeader.value = true
  }
  
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
provide('showHeader', () => { showHeader.value = true })

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
    } else if (scrollPosition >= aboutBottom) {
      // User scrolled past About section, show header
      showHeader.value = true
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

onMounted(async () => {
  try {
    // Preload all data from database
    const data = await preloadAllData()
    // Preload only critical images for first paint, but don't block too long
    const timeout = new Promise<void>((resolve) => setTimeout(resolve, 1200))
    await Promise.race([preloadCriticalImages(data), timeout])

    // Store preloaded data and render immediately
    preloadedData.value = data
    isLoading.value = false

    // Warm the rest of the images in the background at idle time (non-blocking)
    const warmup = () => preloadAllImages(data).catch(() => {/* ignore warmup failures */})
    if ('requestIdleCallback' in window) {
      ;(window as any).requestIdleCallback(warmup, { timeout: 2000 })
    } else {
      setTimeout(warmup, 0)
    }
    
    // Set up scroll listener after content is ready
    window.addEventListener('scroll', throttledHandleScroll, { passive: true })
    // Initial check
    handleScroll()
  } catch (error: any) {
    console.error('Failed to preload data:', error)
    loadingError.value = error?.message || 'Failed to load data. Please refresh the page.'
    isLoading.value = false
  }
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
  <!-- Global Loading Screen -->
  <div v-if="isLoading" class="global-loading">
    <div class="loading-content">
      <div class="loading-spinner"></div>
      <p class="loading-text">Loading Frostify...</p>
     
    </div>
  </div>

  <!-- Error Screen -->
  <div v-else-if="loadingError" class="global-error">
    <div class="error-content">
      <p class="error-text">{{ loadingError }}</p>
      <button @click="handleReload" class="retry-button">Retry</button>
    </div>
  </div>

  <!-- Main Content (only shown when data is ready) -->
  <main v-else class="app-main">
    <!-- Sticky Header (only shown after View Products is clicked) -->
    <StickyHeader 
      v-if="showHeader"
      :current-section="currentSection"
      @navigate="handleNavigation"
    />
    
    <!-- Sections -->
    <section id="about-section">
      <About />
    </section>
    <section id="icecream-section">
      <Icecream ref="icecreamRef" :preloaded-data="preloadedData?.icecream || []" />
    </section>
    <section id="milktea-section">
      <Milktea :preloaded-data="preloadedData?.milktea || []" />
    </section>
    <section id="float-section">
      <Float :preloaded-data="preloadedData?.float || []" />
    </section>
    <section id="juice-section">
      <Juice :preloaded-data="preloadedData?.juice || []" />
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

/* Global Loading Screen */
.global-loading,
.global-error {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  z-index: 9999;
}

.loading-content,
.error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 40px;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 5px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  color: #ffffff;
  font-family: 'Inter', system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.loading-subtext {
  color: rgba(255, 255, 255, 0.8);
  font-family: 'Inter', system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
  font-size: 16px;
  font-weight: 400;
  margin: 0;
}

.error-text {
  color: #ffffff;
  font-family: 'Inter', system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
  font-size: 18px;
  text-align: center;
  max-width: 500px;
  margin: 0;
}

.retry-button {
  padding: 12px 32px;
  background: #ffffff;
  color: #667eea;
  border: none;
  border-radius: 8px;
  font-family: 'Inter', system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.retry-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.retry-button:active {
  transform: translateY(0);
}
</style>
