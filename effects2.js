document.addEventListener('DOMContentLoaded', () => {
    const config = JSON.parse(localStorage.getItem("profileConfig")) || {};
    const discordId = config.discordId || "1090720728946593862";

    const imgSrc = `https://lanyard.cnrad.dev/api/${discordId}?bg=00000000&animated=true&showSpotify=true&showDisplayName=true&hideActivity=true`;
    const imgElement = document.getElementById('rpc');
    if (imgElement) imgElement.src = imgSrc;

    const socket = new WebSocket("wss://api.lanyard.rest/socket");

    socket.onopen = () => {
        socket.send(JSON.stringify({
            op: 2,
            d: {
                subscribe_to_id: discordId
            }
        }));
    };

    socket.onmessage = (message) => {
        const data = JSON.parse(message.data);
        console.log("[Lanyard] Received data:", data);

        const trackElement = document.getElementById("track");
        const activityElement = document.getElementById("activity");
        const avatarImg = document.getElementById("user-avatar");
        const decoImg = document.getElementById("user-decoration");

        if (data.t === "INIT_STATE" || data.t === "PRESENCE_UPDATE") {
            const spotify = data.d.spotify;
            const activities = data.d.activities || [];
            const user = data.d.discord_user;

            const avatar = user.avatar;
            const decoration = user.avatar_decoration;
            const userId = user.id;

            const avatarUrl = avatar.startsWith("a_")
                ? `https://cdn.discordapp.com/avatars/${userId}/${avatar}.gif?size=128`
                : `https://cdn.discordapp.com/avatars/${userId}/${avatar}.png?size=128`;

            const decorationUrl = decoration
                ? `https://cdn.discordapp.com/avatar-decorations/${userId}/${decoration}.png`
                : null;

            if (avatarImg) avatarImg.src = avatarUrl;
            if (decoImg) {
                if (decorationUrl) {
                    decoImg.src = decorationUrl;
                    decoImg.style.display = "block";
                } else {
                    decoImg.style.display = "none";
                }
            }

            if (spotify) {
                const trackName = spotify.song;
                const artist = spotify.artist;
                const link = spotify.track_url;
                const albumArt = spotify.album_art_url;

                trackElement.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <img src="${albumArt}" alt="Album Art" style="width: 48px; height: 48px; border-radius: 6px;">
                        <div>
                            🎵 <a href="${link}" target="_blank" style="color:#1DB954;">${trackName}</a><br>
                            <span style="opacity: 0.8;">${artist}</span>
                        </div>
                    </div>
                `;
            } else {
                trackElement.innerHTML = `<span style="opacity: 0.7;">🎗 Not playing anything right now</span>`;
            }

            const nonSpotifyActivity = activities.find(a => a.name !== "Spotify" && a.type === 0);
            if (nonSpotifyActivity) {
                let gameImageUrl = null;
                if (nonSpotifyActivity.assets?.large_image) {
                    const imgId = nonSpotifyActivity.assets.large_image;
                    const appId = nonSpotifyActivity.application_id;

                    if (imgId.startsWith("mp:")) {
                        gameImageUrl = `https://media.discordapp.net/${imgId.replace("mp:", "")}`;
                    } else {
                        gameImageUrl = `https://cdn.discordapp.com/app-assets/${appId}/${imgId}.png`;
                    }
                } else {
                    gameImageUrl = "./fallback-game.png";
                }

                activityElement.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <img src="${gameImageUrl}" alt="Game Cover" style="width: 48px; height: 48px; border-radius: 6px;">
                        <div>
                            🎮 Playing <b>${nonSpotifyActivity.name}</b>
                        </div>
                    </div>
                `;
            } else {
                activityElement.innerHTML = `<span style="opacity: 0.6;">Not playing any game</span>`;
            }
        }
    };
});
