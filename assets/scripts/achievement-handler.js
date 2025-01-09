const pageId = document.querySelector('#pageId').value;

function addAchievement(achievementName) {
    const pendingActions = JSON.parse(localStorage.getItem('pendingActions')) || [];
    pendingActions.push({
        'type': 'achievement',
        'value': achievementName
    });
    localStorage.setItem('pendingActions', JSON.stringify(pendingActions));
}

document.addEventListener('DOMContentLoaded', async () => {
    const userAchievementsOld = JSON.parse(localStorage.getItem('achievements')) || [];
    const userAchievements = [...new Set(userAchievementsOld)];
    const achievementsResponse = await fetch('./assets/data/achievements.json');
    const achievementsObjects = await achievementsResponse.json();
    const achievements = [];

    achievementsObjects.forEach(achievementObject => {
        achievements.push(achievementObject.name);
    });

    achievements.forEach(achievement => {
        if (!userAchievements.includes(achievement.name)) {
            setTimeout(() => {
                eval(achievement.script);
            }, 1000);
        }
    });
});