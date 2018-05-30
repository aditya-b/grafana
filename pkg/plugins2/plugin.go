package plugins2

import (
	m "github.com/grafana/grafana/pkg/models"
)

type PluginBase struct {
	Type         string             `json:"type"`
	Name         string             `json:"name"`
	Id           string             `json:"id"`
	Info         PluginInfo         `json:"info"`
	Dependencies PluginDependencies `json:"dependencies,omitempty"`
	Routes       []*AppPluginRoute  `json:"routes,omitempty"`
	Executable   string             `json:"executable,omitempty"`
	State        string             `json:"state,omitempty"`

	IncludedInAppId string `json:"-"`
	PluginDir       string `json:"-"`
	DefaultNavUrl   string `json:"-"`
	IsCorePlugin    bool   `json:"-"`

	GrafanaNetVersion   string `json:"-"`
	GrafanaNetHasUpdate bool   `json:"-"`
}

type PluginDependencies struct {
	GrafanaVersion string                 `json:"grafanaVersion"`
	Plugins        []PluginDependencyItem `json:"plugins"`
}

type PluginInclude struct {
	Name       string     `json:"name"`
	Path       string     `json:"path"`
	Type       string     `json:"type"`
	Component  string     `json:"component"`
	Role       m.RoleType `json:"role"`
	AddToNav   bool       `json:"addToNav"`
	DefaultNav bool       `json:"defaultNav"`
	Slug       string     `json:"slug"`

	Id string `json:"-"`
}

type PluginDependencyItem struct {
	Type    string `json:"type"`
	Id      string `json:"id"`
	Name    string `json:"name"`
	Version string `json:"version"`
}

type PluginInfo struct {
	Author      PluginInfoLink      `json:"author"`
	Description string              `json:"description"`
	Links       []PluginInfoLink    `json:"links"`
	Logos       PluginLogos         `json:"logos"`
	Screenshots []PluginScreenshots `json:"screenshots"`
	Version     string              `json:"version"`
	Updated     string              `json:"updated"`
}

type PluginInfoLink struct {
	Name string `json:"name"`
	Url  string `json:"url"`
}

type PluginLogos struct {
	Small string `json:"small"`
	Large string `json:"large"`
}

type PluginScreenshots struct {
	Path string `json:"path"`
	Name string `json:"name"`
}

type PluginStaticRoute struct {
	Directory string
	PluginId  string
}

type AppPluginRoute struct {
	Path      string                 `json:"path"`
	Method    string                 `json:"method"`
	ReqRole   m.RoleType             `json:"reqRole"`
	Url       string                 `json:"url"`
	Headers   []AppPluginRouteHeader `json:"headers"`
	TokenAuth *JwtTokenAuth          `json:"tokenAuth"`
}

type AppPluginRouteHeader struct {
	Name    string `json:"name"`
	Content string `json:"content"`
}

type JwtTokenAuth struct {
	Url    string            `json:"url"`
	Params map[string]string `json:"params"`
}

// type EnabledPlugins struct {
// 	Panels      []*PanelPlugin
// 	DataSources map[string]*DataSourcePlugin
// 	Apps        []*AppPlugin
// }
//
// func NewEnabledPlugins() EnabledPlugins {
// 	return EnabledPlugins{
// 		Panels:      make([]*PanelPlugin, 0),
// 		DataSources: make(map[string]*DataSourcePlugin),
// 		Apps:        make([]*AppPlugin, 0),
// 	}
// }
