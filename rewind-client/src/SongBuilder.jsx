import { useState } from 'react';

function SongBuilder({ topTracks = [], topArtists = [], topGenres = [], token, onGenerate }) {
  const [selected, setSelected] = useState({ tracks: [], artists: [], genres: [] });

  const getTotal = () => selected.tracks.length + selected.artists.length + selected.genres.length;

  const toggle = (type, value) => {
    setSelected((prev) => {
      const exists = prev[type].includes(value);
      if (exists) {
        return { ...prev, [type]: prev[type].filter((v) => v !== value) };
      } else if (getTotal() < 5) {
        return { ...prev, [type]: [...prev[type], value] };
      } else {
        return prev;
      }
    });
  };

  const fetchRecommendations = async () => {
    const { tracks, artists, genres } = selected;
    const url = new URL('https://api.spotify.com/v1/recommendations');
    url.searchParams.set('limit', 10);
    if (tracks.length) url.searchParams.set('seed_tracks', tracks.join(','));
    if (artists.length) url.searchParams.set('seed_artists', artists.join(','));
    if (genres.length) url.searchParams.set('seed_genres', genres.join(','));

    const query = url.toString();
    console.log("fetching recommendations with query:", query);

    const res = await fetch('https://api.spotify.com/v1/recommendations?seed_artists=4NHQUGzhtTLFvgF5SZesLK&seed_genres=classical%2Ccountry&seed_tracks=0c6xIDDpzE81m2q797ordA' , {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
        const errorText = await res.text();
      console.error("Failed to fetch recommendations", errorText);
      return;
    }
    const data = await res.json();
    onGenerate(data.tracks);
  };

  return (
    <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>🎧 Song Builder</h2>
      <p>Select up to 5 seeds total (tracks, artists, or genres)</p>
      <p>Selected: {getTotal()} / 5</p>

      <section>
        <h3>Tracks</h3>
        {topTracks.map((track) => (
          <button
            key={track.id}
            onClick={() => toggle('tracks', track.id)}
            style={{
              margin: '4px',
              backgroundColor: selected.tracks.includes(track.id) ? '#1db954' : 'black',
            }}
          >
            {track.name} by {track.artists[0].name}
          </button>
        ))}
      </section>

      <section>
        <h3>Artists</h3>
        {topArtists.map((artist) => (
          <button
            key={artist.id}
            onClick={() => toggle('artists', artist.id)}
            style={{
              margin: '4px',
              backgroundColor: selected.artists.includes(artist.id) ? '#1db954' : 'black',
            }}
          >
            {artist.name}
          </button>
        ))}
      </section>

      <section>
        <h3>Genres</h3>
        {topGenres.map((genre) => (
          <button
            key={`${genre.name}-${genre.count}`}
            onClick={() => toggle('genres', genre.name)}
            style={{
              margin: '4px',
              backgroundColor: selected.genres.includes(genre.name) ? '#1db954' : 'black',
            }}
          >
            {genre.name}
          </button>
        ))}
      </section>

      <button
        onClick={fetchRecommendations}
        disabled={getTotal() === 0}
        style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}
      >
        🔁 Generate Recommendations
      </button>
    </div>
  );
}

export default SongBuilder;
