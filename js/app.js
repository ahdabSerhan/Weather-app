const WEATHER_URL = "https://api.openweathermap.org/data/2.5/forecast?appid=";
const icon_url="http://openweathermap.org/img/wn/"
const keys = {
    WEATHER_KEY: "ca21dfe9667e871a5b4cfee4cabe100b",
};
const errorElement = document.getElementById("search-error");
const validityErrMsg = "Please enter a valid location. Letters a-z, 2 letter country code optional";

let weather = {};


function generateResultsList() {
    return weather.list.map(function (item, index) {
        let date = item.dt_txt.split(' ');
        return ('<div id="item-num-' + index + '" class="weather-item" >'
                + '<img class="icon" src="' +icon_url + item.weather[0].icon + '@2x.png"/>'
                + '<div class="item-message">'
                    + '<h5 class="item-message-text">' + item.weather[0].description + '</h5>'
                + '</div>'
                + '<div class="item-temp">'
                    + '<p class="item-temp-text">' + item.main.temp + ' &#8451</p>'
                + '</div>'
                + '<div class="item-date">'
                    + '<h6 class="item-time-text">' + date[1].slice(0,5) + ' - ' + date[0].slice(5,) + '</h6>'
                + '</div>' +
                '</div>')
    }).join('');
}

function updateMainData(result) {
    let date = result.dt_txt.split(' ');
    document.getElementById("main-date").innerHTML = date[1].slice(0,5) + "  -  " + date[0];
    document.getElementById("main-message").innerHTML = result.weather[0].description;
    document.getElementById("main-temp").innerHTML = 'Temp: ' + result.main.temp + ' &#8451';
    document.getElementById("main-icon").src = icon_url + result.weather[0].icon + "@2x.png";
    document.getElementById("temp-range").innerHTML = result.main.temp_min + " - " + result.main.temp_max + ' &#8451';
    document.getElementById("humidity").innerHTML = result.main.humidity + " %";
    document.getElementById("wind").innerHTML = result.wind.speed + " mph";

    document.getElementById("main-icon").classList.toggle('spin');

    let mainBox = document.getElementById("main-result");
    mainBox.style.borderColor = 'rgb(54, 196, 182)';

    setTimeout(function() {
        mainBox.style.borderColor = 'white';
    }, 250 );
}

function changeMain(e) {
    // remove any current highlight
    let highlighted = document.getElementsByClassName("current");
    if (highlighted.length > 0) {
        highlighted.item(0).classList.remove("current");
    }

    // iterate through clicked elements parents till box reached and highlight it
    e.path.map(function(element) {
        if(element.className == "weather-item") {
            let itemNum = element.id.slice(9);
            updateMainData(weather.list[itemNum])
            element.classList.add("current");
            return;
        }
    })
}

function updateWeather() {
    const location = document.getElementById("location-result");
    const resultsList = document.getElementById("results-list");

    location.innerHTML = weather.city.name + ", " + weather.city.country;
    resultsList.innerHTML = generateResultsList();
    updateMainData(weather.list[0]);

    resultsList.children[0].classList.add("current");

    for(result in resultsList.children){
        if(result < 40 ) {
            resultsList.children[result].addEventListener('click', changeMain)
        }
    }
}

function getWeather(event) {
    event.preventDefault();

    const city = event.target[0].value;
    const reg = /^([A-Z]+)(\,\s*[A-Z]{2})?$/i;

    if (!reg.test(city)) {
        showValidityError(validityErrMsg);
    } else {
        fetch(`${WEATHER_URL}${keys.WEATHER_KEY}&q=${city}&units=metric`)
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                if ('city' in data ) {
                    document.getElementById("results-container").style.display = 'block';
                    weather = data;
                    updateWeather();
                } else {
                    document.getElementById("results-container").style.display = 'none';
                    showValidityError(data.message);
                }
            })
    }
}

function showValidityError(message) {
    errorElement.classList.add("error-msg");
    errorElement.classList.remove("hidden");
    errorElement.innerHTML = message;
}

function validator(e) {
    if (!e.target.validity.valid) {
        showValidityError(validityErrMsg);
    } else {
        errorElement.classList.remove("error-msg");
        errorElement.classList.add("hidden");
        errorElement.innerHTML = "";
    }
}

const searchInput = document.getElementById("search-input");
searchInput.addEventListener("input", validator);

const searchForm = document.getElementById("search-form");
searchForm.addEventListener("submit", getWeather);
