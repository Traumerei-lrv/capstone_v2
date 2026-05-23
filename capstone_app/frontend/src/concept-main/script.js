const hitbox = document.querySelector('.screen-hitbox');
const popup = document.querySelector('.screen-popup');
const backdrop = document.querySelector('.screen-backdrop');
const screenArea = document.querySelector('.screen-area');

function openScreen() {
    popup.classList.remove('hidden');
    backdrop.classList.remove('hidden');
}

function closeScreen() {
    popup.classList.add('hidden');
    backdrop.classList.add('hidden');
}

hitbox.addEventListener('click', (e) => {
    e.stopPropagation();
    openScreen();
});

document.addEventListener('click', (e) => {
    if (!popup.classList.contains('hidden')) {
        const insideScreen = screenArea.contains(e.target);

        // console.log("INSIDE SCREEN:", insideScreen);

        if (!insideScreen) {
        closeScreen();
        }
    }
});