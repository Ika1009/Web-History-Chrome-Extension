const extpay = ExtPay('momknowsco');

document.querySelector('button').addEventListener('click', extpay.openPaymentPage);

extpay.getUser().then(user => {
    chrome.storage.local.set({'userPaidStatus': user.paid});
}).catch(err => {
    document.querySelector('p').innerHTML = "Error fetching data :( Check that your ExtensionPay id is correct and you're connected to the internet";
});

chrome.storage.local.get('userPaidStatus', function(data) {
    if (data.userPaidStatus) {
        // Set the new content for paid users
        document.body.innerHTML = `
            <style>
                body {
                width: 200px;
                text-align: center;
                }
            </style>
            <h1>Download History</h1>
            <button id="downloadBtn">Download History</button>
        `;

        document.getElementById('downloadBtn').addEventListener('click', function() {
            chrome.runtime.sendMessage({message: "downloadHistory"});
        });

    } else {
        // Logic for users who haven't paid.
        // You can update the popup content or any other necessary actions.
    }
});
