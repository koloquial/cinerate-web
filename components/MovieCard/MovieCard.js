'use client';

export default function MovieCard({ movie, onSelect }) {
  return (
    <div className="movie-card" onClick={() => onSelect(movie)}>
<img
  src={movie.Poster !== 'N/A' ? movie.Poster : '/no-poster.png'}
  alt={movie.Title}
  className="movie-poster"
  onError={(e) => {
    e.target.src = '/no-poster.png';
  }}
/>
      <div className="movie-info">
        <h4>{movie.Title}</h4>
        <p>({movie.Year})</p>
      </div>
    </div>
  );
}
