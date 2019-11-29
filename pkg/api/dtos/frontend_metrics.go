package dtos

import "github.com/grafana/grafana/pkg/components/simplejson"

type PerformanceMetric struct {
	Type  string  `json:"type"`
	Name  string  `json:"name"`
	Value float32 `json:"value"`
}

type PerformanceMetricDTO struct {
	*PerformanceMetric
	Meta *simplejson.Json `json:"meta"`
}

type FrontendPerformanceMetricsCommand struct {
	Metrics []*PerformanceMetricDTO `json:"metrics"`
}
