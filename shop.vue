Vue.component('shop', {
  props: {
    player: Object,
  },
  data: function () {
    return {
        buyMultiplier: 1.5,
        inventory: {bread:1},
        items: items,
    }
  },
  methods: {
        buy: function(item) {
          let amount = parseInt(items[item]().value * this.buyMultiplier);
          if (canAfford(this.player.inventory,'copper_coin',amount)) {
            app.removeItem('player',items['copper_coin'](),amount);
            app.addItem('player',items[item](),1);
          }
        },
        addItem: addItem,
        removeItem: removeItem,
        canAfford: canAfford,
        prettyPrint: prettyPrint,
  },
  template: `<div>
    <ul>
        <li v-for="item in Object.keys(inventory)">
            {{prettyPrint(items[item]().name) + ' ' + parseInt(items[item]().value * buyMultiplier)}}
            <span @click="buy(item)" class="buy-button clickable">Buy</span>
        </li>
    </ul>
    <ul>
        <li v-for="item in Object.keys(player.inventory)">
            {{prettyPrint((player.inventory[item] > 1 ? items[item]().plural : items[item]().name)) + 
            ': ' + player.inventory[item]}}
        </li>
    </ul>
  </div>`
})