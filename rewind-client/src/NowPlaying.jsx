import {  useEffect, useState } from "react";

function NowPlaying({ current, fallback, device, token, onPlay, onPause, onNext, onPrevious, onSeek, position,setPosition }) {
    
    
    const data = current || fallback;
    const isPlaying = current?.is_playing || false;
    const duration = data?.item?.duration_ms || 0 ;
    const [nowPlayingVisible, setNowPlayingVisible] = useState(isPlaying);


    useEffect(() => {
        let interval = null;
        if (isPlaying) {
            interval = setInterval(() => {
                setPosition((prev)=> Math.min(prev + 1000, duration));
            }, 1000);
        }else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isPlaying, duration, setPosition]);

    useEffect(() => {
        if (data?.item?.id && typeof data.progress_ms === 'number') {
            setPosition(data.progress_ms);
        }
    }, [data?.item?.id, data?.progress_ms, setPosition]);

    if ((!current?.item && !fallback?.item)|| !device) {
        return null;
    }
    
    const track = data.item ;
    const image = track.album.images[0].url ;
    const artist = track.artists[0].name ;

    const formatTime = (ms) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = ((ms % 60000) / 1000).toFixed(0);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };



    const handleSeek = (e) => {
        const newPos = Number(e.target.value);
        setPosition(newPos);
        onSeek(token, newPos);
    };

    return (
        <>
            {!nowPlayingVisible && (
            <button onClick={() => setNowPlayingVisible(true)} style={{backgroundColor: 'white', border: 'none', fontSize: '0.75rem', color: 'black', cursor: 'pointer', width: '300px', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem'}}>↑</button>
            )}
        {nowPlayingVisible && <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.9)', boxShadow: '0 6px 12px rgba(0, 0, 0, 0.5)',color: 'black', padding: '0 1rem', borderRadius: '10px'}}>
            {nowPlayingVisible && (
                <div className="now-playing-container">
                    <NowPlaying
                    // your props here
                    />
                    <button onClick={() => setNowPlayingVisible(false)} style={{position: 'absolute', top: '0', right: '0', backgroundColor: 'transparent', border: 'none', fontSize: '1rem', cursor: 'pointer', color: 'black'}}>↓</button>
                </div>
            )}

            
            {image && <img src={image} alt={track.name} width="80" style={{marginRight: '1rem', cursor: 'pointer'}} title={'Open in Spotify'} onClick={() => {
                window.open(track.external_urls.spotify, '_blank', 'noopener,noreferrer');
            }}/>}
            <div style={{ marginTop: '0' }}>
            <p><strong>{data.item.name}</strong> by {data.item.artists[0].name}</p>
            <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                <span style={{fontSize: '0.8em'}}>{formatTime(position)}</span>
                <input
                    type="range"
                    min={0}
                    max={duration}
                    value={position}
                    onChange={handleSeek}
                    style={{width: '300px', margin: '0 10px', cursor: 'pointer', accentColor: 'white'}}
                />
                <span style={{fontSize: '0.8em'}}>{formatTime(duration)}</span>
            </div>
                <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                <button style={{width: '50px', outline: 'none', backgroundColor: 'transparent', color: 'black', fontSize: '1.5rem', border: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center'}} onClick={() => onPrevious(token)}>⏮</button>
                {isPlaying ? (
                    <button style={{width: '50px', outline: 'none', backgroundColor: 'transparent', color: 'black', fontSize: '1.5rem', border: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center'}} onClick={() => onPause(token)}>⏸</button>
                ) : (
                    <button style={{width: '50px', outline: 'none', backgroundColor: 'transparent', color: 'black', fontSize: '1.5rem', border: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center'}} onClick={() => onPlay(token)}>▶</button>
                )}
                <button style={{width: '50px', outline: 'none', backgroundColor: 'transparent', color: 'black', fontSize: '1.5rem', border: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center'}} onClick={() => onNext(token)}>⏭</button>
            </div>  
            </div>
        </div>}
        </>
    );
}

export default NowPlaying;