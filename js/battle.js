// 주사위 굴리기 함수
function rollDice(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 전투 시스템
const battleSystem = {
    attackButton: document.getElementById('attack-button'),

    init() {
        if (this.attackButton) {
            this.attackButton.addEventListener('click', (ev) => {
                onRollClick(ev);
            });
        }
    },

    startNewBattle() {
        // 새로운 전투 시작시 적 정보 초기화 이부분에서 밸런스 설정해야함.
        gameState.enemy.hp = gameState.enemy.maxHp;
        document.getElementById('enemy-hp').textContent = gameState.enemy.hp;
        // 전투 버튼 활성화
        document.getElementById('attack-button').disabled = false;
		// 판 초기화
		initialize();
    },

    rollDice(playerRoll) {
        // 플레이어 주사위. 값은 해당 메서드를 호출한 roll.js/onConfirmClick()에서 주어짐
        alert(`당신의 주사위: ${playerRoll}`);
        gameState.enemy.hp -= playerRoll;
        document.getElementById('enemy-hp').textContent = gameState.enemy.hp;
        alert(`적에게 ${playerRoll}데미지!`);

        if (gameState.enemy.hp <= 0) {
            this.onBattleWin();
            return;
        }

        // 적 주사위
        const enemyRoll = rollDice(gameState.enemy.Min_dice, gameState.enemy.Max_dice);

        alert(`적의 주사위: ${enemyRoll}`);
        gameState.player.hp -= enemyRoll;
        document.getElementById('player-hp').textContent = gameState.player.hp;
        alert(`${enemyRoll}의 피해를 입었습니다!`);

		if (gameState.player.hp <= 0) {
			this.onBattleLose();
		}
    },

    onBattleWin() {
        // 전투 버튼 비활성화
        this.attackButton.disabled = true;

        // 승리 처리
        setTimeout(function () {
            alert('전투 승리! 20G를 획득하였습니다.');
            floorSystem.nextFloor();
        }, 100);
    },

    onBattleLose() {
        // 전투 버튼 비활성화
        this.attackButton.disabled = true;

        // 게임 재시작
        setTimeout(function () {
            alert('게임 오버...');
            location.reload();
        }, 100);
    },
};

// 전투 시스템 초기화
document.addEventListener('DOMContentLoaded', function () {
    battleSystem.init();
});