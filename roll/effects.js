/** @typedef {"Addition" | "Multiplication" | "Heal"} ModifierType */

/** @class */
class Effect {
	/**
	 * @param {string} name
	 * @param {ModifierType} modifierType
	 * @param {number} modifierAmount
	 * @param {boolean} direct - 라인 보너스나 특수형 계산에 영향을 주도록 눈금을 직접 변경하는지 여부
	 */
	constructor(name, modifierType, modifierAmount, direct = true) {
		this.name = name;
		this.modifierType = modifierType;
		this.modifierAmount = modifierAmount;
		this.direct = direct;
	}
}

const EffectsList = {
	doubleDice: new Effect("더블", "Addition", 2),
	lifeDice: new Effect("회복", "Heal", 0),
}

let itemPopUp = document.createElement("div");
itemPopUp.id = "itemPopUp";
itemPopUp.style = "display: none;";
document.body.appendChild(itemPopUp);

const itemSelectionOverlay = document.getElementById("overlay");

/** @typedef { "normal" | "selection" } controlMode */

const itemControl = {
	/** @type {controlMode} */
	mode: "normal",

	/** @type {int} */
	itemIndex: undefined,

	/** @type {Effect} */
	effect: undefined,

	onItemUse(index, effect) {
		itemControl.effect = effect;
		itemControl.itemIndex = index;
		cells.forEach((cell) => {
			cell.section.draggable = false;
			cell.section.dataset.selectmode = true;
			cell.section.style.zIndex = "20";
		});

		document.addEventListener("keyup", (ev) => {
			if (itemControl.mode == "selection" && ev.key == "Escape") {
				console.log(ev);
				
				itemControl.onItemExit();
			}
		});

		itemPopUp.innerHTML = `
			${gameState.player.items[index].name}을 적용할 칸을 선택하세요<br>
			<div style="font-size: 70%;">ESC를 눌러 취소</div>
		`;
		itemPopUp.style = "display: inline; z-index: 20;";
		itemSelectionOverlay.style.display = "block";

		this.mode = "selection";
	},

	onItemExit(used = false) {
		cells.forEach((cell) => {
			cell.section.draggable = (!cell.isLocked && cell.isLocked != undefined);
			cell.section.dataset.selectmode = false;
			cell.section.style.zIndex = "0";
			cell.updateContent();
		});

		if (used) inventorySystem.itemUsed(this.itemIndex);

		this.itemIndex = undefined;
		this.effect = undefined;

		itemPopUp.style.display = "none";
		itemSelectionOverlay.style.display = "none";

		this.mode = "normal";
	},

	updateItemInfo() {
		const itemInfo = document.getElementById("item-info");
		let itemInfoText = "";
		cells.forEach((e) => {
			if (e.effectsString.length > 1)
				itemInfoText += `${e.effectsString}\r\n`;
		});

		itemInfoText = itemInfoText.trimEnd();
		itemInfo.textContent = itemInfoText;
	},
}