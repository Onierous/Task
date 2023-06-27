// Declare your variables outside the DOMContentLoaded event
let taskNameInput;
let saveTaskButton;
let loadTaskButton;
let taskList;
let deleteTaskButton;
let darkModeCheckbox;

document.addEventListener('DOMContentLoaded', (event) => {
    // Assign the variables inside the event
    taskNameInput = document.getElementById("taskName");
    saveTaskButton = document.getElementById("saveTask");
    loadTaskButton = document.getElementById("loadTask");
    deleteTaskButton = document.getElementById("deleteTask");
    taskList = document.getElementById("taskList");
    darkModeCheckbox = document.getElementById("darkMode");

    // Refresh the task list when the popup is opened
    refreshTaskList();

    // Set the checkbox state from stored preference
    let isDarkModeEnabled = localStorage.getItem("darkMode") === "true";
    darkModeCheckbox.checked = isDarkModeEnabled;
    
    // Set body class based on dark mode preference
    document.body.classList.toggle('dark-mode', isDarkModeEnabled);

    // When the checkbox is toggled, update the stored preference
    darkModeCheckbox.addEventListener("change", function () {
        localStorage.setItem("darkMode", this.checked);
        document.body.classList.toggle('dark-mode', this.checked);
    });

    // Handle the save button click
    saveTaskButton.addEventListener("click", function () {
        let taskName = taskNameInput.value;
        alert("Button Clicked!");
        if (taskName) {
            // Send a message to the background script to save the task
            chrome.runtime.sendMessage({
                command: "saveTask",
                taskName: taskName
            }, function (response) {
                console.log(response.result); // log the result for debug purposes
            });

            // Refresh the task list after saving
            refreshTaskList();
        }
    });

    // Handle the load button click
    loadTaskButton.addEventListener("click", function () {
        let taskName = taskList.value;
        if (taskName) {
            // Send a message to the background script to load the task
            chrome.runtime.sendMessage({
                command: "loadTask",
                taskName: taskName
            });
        }
    });

    // Handle the delete button click
    deleteTaskButton.addEventListener("click", function () {
        let taskName = taskList.value;
        if (taskName) {
            if (confirm("Are you sure you want to delete the selected task?")) {
                chrome.runtime.sendMessage({
                    command: "deleteTask",
                    taskName: taskName
                }, function (response) {
                    console.log(response.result);
                    refreshTaskList();
                });
            }
        }
    });

    // Function to refresh the task list
    function refreshTaskList() {
        // Clear the task list
        taskList.innerHTML = '';

        // Fetch the list of tasks and populate the select box
        chrome.runtime.sendMessage({
            command: "getTasks"
        }, function (response) {
            // Check if tasks exist
            if (response.tasks && response.tasks.length > 0) {
                // If tasks exist, iterate over each task
                response.tasks.forEach(task => {
                    let option = document.createElement('option');
                    option.textContent = task.name;
                    taskList.appendChild(option);
                });
            } else {
                // If no tasks exist, display a message in the select box
                let option = document.createElement('option');
                option.textContent = "No tasks available";
                taskList.appendChild(option);
            }
        });
    }
});
