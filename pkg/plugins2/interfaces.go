package plugins2

import "encoding/json"

type MetaLoader interface {
	Load(decoder *json.Decoder, pluginDir string) error
}
