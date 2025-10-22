<template>
  <section id="endpage-section" class="endpage-root">
    <div class="endpage-content">
        <h1>Visit Our Store ♡</h1>
        <img src="/about-images/storePhotos.png" alt="Frostify Store Photos" class="store-photo" />
    </div>
    <footer class="about-footer">
      <div class="footer-content">
        <div class="footer-location">
          <img src="/about-images/location.png" alt="Location Icon" class="footer-location-icon">
          <p class="footer-location-text">visit us at Hagnaya, San Remigio, Cebu (near 7-Eleven)</p>
          <p class="footer-phone">  |  Contact us : 09533869211</p>
        </div>
        <div class="footer-info">
          <p class="footer-copyright">© 2025 Frostify. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </section>
  
</template>

<style scoped>

@import url('https://fonts.googleapis.com/css2?family=Kavoon&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Inter&display=swap');

.endpage-root {
  width: 100vw;
  height: 100vh;
  background-image: url('/about-images/endingpage.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.endpage-content {
  width: 100%;
  height: 100%;
}

h1{
     font-family: 'Kavoon', cursive;
     margin-top: 100px;
     font-size: clamp(2rem, 1.5rem + 2vw, 4rem);
}

.store-photo {
  display: block;
  max-width: 100%;
  height: auto;
  margin: 0rem auto 0 auto;
   margin-bottom: 100px;
   

 
}

.about-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 80px;
  background-color: rgba(255, 247, 247, 0.26);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  
}

.footer-content {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.footer-location {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.footer-location-icon {
  width: 16px;
  height: 16px;
}

.footer-location-text {
  color: white;
  font-size: 0.65rem;
  font-family: 'Inter', sans-serif;
  margin: 0;
}

.footer-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.footer-phone {
  color: white;
  font-size: 0.65rem;
  font-family: 'Inter', sans-serif;
  margin: 0;
}

.footer-copyright {
  color: white;
  font-size: 0.65rem;
  font-family: 'Inter', sans-serif;
  margin: 0;
}

@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0.5rem 1rem;
    gap: 0.5rem;
  }

  .footer-info {
    align-items: center;
  }

  .footer-location-text,
  .footer-phone,
  .footer-copyright {
    font-size: 0.6rem;
  }

  .endpage-root {
  
  height: auto;
  }
}
</style>
