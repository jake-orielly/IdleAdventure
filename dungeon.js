let app = window.parent.app;

let rows = 11;
let cols = 11;

let cardinalDirs = [[-1,0],[0,1],[1,0],[0,-1]];

let playerToken;
let playerTurn = true;
let playerSteps = 2;
let xVisMod,yVisMod, sightRange;
let enemies;
let currEnemies = [];

let floorTileImages = ['images/empty.png','images/floor.png','images/wall.png']
let chestImage = 'images/chest.png';
let chestOpenImage = 'images/chestOpen.png';

let altarImage = 'images/altar.png';
let statueImage = 'images/statue.png';
let fountainImage = 'images/fountain.png';
let columnImage = 'images/column.png';
let doorImage = 'images/door.png';

let hideFloating = {};

let scenery = [
    {x:7,y:49,img:chestImage, inventory:
        {copper_coin:[35,50]}
    },
    {x:36,y:17,img:chestImage, inventory:
        {iron_sword:1}
    },
    {x:24,y:49,img:altarImage},
    {x:25,y:49,img:columnImage},
    {x:23,y:49,img:columnImage},
    {x:24,y:38,img:fountainImage},
    {x:35,y:36,img:statueImage,class:'flip'},
    {x:35,y:38,img:statueImage,class:'flip'},
    {x:33,y:23,img:statueImage},
    {x:39,y:23,img:statueImage,class:'flip'},
    {x:33,y:18,img:statueImage},
    {x:39,y:18,img:statueImage,class:'flip'},
    {x:24,y:63,img:doorImage},
];

let highlights = {};
let selectedAction;

let highlightEnemyColor = '#ff00006b';
let highlightRangeColor = '#003aff33';

function renderTile(x,y,addon,highlightColor) {
    let tileHtml = '';
    let width;
    let addonClass = '';
    if (addon && addon.class)
        addonClass = addon.class;
    tileHtml += getTile(x,y);
    if (addon) {
        tileHtml += '<img class="' + addonClass + '" src="' + addon.img + '">';
        if (addon.entity && addon.entity.name != 'player') {
            width = addon.entity.hp/addon.entity.maxHP()*100;
            tileHtml += `<div class="progress-bar-horiz hp-empty">
            <div class="progress-bar-inner hp-full" style="width:${width}%"></div>
            </div>`;
        }
    }
    if (highlightColor)
        tileHtml += '<div class="highlight" style="background-color:' + highlightColor + '"></div>';
    document.getElementById(y + ':' + x).innerHTML = tileHtml;
}

function movePlayer (x,y) {
    let newX = playerToken.x + x;
    let newY = playerToken.y + y;
    if (playerTurn && onBoard(newX,newY) && !collision(newX,newY,playerToken)) {
        playerSteps--;
        if (!(newX + sightRange >= dungeon1Map[playerToken.y].length) && !(newX - sightRange < 0) && newX - xVisMod != sightRange)
            xVisMod += x;
        if (!(newY + sightRange >= dungeon1Map.length) && !(newY - sightRange < 0) && newY - yVisMod != sightRange)
            yVisMod += y;

        renderFloorTiles();
        renderTile(playerToken.x,playerToken.y);
        playerToken.x += x;
        playerToken.y += y;
        renderTile(playerToken.x,playerToken.y,playerToken);
        document.getElementById("player-steps").innerHTML = playerSteps;
        currEnemies = enemies.filter(e => e.entity.isAlive && onScreen(e));
        renderEnemies();
        renderScenery();
        highlights = {};
        if (playerSteps == 0) {
            playerTurn = false;
            renderEnemies();
            enemyTurn();
        }
    }
}

function enemyTurn() {
    let path,currStep,currEnemy,killed;
    let currEnemyIndex = 0;
    let waitTime = 250;
    killed = currEnemies.filter(e => !e.entity.isAlive);
    for (let i of killed)
        renderTile(i.x,i.y);
    if (!currEnemies.length) {
        playerSteps = 2;
        playerTurn = true;
        return;
    }
    if (killed)
        waitTime += 500;
    setTimeout(()=>{
        renderEnemies();
        enemyMove();
    },waitTime)

    function enemyMove() {
        if (currEnemyIndex == currEnemies.length) {
            playerSteps = 2;
            playerTurn = true;
            return;
        }
        currEnemy = currEnemies[currEnemyIndex];
        currStep = 0;
        path = pathFind(currEnemy,playerToken);
        enemyStep();
    }

    function enemyStep() {
        if (currStep == path.length) {
            if (currStep < currEnemy.entity.movement) {
                app.attack(currEnemy.entity,playerToken.entity);
                updateHP();
            }
            currEnemyIndex++;
            setTimeout(()=>{enemyMove();},250 * (currEnemy.entity.movement - path.length + 1));
            return;
        }
        renderTile(currEnemy.x,currEnemy.y);
        currEnemy.x = path[currStep].x;
        currEnemy.y = path[currStep].y;
        renderTile(currEnemy.x,currEnemy.y,currEnemy);
        currStep++
        setTimeout(()=>{enemyStep(currEnemy);},100);
    }
}

function renderEnemies() {
    for (let i of currEnemies)
        if (onScreen(i))
            renderTile(i.x,i.y,i);
}

function renderScenery() {
    for (let i of scenery)
        if (onScreen(i))
            renderTile(i.x,i.y,i);
}

function updateHP() {
    document.getElementById('hp-inner').style.height = app.player.hp/app.player.maxHP()*100 + "%";
}

function updateMana() {
    document.getElementById('mana-inner').style.height = app.player.mana/app.player.maxMana()*100 + "%";
}

function updateXP() {
    document.getElementById('xp-inner').style.height = app.player.xp/app.xpToLevel[app.player.level+1]*100 + '%';
}

function renderInventory() {
    let inventory = '';
    let row;
    for (let i in app.player.inventory) {
        row = '<tr>';
        row += '<td>' + prettyPrint(i) + '</td>';
        row += '<td>' + app.player.inventory[i] + '</td>';
        row += '</tr>';
        inventory += row;
    }
    document.getElementById('player-inventory-table').innerHTML = inventory;
}

function onBoard(x,y) {
    x -= xVisMod;
    y -= yVisMod;
    return (x >= 0 && x < rows && y >= 0 && y < cols)
}

function onScreen(token) {
    let x = token.x;
    let y = token.y;
    return (x >= xVisMod && x < xVisMod + rows && y >= yVisMod && y < yVisMod + cols);
}

function collision(x,y,token) {
    let curr;
    if (dungeon1Map[y][x] != 1)
        return true;
    if (token != playerToken) {
        curr = playerToken;
        if (curr.x == x && curr.y == y)
            return true;
    }
    for (let i = 0; i < currEnemies.length; i++)
        if (currEnemies[i] != token) {
            curr = currEnemies[i];
            if (curr.x == x && curr.y == y)
                return true;
        }
    for (let i = 0; i < scenery.length; i++)
        if (scenery[i] != token)
            if (scenery[i].x == x && scenery[i].y == y)
                return true;
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
    else if (event.key == 'e' || event.key == ' ') {
        for (let i of scenery)
            if (i.img == chestImage && inRange(playerToken,i,1))
                for (let j in i.inventory) {
                    addItem(app.player.inventory,app.items[j](),i.inventory[j]);
                    removeItem(i.inventory,app.items[j](),'all');
                    i.img = chestOpenImage;
                    renderTile(i.x,i.y,i);
                }
            else if (i.img == doorImage && inRange(playerToken,i,1))
                app.currLocation = 'Wilderness';
    }
}
function getTile(x,y) {
    let floor, newX, newY;
    let rots = ['','rot90','rot180','rot270'];
    let cornerRots = {'01':'','12':'rot90','23':'rot180','03':'rot270'};
    let found = [];
    let found2 = [];
    if (dungeon1Map[y][x] == 2) {
        for (let i = 0; i < cardinalDirs.length; i++) {
            newX = x + cardinalDirs[i][1];
            newY = y + cardinalDirs[i][0];
            if (newX >= 0 && newX < dungeon1Map[0].length && newY > 0 && newY < dungeon1Map.length) {
                if(dungeon1Map[newY][newX] == 1)
                    found.push(i);
                else if(dungeon1Map[newY][newX] == 2)
                    found2.push(i);
            }
        }
    }
    if (found.length == 2)
        floor = '<img class="' + cornerRots[found.join('')] + '" id="img-' + y + ':' + x + '" src="images/corner.png">';
    else if (found2.length == 2 && (found2[0] + found2[1]) % 2 == 1) 
        floor = '<img class="' + cornerRots[found2.join('')] + '" id="img-' + y + ':' + x + '" src="images/cornerSmall.png">';
    else
        floor = '<img class="' + rots[found[0]] + '" id="img-' + y + ':' + x + '" src="' + floorTileImages[dungeon1Map[y][x]] + '">';
    return floor;
}

function renderFloorTiles() {
    table = '';
    for (var i = yVisMod; i < yVisMod + cols; i++) {
        row = '<tr>';
        for (var j = xVisMod; j < xVisMod + rows; j++) {
            cell = '<td onclick="takeAction(' + i + ',' + j + ')" id="' + i + ':' + j + '">' + getTile(j,i) + '</td>'
            row += cell;
        }
        row += '</tr>';
        table += row;
    }
    document.getElementById('board').innerHTML = table;
}

function buildFloatingNumTable() {
    let table = ''
    for (let y = 0; y < cols; y++) {
        table += '<tr>';
        for (let x = 0; x < rows; x++)
            table += `<td><span class="floating-num hidden" id='floating-num-${x}-${y}'>0</span></td>`;
        table += '</tr>';    
    }
    $('#floating-num-table').html(table);
}

function pathFind(start,end) {
    let valGrid = {};
    let toCheck = [];
    let curr, newX, newY, currX, currY, minPath;
    let result = [];
    let minVal = 10000;
    
    // todo if wall (dungeon1Map[y][x] == 0), then valGrid[i][j] = -1
    for (let i = yVisMod; i < yVisMod + cols; i++) {
        valGrid[i] = {};
        for (let j = xVisMod; j < xVisMod + rows; j++) {
            if (dungeon1Map[i][j] == 0)
                valGrid[i][j] = -1;
            else 
                valGrid[i][j] = 10000;
        }
    }
    for (let i of scenery)
        if (onScreen(i))
            valGrid[i.y][i.x] = -1;
    for (let i of currEnemies)
        valGrid[i.y][i.x] = -1;
    toCheck.push({x:end.x,y:end.y,val:0})
    while (true) {
        curr = toCheck.shift();
        if (!curr)
            break;
        if (curr.val < valGrid[curr.y][curr.x]) {
            valGrid[curr.y][curr.x] = curr.val;
            for (let i of cardinalDirs) {
                newX = curr.x + i[1];
                newY = curr.y + i[0];
                if (onBoard(newX,newY))
                    toCheck.push({x:newX,y:newY,val:curr.val+1})
            }
        }
    }
    currX = start.x;
    currY = start.y;
    while (result.length < start.entity.movement) {
        for (let i of cardinalDirs) {
            newX = currX + i[1];
            newY = currY + i[0];
            if (onBoard(newX,newY) && valGrid[newY][newX] >= 0 && (valGrid[newY][newX] < minVal || 
            // If there are two options with equal length path to target pick the one that minimizes linear distance
            (valGrid[newY][newX] == minVal && (distance({x:newX,y:newY},{x:end.x,y:end.y}) < distance({x:currX,y:currY},{x:end.x,y:end.y}))))) {
                minVal = valGrid[newY][newX];
                minPath = {x:newX,y:newY};
                // If we're adjacent to target, return without adding
                if (minVal == 0)
                    return result;
            }
        }
        currX = minPath.x;
        currY = minPath.y;
        result.push(minPath);
    }
    return result;
}

function distance(obj1,obj2) {
    let xDiff = obj1.x - obj2.x;
    let yDiff = obj1.y - obj2.y;
    return Math.abs(xDiff) + Math.abs(yDiff);
}

function chooseAction(action) {
    let newX, newY, curr;
    let toHighlight = [{x:playerToken.x,y:playerToken.y,val:0}];
    if (playerTurn) {
        highlights = {};
        renderEnemies();
        selectedAction = action;
        if (action == 'attack')
            action = {range:1};
        else
            if (app.spells[action].cost <= app.player.mana)
                action = app.spells[action];
        while(true) {
            curr = toHighlight.shift();
            if (!curr)
                break;
            if (dungeon1Map[curr.y][curr.x] == 1)
                renderTile(curr.x,curr.y,null,highlightRangeColor);
            for (let i of cardinalDirs) {
                newX = curr.x + i[1];
                newY = curr.y + i[0];
                if (newX >= 0 && newX < dungeon1Map[0].length && newY >= 0 && newY < dungeon1Map.length && curr.val < action.range)
                    toHighlight.push({x:newX,y:newY,val:curr.val+1})
            }
        }
        renderTile(playerToken.x,playerToken.y,playerToken,highlightRangeColor);
        for (let i of currEnemies)
            if (inRange(playerToken,i,action.range)) {
                renderTile(i.x,i.y,i,highlightEnemyColor);
                highlights[i.x + ':' + i.y] = highlightEnemyColor;
            }
        for (let i of scenery)
            if (inRange(playerToken,i,action.range))
                renderTile(i.x,i.y,i,highlightRangeColor);
    }
}

function floatingNumberTrigger(damage,uid){
    let target;
    let numX, numY;
    if (uid == playerToken.entity.uid)
        target = playerToken;
    else
        target = currEnemies.filter(e => e.entity.uid == uid)[0];
    numX = target.x - xVisMod;
    numY = target.y - yVisMod;
    $('#floating-num-' + numX + '-' + numY).html(damage);
    $('#floating-num-' + numX + '-' + numY).removeClass('hidden');
    // If already has class, remove and reapply to replay animation
    if ($('#floating-num-' + numX + '-' + numY).hasClass('floating-num-end'))
        $('#floating-num-' + numX + '-' + numY).removeClass('floating-num-end');
    $('#floating-num-' + numX + '-' + numY).addClass('floating-num-end');
    if (damage != 'Miss')
        $('#floating-num-' + numX + '-' + numY).addClass('hp-color');
    hideFloating[numX+'-'+numY] = setTimeout(()=> {
        $('#floating-num-' + numX + '-' + numY).removeClass('floating-num-end');
        $('#floating-num-' + numX + '-' + numY).addClass('hidden');
        $('#floating-num-' + numX + '-' + numY).removeClass('hp-color');
    },750);
}

function inRange(obj1,obj2,range) {
    if (distance(obj1,obj2) <= range)
        return true;
    return false;
}

function takeAction(y,x) {
    let target;
    if(highlights[x + ':' + y] == highlightEnemyColor) {
        target = currEnemies.filter(e => e.x == x && e.y == y)[0].entity;
        if (selectedAction == 'attack')
            app.attack(playerToken.entity, target);
        else {
            app.castSpell(playerToken.entity,target,selectedAction)
            document.getElementById('mana-inner').style.height = app.player.mana/app.player.maxMana()*100 + "%";
        }
        playerTurn = false;
        document.getElementById('xp-inner').style.height = app.player.xp/app.xpToLevel[app.player.level+1]*100 + '%';
        highlights = {};
        renderEnemies();
        enemyTurn();
    }
}

function startDungeon(){
    let buttons;
    let playerActions = [];

    playerToken = {x:24, y:58, img: 'images/player.png',entity:app.player};

    sightRange = parseInt(cols/2);
    xVisMod = playerToken.x - sightRange;
    yVisMod = playerToken.y - sightRange;

    renderFloorTiles();

    buttons = '';
    playerActions.push('attack');
    for (let i of app.player.spells)
        playerActions.push(i);
    for (let i of playerActions)
        buttons += '<button class="action-button" onclick="chooseAction(\'' + i + '\')">' + prettyPrint(i) + '</button>'
    document.getElementById('player-action-container').innerHTML = buttons;


    enemies = [
        // Treasure Room
        {x:7,y:50,img:'images/goblin.png',entity:app.allMonsters['goblin']()},
        {x:7,y:48,img:'images/goblin.png',entity:app.allMonsters['goblin']()},

        // Altar Room
        {x:24,y:48,img:'images/orc.png',entity:app.allMonsters['orc']()},
        {x:39,y:36,img:'images/goblin.png',entity:app.allMonsters['goblin']()},

        //Statue Room
        {x:39,y:37,img:'images/orc.png',entity:app.allMonsters['orc']()},
        {x:39,y:38,img:'images/goblin.png',entity:app.allMonsters['goblin']()},

        //Boss
        {x:36,y:18,img:'images/drake.png', entity:app.allMonsters['drake']()}
    ];

    renderTile(playerToken.x,playerToken.y,playerToken);
    renderEnemies();
    renderScenery();
        
    updateHP();
    updateMana();
    updateXP();

    buildFloatingNumTable();
    renderInventory();

    document.addEventListener('keydown', keyPress);
    app.$on('invChange', function() {
        renderInventory();
    });
    app.$on('damage', function(damage,uid) {
        floatingNumberTrigger(damage,uid);
    });
    app.$on('startDungeon', function() {
        startDungeon();
    });
}
startDungeon();