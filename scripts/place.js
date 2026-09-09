// WDD 131 - W03 Place page - Eduar J Fajardo

// footer dates
document.querySelector("#currentyear").textContent = new Date().getFullYear();
document.querySelector("#lastModified").textContent = `Last Modification: ${document.lastModified}`;

// static values that match the ones written in the weather section (metric units)
const temperature = 9; // °C
const windSpeed = 15; // km/h

// one line of code: metric wind chill formula
function calculateWindChill(t, s) {
  return Math.round((13.12 + 0.6215 * t - 11.37 * Math.pow(s, 0.16) + 0.3965 * t * Math.pow(s, 0.16)) * 10) / 10;
}

// only call the function when the calculation is viable: <= 10 °C and > 4.8 km/h
const windChillOutput = document.querySelector("#windchill");
windChillOutput.textContent =
  temperature <= 10 && windSpeed > 4.8 ? `${calculateWindChill(temperature, windSpeed)} °C` : "N/A";
