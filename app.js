// App state and data
let currentScreen = 'home';
let currentExercise = null;
let currentStepIndex = 0;
let completedSteps = [];
let timer = null;
let timerSeconds = 0;
let isTimerRunning = false;
let isTimerPaused = false;

// Settings
let notificationSettings = {
    days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    morningEnabled: true,
    eveningEnabled: true
};

// Workout data - This will be hardcoded for now, later can be moved to Firebase
const workoutData = {
    bensWorkout: {
        name: "Ben's Workout",
        description: "30-minute full body workout",
        exercises: [
            {
                id: 'warmup',
                name: 'Warmup',
                duration: 300, // 5 minutes in seconds
                description: 'Move continuously with low impact exercises to prepare your body.',
                steps: [
                    {
                        name: 'Easy march + arm circles',
                        duration: 120,
                        description: 'March in place, swing arms gently, add forward/backward shoulder circles.'
                    },
                    {
                        name: 'Torso and hip mobility',
                        duration: 90,
                        description: 'Gentle torso twists, side bends, slow hip circles.'
                    },
                    {
                        name: 'Light squats and knee lifts',
                        duration: 90,
                        description: 'Shallow bodyweight squats, then alternating knee lifts with a little core brace.'
                    }
                ]
            },
            {
                id: 'strength-circuit',
                name: 'Strength Circuit',
                duration: 900, // 15 minutes
                description: 'Complete circuit using very light weight or bodyweight. ~40 seconds work, ~20 seconds transition.',
                steps: [
                    {
                        name: 'Hip hinge / Romanian deadlift',
                        duration: 60,
                        description: 'Use bar or dumbbells. Soft knees, hinge at hips, feel stretch in hamstrings, squeeze glutes to stand.'
                    },
                    {
                        name: 'Goblet or bodyweight squat',
                        duration: 60,
                        description: 'Hold a plate or dumbbell at chest if comfortable, or just bodyweight.'
                    },
                    {
                        name: 'Bent-over row',
                        duration: 60,
                        description: 'Use bar or dumbbells. Hinge slightly, pull weight toward lower ribs, squeeze shoulder blades.'
                    },
                    {
                        name: 'Incline or wall push-ups',
                        duration: 60,
                        description: 'Hands on counter/wall/bench, straight body, controlled tempo.'
                    },
                    {
                        name: 'Standing overhead press',
                        duration: 60,
                        description: 'Very light weight. Press slowly up, don\'t lock out hard, stop if shoulders complain.'
                    },
                    {
                        name: 'Static lunge (right leg forward)',
                        duration: 60,
                        description: 'Small range, slight bend, hold onto something if needed.'
                    },
                    {
                        name: 'Static lunge (left leg forward)',
                        duration: 60,
                        description: 'Small range, slight bend, hold onto something if needed.'
                    },
                    {
                        name: 'Standing calf raises',
                        duration: 60,
                        description: 'Hold support, rise onto toes, pause at top, slow down.'
                    },
                    {
                        name: 'Dead bug (on back)',
                        duration: 60,
                        description: 'On back, knees bent 90°, press low back into floor, alternate tapping heels or extending one leg at a time.'
                    },
                    {
                        name: 'Side plank (right)',
                        duration: 60,
                        description: 'On forearm and knees, keep straight line from knees to head.'
                    },
                    {
                        name: 'Side plank (left)',
                        duration: 60,
                        description: 'On forearm and knees, keep straight line from knees to head.'
                    },
                    {
                        name: 'Glute bridge',
                        duration: 60,
                        description: 'On back, feet on floor, squeeze glutes to lift hips, pause, lower slowly.'
                    },
                    {
                        name: 'Standing band/plate front raise',
                        duration: 60,
                        description: 'Light plate or band, raise arms to shoulder height, control down. (Optional)'
                    },
                    {
                        name: 'Easy flow (2 minutes)',
                        duration: 120,
                        description: 'Repeat your favorite 2-3 movements lightly (e.g., bodyweight squats, bent-over no-weight rows, glute bridges) at very low effort just to keep moving.'
                    }
                ]
            },
            {
                id: 'cardio',
                name: 'Easy Cardio',
                duration: 480, // 8 minutes
                description: 'Easy cardio activity like bike, gazelle, or light walking. Keep intensity comfortable.',
                steps: [
                    {
                        name: 'Easy cardio activity',
                        duration: 480,
                        description: 'Choose bike, gazelle machine, light walking, or any low-impact cardio. Keep intensity easy and comfortable for active recovery.'
                    }
                ]
            },
            {
                id: 'cooldown',
                name: 'Tai Chi/Yoga Cool-down',
                duration: 120, // 2 minutes
                description: 'Relaxation and gentle stretching to finish the workout.',
                steps: [
                    {
                        name: 'Standing flows',
                        duration: 60,
                        description: 'Slow arm circles, side reaches, gentle standing forward fold with soft knees.'
                    },
                    {
                        name: 'Breathing and stretch',
                        duration: 60,
                        description: 'Deep nasal inhales, slow mouth exhales, light neck stretches and shoulder rolls.'
                    }
                ]
            }
        ]
    }
};

// Get workout progress from localStorage
function getWorkoutProgress(workoutId) {
    const progress = localStorage.getItem(`workout_${workoutId}`);
    return progress ? JSON.parse(progress) : { completed: [], lastCompletedDate: null };
}

// Save workout progress to localStorage
function saveWorkoutProgress(workoutId, progress) {
    localStorage.setItem(`workout_${workoutId}`, JSON.stringify(progress));
}

// Check if workout was completed today
function isWorkoutCompletedToday(workoutId) {
    const progress = getWorkoutProgress(workoutId);
    const today = new Date().toDateString();
    return progress.lastCompletedDate === today;
}

// Screen navigation
function showScreen(screenId, direction = 'forward') {
    const currentScreenEl = document.querySelector('.screen.active');
    const targetScreenEl = document.getElementById(screenId + 'Screen');
    
    if (currentScreenEl) {
        currentScreenEl.classList.remove('active');
        if (direction === 'back') {
            currentScreenEl.classList.add('prev');
        }
    }
    
    if (targetScreenEl) {
        targetScreenEl.classList.add('active');
        targetScreenEl.classList.remove('prev');
    }
    
    currentScreen = screenId;
    
    // Clear any running timers when leaving exercise detail
    if (screenId !== 'exerciseDetail' && timer) {
        clearInterval(timer);
        timer = null;
        isTimerRunning = false;
        isTimerPaused = false;
    }
}

// Initialize home screen
function initHomeScreen() {
    const progress = getWorkoutProgress('bensWorkout');
    const statusEl = document.getElementById('benWorkoutStatus');
    
    if (isWorkoutCompletedToday('bensWorkout')) {
        statusEl.textContent = '✓ Completed today';
        statusEl.className = 'workout-status completed';
    } else if (progress.completed.length > 0) {
        statusEl.textContent = `${progress.completed.length}/${workoutData.bensWorkout.exercises.length} exercises completed`;
        statusEl.className = 'workout-status in-progress';
    } else {
        statusEl.textContent = 'Not started';
        statusEl.className = 'workout-status';
    }
}

// Initialize workout overview screen
function initWorkoutOverview() {
    const progress = getWorkoutProgress('bensWorkout');
    const exerciseList = document.getElementById('exerciseList');
    const progressText = document.getElementById('progressText');
    
    progressText.textContent = `${progress.completed.length}/${workoutData.bensWorkout.exercises.length} completed`;
    
    exerciseList.innerHTML = '';
    
    workoutData.bensWorkout.exercises.forEach(exercise => {
        const exerciseEl = document.createElement('div');
        exerciseEl.className = 'exercise-item';
        exerciseEl.dataset.exerciseId = exercise.id;
        
        if (progress.completed.includes(exercise.id)) {
            exerciseEl.classList.add('completed');
        }
        
        const minutes = Math.floor(exercise.duration / 60);
        const seconds = exercise.duration % 60;
        const durationText = seconds > 0 ? `${minutes}:${seconds.toString().padStart(2, '0')}` : `${minutes} min`;
        
        exerciseEl.innerHTML = `
            <div class="exercise-name">${exercise.name}</div>
            <div class="exercise-duration">${durationText}</div>
        `;
        
        exerciseEl.addEventListener('click', () => {
            currentExercise = exercise;
            initExerciseDetail();
            showScreen('exerciseDetail');
        });
        
        exerciseList.appendChild(exerciseEl);
    });
}

// Initialize exercise detail screen
function initExerciseDetail() {
    if (!currentExercise) return;
    
    document.getElementById('exerciseName').textContent = currentExercise.name;
    document.getElementById('exerciseDescription').textContent = currentExercise.description;
    
    // Show or hide steps section based on whether exercise has steps
    const stepsSection = document.getElementById('stepsSection');
    const stepsList = document.getElementById('stepsList');
    
    if (currentExercise.steps && currentExercise.steps.length > 0) {
        stepsSection.style.display = 'block';
        stepsList.innerHTML = '';
        
        currentExercise.steps.forEach((step, index) => {
            const stepEl = document.createElement('div');
            stepEl.className = 'step-item';
            stepEl.dataset.stepIndex = index;
            
            const minutes = Math.floor(step.duration / 60);
            const seconds = step.duration % 60;
            const durationText = seconds > 0 ? `${minutes}:${seconds.toString().padStart(2, '0')}` : `${minutes} min`;
            
            stepEl.innerHTML = `
                <div class="step-name">${step.name}</div>
                <div class="step-duration">${durationText}</div>
                <div class="step-description">${step.description}</div>
            `;
            
            stepEl.addEventListener('click', () => {
                selectStep(index);
            });
            
            stepsList.appendChild(stepEl);
        });
        
        // Select first step by default
        currentStepIndex = 0;
        selectStep(0);
    } else {
        stepsSection.style.display = 'none';
        // For exercises without steps, use the full exercise duration
        timerSeconds = currentExercise.duration;
        updateTimerDisplay();
    }
    
    // Reset timer state
    isTimerRunning = false;
    isTimerPaused = false;
    
    // Reset UI
    document.getElementById('startTimerBtn').style.display = 'inline-block';
    document.getElementById('pauseTimerBtn').style.display = 'none';
    document.getElementById('nextStepBtn').style.display = 'none';
    document.getElementById('completionSection').style.display = 'none';
    document.getElementById('currentStepInfo').style.display = 'none';
    
    const timerDisplay = document.getElementById('timerDisplay');
    timerDisplay.className = 'timer-display';
    
    // Reset completed steps for this exercise session
    completedSteps = [];
}

// Step selection and navigation
function selectStep(stepIndex) {
    if (!currentExercise || !currentExercise.steps || stepIndex >= currentExercise.steps.length) return;
    
    currentStepIndex = stepIndex;
    const step = currentExercise.steps[stepIndex];
    
    // Update step visuals
    document.querySelectorAll('.step-item').forEach((item, index) => {
        item.classList.remove('active');
        if (completedSteps.includes(index)) {
            item.classList.add('completed');
        }
    });
    
    const activeStep = document.querySelector(`[data-step-index="${stepIndex}"]`);
    if (activeStep) {
        activeStep.classList.add('active');
    }
    
    // Show current step info
    const currentStepInfo = document.getElementById('currentStepInfo');
    const currentStepName = document.getElementById('currentStepName');
    const currentStepDescription = document.getElementById('currentStepDescription');
    
    currentStepInfo.style.display = 'block';
    currentStepName.textContent = step.name;
    currentStepDescription.textContent = step.description;
    
    // Set timer for this step
    timerSeconds = step.duration;
    updateTimerDisplay();
    
    // Reset timer state
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
    isTimerRunning = false;
    isTimerPaused = false;
    
    // Update UI buttons
    document.getElementById('startTimerBtn').style.display = 'inline-block';
    document.getElementById('pauseTimerBtn').style.display = 'none';
    document.getElementById('nextStepBtn').style.display = stepIndex < currentExercise.steps.length - 1 ? 'inline-block' : 'none';
    
    const timerDisplay = document.getElementById('timerDisplay');
    timerDisplay.className = 'timer-display';
}

function nextStep() {
    if (currentStepIndex < currentExercise.steps.length - 1) {
        // Mark current step as completed
        if (!completedSteps.includes(currentStepIndex)) {
            completedSteps.push(currentStepIndex);
        }
        selectStep(currentStepIndex + 1);
    }
}


function updateTimerDisplay() {
    const minutes = Math.floor(timerSeconds / 60);
    const seconds = timerSeconds % 60;
    document.getElementById('timerDisplay').textContent = 
        `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function startTimer() {
    if (isTimerPaused) {
        // Resume timer
        isTimerPaused = false;
    } else if (!isTimerRunning) {
        // Start new timer
        isTimerRunning = true;
    }
    
    document.getElementById('startTimerBtn').style.display = 'none';
    document.getElementById('pauseTimerBtn').style.display = 'inline-block';
    
    const timerDisplay = document.getElementById('timerDisplay');
    timerDisplay.className = 'timer-display active';
    
    timer = setInterval(() => {
        timerSeconds--;
        updateTimerDisplay();
        
        if (timerSeconds <= 0) {
            clearInterval(timer);
            timer = null;
            isTimerRunning = false;
            
            // Play ding sound
            playDingSound();
            
            // Handle step completion or exercise completion
            if (currentExercise.steps && currentExercise.steps.length > 0) {
                // Mark current step as completed
                if (!completedSteps.includes(currentStepIndex)) {
                    completedSteps.push(currentStepIndex);
                }
                
                // Update step visual
                const stepEl = document.querySelector(`[data-step-index="${currentStepIndex}"]`);
                if (stepEl) {
                    stepEl.classList.add('completed');
                }
                
                // Check if this was the last step
                if (currentStepIndex >= currentExercise.steps.length - 1) {
                    // All steps completed, show completion section
                    document.getElementById('completionSection').style.display = 'block';
                    document.getElementById('nextStepBtn').style.display = 'none';
                } else {
                    // More steps remaining, show next step button
                    document.getElementById('nextStepBtn').style.display = 'inline-block';
                }
            } else {
                // Exercise without steps, show completion section
                document.getElementById('completionSection').style.display = 'block';
            }
            
            document.getElementById('pauseTimerBtn').style.display = 'none';
            
            timerDisplay.className = 'timer-display';
        }
    }, 1000);
}

function pauseTimer() {
    if (timer) {
        clearInterval(timer);
        timer = null;
        isTimerPaused = true;
        
        document.getElementById('startTimerBtn').style.display = 'inline-block';
        document.getElementById('pauseTimerBtn').style.display = 'none';
        
        const timerDisplay = document.getElementById('timerDisplay');
        timerDisplay.className = 'timer-display paused';
    }
}

function resetTimer() {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
    
    timerSeconds = currentExercise.duration;
    isTimerRunning = false;
    isTimerPaused = false;
    updateTimerDisplay();
    
    document.getElementById('startTimerBtn').style.display = 'inline-block';
    document.getElementById('pauseTimerBtn').style.display = 'none';
    document.getElementById('completionSection').style.display = 'none';
    
    const timerDisplay = document.getElementById('timerDisplay');
    timerDisplay.className = 'timer-display';
}

// Play ding sound
function playDingSound() {
    // Create audio context and generate a ding sound
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
        console.log('Could not play ding sound:', error);
        // Fallback: try to use a simple beep
        navigator.vibrate && navigator.vibrate(200);
    }
}

// Complete exercise
function completeExercise() {
    if (!currentExercise) return;
    
    const progress = getWorkoutProgress('bensWorkout');
    
    if (!progress.completed.includes(currentExercise.id)) {
        progress.completed.push(currentExercise.id);
        
        // Check if all exercises are completed
        if (progress.completed.length >= workoutData.bensWorkout.exercises.length) {
            progress.lastCompletedDate = new Date().toDateString();
            showWorkoutCompleteModal();
        }
        
        saveWorkoutProgress('bensWorkout', progress);
    }
    
    showScreen('workoutOverview', 'back');
}

// Show workout complete modal
function showWorkoutCompleteModal() {
    const modal = document.getElementById('workoutCompleteModal');
    modal.classList.add('show');
}

// Download modal functions
function showDownloadModal() {
    const modal = document.getElementById('downloadModal');
    modal.classList.add('show');
}

function closeDownloadModal() {
    const modal = document.getElementById('downloadModal');
    modal.classList.remove('show');
    document.getElementById('phoneInput').value = '';
    document.getElementById('emailInput').value = '';
}

function toggleContactInput() {
    const method = document.querySelector('input[name="contactMethod"]:checked').value;
    const phoneInput = document.getElementById('phoneInput');
    const emailInput = document.getElementById('emailInput');
    
    if (method === 'sms') {
        phoneInput.style.display = 'block';
        emailInput.style.display = 'none';
        phoneInput.focus();
    } else {
        phoneInput.style.display = 'none';
        emailInput.style.display = 'block';
        emailInput.focus();
    }
}

function sendDownloadLink() {
    const method = document.querySelector('input[name="contactMethod"]:checked').value;
    const phoneInput = document.getElementById('phoneInput');
    const emailInput = document.getElementById('emailInput');
    
    let contact = '';
    let isValidContact = false;
    
    if (method === 'sms') {
        contact = phoneInput.value.trim();
        if (!contact) {
            alert('Please enter a phone number');
            return;
        }
        // Basic phone number validation
        const phoneRegex = /^[\+]?[1-9][\d]{0,3}[\s\-\.]?[\(]?[\d]{1,3}[\)]?[\s\-\.]?[\d]{1,4}[\s\-\.]?[\d]{1,4}[\s\-\.]?[\d]{0,9}$/;
        if (!phoneRegex.test(contact)) {
            alert('Please enter a valid phone number');
            return;
        }
        isValidContact = true;
    } else {
        contact = emailInput.value.trim();
        if (!contact) {
            alert('Please enter an email address');
            return;
        }
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(contact)) {
            alert('Please enter a valid email address');
            return;
        }
        isValidContact = true;
    }
    
    if (isValidContact) {
        // Show sending state
        const sendBtn = document.getElementById('sendDownloadBtn');
        const originalText = sendBtn.textContent;
        sendBtn.textContent = 'Sending...';
        sendBtn.disabled = true;
        
        // Send to backend API
        sendDownloadLinkToBackend(method, contact)
            .then(success => {
                if (success) {
                    const message = method === 'sms' 
                        ? `Download link sent to ${contact}! Check your text messages.`
                        : `Download link sent to ${contact}! Check your email.`;
                    alert(message);
                } else {
                    alert('Failed to send download link. Please try again later.');
                }
            })
            .catch(error => {
                console.error('Error sending download link:', error);
                alert('Error sending download link. Please check your connection and try again.');
            })
            .finally(() => {
                sendBtn.textContent = originalText;
                sendBtn.disabled = false;
                closeDownloadModal();
            });
    }
}

// Mark workout complete functions
function markWorkoutComplete() {
    const progress = {
        completed: workoutData.bensWorkout.exercises.map(ex => ex.id),
        lastCompletedDate: new Date().toDateString()
    };
    
    saveWorkoutProgress('bensWorkout', progress);
    initHomeScreen();
    showWorkoutCompleteModal();
    showScreen('home', 'back');
}

// Notification settings functions
function showNotificationSettingsModal() {
    const modal = document.getElementById('notificationSettingsModal');
    
    // Load current settings
    loadNotificationSettings();
    
    // Update checkboxes
    document.querySelectorAll('.day-label input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = notificationSettings.days.includes(checkbox.value);
    });
    
    document.getElementById('morningNotif').checked = notificationSettings.morningEnabled;
    document.getElementById('eveningNotif').checked = notificationSettings.eveningEnabled;
    
    modal.classList.add('show');
}

function closeNotificationSettingsModal() {
    const modal = document.getElementById('notificationSettingsModal');
    modal.classList.remove('show');
}

function saveNotificationSettings() {
    // Get selected days
    const selectedDays = [];
    document.querySelectorAll('.day-label input[type="checkbox"]:checked').forEach(checkbox => {
        selectedDays.push(checkbox.value);
    });
    
    notificationSettings = {
        days: selectedDays,
        morningEnabled: document.getElementById('morningNotif').checked,
        eveningEnabled: document.getElementById('eveningNotif').checked
    };
    
    localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings));
    
    alert('Notification settings saved!');
    closeNotificationSettingsModal();
}

function loadNotificationSettings() {
    const saved = localStorage.getItem('notificationSettings');
    if (saved) {
        notificationSettings = JSON.parse(saved);
    }
}
function closeWorkoutCompleteModal() {
    const modal = document.getElementById('workoutCompleteModal');
    modal.classList.remove('show');
}

// Notification functions
function requestNotificationPermission() {
    if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                scheduleNotifications();
                hideNotificationBanner();
                localStorage.setItem('notificationsEnabled', 'true');
            }
        });
    }
}

function scheduleNotifications() {
    if ('serviceWorker' in navigator && 'Notification' in window) {
        navigator.serviceWorker.ready.then(registration => {
            // This would typically use the Push API for real notifications
            // For now, we'll set up local checks
            checkAndSendNotification();
            setInterval(checkAndSendNotification, 60000 * 60); // Check every hour
        });
    }
}

function checkAndSendNotification() {
    if (isWorkoutCompletedToday('bensWorkout')) {
        return; // Don't send notifications if workout is complete
    }
    
    const now = new Date();
    const hour = now.getHours();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = dayNames[now.getDay()];
    
    // Check if notifications are enabled for today
    if (!notificationSettings.days.includes(currentDay)) {
        return;
    }
    
    // Send notifications at configured times
    let shouldSend = false;
    if ((hour === 8 && notificationSettings.morningEnabled) || 
        (hour === 18 && notificationSettings.eveningEnabled)) {
        shouldSend = true;
    }
    
    if (shouldSend && now.getMinutes() < 5) {
        if (Notification.permission === 'granted') {
            const timeOfDay = hour === 8 ? 'morning' : 'evening';
            new Notification('Workout Reminder', {
                body: `Good ${timeOfDay}! Time for your workout. Don't forget to complete Ben's Workout today.`,
                icon: 'icon-192.png',
                badge: 'icon-192.png'
            });
        }
    }
}

function showNotificationBanner() {
    const banner = document.getElementById('notificationBanner');
    const notificationsEnabled = localStorage.getItem('notificationsEnabled');
    const bannerDismissed = localStorage.getItem('notificationBannerDismissed');
    
    if (!notificationsEnabled && !bannerDismissed && 'Notification' in window) {
        banner.classList.remove('hidden');
    }
}

function hideNotificationBanner() {
    const banner = document.getElementById('notificationBanner');
    banner.classList.add('hidden');
}

function dismissNotificationBanner() {
    localStorage.setItem('notificationBannerDismissed', 'true');
    hideNotificationBanner();
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Navigation
    document.getElementById('benWorkoutBtn').addEventListener('click', () => {
        initWorkoutOverview();
        showScreen('workoutOverview');
    });
    
    document.getElementById('backToHomeBtn').addEventListener('click', () => {
        initHomeScreen();
        showScreen('home', 'back');
    });
    
    document.getElementById('backToWorkoutBtn').addEventListener('click', () => {
        initWorkoutOverview();
        showScreen('workoutOverview', 'back');
    });
    
    // Timer controls
    document.getElementById('startTimerBtn').addEventListener('click', startTimer);
    document.getElementById('pauseTimerBtn').addEventListener('click', pauseTimer);
    document.getElementById('resetTimerBtn').addEventListener('click', resetTimer);
    document.getElementById('nextStepBtn').addEventListener('click', nextStep);
    
    // Exercise completion
    document.getElementById('completeExerciseBtn').addEventListener('click', completeExercise);
    
    // Modal
    document.getElementById('closeModalBtn').addEventListener('click', closeWorkoutCompleteModal);
    
    // Download functionality
    document.getElementById('downloadLinkBtn').addEventListener('click', showDownloadModal);
    document.getElementById('sendDownloadBtn').addEventListener('click', sendDownloadLink);
    document.getElementById('cancelDownloadBtn').addEventListener('click', closeDownloadModal);
    
    // Contact method switching
    document.querySelectorAll('input[name="contactMethod"]').forEach(radio => {
        radio.addEventListener('change', toggleContactInput);
    });
    
    // Mark workout complete
    document.getElementById('markWorkoutCompleteBtn').addEventListener('click', markWorkoutComplete);
    
    // Notification settings
    document.getElementById('notificationSettingsBtn').addEventListener('click', showNotificationSettingsModal);
    document.getElementById('saveNotificationSettings').addEventListener('click', saveNotificationSettings);
    document.getElementById('cancelNotificationSettings').addEventListener('click', closeNotificationSettingsModal);
    
    // Notification banner
    document.getElementById('enableNotificationsBtn').addEventListener('click', requestNotificationPermission);
    document.getElementById('dismissBannerBtn').addEventListener('click', dismissNotificationBanner);
    
    // Initialize app
    loadNotificationSettings();
    initHomeScreen();
    showNotificationBanner();
    
    // Initialize contact input toggle
    toggleContactInput();
    
    // Check for notifications permission
    if (localStorage.getItem('notificationsEnabled') === 'true') {
        scheduleNotifications();
    }
});

// Handle back button (for mobile)
window.addEventListener('popstate', function(e) {
    if (currentScreen === 'exerciseDetail') {
        initWorkoutOverview();
        showScreen('workoutOverview', 'back');
    } else if (currentScreen === 'workoutOverview') {
        initHomeScreen();
        showScreen('home', 'back');
    }
});