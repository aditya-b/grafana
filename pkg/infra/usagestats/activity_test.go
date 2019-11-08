package usagestats

import (
	"testing"

	"github.com/grafana/grafana/pkg/models"
	"github.com/grafana/grafana/pkg/setting"
	"github.com/stretchr/testify/assert"
)

func TestActivityTracking(t *testing.T) {
	us := &UsageStatsService{
		Cfg: setting.NewCfg(),
	}
	us.Init()

	us.RecordDashboardGet("asdasdsa", &models.ReqContext{})
	us.RecordDashboardGet("asdasdsa2", &models.ReqContext{})
	us.RecordDashboardGet("asdasdsa2", &models.ReqContext{})
	us.RecordDashboardGet("asdasdsa2", &models.ReqContext{})

	assert.EqualValues(t, 2, us.getActiveDashboardCount())
}
