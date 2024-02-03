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
    const container =document.body.innerHTML;


    // Question 1: Location
    const locationHtml = `
        <div>
            <label for="country">Where are you located:</label>
            <select id="country" name="country">
                <!-- Populate country options here -->
            </select>
            <select id="city" name="city">
                <!-- Cities will be populated based on country selection -->
            </select>
        </div>
    `;

    // Question 2: Age Range
    const ageRangeHtml = `
        <div>
            <label for="age">What is your age:</label>
            <select id="age" name="age">
                <option value="10-20">10-20</option>
                <option value="20-30">20-30</option>
                <option value="30-40">30-40</option>
                <option value="40-50">40-50</option>
                <option value="50-60">50-60</option>
                <option value="60-70">60-70</option>
                <option value="70-80">70-80</option>
            </select>
        </div>
    `;

    // Question 3: Sexual Orientation
    const orientationHtml = `
        <div>
            <p>Which of the following best represents your sexual orientation?</p>
            <input type="radio" id="men" name="orientation" value="men">
            <label for="men">Men – He/Him</label><br>
            <input type="radio" id="women" name="orientation" value="women">
            <label for="women">Women – Her/She</label><br>
            <input type="radio" id="non-binary" name="orientation" value="non-binary">
            <label for="non-binary">Non-Binary</label>
        </div>
    `;

    // Question 4: IP Address Usage
    const ipAddressHtml = `
        <div>
            <p>Approve using your IP address for better advertising</p>
            <input type="checkbox" id="approveIp" name="approveIp">
            <label for="approveIp">Yes</label>
            <p id="ipNote" style="display:none;">You can't earn points for Paid Surfing if this is not approved.</p>
        </div>
    `;

    // Question 5: Online Shopping
    const shoppingHtml = `
        <div>
            <p>Do you shop online? Please check the relevant items:</p>
            <input type="checkbox" id="food" name="shopOnline" value="food">
            <label for="food">Food</label><br>
            <input type="checkbox" id="electronics" name="shopOnline" value="electronics">
            <label for="electronics">Electronics</label><br>
            <input type="checkbox" id="car" name="shopOnline" value="car">
            <label for="car">Car staff</label><br>
            <input type="checkbox" id="homeImprovement" name="shopOnline" value="homeImprovement">
            <label for="homeImprovement">Home Improvement</label>
        </div>
    `;

    // Append HTML to the container

    // Add event listener for IP address approval checkbox
    document.getElementById('approveIp').addEventListener('change', function() {
        const note = document.getElementById('ipNote');
        if (this.checked) {
            note.style.display = 'none';
        } else {
            note.style.display = 'block';
        }
    });

    // Add a submit button at the end of the questionnaire
    const submitButtonHtml = `
    <div>
        <button id="submitBtn">Submit</button>
    </div>
    `;

    container.innerHTML += locationHtml + ageRangeHtml + orientationHtml + ipAddressHtml + shoppingHtml + submitButtonHtml;

    // Add event listener for IP address approval checkbox (existing code)...

    // Event listener for the submit button
    document.getElementById('submitBtn').addEventListener('click', function() {
        // Here, you would typically gather all the responses from the form
        // For demonstration, we'll just change the HTML content directly

        // Change the HTML content of the container
        container.innerHTML = `
            <h1>Download History</h1>
            <button id="downloadBtn">Download History</button>
        `;

        // Add an event listener to the new "Download History" button if needed
        document.getElementById('downloadBtn').addEventListener('click', function() {
            console.log("Download button clicked");
            // Implement the download history functionality here
        });
    });
}
