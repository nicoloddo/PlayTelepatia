document.getElementById('spinButton').addEventListener('click', function() {
    var arrow = document.getElementById('arrow');
    var randomSpeed = Math.random() * 160 - 80; // Adjusted to range from -80 to 80 degrees
    arrow.style.transform = 'rotate(' + randomSpeed + 'deg)';
});

document.getElementById('lidButton').addEventListener('click', function() {
    var lid = document.getElementById('lid');
    if (lid.classList.contains('lid-visible')) {
        lid.classList.remove('lid-visible');
        lid.classList.add('lid-invisible');
    } else {
        lid.classList.remove('lid-invisible');
        lid.classList.add('lid-visible');
    }
});

// GUESSER *******
var guesserRotation = 0;
var initialTouchX;

function rotateGuesser(deltaX) {
    var rotationStep = 2; // Adjust the sensitivity of rotation
    var tempRotation = guesserRotation + deltaX * rotationStep;
    
    if(tempRotation <= 100 && tempRotation >= -100) {
        guesserRotation += deltaX * rotationStep;
        document.getElementById('guesser').style.transform = 'rotate(' + guesserRotation + 'deg)';
    } 
}

document.addEventListener('keydown', function(event) {
    var deltaX = 0;
    // ArrowRight or ArrowUp
    if (event.keyCode === 39 || event.keyCode === 38) {
        deltaX = 1;
    } 
    // ArrowLeft or ArrowDown
    else if (event.keyCode === 37 || event.keyCode === 40) {
        deltaX = -1;
    }
    rotateGuesser(deltaX);
});

// Touch event listeners
document.getElementById('guesser').addEventListener('touchstart', function(event) {
    initialTouchX = event.touches[0].clientX;
}, { passive: true });

document.getElementById('guesser').addEventListener('touchmove', function(event) {
    var currentTouchX = event.touches[0].clientX;
    var deltaX = currentTouchX - initialTouchX;
    rotateGuesser(deltaX);
    initialTouchX = currentTouchX; // Update initial touch position
}, { passive: true });


// SIDE PANEL MECHANICS
let urls = []; // Global array to store selected URLs

document.getElementById('togglePanelBtn').addEventListener('click', function() {
    var panel = document.getElementById('sidePanel');
    panel.classList.toggle('open');
});

// Function to update URLs based on checked checkboxes
function updateSelectedUrls() {
    var checkboxes = document.querySelectorAll('.scale-options input[type="checkbox"]');
    urls = []; // Reset the URLs array

    checkboxes.forEach(function(checkbox) {
        if (checkbox.checked) {
            urls.push(checkbox.value);
        }
    });
}

// Initialize URLs array on page load and add event listeners to sidebar checkboxes
document.addEventListener('DOMContentLoaded', () => {
    var checkboxes = document.querySelectorAll('#sidePanel .scale-checkbox');
    checkboxes.forEach(function(checkbox) {
        checkbox.addEventListener('click', updateSelectedUrls);
    });

    updateSelectedUrls(); // Initial update
});



// CARD EXTRACT MECHANICS
let usedLines = []; // Array to store used lines

document.getElementById('extractScaleButton').addEventListener('click', function() {
    if (urls.length === 0) {
        document.getElementById('left-text').textContent = "Seleziona almeno un mazzo.";
        document.getElementById('right-text').textContent = "Il tasto e' in alto a destra."
        return;
    }

    Promise.all(urls.map(url => fetch(url).then(response => response.text())))
    .then(texts => {
        const lines = texts.reduce((lines, text) => lines.concat(text.split('\n')), []);
        let randomLine;
        let attempts = 0;

        do {
            randomLine = lines[Math.floor(Math.random() * lines.length)];
            attempts++;
            // Prevent infinite loop if all lines have been used
            if (attempts > lines.length) break;
        } while (usedLines.includes(randomLine));

        if (!usedLines.includes(randomLine)) {
            const [leftWriting, rightWriting] = randomLine.split(':');
            document.getElementById('left-text').textContent = leftWriting;
            document.getElementById('right-text').textContent = rightWriting;
            usedLines.push(randomLine); // Add the used line to the array
        } else {
            document.getElementById('left-text').textContent = "Non ci sono carte nuove.";
            document.getElementById('right-text').textContent = "Ricarica la pagina."
            console.log("All lines have been used.");
        }
    })
    .catch(error => {
        console.error('Error fetching scale files:', error);
    });
});