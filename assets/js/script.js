function initPage() {
    const clearEl = $("#clear-history");
    const nameEl = $("#city-name");
    const currentTempEl = $("#temperature");
    const currentHumidityEl = $("#humidity");4
    const currentWindEl = $("#wind-speed");
    const currentUVEl = $("#UV-index");
    const historyEl = $("#history");
    let searchHistory = JSON.parse(localStorage.getItem("search")) || [];

    var APIKey = "14f18f856625e3dcfa23c9ccca5d5d46";
//  When search button is clicked, read the city name typed by the user

    function getWeather(cityName) {
        console.log(cityName)
//  Using saved city name, execute a current condition get request from open weather map api
        var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&appid=" + APIKey;
        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function(response){
            console.log(response);
//  Parse response to display current conditions
        //  Method for using "date" objects obtained from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
            const currentDate = new Date(response.dt*1000);
            console.log(currentDate);
            const day = currentDate.getDate();
            const month = currentDate.getMonth() + 1;
            const year = currentDate.getFullYear();
            nameEl.text(response.name + " (" + month + "/" + day + "/" + year + ") ");
            let weatherPic = response.weather[0].icon;
            $("#current-pic").attr("src","https://openweathermap.org/img/wn/" + weatherPic + "@2x.png");
            $("#current-pic").attr("alt",response.weather[0].description);
            currentTempEl.text("Temperature: " + k2f(response.main.temp) + " °F");
            currentHumidityEl.text("Humidity: " + response.main.humidity + "%");            
            currentWindEl.text("Wind Speed: " + response.wind.speed + " MPH");
        let lat = response.coord.lat;
        let lon = response.coord.lon;
        let UVQueryURL = "https://api.openweathermap.org/data/2.5/uvi/forecast?lat=" + lat + "&lon=" + lon + "&appid=" + APIKey + "&cnt=1";
        $.ajax({
        url: UVQueryURL,
        method: "GET"
        }).then(function(response){
            console.log(response)
            let UVIndex = $("<span>");
            UVIndex.attr("class","badge badge-danger");
            UVIndex.text(response[0].value);
            currentUVEl.text("UV Index: ");
            currentUVEl.append(UVIndex);
        });
//  Using saved city name, execute a 5-day forecast get request from open weather map api
        var cityID = response.id;
        var forecastQueryURL = "https://api.openweathermap.org/data/2.5/forecast?id=" + cityID + "&appid=" + APIKey;
        $.ajax({
            url: forecastQueryURL,
            method: "GET"
        }).then(function(response){
//  Parse response to display forecast for next 5 days underneath current conditions
            console.log(response);
            const forecastEls = document.querySelectorAll(".forecast");
            for (i=0; i<forecastEls.length; i++) {
                forecastEls[i].innerHTML = "";
                const forecastIndex = i*8 + 4;
                const forecastDate = new Date(response.list[forecastIndex].dt * 1000);
                const forecastDay = forecastDate.getDate();
                const forecastMonth = forecastDate.getMonth() + 1;
                const forecastYear = forecastDate.getFullYear();
                const forecastDateEl = document.createElement("p");
                forecastDateEl.setAttribute("class","mt-3 mb-0 forecast-date date");
                forecastDateEl.innerHTML = forecastMonth + "/" + forecastDay + "/" + forecastYear;
                forecastEls[i].prepend(forecastDateEl);
                const forecastWeatherEl = document.createElement("img");
                forecastWeatherEl.setAttribute("src","https://openweathermap.org/img/wn/" + response.list[forecastIndex].weather[0].icon + "@2x.png");
                forecastWeatherEl.setAttribute("alt",response.list[forecastIndex].weather[0].description);
                forecastWeatherEl.setAttribute("class", "pic");
                forecastEls[i].append(forecastWeatherEl);
                const forecastTempEl = document.createElement("p");
                forecastTempEl.setAttribute("class", "tem")
                forecastTempEl.innerHTML = "Temp: " + k2f(response.list[forecastIndex].main.temp) + " &#176F";
                forecastEls[i].append(forecastTempEl);
                const forecastHumidityEl = document.createElement("p");
                forecastHumidityEl.setAttribute("class","hum")
                forecastHumidityEl.innerHTML = "Humidity: " + response.list[forecastIndex].main.humidity + "%";
                forecastEls[i].append(forecastHumidityEl);
                }
            })
        });  
    }

    $("#search-button").on("click",function() {
        var searchTerm = $("#city-input").val().trim();
        getWeather(searchTerm);
        searchHistory.push(searchTerm);
        localStorage.setItem("search",JSON.stringify(searchHistory));
        renderSearchHistory();
    })

    clearEl.on("click",function() {
        searchHistory = [];
        renderSearchHistory();
    })

    function k2f(K) {
        return Math.floor((K - 273.15) *1.8 +32);
    }

    function renderSearchHistory() {
        historyEl.text( "");
        for (let i=0; i<searchHistory.length; i++) {
            const historyItem = $("<input>");            historyItem.attr("type","text");
            historyItem.attr("readonly",true);
            historyItem.attr("class", "form-control d-block bg-white");
            historyItem.attr("value", searchHistory[i]);
            historyItem.on("click",function() {
                getWeather(historyItem.val().trim());
            })
            historyEl.append(historyItem);
        }
    }

    renderSearchHistory();
    if (searchHistory.length > 0) {
        getWeather(searchHistory[searchHistory.length - 1]);
    }
}
initPage();