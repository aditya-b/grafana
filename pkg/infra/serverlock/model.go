package serverlock

type serverLock struct {
	// Disabling style linting of the fields here, since they are tied to database fields and haven't figured
	// out yet how to fix test failures arising from renaming them (to ID and OperationUID)
	//nolint: stylecheck
	Id int64
	//nolint: stylecheck
	OperationUid  string
	LastExecution int64
	Version       int64
}
