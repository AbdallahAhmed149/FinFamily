// محتوى الدروس (10 دروس) — ثنائي اللغة. كل درس: 4 كروت قصة + بنك 8 أسئلة (الكويز بياخد 5 عشوائي كل مرة).
//
// الحقائق المصرية (ميزة، إنستاباي، تحذيرات البنك المركزي، حسابات القُصّر) متراجعة بالبحث — المصادر في
// LESSONS_REVIEW.md. الأسعار من قايمة الأسعار اللي الفريق جاب (أكتوبر 2026) — لو الأسعار اتغيرت عدّلها هنا.
//
// الشكل: كارت  = c(emoji, mood, en, ar)        mood: happy | think | sad
//        سؤال  = q(en, ar, [[en,ar], ...], إندكس_الصح, why_en, why_ar)

export const QUIZ_SIZE = 5;     // لازم يساوي QUESTIONS_PER_QUIZ في backend/services/lessons.py
export const PASS_RATIO = 0.6;  // لازم يساوي PASS_RATIO هناك

const c = (emoji, mood, en, ar) => ({ emoji, mood, text: { en, ar } });
const q = (en, ar, opts, answer, whyEn, whyAr) => ({
  q: { en, ar },
  options: opts.map(([e, a]) => ({ en: e, ar: a })),
  answer,
  why: { en: whyEn, ar: whyAr },
});

export const LESSONS = [
  // ───────────────────────── l1 ─────────────────────────
  {
    id: "l1", icon: "coins", color: "#FFC857", xp: 100,
    title: { en: "Money Basics", ar: "أساسيات الفلوس" },
    desc: { en: "What is money and why do we use it?", ar: "يعني إيه فلوس وبنستخدمها ليه؟" },
    cards: [
      c("💰", "happy", "Money is something everyone agrees has value. We swap it for the things we need and the things we want.", "الفلوس حاجة كلنا متفقين إن ليها قيمة. بنبدّلها بالحاجات اللي محتاجينها واللي نفسنا فيها."),
      c("🔄", "think", "Long ago people swapped things directly: a farmer gave wheat for a pair of shoes. That's called barter. But what if the shoemaker didn't want wheat? Money fixes that problem!", "زمان الناس كانت بتبدّل حاجة بحاجة: الفلاح يدّي قمح ويخد جزمة. ده اسمه مقايضة. بس لو صانع الجزم مش عايز قمح؟ الفلوس حلّت المشكلة دي!"),
      c("🪙", "happy", "In Egypt we use the Egyptian pound (EGP). One pound is 100 piastres. A foul and ta'meya sandwich costs around 12 pounds.", "في مصر بنستخدم الجنيه المصري. الجنيه الواحد = 100 قرش. ساندوتش الفول والطعمية سعره حوالي 12 جنيه."),
      c("🧠", "happy", "Money has three jobs: you spend it, you save it for later, and it shows how much things are worth. Grown-ups earn money by working. Kids can earn by helping at home!", "الفلوس ليها 3 شغلانات: تصرفها، وتحوّشها لبعدين، وتعرّفك الحاجات قيمتها كام. الكبار بيكسبوا من الشغل، والأطفال ممكن يكسبوا من مساعدة البيت!"),
    ],
    quiz: [
      q("What is \"barter\"?", "يعني إيه \"مقايضة\"؟", [["Swapping things without using money", "إنك تبدّل حاجة بحاجة من غير فلوس"], ["Paying with a card", "إنك تدفع بكارت"], ["Saving money in a bank", "إنك تحوّش فلوس في البنك"], ["Borrowing money", "إنك تستلف فلوس"]], 0, "Barter means trading things directly, with no money.", "المقايضة يعني تبادل حاجة بحاجة مباشرة من غير فلوس."),
      q("Why was barter often difficult?", "ليه المقايضة كانت صعبة غالبًا؟", [["You needed someone who wanted exactly what you had", "كنت محتاج حد عايز بالظبط اللي معاك"], ["There were no shops", "مكانش فيه محلات"], ["Everything was free", "كل حاجة كانت ببلاش"], ["People didn't like swapping", "الناس مكانتش بتحب التبديل"]], 0, "Money solves this: everyone accepts it.", "الفلوس حلّت المشكلة دي لأن الكل بيقبلها."),
      q("How many piastres are in 1 Egyptian pound?", "الجنيه الواحد فيه كام قرش؟", [["10", "10"], ["50", "50"], ["100", "100"], ["1000", "1000"]], 2, "1 pound = 100 piastres.", "الجنيه = 100 قرش."),
      q("A foul and ta'meya sandwich costs 12 EGP. You pay with 20 EGP. How much change do you get?", "ساندوتش فول وطعمية بـ 12 جنيه. دفعت 20 جنيه. هتاخد باقي كام؟", [["12", "12"], ["8", "8"], ["32", "32"], ["6", "6"]], 1, "20 − 12 = 8.", "20 − 12 = 8."),
      q("Which one is NOT true about money?", "أي جملة من دول مش صح عن الفلوس؟", [["Money can be spent", "الفلوس ممكن تتصرف"], ["Money can be saved", "الفلوس ممكن تتحوّش"], ["Money grows by itself in your pocket", "الفلوس بتكبر لوحدها في جيبك"], ["Money shows how much things are worth", "الفلوس بتبيّن قيمة الحاجات"]], 2, "Money in a pocket doesn't grow. We'll learn how it can grow later!", "الفلوس في الجيب مش بتكبر. هنتعلم بعدين إزاي ممكن تكبر!"),
      q("Which is a good way for a kid to earn money?", "إيه طريقة كويسة إن الطفل يكسب بيها فلوس؟", [["Doing chores your parents agree to pay for", "يعمل مهام في البيت وأهله متفقين يدفعوله عليها"], ["Taking some from a friend's bag", "ياخد من شنطة صاحبه"], ["Waiting for money to appear", "يستنى الفلوس تظهر"], ["Asking strangers online", "يطلب من ناس غريبة على النت"]], 0, "Earning through honest work is the right way.", "الكسب بالشغل الشريف هو الطريقة الصح."),
      q("You have 50 EGP. A book costs 60 EGP. What's the smart move?", "معاك 50 جنيه والكتاب بـ 60 جنيه. إيه التصرف الذكي؟", [["Save a bit more until you have 60", "تحوّش شوية كمان لحد ما يبقى معاك 60"], ["Take 10 from someone", "تاخد 10 من حد"], ["Pretend you have enough", "تتظاهر إن معاك كفاية"], ["Never buy anything again", "ماتشتريش أي حاجة تاني"]], 0, "Waiting and saving a little more solves it.", "الصبر وتحويش شوية كمان بيحلّوها."),
      q("An ice cream costs 15 EGP. How much do 2 cost?", "الآيس كريم بـ 15 جنيه. اتنين بكام؟", [["25", "25"], ["30", "30"], ["35", "35"], ["20", "20"]], 1, "15 × 2 = 30.", "15 × 2 = 30."),
    ],
  },

  // ───────────────────────── l2 ─────────────────────────
  {
    id: "l2", icon: "scale", color: "#00B894", xp: 120,
    title: { en: "Needs vs Wants", ar: "احتياجات ورغبات" },
    desc: { en: "Learn the difference between needs and wants.", ar: "اتعلّم الفرق بين اللي محتاجه واللي نفسك فيه." },
    cards: [
      c("🍞", "happy", "Needs are things you must have to live and learn: food, water, clothes, a school bag. Wants are nice extras: toys, sweets, video games.", "الاحتياجات هي اللي لازم تكون عندك عشان تعيش وتتعلّم: أكل، مياه، هدوم، شنطة مدرسة. الرغبات حاجات حلوة زيادة: ألعاب، حلويات، فيديو جيم."),
      c("🤔", "think", "Some things are a bit of both! A notebook is a need (about 15 EGP). A fancy notebook for 80 EGP? The notebook is the need, the fancy cover is the want.", "في حاجات بتبقى الاتنين شوية! الكراسة احتياج (حوالي 15 جنيه). كراسة مزخرفة بـ 80 جنيه؟ الكراسة هي الاحتياج، والزخرفة هي الرغبة."),
      c("✅", "happy", "Rule: cover your needs first, then your wants. When money is limited, ask yourself: \"Do I need it, or do I just want it?\"", "القاعدة: غطّي احتياجاتك الأول وبعدين رغباتك. لما الفلوس تبقى قليلة اسأل نفسك: \"أنا محتاجه ولا نفسي فيه بس؟\""),
      c("⏳", "happy", "Wants aren't bad! You can save up for them. A plastic ball costs about 40 EGP. Save 10 EGP a week and you'll have it in 4 weeks, bought with your own saving!", "الرغبات مش وحشة! ممكن تحوّش عشانها. الكورة البلاستيك بحوالي 40 جنيه. لو حوّشت 10 جنيه في الأسبوع هتجيبها بعد 4 أسابيع من تحويشتك!"),
    ],
    quiz: [
      q("Which one is a NEED?", "أي واحدة من دول احتياج؟", [["Drinking water", "مياه للشرب"], ["Chips", "شيبسي"], ["A new video game", "فيديو جيم جديد"], ["Cinema ticket", "تذكرة سينما"]], 0, "Water is necessary to live.", "المياه ضرورية للحياة."),
      q("Which one is a WANT?", "أي واحدة من دول رغبة؟", [["A school bag for school", "شنطة مدرسة للمدرسة"], ["Lunch", "غدا"], ["A cinema ticket (about 100 EGP)", "تذكرة سينما (حوالي 100 جنيه)"], ["Warm clothes in winter", "هدوم تقيلة في الشتا"]], 2, "A movie is fun but you can live and learn without it.", "الفيلم ممتع بس تقدر تعيش وتتعلّم من غيره."),
      q("You have 100 EGP. What should you buy FIRST?", "معاك 100 جنيه. تشتري إيه الأول؟", [["A notebook you need for school", "كراسة محتاجها للمدرسة"], ["Game credit", "رصيد لعبة"], ["Candy", "حلويات"], ["A toy", "لعبة"]], 0, "Needs first, then wants.", "الاحتياجات الأول وبعدين الرغبات."),
      q("A plastic ball costs 40 EGP and you save 10 EGP a week. How many weeks until you can buy it?", "كورة بلاستيك بـ 40 جنيه وبتحوّش 10 جنيه في الأسبوع. بعد كام أسبوع تقدر تشتريها؟", [["2", "2"], ["4", "4"], ["5", "5"], ["10", "10"]], 1, "40 ÷ 10 = 4 weeks.", "40 ÷ 10 = 4 أسابيع."),
      q("Are wants always bad?", "هل الرغبات دايمًا وحشة؟", [["No, we can enjoy them after covering our needs", "لأ، نقدر نستمتع بيها بعد ما نغطّي احتياجاتنا"], ["Yes, never buy them", "أيوه، ماتشتريهاش أبدًا"], ["Only for kids", "للأطفال بس"], ["Only on weekends", "في الإجازة بس"]], 0, "Wants are fine when planned and affordable.", "الرغبات مفيهاش مشكلة لو متخطط ليها وفي حدود إمكانياتك."),
      q("Your friend says: \"Buy the expensive one, everyone has it!\" What's smartest?", "صاحبك بيقول: \"اشتري الغالي، الكل عنده!\" إيه الأذكى؟", [["Check if you need it and if you can afford it", "تشوف محتاجه ولا لأ وتقدر تدفع ثمنه ولا لأ"], ["Buy it right away", "تشتريه فورًا"], ["Borrow money to buy it", "تستلف عشان تشتريه"], ["Hide it from your parents", "تخبّيه عن أهلك"]], 0, "Your decision should be based on need and budget, not pressure.", "قرارك يبقى على أساس احتياجك وميزانيتك، مش ضغط الناس."),
      q("Which pair is correct?", "أي زوج من دول صح؟", [["Lunch = need, game credit = want", "الغدا = احتياج، رصيد اللعبة = رغبة"], ["Lunch = want, game credit = need", "الغدا = رغبة، رصيد اللعبة = احتياج"], ["Both are needs", "الاتنين احتياج"], ["Both are wants", "الاتنين رغبة"]], 0, "Food keeps you healthy; game credit is extra fun.", "الأكل بيحافظ على صحتك، ورصيد اللعبة متعة زيادة."),
      q("A notebook costs 15 EGP and a fancy one costs 80 EGP. How much extra is the \"want\" part?", "كراسة بـ 15 جنيه وكراسة مزخرفة بـ 80 جنيه. الزيادة (جزء الرغبة) كام؟", [["95", "95"], ["65", "65"], ["15", "15"], ["80", "80"]], 1, "80 − 15 = 65 EGP just for the fancy cover.", "80 − 15 = 65 جنيه بس عشان الزخرفة."),
    ],
  },

  // ───────────────────────── l3 ─────────────────────────
  {
    id: "l3", icon: "pie-chart", color: "#0F2D52", xp: 150,
    title: { en: "Budgeting", ar: "الميزانية" },
    desc: { en: "How to plan your spending.", ar: "إزاي تخطّط لمصروفك." },
    cards: [
      c("📋", "happy", "A budget is a plan for your money made BEFORE you spend it. It helps you know where your money is going.", "الميزانية خطة لفلوسك بتعملها قبل ما تصرف. بتساعدك تعرف فلوسك رايحة فين."),
      c("🫙", "think", "A simple plan: Spend, Save, Share. If you get 100 EGP: 50 to spend, 40 to save, and 10 to share with others, like helping someone or giving sadaqa.", "خطة بسيطة: اصرف، حوّش، وشارك. لو جالك 100 جنيه: 50 للصرف، 40 للتحويش، و10 تشارك بيهم غيرك زي مساعدة حد أو صدقة."),
      c("✍️", "happy", "Write down what you spend. Chips 8, juice 15, notebook 15. Small things add up fast! Writing it down shows you where your money really goes.", "اكتب اللي بتصرفه. شيبسي 8، عصير 15، كراسة 15. الحاجات الصغيرة بتتجمّع بسرعة! الكتابة بتوريك فلوسك بتروح فين بجد."),
      c("🔄", "happy", "A budget can change. If you spent more than planned this week, spend a bit less next week. Mistakes are how we learn. Just try again!", "الميزانية ممكن تتغيّر. لو صرفت أكتر من المخطط الأسبوع ده، اصرف أقل شوية الأسبوع الجاي. الغلط بنتعلّم منه. جرّب تاني!"),
    ],
    quiz: [
      q("What is a budget?", "يعني إيه ميزانية؟", [["A plan for your money made before spending", "خطة لفلوسك بتعملها قبل ما تصرف"], ["A list of things you already bought", "قايمة بحاجات اشتريتها"], ["A type of bank card", "نوع من كروت البنك"], ["A game", "لعبة"]], 0, "Planning first is the whole idea.", "التخطيط الأول هو الفكرة كلها."),
      q("In \"Spend, Save, Share\", you get 100 EGP and save 40. How much is left to spend and share?", "في \"اصرف، حوّش، شارك\" جالك 100 جنيه وحوّشت 40. فاضل كام للصرف والمشاركة؟", [["40", "40"], ["50", "50"], ["60", "60"], ["70", "70"]], 2, "100 − 40 = 60.", "100 − 40 = 60."),
      q("Chips 8 + juice 15 + notebook 15. What's the total?", "شيبسي 8 + عصير 15 + كراسة 15. المجموع كام؟", [["28", "28"], ["38", "38"], ["48", "48"], ["33", "33"]], 1, "8 + 15 + 15 = 38.", "8 + 15 + 15 = 38."),
      q("Why write down what you spend?", "ليه نكتب اللي بنصرفه؟", [["To see where your money really goes", "عشان نشوف فلوسنا بتروح فين فعلًا"], ["To impress friends", "عشان نبهر صحابنا"], ["It makes money appear", "عشان الفلوس تظهر"], ["It's not useful", "مش مفيد"]], 0, "Small spending adds up. Writing it down makes it visible.", "الصرف الصغير بيتجمّع. الكتابة بتخليه واضح."),
      q("You planned to spend 30 EGP this week but spent 45. What's a smart next step?", "كنت مخطط تصرف 30 جنيه الأسبوع ده وصرفت 45. إيه الخطوة الذكية؟", [["Spend a bit less next week and learn from it", "تصرف أقل شوية الأسبوع الجاي وتتعلّم من ده"], ["Give up on budgets", "تبطّل تعمل ميزانيات"], ["Hide the receipts", "تخبّي الإيصالات"], ["Borrow to cover it", "تستلف عشان تغطّي"]], 0, "Budgets can be adjusted; learning is the goal.", "الميزانية ممكن تتعدّل، والتعلّم هو الهدف."),
      q("Your weekly allowance is 100 EGP. You save 40 every week. How much do you save in 5 weeks?", "مصروفك الأسبوعي 100 جنيه وبتحوّش 40 كل أسبوع. هتحوّش كام في 5 أسابيع؟", [["150", "150"], ["200", "200"], ["250", "250"], ["400", "400"]], 1, "40 × 5 = 200.", "40 × 5 = 200."),
      q("What does \"Share\" mean in Spend, Save, Share?", "يعني إيه \"شارك\" في اصرف، حوّش، شارك؟", [["Give a small part to help others", "تدّي جزء صغير تساعد بيه غيرك"], ["Share your PIN with a friend", "تقول الرقم السري لصاحبك"], ["Split a toy in half", "تقسم لعبة نصين"], ["Tell friends your budget", "تقول لصحابك ميزانيتك"]], 0, "Sharing a little with others (like sadaqa) builds kindness.", "مشاركة جزء صغير مع الناس (زي الصدقة) بتنمّي الخير."),
      q("Which is the BEST first step in making a budget?", "إيه أفضل خطوة أولى لعمل ميزانية؟", [["Know how much money you have coming in", "تعرف معاك أد إيه فلوس داخلة"], ["Spend everything quickly", "تصرف كل حاجة بسرعة"], ["Ask a friend to choose", "تخلّي صاحبك يختار"], ["Buy something big", "تشتري حاجة كبيرة"]], 0, "You can't plan without knowing how much you have.", "مش هتعرف تخطّط من غير ما تعرف معاك كام."),
    ],
  },

  // ───────────────────────── l4 ─────────────────────────
  {
    id: "l4", icon: "piggy-bank", color: "#8b5cf6", xp: 150,
    title: { en: "Saving", ar: "التحويش" },
    desc: { en: "Why saving builds your future.", ar: "ليه التحويش بيبني مستقبلك." },
    cards: [
      c("🐷", "happy", "Saving means keeping some money for later instead of spending it all now. It helps you reach your goals and handle surprises.", "التحويش يعني تحتفظ بجزء من فلوسك لبعدين بدل ما تصرفها كلها دلوقتي. بيساعدك توصل لأهدافك وتتصرف في المفاجآت."),
      c("🎯", "think", "Pick a goal! A kids' book costs about 60 EGP. Save 15 EGP each week and you'll have it in 4 weeks. A clear goal makes saving easier.", "اختار هدف! كتاب الأطفال بحوالي 60 جنيه. لو حوّشت 15 جنيه كل أسبوع هتجيبه بعد 4 أسابيع. الهدف الواضح بيخلّي التحويش أسهل."),
      c("🥇", "happy", "Pay yourself first: when money comes in, put your saving aside right away, then spend what's left. Don't wait to see what's left over, because often nothing is!", "ادفع لنفسك الأول: أول ما تيجي فلوس، اعزل التحويش على طول وبعدين اصرف الباقي. ماتستناش تشوف إيه اللي فضل، لإن غالبًا مفيش حاجة هتفضل!"),
      c("🏦", "happy", "Keep your savings in a safe place: a piggy bank at home, or a bank account with your parents. Money kept safe is harder to spend by accident.", "خلّي تحويشتك في مكان آمن: حصّالة في البيت، أو حساب في البنك مع أهلك. الفلوس في مكان آمن أصعب إنك تصرفها بالغلط."),
    ],
    quiz: [
      q("What does saving mean?", "التحويش معناه إيه؟", [["Keeping some money for later", "إنك تحتفظ بجزء من الفلوس لبعدين"], ["Spending everything today", "إنك تصرف كل حاجة النهارده"], ["Giving all your money away", "إنك تدّي فلوسك كلها لحد"], ["Hiding money from your family", "إنك تخبّي فلوس عن أهلك"]], 0, "Saving = keeping some for later.", "التحويش = تحتفظ بجزء لبعدين."),
      q("A kids' book costs 60 EGP. You save 15 EGP a week. How many weeks to buy it?", "كتاب أطفال بـ 60 جنيه وبتحوّش 15 جنيه في الأسبوع. بعد كام أسبوع تشتريه؟", [["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"]], 1, "60 ÷ 15 = 4.", "60 ÷ 15 = 4."),
      q("What does \"pay yourself first\" mean?", "يعني إيه \"ادفع لنفسك الأول\"؟", [["Put your saving aside before spending", "تعزل تحويشتك قبل ما تصرف"], ["Buy a treat for yourself first", "تشتري حاجة لنفسك الأول"], ["Pay for your friends", "تدفع لصحابك"], ["Spend first, save if anything is left", "تصرف الأول وتحوّش لو فضل حاجة"]], 0, "Saving first makes sure it actually happens.", "التحويش الأول بيضمن إنه يحصل فعلًا."),
      q("Why is having a savings goal helpful?", "ليه وجود هدف للتحويش مفيد؟", [["It keeps you motivated", "بيخليك متحمس"], ["It makes things cost less", "بيخلّي الحاجات أرخص"], ["It's required by law", "القانون بيطلبه"], ["It isn't helpful", "مش مفيد"]], 0, "A clear goal helps you stay on track.", "الهدف الواضح بيساعدك تكمّل."),
      q("Where is a safe place to keep savings?", "فين مكان آمن تحتفظ فيه بتحويشتك؟", [["A piggy bank or a bank account with your parents", "حصّالة أو حساب في البنك مع أهلك"], ["Loose in your school bag", "سايبة في شنطة المدرسة"], ["With a stranger", "مع شخص غريب"], ["On a public bench", "على كرسي في الشارع"]], 0, "Safe places keep your money from getting lost or spent by accident.", "الأماكن الآمنة بتحمي فلوسك من الضياع أو الصرف بالغلط."),
      q("You get 100 EGP and plan to save 30. What's the best way?", "جالك 100 جنيه وناوي تحوّش 30. إيه أحسن طريقة؟", [["Put 30 aside right away, then spend the rest", "تعزل الـ 30 على طول وبعدين تصرف الباقي"], ["Spend first and hope 30 is left", "تصرف الأول وتتمنّى يفضل 30"], ["Give 30 to a friend", "تدّي الـ 30 لصاحبك"], ["Forget about it", "تنسى الموضوع"]], 0, "Pay yourself first.", "ادفع لنفسك الأول."),
      q("You saved 45 EGP and need 60 for your goal. How much more do you need?", "حوّشت 45 جنيه ومحتاج 60 لهدفك. فاضل كام؟", [["10", "10"], ["15", "15"], ["20", "20"], ["25", "25"]], 1, "60 − 45 = 15.", "60 − 45 = 15."),
      q("You're tempted to spend your savings on something you suddenly saw. Smart move?", "نفسك تصرف تحويشتك على حاجة لسه شايفها. التصرف الذكي؟", [["Wait a day and think again", "تستنى يوم وتفكّر تاني"], ["Spend it right now", "تصرفها حالًا"], ["Borrow more to buy it too", "تستلف عشان تشتريها كمان"], ["Ignore your goal", "تتجاهل هدفك"]], 0, "Waiting a day often shows it's just a quick urge.", "الاستنى يوم غالبًا بيكشف إنها رغبة سريعة."),
    ],
  },

  // ───────────────────────── l5 ─────────────────────────
  {
    id: "l5", icon: "smartphone", color: "#3b82f6", xp: 130,
    title: { en: "Digital Payments", ar: "الدفع الإلكتروني" },
    desc: { en: "Pay safely with your phone.", ar: "ادفع بأمان بموبايلك." },
    cards: [
      c("📱", "happy", "Money can be digital too: bank apps, mobile wallets, cards and QR codes. Digital money is still real money, not play money!", "الفلوس ممكن تبقى رقمية كمان: تطبيقات البنوك، المحافظ الإلكترونية، الكروت، وأكواد الـ QR. الفلوس الرقمية فلوس حقيقية، مش فلوس لعب!"),
      c("⚡", "think", "InstaPay is an app launched by Egypt's Central Bank in 2022. It sends money between bank accounts instantly, any time of day or night.", "إنستاباي تطبيق أطلقه البنك المركزي المصري سنة 2022. بيحوّل فلوس بين الحسابات البنكية فورًا، في أي وقت ليل أو نهار."),
      c("⚠️", "think", "Fast has a catch: when an instant transfer goes through, it can't be cancelled. So always double-check the name and number before you send.", "السرعة ليها ثمن: التحويل الفوري لما يتم مبيتلغيش. عشان كده راجع الاسم والرقم كويس قبل ما تبعت."),
      c("🔐", "happy", "Your PIN and the OTP code sent to your phone are secrets. Never tell anyone, not even a friend. Kids should use digital payments only together with a parent.", "الرقم السري (PIN) وكود الـ OTP اللي بيجيلك على الموبايل أسرار. ماتقولهمش لأي حد، حتى صاحبك. الأطفال يستخدموا الدفع الإلكتروني مع واحد من أهلهم بس."),
    ],
    quiz: [
      q("Digital money is…", "الفلوس الرقمية…", [["Still real money", "فلوس حقيقية برضه"], ["Play money", "فلوس لعب"], ["Free", "ببلاش"], ["Only for adults' toys", "لألعاب الكبار بس"]], 0, "Digital doesn't mean pretend. Treat it carefully.", "رقمية مش معناها وهمية. اتعامل معاها بحرص."),
      q("What is InstaPay?", "إيه هو إنستاباي؟", [["An app for instant transfers launched by Egypt's Central Bank", "تطبيق لتحويل الفلوس فورًا أطلقه البنك المركزي المصري"], ["A video game", "لعبة فيديو"], ["A school subject", "مادة دراسية"], ["A kind of coin", "نوع عملة معدنية"]], 0, "InstaPay launched in 2022 for instant 24/7 transfers.", "إنستاباي بدأ سنة 2022 للتحويل الفوري على مدار الساعة."),
      q("You sent money to the wrong number by mistake. Why is that a big problem?", "بعتّ فلوس لرقم غلط بالغلط. ليه دي مشكلة كبيرة؟", [["Instant transfers usually can't be cancelled once done", "التحويل الفوري غالبًا مبيتلغيش بعد ما يتم"], ["The phone breaks", "الموبايل بيبوظ"], ["The money comes back double", "الفلوس بترجع الضعف"], ["Nothing happens", "مفيش حاجة بتحصل"]], 0, "So check the name and number first!", "عشان كده راجع الاسم والرقم الأول!"),
      q("Someone asks for the OTP code sent to your phone. What do you do?", "حد طلب منك كود الـ OTP اللي جالك على الموبايل. تعمل إيه؟", [["Never share it, and tell a parent", "ماتقولوش لحد وتقول لأهلك"], ["Tell them quickly", "تقوله بسرعة"], ["Post it online", "تنشره على النت"], ["Share it only with friends", "تقوله لصحابك بس"]], 0, "OTP and PIN are secrets, always.", "الـ OTP والـ PIN أسرار دايمًا."),
      q("Which is NOT a digital way to pay?", "أي واحدة من دول مش طريقة دفع رقمية؟", [["Mobile wallet", "محفظة إلكترونية"], ["QR code", "كود QR"], ["Bank card", "كارت بنكي"], ["Paying with coins from your pocket", "الدفع بعملات معدنية من جيبك"]], 3, "Coins are physical cash.", "العملات المعدنية فلوس نقدية فعلية."),
      q("Before sending money, what should you double-check?", "قبل ما تبعت فلوس، تراجع إيه؟", [["The name, number and amount", "الاسم والرقم والمبلغ"], ["The colour of the app", "لون التطبيق"], ["The time on your watch", "الوقت في ساعتك"], ["Nothing, just send", "مفيش، ابعت وخلاص"]], 0, "Mistakes are hard to undo.", "الأخطاء صعب تتصلح."),
      q("Who should help a child use a payment app?", "مين المفروض يساعد الطفل يستخدم تطبيق الدفع؟", [["A parent or guardian", "واحد من الأهل"], ["Any stranger online", "أي شخص غريب على النت"], ["Nobody, kids should try alone", "محدش، الطفل يجرّب لوحده"], ["A friend who knows apps", "صاحب فاهم في التطبيقات"]], 0, "Payments involve real money, so grown-ups should be involved.", "الدفع فيه فلوس حقيقية فلازم الكبار يكونوا معاك."),
      q("An app shows \"Payment successful\". Is the shop paid?", "التطبيق بيقول \"تمت العملية بنجاح\". هل المحل خد فلوسه؟", [["Yes, that's the confirmation", "أيوه، دي هي التأكيد"], ["No, never", "لأ، أبدًا"], ["Only if you shake the phone", "لو هزّيت الموبايل بس"], ["Only after a week", "بعد أسبوع بس"]], 0, "The confirmation shows the payment went through.", "رسالة التأكيد بتبيّن إن الدفع تم."),
    ],
  },

  // ───────────────────────── l6 ─────────────────────────
  {
    id: "l6", icon: "credit-card", color: "#00B894", xp: 140,
    title: { en: "Meeza Cards", ar: "كروت ميزة" },
    desc: { en: "Your first bank card explained.", ar: "أول كارت بنكي ليك واتشرح." },
    cards: [
      c("💳", "happy", "Meeza is Egypt's national payment system, supervised by the Central Bank of Egypt. Meeza cards work at ATMs, in shops and for online payments inside Egypt.", "ميزة هي نظام الدفع الوطني في مصر وتحت إشراف البنك المركزي المصري. كروت ميزة بتشتغل في ماكينات الـ ATM وفي المحلات وللدفع الإلكتروني جوه مصر."),
      c("🔀", "think", "There are two main kinds: a debit card is linked to a bank account. A prepaid card is loaded with money first, so you can only spend what's on it.", "فيه نوعين أساسيين: كارت الخصم (Debit) مربوط بحساب بنكي. والكارت المدفوع مقدمًا (Prepaid) بتشحنه بفلوس الأول، فمتقدرش تصرف أكتر من اللي عليه."),
      c("👨‍👧", "happy", "Some banks, like Banque du Caire, offer prepaid Meeza cards that parents can get for kids aged 10 and older, so kids can practise using money with a limit.", "بعض البنوك، زي بنك القاهرة، بتقدّم كروت ميزة مدفوعة مقدمًا ممكن الأهل يطلعوها للأطفال من سن 10 سنين، عشان الطفل يتدرّب على استخدام الفلوس في حدود معينة."),
      c("🛡️", "think", "Lost your card? Tell a parent right away so the card can be blocked and replaced. Keep your PIN secret and cover the keypad while you type it.", "ضاع الكارت؟ قول لأهلك فورًا عشان يتوقف ويتغيّر بغيره. خلّي الرقم السري (PIN) سر وغطّي لوحة الأرقام وإنت بتكتبه."),
    ],
    quiz: [
      q("What is Meeza?", "إيه هي ميزة؟", [["Egypt's national payment system", "نظام الدفع الوطني في مصر"], ["A kind of sandwich", "نوع ساندوتش"], ["A video game", "لعبة فيديو"], ["A school in Cairo", "مدرسة في القاهرة"]], 0, "Meeza is supervised by the Central Bank of Egypt.", "ميزة تحت إشراف البنك المركزي المصري."),
      q("A prepaid card is…", "الكارت المدفوع مقدمًا (Prepaid)…", [["Loaded with money first; you spend only what's on it", "بتشحنه بفلوس الأول وبتصرف اللي عليه بس"], ["Linked to unlimited money", "مربوط بفلوس مالهاش حد"], ["A paper coupon", "كوبون ورق"], ["Only for adults", "للكبار بس"]], 0, "That limit helps kids learn.", "الحد ده بيساعد الأطفال يتعلموا."),
      q("A debit card is linked to…", "كارت الخصم (Debit) مربوط بـ…", [["A bank account", "حساب بنكي"], ["A game account", "حساب لعبة"], ["A phone number only", "رقم موبايل بس"], ["Nothing", "ولا حاجة"]], 0, "It takes money directly from your account.", "بيسحب الفلوس مباشرة من حسابك."),
      q("Where do Meeza cards work?", "فين بتشتغل كروت ميزة؟", [["ATMs, shops and online inside Egypt", "ماكينات ATM والمحلات والإنترنت جوه مصر"], ["Only in space", "في الفضاء بس"], ["Only at school", "في المدرسة بس"], ["Nowhere", "في أي مكان لأ"]], 0, "Meeza is Egypt's national scheme.", "ميزة هي النظام الوطني لمصر."),
      q("You lose your card. What should you do first?", "ضاع منك الكارت. تعمل إيه الأول؟", [["Tell a parent right away so it gets blocked", "تقول لأهلك فورًا عشان يتوقف"], ["Wait a month", "تستنى شهر"], ["Tell your friends the PIN", "تقول الـ PIN لصحابك"], ["Ignore it", "تتجاهل الموضوع"]], 0, "Blocking quickly protects the money.", "إيقاف الكارت بسرعة بيحمي الفلوس."),
      q("How should you type your PIN at an ATM?", "إزاي تكتب الـ PIN عند الـ ATM؟", [["Cover the keypad with your hand", "تغطّي لوحة الأرقام بإيدك"], ["Say it out loud", "تقوله بصوت عالي"], ["Let a stranger help", "تخلّي واحد غريب يساعدك"], ["Write it on the card", "تكتبه على الكارت"]], 0, "Nobody should see your PIN.", "محدش المفروض يشوف الـ PIN."),
      q("Why might a prepaid card be good for a child?", "ليه الكارت المدفوع مقدمًا ممكن يكون كويس للطفل؟", [["He can only spend what's loaded", "مش هيصرف أكتر من اللي اتشحن"], ["It has no PIN", "مفيهوش PIN"], ["It never runs out", "عمره ما بيخلص"], ["It's free money", "فلوس ببلاش"]], 0, "A built-in limit teaches budgeting.", "الحد الموجود جواه بيعلّم الميزانية."),
      q("Your friend asks to borrow your card and PIN \"just once\". Smart answer?", "صاحبك طلب كارتك والـ PIN \"مرة واحدة بس\". الإجابة الذكية؟", [["No. Card and PIN are private", "لأ. الكارت والـ PIN خاصين بيك"], ["Yes, he's my friend", "أيوه، ده صاحبي"], ["Yes, if he promises", "أيوه لو وعد"], ["Give the PIN but not the card", "أديله الـ PIN من غير الكارت"]], 0, "Never share them, even with friends.", "ماتشاركهمش حتى مع صحابك."),
    ],
  },

  // ───────────────────────── l7 ─────────────────────────
  {
    id: "l7", icon: "shield", color: "#ef4444", xp: 160,
    title: { en: "Cybersecurity", ar: "الأمان على الإنترنت" },
    desc: { en: "Stay safe online.", ar: "خليك آمن على النت." },
    cards: [
      c("🔑", "happy", "A strong password is long and mixes letters, numbers and symbols. \"ilovefootball\" is weak. \"Fb!7Goal#Nile9\" is much stronger.", "الباسورد القوي طويل وفيه حروف وأرقام ورموز. \"ilovefootball\" ضعيف. \"Fb!7Goal#Nile9\" أقوى بكتير."),
      c("🤫", "think", "Passwords are secrets. Share them only with your parents. Use a different password for each app, so one leak doesn't open everything.", "الباسوردات أسرار. شاركها مع أهلك بس. استخدم باسورد مختلف لكل تطبيق، عشان لو واحد اتسرّب مايفتحش كل حاجة."),
      c("🔗", "think", "Don't tap links or download apps from messages you didn't expect, even if they look fun. Get apps only from the official app store, and ask a parent first.", "ماتضغطش على لينكات ولا تنزّل تطبيقات من رسايل مكنتش مستنيها، حتى لو شكلها حلو. نزّل التطبيقات من المتجر الرسمي بس، واسأل أهلك الأول."),
      c("🧑‍🤝‍🧑", "happy", "People online aren't always who they say. Never share your address, school, photos or card details. If anything makes you uncomfortable, tell a parent.", "الناس على النت مش دايمًا هما اللي بيقولوه. ماتشاركش عنوانك أو مدرستك أو صورك أو بيانات كارتك. لو أي حاجة ضايقتك، قول لأهلك."),
    ],
    quiz: [
      q("Which password is the strongest?", "أنهي باسورد هو الأقوى؟", [["123456", "123456"], ["football", "football"], ["Fb!7Goal#Nile9", "Fb!7Goal#Nile9"], ["mypassword", "mypassword"]], 2, "Long + mixed characters = strong.", "طويل + حروف مختلطة = قوي."),
      q("Who can you share your password with?", "تشارك الباسورد مع مين؟", [["Only your parents", "أهلك بس"], ["Your best friend", "أحسن صاحب"], ["Anyone who asks nicely", "أي حد بيطلب بأدب"], ["Everyone in class", "كل الفصل"]], 0, "Passwords are private.", "الباسوردات خاصة."),
      q("Why use different passwords for different apps?", "ليه نستخدم باسوردات مختلفة للتطبيقات؟", [["So one leak doesn't open everything", "عشان لو واحد اتسرّب مايفتحش كل حاجة"], ["It's easier to remember", "أسهل في الحفظ"], ["Apps require it", "التطبيقات بتطلبه"], ["No reason", "مفيش سبب"]], 0, "Unique passwords limit the damage.", "الباسورد المختلف بيقلل الضرر."),
      q("You get a message with a link saying \"Free game credit!\" What do you do?", "جالك رسالة فيها لينك \"رصيد لعبة ببلاش!\". تعمل إيه؟", [["Don't tap it and show a parent", "ماتضغطش عليه وتوري أهلك"], ["Tap it quickly", "تضغط بسرعة"], ["Forward it to friends", "تبعته لصحابك"], ["Enter your password", "تكتب الباسورد"]], 0, "Free offers by message are classic tricks.", "العروض المجانية في الرسايل حيلة معروفة."),
      q("Where should you download apps from?", "تنزّل التطبيقات منين؟", [["The official app store, after asking a parent", "المتجر الرسمي بعد ما تسأل أهلك"], ["Any link in a chat", "أي لينك في شات"], ["A stranger's file", "ملف من شخص غريب"], ["A random website", "موقع عشوائي"]], 0, "Official stores check apps for safety.", "المتاجر الرسمية بتفحص التطبيقات."),
      q("Someone online asks for your home address and school. What do you do?", "حد على النت سألك على عنوان بيتك ومدرستك. تعمل إيه؟", [["Don't share and tell a parent", "ماتقولش وتقول لأهلك"], ["Share, they seem nice", "تقول، شكله لطيف"], ["Share only the school", "تقول المدرسة بس"], ["Share for a prize", "تقول مقابل جايزة"]], 0, "Personal details can be misused.", "البيانات الشخصية ممكن تتساء استخدامها."),
      q("Your device asks to update. Why is that useful?", "جهازك بيطلب تحديث. ليه ده مفيد؟", [["Updates often fix security holes", "التحديثات غالبًا بتصلح ثغرات الأمان"], ["It makes the phone older", "بيخلّي الموبايل أقدم"], ["It deletes your apps", "بيمسح تطبيقاتك"], ["It's never useful", "مش مفيد أبدًا"]], 0, "Updates keep you safer.", "التحديثات بتخليك أأمن."),
      q("A \"friend\" you met online asks you to keep a secret from your parents. What now?", "\"صديق\" اتعرفت عليه على النت طلب منك تخبّي سر عن أهلك. تعمل إيه؟", [["Tell your parents", "تقول لأهلك"], ["Keep the secret", "تحتفظ بالسر"], ["Send him money", "تبعتله فلوس"], ["Give him your password", "تدّيله الباسورد"]], 0, "Safe friends don't ask you to hide things from parents.", "الصديق الآمن مبيطلبش منك تخبّي حاجة عن أهلك."),
    ],
  },

  // ───────────────────────── l8 ─────────────────────────
  {
    id: "l8", icon: "alert-triangle", color: "#f97316", xp: 160,
    title: { en: "Scam Awareness", ar: "ازاي تتجنب النصب" },
    desc: { en: "Spot and avoid scams.", ar: "اكتشف النصب وتجنّبه." },
    cards: [
      c("🎣", "think", "A scam is a trick to get your money or your secrets. Scammers pretend to be a bank, a game, a prize, or even a friend.", "النصب حيلة عشان ياخدوا فلوسك أو أسرارك. النصابين بيتظاهروا إنهم بنك أو لعبة أو جايزة أو حتى صاحب."),
      c("🚩", "happy", "Watch for red flags: it says act NOW, it's too good to be true (\"You won 5000 EGP!\"), there's a strange link, or someone asks for your secrets.", "خلّي بالك من العلامات الحمرا: بيقولك اتصرف حالًا، حاجة حلوة قوي مصدقاهاش (\"كسبت 5000 جنيه!\")، لينك غريب، أو حد بيطلب أسرارك."),
      c("🏦", "think", "Egypt's Central Bank says to keep these secret: your card number, expiry date, PIN, CVV, OTP and national ID. Banks don't ask you to update your data by SMS, phone calls or links.", "البنك المركزي المصري بيقول خلّي دول سر: رقم الكارت، تاريخ الانتهاء، الـ PIN، الـ CVV، الـ OTP، والرقم القومي. والبنوك مبتطلبش تحديث بياناتك برسالة أو مكالمة أو لينك."),
      c("🛑", "happy", "Stop, Think, Ask. Don't reply and don't click. Show a parent. They can check with the bank. Telling someone is the smartest move!", "قف، فكّر، اسأل. ماترددش وماتضغطش. وري أهلك. هما يقدروا يتأكدوا من البنك. إنك تقول لحد هو أذكى تصرف!"),
    ],
    quiz: [
      q("What is a scam?", "إيه هو النصب؟", [["A trick to get your money or secrets", "حيلة عشان ياخدوا فلوسك أو أسرارك"], ["A kind of discount", "نوع خصم"], ["A bank service", "خدمة بنكية"], ["A game level", "مستوى في لعبة"]], 0, "Scammers use tricks to steal.", "النصابين بيستخدموا حيل عشان يسرقوا."),
      q("A message says: \"You won 5000 EGP! Click now!\" This is…", "رسالة بتقول: \"كسبت 5000 جنيه! اضغط حالًا!\" دي…", [["Probably a scam", "غالبًا نصب"], ["Definitely real", "أكيد حقيقية"], ["A gift from the bank", "هدية من البنك"], ["A school notice", "إشعار مدرسة"]], 0, "Too good to be true + pressure = red flags.", "حاجة حلوة قوي + ضغط = علامات حمرا."),
      q("A caller says \"I'm from your bank, tell me the OTP\". What do you do?", "واحد بيتصل بيقولك \"أنا من البنك، قولّي الـ OTP\". تعمل إيه؟", [["Hang up and tell a parent", "تقفل وتقول لأهلك"], ["Tell him quickly", "تقوله بسرعة"], ["Ask him to call later", "تطلب منه يتصل بعدين"], ["Give a fake number", "تدّيه رقم مزيف"]], 0, "Banks don't ask for OTP or PIN by phone.", "البنوك مبتطلبش OTP أو PIN بالتليفون."),
      q("Which of these must stay SECRET?", "أي دول لازم يفضلوا سر؟", [["PIN, CVV and OTP", "الـ PIN والـ CVV والـ OTP"], ["Your favourite colour", "لونك المفضل"], ["Your team's name", "اسم فريقك"], ["Your pet's name", "اسم حيوانك الأليف"]], 0, "These unlock your money.", "دول بيفتحوا فلوسك."),
      q("An SMS says \"Update your bank data using this link\". What's the right move?", "رسالة بتقول \"حدّث بياناتك البنكية من اللينك ده\". التصرف الصح؟", [["Don't click; ask a parent to check with the bank", "ماتضغطش واطلب من أهلك يتأكدوا من البنك"], ["Click and fill it in", "تضغط وتملا البيانات"], ["Send it to friends", "تبعتها لصحابك"], ["Reply with your ID number", "ترد برقمك القومي"]], 0, "Banks don't update data through SMS links.", "البنوك مبتحدّثش البيانات بلينكات الرسايل."),
      q("What does \"Stop, Think, Ask\" mean?", "إيه معنى \"قف، فكّر، اسأل\"؟", [["Pause, think about red flags, ask a trusted adult", "تقف، تفكّر في العلامات الحمرا، وتسأل حد كبير موثوق"], ["Reply fast, think later", "تردّ بسرعة وتفكّر بعدين"], ["Click first, ask never", "تضغط الأول ومتسألش"], ["Ask a stranger", "تسأل غريب"]], 0, "A pause beats panic.", "الوقفة أحسن من الخضة."),
      q("A game page says \"Free coins! Enter your parent's card number\". You…", "صفحة لعبة بتقول \"عملات ببلاش! اكتب رقم كارت أهلك\". إنت…", [["Close it and tell a parent", "تقفلها وتقول لأهلك"], ["Enter the number", "تكتب الرقم"], ["Take a photo of the card", "تصوّر الكارت"], ["Share it with friends", "تشاركها مع صحابك"]], 0, "Never share card numbers for \"free\" offers.", "ماتشاركش أرقام كروت مقابل عروض \"مجانية\"."),
      q("You think you were tricked. What's best?", "حاسس إنك اتنصب عليك. إيه الأحسن؟", [["Tell a parent right away so they can contact the bank", "تقول لأهلك فورًا عشان يكلموا البنك"], ["Hide it", "تخبّي الموضوع"], ["Wait and see", "تستنى وتشوف"], ["Try to trick someone back", "تحاول تنصب على حد تاني"]], 0, "Quick reporting limits the damage.", "الإبلاغ السريع بيقلل الضرر."),
    ],
  },

  // ───────────────────────── l9 ─────────────────────────
  {
    id: "l9", icon: "landmark", color: "#0F2D52", xp: 170,
    title: { en: "Bank Accounts", ar: "الحسابات البنكية" },
    desc: { en: "How bank accounts work.", ar: "إزاي الحسابات البنكية بتشتغل." },
    cards: [
      c("🏦", "happy", "A bank keeps your money safe. You can put money in (deposit) and take it out (withdraw) when you need it.", "البنك بيحافظ على فلوسك. تقدر تحط فلوس (إيداع) وتاخدها (سحب) وقت ما تحتاجها."),
      c("📈", "think", "Banks can pay you a little extra for keeping your money with them. That extra is called interest. The longer money stays, the more interest it can earn.", "البنك ممكن يديك زيادة صغيرة عشان سايب فلوسك عنده. الزيادة دي اسمها فايدة. وكل ما الفلوس تفضل مدة أطول، الفايدة بتزيد."),
      c("👨‍👩‍👧", "happy", "Kids can have savings accounts in many Egyptian banks, managed together with a parent or guardian. Usually the bank asks for the child's birth certificate and the parent's national ID.", "الأطفال ممكن يبقى ليهم حسابات توفير في بنوك مصرية كتير، بتتدار مع واحد من الأهل أو الوصي. غالبًا البنك بيطلب شهادة ميلاد الطفل وبطاقة الرقم القومي للوالد."),
      c("🏧", "think", "When you're young, use an ATM only with a parent. Cover the keypad, never share your PIN, and always take your card and receipt.", "وإنت صغير استخدم الـ ATM مع واحد من أهلك بس. غطّي لوحة الأرقام، وماتقولش الـ PIN لحد، وخد الكارت والإيصال دايمًا."),
    ],
    quiz: [
      q("What does \"deposit\" mean?", "يعني إيه \"إيداع\"؟", [["Putting money into your account", "إنك تحط فلوس في حسابك"], ["Taking money out", "إنك تسحب فلوس"], ["Losing money", "إنك تخسر فلوس"], ["Buying a toy", "إنك تشتري لعبة"]], 0, "Deposit = money in.", "إيداع = فلوس بتدخل."),
      q("What does \"withdraw\" mean?", "يعني إيه \"سحب\"؟", [["Taking money out of your account", "إنك تاخد فلوس من حسابك"], ["Putting money in", "إنك تحط فلوس"], ["Closing the bank", "إنك تقفل البنك"], ["Sharing your PIN", "إنك تقول الـ PIN"]], 0, "Withdraw = money out.", "سحب = فلوس بتخرج."),
      q("What is \"interest\"?", "إيه هي \"الفايدة\"؟", [["A little extra the bank may pay you for keeping money there", "زيادة صغيرة ممكن البنك يديهالك عشان سايب فلوسك عنده"], ["A fee for visiting the bank", "رسوم زيارة البنك"], ["A type of card", "نوع كارت"], ["A game bonus", "بونص لعبة"]], 0, "Interest rewards you for saving.", "الفايدة مكافأة على التحويش."),
      q("Who usually manages a child's savings account?", "مين غالبًا بيدير حساب توفير الطفل؟", [["The child together with a parent or guardian", "الطفل مع واحد من أهله أو الوصي"], ["A stranger", "شخص غريب"], ["A friend", "صاحب"], ["Nobody", "محدش"]], 0, "Parents or guardians help manage it.", "الأهل أو الوصي بيساعدوا في إدارته."),
      q("Which documents does a bank usually ask for to open a child's account?", "إيه الأوراق اللي البنك غالبًا بيطلبها لفتح حساب طفل؟", [["Child's birth certificate and parent's national ID", "شهادة ميلاد الطفل وبطاقة الرقم القومي للوالد"], ["A school bag", "شنطة مدرسة"], ["A drawing", "رسمة"], ["Nothing", "مفيش حاجة"]], 0, "Banks verify identity and guardianship.", "البنوك بتتأكد من الهوية والوصاية."),
      q("Why keep money in a bank rather than under your bed?", "ليه نحط الفلوس في البنك بدل تحت السرير؟", [["It's safer and can earn interest", "أأمن وممكن تكسب فايدة"], ["The bank takes it all", "البنك بياخدها كلها"], ["Beds can't hold money", "السرير ميقدرش يشيل فلوس"], ["No reason", "مفيش سبب"]], 0, "Safe from loss and theft, and it may grow.", "آمنة من الضياع والسرقة وممكن تكبر."),
      q("At an ATM, which is the SAFE thing to do?", "عند الـ ATM، إيه التصرف الآمن؟", [["Cover the keypad and keep your PIN secret", "تغطّي لوحة الأرقام وتخلّي الـ PIN سر"], ["Say your PIN aloud", "تقول الـ PIN بصوت عالي"], ["Let a stranger help", "تخلّي غريب يساعدك"], ["Leave the receipt there", "تسيب الإيصال"]], 0, "Protect your PIN and card.", "احمي الـ PIN والكارت."),
      q("You deposit 200 EGP and withdraw 50 EGP. How much is in the account (starting from 0)?", "أودعت 200 جنيه وسحبت 50 جنيه. الرصيد كام (من الصفر)؟", [["250", "250"], ["150", "150"], ["200", "200"], ["50", "50"]], 1, "200 − 50 = 150.", "200 − 50 = 150."),
    ],
  },

  // ───────────────────────── l10 ─────────────────────────
  {
    id: "l10", icon: "trending-up", color: "#00B894", xp: 200,
    title: { en: "Investing Basics", ar: "أساسيات الاستثمار" },
    desc: { en: "Grow your money over time.", ar: "نمّي فلوسك مع الوقت." },
    cards: [
      c("🌱", "happy", "Investing means putting money into something that might grow over time, like a business, gold, shares or a bank certificate. Grown-ups invest. Kids learn now to be ready!", "الاستثمار يعني تحط فلوسك في حاجة ممكن تكبر مع الوقت، زي مشروع أو دهب أو أسهم أو شهادة بنك. الكبار بيستثمروا، والأطفال بيتعلّموا دلوقتي عشان يبقوا جاهزين!"),
      c("⚖️", "think", "Risk and return go together. Bigger possible gains usually mean bigger possible losses. Safer choices usually grow more slowly.", "المخاطرة والعائد بيمشوا مع بعض. المكسب الأكبر غالبًا معاه خسارة محتملة أكبر. والاختيارات الأأمن غالبًا بتكبر أبطأ."),
      c("🥚", "happy", "Don't put all your eggs in one basket! Spreading your money across different things (diversifying) protects you if one of them goes down.", "ماتحطش البيض كله في سلة واحدة! توزيع فلوسك على حاجات مختلفة (تنويع) بيحميك لو واحدة منهم نزلت."),
      c("⏰", "think", "Prices go up over time (that's inflation), so money that sits idle buys less later. Starting early and being patient is your biggest investing superpower.", "الأسعار بتزيد مع الوقت (ده اسمه التضخم)، فالفلوس الواقفة بتشتري أقل بعدين. إنك تبدأ بدري وتصبر هي أقوى قوة خارقة في الاستثمار."),
    ],
    quiz: [
      q("What is investing?", "إيه هو الاستثمار؟", [["Putting money into something that may grow over time", "إنك تحط فلوس في حاجة ممكن تكبر مع الوقت"], ["Spending all your money now", "إنك تصرف كل فلوسك دلوقتي"], ["Hiding money in a drawer", "إنك تخبّي فلوس في درج"], ["Buying sweets", "إنك تشتري حلويات"]], 0, "Investing aims to grow money over time.", "الاستثمار هدفه تنمية الفلوس مع الوقت."),
      q("What usually goes together with a bigger possible gain?", "إيه اللي غالبًا بيمشي مع المكسب الأكبر؟", [["A bigger possible loss (risk)", "خسارة محتملة أكبر (مخاطرة)"], ["No risk at all", "مفيش مخاطرة خالص"], ["Guaranteed profit", "ربح مضمون"], ["Free money", "فلوس ببلاش"]], 0, "Higher reward usually means higher risk.", "العائد الأعلى غالبًا معاه مخاطرة أعلى."),
      q("What does \"don't put all your eggs in one basket\" mean?", "إيه معنى \"ماتحطش البيض كله في سلة واحدة\"؟", [["Spread your money across different things", "وزّع فلوسك على حاجات مختلفة"], ["Never buy eggs", "ماتشتريش بيض أبدًا"], ["Put everything in one place", "حط كل حاجة في مكان واحد"], ["Only invest in food", "استثمر في الأكل بس"]], 0, "It's about diversification.", "ده معناه التنويع."),
      q("What is inflation?", "إيه هو التضخم؟", [["Prices rising over time", "زيادة الأسعار مع الوقت"], ["Prices always falling", "الأسعار بتنزل دايمًا"], ["A kind of balloon", "نوع بالون"], ["A bank holiday", "إجازة بنكية"]], 0, "So the same money buys less later.", "فنفس الفلوس بتشتري أقل بعدين."),
      q("Why is starting early powerful?", "ليه البداية بدري قوية؟", [["Money has more time to grow", "الفلوس بيبقى عندها وقت أطول تكبر فيه"], ["It's less boring", "مش مملة"], ["Banks give prizes", "البنوك بتدّي جوايز"], ["It isn't powerful", "مش قوية"]], 0, "Time is a big advantage.", "الوقت ميزة كبيرة."),
      q("Which is generally the SAFER (but slower-growing) choice?", "أي اختيار غالبًا أأمن (بس بيكبر أبطأ)؟", [["A bank certificate or savings account", "شهادة بنك أو حساب توفير"], ["Betting on one risky thing", "المراهنة على حاجة واحدة مخاطرتها عالية"], ["Lending to a stranger", "إنك تسلّف غريب"], ["Buying lottery tickets", "شراء تذاكر يانصيب"]], 0, "Safer choices usually grow more slowly.", "الاختيارات الأأمن غالبًا بتكبر أبطأ."),
      q("Who should help a child with real investing decisions?", "مين يساعد الطفل في قرارات الاستثمار الحقيقية؟", [["A parent or trusted adult", "واحد من الأهل أو كبير موثوق"], ["An anonymous online \"expert\"", "\"خبير\" مجهول على النت"], ["A stranger with a \"secret tip\"", "غريب معاه \"نصيحة سرية\""], ["Nobody", "محدش"]], 0, "Real money decisions need trusted adults.", "قرارات الفلوس الحقيقية محتاجة كبار موثوقين."),
      q("Someone promises \"Double your money in a week, no risk!\" This is probably…", "حد بيوعد \"هنضاعف فلوسك في أسبوع من غير مخاطرة!\" ده غالبًا…", [["A scam", "نصب"], ["A great deal", "عرض ممتاز"], ["A bank offer", "عرض بنكي"], ["Always true", "صحيح دايمًا"]], 0, "No-risk huge returns are a classic scam sign.", "عائد كبير من غير مخاطرة علامة نصب كلاسيكية."),
    ],
  },
];

// ───────── helpers ─────────
export const lessonById = (id) => LESSONS.find((l) => l.id === id);
export const pick = (obj, lang) => (obj ? obj[lang === "ar" ? "ar" : "en"] ?? obj.en : "");

// يختار QUIZ_SIZE أسئلة عشوائية من بنك الدرس، ويخلط اختيارات كل سؤال (والإجابة الصح بتتتبع معاه).
export function buildQuiz(lesson, rng = Math.random) {
  const shuffle = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  return shuffle(lesson.quiz).slice(0, QUIZ_SIZE).map((item) => {
    const order = shuffle(item.options.map((_, i) => i));
    return {
      q: item.q,
      options: order.map((i) => item.options[i]),
      answer: order.indexOf(item.answer),
      why: item.why,
    };
  });
}