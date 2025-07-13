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
};

// Get our DOM elements
const elements = {
  straw: document.querySelector(".straw2"),
  juice: document.querySelector(".juice"),
  volumeNumber: document.querySelector(".volumeNumber"),
  buttonItself: document.querySelector(".buttonItself"),
  refillButton: document.querySelector(".refill"),
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

// INITIALIZATION
function initializeApp() {
  // Set initial visual state
  updateDisplays();

  // Add hover cursor to straw
  elements.straw.style.cursor = "grab";

  // Add smooth transition
  elements.juice.style.transition = "height 0.1s ease-out";

  console.log("Watermelon Juice App initialized!");
  console.log("Total drunk so far:", juiceState.totalDrunk + "ml");
  console.log("Current streak:", juiceState.streak);
}

// Start the app when DOM is ready
document.addEventListener("DOMContentLoaded", initializeApp);

// Utility for debugging
window.juiceState = juiceState;
