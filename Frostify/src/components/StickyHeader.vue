<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

// Props for the component
interface Props {
  currentSection: string
  priceBgColor?: string
  textColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  currentSection: 'ice cream',
  priceBgColor: '#000',
  textColor: '#333'
})

// Emits for navigation
const emit = defineEmits<{
  navigate: [section: string]
}>()

// Reactive state
const isVisible = ref(true) // Start visible by default
const headerRef = ref<HTMLElement | null>(null)

// Computed styles
const headerStyles = computed(() => ({
  borderBottom: `4px solid ${props.priceBgColor}`
}))

const navItemStyle = (label: string) => {
  const isActive = label.toLowerCase() === props.currentSection.toLowerCase()
  return {
    color: isActive ? props.priceBgColor : props.textColor
  }
}

// Navigation handler
const handleNavigation = (section: string) => {
  emit('navigate', section)
  
  // Map section names to actual section IDs
  const sectionIdMap: { [key: string]: string } = {
    'ice cream': 'icecream-section',
    'milk tea': 'milktea-section',
    'float': 'float-section',
    'juice': 'juice-section'
  }
  
  const sectionId = sectionIdMap[section]
  
  if (sectionId) {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }
}

// Intersection observer to show/hide header and track current section
let observer: IntersectionObserver | null = null

onMounted(() => {
  // Set up intersection observer to track current section and show/hide header
  observer = new IntersectionObserver(
    (entries) => {
      let currentSectionInView = ''
      let aboutSectionInView = false
      let anyProductSectionInView = false
      
      entries.forEach((entry) => {
        const sectionId = entry.target.id
        
        if (entry.isIntersecting) {
          // Check if About section is in view
          if (sectionId.includes('about')) {
            aboutSectionInView = true
          }
          // Check product sections
          else if (sectionId.includes('icecream')) {
            currentSectionInView = 'ice cream'
            anyProductSectionInView = true
          }
          else if (sectionId.includes('milktea')) {
            currentSectionInView = 'milk tea'
            anyProductSectionInView = true
          }
          else if (sectionId.includes('float')) {
            currentSectionInView = 'float'
            anyProductSectionInView = true
          }
          else if (sectionId.includes('juice')) {
            currentSectionInView = 'juice'
            anyProductSectionInView = true
          }
        }
      })
      
      // Show header by default, hide only when About section is in view
      isVisible.value = !aboutSectionInView
      
      if (currentSectionInView) {
        emit('navigate', currentSectionInView)
      }
    },
    { 
      threshold: 0.1,
      rootMargin: '-50px 0px 0px 0px'
    }
  )

  // Observe all sections including About
  const allSections = document.querySelectorAll('#about-section, #icecream-section, #milktea-section, #float-section, #juice-section')
  allSections.forEach(section => {
    if (observer) observer.observe(section)
  })
  
  // Add scroll listener as backup to ensure header stays visible
  const handleScroll = () => {
    const aboutSection = document.getElementById('about-section')
    if (aboutSection) {
      const rect = aboutSection.getBoundingClientRect()
      const isAboutInView = rect.top < window.innerHeight && rect.bottom > 0
      
      if (isAboutInView) {
        isVisible.value = false
      } else {
        isVisible.value = true
      }
    }
  }
  
  window.addEventListener('scroll', handleScroll)
  
  // Store cleanup function
  const cleanupScroll = () => {
    window.removeEventListener('scroll', handleScroll)
  }
  
  // Store cleanup for later use
  ;(window as any).__stickyHeaderCleanup__ = cleanupScroll
})

onBeforeUnmount(() => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
  
  // Cleanup scroll listener
  const cleanupScroll = (window as any).__stickyHeaderCleanup__
  if (cleanupScroll) {
    cleanupScroll()
    delete (window as any).__stickyHeaderCleanup__
  }
})
</script>

<template>
  <header 
    ref="headerRef"
    v-show="isVisible"
    class="sticky-header"
    :style="headerStyles"
  >
    <nav class="nav">
      <span 
        class="nav-item" 
        :style="navItemStyle('ice cream')"
        @click="handleNavigation('ice cream')"
      >
        ice cream
      </span>
      <span 
        class="nav-item" 
        :style="navItemStyle('milk tea')"
        @click="handleNavigation('milk tea')"
      >
        milk tea
      </span>
      <span 
        class="nav-item" 
        :style="navItemStyle('float')"
        @click="handleNavigation('float')"
      >
        float
      </span>
      <span 
        class="nav-item" 
        :style="navItemStyle('juice')"
        @click="handleNavigation('juice')"
      >
        juice
      </span>
    </nav>
  </header>
</template>

<style scoped>
.sticky-header {
  position: fixed !important;
  top: 0 !important;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  width: 100%;
  max-width: 700px;
  min-width: 300px;
  height: clamp(50px, 8vw, 60px);
  border-radius: 0 0 15px 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.nav {
  display: flex;
  gap: clamp(16px, 4vw, 28px);
  font-family: 'Inter', system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
  font-size: clamp(14px, 3vw, 18px);
}

.nav-item {
  text-transform: lowercase;
  cursor: pointer;
  padding: clamp(6px, 2vw, 8px) clamp(12px, 3vw, 16px);
  border-radius: 8px;
  transition: all 0.2s ease;
  user-select: none;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  color: rgba(0, 0, 0, 0.8);
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.nav-item:active {
  transform: translateY(0);
}

/* Ensure header stays at top */
.sticky-header {
  will-change: transform;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

/* Responsive adjustments for very small screens */
@media (max-width: 480px) {
  .nav {
    gap: 12px;
    font-size: 12px;
  }
  
  .nav-item {
    padding: 4px 8px;
  }
  
  .sticky-header {
    height: 45px;
  }
}
</style>
