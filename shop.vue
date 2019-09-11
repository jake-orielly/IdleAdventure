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
        count: 0,
        flashInterval: undefined
    }
  },
  methods: {
        buy: function(item) {
          let amount = parseInt(items[item]().value * this.buyMultiplier * this.app.costMultiplier);
          if (canAfford(this.app.player.inventory,'copper_coin',amount)) {
            removeItem(this.app.player.inventory,items['copper_coin'](),amount);
            addItem(this.app.player.inventory,items[item](),1);
          }
          else {
            this.count = 0;
            if (this.flashInterval)
                clearInterval(this.flashInterval);
            this.flashInterval = setInterval(()=>{
                if (!document.getElementById(items[item]().name + '-price'))
                  clearInterval(this.flashInterval);
                eles if (this.count % 2 == 1)
                    document.getElementById(items[item]().name + '-price').style.color = 'black';
                else 
                    document.getElementById(items[item]().name + '-price').style.color = 'red';
                this.count++;
                if (this.count == 10)
                    clearInterval(this.flashInterval);
            },250);
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
            <td :id="items[item]().name + '-price'">{{parseInt(items[item]().value * buyMultiplier)}}</td>
            <td><span @click="buy(item)" class="buy-button clickable">Buy</span></td>
            <td class='itemStats'>{{(items[item]().slot != 'weapon' && items[item]().slot ? 'AC +' + items[item]().effects.ac : '')}}
            {{(items[item]().slot == 'weapon' ? 'Hit Chance + ' + items[item]().effects.toHit + ', Damage +' + items[item]().effects.damage : '')}}</td>
        </tr>
    </table>
    <ul>
        <li v-for="item in Object.keys(app.player.inventory).filter(item => app.player.inventory[item] > 0)">
            {{prettyPrint((app.player.inventory[item] > 1 ? items[item]().plural : items[item]().name)) + 
            ': ' + app.player.inventory[item]}}
        </li>
    </ul>
  </div>`
})