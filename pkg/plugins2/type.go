package plugins2

import plugin "github.com/hashicorp/go-plugin"

var PluginTypes map[string]*PluginTypeDescriptor = map[string]*PluginTypeDescriptor{}

type PluginTypeDescriptor struct {
	Id               string
	Backend          bool
	ProtocolVersion  int
	ServiceInterface plugin.Plugin
	Type             interface{}
}

func RegisterPluginType(typeDescriptor *PluginTypeDescriptor) {
	PluginTypes[typeDescriptor.Id] = typeDescriptor
}
