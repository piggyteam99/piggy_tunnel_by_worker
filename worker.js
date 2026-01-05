// ==========================================
// تنظیمات: فقط خط زیر را تغییر دهید
// آدرس دامین سرور اصلی خود را اینجا بنویسید (بدون https)
const UPSTREAM_DOMAIN = 'enter your domain'; 
// ==========================================

const UPSTREAM_PORT = 443;

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const acceptHeader = request.headers.get('Accept') || '';

  // نمایش سایت در مرورگر
  if (request.method === 'GET' && acceptHeader.includes('text/html') && !url.searchParams.has('type')) {
    return new Response(renderHTML(url.hostname), {
      headers: { 'Content-Type': 'text/html;charset=UTF-8' }
    });
  }

  // === بخش تانلینگ (Backend) ===
  const targetUrl = `https://${UPSTREAM_DOMAIN}:${UPSTREAM_PORT}${url.pathname}${url.search}`;
  
  // کپی کردن هدرها بدون دستکاری خطرناک
  let newHeaders = new Headers(request.headers);
  newHeaders.set('Host', UPSTREAM_DOMAIN);
  
  // لاجیک هوشمند برای Connection Header
  // اگر درخواست WebSocket باشد، نباید Connection را دستکاری کنیم
  // اگر درخواست معمولی (xhttp) باشد، برای پایداری Keep-Alive می‌دهیم
  const isWebSocket = request.headers.get('Upgrade') === 'websocket';
  
  if (!isWebSocket) {
      newHeaders.set('Connection', 'keep-alive');
  }

  const newRequest = new Request(targetUrl, {
    method: request.method,
    headers: newHeaders,
    body: request.body,
    redirect: 'manual' 
  });

  try {
    const response = await fetch(newRequest);
    
    // بازگرداندن پاسخ
    let responseHeaders = new Headers(response.headers);
    responseHeaders.set('Access-Control-Allow-Origin', '*');

    // اگر وب‌سوکت بود، پاسخ باید 101 Switching Protocols باشد
    if (isWebSocket && response.status === 101) {
        return new Response(null, {
            status: 101,
            webSocket: response.webSocket,
            headers: responseHeaders
        });
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders
    });
  } catch (err) {
    return new Response(null, { status: 502 });
  }
}

// === بخش ظاهر سایت (Frontend) ===
function renderHTML(host) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PiggyTunnel Pro</title>
    <style>
        :root { --primary: #ff1493; --accent: #00e5ff; --bg: #050505; --panel: rgba(18, 18, 18, 0.9); --text: #eee; }
        body { background-color: var(--bg); background-image: radial-gradient(circle at 50% 0%, #1a0b12 0%, var(--bg) 70%); color: var(--text); font-family: 'Segoe UI', Roboto, sans-serif; margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; overflow-y: auto; padding: 20px; box-sizing: border-box; }
        
        .container { background: var(--panel); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08); padding: 2rem; border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.6); width: 100%; max-width: 800px; text-align: center; position: relative; display: flex; flex-direction: column; gap: 15px; }
        
        /* لوگو و هدر */
        .header-section { margin-bottom: 10px; }
        .logo { width: 80px; height: 80px; filter: drop-shadow(0 0 15px rgba(255, 20, 147, 0.5)); transition: transform 0.3s; }
        .logo:hover { transform: scale(1.1) rotate(-5deg); }
        h1 { margin: 10px 0 5px; font-size: 1.8rem; font-weight: 800; background: linear-gradient(135deg, #fff 0%, var(--primary) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        
        /* چیدمان ریسپانسیو */
        .grid-layout { display: flex; flex-direction: column; gap: 15px; }
        
        @media (min-width: 768px) {
            .grid-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; text-align: left; }
            .full-width { grid-column: span 2; }
            .container { max-width: 700px; padding: 2.5rem; }
        }

        .input-group { position: relative; }
        label { display: block; font-size: 0.75rem; color: var(--accent); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; font-weight: 700; }
        
        input[type="text"], textarea { width: 100%; background: rgba(0, 0, 0, 0.4); border: 1px solid #333; color: #fff; border-radius: 10px; padding: 12px; font-family: 'Courier New', monospace; font-size: 0.85rem; outline: none; transition: 0.3s; box-sizing: border-box; }
        textarea { height: 80px; resize: none; }
        input:focus, textarea:focus { border-color: var(--primary); box-shadow: 0 0 10px rgba(255, 20, 147, 0.2); }
        
        .btn { width: 100%; padding: 12px; background: linear-gradient(90deg, var(--primary), #b00060); border: none; color: #fff; font-weight: 700; border-radius: 10px; cursor: pointer; transition: 0.2s; font-size: 0.9rem; margin-top: 5px; }
        .btn:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(255, 20, 147, 0.3); }
        .btn.secondary { background: rgba(255, 255, 255, 0.05); border: 1px solid #333; background-image: none; color: #aaa; }
        .btn.secondary:hover { background: rgba(255, 255, 255, 0.1); color: #fff; }

        /* Output Area */
        .output-area { display: none; margin-top: 10px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 15px; }
        
        /* انیمیشن‌ها */
        .glow { position: absolute; width: 300px; height: 300px; background: var(--primary); filter: blur(150px); opacity: 0.15; border-radius: 50%; z-index: -1; pointer-events: none; }
        .glow.two { background: var(--accent); right: 0; bottom: 0; }
    </style>
</head>
<body>
    <div class="glow"></div>
    <div class="glow two"></div>

    <div class="container">
        <div class="header-section">
            <svg class="logo" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#ff1493"/><stop offset="100%" style="stop-color:#00e5ff"/></linearGradient></defs>
                <path d="M40,70 Q40,40 100,40 Q160,40 160,70 L160,130 Q160,160 100,160 Q40,160 40,130 Z" fill="none" stroke="url(#g)" stroke-width="6"/>
                <path d="M45,55 L20,20 L65,45 M155,55 L180,20 L135,45" fill="none" stroke="#ff1493" stroke-width="6" stroke-linecap="round"/>
                <rect x="50" y="80" width="100" height="25" rx="5" fill="#00e5ff" fill-opacity="0.2" stroke="#00e5ff" stroke-width="3"/>
                <circle cx="90" cy="130" r="4" fill="#ff1493"/><circle cx="110" cy="130" r="4" fill="#ff1493"/>
            </svg>
            <h1>PiggyTunnel</h1>
        </div>
        
        <div class="grid-layout">
            <div class="input-group full-width">
                <label>Worker Domain</label>
                <input type="text" id="workerHost" value="` + host + `">
            </div>

            <div class="input-group full-width">
                <label>Paste Original Config</label>
                <textarea id="inputConfig" placeholder="vless://..."></textarea>
            </div>

            <button class="btn" onclick="processConfig('vless')">GENERATE LINK</button>
            <button class="btn secondary" onclick="processConfig('json')">GET JSON</button>
            
            <div class="output-area full-width" id="output">
                <label style="color:#00e5ff; display:flex; justify-content:space-between;">
                    <span>✔ RESULT</span>
                    <span id="protocol-badge" style="background:#333; padding:2px 6px; border-radius:4px; font-size:0.7em">AUTO</span>
                </label>
                <textarea id="result" readonly></textarea>
                <button class="btn" style="background:#222; margin-top:8px;" onclick="copyText()">COPY TO CLIPBOARD</button>
            </div>
        </div>
    </div>

    <script>
        function processConfig(outputType) {
            const rawConfig = document.getElementById('inputConfig').value.trim();
            const workerHost = document.getElementById('workerHost').value.trim();
            const badge = document.getElementById('protocol-badge');
            
            if (!rawConfig.startsWith('vless://')) {
                alert("Please paste a valid vless:// config link.");
                return;
            }

            try {
                const urlObj = new URL(rawConfig);
                
                // 1. تشخیص پروتکل (Smart Protocol Detection)
                let type = urlObj.searchParams.get("type") || urlObj.searchParams.get("network") || "tcp";
                
                // 2. تنظیم آدرس وورکر
                urlObj.hostname = workerHost;
                urlObj.port = "443";
                urlObj.searchParams.set("host", workerHost);
                urlObj.searchParams.set("sni", workerHost);
                urlObj.hash = "Piggy_" + workerHost.split('.')[0];

                // 3. اعمال تنظیمات بر اساس نوع پروتکل
                if (type === "ws" || type === "websocket") {
                    // تنظیمات مخصوص وب‌سوکت
                    badge.innerText = "DETECTED: WebSocket";
                    // پاک کردن تنظیمات اضافی xhttp که کانفیگ ws را خراب می‌کنند
                    urlObj.searchParams.delete("packetEncoding"); 
                    urlObj.searchParams.set("type", "ws"); // اطمینان از تایپ
                    // وب‌سوکت معمولاً alpn خاصی نیاز ندارد یا http/1.1 است
                    if (!urlObj.searchParams.has("path")) urlObj.searchParams.set("path", "/");
                } 
                else if (type === "xhttp") {
                    // تنظیمات مخصوص xhttp
                    badge.innerText = "DETECTED: xhttp";
                    urlObj.searchParams.set("type", "xhttp");
                    urlObj.searchParams.set("alpn", "h2,http/1.1");
                    urlObj.searchParams.set("packetEncoding", "xudp");
                    urlObj.searchParams.set("mode", "multi");
                }
                else {
                    // اگر مشخص نبود، پیش‌فرض را xhttp در نظر بگیر (یا همان tcp بگذار)
                    badge.innerText = "MODE: xhttp (Default)";
                    urlObj.searchParams.set("type", "xhttp");
                    urlObj.searchParams.set("alpn", "h2,http/1.1");
                }

                let finalResult = "";

                if (outputType === 'vless') {
                    finalResult = urlObj.toString();
                } else {
                    // تولید JSON هوشمند
                    const uuid = urlObj.username;
                    const path = urlObj.searchParams.get("path") || "/";
                    const isWS = (type === "ws" || type === "websocket");
                    
                    const streamSettings = {
                        "network": isWS ? "ws" : "xhttp",
                        "security": "tls",
                        "tlsSettings": {
                            "serverName": workerHost,
                            "alpn": isWS ? undefined : ["h2", "http/1.1"], // WS معمولا ALPN نمی‌خواهد
                            "allowInsecure": false,
                            "fingerprint": "chrome"
                        }
                    };

                    if (isWS) {
                        streamSettings.wsSettings = { "path": path, "headers": { "Host": workerHost } };
                    } else {
                        streamSettings.xhttpSettings = { "host": workerHost, "path": path, "mode": "auto" };
                    }

                    const jsonConfig = {
                        "dns": { "servers": ["1.1.1.1", "8.8.8.8"] },
                        "inbounds": [{ "listen": "127.0.0.1", "port": 10808, "protocol": "socks", "settings": { "auth": "noauth", "udp": true } }],
                        "outbounds": [
                            {
                                "tag": "proxy",
                                "protocol": "vless",
                                "settings": {
                                    "vnext": [{
                                        "address": workerHost,
                                        "port": 443,
                                        "users": [{ "id": uuid, "encryption": "none", "level": 8 }]
                                    }]
                                },
                                "streamSettings": streamSettings
                            },
                            { "protocol": "freedom", "tag": "direct" }
                        ]
                    };
                    finalResult = JSON.stringify(jsonConfig, null, 2);
                }

                document.getElementById('output').style.display = 'block';
                document.getElementById('result').value = finalResult;
                
                // اسکرول نرم به پایین برای دیدن نتیجه در دسکتاپ
                document.getElementById('output').scrollIntoView({behavior: "smooth"});

            } catch (e) {
                alert("Error: " + e.message);
            }
        }

        function copyText() {
            const copyText = document.getElementById("result");
            copyText.select();
            document.execCommand("copy");
            const btn = document.querySelector('.output-area .btn');
            const originalText = btn.innerText;
            btn.innerText = "COPIED!";
            setTimeout(() => btn.innerText = originalText, 2000);
        }
    </script>
</body>
</html>
  `;
  return html;
}
