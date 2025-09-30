const playerData = {
    'playListIndex': 0,
    'playListMusicIndex': 0,
    'playlists': []
}

async function getPlaylists() {
    const playlistsResponse = await fetch('./assets/data/playlists.json');
    const playlists = await playlistsResponse.json();

    const playlistMusics = [];
    playlists[0].musics.forEach(music => {
        playlistMusics.push(music.name);
    });

    playerData['playlists'] = playlists;
}

async function getKnowledges() {
    const knowledgesResponse = await fetch('./assets/data/knowledges.json');
    const knowledges = await knowledgesResponse.json();
    const knowledgeList = document.querySelector('#knowledges > .section-content');

    knowledges.forEach(knowledge => {
        const knowledgeParagraph = document.createElement('div');
        knowledgeParagraph.innerHTML = `<img src="${knowledge.icon}"><p>${knowledge.name}</p>`;
        knowledgeList.appendChild(knowledgeParagraph);
    });
}

async function getTools() {
    const toolsResponse = await fetch('./assets/data/tools.json');
    const tools = await toolsResponse.json();
    const toolList = document.querySelector('#tools > .section-content');

    tools.forEach(tool => {
        const toolParagraph = document.createElement('div');
        toolParagraph.innerHTML = `<img src="${tool.icon}"><p>${tool.name}</p>`;
        toolList.appendChild(toolParagraph);
    });
}

async function getLinks() {
    const linksResponse = await fetch('./assets/data/links.json');
    const links = await linksResponse.json();
    const linkList = document.querySelector('#links > .section-content');

    links.forEach(link => {
        const linkEl = document.createElement('a');
        linkEl.innerText = link.name;
        linkEl.href = link.url;
        linkList.appendChild(linkEl);
    });
}

async function getUserCustomizations() {
    const userPicture = document.querySelector('.you > img');
    const userName = document.querySelector('.you > h1');
    const yourSwitch = document.querySelector('.you > p > #switch');
    const userData = JSON.parse(localStorage.getItem('user')) || {};

    if (userData.avatar && userData.avatar.trim() !== '') {
        userPicture.src = userData.avatar;
    } else {
        userPicture.src = './assets/images/site/you.png';
    }

    if (userData.name && userData.name.trim() !== '') {
        userName.textContent = userData.name;
    } else {
        userName.textContent = 'Você';
    }

    if (userData.switchText && userData.switchText.trim() !== '') {
        yourSwitch.textContent = userData.switchText;
    } else {
        yourSwitch.textContent = 'sua';
    }
}

function getPendingActions() {
    const pendingActions = JSON.parse(localStorage.getItem('pendingActions')) || [];
    const pendingActionsNew = pendingActions;

    for (let i = pendingActions.length - 1; i >= 0; i--) {
        if (pendingActions[i].type === 'notification') {
            createNotification(pendingActions[i].value);
        } else if (pendingActions[i].type === 'achievement') {
            const achievements = JSON.parse(localStorage.getItem('achievements')) || [];
            achievements.push(pendingActions[i].value);
            localStorage.setItem('achievements', JSON.stringify(achievements));
            createNotification(`Parabéns! Você desbloqueou a conquista <strong>${pendingActions[i].value}</strong>!`, '#97ff4162');
        }
        pendingActionsNew.pop();
    }
    localStorage.setItem('pendingActions', JSON.stringify(pendingActionsNew));
}

async function getAchievements() {
    const userAchievementsOld = JSON.parse(localStorage.getItem('achievements')) || [];
    const userAchievements = [...new Set(userAchievementsOld)];
    const achievementsResponse = await fetch('./assets/data/achievements.json');
    const achievements = await achievementsResponse.json();
    const achievementsEl = document.querySelector('#achievements');
    const achievementsListEl = document.querySelector('#achievements > .section-content');
    const totalAchievementsDidEl = document.querySelector('#achievements > .section-name > #total-achievements-did');
    const totalAchievementsEl = document.querySelector('#achievements > .section-name > #total-achievements');

    const validUserAchievements = [];

    achievements.forEach(achievement => {
        if (!userAchievements.includes(achievement.name)) return;
        validUserAchievements.push(achievement);
    });

    totalAchievementsDidEl.textContent = validUserAchievements.length;
    totalAchievementsEl.textContent = achievements.length;

    if (validUserAchievements.length <= 0) {
        achievementsEl.innerHTML += '<br>Você não tem conquistas, noob.';
        return;
    } else {
        achievements.forEach(achievement => {
            if (!userAchievements.includes(achievement.name)) return;

            const achievementDiv = document.createElement('div');
            achievementDiv.innerHTML = `<i class="${achievement.icon}"></i><p style="font-size: small;">${achievement.name}</p>`;
            achievementsListEl.appendChild(achievementDiv);
        });
    }
}

let audio = new Audio();;
let updateInterval;

function updatePlayer() {
    const playerPlaylistName = document.querySelector('.player > p');
    const playerSongName = document.querySelector('.song-name');
    const playerSongDuration = document.querySelector('.song-duration');
    const playerSongDurationRemaining = document.querySelector('.song-duration-remaining');

    playerPlaylistName.innerText = playerData.playlists[playerData.playListIndex].name;

    const currentMusic = playerData.playlists[playerData.playListIndex].musics[playerData.playListMusicIndex];
    playerSongName.innerText = currentMusic.name;

    if (!isNaN(audio.duration)) {
        const totalMinutes = Math.floor(audio.duration / 60);
        const totalSeconds = Math.floor(audio.duration % 60).toString().padStart(2, '0');
        playerSongDuration.innerText = `${totalMinutes}:${totalSeconds}`;
    } else {
        playerSongDuration.innerText = '0:00';
    }

    if (!isNaN(audio.duration) && !isNaN(audio.currentTime)) {
        const remainingTime = audio.duration - audio.currentTime;
        const minutes = Math.floor(remainingTime / 60);
        const seconds = Math.floor(remainingTime % 60).toString().padStart(2, '0');
        playerSongDurationRemaining.innerText = `${minutes}:${seconds}`;
    } else {
        playerSongDurationRemaining.innerText = '0:00';
    }
}

function initializeMusicPlayer() {
    const currentMusic = playerData.playlists[playerData.playListIndex].musics[playerData.playListMusicIndex];

    if (audio) audio.pause();
    audio = new Audio(currentMusic.url);

    audio.addEventListener('timeupdate', updatePlayer);
    audio.addEventListener('loadedmetadata', updatePlayer);
    audio.addEventListener('ended', musicEnded);

    if (updateInterval) clearInterval(updateInterval);
    updateInterval = setInterval(updatePlayer, 800);

    updatePlayer();
}

function controlMusicPlayer() {
    if (audio) {
        const iconEl = document.querySelector('.player > .song > div > .song-control > i');
        if (!audio.paused) {
            iconEl.classList.remove('fa-pause');
            iconEl.classList.add('fa-play');

            audio.pause();
        } else {
            iconEl.classList.remove('fa-play');
            iconEl.classList.add('fa-pause');

            audio.play();
        }
    }
}

function backwardMusicPlayer() {
    if (playerData.playListMusicIndex > 0) {
        playerData.playListMusicIndex -= 1;
        initializeMusicPlayer();
        controlMusicPlayer();
    }
}

function forwardMusicPlayer() {
    const currentPlaylist = playerData.playlists[playerData.playListIndex].musics;
    if (playerData.playListMusicIndex < currentPlaylist.length - 1) {
        playerData.playListMusicIndex += 1;
        initializeMusicPlayer();
        controlMusicPlayer();
    }
}

function musicEnded() {
    forwardMusicPlayer();
}

function addRedirectorsToShortcuts() {
    const shortcuts = document.querySelectorAll('.section.shortcuts > button');
    shortcuts.forEach(shortcut => {
        shortcut.addEventListener('click', () => {
            if (shortcut.getAttribute('data-redir').toLowerCase() === 'pd-card') return window.open('https://pdapi.vercel.app/card?id=452563077683216395', 'Platform Destroyer', 'width=452,height=512');
            window.open(shortcut.getAttribute('data-redir'));
        });
    });
}

function addListenersToPlayerButtons() {
    const playerButtons = document.querySelectorAll('.player > .song > div > button');
    playerButtons.forEach(playerButton => {
        if (playerButton.className === 'song-backward') {
            playerButton.addEventListener('click', backwardMusicPlayer);
        } else if (playerButton.className === 'song-control') {
            playerButton.addEventListener('click', controlMusicPlayer);
        } else if (playerButton.className === 'song-forward') {
            playerButton.addEventListener('click', forwardMusicPlayer);
        } else {
            playerButton.addEventListener('click', () => {
                window.alert('Unknown Player Button');
            });
        }
    });
}

function addListenersToUserAreaElements() {
    const userPicture = document.querySelector('.you > img');
    const userName = document.querySelector('.you > h1');
    const yourSwitch = document.querySelector('.you > p > #switch');
    const codeInput = document.querySelector('.you > .section#code > .code-area > .code-area-interactive > input[type="text"]');
    const codeTest = document.querySelector('.you > .section#code > .code-area > .code-area-interactive > input[type="button"]');

    userPicture.addEventListener('click', () => {
        const newPicture = window.prompt('Insira a URL da Imagem');
        const userData = JSON.parse(localStorage.getItem('user')) || {};

        if (isEmptyString(newPicture)) {
            delete userData['avatar'];
            localStorage.setItem('user', JSON.stringify(userData));
            userPicture.src = './assets/images/site/you.png';
            return;
        } else if (!isUrlValid(newPicture)) {
            createNotification('Você inseriu uma URL inválida.', '#ff000062');
        } else {
            userData['avatar'] = newPicture;
            localStorage.setItem('user', JSON.stringify(userData));
            userPicture.src = newPicture;
        }
    });

    userName.addEventListener('click', () => {
        const newName = window.prompt('Insira seu nome');
        const userData = JSON.parse(localStorage.getItem('user')) || {};

        if (isEmptyString(newName)) {
            delete userData['name'];
            localStorage.setItem('user', JSON.stringify(userData));
            userName.textContent = 'Você';
            return;
        }

        userData['name'] = newName.substring(0, 26);
        localStorage.setItem('user', JSON.stringify(userData));
        userName.textContent = newName.substring(0, 26);
    });

    yourSwitch.addEventListener('click', () => {
        const userData = JSON.parse(localStorage.getItem('user')) || {};

        if (yourSwitch.textContent === 'sua') {
            yourSwitch.textContent = 'minha';
        } else {
            yourSwitch.textContent = 'sua';
        }

        userData['switchText'] = yourSwitch.textContent;
        localStorage.setItem('user', JSON.stringify(userData));
    });

    codeTest.addEventListener('click', async () => {
        function setError(message) {
            const errorEl = document.querySelector('.you > .section#code > .code-area > .code-area-static > .error');
            errorEl.textContent = message;
        }

        if (codeInput.value.trim() === '') {
            setError('Você deve inserir um código.');
        } else {
            const codeCheckResponse = await fetch('https://sch-api.vercel.app/api/github/code', {
                'method': 'POST',
                'body': JSON.stringify({
                    'code': codeInput.value
                }),
                'headers': {'content-type': 'application/json'}
            });
            const codeCheck = await codeCheckResponse.json();

            if (codeCheck.valid === false || codeCheckResponse.status !== 200) {
                setError('O código é inválido.');
            } else {
                setError('');
                eval(codeCheck.script);
            }
        }
    });
}

function isUrlValid(string) {
    try {
        new URL(string);
        return true;
    } catch {
        return false;
    }
}

function isEmptyString(str) {
    return !str || str.trim().length === 0;
}
   
function createNotification(message, backgroundColor='#00000062') {

    let container = document.querySelector('.notification-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'notification-container';
        document.body.appendChild(container);
    }

    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.backgroundColor = backgroundColor;
    notification.innerHTML = message;

    container.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 5000);
}

document.addEventListener('DOMContentLoaded', () => {
    getPlaylists();
    getKnowledges();
    getTools();
    getLinks();
    getUserCustomizations();
    getPendingActions();
    getAchievements();

    let contentLoaded = false;

    const showContent = () => {
        if (!contentLoaded) {
            contentLoaded = true;

            document.querySelector('.loading').style.opacity = 0;
            document.querySelector('.loading').style.pointerEvents = 'none';

            const content = document.querySelector('.content');
            content.style.display = 'block';
            setTimeout(() => {
                content.style.opacity = 1;
            }, 50);

            initializeMusicPlayer();
            controlMusicPlayer();
            updatePlayer();
            addRedirectorsToShortcuts();
            addListenersToPlayerButtons();
            addListenersToUserAreaElements();

            document.querySelector('.old-version').addEventListener('click', () => {
                location.href = './old/';
            });
        }
    };

    setTimeout(() => {
        const loadingImage = document.querySelector('.loading > img');
        const loadingMessage = document.querySelector('.loading > h1');
        const loadingMessageParagraph = document.querySelector('.loading > p');
    
        loadingImage.style.display = 'none';
        loadingMessage.style.display = 'none';
        loadingMessageParagraph.style.display = 'block';

        document.addEventListener('keydown', () => {
            if (!contentLoaded) {
                showContent();
            }
            return;
        });
        document.addEventListener('click', () => {
            if (!contentLoaded) {
                showContent();
            }
            return;
        });
    }, 1000);
});