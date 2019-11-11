package usagestats

import (
	"context"
	"sync"
	"time"

	"github.com/grafana/grafana/pkg/bus"
	"github.com/grafana/grafana/pkg/login/social"
	"github.com/grafana/grafana/pkg/models"
	"github.com/grafana/grafana/pkg/services/sqlstore"

	"github.com/grafana/grafana/pkg/infra/log"
	"github.com/grafana/grafana/pkg/registry"
	"github.com/grafana/grafana/pkg/setting"
)

func init() {
	registry.RegisterService(&UsageStatsService{})
}

type UsageStatsService struct {
	Cfg               *setting.Cfg       `inject:""`
	Bus               bus.Bus            `inject:""`
	SQLStore          *sqlstore.SqlStore `inject:""`
	License           models.Licensing   `inject:""`
	activityDataMutex sync.RWMutex
	activityData      map[string]*ActivityStat
	log               log.Logger

	oauthProviders map[string]bool
}

func (uss *UsageStatsService) Init() error {
	uss.log = log.New("metrics")
	uss.oauthProviders = social.GetOAuthProviders(uss.Cfg)
	uss.activityData = map[string]*ActivityStat{}
	return nil
}

func (uss *UsageStatsService) Run(ctx context.Context) error {
	uss.updateTotalStats()

	onceEveryDayTick := time.NewTicker(time.Hour * 24)
	everyMinuteTicker := time.NewTicker(time.Minute)
	defer onceEveryDayTick.Stop()
	defer everyMinuteTicker.Stop()

	for {
		select {
		case <-onceEveryDayTick.C:
			uss.sendUsageStats(uss.oauthProviders)
		case <-everyMinuteTicker.C:
			uss.updateTotalStats()
		case <-ctx.Done():
			return ctx.Err()
		}
	}
}
