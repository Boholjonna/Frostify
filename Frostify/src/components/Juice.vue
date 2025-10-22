<script setup lang="ts">
import { onMounted, ref, computed, onBeforeUnmount, watch } from 'vue'
import Getdata, { type DatabaseRow } from './Getdata.vue'

type JuiceRow = DatabaseRow

// Props
interface Props {
  preloadedData?: DatabaseRow[]
}

const props = withDefaults(defineProps<Props>(), {
  preloadedData: () => []
})

const item = ref<JuiceRow | null>(null)
const loading = ref(false)
const errorMessage = ref('')
const imagesLoaded = ref(true)

// in-view detection
const rootRef = ref<HTMLElement | null>(null)
const inView = ref(false)
let observer: IntersectionObserver | null = null

// Preload all images
const preloadImages = async (data: JuiceRow[]) => {
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
    item.value = data[0] as JuiceRow
    imagesLoaded.value = true
  }
}, { immediate: true })

// Event handlers for Getdata component
const handleDataLoaded = async (data: DatabaseRow[]) => {
	if (data && data.length > 0) {
		item.value = data[0] as JuiceRow
		// Preload all images before showing content
		await preloadImages([item.value])
	} else {
		errorMessage.value = 'No juice rows returned. Check table data and RLS policies.'
	}
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

	// listen for explicit trigger from About button
	const trigger = () => { inView.value = false; requestAnimationFrame(() => inView.value = true) }
	window.addEventListener('trigger-juice-anim', trigger)
	// store off handler for cleanup
	;(window as any).__juiceTrigger__ = trigger
})

onBeforeUnmount(() => {
	if (observer && rootRef.value) observer.unobserve(rootRef.value)
	observer = null
	const trigger = (window as any).__juiceTrigger__
	if (trigger) window.removeEventListener('trigger-juice-anim', trigger)
})

const containerStyle = computed(() => {
	const backgroundImageUrl = item.value?.bg || ''
	return {
		backgroundImage: backgroundImageUrl ? `url(${backgroundImageUrl})` : 'none',
		opacity: imagesLoaded.value ? '1' : '0',
		transition: 'background-image 0.8s ease-in-out, opacity 0.3s ease-in-out'
	}
})

const priceBg = computed(() => item.value?.['price-bgcolor'] || '#000')
const textColor = computed(() => item.value?.['text-color'] || '#333')


const overlayVisible = computed<boolean>(() => Boolean(item.value && item.value.image))
const overlaySrc = computed<string>(() => (item.value?.image ? item.value.image : ''))
</script>

<template>
	<!-- Data fetching component (only if no preloaded data) -->
	<Getdata 
		v-if="!preloadedData || preloadedData.length === 0"
		table-name="juice" 
		:columns="'*'" 
		:limit="1"
		@data-loaded="handleDataLoaded"
		@error="handleError"
		@loading="handleLoading"
	/>
	
	<section ref="rootRef" id="juice-section" class="juice-root" :class="{ animate: inView }" :style="containerStyle">
		<div class="juice-wrap">
			<!-- Main image from database with animation -->
			<img v-if="overlayVisible" :src="overlaySrc" alt="juice" class="main-image" :class="{ 'zoom-in': inView }" />

			<!-- Prices section -->
			<div class="prices drop-down">
				<div class="price-circle" :style="{ background: priceBg }">
					<span class="price-text">{{ item?.['price-s'] || 'S-—' }}</span>
				</div>
				<div class="price-circle" :style="{ background: priceBg }">
					<span class="price-text">{{ item?.['price-m'] || 'M-—' }}</span>
				</div>
				<div class="price-circle" :style="{ background: priceBg }">
					<span class="price-text">{{ item?.['price-l'] || 'L-—' }}</span>
				</div>
			</div>

			<div class="flavor-row fade-up">
				<h1 class="flavor" :style="{ color: textColor }">{{ item?.flavor }}</h1>
				<button class="next-btn">next flavor</button>
			</div>

			<div v-if="loading" class="status">Loading…</div>
			<div v-else-if="errorMessage" class="status error">{{ errorMessage }}</div>
		</div>
	</section>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Kavoon&display=swap');

/* Layout */
.juice-root {
	position: relative; /* anchor overlay */
	width: 100vw;
	height: 100vh;
	display: flex;
	background-position: center;
	background-size: cover;
	background-repeat: no-repeat;
	overflow: hidden; /* keep everything inside the viewport */
}

.juice-wrap {
	width: 100%;
	height: 100vh;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 20px;
	padding: 20px 16px;
	box-sizing: border-box;
	margin-top: -40px;
	position: relative;
	z-index: 2;
}


.prices {
	display: flex;
	gap: 20px;
	align-items: center;
	justify-content: center;
	margin: 0;
	flex: 0 0 auto;
	position: relative;
	z-index: 2;
}

.price-circle {
	width: 50px;
	height: 50px;
	border-radius: 50%;
	display: grid;
	place-items: center;
}

.price-text {
	color: #ffffff;
	font-family: 'Inter', system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
	font-size: 12px;
	font-weight: 600;
}

.main-image {
	max-width: 80%;
	height: auto;
	max-height: 60vh;
	object-fit: contain;
	transform-origin: center bottom;
	margin-top: 50px;
	transition: opacity 0.3s ease-in-out;
}

/* Zoom-in from front (scale) */
@keyframes zoomInFront {
	0% { transform: scale(0.85); opacity: 0; }
	60% { transform: scale(1.03); opacity: 1; }
	100% { transform: scale(1); }
}

/* Trigger animations only when in view */
.animate .zoom-in { animation: zoomInFront 800ms cubic-bezier(.2,.7,.3,1) both; }

.flavor-row {
	width: 100%;
	max-width: 900px;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 24px;
	flex: 0 0 auto; /* keep its natural height */
}

.flavor {
	font-family: 'Kavoon', Georgia, 'Times New Roman', serif;
	font-size: clamp(28px, 6vw, 50px);
	-webkit-text-stroke: 1.5px #ffffff; /* reduced by 50% */
	text-shadow: 0 0 0 #fff;
}

.next-btn {
	background: #ffffff;
	color: #3a2f2f;
	border: 1px solid #D2C9C9;
	border-radius: 24px;
	padding: 10px 18px;
	font-family: 'Inter', system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
	box-shadow: 0 5px 0 rgba(0, 0, 0, 0.08);
	transition: transform .25s ease, box-shadow .25s ease;
}

.next-btn:hover {
	transform: translateY(-2px);
	box-shadow: 0 7px 10px rgba(0,0,0,0.12);
}

.status {
	font-family: 'Inter', system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
	margin-top: 4px;
	flex: 0 0 auto;
}

.status.error {
	color: #b00020;
}

/* Harmonized animations */
@keyframes fadeUp {
	0% { opacity: 0; transform: translateY(12px); }
	100% { opacity: 1; transform: translateY(0); }
}

@keyframes fadeDown {
	0% { opacity: 0; transform: translateY(-12px); }
	100% { opacity: 1; transform: translateY(0); }
}

@keyframes popIn {
	0% { opacity: 0; transform: scale(0.92); }
	60% { opacity: 1; transform: scale(1.02); }
	100% { transform: scale(1); }
}

@keyframes dropDown {
	0% { opacity: 0; transform: translateY(-30px); }
	70% { opacity: 1; transform: translateY(6px); }
	100% { transform: translateY(0); }
}

/* Only animate when parent gets 'animate' */
.animate .fade-up { animation: fadeUp .6s ease both; animation-delay: .15s; }
.animate .fade-down { animation: fadeDown .6s ease both; }
.animate .pop-in { animation: popIn .7s cubic-bezier(.2,.7,.3,1) both; animation-delay: .2s; }
.animate .drop-down { animation: dropDown .7s ease both; animation-delay: .1s; }
</style>
