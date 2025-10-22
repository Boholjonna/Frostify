<script setup lang="ts">
import { onMounted, ref, computed, onBeforeUnmount, watch } from 'vue'
import Getdata, { type DatabaseRow } from './Getdata.vue'
import Layout from './Layout.vue'

type FloatRow = DatabaseRow

// Props
interface Props {
  preloadedData?: DatabaseRow[]
}

const props = withDefaults(defineProps<Props>(), {
  preloadedData: () => []
})

const items = ref<FloatRow[]>([])
const currentIndex = ref(0)
const loading = ref(false)
const errorMessage = ref('')
const imagesLoaded = ref(true)
const isTransitioning = ref(false)

// Computed property for current item
const item = computed(() => items.value[currentIndex.value] || null)

// Ref to access Getdata's exposed methods
const getdataRef = ref<InstanceType<typeof Getdata> | null>(null)

// Next item function
const nextItem = () => {
  if (!items.value.length || isTransitioning.value) return
  isTransitioning.value = true
  inView.value = false
  
  // Use shorter timeout for smoother transition
  setTimeout(() => {
    currentIndex.value = (currentIndex.value + 1) % items.value.length
    if (getdataRef.value) {
      getdataRef.value.nextRow()
    }
    requestAnimationFrame(() => {
      inView.value = true
      // Reset transition flag after animation completes
      setTimeout(() => {
        isTransitioning.value = false
      }, 1000)
    })
  }, 150)
}

// in-view detection
const rootRef = ref<HTMLElement | null>(null)
const inView = ref(false)
let observer: IntersectionObserver | null = null

// Expose methods and properties
defineExpose({
  triggerAnimation: () => {
    inView.value = false
    requestAnimationFrame(() => {
      inView.value = true
    })
  }
})

// Preload all images
const preloadImages = async (data: FloatRow[]) => {
	imagesLoaded.value = false
	const imageUrls: string[] = []
	
	// Collect all image URLs and background URLs
	data.forEach(item => {
		if (item.image) imageUrls.push(item.image)
		if (item.bg) imageUrls.push(item.bg)
	})
	
	// Preload all images
	const promises = imageUrls.map(url => {
		return new Promise<void>((resolve) => {
			const img = new Image()
			img.onload = () => resolve()
			img.onerror = () => resolve() // Continue even if an image fails
			img.src = url
		})
	})
	
	try {
		await Promise.all(promises)
		imagesLoaded.value = true
	} catch (error) {
		console.error('Error preloading images:', error)
		imagesLoaded.value = true // Continue anyway
	}
}

// Initialize with preloaded data
watch(() => props.preloadedData, (data) => {
  if (data && data.length > 0) {
    items.value = data as FloatRow[]
    currentIndex.value = 0
    imagesLoaded.value = true
  }
}, { immediate: true })

// Event handlers for Getdata component
const handleDataLoaded = async (data: DatabaseRow[]) => {
    if (data && data.length > 0) {
        items.value = data as FloatRow[]
        currentIndex.value = 0
        // Preload all images before showing content
        await preloadImages(items.value)
    } else {
        errorMessage.value = 'No float rows returned. Check table data and RLS policies.'
    }
}

const handleRowChanged = (row: DatabaseRow | null) => {
  if (!row || !items.value.length) return
  const idx = items.value.findIndex(r => r.id === row.id)
  if (idx >= 0) currentIndex.value = idx
}

const handleError = (error: string) => {
	errorMessage.value = error
}

const handleLoading = (isLoading: boolean) => {
	loading.value = isLoading
}

onMounted(() => {
	// set up intersection observer to trigger animations on view
	observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting && imagesLoaded.value) {
					inView.value = true // trigger once
					if (observer && rootRef.value) observer.unobserve(rootRef.value)
				}
			})
		},
		{ threshold: 0.35 }
	)
	if (rootRef.value) observer.observe(rootRef.value)
})

onBeforeUnmount(() => {
	if (observer && rootRef.value) observer.unobserve(rootRef.value)
	observer = null
})

const containerStyle = computed(() => {
	const backgroundImageUrl = item.value?.bg || ''
	return {
		backgroundImage: backgroundImageUrl ? `url(${backgroundImageUrl})` : 'none',
		transition: 'background-image 0.8s ease-in-out, opacity 0.3s ease-in-out',
		backgroundSize: 'cover',
		backgroundPosition: 'center',
		backgroundRepeat: 'no-repeat',
		opacity: imagesLoaded.value ? '1' : '0'
	}
})

const priceBg = computed(() => item.value?.['price-bgcolor'] || '#000')
const textColor = computed(() => item.value?.['text-color'] || '#333')
</script>

<template>
	<!-- Data fetching component (only if no preloaded data) -->
    <Getdata 
        v-if="!preloadedData || preloadedData.length === 0"
        ref="getdataRef"
        table-name="float"
        :columns="'*'"
        @data-loaded="handleDataLoaded"
        @row-changed="handleRowChanged"
        @error="handleError"
        @loading="handleLoading"
    />
	
	<section ref="rootRef">
		<Layout 
			section-id="float-section"
			:in-view="inView"
			:container-style="containerStyle"
			:price-bg="priceBg"
			:text-color="textColor"
			:item="item"
			:loading="loading"
			:error-message="errorMessage"
			:items-length="items.length"
			@next="nextItem"
		/>
	</section>
</template>

<style scoped>
/* layout handled by Layout.vue */
</style>
