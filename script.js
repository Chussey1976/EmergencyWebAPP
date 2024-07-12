document.addEventListener('DOMContentLoaded', () => {
    const scheduleAppointmentBtn = document.getElementById('schedule-appointment');
    const disclaimerBtn = document.getElementById('disclaimer-btn');
    const commonNumbers = document.getElementById('common-numbers');
    const editModal = document.getElementById('edit-modal');
    const editName = document.getElementById('edit-name');
    const editNumber = document.getElementById('edit-number');
    const saveEditBtn = document.getElementById('save-edit');
    const deleteContactBtn = document.getElementById('delete-contact');
    const cancelEditBtn = document.getElementById('cancel-edit');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');

    let currentPage = 1;
    const contactsPerPage = 9;

    const commonContacts = [
        { name: 'Plumber', icon: 'fa-wrench' },
        { name: 'Electrician', icon: 'fa-bolt' },
        { name: 'HVAC Technician', icon: 'fa-fan' },
        { name: 'Locksmith', icon: 'fa-key' },
        { name: 'Pest Control', icon: 'fa-bug' },
        { name: 'Towing Service', icon: 'fa-truck' },
        { name: 'Handyman', icon: 'fa-tools' },
        { name: '24/7 Veterinarian', icon: 'fa-paw' },
        { name: 'Emergency Dentist', icon: 'fa-tooth' },
        { name: 'Mom', icon: 'fa-user' },
        { name: 'Dad', icon: 'fa-user' },
        { name: 'Spouse', icon: 'fa-heart' },
        { name: 'Barber/Hair Dresser', icon: 'fa-cut' },
        { name: 'Therapist', icon: 'fa-comments' },
        { name: 'Massage Therapist', icon: 'fa-hands' },
        { name: 'Roofing Contractor', icon: 'fa-home' },
        { name: 'Auto Mechanic', icon: 'fa-car' },
        { name: 'House Cleaning Service', icon: 'fa-broom' }
    ];

    function loadNumbers() {
        const numbers = getSavedNumbers();
        displayAllNumbers(numbers);
        updatePagination();
    }

    function displayAllNumbers(numbers) {
        commonNumbers.innerHTML = '';
        
        const startIndex = (currentPage - 1) * contactsPerPage;
        const endIndex = startIndex + contactsPerPage;
        const pageContacts = commonContacts.slice(startIndex, endIndex);

        pageContacts.forEach(contact => {
            const number = numbers.find(n => n.name.toLowerCase() === contact.name.toLowerCase());
            createContactButton(contact, number);
        });
    }

    function updatePagination() {
        const pageCount = Math.ceil(commonContacts.length / contactsPerPage);
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === pageCount;
    }

    function createContactButton(contact, number) {
        const button = document.createElement('button');
        button.className = `icon-btn ${number && number.number ? 'active' : 'inactive'}`;
        button.innerHTML = `
            <i class="fas ${contact.icon}"></i>
            <span>${contact.name}</span>
        `;
        button.addEventListener('click', (e) => {
            if (number && number.number) {
                showNumberOptions(e, number);
            } else {
                openEditModal({ name: contact.name, number: '', icon: contact.icon });
            }
        });
        
        // Double-click event for editing
        button.addEventListener('dblclick', () => {
            openEditModal(number || { name: contact.name, number: '', icon: contact.icon });
        });
        
        commonNumbers.appendChild(button);
    }

    function showNumberOptions(event, contact) {
        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'number-options';
        optionsDiv.innerHTML = `
            <p>${contact.name}: ${contact.number}</p>
            <button id="copyNumber">Copy Number</button>
            <button id="callNumber">Call Number</button>
        `;
        optionsDiv.style.position = 'absolute';
        optionsDiv.style.left = `${event.clientX}px`;
        optionsDiv.style.top = `${event.clientY}px`;
        optionsDiv.style.backgroundColor = 'white';
        optionsDiv.style.border = '1px solid #ccc';
        optionsDiv.style.padding = '10px';
        optionsDiv.style.borderRadius = '5px';
        optionsDiv.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
        document.body.appendChild(optionsDiv);

        document.getElementById('copyNumber').addEventListener('click', () => {
            navigator.clipboard.writeText(contact.number).then(() => {
                showConfirmation('Number copied to clipboard');
                document.body.removeChild(optionsDiv);
            });
        });

        document.getElementById('callNumber').addEventListener('click', () => {
            initiateCall(contact.number);
            document.body.removeChild(optionsDiv);
        });

        document.addEventListener('click', function closeOptions(e) {
            if (!optionsDiv.contains(e.target) && e.target !== event.target) {
                document.body.removeChild(optionsDiv);
                document.removeEventListener('click', closeOptions);
            }
        });
    }

    function initiateCall(number) {
        window.location.href = `tel:${number}`;
    }

    function openEditModal(contact = { name: '', number: '', icon: 'fa-user' }) {
        editName.value = contact.name;
        editNumber.value = contact.number;
        editModal.style.display = 'block';
        saveEditBtn.onclick = () => saveEdit(contact);
        deleteContactBtn.onclick = () => deleteContact(contact);
    }

    function saveEdit(contact) {
        const newName = editName.value.trim();
        const newNumber = editNumber.value.trim();
        
        // Validate phone number format if not blank
        const phonePattern = /^$|^\(\d{3}\)\s\d{3}-\d{4}$/;
        if (!phonePattern.test(newNumber)) {
            alert("Please enter a valid phone number in the format (888) 888-8888 or leave it blank");
            return;
        }
        
        const numbers = getSavedNumbers();
        const existingIndex = numbers.findIndex(n => n.name.toLowerCase() === contact.name.toLowerCase());
        
        if (existingIndex !== -1) {
            numbers[existingIndex] = { ...numbers[existingIndex], name: newName, number: newNumber };
        } else {
            numbers.push({ name: newName, number: newNumber, icon: contact.icon || 'fa-user' });
        }
        
        saveNumbers(numbers);
        loadNumbers();
        editModal.style.display = 'none';
        showConfirmation(`${newName} has been ${existingIndex !== -1 ? 'updated' : 'added'}.`);
    }

    function deleteContact(contact) {
        const numbers = getSavedNumbers();
        const updatedNumbers = numbers.filter(n => n.name.toLowerCase() !== contact.name.toLowerCase());
        saveNumbers(updatedNumbers);
        loadNumbers();
        editModal.style.display = 'none';
        showConfirmation(`${contact.name} has been deleted.`);
    }

    function showConfirmation(message) {
        const confirmation = document.createElement('div');
        confirmation.textContent = message;
        confirmation.style.position = 'fixed';
        confirmation.style.bottom = '20px';
        confirmation.style.left = '50%';
        confirmation.style.transform = 'translateX(-50%)';
        confirmation.style.backgroundColor = '#4CAF50';
        confirmation.style.color = 'white';
        confirmation.style.padding = '10px 20px';
        confirmation.style.borderRadius = '5px';
        document.body.appendChild(confirmation);
        setTimeout(() => {
            document.body.removeChild(confirmation);
        }, 3000);
    }

    function getSavedNumbers() {
        return JSON.parse(localStorage.getItem('emergencyNumbers')) || [];
    }

    function saveNumbers(numbers) {
        localStorage.setItem('emergencyNumbers', JSON.stringify(numbers));
    }

    function showDisclaimer() {
        const disclaimerModal = document.createElement('div');
        disclaimerModal.className = 'modal';
        disclaimerModal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>Disclaimer</h2>
                <p>This emergency contact app is provided as-is, without any warranties or guarantees. The developer is not responsible for any issues or damages that may arise from the use of this app. Use at your own risk.</p>
                <p>By using this app, you agree to hold the developer harmless from any claims or liabilities.</p>
            </div>
        `;
        document.body.appendChild(disclaimerModal);

        const closeBtn = disclaimerModal.querySelector('.close');
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(disclaimerModal);
        });

        disclaimerModal.style.display = 'block';
    }

    function formatPhoneNumber(input) {
        // Strip all non-digit characters
        let phoneNumber = input.value.replace(/\D/g, '');
        
        // Truncate if longer than 10 digits
        phoneNumber = phoneNumber.substring(0, 10);
        
        // Format the number
        if (phoneNumber.length > 0) {
            if (phoneNumber.length < 4) {
                phoneNumber = '(' + phoneNumber;
            } else if (phoneNumber.length < 7) {
                phoneNumber = '(' + phoneNumber.substring(0, 3) + ') ' + phoneNumber.substring(3);
            } else {
                phoneNumber = '(' + phoneNumber.substring(0, 3) + ') ' + phoneNumber.substring(3, 6) + '-' + phoneNumber.substring(6);
            }
        }
        
        // Update the input value
        input.value = phoneNumber;
    }

    scheduleAppointmentBtn.addEventListener('click', () => {
        window.open('https://myagendas.link/RG-Calendar', '_blank');
    });

    cancelEditBtn.addEventListener('click', () => {
        editModal.style.display = 'none';
    });

    disclaimerBtn.addEventListener('click', showDisclaimer);

    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            loadNumbers();
        }
    });

    nextPageBtn.addEventListener('click', () => {
        const pageCount = Math.ceil(commonContacts.length / contactsPerPage);
        if (currentPage < pageCount) {
            currentPage++;
            loadNumbers();
        }
    });

    editNumber.addEventListener('input', function() {
        formatPhoneNumber(this);
    });

    loadNumbers();
});