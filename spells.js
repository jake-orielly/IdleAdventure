var spells = {
    fire_blast: {
        cost: 4, range: 2, func: function(caster,target) {
            let damage = parseInt((Math.random() * Math.pow(caster.int+1,1.9) + Math.pow(caster.int,1.9)));
            target.takeDamage(damage);
            app.$forceUpdate();
        }
    },
    ice_blast: {
        cost: 7, range: 3, func: function(caster,target) {
            let damage = parseInt((Math.random() * Math.pow(caster.int+1,1.7) + Math.pow(caster.int,1.5)));
            target.takeDamage(damage);
            target.isStunned = 4;
            app.$forceUpdate();
        }
    },
}