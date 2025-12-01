//main에다가 스토리 넣었고 floor.js에서 게임 끝났을때 엔딩스토리 나오게 해놨고, 게임 시작하는 부분에서 인트로 스토리 나오게 해놨음
const storyData = {
    intro: `마법이 존재하는 세계 <S-CODE:1162>, 그곳의 주민 앨리스는 한 탑 앞에 서 있었습니다.

"토끼씨 진짜 여기가 맞죠?"
"네 알겠습니다. 그럼 들어가죠"

신비의 책이 있다는 이 탑을 정복하기 위해 확률을 건 싸움을 시작하게 됩니다.`,

    ending: `앨리스는 결국 탑의 최상층에 올라 책을 얻었습니다.

"잠시만... 이거 왜 아무것도 안 적혀있죠..?"
"푸하핫! 아~~ 당해버렸네 앨리스!"
"속이신거에요?? 여기와서 얘기해요!!"

오늘도 평화로운 날이네요... 언제까지 이 상태가 유지될지는 모르겠네요..`
};


function showStory(type, onConfirm) {
    const storyUI = document.getElementById('story_UI');
    const storyText = document.getElementById('story-text');
    const confirmBtn = document.getElementById('story-confirm-btn');
    storyText.textContent = storyData[type];
    storyUI.style.display = 'flex';
    confirmBtn.onclick = () => {
        storyUI.style.display = 'none'; 
        if (typeof onConfirm === 'function') {
            onConfirm(); 
        }
    };
}

document.addEventListener('DOMContentLoaded', () => {
    
    shopSystem.init();
    const startBtn = document.getElementById('start-game-button');
    const start_UI = document.getElementById('start_UI');
    const gameContainer = document.getElementById('battle_UI');

    if (typeof updateMonsterUI === 'function') {
        updateMonsterUI(); 
    }
    if (startBtn) { //시작하는부분 처음에 스토리 뜨게하고 그다음에 전투 시작하도록 바꿈
        startBtn.addEventListener('click', () => {
            if (start_UI) start_UI.style.display = 'none';
            showStory('intro', () => {
                if (gameContainer) gameContainer.style.display = 'block';
                updateUI();
                battleSystem.startNewBattle();
            });
        });
    }
});