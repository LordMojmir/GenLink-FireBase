const db = firebase.firestore();
//const messagesRef = db.ref("messages");
const sendMessageButton = document.getElementById("sendMessageButton");
const messageInputFromChat = document.getElementById("message-input");

let currentToUserUID;
let currentlyDisplayingMessages = [];

document.onkeyup = (event) => {
  // If the user presses the "Enter" key on the keyboard
  if (event.key === "Enter") {
    // Cancel the default action, if needed
    event.preventDefault();
    // Trigger the button element with a click
    document.getElementById("sendMessageButton").click();
  }
};

sendMessageButton.onclick = () => {
  if (
    messageInputFromChat.value != "" &&
    messageInputFromChat.value != undefined &&
    messageInputFromChat.value != null
  ) {
    const user = firebase.auth().currentUser;
    const { serverTimestamp } = firebase.firestore.FieldValue;
    const now = new Date();

    let message = {
      date: serverTimestamp(),
      timestampField: now,
      sender: user.uid,
      content: messageInputFromChat.value,
    };

    // Get a reference to the chat document with the matching userOne and userTwo values
    let chatRef = db
      .collection(`chats`)
      .where("userOne", "==", getAlphaFirst(user.uid, currentToUserUID))
      .where("userTwo", "==", getAlphaSecond(user.uid, currentToUserUID))
      .limit(1)
      .get()
      .then((snapshot) => {
        console.log("Snapshot: " + snapshot.id);
        // Get the chat document from the snapshot
        let chatDoc = snapshot.docs[0];
        // Get a reference to the messages subcollection of the chat document
        let messagesRef = chatDoc.ref.collection("messages");
        // Add the message to the messages subcollection
        messagesRef.add(message).then((doc) => {
          // Retrieve the document data
          doc.get().then((docData) => {
            const when = docData.data().date;
            const timeString = when
              .toDate()
              .toLocaleTimeString("de-DE", {
                hour: "numeric",
                minute: "numeric",
              });
            const dateString = when
              .toDate()
              .toLocaleDateString("en-GB", {
                month: "2-digit",
                day: "2-digit",
              });
            const createdAtString = `${timeString} ${dateString}`;
            sentMessageDisplay(docData.data().content, createdAtString);
          });
        });
      }).then(() => {
        let messageInput = document.querySelector("#message-input");
        messageInput.value = "";
      });
  }else{
    console.log("No messages");
  }
};

function createChat(toUID, fromUID) {
  var chatRef = db.collection(`chats`).doc();
  const messagesRef = chatRef.collection("messages");
  const { serverTimestamp } = firebase.firestore.FieldValue;
  console.log(
    "User One",
    toUID.localeCompare(fromUID) < 0 ? toUID : fromUID,
    "User Two: ",
    toUID.localeCompare(fromUID) > 0 ? toUID : fromUID
  );

  console.log(
    chatRef.set(
      {
        createdAt: serverTimestamp(),
        //usersRef: [toUID, fromUID],
        userOne: getAlphaFirst(toUID, fromUID),
        userTwo: getAlphaSecond(toUID, fromUID),
      },
      { merge: true }
    )
  );
  messagesRef.add({});
}

function getAlphaFirst(toUID, fromUID) {
  return toUID.localeCompare(fromUID) < 0 ? toUID.trim() : fromUID.trim();
}

function getAlphaSecond(toUID, fromUID) {
  return toUID.localeCompare(fromUID) > 0 ? toUID.trim() : fromUID.trim();
}

function hasAChat(withUID) {
  const user = firebase.auth().currentUser;

  db.collection(`chats`)
    .where("userOne", "==", getAlphaFirst(user.uid, withUID))
    .where("userTwo", "==", getAlphaSecond(user.uid, withUID))
    .get()
    .then((snapshot) => {
      if (!snapshot.empty) {
        console.log("Creating Chat 1.");
        return true;
      } else {
        console.log("Creating Chat");
        createChat(user.uid, withUID);
        return false;
      }
    });
}

// function findAllYourMessages(fromUID) {
//   if (hasAChat(fromUID)) {
//     console.log("Has a chat");
//   } else {
//     console.log("Has no chat");
//   }
//   console.log("FromUID: ", fromUID);
//   const user = firebase.auth().currentUser;

//   if (currentToUserUID != fromUID) {
//     currentlyDisplayingMessages = [];
//     currentToUserUID = fromUID;
//   }
//   openNav();

//   db.collection("chats")
//     .where("userOne", "==", getAlphaFirst(user.uid, fromUID))
//     .where("userTwo", "==", getAlphaSecond(user.uid, fromUID))
//     .get()
//     .then((snapshot) => {
//       if (snapshot != undefined) {
//         snapshot.forEach((doc) => {
//           if (doc.exists) {
//             messageDisplay.innerHTML = `<div></div>`

//             // Get the messages subcollection of the chat
//             const messagesRef = doc.ref.collection("messages");
//             // Retrieve the messages from the subcollection, ordered by the 'timestampField' field
//             messagesRef
//               .orderBy("timestampField")
//               .get()
//               .then((messagesSnapshot) => {
//                 // Iterate through the messages and display them on the page
//                 messagesSnapshot.forEach((messageDoc) => {
//                   console.log(messageDoc.id, "=>", messageDoc.data());
//                   if (!currentlyDisplayingMessages.includes(messageDoc.id)) {
//                     currentlyDisplayingMessages.push(messageDoc.id);
//                     displayMessage(
//                       messageDoc.data().content,
//                       messageDoc.data().sender,
//                       messageDoc.data().date
//                     );
//                   }
//                 });
//               });
//           } else {
//             console.log("No chat found");
//           }
//         });
//       } else {
//         console.log("No chat found");
//       }
//     })
//     .then(() => {})
//     .catch((error) => {
//       console.log("Error getting chats: ", error);
//     });
// }

function displayMessage(message, fromUID, when) {
  if (when == null || when == undefined) {
    return; // Return early if when is null or undefined
  }
  console.log("Message", message, "From: ", fromUID, "When: ", when);
  const user = firebase.auth().currentUser;
  // Format the createdAt value using toLocaleTimeString and toLocaleDateString
  const timeString = when
    .toDate()
    .toLocaleTimeString("de-DE", { hour: "numeric", minute: "numeric" });
  const dateString = when
    .toDate()
    .toLocaleDateString("en-GB", { month: "2-digit", day: "2-digit" });
  const createdAtString = `${timeString} ${dateString}`;

  if (fromUID == user.uid) {
    sentMessageDisplay(message, createdAtString);
  } else if (fromUID != user.uid) {
    recievedMessageDisplay(message, createdAtString);
  }
}

function recievedMessageDisplay(message, createdAtString) {
  const result = `<div class="row mb-3 mx-1">
  <div class="col-9 border rounded-2 p-1 bg-secondary text-white">
      <div class="container">
          <div class="row ">
              <p> ${message}</p>
          </div>
          <div class="row">
              <div class="col-12 text-end">
              ${createdAtString}
              </div>
          </div>
      </div>
  </div>
</div>`;

  const parent = document.getElementById("messageDisplay");
  const newDiv = document.createElement("div");
  newDiv.innerHTML = result;
  parent.appendChild(newDiv);
  parent.parentNode.scrollTop = parent.parentNode.scrollHeight;
}

function sentMessageDisplay(message, createdAtString) {
  const result = ` <div class="row  mx-1 mb-3">
  <div class="offset-3 col-9 border rounded-2 p-1 bg-primary text-white">
      <div class="container">
          <div class="row ">
              <p> ${message}</p>
          </div>
          <div class="row">
              <div class="col-12 text-end">
              ${createdAtString}
              </div>
          </div>
      </div>
  </div>
</div>`;

  const parent = document.getElementById("messageDisplay");
  const newDiv = document.createElement("div");
  newDiv.innerHTML = result;
  parent.appendChild(newDiv);
  parent.parentNode.scrollTop = parent.parentNode.scrollHeight;
}

document.addEventListener("DOMContentLoaded", function () {
  const miniNavForContacts = document.getElementById("miniNavForContacts");
  miniNavForContacts.click();
});

const auth = firebase.auth();

auth.onAuthStateChanged((user) => {
  if (user) {
    ///try
    findAllYourChats();
    console.log("User signed in", user.uid);
    whenSignedIn.hidden = false;
    whenSignedOut.hidden = true;
    signInBtn.hidden = true;
    registerBTN.hidden = true;
    userName.innerHTML = `${user.displayName ?? user.email}`;


    //   profile.innerHTML = `
    //   <h1 id="displayName">${user.displayName ?? 'You dont have a username'}</h1>
    // <img id="photoURL" src="${user.photoURL}" alt="Profile picture">
    // <p id="email">${user.email}</p>`;
  } else {
    console.log("User npt signed in");

    // not signed in
    whenSignedIn.hidden = true;
    whenSignedOut.hidden = false;
    signOutBtn.hidden = true;
    profile.innerHTML = "";
  }
});

let isOpen = 0;
function openNav() {
  headerForProfile.innerHTML = "";
  isOpen++;
  displayAreaForAllYourContacts.hidden = isOpen % 2 == 0;
}

function findAllYourChats() {
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
        if (friends != undefined) {
          db.collection("users")
            .get()
            .then((querySnapshot) => {
              for (const doc of querySnapshot.docs) {
                if (friends.length > 0) {
                  if (friends.includes(doc.id)) {
                    var storageRef = firebase.storage().ref();
                    var avatarRef = storageRef.child(doc.id + "/avatar.jpg");
                    var imgURL =
                      "https://www.w3schools.com/howto/img_avatar.png";
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
                        finalResult += displayProfilesOfFriends(
                          doc,
                          "Hello",
                          imgURL
                        );
                        if (i == friends.length - 1) {
                          console.log(friends.length);
                          finalResult += `</div>`;
                        }

                        let gender = doc.data().gender;
                        imgURL =
                          gender == "Male" || gender == "Not Found"
                            ? "https://www.w3schools.com/howto/img_avatar.png"
                            : "https://www.w3schools.com/howto/img_avatar2.png";

                        i++;
                      })
                      .then(() => {
                        displayAreaForAllYourContacts.innerHTML = finalResult;
                      });
                  }
                } else {
                  displayAreaForAllYourContacts.innerHTML = `<h1>No Friends yet</h1>`;
                }
              }
            });
        } else {
          displayAreaForAllYourContacts.innerHTML = `<h1>No Friends yet</h1><p>You have to add Friends first to chat with someone</p>`;
        }
      }
    })
    .catch((error) => {
      console.log("Error getting document:", error);
    });
}

function displayProfilesOfFriends(doc, lastMessage, imgURL) {
  let result = ``;

  result += `
                          <div class=" col-md-12  m-1 card">
                                <div class="container" onclick="findAllYourMessages('${
                                  doc.id}', '${imgURL}','${doc.data().displayName
                                }')">
                                   <div class="row">
                                        <div class="col-4">
                                            <img src="${imgURL}" alt="IMG" style="width: 5rem; height: auto; max-height: 5rem;)"
                                                class="  mx-auto my-3  rounded-circle">
                                        </div>
                                        <div class="col-8 ">
                                            <h3">${doc.data().displayName}</h3>
                                            <div>
                                            <p class="disabled"><small>${lastMessage}</small></p></div>
                                        </div>
                      
                                    </div>
                                </div>
                            </div>
        `;

  return result;
}

function generateHeaderWithNameAndIMG(name, imgURL) {
  let result = ``;
  
console.log("Generating header");
  result += `<div class=" col-md-12  m-1 card">
<div class="container">
   <div class="row">
        <div class="col-3">
            <img src="${imgURL}" alt="IMG" style="width: 3rem; height: auto; max-height: 3rem;)" class="  mx-auto my-3  rounded-circle">
        </div>
        <div class="col-6 d-flex align-items-center">
            <h3 style="font-size: 2.5rem" >${name.split(' ')[0]}
          <div>
        </h3></div>
        <div class="col-1 offset-1 d-flex align-items-center">
        <span style="font-size: 24px; color: #00C2CB;">
        <i class="fa-solid fa-phone"></i>          </span>

        </div>
    </div>
</div>
</div>`;

   return result;
}

function findAllYourMessages(fromUID, imgURL, name) {
  if (hasAChat(fromUID)) {
    console.log("Has a chat");
  } else {
    console.log("Has no chat");
  }
  // console.log("FromUID: ", fromUID);
  const user = firebase.auth().currentUser;
  if (currentToUserUID != fromUID) {
    messageDisplay.innerHTML = "";
    currentlyDisplayingMessages = [];
    currentToUserUID = fromUID;
  }
  openNav();
  headerForProfile.innerHTML = generateHeaderWithNameAndIMG(name,imgURL);


  db.collection("chats")
    .where("userOne", "==", getAlphaFirst(user.uid, fromUID))
    .where("userTwo", "==", getAlphaSecond(user.uid, fromUID))
    .get()
    .then((snapshot) => {
      if (snapshot != undefined) {
        snapshot.forEach((doc) => {
          if (doc.exists) {
            // Get the messages subcollection of the chat
            const messagesRef = doc.ref.collection("messages");
            // Retrieve the messages from the subcollection, ordered by the 'timestampField' field
            messagesRef
              .orderBy("timestampField")
              .onSnapshot((messagesSnapshot) => {
                // Iterate through the messages and log them to the console
                messagesSnapshot.forEach((messageDoc) => {
                  console.log(messageDoc.id, "=>", messageDoc.data());
                  if (!currentlyDisplayingMessages.includes(messageDoc.id)) {
                    currentlyDisplayingMessages.push(messageDoc.id);
                    displayMessage(
                      messageDoc.data().content,
                      messageDoc.data().sender,
                      messageDoc.data().date
                    );
                  }
                });
              });
          } else {
            console.log("No chat found");
          }
        });
      } else {
        console.log("No chat found");
      }
    })
    .catch(() => {
      console.log("No snapshot");
      console.log("Error getting chats: ", error);

    })
  }
