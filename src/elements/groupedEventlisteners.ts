import { draggedElement, resizedElement } from "../index.js";

let pendingEvent: PointerEvent | null = null;
let ticking = false;

// ===== POINTER EVENTS (Hoạt động cho chuột, touch, stylus) =====

document.addEventListener("pointermove", (e) => {
    if (!draggedElement && !resizedElement) return;
    
    // Chỉ xử lý primary pointer (để tránh lặp khi multi-touch)
    if (!e.isPrimary) return;
    
    pendingEvent = e;

    if (!ticking) {
        requestAnimationFrame(() => {
            if (pendingEvent) {
                if (draggedElement) draggedElement.drag(pendingEvent as unknown as MouseEvent);
                if (resizedElement) resizedElement.resize(pendingEvent as unknown as MouseEvent);
                pendingEvent = null;
            }
            ticking = false;
        });
        ticking = true;
    }
});

document.addEventListener("pointerup", (e) => {
    if (!draggedElement && !resizedElement) return;
    if (!e.isPrimary) return;

    draggedElement?.stopDrag();
    resizedElement?.stopResize(e as unknown as MouseEvent);
});

// ===== POINTER CANCEL (Xử lý trường hợp pointer bị hủy) =====
document.addEventListener("pointercancel", (e) => {
    if (!draggedElement && !resizedElement) return;
    if (!e.isPrimary) return;

    draggedElement?.stopDrag();
    resizedElement?.stopResize(undefined);
});
