export default function HowToPlayPage() {
  return (
    <main style={{ padding: "24px", maxWidth: "700px", margin: "0 auto", lineHeight: 1.6 }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>How to Play CineRate</h1>

      <p>
        CineRate is a simple guessing game built around movies, memory, and a little bit of luck.
        The goal is to guess the IMDb user rating of a movie — as close as possible <em>without going over</em>.
        The player who reaches 5 points first wins.
      </p>

      <h2 style={{ marginTop: "1.5rem" }}>🎟️ Getting Started</h2>
      <ul style={{ paddingLeft: "1.5rem" }}>
        <li>Sign in with Google or create an account using email and password.</li>
        <li>On the dashboard, join a public game or create your own private room.</li>
        <li>Invite friends by sharing the room code (you’ll see it in the waiting room).</li>
        <li>Once two or more players have joined, the host can start the game.</li>
      </ul>

      <h2 style={{ marginTop: "1.5rem" }}>🎬 Game Rounds</h2>
      <p>
        Each round, one player becomes the <strong>Picker</strong>. They have 1 minute to search for
        and choose a movie using the built-in OMDb search. Once a movie is selected, all other
        players have 30 seconds to guess its IMDb rating using a slider from 0.0 to 10.0.
      </p>

      <ul style={{ paddingLeft: "1.5rem" }}>
        <li>Guesses are rounded to one decimal place (e.g., 8.1, 7.4, etc.).</li>
        <li>Whoever guesses closest to the real IMDb score without going over earns a point.</li>
        <li>If everyone goes over, no points are awarded for that round.</li>
      </ul>

      <p>
        After each round, scores are displayed and the next player becomes the Picker.
        The first to reach 5 points wins the match!
      </p>

      <h2 style={{ marginTop: "1.5rem" }}>💬 Chat & Play</h2>
      <p>
        Each room has a built-in chat for movie talk, jokes, and good-natured trash talk.
        If you receive new messages while the chat window is closed, a small bubble will
        appear — it clears as soon as you open the chat.
      </p>

      <h2 style={{ marginTop: "1.5rem" }}>🏆 Stats & Leaderboards</h2>
      <p>
        Every guess and score is logged to your profile. You can check your personal stats —
        like wins, losses, and average accuracy — on your <strong>Profile</strong> page.
        The top players with the lowest average deviation appear on the global leaderboard.
      </p>

      <h2 style={{ marginTop: "1.5rem" }}>⚙️ Extra Rules</h2>
      <ul style={{ paddingLeft: "1.5rem" }}>
        <li>If time runs out for picking a movie, it automatically moves to the next player.</li>
        <li>If a player doesn’t submit a guess, their current slider value is used.</li>
        <li>If someone leaves mid-game after guessing, they’re given a loss.</li>
        <li>If only one player remains, that player wins by default.</li>
      </ul>

      <h2 style={{ marginTop: "1.5rem" }}>🍿 Final Notes</h2>
      <p>
        CineRate is meant to be casual, funny, and just a little competitive — like movie night
        with friends. It started as a real-world guessing game between two brothers and grew into
        this online version. So grab some popcorn, queue up your favorite films, and see how well
        you really know the crowd’s taste.
      </p>

      <p style={{ marginTop: "2rem", fontStyle: "italic", opacity: 0.8 }}>
        — Have fun, stay curious, and never underestimate a cult classic.
      </p>
    </main>
  );
}
