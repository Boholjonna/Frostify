<script setup lang="ts">
import { onMounted, ref, computed, onBeforeUnmount } from 'vue'
import Getdata, { type DatabaseRow } from './Getdata.vue'

type FloatRow = DatabaseRow

const item = ref<FloatRow | null>(null)
const loading = ref(true)
const errorMessage = ref('')

// in-view detection
const rootRef = ref<HTMLElement | null>(null)
const inView = ref(false)
let observer: IntersectionObserver | null = null

// Event handlers for Getdata component
const handleDataLoaded = (data: DatabaseRow[]) => {
	if (data && data.length > 0) {
		item.value = data[0] as FloatRow
	} else {
		errorMessage.value = 'No float rows returned. Check table data and RLS policies.'
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

	// listen for explicit trigger from About button
	const trigger = () => { inView.value = false; requestAnimationFrame(() => inView.value = true) }
	window.addEventListener('trigger-float-anim', trigger)
	// store off handler for cleanup
	;(window as any).__floatTrigger__ = trigger
})

onBeforeUnmount(() => {
	if (observer && rootRef.value) observer.unobserve(rootRef.value)
	observer = null
	const trigger = (window as any).__floatTrigger__
	if (trigger) window.removeEventListener('trigger-float-anim', trigger)
})

const containerStyle = computed(() => {
	const backgroundImageUrl = item.value?.bg || ''
	return {
		backgroundImage: backgroundImageUrl ? `url(${backgroundImageUrl})` : 'none'
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
		table-name="float" 
		:columns="'*'" 
		:limit="1"
		@data-loaded="handleDataLoaded"
		@error="handleError"
		@loading="handleLoading"
	/>
	
	<section ref="rootRef" id="float-section" class="float-root" :class="{ animate: inView }" :style="containerStyle">
		<div class="float-wrap">
			<div class="prices drop-down" style="margin-top: clamp(50px, 8vw, 60px);">
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

			<!-- Keep the stage for layout but hide its image -->
			<div class="image-stage pop-in">
				<div class="image-frame image-frame--hidden"></div>
			</div>

			<div class="flavor-row fade-up">
				<h1 class="flavor" :style="{ color: textColor }">{{ item?.flavor }}</h1>
				<button class="next-btn">next flavor</button>
			</div>

			<div v-if="loading" class="status">Loading…</div>
			<div v-else-if="errorMessage" class="status error">{{ errorMessage }}</div>
		</div>

		<!-- Centered overlay image at 90% viewport height -->
		<div v-if="overlayVisible" class="image-overlay">
			<img class="overlay-img" :class="[inView ? 'rotate-rise' : '']" :src="overlaySrc" alt="float" />
		</div>
	</section>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Kavoon&display=swap');

/* Layout */
.float-root {
	position: relative; /* anchor overlay */
	width: 100vw;
	height: 100vh;
	display: flex;
	background-position: center;
	background-size: cover;
	background-repeat: no-repeat;
	overflow: hidden; /* keep everything inside the viewport */
}

.float-wrap {
	width: 100%;
	height: 100vh; /* strictly the viewport height */
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: flex-start;
	gap: 14px; /* slightly tighter to avoid overflow */
	padding: 16px 16px 16px; /* reduce bottom padding to fit */
	box-sizing: border-box;
}


.prices {
	display: flex;
	gap: 28px;
	align-items: center;
	justify-content: center;
	margin-top: 2px;
	flex: 0 0 56px; /* reserve space so section won't overflow */
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

/* Image stage placeholder (hidden image) */
.image-stage {
	width: 100%;
	flex: 1 1 auto; /* take the remaining vertical space */
	min-height: 0; /* allow flexbox to shrink if needed */
	display: flex;
	align-items: center;
	justify-content: center;
	pointer-events: none;
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

/* Rise from left (-90deg) to upright (0deg) */
@keyframes riseUpright {
	0% { transform: rotate(-90deg); opacity: 0; }
	60% { transform: rotate(8deg); opacity: 1; }
	100% { transform: rotate(0deg); }
}

/* Trigger animations only when in view */
.animate .rotate-rise { animation: riseUpright 900ms cubic-bezier(.2,.7,.3,1) both; }

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
