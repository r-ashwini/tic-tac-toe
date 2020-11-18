const database = firebase.database();
const auth = firebase.auth();

init();

function init() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            const userId = user.uid;
            const userDisplayName = user.displayName;
            displayCurrentUserName(userDisplayName);
            const gameRef = firebase.database().ref('games');
            const query = gameRef.orderByChild("userId").equalTo(userId);
            let data = [];
            query.on("value", function(snapshot) {  
                for (var key in snapshot.val()) {
                    const item = snapshot.val()[key];
                    const timestamp = item.timestamp;
                    const humanReadableTime = convertTimeToHumanReadable(timestamp);
                    let newItem = {
                        date: humanReadableTime,
                        gameType: item["gameType"],
                        winner: item["winner"],
                        status: item["status"]
                    };
                    data = [newItem, ...data];
                }
                $('#game-history-pagination').pagination({
                    dataSource: {
                        data: data
                    },
                    locator: "data",
                    pageSize: 1,
                    callback: function(data, pagination) {
                        var html = template(data);
                        $('#game-history-data').html(html);
                    }
                    })
                });
        } else {
            // No user is signed in.
            
        }
    });
}

function template(dataSet) {
    let divItem = "";
    const header = {
        date: "Date",
        gameType: "Game Type",
        winner: "Winner",
        status: "Status"
    }
    dataSet = [header, ...dataSet];
    for (const data of dataSet){
        divItem += format(data);
    }
    return "<table>" + divItem + "</table>";
}

function format(data) { 
    return "<tr>" +
    "<td>" + data.date + "</td>" +
    "<td>" + data.gameType + "</td>" +
    "<td>" + data.winner + "</td>" +
    "<td>" + data.status + "</td>" +
    "</tr>";
}

function displayCurrentUserName (currentUserDisplayName) {
    /* Get user display name for banner */
    const item = document.getElementById("showDisplayName");
    const text = document.createTextNode(currentUserDisplayName);
    item.appendChild(text); 
}

function convertTimeToHumanReadable(rawTimestamp) {
    return moment(rawTimestamp).format("MM/DD/YYYY HH:mm:ss");
}

function home() {
    window.location.href = "menu.html";
}