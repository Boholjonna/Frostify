<script setup lang="ts">
import { ref, computed } from 'vue'

// Props for the component
interface Props {
  currentSection: string
}

const props = withDefaults(defineProps<Props>(), {
  currentSection: 'ice cream'
})

// Emits for navigation
const emit = defineEmits<{
  navigate: [section: string]
}>()

// Refs
const headerRef = ref<HTMLElement | null>(null)

// Computed to check if we're on the about section
const isAboutSection = computed(() => props.currentSection.toLowerCase() === 'about')

const navItemStyle = (label: string) => {
  const isActive = label.toLowerCase() === props.currentSection.toLowerCase()
  return {
    'font-weight': isActive ? 'bold' : 'normal',
    'border-bottom': isActive ? '2px solid rgba(0, 0, 0, 0.8)' : '2px solid transparent',
    'padding-bottom': '4px'
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
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }
}
</script>

<template>
  <header 
    ref="headerRef"
    v-show="!isAboutSection"
    class="sticky-header"
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
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background-color: rgba(255, 247, 247, 0.247);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  width: 100%;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s ease, transform 0.3s ease;
  transform: translateY(0);
  padding: 0 20px;
  box-sizing: border-box;
  will-change: transform, opacity;
}

.sticky-header.v-leave-active,
.sticky-header.v-enter-active {
  transition: opacity 0.2s ease, transform 0.3s ease;
}

.sticky-header.v-leave-to,
.sticky-header.v-enter-from {
  opacity: 0;
  transform: translateY(-100%);
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
  font-weight: bold;
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
  /* Ensure header stays above all other content */
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
}

/* Responsive adjustments for smaller screens */
@media (max-width: 768px) {
  .sticky-header {
    height: 50px;
    padding: 0 15px;
  }
  
  .nav {
    width: 100%;
    justify-content: space-around;
    gap: 8px;
    font-size: 14px;
  }
  
  .nav-item {
    padding: 6px 10px;
    font-size: 13px;
  }
}

/* Extra small devices */
@media (max-width: 480px) {
  .sticky-header {
    height: 45px;
  }
  
  .nav {
    font-size: 12px;
  }
  
  .nav-item {
    padding: 4px 8px;
    font-size: 12px;
  }
}
</style>
