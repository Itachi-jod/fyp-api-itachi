const axios = require("axios");

module.exports = async (req, res) => {
  // PATH DECIDER
  const path = req.url.split("?")[0];

  // -------------------------------------
  // 👉 1. ROOT ENDPOINT "/"
  // -------------------------------------
  if (path === "/" || path === "") {
    return res.status(200).json({
      success: true,
      author: "ITACHI",
      message: "TikWM FYP API",
      endpoints: {
        "/api/fyp?q=keyword": "Search TikTok videos by keyword",
        "/": "API information (this page)"
      },
      example: {
        fyp: "/api/fyp?q=ITACHI"
      }
    });
  }

  // -------------------------------------
  // 👉 2. FYP ENDPOINT "/api/fyp"
  // -------------------------------------
  if (path === "/api/fyp") {
    try {
      const keyword = req.query?.q || "ITACHI";

      const url = "https://www.tikwm.com/api/feed/search";

      const cookie =
        "current_language=en; _ga_GA1.1=1181620278.1766996840; _gcl_au=1.1.1965485694.1766996841; cf_clearance=VF4HqKvHuWsMRP41q0fg.mesM7M18F94Nm9fDa.9TIM-1767027093-1.2.1.1-xCFXjulvzbOSIzWP3EjXgChwCKlhmZO7btSdzVut9aXPULEB7ezNXQuym_YAA5H59msUwKBmjtTtiDy1dBlx5rD7M_jA3hCM57Czyi3Zu_MiwReQO0DQfmEYVso7WH2n1UJwc8U4.hpplSJR1CoofxOfZXREnVN9bgAKz_JVnIDwOSPT10mXAStRQMMGPSQuezt_YZarPQgn4mQU5d59f8i9yxxlzRIJgZ8JIHJ1MX0; _ga_5370HT04Z3=GS2.1.51767027095803590$t1767027095$j60$10$ho";

      const payload = `keywords=${encodeURIComponent(keyword)}&count=12&cursor=0&web=1&hd=1`;

      const resp = await axios.post(url, payload, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json, text/javascript, */*;q=0.01",
          Origin: "https://www.tikwm.com",
          Referer: "https://www.tikwm.com/en/",
          "User-Agent":
            "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Mobile Safari/537.36",
          "X-Requested-With": "XMLHttpRequest",
          Cookie: cookie,
        },
      });

      const data = resp.data;

      const results =
        data?.data?.videos
          ?.map((v) => {
            if (!v.play) return null;
            return "https://www.tikwm.com" + v.play.replace(/\\\//g, "/");
          })
          .filter(Boolean) || [];

      return res.status(200).json({
        success: true,
        author: "ITACHI",
        keyword,
        results,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  }

  // -------------------------------------
  // 👉 404 for unknown routes
  // -------------------------------------
  return res.status(404).json({
    success: false,
    error: "Endpoint not found",
    try: ["/", "/api/fyp?q=keyword"],
  });
};
