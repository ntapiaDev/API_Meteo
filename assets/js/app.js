import actualDays from "./modules/days.js"

const APIKEY = "659eb6423c655c0f0e67fae273c7bd6a"
let apiResults

const weather = document.querySelector(".meteo__info__weather")
const temp = document.querySelector(".meteo__info__temp")
const loc = document.querySelector(".meteo__info__loc")

const nowImg = document.querySelector(".meteo__now__img")
const previsionNames = document.querySelectorAll(".meteo__prevision__name")
const previsionValues = document.querySelectorAll(".meteo__prevision__value")
const weekNames = document.querySelectorAll(".meteo__week__name")
const weekValues = document.querySelectorAll(".meteo__week__value")

const loading = document.querySelector(".meteo__loading")

if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
        
        let lat = position.coords.latitude
        let long = position.coords.longitude
        callAPI(lat, long)

    }, () => {
        alert("Vous avez refusé la géolocalisation, l'application ne peut pas fonctionner")
    })
}

function callAPI(lat, long) {
    fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${long}&exclude=minutely&units=metric&lang=fr&appid=${APIKEY}`)
    .then((response) => {
        return response.json()
    })
    .then((data) => {
        apiResults = data
        console.log(apiResults)

        weather.innerText = apiResults.current.weather[0].description
        temp.innerText = Math.trunc(apiResults.current.temp) + "°C"
        loc.innerText = apiResults.timezone

        // Chargement de l'icone
        let time = new Date().getHours()
        if (time >= 6 && time < 21) {
            nowImg.src = `./assets/img/day/${apiResults.current.weather[0].icon}.svg`
        } else {
            nowImg.src = `./assets/img/night/${apiResults.current.weather[0].icon}.svg`
        }

        // Prévisions du jour
        for (let i = 0; i < previsionNames.length; i++) {
            let previsionName = time + i * 3
            if (previsionName > 23) {
                previsionName = previsionName - 24
            }
            previsionNames[i].innerText = previsionName + "h"
            previsionValues[i].innerText = Math.trunc(apiResults.hourly[i * 3].temp) + "°C"
        }

        // Prévision de la semaine
        for (let i = 0; i < actualDays.length; i++) {
            weekNames[i].innerText = actualDays[i].slice(0, 3)
            weekValues[i].innerText = Math.trunc(apiResults.daily[i + 1].temp.day) + "°C"
        }

        loading.classList.add("hidden")
    })
}

// Afficher l'heure
const date = document.querySelector(".meteo__date")
let dateOptions = {weekday: "long", year: "numeric", month: "long", day: "2-digit"}
let now = new Date().toLocaleDateString("fr-FR", dateOptions)
date.innerText = now