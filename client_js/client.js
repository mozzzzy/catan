const R = 100;
const OFFSET_X = 200;
const OFFSET_Y = 200;
const Resource = {
  Iron: "gray",
  Soil: "brown",
  Tree: "green"
};

var map = new Vue({
  el: '#map',
  data: {
    cells: [
      {resource: Resource.Tree, pos: {x: 0, y: 0}},
      {resource: Resource.Tree, pos: {x: 2, y: 0}},
      {resource: Resource.Iron, pos: {x: 4, y: 0}},
      {resource: Resource.Soil, pos: {x: 1, y: 1}},
      {resource: Resource.Iron, pos: {x: 3, y: 1}},
      {resource: Resource.Tree, pos: {x: 5, y: 1}},
      {resource: Resource.Iron, pos: {x: 0, y: 2}},
      {resource: Resource.Iron, pos: {x: 2, y: 2}},
      {resource: Resource.Tree, pos: {x: 4, y: 2}},
      {resource: Resource.Soil, pos: {x: 1, y: 3}},
      {resource: Resource.Soil, pos: {x: 3, y: 3}},
      {resource: Resource.Iron, pos: {x: 5, y: 3}},
      {resource: Resource.Tree, pos: {x: 0, y: 4}},
      {resource: Resource.Tree, pos: {x: 2, y: 4}},
      {resource: Resource.Iron, pos: {x: 4, y: 4}},
      {resource: Resource.Soil, pos: {x: 1, y: 5}},
      {resource: Resource.Iron, pos: {x: 3, y: 5}},
      {resource: Resource.Tree, pos: {x: 5, y: 5}},
      {resource: Resource.Iron, pos: {x: 0, y: 6}},
      {resource: Resource.Iron, pos: {x: 2, y: 6}},
      {resource: Resource.Tree, pos: {x: 4, y: 6}},
      {resource: Resource.Soil, pos: {x: 1, y: 7}},
      {resource: Resource.Soil, pos: {x: 3, y: 7}},
      {resource: Resource.Iron, pos: {x: 5, y: 7}},
    ]
  },
  methods: {
    svg_pos: function(pos) {
      s = R * Math.sin(Math.PI / 3.0);
      c = R * Math.cos(Math.PI / 3.0);

      x = pos.x * (R + c) + OFFSET_X;
      y = pos.y * s + OFFSET_Y;
      return {x: x, y: y}
    },
    svg_points: function(pos) {
      p = this.svg_pos(pos);
      x = p.x, y = p.y;
      res = (x + R) + "," + y + " ";
      res += (x + c) + "," + (y + s) + " ";
      res += (x - c) + "," + (y + s) + " ";
      res += (x - R) + "," + y + " ";
      res += (x - c) + "," + (y - s) + " ";
      res += (x + c) + "," + (y - s) + " ";
      return res
    },
  }
})

var conn = new WebSocket('ws://localhost:8000/echo');
conn.onopen = function(e) {
  for (var i = 0; i < 10; i++) {
    conn.send('hello ' + i);
  }
};
conn.onerror = function(err) { console.log("onerror: " + err); };
conn.onmessage = function(e) { console.log("onmessage: " + e.data); };
conn.onclose = function(e) { console.log("onclose: " + e.data); };
