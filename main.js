d3.csv('./Vic_Road_Crash_Data.csv')
    .then(data => {
        console.log(data[0]);
    })
    .catch(error => {
        console.log(`Error loading data: ${error}`);
        alert('Error loading data, please refresh the page');
    });


function myfunc(data) {
    console.log(data)
}

