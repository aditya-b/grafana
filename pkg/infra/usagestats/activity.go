package usagestats

import (
	"fmt"
	"strings"
	"time"

	"github.com/grafana/grafana/pkg/models"
)

type ActivityStat struct {
	Type      ActivityStatType
	Key       string
	Counter   int64
	Timestamp time.Time
}

type ActivityStatType int

const (
	DashboardOpenedActivity ActivityStatType = iota + 1
	DashboardQueryActivity
	ExploreQueryActivity
	UserActivity
)

// This is to filter out api usage so we only measure actual users
func isBrowserUserAgent(userAgent string) bool {
	return strings.HasPrefix(userAgent, "Mozilla")
}

func (uss *UsageStatsService) RecordDashboardGet(dashboardUid string, reqContext *models.ReqContext) {
	key := fmt.Sprintf("%d-%s", DashboardOpenedActivity, dashboardUid)
	uss.RecordActivity(key, DashboardOpenedActivity, reqContext)
}

func (uss *UsageStatsService) RecordQueryActivity(reqContext *models.ReqContext) {
	var userKey string

	if reqContext.IsSignedIn {
		userKey = fmt.Sprintf("%d-user-id-%d", UserActivity, reqContext.UserId)
	} else {
		userKey = fmt.Sprintf("%d-client-ip-%s", UserActivity, reqContext.RemoteAddr())
	}

	uss.RecordActivity(userKey, UserActivity, reqContext)
	uss.RecordActivity("dash-id", DashboardQueryActivity, reqContext)
}

func (uss *UsageStatsService) RecordActivity(key string, statType ActivityStatType, reqContext *models.ReqContext) {
	if !isBrowserUserAgent(reqContext.Req.UserAgent()) {
		return
	}

	uss.activityDataMutex.Lock()

	fullKey := fmt.Sprintf("%d-%s", statType, key)

	stat, ok := uss.activityData[fullKey]
	if ok {
		stat.Counter += 1
		stat.Timestamp = time.Now()
	} else {
		uss.activityData[fullKey] = &ActivityStat{
			Type:      statType,
			Key:       fullKey,
			Counter:   1,
			Timestamp: time.Now(),
		}
	}

	uss.activityDataMutex.Unlock()
}

type ActivityStatTotals struct {
	OpenedDashboards int64
	ActiveUsers      int64
	ActiveDashboards int64
	DashboardQueries int64
}

func (uss *UsageStatsService) calculateActivityStats() ActivityStatTotals {
	uss.activityDataMutex.RLock()

	stats := ActivityStatTotals{}

	for _, activity := range uss.activityData {
		switch activity.Type {
		case DashboardOpenedActivity:
			stats.OpenedDashboards += activity.Counter
		case UserActivity:
			stats.ActiveUsers += 1
		case DashboardQueryActivity:
			stats.DashboardQueries += activity.Counter
		}
	}

	uss.activityDataMutex.RUnlock()
	return stats
}

func (uss *UsageStatsService) reset() {
	uss.activityDataMutex.Lock()
	uss.activityData = map[string]*ActivityStat{}
	uss.activityDataMutex.Unlock()
}
