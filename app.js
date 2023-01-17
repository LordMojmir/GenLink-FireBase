console.log(firebase);
///// User Authentication /////
const auth = firebase.auth();

const whenSignedIn = document.getElementById("whenSignedIn");
const whenSignedOut = document.getElementById("whenSignedOut");
const signInBtnWithMail = document.getElementById("signInBtnWithMail");

const signInBtn = document.getElementById("signInBtn");
const signInFaceBookBtn = document.getElementById("signInFaceBookBtn");
const termsOfAgreementOrOptions = document.getElementById(
  "termsOfAgreementOrOptions"
);

const signOutBtn = document.getElementById("signOutBtn");

//const userDetails = document.getElementById("userDetails");

//Google
const providerGoogle = new firebase.auth.GoogleAuthProvider();

signInBtn.onclick = () => {
  if (termsOfAgreementOrOptions.checked) {
    console.log("Google Authentication", providerGoogle);

    auth
      .signInWithPopup(providerGoogle)
      .then(() => window.location.assign("home.html"));
  } else {
    console.log("You have to accept the terms of agreement");
  }
};
//Facebook
const providerFacebook = new firebase.auth.FacebookAuthProvider();
signInFaceBookBtn.onclick = () => {
  if (termsOfAgreementOrOptions.checked) {
    auth.signInWithPopup(providerFacebook);
  } else {
    console.log("You have to accept the terms of agreement");
  }
};
//signInBtn.onclick = () => console.log("Facebook signed in");
const usernameMail = document.getElementById("username");
const passwordMail = document.getElementById("password");
///image

/// Sign Up Button
//get infos from RegisterForm
const usernameMailSignUp = document.getElementById("usernameSignUp");
const passwordMailSignUp = document.getElementById("passwordSignUp");
const givenNameSignUp = document.getElementById("givenName");
const familyNameSignUp = document.getElementById("familyName");
//const birthdaySignUp = document.getElementById("birthday");
//const daySignUp = document.getElementById("day");
//const monthSignUp = document.getElementById("month");
const yearSignUp = document.getElementById("year");
//const registerImg = document.getElementById("upload-button");
const femaleRadio = document.getElementById("u_2_4_2O");
const maleRadio = document.getElementById("u_2_5_bC");
const diverseRadio = document.getElementById("u_2_6_fd");
const termsOfAgreement = document.getElementById("termsOfAgreement");

//module BT5

//firebase sign up
const dbUsers = firebase.firestore();

function getGender() {
  let genderEmpty;
  if (femaleRadio.checked) {
    genderEmpty = "Female";
  } else if (maleRadio.checked) {
    genderEmpty = "Male";
  } else if (diverseRadio.checked) {
    genderEmpty = "Diverse";
  }
  const gender = genderEmpty == undefined ? "Not Found" : genderEmpty;
  return gender;
}

function getDisplayName() {
  return givenNameSignUp.value + " " + familyNameSignUp.value;
}

signUpBtnWithMail.onclick = () => {
  if (termsOfAgreement.checked) {
    console.log("Username: ", usernameMailSignUp.value);
    auth
      .createUserWithEmailAndPassword(
        usernameMailSignUp.value,
        passwordMailSignUp.value
      )
      .then(() => {
        // Get the newly created user
        var user = firebase.auth().currentUser;

        user
          .sendEmailVerification()
          .then(() => {
            console.log("Verify Mail sent");
          })
          .catch((error) => {
            console.log(error);
          });
        const { serverTimestamp } = firebase.firestore.FieldValue;
        // Save the user's information to Firestore
        dbUsers
          .collection("users")
          .doc(user.uid)
          .set({
            email: user.email,
            displayName: getDisplayName(),
            yearOfBirth: yearSignUp.value,
            gender: getGender(),
            about: "",
            interests: "",
            AGBs: termsOfAgreement.checked,
            //userImg: imagesRef.fullPath,
            createdAt: serverTimestamp(),
          })
          .then(() => {
            console.log("User information saved to Firestore");
            window.location.assign("home.html");
          })
          .catch((error) => {
            console.error("Error saving user information to Firestore:", error);
          });
      })
      .catch((error) => {
        console.error("Error creating user:", error);
      });
  } else {
    console.log("You need to check terms of aggreement");
  }
};

// registerImg.addEventListener('change', (event) => {
//   const file = event.target.files[0];

//   const storageRef = firebase.storage().ref();
//   const fileRef = storageRef.child('profileImages/' + file.name);

//   fileRef.put(file).then((snapshot) => {
//     console.log('File uploaded successfully');
//   });
// });

/// Sign in event handlers
signInBtnWithMail.onclick = () => {
  console.log("Username: ", usernameMail.value);
  auth
    .signInWithEmailAndPassword(usernameMail.value, passwordMail.value)
    .then((userCredential) => {
      // Signed in
      console.log("Signed In");
      var user = userCredential.user;
      window.location.assign("home.html");

      // ...
    })
    .catch((error) => {
      errorWithSignIn.innerHTML = error.message;
      var errorCode = error.code;
      var errorMessage = error.message;
    });
};

signOutBtn.onclick = () => {
  auth.signOut();
};

auth.onAuthStateChanged((user) => {
  if (user) {
    // signed in

    whenSignedIn.hidden = false;
    whenSignedOut.hidden = true;
    setTimeout(() => {
      window.location.assign("home.html");
    }, 60000);
    // Simulate a mouse click:
    // userDetails.innerHTML = `<h3>Hello ${
    //   user.displayName ?? user.email
    // }!</h3> <p>User ID: ${user.uid}</p>`;
    // console.log("Display Name", user.displayName);
    // console.log("Photo", user.photoURL);
    // console.log("Birthday", user.birthdate);
    // console.log("Gender: ", user.gender);
  } else {
    // not signed in
    whenSignedIn.hidden = true;
    whenSignedOut.hidden = false;
    userDetails.innerHTML = "";
  }
});

////Firestore Users

async function generateDocForNewUser() {
  console.log("Arrived at createUserDocument");

  if (!user) return;

  userRef = db.collection(`users/${user.uid}`);

  const snapshot = userRef.get();

  if (!snapshot.exists) {
    const { serverTimestamp } = firebase.firestore.FieldValue;
    //TODO: ABG accept option
    try {
      userRef.set({
        uid: user.uid,
        displayName: givenNameSignUp.value + " " + familyNameSignUp.value,
        birthdate: yearSignUp.value,
        AGBs: false,
        about: String,
        interests: String,
        gender: gender,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.log("Erros in creating user in DB", error);
    }
  }
}

let userRef;

const createUserDocument = (user) => {
  console.log("Arrived at createUserDocument");

  if (!user) return;

  userRef = db.collection(`users/${user.uid}`);

  const snapshot = userRef.get();

  if (!snapshot.exists) {
    const { serverTimestamp } = firebase.firestore.FieldValue;
    //TODO: ABG accept option
    try {
      userRef.set({
        uid: user.uid,
        displayName: givenNameSignUp.value + " " + familyNameSignUp.value,
        birthdate: yearSignUp.value,
        AGBs: false,
        about: String,
        interests: String,
        gender: gender,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.log("Erros in creating user in DB", error);
    }
  }
};
