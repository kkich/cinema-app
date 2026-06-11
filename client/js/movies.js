const moviesList = document.getElementById('moviesList');
const genreFilter = document.getElementById('genreFilter');
const ageFilter = document.getElementById('ageFilter');
const sortFilter = document.getElementById('sortFilter');

function getGenreName(genre) {
  if (genre === 1) return 'Боевик';
  if (genre === 2) return 'Комедия';
  if (genre === 3) return 'Драма';
  return 'Неизвестно';
}

async function loadMovies() {
  const params = new URLSearchParams();

  if (genreFilter.value) {
    params.append('genre', genreFilter.value);
  }

  if (ageFilter.value) {
    params.append('age_rating', ageFilter.value);
  }

  if (sortFilter.value) {
    params.append('sort', sortFilter.value);
  }

  const response = await fetch(`http://localhost:3000/api/movies?${params.toString()}`);
  const movies = await response.json();

  moviesList.innerHTML = '';

  movies.forEach((movie) => {
    const card = document.createElement('div');
    card.className = 'movie-card';

    card.innerHTML = `
      <img src="../${movie.poster_path}" alt="${movie.title}">
      <div class="movie-content">
        <h2>${movie.title}</h2>
        <p>Жанр: ${getGenreName(movie.genre)}</p>
        <p>Возраст: ${movie.age_rating}+</p>
        <p class="movie-price">${movie.ticket_price} тг</p>
        <p>${movie.description}</p>
        <div class="buy-form">
          <input type="date" class="show-date">
          <input type="number" class="quantity" min="1" value="1">
          <button class="buy-button" data-id="${movie.id}">
            Купить билет
          </button>
          <p class="buy-message"></p>
        </div>
      </div>
    `;

    moviesList.appendChild(card);
    const buyButton = card.querySelector('.buy-button');

    buyButton.addEventListener('click', async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        window.location.href = 'login.html';
        return;
      }

      const showDate = card.querySelector('.show-date').value;
      const quantity = Number(
        card.querySelector('.quantity').value
      );

      const message = card.querySelector('.buy-message');

      try {
        const response = await fetch(
          'http://localhost:3000/api/tickets',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              movie_id: movie.id,
              show_date: showDate,
              quantity,
            }),
          }
        );

        const data = await response.json();

        message.textContent = data.message;
      } catch (error) {
        console.error(error);

        message.textContent =
          'Ошибка соединения с сервером';
      }
    });
  });
}
genreFilter.addEventListener('change', loadMovies);
ageFilter.addEventListener('change', loadMovies);
sortFilter.addEventListener('change', loadMovies);
loadMovies();