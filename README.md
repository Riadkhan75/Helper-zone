# Campus Help Zone (ক্যাম্পাস হেল্প জোন)

আধুনিক, নিরাপদ ও সম্পূর্ণ কলেজ স্টুডেন্ট কমিউনিটি ওয়েব প্ল্যাটফর্ম। এই প্ল্যাটফর্মের মাধ্যমে শিক্ষার্থীরা হ্যান্ডনোট ও প্রশ্নব্যাংক আদান-প্রদান করতে পারে, একাডেমিক বই ক্রয়-বিক্রয় ও বিনিময় করতে পারে, ক্যাম্পাসে হারানো যেকোনো জিনিস সহজে ফেরত পেতে পারে এবং বিভিন্ন সাহায্য ও প্রশ্নের সমাধান খুঁজে পেতে পারে।

---

## ১. প্রজেক্ট ফাইল স্ট্রাকচার (Project Structure)

```
campus-help-zone/
├── index.html                   # HTML Entry Point with Bengali Google Fonts
├── metadata.json                # AI Studio Metadata
├── package.json                 # Dependencies & Scripts
├── tsconfig.json                # TypeScript Configurations
├── vite.config.ts               # Vite & Tailwind Plugins
├── firestore.rules              # Cloud Firestore Security Rules (RBAC, Deny-by-default)
├── storage.rules                # Firebase Storage Security Rules
├── .env.example                 # Environment Variables Reference
├── README.md                    # Project Documentation & Guides
│
├── functions/                   # Cloud Functions (Server-side Admin Claims & Triggers)
│   ├── package.json
│   └── index.js
│
└── src/
    ├── main.tsx                 # React App Mount
    ├── App.tsx                  # Main App Shell & Routing (/adminriad)
    ├── index.css                # Tailwind CSS v4 & Typography Base
    ├── assets/
    │   └── images/              # Generated High-Resolution Campus Photography
    │       ├── campus_students_hero_*.jpg
    │       ├── study_library_notes_*.jpg
    │       └── campus_lost_found_*.jpg
    ├── types/
    │   └── index.ts             # Complete TypeScript Interfaces
    ├── services/
    │   ├── firebase.ts          # Firebase Initialization with Local Store Fallback
    │   └── seedData.ts          # Realistic Bengali College Community Seed Data
    ├── context/
    │   ├── AuthContext.tsx      # Authentication, Roles, RBAC & Demo Switcher
    │   └── AppContext.tsx       # Global State, Content CRUD, Notices & Toast Store
    └── components/
        ├── common/
        │   ├── Header.tsx       # 3-Zone Desktop Navigation Bar
        │   ├── BottomNav.tsx    # Mobile Thumb-Zone Navigation Bar
        │   ├── Toast.tsx        # Toast Notification System
        │   ├── ConfirmModal.tsx # Confirmation Dialog for Destructive Actions
        │   └── ReportModal.tsx  # Community Moderation Reporting Dialog
        ├── auth/
        │   ├── AuthModal.tsx    # Sign In, Sign Up & One-Click Demo Switcher
        │   └── ProfileEditModal.tsx # Student Profile & Privacy Settings
        ├── home/
        │   ├── HomeView.tsx     # Homepage with Hero, Search, Shortcuts & Post Stream
        │   └── NoticeBanner.tsx # Urgent College Notice Carousel
        ├── study/
        │   ├── StudyView.tsx    # Resource Vault (Notes, Question Banks, Filter, Download)
        │   └── UploadMaterialModal.tsx # Resource Upload with File Verification
        ├── books/
        │   ├── BooksView.tsx    # Buy/Sell/Exchange Hub & Safe Seller Contact
        │   └── AddBookModal.tsx # Book Listing Creator
        ├── lostfound/
        │   ├── LostFoundView.tsx# Lost & Found Desk with Privacy Warnings
        │   └── AddLostFoundModal.tsx # Lost/Found Reporting Form
        ├── community/
        │   ├── CommunityView.tsx# Student Forums, Polls, Tuition & Study Partners
        │   ├── CreatePostModal.tsx # Post Creation with Poll Builder
        │   └── PostDetailModal.tsx # Nested Comments, Replies & Interactive Voting
        ├── notifications/
        │   └── NotificationsView.tsx # System Notifications & Admin Broadcasts
        ├── profile/
        │   └── ProfileView.tsx  # User Profile & Activity History
        └── admin/
            └── AdminPanel.tsx   # Complete Management Dashboard (/adminriad)
```

---

## ২. Firebase সেটআপ নির্দেশনা (Firebase Setup Instructions)

### ধাপ ১: Firebase প্রজেক্ট তৈরি
১. [Firebase Console](https://console.firebase.google.com/)-এ যান এবং `Add project` ক্লিক করে নতুন প্রজেক্ট তৈরি করুন।  
২. **Authentication** সেকশনে যান:
   - `Email/Password` প্রভাইডার সক্রিয় (Enable) করুন।
৩. **Cloud Firestore** সেকশনে যান:
   - `Create database` ক্লিক করে প্রোডাকশন মোড নির্বাচন করুন।
৪. **Firebase Storage** সেকশনে যান:
   - `Get started` ক্লিক করে স্টোরেজ বাকেট তৈরি করুন।

### ধাপ ২: এনভায়রনমেন্ট ভেরিয়েবল কনফিগারেশন
প্রজেক্টের রুট ডিরেক্টরিতে `.env` ফাইল তৈরি করুন এবং `.env.example` থেকে মান বসিয়ে দিন:

```env
VITE_FIREBASE_API_KEY="AIzaSyYourApiKeyHere"
VITE_FIREBASE_AUTH_DOMAIN="your-app.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-app"
VITE_FIREBASE_STORAGE_BUCKET="your-app.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789012"
VITE_FIREBASE_APP_ID="1:123456789012:web:abcdef1234567890"
VITE_ADMIN_EMAIL="nazrulpost75@gmail.com"
```

> **বিশেষ সুবিধা:** যদি আপনার কাছে এই মুহূর্তে ফায়ারবেজ কি (Keys) না থাকে, অ্যাপ্লিকেশনটি স্বয়ংক্রিয়ভাবে একটি উচ্চ-ক্ষমতাসম্পন্ন লোকাল স্টোরেজ সিমুলেশন মোডে চলবে। আপনি প্রতিটি ফিচার তাৎক্ষণিকভাবে পরীক্ষা করতে পারবেন!

---

## ৩. সিকিউরিটি রুলস ডিপ্লয়মেন্ট (Security Rules)

প্রজেক্টে সম্পূর্ণ `firestore.rules` ও `storage.rules` দেওয়া রয়েছে। এগুলো ডেপ্লয় করতে:

```bash
# Firebase CLI ইনস্টল না থাকলে:
npm install -g firebase-tools

# Firebase লগইন ও প্রজেক্ট সিলেক্ট:
firebase login
firebase use your-project-id

# সিকিউরিটি রুলস ডিপ্লয়:
firebase deploy --only firestore:rules
firebase deploy --only storage
```

---

## ৪. নিরাপদ Admin Role তৈরির নির্দেশনা

সাধারণ ব্যবহারকারীরা কখনোই ক্লায়েন্ট সাইড থেকে এডমিন রোল পেতে পারে না। এডমিন অ্যাক্সেস সুরক্ষিত রাখার উপায়:

১. **ডিফল্ট ইমেইল যাচাই:** সিস্টেম স্বয়ংক্রিয়ভাবে `nazrulpost75@gmail.com` ইমেইলকে সুরক্ষিত প্রধান এডমিন হিসেবে শনাক্ত করে।
২. **Cloud Functions কাস্টম ক্লেইম:** `functions/index.js` ফাইলে `onUserCreated` ট্রিগার রাখা হয়েছে। যখন অনুমোদিত ইমেইল অ্যাকাউন্ট তৈরি হয়, তখন সার্ভার-সাইড Firebase Admin SDK দিয়ে `{ admin: true }` কাস্টম টোকেন ক্লেইম সেট করা হয়।
৩. **ম্যানুয়ালি Firebase CLI দিয়ে ক্লেইম দিতে চাইলে:**
```bash
node -e '
const admin = require("firebase-admin");
admin.initializeApp();
admin.auth().getUserByEmail("nazrulpost75@gmail.com").then(u => {
  return admin.auth().setCustomUserClaims(u.uid, { admin: true });
}).then(() => console.log("Admin claims granted!"));
'
```

---

## ৫. লোকাল ডেভেলপমেন্ট ও বিল্ড কমান্ডস

```bash
# ডিপেন্ডেন্সি ইনস্টল
npm install

# লোকাল ডেভেলপমেন্ট সার্ভার চালু (Port 3000)
npm run dev

# প্রোডাকশন বিল্ড তৈরি
npm run build

# বিল্ড প্রিভিউ
npm run preview
```

---

## ৬. Vercel Deployment Instructions

১. প্রজেক্টটি GitHub রিপোজিটরিতে পুশ করুন।
২. [Vercel](https://vercel.com/)-এ লগইন করে `Add New Project` সিলেক্ট করুন।
৩. গিটহাব রিপোজিটরিটি সিলেক্ট করুন।
৪. **Build and Output Settings:**
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
৫. **Environment Variables:**
   - `.env.example`-এর সকল ভেরিয়েবল Vercel Project Settings -> Environment Variables-এ যোগ করুন।
৬. `Deploy` বাটনে ক্লিক করুন। এক মিনিটের মধ্যে লাইভ সাইট প্রস্তুত হয়ে যাবে!

---

## ৭. গুরুত্বপূর্ণ ফিচার টেস্ট চেকলিস্ট (Test Checklist)

| ফিচার | টেস্ট করণীয় | প্রত্যাশিত ফলাফল |
| :--- | :--- | :--- |
| **Authentication** | ডেমো সুইচ বা নতুন রেজিস্ট্রেশন করুন | তাৎক্ষণিক প্রোফাইল লোড ও লগইন সম্পন্ন হবে |
| **RBAC / Admin Protection** | সাধারণ ছাত্র অ্যাকাউন্টে `/adminriad`-এ প্রবেশ করুন | অ্যাক্সেস ডিনাইড মেসেজ আসবে; এডমিন হলে ড্যাশবোর্ড লোড হবে |
| **Home Page** | সার্চবারে 'ক্যালকুলাস' লিখুন | পোস্ট, রিসোর্স এবং বইয়ের মধ্যে ফিল্টার হবে |
| **Notice Banner** | এডমিন প্যানেল থেকে নতুন নোটিশ প্রকাশ করুন | হোমপেজ ব্যানারে জরুরি অ্যালার্ট চলে আসবে |
| **Study Zone Upload** | ১৫MB-এর বেশি ফাইল অথবা সাধারণ ছাত্র হিসেবে আপলোড দিন | সাইজ লিমিট ভ্যালিডেশন হবে এবং পেন্ডিং কিউতে জমা হবে |
| **Admin Approval** | এডমিন প্যানেল -> অপেক্ষমাণ অনুমোদন -> 'অনুমোদন করুন' চাপুন | স্টাডি ফাইলটি পাবলিকলি পাবলিশ হবে এবং আপলোডকারী নোটিফিকেশন পাবে |
| **Book Exchange** | নতুন বই লিস্টিং দিন এবং 'যোগাযোগ' চাপুন | বিক্রেতার নম্বর সুরক্ষিত মোডালে সতর্কতা সহ আসবে |
| **Lost & Found** | আইডি কার্ড বা ওয়ালেট ক্যাটাগরিতে পোস্ট দিন | গোপনীয়তা ও সংবেদনশীল তথ্য সতর্কতা ব্যানার দেখাবে |
| **Community Poll** | কমিউনিটি পোস্টে পোলের অপশনে ভোট দিন | রিয়েলটাইম ভোটের শতাংশ ও মোট সংখ্যা আপডেট হবে |
| **Report System** | যেকোনো পোস্ট বা ফাইলে ফ্ল্যাগ আইকন চেপে রিপোর্ট করুন | এডমিন প্যানেলের রিপোর্ট কিউতে চলে আসবে |
