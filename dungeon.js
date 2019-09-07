let rows = 10;
let cols = 10;

let playerToken = {x:1, y:3, img: 'images/player.png'};
let playerTurn = true;
let playerSteps = 2;
let enemies = [
  {x:3,y:3,img:'images/enemy.png'},
  {x:5,y:5,img:'images/enemy.png'}
];

function renderToken(token) {
    document.getElementById(token.y + ':' + token.x).innerHTML = getTile() + '<img src="' + token.img + '">';
}
function eraseToken (token) {
    document.getElementById(token.y + ':' + token.x).innerHTML = getTile();
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
        eraseToken(playerToken);
        playerToken.x += x;
        playerToken.y += y;
        renderToken(playerToken);
        document.getElementById("player-steps").innerHTML = playerSteps;
    }
}
function enemyTurn() {
    renderToken(enemies[0]);
    playerSteps = 2;
    playerTurn = true;
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

function startDungeon(){
    let table,row,cell;
    table = '';
    /*app.$on('invChange', function() {
        console.log('Inv change');
    });*/
    console.log(window.parent.app)
    for (var i = 0; i < cols; i++) {
        row = '<tr>';
        for (var j = 0; j < rows; j++) {
            cell = '<td id="' + i + ':' + j + '">' + getTile() + '</td>'
            row += cell;
        }
        row += '</tr>';
        table += row;
    }
    document.getElementById('board').innerHTML = table;
    renderToken(playerToken);
    for (let i = 0; i < enemies.length; i++)
        renderToken(enemies[i]);
    document.addEventListener("keydown", keyPress);
}

startDungeon();