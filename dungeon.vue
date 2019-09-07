Vue.component('dungeon', {
  props: {
    app: Object,
  },
  data: function () {
    return {
        rows: 10,
        cols: 10,
        playerX: 1,
        playerY: 3,
        floor: 'images/floor.png',
        player: 'images/player.png'
    }
  },
  methods: {
    // Vue reactivity is great for lots of things but it's not as fast as JS
    renderPlayer: function() {
      document.getElementById(this.playerY + ':' + this.playerX).innerHTML = this.getTile() + '<img src="' + this.player + '">';
    },
    erasePlayer: function() {
      document.getElementById(this.playerY + ':' + this.playerX).innerHTML = this.getTile();
    },
    movePlayer: function(x,y) {
      let newX = this.playerX + x;
      let newY = this.playerY + y;
      if (newX > 0 && newX <= this.rows && newY > 0 && newY <= this.cols) {
        this.erasePlayer();
        this.playerX += x;
        this.playerY += y;
        this.renderPlayer();
      }
    },
    keyPress: function() {
      if (event.key == 'w')
        this.movePlayer(0,-1);
      else if (event.key == 's')
        this.movePlayer(0,1);
      else if (event.key == 'a')
        this.movePlayer(-1,0);
      else if (event.key == 'd')
        this.movePlayer(1,0);
    },
    getTile: function() {
      let floor = '<img src="' + this.floor + '"">';
      return floor;
    },
    prettyPrint: prettyPrint,
  },
  mounted: function() {
    this.app.$on('invChange', function() {
      // AKA only update the dungeon if it's open
      if (this.$children[0])
        this.$children[0].$forceUpdate();
    });
    for (var i = 1; i <= this.cols; i++)
      for (var j = 1; j <= this.rows; j++)
        document.getElementById(i + ':' + j).innerHTML = this.getTile();
    this.renderPlayer();
    document.addEventListener("keyup", this.keyPress);
  },
  template: `<div>
    <table cellspacing=0>
        <tr v-for="c in cols">
            <td :id="c + ':' + r" v-for="r in rows">
            </td>
        </tr>
    </table>
  </div>`
})