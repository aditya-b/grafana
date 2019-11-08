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
	Timestamp time.Time
}

type ActivityStatType int

const (
	DashboardOpenedActivity ActivityStatType = 1
)

// This is to filter out api usage so we only measure actual users
func isBrowserUserAgent(userAgent string) bool {
	return strings.HasPrefix(userAgent, "Mozilla")
}

func (uss *UsageStatsService) RecordDashboardGet(dashboardUid string, reqContext *models.ReqContext) {
	key := fmt.Sprintf("%d-%s", DashboardOpenedActivity, dashboardUid)

	uss.activityDataMutex.Lock()

	stat, ok := uss.activityData[key]
	if ok {
		stat.Timestamp = time.Now()
	} else {
		uss.activityData[key] = &ActivityStat{
			Type:      DashboardOpenedActivity,
			Key:       key,
			Timestamp: time.Now(),
		}
	}

	uss.activityDataMutex.Unlock()
}

// func (uss *UsageStatsService) RecordActivity(ring, reqContext *models.ReqContext) {
// }

func (uss *UsageStatsService) getActiveDashboardCount() int64 {
	uss.activityDataMutex.RLock()

	count := int64(0)

	for _, v := range uss.activityData {
		if time.Now().Sub(v.Timestamp) > time.Hour*24 {
			continue
		}

		if v.Type == DashboardOpenedActivity {
			count++
		}
	}

	uss.activityDataMutex.RUnlock()
	return count
}
