const loginForm = document.getElementById('loginForm');
const message = document.getElementById('message');

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch(
      'http://localhost:3000/api/login',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      message.textContent = data.message;
      return;
    }

    localStorage.setItem('token', data.token);

    message.textContent = 'Вход выполнен успешно';

    setTimeout(() => {
      window.location.href = 'movies.html';
    }, 1000);
  } catch (error) {
    console.error(error);

    message.textContent = 'Ошибка соединения с сервером';
  }
});