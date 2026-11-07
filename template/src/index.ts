import { R2Explorer } from "r2-explorer";

const r2Worker = R2Explorer({
	readonly: true,
});

export default {
	async fetch(request: Request, env: any, ctx: any) {
		const url = new URL(request.url);
		
		// ====== 拦截逻辑开始 ======
		// 既然 WAF 能拦住，说明只要包含 /share/ 就没跑了
		if (url.pathname.includes("/share/")) {
			const ua = (request.headers.get("User-Agent") || "").toLowerCase();
			const isMobile = /mobile|android|iphone|ipad|ipod|windows phone|blackberry|opera mini/i.test(ua);
			
			if (isMobile) {
				// 返回一个漂亮的中文提示页面
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
		// ====== 拦截逻辑结束 ======

		// 其他情况（电脑端或正常浏览）放行给原版 R2Explorer
		return r2Worker.fetch(request, env, ctx);
	},

	async email(event: any, env: any, ctx: any) {
		if (r2Worker.email) return r2Worker.email(event, env, ctx);
	}
};
