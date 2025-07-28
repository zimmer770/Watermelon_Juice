// Flavor system configuration
const flavorSystem = {
  0: {
    name: "Pure Water : ",
    color: "#87CEEB",
    opacity: "0.5",
    fact: "Hydration is key to life!",
  },
  10: {
    name: "Hint of Melon : ",
    color: "#ff304fff",
    opacity: "0.2",
    fact: "Subtle sweetness awakens the palate.",
  },
  20: {
    name: "Gentle Pink : ",
    color: "#fc2041ff",
    opacity: "0.3",
    fact: "Delicate flavors dance on your tongue.",
  },
  30: {
    name: "Rosy Delight : ",
    color: "#ff1044ff",
    opacity: "0.3",
    fact: "Sweet memories in every sip.",
  },
  40: {
    name: "Coral Crush : ",
    color: "#ff0037ff",
    opacity: "0.3",
    fact: "Refreshing summer vibes.",
  },
  50: {
    name: "Watermelon Wave : ",
    color: "#ff0037ff",
    opacity: "0.4",
    fact: "Classic taste, timeless joy.",
  },
  60: {
    name: "Ruby Rush : ",
    color: "#ff0037ff",
    opacity: "0.5",
    fact: "Bold flavors for bold adventurers.",
  },
  70: {
    name: "Crimson Quench : ",
    color: "#ff0037ff",
    opacity: "0.6",
    fact: "Intense refreshment awaits.",
  },
  80: {
    name: "Scarlet Storm : ",
    color: "#ff0037ff",
    opacity: "0.7",
    fact: "Powerful taste explosion.",
  },
  90: {
    name: "Blood Orange Blast : ",
    color: "#ff0037ff",
    opacity: "0.8",
    fact: "Maximum flavor intensity.",
  },
  100: {
    name: "Almost Blood : ",
    color: "#ff0037ff",
    opacity: "0.9",
    fact: "Are you Sure?",
  },
};

// Our main state - the "brain" of our juice glass
const juiceState = {
  // Juice level (height in pixels)
  currentHeight: 580, // Full glass = 580px
  minHeight: 320, // Can't go below this
  maxHeight: 580, // Full glass height

  // Volume tracking - CUMULATIVE (total drunk)
  totalDrunk: parseInt(localStorage.getItem("totalDrunk") || "0"), // Starts at 0, always increases
  currentGlassVolume: 200, // Current glass has 200ml

  // Sipping controls
  isSlurping: false, // Are we currently sipping?
  slurpSpeed: 1, // How fast juice decreases (pixels per frame)

  // Streak system
  streak: parseInt(localStorage.getItem("streak") || "0"), // Persistent streak
  sessionSips: 0, // Total sips this session

  // Flavor intensity system
  flavorIntensity: 50, // Default 50% intensity
  isDragging: false, // Track if user is dragging the flavor slider
};

// Get our DOM elements
const elements = {
  straw: document.querySelector(".straw2"),
  juice: document.querySelector(".juice"),
  volumeNumber: document.querySelector(".volumeNumber"),
  buttonItself: document.querySelector(".buttonItself"),
  refillButton: document.querySelector(".refill"),
  flavorContainer: document.querySelector(".flavour"),
  flavorMeter: document.querySelector(".meter"),
  factText: document.querySelector(".fact"),
};

// CORE FUNCTION 1: Update displays
function updateDisplays() {
  // Update juice height visually
  elements.juice.style.height = juiceState.currentHeight + "px";

  // Calculate current glass volume remaining
  juiceState.currentGlassVolume = Math.round(
    (juiceState.currentHeight / juiceState.maxHeight) * 200
  );

  // Display TOTAL drunk volume (cumulative)
  elements.volumeNumber.textContent = juiceState.totalDrunk;

  // Update streak counter on button
  elements.buttonItself.textContent = juiceState.streak;

  // Update flavor-related displays
  updateFlavorDisplay();

  // Save to localStorage
  localStorage.setItem("totalDrunk", juiceState.totalDrunk);
  localStorage.setItem("streak", juiceState.streak);
}

//  CORE FUNCTION 2: The sipping animation loop
function sipJuice() {
  // Only continue if we're still slurping
  if (!juiceState.isSlurping) return;

  // Store previous height to calculate how much we drank
  const previousHeight = juiceState.currentHeight;

  // Reduce juice height by slurp speed
  juiceState.currentHeight -= juiceState.slurpSpeed;

  // Don't let it go below minimum
  if (juiceState.currentHeight <= juiceState.minHeight) {
    juiceState.currentHeight = juiceState.minHeight;

    // Complete a full sip cycle - increase streak!
    juiceState.streak++;
    juiceState.sessionSips++;

    // Stop slurping automatically when we hit minimum
    juiceState.isSlurping = false;

    console.log("🎉 Streak increased!", juiceState.streak);
  }

  // Calculate how much volume we just drank and add to total
  const heightDifference = previousHeight - juiceState.currentHeight;
  if (heightDifference > 0) {
    // Convert height difference to volume (1 pixel = 200ml/260px total height)
    const volumeDrunk =
      (heightDifference / (juiceState.maxHeight - juiceState.minHeight)) * 200;
    juiceState.totalDrunk += Math.round(volumeDrunk);

    console.log(
      `Drank ${Math.round(volumeDrunk)}ml, total: ${juiceState.totalDrunk}ml`
    );
  }

  // Update the visual displays
  updateDisplays();

  // Continue the animation loop
  if (juiceState.isSlurping) {
    requestAnimationFrame(sipJuice);
  }
}

// CORE FUNCTION 3: Refill the glass
function refillGlass() {
  // Animate the refill smoothly
  const refillAnimation = () => {
    // Increase height gradually
    if (juiceState.currentHeight < juiceState.maxHeight) {
      juiceState.currentHeight += 10; // Refill speed

      // Don't overfill
      if (juiceState.currentHeight > juiceState.maxHeight) {
        juiceState.currentHeight = juiceState.maxHeight;
      }

      updateDisplays();

      // Continue refilling
      if (juiceState.currentHeight < juiceState.maxHeight) {
        requestAnimationFrame(refillAnimation);
      }
    }
  };

  // Start the refill animation
  refillAnimation();
}

const MIN_METER_WIDTH = 9; // Minimum width percentage
const MAX_METER_WIDTH = 95; // Maximum width percentage

// Get the closest flavor data for a given intensity
function getFlavorData(intensity) {
  // Round to nearest 10 for flavor system lookup
  const roundedIntensity = Math.round(intensity / 10) * 10;
  return flavorSystem[roundedIntensity] || flavorSystem[50];
}

// Update flavor-related visual elements
function updateFlavorDisplay() {
  const flavorData = getFlavorData(juiceState.flavorIntensity);

  // Update meter width with min and max constraints
  let meterWidth = juiceState.flavorIntensity;
  meterWidth = Math.max(MIN_METER_WIDTH, Math.min(MAX_METER_WIDTH, meterWidth));
  elements.flavorMeter.style.width = meterWidth + "%";

  // Update juice color
  elements.juice.style.transition = "all 1s ease";
  elements.juice.style.backgroundColor = flavorData.color;
  elements.juice.style.opacity = flavorData.opacity;

  // Update fact text
  elements.factText.innerHTML = flavorData.name + flavorData.fact;

  console.log(`Flavor: ${flavorData.name} (${juiceState.flavorIntensity}%)`);
}

// Handle flavor slider interaction
function handleFlavorSlider(event) {
  const rect = elements.flavorContainer.getBoundingClientRect();
  const containerWidth = rect.width;
  const clickX = event.clientX - rect.left;

  // Calculate percentage (0-100)
  let percentage = (clickX / containerWidth) * 100;

  // Clamp between 0 and 100
  percentage = Math.max(0, Math.min(100, percentage));

  // Update flavor intensity
  juiceState.flavorIntensity = Math.round(percentage);

  // Update displays immediately
  updateFlavorDisplay();
}

// EVENT LISTENERS

// When mouse is pressed on straw - start sipping
elements.straw.addEventListener("mousedown", (e) => {
  e.preventDefault();

  // Only start if we're not already slurping and have juice left
  if (
    !juiceState.isSlurping &&
    juiceState.currentHeight > juiceState.minHeight
  ) {
    juiceState.isSlurping = true;

    // Add visual feedback
    elements.straw.style.cursor = "grabbing";

    // Start the sipping animation
    sipJuice();
  }
});

// When mouse is released anywhere - stop sipping
document.addEventListener("mouseup", () => {
  if (juiceState.isSlurping) {
    juiceState.isSlurping = false;
    elements.straw.style.cursor = "grab";
  }
});

// When refill button is clicked - refill the glass
elements.refillButton.addEventListener("click", () => {
  refillGlass();
});

// FLAVOR SLIDER EVENT LISTENERS

// Mouse down on flavor container - start dragging
elements.flavorContainer.addEventListener("mousedown", (e) => {
  e.preventDefault();
  juiceState.isDragging = true;
  elements.flavorContainer.style.cursor = "grabbing";

  // Handle initial click
  handleFlavorSlider(e);
});

// Mouse move - continue dragging if active
document.addEventListener("mousemove", (e) => {
  if (juiceState.isDragging) {
    handleFlavorSlider(e);
  }
});

// Mouse up - stop dragging
document.addEventListener("mouseup", () => {
  if (juiceState.isDragging) {
    juiceState.isDragging = false;
    elements.flavorContainer.style.cursor = "grab";
  }
});

// INITIALIZATION
function initializeApp() {
  // Set initial visual state
  updateDisplays();

  // Add hover cursor to interactive elements
  elements.straw.style.cursor = "grab";
  elements.flavorContainer.style.cursor = "grab";

  // Add smooth transition
  elements.juice.style.transition =
    "height 0.1s ease-out, background-color 0.3s ease";
  elements.flavorMeter.style.transition = "width 0.2s ease";

  console.log("Watermelon Juice App initialized!");
  console.log("Total drunk so far:", juiceState.totalDrunk + "ml");
  console.log("Current streak:", juiceState.streak);
  console.log("Flavor intensity:", juiceState.flavorIntensity + "%");
}

// Start the app when DOM is ready
document.addEventListener("DOMContentLoaded", initializeApp);

// Utility for debugging
window.juiceState = juiceState;
