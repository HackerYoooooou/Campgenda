const userInput = {};

// Retrieve User Input
userInput.province = $('input[name=province]').val();
userInput.city = $('input[name=city]').val();
userInput.radius = $('input[name=radius]').val();
userInput.activity = $('input[name=activity]').val();




// Create AJAX request to retrieve location information based on City
const getLocationBasedOnUserInput = (province, city, radius, activity) => {
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
    });
}

async function getData() {
    const returnedLocations = await getLocationBasedOnUserInput(userInput.province, userInput.city, userInput.radius, userInput.activity);
    console.log(returnedLocations.places);
    // return returnedLocations;
    returnedLocations.places.forEach((location) => {
        console.log(location.name);
    });
}

// userInput.displayOptions = () => {
//     let returnedLocations = getData();
//     returnedLocations.forEach((location) => {
//         console.log(location.name);
//     });
// }

$(function(){
    $('form').on('submit', function(event){
        event.preventDefault();
        getData();
        // userInput.displayOptions();
    })
});