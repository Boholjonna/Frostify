<script setup lang="ts">
import { computed } from 'vue'
import type { DatabaseRow } from './Getdata.vue'

const props = defineProps<{
  sectionId: string
  inView: boolean
  containerStyle: Record<string, string>
  priceBg: string
  textColor: string
  item: DatabaseRow | null
  loading: boolean
  errorMessage: string
  itemsLength: number
}>()

const emit = defineEmits<{
  next: []
}>()

const overlayVisible = computed<boolean>(() => Boolean(props.item && props.item.image))
const overlaySrc = computed<string>(() => (props.item?.image ? props.item.image : ''))
</script>

<template>
  <section :id="props.sectionId" class="product-root" :class="{ animate: props.inView }" :style="props.containerStyle">
    <div class="product-wrap">
      <!-- Main image from database with animation (no container) -->
      <img v-if="overlayVisible" :src="overlaySrc" alt="product" class="main-image" :class="{ 'zoom-in': props.inView }" />

      <!-- Prices section -->
      <div class="prices drop-down">
        <div class="price-circle" :style="{ background: props.priceBg }">
          <span class="price-text">{{ props.item?.['price-s'] || 'S-—' }}</span>
        </div>
        <div class="price-circle" :style="{ background: props.priceBg }">
          <span class="price-text">{{ props.item?.['price-m'] || 'M-—' }}</span>
        </div>
        <div class="price-circle" :style="{ background: props.priceBg }">
          <span class="price-text">{{ props.item?.['price-l'] || 'L-—' }}</span>
        </div>
      </div>

      <div class="flavor-row fade-up">
        <h1 class="flavor" :style="{ color: props.textColor }">{{ props.item?.flavor }}</h1>
        <button 
          class="next-btn" 
          @click="emit('next')"
          :disabled="props.itemsLength <= 1" 
          :class="{ 'disabled': props.itemsLength <= 1 }"
        >
          next flavor
        </button>
      </div>

      <div v-if="props.loading" class="status">Loading…</div>
      <div v-else-if="props.errorMessage" class="status error">{{ props.errorMessage }}</div>
    </div>
  </section>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Kavoon&display=swap');

/* Layout */
.product-root {
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

.product-wrap {
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
  flex: 0 0 auto;
}

.flavor {
  font-family: 'Kavoon', Georgia, 'Times New Roman', serif;
  font-size: clamp(28px, 6vw, 50px);
  -webkit-text-stroke: 1.5px #ffffff;
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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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


