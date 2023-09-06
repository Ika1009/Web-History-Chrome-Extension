importScripts('ExtPay.js')

const extpay = ExtPay('momknowsco');
extpay.startBackground();

extpay.getUser().then(user => {
    // Save the user's payment status to use later
    chrome.storage.local.set({'userPaidStatus': user.paid});
}).catch(error => {
    console.error("Error fetching user data from ExtPay:", error);
});

let blacklist = new Set(); // Now using a set

// hmvtv]$eV)R+


// Load the blacklist from the file
fetch(chrome.runtime.getURL('blacklist.txt'))
  .then(response => response.text())
  .then(data => {
    data.split('\n').forEach(item => blacklist.add(item)); // Adding each item to the set
  });

// Listen to tab update events

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo && changeInfo.status === 'complete') {
        console.log("updated!");
        checkTab(tab);
    }
});

async function checkTab(tab) { // Using async to await GetUserId
    let url = tab.url;
    // Remove 'https://' or 'http://' prefix
    url = url.replace(/^https?:\/\//, '');
    // Remove trailing slash
    if (url.endsWith('/')) url = url.slice(0, -1);

    // Only process tabs with a URL (i.e., not a new tab)
    if (url && url.trim() !== '' && !url.startsWith('chrome://') && !url.includes('extensionpay.com/extension/momknowsco')) {

        if (blacklist.has(url)) { // Now using the set's has method
            console.log("BLACKLISTED");
            showPopup(tab);
        } 
        else {
            let date = new Date();
            let timestamp = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
            let userId = await GetUserId(); // Awaiting the userId
            sendToServer(url, timestamp, userId);
        }
    }
}

function sendToServer(url, timestamp, userId) {
    fetch(`https://api.momknows.co/sendUrlToHistory.php?userId=${userId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            url: url,
            timestamp: timestamp
        })
    })
    .then(response => { console.log(response);
        if (!response.ok) {
            return response.json().then(err => { throw err; });
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            console.log('Data successfully sent:', data.message);
        } else {
            console.error('Server Response:', data.message);
        }
    })
    .catch((error) => {
        console.error('Error:', error.message || error);
    });
}


chrome.runtime.onMessage.addListener(async function(request, sender, sendResponse) {
    let userId = await GetUserId(); // Awaiting the userId
    if (request.message === "downloadHistory") {
        fetch(`https://api.momknows.co/getHistory.php?userId=${userId}`, {
            method: 'GET',
        })
        .then(response => {
            console.log(response);
            return response.json();
        })
        .then(data => {
            if (data.error) {
                throw new Error(data.error);
            }

            let csvContent = 'data:text/csv;charset=utf-8,URL,Timestamp\r\n';  // Add header to CSV

            // Reverse the history array
            data.history.reverse().forEach(item => {
                let row = [item.url, item.timestamp];
                csvContent += row.join(',') + '\r\n';
            });

            let encodedUri = encodeURI(csvContent);

            // Get the active tab to execute the script on
            chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                let tab = tabs[0];
                
                // Execute code within the context of the active tab
                chrome.scripting.executeScript({
                    target: {tabId: tab.id},
                    function: (uri) => {
                        let link = document.createElement('a');
                        link.setAttribute('href', uri);
                        link.setAttribute('download', 'history.csv');
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    },
                    args: [encodedUri]
                });
            });

            sendResponse({success: true});
        })
        .catch(error => {
            console.error('Error:', error);
            sendResponse({success: false});
        });
    }
    return true; // Will respond asynchronously.
});


chrome.runtime.onInstalled.addListener(() => {
    // check if the user id is already set
    chrome.storage.sync.get('userId', (data) => {
      if (!data.userId) {
        // if not, generate a new unique id
        let userId = generateUserId();

        // save the user id to the storage
        chrome.storage.sync.set({userId: userId}, () => {
          console.log('User ID set to', userId);
        });
      }
    });
});

function generateUserId() {
    let array = new Uint32Array(4);
    crypto.getRandomValues(array); // Removed the 'window.' prefix
    let id = '';
    for (let i = 0; i < array.length; i++) {
        id += array[i].toString(16).padStart(8, '0');
    }
    return id;
}

function GetUserId() {
    return new Promise((resolve, reject) => { // Now returns a Promise to be async
        chrome.storage.sync.get('userId', function(result) {
            if (result.userId) {
                // Existing user, userId was retrieved successfully.
                resolve(result.userId);
            } else {
                // New user, generate a new userId.
                let userId = generateUserId();
                chrome.storage.sync.set({ 'userId': userId }, function() {
                    if (chrome.runtime.lastError) {
                        reject('Failed to save userId:', chrome.runtime.lastError.message);
                    } else {
                        resolve(userId);
                    }
                });
            }
        });
    });
}

function showPopup(tab) {
    chrome.scripting.executeScript({
      target: {tabId: tab.id},
      function: function() {
        // Create a popup container
        var popupContainer = document.createElement('div');
        popupContainer.style.position = 'fixed';
        popupContainer.style.top = '0';
        popupContainer.style.right = '0';
        popupContainer.style.left = '0';
        popupContainer.style.bottom = '0';
        popupContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        popupContainer.style.zIndex = '10000';
        popupContainer.style.display = 'flex';
        popupContainer.style.alignItems = 'center';
        popupContainer.style.justifyContent = 'center';
  
        // Create a popup content container
        var popupContent = document.createElement('div');
        popupContent.style.width = '350px';
        popupContent.style.height = '120px';
        popupContent.style.padding = '40px';
        popupContent.style.backgroundColor = 'white';
        popupContent.style.textAlign = 'center';
  
        // Message container
        var messageContent = document.createElement('div');
        messageContent.style.fontSize = '20px';
        messageContent.style.color = '#333333';
        messageContent.style.fontFamily = "'Arial', sans-serif";
        messageContent.innerHTML = 'This site is on our blacklist. Proceed with caution!';
        popupContent.appendChild(messageContent);
  
        // Create a close button
        var closeButton = document.createElement('button');
        closeButton.innerHTML = 'Close';
        closeButton.style.marginTop = '20px';
        closeButton.style.padding = '10px 20px';
        closeButton.style.border = 'none';
        closeButton.style.backgroundColor = '#333';
        closeButton.style.color = 'white';
        closeButton.style.cursor = 'pointer';
        closeButton.style.borderRadius = '5px';
        closeButton.style.fontSize = '16px';
        closeButton.style.fontFamily = "'Arial', sans-serif";
        closeButton.onmouseover = function() { closeButton.style.backgroundColor = '#555'; };
        closeButton.onmouseout = function() { closeButton.style.backgroundColor = '#333'; };
        closeButton.onclick = function() {
          document.body.removeChild(popupContainer);
        };
  
        // Append the content and close button to the container
        popupContent.appendChild(closeButton);
        popupContainer.appendChild(popupContent);
  
        // Append the popup container to the body
        document.body.appendChild(popupContainer);
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
