const resentEmail = document.getElementById("resentEmail");
const requestToResendVerifyEmail = document.getElementById("requestToResendVerifyEmail");


resentEmail.onclick = () => {
    if (firebase.auth().currentUser.emailVerified) {
        // If the email is verified, create the user
        window.location.assign("home.html");
    } else {
        // If the email is not verified, show an error message
        alert("Please verify your email before continuing with this account");
      }   
}

requestToResendVerifyEmail.onclick = () => {
    if (firebase.auth().currentUser.emailVerified) {
        resentEmail.click();
    } else {
        // If the email is not verified, show an error message
        user = firebase.auth().currentUser;
        user
        .sendEmailVerification()
        .then(() => {
          console.log("Verify Mail sent");
          alert("Verify your email has been resend");
        });
      }
}
const auth = firebase.auth();

auth.onAuthStateChanged((user) => {
    if (user) {
      ///try
      if(user.emailVerified){
        console.log("Email verified");
      }else{
        console.log("Email has to be verified");

      }
      console.log("User signed in");
      whenSignedIn.hidden = false;
      whenSignedOut.hidden = true;
      //   profile.innerHTML = `
      //   <h1 id="displayName">${user.displayName ?? 'You dont have a username'}</h1>
      // <img id="photoURL" src="${user.photoURL}" alt="Profile picture">
      // <p id="email">${user.email}</p>`;
    } else {
      console.log("User npt signed in");
  
      // not signed in
      whenSignedIn.hidden = true;
      whenSignedOut.hidden = false;
      profile.innerHTML = "";
    }
  });
  