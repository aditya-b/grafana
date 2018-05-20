package plugins

import (
	"encoding/json"
)

var PluginTypePanel string = "panel"

type PanelPlugin struct {
	FrontendPluginBase
}

func init() {
	RegisterPluginType(&PluginTypeDescriptor{
		Id:          PluginTypePanel,
		PluginModel: PanelPlugin{},
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
