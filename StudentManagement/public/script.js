let students = [];
let editingId = null;
const API_URL = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', function() {
    loadStudents();
    setupEventListeners();
});

function setupEventListeners() {
    const form = document.getElementById('studentForm');
    const searchInput = document.getElementById('searchInput');
    const resetBtn = document.getElementById('resetBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const modal = document.getElementById('modal');
    const modalClose = document.querySelector('.modal-close');

    form.addEventListener('submit', handleFormSubmit);
    searchInput.addEventListener('input', handleSearch);
    resetBtn.addEventListener('click', resetForm);
    cancelBtn.addEventListener('click', cancelEdit);
    modalClose.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

function loadStudents() {
    fetch(`${API_URL}/students`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                students = data.data;
                displayStudents(students);
                updateStudentCount(students.length);
            }
        })
        .catch(error => {
            console.error('Error loading students:', error);
            showMessage('Error loading students', 'error');
        });
}

function displayStudents(studentList) {
    const tableBody = document.getElementById('studentTableBody');
    const emptyMessage = document.getElementById('emptyMessage');
    const tableContainer = document.getElementById('tableContainer');

    if (studentList.length === 0) {
        tableContainer.style.display = 'none';
        emptyMessage.style.display = 'block';
        return;
    }

    tableContainer.style.display = 'block';
    emptyMessage.style.display = 'none';

    tableBody.innerHTML = studentList.map(student => `
        <tr>
            <td>${escapeHtml(student.name)}</td>
            <td>${escapeHtml(student.rollNo)}</td>
            <td>${escapeHtml(student.branch)}</td>
            <td>${escapeHtml(student.email)}</td>
            <td>${escapeHtml(student.phone)}</td>
            <td>${escapeHtml(student.address)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-small btn-edit" onclick="editStudent('${student._id}')">Edit</button>
                    <button class="btn-small btn-delete" onclick="deleteStudent('${student._id}')">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function handleFormSubmit(e) {
    e.preventDefault();

    const formData = {
        name: document.getElementById('name').value.trim(),
        rollNo: document.getElementById('rollNo').value.trim(),
        branch: document.getElementById('branch').value,
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        address: document.getElementById('address').value.trim()
    };

    if (!validateForm(formData)) {
        return;
    }

    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${API_URL}/students/${editingId}` : `${API_URL}/students`;

    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showMessage(data.message, 'success');
            resetForm();
            loadStudents();
        } else {
            showMessage(data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showMessage('Error saving student', 'error');
    });
}

function validateForm(formData) {
    clearAllErrors();
    let isValid = true;

    if (!formData.name) {
        showError('nameError', 'Name is required');
        isValid = false;
    }

    if (!formData.rollNo) {
        showError('rollNoError', 'Roll No is required');
        isValid = false;
    }

    if (!formData.branch) {
        showError('branchError', 'Branch is required');
        isValid = false;
    }

    if (!formData.email || !isValidEmail(formData.email)) {
        showError('emailError', 'Valid email is required');
        isValid = false;
    }

    if (!formData.phone || !isValidPhone(formData.phone)) {
        showError('phoneError', 'Valid phone is required (10 digits)');
        isValid = false;
    }

    if (!formData.address) {
        showError('addressError', 'Address is required');
        isValid = false;
    }

    return isValid;
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
    return /^[0-9]{10}$/.test(phone.replace(/\D/g, ''));
}

function showError(elementId, message) {
    document.getElementById(elementId).textContent = message;
}

function clearAllErrors() {
    document.querySelectorAll('.error').forEach(el => {
        el.textContent = '';
    });
}

function editStudent(id) {
    const student = students.find(s => s._id === id);
    if (!student) return;

    editingId = id;

    document.getElementById('name').value = student.name;
    document.getElementById('rollNo').value = student.rollNo;
    document.getElementById('branch').value = student.branch;
    document.getElementById('email').value = student.email;
    document.getElementById('phone').value = student.phone;
    document.getElementById('address').value = student.address;

    document.getElementById('submitBtn').textContent = 'Update Student';
    document.getElementById('cancelBtn').style.display = 'block';

    document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
}

function deleteStudent(id) {
    if (!confirm('Are you sure you want to delete this student?')) return;

    fetch(`${API_URL}/students/${id}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showMessage('Student deleted successfully', 'success');
            loadStudents();
        } else {
            showMessage(data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showMessage('Error deleting student', 'error');
    });
}

function cancelEdit() {
    resetForm();
    editingId = null;
}

function resetForm() {
    document.getElementById('studentForm').reset();
    clearAllErrors();
    document.getElementById('submitBtn').textContent = 'Add Student';
    document.getElementById('cancelBtn').style.display = 'none';
    editingId = null;
    document.getElementById('formMessage').textContent = '';
    document.getElementById('formMessage').className = 'message';
}

function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = students.filter(student =>
        student.name.toLowerCase().includes(searchTerm) ||
        student.rollNo.toLowerCase().includes(searchTerm) ||
        student.email.toLowerCase().includes(searchTerm)
    );
    displayStudents(filtered);
    updateStudentCount(filtered.length);
}

function updateStudentCount(count) {
    document.getElementById('studentCount').textContent = count;
}

function showMessage(message, type) {
    const messageEl = document.getElementById('formMessage');
    messageEl.textContent = message;
    messageEl.className = `message ${type}`;
    setTimeout(() => {
        messageEl.textContent = '';
        messageEl.className = 'message';
    }, 3000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
