document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('appointment-form');
    const timeSlotsContainer = document.getElementById('time-slots');
    const appointmentsList = document.getElementById('appointments-list');
    const appointments = loadAppointments();

    form.addEventListener('submit', event => {
        event.preventDefault();
        const formData = new FormData(form);
        const patientName = formData.get('patient-name');
        const doctor = formData.get('doctor-select');
        const date = formData.get('appointment-date');

        displayTimeSlots(patientName, doctor, date);
    });

    function displayTimeSlots(patientName, doctor, date) {
        timeSlotsContainer.innerHTML = '';
        const timeSlots = generateTimeSlots();

        timeSlots.forEach(timeSlot => {
            const button = document.createElement('div');
            button.textContent = timeSlot;
            button.className = 'time-slot available';
            button.onclick = () => selectTimeSlot(button, patientName, doctor, date, timeSlot);

            if (isTimeSlotBooked(doctor, date, timeSlot) || timeSlot === '1:00-1:50 PM') {
                button.className = 'time-slot unavailable';
                button.disabled = true;
            }

            timeSlotsContainer.appendChild(button);
        });
    }

    function generateTimeSlots() {
        const slots = [];
        for (let i = 9; i < 20; i++) {
            const period = i < 12 ? 'AM' : 'PM';
            const hour = i % 12 === 0 ? 12 : i % 12;
            const time = `${hour}:00-${hour}:50 ${period}`;
            slots.push(time);
        }
        return slots;
    }

    function isTimeSlotBooked(doctor, date, timeSlot) {
        return appointments[`${doctor}-${date}-${timeSlot}`];
    }

    function selectTimeSlot(button, patientName, doctor, date, timeSlot) {
        const confirmBox = confirm(`Confirm appointment on ${date} at ${timeSlot} with ${doctor}?`);
        if (confirmBox) {
            button.className = 'time-slot selected';
            const appointmentId = generateAppointmentId(date, timeSlot);
            const appointment = { patientName, doctor, date, timeSlot, appointmentId };
            appointments[`${doctor}-${date}-${timeSlot}`] = appointment;
            saveAppointments(appointments);
            alert(`Appointment successfully confirmed: ${appointmentId}`);
            addAppointmentToList(appointmentId, date, timeSlot, doctor);
        }
    }

    function generateAppointmentId(date, timeSlot) {
        const day = new Date(date).getDate();
        const time = timeSlot.split(':')[0];
        return `${time.padStart(2, '0')}${day}`;
    }

    function addAppointmentToList(appointmentId, date, timeSlot, doctor) {
        const listItem = document.createElement('li');
        listItem.textContent = `ID: ${appointmentId}, Date: ${date}, Time: ${timeSlot}, Doctor: ${doctor}`;
        appointmentsList.appendChild(listItem);
    }

    window.cancelAppointment = () => {
        const appointmentId = document.getElementById('appointment-id').value;
        const appointment = Object.values(appointments).find(app => app.appointmentId === appointmentId);

        if (appointment) {
            const confirmBox = confirm(`Cancel appointment ID: ${appointmentId}?`);
            if (confirmBox) {
                delete appointments[`${appointment.doctor}-${appointment.date}-${appointment.timeSlot}`];
                saveAppointments(appointments);
                alert(`Appointment ID: ${appointmentId} cancelled`);
                removeAppointmentFromList(appointmentId);
                resetTimeSlotButton(appointment.doctor, appointment.date, appointment.timeSlot);
            }
        } else {
            alert('Appointment ID not found');
        }
    };

    function removeAppointmentFromList(appointmentId) {
        const listItem = Array.from(appointmentsList.children).find(item => item.textContent.includes(`ID: ${appointmentId}`));
        if (listItem) {
            appointmentsList.removeChild(listItem);
        }
    }

    function resetTimeSlotButton(doctor, date, timeSlot) {
        const button = Array.from(timeSlotsContainer.children).find(btn => btn.textContent === timeSlot);
        if (button) {
            button.className = 'time-slot available';
            button.disabled = false;
        }
    }

    function saveAppointments(appointments) {
        localStorage.setItem('appointments', JSON.stringify(appointments));
    }

    function loadAppointments() {
        const savedAppointments = localStorage.getItem('appointments');
        return savedAppointments ? JSON.parse(savedAppointments) : {};
    }

    function clearPastAppointments() {
        const now = new Date();
        for (const key in appointments) {
            const appointment = appointments[key];
            const appointmentDate = new Date(`${appointment.date} ${appointment.timeSlot.split('-')[1].trim()}`);
            if (appointmentDate < now) {
                delete appointments[key];
            }
        }
        saveAppointments(appointments);
    }

    clearPastAppointments();
    for (const key in appointments) {
        const appointment = appointments[key];
        addAppointmentToList(appointment.appointmentId, appointment.date, appointment.timeSlot, appointment.doctor);
    }
});
