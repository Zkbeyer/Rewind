function UserProfile({user}) {
    if (!user || !user.display_name) return <div style={{padding: '1rem', width: '100px'}}></div>;

    const hasImage = user.images && user.images.length > 0;

    return (
        <a href={user.external_urls.spotify} target="_blank" rel="noopener noreferrer" style={{display:'flex', alignItems: 'center', color: 'white', padding: '0 2rem', borderRadius: '1rem' }}>

            {hasImage ?  (
                <img title={user.display_name} src={user.images[0].url} alt={user.display_name} width="50" style={{ borderRadius: '50%' }} />
            ) : (
                <img title={user.display_name} src="/favicon.png" alt={user.display_name} width="50" style={{ borderRadius: '50%' }} />
            )}
            <h2 style={{marginLeft: '1rem'}}>{user.display_name}</h2>
        </a>
    );
}

export default UserProfile;