var app = new Vue({ 
    el: '#app',
    data: {
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
                }
            else {
                creature.die = function() {
                    console.log("You died! How embarrassing.")
                    app.currEnemy = app.boar();
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
        boar: function() {
            let boar = this.newCreature("Boar",1,1,4,ac=8);
            boar.xpVal = 12;
            return boar;
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
            if (this.player.xp >= this.xpFunc(this.player.level)) {
                this.player.level++;
                this.player.xp -= this.xpFunc(this.player.level);
            }
        },
        d20: function() {
            return parseInt(Math.random()*20) + 1;
        },
        xpFunc: function(level) {
            let neededXP = this.xpToLevel[level-1] + Math.floor(level + 150 * Math.pow(2, level / 7))/4;
            return parseInt(neededXP);
        }
    },
    created: function() {
        for (var i = 2; i < 1000; i++)
            this.xpToLevel[i] = this.xpFunc(i);
        this.player = this.newCreature("Player",2,2,5,2,2,ac=12);
        this.player.xp = 0;
        this.player.level = 1;
        this.currEnemy = this.boar();
        setInterval(function(){
            if (app.player.isAlive && app.currEnemy.isAlive) {
                app.playerTurn();
                app.$forceUpdate();
                if (app.player.isAlive && app.currEnemy.isAlive)
                    setTimeout(() => {
                        app.enemyTurn();  
                        app.$forceUpdate();
                    },app.gameTick/2)
            }
            else if (!app.currEnemy.isAlive) {
                setTimeout(() => {
                    app.currEnemy = app.boar();
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