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

		// 2. 终极暴力拦截：只要是手机，只要访问 /api/ 或 /share/，直接拦截！
		// 因为手机端无论是要下载还是获取文件列表，都一定会请求这两个路径之一。
		if (isMobile && (url.pathname.startsWith("/api/") || url.pathname.startsWith("/share/"))) {
			
			// 为了让手机能正常打开首页看个大概（或者你连首页都不想给看，可以把下面这个判断去掉）
			// 我们只拦截具体的文件请求，放行获取配置、列表等请求
			// （注意：如果下载走的是 /api/buckets/xxx/xxx，它一定会命中下面的条件）
			if (url.pathname.startsWith("/share/") || (url.pathname.startsWith("/api/buckets/") && request.method === "GET")) {
				
				// 返回漂亮的中文提示页面
				const html = `
				<!DOCTYPE html>
				<html lang="zh-CN">
				<head>
					<meta charset="utf-8">
					<meta name="viewport" content="width=device-width, initial-scale=1.0">
					<title>请使用电脑端下载</title>
					<style>
						body { display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; font-family: system-ui, -apple-system, sans-serif; background-color: #f4f6f8; }
						.card { text-align: center; padding: 40px 30px; background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); max-width: 80%; }
						h2 { color: #1a1a1a; margin-top: 0; font-size: 22px; }
						p { color: #666; font-size: 15px; line-height: 1.6; margin-bottom: 0; }
					</style>
				</head>
				<body>
					<div class="card">
						<h2>💻 请使用电脑浏览器下载</h2>
						<p>为了保护文件安全，暂不支持在手机端直接下载。<br>请复制当前链接，发送到电脑上打开。</p>
					</div>
				</body>
				</html>
				`;
				
				return new Response(html, {
					status: 403,
					headers: { "Content-Type": "text/html; charset=utf-8" },
				});
			}
		}

		// 其他情况（电脑端或正常浏览）放行给原版 R2Explorer
		return r2Worker.fetch(request, env, ctx);
	},

	async email(event: any, env: any, ctx: any) {
		if (r2Worker.email) return r2Worker.email(event, env, ctx);
	}
};
