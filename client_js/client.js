const R = 60;
const OFFSET_X = 160;
const OFFSET_Y = 160;
const WIDTH = 800;
const HEIGHT = 800;
const ResourceMap = {
  "NONE":     "lightgray",
  "FOREST":   "green",
  "PASTURE":  "lightgreen",
  "FIELD":    "yellow",
  "HILL":     "brown",
  "MOUNTAIN": "gray",
};
const SIN = R * Math.sin(Math.PI / 3.0);
const COS = R * Math.cos(Math.PI / 3.0);

let map = new Vue({
  el: '#map',
  data: {
    conn: null,
    width: WIDTH,
    height: HEIGHT,
    cells: [
      {x: 2, y: 4, resource: "NONE"},
    ],
    vertices:  [
      {x: 2, y: 2, trade_rate: 2, port: "FOREST"},
      {x: 6, y: 0, trade_rate: 2, port: "FOREST"},
      {x: 8, y: 9, trade_rate: 3, port: "ALL"},
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
        c.color = ResourceMap[c.resource];
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
              v.message = " " + this.vertices[k].trade_rate + ":1 " + this.vertices[k].port;
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
  created: function() {
    this.conn = new WebSocket('ws://localhost:8000/echo');
    this.conn.onopen = this.onopen;
    this.conn.onmessage = this.onmessage;
    this.conn.onerror = this.onerror;
    this.conn.onclose = this.onclose;
  },
  methods: {
    reload: function() {
      msg = JSON.stringify({'client_id': 'hoge', 'message': 'join'});
      console.log("send message:", msg);
      this.conn.send(msg);
    },
    onopen: function(e) {},
    onerror: function(e) {},
    onclose: function(e) {},
    onmessage: function(e) {
      console.log("receive message:", e.data);
      d = JSON.parse(e.data);
      this.cells = [];
      for (let i = 0; i < d.cells.length; i++) {
        this.cells.push({
          x: d.cells[i].x,
          y: d.cells[i].y,
          resource: d.cells[i].resource,
        });
      }
    },
  }
})

