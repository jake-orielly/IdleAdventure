var items = {
    copper_coin: function() {
        return {name:'copper_coin',plural:'copper_coins',value:1}
    },
    bread: function() {
        return {name:'bread',plural:'bread',value:4,useName:'eat',use:function(user){
            user.heal(3);
            removeItem('player',this,1);
            app.$forceUpdate();
        }}
    },
    copper_dagger: function() {
        return {name:'copper_dagger',plural:'copper_daggers',value:15,useName:'equip',
        use:function(user){
            user.equip(this);
            app.$forceUpdate();
        },
        slot: 'weapon',effects:{
            damage: 1, toHit: 2
        }}
    },
    iron_dagger: function() {
        return {name:'iron_dagger',plural:'iron_daggers',value:135,useName:'equip',
        use:function(user){
            user.equip(this);
            app.$forceUpdate();
        },
        slot: 'weapon',effects:{
            damage: 2, toHit: 5
        }}
    },
    copper_breastplate: function() {
        return {name:'copper_breastplate',plural:'copper_breastplates',value:55,useName:'equip',
        use:function(user){
            user.equip(this);
            app.$forceUpdate();
        },
        slot: 'weapon',effects:{
            ac: 4,
        }}
    }
}