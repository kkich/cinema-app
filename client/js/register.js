const registerForm = document.getElementById('registerForm');
const message = document.getElementById('message');

registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const full_name = document.getElementById('fullName').value;
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch(
      'http://localhost:3000/api/register',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name,
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

    message.textContent = 'Регистрация прошла успешно';

    registerForm.reset();

    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1500);
  } catch (error) {
    console.error(error);

    message.textContent = 'Ошибка соединения с сервером';
  }
});