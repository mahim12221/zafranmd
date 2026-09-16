# 🌐 ZAFRAN E-COMMERCE - PRODUCTION DEPLOYMENT GUIDE
=========================================================
(ফুল-স্ট্যাক ফ্রি ডিপ্লয়মেন্ট বিস্তারিত গাইডলাইন)

এই প্রজেক্টটি একটি **Full-Stack Single-Server Architecture** (Node.js + Express API + React 19 Frontend)।
এটি ফ্রন্টএন্ড এবং ব্যাকএন্ড একসাথে একটিমাত্র সার্ভার থেকে নিখুঁতভাবে হ্যান্ডেল করে।

---

## 🏆 কোন প্ল্যাটফর্মে ডিপ্লয় করা সবচেয়ে ভালো? (Best Platform Comparison)

| প্ল্যাটফর্ম (Platform) | টাইপ (Type) | ফ্রি টিয়ার (Free Tier) | এই প্রজেক্টের জন্য উপযুক্ততা | রেটিং |
|---|---|---|---|---|
| **Render.com** 🥇 (সেরা পছন্দ) | Web Service (Node.js) | ✅ 100% Free (Forever) | সবচেয়ে সহজ। ১ ক্লিকে ফুল-স্ট্যাক লাইভ হয়। | ⭐⭐⭐⭐⭐ (Best) |
| **Railway.app** 🥈 | Web Service / Container | ✅ $5 Free Monthly Credit | সুপার ফাস্ট, ইনস্ট্যান্ট ডিপ্লয়। | ⭐⭐⭐⭐ |
| **Vercel** 🥉 | Serverless Platform | ✅ 100% Free (Front/Serverless) | সার্ভারলেস কনফিগ (API ফাংশন) প্রয়োজন। | ⭐⭐⭐ |

> 💡 **আমাদের পরামর্শ:** সম্পূর্ণ ফ্রিতে এবং কোনো জটিলতা ছাড়া এই প্রজেক্ট লাইভ করার জন্য **Render.com** হলো সবচেয়ে সেরা ও সহজ মাধ্যম। নিচে সম্পূর্ণ স্টেপ-বাই-স্টেপ গাইড দেওয়া হলো।

---

## 📋 ধাপ ১: ফ্রি ডাটাবেস ও ইমেজ স্টোরেজ তৈরি করা (MongoDB & Cloudinary)

### ১. MongoDB Atlas (ফ্রি ডাটাবেস):
1. https://www.mongodb.com/cloud/atlas এ গিয়ে বিনামূল্যে একটি অ্যাকাউন্ট তৈরি করুন।
2. একটি ফ্রি **M0 Cluster (Free Shared)** তৈরি করুন।
3. `Database Access` থেকে একটি ইউজারনেম এবং স্ট্রং পাসওয়ার্ড তৈরি করুন।
4. `Network Access` থেকে `Add IP Address` -> `Allow Access from Anywhere (0.0.0.0/0)` সিলেক্ট করুন।
5. `Connect` বাটনে ক্লিক করে `Drivers` সিলেক্ট করুন এবং আপনার **MongoDB Connection String (URI)** টি কপি করে সংরক্ষণ করুন।
   *(উদাহরণ: `mongodb+srv://user:password@cluster0.abcde.mongodb.net/zafran?retryWrites=true&w=majority`)*

### ২. Cloudinary (ফ্রি ইমেজ হোস্টিং):
1. https://cloudinary.com এ ফ্রি সাইনআপ করুন।
2. ড্যাশবোর্ড থেকে আপনার **Cloud Name**, **API Key**, এবং **API Secret** কপি করে রাখুন।

---

## 🚀 ধাপ ২: GitHub-এ কোড আপলোড করা

1. https://github.com এ যান এবং একটি নতুন **New Repository** তৈরি করুন (যেমন: `zafran-ecommerce`)।
2. আপনার লোকাল ফোল্ডারে টার্মিনাল ওপেন করে নিচের কমান্ডগুলো চালান:

```bash
git init
git add .
git commit -m "Initial commit of Zafran E-commerce"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/zafran-ecommerce.git
git push -u origin main
```

---

## 🌟 ধাপ ৩: Render.com-এ ফ্রি ডিপ্লয় করার ধাপ (Step-by-step on Render)

1. **Render সাইনআপ করুন**: https://render.com এ যান এবং আপনার GitHub অ্যাকাউন্ট দিয়ে লগইন করুন।
2. **নতুন Web Service তৈরি করুন**:
   - ড্যাশবোর্ডের ডানপাশে **New +** বাটনে ক্লিক করে **Web Service** সিলেক্ট করুন।
   - আপনার GitHub রিপোজিটরি (`zafran-ecommerce`) সিলেক্ট করে **Connect** করুন।
3. **কনফিগারেশন সেটিংস (Settings)**:
   - **Name**: `zafran-store` (অথবা আপনার পছন্দমতো নাম)
   - **Language / Runtime**: `Node`
   - **Region**: Singapore বা Frankfurt (কাছাকাছি লোকেশন)
   - **Branch**: `main`
   - **Build Command**: 
     ```bash
     npm install && npm run build
     ```
   - **Start Command**: 
     ```bash
     npm start
     ```
   - **Instance Type**: `Free` ($0/month)

4. **Environment Variables যুক্ত করুন (জরুরি)**:
   স্ক্রোল করে নিচে `Environment Variables` অপশনে গিয়ে `Add Environment Variable` চাপুন এবং নিচের কী-গুলো দিন:
   - `NODE_ENV` = `production`
   - `MONGODB_URI` = *(আপনার MongoDB connection string)*
   - `CLOUDINARY_NAME` = *(আপনার Cloudinary Cloud Name)*
   - `CLOUDINARY_API_KEY` = *(আপনার Cloudinary API Key)*
   - `CLOUDINARY_SECRET_KEY` = *(আপনার Cloudinary Secret Key)*
   - `JWT_SECRET` = *(একটি গোপন পাসফ্রেজ, যেমন: `zafran_super_secret_key_2026`)*
   - `ADMIN_EMAIL` = *(আপনার এডমিন ইমেইল, যেমন: `admin@zafran.com`)*
   - `ADMIN_PASSWORD` = *(আপনার এডমিন পাসওয়ার্ড, যেমন: `admin1234`)*

5. **Deploy বাটনে ক্লিক করুন**:
   - নিচে **Create Web Service** বাটনে ক্লিক করুন।
   - ২-৩ মিনিটের মধ্যে Render বিল্ড কমপ্লিট করে আপনাকে একটি লাইভ URL দিয়ে দেবে (যেমন: `https://zafran-store.onrender.com`)।

🎉 **অভিনন্দন! আপনার ই-কমার্স ওয়েবসাইট এখন বিশ্বজুড়ে সবার জন্য লাইভ!**

---

## ⚡ বিকল্প: Railway.app-এ ডিপ্লয় করতে চাইলে (Alternative: Railway)

1. https://railway.app এ যান এবং GitHub দিয়ে লগইন করুন।
2. **New Project** -> **Deploy from GitHub repo** সিলেক্ট করুন।
3. রিপোজিটরি অ্যাড করার পর `Variables` ট্যাবে গিয়ে একই Environment Variables গুলো যুক্ত করুন (`MONGODB_URI`, `CLOUDINARY_NAME`, ইত্যাদি)।
4. `Settings` -> `Networking` -> `Generate Domain` এ ক্লিক করলেই আপনার সাইট লাইভ হয়ে যাবে।

---

## 📱 অ্যাডমিন প্যানেল পরিচালনা (Post-Deployment Admin Usage)
- লাইভ হওয়ার পর ভিজিট করুন: `https://your-live-url.com/admin`
- আপনার নির্ধারিত এডমিন ইমেইল ও পাসওয়ার্ড দিয়ে লগইন করে:
  - নতুন পণ্য যুক্ত করতে পারবেন (৪টি পর্যন্ত ছবি ও বিভিন্ন কালার অপশন সহ)।
  - সকল অর্ডারের স্ট্যাটাস পরিবর্তন করতে পারবেন (Shipped, Out for Delivery, Delivered)।
  - ব্যানার ও ডিসকাউন্ট কন্ট্রোল করতে পারবেন।
