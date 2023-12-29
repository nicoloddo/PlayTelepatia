// At page initialization
document.addEventListener('DOMContentLoaded', () => {
    // Initialize URLs array on page load and add event listeners to sidebar checkboxes
    var checkboxes = document.querySelectorAll('#sidePanelRight .deck-checkbox');
    checkboxes.forEach(function(checkbox) {
        checkbox.addEventListener('click', updateSelectedUrls);
    });

    updateSelectedUrls(); // Initial update

    document.getElementById('spinButton').addEventListener('click', spinButton); // initialize spin button
});

function spinButton() {
    var arrow = document.getElementById('arrow');
    var randomSpeed = Math.random() * 160 - 80; // Adjusted to range from -80 to 80 degrees
    arrow.style.transform = 'rotate(' + randomSpeed + 'deg)';
}

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
var rotationStep = 2; // Adjust the sensitivity of rotation
document.getElementById('lockButton').addEventListener('click', function() {
    var icon = this.querySelector('i');
    var spinButton = document.getElementById('spinButton');
    var lidButton = document.getElementById('lidButton');
    var extractScaleButton = document.getElementById('extractScaleButton');

    if (icon.classList.contains('fa-lock-open')) {
        icon.classList.remove('fa-lock-open');
        icon.classList.add('fa-lock');
        rotationStep = 0; // Lock rotation

        // Disable the buttons and apply the disabled style
        spinButton.disabled = true;
        lidButton.disabled = true;
        extractScaleButton.disabled = true;
        spinButton.classList.add('button-disabled');
        lidButton.classList.add('button-disabled');
        extractScaleButton.classList.add('button-disabled');
    } else {
        icon.classList.remove('fa-lock');
        icon.classList.add('fa-lock-open');
        rotationStep = 2; // Adjust the sensitivity of rotation

        // Enable the buttons and remove the disabled style
        spinButton.disabled = false;
        lidButton.disabled = false;
        extractScaleButton.disabled = false;
        spinButton.classList.remove('button-disabled');
        lidButton.classList.remove('button-disabled');
        extractScaleButton.classList.remove('button-disabled');
    }
});


var guesserRotation = 0;
var initialTouchX;

function rotateGuesser(deltaX) {
    var tempRotation = guesserRotation + deltaX * rotationStep;
    
    if(tempRotation <= 100 && tempRotation >= -100) {
        guesserRotation += deltaX * rotationStep;
        document.getElementById('guesser').style.transform = 'translateX(-50%) rotate(' + guesserRotation + 'deg)';
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

document.getElementById('toggleRightPanelBtn').addEventListener('click', function() {
    var panel = document.getElementById('sidePanelRight');
    panel.classList.toggle('open');
});

// Function to update URLs of the decks to use, based on checked checkboxes
function updateSelectedUrls() {
    var checkboxes = document.querySelectorAll('.deck-options input[type="checkbox"]');
    urls = []; // Reset the URLs array

    checkboxes.forEach(function(checkbox) {
        if (checkbox.checked) {
            urls.push(checkbox.value);
        }
    });

    let usedLines = []; // Restore the array to store used cards
}


// CARD EXTRACT MECHANICS
let usedLines = []; // Array to store used lines
let options_n = 2;

document.getElementById('applyOptionsCount').addEventListener('click', function() {
    const optionsCountInput = document.getElementById('optionsCount');
    options_n = parseInt(optionsCountInput.value, 10) || 2; // Update options_n or default to 5
});

document.getElementById('extractScaleButton').addEventListener('click', function() {
    if (lid.classList.contains('lid-invisible')) {
        lid.classList.remove('lid-invisible');
        lid.classList.add('lid-visible');
    }
    if (urls.length === 0) {
        document.getElementById('left-text').textContent = "Seleziona almeno un mazzo.";
        document.getElementById('right-text').textContent = "Il tasto è in alto a destra.";
        return;
    }

    Promise.all(urls.map(url => fetch(url).then(response => response.text())))
    .then(texts => {
        const lines = texts.reduce((lines, text) => lines.concat(text.split('\n')), []);
        let options = [];
        
        // Filter out used lines
        const unusedLines = lines.filter(line => !usedLines.includes(line));

        if (unusedLines.length === 0) {
            document.getElementById('left-text').textContent = "Non ci sono carte nuove.";
            document.getElementById('right-text').textContent = "Ricarica la pagina.";
            console.log("All lines have been used.");
            return;
        }

        // Extract up to options_n options
        while (options.length < options_n && options.length < unusedLines.length) {
            let randomIndex = Math.floor(Math.random() * unusedLines.length);
            let randomLine = unusedLines[randomIndex];

            if (!options.includes(randomLine)) {
                options.push(randomLine);
            }
        }

        displayScaleOptions(options); // Function to display options in the panel
    })
    .catch(error => {
        console.error('Error fetching scale files:', error);
    });
});


function displayScaleOptions(options) {
    const optionsContainer = document.getElementById('scaleOptions');
    optionsContainer.innerHTML = ''; // Clear previous options
    options.forEach(line => {
        const [left, right] = line.split(':');
        const optionButton = document.createElement('button');
        optionButton.textContent = `${left} - ${right}`;
        optionButton.onclick = () => selectScaleOption(line);
        optionsContainer.appendChild(optionButton);
    });
    document.getElementById('scaleSelectionPanel').style.display = 'block'; // Show panel
}

let lastSelectedLine = "Criminale:Eroe";
function selectScaleOption(selectedLine) {
    const [leftWriting, rightWriting] = selectedLine.split(':');
    document.getElementById('left-text').textContent = leftWriting;
    document.getElementById('right-text').textContent = rightWriting;
    usedLines.push(selectedLine); // Add the selected line to the array
    document.getElementById('scaleSelectionPanel').style.display = 'none'; // Hide panel
    lastSelectedLine = selectedLine;
}


// REVERSE MODE
document.getElementById('reverseButton').addEventListener('click', function() {
    var button = document.getElementById('spinButton') || document.getElementById('scaleGuessButton');
    var isSpinButton = button.id === 'spinButton';

    var lidButton = document.getElementById('lidButton');

    if (isSpinButton) { // REVERSE MODE TRIGGERED
        // Change to scaleGuessButton
        button.id = 'scaleGuessButton';
        button.style.backgroundImage = 'url("img/buttons/scale_guess_button.png")';
        button.removeEventListener('click', spinButton); // Remove spin function
        button.addEventListener('click', guessButton); // Attach guess function

        lidButton.classList.add('button-disabled');
        lidButton.disabled = true;
        if (lid.classList.contains('lid-invisible')) {
            lid.classList.remove('lid-invisible');
            lid.classList.add('lid-visible');
        }
    } else {
        // Change back to spinButton
        button.id = 'spinButton';
        button.style.backgroundImage = 'url("img/buttons/spin_button.png")';
        button.removeEventListener('click', guessButton); // Remove guess function
        button.addEventListener('click', spinButton); // Re-attach spin function

        lidButton.classList.remove('button-disabled');
        lidButton.disabled = false;
    }
});

document.getElementById('applyGuessOptionsCount').addEventListener('click', function() {
    const optionsCountInput = document.getElementById('guessOptionsCount');
    guess_options_n = parseInt(optionsCountInput.value, 10) || 2; // Update options_n or default to 5
});

let guess_options_n = 2;

function guessButton() {
    if (lid.classList.contains('lid-invisible')) {
        lid.classList.remove('lid-invisible');
        lid.classList.add('lid-visible');
    }

    if (urls.length === 0) {
        document.getElementById('left-text').textContent = "Seleziona almeno un mazzo.";
        document.getElementById('right-text').textContent = "Il tasto è in alto a destra.";
        return;
    }

    Promise.all(urls.map(url => fetch(url).then(response => response.text())))
    .then(texts => {
        const lines = texts.reduce((lines, text) => lines.concat(text.split('\n')), []);
        let options = [];
        
        // Filter out used lines
        const unusedLines = lines.filter(line => !usedLines.includes(line));

        if (unusedLines.length === 0) {
            document.getElementById('left-text').textContent = "Non ci sono carte nuove.";
            document.getElementById('right-text').textContent = "Ricarica la pagina.";
            console.log("All lines have been used.");
            return;
        }

        // Extract up to options_n options
        while (options.length < guess_options_n && options.length < unusedLines.length) {
            let randomIndex = Math.floor(Math.random() * unusedLines.length);
            let randomLine = unusedLines[randomIndex];

            if (!options.includes(randomLine)) {
                options.push(randomLine);
            }
        }

        guessScaleOptions(options); // Function to display options in the panel
    })
    .catch(error => {
        console.error('Error fetching scale files:', error);
    });
}

function guessScaleOptions(options) {
    document.getElementById('left-text').textContent = "";
    document.getElementById('right-text').textContent = "";

    const optionsContainer = document.getElementById('scaleOptions');
    optionsContainer.innerHTML = '';

    // Include the last selected line if it exists
    if (lastSelectedLine && !options.includes(lastSelectedLine)) {
        let randomIndex = Math.floor(Math.random() * options.length);
        options.splice(randomIndex, 0, lastSelectedLine);
    }

    options.forEach(line => {
        const [left, right] = line.split(':');
        const optionButton = document.createElement('button');
        optionButton.textContent = `${left} - ${right}`;
        optionButton.onclick = () => selectedGuessOption(line);
        optionsContainer.appendChild(optionButton);
    });

    document.getElementById('scaleSelectionPanel').style.display = 'block';
}

function selectedGuessOption(selectedLine) {
    const [leftWriting, rightWriting] = selectedLine.split(':');
    document.getElementById('left-text').textContent = leftWriting;
    document.getElementById('right-text').textContent = rightWriting;

    // Check if the selected line is the previously selected line
    if (selectedLine === lastSelectedLine) {
        console.log("Correct!");
        arrow.style.transform = 'rotate(' + guesserRotation + 'deg)';
    } else {
        console.log("Wrong.");
        if(guesserRotation > 0) {
            var randomSpeed = Math.random() * 60 - 50; // Adjusted to range from -80 to 80 degrees
        } else {
            var randomSpeed = Math.random() * 60 + 20; // Adjusted to range from -80 to 80 degrees
        }
        arrow.style.transform = 'rotate(' + randomSpeed + 'deg)';
    }
    if (lid.classList.contains('lid-visible')) {
        lid.classList.remove('lid-visible');
        lid.classList.add('lid-invisible');
    }

    document.getElementById('scaleSelectionPanel').style.display = 'none';
}
