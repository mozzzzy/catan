package main

import (
	"fmt"
	"golang.org/x/net/websocket"
	"net/http"
)

var GameInstance Game

type Type string

const JoinType = "Join"
const ReloadType = "Reload" // For Debugging purpose

type BaseMsg struct {
	ClientID string `json:"client_id"`
	Type     Type   `json:"type"`
	Message  string `json:"message"`
}

// Received Messages from Client
type RecvMsg struct {
	BaseMsg
}

// Send Messages to Client
type SendJoinMsg struct {
	BaseMsg
}

type SendReloadMsg struct {
	BaseMsg
	Game Game `json:"game"`
}

func recieveMessage(ws *websocket.Conn) {
	recvMsg := RecvMsg{}
	for {
		if err := websocket.JSON.Receive(ws, &recvMsg); err != nil {
			fmt.Printf("%v\n", err)
			break
		}
		fmt.Printf("message recieved: %v\n", recvMsg)

		switch recvMsg.Type {
		case JoinType:
			joinMsg := SendJoinMsg{
				BaseMsg: BaseMsg{
					ClientID: recvMsg.ClientID,
					Type:     JoinType,
				},
			}
			if err := websocket.JSON.Send(ws, joinMsg); err != nil {
				fmt.Printf("%v\n", err)
				break
			}
		case ReloadType:
			GameInstance = NewGame()
			sendMsg := SendReloadMsg{
				BaseMsg: BaseMsg{
					ClientID: recvMsg.ClientID,
					Type:     ReloadType,
				},
				Game: GameInstance,
			}
			if err := websocket.JSON.Send(ws, sendMsg); err != nil {
				fmt.Printf("%v\n", err)
				break
			}
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
