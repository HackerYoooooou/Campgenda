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
    userInput.province = $('input[name=province]').val();
    userInput.city = $('input[name=city]').val();
    userInput.radius = $('select[name=radius]').val();
    userInput.activity = $('select[name=activity]').val();
    userInput.address = $('input[name=address]').val();
    userInput.getCoordinates(userInput.address, userInput.city, userInput.province);
    userInput.getUVIndex(userInput.lat, userInput.lng, userInput.currentDate)
    // userInput.getLocationBasedOnUserInput(userInput.lat, userInput.long, userInput.radius, userInput.activity);
    // getData();
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
    })
};

// Create async function -DISREGARD (NOT WORKING/ HERE FOR FUTURE REFERENCE)
// async function getData() {
//     const locationCoordinates = await userInput.getCoordinates(userInput.address, userInput.city, userInput.province);
//     userInput.lat = locationCoordinates.results[0]['geometry']['location']['lat'];
//     userInput.lng = locationCoordinates.results[0]['geometry']['location']['lng'];
//     console.log(`Here are the coordinates: ${userInput.lat}, ${userInput.lng}`);


//     const locationsList = await userInput.getLocationBasedOnUserInput(43.6567919, -79.4609322, 5, 'hiking');

//     userInput.displayOptions(locationsList.places);
// };

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

userInput.milesToKilometers = (miles) => {
    const distance = parseInt(miles) * 1.60934;
    return distance;
}

// I'm not done here -Noel
userInput.getWeather = function (province, city) {
    $.ajax({
        url: `http://api.wunderground.com/api/559369d256cad936/conditions/q/${province}/${city}.json`,
        method: 'GET',
        dataType: 'json'
    }).then((res) => {

        let conditions = res.response.results.filter((city) => {
            return city.country === 'CA' && city.state === province;
        });

        console.log(conditions);
        // const newData = res.response.results[0].country;
        // console.log(newData);
        // let ofAge = newData.filter((item) => {
        //     return item;
        // });
        // console.log(ofAge);




        // let conditions = res.filter((value) => {
        //     console.log(conditions);
        // });
    });
};

// Create function local to userInput object
// to print attributes of each element of locations array on the screen
userInput.displayOptions = (locations) => {
    let activitiesArray = [];
    locations.forEach((location,i) => {
        // console.log(location);
        location.activities.forEach((activity) =>{
            activitiesArray.push(activity);
            // console.log(activity);
        });
        // Print array of activities
        // console.log(activitiesArray);
    });
    activitiesArray.sort(function(a,b){
        return parseFloat(b.rating) - parseFloat(a.rating) || b.length - a.length;
    });
    console.log(activitiesArray);
<<<<<<< HEAD
    for (i = 0; i < activitiesArray.length;i++) {
||||||| merged common ancestors
    for (i=0; i<100;i++) {
=======
    for (i=0; i<activitiesArray.length;i++) {
>>>>>>> 9381a481c04a1f7e317e18f50f76205283ee189c
        const name = $(`<button class=option id="${activitiesArray[i].place_id}">`).text(activitiesArray[i].name);
        const direction = $('<p>').text(activitiesArray[i].description);
        const rating = $('<p>').text(`Trail Raiting is ${activitiesArray[i].rating}`);
        const length = $('<p>').text(`Trail Length is ${activitiesArray[i].length} km`);
        const trailContainer = $(`<div class=itemContainer${activitiesArray[i].place_id}>`).append(name, rating, length, direction);
        const container = $('.locationOptions').append(trailContainer);
        $('.hiking').append(container);
    }
}

// Create function to retrieve location code from firebase based on user input
userInput.retrieveLocationCode = function (arrayNumber) {
    const dbRef = firebase.database().ref('/codes');
    dbRef.on('value', (item) => {
        const codeObject = item.val();
        window.dataObj = codeObject;
        console.log(arrayNumber);
        // console.log(codeObject);
            for (let key in codeObject) {
                // console.log(codeObject);
                if (codeObject[key]["country-code"] === 'CA' && codeObject[key]["name"] === arrayNumber ) {
                        console.log(codeObject[key]);
                        let locationCode = codeObject[key]["subnational2-code"];
                        getBirdsBasedOnLocation(locationCode);
                }
            }
    });
}


userInput.displayBirdsInRegion = (birds) => {
    birds.forEach((bird, i) => {
        console.log(bird.comName);
        const name = $('<h3>').text(bird.comName);
        const birdContainer = $(`<div class="${bird.comName.replace(' ','-').toLowerCase()}">`).append(name);
        // console.log(`.itemContainer${userInput.indexOfButton}`);
        $(`.itemContainer${userInput.indexOfButton}`).append(birdContainer);
        // Call Xeno API to retrieve a sound for each bird
        getBirdSoundsBasedOnName(bird.comName);
    });
}

// BIRDS API
const getBirdsBasedOnLocation = (sightSpot) => {
    return $.ajax({
        url: 'http://ebird.org/ws1.1/data/notable/region/recent',
        // url: 'https://proxy.hackeryou.com',
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
        userInput.displayBirdsInRegion(res);
    });
}


// function to trigger retrieveLocationCode function on click
userInput.showBirds = function () {
    $('.locationOptions').on('click', 'button.option', function () {
        console.log(this);
        userInput.indexOfButton = $(this).attr('id');
        let finalDestination = userInput.destinationLocations.find(el => el.unique_id === Number(userInput.indexOfButton))
        userInput.retrieveLocationCode(finalDestination.city);

        // userInput.destinationLocations.forEach((destinationLocation) => {

        //     // let indexOfArrayElement = userInput.destinationLocations.indexOf(destinationLocation);
        //     console.log(finalDestination)
        //     // if (indexOfArrayElement === Number(userInput.indexOfButton)) {
        //     //     console.log(destinationLocation)
        //     // }
        // });
    });
}

// Function to display sounds
userInput.displayBirdSounds = (recordings) => {
        // const birdName = $('<p>').text(recordings[0].en);
        // const soundContainer = $('<div>').append(birdName);
        // const soundUrl = $('<audio>').attr('src',recordings[0].url);
        // Add Audio element to the page
        // <iframe src='https://www.xeno-canto.org/371524/embed?simple=1' scrolling='no' frameborder='0' width='340' height='115'></iframe>
        console.log(recordings);
        const birdSound = $('<iframe>').attr('src', `${recordings[0].url}/embed?simple=1`);
        let birdSoundContainer = recordings[0].en.replace(' ', '-').toLowerCase();
        console.log(`created class is ${birdSoundContainer}`);
        // let birdSound = document.createElement('audio');
        // birdSound.setAttribute('controls', true);
        // let audioSource = document.createElement('source');
        // audioSource.src = `${recordings[0].url}/embed`;
        // birdSound.appendChild(audioSource)
        const soundContainer = $('<div>').append( birdSound);


        
        $(`.${birdSoundContainer}`).append(soundContainer);
    // recordings.forEach((recording) => {
    //     const soundUrl = $('<p>').text(recording.url);
    //     const soundContainer = $('<div>').append(soundUrl);
    //     $('body').append(soundContainer);
    // });
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
                //  query: 'loc:Toronto'
                query: birdName
            }
        }
    }).then(function (res) {
        console.log(res.recordings);
        recordingsArray = res.recordings;
        userInput.displayBirdSounds(recordingsArray);
    });
}




userInput.init = function () {

}

$(function () {
    // getBirdSoundsBasedOnName();
    userInput.showBirds();
    // userInput.init();
    userInput.initFirebase();
    $('form').on('submit', function (event) {
        event.preventDefault();
        // Retrieve user input and call TrailAPI & DIsplay results on the page
        userInput.retrieveInputValues();

        $('.landingPage').fadeOut(1000);
        $('.hiking').fadeIn();
        // userInput.showBirds();
        // userInput.retrieveLocationCode();
        // getBirdSoundsBasedOnName('Owl');

    })
});