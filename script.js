// Eratosthenes Experiment Visualization
(function () {
  // Constants
  const TROPIC_OF_CANCER_LAT_RAD = (23.5 * Math.PI) / 180;
  const DEFAULT_ANGLE = 7.2;
  const DEFAULT_DISTANCE = 5000;

  // Application state
  const appState = {
    isRotating: false,
    showAngles: true,
    rotationAngle: 0,
    animationFrameId: null,
    canvasWidth: 0,
    canvasHeight: 0,
  };

  // Cached objects for performance
  const cache = {
    earthGradient: null,
    shadowGradient: null,
    sunRays: [],
  };

  // DOM elements
  const elements = {
    timeSlider: null,
    timeValue: null,
    resetBtn: null,
    angleSlider: null,
    distanceSlider: null,
    angleValue: null,
    distanceValue: null,
    shadowAngle: null,
    shadowAngle2: null,
    cityDistance: null,
    cityDistance2: null,
    earthCircumference: null,
    rotateBtn: null,
    showAnglesBtn: null,
    resetAnimationBtn: null,
    liveRegion: null,
  };

  // Canvas elements
  let sunCanvas, sunCtx, earthCanvas, earthCtx;

  // Initialize the application
  function init() {
    if (!setupDOMElements() || !setupCanvases()) {
      showFallbackUI();
      return;
    }
    setupEventListeners();
    resizeCanvases();
    drawSunDemo(50);
    updateCalculation();
    drawEarthModel(0, true);

    // Add dark mode toggle
    const darkModeBtn = document.getElementById("darkModeBtn");
    darkModeBtn.addEventListener("click", () => {
      document.body.classList.toggle("dark-mode");
    });
  }

  // Setup DOM elements
  function setupDOMElements() {
    elements.timeSlider = document.getElementById("timeSlider");
    elements.timeValue = document.getElementById("timeValue");
    elements.resetBtn = document.getElementById("resetBtn");
    elements.angleSlider = document.getElementById("angleSlider");
    elements.distanceSlider = document.getElementById("distanceSlider");
    elements.angleValue = document.getElementById("angleValue");
    elements.distanceValue = document.getElementById("distanceValue");
    elements.shadowAngle = document.getElementById("shadowAngle");
    elements.shadowAngle2 = document.getElementById("shadowAngle2");
    elements.cityDistance = document.getElementById("cityDistance");
    elements.cityDistance2 = document.getElementById("cityDistance2");
    elements.earthCircumference = document.getElementById("earthCircumference");
    elements.rotateBtn = document.getElementById("rotateBtn");
    elements.showAnglesBtn = document.getElementById("showAnglesBtn");
    elements.resetAnimationBtn = document.createElement("button");
    elements.liveRegion = document.createElement("div");

    elements.resetAnimationBtn.textContent = "Reset Animation";
    elements.resetAnimationBtn.id = "resetAnimationBtn";
    document.body.appendChild(elements.resetAnimationBtn);

    elements.liveRegion.setAttribute("aria-live", "polite");
    elements.liveRegion.style.position = "absolute";
    elements.liveRegion.style.left = "-9999px";
    document.body.appendChild(elements.liveRegion);

    return Object.values(elements).every((el) => el !== null);
  }

  // Setup canvas elements
  function setupCanvases() {
    sunCanvas = document.getElementById("sunCanvas");
    earthCanvas = document.getElementById("earthCanvas");

    if (!sunCanvas || !earthCanvas) {
      console.error("Canvas elements not found");
      return false;
    }

    sunCtx = sunCanvas.getContext("2d");
    earthCtx = earthCanvas.getContext("2d");

    if (!sunCtx || !earthCtx) {
      console.error("Failed to get canvas contexts");
      return false;
    }

    window.addEventListener("resize", debounce(resizeCanvases, 100));
    earthCanvas.addEventListener("click", toggleRotationOnClick);
    earthCanvas.addEventListener("mousemove", handleEarthHover);
    return true;
  }

  // Setup event listeners
  function setupEventListeners() {
    elements.timeSlider.addEventListener("input", handleTimeSliderChange);
    elements.resetBtn.addEventListener("click", resetTimeSlider);
    elements.angleSlider.addEventListener("input", updateSliders);
    elements.distanceSlider.addEventListener("input", updateSliders);
    elements.rotateBtn.addEventListener("click", toggleRotation);
    elements.showAnglesBtn.addEventListener("click", toggleAngles);
    elements.resetAnimationBtn.addEventListener("click", resetAnimation);
  }

  // Event handlers
  function handleTimeSliderChange() {
    const value = parseInt(elements.timeSlider.value);
    updateTimeLabel(value);
    drawSunDemo(value);
    announceLiveUpdate(`Time of day set to ${elements.timeValue.textContent}`);
  }

  function resetTimeSlider() {
    elements.timeSlider.value = 50;
    updateTimeLabel(50);
    drawSunDemo(50);
  }

  function updateSliders() {
    updateCalculation();
    drawEarthModel(appState.rotationAngle, appState.showAngles);
    announceLiveUpdate(
      `Angle: ${elements.angleValue.textContent}, Distance: ${elements.distanceValue.textContent}`
    );
  }

  function toggleRotation() {
    appState.isRotating = !appState.isRotating;
    elements.rotateBtn.textContent = appState.isRotating
      ? "Stop Rotation"
      : "Rotate Earth";
    appState.isRotating
      ? rotateEarth()
      : cancelAnimationFrame(appState.animationFrameId);
  }

  function toggleAngles() {
    appState.showAngles = !appState.showAngles;
    drawEarthModel(appState.rotationAngle, appState.showAngles);
  }

  function resetAnimation() {
    appState.rotationAngle = 0;
    appState.isRotating = false;
    elements.rotateBtn.textContent = "Rotate Earth";
    cancelAnimationFrame(appState.animationFrameId);
    drawEarthModel(0, appState.showAngles);
  }

  function toggleRotationOnClick(event) {
    toggleRotation();
  }

  function handleEarthHover(event) {
    // Placeholder for hover effect (can be expanded)
  }

  // Update time label
  function updateTimeLabel(value) {
    let newLabel =
      value < 30
        ? "Morning"
        : value > 70
        ? "Afternoon"
        : value >= 45 && value <= 55
        ? "Noon"
        : value < 50
        ? "Late Morning"
        : "Early Afternoon";
    if (elements.timeValue.textContent !== newLabel) {
      elements.timeValue.style.opacity = 0;
      setTimeout(() => {
        elements.timeValue.textContent = newLabel;
        elements.timeValue.style.opacity = 1;
      }, 300);
    }
  }

  // Resize canvases
  function resizeCanvases() {
    const containerWidth = Math.min(600, window.innerWidth - 40);
    sunCanvas.width = earthCanvas.width = containerWidth;
    sunCanvas.height = earthCanvas.height = containerWidth / 1.5;
    appState.canvasWidth = containerWidth;
    appState.canvasHeight = containerWidth / 1.5;

    cacheGradients();
    drawSunDemo(parseInt(elements.timeSlider.value));
    updateCalculation();
    drawEarthModel(appState.rotationAngle, appState.showAngles);
  }

  // Cache gradients for performance
  function cacheGradients() {
    cache.earthGradient = earthCtx.createRadialGradient(
      appState.canvasWidth / 2,
      appState.canvasHeight / 2,
      0,
      appState.canvasWidth / 2,
      appState.canvasHeight / 2,
      appState.canvasWidth * 0.4
    );
    cache.earthGradient.addColorStop(0, "#64B5F6");
    cache.earthGradient.addColorStop(1, "#1565C0");

    cache.shadowGradient = earthCtx.createLinearGradient(
      appState.canvasWidth / 2 - appState.canvasWidth * 0.4,
      appState.canvasHeight / 2,
      appState.canvasWidth / 2 + appState.canvasWidth * 0.4,
      appState.canvasHeight / 2
    );
    cache.shadowGradient.addColorStop(0, "rgba(0, 0, 0, 0.5)");
    cache.shadowGradient.addColorStop(0.5, "rgba(0, 0, 0, 0)");
    cache.shadowGradient.addColorStop(1, "rgba(0, 0, 0, 0.5)");
  }

  // Draw sun demonstration
  function drawSunDemo(timeOfDay) {
    if (!sunCtx) return;
    sunCtx.clearRect(0, 0, appState.canvasWidth, appState.canvasHeight);

    const gradient = sunCtx.createLinearGradient(
      0,
      0,
      0,
      appState.canvasHeight
    );
    gradient.addColorStop(0, "#87CEEB");
    gradient.addColorStop(1, "#8B4513");
    sunCtx.fillStyle = gradient;
    sunCtx.fillRect(0, 0, appState.canvasWidth, appState.canvasHeight);

    sunCtx.beginPath();
    sunCtx.moveTo(0, appState.canvasHeight * 0.7);
    sunCtx.lineTo(appState.canvasWidth, appState.canvasHeight * 0.7);
    sunCtx.strokeStyle = "#000";
    sunCtx.stroke();

    const sunPos = {
      x: (timeOfDay / 100) * appState.canvasWidth,
      y:
        appState.canvasHeight * 0.5 -
        Math.sin((Math.PI * timeOfDay) / 100) * appState.canvasHeight * 0.4,
    };

    const sunRadius = Math.min(30, appState.canvasWidth * 0.05);
    sunCtx.beginPath();
    sunCtx.arc(sunPos.x, sunPos.y, sunRadius, 0, Math.PI * 2);
    sunCtx.fillStyle = "#FDB813";
    sunCtx.fill();
    sunCtx.shadowBlur = 20;
    sunCtx.shadowColor = "rgba(253, 184, 19, 0.5)";
    sunCtx.fill();
    sunCtx.shadowBlur = 0;

    drawPillarAndShadow(
      sunCtx,
      appState.canvasWidth * 0.3,
      appState.canvasHeight * 0.7,
      sunPos,
      "Syene"
    );
    drawPillarAndShadow(
      sunCtx,
      appState.canvasWidth * 0.7,
      appState.canvasHeight * 0.7,
      sunPos,
      "Alexandria"
    );
    drawSunRays(
      sunCtx,
      sunPos,
      appState.canvasWidth * 0.3,
      appState.canvasHeight * 0.7
    );
    drawSunRays(
      sunCtx,
      sunPos,
      appState.canvasWidth * 0.7,
      appState.canvasHeight * 0.7
    );
  }

  function drawPillarAndShadow(ctx, x, groundY, sunPos, cityName) {
    const pillarHeight = appState.canvasHeight * 0.2;
    const pillarWidth = appState.canvasWidth * 0.016;

    ctx.fillStyle = "#666";
    ctx.fillRect(
      x - pillarWidth / 2,
      groundY - pillarHeight,
      pillarWidth,
      pillarHeight
    );

    const sunAngle = Math.atan2(
      sunPos.y - (groundY - pillarHeight),
      sunPos.x - x
    );
    let shadowLength =
      sunAngle < Math.PI / 2 && sunAngle > -Math.PI / 2
        ? pillarHeight / Math.tan(sunAngle)
        : 0;
    if (sunAngle < 0) shadowLength = -shadowLength;

    ctx.beginPath();
    ctx.moveTo(x, groundY);
    ctx.lineTo(x + shadowLength, groundY);
    ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
    ctx.lineWidth = pillarWidth * 0.5;
    ctx.stroke();
    ctx.lineWidth = 1;

    ctx.fillStyle = "#000";
    const fontSize = Math.max(12, appState.canvasWidth * 0.023);
    ctx.font = `${fontSize}px Arial`;
    ctx.textAlign = "center";
    ctx.fillText(cityName, x, groundY + fontSize * 1.5);

    if (
      Math.abs(elements.timeSlider.value - 50) < 2 &&
      cityName === "Alexandria"
    ) {
      const angleRad = (parseFloat(elements.angleSlider.value) * Math.PI) / 180;
      ctx.beginPath();
      const angleRadius = Math.min(20, appState.canvasWidth * 0.033);
      ctx.arc(x, groundY, angleRadius, -Math.PI / 2, -Math.PI / 2 + angleRad);
      ctx.strokeStyle = "#FF0000";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.lineWidth = 1;

      ctx.fillStyle = "#FF0000";
      ctx.fillText(
        `${elements.angleSlider.value}°`,
        x + angleRadius * 1.25,
        groundY - angleRadius * 0.75
      );
    }
  }

  function drawSunRays(ctx, sunPos, targetX, targetY) {
    const pillarHeight = appState.canvasHeight * 0.2;
    ctx.beginPath();
    ctx.moveTo(sunPos.x, sunPos.y);
    ctx.lineTo(targetX, targetY - pillarHeight);
    ctx.lineTo(targetX, targetY);
    ctx.strokeStyle = "rgba(255, 214, 0, 0.3)";
    ctx.stroke();
  }

  // Update calculations
  function updateCalculation() {
    const angle = parseFloat(elements.angleSlider.value) || DEFAULT_ANGLE;
    const distance =
      parseInt(elements.distanceSlider.value) || DEFAULT_DISTANCE;

    elements.angleValue.textContent = angle.toFixed(1) + "°";
    elements.distanceValue.textContent = distance;
    elements.shadowAngle.textContent = angle.toFixed(1);
    elements.shadowAngle2.textContent = angle.toFixed(1);
    elements.cityDistance.textContent = distance;
    elements.cityDistance2.textContent = distance;

    const circumference = Math.round((distance * 360) / angle);
    elements.earthCircumference.textContent = circumference.toLocaleString();
  }

  // Draw Earth model
  function drawEarthModel(rotation, showAngles) {
    if (!earthCtx) return;
    earthCtx.clearRect(0, 0, appState.canvasWidth, appState.canvasHeight);
    const centerX = appState.canvasWidth / 2;
    const centerY = appState.canvasHeight / 2 + appState.canvasHeight * 0.1;
    const radius = Math.min(centerY * 0.8, centerX * 0.4);
    const longitudeRotation = rotation;

    // Draw Earth
    earthCtx.beginPath();
    earthCtx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    earthCtx.fillStyle = cache.earthGradient;
    earthCtx.fill();

    // Draw shadow
    earthCtx.beginPath();
    earthCtx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    earthCtx.fillStyle = cache.shadowGradient;
    earthCtx.fill();

    // Draw equator
    earthCtx.beginPath();
    earthCtx.ellipse(centerX, centerY, radius, radius * 0.2, 0, 0, Math.PI * 2);
    earthCtx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    earthCtx.stroke();

    // Draw longitude lines
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3 + longitudeRotation;
      earthCtx.beginPath();
      earthCtx.moveTo(centerX, centerY - radius);
      earthCtx.bezierCurveTo(
        centerX + radius * Math.sin(angle),
        centerY - radius * 0.5,
        centerX + radius * Math.sin(angle),
        centerY + radius * 0.5,
        centerX,
        centerY + radius
      );
      earthCtx.strokeStyle = "rgba(255, 255, 255, 0.3)";
      earthCtx.stroke();
    }

    // Draw Sun with glow
    const sunRadius = Math.min(20, appState.canvasWidth * 0.033);
    earthCtx.beginPath();
    earthCtx.arc(
      appState.canvasWidth - sunRadius * 2.5,
      centerY,
      sunRadius,
      0,
      Math.PI * 2
    );
    earthCtx.fillStyle = "#FDB813";
    earthCtx.shadowBlur = 15;
    earthCtx.shadowColor = "rgba(253, 184, 19, 0.7)";
    earthCtx.fill();
    earthCtx.shadowBlur = 0;

    // Sun rays (using object pooling)
    if (!cache.sunRays.length) {
      for (let i = 0; i < 8; i++) {
        cache.sunRays.push({ angle: (i * Math.PI) / 4 });
      }
    }
    earthCtx.beginPath();
    cache.sunRays.forEach((ray) => {
      const rayAngle = ray.angle + rotation / 10;
      earthCtx.moveTo(appState.canvasWidth - sunRadius * 3.5, centerY);
      earthCtx.lineTo(
        centerX + radius * Math.cos(rayAngle),
        centerY + radius * Math.sin(rayAngle)
      );
    });
    earthCtx.strokeStyle = "rgba(255, 214, 0, 0.3)";
    earthCtx.stroke();

    // City positions
    const syeneLatRad = TROPIC_OF_CANCER_LAT_RAD;
    const syeneYOffset = radius * Math.sin(syeneLatRad);
    const syeneEffectiveRadius = radius * Math.cos(syeneLatRad);
    const syeneX = centerX + syeneEffectiveRadius * Math.cos(longitudeRotation);
    const syeneY = centerY - syeneYOffset;
    const syeneDrawAngle = Math.atan2(syeneY - centerY, syeneX - centerX);

    const sliderAngleRad =
      (parseFloat(elements.angleSlider.value) * Math.PI) / 180;
    const distance = parseInt(elements.distanceSlider.value);
    const distanceScale = distance / 5000; // Scale relative to default distance
    const adjustedAngleRad = sliderAngleRad * distanceScale; // Scale angle by distance
    const alexandriaLatRad = syeneLatRad + adjustedAngleRad;
    const alexandriaYOffset = radius * Math.sin(alexandriaLatRad);
    const alexandriaEffectiveRadius = radius * Math.cos(alexandriaLatRad);
    const alexandriaX =
      centerX + alexandriaEffectiveRadius * Math.cos(longitudeRotation);
    const alexandriaY = centerY - alexandriaYOffset;
    const alexandriaDrawAngle = Math.atan2(
      alexandriaY - centerY,
      alexandriaX - centerX
    );

    if (syeneX > centerX - radius)
      drawObelisk(
        earthCtx,
        syeneX,
        syeneY,
        syeneDrawAngle,
        "Syene",
        "#FF5722",
        radius
      );
    if (alexandriaX > centerX - radius)
      drawObelisk(
        earthCtx,
        alexandriaX,
        alexandriaY,
        alexandriaDrawAngle,
        "Alexandria",
        "#4CAF50",
        radius
      );

    if (showAngles) {
      earthCtx.beginPath();
      earthCtx.arc(
        centerX,
        centerY,
        radius / 2,
        syeneDrawAngle,
        alexandriaDrawAngle
      );
      earthCtx.strokeStyle = "#FF0000";
      earthCtx.lineWidth = 3; // Increased for visibility
      earthCtx.stroke();
      earthCtx.lineWidth = 1;

      const midAngle = (syeneDrawAngle + alexandriaDrawAngle) / 2;
      const textX = centerX + (radius / 2 + 20) * Math.cos(midAngle);
      const textY = centerY + (radius / 2 + 20) * Math.sin(midAngle);
      const angleText = `${elements.angleSlider.value}°`;
      const fontSizeAngle = Math.max(16, appState.canvasWidth * 0.03); // Increased for prominence
      earthCtx.font = `bold ${fontSizeAngle}px Arial`;
      earthCtx.textAlign = "center";
      const textWidth = earthCtx.measureText(angleText).width;
      earthCtx.fillStyle = "rgba(255, 255, 255, 0.7)";
      earthCtx.fillRect(
        textX - textWidth / 2 - 5,
        textY - fontSizeAngle,
        textWidth + 10,
        fontSizeAngle + 5
      );
      earthCtx.fillStyle = "#FF0000";
      earthCtx.fillText(angleText, textX, textY);

      earthCtx.beginPath();
      earthCtx.moveTo(syeneX, syeneY);
      earthCtx.lineTo(alexandriaX, alexandriaY);
      earthCtx.strokeStyle = "#FFD700";
      earthCtx.lineWidth = 3; // Increased and made solid
      earthCtx.stroke();
      earthCtx.lineWidth = 1;

      const surfaceMidX = (syeneX + alexandriaX) / 2;
      const surfaceMidY = (syeneY + alexandriaY) / 2;
      const distanceText = `${elements.distanceSlider.value} stadia`;
      const fontSizeDistance = Math.max(16, appState.canvasWidth * 0.03); // Match angle font size
      earthCtx.font = `bold ${fontSizeDistance}px Arial`;
      earthCtx.textAlign = "center";
      const textWidthDist = earthCtx.measureText(distanceText).width;
      earthCtx.fillStyle = "rgba(0, 0, 0, 0.6)";
      earthCtx.fillRect(
        surfaceMidX - textWidthDist / 2 - 5,
        surfaceMidY - fontSizeDistance,
        textWidthDist + 10,
        fontSizeDistance + 5
      );
      earthCtx.fillStyle = "#FFD700";
      earthCtx.fillText(distanceText, surfaceMidX, surfaceMidY);

      // Scale indicator
      earthCtx.fillStyle = "#FFF";
      earthCtx.fillText(
        `Circumference: ${elements.earthCircumference.textContent} stadia`,
        centerX,
        centerY + radius + 20
      );
    }
  }

  function drawObelisk(
    ctx,
    surfaceX,
    surfaceY,
    angleFromCenter,
    name,
    color,
    radius
  ) {
    const obeliskLength = radius * 0.05;
    const lineWidth = radius * 0.005;

    ctx.beginPath();
    ctx.moveTo(surfaceX, surfaceY);
    const endX = surfaceX + obeliskLength * Math.cos(angleFromCenter);
    const endY = surfaceY + obeliskLength * Math.sin(angleFromCenter);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
    ctx.lineWidth = 1;

    const fontSize = 12;
    ctx.font = `${fontSize}px Arial`;
    ctx.textAlign = "center";
    const textDistance = obeliskLength + radius * 0.02;
    const textX = surfaceX + textDistance * Math.cos(angleFromCenter);
    const textY = surfaceY + textDistance * Math.sin(angleFromCenter);

    const textWidth = ctx.measureText(name).width;
    const padding = 2;
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.fillRect(
      textX - textWidth / 2 - padding,
      textY - fontSize * 1.2,
      textWidth + 2 * padding,
      fontSize * 1.5
    );
    ctx.fillStyle = color;
    ctx.fillText(name, textX, textY);
  }

  // Rotate Earth
  function rotateEarth() {
    if (!appState.isRotating) return;
    appState.rotationAngle += 0.01;
    drawEarthModel(appState.rotationAngle, appState.showAngles);
    appState.animationFrameId = requestAnimationFrame(rotateEarth);
  }

  // Accessibility: Announce updates
  function announceLiveUpdate(message) {
    elements.liveRegion.textContent = message;
  }

  // Fallback UI
  function showFallbackUI() {
    const fallback = document.createElement("div");
    fallback.textContent = "Canvas not supported. Please use a modern browser.";
    document.body.appendChild(fallback);
  }

  // Utility: Debounce
  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // Start application
  window.addEventListener("load", init);
})();
