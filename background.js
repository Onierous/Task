self.addEventListener('install', function(event) {
    // Perform install steps
});

self.addEventListener('activate', function(event) {
    // Perform activate steps
});

function saveTask(name) {
    return new Promise((resolve, reject) => {
        chrome.tabs.query(
            { currentWindow: true }, 
            function (tabs) {
                let taskTabs = tabs.map(tab => (
                    {
                        url: tab.url,
                        title: tab.title,
                        pinned: tab.pinned // save the 'pinned' status
                    }
                ));
                let task = {
                    name: name,
                    timestamp: new Date().toISOString(),
                    tabs: taskTabs
                };
                chrome.storage.local.set({
                    [name]: task
                }, () => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    } else {
                        resolve();
                    }
                });
            }
        );
    });
}

function loadTask(name) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(name, function (result) {
            let task = result[name];
            if (task) {
                chrome.tabs.query(
                    { currentWindow: true }, 
                    function (tabs) {
                        // Open task tabs
                        task.tabs.forEach(tabInfo => {
                            chrome.tabs.create({
                                url: tabInfo.url,
                                pinned: tabInfo.pinned // restore the 'pinned' status
                            });
                        });
                        // Close current tabs
                        let tabIds = tabs.map(tab => tab.id);
                        chrome.tabs.remove(tabIds, () => {
                            if (chrome.runtime.lastError) {
                                reject(chrome.runtime.lastError);
                            } else {
                                resolve();
                            }
                        });
                    }
                );
            } else {
                resolve();
            }
        });
    });
}

function getTasks() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(null, function(items) {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                let tasks = Object.values(items);
                resolve(tasks);
            }
        });
    });
}

function deleteTask(name) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.remove(name, function () {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.command == "saveTask") {
            saveTask(request.taskName)
                .then(() => sendResponse({result: "Task saved."}));
        } else if (request.command == "loadTask") {
            loadTask(request.taskName)
                .then(() => sendResponse({result: "Task loaded."}));
        } else if (request.command == "getTasks") {
            getTasks()
                .then(tasks => sendResponse({tasks: tasks}));
        } else if (request.command == "deleteTask") {
            deleteTask(request.taskName)
                .then(() => sendResponse({ result: "Task deleted." }))
                .catch(error => sendResponse({ error: error.message }));
            return true;
            }
        // Enable async sendResponse
        return true;
    }
);
