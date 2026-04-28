let events = [];
let currentEventId = null;
const API_URL = 'http://localhost:5001/api';

document.addEventListener('DOMContentLoaded', function() {
    setupTabNavigation();
    setupEventForm();
    setupRegistrationForm();
    loadEvents();
    loadEventsDropdown();
});

function setupTabNavigation() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            this.classList.add('active');
            document.getElementById(tabName).classList.add('active');
        });
    });
}

function setupEventForm() {
    const eventForm = document.getElementById('eventForm');
    
    eventForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleCreateEvent();
    });

    document.getElementById('toggleCreateEvent').addEventListener('click', toggleCreateEventForm);
}

function setupRegistrationForm() {
    const registrationForm = document.getElementById('registrationForm');
    const eventSelect = document.getElementById('participantEvent');

    registrationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleRegistration();
    });

    eventSelect.addEventListener('change', function() {
        if (this.value) {
            loadEventDetails(this.value);
            loadEventParticipants(this.value);
        } else {
            document.getElementById('eventInfo').style.display = 'none';
            document.getElementById('participantsList').style.display = 'none';
        }
    });
}

function loadEvents() {
    fetch(`${API_URL}/events`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                events = data.data;
                displayEvents(events);
            }
        })
        .catch(error => console.error('Error loading events:', error));
}

function displayEvents(eventList) {
    const eventsList = document.getElementById('eventsList');
    const emptyMessage = document.getElementById('emptyEventsMessage');

    if (eventList.length === 0) {
        eventsList.style.display = 'none';
        emptyMessage.style.display = 'block';
        return;
    }

    eventsList.style.display = 'grid';
    emptyMessage.style.display = 'none';

    eventsList.innerHTML = eventList.map(event => {
        const eventDate = new Date(event.date);
        const participantCount = 0; // Will be updated per event

        return `
            <div class="event-card" onclick="viewEventDetails('${event._id}')">
                <h3>${escapeHtml(event.eventName)}</h3>
                <p>${escapeHtml(event.description)}</p>
                <div class="event-info">
                    <p><strong>📅 Date:</strong> ${eventDate.toLocaleDateString()}</p>
                    <p><strong>🕐 Time:</strong> ${event.time}</p>
                    <p><strong>📍 Location:</strong> ${escapeHtml(event.location)}</p>
                </div>
                <div class="event-capacity">
                    <span>Capacity: <strong>${event.capacity}</strong></span>
                    <span class="capacity-badge">Available</span>
                </div>
            </div>
        `;
    }).join('');
}

function handleCreateEvent() {
    const formData = {
        eventName: document.getElementById('eventName').value.trim(),
        description: document.getElementById('eventDescription').value.trim(),
        date: document.getElementById('eventDate').value,
        time: document.getElementById('eventTime').value,
        location: document.getElementById('eventLocation').value.trim(),
        capacity: parseInt(document.getElementById('eventCapacity').value)
    };

    fetch(`${API_URL}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('eventForm').reset();
            toggleCreateEventForm();
            loadEvents();
            loadEventsDropdown();
        }
    })
    .catch(error => console.error('Error:', error));
}

function toggleCreateEventForm() {
    const form = document.getElementById('createEventForm');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

function loadEventsDropdown() {
    const select = document.getElementById('participantEvent');
    
    fetch(`${API_URL}/events`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                select.innerHTML = '<option value="">Choose an event</option>' + 
                    data.data.map(event => 
                        `<option value="${event._id}">${escapeHtml(event.eventName)} - ${new Date(event.date).toLocaleDateString()}</option>`
                    ).join('');
            }
        })
        .catch(error => console.error('Error:', error));
}

function loadEventDetails(eventId) {
    fetch(`${API_URL}/events/${eventId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const eventDate = new Date(data.data.date);
                document.getElementById('selectedEventDate').textContent = eventDate.toLocaleDateString();
                document.getElementById('selectedEventLocation').textContent = escapeHtml(data.data.location);
                document.getElementById('availableSeats').textContent = data.data.availableSeats;
                document.getElementById('eventInfo').style.display = 'block';

                if (data.data.availableSeats <= 0) {
                    document.getElementById('registrationForm').style.opacity = '0.6';
                    document.getElementById('registrationForm').style.pointerEvents = 'none';
                } else {
                    document.getElementById('registrationForm').style.opacity = '1';
                    document.getElementById('registrationForm').style.pointerEvents = 'auto';
                }
            }
        })
        .catch(error => console.error('Error:', error));
}

function loadEventParticipants(eventId) {
    fetch(`${API_URL}/participants/event/${eventId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.data.length > 0) {
                displayParticipants(data.data);
                document.getElementById('participantsList').style.display = 'block';
            } else {
                document.getElementById('participantsList').style.display = 'none';
            }
        })
        .catch(error => console.error('Error:', error));
}

function displayParticipants(participants) {
    const tableBody = document.getElementById('participantsTableBody');
    
    tableBody.innerHTML = participants.map(p => {
        const regDate = new Date(p.registeredAt);
        return `
            <tr>
                <td>${escapeHtml(p.name)}</td>
                <td>${escapeHtml(p.email)}</td>
                <td>${escapeHtml(p.phone)}</td>
                <td>${escapeHtml(p.category)}</td>
                <td>${regDate.toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-delete" onclick="removeParticipant('${p._id}')">Remove</button>
                </td>
            </tr>
        `;
    }).join('');
}

function handleRegistration() {
    const eventId = document.getElementById('participantEvent').value;
    
    if (!eventId) {
        showRegistrationMessage('Please select an event', 'error');
        return;
    }

    const formData = {
        eventId: eventId,
        name: document.getElementById('participantName').value.trim(),
        email: document.getElementById('participantEmail').value.trim(),
        phone: document.getElementById('participantPhone').value.trim(),
        category: document.getElementById('participantCategory').value
    };

    fetch(`${API_URL}/participants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showRegistrationMessage('Registration successful!', 'success');
            document.getElementById('registrationForm').reset();
            loadEventDetails(eventId);
            loadEventParticipants(eventId);
        } else {
            showRegistrationMessage(data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showRegistrationMessage('Error during registration', 'error');
    });
}

function removeParticipant(participantId) {
    if (!confirm('Are you sure you want to remove this participant?')) return;

    fetch(`${API_URL}/participants/${participantId}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const eventId = document.getElementById('participantEvent').value;
            loadEventDetails(eventId);
            loadEventParticipants(eventId);
        }
    })
    .catch(error => console.error('Error:', error));
}

function showRegistrationMessage(message, type) {
    const messageEl = document.getElementById('registrationMessage');
    messageEl.textContent = message;
    messageEl.className = `message ${type}`;
    setTimeout(() => {
        messageEl.textContent = '';
        messageEl.className = 'message';
    }, 3000);
}

function viewEventDetails(eventId) {
    // Switch to registration tab
    document.querySelector('[data-tab="register"]').click();
    // Select the event
    document.getElementById('participantEvent').value = eventId;
    document.getElementById('participantEvent').dispatchEvent(new Event('change'));
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
