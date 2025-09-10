<script setup lang="ts">

import { ref } from 'vue'

const isActive = ref(false)
// No props needed
</script>




<template>
  <section class="about-section">
    <div class="about-content">
      <div class="left-content">
        <h1 class="here-in">Here in</h1>
        <div class="logo-container">
          <h1 class="frostify-text">Frostify</h1>
        </div>
        <p class="tagline">
          Cool down and refresh with our cold and drinks, made to beat the heat and brighten your day !
        </p>
        <button
    class="view-products-btn"
    :class="{ active: isActive }"
    @click="isActive = !isActive"
  >
    View Products
  </button>
        <div class="location">
          <img src="/about-images/location.png" alt="Location Icon" class="location-icon">
          <p class="location-text">visit us at Hagnaya, San Remigio, Cebu (near 7-Eleven)</p>
        </div>
        <br>
      </div>
      <div class="right-content">
        <img src="/about-images/refresh.png" alt="Refresh" class="refresh-image">
      </div>
    </div>
  </section>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Kavoon&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Inter&display=swap');

.about-section {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  background-image: url('/about-images/bg.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
  overflow-y: auto;
}

.about-content {
  width: 100%;
  height: auto;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  padding: 2rem;
}

.left-content {
  flex: 1;
  min-width: 300px;
  max-width: 800px;
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-left: 50px;
  border-bottom: 1px solid rgb(255, 0, 72);
}

.here-in {
  font-family: 'Kavoon', cursive;
  font-size: clamp(40px, 8vw, 80px);
  color: white;
  -webkit-text-stroke: 2.5px #FF8787;
  margin-top: 3rem;
  margin-bottom: 0;
  opacity: 0;
  animation: dropDown 1s ease forwards;
}

.logo-container {
  position: relative;
  width: fit-content;
  margin: 2rem auto;
  overflow: hidden;
}

.frostify-text {
  font-family: 'Kavoon', cursive;
  font-size: clamp(60px, 15vw, 120px);
  background: linear-gradient(90deg, #E94D8B, #EB507D, #ED5370, #EE5563, #F05756, #F15A49, #F35D3C);
  background-size: 200% auto;
  color: transparent;
  -webkit-background-clip: text;
  background-clip: text;
  text-align: center;
  animation: slideRight 1.5s ease forwards, gradientMove 5s linear infinite;
  margin: 0;
  padding: 0;
  line-height: 1.2;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

@keyframes gradientMove {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.tagline {
  font-family: 'Kavoon', cursive;
  color: #ff3845;
  font-size: clamp(18px, 5vw, 30px);
  -webkit-text-stroke: 0.7px white;
  margin: 0 0 2rem 0;
  opacity: 0;
  animation: fadeIn 1s ease 0.5s forwards;
  font-weight: bold;
}

.view-products-btn {
  font-family: 'Kavoon', cursive;
  padding: 1rem 2rem;
  font-size: 1.2rem;
  background-color: #f0334c;
  color: white;
  letter-spacing: 1px;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  opacity: 0;
  animation: fadeIn 1s ease 1s forwards;
  transition: transform 0.3s ease;
}

.view-products-btn.active {
  background-color: #ff025a;
}

.view-products-btn:hover {
  transform: scale(1.05);
  background-color: #f50163;
  
}

.view-products-btn:focus {
  outline: none;
}


.location {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  opacity: 0;
  animation: slideUp 1s ease 1.5s forwards;
  justify-content: center;
}

.location-icon {
  width: 24px;
  height: 24px;
}

.location-text {
  color: white;
  font-size: 1rem;
  text-align: center;
  font-family: 'Inter', sans-serif;
}

.right-content {
  flex: 1;
  min-width: 300px;
  max-width: 942px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.refresh-image {
  max-width: 640px;
  max-height: 950px;
  width: 100%;
  height: auto;
  object-fit: contain;
}

@keyframes dropDown {
  0% {
    opacity: 0;
    transform: translateY(-50px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideRight {
  0% {
    opacity: 0;
    transform: translateX(-100px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@keyframes slideUp {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 1200px) {
  .about-content {
    justify-content: center;
  }
  
  .left-content, .right-content {
    flex: 0 1 100%;
    text-align: center;
  }

  .location {
    justify-content: center;
    
  }

  .logo-container {
    margin: 2rem auto;
  }
}

@media (max-width: 900px) {
  .left-content {
    margin-left: 0;
  }
}


</style>
