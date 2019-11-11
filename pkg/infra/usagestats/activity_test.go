package usagestats

import (
	"net/http"
	"testing"

	"github.com/grafana/grafana/pkg/models"
	"github.com/grafana/grafana/pkg/setting"
	"github.com/stretchr/testify/assert"
	"gopkg.in/macaron.v1"
)

func TestActivityTracking(t *testing.T) {
	us := &UsageStatsService{
		Cfg: setting.NewCfg(),
	}
	us.Init()

	req, _ := http.NewRequest("POST", "/api/teams", nil)
	req.Header["User-Agent"] = []string{"Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0"}

	ctx := &models.ReqContext{
		Context: &macaron.Context{
			Req: macaron.Request{Request: req},
		},
		SignedInUser: &models.SignedInUser{},
	}

	us.RecordDashboardGet("asdasdsa", ctx)
	us.RecordDashboardGet("asdasdsa2", ctx)
	us.RecordDashboardGet("asdasdsa2", ctx)
	us.RecordDashboardGet("asdasdsa2", ctx)

	stats := us.calculateActivityStats()
	assert.EqualValues(t, 4, stats.OpenedDashboards)
}
