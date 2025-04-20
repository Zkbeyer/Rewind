function TopGenres({ topGenres }) {
    if (!topGenres?.length) return <div></div>;

    return (
        <div className="top-genres" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '2rem'}}>
            <h2>Your Genres</h2>
            <div style={{display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap',listStyle: 'none', justifyContent: 'center'}}>
                {topGenres.map((genre) => (
                    <a key={`${genre.name}-${genre.count}`} title={'Search '+ genre.name} href={`https://open.spotify.com/search/${genre.name}`} target="_blank" rel="noopener noreferrer" className={genre.name} style={{listStyle: 'none', margin: '0.5rem', backgroundColor: '#001f14', opacity: '0.8',boxShadow: '-5px 6px 12px rgba(0, 0, 0, 0.5)',color: 'white', padding: '0 1rem', borderRadius: '1rem'}}>
                        <p>{genre.name}</p>
                    </a>
                ))}
            </div>
        </div>
    );
}

export default TopGenres;