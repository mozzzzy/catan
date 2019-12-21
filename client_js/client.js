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
    svg_pos: function(cell_pos) {
      s = R * Math.sin(Math.PI / 3.0);
      c = R * Math.cos(Math.PI / 3.0);

      x = cell_pos.x * (R + c) + OFFSET_X;
      y = cell_pos.y * s + OFFSET_Y;
      return {x: x, y: y}
    },
    svg_vertices: function(cell_pos) {
      res = [];
      p = this.svg_pos(cell_pos);
      x = p.x, y = p.y;
      res.push({x: cell_pos.x + 3, y: cell_pos.y + 1, svg_x: (x + R), svg_y: (y + 0)});
      res.push({x: cell_pos.x + 2, y: cell_pos.y + 2, svg_x: (x + c), svg_y: (y + s)});
      res.push({x: cell_pos.x + 1, y: cell_pos.y + 2, svg_x: (x - c), svg_y: (y + s)});
      res.push({x: cell_pos.x + 0, y: cell_pos.y + 1, svg_x: (x - R), svg_y: (y + 0)});
      res.push({x: cell_pos.x + 1, y: cell_pos.y + 0, svg_x: (x - c), svg_y: (y - s)});
      res.push({x: cell_pos.x + 2, y: cell_pos.y + 0, svg_x: (x + c), svg_y: (y - s)});
      return res;
    },
    svg_vertices_str: function(cell_pos) {
      return this.svg_vertices(cell_pos).map(v => v.svg_x + "," + v.svg_y).join(" ");
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
