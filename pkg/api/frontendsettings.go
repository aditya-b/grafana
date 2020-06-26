package api

import (
	"github.com/grafana/grafana/pkg/api/frontend"
	"github.com/grafana/grafana/pkg/models"
)

func (hs *HTTPServer) GetFrontendSettings(c *models.ReqContext) {
	settings, err := frontend.GetSettingsMap(hs.Cfg, hs.License, hs.RenderService, c)
	if err != nil {
		c.JsonApiErr(400, "Failed to get frontend settings", err)
		return
	}

	c.JSON(200, settings)
}
