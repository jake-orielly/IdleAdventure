var uid = 1;
var allMonsters = {
    boar: function() {
        return newMonster('boar',1,1,2.5,0,0,6,8,[]);
    },
    goblin: function() {
        return newMonster('goblin',2,1.5,7,0,0,8,39,[{name:'copper_coin',amount:[3,9]}]);
    },
    bandit: function() {
        return newMonster('bandit',3,5,9.5,0,0,10,65,[{name:'copper_coin',amount:[15,32]}]);
    },
    orc: function() {
        return newMonster('orc',6,7.5,11,0,0,13,150,[{name:'copper_coin',amount:[45,68]}]);
    },
    drake: function() {
        return newMonster('drake',7,8.5,11,0,0,16,1200,[]);
    },
}

function newMonster(name,str,agi,con,int,wis,ac,xp,loot) {
    let monster = newCreature(name,str,agi,con,int,wis,ac);
    monster.xpVal = xp;
    monster.loot = loot;
    return monster;
}

function newCreature(name,str,agi,con,int,wis,ac) {
    let creature = {};
    creature.name = name;
    creature.ac = ac;
    creature.str = str;
    creature.agi = agi;
    creature.con = con;
    creature.int = int;
    creature.wis = wis;
    creature.uid = newUID();
    creature.isAlive = true;
    creature.isStunned = 0;
    creature.movement = 2;
    
    creature.maxHP = function() {
        return parseInt((Math.pow(this.con/2,1.8)) + this.con * Math.pow(this.con,.5));
    }
    creature.hp = creature.maxHP();

    creature.maxMana = function() {
        return parseInt(this.wis*2 + Math.pow(this.wis/3,2));
    }
    creature.mana = creature.maxMana();

    creature.takeDamage = function(amount,addon) {
        // Catch overkill
        if (amount >= this.hp) {
            this.hp = 0;
            this.isAlive = false;
            this.die();
        }
        // Catch overheal
        else if (amount < 0 && this.hp - amount >= creature.maxHP()) {
            if (this.hp != this.maxHP()) {
                this.currHit = -1 * amount;
                this.hp = this.maxHP();
                this.isAlive = true;
            }
        }
        else
            this.hp -= amount;
        if (addon == 'rest')
            if (this.hp == this.maxHP())
                this.currHit = undefined;
            else
                this.currHit = prettyPrint(1000 / (app.gameTickInterval * app.recoveryInterval) * amount * -1) + '/s';
        else
            this.currHit = -1 * amount;
        if (app.currLocation == 'Dungeon')
            app.$emit('damage',-1*amount,this.uid,addon);
    }
    creature.heal = function(amount){
        creature.takeDamage(amount * -1);
    }
    creature.dmgRoll = function() {
        return parseInt(Math.random() * Math.pow(this.str/1.5,1.7) + Math.min(this.str/3,1)) + 1;
    }
    creature.toHit = function() {
        let roll = app.d20();
        if (roll == 20)
            return "crit";
        else {
            return roll + Math.pow(this.agi,1.8);
        }
    }

    if (creature.name != "player")
        creature.die = function() {
            if (app.monsters.indexOf(this.name) == -1) {
                app.monsters.push(this.name);
                app.$emit('monsterUnlocked',this.name);
            }
            app.giveXP(this.xpVal);
            if (this.loot)
                for (let i of this.loot)
                    addItem(app.player.inventory,items[i.name](),i.amount);
        }
    return creature;
}

function newUID() {
    let newId = uid;
    this.uid++;
    return newId;
}