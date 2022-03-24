import actualDays from "./modules/days.js"

const APIKEY = "659eb6423c655c0f0e67fae273c7bd6a"
let apiResults
let realTime

const meteo = document.querySelector(".meteo")

const weather = document.querySelector(".meteo__now__weather")
const temp = document.querySelector(".meteo__now__temp")

const city = document.querySelector(".meteo__info__city")
const coord = document.querySelector(".meteo__info__coord")
const press = document.querySelector(".meteo__info__press")
const humidity = document.querySelector(".meteo__info__humidity")
const wind = document.querySelector(".meteo__info__wind")

const now = document.querySelector(".meteo__now")
const nowImg = document.querySelector(".meteo__now__img")
const previsionNames = document.querySelectorAll(".meteo__prevision__name")
const previsionValues = document.querySelectorAll(".meteo__prevision__value")

const hour = document.querySelector(".meteo__info__hour")

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
        temp.innerText = Math.trunc(apiResults.current.temp) + "°C"
        press.innerText = "Pression atmosphérique : " + apiResults.current.pressure + " hPa"
        humidity.innerText = "Humidité de l'air : " + apiResults.current.humidity + "%"
        wind.innerText = "Vitesse du vent : " + apiResults.current.wind_speed.toFixed(0) + " km/h"
        

        // Chargement de l'icone
        let time = new Date().getHours()
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
            previsionValues[i].innerText = Math.trunc(apiResults.hourly[i * 3].temp) + "°C"
        }

        // Prévision de la semaine
        for (let i = 0; i < weeks.length; i++) {
            weekNames[i].innerText = actualDays[i].slice(0, 3)
            weekValues[i].innerText = Math.trunc(apiResults.daily[i + 1].temp.day) + "°C"
            if (time >= 6 && time < 21) {
                weekImg[i].src = `./assets/img/day/${apiResults.daily[i + 1].weather[0].icon}.svg`
            } else {
                weekImg[i].src = `./assets/img/night/${apiResults.daily[i + 1].weather[0].icon}.svg`
            }
            changeBackground(weeks[i], apiResults.daily[i + 1].weather[0].icon)
        }

        function changeBackground(target, icon) {
            switch(icon) {
                case "01d":
                case "02d":
                    target.style.background = blueSky
                    break
                case "03d":
                case "04d":
                case "09d":
                case "13d": 
                case "50d":
                    target.style.background = greySky
                    break
                case "10d":
                case "11d":
                    target.style.background = darkSky
                    break
            }
        }

        // Heure en temps réel
        clearInterval(realTime)
        if (timezone === undefined) {
            timezone = 3600
        }
        let td = apiResults.current.dt * 1000 + (timezone - 3600) * 1000

        let date = new Date(td)
        let hours = date.getHours()
        let minutes = date.getMinutes()
        let seconds = date.getSeconds()
        hour.innerText = hours + " : " + minutes + " : " + seconds
        
        realTime = setInterval(function() {
            td += 1000 // Temps js calculé en millisecondes
            date = new Date(td)
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
        }, 1000)
        
        loading.classList.add("hidden")
        setTimeout(function() {
            loading.style.zIndex = "0"
        }, 1500)
    })
}

// Nouvelle recherche
const cityBtn = document.querySelector(".meteo__info__changeCity")
cityBtn.addEventListener("click", changeCity)

function changeCity() {
    if (city.value !== "") {
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city.value}&appid=${APIKEY}`)
        .then((response) => {
            return response.json()
        })
        .then((data) => {
            apiResults = data

            let lat = apiResults.coord.lat
            let long = apiResults.coord.lon
            let timezone = apiResults.timezone
            callAPI(lat, long, timezone)
            coord.innerText = `Latitude : ${lat.toFixed(2)} - Longitude : ${long.toFixed(2)}`
        })
    }
}

// Afficher la date (locale)
const date = document.querySelector(".meteo__now__date")
let dateOptions = {weekday: "long", year: "numeric", month: "long", day: "2-digit"}
let time = new Date().toLocaleDateString("fr-FR", dateOptions)
date.innerText = time