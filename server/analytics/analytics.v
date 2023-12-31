module analytics

import net.http
import json

pub fn send_analytics(req http.Request, url string) {
	user_agent := req.header.get(.user_agent) or { '' }
	accept_language := req.header.get(.accept_language) or { '' }
	referrer := req.header.get(.referer) or { '' }

	event := AnalyticsEvent{
		url: url
		event_kind: 0
		site_id: 0
		user_agent: user_agent
		accept_language: accept_language
		referrer: referrer
	}

	data := json.encode(event)

	http.post('http://localhost:8100/a', data) or {}
}
