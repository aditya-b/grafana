package renderer

import (
	"encoding/json"

	grpcProxy "github.com/grafana/grafana-plugin-model/go/renderer"
	plugins "github.com/grafana/grafana/pkg/plugins/renderer"
)

type RendererPluginMeta struct {
	plugins.PluginBase
	Executable string `json:"executable,omitempty"`
}

func init() {
	RegisterPluginType(&plugins.PluginTypeDescriptor{
		Id:               "renderer",
		PluginModel:      RendererPluginMeta{},
		ProtocolVersion:  1,
		ServiceInterface: grpcProxy.RendererPluginImpl{},
	})
}

func (r *RendererPlugin) Load(decoder *json.Decoder, pluginDir string) error {
	if err := decoder.Decode(&r); err != nil {
		return err
	}

	if err := r.registerPlugin(pluginDir); err != nil {
		return err
	}

	Renderer = r
	return nil
}
