var spells = {
    fire_blast: {
        cost: 4, range: 3, func: function(caster,target) {
            let damage = parseInt((Math.random() * Math.pow(caster.int+1,1.9) + Math.pow(caster.int,1.9)));
            target.takeDamage(damage);
            app.$forceUpdate();
        }
    },
    ice_blast: {
        cost: 7, range: 3, func: function(caster,target) {
            let damage = parseInt(Math.pow((Math.random() * caster.int+caster.int/2),2));
            target.takeDamage(damage);
            target.isStunned = 2;
            app.$forceUpdate();
        }
    },
}