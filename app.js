
let events = [];

document.addEventListener('DOMContentLoaded', () => {
    loadEventsFromLocalStorage();
    renderEvents();
    updateStatistics();
    setupEventListeners();
});

function loadEventsFromLocalStorage() {
    const savedEvents = localStorage.getItem('events');
    if (savedEvents) {
        events = JSON.parse(savedEvents).map((event, index) => ({
            ...event,
            date: event.date || getDefaultEventDate(index),
            location: event.location || getDefaultEventLocation(index)
        }));
        saveEventsToLocalStorage();
    } else {
        events = [
            {
                id: 1,
                title: "AI hackathon",
                category: "Technology",
                date: "2026-06-12",
                location: "Busogo",
                seats: 30,
                registered: 12
            },
            {
                id: 2,
                title: "Basketball T",
                category: "Sports",
                date: "2026-06-20",
                location: "BK Arena",
                seats: 50,
                registered: 28
            },
            {
                id: 3,
                title: "Friday vybes`",
                category: "Arts",
                date: "2026-07-05",
                location: "Creative Studio",
                seats: 20,
                registered: 15
            }
        ];
        saveEventsToLocalStorage();
    }
}

function getDefaultEventDate(index) {
    const fallbackDates = ["2026-06-12", "2026-06-20", "2026-07-05"];
    return fallbackDates[index] || "2026-07-15";
}

function getDefaultEventLocation(index) {
    const fallbackLocations = ["Computer Lab 2", "Indoor Sports Court", "Creative Studio"];
    return fallbackLocations[index] || "Main Hall";
}

function formatEventDate(dateValue) {
    return new Date(`${dateValue}T00:00:00`).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

function saveEventsToLocalStorage() {
    localStorage.setItem('events', JSON.stringify(events));
}

function renderEvents() {
    const container = document.getElementById('eventsContainer');
    container.innerHTML = '';
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filteredEvents = events.filter(event => 
        event.title.toLowerCase().includes(searchTerm) ||
        event.category.toLowerCase().includes(searchTerm) ||
        event.location.toLowerCase().includes(searchTerm)
    );
    if (filteredEvents.length === 0) {
        container.innerHTML = '<div class="col-span-2 text-center py-12"><p class="text-neutral-200 text-lg">No events found. Try a different search or add a new event!</p></div>';
        return;
    }
    filteredEvents.forEach(event => {
        const card = createEventCard(event);
        container.appendChild(card);
    });
}

function createEventCard(event) {
    const remainingSeats = event.seats - event.registered;
    const isFullyBooked = remainingSeats === 0;
    const card = document.createElement('div');
    card.className = 'bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden';
    card.innerHTML = `
        <div class="p-6">
            <div class="flex justify-between items-start mb-3">
                <div>
                    <h4 class="text-xl font-bold text-neutral-950">${event.title}</h4>
                    <p class="text-sm text-neutral-600 mt-1">${event.category}</p>
                </div>
                <span class="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                    ${remainingSeats === 0 ? 'Full' : remainingSeats + ' seats'}
                </span>
            </div>

            <p class="mb-4 inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-sm font-semibold text-neutral-700">
                ${formatEventDate(event.date)}
            </p>

            <p class="mb-4 text-sm font-semibold text-neutral-700">
                Location: ${event.location}
            </p>

            <div class="grid grid-cols-2 gap-3 mb-4 text-sm">
                <div class="bg-neutral-100 p-3 rounded-lg">
                    <p class="text-neutral-600 text-xs font-medium">Total Seats</p>
                    <p class="text-lg font-bold text-neutral-950">${event.seats}</p>
                </div>
                <div class="bg-neutral-100 p-3 rounded-lg">
                    <p class="text-neutral-600 text-xs font-medium">Registered</p>
                    <p class="text-lg font-bold text-neutral-950">${event.registered}</p>
                </div>
            </div>

            <div class="w-full bg-neutral-200 rounded-full h-2 mb-4">
                <div class="bg-blue-600 h-2 rounded-full" style="width: ${(event.registered / event.seats) * 100}%"></div>
            </div>

            <div class="flex gap-2">
                <button 
                    onclick="registerForEvent(${event.id})"
                    class="flex-1 ${isFullyBooked ? 'bg-neutral-300 text-neutral-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'} font-semibold py-2 px-4 rounded-lg transition duration-200"
                    ${isFullyBooked ? 'disabled' : ''}
                >
                    Register
                </button>
                <button 
                    onclick="cancelRegistration(${event.id})"
                    class="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                >
                    Cancel
                </button>
            </div>
        </div>
    `;
    return card;
}

function updateStatistics() {
    document.getElementById('totalEvents').textContent = events.length;
    const totalRegistrations = events.reduce((sum, event) => sum + event.registered, 0);
    document.getElementById('totalRegistrations').textContent = totalRegistrations;
    const totalSeats = events.reduce((sum, event) => sum + event.seats, 0);
    const availableSeats = totalSeats - totalRegistrations;
    document.getElementById('availableSeats').textContent = availableSeats;
}

function registerForEvent(eventId) {
    const event = events.find(e => e.id === eventId);
    if (event) {
        const remainingSeats = event.seats - event.registered;
        if (remainingSeats > 0) {
            event.registered++;
            saveEventsToLocalStorage();
            renderEvents();
            updateStatistics();
        } else {
            alert('Sorry! This event is fully booked.');
        }
    }
}

function cancelRegistration(eventId) {
    const event = events.find(e => e.id === eventId);
    if (event && event.registered > 0) {
        event.registered--;
        saveEventsToLocalStorage();
        renderEvents();
        updateStatistics();
    } else if (!event) {
        alert('Event not found!');
    }
}

function setupEventListeners() {
    document.getElementById('addEventForm').addEventListener('submit', addNewEvent);
    document.getElementById('searchInput').addEventListener('input', renderEvents);
}

function addNewEvent(e) {
    e.preventDefault();
    const titleInput = document.getElementById('eventTitle');
    const categoryInput = document.getElementById('eventCategory');
    const dateInput = document.getElementById('eventDate');
    const locationInput = document.getElementById('eventLocation');
    const seatsInput = document.getElementById('eventSeats');
    const formMessage = document.getElementById('formMessage');
    const title = titleInput.value.trim();
    const category = categoryInput.value.trim();
    const date = dateInput.value;
    const location = locationInput.value.trim();
    const seats = parseInt(seatsInput.value);
    if (!title) {
        showFormMessage('Please enter an event title', 'error');
        return;
    }
    if (!category) {
        showFormMessage('Please select a category', 'error');
        return;
    }
    if (!date) {
        showFormMessage('Please select an event date', 'error');
        return;
    }
    if (!location) {
        showFormMessage('Please enter an event location', 'error');
        return;
    }
    if (!seats || seats < 1) {
        showFormMessage('Please enter a valid number of seats (minimum 1)', 'error');
        return;
    }
    const newEvent = {
        id: events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1,
        title: title,
        category: category,
        date: date,
        location: location,
        seats: seats,
        registered: 0
    };
    events.push(newEvent);
    saveEventsToLocalStorage();
    renderEvents();
    updateStatistics();
    document.getElementById('addEventForm').reset();
    showFormMessage('Event added successfully!', 'success');
    setTimeout(() => {
        formMessage.classList.add('hidden');
    }, 3000);
}

function showFormMessage(message, type) {
    const formMessage = document.getElementById('formMessage');
    formMessage.textContent = message;
    formMessage.classList.remove('hidden');
    if (type === 'error') {
        formMessage.className = 'p-3 rounded-lg text-sm font-medium bg-red-100 text-red-700 border border-red-200';
    } else if (type === 'success') {
        formMessage.className = 'p-3 rounded-lg text-sm font-medium bg-blue-100 text-blue-700 border border-blue-300';
    }
}
