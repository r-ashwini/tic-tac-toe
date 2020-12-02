init();

function init() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            document.getElementById('login').style.display = "none";
            document.getElementById('logout').style.display = "block";
            document.getElementById('gethistory').style.display = "block";
            document.getElementById('getranking').style.display = "block";
        } else {
              // No user is signed in.
        }
        let currentUserDisplayName = "Guest";
        currentUserDisplayName = user? 
            user.displayName : currentUserDisplayName;
        const item = document.getElementById("showDisplayName");
        const text = document.createTextNode(currentUserDisplayName);
        item.appendChild(text); 
    });
}

function playvsSelf() {
    window.location.href = "customxo.html?gameType=vsSelf";
}

function playvsAI() {
    window.location.href = "game.html?gameType=vsAI";
}

function login() {
    window.location.href = "login.html";
}

function logout() {
    firebase.auth().signOut().then(function() {
        window.location.href = "login.html";
      }).catch(function(error) {
        // An error happened.
      });
}

function history() {
    window.location.href = "history.html";
}

function ranking() {
    window.location.href = "ranking.html";
}