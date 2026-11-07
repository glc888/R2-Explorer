import { R2Explorer } from "r2-explorer";

// 获取 R2Explorer 原本的 Worker 实例
const r2Worker = R2Explorer({
	readonly: true,
	// basicAuth: {
	// 	username: "username",
	// 	password: "password",
	// },
});

export default {
	async fetch(request: Request, env: any, ctx: any) {
		const url = new URL(request.url);

		// ====== 仅新增这段拦截逻辑 ======
		if (url.pathname.startsWith("/share/") && request.method === "GET") {
			const ua = (request.headers.get("User-Agent") || "").toLowerCase();
			const mobileKeywords = [
				"mobile", "android", "iphone", "ipad", "ipod", "windows phone", "blackberry", "opera mini"
			];
			
			if (mobileKeywords.some((kw) => ua.includes(kw))) {
				return new Response("非手机应用，请使用电脑端访问下载。", {
					status: 403,
					headers: { "Content-Type": "text/plain; charset=utf-8" },
				});
			}
		}
		// ====== 拦截结束 ======

		// 如果不是手机，放行给原来的 R2Explorer 处理
		return r2Worker.fetch(request, env, ctx);
	},

	// 保留原本的邮件接收功能
	async email(event: any, env: any, ctx: any) {
		if (r2Worker.email) {
			return r2Worker.email(event, env, ctx);
		}
	}
};
