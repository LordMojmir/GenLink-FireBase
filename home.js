const auth = firebase.auth();
signOutBtn.onclick = () => {
  auth.signOut();
};
const user = firebase.auth().currentUser;

firebase.auth().onAuthStateChanged((user) => {
  if (user != undefined) {
    userName.innerHTML = `${user.displayName ?? user.email}`;
  } else {
    userName.innerHTML = `${user.displayName ?? user.email}`;
  }
});

auth.onAuthStateChanged((user) => {
  if (user) {
    // signed in

    whenSignedIn.hidden = false;
    whenSignedOut.hidden = true;
    registerBTN.hidden = true;
    signOutBtn.hidden = false;

    userName.innerHTML = `${user.displayName ?? user.email}`;

    console.log("Display Name", user.displayName);
    console.log("Photo", user.photoURL);
  } else {
    whenSignedIn.hidden = true;
    whenSignedOut.hidden = false;
    signOutBtn.hidden = true;
    registerBTN.hidden = false;
  }
});
