package plugins2

type FrontendPlugin struct {
	PluginBase

	Module  string `json:"module,omitempty"`
	BaseUrl string `json:"baseUrl,omitempty"`
}
