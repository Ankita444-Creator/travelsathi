async function generatePlan() {
    const origin = document.getElementById('origin').value;
    const destination = document.getElementById('destination').value;
    const days = document.getElementById('days').value;
    const budget = document.getElementById('budget').value;
    const resultDiv = document.getElementById('result');
    const loadingDiv = document.getElementById('loading');

    if (!origin || !destination || !days || !budget) {
        alert("Please fill in all the fields!");
        return;
    }

    // Show loading
    loadingDiv.classList.remove('hidden');
    resultDiv.innerHTML = "";

    // Gemini API integration prompt
    const prompt = `Act as an expert travel planner. Create a budget-friendly trip plan for traveling from ${origin} to ${destination} for ${days} days with a total budget of ${budget} INR. 
    Provide the response strictly in JSON format with the following keys:
    - transportEstimate (string describing travel mode and estimated cost)
    - hotels (array of 2 objects with name, type, price, and contact number)
    - sightseeing (array of objects with place name, cost, and a Google Maps search query link)
    - foodEstimate (string with food cost breakdown)`;

    const apiKey = "YOUR_GEMINI_API_KEY"; // ⚠️ এখানে তোর জেমিনি এপিআই কি (API Key) বসিয়ে দিবি
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();
        let aiText = data.candidates[0].content.parts[0].text;
        
        // Clean up JSON response from markdown tags if Gemini adds them
        aiText = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
        const tripData = JSON.parse(aiText);

        // Hide loading
        loadingDiv.classList.add('hidden');

        // Render HTML Output dynamically
        resultDiv.innerHTML = `
            <div class="bg-indigo-50 p-6 rounded-xl border border-indigo-200 card-hover">
                <h2 class="text-2xl font-bold text-indigo-700 mb-2">📍 Trip to ${destination}</h2>
                <p class="text-gray-700"><strong>From:</strong> ${origin} | <strong>Duration:</strong> ${days} Days | <strong>Budget:</strong> ₹${budget}</p>
            </div>

            <div class="bg-white p-5 rounded-xl shadow border">
                <h3 class="text-lg font-bold text-gray-800 mb-2">🚆 Transportation Estimate</h3>
                <p class="text-gray-600">${tripData.transportEstimate}</p>
            </div>

            <div class="bg-white p-5 rounded-xl shadow border">
                <h3 class="text-lg font-bold text-gray-800 mb-3">🏨 Recommended Hotels (Within Budget)</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    ${tripData.hotels.map(h => `
                        <div class="p-4 bg-gray-50 rounded-lg border">
                            <h4 class="font-bold text-indigo-600">${h.name}</h4>
                            <p class="text-sm text-gray-500">Type: ${h.type}</p>
                            <p class="text-sm font-semibold text-green-600">Price: ₹${h.price}</p>
                            <p class="text-sm text-gray-600">📞 Contact: ${h.contact}</p>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="bg-white p-5 rounded-xl shadow border">
                <h3 class="text-lg font-bold text-gray-800 mb-3">🏞️ Sightseeing & Attractions</h3>
                <ul class="space-y-2">
                    ${tripData.sightseeing.map(s => `
                        <li class="flex justify-between items-center p-3 bg-gray-50 rounded-lg border">
                            <span>${s.place} (Cost: ₹${s.cost})</span>
                            <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.place + ' ' + destination)}" target="_blank" class="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">View Map 📍</a>
                        </li>
                    `).join('')}
                </ul>
            </div>

            <div class="bg-white p-5 rounded-xl shadow border">
                <h3 class="text-lg font-bold text-gray-800 mb-2">🍲 Food & Miscellaneous</h3>
                <p class="text-gray-600">${tripData.foodEstimate}</p>
            </div>
        `;

    } catch (error) {
        loadingDiv.classList.add('hidden');
        console.error(error);
        alert("Something went wrong or AI response format error. Please try again!");
    }
}
