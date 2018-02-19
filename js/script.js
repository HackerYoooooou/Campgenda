const userInput = {};

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

userInput.currentDate = new Date(); 

// Retrieve User Input and call GoogleMaps API and TrailAPI
userInput.retrieveInputValues = function() {
    userInput.province = $('select[name=province]').val();
    userInput.city = $('input[name=city]').val();
    userInput.radius = userInput.kilometersToMiles($('select[name=radius]').val());
    userInput.activity = $('select[name=activity]').val();
    userInput.address = $('input[name=address]').val();
    userInput.getCoordinates(userInput.address, userInput.city, userInput.province);
    userInput.getWeather(userInput.province, userInput.city);
}

// NOEL: UPDATE
userInput.getDestinationAddress = {
}

// Create AJAX request to retrieve coordinates based on user's address
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
        console.log(userInput.lat, userInput.lng);
        userInput.getLocationBasedOnUserInput(userInput.lat, userInput.lng, userInput.radius, userInput.activity);
        // Call UVIndex API after coordinates are returned
        userInput.getUVIndex(userInput.lat, userInput.lng, userInput.currentDate);
    })
};

// Create AJAX request to retrieve location information based on latitude, longitude, radius and activity type
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
        const data = res.places;
        userInput.destinationLocations = res.places;
        // console.log(res.places);
        // console.log(userInput.destinationLocation);
        userInput.displayOptions(data);
    });
}


// Create AJAX request to retrieve UV Index


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
            },
        }
    })
    .then(function (res) {
        console.log(res);
    });
}

// Convert miles to kilometers

userInput.kilometersToMiles = (kilometers) => {
    const distance = parseInt(kilometers) / 1.60934;
    return distance;
}

// Gets weather info about destination
userInput.getWeather = function (province, city) {
    $.ajax({
        url: `http://api.wunderground.com/api/559369d256cad936/conditions/q/${province}/${city}.json`,
        method: 'GET',
        dataType: 'json'
    }).then((res) => {
        return userInput.weather = { 
            inCelsius: res.current_observation.feelslike_c,
            inFarenheit: res.current_observation.feelslike_f,
            conditions: res.current_observation.weather
        };
    });
};

// Create function local to userInput object
// to print attributes of each element of locations array on the screen
userInput.displayOptions = (locations) => {
    let activitiesArray = [];
    locations.forEach((location,i) => {
        location.activities.forEach((activity) =>{
            activitiesArray.push(activity);
        });
    });

    activitiesArray.sort(function(a,b){
        return parseFloat(b.rating) - parseFloat(a.rating) || b.length - a.length;
    });
    console.log(activitiesArray);


    if ( activitiesArray.length < 1) {
        $('.landingPage').fadeOut();
        $('.errorMessage').fadeIn(200);
        const errorMessageContent = 'There are no options within selected radius. Please select a larger radius.';
        $('.errorMessage').append(errorMessageContent);
        $('.fa-tree').on('click', function () {
            $('.errorMessage').fadeOut();
            $('.landingPage').fadeIn();
        });
    } else { 
    for (i=0; i<activitiesArray.length;i++) {
        const name = $(`<button class=option id="${activitiesArray[i].place_id}">`).text(activitiesArray[i].name);
        const direction = $('<p>').text(activitiesArray[i].description);
        const rating = $('<p>').text(`Trail Raiting is ${activitiesArray[i].rating}`);
        const length = $('<p>').text(`Trail Length is ${activitiesArray[i].length} km`);
        const trailContainer = $(`<div class=itemContainer${activitiesArray[i].place_id}>`).append(name, rating, length, direction);
        $('.destinationOption').append(trailContainer);
        $('.landingPage').fadeOut(1000);
        $('.destinationOption').fadeIn();
      }
    }
}

// Create function to retrieve location code from firebase based on user input
userInput.retrieveLocationCode = function (arrayNumber) {
    const dbRef = firebase.database().ref('/codes');
    dbRef.on('value', (item) => {
        const codeObject = item.val();
        window.dataObj = codeObject;
        console.log(arrayNumber);
            for (let key in codeObject) {
                if (codeObject[key]["country-code"] === 'CA' && codeObject[key]["name"] === arrayNumber ) {
                        console.log(codeObject[key]);
                        let locationCode = codeObject[key]["subnational2-code"];
                        getBirdsBasedOnLocation(locationCode);
                }
            }

    });
}


userInput.displayBirdsInRegion = (birds) => {
    $('.modalWindowContent').html(''); 
    birds.forEach((bird, i) => {
        const name = $('<h3>').text(bird);
        const birdContainer = $(`<div class="${bird.replace(' ','-').toLowerCase()}">`).append(name);
        $('.modalWindowContent').append(birdContainer);
        // Call Xeno API to retrieve a sound for each bird
        getBirdSoundsBasedOnName(bird);
    });
    $('.modalWindow').fadeIn();
}

// BIRDS API
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
            maxResults: 5,
            fmt: 'json'
        }
    }).then(function (res) {
        console.log(res);
        let uniqueBirds = [...new Set(res.map(item => item.comName))];
        console.log(uniqueBirds);
        userInput.displayBirdsInRegion(uniqueBirds);
    });
}


// function to trigger retrieveLocationCode function on click
userInput.showBirds = function () {
    $('.destinationOption').on('click', 'button.option', function () {
        if(userInput.activity === "hiking") {
            console.log(this);
            userInput.indexOfButton = $(this).attr('id');
            let finalDestination = userInput.destinationLocations.find(el => el.unique_id === Number(userInput.indexOfButton))
            console.log(finalDestination);
            userInput.retrieveLocationCode(finalDestination.city);
        }
        else if (userInput.activity === "camping") {
            console.log('You selected camping, no birds here');
        }
    });
}

// Function to display sounds
userInput.displayBirdSounds = (recordings) => {
        console.log(recordings);
        const birdSound = $('<iframe>').attr('src', `${recordings[0].url}/embed?simple=1`);
        let birdSoundContainer = recordings[0].en.replace(' ', '-').toLowerCase();
        console.log(`created class is ${birdSoundContainer}`);
        const soundContainer = $('<div>').append( birdSound);
        $(`.${birdSoundContainer}`).append(soundContainer);
}

// BIRDS SOUNDS API

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
        console.log(res.recordings);
        recordingsArray = res.recordings;
        userInput.displayBirdSounds(recordingsArray);
    });
}



// Enables navigation
// userInput.nextScreen = () => {
//     $('input[type=submit]').on('click', function (event) {
//         currentScreen = $(this).attr('id');
//         if (currentScreen === 'firstInput') {
//             $('.landingPage').fadeOut(1000);
//             $('.destinationOption').fadeIn();
//         }
// WILL NEED TO REBUILD FOR STEP 2
        // } else if (currentScreen === 'secondInput' && userInput.activity === 'camping') {
        //     $('.uvInfo').fadeOut(1000);
        //     $('.camping').fadeIn();
        // }
    // });
// });
// }



userInput.init = function () {

}


$('.fa-times').on('click', function () {
    $('.modalWindow').fadeOut();
});
// Calls function that enables navigation
// userInput.nextScreen();


$(function () {
    userInput.showBirds();
    // userInput.init();
    userInput.initFirebase();
    $('form').on('submit', function (event) {
        event.preventDefault();
        // Retrieve user input and call TrailAPI & Display results on the page
        userInput.retrieveInputValues();
    })
});

// Create async function -DISREGARD (NOT WORKING/ HERE FOR FUTURE REFERENCE)
// async function getData() {
//     const locationCoordinates = await userInput.getCoordinates(userInput.address, userInput.city, userInput.province);
//     userInput.lat = locationCoordinates.results[0]['geometry']['location']['lat'];
//     userInput.lng = locationCoordinates.results[0]['geometry']['location']['lng'];
//     console.log(`Here are the coordinates: ${userInput.lat}, ${userInput.lng}`);


//     const locationsList = await userInput.getLocationBasedOnUserInput(43.6567919, -79.4609322, 5, 'hiking');

//     userInput.displayOptions(locationsList.places);
// };