const database = firebase.database();
const auth = firebase.auth();

firebase.auth().onAuthStateChanged(function(user) {
    if (user && user.displayName) {
         window.location.href = "menu.html";
    } else {
          // No user is signed in.
    }
});


function login() {
    removeErrorMessage("login_error");
    const userEmail = document.getElementById('user_email').value;
    const userPwd = document.getElementById('user_password').value;

    firebase.auth().signInWithEmailAndPassword(userEmail, userPwd)
    .then(signInCallback)
    .catch(function(error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        if(errorCode === "auth/user-not-found") {
            errorMessage = "There is no user record corresponding to this identifier";
        }
        showErrorMessage("login_error", errorMessage);
    })

}

function signup() {
    const newUserEmail = document.getElementById('new_user_email').value;
    const newUserPwd = document.getElementById('new_user_password').value;

    firebase.auth().createUserWithEmailAndPassword(newUserEmail, newUserPwd)
    .then(signupCallback)
    .catch(function(error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        showErrorMessage("signup_error", errorMessage);
    })

}

function signInCallback(authUser) {
    window.location.href = "menu.html";
}

function signupCallback(authUser) {
    const currentUser = firebase.auth().currentUser;
    const rawDisplayName = document.getElementById('new_user_display_name').value;
    let displayName = rawDisplayName? rawDisplayName : currentUser.email;
    currentUser.updateProfile({
        displayName: displayName
    }).then(function() {
        window.location.href = "menu.html";
    }).catch(function(error) {
        // An error happened.
    });
}

function toGuest() {
    window.location.href = "menu.html";
}

function toSignup() {
    document.getElementById('login').style.display = "none";
    document.getElementById('signup').style.display = "block";
}

function toSignin() {
    document.getElementById('signup').style.display = "none";
    document.getElementById('login').style.display = "block";
}

function showErrorMessage(divId, errorMessage) {
    let error = "Unknown Error.";
    error = errorMessage? 
        errorMessage : error + ".";
    const item = document.getElementById(divId);
    const text = document.createTextNode(error);
    item.appendChild(text); 
}

function removeErrorMessage(divId) {
    const item = document.getElementById(divId);
    item.textContent = "";
}