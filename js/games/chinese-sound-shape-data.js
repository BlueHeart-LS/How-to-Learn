const chineseQuestionBank = {
  elementary: {
    label: "國小",
    sound: [
      { prompt: "「立即」的「即」讀音是哪一個？", options: ["ㄐㄧˊ", "ㄐㄧˋ", "ㄑㄧˊ", "ㄑㄧˋ"], answer: 0, explanation: "「即」讀作 ㄐㄧˊ。" },
      { prompt: "「溫暖」的「暖」讀音是哪一個？", options: ["ㄋㄨㄢˇ", "ㄌㄨㄢˇ", "ㄋㄢˇ", "ㄌㄢˇ"], answer: 0, explanation: "「暖」讀作 ㄋㄨㄢˇ。" },
      { prompt: "「蜻蜓」的「蜻」讀音是哪一個？", options: ["ㄑㄧㄥ", "ㄐㄧㄥ", "ㄑㄧㄣ", "ㄐㄧㄣ"], answer: 0, explanation: "「蜻」讀作 ㄑㄧㄥ。" },
      { prompt: "「旅行」的「旅」讀音是哪一個？", options: ["ㄌㄩˇ", "ㄌㄧㄡˇ", "ㄌㄨˇ", "ㄌㄧㄡˋ"], answer: 0, explanation: "「旅」讀作 ㄌㄩˇ。" },
      { prompt: "「蝴蝶」的「蝶」讀音是哪一個？", options: ["ㄉㄧㄝˊ", "ㄊㄧㄝˊ", "ㄉㄧㄝˇ", "ㄊㄧㄝˇ"], answer: 0, explanation: "「蝶」讀作 ㄉㄧㄝˊ。" },
      { prompt: "「誠實」的「誠」讀音是哪一個？", options: ["ㄔㄥˊ", "ㄔㄣˊ", "ㄕㄥˊ", "ㄕㄣˊ"], answer: 0, explanation: "「誠」讀作 ㄔㄥˊ。" },
    ],
    shape: [
      { prompt: "他把房間打掃得很 ___。", options: ["潔", "結", "節", "捷"], answer: 0, explanation: "表示乾淨時，應寫作「潔」。" },
      { prompt: "大家一起 ___ 守交通規則。", options: ["遵", "尊", "樽", "鱒"], answer: 0, explanation: "應寫作「遵守」。" },
      { prompt: "我們要養成閱讀的好習 ___。", options: ["慣", "貫", "灌", "罐"], answer: 0, explanation: "應寫作「習慣」。" },
      { prompt: "媽媽提醒我要把作業仔細檢 ___。", options: ["查", "察", "插", "搽"], answer: 0, explanation: "應寫作「檢查」。" },
      { prompt: "這幅畫的顏色非常鮮 ___。", options: ["豔", "艷", "燕", "宴"], answer: 0, explanation: "此處選常用正體「豔」。" },
      { prompt: "他遇到困難時仍然很勇 ___。", options: ["敢", "趕", "感", "杆"], answer: 0, explanation: "應寫作「勇敢」。" },
    ],
  },
  junior: {
    label: "國中",
    sound: [
      { prompt: "「罄竹難書」的「罄」讀音是哪一個？", options: ["ㄑㄧㄥˋ", "ㄑㄧㄣˋ", "ㄐㄧㄥˋ", "ㄐㄧㄣˋ"], answer: 0, explanation: "「罄」讀作 ㄑㄧㄥˋ。" },
      { prompt: "「裨益」的「裨」讀音是哪一個？", options: ["ㄅㄧˋ", "ㄆㄧˊ", "ㄅㄟˋ", "ㄆㄟˊ"], answer: 0, explanation: "「裨益」的「裨」讀作 ㄅㄧˋ。" },
      { prompt: "「迥然不同」的「迥」讀音是哪一個？", options: ["ㄐㄩㄥˇ", "ㄐㄩㄥˋ", "ㄐㄧㄥˇ", "ㄐㄧㄥˋ"], answer: 0, explanation: "「迥」讀作 ㄐㄩㄥˇ。" },
      { prompt: "「脈絡」的「脈」讀音是哪一個？", options: ["ㄇㄞˋ", "ㄇㄛˋ", "ㄇㄞˇ", "ㄇㄛˇ"], answer: 0, explanation: "「脈絡」的「脈」讀作 ㄇㄞˋ。" },
      { prompt: "「倔強」的「倔」讀音是哪一個？", options: ["ㄐㄩㄝˊ", "ㄐㄩㄝˋ", "ㄑㄩㄝˊ", "ㄑㄩㄝˋ"], answer: 0, explanation: "「倔強」的「倔」讀作 ㄐㄩㄝˊ。" },
      { prompt: "「恬靜」的「恬」讀音是哪一個？", options: ["ㄊㄧㄢˊ", "ㄊㄧㄢˇ", "ㄉㄧㄢˊ", "ㄉㄧㄢˇ"], answer: 0, explanation: "「恬」讀作 ㄊㄧㄢˊ。" },
    ],
    shape: [
      { prompt: "做事應該按 ___ 就班，不能急躁。", options: ["部", "步", "布", "簿"], answer: 0, explanation: "成語為「按部就班」。" },
      { prompt: "他對這個議題有相當嚴 ___ 的分析。", options: ["謹", "僅", "槿", "錦"], answer: 0, explanation: "應寫作「嚴謹」。" },
      { prompt: "遇到困境仍然不屈不 ___，值得敬佩。", options: ["撓", "饒", "繞", "嬈"], answer: 0, explanation: "成語為「不屈不撓」。" },
      { prompt: "研究資料彼此呼應，脈 ___ 清楚。", options: ["絡", "洛", "酪", "烙"], answer: 0, explanation: "應寫作「脈絡」。" },
      { prompt: "他說話十分誠 ___，讓人願意相信。", options: ["懇", "墾", "肯", "恳"], answer: 0, explanation: "應寫作「誠懇」。" },
      { prompt: "這篇文章的觀點很新 ___。", options: ["穎", "影", "潁", "潁"], answer: 0, explanation: "應寫作「新穎」。" },
    ],
  },
  senior: {
    label: "高中",
    sound: [
      { prompt: "「剽竊」的「剽」讀音是哪一個？", options: ["ㄆㄧㄠˋ", "ㄆㄧㄠ", "ㄅㄧㄠˋ", "ㄅㄧㄠ"], answer: 0, explanation: "「剽」讀作 ㄆㄧㄠˋ。" },
      { prompt: "「齟齬」的「齟」讀音是哪一個？", options: ["ㄐㄩˇ", "ㄗㄨˇ", "ㄐㄩˋ", "ㄗㄨˋ"], answer: 0, explanation: "「齟」讀作 ㄐㄩˇ。" },
      { prompt: "「斡旋」的「斡」讀音是哪一個？", options: ["ㄨㄛˋ", "ㄨㄢˋ", "ㄏㄢˋ", "ㄏㄨㄢˋ"], answer: 0, explanation: "「斡」讀作 ㄨㄛˋ。" },
      { prompt: "「恣意」的「恣」讀音是哪一個？", options: ["ㄗˋ", "ㄘˋ", "ㄗˇ", "ㄘˇ"], answer: 0, explanation: "「恣」讀作 ㄗˋ。" },
      { prompt: "「狡黠」的「黠」讀音是哪一個？", options: ["ㄒㄧㄚˊ", "ㄐㄧㄝˊ", "ㄒㄧㄚˋ", "ㄐㄧㄝˋ"], answer: 0, explanation: "「黠」讀作 ㄒㄧㄚˊ。" },
      { prompt: "「掣肘」的「掣」讀音是哪一個？", options: ["ㄔㄜˋ", "ㄓˋ", "ㄔㄜˇ", "ㄓˇ"], answer: 0, explanation: "「掣」讀作 ㄔㄜˋ。" },
    ],
    shape: [
      { prompt: "他的發言振聾發 ___，讓大家重新思考。", options: ["聵", "饋", "潰", "匱"], answer: 0, explanation: "成語為「振聾發聵」。" },
      { prompt: "與前作相比，這次成果相形見 ___。", options: ["絀", "拙", "黜", "茁"], answer: 0, explanation: "成語為「相形見絀」。" },
      { prompt: "這份報告內容周延而縝 ___。", options: ["密", "蜜", "秘", "泌"], answer: 0, explanation: "應寫作「縝密」。" },
      { prompt: "政策調整牽涉層面甚廣，不可掉以輕 ___。", options: ["心", "新", "薪", "辛"], answer: 0, explanation: "成語為「掉以輕心」。" },
      { prompt: "他的說法前後矛盾，令人難以信 ___。", options: ["服", "伏", "扶", "符"], answer: 0, explanation: "應寫作「信服」。" },
      { prompt: "面對證據，他仍一再狡 ___。", options: ["辯", "辨", "辮", "瓣"], answer: 0, explanation: "應寫作「狡辯」。" },
    ],
  },
};
