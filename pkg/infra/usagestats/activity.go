package usagestats

import "time"

type ActivityStat struct {
	Type ActivityStatType
	Key  string
	Date time.Time
}

type ActivityStatType string

const (
	ActivityStatDashboardOpened ActivityStatType = "dashboard-opened"
)
