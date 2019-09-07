var app = new Vue({ 
    el: '#app',
    data: {
        stats: [],
        monsters:{},
        locations:['Wilderness','Shop'],
        currLocation: 'Wilderness',
        nextMonster: '',
        statInfo: {
            'str':'Strength: determines how hard you hit enemies.',
            'agi':'Agility: determines your chance of hitting an enemy.',
            'con':'Constitution: determines how much hp you have and how quickly it recovers',
            'int':'Intellegence: determines how powerful your spells are.',
            'wis': 'Wisdom: determines how quickly your mana regenerates.'
        },
        items: items,
        gameTick: 1000,
        xpToLevel: [0,0]
    },
    methods: {
        newCreature: function(name,str,agi,con,int=0,wis=0,ac=0) {
            let creature = {};
            creature.name = name;
            creature.ac = ac;
            creature.str = str;
            creature.agi = agi;
            creature.con = con;
            creature.int = int;
            creature.wis = wis;
            creature.isAlive = true;
            creature.maxHP = function() {
                return this.con * 2;
            }
            creature.hp = creature.maxHP();
            creature.takeDamage = function(amount) {
                if (amount >= this.hp) {
                    this.hp = 0;
                    this.isAlive = false;
                    this.die();
                }
                else
                    this.hp -= amount;
            }
            creature.heal = function(amount){
                creature.takeDamage(amount * -1);
            }
            creature.toHit = function() {
                let roll = app.d20();
                if (roll == 20)
                    return "crit";
                else
                    return roll + this.agi;
            }

            if (creature.name != "Player")
                creature.die = function() {
                    app.giveXP(this.xpVal);
                    if (this.loot)
                        for (let i of this.loot) {
                            app.addItem('player',i);
                        }
                }
            else {
                creature.die = function() {
                    app.currEnemy = app.monsters[app.nextMonster]();
                }
                creature.rest = function() {
                    let amount = Math.ceil(this.con/5);
                    if (this.hp + amount > this.maxHP()) {
                        this.hp = this.maxHP();
                        this.isAlive = true;
                    }
                    else
                        this.hp += amount;
                }
            }
            return creature;
        },
        playerInit: function() {
            this.player = this.newCreature("Player",2,2,5,4,5,ac=12);
            this.player.xp = 0;
            this.player.level = 1;
            this.player.points = 0;
            this.player.inventory = {};
        },
        addItem(entity,loot) {
            let inv = this[entity].inventory;
            let item = this.items[loot.func]();
            let amount;
            if (loot.amount instanceof Array)
                amount = parseInt(Math.random()*loot.amount[1]) + loot.amount[0];
            else
                amount = loot.amount;
            if (!inv[item.name])
                inv[item.name] = amount;
            else
                inv[item.name] += amount;
        },

        // Enemies
        boar: function() {
            let boar = this.newCreature("boar",1,1,2.5,ac=6);
            boar.xpVal = 8;
            return boar;
        },
        goblin: function() {
            let goblin = this.newCreature("goblin",2,2,4,ac=8);
            goblin.xpVal = 13;
            goblin.loot = [{func:'copper_coin',amount:[1,3]}];
            return goblin;
        },
        attack: function(attacker,target) {
            let damage = parseInt(Math.random() * attacker.str) + 1;
            let toHit = attacker.toHit();
            if (toHit == "crit")
                target.takeDamage(damage*2)
            else if (toHit >= target.ac)
                target.takeDamage(damage)
        },
        playerTurn: function() {
                this.attack(this.player, this.currEnemy);
        },
        enemyTurn: function() {
                this.attack(this.currEnemy, this.player);
        },
        giveXP(amount) {
            this.player.xp += amount;

            // Level up
            if (this.player.xp >= this.xpToLevel[this.player.level+1]) {
                this.player.level++;
                this.player.xp -= this.xpToLevel[this.player.level];
                this.player.points++;
                this.milestones(this.player.level);
            }
        },
        milestones(level) {
            // Stat reveal milestones
            if (level == 2)
                this.stats.push('str');
            if (level == 3)
                this.stats.push('agi');
            if (level == 5)
                this.stats.push('con');

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
                results[i] = i + ": " + parseInt(results[i]*100) + "%"
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
                app.playerTurn();
                app.$forceUpdate();
                if (app.currEnemy.isAlive)
                    setTimeout(() => {
                        app.enemyTurn();  
                        app.$forceUpdate();
                    },app.gameTick/2)
            }
            else if (!app.currEnemy.isAlive) {
                setTimeout(() => {
                    app.currEnemy = app.monsters[app.nextMonster]();
                    app.$forceUpdate();
                },app.gameTick/2);
            }
            else {
                app.player.rest();
                app.$forceUpdate();
            }
        },this.gameTick);
    }
});