var app = new Vue({ 
    el: '#app',
    data: {
        playerStats: [],
        monsters:{},
        locations:['Wilderness','Shop'],
        currLocation: 'Dungeon',
        nextMonster: '',
        statInfo: {
            'str':'Strength: determines how hard you hit enemies.',
            'agi':'Agility: determines your chance of hitting an enemy.',
            'con':'Constitution: determines how much hp you have and how quickly it recovers',
            'int':'Intellegence: determines how powerful your spells are.',
            'wis': 'Wisdom: determines how quickly your mana regenerates.'
        },
        items: items,
        spells: spells,
        gameTick: 1,
        gameTickInterval: 20,
        turnInterval: 75,
        recoveryInterval: 20,
        monsterDeathTick: 0,
        monsterSpawnTime: 50,
        xpToLevel: [0,0],
    },
    methods: {
        newCreature: function(name,str,agi,con,int,wis,ac) {
            let creature = {};
            creature.name = name;
            creature.ac = ac;
            creature.str = str;
            creature.agi = agi;
            creature.con = con;
            creature.int = int;
            creature.wis = wis;
            creature.isAlive = true;
            creature.isStunned = 0;
            
            creature.maxHP = function() {
                return this.con * 2;
            }
            creature.hp = creature.maxHP();

            creature.maxMana = function() {
                return this.wis * 3;
            }
            creature.mana = creature.maxMana();

            creature.takeDamage = function(amount) {
                // Catch overkill
                if (amount >= this.hp) {
                    this.hp = 0;
                    this.isAlive = false;
                    this.die();
                }
                // Catch overheal
                else if (amount < 0 && this.hp - amount >= creature.maxHP()) {
                    this.hp = this.maxHP();
                    this.isAlive = true;
                }
                else
                    this.hp -= amount;
                this.currHit = -1 * amount;
            }
            creature.heal = function(amount){
                creature.takeDamage(amount * -1);
            }
            creature.dmgRoll = function() {
                return parseInt(Math.random() * this.str) + 1;
            }
            creature.toHit = function() {
                let roll = app.d20();
                if (roll == 20)
                    return "crit";
                else {
                    return roll + this.agi;
                }
            }

            if (creature.name != "player")
                creature.die = function() {
                    app.giveXP(this.xpVal);
                    if (this.loot)
                        for (let i of this.loot)
                            addItem('player',items[i.name](),i.amount);
                }
            return creature;
        },
        playerInit: function() {
            let player = this.newCreature("player",2,2,5,4,5,12);
            player.xp = 0;
            player.level = 1;
            player.points = 0;
            player.spells = [];
            player.inventory = {};
            player.equipment = {};
            player.die = function() {
                app.currEnemy = app.monsters[app.nextMonster]();
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
                    addItem('player',this.equipment[item.slot],1);
                this.equipment[item.slot] = item;
                removeItem('player',item,1);
            }

            this.player = player;
        },
        addItem: addItem,
        removeItem: removeItem,

        // Enemies
        boar: function() {
            let boar = this.newCreature("boar",1,1,2.5,0,0,6);
            boar.xpVal = 8;
            return boar;
        },
        goblin: function() {
            let goblin = this.newCreature('goblin',2,2,4,0,0,8);
            goblin.xpVal = 13;
            goblin.loot = [{name:'copper_coin',amount:[1,3]}];
            return goblin;
        },
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
            }
        },
        castSpell: function(caster,target,givenSpell) {
            let spell = spells[givenSpell];
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
            // Stat reveal milestones
            if (level == 2)
                this.playerStats.push('str');
            else if (level == 3)
                this.playerStats.push('agi');
            else if (level == 5)
                this.playerStats.push('con');
            else if (level == 6) {
                this.playerStats.push('int');
                this.player.spells.push('fire_blast');
            }
            else if (level == 7)
                this.playerStats.push('wis');
            else if (level == 8)
                this.player.spells.push('ice_blast');

            // Monster reveal milestones
            if (level == 4)
                this.monsters['goblin'] = this.goblin;
        },
        d20: function() {
            return parseInt(Math.random()*20) + 1;
        },
        xpFunc: function(level) {
            let neededXP = this.xpToLevel[level-1] + Math.floor(level + 100 * Math.pow(2, level / 7))/4;
            return parseInt(neededXP);
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
        prettyPrint: prettyPrint,
        ping: function(string="hello") {
            console.log(string);
        }
    },
    created: function() {
        for (let i = 2; i < 1000; i++)
            this.xpToLevel[i] = this.xpFunc(i);
        this.playerInit();
        this.monsters['boar'] = this.boar;
        this.currEnemy = this.boar();
        this.nextMonster = 'boar';
        this.gameLoop = setInterval(function(){
            if (app.player.isAlive && app.currEnemy.isAlive) {
                if (app.gameTick % app.turnInterval == 0) {
                    app.playerTurn();
                    app.$forceUpdate();
                }
                else if (app.gameTick % app.turnInterval == parseInt(app.turnInterval/2)) {
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
            else if (!app.currEnemy.isAlive) {
                if (!app.monsterDeathTick)
                    app.monsterDeathTick = app.gameTick;
                else if (app.gameTick == app.monsterDeathTick + app.monsterSpawnTime) {
                    app.currEnemy = app.monsters[app.nextMonster]();
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
        },this.gameTickInterval);
    }
});