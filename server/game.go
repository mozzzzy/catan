package main

import (
	"math/rand"
)

// NONE produces NONE
const NONE = "NONE"

// FOREST produces Lumber 木
const FOREST = "FOREST"

// PASTURE produces Wool 羊毛
const PASTURE = "PASTURE"

// FIELD produces Grain 小麦
const FIELD = "FIELD"

// HILL produces Brick レンガ、土
const HILL = "HILL"

// MOUNTAIN produces Ore 鉱石
const MOUNTAIN = "MOUNTAIN"

type resource string

// Cell is hex type
type Cell struct {
	X        int      `json:"x"`
	Y        int      `json:"y"`
	Point    int      `json:"point"`
	Resource resource `json:"resource"`
}

// Game has all states
type Game struct {
	Cells []Cell `json:"cells"`
}

func shuffle(data []resource) {
	n := len(data)
	for i := n - 1; i >= 0; i-- {
		j := rand.Intn(i + 1)
		data[i], data[j] = data[j], data[i]
	}
}

// NewGame return new game instance
func NewGame() Game {
	g := Game{}
	g.Cells = []Cell{
		// ring 0
		{X: 2, Y: 4},
		// ring 1
		{X: 2, Y: 2},
		{X: 3, Y: 3},
		{X: 3, Y: 5},
		{X: 2, Y: 6},
		{X: 1, Y: 5},
		{X: 1, Y: 3},
		// ring 2
		{X: 2, Y: 0},
		{X: 3, Y: 1},
		{X: 4, Y: 2},
		{X: 4, Y: 4},
		{X: 4, Y: 6},
		{X: 3, Y: 7},
		{X: 2, Y: 8},
		{X: 1, Y: 7},
		{X: 0, Y: 6},
		{X: 0, Y: 4},
		{X: 0, Y: 2},
		{X: 1, Y: 1},
	}

	resources := []resource{}
	for i := 0; i < 3; i++ {
		resources = append(resources, FOREST)
		resources = append(resources, PASTURE)
		resources = append(resources, FIELD)
		resources = append(resources, HILL)
		resources = append(resources, MOUNTAIN)
	}
	resources = append(resources, NONE)
	resources = append(resources, FOREST)
	resources = append(resources, PASTURE)
	resources = append(resources, FIELD)
	shuffle(resources)

	for i := 0; i < len(g.Cells); i++ {
		g.Cells[i].Resource = resources[i]
	}
	return g
}
