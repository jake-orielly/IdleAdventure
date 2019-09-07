var spells = {
    fire_blast: {
        cost: 4, func: function(caster,target) {
            let damage = parseInt(Math.pow((Math.random() * caster.int+caster.int/2),1.5));
            target.takeDamage(damage);
            app.$forceUpdate();
        }
    },
    ice_blast: {
        cost: 7, func: function(caster,target) {
            let damage = parseInt(Math.pow((Math.random() * caster.int+caster.int/2),2));
            target.takeDamage(damage);
            target.isStunned = 2;
            app.$forceUpdate();
        }
    },
}