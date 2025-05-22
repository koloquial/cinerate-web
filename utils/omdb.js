export function searchMovieTitle(title) {
    const API = process.env.NEXT_PUBLIC_OMDB_API;
    return fetch(`https://www.omdbapi.com/?apikey=${API}&s=${encodeURIComponent(title)}`)
      .then(res => res.json())
      .catch(err => console.error(err));
  }
  
  export function getMovieInfo(id) {
    const API = process.env.NEXT_PUBLIC_OMDB_API;
    return fetch(`https://www.omdbapi.com/?apikey=${API}&i=${id}&plot=full`)
      .then(res => res.json())
      .catch(err => console.error(err));
  }
  
  export function isAlphaUnicode(str) {
    return /^\p{L}+$/u.test(str);
  }
  