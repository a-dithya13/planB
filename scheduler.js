// Get current user; if not logged in → redirect
const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
if (!currentUser) {
    window.location.href = 'index.html';
}

//  Get  elements
const logoutBtn = document.getElementById('logoutBtn');
const addEventBtn = document.getElementById('addEventBtn');
const titelInput = document.getElementById('eventTitle'); // original name kept
const dateInput = document.getElementById('eventDate');
const timeInput = document.getElementById('eventTime');
const eventsList = document.getElementById('eventsList');

//  Logout button
logoutBtn.addEventListener('click', function() {
    sessionStorage.removeItem('currentUser');
    alert('Logged out successfully!');
    window.location.href = 'index.html';
});

//  Add Event button
addEventBtn.addEventListener('click', function() {
    const title = titelInput.value.trim();
    const date = dateInput.value;
    const time = timeInput.value;

    if (title === '' || date === '' || time === '') {
        alert('Please fill all fields.');
        return;
    }

    const eventDateTime = new Date(date + 'T' + time);
    const now = new Date();
    if (eventDateTime < now) {
        alert('Event date and time must be in the future.');
        return;
    }

    const eventsJSON = localStorage.getItem('events');
    const events = eventsJSON ? JSON.parse(eventsJSON) : [];

    const newEvent = {
        id: Date.now(),
        userId: currentUser.id,  //  fixed property namesca
        title: title,
        date: date,
        time: time,
        notified10min: false //  initialize
    };

    events.push(newEvent);
    localStorage.setItem('events', JSON.stringify(events));

    sendEmailReminder(newEvent); //  NOW placed correctly

    titelInput.value = '';
    dateInput.value = '';
    timeInput.value = '';

    alert('Event added successfully!');
    displayEvents();
});

// ✅ EmailJS - Send Reminder Email
function sendEmailReminder(event) {
    // Debug: check current user and event
    console.log("Sending email to:", currentUser.email);
    console.log("Event details:", event);

    emailjs.send("service_8hv6frq", "template_qw2inin", {
        event_title: event.title,
        event_time: `${event.date} ${event.time}`,
        to_email: currentUser.email // must match your EmailJS template variable
    })
    .then((response) => {
        console.log("✅ EmailJS Success:", response);
        alert("Reminder email scheduled successfully!");
    })
    .catch((err) => {
        console.error("❌ EmailJS Error:", err);
        alert("Email failed to send. Check console for details.");
    });
}

// ✅ Display Events on screen
function displayEvents() {
    const eventsJSON = localStorage.getItem('events');
    const events = eventsJSON ? JSON.parse(eventsJSON) : [];

    const userEvents = events.filter(e => e.userId === currentUser.id);

    eventsList.innerHTML = '';

    if (userEvents.length === 0) {
        eventsList.innerHTML = '<li class="empty-message">No events yet. Add one above!</li>';
        return;
    }

    userEvents.forEach(event => {
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

    addDeleteListeners();
}

//  Delete event
function deleteEvent(eventId) {
    const eventsJSON = localStorage.getItem('events');
    const events = eventsJSON ? JSON.parse(eventsJSON) : [];

    const updatedEvents = events.filter(e => e.id !== eventId);

    localStorage.setItem('events', JSON.stringify(updatedEvents));

    alert('Event deleted!');
    displayEvents();
}

//  Add delete button event listeners
function addDeleteListeners() {
    const deleteBtns = document.querySelectorAll('.delete-btn');
    deleteBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const eventId = parseInt(this.getAttribute('data-id'));
            if (confirm('Are you sure you want to delete this event?')) {
                deleteEvent(eventId);
            }
        });
    });
}
//  Notification: checks upcoming events every 30 seconds
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
            event.notified10min = true;
        }
    });

    localStorage.setItem('events', JSON.stringify(events));
}

//  Browser + alert notification
function showReminderNotification(title, time) {
    const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    alert(`Reminder: Only 10 minutes left for "${title}" at ${timeStr}`);

    if (Notification.permission === "granted") {
        new Notification("Event Reminder", {
            body: `"${title}" starts in 10 minutes.`,
        });
    }
}

if (Notification.permission !== "granted") {
    Notification.requestPermission();
}

setInterval(checkUpcomingEvents, 30000);

// Initial load
displayEvents();
