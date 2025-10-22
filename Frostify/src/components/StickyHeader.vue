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
    'about': 'about-section',
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
    <div class="header-inner">
      <div class="left-spacer" aria-hidden="true"></div>

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

      <button class="home-btn" aria-label="Home" @click="handleNavigation('about')">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 3.172l8 7.2V20a1 1 0 0 1-1 1h-4.5a.5.5 0 0 1-.5-.5v-5a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v5a.5.5 0 0 1-.5.5H3a1 1 0 0 1-1-1v-9.628l8-7.2a2 2 0 0 1 2 0zM12 1a4 4 0 0 0-2.667.992l-8 7.2A2 2 0 0 0 1 10.728V20a3 3 0 0 0 3 3h4.5A2.5 2.5 0 0 0 11 20.5v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5A2.5 2.5 0 0 0 17.5 23H22a3 3 0 0 0 3-3v-9.272a2 2 0 0 0-.333-1.536l-8-7.2A4 4 0 0 0 12 1z"/>
        </svg>
      </button>
    </div>
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

.header-inner {
  width: 100%;
  max-width: 1080px;
  display: grid;
  grid-template-columns: 36px 1fr 36px;
  align-items: center;
}

.left-spacer {
  width: 36px;
  height: 36px;
}

.nav { 
  justify-self: center;
}

.home-btn {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  cursor: pointer;
  background: transparent;
  border: none;
  padding: 0;
  color: rgba(0, 0, 0, 0.9);
}

.home-btn:hover {
  transform: translateY(-1px);
}

.home-btn:active {
  transform: translateY(0);
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
