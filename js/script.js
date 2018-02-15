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


// Retrieve User Input
userInput.retrieveInputValues = function() {
    userInput.province = $('input[name=province]').val();
    userInput.city = $('input[name=city]').val();
    userInput.radius = $('input[name=radius]').val();
    userInput.activity = $('input[name=activity]').val();
    userInput.address = $('input[name=address]').val();
    userInput.getLocationBasedOnUserInput(userInput.province, userInput.city, userInput.radius, userInput.activity);
    userInput.getCoordinates(userInput.address, userInput.city, userInput.province);
}

// Create AJAX request to retrieve location information based on City

userInput.getLocationBasedOnUserInput = (province, city, radius, activity) => {
    return $.ajax({
        url: 'https://trailapi-trailapi.p.mashape.com/',
        method: 'GET',
        dataType: 'json',
        headers: {
            'X-Mashape-Key': 'ggHiGgB9CKmshtveiFCqkApU62aYp1E7G75jsn4Uwr3THLo7UM'
        },
        data: {
            q: {
                state_cont: province,
                city_cont: city,
                radius: radius,
                activities_activity_type_name_eq: activity
            }
        }
    }).then(function(res){
        const data = res.places;
        userInput.destinationLocations = res.places;
        console.log(res.places);
        console.log(userInput.destinationLocation);
        userInput.displayOptions(data);
    });
}

// Create AJAX request to retrieve coordinates based on address


userInput.getCoordinates = (address, city, province) => {
    return $.ajax({
        url: "https://maps.googleapis.com/maps/api/geocode/json?",
        method: 'GET',
        dataType: 'json',
        data: {
            address: `${address}, ${city}, ${province}`,
            key: 'AIzaSyDNBpAAUuUkRyioDLQUQW_DZYIb1PiY85Q'
        }
    }).then(function (res) {
        userInput.lat = res.results[0]['geometry']['location']['lat'];
        userInput.lng = res.results[0]['geometry']['location']['lng'];
    })
};

// Create async function -DISREGARD (NOT WORKING/ HERE FOR FUTURE REFERENCE)
// to wait for the promise and call display function when promise is recieved
// userInput.getLocationsData = () => {
    // async function getData() {
    //     userInput.retrieveInputValues(); 
    //     const returnedLocations = await userInput.getLocationBasedOnUserInput(userInput.province, userInput.city, userInput.radius, userInput.activity);
    //     console.log(returnedLocations.places);
    //     userInput.displayOptions(returnedLocations.places);
    // }
// }

// Create function local to userInput object
// to print attributes of each element of locations array on the screen
userInput.displayOptions = (locations) => {
    locations.forEach((location,i) => {
        console.log(location);
        location.activities.forEach((activity) =>{
            console.log(activity);
            const name = $(`<button class=option id="${i}">`).text(activity.name);
            const direction = $('<p>').text(activity.description);
            const container = $('.locationOptions').append(name, direction);
            $('body').append(container);
        });
      
    });
}

// Create function to retrieve location code from firebase based on user input
userInput.retrieveLocationCode = function(arrayNumber) {
    const dbRef = firebase.database().ref('/codes');
    dbRef.on('value', (item) => {
        const codeObject = item.val();
        for (let key in codeObject) {
            // console.log(codeObject[key]);
            if (codeObject[key]["country-code"] === 'CA' && codeObject[key]["name"] === arrayNumber ) {
                    console.log(codeObject[key]);
                    let locationCode = codeObject[key]["subnational2-code"];
                    getBirdsBasedOnLocation(locationCode);
                }
            
        }
    });
}


userInput.displayBirdsInRegion = (birds) => {
    birds.forEach((bird) => {
        console.log(bird.comName);
        const name = $('<h3>').text(bird.comName);
        const container = $('<div>').append(name);
        $('body').append(container);
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
            fmt: 'json'
        }
    }).then(function(res){
        console.log(res);
        userInput.displayBirdsInRegion(res);
    });
}


// function to trigger retrieveLocationCode function on click
userInput.showBirds = function() {
    $('.locationOptions').on('click', 'button.option', function(){
        console.log(this);
        const indexOfButton = $(this).attr('id');
        userInput.destinationLocations.forEach((destinationLocation) => {
            let indexOfArrayElement = userInput.destinationLocations.indexOf(destinationLocation);
            if (indexOfArrayElement = indexOfButton) {
                userInput.retrieveLocationCode(destinationLocation.city);
            }
        });
    });
}

// Function to display sounds
userInput.displayBirdSounds = (recordings) => {
        const birdName = $('<p>').text(recordings[0].en);
        const soundUrl = $('<p>').text(recordings[0].url);
        const soundContainer = $('<div>').append(birdName, soundUrl);
        $('body').append(soundContainer);
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
    }).then(function(res){
        console.log(res.recordings);
        recordingsArray = res.recordings;
        userInput.displayBirdSounds(recordingsArray);
    });
}




userInput.init = function () {
    
}

$(function(){
    // getBirdSoundsBasedOnName();
    userInput.showBirds();
    // userInput.init();
    userInput.initFirebase();
    $('form').on('submit', function(event){
        event.preventDefault();
        // Retrieve user input and call TrailAPI & DIsplay Results on the page
        userInput.retrieveInputValues();
        // userInput.showBirds();
        // userInput.retrieveLocationCode();
        // getBirdSoundsBasedOnName('Owl');

    })
});