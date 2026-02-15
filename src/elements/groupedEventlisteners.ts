import { draggedElement, resizedElement } from "../index.js";

let pendingEvent: MouseEvent | null = null;
let ticking = false;

// Helper function to get coordinates from MouseEvent or TouchEvent
function getEventCoordinates(e: MouseEvent | TouchEvent): { clientX: number; clientY: number } {
    if (e instanceof TouchEvent) {
        const touch = e.touches[0] ?? e.changedTouches[0];
        if (touch) {
            return { clientX: touch.clientX, clientY: touch.clientY };
        }
    }
    const mouseEvent = e as MouseEvent;
    return { clientX: mouseEvent.clientX, clientY: mouseEvent.clientY };
}

// ===== MOUSE EVENTS =====
document.addEventListener("mousemove", (e) => {
    if (!draggedElement && !resizedElement) return;
    pendingEvent = e;

    if (!ticking) {
        requestAnimationFrame(() => {
            if (pendingEvent) {
                if (draggedElement) draggedElement.drag(pendingEvent);
                if (resizedElement) resizedElement.resize(pendingEvent);
                pendingEvent = null;
            }
            ticking = false;
        });
        ticking = true;
    }
});

document.addEventListener("mouseup", (e) => {
    if (!draggedElement && !resizedElement) return;

    draggedElement?.stopDrag();
    resizedElement?.stopResize(e);
});

// ===== TOUCH EVENTS =====
document.addEventListener("touchmove", (e) => {
    if (!draggedElement && !resizedElement) return;
    
    e.preventDefault(); // Prevent default scroll behavior
    
    // Create a synthetic MouseEvent from TouchEvent
    const coords = getEventCoordinates(e);
    const syntheticEvent = new MouseEvent("mousemove", {
        clientX: coords.clientX,
        clientY: coords.clientY,
        bubbles: true,
        cancelable: true,
    });
    
    pendingEvent = syntheticEvent;

    if (!ticking) {
        requestAnimationFrame(() => {
            if (pendingEvent) {
                if (draggedElement) draggedElement.drag(pendingEvent);
                if (resizedElement) resizedElement.resize(pendingEvent);
                pendingEvent = null;
            }
            ticking = false;
        });
        ticking = true;
    }
}, { passive: false }); // IMPORTANT: Set passive to false to allow preventDefault()

document.addEventListener("touchend", (e) => {
    if (!draggedElement && !resizedElement) return;

    draggedElement?.stopDrag();
    
    // Create a synthetic event for stopResize
    const coords = getEventCoordinates(e);
    const syntheticEvent = new MouseEvent("mouseup", {
        clientX: coords.clientX,
        clientY: coords.clientY,
        bubbles: true,
        cancelable: true,
    });
    
    resizedElement?.stopResize(syntheticEvent);
});

document.addEventListener("touchcancel", (e) => {
    if (!draggedElement && !resizedElement) return;

    draggedElement?.stopDrag();
    resizedElement?.stopResize(undefined);
});
