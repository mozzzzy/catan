var map = new Vue({
  el: '#map',
  data: {
    cells: [
      {color: "green", points: "850,75 958,137.5 958,262.5 850,325 742,262.6 742,137.5"},
      {color: "chocolate", points: "350,75 458,137.5 458,262.5 350,325 242,262.6 242,137.5"},
      {color: "gray", points: "350,575 458,637.5 458,762.5 350,825 242,762.6 242,637.5"},
      {color: "yellow", points: "850,575 958,637.5 958,762.5 850,825 742,762.6 742,637.5"},
    ]
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
