<script setup lang="ts">
import { onMounted, ref, computed, onBeforeUnmount, inject, watch } from 'vue'
import Getdata, { type DatabaseRow } from './Getdata.vue'

type IceCreamRow = DatabaseRow

const items = ref<IceCreamRow[]>([])
const currentIndex = ref(0)
const loading = ref(true)
const errorMessage = ref('')

// Computed property for current item
const item = computed(() => items.value[currentIndex.value] || null)

// Next item function
const nextItem = () => {
  if (items.value.length <= 1) return
  
  // Start the background fade out
  inView.value = false
  
  // Wait for the fade out to complete before changing the image
  setTimeout(() => {
    currentIndex.value = (currentIndex.value + 1) % items.value.length
    // Force a reflow to ensure the transition works
    void document.body.offsetHeight
    // Fade the new content in
    inView.value = true
  }, 400) // Match this with the CSS transition duration
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
  },
  priceBg: computed(() => item.value?.['price-bgcolor'] || '#000'),
  textColor: computed(() => item.value?.['text-color'] || '#333')
})

const updateSectionColors = inject<(section: string) => void>('updateSectionColors')

// Update colors when this section comes into view
watch(inView, (newVal: boolean) => {
  if (newVal && updateSectionColors) {
    updateSectionColors('ice cream')
  }
})

// Event handlers for Getdata component
const handleDataLoaded = (data: DatabaseRow[]) => {
	if (data && data.length > 0) {
		items.value = data as IceCreamRow[]
		currentIndex.value = 0
	} else {
		errorMessage.value = 'No ice-cream rows returned. Check table data and RLS policies.'
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
				if (entry.isIntersecting) {
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
		transition: 'background-image 0.8s ease-in-out',
		backgroundSize: 'cover',
		backgroundPosition: 'center',
		backgroundRepeat: 'no-repeat'
	}
})

const priceBg = computed(() => item.value?.['price-bgcolor'] || '#000')
const textColor = computed(() => item.value?.['text-color'] || '#333')


const overlayVisible = computed<boolean>(() => Boolean(item.value && item.value.image))
const overlaySrc = computed<string>(() => (item.value?.image ? item.value.image : ''))
</script>

<template>
	<!-- Data fetching component -->
	<Getdata 
		table-name="ice-cream" 
		:columns="'*'" 
		:limit="10"
		@data-loaded="handleDataLoaded"
		@error="handleError"
		@loading="handleLoading"
	/>
	
	<section ref="rootRef" id="icecream-section" class="icecream-root" :class="{ animate: inView }" :style="containerStyle">
		<div class="icecream-wrap">
			<!-- Main image from database with animation -->
			<div v-if="overlayVisible" class="main-image-container">
				<img :src="overlaySrc" alt="ice cream" class="main-image" :class="{ 'zoom-in': inView }" />
			</div>

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
				<button 
  class="next-btn" 
  @click="nextItem"
  :disabled="items.length <= 1" 
  :class="{ 'disabled': items.length <= 1 }"
>
  next flavor
</button>
			</div>

			<div v-if="loading" class="status">Loading…</div>
			<div v-else-if="errorMessage" class="status error">{{ errorMessage }}</div>
		</div>
	</section>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Kavoon&display=swap');

/* Layout */
.icecream-root {
	position: relative;
	width: 100vw;
	height: 100vh;
	display: flex;
	background-position: center;
	background-size: cover;
	background-repeat: no-repeat;
	overflow: hidden;
	transition: background-image 0.8s ease-in-out;
}

.icecream-wrap {
	width: 100%;
	height: 100vh;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 20px;
	padding: 20px 16px;
	box-sizing: border-box;
	margin-top: -40px; /* Pull content up slightly */
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

/* Main image container */
.main-image-container {
	width: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	flex: 1;
	padding: 0;
}

.main-image {
	max-width: 80%; /* Reduced by 20% */
	height: auto;
	max-height: 60vh; /* Reduced by 20% from 75vh */
	object-fit: contain;
	transform-origin: center bottom;
	margin-top: 50px;
}

.image-frame {
	position: relative;
	background: transparent; /* transparent stage */
	width: min(515px, 90vw);
	min-width: 320px;
	height: 100%;
	overflow: visible; /* allow overlay inside stage, but root hides overflow */
}

.image-frame--hidden { display: none; }

/* Overlay image centered in front of everything */
.image-overlay {
	position: absolute;
	inset: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	pointer-events: none;
	z-index: 5;
}

.overlay-img {
	height: 90vh; /* 90% of viewport height */
	width: auto;
	max-width: 92vw;
	transform-origin: 50% 90%;
	filter: drop-shadow(0 18px 30px rgba(0,0,0,0.15));
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
	transition: all 0.3s ease;
	cursor: pointer;
}

.next-btn:not(.disabled):hover {
	transform: translateY(-2px);
	box-shadow: 0 7px 12px rgba(0,0,0,0.15);
	background-color: #f8f8f8;
}

.next-btn:not(.disabled):active {
	transform: translateY(1px);
	box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.next-btn.disabled {
	opacity: 0.5;
	cursor: not-allowed;
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

