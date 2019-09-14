var items = {
    copper_coin: function() {
        return {name:'copper_coin',plural:'copper_coins',value:1}
    },
    bread: function() {
        return {name:'bread',plural:'bread',value:3,useName:'eat',use:function(user){
            user.heal(6);
            removeItem(user.inventory,this,1);
        }}
    },
    copper_dagger: function() {
        return weapon('copper_dagger','s',1,3,20)
    },
    copper_sword: function() {
        return weapon('copper_sword','s',2,5,75)
    },
    copper_axe: function() {
        return weapon('copper_axe','s',3,2,85)
    },
    copper_mace: function() {
        return weapon('copper_mace','s',4,0,90)
    },
    iron_dagger: function() {
        return weapon('iron_dagger','s',2,6,225)
    },
    iron_sword: function() {
        return weapon('iron_sword','s',4,9,340)
    },
    iron_axe: function() {
        return weapon('iron_axe','s',6,5,370)
    },
    iron_mace: function() {
        return weapon('iron_mace','s',9,2,390)
    },
    bloodthirsty_longsword() {
        return weapon('bloodthirsty_longsword','s',5,10,850,{onHit:function(user,damage){
            user.takeDamage(-1 * Math.ceil(damage/7))
        }});
    },
    copper_breastplate: function() {
        return armor('copper_breastplate','s',110,'chest',4);
    },
    copper_greaves: function() {
        return armor('copper_greaves','',95,'legs',3);
    },
    copper_helmet: function() {
        return armor('copper_helmet','s',55,'head',2);
    },
    copper_gauntlets: function() {
        return armor('copper_gauntlets','',32,'hands',1);
    },
    iron_breastplate: function() {
        return armor('iron_breastplate','s',540,'chest',9);
    },
    iron_greaves: function() {
        return armor('iron_greaves','',380,'legs',6);
    },
    iron_helmet: function() {
        return armor('iron_helmet','s',280,'head',4);
    },
    iron_gauntlets: function() {
        return armor('iron_gauntlets','',150,'hands',2);
    }
}

function weapon(name,plural,damage,toHit,value,func) {
    return {name:name,plural:name + plural,value:value,useName:'equip',
    use:function(user){
        user.equip(this);
    },
    slot: 'weapon',effects:{
        damage: damage, toHit: toHit
    },func:func}
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