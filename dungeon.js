let app = window.parent.app;

let rows = 10;
let cols = 10;

let playerToken = {x:1, y:3, img: 'images/player.png',entity:app.player};
let playerTurn = true;
let playerSteps = 2;
let enemies = [
  {x:3,y:4,img:'images/enemy.png',entity:app.goblin()},
  {x:5,y:4,img:'images/enemy.png',entity:app.goblin()}
];

let highlights = {};
let selectedAction;

let inRangeColor = '#ff00006b';

function renderTile(x,y,addon,highlightColor) {
    let tileHtml = '';
    let width;
    tileHtml += getTile();
    if (addon) {
        tileHtml += '<img src="' + addon.img + '">';
        if (addon.entity.name != 'player') {
            width = addon.entity.hp/addon.entity.maxHP()*100;
            tileHtml += `<div class="progress-bar-horiz hp-empty">
            <div class="progress-bar-inner hp-full" style="width:${width}%"></div>
            </div>`;
        }
    }
    if (highlightColor)
        tileHtml += '<div class="highlight" style="background-color:' + highlightColor + '"></div>'
    document.getElementById(y + ':' + x).innerHTML = tileHtml;
}

function movePlayer (x,y) {
    let newX = playerToken.x + x;
    let newY = playerToken.y + y;
    if (playerTurn && newX >= 0 && newX < rows && newY >= 0 && newY < cols && !collision(newX,newY,playerToken)) {
        playerSteps--;
        if (playerSteps == 0) {
            playerTurn = false;
            enemyTurn();
        }
        renderTile(playerToken.x,playerToken.y);
        playerToken.x += x;
        playerToken.y += y;
        renderTile(playerToken.x,playerToken.y,playerToken);
        document.getElementById("player-steps").innerHTML = playerSteps;
        renderEnemies();
        highlights = {};
    }
}
function enemyTurn() {
    renderEnemies();
    playerSteps = 2;
    playerTurn = true;
}

function renderEnemies() {
    for (let i of enemies)
        renderTile(i.x,i.y,i);
}
function collision(x,y,token) {
    let curr;
    if (token != playerToken) {
        curr = playerToken;
        if (curr.x == x && curr.y == y)
            return true;
    }
    for (let i = 0; i < enemies.length; i++)
    if (enemies[i] != token) {
        curr = enemies[i];
        if (curr.x == x && curr.y == y)
            return true;
    }
    return false;
}
function keyPress() {
    if (event.key == 'w')
        movePlayer(0,-1);
    else if (event.key == 's')
        movePlayer(0,1);
    else if (event.key == 'a')
        movePlayer(-1,0);
    else if (event.key == 'd')
        movePlayer(1,0);
}
function getTile() {
    let floor = '<img src=images/floor.png>';
    return floor;
}

function chooseAction(action) {
    highlights = {};
    selectedAction = action;
    if (action == 'attack')
        action = {range:1};
    else
        if (app.spells[action].cost <= app.player.mana)
            action = app.spells[action];
    for (let i of enemies)
            if (inRange(playerToken,i,action.range)) {
                renderTile(i.x,i.y,i,inRangeColor);
                highlights[i.x + ':' + i.y] = true;
            }
}

function inRange(obj1,obj2,range) {
    let xDiff = obj1.x - obj2.x;
    let yDiff = obj1.y - obj2.y;
    if (Math.abs(xDiff) + Math.abs(yDiff) <= range)
        return true;
    return false;
}

function takeAction(y,x) {
    let target, killed;
    if(highlights[x + ':' + y]) {
        target = enemies.filter(e => e.x == x && e.y == y)[0].entity;
        if (selectedAction == 'attack')
            app.attack(playerToken.entity, target);
        else {
            app.castSpell(playerToken.entity,target,selectedAction)
            document.getElementById('mana-inner').style.height = app.player.mana/app.player.maxMana()*100 + "%";
        }
    }
    killed = enemies.filter(e => !e.entity.isAlive);
    for (let i of killed)
        renderTile(i.x,i.y);
    enemies = enemies.filter(e => e.entity.isAlive);
    renderEnemies();
    document.getElementById('xp-inner').style.height = app.player.xp/app.xpToLevel[app.player.level+1]*100 + '%';
    highlights = {};
}

function startDungeon(){
    let table,row,cell,buttons;
    let playerActions = [];
    
    table = '';
    for (var i = 0; i < cols; i++) {
        row = '<tr>';
        for (var j = 0; j < rows; j++) {
            cell = '<td onclick="takeAction(' + i + ',' + j + ')" id="' + i + ':' + j + '">' + getTile() + '</td>'
            row += cell;
        }
        row += '</tr>';
        table += row;
    }
    document.getElementById('board').innerHTML = table;

    buttons = '';
    playerActions.push('attack');
    for (let i of app.player.spells)
        playerActions.push(i);
    for (let i of playerActions)
        buttons += '<button class="action-button" onclick="chooseAction(\'' + i + '\')">' + prettyPrint(i) + '</button>'
    document.getElementById('player-action-container').innerHTML = buttons;

    renderTile(playerToken.x,playerToken.y,playerToken);
    for (let i = 0; i < enemies.length; i++)
        renderTile(enemies[i].x,enemies[i].y,enemies[i]);
        
    document.getElementById('hp-inner').style.height = app.player.hp/app.player.maxHP()*100 + "%";
    document.getElementById('mana-inner').style.height = app.player.mana/app.player.maxMana()*100 + "%";
    document.getElementById('xp-inner').style.height = app.player.xp/app.xpToLevel[app.player.level+1]*100 + '%';

    document.addEventListener('keydown', keyPress);
    app.$on('invChange', function() {
        console.log('Inv change');
    });
}

startDungeon();