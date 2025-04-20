function TrackList({ tracks, device, token}) {
    if (!tracks?.length) return <div>Loading...</div>;

    const handleTrackClick = async (track) => {
      console.log(track);
      const uri = track.uri;
      const spotifyUrl = track.external_urls.spotify;

      if (device) {
          try{
          //add to queue
          await fetch('https://api.spotify.com/v1/me/player/queue?uri=' + encodeURIComponent(uri), {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            //skip
            await fetch('https://api.spotify.com/v1/me/player/next', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            console.log('added to queue and skipped');
          } catch (error) {
            console.error('Error adding track to queue:', error);
          }
      } else {
          window.open(spotifyUrl, '_blank', 'noopener,noreferrer');
      }
  }
        
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '100%'}}>
        <h2>Your Tracks</h2>
        <div style={{}}> 
            {tracks.map((track) => (
              <div key={`${track.id} - ${track.played_at}`} style = {{marginBottom: '1.5rem', listStyle: 'none'}}>
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'left', marginLeft: '1rem'}}> 
                  <a title={device ? `Play ${track.name}` : 'Open in Spotify'} onClick={() => handleTrackClick(track)} style={{cursor: 'pointer',}}><img src={track.album.images[0].url} alt={track.name} style={{ width: '100px', boxShadow: '-5px 6px 12px rgba(0, 0, 0, 0.5)'}} /></a>
                  <p style={{marginLeft: '1rem'}}><strong>{track.name}</strong> by {track.artists[0].name}</p>
                  </div>
                </div>
            ))}
          </div>
      </div>
    );
}

export default TrackList;