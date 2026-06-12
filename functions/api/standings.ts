// Cloudflare Pages Function — proxies football-data.org standings API
// Deployed at /api/standings

const API_BASE = 'https://api.football-data.org/v4';

export async function onRequest(context: { request: Request; env: Record<string, string> }) {
  const API_KEY = context.env.FOOTBALL_DATA_API_KEY || '';

  if (!API_KEY) {
    return new Response(JSON.stringify({ error: 'FOOTBALL_DATA_API_KEY 未配置' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  try {
    const res = await fetch(`${API_BASE}/competitions/WC/standings`, {
      headers: { 'X-Auth-Token': API_KEY },
    });

    if (!res.ok) {
      return new Response(JSON.stringify({ error: `API ${res.status}` }), {
        status: 502,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, max-age=60' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: '实时数据获取失败' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}
