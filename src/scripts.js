import userTemplate from "./templates/user.hbs";
const API_URL = "https://6aaed490606bd915d1111337.mockapi.io/api/users";

const userList = document.getElementById("usersList");
const userForm = document.getElementById("userForm");
const editForm = document.getElementById("editForm");
const closeModal = document.querySelector(".button-cancel");
const modal = document.querySelector("[data-backdrop]");

let currentUserId = 0;
let openedUser = {};


function isObjIndetical(obj1, obj2){
   return Object.keys(obj1).every(key => obj1[key] === obj2[key])
}
function toggleModal() {
  modal.classList.toggle("is-hidden");
}

editForm.addEventListener("submit", submitEditForm);

function submitEditForm(e) {
  e.preventDefault()
  const editData = Object.fromEntries(new FormData(editForm));

  if (isObjIndetical(editData, openedUser)) {
    toggleModal();
    return;
  }

  editUser(editData, currentUserId);
  toggleModal();
  
}

function editUser(data, id) {
  fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  }).then((response) => {
    if (!response.ok) {
      console.log("Response is not ok");
      throw new Error(`Response is not ok, Status: ${response.status}`);
    }
    getAllUsers();
    return response.json();
  });
}

function openModal(id) {
  currentUserId = id
  
  fetch(`${API_URL}/${id}`)
    .then((response) => response.json())
    .then((user) => {

      const { id, ...rest } = user;
      openedUser = rest

    Object.entries(rest).forEach(([key, value]) => 
        editForm.elements[key].value = value
      );
    });
  
  toggleModal();
}

closeModal.addEventListener("click", toggleModal);

function getAllUsers() {
  fetch(`${API_URL}`)
    .then((response) => {
      if (!response.ok) {
        console.log("Response is not ok");
        throw new Error(
          `Не вдалося оновити користувача., Status: ${response.status}`,
        );
      }
      return response.json();
    })
    .then((users) => renderUsers(users));
}

function renderUsers(users) {
  userList.innerHTML = "";
  users.forEach((user) => {
    const html = userTemplate(user);
    userList.insertAdjacentHTML("afterbegin", html);
  });
}
getAllUsers();

userForm.addEventListener("submit", submitUserForm);

function submitUserForm(e) {
  e.preventDefault();
  const data = new FormData(userForm);
  const formData = Object.fromEntries(data);
  createUser(formData);
}

function createUser(data) {
  fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (!response.ok) {
        console.log("Response is not ok");
        throw new Error(`Response is not ok, Status: ${response.status}`);
      }
      return response.json();
    })
    .then(() => {
      userForm.reset();
      getAllUsers();
    });
}

function deleteUser(id) {
  fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  })
    .then((response) => {
      if (!response.ok) {
        console.log("Response is not ok");
        throw new Error(`Response is not ok, Status: ${response.status}`);
      }
    })
    .then(() => getAllUsers());
}

userList.addEventListener("click", onUserListClick);
function onUserListClick(e) {
  const userID = e.target.dataset.id;
  if (e.target.classList.contains("delete-user")) {
    deleteUser(userID);
  }
  if (e.target.classList.contains("edit-user")) {
    openModal(userID);
  }
}
