// Central dummy data for FinFamily — realistic Egyptian family banking context

export const LOFTY_IMAGE =
  "https://media.base44.com/images/public/6a66fa8604636ed2165c82a8/915ad6ebb_generated_image.png";

export const LOGO_IMAGE =
  "https://media.base44.com/images/public/6a66fa8604636ed2165c82a8/311ca046d_image.png";

export const PARENT_IMAGE =
  "https://media.base44.com/images/public/6a66fa8604636ed2165c82a8/e5057c3f5_image.png";

export const parent = {
  name: "Ahmed Hassan",
  role: "Father · Account Owner",
  phone: "+20 100 123 4567",
  email: "ahmed.hassan@finfamily.app",
};

export const child = {
  name: "Lotfy",
  age: 10,
  level: 3,
  title: "Saving Hero",
  xp: 1250,
  xpToNext: 1600,
  coins: 480,
  streak: 5,
  financialScore: 78,
  scoreTrend: +4,
  mood: "excited",
  walletBalance: 320.5,
  pendingAllowance: 75,
  savingsBalance: 845,
  weeklyAllowance: 150,
  todaySpending: 42,
  badges: [
    { id: "smart-saver", name: "Smart Saver", icon: "piggy-bank", earned: true },
    { id: "budget-hero", name: "Budget Hero", icon: "shield-check", earned: true },
    { id: "future-investor", name: "Future Investor", icon: "trending-up", earned: true },
    { id: "goal-crusher", name: "Goal Crusher", icon: "target", earned: false },
    { id: "finance-explorer", name: "Finance Explorer", icon: "compass", earned: false },
  ],
};

export const transactions = [
  { id: "t1", merchant: "Metro Market", category: "Groceries", amount: -28.5, date: "2026-07-27T09:12:00", location: "Maadi, Cairo", icon: "shopping-cart", type: "card", status: "completed", receipt: "INV-88214" },
  { id: "t2", merchant: "School Canteen", category: "Food", amount: -12, date: "2026-07-26T12:30:00", location: "New Giza", icon: "utensils", type: "card", status: "completed", receipt: "INV-44102" },
  { id: "t3", merchant: "Allowance", category: "Income", amount: +150, date: "2026-07-26T08:00:00", location: "From Dad", icon: "wallet", type: "allowance", status: "completed", receipt: null },
  { id: "t4", merchant: "Carrefour", category: "Shopping", amount: -64.75, date: "2026-07-25T17:45:00", location: "Citystars", icon: "shopping-bag", type: "card", status: "completed", receipt: "INV-77321" },
  { id: "t5", merchant: "Bookstore", category: "Education", amount: -35, date: "2026-07-24T11:20:00", location: "Zamalek", icon: "book", type: "card", status: "completed", receipt: "INV-55210" },
  { id: "t6", merchant: "Cinema", category: "Entertainment", amount: -45, date: "2026-07-23T19:00:00", location: "Mall of Egypt", icon: "film", type: "card", status: "completed", receipt: "INV-33021" },
  { id: "t7", merchant: "Football Club", category: "Sports", amount: -25, date: "2026-07-22T16:30:00", location: "6th October", icon: "circle", type: "card", status: "completed", receipt: "INV-22198" },
  { id: "t8", merchant: "Savings Goal", category: "Savings", amount: -50, date: "2026-07-21T20:10:00", location: "To Bicycle", icon: "target", type: "transfer", status: "completed", receipt: null },
  { id: "t9", merchant: "Savings Goal", category: "Savings", amount: +50, date: "2026-07-21T20:10:00", location: "Bicycle fund", icon: "target", type: "savings", status: "completed", receipt: null },
  { id: "t10", merchant: "Metro Market", category: "Groceries", amount: -18.25, date: "2026-07-20T10:00:00", location: "Maadi, Cairo", icon: "shopping-cart", type: "card", status: "completed", receipt: "INV-88199" },
];

export const spendingCategories = [
  { name: "Food", value: 186, color: "#FFC857" },
  { name: "Groceries", value: 142, color: "#00B894" },
  { name: "Entertainment", value: 90, color: "#0F2D52" },
  { name: "Education", value: 65, color: "#3b82f6" },
  { name: "Sports", value: 50, color: "#8b5cf6" },
  { name: "Shopping", value: 120, color: "#ef4444" },
];

export const savingsGoals = [
  { id: "g1", name: "New Bicycle", target: 1200, current: 480, icon: "🚲", color: "#00B894", eta: "8 weeks", aiNote: "Save 40 EGP/week to finish 2 weeks early" },
  { id: "g2", name: "PlayStation Game", target: 350, current: 210, icon: "🎮", color: "#FFC857", eta: "3 weeks", aiNote: "On track — great consistency!" },
  { id: "g3", name: "Football", target: 200, current: 95, icon: "⚽", color: "#3b82f6", eta: "5 weeks", aiNote: "Try saving 5 EGP/day to speed up" },
  { id: "g4", name: "School Bag", target: 450, current: 60, icon: "🎒", color: "#8b5cf6", eta: "13 weeks", aiNote: "Let's boost weekly deposits" },
];

export const dailyChallenge = {
  title: "Save 10 EGP Today",
  description: "Skip one snack and add 10 EGP to your savings goal.",
  reward: { xp: 50, coins: 15 },
  progress: 40,
};

export const lessons = [
  { id: "l1", title: "Money Basics", icon: "coins", color: "#FFC857", status: "completed", progress: 100, xp: 100, desc: "What is money and why do we use it?" },
  { id: "l2", title: "Needs vs Wants", icon: "scale", color: "#00B894", status: "completed", progress: 100, xp: 120, desc: "Learn the difference between needs and wants." },
  { id: "l3", title: "Budgeting", icon: "pie-chart", color: "#0F2D52", status: "in-progress", progress: 60, xp: 150, desc: "How to plan your spending." },
  { id: "l4", title: "Saving", icon: "piggy-bank", color: "#8b5cf6", status: "locked", progress: 0, xp: 150, desc: "Why saving builds your future." },
  { id: "l5", title: "Digital Payments", icon: "smartphone", color: "#3b82f6", status: "locked", progress: 0, xp: 130, desc: "Pay safely with your phone." },
  { id: "l6", title: "Meeza Cards", icon: "credit-card", color: "#00B894", status: "locked", progress: 0, xp: 140, desc: "Your first bank card explained." },
  { id: "l7", title: "Cybersecurity", icon: "shield", color: "#ef4444", status: "locked", progress: 0, xp: 160, desc: "Stay safe online." },
  { id: "l8", title: "Scam Awareness", icon: "alert-triangle", color: "#f97316", status: "locked", progress: 0, xp: 160, desc: "Spot and avoid scams." },
  { id: "l9", title: "Bank Accounts", icon: "landmark", color: "#0F2D52", status: "locked", progress: 0, xp: 170, desc: "How bank accounts work." },
  { id: "l10", title: "Investing Basics", icon: "trending-up", color: "#00B894", status: "locked", progress: 0, xp: 200, desc: "Grow your money over time." },
];

export const games = [
  { id: "gm1", title: "Shopping Simulator", icon: "🛒", color: "#00B894", reward: "60 XP" },
  { id: "gm2", title: "Budget Challenge", icon: "📊", color: "#0F2D52", reward: "70 XP" },
  { id: "gm3", title: "Needs vs Wants", icon: "⚖️", color: "#FFC857", reward: "50 XP" },
  { id: "gm4", title: "Guess Price", icon: "❓", color: "#8b5cf6", reward: "40 XP" },
  { id: "gm5", title: "Coin Catcher", icon: "🪙", color: "#f97316", reward: "55 XP" },
  { id: "gm6", title: "Expense Sorting", icon: "🗂️", color: "#3b82f6", reward: "45 XP" },
  { id: "gm7", title: "Change Maker", icon: "💰", color: "#f97316", reward: "65 XP" },
  { id: "gm8", title: "Smart Shopper", icon: "🛒", color: "#00B894", reward: "50 XP" },
  { id: "gm9", title: "Scam Detective", icon: "🕵️", color: "#ef4444", reward: "50 XP" },
  { id: "gm10", title: "Future Investor", icon: "🚀", color: "#f97316", reward: "60 XP" },
  { id: "gm11", title: "Saving Hero", icon: "🐷", color: "#3b82f6", reward: "50 XP" },
];

export const rewardsStore = [
  { id: "r1", name: "Movie Ticket", cost: 200, icon: "🎬", category: "Fun" },
  { id: "r2", name: "Football", cost: 350, icon: "⚽", category: "Toys" },
  { id: "r3", name: "Ice Cream", cost: 60, icon: "🍦", category: "Treats" },
  { id: "r4", name: "Book", cost: 150, icon: "📚", category: "Learning" },
  { id: "r5", name: "Gift Card", cost: 250, icon: "🎁", category: "Gift" },
  { id: "r6", name: "School Supplies", cost: 120, icon: "✏️", category: "Learning" },
  { id: "r7", name: "Avatar: Gold Cap", cost: 300, icon: "🧢", category: "Avatar" },
  { id: "r8", name: "Card Theme: Gold", cost: 400, icon: "💳", category: "Card" },
  { id: "r9", name: "Treasure Box", cost: 500, icon: "🎁", category: "Mystery" },
];

export const familyChallenges = [
  { id: "fc1", title: "Save Together", desc: "Family saves 500 EGP this week", progress: 320, target: 500, participants: 4, icon: "🤝" },
  { id: "fc2", title: "No Spending Weekend", desc: "Zero non-essential spending Sat–Sun", progress: 0, target: 1, participants: 4, icon: "🚫" },
  { id: "fc3", title: "Healthy Spending Week", desc: "Keep wants under 30% of budget", progress: 4, target: 7, participants: 4, icon: "✅" },
  { id: "fc4", title: "Family Quiz", desc: "Answer 10 money questions together", progress: 6, target: 10, participants: 4, icon: "🧠" },
];

export const leaderboard = [
  { rank: 1, name: "Lotfy", score: 1240, avatar: "🦁", isLotfy: true },
  { rank: 2, name: "Mariam", score: 980, avatar: "🦊" },
  { rank: 3, name: "Youssef", score: 760, avatar: "🐻" },
  { rank: 4, name: "Laila", score: 540, avatar: "🐰" },
];

export const cardThemes = [
  { id: "blue", name: "Ocean Blue", gradient: "linear-gradient(135deg,#0F2D52,#1a4571)", active: true },
  { id: "dark", name: "Midnight", gradient: "linear-gradient(135deg,#0a0e1a,#1a1f3a)" },
  { id: "kids", name: "Kids Fun", gradient: "linear-gradient(135deg,#00B894,#3b82f6)" },
  { id: "gold", name: "Royal Gold", gradient: "linear-gradient(135deg,#FFC857,#f5a623)" },
];

export const notifications = [
  { id: "n1", title: "Allowance Received", body: "Dad sent you 150 EGP weekly allowance 🎉", time: "2h ago", icon: "wallet", color: "#00B894", unread: true },
  { id: "n2", title: "Goal Almost There!", body: "PlayStation Game is 60% complete.", time: "5h ago", icon: "target", color: "#FFC857", unread: true },
  { id: "n3", title: "AI Recommendation", body: "You spent 62% on snacks this week. Want a tip?", time: "1d ago", icon: "sparkles", color: "#3b82f6", unread: false },
  { id: "n4", title: "Quiz Completed", body: "Budgeting lesson quiz: 9/10! +120 XP", time: "1d ago", icon: "award", color: "#8b5cf6", unread: false },
  { id: "n5", title: "Purchase Approved", body: "Carrefour 64.75 EGP approved by Mom.", time: "2d ago", icon: "check-circle", color: "#00B894", unread: false },
  { id: "n6", title: "Daily Challenge Ready", body: "Save 10 EGP today for 50 XP!", time: "2d ago", icon: "zap", color: "#FFC857", unread: false },
];

export const parentSummary = {
  totalSpending: 653,
  totalSavings: 845,
  goalsCompleted: 2,
  avgFinancialScore: 78,
  recommendedAllowance: 220,
  topCategory: "Food",
  topCategoryPct: 28,
  impulseDrop: 12,
  savingImprovement: 19,
};

export const aiInsights = [
  { id: "i1", icon: "utensils", color: "#FFC857", text: "Lotfy spent 62% on snacks this week.", detail: "Consider reducing the canteen budget and adding healthier alternatives." },
  { id: "i2", icon: "piggy-bank", color: "#00B894", text: "Saving habit improved by 19%.", detail: "Consistency is up — great momentum to reward." },
  { id: "i3", icon: "trending-up", color: "#3b82f6", text: "Financial discipline increased.", detail: "Needs vs wants ratio moved from 50:50 to 64:36." },
  { id: "i4", icon: "shield-check", color: "#8b5cf6", text: "Impulse buying decreased by 12%.", detail: "The 'pause before purchase' feature is working." },
  { id: "i5", icon: "wallet", color: "#00B894", text: "Recommended allowance: 220 EGP.", detail: "Based on spending + savings goals this month." },
  { id: "i6", icon: "target", color: "#FFC857", text: "Suggested challenge: Save 30 EGP this week.", detail: "Would complete the Bicycle goal 2 weeks early." },
];

export const approvals = [
  { id: "a1", merchant: "Carrefour", price: 64.75, category: "Shopping", location: "Citystars", time: "Today, 5:45 PM", status: "pending", icon: "shopping-bag" },
  { id: "a2", merchant: "Cinema", price: 45, category: "Entertainment", location: "Mall of Egypt", time: "Today, 7:00 PM", status: "pending", icon: "film" },
  { id: "a3", merchant: "Football Club", price: 60, category: "Sports", location: "6th October", time: "Yesterday", status: "approved", icon: "circle" },
];

export const allowanceTypes = [
  { id: "daily", label: "Daily Allowance", icon: "sun", amount: 25, color: "#FFC857" },
  { id: "weekly", label: "Weekly Allowance", icon: "calendar", amount: 150, color: "#00B894" },
  { id: "monthly", label: "Monthly Allowance", icon: "calendar-days", amount: 600, color: "#0F2D52" },
  { id: "homework", label: "Homework Reward", icon: "book", amount: 20, color: "#3b82f6" },
  { id: "exam", label: "Exam Reward", icon: "graduation-cap", amount: 100, color: "#8b5cf6" },
  { id: "chores", label: "Extra Chores", icon: "sparkles", amount: 15, color: "#f97316" },
  { id: "birthday", label: "Birthday Gift", icon: "gift", amount: 200, color: "#ef4444" },
  { id: "emergency", label: "Emergency Transfer", icon: "zap", amount: 0, color: "#64748b" },
];

export const scoreHistory = [62, 65, 64, 70, 72, 75, 78];

export const weeklySpending = [
  { day: "Mon", amount: 28 },
  { day: "Tue", amount: 12 },
  { day: "Wed", amount: 65 },
  { day: "Thu", amount: 0 },
  { day: "Fri", amount: 45 },
  { day: "Sat", amount: 90 },
  { day: "Sun", amount: 42 },
];

export const quizQuestions = [
  { q: "What is a 'need'?", options: ["Something you must have to live", "Something fun", "A toy", "A candy"], answer: 0, explain: "Needs are essentials like food, water, and shelter." },
  { q: "What is a 'want'?", options: ["Something you must have", "Something nice but not essential", "A bill", "Rent"], answer: 1, explain: "Wants are extras like toys or games." },
  { q: "Best way to reach a savings goal?", options: ["Spend it all at once", "Save a little each week", "Borrow money", "Ignore it"], answer: 1, explain: "Consistent small deposits add up fast!" },
  { q: "What does a budget help you do?", options: ["Plan your spending", "Buy everything", "Waste money", "Nothing"], answer: 0, explain: "A budget plans where your money goes." },
  { q: "If you get 50 EGP, the smartest choice is to…", options: ["Spend it all on snacks", "Save some, spend some", "Lose it", "Give it all away"], answer: 1, explain: "Balance saving and spending." },
  { q: "What is an allowance?", options: ["A loan from a bank", "Regular money from parents", "A bill", "A tax"], answer: 1, explain: "Allowance is money parents give regularly." },
  { q: "Why save money?", options: ["For future goals & emergencies", "No reason", "To show off", "To spend instantly"], answer: 0, explain: "Saving prepares you for the future." },
  { q: "Which is a 'need'?", options: ["School supplies", "A video game", "Cinema ticket", "Ice cream"], answer: 0, explain: "School supplies are essential for learning." },
];

export const priceGuessItems = [
  { name: "School Notebook", emoji: "📓", price: 15, options: [5, 15, 45, 80] },
  { name: "Ice Cream Cone", emoji: "🍦", price: 12, options: [12, 40, 60, 100] },
  { name: "Football", emoji: "⚽", price: 90, options: [20, 50, 90, 200] },
  { name: "Cinema Ticket", emoji: "🎬", price: 45, options: [10, 25, 45, 120] },
  { name: "Bicycle", emoji: "🚲", price: 1200, options: [200, 600, 1200, 3000] },
  { name: "Book", emoji: "📚", price: 35, options: [5, 15, 35, 90] },
];

export const needsWantsItems = [
  { name: "Bread", emoji: "🍞", need: true },
  { name: "Video Game", emoji: "🎮", need: false },
  { name: "School Bag", emoji: "🎒", need: true },
  { name: "Candy", emoji: "🍬", need: false },
  { name: "Water Bottle", emoji: "💧", need: true },
  { name: "Toy Car", emoji: "🚗", need: false },
  { name: "Medicine", emoji: "💊", need: true },
  { name: "Cinema Ticket", emoji: "🎬", need: false },
];

export const budgetItems = [
  { name: "Bread", emoji: "🍞", price: 15, need: true },
  { name: "Notebook", emoji: "📓", price: 20, need: true },
  { name: "Water", emoji: "💧", price: 8, need: true },
  { name: "Toy", emoji: "🧸", price: 45, need: false },
  { name: "Candy", emoji: "🍬", price: 12, need: false },
  { name: "Game", emoji: "🎮", price: 60, need: false },
];
export const BUDGET_LIMIT = 100;

export const fmtEGP = (n) => `${Number(n).toLocaleString("en-EG", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} EGP`;

// ---------------- Family Members (parent-managed) ----------------
export const familyMembers = [
  {
    id: "m1", name: "Lotfy", age: 11, avatar: "🦁", role: "Son", image: LOFTY_IMAGE,
    balance: 320.5, savings: 845, financialScore: 78, scoreTrend: +4,
    cardStatus: "active", cardNumber: "5061 •••• •••• 2041", cardTheme: "blue",
    limits: { daily: 80, weekly: 350, monthly: 1200 },
    spent: { daily: 42, weekly: 653, monthly: 2100 },
    blockedCategories: ["Entertainment"],
    streak: 6, level: 7, xp: 1240, coins: 480,
    weeklyTrend: [12, 28, 65, 0, 45, 90, 42],
    status: "online", joined: "Jan 2026",
  },
  {
    id: "m2", name: "Mariam", age: 9, avatar: "🦊", role: "Daughter",
    balance: 180, savings: 420, financialScore: 82, scoreTrend: +6,
    cardStatus: "active", cardNumber: "5061 •••• •••• 8821", cardTheme: "kids",
    limits: { daily: 60, weekly: 250, monthly: 900 },
    spent: { daily: 15, weekly: 210, monthly: 1500 },
    blockedCategories: [],
    streak: 12, level: 9, xp: 980, coins: 320,
    weeklyTrend: [5, 20, 30, 0, 25, 60, 15],
    status: "online", joined: "Mar 2026",
  },
  {
    id: "m3", name: "Youssef", age: 14, avatar: "🐻", role: "Son",
    balance: 540, savings: 1200, financialScore: 71, scoreTrend: +2,
    cardStatus: "frozen", cardNumber: "5061 •••• •••• 4410", cardTheme: "dark",
    limits: { daily: 100, weekly: 400, monthly: 1500 },
    spent: { daily: 0, weekly: 380, monthly: 2800 },
    blockedCategories: ["Gaming", "Shopping"],
    streak: 3, level: 5, xp: 760, coins: 210,
    weeklyTrend: [40, 15, 80, 60, 90, 55, 40],
    status: "frozen", joined: "Feb 2026",
  },
];

// ---------------- Chores & Tasks ----------------
export const chores = [
  { id: "ch1", title: "Clean your room", assignee: "Lotfy", reward: 15, status: "pending", due: "Today", icon: "🧹", category: "Home" },
  { id: "ch2", title: "Finish homework", assignee: "Lotfy", reward: 20, status: "completed", due: "Yesterday", icon: "📚", category: "School", approved: true },
  { id: "ch3", title: "Help with dishes", assignee: "Mariam", reward: 10, status: "pending", due: "Today", icon: "🍽️", category: "Home" },
  { id: "ch4", title: "Water the plants", assignee: "Lotfy", reward: 8, status: "pending", due: "Tomorrow", icon: "🌱", category: "Home" },
  { id: "ch5", title: "Read 10 pages", assignee: "Mariam", reward: 12, status: "pending", due: "Today", icon: "📖", category: "Learning" },
  { id: "ch6", title: "Organize bookshelf", assignee: "Youssef", reward: 18, status: "completed", due: "2 days ago", icon: "📚", category: "Home", approved: true },
];

export const choreTemplates = [
  { title: "Make the bed", reward: 5, icon: "🛏️", category: "Home" },
  { title: "Take out trash", reward: 7, icon: "🗑️", category: "Home" },
  { title: "Walk the dog", reward: 10, icon: "🐕", category: "Home" },
  { title: "Study for 30 min", reward: 15, icon: "✏️", category: "School" },
  { title: "Practice math", reward: 12, icon: "🔢", category: "Learning" },
  { title: "Set the table", reward: 5, icon: "🍽️", category: "Home" },
  { title: "Wash the car", reward: 25, icon: "🚗", category: "Home" },
  { title: "Tidy toys", reward: 6, icon: "🧸", category: "Home" },
];

// ---------------- Blockable Categories ----------------
export const blockableCategories = [
  { id: "gaming", name: "Gaming", icon: "🎮", color: "#8b5cf6", desc: "Games & in-app purchases" },
  { id: "food", name: "Fast Food", icon: "🍔", color: "#FFC857", desc: "Restaurants & delivery" },
  { id: "entertainment", name: "Entertainment", icon: "🎬", color: "#ef4444", desc: "Cinema & events" },
  { id: "shopping", name: "Shopping", icon: "🛍️", color: "#3b82f6", desc: "Non-essential retail" },
  { id: "toys", name: "Toys", icon: "🧸", color: "#f97316", desc: "Toys & gadgets" },
  { id: "sweets", name: "Sweets & Snacks", icon: "🍬", color: "#ec4899", desc: "Candy & junk food" },
];

// ---------------- Reward Requests (parent approval) ----------------
export const rewardRequests = [
  { id: "rr1", child: "Lotfy", item: "Movie Ticket", cost: 200, icon: "🎬", status: "pending", time: "2h ago", coinsBalance: 480 },
  { id: "rr2", child: "Mariam", item: "Ice Cream", cost: 60, icon: "🍦", status: "pending", time: "5h ago", coinsBalance: 320 },
  { id: "rr3", child: "Lotfy", item: "Book", cost: 150, icon: "📚", status: "approved", time: "1d ago", coinsBalance: 480 },
  { id: "rr4", child: "Youssef", item: "Gift Card", cost: 250, icon: "🎁", status: "rejected", time: "2d ago", coinsBalance: 210 },
];

// ---------------- Leaderboard (friends + families) ----------------
export const leaderboardFriends = [
  { rank: 1, name: "Lotfy", score: 1240, avatar: "🦁", level: 7, isMe: true, family: "Hassan Family" },
  { rank: 2, name: "Mariam", score: 1180, avatar: "🦊", level: 9, family: "Hassan Family" },
  { rank: 3, name: "Adam", score: 980, avatar: "🐯", level: 6, family: "Sayed Family" },
  { rank: 4, name: "Salma", score: 870, avatar: "🐱", level: 5, family: "Mostafa Family" },
  { rank: 5, name: "Omar", score: 760, avatar: "🐻", level: 5, family: "Hassan Family" },
  { rank: 6, name: "Nour", score: 690, avatar: "🐰", level: 4, family: "Ali Family" },
  { rank: 7, name: "Khaled", score: 540, avatar: "🐼", level: 3, family: "Sayed Family" },
  { rank: 8, name: "Farida", score: 410, avatar: "🦉", level: 3, family: "Mostafa Family" },
];

export const leaderboardFamilies = [
  { rank: 1, name: "Hassan Family", score: 4200, members: 3, icon: "🏆", isMine: true, avgScore: 77 },
  { rank: 2, name: "Sayed Family", score: 3800, members: 2, icon: "🥈", avgScore: 72 },
  { rank: 3, name: "Mostafa Family", score: 3200, members: 2, icon: "🥉", avgScore: 68 },
  { rank: 4, name: "Ali Family", score: 2400, members: 1, icon: "🎖️", avgScore: 64 },
  { rank: 5, name: "Noor Family", score: 1900, members: 2, icon: "🎖️", avgScore: 61 },
];

// ---------------- Change Maker game ----------------
export const changeMakerRounds = [
  { price: 27, paid: 50, options: [23, 13, 33, 17], answer: 0 },
  { price: 64, paid: 100, options: [46, 36, 26, 56], answer: 1 },
  { price: 12, paid: 20, options: [12, 8, 6, 10], answer: 1 },
  { price: 85, paid: 100, options: [25, 5, 15, 35], answer: 2 },
  { price: 140, paid: 200, options: [70, 50, 60, 40], answer: 2 },
  { price: 38, paid: 50, options: [22, 12, 18, 8], answer: 1 },
];

// ---------------- Parent AI Insights (consumption analysis) ----------------
export const parentAiInsights = [
  { id: "pi1", icon: "utensils", color: "#FFC857", text: "Lotfy's snack spending up 18% this week.", detail: "Canteen visits doubled. Consider setting a daily food limit of 35 EGP.", severity: "warn", member: "Lotfy" },
  { id: "pi2", icon: "trending-down", color: "#ef4444", text: "Youssef exceeded weekly limit by 30 EGP.", detail: "Card auto-frozen. Review his Entertainment category.", severity: "alert", member: "Youssef" },
  { id: "pi3", icon: "piggy-bank", color: "#00B894", text: "Mariam is the family's top saver.", detail: "82 financial score — reward with a bonus allowance.", severity: "good", member: "Mariam" },
  { id: "pi4", icon: "shield-alert", color: "#3b82f6", text: "Unusual transaction pattern detected.", detail: "3 late-night purchases flagged for review on Youssef's card.", severity: "alert", member: "Youssef" },
  { id: "pi5", icon: "wallet", color: "#00B894", text: "Family total savings grew by 19% this month.", detail: "Great momentum — consider a family savings challenge.", severity: "good", member: "Family" },
  { id: "pi6", icon: "sparkles", color: "#8b5cf6", text: "Fintech tip: Enable two-factor on all cards.", detail: "Protects against 99% of unauthorized card-not-present fraud.", severity: "info", member: "Family" },
];

// ---------------- Adventure: Levels, Worlds, Badges, Skills, Missions ----------------
export const levels = [
  { level: 1, name: "Money Explorer", minXp: 0, color: "#FFC857" },
  { level: 2, name: "Smart Spender", minXp: 400, color: "#3b82f6" },
  { level: 3, name: "Saving Hero", minXp: 900, color: "#00B894" },
  { level: 4, name: "Budget Master", minXp: 1600, color: "#7C3AED" },
  { level: 5, name: "Money Guardian", minXp: 2500, color: "#0F2D52" },
  { level: 6, name: "Financial Detective", minXp: 3600, color: "#ef4444" },
  { level: 7, name: "Future Builder", minXp: 5000, color: "#f97316" },
  { level: 8, name: "Financial Hero", minXp: 7000, color: "#FFC857" },
];

export const adventureWorlds = [
  { id: "w1", name: "Money Explorer", icon: "🌍", color: "#FFC857", unlockLevel: 1, status: "unlocked", progress: 100, topics: ["What is money?", "Needs vs Wants", "Smart choices"], lesson: "l1", game: "gm3" },
  { id: "w2", name: "Smart Shopper", icon: "🛒", color: "#00B894", unlockLevel: 2, status: "unlocked", progress: 60, topics: ["Comparing prices", "Value vs price", "Avoiding impulse spending"], lesson: "l2", game: "gm8" },
  { id: "w3", name: "Saving Hero", icon: "🐷", color: "#3b82f6", unlockLevel: 3, status: "unlocked", progress: 35, topics: ["Saving", "Savings goals", "Delayed gratification"], lesson: "l4", game: "gm11" },
  { id: "w4", name: "Budget Master", icon: "📊", color: "#7C3AED", unlockLevel: 4, status: "locked", progress: 0, topics: ["Budgeting", "Spending categories", "Planning"], lesson: "l3", game: "gm2" },
  { id: "w5", name: "Digital Money Guardian", icon: "🛡️", color: "#0F2D52", unlockLevel: 5, status: "locked", progress: 0, topics: ["Digital payments", "Card safety", "PIN & security", "Online safety"], lesson: "l5", game: "gm5" },
  { id: "w6", name: "Scam Detective", icon: "🕵️", color: "#ef4444", unlockLevel: 6, status: "locked", progress: 0, topics: ["Fake messages", "Phishing", "Fraud", "Suspicious offers"], lesson: "l8", game: "gm9" },
  { id: "w7", name: "Future Builder", icon: "🚀", color: "#f97316", unlockLevel: 7, status: "locked", progress: 0, topics: ["Risk", "Return", "Diversification", "Long-term planning"], lesson: "l10", game: "gm10" },
];

export const adventureBadges = [
  { id: "b1", name: "Smart Saver", icon: "🐷", desc: "Complete 3 saving challenges", earned: true, color: "#00B894" },
  { id: "b2", name: "Smart Shopper", icon: "🛒", desc: "Complete shopping scenarios", earned: true, color: "#3b82f6" },
  { id: "b3", name: "Budget Hero", icon: "📊", desc: "Complete budgeting challenges", earned: false, color: "#7C3AED" },
  { id: "b4", name: "Scam Detective", icon: "🕵️", desc: "Identify suspicious scenarios", earned: false, color: "#ef4444" },
  { id: "b5", name: "Goal Getter", icon: "🎯", desc: "Complete a savings goal", earned: false, color: "#FFC857" },
  { id: "b6", name: "Giving Hero", icon: "❤️", desc: "Complete a giving challenge", earned: false, color: "#ec4899" },
  { id: "b7", name: "Financial Hero", icon: "👑", desc: "Complete the learning journey", earned: false, color: "#FFC857" },
];

export const skills = [
  { id: "saving", name: "Saving", value: 80, color: "#00B894" },
  { id: "budgeting", name: "Budgeting", value: 60, color: "#7C3AED" },
  { id: "spending", name: "Smart Spending", value: 70, color: "#3b82f6" },
  { id: "safety", name: "Safety", value: 90, color: "#ef4444" },
  { id: "digital", name: "Digital Finance", value: 55, color: "#0F2D52" },
  { id: "goals", name: "Goal Setting", value: 75, color: "#FFC857" },
];

export const todayMissions = [
  { id: "tm1", title: "Smart Saving Challenge", desc: "You received 100 EGP. How would you use it?", difficulty: "Easy", xp: 75, icon: "💰", color: "#00B894", game: "gm8", progress: 0 },
  { id: "tm2", title: "Spot the Scam", desc: "Identify a suspicious message", difficulty: "Medium", xp: 50, icon: "🕵️", color: "#ef4444", game: "gm9", progress: 0 },
  { id: "tm3", title: "Build a Budget", desc: "Allocate 500 EGP wisely", difficulty: "Medium", xp: 50, icon: "📊", color: "#7C3AED", game: "gm2", progress: 0 },
];

export const playLearnCards = [
  { id: "pl1", title: "Smart Shopper", desc: "Compare value, not just price", difficulty: "Easy", xp: 50, icon: "🛒", color: "#00B894", game: "gm8", progress: 60, locked: false },
  { id: "pl2", title: "Saving Hero", desc: "Reach your savings goal", difficulty: "Easy", xp: 50, icon: "🐷", color: "#3b82f6", game: "gm11", progress: 35, locked: false },
  { id: "pl3", title: "Budget Master", desc: "Balance needs, wants & savings", difficulty: "Medium", xp: 50, icon: "📊", color: "#7C3AED", game: "gm2", progress: 0, locked: false },
  { id: "pl4", title: "Scam Detective", desc: "Catch fake messages & fraud", difficulty: "Medium", xp: 50, icon: "🕵️", color: "#ef4444", game: "gm9", progress: 0, locked: false },
  { id: "pl5", title: "Future Investor", desc: "Learn risk & return (ages 12+)", difficulty: "Hard", xp: 60, icon: "🚀", color: "#f97316", game: "gm10", progress: 0, locked: true },
];

export const realLifeMissions = [
  { id: "rlm1", title: "Save part of your allowance", child: "Lotfy", world: "Saving Hero", desc: "Set aside 20 EGP from this week's allowance into savings.", xp: 100, status: "available", icon: "🐷", color: "#00B894", date: "This week", submission: null },
  { id: "rlm2", title: "Compare prices before buying", child: "Lotfy", world: "Smart Shopper", desc: "Before your next purchase, compare 2 options and pick the best value.", xp: 100, status: "in-progress", icon: "🛒", color: "#3b82f6", date: "This week", submission: "Compared football prices at 2 stores" },
  { id: "rlm3", title: "Identify a scam with a parent", child: "Lotfy", world: "Scam Detective", desc: "Show a parent a suspicious message you received and discuss it.", xp: 100, status: "waiting-approval", icon: "🕵️", color: "#ef4444", date: "2 days ago", submission: "Showed mom a fake prize SMS" },
  { id: "rlm4", title: "Build a weekly budget", child: "Lotfy", world: "Budget Master", desc: "Plan your allowance across needs, wants, and savings for one week.", xp: 100, status: "approved", icon: "📊", color: "#7C3AED", date: "Last week", submission: "50 needs, 30 wants, 20 savings", approvedBy: "Dad" },
];

export const smartShopperScenarios = [
  {
    prompt: "Lotfy wants to buy a football ⚽. Which is the smartest choice?",
    options: [
      { id: "a", label: "SuperBall", price: 90, rating: 4.6, quality: "High", note: "Great quality, fair price" },
      { id: "b", label: "CheapKick", price: 40, rating: 2.1, quality: "Low", note: "Cheapest but breaks fast" },
      { id: "c", label: "ProGold", price: 250, rating: 4.8, quality: "Premium", note: "Best quality but very pricey" },
    ],
    answer: "a",
    explain: "Great choice! 🌟 You compared VALUE, not just price. The SuperBall has great quality at a fair price. The cheapest one breaks fast (false economy), and the premium one costs way more than needed.",
  },
  {
    prompt: "Time for school notebooks 📓. Which is the smartest choice?",
    options: [
      { id: "a", label: "Single notebook", price: 15, rating: 4.0, quality: "OK", note: "Only 1 notebook" },
      { id: "b", label: "Pack of 5", price: 50, rating: 4.5, quality: "Good", note: "5 notebooks — best value per book" },
      { id: "c", label: "Luxury set", price: 120, rating: 4.9, quality: "Premium", note: "Fancy cover, same pages" },
    ],
    answer: "b",
    explain: "Smart! 📦 The pack of 5 gives the best value per notebook. You compared price AND quantity — that's unit-price thinking. The luxury set costs more for the same pages.",
  },
  {
    prompt: "Lotfy sees a toy on sale 🎮. Which is the smartest choice?",
    options: [
      { id: "a", label: "Buy now (impulse)", price: 120, rating: 3.5, quality: "OK", note: "On sale — but do you need it?" },
      { id: "b", label: "Wait & think 1 day", price: 120, rating: 3.5, quality: "OK", note: "Same price, less impulse" },
      { id: "c", label: "Buy 2 (bulk deal)", price: 200, rating: 3.5, quality: "OK", note: "More than you need" },
    ],
    answer: "b",
    explain: "Wise! 🧠 Waiting a day beats impulse buying. Sales can trick you into buying things you don't need. The 'pause before purchase' habit saves money and avoids regret.",
  },
];

export const scamDetectiveScenarios = [
  {
    prompt: "📩 You got this message: 'Congratulations! You won 5,000 EGP! Click this link now to claim!'",
    options: [
      { id: "a", label: "Click the link", correct: false, explain: "⚠️ Never click! This is a fake prize scam. Real prizes don't come from random links." },
      { id: "b", label: "Ignore it", correct: true, explain: "✅ Good! Ignoring is safe. But you can do even better…" },
      { id: "c", label: "Report & tell a parent", correct: true, explain: "🏆 Best move! Reporting protects others, and a parent can help block the sender." },
      { id: "d", label: "Share your PIN to verify", correct: false, explain: "🚨 Never share your PIN! Banks never ask for it. This is how thieves steal money." },
    ],
  },
  {
    prompt: "📧 Email: 'Your account is blocked! Send your password to verify or lose your money!'",
    options: [
      { id: "a", label: "Send the password", correct: false, explain: "🚨 Never share passwords! Real banks never ask by email." },
      { id: "b", label: "Ask a parent & report", correct: true, explain: "🏆 Correct! This is phishing — fake urgency to steal your info. Always check with a trusted adult." },
      { id: "c", label: "Reply asking who they are", correct: false, explain: "⚠️ Replying confirms your email is active — scammers will target you more." },
    ],
  },
  {
    prompt: "💬 A stranger online: 'Send me 200 EGP and I'll send you back 2,000 EGP tomorrow!'",
    options: [
      { id: "a", label: "Send the money", correct: false, explain: "🚨 This is a 'get-rich-quick' scam. You'll never see your money again." },
      { id: "b", label: "Block & tell a parent", correct: true, explain: "🏆 Perfect! Block the stranger and tell a trusted adult. Easy money offers are always scams." },
    ],
  },
  {
    prompt: "📱 Pop-up: 'Your phone has a virus! Install this app to clean it now!'",
    options: [
      { id: "a", label: "Install the app", correct: false, explain: "🚨 Fake virus alerts install malware. Your phone is probably fine." },
      { id: "b", label: "Close it & ask a parent", correct: true, explain: "🏆 Smart! Close pop-ups and check with a parent before installing anything." },
    ],
  },
];

export const futureInvestorChoices = [
  { id: "save", label: "Keep it as savings", risk: "Very Low", return: "+3%", horizon: "Any time", color: "#00B894", outcome: 1030, note: "Safe & accessible, but grows slowly. Good for short-term goals." },
  { id: "mix", label: "Mixed: half savings, half investment", risk: "Medium", return: "+8%", horizon: "1-3 years", color: "#3b82f6", outcome: 1080, note: "Diversified! You spread risk — if one drops, the other may balance it. Smart long-term thinking." },
  { id: "invest", label: "All in one investment", risk: "High", return: "+15% or -10%", horizon: "3+ years", color: "#ef4444", outcome: 1150, note: "Highest potential but riskiest. You could lose money. Never put all eggs in one basket!" },
];

export const savingHeroGoal = { name: "Football", icon: "⚽", target: 500, current: 300, color: "#3b82f6", weeklyOptions: [50, 100, 150] };

export const timeAgo = (iso) => {
  const d = new Date(iso);
  const now = new Date("2026-07-27T06:28:00");
  const diff = (now - d) / 3600000;
  if (diff < 1) return `${Math.round(diff * 60)}m ago`;
  if (diff < 24) return `${Math.floor(diff)}h ago`;
  return `${Math.floor(diff / 24)}d ago`;
};