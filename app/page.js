"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthProvider";
import Leaderboard from "@/components/Leaderboard";
import ApiGate from "@/components/ApiGate";

export default function HomePage() {
  const router = useRouter();
  const { currentUser } = useAuth() || {};

  // If you want auto-redirect for already signed-in users, keep this:
  // useEffect(() => { if (currentUser) router.replace("/dashboard"); }, [currentUser, router]);

  function cta() {
    router.push(currentUser ? "/dashboard" : "/authenticate");
  }

  return (
    <ApiGate>
      <main className="container grid gap-16" style={{ paddingBottom: 48 }}>
        {/* HERO */}
        <section className="card card-lg" style={{ position: "relative", overflow: "hidden" }}>
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(1200px 400px at 20% -10%, var(--primary-500, #ff7a18) 0%, transparent 60%), radial-gradient(1200px 400px at 80% 110%, var(--accent-500, #18a0fb) 0%, transparent 60%)",
              opacity: 0.12,
              pointerEvents: "none",
            }}
          />
          <div className="grid" style={{ gap: 12 }}>
            <h1 className="logo" style={{ margin: 0 }}>
              <span className="cine">Cine</span><span className="rate">Rate</span>
            </h1>
            <h2 style={{ marginTop: 4 }}>The Good, the Bad, and the Overrated</h2>
            <p className="mt-6" style={{ maxWidth: 760 }}>
              Guess IMDb ratings with friends in real time. One player picks a movie, everyone
              slides a guess (0.0–10.0), and the closest <em>without going over</em> earns the point.
              First to 5 wins. Built for movie nights, inside jokes, and a dash of sibling rivalry.
            </p>

            <div className="mt-12" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button className="btn btn-primary" onClick={cta}>
                {currentUser ? "Go to Dashboard" : "Play Now (Free)"}
              </button>
              {/* <button className="btn" onClick={() => router.push("/how-to-play")}>
              Learn How to Play
            </button> */}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="card">
          <h3 style={{ marginTop: 0 }}>How to Play</h3>
          <ol className="mt-12" style={{ display: "grid", gap: 12, paddingLeft: 18 }}>
            <li><strong>Create or join a room.</strong> Share the 8-char room code with friends.</li>
            <li><strong>Picker chooses a movie.</strong> We fetch the IMDb rating (shh 🤫).</li>
            <li><strong>Everyone guesses 0.0–10.0.</strong> You can’t go over. Precision: 0.1.</li>
            <li><strong>Closest under wins the round.</strong> Ties at the top? No points awarded.</li>
            <li><strong>First to the target score wins.</strong> Then vote to play again!</li>
          </ol>
          {/* <div className="mt-12">
          <button className="btn btn-ghost" onClick={() => router.push("/how-to-play")}>
            See full rules & tips →
          </button>
        </div> */}
        </section>

        {/* FEATURE STRIP */}
        <section className="grid grid-3">
          <div className="card">
            <h4>🎬 Any Movie</h4>
            <p>Pick movie by title. No repeats inside a game, so the vibe stays fresh.</p>
          </div>
          <div className="card">
            <h4>⚖️ Fair & Fast</h4>
            <p>Closest without going over. Tie at the top? Nobody scores—next round!</p>
          </div>
          <div className="card">
            <h4>🏆 Bragging Rights</h4>
            <p>We track your average Δ across guesses. Check the leaderboard anytime.</p>
          </div>
        </section>

        {/* LEADERBOARD TEASER (optional – remove if you don’t want it on home) */}
        <section>
          <Leaderboard />
          {/* <div className="mt-12" style={{ textAlign: "right" }}>
          <button className="btn btn-ghost" onClick={() => router.push("/dashboard")}>
            Open Dashboard →
          </button>
        </div> */}
        </section>

        {/* CTA STRIP */}
        {/* <section className="card" style={{ textAlign: "center" }}>
        <h3 style={{ marginTop: 0 }}>Ready to rate?</h3>
        <p className="mt-6">Jump into a room with friends and see who really knows their films.</p>
        <div className="mt-12" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button className="btn btn-primary" onClick={cta}>
            {currentUser ? "Go to Dashboard" : "Create Your Account"}
          </button>
          <button className="btn" onClick={() => router.push("/about")}>About CineRate</button>
          <button className="btn" onClick={() => router.push("/feedback")}>Give Feedback</button>
        </div>
      </section> */}
      </main>
    </ApiGate>
  );
}
