const database = firebase.database();
const auth = firebase.auth();

let currentUserId = null;
let currentUserDisplayName = '';

init();

function init() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            const userId = user.uid;
            const userDisplayName = user.displayName;
            currentUserId = userId;
            currentUserDisplayName = userDisplayName;
            displayCurrentUserName(userDisplayName);
            const gameRef = firebase.database().ref('games');
            const query = gameRef.orderByChild('gameType').startAt('AI').endAt('AI\uf8ff')
            let data = {};
            query.on("value", function(snapshot) {  
                for (var key in snapshot.val()) {
                    const item = snapshot.val()[key];
                    const userId = item["userId"];
                    const userName = item["userName"];
                    const gameType = item["gameType"];
                    let isEasy = gameType === 'AI (Easy)'? true : false;
                    const status = item["status"];
                    let userData;
                    if (userId in data) {
                        userData = data[userId];
                    } else {
                        userData = {
                            userName: userName,
                            easyWonCount: 0,
                            easyLostCount: 0,
                            easyDrawCount: 0,
                            easyWinRate:0,
                            advWonCount: 0,
                            advLostCount: 0,
                            advDrawCount: 0,
                            advWinRate:0,
                            overallWinRate: 0
                        }
                    }
                    if(isEasy) {
                        if(status === 1) {
                            userData['easyWonCount'] += 1;
                          } else if(status === -1) {
                            userData['easyLostCount'] += 1;
                          } else {
                            userData['easyDrawCount'] += 1;
                          }
                          userData['easyWinRate'] = userData['easyWonCount'] / (userData['easyWonCount'] + userData['easyLostCount'] + userData['easyDrawCount']);
                    } else {
                        if(status === 1) {
                            userData['advWonCount'] += 1;
                          } else if(status === -1) {
                            userData['advLostCount'] += 1;
                          } else {
                            userData['advDrawCount'] += 1;
                          }
                          userData['advWinRate'] = userData['advWonCount'] / (userData['advWonCount'] + userData['advLostCount'] + userData['advDrawCount']);
                    }
                    userData['overallWinRate'] = ( userData['easyWonCount'] + userData['advWonCount'] ) / (userData['easyWonCount'] + userData['easyLostCount'] + userData['easyDrawCount'] + userData['advWonCount'] + userData['advLostCount'] + userData['advDrawCount']);
                    data[userId] = userData;
                }
                let d = rank(data);
                $('#game-easy-ranking-pagination').pagination({
                    dataSource: {
                        data: d['easy']
                    },
                    locator: "data",
                    pageSize: 10,
                    callback: function(data, pagination) {
                        var html = easyTemplate(data);
                        $('#game-easy-ranking-data').html(html);
                        document.getElementById("game-easy-ranking-pagination").style.display = "none";
                        if(data.length === 0) {
                            document.getElementById("game-easy-ranking-empty").style.display = "block";
                        }
                    }
                })
                $('#game-adv-ranking-pagination').pagination({
                    dataSource: {
                        data: d['adv']
                    },
                    locator: "data",
                    pageSize: 10,
                    callback: function(data, pagination) {
                        var html = advTemplate(data);
                        $('#game-adv-ranking-data').html(html);
                        document.getElementById("game-adv-ranking-pagination").style.display = "none";
                        if(data.length === 0) {
                            document.getElementById("game-adv-ranking-empty").style.display = "block";
                        }
                    }
                })
                $('#game-overall-ranking-pagination').pagination({
                    dataSource: {
                        data: d['overall']
                    },
                    locator: "data",
                    pageSize: 10,
                    callback: function(data, pagination) {
                        var html = overallTemplate(data);
                        $('#game-overall-ranking-data').html(html);
                        document.getElementById("game-overall-ranking-pagination").style.display = "none";
                        if(data.length === 0) {
                            document.getElementById("game-overall-ranking-empty").style.display = "block";
                        }
                    }
                })
            });
        } else {
            // No user is signed in.
            
        }
    });
}

function rank(dataSet) {
    let easy = [];
    let adv = [];
    let overall = [];
    for (let key in dataSet) {
        if (!dataSet.hasOwnProperty(key)) continue;
        let data = dataSet[key];
        if(data['easyWonCount']!==0 || data['easyLostCount']!==0 || data['easyDrawCount']!==0){
            const cloneEasyData = JSON.parse(JSON.stringify(data));
            cloneEasyData['userId'] = key;
            easy.push(cloneEasyData);
        }
        if(data['advWonCount']!==0 || data['advLostCount']!==0 || data['advDrawCount']!==0){
            const cloneAdvData = JSON.parse(JSON.stringify(data));
            cloneAdvData['userId'] = key;
            adv.push(cloneAdvData);
        }
        if(data['easyWonCount']!==0 || data['easyLostCount']!==0 || data['easyDrawCount']!==0 || data['advWonCount']!==0 || data['advLostCount']!==0 || data['advDrawCount']!==0) {
            const cloneOverallData = JSON.parse(JSON.stringify(data));
            cloneOverallData['userId'] = key;
            overall.push(cloneOverallData);
        }
    }
    easy.sort(function(a,b){
        return new Date(b.easyWinRate) - new Date(a.easyWinRate);
    });

    adv.sort(function(a,b){
        return new Date(b.advWinRate) - new Date(a.advWinRate);
    });

    overall.sort(function(a,b){
        return new Date(b.overallWinRate) - new Date(a.overallWinRate);
    });

    return {
        easy : easy,
        adv : adv,
        overall : overall
    }
}

function getHeader() {
    return "<tr>" +
    "<td>" + "Rank" + "</td>" +
    "<td>" + "Player Name" + "</td>" +
    "<td>" + "Games Won" + "</td>" +
    "<td>" + "Games Lost" + "</td>" +
    "<td>" + "Games Draw" + "</td>" +
    "<td>" + "Total Games" + "</td>" +
    "<td>" +  "Win Rate" + "</td>" +
    "</tr>";
}

function getPadding() {
    return "<tr>" +
    "<td>" + " " + "</td>" +
    "<td>" + " " + "</td>" +
    "<td>" + " " + "</td>" +
    "<td>" + " " + "</td>" +
    "<td>" + " " + "</td>" +
    "<td>" + " " + "</td>" +
    "<td>" +  " " + "</td>" +
    "</tr>";
}

function getCurrentUserRanking(dataSet) {
    let rank = 1;
    for(const data of dataSet) {
        const userId = data.userId;
        if(userId === currentUserId) {
            return rank;
        }
        rank++;
        
    }
    return '-';
}

function easyTemplate(dataSet) {
    let divItem = "";
    let rank = 1;
    for (const data of dataSet){
        divItem += easyFormat(data, rank, false);
        rank++;
    }
    divItem = getHeader() + divItem;
    if(dataSet) {
        const rank = getCurrentUserRanking(dataSet);
        if(rank !== '-') {
            divItem = divItem + getPadding() + easyFormat(dataSet[rank-1], rank, true);
        }
    }
    return "<table>" + divItem + "</table>";
}

function advTemplate(dataSet) {
    let divItem = "";
    let rank = 1;
    for (const data of dataSet){
        divItem += advFormat(data, rank, false);
        rank++;
    }
    divItem = getHeader() + divItem;
    if(dataSet) {
        const rank = getCurrentUserRanking(dataSet);
        if(rank !== '-') {
            divItem = divItem + getPadding() + advFormat(dataSet[rank-1], rank, true);
        }
    }
    return "<table>" + divItem + "</table>";
}

function overallTemplate(dataSet) {
    let divItem = "";
    let rank = 1;
    for (const data of dataSet){
        divItem += overallFormat(data, rank, false);
        rank++;
    }
    divItem = getHeader() + divItem;
    if(dataSet) {
        const rank = getCurrentUserRanking(dataSet);
        if(rank !== '-') {
            divItem = divItem + getPadding() + overallFormat(dataSet[rank-1], rank, true);
        }
    }
    return "<table>" + divItem + "</table>";
}


function easyFormat(data, rank, isCurrent) { 
    const total = data.easyWonCount + data.easyLostCount + data.easyDrawCount;
    return "<tr>" +
    "<td>" + (isCurrent? "&#11088 "+rank : rank) + "</td>" +
    "<td>" + (data.userName? data.userName : '-') + "</td>" +
    "<td>" + data.easyWonCount + "</td>" +
    "<td>" + data.easyLostCount + "</td>" +
    "<td>" + data.easyDrawCount + "</td>" +
    "<td>" + total + "</td>" +
    "<td>" + (data.easyWinRate*100).toFixed(2) + " %" + "</td>" +
    "</tr>";
}

function advFormat(data, rank, isCurrent) { 
    const total = data.advWonCount + data.advLostCount + data.advDrawCount;
    return "<tr>" +
    "<td>" + (isCurrent? "&#11088 "+rank : rank) + "</td>" +
    "<td>" + (data.userName? data.userName : '-') + "</td>" +
    "<td>" + data.advWonCount + "</td>" +
    "<td>" + data.advLostCount + "</td>" +
    "<td>" + data.advDrawCount + "</td>" +
    "<td>" + total + "</td>" +
    "<td>" + (data.advWinRate*100).toFixed(2) + " %" + "</td>" +
    "</tr>";
}

function overallFormat(data, rank, isCurrent) { 
    const totalLost = data.easyLostCount + data.advLostCount;
    const totalDraw =  data.easyDrawCount; + data.advDrawCount;
    const totalWon = data.advWonCount + data.easyWonCount;
    const total = totalLost + totalDraw + totalWon;
    return "<tr>" +
    "<td>" + (isCurrent? "&#11088 "+rank : rank) + "</td>" +
    "<td>" + (data.userName? data.userName : '-') + "</td>" +
    "<td>" + totalWon + "</td>" +
    "<td>" + totalLost + "</td>" +
    "<td>" + totalDraw + "</td>" +
    "<td>" + total + "</td>" +
    "<td>" + (data.overallWinRate*100).toFixed(2) + " %" + "</td>" +
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