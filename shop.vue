Vue.component('shop', {
  props: {
    app: Object,
    newItems: Array,
  },
  data: function () {
    return {
        buyMultiplier: 1.5,
        inventory: {},
        items: items,
    }
  },
  methods: {
        buy: function(item) {
          let amount = parseInt(items[item]().value * this.buyMultiplier);
          if (canAfford(this.app.player.inventory,'copper_coin',amount)) {
            app.removeItem('player',items['copper_coin'](),amount);
            app.addItem('player',items[item](),1);
          }
        },
        addItem: addItem,
        removeItem: removeItem,
        canAfford: canAfford,
        prettyPrint: prettyPrint,
  },
  mounted: function() {
    app.$on('invChange', function() {
      // AKA only update the shop if it's open
      if (this.$children[0])
        this.$children[0].$forceUpdate();
    });
    for (let i of this.newItems)
      this.$set(this.inventory, i, 1)
  },
  template: `<div>
    <table>
        <tr v-for="item in Object.keys(inventory)">
            <td>{{prettyPrint(items[item]().name)}}</td>
            <td>{{parseInt(items[item]().value * buyMultiplier)}}</td>
            <td><span @click="buy(item)" class="buy-button clickable">Buy</span></td>
            <td class='itemStats'>{{(items[item]().slot != 'weapon' ? 'AC +' + items[item]().effects.ac :
             'Hit Chance + ' + items[item]().effects.toHit + ', Damage +' + items[item]().effects.damage)}}</td>
        </tr>
    </table>
    <ul>
        <li v-for="item in Object.keys(app.player.inventory)">
            {{prettyPrint((app.player.inventory[item] > 1 ? items[item]().plural : items[item]().name)) + 
            ': ' + app.player.inventory[item]}}
        </li>
    </ul>
  </div>`
})