var app = new Vue({ 
    el: '#app',
    data: {
        monsters:{},
        locations:['Wilderness'],
        currLocation: 'Wilderness',
        statInfo: {
            'str':'Strength: determines how hard you hit enemies.',
            'agi':'Agility: determines how often you hit, and how often you get hit.',
            'con':'Constitution: determines how much hp you have and how quickly it recovers',
            'int':'Intellegence: determines how powerful your spells are.',
            'wis': 'Wisdom: determines how quickly your mana regenerates.'
        },
        items: items,
        allMonsters: allMonsters,
        spells: spells,
        milestonesList: milestonesList,
        gameTick: 1,
        gameTickInterval: 10,
        //gameTickInterval: 20,
        turnInterval: 75,
        recoveryInterval: 20,
        monsterDeathTick: 0,
        monsterSpawnTime: 50,
        newItems: [],
        // Perk trackers
        afterlifePoints: 0,
        startingPoints: 0,
        startingInventory: {},
        startingStr: 2,
        startingCon: 5,
        startingAc: 12,
        xpMultiplier: 1,
        costMultiplier: 1,
        startingStats: [],
        startingSpells: [],
        xpToLevel: [0,0],
        perkList: [
            {level:0,perks:[
                {name:'Recovered Memories',text:'+5% xp from all sources',func:()=>{app.xpMultiplier = 1.05},cost:1},
                {name:'Psychic Regression',text:'+15% xp from all sources',func:()=>{app.xpMultiplier = 1.15},cost:3}
            ]},
            {level:0,perks:[
                {name:'Clever Negotiator', text:'15% off all goods in the shop',func:()=>{app.costMultipler = 0.85},cost:1},
                {name:'Expert Haggler',text:'35% off all goods in the shop',func:()=>{app.costMultipler = 0.65},cost:3}
            ]},
            {level:0,perks:[
                {name:'Well Provided',text:'Start with 100 copper coins',func:()=>{app.startingInventory = {copper_coin: 100}},cost:1},
                {name:'Trust Fund',text:'Start with 300 copper coins',func:()=>{app.startingInventory = {copper_coin: 300}},cost:3}
            ]},
            {level:0,perks:[
                {name:'Robust',text:'Start with +1 str and +1 con',func:()=>{app.startingStr += 1; app.startingCon += 1;},cost:1},
                {name:'Burly',text:'Start with +3 str and +2 con',func:()=>{app.startingStr += 2; app.startingCon += 1;},cost:3}
            ]},
            {level:0,perks:[
                {name:'Thick Skin',text:'Start with +2 natural armor',func:()=>{app.startingAc += 2;},cost:1},
                {name:'Formidable',text:'Start with +5 natural armor',func:()=>{app.startingAc += 3;},cost:3}
            ]},
            {level:0,perks:[
                {name:'Naturally Adept',text:'Unlock magic at level 4',func:()=>{app.milestonesList[4].spell = 'fire_blast'; delete app.milestonesList[6]['spell'];},cost:1},
                {name:'Braniac',text:'Unlock magic at level 1',func:()=>{app.startingSpells = ['fire_blast']; delete app.milestonesList[4]['spell'];},cost:3}
            ]},
            {level:0,perks:[
                {name:'Time Dilation',text:'Time moves 10% faster during training',func:()=>{app.gameTickInterval = 18},cost:1},
                {name:'Chronomancer',text:'Time moves 25% faster during training',func:()=>{app.gameTickInterval = 15},cost:3}
            ]},
            {level:0,perks:[
                {name:'Flexibility',text:'Can put points into any stat at from level one',func:()=>{app.startingStats = ['str','agi','con','int','wis']},cost:1}
            ]},
            {level:0,perks:[
                {name:'Statistically significant',text:'Start with 1 stat point to spend',func:()=>{app.startingPoints = 1},cost:1},
                {name:'Outlier',text:'Start with 3 stat points to spend',func:()=>{app.startingPoints = 3},cost:3}
            ]}
        ]
    },
    methods: {
        buyPerk: function(perk) {
            let currPerk = perk.perks[perk.level];
            if (this.afterlifePoints >= currPerk.cost) {
                this.afterlifePoints -= currPerk.cost;
                perk.level++;
                currPerk.func();
            }
        },
        playerInit: function() {
            let player = this.newCreature("player",this.startingStr,2,this.startingCon,4,5,this.startingAc);
            player.xp = 0;
            player.level = 1;
            player.stats = [];
            for (let i of this.startingStats)
                player.stats.push(i);
            player.points = this.startingPoints;
            player.spells = this.startingSpells;
            player.inventory = this.startingInventory;
            player.equipment = {};
            player.uid = 0;
            player.die = function() {
                app.currEnemy = 0;
                if (app.currLocation == 'Wilderness' && !app.player.inAfterlife &&  document.getElementById('monsterSelector'))
                    document.getElementById('monsterSelector').value = "rest";
                else {
                    setTimeout(()=>{
                        app.currLocation = 'Wilderness';
                        app.player.inAfterlife = true;
                        app.afterlifePoints += app.player.level - 1;
                    },300);
                }
            }
            player.rest = function() {
                let amount = this.con/15;
                player.takeDamage(-1 * amount);
            }
            player.manaRegen = function() {
                let amount = this.wis/75;
                if (this.mana + amount > this.maxMana())
                    this.mana = this.maxMana();
                else
                    this.mana += amount;
            }
            player.equip = function(item) {
                if (this.equipment[item.slot])
                    addItem(this.inventory,this.equipment[item.slot],1);
                this.equipment[item.slot] = item;
                removeItem(this.inventory,item,1);
            }

            this.player = player;
        },
        newCreature: newCreature,
        addItem: addItem,
        removeItem: removeItem,

        attack: function(attacker,defender) {
            let damage = attacker.dmgRoll();
            let toHit = attacker.toHit();
            let ac = defender.ac + Math.pow(defender.agi,1.8); // Add agi bonus
            let effects;
            if (attacker.equipment)
                for (let i in attacker.equipment) {
                    effects = attacker.equipment[i].effects;
                    if (effects.damage)
                        damage += effects.damage;
                    else if (toHit != 'crit' && effects.toHit)
                        toHit += effects.toHit;
                }
            if (defender.equipment)
                for (let i in defender.equipment) {
                    effects = defender.equipment[i].effects;
                    if (effects.ac)
                        ac += effects.ac;
                }
            if (toHit == 'crit')
                defender.takeDamage(damage*2);
            else if (toHit >= ac)
                defender.takeDamage(damage);
            else {
                defender.currHitAddon = "Miss";
                if (app.currLocation == 'Dungeon')
                    app.$emit('damage','Miss',defender.uid);
            }
        },
        castSpell: function(caster,target,givenSpell) {
            let spell = spells[givenSpell];
            console.log(spell,givenSpell)
            if (caster.mana > spell.cost && caster.isAlive && target.isAlive) {
                spell.func(caster,target);
                caster.mana -= spell.cost;
            }
        },
        playerTurn: function() {
            this.attack(this.player, this.currEnemy);
            this.player.currHit = undefined;
            this.player.currHitAddon = undefined;
        },
        enemyTurn: function() {
            this.attack(this.currEnemy, this.player);
            this.currEnemy.currHit = undefined;
            this.currEnemy.currHitAddon = undefined;
        },
        giveXP(amount) {
            this.player.xp += amount * this.xpMultiplier;

            // Level up
            if (this.player.xp >= this.xpToLevel[this.player.level+1]) {
                this.player.level++;
                this.player.xp -= this.xpToLevel[this.player.level];
                this.player.points++;
                this.player.mana = this.player.maxMana();
                this.milestones(this.player.level);
            }
        },
        milestones(level) {
            let currMilestone = milestonesList[level];
            if (!currMilestone)
                return;
            if (currMilestone['stat'] && app.startingStats.length == 0)
                this.player.stats.push(currMilestone['stat']);
            if (currMilestone['monster'])
                this.monsters[currMilestone['monster']] = this.allMonsters[currMilestone['monster']];
            if (currMilestone['spell'])
                this.player.spells.push(currMilestone['spell']);
            if (currMilestone['location'])
                this.locations.push(currMilestone['location']);
            // Item Milestones
            if (currMilestone['items'])
                for (let i of currMilestone['items'])
                    this.newItems.push(i);

        },
        d20: function() {
            return parseInt(Math.random()*20) + 1;
        },
        xpFunc: function(level) {
            let neededXP = this.xpToLevel[level-1] + Math.floor(level + 100 * Math.pow(2, level / 7))/4;
            return parseInt(neededXP);
        },
        enemySelect() {
            if (document.getElementById('monsterSelector').value != 'Rest')
                app.currEnemy = app.allMonsters[document.getElementById('monsterSelector').value]();
        },
        simulateAttack: function(monster,trials) {
            let average = 0;
            let results = [];
            let bigNum = Math.pow(2,16);
            this.currEnemy = this.allMonsters[monster]();
            for (let i = 6; i < 22; i += 2) {
                average = 0;
                this.currEnemy.ac = i;
                for (let j = 0; j < trials; j++) {
                    this.currEnemy.hp = bigNum;
                    this.attack(this.player, this.currEnemy);
                    average += bigNum - this.currEnemy.hp;
                }
                average /= trials;
                results.push(average);
            }
            this.currEnemy = 0;
            console.log(results);
        },
        simulate: function(monster,trials){
            let results = [];
            let turns = 0;
            let kills = 0;
            let curr;
            for (let i = 0; i < trials; i++) {
                this.player.hp = this.player.maxHP();
                this.player.isAlive = true;
                this.currEnemy = this.allMonsters[monster]();
                curr = 0;
                while(this.player.isAlive)
                    if (this.player.isAlive && this.currEnemy.isAlive) {
                        this.attack(this.player, this.currEnemy);
                        turns++;
                        if (this.currEnemy.isAlive)
                            this.attack(this.currEnemy, this.player);
                    }
                    else if (!this.currEnemy.isAlive) {
                        curr++;
                        kills++;
                        this.currEnemy = this.allMonsters[monster]();
                    }
                if (results[curr] == undefined)
                    for (let j = 0; j <= curr; j++)
                        if (results[j] == undefined)
                            results[j] = 0;
                results[curr] += 1;
            }
            for (let i = 0; i < results.length; i++) {
                results[i] /= trials;
                results[i] = i + ": " + ('' + results[i]*100).substr(0,4) + "%"
            }
            console.log(results);
            console.log(turns/kills);
        },

        // UI Functions
        statIncrease: function(stat) {
            let tempHP = this.player.maxHP();
            this.player[stat]++;
            if (stat == 'con')
                this.player.hp += this.player.maxHP() - tempHP;
            this.player.points--;
            this.$forceUpdate();
        },
        changeLocation: function(loc) {
            this.currLocation = loc;
            if (loc == 'Dungeon') {
                app.$emit('startDungeon');
                document.getElementById("dungeonIframe").focus();
            }

        },
        prettyPrint: prettyPrint,
        ping: function(string="hello") {
            console.log(string);
        },
        newLife: function() {
            this.playerInit();
            this.currEnemy = 0;
            this.monsters = {boar: this.boar};
            this.locations = ['Wilderness'];
            this.newItems = [];
            this.player.inAfterlife = false;
        }
    },
    created: function() {
        for (let i = 2; i < 1000; i++)
            this.xpToLevel[i] = this.xpFunc(i);
        this.newLife();
        this.gameLoop = setInterval(function(){
            if (app.currLocation == 'Wilderness') {
                if (app.player.isAlive && app.currEnemy && app.currEnemy.isAlive) {
                    if (app.gameTick % app.turnInterval == 0) {
                        app.playerTurn();
                        app.$forceUpdate();
                    }
                    else if (app.gameTick % app.turnInterval == parseInt(app.turnInterval/2) && app.currEnemy) {
                        if (app.currEnemy.isStunned == 0 || app.currEnemy.isStunned == 1) {
                            if (app.currEnemy.isStunned == 1)
                                app.currEnemy.isStunned = 0;
                            app.enemyTurn();  
                            app.$forceUpdate();
                        }
                        else 
                            app.currEnemy.isStunned--;
                    }
                }
                else if (app.currEnemy && !app.currEnemy.isAlive) {
                    if (!app.monsterDeathTick)
                        app.monsterDeathTick = app.gameTick;
                    else if (app.gameTick == app.monsterDeathTick + app.monsterSpawnTime) {
                        if (document.getElementById('monsterSelector').value == 'Rest') {
                            app.currEnemy = 0;
                            app.player.rest();
                        }
                        else
                            app.currEnemy = app.allMonsters[document.getElementById('monsterSelector').value]();
                        app.monsterDeathTick = 0;
                        app.$forceUpdate();
                    }
                }
                if (app.gameTick % app.recoveryInterval == 0) {
                    if (!app.player.isAlive)
                        app.player.rest();
                    if (app.player.mana < app.player.maxMana())
                        app.player.manaRegen();
                    app.$forceUpdate();
                }
                app.gameTick++;
            }
        },this.gameTickInterval);
    }
});

window.app = app;