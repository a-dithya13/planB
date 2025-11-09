const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
if (!currentUser) {
    window.location.href = 'index.html';
} 

const logoutBtn = document.getElementById('logoutBtn');
const addEventBtn = document.getElementById('addEventBtn');
const titelInput = document.getElementById('eventTitle'); // kept original variable name
const dateInput = document.getElementById('eventDate');
const timeInput = document.getElementById('eventTime');
const eventsList = document.getElementById('eventsList');

logoutBtn.addEventListener('click', function() {
    sessionStorage.removeItem('currentUser');
    alert('Logged out successfully!');
    window.location.href = 'index.html';
});

addEventBtn.addEventListener('click', function() {
    const title = titelInput.value.trim();
    const date = dateInput.value;
    const time = timeInput.value;

    if (title === '') { 
        alert('Please enter event title.');
        return;
    }
    if (date === '') {
        alert('Please select event date.');
        return;
    }
    if (time === '') {
        alert('Please select event time.');
        return;
    }

    const eventDateTime = new Date(date + 'T' + time);
    const now = new Date();
    if(eventDateTime < now){
        alert('Event date and time must be in the future.');
        return;
    }   

    const eventsJSoN = localStorage.getItem(`events`);
    const events = eventsJSoN ? JSON.parse(eventsJSoN) : [];

    const newEvent = {
        id: Date.now(),
        userId: currentUser.id, // ✅ FIXED userID → userId
        title: title,
        date: date,
        time: time
    };

    events.push(newEvent);
    localStorage.setItem(`events`, JSON.stringify(events));

    titelInput.value = '';
    dateInput.value = '';
    timeInput.value = '';

    alert('Event added successfully!');
    displayEvents();
   
});

function displayEvents() {
    const eventsJSON = localStorage.getItem('events'); 
    const events = eventsJSON ? JSON.parse(eventsJSON) : [];
    
    // Filters ✅ FIXED userId filter
    const userEvents = events.filter(event => event.userId === currentUser.id); 
    
    eventsList.innerHTML = '';
    
    if(userEvents.length === 0) {
        eventsList.innerHTML = '<li class="empty-message">No events yet. Add one above!</li>';
        return;
    }
    
    userEvents.forEach(function(event) {
        const li = document.createElement('li');
        
        li.innerHTML = `
            <div class="event-info">
                <div class="event-title">${event.title}</div>
                <div class="event-time">${event.date} at ${event.time}</div>
            </div>
            <button class="delete-btn" data-id="${event.id}">Delete</button>
        `;
        
        eventsList.appendChild(li);
    });

    addDeleteListeners(); // ✅ IMPORTANT: reattach delete buttons each render
}

// Call it when page loads
displayEvents();

// Delete event function
function deleteEvent(eventId) {
    // Get all events
    const eventsJSON = localStorage.getItem('events');
    const events = eventsJSON ? JSON.parse(eventsJSON) : [];
    
    // Remove the event with matching id
    const updatedEvents = events.filter(e => e.id !== eventId);
    
    // Save back to localStorage
    localStorage.setItem('events', JSON.stringify(updatedEvents));
    
    // Refresh the display
    displayEvents();
    
    alert('Event deleted!');
}

// Add click listeners to delete buttons
function addDeleteListeners() {
    const deleteBtns = document.querySelectorAll('.delete-btn');
    
    deleteBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            const eventId = parseInt(this.getAttribute('data-id'));
            
            if(confirm('Are you sure you want to delete this event?')) {
                deleteEvent(eventId);
            }
        });
    });
}
// Notification: Check for upcoming events every 30 seconds
function checkUpcomingEvents() {
    const eventsJSON = localStorage.getItem('events');
    const events = eventsJSON ? JSON.parse(eventsJSON) : [];

    const now = new Date();

    events.forEach(event => {
        if (event.userId !== currentUser.id) return;

        const eventTime = new Date(event.date + "T" + event.time);
        const diffMinutes = Math.round((eventTime - now) / 60000);

        
        if (diffMinutes === 10 && !event.notified10min) {
            showReminderNotification(event.title, eventTime);
            event.notified10min = true; // store so no repeat spam
        }
    });

    localStorage.setItem('events', JSON.stringify(events));
}

// Shows browser + in-app notification
function showReminderNotification(title, time) {
    const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // In-app popup
    alert(`Reminder: Only 10 minutes left for "${title}" at ${timeStr}`);

    // Browser notification
    if (Notification.permission === "granted") {
        new Notification("Event Reminder", {
            body: `"${title}" starts in 10 minutes.`,
        });
    }
}

// permission request
if (Notification.permission !== "granted") {
    Notification.requestPermission();
}

// Runs check every 30 seconds
setInterval(checkUpcomingEvents, 30000);
