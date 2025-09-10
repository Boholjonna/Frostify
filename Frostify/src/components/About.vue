<script setup lang="ts">
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
        <button class="view-products-btn">view products</button>
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
  overflow: hidden;
}

.about-content {
  width: 100%;
  height: 100%;
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
}

.here-in {
  font-family: 'Kavoon', cursive;
  font-size: clamp(40px, 8vw, 80px);
  color: white;
  -webkit-text-stroke: 1px #FF8787;
  margin-bottom: 1rem;
  opacity: 0;
  animation: dropDown 1s ease forwards;
}

.logo-container {
  position: relative;
  width: 100%;
  margin: 2rem 0;
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
  text-align: left;
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
  color: #ED1F2D;
  font-size: clamp(18px, 3vw, 24px);
  -webkit-text-stroke: 2px white;
  margin: 2rem 0;
  opacity: 0;
  animation: fadeIn 1s ease 0.5s forwards;
}

.view-products-btn {
  font-family: 'Kavoon', cursive;
  padding: 1rem 2rem;
  font-size: 1.2rem;
  background-color: #ED1F2D;
  color: white;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  opacity: 0;
  animation: fadeIn 1s ease 1s forwards;
  transition: transform 0.3s ease;
}

.view-products-btn:hover {
  transform: scale(1.05);
}

.location {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  opacity: 0;
  animation: slideUp 1s ease 1.5s forwards;
}

.location-icon {
  width: 24px;
  height: 24px;
}

.location-text {
  font-family: 'Kavoon', cursive;
  color: white;
  font-size: 1rem;
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
  max-width: 628px;
  max-height: 942px;
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

@media (max-width: 768px) {
  .logo-container {
    width: 400px;
    height: 400px;
  }
}
</style>
