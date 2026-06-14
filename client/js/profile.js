const profileInfo = document.getElementById('profileInfo');
const ticketsList = document.getElementById('ticketsList');
const avatarForm = document.getElementById('avatarForm');
const avatarInput = document.getElementById('avatarInput');
const avatarMessage = document.getElementById('avatarMessage');

async function loadProfile() {
  const token = localStorage.getItem('token');

  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  try {
    const response = await fetch(
      'http://localhost:3000/api/profile',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      localStorage.removeItem('token');
      window.location.href = 'login.html';
      return;
    }

    const data = await response.json();

    profileInfo.innerHTML = `
      <div class="profile-card">
        ${
          data.user.avatar_path
            ? `<img class="avatar" src="http://localhost:3000${data.user.avatar_path}" alt="Аватар">`
            : '<div class="avatar-placeholder">Нет фото</div>'
        }

        <div class="profile-info">
          <h1>Профиль</h1>
          <p><strong>ФИО:</strong> ${data.user.full_name}</p>
          <p><strong>Логин:</strong> ${data.user.username}</p>
        </div>
      </div>
    `;

    ticketsList.innerHTML = '';

    data.tickets.forEach((ticket) => {
      const ticketCard = document.createElement('div');
      ticketCard.className = 'ticket-card';

      ticketCard.innerHTML = `
        <h3>${ticket.title}</h3>
        <p><strong>Дата сеанса:</strong> ${ticket.show_date.slice(0, 10)}</p>
        <p><strong>Количество:</strong> ${ticket.quantity}</p>
        <p><strong>Итого:</strong> ${ticket.total_price} тг</p>
        <p><strong>Статус:</strong> ${ticket.status}</p>

        ${
          ticket.status === 'active'
            ? `<button class="refund-button" data-id="${ticket.id}">
                Оформить возврат
              </button>`
            : ''
        }
      `;

      ticketsList.appendChild(ticketCard);
      const refundButton = ticketCard.querySelector('.refund-button');

      if (refundButton) {
        refundButton.addEventListener('click', async () => {
          const response = await fetch(
            `http://localhost:3000/api/tickets/${ticket.id}/refund`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const data = await response.json();

          alert(data.message);

          loadProfile();
        });
      }
    });
  } catch (error) {
    console.error(error);
    profileInfo.textContent = 'Ошибка загрузки профиля';
  }
}
avatarForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const token = localStorage.getItem('token');

  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  const file = avatarInput.files[0];

  if (!file) {
    avatarMessage.textContent = 'Выберите файл';
    return;
  }

  const formData = new FormData();
  formData.append('avatar', file);

  try {
    const response = await fetch(
      'http://localhost:3000/api/profile/avatar',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    const data = await response.json();

    avatarMessage.textContent = data.message;

    if (response.ok) {
      loadProfile();
      avatarForm.reset();
    }
  } catch (error) {
    console.error(error);
    avatarMessage.textContent = 'Ошибка загрузки аватара';
  }
});
loadProfile();