document.getElementById('downloadBtn').addEventListener('click', function() {
    chrome.runtime.sendMessage({message: "downloadHistory"}, function(response) {
        if (response.success) {
            console.log('History download initiated');
        } else {
            console.log('History download failed');
        }
    });
});
