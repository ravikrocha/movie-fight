const autoCompleteConfig = {
  renderOption(movie) {
    const imgSrc = movie.Poster === 'N/A' ? '' : movie.Poster;
    return `
    <img src = "${imgSrc}"/>
    ${movie.Title}
    (${movie.Year})
    `;
  },
  inputValue(movie) {
    return movie.Title;
  },
  async fetchData(searchTerm) {
    const response = await axios.get('https://www.omdbapi.com/', {
      params: {
        apikey: 'b0b2852e',
        s: searchTerm,
      },
    });
    if (response.data.Error) {
      return [];
    }
    return response.data.Search;
  },
};

createAutoComplete({
  ...autoCompleteConfig,
  root: document.querySelector('#left-autocomplete'),
  onOptionSelect(movie) {
    document.querySelector('.tutorial').classList.add('is-hidden');
    onMovieSelect(movie, document.querySelector('#left-summary'), 'left');
  },
});
createAutoComplete({
  ...autoCompleteConfig,
  root: document.querySelector('#right-autocomplete'),
  onOptionSelect(movie) {
    document.querySelector('.tutorial').classList.add('is-hidden');
    onMovieSelect(movie, document.querySelector('#right-summary'), 'right');
  },
});

let leftMovie;
let rightMovie;

const onMovieSelect = async (movie, summaryElement, side) => {
  const response = await axios.get('https://www.omdbapi.com/', {
    params: {
      apikey: 'b0b2852e',
      i: movie.imdbID,
    },
  });
  summaryElement.innerHTML = movieTemplate(response.data);
  if (side === 'left') {
    leftMovie = response.data;
  } else {
    rightMovie = response.data;
  }
  if (leftMovie && rightMovie) {
    runComparison();
  }
};

const clearStyles = (el) => {
  el.classList.remove('is-primary');
  el.classList.remove('is-warning');
  el.classList.remove('is-dark');
};

const runComparison = () => {
  const leftSideStats = document.querySelectorAll(
    '#left-summary .notification'
  );
  const rightSideStats = document.querySelectorAll(
    '#right-summary .notification'
  );

  leftSideStats.forEach((leftStat, index) => {
    const rightStat = rightSideStats[index];

    const leftSideValue = parseInt(leftStat.dataset.value);
    const rightSideValue = parseInt(rightStat.dataset.value);

    if (leftSideValue > rightSideValue) {
      rightStat.classList.remove('is-primary');
      rightStat.classList.add('is-warning');
      leftStat.classList.remove('is-warning');
      leftStat.classList.add('is-primary');
    } else if (leftSideValue < rightSideValue) {
      leftStat.classList.remove('is-primary');
      leftStat.classList.add('is-warning');
      rightStat.classList.remove('is-warning');
      rightStat.classList.add('is-primary');
    } else {
      clearStyles(leftStat);
      clearStyles(rightStat);
      leftStat.classList.add('is-dark');
      rightStat.classList.add('is-dark');
    }
  });
};

const movieTemplate = (movieDetail) => {
  const metascore = parseInt(movieDetail.Metascore);
  const rottenRating = parseInt(movieDetail.Ratings[1]['Value']);
  const awards = movieDetail.Awards.split(' ').reduce((prev, word) => {
    const value = parseInt(word);
    if (isNaN(value)) {
      return prev;
    } else {
      return prev + value;
    }
  }, 0);

  console.log(metascore, rottenRating, awards);

  return `
  <article class="media">
  <figure class="media-left">
  <p class= "image">
  <img src="${movieDetail.Poster}"/>
  </p>
  </figure>
  <div class="media-content">
  <div class="content">
  <h1>${movieDetail.Title} </h1><small>${movieDetail.Year}</small>
 
  <h4>${movieDetail.Genre}</h4>
  <p>${movieDetail.Actors}<p>
  <p>${movieDetail.Plot}</p>
  </div>
  </div>
  </article>
  <article data-value = ${awards} class="notification is-primary">
  <p class="title">${movieDetail.Awards}</p>
  <p class"subtitle">Awards</p>
  </article>
  <article data-value = ${rottenRating} class="notification is-primary">
  <p class="title">${movieDetail.Ratings[1]['Value']}</p>
  <p class"subtitle">Rotten Tomatoes Rating</p>
  </article>
  <article data-value = ${metascore} class="notification is-primary">
  <p class="title">${movieDetail.Metascore}</p>
  <p class"subtitle">Metascore</p>
  </article>

  `;
};
