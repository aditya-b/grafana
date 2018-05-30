package plugins2

type PanelPlugin struct {
	FrontendPlugin

	HideFromList bool `json:"hideFromList,omitempty"`
}

func (pp *PanelPlugin) Init(pm *PluginManager) error {

}

func init() {
	RegisterPluginType(&PluginTypeDescriptor{
		Id:   "panel",
		Type: PanelPlugin{},
	})
}
