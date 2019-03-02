//"use strict";

const renderer = PIXI.autoDetectRenderer(1286, 640, {
    transparent: true,
    resolution: 1
});
const gameWindow = document.getElementById('gameWindow');
gameWindow.appendChild(renderer.view);
let stage = new PIXI.Container();
let loader = PIXI.loader;
loader.add('spriteSheet', 'images/hero_transparent.json');
loader.add('spriteSheet1', 'images/enemy1.json');
loader.add('spriteSheet2', 'images/projectile1.json');
loader.add('spriteSheet3', 'images/explosion2.json');
loader.add('spriteSheet4', 'images/spikes.json');
loader.load(setup);
let hero;
let heroState = {
    moving: false,
    direction: null,
    isShooting: false
};
let heroIdle = [];
let heroMove = [];
let heroAttack = [];
let heroDie = [];
let heroProjectile = [];
let explosionFrames = [];
let enemy_1_walk = [];
let enemy_1_attack = [];
let enemy_1_hurt = [];
let enemy_1_die = [];
let spikes = [];
let heroProjectileDamage = 20;
let heroHealth = 200;
let heroMagic = 0;
let scoreText = "";
let hintText = "";
let score = 0;

function gameOver() {
    stage.children.length = 7;
    heroHealth = 200;
    heroMagic = 0;
    score = 0;
}

function setup() {
    addBackground();
    createHealthandMagic();
    addScore();
    createHeroTextures();
    createEnemyTextures();
    createExplosionTextures();
    createProjectileTextures();
    createSpikesTextures();
    enemySpawnInterval();
    spikesSpawnInterval();
    hero = new PIXI.extras.AnimatedSprite(heroIdle);
    attachEventListeners();
    hero.animationSpeed = 0.3;
    hero.x = 15;
    hero.y = 250;
    stage.addChild(hero);
    animationLoop();
}

function addScore() {
    scoreText = new PIXI.Text('Score ' + score, {fontSize: '35px', fill: 'black', align: 'left'});
    scoreText.position.set(1070, 20);
    stage.addChild(scoreText);
    hintText = new PIXI.Text('Press space', {fontSize: '12px', fill: 'white', align: 'left'});
    hintText.position.set(150, 39);
    stage.addChild(hintText);
}

function heroHealthChange(value) {
    if (hero.invincible) {
        return;
    }
    heroHealth += value;
    if (value < 0) {
        applyChanges(heroDie, hero.x, hero.y, 0.8);
        hero.invincible = true;
        setTimeout(function () {
            hero.invincible = false;
            applyChanges(heroIdle, hero.x, hero.y, 0.3);
        }, 1500);
    }

    if (heroHealth > 200) {
        heroHealth = 200;
    }
    if (heroHealth <= 0) {
        heroHealth = 0;
        gameOver();
    }
    stage.children[2].clear();
    stage.children[2].beginFill(0xff0000);
    stage.children[2].drawRect(0, 0, heroHealth, 12);
    stage.children[2].endFill();
}

function heroMagicChange(value) {
    heroMagic + value <= 200 ? heroMagic += value : null;
    stage.children[4].clear();
    stage.children[4].beginFill(0x4bd4ff);
    stage.children[4].drawRect(0, 0, heroMagic, 12);
    stage.children[4].endFill();
}

function createHealthandMagic() {
    let healthBarStatic = new PIXI.Graphics();
    healthBarStatic.lineStyle(1, 0x000000);
    healthBarStatic.beginFill(0x000000);
    healthBarStatic.drawRect(0, 0, heroHealth, 12);
    healthBarStatic.endFill();
    healthBarStatic.x = 20;
    healthBarStatic.y = 20;
    stage.addChild(healthBarStatic);
    let healthBar = new PIXI.Graphics();
    healthBar.lineStyle(1, 0x000000);
    healthBar.beginFill(0xff0000);
    healthBar.drawRect(0, 0, heroHealth, 12);
    healthBar.endFill();
    healthBar.x = 20;
    healthBar.y = 20;
    stage.addChild(healthBar);
    let magicBarStatic = new PIXI.Graphics();
    magicBarStatic.lineStyle(1, 0x000000);
    magicBarStatic.beginFill(0x000000);
    magicBarStatic.drawRect(0, 0, 200, 12);
    magicBarStatic.endFill();
    magicBarStatic.x = 20;
    magicBarStatic.y = 40;
    stage.addChild(magicBarStatic);
    let magicBar = new PIXI.Graphics();
    magicBar.lineStyle(1, 0x000000);
    magicBar.beginFill(0x4bd4ff);
    magicBar.drawRect(0, 0, heroMagic, 12);
    magicBar.endFill();
    magicBar.x = 20;
    magicBar.y = 40;
    stage.addChild(magicBar);
}

function createHeroTextures() {
    for (let i = 1; i <= 7; i++) {
        let current = PIXI.Texture.fromFrame('heroIdle_' + i + '.png');
        heroIdle.push(current);
    }
    for (let i = 1; i <= 7; i++) {
        let current = PIXI.Texture.fromFrame('heroMove_' + i + '.png');
        heroMove.push(current);
    }
    for (let i = 1; i <= 7; i++) {
        let current = PIXI.Texture.fromFrame('heroAttack_' + i + '.png');
        heroAttack.push(current);
    }
    for (let i = 1; i <= 3; i++) {
        let current = PIXI.Texture.fromFrame('heroDie_' + i + '.png');
        heroDie.push(current);
    }
}

function createEnemyTextures() {
    for (let i = 1; i <= 7; i++) {
        let current = PIXI.Texture.fromFrame('enemy1Walk_' + i + '.png');
        enemy_1_walk.push(current);
    }
    for (let i = 1; i <= 7; i++) {
        let current = PIXI.Texture.fromFrame('enemy1Attack_' + i + '.png');
        enemy_1_attack.push(current); //0.3 speed
    }
    for (let i = 1; i <= 7; i++) {
        let current = PIXI.Texture.fromFrame('enemy1Hurt_' + i + '.png');
        enemy_1_hurt.push(current); //0.2 speed
    }
    for (let i = 1; i <= 7; i++) {
        let current = PIXI.Texture.fromFrame('enemy1Die_' + i + '.png');
        enemy_1_die.push(current);
    }
}

function createSpikesTextures() {
    for (let i = 1; i <= 1; i++) {
        let current = PIXI.Texture.fromFrame('spikes_' + i + '.png');
        spikes.push(current);
    }
}

function enemySpawnInterval() {
    let interval = setInterval(function () {
        let container = new PIXI.Container();
        let enemy = new PIXI.extras.AnimatedSprite(enemy_1_walk);
        let healthBar = new PIXI.Graphics();
        healthBar.lineStyle(1, 0x000000);
        healthBar.beginFill(0xff0000);
        healthBar.drawRect(0, -30, 70, 7);
        healthBar.endFill();
        healthBar.x = 20;
        healthBar.y = 20;
        let healthBarStatic = new PIXI.Graphics();
        healthBarStatic.lineStyle(1, 0x000000);
        healthBarStatic.beginFill(0x000000);
        healthBarStatic.drawRect(0, -30, 70, 7);
        healthBarStatic.endFill();
        healthBarStatic.x = 20;
        healthBarStatic.y = 20;
        enemy.onFrameChange = function (e) {
//            console.log(e);
        };
        container.health = 70;
        enemy.animationSpeed = 0.2;
        container.x = 1300;
        container.y = Math.floor((Math.random() * 450) + 55);
        container.type = 'enemy1';
        container.speed = Math.floor((Math.random() * 3) + 1);
        container.addChild(enemy);
        container.addChild(healthBarStatic);
        container.addChild(healthBar);
        stage.addChild(container);
    }, Math.floor((Math.random() * 500) + 1500));
}

function spikesSpawnInterval() {
    let interval = setInterval(function () {
        let container = new PIXI.Container();
        let spike = new PIXI.extras.AnimatedSprite(spikes);
        let healthBar = new PIXI.Graphics();
        healthBar.lineStyle(1, 0x000000);
        healthBar.beginFill(0xff0000);
        healthBar.drawRect(-40, -30, 75, 7);
        healthBar.endFill();
        healthBar.x = 20;
        healthBar.y = 20;
        let healthBarStatic = new PIXI.Graphics();
        healthBarStatic.lineStyle(1, 0x000000);
        healthBarStatic.beginFill(0x000000);
        healthBarStatic.drawRect(-40, -30, 75, 7);
        healthBarStatic.endFill();
        healthBarStatic.x = 20;
        healthBarStatic.y = 20;
        spike.onFrameChange = function (e) {
//            console.log(e);
        };
        container.health = 150;
        spike.animationSpeed = 0.2;
        container.x = 1300;
        container.y = Math.floor((Math.random() * 450) + 55);
        container.type = 'spike';
        container.speed = Math.floor((Math.random() * 3) + 1);
        container.addChild(spike);
        container.addChild(healthBarStatic);
        container.addChild(healthBar);
        stage.addChild(container);
    }, Math.floor((Math.random() * 50) + 2500));
}

function createProjectileTextures() {
    for (let i = 1; i <= 5; i++) {
        let current = PIXI.Texture.fromFrame('heroProjectile_' + i + '.png');
        heroProjectile.push(current); //speed 0.3
    }
}

function createExplosionTextures() {
    for (let i = 1; i <= 81; i++) {
        let current = PIXI.Texture.fromFrame('explosion_' + i + '.png');
        explosionFrames.push(current);
    }
}

function applyChanges(elementState, x, y, animationSpeed) {
    if (hero.invincible) {
        return;
    }
    stage.removeChild(hero);
    hero = new PIXI.extras.AnimatedSprite(elementState);
    hero.x = x;
    hero.y = y;
    hero.animationSpeed = animationSpeed;
    stage.addChild(hero);
}

function onKeyDown(k) {
    let currentY = hero.y;
    let currentX = hero.x;
    if (k.key === "ArrowUp") {
        if (heroState.moving) {
            return;
        }
        heroState.moving = true;
        heroState.direction = "up";
        applyChanges(heroMove, currentX, currentY, 1);
    } else if (k.key === "ArrowDown") {
        if (heroState.moving) {
            return;
        }
        heroState.moving = true;
        heroState.direction = "down";
        applyChanges(heroMove, currentX, currentY, 1);
    } else if (k.key === " ") {
        if (heroState.isShooting) {
            return;
        }
        heroState.isShooting = true;
        if (heroMagic >= 40 && !hero.invincible) {
            applyChanges(heroAttack, currentX, currentY, 0.5);
            heroShoot();
        }
    }
}

function heroShoot() {
    heroMagicChange(-40);
    let container = new PIXI.Container();
    let _projectile = new PIXI.extras.AnimatedSprite(heroProjectile);
    _projectile.animationSpeed = 1;
    container.x = hero.x;
    container.y = hero.y;
    container.type = 'projectile';
    container.addChild(_projectile);
    stage.addChild(container);
}

function onKeyUp(k) {
    let currentY = hero.y;
    let currentX = hero.x;
    if (k.key === "ArrowUp") {
        heroState.moving = false;
        heroState.direction = null;
    } else if (k.key === "ArrowDown") {
        heroState.moving = false;
        heroState.direction = null;
    } else if (k.key === " ") {
        heroState.isShooting = false;
    }
    applyChanges(heroIdle, currentX, currentY, 0.3);
}

function projectileOffScreen(x) {
    return x > 1286;
}

function enemyOffScreen(x) {
    return x < -100;
}

function attachEventListeners() {
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
}

function heroCollision(objects) {
    let x1 = hero.x;
    let y1 = hero.y;
    let width1 = hero._texture.trim.width;
    let height1 = hero._texture.trim.height;
    for (let i = 0; i < objects.length; i++) {
        let x2 = objects[i].x;
        let y2 = objects[i].y;
        let width2 = objects[i].children[0]._texture.trim.width;
        let height2 = objects[i].children[0]._texture.trim.height;
        if (x2 + width2 / 2 < x1 + width1 && y2 + height2 > y1 && y2 + 10 < y1 + height1) {
            heroHealthChange(objects[i].type === "spike" ? -200 : -50);
            return true;
        }
    }
    return false;
}

function animationLoop() {
    score += 0.1;
    scoreText.text = 'Score ' + parseInt(score);
    heroMagicChange(0.9);
    let enemies = stage.children.filter(x => x.type === "enemy1" || x.type === "spike");
    heroCollision(enemies);
    for (let i = 1; i < stage.children.length; i++) {
        let child = stage.children[i];
        if (child) {
            if (child.type === 'projectile') {
                child.children[0].play();
                child.x += 7;
                if (projectileOffScreen(child.x)) {
                    stage.children[i].children[0].stop();  //?
                    stage.removeChild(stage.children[i]);
                } else if (collision(child, enemies)) {
                    stage.children[i].children[0].stop();  //?
                    stage.removeChild(stage.children[i]);
                }
            } else if (child.type === 'enemy1') {
                child.children[0].play();
                child.x -= child.speed + 1;
                child.speed % 2 === 0 ? child.y -= child.speed / 10 : child.y += child.speed / 10;
                if (enemyOffScreen(child.x)) {
                    stage.children[i].children[0].stop();  //?
                    stage.removeChild(stage.children[i]);
                } else if (child.health < 0 && !child.dying) {
                    heroHealthChange(20);
                    heroMagicChange(10);
                    stage.removeChild(stage.children[i]);
                }
            } else if (child.type === 'spike') {
                child.children[0].play();
                child.x -= child.speed + 1;
                child.speed % 2 === 0 ? child.y -= child.speed / 10 : child.y += child.speed / 10;
                if (enemyOffScreen(child.x)) {
                    stage.children[i].children[0].stop();  //?
                    stage.removeChild(stage.children[i]);
                } else if (child.health < 0 && !child.dying) {
                    heroHealthChange(50);
                    heroMagicChange(30);
                    stage.removeChild(stage.children[i]);
                }
            }
        }
    }
    hero.play();
    if (heroState.direction === "up" && !offScreenMove(hero.y - 1)) {
        hero.y -= 2;
    } else if (heroState.direction === "down" && !offScreenMove(hero.y + 1)) {
        hero.y += 2;
    }
    bg.tilePosition.x -= 1;
    renderer.render(stage);
    requestAnimationFrame(animationLoop);
}

function  collision(el, objects) {
    let x1 = el.x;
    let y1 = el.y;
    let width1 = el.children[0]._texture.trim.width;
    let height1 = el.children[0]._texture.trim.height;
    for (let i = 0; i < objects.length; i++) {
//        todo
//        if (objects[i].dying) {
//            return;
//        }
        let x2 = objects[i].x;
        let y2 = objects[i].y;
        let width2 = objects[i].children[0]._texture.trim.width;
        let height2 = objects[i].children[0]._texture.trim.height;
        if (x1 + width1 / 1.5 > x2 && y1 + height1 > y2 && y1 < y2 + height2) {
            explodeOnCollision(x1 + width1 / 2, y1 - height1 / 2);
            enemyDamaged(objects[i]);
            return true;
        }
    }
    return false;
}

function enemyDamaged(target) {
    if (!target.children[2]) {
        return;
    }
    let healthLeft = target.health -= heroProjectileDamage;
    if (healthLeft > 0) {
        target.children[2].clear();
        target.children[2].beginFill(0xff0000);
        target.children[2].drawRect(target.type === "enemy1" ? 0 : -40, -30, target.type === "enemy1" ? healthLeft : healthLeft / 2, 7);
        target.children[2].endFill();
        return;
    }
}

function explodeOnCollision(x, y) {
    let container = new PIXI.Container();
    let _explosion = new PIXI.extras.AnimatedSprite(explosionFrames);
    _explosion.onFrameChange = function (e) {
        let explosionIndex = stage.children.findIndex(x => x.type === 'explosion');
        if (e === 80 && explosionIndex !== -1) {
            stage.removeChildAt(explosionIndex);
            container.children[0].stop();
        }
    };
    _explosion.animationSpeed = 1.5;
    container.x = x;
    container.y = y;
    container.type = 'explosion';
    container.addChild(_explosion);
    stage.addChild(container);
    container.children[0].play();
}

function offScreenMove(y) {
    return y < 55 || y > 538;
}

function addBackground() {
    background = PIXI.Texture.fromImage('images/bg1.jpg');
    bg = new PIXI.extras.TilingSprite(background, 1284, 640);
    bg.position.x = 0;
    bg.position.y = 0;
    bg.tilePosition.x = 0;
    bg.tilePosition.y = 0;
    stage.addChild(bg);
}




