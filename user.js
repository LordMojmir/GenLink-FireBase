console.log(firebase);
const editInterests = document.getElementById("editInterests");
//const newInterests = document.getElementById("newInterests");
const saveChangesInProfile = document.getElementById("saveChangesInProfile");
const changedProfileYear = document.getElementById("year");
const customInterest = document.getElementById("customInterest");
const newDisplayName = document.getElementById("newDisplayName");
const uploadProfileIMGbutton = document.getElementById(
  "upload-ProfileIMG-button"
);

const changeProfileModel = document.getElementById(
  "editButtonForAboutAndIntrest"
);


signOutBtn.onclick = () => {
  auth.signOut();
};

auth.onAuthStateChanged((user) => {
  if (user) {
    ///try
    loadData(user);
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

///// Firestore /////
const db = firebase.firestore();

//const changeOfAbout = document.getElementById("changeOfAbout");
//const aboutFromFS = document.getElementById("aboutFromFS");
//const newAbout = document.getElementById("newAbout");

let thingsRef;
let unsubscribe;

auth.onAuthStateChanged((user) => {
  if (user) {
    // Database Reference
    thingsRef = db.collection("profile");

    // changeOfAbout.onclick = () => {
    //   const { serverTimestamp } = firebase.firestore.FieldValue;

    //   thingsRef.set({
    //     uid: user.uid,
    //     about: newAbout.value,
    //     createdAt: serverTimestamp(),
    //   });
    // };

    // Query
    unsubscribe = thingsRef
      .where("uid", "==", user.uid)
      //  .orderBy('createdAt') // Requires a query
      .onSnapshot((querySnapshot) => {
        // Map results to an array of li elements

        const items = querySnapshot.docs.map((doc) => {
          return `${doc.data().about}`;
        });

        //aboutFromFS.innerHTML = items.join("");
      });
  } else {
    // Unsubscribe when the user signs out
    unsubscribe && unsubscribe();
  }
});

function createCheckboxes(options) {
  const container = document.querySelector(".containerForIntrests");
  const form = document.createElement("form");
  const row = document.createElement("div");
  row.classList.add("row");

  options.forEach((option, index) => {
    const col = document.createElement("div");
    col.classList.add("col-4");
    
    const div = document.createElement("div");
    div.classList.add("checkbox");

    const label = document.createElement("label");
    const input = document.createElement("input");
    input.type = "checkbox";
    input.value = option;
    input.id = `option${index + 1}`;

    label.appendChild(input);
    label.appendChild(document.createTextNode(option));

    div.appendChild(label);
    col.appendChild(div);
    row.appendChild(col);
  });

  form.appendChild(row);
  container.appendChild(form);
}

document.addEventListener("DOMContentLoaded", function () {
  console.log("Documet eventlistener");
  console.log("I have been here");

  const options = [
    "Sport",
    "Geschichte",
    "Feuerwehr",
    "Lesen",
    "Lernen",
    "Wissenschft",
    "Backen",
    "IT",
    "Entspannen",
    "Musik",
    "Garten",
    "Tiere",
    "Gesundheit",
    "Umwelt",
    "Politik"
  ];
  createCheckboxes(options);
});

saveChangesInProfile.onclick = () => {
  const changedProfileAbout = document.getElementById("changedProfileAbout");

  const user = firebase.auth().currentUser;
  var docRef = db.collection("users").doc(user.uid);
  console.log(user.uid);
  var storageRef = firebase.storage().ref();
  var avatarRef = storageRef.child(user.uid + "/avatar.jpg");
  // avatarRef.getDownloadURL()
  //   .then((metadata) => {
  //     console.log("Metadata: ", metadata);
  //   });
  if (uploadProfileIMGbutton.files.length > 0) {
    avatarRef.put(uploadProfileIMGbutton.files[0]).then((snapshot) => {
      console.log("Uploaded a blob or file!");
    });
  }

  const checkboxes = document.querySelectorAll("input[type='checkbox']");
  const checkedValues = [];
  let checkedNames = "";
  for (const checkbox of checkboxes) {
    if (checkbox.checked) {
      checkedValues.push(checkbox.value);
      checkedNames += checkbox.parentNode.textContent + ", ";
    }
  }
  // console.log("Checked: " + checkedNames);
  checkedNames = checkedNames.trim().slice(0, -1);

  const result =
    checkedNames +
    (customInterest.value == undefined ? "" : ", " + customInterest.value);
  const finalResult = result == ", " ? "" : result.trim().slice(0, -1);
  docRef
    .get()
    .then((doc) => {
      let yearOld = doc.data().yearOfBirth;
      let interestsOld = doc.data().interests;
      let displayNameOld = doc.data().displayName;

      return docRef
        .update({
          displayName:
            newDisplayName.value == "" ? displayNameOld : newDisplayName.value,
          interests: finalResult == "" ? interestsOld : finalResult,
          yearOfBirth:
            changedProfileYear.value == 2022
              ? yearOld
              : changedProfileYear.value,
          about: changedProfileAbout.value,
        })
        .then((snapshot) => {
          loadData(user);

          console.log("Document successfully updated!");
        })
        .catch((error) => {
          // The document probably doesn't exist.
          console.error("Error updating document: ", error);
        });
    })
    .catch((error) => {
      console.log("Error getting cached document:", error);
    });
    $('#changeProfileModel').modal('hide');
  };

changeProfileModel.onclick = () => {
  const user = firebase.auth().currentUser;
  var docRef = db.collection("users").doc(user.uid);

  console.log("changeProfileModel");

  docRef
    .get()
    .then((doc) => {
      // let yearOld = doc.data().yearOfBirth;
      // let interestsOld = doc.data().interests;
      let aboutOld = doc.data().about;
      oldAboutArea.innerHTML = `<textarea class="form-control" rows="5" id="changedProfileAbout">${aboutOld}</textarea>`;
    })
    .catch((error) => {
      console.log("Error getting cached document:", error);
    });
};

function loadData(user) {
  // signed in
  if (user.emailVerified || true) {
    console.log("Verified");
    console.log("LoadData");

    ///try
    // Query
    var about;
    var interests;
    var gender;
    var year;
    var mail;
    var name;
    var docRef = db.collection("users").doc(user.uid);
  
    editInterests.onclick = () => {
      return docRef
        .update({
          interests: customInterest.value,
        })
        .then(() => {
          console.log("Document successfully updated!");
        })
        .catch((error) => {
          // The document probably doesn't exist.
          console.error("Error updating document: ", error);
        });
    };
  
    var storageRef = firebase.storage().ref();
    var avatarRef = storageRef.child(user.uid + "/avatar.jpg");
  
    avatarRef
      .getDownloadURL()
      .then((metadata) => {
        // Metadata now contains the metadata for 'images/forest.jpg'
        console.log("Metadata: ", metadata);
        profilePic.innerHTML = `<img id="photoURL" class="card-img-top rounded" src="${metadata}" alt="Here should be a picture">`;
      })
      .catch((error) => {
        // Uh-oh, an error occurred!
      });
  
    docRef
      .get()
      .then((doc) => {
        if (doc.exists) {
          about = doc.data().about;
          year = doc.data().yearOfBirth;
          gender = doc.data().gender;
          interests = doc.data().interests;
          mail = doc.data().email;
          name = doc.data().displayName;
        } else {
          const dbUsers = firebase.firestore();
          const { serverTimestamp } = firebase.firestore.FieldValue;
  
          dbUsers.collection("users").doc(user.uid).set({
            email: user.email,
            agbs: false,
            displayName: user.displayName,
            yearOfBirth: "Not yet assiged",
            gender: "Not yet assiged",
            about: "Not yet assiged",
            interests: "Not yet assiged",
            //userImg: imagesRef.fullPath,
            createdAt: serverTimestamp(),
          });
  
          // doc.data() will be undefined in this case
          console.log("No such document!");
        }
      })
      .then(() => {
        profileName.innerHTML = `<h2 class="px-4"  id="displayName">${
          name ?? "You dont have a username"
        }</h1>`;
        profileAge.innerHTML = `<p class="px-5" id="displayName">${
          year ??
          'No Birthyear <button class="rounded btn-dark" onclick="helperToEdit()">assign</button>'
        }</p>`;
        profileMail.innerHTML = ` <p class="px-5" id="email">${mail}</p>`;
        profileInterest.innerHTML = ` <p class="px-5" id="interests">${
          interests ??
          'No Interesst assigned <button class="rounded btn-dark" onclick="helperToEdit()">change</button>'
        }</p>`;
        profileAbout.innerHTML = ` <p class="px-5" id="about">${about}</p>`;
      })
      .catch((error) => {
        console.log("Error getting document:", error);
      });
  
  } else {
    console.log("Not verified", user);
    window.location.assign("email-verification.html");
  }
}

function helperToEdit(){
  changeProfileModel.click();
}