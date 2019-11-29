package api

import (
	"strconv"

	"github.com/grafana/grafana/pkg/api/dtos"
	"github.com/grafana/grafana/pkg/infra/metrics"
	m "github.com/grafana/grafana/pkg/models"
)

// POST /api/frontend_metrics
func CollectFrontendMetrics(c *m.ReqContext, data dtos.FrontendPerformanceMetricsCommand) Response {

	for _, metric := range data.Metrics {
		meta := metric.Meta

		switch metricName := metric.Name; metricName {
		case "tti":
			page := metric.Meta.Get("page").MustString()
			metrics.MFrontendTTISummary.WithLabelValues(page).Observe(float64(metric.Value))
		case "navigationTime":
			from := meta.Get("from").MustString()
			to := meta.Get("to").MustString()
			abandoned := meta.Get("abandoned").MustBool(false)
			metrics.MFrontendNavigationSummary.WithLabelValues(from, to, strconv.FormatBool(abandoned)).Observe(float64(metric.Value))
		}
	}

	return Success("Frontend metrics collected")
}
