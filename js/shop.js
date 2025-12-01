// 상점에서 파는 아이템 목록
const SHOP_ITEMS = [
    {
        id: 'hp_potion',
        name: '체력 물약',
        price: 5,
        desc: '체력 2 회복',
    },
    {
        id: 'double_dice',
        name: '더블 주사위',
        price: 7,
        desc: '다음 주사위 눈금 +2',
    },
    {
        id: 'life_dice',
        name: '생명의 주사위',
        price: 10,
        desc: '다음 주사위 눈금 / 2 만큼 체력 회복',
    },
    {
        id: 'great_dice',
        name: '위대한 주사위',
        price: 15,
        desc: '다음 주사위 최소/최대 눈금 +2',
    },
    {
        id: 'levelup_dice',
        name: '레벨 업 주사위',
        price: 21,
        desc: '주사위 최소/최대 눈금 +1 (영구)',
    },
];

const shopSystem = {
    init() {
        const exitBtn = document.getElementById('exit-shop'); //상점 나가는 버튼.
        if (exitBtn) {
            exitBtn.addEventListener('click', function () {
                shopSystem.hideShop();
                updateUI();
                if (typeof battleSystem !== 'undefined' && battleSystem.startNewBattle) {
                    battleSystem.startNewBattle();
                }
            });
        }
    },

    initShop() {
        const shop_UI = document.getElementById('shop_UI');
        const hadgold = document.getElementById('shop-gold');
        if (!shop_UI || !hadgold) return;
        // 보유 골드 갱신해주기
        hadgold.textContent = `보유골드: ${gameState.player.gold}G`;

        // 아이템 리스트 그리기
        this.renderItems();
    },


    showShop() {
        //전투 씬일시에 전투ui 숨기기
        const gameContainer = document.getElementById('battle_UI');
        if (gameContainer) {
            gameContainer.style.display = 'none';
        }
        //상점 창 띄우기.
        const shop_UI = document.getElementById('shop_UI');
        if (!shop_UI) return;

        this.initShop();
        shop_UI.style.display = 'flex';
        shop_UI.style.justifyContent = 'center';
        shop_UI.style.alignItems = 'center';

    },

    hideShop() {
        // 상점 숨기기
        const shop_UI = document.getElementById('shop_UI');
        if (shop_UI) {
            shop_UI.style.display = 'none';
        }

        // 게임 UI 다시 표시
        const gameContainer = document.getElementById('battle_UI');
        if (gameContainer) {
            gameContainer.style.display = 'block';
        }
    },

    renderItems() {
        const shopList = document.getElementById('shop-item-list');
        if (!shopList) return;

        shopList.innerHTML = "";

        for (let i = 0; i < SHOP_ITEMS.length; i++) {
            const itemData = SHOP_ITEMS[i];

            const itemRow = document.createElement('div');
            itemRow.className = 'shop-item';

            itemRow.innerHTML = `
            <div class="shop-item-info">
                <div class="shop-item-name">${itemData.name}</div>
                <div class="shop-item-desc">${itemData.desc}</div>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
                <div class="shop-item-price">${itemData.price}G</div>
                <button class="action-btn" style="aspect-ratio:auto; padding:4px 10px;">구입</button>
            </div>
        `;

            const buyBtn = itemRow.querySelector('.action-btn');
            if (buyBtn) {
                buyBtn.addEventListener('click', function () {
                    shopSystem.buyItem(itemData);
                });
            }

            shopList.appendChild(itemRow);
        }
    },


    buyItem(item) {
        if (gameState.player.gold < item.price) {
            alert('골드가 부족합니다!');
            return;
        }

        gameState.player.gold -= item.price;

        // 인벤토리에 추가
        inventorySystem.addItem(item.name, 1);

        // 상단 골드 UI 갱신
        const goldTag = document.getElementById('player-gold');
        if (goldTag) {
            goldTag.innerText = gameState.player.gold;
        }

        const shopGold = document.getElementById('shop-gold');
        if (shopGold) {
            shopGold.textContent = `보유골드: ${gameState.player.gold}G`;
        }

        alert(`${item.name}을(를) 구매했습니다!`);
    },

};