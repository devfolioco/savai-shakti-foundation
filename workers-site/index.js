import { getAssetFromKV, defaultKeyModifier } from "@cloudflare/kv-asset-handler";
import parser from "accept-language-parser";

// Do not set to true in production!
const DEBUG = false;

addEventListener("fetch", (event) => {
  event.respondWith(handleEvent(event));
});

const strings = {
  hi: {
    title: "सवाई शक्ति फाउंडेशन",
    headline: "शक्ति गोप भारत में बिल्डर संस्कृति को बढ़ावा देने में अग्रणी थे",
    introductionHeading: "हमारी कहानी",
    shaktiBelief:
      "शक्ति का मानना था कि हर छात्र को, चाहे उनकी पृष्ठभूमि कुछ भी हो, एक सफल जीवन बनाने का मौका मिलना चाहिए। और, इस वादे को पूरा करना हमारे देश के अवसर के सबसे महत्वपूर्ण उत्तोलन पर निर्भर करता है: एक उच्च गुणवत्ता वाली शिक्षा।",
    vision:
      "उनके दृष्टिकोण को बढ़ावा देने के लिए, हम भारत के वंचित, जिज्ञासु और प्रेरित छात्रों की मदद करने के लिए 2586 लैब्स के वार्षिक राजस्व का 5% योगदान देंगे, न केवल उनकी औपचारिक शिक्षा पूरी करेंगे बल्कि उन्हें अवसरों से भी जोड़ेंगे।",
    grantHeading: "अनुदान कार्यक्रम",
    grant:
      "सवाई शक्ति फाउंडेशन उन छात्रों को अनुदान प्रदान करता है जिन्हें अपनी शिक्षा पूरी करने के लिए वित्तीय सहायता की आवश्यकता होती है।",
    grantCTA: "आवेदन करें",
    contactHeading: "संपर्क करें",
    contact:
      "यदि आप हमारे साथ साझेदारी करना चाहते हैं, या हमारे बारे में अधिक जानना चाहते हैं, तो बेझिझक संपर्क करें।",
    contactCTA: "हम से बात करे",
  },
};

class ElementHandler {
  constructor(countryStrings) {
    this.countryStrings = countryStrings;
  }

  element(element) {
    const i18nKey = element.getAttribute("data-i18n-key");

    if (i18nKey) {
      const translation = this.countryStrings[i18nKey];

      if (translation) {
        element.setInnerContent(translation);
      }
    }
  }
}

async function handleEvent(event) {
  const url = new URL(event.request.url);

  try {
    let options = {};

    if (DEBUG) {
      options = {
        cacheControl: {
          bypassCache: true,
        },
      };
    }

    const languageHeader = event.request.headers.get("Accept-Language");
    const language = parser.pick(["en", "hi"], languageHeader);

    const countryStrings = strings[language] || {};
    const response = await getAssetFromKV(event, options);

    return new HTMLRewriter()
      .on("[data-i18n-key]", new ElementHandler(countryStrings))
      .transform(response);
  } catch (e) {
    if (DEBUG) {
      return new Response(e.message || e.toString(), {
        status: 404,
      });
    } else {
      return new Response(`"${defaultKeyModifier(url.pathname)}" not found`, {
        status: 404,
      });
    }
  }
}
