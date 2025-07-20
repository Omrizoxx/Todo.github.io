
    document.addEventListener('DOMContentLoaded', function() {
    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const calendarDays = document.getElementById('calendar-days');
    const clearCompletedBtn = document.getElementById('clear-completed');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const currentMonthDisplay = document.getElementById('current-month');
    const taskDetails = document.getElementById('task-details');
    const selectedDateDisplay = document.getElementById('selected-date');
    const dayTasks = document.getElementById('day-tasks');
    
    let todos = [];
    let nextId = 1;
    let currentDate = new Date();
    let selectedDate = null;

    function renderCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        // Update month display
        currentMonthDisplay.textContent = new Date(year, month).toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
        });
        
        // Clear previous calendar
        calendarDays.innerHTML = '';
        
        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();
        
        // Add empty cells for previous month
        for (let i = firstDay - 1; i >= 0; i--) {
        const dayCell = createDayCell(daysInPrevMonth - i, true, new Date(year, month - 1, daysInPrevMonth - i));
        calendarDays.appendChild(dayCell);
        }
        
        // Add days of current month
        for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = createDayCell(day, false, new Date(year, month, day));
        calendarDays.appendChild(dayCell);
        }
        
        // Add empty cells for next month
        const totalCells = calendarDays.children.length;
        const remainingCells = 42 - totalCells; // 6 rows × 7 days
        for (let day = 1; day <= remainingCells; day++) {
        const dayCell = createDayCell(day, true, new Date(year, month + 1, day));
        calendarDays.appendChild(dayCell);
        }
    }

    function createDayCell(day, isOtherMonth, date) {
        const dayCell = document.createElement('div');
        dayCell.className = `calendar-day ${isOtherMonth ? 'other-month' : ''}`;
        
        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = day;
        
        const tasksContainer = document.createElement('div');
        tasksContainer.className = 'day-tasks-preview';
        
        // Get tasks for this date
        const dayTasks = getTasksForDate(date);
        dayTasks.forEach(task => {
        const taskPreview = document.createElement('div');
        taskPreview.className = `task-preview ${task.completed ? 'completed' : ''}`;
        taskPreview.textContent = task.text.length > 15 ? task.text.substring(0, 15) + '...' : task.text;
        tasksContainer.appendChild(taskPreview);
        });
        
        // Add task count indicator
        if (dayTasks.length > 0) {
        dayCell.classList.add('has-tasks');
        if (dayTasks.length > 3) {
            const moreIndicator = document.createElement('div');
            moreIndicator.className = 'more-tasks';
            moreIndicator.textContent = `+${dayTasks.length - 3} more`;
            tasksContainer.appendChild(moreIndicator);
        }
        }
        
        // Highlight today
        const today = new Date();
        if (date.toDateString() === today.toDateString()) {
        dayCell.classList.add('today');
        }
        
        dayCell.appendChild(dayNumber);
        dayCell.appendChild(tasksContainer);
        
        // Add click handler
        dayCell.addEventListener('click', () => selectDate(date));
        
        return dayCell;
    }

    function getTasksForDate(date) {
        return todos.filter(todo => {
        const taskDate = new Date(todo.createdAt);
        return taskDate.toDateString() === date.toDateString() || 
                (todo.dueDate && new Date(todo.dueDate).toDateString() === date.toDateString());
        });
    }

    function selectDate(date) {
        selectedDate = date;
        const dayTasks = getTasksForDate(date);
        
        selectedDateDisplay.textContent = date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
        });
        
        renderDayTasks(dayTasks);
        taskDetails.style.display = 'block';
        
        // Highlight selected day
        document.querySelectorAll('.calendar-day').forEach(day => day.classList.remove('selected'));
        event.currentTarget.classList.add('selected');
    }

    function renderDayTasks(tasksForDay) {
        const dayTasksContainer = document.getElementById('day-tasks');
        dayTasksContainer.innerHTML = '';
        
        tasksForDay.forEach(todo => {
        const li = document.createElement('li');
        if (todo.completed) {
            li.classList.add('completed');
        }
        
        const createdDate = formatDate(todo.createdAt);
        const createdTime = formatTime(todo.createdAt);
        const dueDateHtml = todo.dueDate ? 
            `<div class="due-date">⏰ Due: ${formatDate(todo.dueDate)} ${formatTime(todo.dueDate)}</div>` : '';
        
        const taskEmoji = getTaskEmoji(todo.text);
        
        li.innerHTML = `
            <div class="task-content">
            <span onclick="toggleTodo(${todo.id})">
                <span class="task-emoji">${taskEmoji}</span>
                <span class="task-text">${todo.text}</span>
            </span>
            <div class="task-meta">
                <div class="created-date">📝 Created: ${createdDate} at ${createdTime}</div>
                ${dueDateHtml}
            </div>
            </div>
            <div class="task-actions">
            <button class="due-btn" onclick="setDueDate(${todo.id})">📅</button>
            <button class="delete-btn" onclick="deleteTodo(${todo.id})">🗑️</button>
            </div>
        `;
        
        dayTasksContainer.appendChild(li);
        });
        
        if (tasksForDay.length === 0) {
        const emptyMessage = document.createElement('li');
        emptyMessage.className = 'empty-message';
        emptyMessage.textContent = 'No tasks for this date';
        dayTasksContainer.appendChild(emptyMessage);
        }
    }

    function formatDate(date) {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
        });
    }

    function formatTime(date) {
        const d = new Date(date);
        return d.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit'
        });
    }

    function getTaskEmoji(taskText) {
        const text = taskText.toLowerCase();
        if (text.includes('meeting') || text.includes('call') || text.includes('interview')) return '🤝';
        if (text.includes('workout') || text.includes('gym') || text.includes('exercise')) return '💪';
        if (text.includes('study') || text.includes('learn') || text.includes('read')) return '📚';
        if (text.includes('shop') || text.includes('buy') || text.includes('grocery')) return '🛒';
        if (text.includes('eat') || text.includes('lunch') || text.includes('dinner') || text.includes('food')) return '🍽️';
        if (text.includes('travel') || text.includes('trip') || text.includes('vacation')) return '✈️';
        if (text.includes('work') || text.includes('project') || text.includes('code')) return '💼';
        if (text.includes('clean') || text.includes('organize') || text.includes('tidy')) return '🧹';
        if (text.includes('doctor') || text.includes('dentist') || text.includes('health')) return '🏥';
        if (text.includes('birthday') || text.includes('party') || text.includes('celebrate')) return '🎉';
        if (text.includes('email') || text.includes('message') || text.includes('reply')) return '📧';
        if (text.includes('pay') || text.includes('bill') || text.includes('bank')) return '💳';
        return '📝'; // Default emoji
    }

    window.setDueDate = function(id) {
        const todo = todos.find(t => t.id === id);
        if (todo) {
        const dateInput = prompt('Set due date (YYYY-MM-DD HH:MM) or leave empty to remove:', 
            todo.dueDate ? new Date(todo.dueDate).toISOString().slice(0, 16).replace('T', ' ') : '');
        
        if (dateInput === '') {
            todo.dueDate = null;
        } else if (dateInput !== null) {
            const dueDate = new Date(dateInput);
            if (!isNaN(dueDate.getTime())) {
            todo.dueDate = dueDate;
            } else {
            alert('Invalid date format. Please use YYYY-MM-DD HH:MM');
            return;
            }
        }
        renderCalendar();
        if (selectedDate) {
            renderDayTasks(getTasksForDate(selectedDate));
        }
        }
    };

    function addTodo(text) {
        const newTodo = {
        id: nextId++,
        text: text,
        completed: false,
        createdAt: new Date(),
        dueDate: null
        };
        todos.push(newTodo);
        renderCalendar();
        
        // Auto-select today and show the new task
        const today = new Date();
        selectDate(today);
    }

    window.toggleTodo = function(id) {
        const todo = todos.find(t => t.id === id);
        if (todo) {
        todo.completed = !todo.completed;
        renderCalendar();
        if (selectedDate) {
            renderDayTasks(getTasksForDate(selectedDate));
        }
        }
    };

    window.deleteTodo = function(id) {
        todos = todos.filter(t => t.id !== id);
        renderCalendar();
        if (selectedDate) {
        renderDayTasks(getTasksForDate(selectedDate));
        }
    };

    function clearCompleted() {
        todos = todos.filter(todo => !todo.completed);
        renderCalendar();
        if (selectedDate) {
        renderDayTasks(getTasksForDate(selectedDate));
        }
    }

    // Event listeners
    todoForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const text = todoInput.value.trim();
        if (text) {
        addTodo(text);
        todoInput.value = '';
        }
    });

    clearCompletedBtn.addEventListener('click', clearCompleted);

    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    // Initial render
    renderCalendar();
    
    // Auto-select today
    const today = new Date();
    selectDate(today);
    });
