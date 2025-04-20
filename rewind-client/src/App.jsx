import { use, useEffect, useState } from 'react'
import './App.css'

import Login from './Login';
import TrackList from './TrackList';
import UserProfile from './UserProfile';
import NowPlaying from './NowPlaying';
import Logout from './Logout';
import RecentlyPlayed from './RecentlyPlayed';
import TopArtists from './TopArtists'; 
import TopGenres from './TopGenres';

function App() {
  const [token, setToken] = useState(null);
  const [topTracks, setTopTracks] = useState([]);
  const [user, setUser] = useState(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [lastKnownTrack, setLastKnownTrack] = useState(null);
  const [position, setPosition] = useState(currentlyPlaying?.progress_ms || 0);
  const [device, setDevice] = useState(null);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [topArtists, setTopArtists] = useState([]);
  const [topGenres, setTopGenres] = useState([]);
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryFetched, setSummaryFetched] = useState(false);
 

  const getAccessToken = () => {
    return localStorage.getItem('accessToken');
  }

  const getRefreshToken = () => {
    return localStorage.getItem('refreshToken');
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token'); 

    if (accessToken && refreshToken) {
      setToken(accessToken);
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      window.history.replaceState({}, document.title, '/');
    } 

    if (accessToken) {
      setToken(accessToken);
      fetchTopTracks(accessToken);
      fetchUser(accessToken);
      fetchNowPlaying(accessToken);
      fetchRecentlyPlayed(accessToken);
      fetchTopArtists(accessToken);
  } else if(!accessToken && getAccessToken()) {
    setToken(getAccessToken());
    fetchTopTracks(getAccessToken());
    fetchUser(getAccessToken());
    fetchNowPlaying(getAccessToken());
    fetchRecentlyPlayed(getAccessToken());
    fetchTopArtists(getAccessToken());
  }
  
  }, []);

  useEffect(() => {
    const cached = localStorage.getItem('summary');
    if (cached) {
      console.log('Using cached summary');
      const summary = JSON.parse(cached);
      setSummary(summary);
      setSummaryFetched(true);
    }
  }, []);

  useEffect(() => {
    const allDataLoaded = topTracks.length > 0 && topArtists.length > 0 && topGenres.length > 0 && recentlyPlayed.length > 0;
    if (!allDataLoaded || summaryFetched) {
      return;
    }
    console.log('Fetching summary');
      const fetchSummary = async () => {
        try {
          setSummaryLoading(true);
          const res = await fetch('https://spotify-rewind-backend.onrender.com/api/summary', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userData: {
                topTracks,
                topArtists,
                topGenres,
                user
              },
            }),
          });
    
          const data = await res.json();
          setSummary(data.summary);
          localStorage.setItem('summary', JSON.stringify(data.summary));
          setSummaryFetched(true); // ✅ prevents future fetches
        } catch (err) {
          console.error('Error fetching summary:', err);
        } finally {
          setSummaryLoading(false);
        }
      };
    
      fetchSummary();

  }, [topTracks, topArtists, topGenres, recentlyPlayed, user, summaryFetched]);


//mouse shadow and ripple effect
  useEffect(() => {
    const shadow = document.getElementById('mouse-shadow');
    let lastRippleTime = 0;
    let rippleDelay = 50;

    const createRipple = (x, y) => {
      const ripple = document.createElement('div');
      ripple.className = 'ripple';
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      document.body.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600); // clean up after animation
    };

    const handleMove = (e) => {
      shadow.style.left = `${e.clientX}px`;
      shadow.style.top = `${e.clientY}px`;

      if (Date.now() - lastRippleTime >= rippleDelay) {
        createRipple(e.clientX, e.clientY);
        lastRippleTime = Date.now();
      }
    };

    const handleClick = (e) => {
      createRipple(e.clientX, e.clientY);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('click', handleClick);
    return () => {window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('click', handleClick);
    };
  }, []);

  //dynamic background
  useEffect(() => {
    const bg = document.querySelector('.dynamic-bg');

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const scrollPercent = scrollTop / window.innerHeight;

      const maxAngle = 2000;
      const angle = 20 - ((scrollTop / window.innerHeight) * 200 );

      // Clamp angle if needed
      const finalAngle = Math.min(angle, maxAngle);

      bg.style.background = `linear-gradient(${finalAngle}deg, #002a1f, #1db954)`;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  useEffect(() => {
    if (!token) return;

    const refreshInterval = setInterval(() => {
      refreshAccessToken();
    }, 55*60*1000); //55 minutes

    return () => clearInterval(refreshInterval);
  }, [token]);

  const getTopGenres = (topArtists) => {
    const genreCounts = {};

    for (const artist of topArtists) {
        for (const genre of artist.genres) {
            genreCounts[genre] = (genreCounts[genre] || 0) + 1;
        }
    }
    setTopGenres( Object.entries(genreCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([genre, count]) => ({ name: genre, count })));
};

  const refreshAccessToken = async () => {
    const refresh_token = getRefreshToken();
    if (!refresh_token) return;
    const response = await fetch('https://spotify-rewind-backend.onrender.com/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token }),
    });

    const contentType = response.headers.get('content-type' || '');

    if (!contentType.includes('application/json')) {
      const text = await response.text();
      console.error(`Expected JSON response, but got: ${text}`);
      throw new Error(`Expected JSON response, but got: ${text}`);
    }

    const data = await response.json();

    if(data.Success) {
      localStorage.setItem('accessToken', data.access_token);
      setToken(data.access_token);
      return true;
    } else {
      localStorage.clear();
      window.location.href = '/';
      return false;
    }
  }

  const fetchUser = async (token) => {
    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    setUser(data);
  }
  

  const fetchNowPlaying = async (token) => {
    const response = await fetch('https://api.spotify.com/v1/me/player', {
      headers: {
        Authorization: `Bearer ${token}`,
        },
      },
  );

    if (response.status === 401) {
      console.warn('Access token expired. Attempting refresh...');
      let attempt = await refreshAccessToken();
      if (attempt) {
        window.location.reload();
        } else {
        // Refresh failed — force logout
        localStorage.clear();
        setToken(null);
        window.location.href = '/'; // or show login screen
        return null;
      }
    }
    if (!response ||response.status === 204) {
      setCurrentlyPlaying(null);
      setDevice(false);
      return;
    }

    const data = await response.json();
    const isPlaying = data.is_playing;
    const hasDevice = data.device && data.device.is_active;
    setDevice(hasDevice);
    
    
    if (hasDevice) {
      setLastKnownTrack(data);

      if (isPlaying) {
        setCurrentlyPlaying(data);
      } else {
        setCurrentlyPlaying(null);
      }
    }else {
      setCurrentlyPlaying(null);
      setLastKnownTrack(null);
    }
  }

  const fetchRecentlyPlayed = async (token) => {
    const res = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=15', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  
    if (!res.ok) {
      console.error("Failed to fetch recently played");
      return;
    }
  
    const data = await res.json();
    setRecentlyPlayed(data.items);
    
  };

  const fetchTopArtists = async (token) => {
    const response = await fetch('https://api.spotify.com/v1/me/top/artists?limit=8', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    setTopArtists(data.items);
    getTopGenres(data.items);
  };

  const pauseTrack = async (token) => {
    await fetch('https://api.spotify.com/v1/me/player/pause', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchNowPlaying(token);
  };
  
  const resumeTrack = async (token) => {
    await fetch('https://api.spotify.com/v1/me/player/play', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchNowPlaying(token);
  };
  
  const skipToNext = async (token) => {
    await fetch('https://api.spotify.com/v1/me/player/next', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    setPosition(0);
    fetchNowPlaying(token);
  };
  
  const skipToPrevious = async (token) => {
    await fetch('https://api.spotify.com/v1/me/player/previous', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    setPosition(0);
    fetchNowPlaying(token);
  };

  const seekToPosition = async (token, position) => {
    await fetch(`https://api.spotify.com/v1/me/player/seek?position_ms=${position}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchNowPlaying(token);
  };

  const fetchTopTracks = async (token) => {
    const response = await fetch('https://api.spotify.com/v1/me/top/tracks?limit=10', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    setTopTracks(data.items);
  };

  

  const getuserSummaryData = async (topArtists, topTracks, recentlyPlayed, topGenres) => {
    const userDataSummary = {
      topArtists: topArtists,
      topTracks: topTracks,
      recentlyPlayed: recentlyPlayed,
      topGenres: topGenres,
    }
    
    const res = await fetch('https://spotify-rewind-backend.onrender.com/api/summary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userDataSummary),
    });

    const data = await res.json();
    setSummary(data.summary);
    
  }

  //updating now playing
  useEffect(() => {
    if (!token) return;
  
    const interval = setInterval(() => {
      fetchNowPlaying(token); // your existing function
    }, 4000); // every 4 seconds
  
    return () => clearInterval(interval); // cleanup on unmount
  }, [token]);

  //updating recently played
  useEffect(() => {
    if (!token) return;
  
    const interval = setInterval(() => {
      fetchRecentlyPlayed(token); // your existing function
    }, 30 * 1000); // every 30 seconds
  
    return () => clearInterval(interval); // cleanup on unmount
  }, [token]);

  return (
    <>
    <div className="dynamic-bg" />
    <div id="mouse-shadow"></div>
    <div style={{display: 'flex', alignItems: 'center',justifyContent: 'space-between', backgroundColor: 'rgba(1, 18, 3, 0.9)', width: '100%', position: 'fixed', top: '0', right: '0',zIndex: '2', }}>
            <UserProfile user={user} />
            <h1 style={{ marginRight: '4rem'}}>Spotify Rewind</h1>
            <Logout setToken={setToken} user={user}/>
          </div>
    <div className="main-cotent">
      {!token ? (
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
          <img src="/favicon.png" alt="Spotify Logo" className="spotify-logo" style={{ width: '10rem', height: '10rem', marginBottom: '2rem'}} />
          <Login />
        </div>
      ) : (
        <>
          <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', width: '100%', flexWrap: 'wrap', position: 'relative', marginTop: '10rem'}}>
            <div style={{ zIndex: '1', width: '100%', maxWidth: '20rem'}}>
              <TrackList tracks={topTracks} device={device} token={token} />
            </div>

            <div style={{ zIndex: '1', width: '100%', maxWidth: '40rem', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <TopArtists topArtists={topArtists} />
            <TopGenres topGenres={topGenres} />
            <div className="ai-summary" style={{margin: '6rem 0', backgroundColor: 'rgba(0, 0, 0, 0.1)', padding: '2rem', borderRadius: '1rem', boxShadow: '-5px 6px 12px rgba(0, 0, 0, 0.5)', width: '100%', maxWidth: '30rem'}}>
              <h2 style={{backgroundColor: 'rgba(1, 18, 3, 0.2)', padding: '1rem', borderRadius: '1rem', boxShadow: '-5px 6px 12px rgba(0, 0, 0, 0.5'}}>Your Spotify Summary</h2>
              {summary ? (
                <div style={{backgroundColor: 'rgba(1, 18, 3, 0.2)', padding: '2rem', borderRadius: '1rem', boxShadow: '-5px 6px 12px rgba(0, 0, 0, 0.5)'}}dangerouslySetInnerHTML={{ __html: summary}}></div>
              ) : (
                <div className='spinner' />
              )}
            </div>
            </div>

            <div style={{ zIndex: '1', width: '100%', maxWidth: '20rem'}}>
              <RecentlyPlayed recently_played={recentlyPlayed} device={device} token={token} />
            </div>

          </div>
            <div style={{position: 'fixed', bottom: '0', left: '50%', transform: 'translate(-50%, -50%)', zIndex: '2'}}>
              <NowPlaying 
                current={currentlyPlaying} 
                fallback={lastKnownTrack}
                device={device}
                token={token}
                onPause={pauseTrack}
                onPlay={resumeTrack}
                onNext={skipToNext}
                onPrevious={skipToPrevious}
                onSeek={seekToPosition}
                position={position}
                setPosition={setPosition}
              />
            </div>
        </>
      )}
    </div>
    </>
  );
}

export default App;