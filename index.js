/* === Imports === */

/* === Firebase Setup === */
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";

import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBa3edtskjIiD4hWCPy7vNnAM3_2Q3NL3Y",
  authDomain: "moody-thoughts.firebaseapp.com",
  projectId: "moody-thoughts",
  storageBucket: "moody-thoughts.appspot.com",
  messagingSenderId: "142703909792",
  appId: "1:142703909792:web:bfe1b63a3c0c779defe2c5",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);
// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

/* === UI === */

/* == UI - Elements == */

const viewLoggedOut = document.getElementById("logged-out-view");
const viewLoggedIn = document.getElementById("logged-in-view");

const signInWithGoogleButtonEl = document.getElementById(
  "sign-in-with-google-btn"
);

const emailInputEl = document.getElementById("email-input");
const passwordInputEl = document.getElementById("password-input");

const signInButtonEl = document.getElementById("sign-in-btn");
const createAccountButtonEl = document.getElementById("create-account-btn");
const signOutButtonEl = document.getElementById("sign-out-btn");
const userProfilePictureEl = document.getElementById("user-profile-picture");
const userGreetingEl = document.getElementById("user-greeting");
const displayNameInputEl = document.getElementById("display-name-input");
const photoURLInputEl = document.getElementById("photo-url-input");
const updateProfileButtonEl = document.getElementById("update-profile-btn");
const moodEmojiEls = document.getElementsByClassName("mood-emoji-btn");
const textareaEl = document.getElementById("post-input");
const postButtonEl = document.getElementById("post-btn");
const fetchPostsButtonEl = document.getElementById("fetch-posts-btn");
const allFilterButtonEl = document.getElementById("all-filter-btn");

const filterButtonEls = document.getElementsByClassName("filter-btn");
const postsEl = document.getElementById("posts");
/* == UI - Event Listeners == */

signInWithGoogleButtonEl.addEventListener("click", authSignInWithGoogle);

signInButtonEl.addEventListener("click", authSignInWithEmail);
createAccountButtonEl.addEventListener("click", authCreateAccountWithEmail);
signOutButtonEl.addEventListener("click", authSignOut);
updateProfileButtonEl.addEventListener("click", authUpdateProfile);

for (let moodEmojiEl of moodEmojiEls) {
  moodEmojiEl.addEventListener("click", selectMood);
}
for (let filterButtonEl of filterButtonEls) {
  filterButtonEl.addEventListener("click", selectFilter);
}
postButtonEl.addEventListener("click", postButtonPressed);
fetchPostsButtonEl.addEventListener("click", fetchOnceAndRenderPostsFromDB);
/* === State === */

let moodState = 0;
/* === Global Constants === */

const collectionName = "posts";
/* === Main Code === */

onAuthStateChanged(auth, (user) => {
  if (user) {
    showLoggedInView();
    showProfilePicture(userProfilePictureEl, user);
    showUserGreeting(userGreetingEl, user);
    updateFilterButtonStyle(allFilterButtonEl);
    fetchAllPosts(user);
  } else {
    showLoggedOutView();
  }
});

const provider = new GoogleAuthProvider();
/* === Functions === */

/* = Functions - UI Functions - Mood = */

function selectMood(event) {
  const selectedMoodEmojiElementId = event.currentTarget.id;

  changeMoodsStyleAfterSelection(selectedMoodEmojiElementId, moodEmojiEls);

  const chosenMoodValue = returnMoodValueFromElementId(
    selectedMoodEmojiElementId
  );

  moodState = chosenMoodValue;
}

function changeMoodsStyleAfterSelection(
  selectedMoodElementId,
  allMoodElements
) {
  for (let moodEmojiEl of allMoodElements) {
    if (selectedMoodElementId === moodEmojiEl.id) {
      moodEmojiEl.classList.remove("unselected-emoji");
      moodEmojiEl.classList.add("selected-emoji");
    } else {
      moodEmojiEl.classList.remove("selected-emoji");
      moodEmojiEl.classList.add("unselected-emoji");
    }
  }
}

function resetAllMoodElements(allMoodElements) {
  for (let moodEmojiEl of allMoodElements) {
    moodEmojiEl.classList.remove("selected-emoji");
    moodEmojiEl.classList.remove("unselected-emoji");
  }

  moodState = 0;
}

function returnMoodValueFromElementId(elementId) {
  return Number(elementId.slice(5));
}
/* = Functions - Firebase - Authentication = */

function authSignInWithGoogle() {
  signInWithPopup(auth, provider)
    .then((result) => {
      console.log(`Signed In with Google:` + result);
    })
    .catch((error) => {
      console.error(error.message);
    });
}

function authSignInWithEmail() {
  const email = emailInputEl.value;
  const password = passwordInputEl.value;
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in

      clearAuthFields();
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error(errorMessage);
    });
}

function authCreateAccountWithEmail() {
  const email = emailInputEl.value;
  const password = passwordInputEl.value;

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed up
      clearAuthFields();
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error(`${errorCode}, ${errorMessage}`);
    });
}

function authSignOut() {
  const auth = getAuth();
  signOut(auth)
    .then(() => {})
    .catch((error) => {
      console.error(error.message);
    });
}

/* == Functions - UI Functions == */

function showLoggedOutView() {
  hideElement(viewLoggedIn);
  showElement(viewLoggedOut);
}

function showLoggedInView() {
  hideElement(viewLoggedOut);
  showElement(viewLoggedIn);
}

function showElement(element) {
  element.style.display = "flex";
}

function hideElement(element) {
  element.style.display = "none";
}
function clearInputField(field) {
  field.value = "";
}

function clearAuthFields() {
  clearInputField(emailInputEl);
  clearInputField(passwordInputEl);
}
function showProfilePicture(imgElement, user) {
  if (user !== null) {
    const photoURL = user.photoURL;
    if (photoURL) {
      imgElement.src = photoURL;
    } else {
      imgElement.src = `https://filedn.com/looI2qtaPNN7Rrmh1sfNheH/assets/icons/default-user.png`;
    }
  }
}
function showUserGreeting(element, user) {
  const displayName = user.displayName;
  element.textContent = `Hey ${
    displayName ? displayName.split(" ")[0] : "firend"
  }, how are you?`;
}

function authUpdateProfile() {
  const user = auth.currentUser;
  updateProfile(user, {
    displayName: displayNameInputEl.value
      ? displayNameInputEl.value
      : user.displayName,
    photoURL: photoURLInputEl.value ? photoURLInputEl.value : user.photoURL,
  })
    .then(() => {
      showProfilePicture(userProfilePictureEl, user);
      showUserGreeting(userGreetingEl, user);
      clearInputField(displayNameInputEl);
      clearInputField(photoURLInputEl);
    })
    .catch((error) => {
      console.error(error.message);
    });
}
function postButtonPressed() {
  const postBody = textareaEl.value;
  const user = auth.currentUser;
  if (postBody && moodState) {
    addPostToDB(postBody, user);
    clearInputField(textareaEl);
    resetAllMoodElements(moodEmojiEls);
  }
}
/* = Functions - Firebase - Cloud Firestore = */
async function addPostToDB(postBody, user) {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      body: postBody,
      uid: user.uid,
      createdAt: serverTimestamp(),
      mood: moodState,
    });
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e.message);
  }
}
async function updatePostInDB(docId, newBody) {
  const docRef = doc(db, collectionName, docId);
  await updateDoc(docRef, {
    body: newBody,
  });
}

async function deletePostFromDB(docId) {
  await deleteDoc(doc(db, collectionName, docId));
}

function fetchTodayPosts(user) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const postsRef = collection(db, collectionName);

  const q = query(
    postsRef,
    where("uid", "==", user.uid),
    where("createdAt", ">=", startOfDay),
    where("createdAt", "<=", endOfDay),
    orderBy("createdAt")
  );

  fetchInRealtimeAndRenderPostsFromDB(q);
}

function fetchWeekPosts(user) {
  const startOfWeek = new Date();
  startOfWeek.setHours(0, 0, 0, 0);

  if (startOfWeek.getDay() === 0) {
    // If today is Sunday
    startOfWeek.setDate(startOfWeek.getDate() - 6); // Go to previous Monday
  } else {
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
  }
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const postsRef = collection(db, collectionName);

  const q = query(
    postsRef,
    where("uid", "==", user.uid),
    where("createdAt", ">=", startOfWeek),
    where("createdAt", "<=", endOfDay),
    orderBy("createdAt")
  );

  fetchInRealtimeAndRenderPostsFromDB(q);
}

function fetchMonthPosts(user) {
  const startOfMonth = new Date();
  startOfMonth.setHours(0, 0, 0, 0);
  startOfMonth.setDate(1);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const postsRef = collection(db, collectionName);

  const q = query(
    postsRef,
    where("uid", "==", user.uid),
    where("createdAt", ">=", startOfMonth),
    where("createdAt", "<=", endOfDay),
    orderBy("createdAt")
  );

  fetchInRealtimeAndRenderPostsFromDB(q);
}
function fetchAllPosts(user) {
  const postsRef = collection(db, collectionName);
  const q = query(postsRef, where("uid", "==", user.uid), orderBy("createdAt"));
  fetchInRealtimeAndRenderPostsFromDB(q);
}

function replaceNewlinesWithBrTags(inputString) {
  return inputString.replaceAll("\n", "<br>");
}

function convertMoodNoToString(moodNo) {
  return moodNo == 1
    ? "awful"
    : moodNo == 2
    ? "bad"
    : moodNo == 3
    ? "meh"
    : moodNo == 4
    ? "good"
    : moodNo == 5
    ? "amazing"
    : "";
}

async function fetchOnceAndRenderPostsFromDB() {
  const postsRef = collection(db, collectionName);
  const q = query(
    postsRef,
    where("uid", "==", auth.currentUser.uid),
    orderBy("createdAt")
  );

  const querySnapshot = await getDocs(q);
  postsEl.innerHTML = "";
  querySnapshot.forEach(renderPost);
}
function fetchInRealtimeAndRenderPostsFromDB(q) {
  onSnapshot(q, (querySnapshot) => {
    postsEl.innerHTML = "";
    querySnapshot.forEach(renderPost);
  });
}

function createPostUpdateButton(data) {
  const postId = data.id;
  const postData = data.data();

  const button = document.createElement("button");
  button.textContent = "Edit";
  button.classList.add("edit-color");
  button.addEventListener("click", function () {
    const newBody = prompt("Edit the post", postData.body);

    if (newBody) {
      updatePostInDB(postId, newBody);
    }
  });

  return button;
}

function createPostDeleteButton(data) {
  const postId = data.id;
  const button = document.createElement("button");
  button.textContent = "Delete";
  button.classList.add("delete-color");
  button.addEventListener("click", function () {
    deletePostFromDB(postId);
  });
  return button;
}

function createPostFooter(data) {
  const footerDiv = document.createElement("div");
  footerDiv.className = "footer";

  footerDiv.appendChild(createPostUpdateButton(data));
  footerDiv.appendChild(createPostDeleteButton(data));

  return footerDiv;
}

function renderPost(data) {
  const postDiv = document.createElement("div");
  postDiv.className = "post";

  const headerDiv = document.createElement("div");
  headerDiv.className = "header";

  const headerDate = document.createElement("h3");
  headerDate.textContent = displayDate(data.data().createdAt);

  const moodImage = document.createElement("img");
  moodImage.src = `https://assets.subarnab.in/icons/${convertMoodNoToString(
    data.data().mood
  )}.avif`;

  headerDiv.appendChild(headerDate);
  headerDiv.appendChild(moodImage);

  const postData = document.createElement("p");
  postData.innerHTML = replaceNewlinesWithBrTags(data.data().body);

  postDiv.appendChild(headerDiv);
  postDiv.appendChild(postData);
  postDiv.appendChild(createPostFooter(data));

  postsEl.appendChild(postDiv);
}

function displayDate(firebaseDate) {
  if (!firebaseDate) {
    return "Just Now";
  }
  const locale = navigator.language;
  const date = firebaseDate.toDate();
  const options = {
    hour: "numeric",
    minute: "numeric",
    day: "numeric",
    month: "short",
    year: "numeric",
  };

  return new Intl.DateTimeFormat(locale, options).format(date);
}
/* == Functions - UI Functions - Date Filters == */

function resetAllFilterButtons(allFilterButtons) {
  for (let filterButtonEl of allFilterButtons) {
    filterButtonEl.classList.remove("selected-filter");
  }
}

function updateFilterButtonStyle(element) {
  element.classList.add("selected-filter");
}

function selectFilter(event) {
  const user = auth.currentUser;

  const selectedFilterElementId = event.target.id;

  const selectedFilterPeriod = selectedFilterElementId.split("-")[0];

  const selectedFilterElement = document.getElementById(
    selectedFilterElementId
  );

  resetAllFilterButtons(filterButtonEls);

  updateFilterButtonStyle(selectedFilterElement);

  if (selectedFilterPeriod === "today") {
    fetchTodayPosts(user);
  } else if (selectedFilterPeriod === "week") {
    fetchWeekPosts(user);
  } else if (selectedFilterPeriod === "month") {
    fetchMonthPosts(user);
  } else if (selectedFilterPeriod === "all") {
    fetchAllPosts(user);
  }
}
