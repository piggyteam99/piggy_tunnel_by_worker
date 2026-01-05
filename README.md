### فارسی

با استفاده از محتوای فایل `worker.js`، می‌توانید در **Cloudflare Worker** خود به کانفیگ‌های **WS + TLS** یا **XHTTP + TLS** تانل بزنید.

**نکته مهم:**
توجه کنید که **فقط باید دامنه‌ی خود را در خط چهارم قرار دهید**. پس از ایجاد Worker، سایت ساخته‌شده را باز کنید، **کانفیگ خود را وارد کنید** تا سایت **نسخه‌ی تانل‌شده‌ی کانفیگ** را به شما ارائه دهد.

مزیت اصلی این روش این است که **هیچ‌گونه خطری دامنه‌ی شما را تهدید نخواهد کرد** و ارتباط به‌صورت امن از طریق کلودفلر برقرار می‌شود.

⚠️ توجه:
این تانل **صرفاً برای استفاده شخصی** طراحی شده است و استفاده‌ی عمومی یا تجاری از آن توصیه نمی‌شود.

---

### English

Using the contents of the `worker.js` file, you can create a tunnel from your **Cloudflare Worker** to **WS + TLS** or **XHTTP + TLS** configurations.

**Important:**
Make sure to **only place your domain on line four**. After creating the Worker, open the generated site, **paste your configuration**, and the site will provide you with the **tunneled configuration**.

The main advantage of this method is that **your domain remains fully protected**, as all traffic is securely handled through Cloudflare.

⚠️ Note:
This tunnel is **intended for personal use only** and is not recommended for public or commercial usage.
