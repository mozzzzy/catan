const R = 100;
const OFFSET_X = 200;
const OFFSET_Y = 200;
const Resource = {
  Iron: "gray",
  Soil: "brown",
  Tree: "green"
};
const SIN = R * Math.sin(Math.PI / 3.0);
const COS = R * Math.cos(Math.PI / 3.0);

let map = new Vue({
  el: '#map',
  data: {
    cells: [
      {resource: Resource.Tree, x: 0, y: 0},
      {resource: Resource.Tree, x: 2, y: 0},
      {resource: Resource.Iron, x: 4, y: 0},
      {resource: Resource.Soil, x: 1, y: 1},
      {resource: Resource.Iron, x: 3, y: 1},
      {resource: Resource.Tree, x: 5, y: 1},
      {resource: Resource.Iron, x: 0, y: 2},
      {resource: Resource.Iron, x: 2, y: 2},
      {resource: Resource.Tree, x: 4, y: 2},
      {resource: Resource.Soil, x: 1, y: 3},
      {resource: Resource.Soil, x: 3, y: 3},
      {resource: Resource.Iron, x: 5, y: 3},
      {resource: Resource.Tree, x: 0, y: 4},
      {resource: Resource.Tree, x: 2, y: 4},
      {resource: Resource.Iron, x: 4, y: 4},
      {resource: Resource.Soil, x: 1, y: 5},
      {resource: Resource.Iron, x: 3, y: 5},
      {resource: Resource.Tree, x: 5, y: 5},
      {resource: Resource.Iron, x: 0, y: 6},
      {resource: Resource.Iron, x: 2, y: 6},
      {resource: Resource.Tree, x: 4, y: 6},
      {resource: Resource.Soil, x: 1, y: 7},
      {resource: Resource.Soil, x: 3, y: 7},
      {resource: Resource.Iron, x: 5, y: 7},
    ]
  },
  computed: { // like read only properties
    all_cells: function () {
      let res = []
      for (let i = 0; i < this.cells.length; i++) {
        let c = this.cells[i];
        c.svg_x = c.x * (R + COS) + OFFSET_X;
        c.svg_y = c.y * SIN + OFFSET_Y;
        c.vertices = [];
        {
          c.vertices.push({x: c.x + 3, y: c.y + 1, svg_x: (c.svg_x + R),   svg_y: (c.svg_y + 0  )});
          c.vertices.push({x: c.x + 2, y: c.y + 2, svg_x: (c.svg_x + COS), svg_y: (c.svg_y + SIN)});
          c.vertices.push({x: c.x + 1, y: c.y + 2, svg_x: (c.svg_x - COS), svg_y: (c.svg_y + SIN)});
          c.vertices.push({x: c.x + 0, y: c.y + 1, svg_x: (c.svg_x - R),   svg_y: (c.svg_y + 0  )});
          c.vertices.push({x: c.x + 1, y: c.y + 0, svg_x: (c.svg_x - COS), svg_y: (c.svg_y - SIN)});
          c.vertices.push({x: c.x + 2, y: c.y + 0, svg_x: (c.svg_x + COS), svg_y: (c.svg_y - SIN)});
        }
        c.points = c.vertices.map(v => v.svg_x + "," + v.svg_y).join(" ");
        res.push(c);
      }
      return res;
    },
    all_vertices: function() {
      let res = [];
      let s = new Set();
      for (let i = 0; i < this.all_cells.length; i++) {
        let vertices = this.all_cells[i].vertices;
        for (let j = 0; j < vertices.length; j++) {
          let pos = vertices[j].x + "," + vertices[j].y;
          if (!s.has(pos)) {
            res.push(vertices[j]);
          }
          s.add(pos);
        }
      }
      return res;
    }
  },
  methods: {
  }
})

let conn = new WebSocket('ws://localhost:8000/echo');
conn.onopen = function(e) {
  for (let i = 0; i < 10; i++) {
    conn.send('hello ' + i);
  }
};
conn.onerror = function(err) { console.log("onerror: " + err); };
conn.onmessage = function(e) { console.log("onmessage: " + e.data); };
conn.onclose = function(e) { console.log("onclose: " + e.data); };
