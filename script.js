document.addEventListener('DOMContentLoaded', () => {
    const addNewBtn = document.getElementById('add-new-btn');
    const commonNumbers = document.getElementById('common-numbers');
    const editModal = document.getElementById('edit-modal');
    const editName = document.getElementById('edit-name');
    const editNumber = document.getElementById('edit-number');
    const saveEditBtn = document.getElementById('save-edit');
    const cancelEditBtn = document.getElementById('cancel-edit');

    const commonContacts = [
        { name: 'Dentist', icon: 'fa-tooth' },
        { name: 'Plumber', icon: 'fa-wrench' },
        { name: 'Dad', icon: 'fa-user' },
        { name: 'Mom', icon: 'fa-user' },
        { name: 'AAA', icon: 'fa-car' },
        { name: 'Wife', icon: 'fa-heart' },
        { name: 'Hair Dresser', icon: 'fa-scissors' },
        { name: 'Massage Therapist', icon: 'fa-hands' },
        { name: 'Therapist', icon: 'fa-comments' }
    ];

    function loadNumbers() {
        const numbers = getSavedNumbers();
        displayAllNumbers(numbers);
    }

    function displayAllNumbers(numbers) {
        commonNumbers.innerHTML = '';
        
        commonContacts.forEach(contact => {
            const number = numbers.find(n => n.name.toLowerCase() === contact.name.toLowerCase());
            createContactButton(contact, number);
        });

        numbers.forEach(number => {
            if (!commonContacts.some(contact => contact.name.toLowerCase() === number.name.toLowerCase())) {
                createContactButton(number, number);
            }
        });
    }

    function createContactButton(contact, number) {
        const button = document.createElement('button');
        button.className = `icon-btn ${number && number.number ? 'active' : 'inactive'}`;
        button.innerHTML = `
            <i class="fas ${contact.icon || 'fa-user'}"></i>
            <span>${contact.name}</span>
        `;
        button.addEventListener('click', (e) => {
            if (number && number.number) {
                showNumberOptions(e, number);
            } else {
                openEditModal({ name: contact.name, number: '', icon: contact.icon });
            }
        });
        button.addEventListener('mousedown', startLongPress);
        button.addEventListener('mouseup', endLongPress);
        button.addEventListener('mouseleave', endLongPress);
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
    }

    function saveEdit(contact) {
        const newName = editName.value.trim();
        const newNumber = editNumber.value.trim();
        const numbers = getSavedNumbers();
        const existingIndex = numbers.findIndex(n => n.name.toLowerCase() === contact.name.toLowerCase());
        
        if (existingIndex !== -1) {
            if (newNumber === '') {
                // Remove the contact if the number is empty
                numbers.splice(existingIndex, 1);
            } else {
                numbers[existingIndex] = { ...numbers[existingIndex], name: newName, number: newNumber };
            }
        } else if (newNumber !== '') {
            numbers.push({ name: newName, number: newNumber, icon: contact.icon || 'fa-user' });
        }
        
        saveNumbers(numbers);
        loadNumbers();
        editModal.style.display = 'none';
        showConfirmation(`${newName} has been ${existingIndex !== -1 ? (newNumber === '' ? 'removed' : 'updated') : 'added'}.`);
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

    addNewBtn.addEventListener('click', () => {
        openEditModal();
    });

    cancelEditBtn.addEventListener('click', () => {
        editModal.style.display = 'none';
    });

    let longPressTimer;
    let isLongPress = false;

    function startLongPress(e) {
        isLongPress = false;
        longPressTimer = setTimeout(() => {
            isLongPress = true;
            const button = e.target.closest('.icon-btn');
            const name = button.querySelector('span').textContent;
            const number = getSavedNumbers().find(n => n.name.toLowerCase() === name.toLowerCase());
            openEditModal(number || { name, number: '', icon: button.querySelector('i').className.split(' ')[1] });
        }, 500);
    }

    function endLongPress() {
        clearTimeout(longPressTimer);
    }

    loadNumbers();
});