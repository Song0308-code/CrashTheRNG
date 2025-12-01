function getPlayerDiceRange() {
	const baseMin = gameState.player.Min_dice;
	const baseMax = gameState.player.Max_dice;

	const permMin = gameState.player.diceMinBonus;
	const permMax = gameState.player.diceMaxBonus;

	const tempMin = gameState.player.buffs.nextDiceMinPlus;
	const tempMax = gameState.player.buffs.nextDiceMaxPlus;

	return {
		min: baseMin + permMin + tempMin,
		max: baseMax + permMax + tempMax,
	};
}

/** @class */
class Cell {

	/** @type {HTMLElement} */
	section = undefined;

	/** @type {boolean} */
	#isLocked = false;
	get isLocked() { return this.#isLocked; }
	set isLocked(value) {
		this.#isLocked = value;
		this.section.dataset.locked = value;
		this.section.draggable = (!value && this.value != undefined);
		//console.log(this.section.dataset);
	}

	/** @type {boolean} */
	#isDetermined = false;
	get isDetermined() { return this.#isDetermined; }
	set isDetermined(value) {
		this.#isDetermined = value;
		this.section.dataset.determined = value;
	}

	/** @type {int} */
	#value = undefined;
	get value() { return this.#value };
	set value(val) {
		this.#value = val;
		this.#effectedValue = this.getEffectedValue();
		this.updateContent();
		this.section.draggable = (this.value != undefined);
	}

	#effectsString = "";
	get effectsString() {return this.#effectsString};
	set effectsString(val) {
		this.#effectsString = val;
		itemControl.updateItemInfo();
	}

	/** @type {Effect[]} */
	/** 아이템 사용·보스 효과 등을 통해 적용된 효과들 */
	#effects = [];
	get effects() { return this.#effects };
	set effects(val) { 
		this.#effects = val;
		this.#effectedValue = this.getEffectedValue();
		calculateScore();
		this.updateContent();

		if (this.effects.length == 0) return;

		let count = 0;

		let str = `칸 ${this.section.id[1]}: `;
		this.effects.forEach((e) => {
			if (e.name == "더블") count ++;
		});

		let doubleCounted = false;
		this.effects.forEach((e) => {
			if (e.name == "더블") {
				if (!doubleCounted) {
					str += `${e.name} x${count}, `;
					doubleCounted = true;
				}
			} else {
				str += `${e.name} x1, `;
			}
		});

		this.effectsString = str.slice(0, -2);
	}

	/** @type {int} */
	#effectedValue = undefined;
	get effectedValue() { return this.#effectedValue; }

	/** @type {int} */
	lineBonus = false;

	/** @param {HTMLElement} section  */
	constructor(section) {
		this.section = section;

		this.updateContent();

		this.section.addEventListener("contextmenu", (ev) => {
			if (itemControl.mode == "selection") {
				ev.preventDefault();
				itemControl.onItemExit();
				return;
			}

			if (this.value == undefined || this.isDetermined == true) return;
			ev.preventDefault();
			this.isLocked = !this.isLocked;

			if (rollCount >= maximumRolls) return;

			let lockedCells = 0;

			cells.forEach(c => {
				if (c.isLocked) lockedCells++;
			})

			if (lockedCells == cells.length) {
				attackButton.textContent = "확정!";
				isAllLocked = true;
			} else {
				attackButton.textContent = "DICE!";
				isAllLocked = false;
			}
		});

		this.section.ondragover = (ev) => {
			if (this.isLocked || itemControl.mode == "selection") return;
			ev.preventDefault();
		}

		this.section.ondrop = (ev) => {
			if (this.isLocked || itemControl.mode == "selection") return;
			ev.preventDefault();
			let data = ev.dataTransfer.getData("sectionId");

			// id는 c1과 같은 형태의 string이므로 숫자를 가져오고 1을 빼면 해당 인덱스가 된다
			let sourceIndex = data[1] - 1;
			//console.log(data[1], this.value);
			const swap = (cellA, cellB) => {
				cellA.effectsString = "";
				cellB.effectsString = "";
				[cellA.value, cellB.value] = [cellB.value, cellA.value];
				[cellA.effects, cellB.effects] = [cellB.effects, cellA.effects];
			}
			swap(this, cells[sourceIndex]);

			// 자리 바꾼이후 점수 계산
			this.#effectedValue = this.getEffectedValue();
			calculateScore();
		}

		this.section.ondragstart = (ev) => {
			if (itemControl.mode == "selection") return;
			ev.dataTransfer.clearData();
			ev.dataTransfer.setData("sectionId", ev.target.id);
		}

		this.section.onclick = (ev) => {
			if (itemControl.mode == "normal") return;
			ev.preventDefault();

			this.effects.push(itemControl.effect);
			this.effects = this.effects;

			itemControl.onItemExit(true);
		}

		this.section.onmouseenter = (ev) => {
			if (itemControl.mode == "normal") return;
			let preview = this.effectedValue;

			switch(itemControl.effect.modifierType){
				case "Addition":
					preview += itemControl.effect.modifierAmount;
					break;
				case "Multiplication":
					preview *= itemControl.effect.modifierAmount;
					break;
			}

			if (this.value == undefined) return;

			this.section.innerHTML = `
				${"" + preview}
				<div class="corner-text">
					${this.value}
				</div>
			`;
		}

		this.section.onmouseleave = (ev) => {
			this.updateContent();
		}
	}

	roll(minin = 1, maxin = 6) {
		if (this.isDetermined == true) return;
		if (this.isLocked == true) {
			this.isDetermined = true;
			return;
		}

		this.value = Math.floor(Math.random() * maxin + minin);
		this.updateContent();
		if (itemControl.mode == "selection") itemControl.onItemExit();
	}

	updateContent() {
		if (this.value == undefined) {
			this.section.innerHTML = "-"
		} else {
			this.section.innerHTML = `
				${"" + this.effectedValue}
				<div class="corner-text">
					${this.value}
				</div>
			`;
		}

		try {
			if (this.effects.includes(EffectsList.lifeDice)){ 
				this.section.style.backgroundColor = "#c8ffd1";
			} else {
				this.section.style.backgroundColor = "white";
			}
		} catch (error) {
			this.section.style.backgroundColor = "white";
		}
		
	}

	getEffectedValue() {
		let ret = this.value;
		this.effects.forEach((effect) => {
			switch(effect.modifierType){
				case "Addition":
					ret += effect.modifierAmount;
					break;
				case "Multiplication":
					ret *= effect.modifierAmount;
					break;
			}
		});
		return ret;
	}

	// 라인 보너스
	static checkLineBonus() {
		const vA = cells[0].effectedValue;
		const vB = cells[1].effectedValue;
		const vC = cells[2].effectedValue;
		const vD = cells[3].effectedValue;

		cells[0].lineBonus = (vA === vB || vA === vC);
		cells[1].lineBonus = (vB === vA || vB === vD);
		cells[2].lineBonus = (vC === vA || vC === vD);
		cells[3].lineBonus = (vD === vB || vD === vC);
	}
}


// html 항목들 레퍼런스 생성 & 초기화
/** @type {HTMLElement} */
const cellSections = document.getElementsByClassName("cell");
const scoreDisplays = document.getElementsByClassName("scoreDisplay");
const rollDisplays = document.getElementsByClassName("rollDisplay");
const attackButton = document.getElementById("attack-button");
const scoreInfo = document.getElementById("score-info");


// 주사위 굴리는 횟수
let maximumRolls = 2;
let rollCount = 0;

let isAllLocked = false;


// 점수
let score = 0;


// 칸들
/** @type {Cell[]} */
let cells = [];
for (i = 0; i < 4; i++) {
	cells.push(new Cell(cellSections[i]));
};


/** 판 초기화 */
function initialize() {
	cells.forEach(cell => {
		cell.value = undefined;
		cell.isLocked = false;
		cell.isDetermined = false;
		cell.effects = [];
		cell.lineBonus = false;
		cell.effectsString = "";
	});

	rollCount = 0;
	score = 0;
	isAllLocked = false;

	// 아이템 사용 기록 초기화
	if (gameState.player) {
        gameState.player.turnItemUsage = {};
    }

	// 굴린 횟수 글자 업데이트
	Array.prototype.forEach.call(rollDisplays, (element) => {
		element.textContent = `Roll: ${rollCount}/${maximumRolls}`;
	});

	// 점수 글자 업데이트
	Array.prototype.forEach.call(scoreDisplays, (element) => {
		element.textContent = score;
	});

	//DICE! 버튼 원래대로
	attackButton.textContent = "DICE!";

	//상태 UI 초기화
	calculateScore();
	scoreInfo.textContent = "";
}


// 최초 초기화 함수 실행
initialize();


// roll버튼 클릭시
function onRollClick() {
	if (rollCount >= maximumRolls || isAllLocked) {
		onConfirmClick();
		return;
	}

	const { min, max } = getPlayerDiceRange();

	for (i = 0; i < cells.length; i++) {
		if (cells[i].value == undefined) {
			cells[i].isLocked = false;
		}
		cells[i].roll(min, max);
	}

	// 굴린 횟수 업데이트
	rollCount++;
	if (rollCount >= maximumRolls) {
		attackButton.textContent = "확정!";
	}

	Array.prototype.forEach.call(rollDisplays, (element) => {
		element.textContent = `Roll: ${rollCount}/${maximumRolls}`;
	});
	calculateScore();
}

// confirm버튼 클릭시
function onConfirmClick() {
	for (i = 0; i < cells.length; i++) {
		cells[i].isLocked = true;
		cells[i].isDetermined = true;
	}

	score = calculateScore();

	console.log(score);

	setTimeout(() => {
		// ===== 아이템 버프 처리 =====
		if (gameState.player && gameState.player.buffs) {
			const buffs = gameState.player.buffs;

			// 생명의 주사위: 점수/2 만큼 체력 회복 (최대 체력까지만)
			if (buffs.nextDiceHpFromRoll) {
				let healCell = cells.find((e) => e.effects.includes(EffectsList.lifeDice))
				const heal = Math.floor((healCell.effectedValue * (healCell.lineBonus ? 2 : 1)) / 2);
				gameState.player.hp = Math.min(
					gameState.player.hp + heal,
					gameState.player.maxHp
				);
				document.getElementById('player-hp').textContent = gameState.player.hp;
				alert(`생명의 주사위 효과! 체력이 ${heal} 회복되었습니다.`);
				buffs.nextDiceHpFromRoll = false;
			}

			// 일회성 버프 초기화 (다음 턴에 영향 없도록)
			buffs.nextDiceFlatBonus = 0;
			buffs.nextDiceMinPlus = 0;
			buffs.nextDiceMaxPlus = 0;
		}
		// =============================

		battleSystem.rollDice(score);
	}, 0)

	setTimeout(() => {
		initialize();
	}, 1500);
}

//**
// 점수 계산 후 반환 & UI 업데이트
// 매개변수 false시 UI 업데이트 없음
// */
function calculateScore(updateUI = true) {

	// 각 칸 값 가져오기
	const vA = cells[0].value;
	const vB = cells[1].value;
	const vC = cells[2].value;
	const vD = cells[3].value;

	// 만약 주사위가 아직 다 굴려지지 않았다면(undefined 값이 있다면) 0점 처리
	if ([vA, vB, vC, vD].includes(undefined)) {
		if (updateUI) {
			Array.prototype.forEach.call(scoreDisplays, (element) => {
				element.textContent = 0;
			});
		}
		return 0;
	}

	// 라인 보너스
	Cell.checkLineBonus();

	const valA = cells[0].effectedValue * (cells[0].lineBonus ? 2 : 1);
	const valB = cells[1].effectedValue * (cells[1].lineBonus ? 2 : 1);
	const valC = cells[2].effectedValue * (cells[2].lineBonus ? 2 : 1);
	const valD = cells[3].effectedValue * (cells[3].lineBonus ? 2 : 1);

	let baseScore = valA + valB + valC + valD;

	let multiplier = 1; // 기본 배율 1배

	let combinations = "";

	//교차형
	if ((vA + vD) === (vB + vC)) {
		multiplier += 1;
		combinations += "교차형: +1 배수\r\n"
	}
	// 원천형
	if (vA <= 3 && vB <= 3 && vC <= 3 && vD <= 3) {
		multiplier += 1;
		combinations += "원천형: +1 배수\r\n"
	}

	// 정석형
	if (vA === vB && vB === vC && vC === vD) {
		multiplier += 1;
		combinations += "정석형: +1 배수\r\n"
	}

	//우상형
	const equal = (a, b, c) => (a==b && b==c);
	const cond = (a, b, c, d) => (a == b * 3 && equal(b, c, d));
	if (cond(vA,vB,vC,vD) || cond(vB,vA,vC,vD) || cond(vC,vA,vB,vD) || cond(vD,vA,vB,vC)) {
		multiplier += 2;
		combinations += "우상형: +2 배수\r\n";
	}

	if (multiplier > 1) {
		combinations = combinations.trimEnd();
	}

	//최종 점수
	let finalScore = baseScore * multiplier;

	// 더블 주사위: 최종 점수 + nextDiceFlatBonus
	if (gameState.player && gameState.player.buffs) {
		finalScore += gameState.player.buffs.nextDiceFlatBonus || 0;
	}

	//UI 업데이트
	if (updateUI) {
		Array.prototype.forEach.call(scoreDisplays, (element) => {
			element.textContent = finalScore;
		});
		scoreInfo.textContent = combinations;
	}

	return finalScore;
}