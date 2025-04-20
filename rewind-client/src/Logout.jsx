function Logout({setToken, user}) {
    if (!user) return <div style={{padding: '1rem', width: '100px'}}></div>;
    return (
      <div style={{paddingRight : '1rem'}}>
          <button style={{backgroundColor: '#001f14'}} onClick={() => {
              fetch('http://localhost:3001/logout', {
                method: 'GET',
              }).then(() => {
                localStorage.clear();
                setToken(null);
                window.location.href = '/';
              })
              .catch((error) => {
                console.error('Error logging out:', error);
              });
            }}>Logout</button>
          </div>
    );
}

export default Logout