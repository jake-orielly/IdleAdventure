var items = {
    copper_coin: function() {
        return {name:'copper_coin',plural:'copper_coins',value:1}
    },
    bread: function() {
        return {name:'bread',plural:'bread',value:2,useName:'eat',use:function(user){
            user.heal(8);
            removeItem(user.inventory,this,1);
        }}
    },
    copper_dagger: function() {
        return weapon('copper_dagger','s',1,3,15)
    },
    copper_sword: function() {
        return weapon('copper_sword','s',2,5,55)
    },
    copper_axe: function() {
        return weapon('copper_axe','s',3,2,65)
    },
    copper_mace: function() {
        return weapon('copper_mace','s',4,0,70)
    },
    iron_dagger: function() {
        return weapon('iron_dagger','s',2,6,165)
    },
    iron_sword: function() {
        return weapon('iron_sword','s',4,9,240)
    },
    iron_axe: function() {
        return weapon('iron_axe','s',6,5,270)
    },
    iron_mace: function() {
        return weapon('iron_mace','s',9,2,290)
    },
    copper_breastplate: function() {
        return armor('copper_breastplate','s',75,'chest',4);
    },
    copper_greaves: function() {
        return armor('copper_greaves','',60,'legs',3);
    },
    copper_helmet: function() {
        return armor('copper_helmet','s',45,'head',2);
    },
    copper_gauntlets: function() {
        return armor('copper_gauntlets','',28,'hands',1);
    },
    iron_breastplate: function() {
        return armor('iron_breastplate','s',410,'chest',9);
    },
    iron_greaves: function() {
        return armor('iron_greaves','',300,'legs',6);
    },
    iron_helmet: function() {
        return armor('iron_helmet','s',230,'head',4);
    },
    iron_gauntlets: function() {
        return armor('iron_gauntlets','',120,'hands',2);
    }
}

function weapon(name,plural,damage,toHit,value) {
    return {name:name,plural:name + plural,value:value,useName:'equip',
    use:function(user){
        user.equip(this);
    },
    slot: 'weapon',effects:{
        damage: damage, toHit: toHit
    }}
}

function armor(name,plural,value,slot,ac) {
    return {name:name,plural:name + plural,value:value,useName:'equip',
        use:function(user){
            user.equip(this);
        },
        slot: slot,effects:{
            ac: ac,
        }}
}