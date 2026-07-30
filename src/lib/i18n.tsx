import { createContext, useContext, useMemo, type ReactNode } from "react";
import { setState, useAppState } from "@/lib/app-state";

export type Lang =
  | "en"
  | "hi"
  | "bn"
  | "mr"
  | "te"
  | "ta"
  | "gu"
  | "ur"
  | "kn"
  | "ml"
  | "pa";

export const LANGUAGES: { code: Lang; label: string; native: string }[] = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "bn", label: "Bengali", native: "বাংলা" },
  { code: "mr", label: "Marathi", native: "मराठी" },
  { code: "te", label: "Telugu", native: "తెలుగు" },
  { code: "ta", label: "Tamil", native: "தமிழ்" },
  { code: "gu", label: "Gujarati", native: "ગુજરાતી" },
  { code: "ur", label: "Urdu", native: "اردو" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
  { code: "ml", label: "Malayalam", native: "മലയാളം" },
  { code: "pa", label: "Punjabi", native: "ਪੰਜਾਬੀ" },
];

// Keys used across the app. English is source of truth.
const en = {
  // nav
  "nav.home": "Home",
  "nav.health": "Health",
  "nav.ai": "AI",
  "nav.family": "Family",
  "nav.profile": "Profile",
  "nav.dashboard": "Dashboard",
  "nav.parents": "Parents",
  "nav.medicines": "Medicines",
  "nav.insights": "Insights",
  // actions
  "action.call": "Call",
  "action.video": "Video",
  "action.voice": "Voice",
  "action.text": "Text",
  "action.end": "End",
  "action.send": "Send",
  "action.cancel": "Cancel",
  "action.done": "Done",
  "action.back": "Back",
  "action.getStarted": "Get started",
  "action.playVoice": "Play voice",
  "action.remindLater": "Remind me later",
  "action.tookIt": "I Took It",
  "action.view": "View",
  "action.navigate": "Navigate",
  // greetings
  "g.morning": "Good morning",
  "g.afternoon": "Good afternoon",
  "g.evening": "Good evening",
  // labels
  "l.medicine": "Medicine",
  "l.appointment": "Appointment",
  "l.walk": "Walk",
  "l.water": "Water",
  "l.wellness": "Wellness score",
  "l.upcoming": "Upcoming today",
  "l.fromFamily": "From family",
  "l.emergency": "Emergency contact",
  "l.language": "Language",
  "l.textSize": "Text size",
  "l.darkMode": "Dark mode",
  "l.highContrast": "High contrast",
  "l.accessibility": "Accessibility",
  "l.calling": "Calling",
  "l.videoCall": "Video call",
  "l.voiceMessage": "Voice message",
  "l.textMessage": "Message",
  "l.typeMessage": "Type your message…",
  "l.recording": "Recording…",
  "l.holdToTalk": "Hold to talk",
  "l.listening": "Listening…",
  "l.connected": "Connected",
  "l.messageSent": "Message sent",
  "l.voiceSent": "Voice message sent",
  "l.everyone": "Everyone at a glance",
  "l.reachFamily": "Tap to reach the people who love you.",
  "l.askAnything": "Ask anything — hold to talk.",
};

type Dict = Partial<Record<keyof typeof en, string>>;

const hi: Dict = {
  "nav.home": "होम",
  "nav.health": "स्वास्थ्य",
  "nav.ai": "एआई",
  "nav.family": "परिवार",
  "nav.profile": "प्रोफ़ाइल",
  "nav.dashboard": "डैशबोर्ड",
  "nav.parents": "माता-पिता",
  "nav.medicines": "दवाइयाँ",
  "nav.insights": "जानकारी",
  "action.call": "कॉल",
  "action.video": "वीडियो",
  "action.voice": "आवाज़",
  "action.text": "संदेश",
  "action.end": "समाप्त",
  "action.send": "भेजें",
  "action.cancel": "रद्द करें",
  "action.done": "पूरा",
  "action.back": "वापस",
  "action.getStarted": "शुरू करें",
  "action.playVoice": "आवाज़ चलाएँ",
  "action.remindLater": "बाद में याद दिलाएँ",
  "action.tookIt": "मैंने ली",
  "action.view": "देखें",
  "action.navigate": "रास्ता दिखाएँ",
  "g.morning": "सुप्रभात",
  "g.afternoon": "नमस्कार",
  "g.evening": "शुभ संध्या",
  "l.medicine": "दवा",
  "l.appointment": "मुलाक़ात",
  "l.walk": "सैर",
  "l.water": "पानी",
  "l.wellness": "स्वास्थ्य स्कोर",
  "l.upcoming": "आज के आगामी",
  "l.fromFamily": "परिवार से",
  "l.emergency": "आपातकालीन संपर्क",
  "l.language": "भाषा",
  "l.textSize": "पाठ आकार",
  "l.darkMode": "डार्क मोड",
  "l.highContrast": "उच्च कंट्रास्ट",
  "l.accessibility": "सुलभता",
  "l.calling": "कॉल हो रहा है",
  "l.videoCall": "वीडियो कॉल",
  "l.voiceMessage": "आवाज़ संदेश",
  "l.textMessage": "संदेश",
  "l.typeMessage": "अपना संदेश लिखें…",
  "l.recording": "रिकॉर्ड हो रहा है…",
  "l.holdToTalk": "बोलने के लिए दबाए रखें",
  "l.listening": "सुन रहा हूँ…",
  "l.connected": "कनेक्ट हो गया",
  "l.messageSent": "संदेश भेजा गया",
  "l.voiceSent": "आवाज़ संदेश भेजा गया",
  "l.everyone": "सब एक नज़र में",
  "l.reachFamily": "अपनों से जुड़ने के लिए टैप करें।",
  "l.askAnything": "कुछ भी पूछें — बोलने के लिए दबाए रखें।",
};

const bn: Dict = {
  "nav.home": "হোম", "nav.health": "স্বাস্থ্য", "nav.ai": "এআই", "nav.family": "পরিবার", "nav.profile": "প্রোফাইল",
  "nav.dashboard": "ড্যাশবোর্ড", "nav.parents": "মা-বাবা", "nav.medicines": "ওষুধ", "nav.insights": "তথ্য",
  "action.call": "কল", "action.video": "ভিডিও", "action.voice": "কণ্ঠ", "action.text": "বার্তা",
  "action.end": "শেষ", "action.send": "পাঠান", "action.cancel": "বাতিল", "action.done": "সম্পন্ন",
  "action.back": "ফিরে যান", "action.getStarted": "শুরু করুন", "action.playVoice": "কণ্ঠ চালান",
  "action.remindLater": "পরে মনে করান", "action.tookIt": "নিয়েছি", "action.view": "দেখুন", "action.navigate": "পথ দেখান",
  "g.morning": "সুপ্রভাত", "g.afternoon": "শুভ অপরাহ্ন", "g.evening": "শুভ সন্ধ্যা",
  "l.medicine": "ওষুধ", "l.appointment": "অ্যাপয়েন্টমেন্ট", "l.walk": "হাঁটা", "l.water": "জল",
  "l.wellness": "সুস্থতা স্কোর", "l.upcoming": "আজকের আসন্ন", "l.fromFamily": "পরিবার থেকে",
  "l.language": "ভাষা", "l.textSize": "লেখার আকার", "l.darkMode": "ডার্ক মোড", "l.highContrast": "উচ্চ কনট্রাস্ট",
  "l.accessibility": "প্রবেশযোগ্যতা", "l.calling": "কল হচ্ছে", "l.videoCall": "ভিডিও কল",
  "l.voiceMessage": "কণ্ঠ বার্তা", "l.textMessage": "বার্তা", "l.typeMessage": "বার্তা লিখুন…",
  "l.recording": "রেকর্ড হচ্ছে…", "l.holdToTalk": "কথা বলতে চেপে ধরুন", "l.listening": "শুনছি…",
  "l.connected": "সংযুক্ত", "l.messageSent": "বার্তা পাঠানো হয়েছে", "l.voiceSent": "কণ্ঠ বার্তা পাঠানো হয়েছে",
  "l.everyone": "সবাই এক নজরে", "l.reachFamily": "প্রিয়জনদের সাথে যোগাযোগ করতে ট্যাপ করুন।",
  "l.askAnything": "যা খুশি জিজ্ঞাসা করুন — কথা বলতে চেপে ধরুন।",
};

const mr: Dict = {
  "nav.home": "मुख्यपृष्ठ", "nav.health": "आरोग्य", "nav.ai": "एआय", "nav.family": "कुटुंब", "nav.profile": "प्रोफाइल",
  "nav.dashboard": "डॅशबोर्ड", "nav.parents": "पालक", "nav.medicines": "औषधे", "nav.insights": "माहिती",
  "action.call": "कॉल", "action.video": "व्हिडिओ", "action.voice": "आवाज", "action.text": "संदेश",
  "action.end": "समाप्त", "action.send": "पाठवा", "action.cancel": "रद्द", "action.done": "पूर्ण",
  "action.getStarted": "सुरू करा", "action.tookIt": "घेतले", "action.view": "पहा", "action.navigate": "मार्ग",
  "g.morning": "शुभ सकाळ", "g.afternoon": "शुभ दुपार", "g.evening": "शुभ संध्याकाळ",
  "l.language": "भाषा", "l.calling": "कॉल करत आहे", "l.videoCall": "व्हिडिओ कॉल",
  "l.voiceMessage": "आवाज संदेश", "l.textMessage": "संदेश", "l.typeMessage": "संदेश लिहा…",
  "l.holdToTalk": "बोलण्यासाठी दाबून ठेवा",
};

const te: Dict = {
  "nav.home": "హోమ్", "nav.health": "ఆరోగ్యం", "nav.ai": "ఏఐ", "nav.family": "కుటుంబం", "nav.profile": "ప్రొఫైల్",
  "nav.dashboard": "డాష్‌బోర్డ్", "nav.parents": "తల్లిదండ్రులు", "nav.medicines": "మందులు", "nav.insights": "సమాచారం",
  "action.call": "కాల్", "action.video": "వీడియో", "action.voice": "వాయిస్", "action.text": "సందేశం",
  "action.end": "ముగించు", "action.send": "పంపు", "action.cancel": "రద్దు", "action.done": "పూర్తి",
  "action.getStarted": "ప్రారంభించండి", "action.tookIt": "తీసుకున్నాను",
  "g.morning": "శుభోదయం", "g.afternoon": "శుభ మధ్యాహ్నం", "g.evening": "శుభ సాయంత్రం",
  "l.language": "భాష", "l.calling": "కాల్ చేస్తోంది", "l.holdToTalk": "మాట్లాడటానికి నొక్కి ఉంచండి",
};

const ta: Dict = {
  "nav.home": "முகப்பு", "nav.health": "ஆரோக்கியம்", "nav.ai": "ஏஐ", "nav.family": "குடும்பம்", "nav.profile": "சுயவிவரம்",
  "nav.dashboard": "டாஷ்போர்டு", "nav.parents": "பெற்றோர்", "nav.medicines": "மருந்துகள்", "nav.insights": "தகவல்கள்",
  "action.call": "அழை", "action.video": "வீடியோ", "action.voice": "குரல்", "action.text": "செய்தி",
  "action.end": "முடி", "action.send": "அனுப்பு", "action.cancel": "ரத்து", "action.done": "முடிந்தது",
  "action.getStarted": "தொடங்கு", "action.tookIt": "எடுத்துக்கொண்டேன்",
  "g.morning": "காலை வணக்கம்", "g.afternoon": "மதிய வணக்கம்", "g.evening": "மாலை வணக்கம்",
  "l.language": "மொழி", "l.calling": "அழைக்கிறது", "l.holdToTalk": "பேச அழுத்திப் பிடிக்கவும்",
};

const gu: Dict = {
  "nav.home": "હોમ", "nav.health": "આરોગ્ય", "nav.ai": "એઆઈ", "nav.family": "કુટુંબ", "nav.profile": "પ્રોફાઇલ",
  "nav.dashboard": "ડેશબોર્ડ", "nav.parents": "માતાપિતા", "nav.medicines": "દવાઓ", "nav.insights": "માહિતી",
  "action.call": "કૉલ", "action.video": "વિડિઓ", "action.voice": "અવાજ", "action.text": "સંદેશ",
  "action.end": "સમાપ્ત", "action.send": "મોકલો", "action.getStarted": "શરૂ કરો", "action.tookIt": "લીધી",
  "g.morning": "શુભ સવાર", "g.afternoon": "શુભ બપોર", "g.evening": "શુભ સાંજ",
  "l.language": "ભાષા", "l.calling": "કૉલ થઈ રહ્યો છે", "l.holdToTalk": "બોલવા માટે દબાવી રાખો",
};

const ur: Dict = {
  "nav.home": "ہوم", "nav.health": "صحت", "nav.ai": "اے آئی", "nav.family": "خاندان", "nav.profile": "پروفائل",
  "nav.dashboard": "ڈیش بورڈ", "nav.parents": "والدین", "nav.medicines": "دوائیں", "nav.insights": "معلومات",
  "action.call": "کال", "action.video": "ویڈیو", "action.voice": "آواز", "action.text": "پیغام",
  "action.end": "ختم", "action.send": "بھیجیں", "action.getStarted": "شروع کریں", "action.tookIt": "لے لی",
  "g.morning": "صبح بخیر", "g.afternoon": "دوپہر بخیر", "g.evening": "شام بخیر",
  "l.language": "زبان", "l.calling": "کال ہو رہی ہے", "l.holdToTalk": "بولنے کے لیے دبائے رکھیں",
};

const kn: Dict = {
  "nav.home": "ಮುಖಪುಟ", "nav.health": "ಆರೋಗ್ಯ", "nav.ai": "ಎಐ", "nav.family": "ಕುಟುಂಬ", "nav.profile": "ಪ್ರೊಫೈಲ್",
  "nav.dashboard": "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್", "nav.parents": "ಪೋಷಕರು", "nav.medicines": "ಔಷಧಗಳು", "nav.insights": "ಮಾಹಿತಿ",
  "action.call": "ಕರೆ", "action.video": "ವಿಡಿಯೋ", "action.voice": "ಧ್ವನಿ", "action.text": "ಸಂದೇಶ",
  "action.getStarted": "ಪ್ರಾರಂಭಿಸಿ", "action.tookIt": "ತೆಗೆದುಕೊಂಡೆ",
  "g.morning": "ಶುಭೋದಯ", "g.afternoon": "ಶುಭ ಮಧ್ಯಾಹ್ನ", "g.evening": "ಶುಭ ಸಂಜೆ",
  "l.language": "ಭಾಷೆ", "l.calling": "ಕರೆ ಮಾಡುತ್ತಿದೆ", "l.holdToTalk": "ಮಾತನಾಡಲು ಒತ್ತಿ ಹಿಡಿಯಿರಿ",
};

const ml: Dict = {
  "nav.home": "ഹോം", "nav.health": "ആരോഗ്യം", "nav.ai": "എഐ", "nav.family": "കുടുംബം", "nav.profile": "പ്രൊഫൈൽ",
  "nav.dashboard": "ഡാഷ്ബോർഡ്", "nav.parents": "മാതാപിതാക്കൾ", "nav.medicines": "മരുന്നുകൾ", "nav.insights": "വിവരങ്ങൾ",
  "action.call": "വിളിക്കുക", "action.video": "വീഡിയോ", "action.voice": "ശബ്ദം", "action.text": "സന്ദേശം",
  "action.getStarted": "തുടങ്ങുക", "action.tookIt": "കഴിച്ചു",
  "g.morning": "സുപ്രഭാതം", "g.afternoon": "ശുഭ മധ്യാഹ്നം", "g.evening": "ശുഭ സായാഹ്നം",
  "l.language": "ഭാഷ", "l.calling": "വിളിക്കുന്നു", "l.holdToTalk": "സംസാരിക്കാൻ അമർത്തിപ്പിടിക്കുക",
};

const pa: Dict = {
  "nav.home": "ਹੋਮ", "nav.health": "ਸਿਹਤ", "nav.ai": "ਏਆਈ", "nav.family": "ਪਰਿਵਾਰ", "nav.profile": "ਪ੍ਰੋਫਾਈਲ",
  "nav.dashboard": "ਡੈਸ਼ਬੋਰਡ", "nav.parents": "ਮਾਪੇ", "nav.medicines": "ਦਵਾਈਆਂ", "nav.insights": "ਜਾਣਕਾਰੀ",
  "action.call": "ਕਾਲ", "action.video": "ਵੀਡੀਓ", "action.voice": "ਆਵਾਜ਼", "action.text": "ਸੁਨੇਹਾ",
  "action.getStarted": "ਸ਼ੁਰੂ ਕਰੋ", "action.tookIt": "ਲੈ ਲਈ",
  "g.morning": "ਸ਼ੁਭ ਸਵੇਰ", "g.afternoon": "ਸ਼ੁਭ ਦੁਪਹਿਰ", "g.evening": "ਸ਼ੁਭ ਸ਼ਾਮ",
  "l.language": "ਭਾਸ਼ਾ", "l.calling": "ਕਾਲ ਹੋ ਰਹੀ ਹੈ", "l.holdToTalk": "ਬੋਲਣ ਲਈ ਦਬਾ ਕੇ ਰੱਖੋ",
};

const DICTS: Record<Lang, Dict> = { en, hi, bn, mr, te, ta, gu, ur, kn, ml, pa };

export type TKey = keyof typeof en;

const I18nContext = createContext<{ lang: Lang; t: (k: TKey) => string }>({
  lang: "en",
  t: (k) => en[k],
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const { lang } = useAppState();
  const value = useMemo(() => {
    const dict = DICTS[lang] ?? {};
    return {
      lang,
      t: (k: TKey) => (dict[k] as string) ?? en[k] ?? k,
    };
  }, [lang]);
  const isRtl = lang === "ur";
  return (
    <I18nContext.Provider value={value}>
      <div dir={isRtl ? "rtl" : "ltr"} className="contents">
        {children}
      </div>
    </I18nContext.Provider>
  );
}

export function useT() {
  return useContext(I18nContext).t;
}

export function useLang() {
  return useContext(I18nContext).lang;
}

export function setLang(lang: Lang) {
  setState({ lang });
}
