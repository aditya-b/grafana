package plugins2

import (
	"fmt"
)

type PluginNotFoundError struct {
	PluginId string
}

func (e PluginNotFoundError) Error() string {
	return fmt.Sprintf("Plugin with id %s not found", e.PluginId)
}

type Plugin interface {
	Init() error
}
