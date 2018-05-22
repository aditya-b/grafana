package plugins2

import (
	"encoding/json"
	"fmt"
)

type MetaLoader interface {
	Load(decoder *json.Decoder, pluginDir string) error
}

type PluginNotFoundError struct {
	PluginId string
}

func (e PluginNotFoundError) Error() string {
	return fmt.Sprintf("Plugin with id %s not found", e.PluginId)
}
