function showHelp() {
    const helpUI = document.getElementById('help_UI');
    if (helpUI) {
        helpUI.style.display = 'grid'; // UI를 보이게 설정
    }
}

function hideHelp() {
    const helpUI = document.getElementById('help_UI');
    if (helpUI) {
        helpUI.style.display = 'none'; // UI를 숨기게 설정
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const exitHelpButton = document.getElementById('exit-help');
    if (exitHelpButton) {
        exitHelpButton.addEventListener('click', hideHelp);
    }
});