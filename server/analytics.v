module main

import net.http

pub fn (mut app Server) send_analytics(url string) {
	user_agent := app.req.header.get(http.CommonHeader.user_agent) or { '' }
	http.post('http://localhost:8100/a', '{ "url": "${url}", "user_agent": "${user_agent}", "site_id": 0 }') or {}
}
