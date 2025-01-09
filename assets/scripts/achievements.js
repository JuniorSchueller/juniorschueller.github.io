async function getAchievements() {
    const achievementsResponse = await fetch('./assets/data/achievements.json');
    const achievements = await achievementsResponse.json();

    const achievementsList = document.querySelector('#achievements > .section-content');
    const hintEl = document.querySelector('.hint');

    achievements.forEach(achievement => {
        const achievementDiv = document.createElement('div');
        achievementDiv.innerHTML = `<i class="${achievement.icon}"></i><p style="font-size: small;">${achievement.name}</p>`;
        achievementsList.appendChild(achievementDiv);

        achievementDiv.addEventListener('mouseenter', (event) => {
            hintEl.textContent = achievement.hint;
            hintEl.style.opacity = '1';
            hintEl.style.transform = 'translate(-50%, -20px)';
            hintEl.style.left = `${event.pageX}px`;
            hintEl.style.top = `${event.pageY}px`;
        });

        achievementDiv.addEventListener('mouseleave', () => {
            hintEl.style.opacity = '0';
            hintEl.style.transform = 'translate(-50%, -10px)';
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    getAchievements();
});