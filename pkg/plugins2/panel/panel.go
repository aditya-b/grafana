package panel

import (
	"encoding/json"

	"github.com/grafana/grafana/pkg/plugins2"
)

type PanelPlugin struct {
	plugins2.FrontendPluginMeta
}

func init() {
	RegisterPluginType(&plugins2.PluginTypeDescriptor{
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
