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

    const prompt = `Act as an expert travel planner. Create a budget-friendly trip plan for traveling from ${origin} to ${destination} for ${days} days with a total budget of ${budget} INR. 
    You MUST return ONLY valid JSON (no markdown, no backticks) with the following exact keys:
    - transportEstimate (string)
    - hotels (array of 2 objects, each having name, type, price, and contact)
    - sightseeing (array of objects, each having place, cost)
    - foodEstimate (string)`;

    const apiKey = "AQ.Ab8RN6L5hTVyohZrFP6_cos3PP-I-y2TqbaOIbsAG1nBAGQgow"; // তোর এপিআই কি এখানে বসানোই আছে
    const apiUrl = `[https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=$](https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=$){apiKey}`;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();
        
        if (!data.candidates || !data.candidates[0].content) {
            throw new Error("Invalid API response structure");
        }

        let aiText = data.candidates[0].content.parts[0].text;
        
        // Clean up markdown code blocks safely
        aiText = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
        
        // Find JSON substring if extra text exists
        const jsonStart = aiText.indexOf('{');
        const jsonEnd = aiText.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
            aiText = aiText.substring(jsonStart, jsonEnd + 1);
        }

        const tripData = JSON.parse(aiText);

        // Hide loading
        loadingDiv.classList.add('hidden');

        // Render HTML Output
        resultDiv.innerHTML = `
            <div class="bg-indigo-50 p-6 rounded-xl border border-indigo-200">
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
                            <a href="[https://www.google.com/maps/search/?api=1&query=$](https://www.google.com/maps/search/?api=1&query=$){encodeURIComponent(s.place + ' ' + destination)}" target="_blank" class="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">View Map 📍</a>
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
        alert("Error parsing AI response. Please check console or try clicking generate again!");
    }
}
