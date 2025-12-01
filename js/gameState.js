// 게임 상태 관리
const monsterData = {
    1: { // 1층: 레드 슬라임
        name: "레드 슬라임",
        image: "Red_Slime.png", // 이미지 경로
        maxHp: 30,
        Max_dice: 6,
        Min_dice: 1
    },
    2: { // 2층: 마법 골렘
        name: "마법 골렘",
        image: "Magic_Golem.png",
        maxHp: 40,
        Max_dice: 6,
        Min_dice: 1
    },
    3: { // 3층: 헤비골렘
        name: "헤비 골렘",
        image: "Heavy_Golem.png",
        maxHp: 50,
        Max_dice: 6,
        Min_dice: 1
    },
    4: { // 4층: 믹스 플라스크   
        name: "믹스 플라스크",
        image: "Mix.png",
        maxHp: 60,
        Max_dice: 6,
        Min_dice: 1
    },
    5: { // 5층: 이사벨라
        name: "이사벨라",
        image: "Isabella.png",
        maxHp: 70,
        Max_dice: 6,
        Min_dice: 1
    }
};

const gameState = {
    player: { // 플레이어 스탯
        hp: 10,
        maxHp: 10,
        gold: 150, //아이템 잘 사지나 컴파일용으로 돈많이 설정해둠
        Max_dice: 6,
        Min_dice: 1,

		/** 
		 * @typedef Item 
		 * @property {string} name
		 * @property {int} count
		*/

		/** @type {Item[]} */
        items: [], //아이템 인벤토리는 일단 만들어놧음.

        // 아래는 아이템 관련 버프
        // 레벨 업 주사위: 주사위 영구 보너스
        diceMinBonus: 0,
        diceMaxBonus: 0,

        // 일회성 버프
        buffs: {
            nextDiceFlatBonus: 0,   // 더블 주사위: 다음 주사위 최종 눈금 +n
            nextDiceMinPlus: 0,     // 위대한 주사위: 다음 주사위 최소 눈금 +n
            nextDiceMaxPlus: 0,     // 위대한 주사위: 다음 주사위 최대 눈금 +n
            nextDiceHpFromRoll: false, // 생명 주사위: true면 다음 확정 시 (점수/2)만큼 회복
        },
    },
    
    enemy: {
        name: monsterData[1].name,
        image: monsterData[1].image,
        maxHp: monsterData[1].maxHp,
        Max_dice: monsterData[1].Max_dice,
        Min_dice: monsterData[1].Min_dice
    }
};

// UI 업데이트 함수
function updateUI() {
    document.getElementById('player-hp').textContent = gameState.player.hp;
    document.getElementById('player-max-hp').textContent = gameState.player.maxHp;
    document.getElementById('player-gold').textContent = gameState.player.gold;
}

function updateMonsterUI() {
    document.getElementById('enemy-name').textContent = gameState.enemy.name;
    document.getElementById('enemy-hp').textContent = gameState.enemy.maxHp;
    const enemyImageElement = document.getElementById('enemy-image');
    if (enemyImageElement) {
        enemyImageElement.src = gameState.enemy.image;
        enemyImageElement.alt = gameState.enemy.name;
    }
}

