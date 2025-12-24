const express = require('express');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Southeast Asia Configuration
const SEA_REGIONS = {
    'ID': 'Jakarta', 'MY': 'Kuala Lumpur', 'SG': 'Singapore',
    'TH': 'Bangkok', 'VN': 'Hanoi', 'PH': 'Manila'
};

/**
 * API Proxy Endpoint
 * Keeps API Key hidden from the client browser.
 */
app.get('/api/weather/:code', async (req, res) => {
    const countryCode = req.params.code.toUpperCase();
    const apiKey = process.env.OWM_API_KEY;

    try {
        // 1. Backend Validation
        if (!SEA_REGIONS[countryCode]) {
            return res.status(400).json({ error: "Invalid Region: Not in SEA scope." });
        }

        const city = SEA_REGIONS[countryCode];

        // 2. External API Request
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
            params: {
                q: `${city},${countryCode}`,
                units: 'metric',
                appid: apiKey
            }
        });

        // 3. Take Profit: Return Sanitized Data
        res.json({
            city: response.data.name,
            temp: Math.round(response.data.main.temp),
            desc: response.data.weather[0].description,
            humidity: response.data.main.humidity
        });

    } catch (error) {
        // 4. Stop Loss: Professional Error Handling
        const status = error.response ? error.response.status : 500;
        const message = error.response ? error.response.data.message : "Server Connectivity Issue";
        
        console.error(`[ERROR] Code: ${status} | Msg: ${message}`);
        res.status(status).json({ error: message });
    }
});

app.listen(PORT, () => console.log(`Server Online: http://localhost:${PORT}`));