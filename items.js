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
        return {name:'copper_dagger',plural:'copper_daggers',value:15,equipment:{
            damage: 1, toHit: 2
        }}
    }
}