let blacklist = ['malicious.com', 'unsafe.org', 'dodgy.net'];  // Replace with your actual list

// Listen to tab update events
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo && changeInfo.status === 'complete') {
        checkTab(tab);
    }
});

// Listen to tab creation events
chrome.tabs.onCreated.addListener(function(tab) {
    // Because the tab object on creation does not include the URL,
    // we have to get it again
    chrome.tabs.get(tab.id, function(tab) {
        checkTab(tab);
    });
});

function checkTab(tab) {
    let url = tab.url;
    // Only process tabs with a URL (i.e., not a new tab)
    if (url !== undefined && url !== 'chrome://newtab/') {
        if (blacklist.some(blockedUrl => url.includes(blockedUrl))) {
            alert('This site is on our blacklist. Proceed with caution!');
        } 
        else {
            let timestamp = Date.now();
            // Send the URL, timestamp, and any other data to your server
            sendToServer(url, timestamp, GetUserId());
        }
    }
}



function sendToServer(url, timestamp, userId) {
    // This is a placeholder. You will need to replace it with your actual server-side logic.
    // The implementation will depend on your server setup and the language you are using.
    // Here is a very basic example using the Fetch API:

    fetch('https://your-server.com/api', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            url: url,
            timestamp: timestamp,
            userId: userId
            // Add any other data you want to send here
        })
    })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch((error) => {
        console.error('Error:', error);
    });
}


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    // Reciving message to download history from the popup.js
    if (request.message === "downloadHistory") 
    {
        fetch('https://yourserver.com/get-history', {
            method: 'GET',
        })
        .then(response => response.json())
        .then(data => {
            let csvContent = 'data:text/csv;charset=utf-8,';
            data.forEach(item => {
                let row = [];
                for (let prop in item) {
                    row.push(item[prop]);
                }
                csvContent += row.join(',') + '\r\n';
            });

            // Create a downloadable link and click it
            let encodedUri = encodeURI(csvContent);
            let link = document.createElement('a');
            link.setAttribute('href', encodedUri);
            link.setAttribute('download', 'history.csv');
            document.body.appendChild(link);
            link.click();

            sendResponse({success: true});
        })
        .catch(error => {
            console.error('Error:', error);
            sendResponse({success: false});
        });
    }
    return true;  // Will respond asynchronously.
});


chrome.runtime.onInstalled.addListener(() => {
    // check if the user id is already set
    chrome.storage.sync.get('userId', (data) => {
      if (!data.userId) {
        // if not, generate a new unique id
        let userId = generateUniqueId();
        
        // save the user id to the storage
        chrome.storage.sync.set({userId: userId}, () => {
          console.log('User ID set to', userId);
        });
      }
    });
  });
  
function generateUserId() {
    let array = new Uint32Array(4);
    window.crypto.getRandomValues(array);
    let id = '';
    for (let i = 0; i < array.length; i++) {
        id += array[i].toString(16).padStart(8, '0');
    }
    return id;
}

function GetUserId() {
    chrome.storage.sync.get('userId', function(result) {
        if (result.userId) {
            // Existing user, userId was retrieved successfully.
            return result.userId;
        } else {
            // New user, generate a new userId.
            let userId = generateUserId();
            chrome.storage.sync.set({ 'userId': userId }, function() {
                if (chrome.runtime.lastError) {
                    console.log('Failed to save userId:', chrome.runtime.lastError.message);
                }
            });
            return userId;
        }
    });
    
}
  

// If you want to connect to a server, you will need to send a request here. 
// You might use the fetch API, jQuery's $.ajax, or another method.

// If you want to add a payment gateway, you will need to integrate with a service like Stripe or PayPal.
// This will likely involve adding scripts to your manifest file, and handling transactions on your server.

// If you want to add the ability for users to download their browsing history, you will need to maintain a record 
// of the URLs they visit. You can use the chrome.history API to access this data, but remember to respect user privacy 
// and make sure to ask for the necessary permissions in your manifest file.
