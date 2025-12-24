document.getElementById('countrySelect').addEventListener('change', async (e) => {
    const code = e.target.value;
    const output = document.getElementById('output');
    
    if (!code) return;

    output.innerHTML = "Fetching Data...";

    try {
        const response = await fetch(`/api/weather/${code}`);
        const data = await response.json();

        if (!response.ok) throw new Error(data.error || "Request Failed");

        output.innerHTML = `
            <h1 style="margin:0; color:#38bdf8">${data.temp}°C</h1>
            <p style="text-transform:capitalize; margin:5px 0">${data.desc}</p>
            <small>${data.city} | Humidity: ${data.humidity}%</small>
        `;
    } catch (err) {
        output.innerHTML = `<div class="error">STOP LOSS: ${err.message}</div>`;
    }
});