<script setup lang="ts">
import { onMounted, ref, computed, onBeforeUnmount } from 'vue'
import Getdata, { type DatabaseRow } from './Getdata.vue'
import Layout from './Layout.vue'

type IceCreamRow = DatabaseRow

const items = ref<IceCreamRow[]>([])
const currentIndex = ref(0)
const loading = ref(true)
const errorMessage = ref('')
const imagesLoaded = ref(false)

// Computed property for current item
const item = computed(() => items.value[currentIndex.value] || null)

// Ref to access Getdata's exposed methods
const getdataRef = ref<InstanceType<typeof Getdata> | null>(null)

// Next item function delegates to Getdata's nextRow
const nextItem = () => {
  if (!getdataRef.value) return
  inView.value = false
  setTimeout(() => {
    getdataRef.value?.nextRow()
    void document.body.offsetHeight
    inView.value = true
  }, 400)
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
const preloadImages = async (data: IceCreamRow[]) => {
	imagesLoaded.value = false
	const imageUrls: string[] = []
	
	// Collect all image URLs and background URLs
	data.forEach(item => {
		if (item.image) imageUrls.push(item.image)
		if (item.bg) imageUrls.push(item.bg)
	})
	
	// Preload all images
	const promises = imageUrls.map(url => {
		return new Promise<void>((resolve, reject) => {
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

// Event handlers for Getdata component
const handleDataLoaded = async (data: DatabaseRow[]) => {
    if (data && data.length > 0) {
        items.value = data as IceCreamRow[]
        currentIndex.value = 0
        // Preload all images before showing content
        await preloadImages(items.value)
    } else {
        errorMessage.value = 'No ice-cream rows returned. Check table data and RLS policies.'
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
	<!-- Data fetching component -->
    <Getdata 
        ref="getdataRef"
        table-name="ice-cream"
        :columns="'*'"
        @data-loaded="handleDataLoaded"
        @row-changed="handleRowChanged"
        @error="handleError"
        @loading="handleLoading"
    />
	
	<section ref="rootRef">
		<Layout 
			section-id="icecream-section"
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



