let currentTripData = null;

async function generateTrip() {
    const origin = document.getElementById('origin').value.trim();
    const destination = document.getElementById('destination').value.trim();
    const days = document.getElementById('days').value.trim();
    const budget = document.getElementById('budget').value.trim();

    if (!origin || !destination || !days || !budget) {
        alert("Please fill in all the fields properly!");
        return;
    }

    document.getElementById('loading').classList.remove('hidden');

    const apiKey = "AQ.Ab8RN6L5hTVyohZrFP6_cos3PP-I-y2TqbaOIbsAG1nBAGQgow"; // তোর এপিআই কি এখানে বসাবি
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const prompt = `You are a professional travel planner. Plan a trip from ${origin} to ${destination} for ${days} days with a total budget of ${budget} INR.
    You MUST return ONLY a raw JSON object (no markdown formatting, no backticks, no extra text) with the following exact structure:
    {
      "destination": "${destination}",
      "totalBudget": ${Number(budget)},
      "breakdown": {
        "transportCost": <number>,
        "hotelCost": <number>,
        "foodCost": <number>,
        "sightseeingCost": <number>,
        "totalEstimatedCost": <number>
      },
      "hotels": [
        {"name": "Hotel Name", "type": "AC Room", "pricePerNight": <number>, "contact": "+91 XXXXX XXXXX", "location": "Location details"}
      ],
      "sightseeing": [
        {"place": "Place Name", "estimatedCost": <number>, "description": "Short description", "mapQuery": "Place Name"}
      ],
      "foodSpots": [
        {"restaurantName": "Restaurant Name", "specialty": "Specialty dish", "avgCost": <number>, "location": "Location"}
      ]
    }`;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        const data = await response.json();
        
        if (!data.candidates || !data.candidates[0].content) {
            throw new Error("Invalid AI response structure");
        }

        let aiText = data.candidates[0].content.parts[0].text;
        
        // Clean up markdown code blocks if AI returns them anyway
        aiText = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
        
        const jsonStart = aiText.indexOf('{');
        const jsonEnd = aiText.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
            aiText = aiText.substring(jsonStart, jsonEnd + 1);
        }

        currentTripData = JSON.parse(aiText);
        document.getElementById('loading').classList.add('hidden');
        renderDashboard();

    } catch (error) {
        console.error("API Error:", error);
        document.getElementById('loading').classList.add('hidden');
        alert("API Error! Please check your API key or internet connection, and try again.");
    }
}

// VIEW 2: Dashboard Summary
function renderDashboard() {
    document.getElementById('form-view').classList.add('hidden');
    const dash = document.getElementById('dashboard-view');
    dash.classList.remove('hidden');

    const b = currentTripData.breakdown;

    dash.innerHTML = `
        <div class="bg-white shadow-xl rounded-2xl p-6 border border-indigo-100">
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h2 class="text-2xl font-bold text-indigo-700">📍 Trip to ${currentTripData.destination}</h2>
                    <p class="text-gray-500 text-sm">Budget Breakdown & Overview</p>
                </div>
                <button onclick="resetApp()" class="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-200">🔄 New Search</button>
            </div>

            <!-- Budget Breakdown Grid -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div class="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <p class="text-xs text-gray-500 font-semibold">HOTELS</p>
                    <p class="text-lg font-bold text-blue-700">₹${b.hotelCost}</p>
                </div>
                <div class="bg-green-50 p-4 rounded-xl border border-green-100">
                    <p class="text-xs text-gray-500 font-semibold">SIGHTSEEING</p>
                    <p class="text-lg font-bold text-green-700">₹${b.sightseeingCost}</p>
                </div>
                <div class="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                    <p class="text-xs text-gray-500 font-semibold">FOOD & DRINKS</p>
                    <p class="text-lg font-bold text-yellow-700">₹${b.foodCost}</p>
                </div>
                <div class="bg-purple-50 p-4 rounded-xl border border-purple-100">
                    <p class="text-xs text-gray-500 font-semibold">TOTAL BUDGET</p>
                    <p class="text-lg font-bold text-purple-700">₹${b.totalEstimatedCost}</p>
                </div>
            </div>

            <!-- Category Navigation Blocks -->
            <h3 class="text-lg font-bold text-gray-800 mb-4">Explore Categories (Click to View Details)</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div onclick="showDetails('hotels')" class="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-6 rounded-2xl cursor-pointer card-hover shadow-lg">
                    <h4 class="text-xl font-bold mb-1">🏨 Recommended Hotels</h4>
                    <p class="text-blue-100 text-sm">View rooms, prices & contacts</p>
                </div>
                <div onclick="showDetails('sightseeing')" class="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-6 rounded-2xl cursor-pointer card-hover shadow-lg">
                    <h4 class="text-xl font-bold mb-1">🏞️ Sightseeing & Spots</h4>
                    <p class="text-emerald-100 text-sm">View attractions & Google Maps</p>
                </div>
                <div onclick="showDetails('food')" class="bg-gradient-to-br from-amber-500 to-orange-600 text-white p-6 rounded-2xl cursor-pointer card-hover shadow-lg">
                    <h4 class="text-xl font-bold mb-1">🍲 Food & Restaurants</h4>
                    <p class="text-amber-100 text-sm">View top food spots & map links</p>
                </div>
            </div>
        </div>
    `;
}

// VIEW 3: Detailed Sub-pages
function showDetails(category) {
    document.getElementById('dashboard-view').classList.add('hidden');
    const detail = document.getElementById('detail-view');
    detail.classList.remove('hidden');

    let contentHTML = `<button onclick="backToDashboard()" class="mb-6 bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-200">⬅ Back to Summary</button>`;

    if (category === 'hotels') {
        contentHTML += `<h2 class="text-2xl font-bold text-indigo-700 mb-4">🏨 Verified Hotel Options</h2><div class="space-y-4">`;
        currentTripData.hotels.forEach(h => {
            contentHTML += `
                <div class="p-5 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h3 class="text-lg font-bold text-indigo-600">${h.name}</h3>
                        <p class="text-sm text-gray-600">Type: ${h.type} | Location: ${h.location}</p>
                        <p class="text-sm font-semibold text-green-600 mt-1">Price: ₹${h.pricePerNight} / night</p>
                        <p class="text-sm text-gray-700 mt-1">📞 Contact: ${h.contact}</p>
                    </div>
                    <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(h.name + ' ' + currentTripData.destination)}" target="_blank" class="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700">View on Map 📍</a>
                </div>`;
        });
        contentHTML += `</div>`;
    } 
    else if (category === 'sightseeing') {
        contentHTML += `<h2 class="text-2xl font-bold text-emerald-700 mb-4">🏞️ Sightseeing & Attractions</h2><div class="space-y-4">`;
        currentTripData.sightseeing.forEach(s => {
            contentHTML += `
                <div class="p-5 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h3 class="text-lg font-bold text-emerald-700">${s.place}</h3>
                        <p class="text-sm text-gray-600 mt-1">${s.description}</p>
                        <p class="text-sm font-semibold text-gray-700 mt-1">Entry/Travel Cost: ₹${s.estimatedCost}</p>
                    </div>
                    <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.place + ' ' + currentTripData.destination)}" target="_blank" class="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-emerald-700">Open Map 📍</a>
                </div>`;
        });
        contentHTML += `</div>`;
    } 
    else if (category === 'food') {
        contentHTML += `<h2 class="text-2xl font-bold text-amber-700 mb-4">🍲 Food & Best Restaurants</h2><div class="space-y-4">`;
        currentTripData.foodSpots.forEach(f => {
            contentHTML += `
                <div class="p-5 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h3 class="text-lg font-bold text-amber-700">${f.restaurantName}</h3>
                        <p class="text-sm text-gray-600">Specialty: ${f.specialty} | Location: ${f.location}</p>
                        <p class="text-sm font-semibold text-green-600 mt-1">Avg Cost per meal: ₹${f.avgCost}</p>
                    </div>
                    <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(f.restaurantName + ' ' + currentTripData.destination)}" target="_blank" class="bg-amber-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-amber-700">Find on Map 📍</a>
                </div>`;
        });
        contentHTML += `</div>`;
    }

    detail.innerHTML = contentHTML;
}

function backToDashboard() {
    document.getElementById('detail-view').classList.add('hidden');
    document.getElementById('dashboard-view').classList.remove('hidden');
}

function resetApp() {
    document.getElementById('dashboard-view').classList.add('hidden');
    document.getElementById('form-view').classList.remove('hidden');
    document.getElementById('origin').value = '';
    document.getElementById('destination').value = '';
    document.getElementById('days').value = '';
    document.getElementById('budget').value = '';
}
