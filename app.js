var app = new Vue({ 
    el: '#app',
    data: {
        playerStats: [],
        monsters:{},
        locations:['Wilderness','Dungeon'],
        currLocation: 'Wilderness',
        statInfo: {
            'str':'Strength: determines how hard you hit enemies.',
            'agi':'Agility: determines your chance of hitting an enemy.',
            'con':'Constitution: determines how much hp you have and how quickly it recovers',
            'int':'Intellegence: determines how powerful your spells are.',
            'wis': 'Wisdom: determines how quickly your mana regenerates.'
        },
        items: items,
        allMonsters: allMonsters,
        spells: spells,
        gameTick: 1,
        gameTickInterval: 20,
        turnInterval: 75,
        recoveryInterval: 20,
        monsterDeathTick: 0,
        monsterSpawnTime: 50,
        newItems: [],
        xpToLevel: [0,0],
    },
    methods: {
        playerInit: function() {
            let player = this.newCreature("player",2,2,5,4,5,12);
            player.xp = 0;
            player.level = 1;
            player.points = 0;
            player.spells = [];
            player.inventory = {};
            player.equipment = {};
            player.uid = 0;
            player.die = function() {
                app.currEnemy = 0;
                document.getElementById('monsterSelector').value = "rest";
            }
            player.rest = function() {
                let amount = this.con/30;
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
            let ac = defender.ac;
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
            this.player.xp += amount;

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
            let milestones = [
                {},
                {},
                {'stat':'str'}, // lvl 2
                {'stat':'agi'}, // lvl 3
                {'monster':'goblin','location':'Shop','items':['bread']}, // lvl 4
                {'stat':'con'}, // lvl 5
                {'stat':'int','spell':'fire_blast'}, // lvl 6
                {'items':['copper_dagger']}, // lvl 7
                {'stat':'wis'}, // lvl 8
                {'items':['copper_sword','copper_axe','copper_mace']}, // lvl 9
                {'monster':'bandit'}, // lvl 10
                {'spell':'ice_blast'}, // lvl 11
                {'items':['copper_breastplate','copper_greaves','copper_helmet','copper_gauntlets']}, // lvl 12
                {'items':['iron_dagger']}, // lvl 13
                {'items':['iron_sword','iron_axe','iron_mace']}, // lvl 14
                {'items':['iron_breastplate','iron_greaves','iron_helmet','iron_gauntlets']}, // lvl 15
            ];
            let currMilestone = milestones[level];
            if (currMilestone['stat'])
                this.playerStats.push(currMilestone['stat']);
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
        simulate: function(monster,trials){
            let results = [];
            let curr;
            for (let i = 0; i < trials; i++) {
                this.player.hp = this.player.maxHP();
                this.player.isAlive = true;
                this.currEnemy = this.monsters[monster]();
                curr = 0;
                while(this.player.isAlive)
                    if (this.player.isAlive && this.currEnemy.isAlive) {
                        this.playerTurn();
                        if (this.currEnemy.isAlive)
                                this.enemyTurn();
                    }
                    else if (!this.currEnemy.isAlive) {
                        curr++;
                        this.currEnemy = this.monsters[monster]();
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
        },

        // UI Functions
        statIncrease: function(stat) {
            this.player[stat]++;
            this.player.points--;
            this.$forceUpdate();
        },
        changeLocation: function(loc) {
            this.currLocation = loc;
            if (loc == 'Dungeon')
                document.getElementById("dungeonIframe").focus();

        },
        prettyPrint: prettyPrint,
        ping: function(string="hello") {
            console.log(string);
        }
    },
    created: function() {
        for (let i = 2; i < 1000; i++)
            this.xpToLevel[i] = this.xpFunc(i);
        this.playerInit();
        this.currEnemy = 0;
        this.monsters['boar'] = this.boar;
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