Vue.component('shop', {
  data: function () {
    return {
        items: items,
        inventory: {bread:3},
    }
  },
  methods: {
        prettyPrint: prettyPrint,
  },
  template: `<div>
    <ul>
        <li v-for="item in Object.keys(inventory)">
            {{prettyPrint((inventory[item] > 1 ? items[item]().plural : items[item]().name)) + 
            ': ' + inventory[item]}}
        </li>
    </ul>
  </div>`
})