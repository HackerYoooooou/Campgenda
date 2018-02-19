// Create global object to contain variables and functions
const userInput = {};

// Create function to convert miles to kilometers
userInput.kilometersToMiles = (kilometers) => {
    const distance = parseInt(kilometers) / 1.60934;
    return distance;
}

// Initializa Firebase
userInput.initFirebase = () => {
    var config = {
        apiKey: "AIzaSyDO9VDh2kcm-ob4BiOuG7BHUIoCZbLGEJ4",
        authDomain: "campgenda.firebaseapp.com",
        databaseURL: "https://campgenda.firebaseio.com",
        projectId: "campgenda",
        storageBucket: "campgenda.appspot.com",
        messagingSenderId: "116728568896"
    };
    firebase.initializeApp(config);
}

// Create function to retrieve user input 
// Function is called on form submission
// Once called, Google Maps API is called using retrieved user input
userInput.retrieveInputValues = function() {
    userInput.province = $('select[name=province]').val();
    userInput.city = $('input[name=city]').val();
    userInput.radius = userInput.kilometersToMiles($('select[name=radius]').val());
    userInput.activity = $('select[name=activity]').val();
    userInput.address = $('input[name=address]').val();
    userInput.currentDate = new Date(); 
    userInput.getCoordinates(userInput.address, userInput.city, userInput.province);
}

// Create AJAX request to Google Maps API 
// to retrieve coordinates based on user's address
userInput.getCoordinates = (address, city, province) => {
    return $.ajax({
        url: "https://maps.googleapis.com/maps/api/geocode/json?",
        method: 'GET',
        dataType: 'json',
        data: {
            address: `${address}, ${city}, ${province}`,
            key: 'AIzaSyDNBpAAUuUkRyioDLQUQW_DZYIb1PiY85Q'
        }
    })
    .then(function (res) {
        userInput.lat = res.results[0]['geometry']['location']['lat'];
        userInput.lng = res.results[0]['geometry']['location']['lng'];
// Once promise is resolved
// call Trail API to retrieve available trails/ camping sites
        userInput.getLocationBasedOnUserInput(userInput.lat, userInput.lng, userInput.radius, userInput.activity);
    });
};

// Create AJAX request to Trail API 
// to retrieve location trails/camping sites information
userInput.getLocationBasedOnUserInput = (lat, long, radius, activity) => {
    return $.ajax({
        url: 'https://trailapi-trailapi.p.mashape.com/',
        method: 'GET',
        dataType: 'json',
        headers: {
            'X-Mashape-Key': 'ggHiGgB9CKmshtveiFCqkApU62aYp1E7G75jsn4Uwr3THLo7UM'
        },
        data: {
            lat: lat,
            lon: long,
            radius: radius,
            q: {
                activities_activity_type_name_eq: activity,
                country_cont: 'Canada'
            }
        }
    })
    .then(function(res){
        userInput.destinationLocations = res.places;
    // Once promise is resolved
    // call function to display returned information on the screen
        userInput.displayOptions(res.places);
    });
};

// Create function to display all location returned from Trail API on the screen
userInput.displayOptions = (locations) => {
    let activitiesArray = [];
    locations.forEach((location, i) => {
        location.activities.forEach((activity) => {
            activitiesArray.push(activity);
        });
    });
    activitiesArray.sort(function (a, b) {
        return parseFloat(b.rating) - parseFloat(a.rating) || b.length - a.length;
    });
    // If no results are returned
    // display error message in a modal window
    if (activitiesArray.length < 1) {
        $('.errorMessageBox').html('');
        $('.landingPage').fadeOut(function(){
            $('.errorMessage').fadeIn('slow');
        });
        const errorMessageContent = 'There are no options within selected radius. Please select a larger radius.';
        $('.errorMessageBox').append(`<p>${errorMessageContent}</p>`);
        $('.fa-tree').on('click', function () {
            $('.errorMessage').fadeOut('slow', function() {
                $('.landingPage').fadeIn();
            });
        });
    }
    // If results are returned
    // display them on the page
    else {
        for (i = 0; i < activitiesArray.length; i++) {
            const name = $(`<button class=option id="${activitiesArray[i].place_id}">`).text(activitiesArray[i].name);
            const direction = $('<p>').text(activitiesArray[i].description);
            const length = $('<p>').text(`Trail Length is ${activitiesArray[i].length} km`);
            const trailContainer = $(`<div class=itemContainer${activitiesArray[i].place_id}>`).append(name, length, direction);
            $('.destinationOption').append(trailContainer);
            $('.landingPage').fadeOut(function() {
                $('.destinationOption').fadeIn('slow');
            });
        }
    }
}

// Create function to display bird/ weather/ moonPhase/ UV Index infor in modal window
userInput.showBirds = function () {
    $('.destinationOption').on('click', 'button.option', function () {
        userInput.indexOfButton = $(this).attr('id');
        let finalDestination = userInput.destinationLocations.find(el => el.unique_id === Number(userInput.indexOfButton))
// Clear out Modal Window before populating data 
// to ensure data is not duplicated when access for the second time
        $('.modalWindowContent').html('');
// Display Modal Window
        $('.modalWindow').fadeIn('slow');
// Call uvIndex and weather API and diplay in Modal WIndow
        userInput.getUVIndex(finalDestination.lat, finalDestination.lon, userInput.currentDate);
        userInput.getWeather('conditions', finalDestination.state, finalDestination.city);
// Call eBird API only if hiking is selected as preferred type of activity
        if (userInput.activity === "hiking") {
            userInput.retrieveLocationCode(finalDestination.city);
        }
// Call Moon Phase only if camping is selected as preferred type of activity
        else if (userInput.activity === "camping") {
            userInput.getWeather('astronomy', finalDestination.state, finalDestination.city);
        }
    });
}

// Create AJAX request to openUV API
// to retrieve UV Index for the selected destination
userInput.getUVIndex = (lat, long, today) => {
    return $.ajax({
        url: 'http://proxy.hackeryou.com',
        method: 'GET',
        dataType: 'json',
        data: {
            reqUrl: 'https://api.openuv.io/api/v1/uv',
            params: {
                lat: lat,
                lng: long,
                dt: today
            },
            proxyHeaders: {
                'x-access-token': '37e7988a5828e5d93d5f9c479b2ec105'
            }
        }
    })
    .then(function (res) {
        destinationUVMax = res.result.uv_max;
// Once promise is resolved
// call function to display UV Max Index in Modal Window
        userInput.displayUVIndex(res.result.uv_max);
    });
}

// Create function to display UV Index in the Modal Window
userInput.displayUVIndex = function(uvIndex) {
    $('.modalWindowContent').prepend(`<p>UV Index is ${uvIndex}</p>`);
}

// Create AJAX request to wunderGround API
// to retrieve weather conditions ot moon phase information
// where returned result is determined by 'feature' parameter
userInput.getWeather = function (feature, province, city) {
    $.ajax({
        url: `http://api.wunderground.com/api/559369d256cad936/${feature}/q/${province}/${city}.json`,
        method: 'GET',
        dataType: 'json'
    }).then((res) => {
        if (feature === 'conditions') {
// Once promise for feature === 'conditions' is resolved
// call function to display weather conditions in the Modal Window
            userInput.displayWeather(res.current_observation.feelslike_c, res.current_observation.feelslike_f, res.current_observation.weather);
        } else if (feature === 'astronomy') {
// Once promise for feature === 'astronomy' is resolved
// call function to display moon phase info in the Modal Window
            userInput.displayMoonPhase(res.moon_phase.phaseofMoon, res.moon_phase.sunrise.hour, res.moon_phase.sunrise.minute, res.moon_phase.sunset.hour, res.moon_phase.sunset.minute);
        }
    });
};

// Create function to display weather conditions in Modal Window
userInput.displayWeather = function(firstParameter, secondParameter, thirdParameter) {
    $('.modalWindowContent').prepend(`<p>It feels like ${firstParameter}°C/ ${secondParameter}°F outside. The weather is ${thirdParameter}</p>`);
}

// Create function to display moon phase info conditions in Modal Window
userInput.displayMoonPhase = function (moonPhase, sunriseHour, sunriseMinute, sunsetHour, sunsetMinute) {
    $('.modalWindowContent').prepend(`<p>Moon Phase is ${moonPhase}. Sunrise is at ${sunriseHour}:${sunriseMinute}AM. Sunset is at ${sunsetHour}:${sunsetMinute}PM</p>`);
}

// In order to match (country; city) of selected hiking trail/ camping site location to eBird API location input parameter
// Create function to retrieve location code from firebase based on country code of Canada and city value corresponding to selected option
userInput.retrieveLocationCode = function (arrayNumber) {
    const dbRef = firebase.database().ref('/codes');
    dbRef.on('value', (item) => {
        const codeObject = item.val();
        window.dataObj = codeObject;
        userInput.locationCode = null;
        for (let key in codeObject) {
            if (codeObject[key]["country-code"] === 'CA' && codeObject[key]["name"] === arrayNumber ) {
                userInput.locationCode = codeObject[key]["subnational2-code"];
// Once country code is retrieved
// call function to trigger AJAX request to eBird API
                getBirdsBasedOnLocation(userInput.locationCode);
            }
        }
        console.log(userInput.locationCode);
        if (userInput.locationCode == null) {
            $('.modalWindowContent').append(`<p>Unfortunately, no birds have been recorded in this area.</p>`);
        }
    });
}

// Create AJAX request to eBird API
// to retrieve birds recently seen around selected location
const getBirdsBasedOnLocation = (sightSpot) => {
    return $.ajax({
        url: 'http://ebird.org/ws1.1/data/notable/region/recent',
        method: 'GET',
        dataType: 'jsonp',
        headers: {
            'X-eBirdApiToken': 'ibcn8ifsm3dq'
        },
        data: {
            r: sightSpot,
// Limit result to 5 birds
            maxResults: 5,
            fmt: 'json'
        }
    }).then(function (res) {
// Create new array to include unique bird names only 
        let uniqueBirds = [...new Set(res.map(item => item.comName))];
// Once promise is resolved
// call function to display birds in Modal Window
        userInput.displayBirdsInRegion(uniqueBirds);
    });
}

// Create function to display birds returned from eBird API in Modal Window
userInput.displayBirdsInRegion = (birds) => {
    if (birds.length > 0) {
        birds.forEach((bird, i) => {
            const name = $('<h3>').text(bird);
            const birdContainer = $(`<div class="${bird.replace(' ','-').toLowerCase()}">`).append(name);
            $('.modalWindowContent').append(birdContainer);
            getBirdSoundsBasedOnName(bird);
        });
    }
    else {
        $('.modalWindowContent').append(`<p>Unfortunately, no birds have been recorded in this area.</p>`);
    }
}

// Create AJAX request to Xeno-Canto API
// to retrieve birds' sounds based on list of birds' names seen in the area
const getBirdSoundsBasedOnName = (birdName) => {
    return $.ajax({
        url: 'http://proxy.hackeryou.com',
        method: 'GET',
        dataType: 'json',
        data: {
            reqUrl: 'https://www.xeno-canto.org/api/2/recordings',
            params: {
                query: birdName
            }
        }
    }).then(function (res) {
// Once promise is resolved
// call function to display bird sounds in mOdal Window
        userInput.displayBirdSounds(res.recordings);
    });
}

// Create function to display bird sounds
userInput.displayBirdSounds = (recordings) => {
    const birdSound = $('<iframe>').attr('src', `${recordings[0].url}/embed?simple=1`);
// Normalize bird names
    let birdSoundContainer = recordings[0].en.replace(' ', '-').toLowerCase();
    const soundContainer = $('<div>').append(birdSound);
    $(`.${birdSoundContainer}`).append(soundContainer);
}


userInput.events = function () {
// Create function to allow user to close Modal Window
    $('.fa-times').on('click', function () {
        $('.modalWindow').fadeOut();
    });
    userInput.showBirds();
}

// When document is ready..
$(function () {
    userInput.initFirebase();
    userInput.events();
// On form submission..
    $('form').on('submit', function (event) {
        event.preventDefault();
        // Retrieve user input
        userInput.retrieveInputValues();
    })
});