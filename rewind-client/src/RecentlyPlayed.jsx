function RecentlyPlayed({recently_played, device, token}) {
    if (!recently_played?.length) return <div>Loading...</div>;

    const uniqueTracks = (recently_played, limit=10) => {
        const uniqueTracks = [];
        const seenTrackIds = new Set();
    
        for (const item of recently_played) {
          const trackId = item.track.id;
    
          if (!seenTrackIds.has(trackId)) {
            uniqueTracks.push(item);
            seenTrackIds.add(trackId);
    
            if (uniqueTracks.length >= limit) {
              break;
            }

          }
          
        }
        return uniqueTracks;
    };

    const top10Tracks = uniqueTracks(recently_played);

    const handleTrackClick = async (recently_played) => {
        console.log(recently_played);
        const uri = recently_played.track.uri;
        const spotifyUrl = recently_played.track.external_urls.spotify;
  
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
        <div >
            <h2>Recently Played</h2>
            <div style={{}}>
                {top10Tracks.map((track) => (
                <div key={`${track.track.id} - ${track.track.played_at}`} style = {{marginBottom: '1.5rem', listStyle: 'none'}}>
                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'right', marginLeft: '1rem'}}>
                    <p style={{marginRight: '1rem'}}><strong>{track.track.name}</strong> by {track.track.artists[0].name}</p>
                    <a title={device ? `Play ${track.track.name}` : 'Open in Spotify'} onClick={() => handleTrackClick(track)} style={{cursor: 'pointer'}}><img src={track.track.album.images[0].url} alt={track.track.name} style={{width: "100px", boxShadow: '5px 6px 12px rgba(0, 0, 0, 0.5)'}} /></a>
                    </div>
                    </div>
                ))}

            </div>
        </div>
    )
}

export default RecentlyPlayed;