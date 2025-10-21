<script setup lang="ts">
import { onMounted, ref, computed, onBeforeUnmount } from 'vue'
import Getdata, { type DatabaseRow } from './Getdata.vue'
import Layout from './Layout.vue'

type FloatRow = DatabaseRow

const items = ref<FloatRow[]>([])
const currentIndex = ref(0)
const loading = ref(true)
const errorMessage = ref('')
const imagesLoaded = ref(false)
const isTransitioning = ref(false)
const imageCache = new Map<string, HTMLImageElement>()

// Computed property for current item
const item = computed(() => items.value[currentIndex.value] || null)

// Ref to access Getdata's exposed methods
const getdataRef = ref<InstanceType<typeof Getdata> | null>(null)

// Next item function delegates to Getdata's nextRow with smooth transition
const nextItem = () => {
  if (!getdataRef.value || isTransitioning.value) return
  isTransitioning.value = true
  inView.value = false
  
  // Use shorter timeout for smoother transition
  setTimeout(() => {
    getdataRef.value?.nextRow()
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

// Optimized image preloading with caching and parallel loading
const preloadImages = async (data: FloatRow[]) => {
	imagesLoaded.value = false
	const imageUrls: string[] = []
	
	// Collect all unique image URLs
	data.forEach(item => {
		if (item.image && !imageCache.has(item.image)) imageUrls.push(item.image)
		if (item.bg && !imageCache.has(item.bg)) imageUrls.push(item.bg)
		if (item.overlay && !imageCache.has(item.overlay)) imageUrls.push(item.overlay)
	})
	
	// Skip if all images are already cached
	if (imageUrls.length === 0) {
		imagesLoaded.value = true
		return
	}
	
	// Preload images in parallel with aggressive caching
	const promises = imageUrls.map(url => {
		return new Promise<void>((resolve) => {
			const img = new Image()
			// Set crossOrigin for better caching
			img.crossOrigin = 'anonymous'
			// Enable browser caching
			img.decoding = 'async'
			
			img.onload = () => {
				imageCache.set(url, img)
				resolve()
			}
			img.onerror = () => {
				console.warn(`Failed to load image: ${url}`)
				resolve() // Continue even if an image fails
			}
			img.src = url
		})
	})
	
	try {
		await Promise.all(promises)
		imagesLoaded.value = true
	} catch (error) {
		console.error('Error preloading images:', error)
		imagesLoaded.value = true
	}
}

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
		transition: 'background-image 0.4s ease-in-out, opacity 0.2s ease-in-out',
		backgroundSize: 'cover',
		backgroundPosition: 'center',
		backgroundRepeat: 'no-repeat',
		opacity: imagesLoaded.value ? '1' : '0',
		willChange: 'background-image, opacity'
	}
})

const priceBg = computed(() => item.value?.['price-bgcolor'] || '#000')
const textColor = computed(() => item.value?.['text-color'] || '#333')
</script>

<template>
	<!-- Data fetching component -->
    <Getdata 
        ref="getdataRef"
        table-name="float"
        :columns="'*'"
        @data-loaded="handleDataLoaded"
        @row-changed="handleRowChanged"
        @error="handleError"
        @loading="handleLoading"
    />
	
	<section ref="rootRef">
		<!-- Only render Layout when data is loaded and images are preloaded -->
		<Layout 
			v-if="!loading && imagesLoaded"
			section-id="float-section"
			:in-view="inView"
			:container-style="containerStyle"
			:price-bg="priceBg"
			:text-color="textColor"
			:item="item"
			:loading="false"
			:error-message="errorMessage"
			:items-length="items.length"
			@next="nextItem"
		/>
		<!-- Loading state -->
		<div v-else-if="loading" class="loading-container">
			<div class="loading-spinner"></div>
			<p class="loading-text">Loading flavors...</p>
		</div>
		<!-- Error state -->
		<div v-else-if="errorMessage" class="error-container">
			<p class="error-text">{{ errorMessage }}</p>
		</div>
	</section>
</template>

<style scoped>
.loading-container,
.error-container {
	width: 100vw;
	height: 100vh;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 20px;
}

.loading-spinner {
	width: 50px;
	height: 50px;
	border: 4px solid rgba(255, 255, 255, 0.3);
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
	font-size: 18px;
	font-weight: 500;
}

.error-text {
	color: #ff6b6b;
	font-family: 'Inter', system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
	font-size: 16px;
	text-align: center;
	padding: 0 20px;
}
</style>
