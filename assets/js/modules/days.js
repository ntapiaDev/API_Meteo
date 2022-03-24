const days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"]

let td = new Date()
let options = {weekday: "long"};
let today = td.toLocaleDateString("fr-FR", options)

// Majuscule au jour d'aujourd'hui
today = today.charAt(0).toUpperCase() + today.slice(1)

let actualDays = days.slice(days.indexOf(today) + 1).concat(days.slice(0, days.indexOf(today) + 1))

export default actualDays