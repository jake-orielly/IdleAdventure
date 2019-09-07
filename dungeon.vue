let playerToken = {x:1, y:3, img: 'images/player.png'};
let playerTurn = true;
let playerSteps = 2;
let enemies = [
  {x:3,y:3,img:'images/enemy.png'},
  {x:5,y:5,img:'images/enemy.png'}
];

Vue.component('dungeon', {
  props: {
    app: Object,
  },
  data: function () {
    return {
        rows: 10,
        cols: 10,
        floor: 'images/floor.png',
    }
  },
  methods: {
    // Vue reactivity is great for lots of things but it's not as fast as JS
    renderToken: function(token) {
      document.getElementById(token.y + ':' + token.x).innerHTML = this.getTile() + '<img src="' + token.img + '">';
    },
    eraseToken: function(token) {
      document.getElementById(token.y + ':' + token.x).innerHTML = this.getTile();
    },
    movePlayer: function(x,y) {
      let newX = playerToken.x + x;
      let newY = playerToken.y + y;
      if (playerTurn && newX > 0 && newX <= this.rows && newY > 0 && newY <= this.cols && !this.collision(newX,newY,playerToken)) {
        playerSteps--;
        if (playerSteps == 0) {
          playerTurn = false;
          this.enemyTurn();
        }
        this.eraseToken(playerToken);
        playerToken.x += x;
        playerToken.y += y;
        this.renderToken(playerToken);
        document.getElementById("player-steps").innerHTML = playerSteps;
      }
    },
    enemyTurn: function() {
      this.renderToken(enemies[0]);
      playerSteps = 2;
      playerTurn = true;
    },
    collision: function(x,y,token) {
      let curr;
      if (token != playerToken) {
        curr = playerToken;
        if (curr.x == x && curr.y == y)
          return true;
      }
      for (let i = 0; i < enemies.length; i++)
        if (enemies[i] != token) {
          curr = enemies[i];
          if (curr.x == x && curr.y == y)
            return true;
        }
      return false;
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
    this.renderToken(playerToken);
    for (let i = 0; i < enemies.length; i++)
      this.renderToken(enemies[i]);
    document.addEventListener("keydown", this.keyPress);
  },
  template: `<div>
    <table cellspacing=0>
        <tr v-for="c in cols">
            <td :id="c + ':' + r" v-for="r in rows">
            </td>
        </tr>
    </table>
    <div id="player-steps">2</div>
  </div>`
})