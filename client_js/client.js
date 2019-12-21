const R = 60;
const OFFSET_X = 160;
const OFFSET_Y = 160;
const WIDTH = 800;
const HEIGHT = 800;
const Resource = {
  Iron: "gray",
  Soil: "brown",
  Tree: "green",
  All: "gold",
};
const SIN = R * Math.sin(Math.PI / 3.0);
const COS = R * Math.cos(Math.PI / 3.0);

let map = new Vue({
  el: '#map',
  data: {
    width: WIDTH,
    height: HEIGHT,
    cells: [
      {x: 0, y: 0, resource: Resource.Tree},
      {x: 2, y: 0, resource: Resource.Tree},
      {x: 4, y: 0, resource: Resource.Iron},
      {x: 1, y: 1, resource: Resource.Soil},
      {x: 3, y: 1, resource: Resource.Iron},
      {x: 5, y: 1, resource: Resource.Tree},
      {x: 0, y: 2, resource: Resource.Iron},
      {x: 2, y: 2, resource: Resource.Iron},
      {x: 4, y: 2, resource: Resource.Tree},
      {x: 1, y: 3, resource: Resource.Soil},
      {x: 3, y: 3, resource: Resource.Soil},
      {x: 5, y: 3, resource: Resource.Iron},
      {x: 0, y: 4, resource: Resource.Tree},
      {x: 2, y: 4, resource: Resource.Tree},
      {x: 4, y: 4, resource: Resource.Iron},
      {x: 1, y: 5, resource: Resource.Soil},
      {x: 3, y: 5, resource: Resource.Iron},
      {x: 5, y: 5, resource: Resource.Tree},
      {x: 0, y: 6, resource: Resource.Iron},
      {x: 2, y: 6, resource: Resource.Iron},
      {x: 4, y: 6, resource: Resource.Tree},
      {x: 1, y: 7, resource: Resource.Soil},
      {x: 3, y: 7, resource: Resource.Soil},
      {x: 5, y: 7, resource: Resource.Iron},
    ],
    vertices:  [
      {x: 1, y: 0, trade_rate: 2, port: Resource.Tree},
      {x: 2, y: 0, trade_rate: 3, port: Resource.All},
      {x: 2, y: 8, trade_rate: 2, port: Resource.Soil},
    ],
  },
  computed: { // like read only properties
    view_box: function() {
      return "0, 0, " + this.width + ", " + this.height;
    },
    x_axis: function () {
      let res = [];
      for (let i = 0, y = OFFSET_Y - SIN; y <= HEIGHT; i++, y+= SIN) {
        res.push({x: 0, y: y, width: this.width, height: 1, message: i});
        if (i == 0) {
          res[i].message = "y =" + res[i].message;
        }
      }
      return res;
    },
    y_axis: function () {
      let res = [];
      for (let i = 0, x = OFFSET_X - R; x <= WIDTH; i++, x += i%2 ? COS : R) {
        res.push({x: x, y: 0, width: 1, height: this.height, message: i});
        if (i == 0) {
          res[i].message = "x =" + res[i].message;
        }
      }
      return res;
    },
    all_cells: function () {
      let res = []
      for (let i = 0; i < this.cells.length; i++) {
        let c = this.cells[i];
        c.svg_x = c.x * (R + COS) + OFFSET_X;
        c.svg_y = c.y * SIN + OFFSET_Y;
        c.vertices = [];
        {
          c.vertices.push({x: 2*c.x + 3, y: c.y + 1, svg_x: (c.svg_x + R),   svg_y: (c.svg_y + 0  )});
          c.vertices.push({x: 2*c.x + 2, y: c.y + 2, svg_x: (c.svg_x + COS), svg_y: (c.svg_y + SIN)});
          c.vertices.push({x: 2*c.x + 1, y: c.y + 2, svg_x: (c.svg_x - COS), svg_y: (c.svg_y + SIN)});
          c.vertices.push({x: 2*c.x + 0, y: c.y + 1, svg_x: (c.svg_x - R),   svg_y: (c.svg_y + 0  )});
          c.vertices.push({x: 2*c.x + 1, y: c.y + 0, svg_x: (c.svg_x - COS), svg_y: (c.svg_y - SIN)});
          c.vertices.push({x: 2*c.x + 2, y: c.y + 0, svg_x: (c.svg_x + COS), svg_y: (c.svg_y - SIN)});
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
          let v = vertices[j];

          // add message for port
          for (let k = 0; k < this.vertices.length; k++) {
            if (v.x == this.vertices[k].x && v.y == this.vertices[k].y) {
              switch (this.vertices[k].port) {
                case Resource.Soil: v.message = " " + this.vertices[k].trade_rate + ":1 Soil"; break;
                case Resource.Tree: v.message = " " + this.vertices[k].trade_rate + ":1 Tree"; break;
                case Resource.All: v.message  = " " + this.vertices[k].trade_rate + ":1 All"; break;
              }
            }
          }

          // prevent duplication
          let pos = v.x + "," + v.y;
          if (!s.has(pos))
            res.push(v);
          s.add(pos);
        }
      }
      return res;
    },
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
