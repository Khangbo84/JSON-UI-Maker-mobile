import { draggedElement, resizedElement } from "../index.js";

let pendingEvent: MouseEvent | null = null;
let ticking = false;

// Helper function to get coordinates from MouseEvent or TouchEvent
function getEventCoordinates(e: MouseEvent | TouchEvent): { clientX: number; clientY: number } {
    if (e instanceof TouchEvent) {
        // Ưu tiên touches (khi đang chạm), nếu không có thì dùng changedTouches
        const touch = e.touches[0] ?? e.changedTouches[0];
        if (touch) {
            return { clientX: touch.clientX, clientY: touch.clientY };
        }
    }
    // Fallback cho MouseEvent
    const mouseEvent = e as MouseEvent;
    return { clientX: mouseEvent.clientX, clientY: mouseEvent.clientY };
}

// Mouse events - Original logic
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

// Touch events for mobile support
document.addEventListener("touchmove", (e) => {
    if (!draggedElement && !resizedElement) return;
    
    // Tạo synthetic MouseEvent từ TouchEvent
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
});

document.addEventListener("touchend", (e) => {
    if (!draggedElement && !resizedElement) return;

    draggedElement?.stopDrag();
    
    // Tạo synthetic event cho stopResize
    const coords = getEventCoordinates(e);
    const syntheticEvent = new MouseEvent("mouseup", {
        clientX: coords.clientX,
        clientY: coords.clientY,
        bubbles: true,
        cancelable: true,
    });
    
    resizedElement?.stopResize(syntheticEvent);
});
