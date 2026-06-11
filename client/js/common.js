const token = localStorage.getItem('token');

const profileLink = document.getElementById('profileLink');
const loginLink = document.getElementById('loginLink');
const registerLink = document.getElementById('registerLink');
const logoutButton = document.getElementById('logoutButton');

if (token) {
  loginLink.style.display = 'none';
  registerLink.style.display = 'none';
  logoutButton.style.display = 'inline-block';
} else {
  profileLink.style.display = 'none';
  logoutButton.style.display = 'none';
}

logoutButton.addEventListener('click', () => {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
});