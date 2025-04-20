function Recommendations({ recommendations }) {
    if (!recommendations.length) return null;
    return (
        <div className="recommendations">
            <h2>Recommendations</h2>
            <div>
                {recommendations.map((track) => (
                    <div key={track.id}>
                        <p><strong>{track.name}</strong> by <em>{track.artists[0].name}</em></p>
                        <img src={track.album.images[0].url} alt={track.name} />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Recommendations;