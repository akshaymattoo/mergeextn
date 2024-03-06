document.getElementById("mergeButton").addEventListener("click", mergeWindows);
document
  .getElementById("mergeButtonAll")
  .addEventListener("click", mergeAllWindows);

function mergeWindows() {
  chrome.windows.getAll({ populate: true }, function (windows) {
    const openWindows = windows.filter((window) => window.type === "normal");
    if (openWindows.length < 2) {
      alert("You need at least two open windows to merge.");
    } else {
      const windowTitles = openWindows
        .map((window, index) => {
          //const title = "Number of open tabs " + window.tabs.length;
          const title = `Window ${index + 1} tab names: `;
          const t = window.tabs
            .map((tab) => tab.title.substring(0, 15))
            .join(" , ");

          return `${title}  ${t}`;
        })
        .join("\n \n");

      const windowsToMerge = prompt(
        "Enter the numbers of the windows to merge (comma-separated):\n\n" +
          windowTitles
      );

      const windowIdsToM = windowsToMerge.split(",");
      //check for if entered values are integers
      for (let i = 0; i < windowIdsToM.length; i++) {
        if (Number.isInteger(parseInt(windowIdsToM[i])) === false) {
          alert("Valid input consists exclusively of numbers");
          return;
        }
        if (parseInt(windowIdsToM[i]) > openWindows.length) {
          alert(
            "The input entered cannot exceed the length of the open windows."
          );
          return;
        }
      }
      if (windowsToMerge) {
        const windowIdsToMerge = windowsToMerge
          .split(",")
          .map((index) => openWindows[parseInt(index) - 1].id);
        chrome.windows.create({}, function (mergedWindow) {
          // Removed the tabId property
          windowIdsToMerge.forEach((windowId) => {
            chrome.windows.get(windowId, { populate: true }, function (window) {
              window.tabs.forEach((tab) => {
                chrome.tabs.move(tab.id, {
                  windowId: mergedWindow.id,
                  index: -1,
                });
              });
              chrome.windows.remove(windowId);
            });
          });
          getCurrentTabAndClose();
        });
      }
    }
  });
}

function mergeAllWindows() {
  chrome.windows.getAll({ populate: true }, function (windows) {
    const openWindows = windows.filter((window) => window.type === "normal");
    if (openWindows.length < 2) {
      alert("You need at least two open windows to merge.");
    } else {
      const windowsToMerge = generateSequence(openWindows.length);
      if (windowsToMerge) {
        const windowIdsToMerge = windowsToMerge
          .split(",")
          .map((index) => openWindows[parseInt(index) - 1].id);
        chrome.windows.create({}, function (mergedWindow) {
          // Removed the tabId property
          windowIdsToMerge.forEach((windowId) => {
            chrome.windows.get(windowId, { populate: true }, function (window) {
              window.tabs.forEach((tab) => {
                chrome.tabs.move(tab.id, {
                  windowId: mergedWindow.id,
                  index: -1,
                });
              });
              chrome.windows.remove(windowId);
            });
          });
          getCurrentTabAndClose();
        });
      }
    }
  });
}
function getCurrentTabAndClose() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  chrome.tabs.query(queryOptions, function (tabs) {
    // since only one tab should be active and in the current window at once
    // the return variable should only have one entry
    var activeTab = tabs[0];
    var activeTabId = activeTab.id; // or do whatever you need
    chrome.tabs.remove(activeTabId);
  });
}

function generateSequence(inputNumber) {
  let sequence = "";
  for (let i = 1; i <= inputNumber; i++) {
    sequence += i;
    if (i !== inputNumber) {
      sequence += ",";
    }
  }
  return sequence;
}
