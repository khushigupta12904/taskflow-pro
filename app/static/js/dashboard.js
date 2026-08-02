document.addEventListener('DOMContentLoaded', () => {
    const token = API.getToken();
    if (!token) {
        window.location.href = '/login';
        return;
    }

    // Set User Name
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userDisplay = document.getElementById('user-display');
    if (userDisplay) {
        userDisplay.textContent = `Hi, ${user.username || 'User'}`;
    }

    // Load Tasks Initially
    loadTasks();

    // Event Listeners
    const taskForm = document.getElementById('task-form');
    if (taskForm) {
        taskForm.addEventListener('submit', handleAddTask);
    }

    const filterStatus = document.getElementById('filter-status');
    if (filterStatus) {
        filterStatus.addEventListener('change', loadTasks);
    }

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = '/login';
        });
    }
});

async function loadTasks() {
    const filterStatus = document.getElementById('filter-status');
    const status = filterStatus ? filterStatus.value : '';
    const query = status ? `?status=${status}` : '';

    const res = await API.request(`/tasks${query}`, { method: 'GET' });

    if (!res || !res.ok) return;

    renderTaskList(res.data.tasks || []);
}

function renderTaskList(tasks) {
    const listContainer = document.getElementById('task-list');
    listContainer.innerHTML = '';

    if (tasks.length === 0) {
        listContainer.innerHTML = `
            <div class="text-center py-4 text-muted">
                No tasks found. Create one using the form above!
            </div>`;
        return;
    }

    tasks.forEach(task => {
        const isDone = task.status === 'Completed';
        const priorityClass = `badge-priority-${task.priority.toLowerCase()}`;

        const item = document.createElement('div');
        item.className = `task-card p-3 mb-2 d-flex justify-content-between align-items-center ${isDone ? 'task-completed' : ''}`;
        item.innerHTML = `
            <div>
                <h6 class="mb-1 ${isDone ? 'text-decoration-line-through text-muted' : 'fw-bold'}">${task.title}</h6>
                <p class="small text-muted mb-0">${task.description || 'No description'}</p>
                <span class="badge ${priorityClass} mt-2">${task.priority}</span>
            </div>
            <div>
                <button class="btn btn-sm ${isDone ? 'btn-outline-secondary' : 'btn-success'} me-2" onclick="toggleTaskStatus(${task.id}, '${task.status}')">
                    ${isDone ? 'Undo' : 'Complete'}
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteTask(${task.id})">Delete</button>
            </div>
        `;
        listContainer.appendChild(item);
    });
}

async function handleAddTask(e) {
    e.preventDefault();
    const title = document.getElementById('task-title').value;
    const priority = document.getElementById('task-priority').value;
    const description = document.getElementById('task-desc').value;

    const res = await API.request('/tasks', {
        method: 'POST',
        body: JSON.stringify({ title, priority, description })
    });

    if (res && res.ok) {
        document.getElementById('task-title').value = '';
        document.getElementById('task-desc').value = '';
        loadTasks();
    }
}

async function toggleTaskStatus(id, currentStatus) {
    const newStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
    const res = await API.request(`/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
    });

    if (res && res.ok) {
        loadTasks();
    }
}

async function deleteTask(id) {
    if (!confirm('Are you sure you want to delete this task?')) return;

    const res = await API.request(`/tasks/${id}`, {
        method: 'DELETE'
    });

    if (res && res.ok) {
        loadTasks();
    }
}