document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form');
  const input = document.getElementById('nueva-tarea');
  const tasksList = document.getElementById('lista-tareas');
  const filterBtns = document.querySelectorAll('.filter-btn');
  
  // Keys for localStorage
  const STORAGE_KEY = 'gestor-tareas';
  
  // Initial state
  let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  let currentFilter = 'todos';
  
  // Render tasks
  function renderTasks() {
    const filteredTasks = filterTasks(tasks);
    
    if (filteredTasks.length === 0) {
      tasksList.innerHTML = '<div class="empty-state">No hay tareas</div>';
    } else {
      tasksList.innerHTML = filteredTasks.map((task, index) => `
        <div class="task ${task.completada ? 'completed' : ''}" data-id="${task.id}">
          <span class="task-text">${escapeHtml(task.texto)}</span>
          <button class="delete-btn" data-id="${task.id}">&times;</button>
        </div>
      `).join('');  
    }
    
    // Add event listeners after render
    attachEventListeners();
  }
  
  // Filter tasks
  function filterTasks(tasks) {
    switch (currentFilter) {
      case 'pendientes':
        return tasks.filter(t => !t.completada);
      case 'completadas':
        return tasks.filter(t => t.completada);
      default:
        return tasks;
    }
  }
  
  // Add task
  function addTask(texto) {
    if (!texto.trim()) return;
    
    const newTask = {
      id: Date.now().toString(),
      texto: texto.trim(),
      completada: false,
      fechaCreacion: new Date().toISOString()
    };
    
    tasks = [newTask, ...tasks];
    saveTasks();
    renderTasks();
    input.value = '';
  }
  
  // Toggle task completed
  function toggleTask(id) {
    tasks = tasks.map(task =>
      task.id === id ? { ...task, completada: !task.completada } : task
    );
    saveTasks();
    renderTasks();
  }
  
  // Delete task
  function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
  }
  
  // Save to localStorage
  function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }
  
  // Attach event listeners
  function attachEventListeners() {
    // Add task
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      addTask(input.value);
    });
    
    // Toggle completed
    document.querySelectorAll('.task:not(.completed)').forEach(task => {
      task.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) return;
        const taskId = task.dataset.id;
        toggleTask(taskId);
      });
    });
    
    // Delete task
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const taskId = btn.dataset.id;
        deleteTask(taskId);
      });
    });
  }
  
  // Filter buttons
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filtro;
      renderTasks();
    });
  });
  
  // Helper
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  // Initial render
  renderTasks();
});