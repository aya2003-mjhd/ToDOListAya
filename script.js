const taskInput = document.getElementById('taskInput');
const dueDateInput = document.getElementById('dueDateInput');
const prioritySelect = document.getElementById('prioritySelect');
const categoryInput = document.getElementById('categoryInput');
const taskList = document.getElementById('taskList');
const searchInput = document.getElementById('searchInput');
const progressDisplay = document.getElementById('taskProgress');

document.getElementById('addTaskBtn').addEventListener('click', addTask);
document.getElementById('allBtn').addEventListener('click', () => filterTasks('all'));
document.getElementById('activeBtn').addEventListener('click', () => filterTasks('active'));
document.getElementById('completedBtn').addEventListener('click', () => filterTasks('completed'));
document.getElementById('clearCompletedBtn').addEventListener('click', clearCompletedTasks);
searchInput.addEventListener('input', searchTasks); // Add this line

// Add a new task
function addTask() {
  const taskName = taskInput.value.trim();
  const dueDate = dueDateInput.value || 'N/A';
  const priority = prioritySelect.value;
  const category = categoryInput.value.trim() || 'Uncategorized';
  if (!taskName) {
    alert('Please enter a task!');
    return;
  }
  const task = document.createElement('div');
  task.className = `task ${priority.toLowerCase()}`;
  task.draggable = true;
  task.innerHTML = `
    <input type="checkbox" class="task-complete-checkbox">
    <span contenteditable="true">${taskName} (Due: ${dueDate}) [${priority}] [${category}]</span>
    <button class="delete-btn">Delete</button>
  `;
  taskList.appendChild(task);
  attachDragEvents(task);
  saveTaskToStorage(taskName, dueDate, priority, category);
  updateProgress();
  task.querySelector('.task-complete-checkbox').addEventListener('change', toggleComplete);
  task.querySelector('.delete-btn').addEventListener('click', () => {
    task.remove();
    updateProgress();
  });
  taskInput.value = '';
  dueDateInput.value = '';
  categoryInput.value = '';
}

// Toggle task completion
function toggleComplete(event) {
  const task = event.target.parentElement;
  task.classList.toggle('completed');
  updateProgress();
}

// Filter tasks based on selection (All, Active, Completed)
function filterTasks(filter) {
  const tasks = Array.from(taskList.children);
  tasks.forEach(task => {
    const isCompleted = task.classList.contains('completed');
    if (filter === 'all') {
      task.style.display = 'flex';
    } else if (filter === 'active' && isCompleted) {
      task.style.display = 'none';
    } else if (filter === 'completed' && !isCompleted) {
      task.style.display = 'none';
    } else {
      task.style.display = 'flex';
    }
  });
}

// Clear all completed tasks
function clearCompletedTasks() {
  const tasks = Array.from(taskList.children);
  tasks.forEach(task => {
    if (task.classList.contains('completed')) {
      task.remove();
    }
  });
  updateProgress();
}

// Save tasks to localStorage
function saveTaskToStorage(name, date, priority, category) {
  const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  tasks.push({ name, date, priority, category, completed: false });
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Update task progress display
function updateProgress() {
  const totalTasks = taskList.children.length;
  const completedTasks = [...taskList.children].filter(task => task.classList.contains('completed')).length;
  progressDisplay.textContent = `${completedTasks} of ${totalTasks} tasks completed`;
}

// Drag-and-drop support
function attachDragEvents(task) {
  task.addEventListener('dragstart', () => task.classList.add('dragging'));
  task.addEventListener('dragend', () => task.classList.remove('dragging'));
  taskList.addEventListener('dragover', (e) => {
    e.preventDefault();
    const afterElement = getDragAfterElement(e.clientY);
    const dragging = document.querySelector('.dragging');
    if (afterElement == null) {
      taskList.appendChild(dragging);
    } else {
      taskList.insertBefore(dragging, afterElement);
    }
  });
}

function getDragAfterElement(y) {
  const elements = [...taskList.querySelectorAll('.task:not(.dragging)')];
  return elements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Search tasks based on input
function searchTasks() {
  const query = searchInput.value.toLowerCase();
  const tasks = Array.from(taskList.children);
  tasks.forEach(task => {
    const taskText = task.innerText.toLowerCase();
    if (taskText.includes(query)) {
      task.style.display = 'flex';
    } else {
      task.style.display = 'none';
    }
  });
}

// Load theme from localStorage
function loadTheme() {
  const darkMode = localStorage.getItem('darkMode');
  if (darkMode === 'enabled') {
    document.body.classList.add('dark-mode');
  }
}

function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  const darkMode = document.body.classList.contains('dark-mode') ? 'enabled' : 'disabled';
  localStorage.setItem('darkMode', darkMode);
}

// Call the loadTheme function on page load
loadTheme();
