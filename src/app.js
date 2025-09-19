const App = (props, context) => {
  const { getState, setState } = context;

  // Touch event handling for mobile swipes
  let touchStartX = 0;
  let touchStartY = 0;
  const minSwipeDistance = 50; // Minimum distance for a swipe

  const handleTouchStart = (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    if (getState("animating", false)) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    // Check if swipe distance is sufficient
    if (
      Math.abs(deltaX) < minSwipeDistance &&
      Math.abs(deltaY) < minSwipeDistance
    ) {
      return;
    }

    // Determine swipe direction based on which delta is larger
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (deltaX > 0) {
        // Swipe right
        getState("slideBoard", null)("ArrowRight");
      } else {
        // Swipe left
        getState("slideBoard", null)("ArrowLeft");
      }
    } else {
      // Vertical swipe
      if (deltaY > 0) {
        // Swipe down
        getState("slideBoard", null)("ArrowDown");
      } else {
        // Swipe up
        getState("slideBoard", null)("ArrowUp");
      }
    }
  };

  return {
    onMount: () => {
      //Setup keypress event listener
      window.addEventListener("keydown", (e) => {
        if (
          e.key === "ArrowUp" ||
          e.key === "ArrowDown" ||
          e.key === "ArrowLeft" ||
          e.key === "ArrowRight"
        ) {
          if (getState("animating", false)) {
            clearTimeout(getState("timer"));
            setState("animating", false);
            getState("addCell", () => {})(
              getState("toBeBoard", getState("cells", []))
            );
            return;
          }
          getState("slideBoard", null)(e.key);
        }
        const event = new CustomEvent("keyPress", { detail: e.key });
        window.dispatchEvent(event);
      });

      // Setup touch event listeners for mobile swipes
      window.addEventListener("touchstart", handleTouchStart, {
        passive: true,
      });
      window.addEventListener("touchend", handleTouchEnd, { passive: true });
    },
    onUnmount: () => {
      // Remove keydown event listener
      const keydownHandler = (e) => {
        const event = new CustomEvent("keyPress", { detail: e.key });
        window.dispatchEvent(event);
      };
      window.removeEventListener("keydown", keydownHandler);

      // Remove touch event listeners
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    },
    render: () => {
      return {
        div: {
          class:
            "bg-blue-500 text-white p-4 grid place-items-center min-h-screen",
          children: { div: { children: [{ toolbar: {} }, { board: {} }] } },
        },
      };
    },
  };
};
export default App;
