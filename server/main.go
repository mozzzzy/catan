package main

import (
	"golang.org/x/net/websocket"
	"log"
	"net/http"
)

// GameInstance is main game instance
var GameInstance Game

// RecvChan keeps all messages sent by clients.
var RecvChan chan Msg

// Clients is the connection information for all clients.
var Clients map[string]*websocket.Conn

// Type is for message type
type Type string

//JoinType is used when joining the game.
const JoinType = "Join"

// ReloadType is For Debugging purpose
const ReloadType = "Reload"

// Msg is the type for all messages.
type Msg struct {
	ClientID string `json:"client_id"`
	Type     Type   `json:"type"`
	Message  string `json:"message"`
	Game     Game   `json:"game"`
}

func wsHandler(ws *websocket.Conn) {
	r := Msg{}
	for {
		if err := websocket.JSON.Receive(ws, &r); err != nil {
			ws.Close()
			log.Printf("%v close\n", r.ClientID)
			if _, ok := Clients[r.ClientID]; ok {
				delete(Clients, r.ClientID)
			}
			return
		}
		if oldWs, ok := Clients[r.ClientID]; ok && oldWs != ws { // For reconnection
			log.Printf("%v reconncted\n", r.ClientID)
			oldWs.Close()
			Clients[r.ClientID] = ws
		}
		if _, ok := Clients[r.ClientID]; !ok { // For first connection
			log.Printf("%v connected\n", r.ClientID)
			Clients[r.ClientID] = ws
		}
		RecvChan <- r
	}
}

func sendMsg(s Msg) {
	ws, ok := Clients[s.ClientID]
	if !ok {
		log.Printf("client %v not found", s.ClientID)
		return
	}

	log.Printf("message send: %v\n", s)
	if err := websocket.JSON.Send(ws, s); err != nil {
		log.Printf("%v\n", err)
		log.Printf("%v close\n", s.ClientID)
		ws.Close()
		if _, ok := Clients[s.ClientID]; ok {
			delete(Clients, s.ClientID)
		}
	}
}

func broadcastMsg(s Msg) {
	for clientID := range Clients {
		s.ClientID = clientID
		sendMsg(s)
	}
}

// MsgMain is the entry point executed when receiving any message.
func MsgMain() {
	for r := range RecvChan {
		switch r.Type {
		case JoinType:
			log.Printf("join message recieved: %v\n", r.ClientID)
			s := Msg{
				Type:    JoinType,
				Message: r.ClientID + " joined",
			}
			broadcastMsg(s)
		case ReloadType:
			log.Printf("reload message recieved: %v\n", r.ClientID)
			GameInstance = NewGame()
			s := Msg{
				ClientID: r.ClientID,
				Type:     ReloadType,
				Game:     GameInstance,
			}
			sendMsg(s)
		}
	}
}

func main() {
	RecvChan = make(chan Msg)
	Clients = make(map[string]*websocket.Conn)
	GameInstance = NewGame()
	go MsgMain()
	http.Handle("/ws", websocket.Handler(wsHandler))
	err := http.ListenAndServe(":8000", nil)
	if err != nil {
		panic("ListenAndServe: " + err.Error())
	}
}
