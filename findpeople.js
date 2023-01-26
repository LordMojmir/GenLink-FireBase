const showAllProfilesNav = document.getElementById("showAllProfilesNav");
const showYourFriends = document.getElementById("showYourFriends");
const showPendingRequest = document.getElementById("showPendingRequest");
const showAboutOfProfile = document.getElementById("showAboutOfProfile");
const loadMoreButton = document.getElementById("load-more-button");

let latestDoc = null;

const db = firebase.firestore();

showAllProfilesNav.onclick = () => {
  loadUserProfile();
  loadMoreButton.hidden = false;
};

firebase.auth().onAuthStateChanged(user => {
  if(getParameterByName("showAllProfiles") == "true"){
    displayPendingRequestsForFriendship.innerHTML = "";
    showAllProfilesNav.click();
  }
});


function getParameterByName(name, url = window.location.href) {
  name = name.replace(/[[]]/g, '\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

loadMoreButton.addEventListener("click", () => {
  loadUserProfile();
});

async function loadUserProfile() {
  console.log("Load More Profiles", latestDoc);
  const user = firebase.auth().currentUser;
  if (user.emailVerified || true) {
    let finalResult = ``;
    let i = 0;
    let result = ``;

    let query = db.collection("users").orderBy("createdAt", "desc");
    console.log("Start after:", latestDoc);
    if (latestDoc != null) {
      query = query.startAfter(latestDoc);
    } else {
      query.get().then((querySnapshot) => {
        // code to handle the querySnapshot
        latestDoc = new Date(
          querySnapshot.docs[0].data().createdAt.seconds * 1000 + 1000
        );
        // console.log("",latestDoc);
      });
    }

    let friends = [];
    getYourFriends()
      .then((friendsArray) => {
        friends = friendsArray;
      })
      .catch((error) => {
        console.error(error);
      });

    // const ref = db
    //   .collection("users")
    //   .orderBy("createdAt", "asc")
    //   .startAfter(latestDoc == null ? 0 : latestDoc)
    //   .limit(6);

    query
      .limit(6)
      .get()
      .then(async (querySnapshot) => {
        for (const doc of querySnapshot.docs) {
          latestDoc = new Date(doc.data().createdAt.seconds * 1000);
          console.log("Last doc.id: " + doc.id, doc.data().createdAt.seconds * 1000, doc.data().displayName);
          // console.log(doc.id == user.uid, user.uid, doc.id);
          if (!friends.includes(doc.id) && doc.id != user.uid) {
            var imgURL = "https://www.w3schools.com/howto/img_avatar.png";
            try {
              var storageRef = firebase.storage().ref();
              var avatarRef = storageRef.child(doc.id + "/avatar.jpg");
              const metadata = await avatarRef.getDownloadURL();
              // Metadata now contains the metadata for 'images/forest.jpg'
              imgURL = metadata;
            } catch (error) {}
            // doc.data() is never undefined for query doc snapshots
            //console.log("I", i, doc);
            if (i == 0) {
              result += `<div class="row">`;
            }
            result += displayProfiles(doc, imgURL);

            if (i == querySnapshot.docs.length - 1) {
              result += `</div>`;
            }

            let gender = doc.data().gender;
            imgURL =
              gender == "Male" || gender == "Not Found"
                ? "https://www.w3schools.com/howto/img_avatar.png"
                : "https://www.w3schools.com/howto/img_avatar2.png";

            i++;
            //console.log("Final: ", finalResult);
            displayAreaForYourFriends.innerHTML = "<div></div>";
            peginatorForAllProfiles.hidden = false;
          }
        }
        allProfiles.innerHTML += result;
      });
  } else {
    console.log("Not verified", user);
    window.location.assign("email-verification.html");
  }
}

showYourFriends.onclick = () => {
  loadMoreButton.hidden = true;

  let finalResult = ``;
  let i = 0;
  let result = ``;
  const user = firebase.auth().currentUser;
  var userRef = db.collection("users").doc(user.uid);
  var friends;

  userRef
    .get()
    .then((doc) => {
      if (doc.exists) {
        friends = doc.data().friends;
        db.collection("users")
          .get()
          .then((querySnapshot) => {
            for (const doc of querySnapshot.docs) {
              if (friends.length > 0) {
                if (friends.includes(doc.id)) {
                  var storageRef = firebase.storage().ref();
                  var avatarRef = storageRef.child(doc.id + "/avatar.jpg");
                  var imgURL = "https://www.w3schools.com/howto/img_avatar.png";
                  avatarRef
                    .getDownloadURL()
                    .then((metadata) => {
                      // Metadata now contains the metadata for 'images/forest.jpg'
                      imgURL = metadata;
                      // console.log("Metadata: ", imgURL);
                    })
                    .catch((error) => {
                      //console.log("IMG Error URL: ", imgURL);
                    })
                    .then(() => {
                      if (i == 0) {
                        finalResult += `<div class="row">`;
                      }
                      finalResult += displayProfilesOfFriends(doc, imgURL);
                      if (i == friends.length - 1) {
                        console.log(friends.length);
                        finalResult += `</div>`;
                      }
                      let gender = doc.data().gender;
                      imgURL =
                        gender == "Male" || gender == "Not Found"
                          ? "https://www.w3schools.com/howto/img_avatar.png"
                          : "https://www.w3schools.com/howto/img_avatar2.png";

                      // console.log("Gender: ", gender, imgURL);

                      // console.log("i: ", i);
                      //console.log(doc.id, " => ", doc.data());
                      i++;
                    })
                    .then(() => {
                      //console.log("Final: ", finalResult);

                      // console.log(finalResult);
                      // if (i % 2 == 0) {
                      //   finalResult += "</div>";
                      // }
                      displayAreaForYourFriends.innerHTML = finalResult;
                      allProfiles.innerHTML = "<div></div>";
                    });
                }
              } else {
                displayAreaForYourFriends.innerHTML = `<h1>No Friends yet</h1>`;
              }
            }
          });
      } else {
        console.log("No such document!");
      }
    })
    .catch((error) => {
      console.log("Error getting document:", error);
    });
};

showPendingRequest.onclick = () => {
  loadMoreButton.hidden = true;
  console.log("Show pending request");
  let finalResult = ``;
  let i = 0;
  let result = ``;
  const user = firebase.auth().currentUser;
  var userRef = db.collection("users").doc(user.uid);
  var pending;

  userRef
    .get()
    .then((doc) => {
      if (doc.exists) {
        pending = doc.data().pendingFriendShipRequest;
        db.collection("users")
          .get()
          .then((querySnapshot) => {
            for (const doc of querySnapshot.docs) {
              if (pending != undefined && pending.length > 0) {
                if (pending.includes(doc.id)) {
                  var storageRef = firebase.storage().ref();
                  var avatarRef = storageRef.child(doc.id + "/avatar.jpg");
                  var imgURL = "https://www.w3schools.com/howto/img_avatar.png";
                  avatarRef
                    .getDownloadURL()
                    .then((metadata) => {
                      imgURL = metadata;
                    }).catch((error) => {
                      let gender = doc.data().gender;
                      imgURL =
                        gender == "Male" || gender == "Not Found"
                          ? "https://www.w3schools.com/howto/img_avatar.png"
                          : "https://www.w3schools.com/howto/img_avatar2.png";
                      
                      console.log(error);})
                    .then(() => {
                      
                      if (i == 0) {
                        finalResult += `<div class="row">`;
                      }
                      finalResult += displayPendingRequests(doc, imgURL);
                      if (i == pending.length - 1) {
                        console.log(pending.length);
                        finalResult += `</div>`;
                      }
                      //console.log(doc.id, " => ", doc.data());
                      i++;
                    })
                    .then(() => {
                      displayPendingRequestsForFriendship.innerHTML =
                        finalResult;
                      allProfiles.innerHTML = "<div></div>";
                      displayAreaForYourFriends.innerHTML = "<div></div>";
                    });
                }
              } else {
                displayPendingRequestsForFriendship.innerHTML = `<h1>No pending friend requests</h1>`;
              }
            }
          });
      } else {
        console.log("No such document!");
      }
    })
    .catch((error) => {
      console.log("Error getting document:", error);
    });
};

function displayProfiles(doc, imgURL) {
  let result = ``;

  result += `

        <div class="col-md-6 col-sm-12" id="_${doc.id}">
            <div style="max-height: 50vh;"class="container card m-2" onclick="helperToPressButton('${
              doc.id
            }','${imgURL}')">
                <div class="row">
                    <div class="col-md-3 rounded">
                        <img style="width: 100%; max-height: 13rem;" class="rounded my-2 mx-1"
                            src="${imgURL}"
                            alt="Your Profile IMG">
                    </div>
                    <div class="col-md-9" onclick="showMoreContant()"
                    >                    <div class="container button-container">
                    <div class="row">
                      <div class="col-9">
                        <h2>${doc.data().displayName}</h2>
                        <h5> Geburtsjahr:</h5>
                        <p class="ml-5"> ${doc.data().yearOfBirth}</p>
                      </div>
                      <div class="col-3" style="position: relative">
                        <button class="btn bg-success disabled text-white" onclick="requestFriendShip('${doc.id}')" requestFriendShip_${ doc.id}>Hinzufügen</button>
                        <button type="button" class="btn bg-dark disabled text-white " data-bs-toggle="modal" data-bs-target="#profileOfUserInfo" onclick="displayProfilesDetailed('${doc.id}', '${imgURL}')" id="showMoreAboutPerson-${doc.id}">Info</button>
                      </div>
                    </div>
                    <div class="row">
                      <h5>Interessen:</h5>
                      <p class="ml-5">${doc.data().interests}</p>
                    </div>
                  </div>
                  

                    </div>
                </div>
            </div>
        </div>`;

  return result;
}

function displayProfilesOfFriends(doc, imgURL) {
  let result = ``;

  result += `
                          <div class=" col-md-5  m-1  card">
                                <div class="container ">
                                   <div class="row">
                                        <div class="col-3">
                                            <img src="${imgURL}" alt="IMG"
                                                class=" img-fluid w-100 mx-auto my-3  rounded-circle">
                                        </div>
                                        <div class="col-5">
                                            <h3>${doc.data().displayName}</h3>
                                            <p class="disabled">${
                                              doc.data().interests
                                            }</p>
                                        </div>
                                        <div class="col-4 ">
                                            <Button class="btn bg-danger text-white m-3 mx-2" onclick="removeFriend('${
                                              doc.id
                                            }')">Entfernen</Button> 
                                            <button type="button" class="btn bg-dark text-white m-3 mx-2"
                                                onclick="chatWithPerson('${
                                                  doc.id
                                                }', '${imgURL}')"
                                                id="chatWithPerson-${
                                                  doc.id
                                                }">Unterhaltung</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
        `;

  return result;
}

function displayPendingRequests(doc, imgURL) {
  let result = ``;

  result += `
  <div class=" col-md-5  m-1  card">
  <div class="container ">
     <div class="row">
          <div class="col-3">
              <img src="${imgURL}" alt="IMG"
                  class=" img-fluid w-100 mx-auto my-3  rounded-circle">
          </div>
          <div class="col-6">
              <h3>${doc.data().displayName}</h3>
              <p class="disabled">${doc.data().interests}</p>
          </div>
          <div class="col-3 ">
             <Button class="btn bg-dark text-white my-3 mx-auto" onclick="rejectFriendShipRequest('${
               doc.id
             }')"><img style="width: 2rem"  id="rejectFriendRequest-${doc.id}"
              src="https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/325/cross-mark_274c.png"
              alt="" srcset=""></Button> 
              <Button class="btn bg-dark text-white mb-3 mx-auto" onclick="acceptFriendShipRequest('${
                doc.id
              }')"><img style="width: 2rem"  id="rejectFriendRequest-${doc.id}"
               src="https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/325/check-mark-button_2705.png"
               alt="" srcset=""></Button> 
          </div>
      </div>
  </div>
</div>
        `;

  return result;
}

function displayProfilesDetailed(docID, imgURL) {
  let result = ``;
  console.log(docID, imgURL);

  var docRef = db.collection("users").doc(docID);
  docRef
    .get()
    .then((doc) => {
      result += `
      <div class="modal-header">
                        <h1 class="modal-title fs-5" id="staticBackdropLabel">
                            ${doc.data().displayName}
                        </h1>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>

                        <div class="modal-body">
                        <div class="container">
                            <div class="card">
                                <div class="row">
                                    <div class="col-md-3 col-sm-12">
                                        <img style="  max-width: 100%;
                                        max-height: auto;" class=" mx-auto rounded"
                                            src="${imgURL}" alt="Your Profile IMG">
                                    </div>
                                    <div class="col-md-4 col-sm-12">
                                        <div class="container">
                                            <div class="row">
                                                <div class="col-10">
                                                    <h5>Geburtsjahr:</h5>
                                                    <p class="ml-5"> ${
                                                      doc.data().yearOfBirth
                                                    }</p>
                                                </div>
                                            </div>
                                            <div class="row">
                                                <h5>Interessen:</h5>
                                                <p class="ml-5">${
                                                  doc.data().interests
                                                }</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-5 col-sm-12">
                                        <h5>Über: </h5>
                                        <p class="ml-5">${doc.data().about}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <!--<Button class="btn bg-success text-white m-1" onclick="addFriend('${
                              doc.id
                            }')" addFriend_${doc.id}>Anfrage</Button> -->
                            <Button class="btn bg-success text-white m-1" onclick="requestFriendShip('${
                              doc.id
                            }')" requestFriendShip_${doc.id}>Anfrage</Button>
                        </div>
                      </div>
                      </div>    
      `;
      modalDetailed.innerHTML = result;
      return result;
    })
    .catch((error) => {
      console.log("Error getting document:", error);
    });
}

function helperToPressButton(docID, imgURL) {
  // console.log("DocID",docID,imgURL);
  document.getElementById("showMoreAboutPerson-" + docID).click();
}

function addFriend(whoToAddID) {
  const user = firebase.auth().currentUser;

  // Get a reference to the current user's document
  var userRef = db.collection("users").doc(user.uid);

  // Get the current value of the friends array
  userRef.get().then((doc) => {
    //console.log("Who am I: ", user.uid);
    if (doc.exists) {
      // Add the new UID to the existing friends array
      if (doc.data().friends != undefined) {
        var friends = doc.data().friends;
        if (!friends.includes(whoToAddID) && whoToAddID != user.uid) {
          friends.push(whoToAddID);
          userRef.update({
            friends: friends,
          });
        }
      } else {
        userRef.update({
          friends: [],
        });
        userRef.update({
          friends: firebase.firestore.FieldValue.arrayUnion(whoToAddID),
        });
      }
      // Update the friends field with the new array
    } else {
      console.log("User not found");
    }
  });
}

let isOpen = 0;
function openNav() {
  isOpen++;
  navForOptionsInFindPeople.hidden = isOpen % 2 == 0;
}

function removeFriend(docID) {
  const user = firebase.auth().currentUser;

  var docRef = db.collection("users").doc(user.uid);

  docRef
    .get()
    .then((doc) => {
      if (doc.exists) {
        friends = doc.data().friends;
        // console.log(friends);
        if (friends.length > 0) {
          for (let i = friends.length - 1; i >= 0; i--) {
            if (friends[i] == docID) {
              console.log(friends[i], "==", docID);

              friends.splice(i, 1);
              docRef.update({
                friends: friends,
              });
            }
          }
        }
        console.log("Document data:", doc.data());
      } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
      }
    })
    .then(() => {
      document.getElementById("showYourFriends").click();
    })
    .catch((error) => {
      console.log("Error getting document:", error);
    });
}

function requestFriendShip(toUserID) {
  const user = firebase.auth().currentUser;
  var fromUserRef = db.collection("users").doc(user.uid);
  var toUserRef = db.collection("users").doc(toUserID);

  console.log("From:", user.uid, "To:", toUserID);

  fromUserRef.get().then((doc) => {
    toUserRef.get().then((docTo) => {
      console.log("I am here");
      if (doc.exists && docTo.exists) {
        let requestFriendShipArray = doc.data().requestFriendShip;
        //console.log("requestFriendShip Array",requestFriendShipArray, toUserID);
        if (requestFriendShipArray != undefined) {
          if (!requestFriendShipArray.includes(toUserID)) {
            //console.log(!doc.data().friends.includes(toUserID));
            let pendingFriendShipRequestArray =
              docTo.data().pendingFriendShipRequest;
            console.log(pendingFriendShipRequestArray, toUserID);
            if (pendingFriendShipRequestArray != undefined) {
              console.log("Pending != undefiend");
              if (!docTo.data().pendingFriendShipRequest.includes(user.uid)) {
                toUserRef.update({
                  pendingFriendShipRequest:
                    firebase.firestore.FieldValue.arrayUnion(user.uid),
                });
              } else {
                console.log("Allready pending");
              }
            } else {
              console.log("To user added Array of pendingFriendShipRequest");
              toUserRef.update({
                pendingFriendShipRequest: [user.uid],
              });
            }
            fromUserRef.update({
              requestFriendShip:
                firebase.firestore.FieldValue.arrayUnion(toUserID),
            });
          }
        } else {
          fromUserRef.update({
            requestFriendShip:
              firebase.firestore.FieldValue.arrayUnion(toUserID),
          });

          let pendingFriendShipRequestArray =
            docTo.data().pendingFriendShipRequest;
          console.log(pendingFriendShipRequestArray, toUserID);
          if (pendingFriendShipRequestArray != undefined) {
            if (!docTo.data().pendingFriendShipRequest.includes(user.uid)) {
              toUserRef.update({
                pendingFriendShipRequest:
                  firebase.firestore.FieldValue.arrayUnion(user.uid),
              });
            } else {
              console.log("Allready pending");
            }
          } else {
            toUserRef.update({
              pendingFriendShipRequest: [user.uid],
            });
          }
        }
      }
    });
  });
}

function rejectFriendShipRequest(toUserID) {
  const user = firebase.auth().currentUser;
  var rejecterRef = db.collection("users").doc(user.uid); // I reject the request
  var getsRejectedRef = db.collection("users").doc(toUserID); // I send the request

  console.log("From:", user.uid, "To:", toUserID);

  rejecterRef
    .get()
    .then((doc) => {
      let allPendingRequests = doc.data().pendingFriendShipRequest;

      console.log("Alle Pending on: ", user.uid, toUserID, allPendingRequests);

      for (let i = allPendingRequests.length - 1; i >= 0; i--) {
        if (allPendingRequests[i] == toUserID) {
          console.log(user.uid, allPendingRequests);
          allPendingRequests.splice(i, 1);
          console.log(user.uid, allPendingRequests);
          rejecterRef.update({
            requestFriendShip: allPendingRequests,
          });
        }
      }

      console.log("Alle Pending on: ", user.uid, allPendingRequests);
    })
    .then(() => {
      getsRejectedRef.get().then((docTo) => {
        let allRequestedData = docTo.data().requestFriendShip;
        for (let i = allRequestedData.length - 1; i >= 0; i--) {
          if (allRequestedData[i] == user.uid) {
            console.log(toUserID, allRequestedData);
            allRequestedData.splice(i, 1);
            console.log(
              "Updatign requests on the rejecters side",
              toUserID,
              allRequestedData
            );
            getsRejectedRef.update({
              requestFriendShip: allRequestedData,
            });
          }
        }
        console.log("Alle Requested on: ", toUserID, allRequestedData);
      });
      document.getElementById("showPendingRequest").click();
    });
}

function acceptFriendShipRequest(toUserID) {
  const user = firebase.auth().currentUser;
  var rejecterRef = db.collection("users").doc(user.uid); // I accpet the request
  var getsRejectedRef = db.collection("users").doc(toUserID); // I send the request

  console.log("From:", user.uid, "To:", toUserID);

  rejecterRef
    .get()
    .then((doc) => {
      getsRejectedRef.get().then((docTo) => {
        let friendsArrayDoc = doc.data().friends;
        let friendsArrayDocTo = docTo.data().friends;

        if (friendsArrayDoc != undefined) {
          if (friendsArrayDoc.length > 0) {
            rejecterRef.update({
              friends: firebase.firestore.FieldValue.arrayUnion(toUserID),
            });
          }
        } else {
          rejecterRef.update({
            friends: [toUserID],
          });
        }
        if (friendsArrayDocTo != undefined) {
          if (friendsArrayDocTo.length > 0) {
            getsRejectedRef.update({
              friends: firebase.firestore.FieldValue.arrayUnion(user.uid),
            });
          }
        } else {
          getsRejectedRef.update({
            friends: [user.uid],
          });
        }
        // getsRejectedRef.update({
        //   friends: firebase.firestore.FieldValue.arrayUnion(user.uid)
        // });

        let allPendingRequests = doc.data().pendingFriendShipRequest;

        console.log("Alle Pending on: ", user.uid, allPendingRequests);

        for (let i = allPendingRequests.length - 1; i >= 0; i--) {
          if (allPendingRequests[i] == toUserID) {
            console.log(user.uid, allPendingRequests);
            allPendingRequests.splice(i, 1);
            console.log(user.uid, allPendingRequests);
            rejecterRef.update({
              pendingFriendShipRequest: allPendingRequests,
            });
          }
        }

        let allRequestedData = docTo.data().requestFriendShip;
        console.log("Alle Pending on: ", user.uid, allPendingRequests);
        console.log("Alle Requested on: ", toUserID, allRequestedData);
        for (let i = allRequestedData.length - 1; i >= 0; i--) {
          if (allRequestedData[i] == toUserID) {
            console.log(toUserID, allRequestedData);
            allRequestedData.splice(i, 1);
            console.log(toUserID, allRequestedData);
            getsRejectedRef.update({
              requestFriendShipRequest: allRequestedData,
            });
          }
        }
      });
    })
    .then(() => {
      //document.getElementById("showPendingRequest").click();
    });
}

function getYourFriends() {
  const user = firebase.auth().currentUser;

  var userRef = db.collection("users").doc(user.uid);
  var friends;

  return new Promise((resolve, reject) => {
    userRef
      .get()
      .then((doc) => {
        if (doc.exists) {
          friends = doc.data().friends;
        }
        if (friends.length > 0) {
          resolve(friends);
        } else {
          resolve(null);
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function chatWithPerson(userUID) {
  window.location.href = "chat.html";
}
