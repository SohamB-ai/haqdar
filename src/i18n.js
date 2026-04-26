import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: {
        translation: {
          hero: {
            title_part1: "Access Your Welfare",
            title_part2: "Benefits Anywhere",
            subtext: "Discover, transfer, and claim government schemes seamlessly across states."
          },
          welcome: "Welcome to HaqDaar",
          tagline: "Empowering every citizen with seamless access to welfare benefits.",
          get_started: "Get Started",
          discover_transfer: "Discover, transfer, and claim your benefits anywhere in India.",
          problem_title: "The Problem",
          solution_title: "Our Solution",
          how_it_works: "How it Works",
          tech_stack: "Tech Stack",
          dashboard_title: "Your Welfare Comparison",
          home_state: "HOME STATE",
          current_state: "CURRENT STATE",
          search_placeholder: "Search schemes...",
          logout: "Logout",
          chat_placeholder: "Ask me anything...",
        }
      },
      hi: {
        translation: {
          hero: {
            title_part1: "अपने कल्याणकारी",
            title_part2: "लाभों को कहीं भी प्राप्त करें",
            subtext: "राज्यों में सरकारी योजनाओं को निर्बाध रूप से खोजें, स्थानांतरित करें और दावा करें।"
          },
          welcome: "हकदार में आपका स्वागत है",
          tagline: "कल्याणकारी लाभों तक निर्बाध पहुंच के साथ हर नागरिक को सशक्त बनाना।",
          get_started: "शुरू करें",
          discover_transfer: "भारत में कहीं भी अपने लाभों को खोजें, स्थानांतरित करें और दावा करें।",
          problem_title: "समस्या",
          solution_title: "हमारा समाधान",
          how_it_works: "यह कैसे काम करता है",
          tech_stack: "टेक स्टैक",
          dashboard_title: "आपका कल्याण तुलना",
          home_state: "गृह राज्य",
          current_state: "वर्तमान राज्य",
          search_placeholder: "योजनाएं खोजें...",
          logout: "लॉगआउट",
          chat_placeholder: "मुझसे कुछ भी पूछें...",
        }
      },
      mr: {
        translation: {
          hero: {
            title_part1: "तुमचे कल्याणकारी",
            title_part2: "फायदे कोठेही मिळवा",
            subtext: "राज्यांमध्ये सरकारी योजना अखंडपणे शोधा, हस्तांतरित करा आणि दावा करा।"
          },
          welcome: "हकदार मध्ये आपले स्वागत आहे",
          tagline: "कल्याणकारी लाभांपर्यंत अखंड प्रवेशासह प्रत्येक नागरिकाला सक्षम करणे।",
          get_started: "सुरू करा",
          discover_transfer: "भारतात कोठेही आपले फायदे शोधा, हस्तांतरित करा आणि दावा करा।",
          problem_title: "समस्या",
          solution_title: "आमचे समाधान",
          how_it_works: "हे कसे कार्य करते",
          tech_stack: "टेक स्टॅक",
          dashboard_title: "तुमची कल्याण तुलना",
          home_state: "गृह राज्य",
          current_state: "सध्याचे राज्य",
          search_placeholder: "योजना शोधा...",
          logout: "लॉगआउट",
          chat_placeholder: "मला काहीही विचारा...",
        }
      }
    }
  });

export default i18n;
