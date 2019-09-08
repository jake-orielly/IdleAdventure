var uid = 1;
var allMonsters = {
    boar: function() {
        let boar = newCreature("boar",1,1,2.5,0,0,6);
        boar.xpVal = 8;
        return boar;
    },
    goblin: function() {
        let goblin = newCreature('goblin',2,2,4,0,0,8);
        goblin.xpVal = 13;
        goblin.loot = [{name:'copper_coin',amount:[1,3]}];
        return goblin;
    },
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
        app.$emit('damage',-1*amount,this.uid);
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
                    addItem(app.player.inventory,items[i.name](),i.amount);
        }
    return creature;
}

function newUID() {
    let newId = uid;
    this.uid++;
    return newId;
}