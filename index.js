// Canvas setup
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let drawing = false;
let paths = [];
let undonePaths = [];

// Set canvas size
function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    fillCanvasBackground(); // Ensure the canvas has a white background
}
resizeCanvas();

// Fill the canvas with a white background
function fillCanvasBackground() {
    ctx.fillStyle = '#fff'; // White background
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Get mouse or touch coordinates relative to the canvas
function getCoordinates(e) {
    let x, y;
    if (e.touches && e.touches.length > 0) { // Touch event
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        x = touch.clientX - rect.left;
        y = touch.clientY - rect.top;
    } else { // Mouse event
        x = e.clientX - canvas.offsetLeft;
        y = e.clientY - canvas.offsetTop;
    }
    return { x, y };
}

// Start drawing
function startPosition(e) {
    e.preventDefault();
    drawing = true;
    ctx.beginPath();
    ctx.lineWidth = 5; // fixed line width
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000'; // fixed black color

    const coords = getCoordinates(e);
    ctx.moveTo(coords.x, coords.y);
}

// Stop drawing
function endPosition(e) {
    e.preventDefault();
    if (!drawing) return;
    drawing = false;
    ctx.closePath();
    paths.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    undonePaths = [];
}

// Draw on canvas
function draw(e) {
    e.preventDefault();
    if (!drawing) return;

    const coords = getCoordinates(e);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
}

// Event listeners for mouse events
canvas.addEventListener('mousedown', startPosition);
canvas.addEventListener('mouseup', endPosition);
canvas.addEventListener('mousemove', draw);

// Event listeners for touch events
canvas.addEventListener('touchstart', startPosition, { passive: false });
canvas.addEventListener('touchend', endPosition, { passive: false });
canvas.addEventListener('touchmove', draw, { passive: false });

// Undo functionality
document.getElementById('undo').addEventListener('click', () => {
    if (paths.length > 0) {
        undonePaths.push(paths.pop());
        ctx.putImageData(paths[paths.length - 1] || new ImageData(canvas.width, canvas.height), 0, 0);
    }
});

// Redo functionality
document.getElementById('redo').addEventListener('click', () => {
    if (undonePaths.length > 0) {
        paths.push(undonePaths.pop());
        ctx.putImageData(paths[paths.length - 1], 0, 0);
    }
});

// Clear canvas
document.getElementById('clear').addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    fillCanvasBackground(); // Refill the white background when clearing
    paths = [];
    undonePaths = [];
});

// Download as JPG
document.getElementById('download-jpg').addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'signature.jpg';

    // Create a new temporary canvas to handle the background fill for download
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;

    // Fill the background with white
    tempCtx.fillStyle = '#fff';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    // Draw the current canvas content on the temporary canvas
    tempCtx.drawImage(canvas, 0, 0);

    link.href = tempCanvas.toDataURL('image/jpeg', 0.8); // Export as JPG
    link.click();
});

// Share functionality
document.getElementById('share-btn').addEventListener('click', async () => {
    try {
        // Create a temporary canvas for the image to share
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;

        // Fill the background with white and draw the current content of the canvas
        tempCtx.fillStyle = '#fff';
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        tempCtx.drawImage(canvas, 0, 0);

        // Convert the temporary canvas to a blob
        const blob = await new Promise((resolve) => tempCanvas.toBlob(resolve, 'image/jpeg', 0.8));

        // Check if the Web Share API is supported with files
        if (navigator.canShare && navigator.canShare({ files: [new File([blob], 'signature.jpg', { type: 'image/jpeg' })] })) {
            const file = new File([blob], 'signature.jpg', { type: 'image/jpeg' });

            await navigator.share({
                files: [file],
                title: 'Signature',
                text: 'Here is my signature!'
            });
        } else {
            // Fallback to text sharing or alert the user
            if (navigator.share) {
                await navigator.share({
                    title: 'Signature',
                    text: 'I created a signature!',
                    url: window.location.href  // or some other meaningful URL
                });
            } else {
                alert('Your browser does not support the Web Share API.');
            }
        }
    } catch (error) {
        console.error('Sharing failed:', error);
    }
});

// Resize the canvas when window size changes
window.addEventListener('resize', resizeCanvas);
