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
    userInput.getLocationBasedOnUserInput(userInput.province, userInput.city, userInput.radius, userInput.activity);
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
        userInput.displayOptions(data);
    });
}

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
    locations.forEach((location) => {
        console.log(location);
        location.activities.forEach((activity) =>{
            console.log(activity);
            const name = $('<button class=option>').text(activity.name);
            const direction = $('<p>').text(activity.description);
            const container = $('.locationOptions').append(name, direction);
            $('body').append(container);
        });
    });
}

// Create function to retrieve location code from firebase based on user input
userInput.retrieveLocationCode = function() {
    const dbRef = firebase.database().ref('/codes');
    dbRef.on('value', (item) => {
        const codeObject = item.val();
        for (let key in codeObject) {
            console.log(codeObject[key]);
            if (codeObject[key]["country-code"] === 'CA' && codeObject[key]["name"] === userInput.city ) {
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
        userInput.retrieveLocationCode();
    });
}

// BIRDS SOUNDS API

const getBirdSoundsBasedOnName = (birdName) => {
    return $.ajax({
        url: 'https://www.xeno-canto.org/api/2/recordings',
        method: 'GET',
        dataType: 'jsonp',
        data: {
            format: 'json',
            query: "loc:Toronto"
        }
    }).then(function(res){
        console.log(res);
    });
}




userInput.init = function () {
    
}

$(function(){
    getBirdSoundsBasedOnName();
    userInput.showBirds();
    // userInput.init();
    userInput.initFirebase();
    $('form').on('submit', function(event){
        event.preventDefault();
        // Retrieve user input and call TrailAPI & DIsplay Results on the page
        userInput.retrieveInputValues();
        // userInput.showBirds();
        // userInput.retrieveLocationCode();
    })
});