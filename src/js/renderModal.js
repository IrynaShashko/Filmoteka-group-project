import MovieApiService from './MovieApiService';
import { loadAnimationAction } from './renderTrendingPage';
import { refs } from './refs';
import * as basicLightbox from 'basiclightbox';

const movieApiService = new MovieApiService();

const lightBoxOptions = {
  onShow: function (instance) {
    instance.element().querySelector('.close-modal').onclick = instance.close;
  },
  onClose: () => {
    window.removeEventListener('keydown', keydownHandler);
  },
};

let modal; //собственно будущая модалка

refs.mainMarkup.addEventListener('click', onMovieCardClick);

export async function onMovieCardClick(e) {
  e.preventDefault();
  const movieId = e.path.find(el => el.className === 'movie-card').id; //get movie ID
  loadAnimationAction.classList.remove('is-hiden'); //loader animation switched-on
  const movieData = await movieApiService.getMovieById(movieId); //get from srver movie info
  const modalMarkup = itemMarkup(movieData); // create markup
  modal = basicLightbox.create(modalMarkup, lightBoxOptions); //create modal window//
  modalShow();
  handleButtons();
  loadAnimationAction.classList.add('is-hiden'); //loader animation switched-off
}

function modalShow() {
  modal.show(); //show modal window
  window.addEventListener('keydown', keydownHandler);
}

function keydownHandler(e) {
  if (e.code === 'Escape') {
    modal.close();
  }
}

export function itemMarkup({
  id,
  poster_path,
  title,
  vote_average,
  vote_count,
  popularity,
  original_title,
  genres,
  overview,
}) {
  return `
  <div class='modal'>
  <button class="close-modal"></button>
  <section class="modal-rendered">
    <!-- a tag for teaser player feature -->
    <a class="card-link" href="#"
      ><img
        class="poster-image"
        src="https://image.tmdb.org/t/p/w500/${poster_path}"
        alt="${title}"
        loading="lazy"
    /></a>

    <div class="info-modal">
      <h2 class="card-title">${title.toUpperCase()}</h2>
      <div class="info-keys">
        <ul>
          <li>Vote / Votes</li>
          <li>Popularity</li>
          <li>Original Title</li>
          <li>Genre</li>
        </ul>
      </div>
      <div class="info-values">
        <ul>
          <li>
            <span class="vote-span">${vote_average.toFixed(1)}</span>
            /${vote_count}
          </li>
          <li>${popularity}</li>
          <li>${original_title}</li>
          <li>${genres[0].name}</li>
        </ul>
      </div>
      <p class="info-about">About</p>
      <p class="info-overview">${overview}</p>
      <div class="buttons">
        <button class="button-watched" data-movieId='${id}'>Add to watched</button>
        <button class="button-queue" data-movieId='${id}'>Add to queue</button>
      </div>
    </div>
  </section></div>`;
}

function handleButtons() {
  document
    .querySelector('.button-watched')
    .addEventListener('click', addToWatched);
  document.querySelector('.button-queue').addEventListener('click', addToQueue);
}

function addToWatched(e) {
  let arr =
    localStorage.getItem('watched') !== null
      ? JSON.parse(localStorage.getItem('watched'))
      : [];
  if (arr.includes(e.target.dataset.movieid)) {
    throw new Error('already added');
  } else {
    arr.push(e.target.dataset.movieid);
    localStorage.setItem('watched', JSON.stringify(arr));
  }
}

function addToQueue(e) {
  let arr =
    localStorage.getItem('queue') !== null
      ? JSON.parse(localStorage.getItem('queue'))
      : [];
  if (arr.includes(e.target.dataset.movieid)) {
    throw new Error('already added');
  } else {
    arr.push(e.target.dataset.movieid);
    localStorage.setItem('queue', JSON.stringify(arr));
  }
}
