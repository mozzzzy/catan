/* eslint-disable no-console */
import Vue from 'vue';

const R = 60;
const OFFSET_X = 160;
const OFFSET_Y = 160;
const WIDTH = 800;
const HEIGHT = 800;
const ResourceMap = {
  NONE: 'lightgray',
  FOREST: 'green',
  PASTURE: 'lightgreen',
  FIELD: 'yellow',
  HILL: 'brown',
  MOUNTAIN: 'gray',
};
const SIN = R * Math.sin(Math.PI / 3.0);
const COS = R * Math.cos(Math.PI / 3.0);

// eslint-disable-next-line no-new
new Vue({
  el: '#map',
  data: {
    conn: null,
    client_id: '',
    width: WIDTH,
    height: HEIGHT,
    cells: [
      { x: 2, y: 4, resource: 'NONE' },
    ],
    vertices: [
      {
        x: 5, y: 4, player: 'RED', building: 'settlement',
      },
      {
        x: 6, y: 2, player: 'RED', building: 'city',
      },
      {
        x: 9, y: 4, player: 'BLUE', building: 'settlement',
      },
      {
        x: 9, y: 6, player: 'BLUE', building: 'city',
      },
      {
        x: 2, y: 6, trade_rate: 2, port: 'FOREST',
      },
      {
        x: 6, y: 0, trade_rate: 2, port: 'FOREST',
      },
      {
        x: 8, y: 9, trade_rate: 3, port: 'ALL',
      },
    ],
    lines: [
      {
        x1: 6, y1: 4, x2: 7, y2: 5, player: 'RED',
      },
      {
        x1: 5, y1: 4, x2: 6, y2: 4, player: 'RED',
      },
      {
        x1: 6, y1: 2, x2: 7, y2: 3, player: 'RED',
      },
      {
        x1: 7, y1: 3, x2: 6, y2: 4, player: 'RED',
      },
      {
        x1: 9, y1: 4, x2: 8, y2: 5, player: 'BLUE',
      },
      {
        x1: 8, y1: 5, x2: 9, y2: 6, player: 'BLUE',
      },
    ],
  },
  computed: { // like read only properties
    view_box() {
      return `0, 0, ${this.width}, ${this.height}`;
    },
    x_axis() {
      const res = [];
      for (let i = 0, y = OFFSET_Y - SIN; y <= HEIGHT; i += 1, y += SIN) {
        res.push({
          x: 0, y, width: this.width, height: 1, message: i,
        });
        if (i === 0) res[i].message = `y = ${res[i].message}`;
      }
      return res;
    },
    y_axis() {
      const res = [];
      for (let i = 0, x = OFFSET_X - R; x <= WIDTH; i += 1, x += i % 2 ? COS : R) {
        res.push({
          x, y: 0, width: 1, height: this.height, message: i,
        });
        if (i === 0) res[i].message = `x = ${res[i].message}`;
      }
      return res;
    },
    all_cells() {
      const res = this.cells.map((c) => {
        const cell = c;
        cell.svg_x = c.x * (R + COS) + OFFSET_X;
        cell.svg_y = c.y * SIN + OFFSET_Y;
        cell.vertices = [
          {
            x: 2 * c.x + 3, y: c.y + 1, svg_x: (c.svg_x + R), svg_y: (c.svg_y + 0),
          },
          {
            x: 2 * c.x + 2, y: c.y + 2, svg_x: (c.svg_x + COS), svg_y: (c.svg_y + SIN),
          },
          {
            x: 2 * c.x + 1, y: c.y + 2, svg_x: (c.svg_x - COS), svg_y: (c.svg_y + SIN),
          },
          {
            x: 2 * c.x + 0, y: c.y + 1, svg_x: (c.svg_x - R), svg_y: (c.svg_y + 0),
          },
          {
            x: 2 * c.x + 1, y: c.y + 0, svg_x: (c.svg_x - COS), svg_y: (c.svg_y - SIN),
          },
          {
            x: 2 * c.x + 2, y: c.y + 0, svg_x: (c.svg_x + COS), svg_y: (c.svg_y - SIN),
          },
        ];
        cell.points = c.vertices.map((v) => `${v.svg_x},${v.svg_y}`).join(' ');
        cell.color = ResourceMap[c.resource];
        return cell;
      });
      return res;
    },
    all_lines() {
      const res = [];
      const s = new Set();
      this.lines.forEach((tl) => {
        this.all_cells.forEach((c) => {
          let v1;
          let v2;
          c.vertices.forEach((v) => {
            if (v.x === tl.x1 && v.y === tl.y1) v1 = v;
            if (v.x === tl.x2 && v.y === tl.y2) v2 = v;
          });
          if (v1 && v2) {
            const pos = `${v1.x},${v1.y},${v2.x},${v2.y}`;
            if (!s.has(pos)) {
              res.push({
                player: tl.player,
                svg_x1: v1.svg_x,
                svg_y1: v1.svg_y,
                svg_x2: v2.svg_x,
                svg_y2: v2.svg_y,
              });
            }
            s.add(pos);
          }
        });
      });
      return res;
    },
    all_vertices() {
      const res = [];
      const s = new Set();
      this.all_cells.forEach((c) => {
        c.vertices.forEach((v) => {
          const vertex = v;
          this.vertices.forEach((tv) => {
            // add message for port
            if (vertex.x === tv.x && vertex.y === tv.y && tv.trade_rate && tv.port) {
              vertex.message = ` ${tv.trade_rate}:1 ${tv.port}`;
            }
            // add message for building
            if (vertex.x === tv.x && vertex.y === tv.y && tv.player && tv.building) {
              vertex.player = tv.player;
              vertex.buulding = tv.building;
              vertex.radius = (tv.building === 'city' ? 15 : 10);
            }
          });
          // prevent duplication
          const pos = `${v.x},${v.y}`;
          if (!s.has(pos)) res.push(v);
          s.add(pos);
        });
      });
      return res;
    },
  },
  created() {
    this.conn = new WebSocket('ws://localhost:8000/ws');
    this.conn.onopen = this.onopen;
    this.conn.onmessage = this.onmessage;
    this.conn.onerror = this.onerror;
    this.conn.onclose = this.onclose;
  },
  methods: {
    join() {
      const msg = JSON.stringify({ client_id: this.client_id, type: 'Join' });
      console.log('send message:', msg);
      this.conn.send(msg);
    },
    reload() {
      const msg = JSON.stringify({ client_id: this.client_id, type: 'Reload' });
      console.log('send message:', msg);
      this.conn.send(msg);
    },
    onopen(e) { console.log(e); },
    onerror(e) { console.log(e); },
    onclose(e) { console.log(e); },
    onmessage(e) {
      console.log('receive message:', e.data);
      const d = JSON.parse(e.data);
      switch (d.type) {
        case 'Join':
          console.log(d.message);
          break;
        case 'Reload': {
          const { cells } = d.game;
          this.cells = [];
          this.cells = cells.map((c) => ({ x: c.x, y: c.y, resource: c.resource }));
          break;
        }
        default:
          break;
      }
    },
  },
});
