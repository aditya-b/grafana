package panel

import (
	"encoding/json"

	"github.com/grafana/grafana/pkg/plugins"
)

type PanelPluginMeta struct {
	FrontendPluginBase
}

func init() {
	RegisterPluginType(&plugins.PluginTypeDescriptor{
		Id:         "panel",
		PluginMeta: PanelPluginMeta{},
	})
}

func (p *PanelPlugin) Load(decoder *json.Decoder, pluginDir string) error {
	if err := decoder.Decode(&p); err != nil {
		return err
	}

	if err := p.registerPlugin(pluginDir); err != nil {
		return err
	}

	Panels[p.Id] = p
	return nil
}
