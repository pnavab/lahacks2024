import fetch from 'node-fetch';

export async function POST(req) {
    const { domain } = await req.json();
    const response = await fetch("https://api.qrcode-monkey.com//qr/custom", {
        "headers": {
            "accept": "*/*",
            "accept-language": "en-US,en;q=0.9",
            "content-type": "text/plain;charset=UTF-8",
            "sec-ch-ua": "\"Google Chrome\";v=\"123\", \"Not:A-Brand\";v=\"8\", \"Chromium\";v=\"123\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site",
            "Referer": "https://www.qrcode-monkey.com/",
            "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": JSON.stringify({
            data: `${domain}`,
            config: {
              body: "square",
              eye: "frame0",
              eyeBall: "ball0",
              erf1: [],
              erf2: [],
              erf3: [],
              brf1: [],
              brf2: [],
              brf3: [],
              bodyColor: "#000000",
              bgColor: "#FFFFFF",
              eye1Color: "#000000",
              eye2Color: "#000000",
              eye3Color: "#000000",
              eyeBall1Color: "#000000",
              eyeBall2Color: "#000000",
              eyeBall3Color: "#000000",
              gradientColor1: "",
              gradientColor2: "",
              gradientType: "linear",
              gradientOnEyes: "true",
              logo: "",
              logoMode: "default"
            },
            size: 1000,
            download: "imageUrl",
            file: "svg"
          }),
        "method": "POST"
    });
    const data = await response.json();
    return Response.json(data);
}
