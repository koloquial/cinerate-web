'use client';
import { useState, useEffect } from 'react';
import { useSocket } from '@/context/SocketContext';
import { getMovieInfo, searchMovieTitle } from '@/utils/omdb';
import { useMongo } from '@/context/MongoContext';

import MovieCard from '@/components/MovieCard';
import Accordion from '@/components/Accordion';
import { FiClock } from 'react-icons/fi';
import './game.css';

export default function GamePage() {
  const { activeGame, socket, time, setTime } = useSocket();
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [guess, setGuess] = useState(5);
  const [guessed, setGuessed] = useState(false);
  const { profile } = useMongo();

  useEffect(() => {
    if(time > 0){
        setTimeout(() => {
            setTime(time - 1);
        }, 1_000)
    }
  });

  const handleSearch = async () => {
    const data = await searchMovieTitle(search);
    setResults(data?.Search || []);
  };

  const handleSelect = (movie) => {
    getMovieInfo(movie.imdbID)
    .then(movie => {
        console.log('movie', movie);
        socket?.emit('movie_selected', { movie, activeGame });
    })
  };

  if (!activeGame) return <div className="spinner" />;
  
  return (
    <div className="auth-form">
        {activeGame.status === 'assign_movie' && 
        <>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
  <FiClock size={20} />
  {time > -1 && <span>{time}s remaining</span>}
</div>
      <p><strong>Dealer:</strong> {activeGame.dealerId}</p>

      {activeGame?.dealerId === profile.username ? (
  <>
    <input
      className="input"
      placeholder="Search for a movie..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
    <button className="button" onClick={handleSearch}>Search</button>

    <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: '1rem' }}>
      {results.map(movie => (
        <MovieCard key={movie.imdbID} movie={movie} onSelect={handleSelect} />
      ))}
    </div>
  </>
) : (
  <p>Waiting for the dealer to pick a movie...</p>
)}
        </>
        }

{activeGame.status === 'awaiting_guesses' && (
  <div className='guess-container'>

  <h3>{activeGame.selectedMovie?.Title}</h3>
  {activeGame.selectedMovie?.Year && <p className='year'>({activeGame.selectedMovie?.Year})</p>}
  
  <div className='grid-2x'>
  {console.log('ACTIVE GAME:', activeGame)}
  <div>
    <img
      src={activeGame.selectedMovie?.Poster}
      alt="Poster"
      className='movie-poster'
    />
  </div>

  <div className='movie-details'>
  {activeGame.selectedMovie?.Rated && <p><span className='bold'>Rated:</span> {activeGame.selectedMovie?.Rated}</p>}
  {activeGame.selectedMovie?.Genre && <p><span className='bold'>Genre:</span> {activeGame.selectedMovie?.Genre}</p>}
  {activeGame.selectedMovie?.Director && <p><span className='bold'>Director:</span> {activeGame.selectedMovie?.Director}</p>}
  {activeGame.selectedMovie?.Actors && <p><span className='bold'>Actors:</span> {activeGame.selectedMovie?.Actors}</p>}
  {activeGame.selectedMovie?.Writer && <p><span className='bold'>Writer:</span> {activeGame.selectedMovie?.Writer}</p>}
  {activeGame.selectedMovie?.BoxOffice && <p><span className='bold'>Box Office:</span> {activeGame.selectedMovie?.BoxOffice}</p>}
  </div>
  </div>

  <Accordion label="Plot">
  <p>{activeGame.selectedMovie?.Plot}</p>
</Accordion>

  {!guessed &&     <div>
    <div>
        <p>Rate: {guess}</p>
    <input
      type="range"
      min="0"
      max="10"
      step="0.1"
      value={guess}
      onChange={(e) => setGuess(e.target.value)}
    />
    </div>
    <div>
    <button className="button" onClick={() => {
      setGuessed(true);
      socket.emit('submit_guess', { gameId: activeGame.id, profile, guess});
    }}>
      Submit Vote
    </button>
    </div>
  </div>}

  {guessed && <p>awaiting guesses</p>}

   
  </div>
)}

    </div>
  );
}
