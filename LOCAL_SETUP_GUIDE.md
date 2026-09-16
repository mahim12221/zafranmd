# 🚀 ZAFRAN E-COMMERCE - LOCAL SETUP & RUN GUIDE
=====================================================
(বাংলা ও ইংরেজি বিস্তারিত নির্দেশিকা)

এই প্রজেক্টটি একটি ফুল-স্ট্যাক ই-কমার্স ওয়েব অ্যাপ্লিকেশন (React 19 + Tailwind CSS + Node.js Express + MongoDB + Cloudinary)।

---

## 📦 ১. সিস্টেম রিকোয়ারমেন্টস (System Requirements)
আপনার কম্পিউটারে নিচের সফটওয়্যারগুলো আগে থেকে ইনস্টল করা থাকতে হবে:
1. **Node.js** (Version 18 বা তার বেশি, রিকমেন্ডেড v20 LTS) -> ডাউনলোড লিঙ্ক: https://nodejs.org
2. **Git** (অপশনাল, কিন্তু GitHub-এ কোড আপলোড করার জন্য ভালো) -> https://git-scm.com
3. **VS Code** বা যেকোনো কোড এডিটর।

---

## 💻 ২. আপনার সিস্টেমে প্রজেক্টটি চালু করার ধাপসমূহ (Step-by-step Local Run)

### ধাপ ১: প্রজেক্ট ডাউনলোড ও এক্সট্র্যাক্ট করা
- AI Studio-এর সেটিংস / Export অপশন থেকে প্রজেক্টটির **ZIP ফাইল** ডাউনলোড করুন অথবা GitHub থেকে ক্লোন করুন।
- জিপ ফাইলটি আনজিপ (Extract) করুন এবং VS Code-এ ফোল্ডারটি ওপেন করুন।

### ধাপ ২: টার্মিনাল ওপেন করুন
- VS Code-এর মেনু থেকে `Terminal` -> `New Terminal` এ ক্লিক করুন।

### ধাপ ৩: ডিপেন্ডেন্সি ইনস্টল করা (Install Dependencies)
টার্মিনালে নিচের কমান্ডটি লিখুন এবং এন্টার চাপুন:
```bash
npm install
```
> এটি রুট ফোল্ডার, ব্যাকএন্ড এবং ফ্রন্টএন্ডের সমস্ত লাইব্রেরি প্যাকেজ (Express, React, Tailwind, Mongoose ইত্যাদি) স্বয়ংক্রিয়ভাবে ইনস্টল করে নিবে।

---

## 🔑 ৩. এনভায়রনমেন্ট ভেরিয়েবল (.env) সেটআপ

প্রজেক্টের রুট ফোল্ডারে `.env.example` নামে একটি ফাইল রয়েছে।
1. রুট ডিরেক্টরিতে একটি নতুন ফাইল তৈরি করুন যার নাম দিন `.env`
2. `.env` ফাইলে নিচের লাইনগুলো কপি করে বসিয়ে দিন:

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string_here
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_SECRET_KEY=your_cloudinary_secret
JWT_SECRET=zafran_secure_jwt_secret_2026
ADMIN_EMAIL=admin@zafran.com
ADMIN_PASSWORD=admin1234
VITE_BACKEND_URL=
```

> **টিপস:** 
> - আপনি যদি কোনো MongoDB URI বা Cloudinary না দেন, তবুও প্রজেক্টটি লোকাল ইন-মেমোরি মোডে কাজ করবে (টেস্টিংয়ের জন্য)।
> - তবে ডাটা পারমানেন্টলি সেভ রাখার জন্য ফ্রি MongoDB Atlas এবং Cloudinary অ্যাকাউন্ট ব্যবহার করা জরুরি।

---

## ▶️ ৪. প্রজেক্ট লোকাল মেশিনে রান করা (Start Development Server)

টার্মিনালে রান করুন:
```bash
npm run dev
```

কিছুক্ষণের মধ্যে আপনার টার্মিনালে মেসেজ আসবে:
```
Server running on http://0.0.0.0:3000
```

এখন আপনার ব্রাউজারে (Chrome/Edge/Firefox) গিয়ে ওপেন করুন:
👉 **http://localhost:3000**

- ওয়েবসাইটটি চালু হয়ে যাবে।
- এডমিন প্যানেলে লগইন করার জন্য: `http://localhost:3000/admin`
  - **ইমেইল:** `admin@zafran.com`
  - **পাসওয়ার্ড:** `admin1234` (অথবা আপনার `.env`-এ দেওয়া পাসওয়ার্ড)

---

## 🏗️ ৫. প্রোডাকশন টেস্ট (Production Build & Run Locally)
লোকালি প্রোডাকশন বিল্ড টেস্ট করতে চাইলে:
```bash
npm run build
npm start
```
এবং ব্রাউজারে `http://localhost:3000` ভিজিট করুন।
