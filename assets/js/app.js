import actualDays from "./modules/days.js"

const APIKEY = "659eb6423c655c0f0e67fae273c7bd6a"
let apiResults
let realTime

const meteo = document.querySelector(".meteo")

const weather = document.querySelector(".meteo__now__weather")
const temp = document.querySelector(".meteo__now__temp")

const city = document.querySelector(".meteo__info__city")
const country = document.querySelector(".meteo__info__country")
const coord = document.querySelector(".meteo__info__coord")
const press = document.querySelector(".meteo__info__press")
const humidity = document.querySelector(".meteo__info__humidity")
const wind = document.querySelector(".meteo__info__wind")

const now = document.querySelector(".meteo__now")
const nowImg = document.querySelector(".meteo__now__img")
const previsionNames = document.querySelectorAll(".meteo__prevision__name")
const previsionValues = document.querySelectorAll(".meteo__prevision__value")

const dateInfo = document.querySelector(".meteo__now__date")

const statut = document.querySelector(".meteo__info__statut")
const hour = document.querySelector(".meteo__info__hour")
const timezoneDisplay = document.querySelector(".meteo__info__timezone")

const week = document.querySelector(".meteo__week")
const weeks = document.querySelectorAll(".meteo__week__day")
const weekNames = document.querySelectorAll(".meteo__week__name")
const weekValues = document.querySelectorAll(".meteo__week__value")
const weekImg = document.querySelectorAll(".meteo__week__img")

const blueSky = "linear-gradient(45deg, #d5e7ff, #2d8dfd)"
const greySky = "linear-gradient(45deg, #d5e7ff, #cecece)"
const darkSky = "linear-gradient(45deg, #cecece, #313131)"

const loading = document.querySelector(".meteo__loading")

if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
        
        let lat = position.coords.latitude
        let long = position.coords.longitude
        callLoc(lat, long)
        callAPI(lat, long)

        coord.innerText = `Latitude : ${lat.toFixed(2)} - Longitude : ${long.toFixed(2)}`

    }, () => {
        alert("Vous avez refusé la géolocalisation, l'application ne peut pas fonctionner")
    })
}

function callLoc(lat, long) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=${APIKEY}`)
    .then((response) => {
        return response.json()
    })
    .then((data) => {
        apiResults = data
        console.log(apiResults)

        city.placeholder = apiResults.name
    })
}

function callAPI(lat, long, timezone) {
    fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${long}&exclude=minutely&units=metric&lang=fr&appid=${APIKEY}`)
    .then((response) => {
        return response.json()
    })
    .then((data) => {
        apiResults = data
        console.log(apiResults)

        weather.innerText = apiResults.current.weather[0].description
        let tempNow = Math.trunc(apiResults.current.temp)
        let colorNow = colorTemp(tempNow)
        temp.innerHTML = `<span style="color: ${colorNow}">${tempNow}°C</span>`
        press.innerText = "Pression atmosphérique : " + apiResults.current.pressure + " hPa"
        humidity.innerText = "Humidité de l'air : " + apiResults.current.humidity + "%"
        wind.innerText = "Vitesse du vent : " + apiResults.current.wind_speed.toFixed(0) + " km/h"

        // Heure en temps réel
        if (realTime !== undefined) {
            clearInterval(realTime)
        }
        if (timezone === undefined) {
            timezone = 3600
        }
        let dt = apiResults.current.dt * 1000 + (timezone - 3600) * 1000

        let date
        let hours
        let minutes
        let seconds

        function displayTime() {
            date = new Date(dt)
            hours = date.getHours()
            minutes = date.getMinutes()
            seconds = date.getSeconds()
            if (hours < 10) {
                hours = "0" + hours
            }
            if (minutes < 10) {
                minutes = "0" + minutes
            }
            if (seconds < 10) {
                seconds = "0" + seconds
            }
            hour.innerText = hours + " : " + minutes + " : " + seconds
        }

        displayTime()
        realTime = setInterval(function() {
            dt += 1000 // Temps js calculé en millisecondes
            displayTime()
        }, 1000)

        timezoneDisplay.innerText = apiResults.timezone

        // Afficher la date
        let dateOptions = {weekday: "long", year: "numeric", month: "long", day: "2-digit"}
        let day = new Date(dt).toLocaleDateString("fr-FR", dateOptions)
        dateInfo.innerText = day

        // Chargement de l'icone
        let time = date.getHours()
        if (time >= 6 && time < 21) {
            nowImg.src = `./assets/img/day/${apiResults.current.weather[0].icon}.svg`
        } else {
            nowImg.src = `./assets/img/night/${apiResults.current.weather[0].icon}.svg`
        }
        changeBackground(meteo, apiResults.current.weather[0].icon)
        changeBackground(now, apiResults.current.weather[0].icon)

        // Prévisions du jour
        for (let i = 0; i < previsionNames.length; i++) {
            let previsionName = time + (i + 1) * 3
            if (previsionName > 23) {
                previsionName = previsionName - 24
            }
            previsionNames[i].innerText = previsionName + "h"
            let tempDay = Math.trunc(apiResults.hourly[i * 3].temp)
            let colorDay = colorTemp(tempDay)
            previsionValues[i].innerHTML = `<span style="color: ${colorDay}">${tempDay}°C</span>`
        }

        // Prévision de la semaine
        for (let i = 0; i < weeks.length; i++) {
            weekNames[i].innerText = actualDays[i].slice(0, 3) + " " + new Date(apiResults.daily[i + 1].dt * 1000 + (timezone - 3600) * 1000).getDate()
            let tempWeek = Math.trunc(apiResults.daily[i + 1].temp.day)
            let colorWeek = colorTemp(tempWeek)
            weekValues[i].innerHTML = `<span style="color: ${colorWeek}">${tempWeek}°C</span>`
            weekImg[i].src = `./assets/img/day/${apiResults.daily[i + 1].weather[0].icon}.svg`
            changeBackground(weeks[i], apiResults.daily[i + 1].weather[0].icon)
        }

        function changeBackground(target, icon) {
            switch(icon) {
                case "01d":
                case "01n":
                case "02d":
                case "02n":
                    target.style.background = blueSky
                    break
                case "03d":
                case "03n":
                case "04d":
                case "04n":
                case "09d":
                case "09n":
                case "13d":
                case "13n": 
                case "50d":
                case "50n":
                    target.style.background = greySky
                    break
                case "10d":
                case "10n":
                case "11d":
                case "11n":
                    target.style.background = darkSky
                    break
            }
        }

        function colorTemp(temp) {
            let colors = ["#1200ff", "#002eff", "#0043ff", "#0053ff", "#0060ff", "#006cff", "#0077ff", "#0081ff", "#008aff", "#0093ff", "#009cff", "#00a4ff", "#00acff", "#00b4ff", "#00bbff", "#00c2ff", "#00caff", "#00d0ff", "#00d7ff", "#00deff", "#00e4ff", "#00eaff", "#00e8f6", "#00e6eb", "#00e4e0", "#00e2d3", "#00dfc6", "#00ddb8", "#00daaa", "#00d69a", "#1bd38b", "#36cf7b", "#48cb6a", "#57c75a", "#65c248", "#71bd36", "#7cb820", "#87b300", "#92ad00", "#9da600", "#a7a000", "#b19800", "#bb9000", "#c58700", "#cf7e00", "#d87300", "#e16700", "#ea5900", "#f14800", "#f93200", "#ff0000"]
            for (let i = 0; i < colors.length; i++) {
                if (temp === (i - 10)) {
                    let color = colors[i]
                    return color
                }
            }
        }
        
        loading.classList.add("hidden")
        setTimeout(function() {
            loading.style.zIndex = "0"
        }, 1300)
    })
}

// Nouvelle recherche
city.addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
        e.preventDefault()
        changeCity()
    }
})
country.addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
        e.preventDefault()
        changeCity()
    }
})

const cityBtn = document.querySelector(".meteo__info__changeCity")
cityBtn.addEventListener("click", changeCity)

let rotate = 0
function changeCity() {
    if (city.value !== "") {
        let fr = ""
        if (country.checked) {
            fr = ",fr"
        }
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city.value}${fr}&appid=${APIKEY}`)
        .then((response) => {
            return response.json()
        })
        .then((data) => {
            apiResults = data
            if (apiResults.cod !== "404") {
                let lat = apiResults.coord.lat
                let long = apiResults.coord.lon
                let timezone = apiResults.timezone
                callAPI(lat, long, timezone)
                city.placeholder = apiResults.name
                coord.innerText = `Latitude : ${lat.toFixed(2)} - Longitude : ${long.toFixed(2)}`
                rotate += 360
                week.style.transform = "rotate(" + rotate + "deg)"
                for (let i = 0; i < weeks.length; i++) {
                    weeks[i].style.transform = "rotate(" + (- rotate) + "deg)"
                }
                statut.innerHTML = '<p class="success">Recherche effectuée</p>'
            } else {
                statut.innerHTML = '<p class="error">Ville non trouvée</p>'
            }
        })
    }
}