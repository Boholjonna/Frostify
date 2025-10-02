<script setup lang="ts">
import { onMounted, ref, computed, onBeforeUnmount } from 'vue'
import Getdata, { type DatabaseRow } from './Getdata.vue'
import Layout from './Layout.vue'

type MilkteaRow = DatabaseRow

const items = ref<MilkteaRow[]>([])
const currentIndex = ref(0)
const loading = ref(true)
const errorMessage = ref('')
const item = computed(() => items.value[currentIndex.value] || null)

// in-view detection
const rootRef = ref<HTMLElement | null>(null)
const inView = ref(false)
let observer: IntersectionObserver | null = null

// Event handlers for Getdata component
const handleDataLoaded = (data: DatabaseRow[]) => {
	if (data && data.length > 0) {
		items.value = data as MilkteaRow[]
		currentIndex.value = 0
	} else {
		errorMessage.value = 'No milk tea rows returned. Check table data and RLS policies.'
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
	window.addEventListener('trigger-milktea-anim', trigger)
	// store off handler for cleanup
	;(window as any).__milkteaTrigger__ = trigger
})

onBeforeUnmount(() => {
	if (observer && rootRef.value) observer.unobserve(rootRef.value)
	observer = null
	const trigger = (window as any).__milkteaTrigger__
	if (trigger) window.removeEventListener('trigger-milktea-anim', trigger)
})

const containerStyle = computed(() => {
    const backgroundImageUrl = item.value?.bg || ''
    return {
		backgroundImage: backgroundImageUrl ? `url(${backgroundImageUrl})` : 'none'
    }
})

const priceBg = computed(() => item.value?.['price-bgcolor'] || '#000')
const textColor = computed(() => item.value?.['text-color'] || '#333')


// Ref to access Getdata's exposed methods
const getdataRef = ref<InstanceType<typeof Getdata> | null>(null)

// Next button delegates to Getdata's nextRow to keep indices in sync
const nextItem = () => {
	if (!getdataRef.value) return
	inView.value = false
	setTimeout(() => {
		getdataRef.value?.nextRow()
		void document.body.offsetHeight
		inView.value = true
	}, 400)
}

</script>

<template>
	<!-- Data fetching component -->
	<Getdata 
		ref="getdataRef"
		table-name="milk-tea"
		:columns="'*'"
		@data-loaded="handleDataLoaded"
		@row-changed="handleRowChanged"
		@error="handleError"
		@loading="handleLoading"
	/>

	<section ref="rootRef">
		<Layout 
			section-id="milktea-section"
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
