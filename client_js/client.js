const R = 60;
const OFFSET_X = 160;
const OFFSET_Y = 160;
const WIDTH = 800;
const HEIGHT = 800;
const ResourceMap = {
  "NONE": "lightgray",
  "FOREST": "green",
  "PASTURE": "lightgreen",
  "FIELD": "yellow",
  "HILL": "brown",
  "MOUNTAIN": "gray",
};
const SIN = R * Math.sin(Math.PI / 3.0);
const COS = R * Math.cos(Math.PI / 3.0);

let map = new Vue({
  el: '#map',
  data: {
    conn: null,
    client_id: "",
    width: WIDTH,
    height: HEIGHT,
    cells: [
      { x: 2, y: 4, resource: "NONE" },
    ],
    vertices: [
      { x: 2, y: 2, trade_rate: 2, port: "FOREST" },
      { x: 6, y: 0, trade_rate: 2, port: "FOREST" },
      { x: 8, y: 9, trade_rate: 3, port: "ALL" },
    ],
  },
  computed: { // like read only properties
    view_box: function() {
      return "0, 0, " + this.width + ", " + this.height;
    },
    x_axis: function() {
      let res = [];
      for (let i = 0, y = OFFSET_Y - SIN; y <= HEIGHT; i++ , y += SIN) {
        res.push({ x: 0, y: y, width: this.width, height: 1, message: i });
        if (i == 0)
          res[i].message = "y = " + res[i].message;
      }
      return res;
    },
    y_axis: function() {
      let res = [];
      for (let i = 0, x = OFFSET_X - R; x <= WIDTH; i++ , x += i % 2 ? COS : R) {
        res.push({ x: x, y: 0, width: 1, height: this.height, message: i });
        if (i == 0)
          res[i].message = "x = " + res[i].message;
      }
      return res;
    },
    all_cells: function() {
      let res = []
      for (let c of this.cells) {
        c.svg_x = c.x * (R + COS) + OFFSET_X;
        c.svg_y = c.y * SIN + OFFSET_Y;
        c.vertices = [
          { x: 2 * c.x + 3, y: c.y + 1, svg_x: (c.svg_x + R), svg_y: (c.svg_y + 0) },
          { x: 2 * c.x + 2, y: c.y + 2, svg_x: (c.svg_x + COS), svg_y: (c.svg_y + SIN) },
          { x: 2 * c.x + 1, y: c.y + 2, svg_x: (c.svg_x - COS), svg_y: (c.svg_y + SIN) },
          { x: 2 * c.x + 0, y: c.y + 1, svg_x: (c.svg_x - R), svg_y: (c.svg_y + 0) },
          { x: 2 * c.x + 1, y: c.y + 0, svg_x: (c.svg_x - COS), svg_y: (c.svg_y - SIN) },
          { x: 2 * c.x + 2, y: c.y + 0, svg_x: (c.svg_x + COS), svg_y: (c.svg_y - SIN) },
        ];
        c.points = c.vertices.map(v => v.svg_x + "," + v.svg_y).join(" ");
        c.color = ResourceMap[c.resource];
        res.push(c);
      }
      return res;
    },
    all_vertices: function() {
      let res = [];
      let s = new Set();
      for (let c of this.all_cells) {
        for (let v of c.vertices) {
          // add message for port
          for (let tv of this.vertices)
            if (v.x == tv.x && v.y == tv.y)
              v.message = " " + tv.trade_rate + ":1 " + tv.port;
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
    this.conn = new WebSocket('ws://localhost:8000/ws');
    this.conn.onopen = this.onopen;
    this.conn.onmessage = this.onmessage;
    this.conn.onerror = this.onerror;
    this.conn.onclose = this.onclose;
  },
  methods: {
    join: function() {
      msg = JSON.stringify({ 'client_id': this.client_id, 'type': 'Join' });
      console.log("send message:", msg);
      this.conn.send(msg);
    },
    reload: function() {
      msg = JSON.stringify({ 'client_id': this.client_id, 'type': 'Reload' });
      console.log("send message:", msg);
      this.conn.send(msg);
    },
    onopen: function(e) { console.log(e); },
    onerror: function(e) { console.log(e); },
    onclose: function(e) { console.log(e); },
    onmessage: function(e) {
      console.log("receive message:", e.data);
      d = JSON.parse(e.data);
      switch (d.type) {
        case 'Join':
          console.log(d.message)
          break;
        case 'Reload':
          let cells = d.game.cells;
          this.cells = [];
          for (let c of cells)
            this.cells.push({ x: c.x, y: c.y, resource: c.resource });
          break;
      }
    },
  }
})

