module analytics

pub struct AnalyticsEvent {
pub:
	id         int    [omitempty; primary]
	url        string // event page url
	event_kind int    // actually EventKind
	site_id    int    // actually SiteId
pub mut:
	user_agent      string // user agent of the user
	accept_language string // accept language of the user
	referrer        string // referrer url
	created_at      i64    [omitenpty] // utc timestamp
}
