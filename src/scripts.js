import userTemplate from "./templates/user.hbs";
import btnPage from "./templates/btn-page.hbs";
const API_URL = "https://6aaed490606bd915d1111337.mockapi.io/api/users";

const userList = document.getElementById("usersList");
const usersPagination = document.getElementById("usersPagination");
const userForm = document.getElementById("userForm");
const editForm = document.getElementById("editForm");
const closeModal = document.querySelector(".button-cancel");
const modal = document.querySelector("[data-backdrop]");

let currentUserId = 0;
let openedUser = {};

let page = 1;
let limit = 5;
let totalPages = 0;

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("HTTP Error");
  }
  return response.json();
}

function isObjIndetical(obj1, obj2) {
  return Object.keys(obj1).every((key) => obj1[key] === obj2[key]);
}
function toggleModal() {
  modal.classList.toggle("is-hidden");
}

editForm.addEventListener("submit", submitEditForm);

function submitEditForm(e) {
  e.preventDefault();
  const editData = Object.fromEntries(new FormData(editForm));

  if (isObjIndetical(editData, openedUser)) {
    toggleModal();
    return;
  }

  editUser(editData, currentUserId);
  toggleModal();
}

async function editUser(data, id) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      console.log("Response is not ok");
      throw new Error(`Response is not ok, Status: ${response.status}`);
    }
    fetchUsers();
    return response.json();
  } catch (error) {
    console.error("Не вдалося створити користувача:", error);
  }
}

async function openModal(id) {
  currentUserId = id;

  const response = await fetch(`${API_URL}/${id}`);
  const user = response.json();
  const { userId, ...rest } = user;
  openedUser = rest;

  Object.entries(rest).forEach(
    ([key, value]) => (editForm.elements[key].value = value),
  );

  toggleModal();
}

closeModal.addEventListener("click", toggleModal);

async function fetchUsers() {
  try {
    const data = await fetchJson(`${API_URL}?page=${page}&limit=${limit}`);
    renderUsers(data);
  } catch (error) {
    console.error(error);
  }
}
async function getAllUsers() {
  try {
    const data = await fetchJson(API_URL);
    totalPages = Math.ceil(data.length / limit);
    renderPagination(totalPages);
  } catch (error) {
    console.error(error);
  }
}
function renderPagination(totalPages) {
  usersPagination.innerHTML = "";
  Array.from({ length: totalPages }).forEach((_, idx) => {
    usersPagination.insertAdjacentHTML("beforeend", btnPage({ idx: idx + 1 }));
  });
  setActivePage();
}

function renderUsers(users) {
  userList.innerHTML = "";
  users.forEach((user) => {
    const html = userTemplate(user);
    userList.insertAdjacentHTML("afterbegin", html);
  });
}

userForm.addEventListener("submit", submitUserForm);

function submitUserForm(e) {
  e.preventDefault();
  const data = new FormData(userForm);
  const formData = Object.fromEntries(data);
  createUser(formData);
}

async function createUser(data) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      console.log("Response is not ok");
      throw new Error(`Response is not ok, Status: ${response.status}`);
    }
    await fetchUsers();
    userForm.reset();
  } catch (error) {
    console.error("Не вдалося створити користувача:", error);
  }
}

async function deleteUser(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      console.log("Response is not ok");
      throw new Error(`Response is not ok, Status: ${response.status}`);
    }
    await fetchUsers();
  } catch (error) {
    console.error("Не вдалося видалити користувача:", error);
  }
}

userList.addEventListener("click", onUserListClick);
function onUserListClick(e) {
  const userID = e.target.dataset.id;
  if (e.target.classList.contains("delete-user")) deleteUser(userID);

  if (e.target.classList.contains("edit-user")) openModal(userID);

  if (e.target.classList.contains("show-user")) showTasks(userID);
}

function setActivePage() {
  usersPagination.querySelectorAll("button").forEach((btn) => {
    btn.classList.toggle("active", Number(btn.dataset.page) === page);
  });
}

usersPagination.addEventListener("click", onUsersPaginationClick);
function onUsersPaginationClick(e) {
  e.preventDefault();
  const target = e.target;
  if (target.tagName !== "BUTTON") return;
  page = Number(target.dataset.page);

  setActivePage();
  fetchUsers();
}

async function showTasks(id) {
  try {
    const response = await fetch(`${API_URL}/${id}/products`);
    if (!response.ok) {
      throw new Error(`Response is not ok, Status: ${response.status}`);
    }
    const products = await response.json();
    products.forEach((product) =>
      console.log(`product name: ${product.productName}, id:${product.id}`),
    );
  } catch (error) {
    console.error("Не вдалося показати продукт:", error);
  }
}
fetchUsers();
getAllUsers();
