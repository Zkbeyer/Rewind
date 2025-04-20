function TopArtists({ topArtists }) {


        
        
    
    if (!topArtists?.length) return <div></div>;
    return (
        <div className="top-artists" style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <h2>Your Artists</h2>
            <div style={{display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap',listStyle: 'none', justifyContent: 'center'}}>
                {topArtists.map((artist) => (
                    <div key={artist.id} style={{listStyle: 'none', margin: '1rem'}}>
                        <a href={artist.external_urls.spotify} title={artist.name} target="_blank" rel="noopener noreferrer" key={artist.id} style={{listStyle: 'none', color: 'white'}}>
                        <img src={artist.images[0].url} alt={artist.name} style={{ width: '100px', boxShadow: '-5px 6px 12px rgba(0, 0, 0, 0.5)', height: '100px', borderRadius: '50%' }} />
                        </a>
                        <p>{artist.name}</p>
                    </div>
                    
                    
                ))}
            </div>
        </div>
    );
}

export default TopArtists;