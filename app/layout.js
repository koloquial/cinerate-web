export const metadata = {
  title: "CineRate",
  description: "Guess IMDB ratings",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
