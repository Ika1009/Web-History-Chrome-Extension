// Check if the 'firstRun' flag is set in local storage
chrome.storage.local.get('firstRun', function (result) {
    if (result.firstRun === undefined) {
        // If the flag is not set, it means this is the first run
        displayQuestions();

        // Set the 'firstRun' flag so that this block won't run again
        chrome.storage.local.set({ 'firstRun': true });
    } else {
        document.getElementById('downloadBtn').addEventListener('click', function () {
            chrome.runtime.sendMessage({ message: "downloadHistory" });
        });
    }
});

function displayQuestions() {
    // Code to display the 7 questions goes here
    // This might involve creating a popup window or injecting HTML content into the current page
}
