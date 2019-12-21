package main

import (
	"fmt"
	"golang.org/x/net/websocket"
	"net/http"
)

var GameInstance Game

type Message struct {
	ClientID string `json:"client_id"`
	Message  string `json:"message"`
}

func recieveMessage(ws *websocket.Conn) {
	msg := Message{}
	for {
		if err := websocket.JSON.Receive(ws, &msg); err != nil {
			fmt.Printf("%v\n", err)
			break
		}
		fmt.Printf("message recieved: %v\n", msg)

		GameInstance = NewGame()
		if err := websocket.JSON.Send(ws, GameInstance); err != nil {
			fmt.Printf("%v\n", err)
			break
		}
		fmt.Printf("message send: %v\n", GameInstance)
	}
}

func main() {
	GameInstance = NewGame()
	http.Handle("/echo", websocket.Handler(recieveMessage))
	err := http.ListenAndServe(":8000", nil)
	if err != nil {
		panic("ListenAndServe: " + err.Error())
	}
}
