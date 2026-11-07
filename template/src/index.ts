import { R2Explorer } from "r2-explorer";

const r2Worker = R2Explorer({
	readonly: true,
});

export default {
	async fetch(request: Request, env: any, ctx: any) {
		const url = new URL(request.url);
		const ua = (request.headers.get("User-Agent") || "").toLowerCase();
		
		// 1. 判断是不是手机浏览器
		const isMobile = /mobile|android|iphone|ipad|ipod|windows phone|blackberry|opera mini/i.test(ua);

		// 2. 暴力拦截：只要是手机端，且请求的是 /api/ 或 /share/ 路径，且不是获取列表等辅助请求
		if (isMobile) {
			// 拦截分享页的直接请求
			if (url.pathname.startsWith("/share/")) {
				return new Response("禁止使用手机浏览器下载分享文件，请使用电脑访问。", {
					status: 403,
					headers: { "Content-Type": "text/plain; charset=utf-8" },
				});
			}

			// 拦截可能的 API 下载请求（通常带有文件 key 或是下载接口）
			// 如果你发现手机点了下载依然能下，说明它请求了类似 /api/buckets/xxx/xxx 的路径
			// 我们直接拦截手机端对 /api/buckets/ 下带文件后缀的 GET 请求
			if (url.pathname.startsWith("/api/buckets/") && request.method === "GET") {
				// 如果路径里包含文件扩展名（说明是在请求具体文件，而不是列表）
				if (/\.[a-zA-Z0-9]+$/.test(url.pathname)) {
					return new Response("禁止使用手机浏览器下载分享文件，请使用电脑访问。", {
						status: 403,
						headers: { "Content-Type": "text/plain; charset=utf-8" },
					});
				}
			}
		}

		// 放行给 R2Explorer 处理
		return r2Worker.fetch(request, env, ctx);
	},

	async email(event: any, env: any, ctx: any) {
		if (r2Worker.email) return r2Worker.email(event, env, ctx);
	}
};
