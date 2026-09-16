# জাফরান (Zafran) - সম্পূর্ণ ডেটাবেস কানেকশন, ব্র্যান্ডিং ও লাইভ ডেপ্লয়মেন্ট গাইডলাইন
**ফাউন্ডার ও সিইও:** মাহিম আফ্রিদি (Mahim Afridi)  
**ওয়েবসাইট/ব্র্যান্ড:** Zafran (জাফরান)  
**মোবাইল/হোয়াটসঅ্যাপ:** 01880172859 / 01742111888  
**ফেসবুক প্রোফাইল:** https://www.facebook.com/mahim.afridi.136555  
**গিটহাব রিপোজিটরি:** https://github.com/mahim12221/zafranmd.git  

---

## ১. কাস্টমাইজেশন ও ব্র্যান্ডিং ফাইল তালিকা (Branding & Code Updates)

আপনার ওয়েবসাইটের পুরোনো "Forever" ব্র্যান্ডিং সম্পূর্ণ পরিবর্তন করে "Zafran" এবং আপনার ব্যক্তিগত ও প্রাতিষ্ঠানিক তথ্য নিম্নলিখিত ফাইলগুলোতে সফলভাবে আপডেট করা হয়েছে:

| ফাইলের নাম | আপডেটের বিবরণ |
|---|---|
| `frontend/src/components/Footer.jsx` | জাফরান ব্র্যান্ডের বিবরণ, মাহিম আফ্রিদির নাম, ফোন নম্বর (01880172859 / 01742111888), ফেসবুক লিঙ্ক, ঢাকা অফিস ঠিকানা এবং ২০২৫-২০২৬ কপিরাইট আপডেট। |
| `frontend/src/pages/About.jsx` | মাহিম আফ্রিদির ফাউন্ডার কোটেশন, জাফরানের লক্ষ্য, ভিশন, ফেসবুক ও গিটহাব কানেকশন বাটন। |
| `frontend/src/pages/Contact.jsx` | মাহিম আফ্রিদির ডিরেক্ট ফোন নম্বর, অফিশিয়াল ইমেইল (`contact@zafran.com`), ব্যক্তিগত ইমেইল (`mahim.afridi@zafran.com`), ফেসবুক ও হোয়াটসঅ্যাপ বাটন। |
| `frontend/src/pages/PrivacyPolicy.jsx` | মাহিম আফ্রিদি ও জাফরান ব্র্যান্ডের নিজস্ব প্রাইভেসি পলিসি পেজ তৈরি করা হয়েছে এবং রাউটে যুক্ত করা হয়েছে। |
| `frontend/src/assets/logo.svg` | আধুনিক প্রিমিয়াম জাফরান ভেক্টর লোগো তৈরি ও ফ্রন্টএন্ডে ইন্টিগ্রেট করা হয়েছে। |
| `admin/src/assets/logo.svg` | জাফরান অ্যাডমিন ড্যাশবোর্ডের জন্য ডেডিকেটেড লোগো তৈরি করা হয়েছে। |
| `frontend/src/components/OurPolicy.jsx` | পলিসি সেকশনের টেক্সট ঠিক করা হয়েছে (Exchange, 7 Days Return, Dedicated Support)। |
| `frontend/src/components/NewsletterBox.jsx` | জাফরান ভিআইপি নিউজলেটার সাবস্ক্রিপশন ও নোটিফিকেশন টেক্সট যোগ করা হয়েছে। |
| `metadata.json` & `frontend/index.html` | ওয়েবসাইটের মেটা টাইটেল ও ডেসক্রিপশন "Zafran" হিসেবে কনফিগার করা হয়েছে। |

---

## ২. MongoDB ডেটাবেস সেটআপ ও কানেকশন স্ট্যাটাস (বর্তমানে লাইভ কানেক্টেড!)

**অভিনন্দন!** আপনি MongoDB Atlas-এ `0.0.0.0/0` সফলভাবে সেট করেছেন এবং জাফরান অ্যাপটি সরাসরি আপনার আসল **MongoDB Atlas ক্লাস্টারের সাথে সফলভাবে কানেক্টেড (`database: mongodb`)** হয়েছে। প্রাথমিক প্রোডাক্টগুলো স্বয়ংক্রিয়ভাবে আপনার ডেটাবেসে সিড (Save) হয়ে গেছে।

### ক্লাস্টার ও কানেকশন তথ্য:
- **কানেক্টেড ডেটাবেস:** `e-commerce` (MongoDB Atlas)
- **কানেকশন মোড:** লাইভ ক্লাউড ডেটাবেস (সকল প্রোডাক্ট, ইউজার ও অর্ডার এখন সরাসরি আপনার ক্লাউড ডেটাবেসেই সংরক্ষিত হচ্ছে)

---

## ২.১. VITE_BACKEND_URL নিয়ে বিস্তারিত ও সহজ ব্যাখ্যা (কেন কোনো ভয়ের কারণ নেই)

আপনার মনে `VITE_BACKEND_URL` নিয়ে যে প্রশ্ন ও চিন্তা রয়েছে, তা নিচে অত্যন্ত সহজ ভাষায় সমাধান করে দেওয়া হলো:

### ১. এই প্রজেক্টে `VITE_BACKEND_URL` কীভাবে কাজ করে?
আমাদের কোডে ফ্রন্টএন্ড (`ShopContext.jsx` ও অ্যাডমিন `App.jsx`)-এ আমরা এটি এভাবে হ্যান্ডেল করেছি:
```javascript
const rawBackendUrl = import.meta.env.VITE_BACKEND_URL || '';
const backendUrl = rawBackendUrl.trim().replace(/\/+$/, '');
```

### ২. কখন `VITE_BACKEND_URL` ফাঁকা (`""`) থাকবে?
- **Render-এ সম্পূর্ণ অ্যাপ একসাথে ডেপ্লয় করলে:**
  আপনি যদি Render-এ একটিমাত্র ওয়েব সার্ভিসে ফ্রন্টএন্ড ও ব্যাকএন্ড একসাথে চালান (যেটি আমাদের প্রজেক্ট কনফিগারেশন), তখন ফ্রন্টএন্ড এবং ব্যাকএন্ড একই ডোমেইন থেকে পরিবেশিত হয়।
  - এই ক্ষেত্রে `VITE_BACKEND_URL` কোনো মান দেওয়ার প্রয়োজন নেই (খালি রাখলেই যথেষ্ট)!
  - কারণ খালি থাকলে ব্রাউজার সরাসরি রিলেটিভ পাথ (যেমন: `/api/product/list`, `/api/order/place`) কল করে, যার ফলে কোনো CORS এরর বা URL ভুলের সম্ভাবনা থাকে না।

### ৩. কখন `VITE_BACKEND_URL` সেট করতে হবে?
- আপনি যদি **ফ্রন্টএন্ড Vercel-এ** এবং **ব্যাকএন্ড Render-এ** আলাদা আলাদা হোস্টিংয়ে চালান:
  - ধরুন আপনার ব্যাকএন্ডের লিঙ্ক: `https://zafran-api.onrender.com`
  - তখন Vercel-এর Environment Variables-এ গিয়ে লিখবেন:
    - **Key:** `VITE_BACKEND_URL`
    - **Value:** `https://zafran-api.onrender.com`
- **ট্রেইলিং স্ল্যাশ (`/`) থাকলে কি সমস্যা হবে?**
  না! আমরা কোডে `.replace(/\/+$/, '')` যুক্ত করে দিয়েছি, যার ফলে আপনি শেষে স্ল্যাশ দিলেও (যেমন: `...onrender.com/`) সিস্টেম নিজে থেকেই তা ঠিক করে নেবে। কোনো এরর আসবে না।

---

### ধাপ ১: MongoDB Atlas অ্যাকাউন্ট ও ক্লাস্টার তৈরি
১. [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) ওয়েবসাইটে যান এবং একটি ফ্রি অ্যাকাউন্ট খুলুন অথবা লগইন করুন।  
২. **Build a Database** বাটনে ক্লিক করে **M0 Free (Shared Sandbox)** অপশন নির্বাচন করুন (এটি আজীবন ফ্রি)।  
৩. Provider হিসেবে AWS এবং অঞ্চল হিসেবে কাছাকাছি কোনো স্থান (যেমন: Singapore বা Mumbai) সিলেক্ট করে **Create** করুন।

### ধাপ ২: ডেটাবেস ইউজার ও পাসওয়ার্ড তৈরি
১. ক্লাস্টার তৈরির সময় আপনাকে **Username** ও **Password** দিতে বলবে।  
   - উদাহরণ:  
     - Username: `zafran_admin`  
     - Password: `YourStrongPassword123` (পাসওয়ার্ডটি কোথাও লিখে রাখুন)  
২. **Create Database User** বাটনে ক্লিক করুন।

### ধাপ ৩: Network Access (IP Whitelist) কনফিগারেশন — অত্যন্ত গুরুত্বপূর্ণ!
ক্লাউড ডেপ্লয়মেন্ট (বা বর্তমান ক্লাউড রান/ভার্সেল সার্ভার) থেকে ডেটাবেস কানেক্ট করতে হলে এই ধাপটি বাধ্যতামূলক:  
১. বাঁদিকের মেনু থেকে **Security > Network Access**-এ যান।  
২. **Add IP Address** বাটনে ক্লিক করুন।  
৩. **ALLOW ACCESS FROM ANYWHERE** বাটনে ক্লিক করুন (এটি আইপি বক্সে `0.0.0.0/0` বসিয়ে দেবে)।  
৪. **Confirm** করুন। (এই আইপি অ্যাক্সেস না দিলে সার্ভার থেকে "Could not connect to any servers in your MongoDB Atlas cluster" বা IP whitelist এরর আসবে)।

### ধাপ ৪: Connection String (URI) কপি করা
১. বাঁদিকের মেনু থেকে **Deployment > Database**-এ যান।  
২. আপনার ক্লাস্টারের পাশে থাকা **Connect** বাটনে ক্লিক করুন।  
৩. **Drivers** অপশন বেছে নিন (Node.js)।  
৪. সেখানে একটি কানেকশন স্ট্রিং দেখতে পাবেন, যা দেখতে নিচের মতো:  
   `mongodb+srv://zafran_admin:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority`  
৫. `<password>`-এর জায়গায় আপনার তৈরি করা আসল পাসওয়ার্ডটি বসিয়ে দিন এবং শেষের দিকে ডেটাবেসের নাম (যেমন: `/zafran`) লিখে দিন।  
   - চূড়ান্ত উদাহরণ:  
     `mongodb+srv://zafran_admin:YourStrongPassword123@cluster0.abcde.mongodb.net/zafran?retryWrites=true&w=majority`

---

## ৩. `.env` (Environment Variables) ফাইল ফরম্যাট

আপনার ব্যাকএন্ড রুট ফোল্ডারে বা সার্ভার কনফিগারেশনে একটি `.env` ফাইল তৈরি করে নিচের ভ্যারিয়েবলগুলো সেট করুন:

```env
# ==========================================
# ZAFRAN E-COMMERCE ENVIRONMENT CONFIGURATION
# Founder: Mahim Afridi
# ==========================================

# Port (Cloud সার্ভারে স্বয়ংক্রিয়ভাবে সেট হতে পারে)
PORT=3000

# MongoDB Atlas Connection URI (ধাপ ৪ থেকে প্রাপ্ত)
MONGODB_URI=mongodb+srv://zafran_admin:YourStrongPassword123@cluster0.abcde.mongodb.net/zafran?retryWrites=true&w=majority

# JWT Token Secret (ইউজার সেশন ও সুরক্ষার জন্য যেকোনো বড় এলোমেলো স্ট্রিং)
JWT_SECRET=zafran_secure_jwt_secret_token_by_mahim_afridi_2025_2026

# Admin Credentials (অ্যাডমিন প্যানেলে লগইন করার জন্য)
ADMIN_EMAIL=admin@zafran.com
ADMIN_PASSWORD=ZafranAdmin@2025

# Cloudinary Config (প্রোডাক্টের ছবি আপলোড করার জন্য - cloudinary.com থেকে পাওয়া যাবে)
CLOUDINARY_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_SECRET_KEY=your_cloudinary_secret_key

# Payment Gateway Keys (ঐচ্ছিক - প্রয়োজন অনুযায়ী)
STRIPE_SECRET_KEY=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

---

## ৪. ডেটা কীভাবে সেভ ও প্রসেস হয় (Data Models & Code Architecture)

### ১. প্রোডাক্ট সেভ ও ফেচ (Product Management):
- ফাইল: `backend/models/productModel.js` এবং `backend/controllers/productController.js`
- অ্যাডমিন যখন `/api/product/add` এন্ডপয়েন্টে POST রিকোয়েস্ট পাঠায়, তখন প্রোডাক্টের নাম, দাম, ক্যাটাগরি, সাইজ এবং ছবি ডেটাবেসের `products` কালেকশনে সেভ হয়।
- ভিজিটর যখন স্টোর ব্রাউজ করে, তখন `/api/product/list` এন্ডপয়েন্ট ডেটাবেস থেকে সব প্রোডাক্ট ফেচ করে রিয়্যাক্ট অ্যাপে পাঠায়।

```javascript
// প্রোডাক্ট ডেটাবেসে সংরক্ষণ করার কোড স্নিপেট:
const product = new productModel({
    name,
    description,
    category,
    price: Number(price),
    subCategory,
    bestseller: bestseller === "true",
    sizes: JSON.parse(sizes),
    image: imagesUrl,
    date: Date.now()
});
await product.save();
```

### ২. ইউজার রেজিস্ট্রেশন ও লগইন (User Auth):
- ফাইল: `backend/models/userModel.js` এবং `backend/controllers/userController.js`
- ব্যবহারকারী রেজিস্ট্রেশন করার সময় পাসওয়ার্ড `bcryptjs` দিয়ে হ্যাশ করে এনক্রিপ্টেড আকারে `users` কালেকশনে সংরক্ষিত হয়।
- লগইনের পর ব্যবহারকারীকে একটি নিরাপদ `jsonwebtoken (JWT)` প্রদান করা হয়।

```javascript
// পাসওয়ার্ড হ্যাশিং ও ইউজার সেভ:
const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(password, salt);
const newUser = new userModel({ name, email, password: hashedPassword });
const user = await newUser.save();
const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
```

### ৩. অর্ডার ট্র্যাকিং (Order Processing):
- ফাইল: `backend/models/orderModel.js` এবং `backend/controllers/orderController.js`
- কাস্টমার কার্ট থেকে চেকআউট করে ক্যাশ অন ডেলিভারি (COD) বা অনলাইন পেমেন্ট সিলেক্ট করলে অর্ডারটি `orders` কালেকশনে যুক্ত হয়।
- গ্রাহক `/orders` পেজে এবং অ্যাডমিন `/admin` ড্যাশবোর্ডে রিয়েল-টাইম অর্ডারের স্ট্যাটাস (Order Placed, Packing, Shipped, Out for delivery, Delivered) দেখতে ও আপডেট করতে পারে।

---

## ৫. ওয়েবসাইট লাইভ ডেপ্লয়মেন্ট গাইডলাইন (Render & Vercel)

আপনার এই প্রজেক্টটি একটি ফুল-স্ট্যাক (Node.js Express ব্যাকএন্ড + React Vite ফ্রন্টএন্ড) আর্কিটেকচার। লাইভ হোস্ট করার জন্য নিচের যেকোনো একটি প্ল্যাটফর্ম বেছে নিতে পারেন:

---

### অপশন ক: Render.com-এ ডেপ্লয় (সবচেয়ে সহজ ও সেরা পছন্দ)
Render নোড.জেএস ব্যাকএন্ড এবং ফুলস্ট্যাক অ্যাপ সম্পূর্ণ ফ্রিতে হোস্ট করার জন্য অত্যন্ত উপযুক্ত।

১. [render.com](https://render.com)-এ গিয়ে গিটহাব অ্যাকাউন্ট দিয়ে লগইন করুন।  
২. ড্যাশবোর্ড থেকে **New + > Web Service** নির্বাচন করুন।  
৩. আপনার গিটহাব রিপোজিটরি (`mahim12221/zafranmd`) কানেক্ট করুন।  
৪. সেটিংস কনফিগার করুন:
   - **Name:** `zafran-store`
   - **Region:** Singapore / Frankfurt
   - **Branch:** `main`
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start` (বা `node server.js`)
৫. **Environment Variables** সেকশনে গিয়ে আপনার `.env` এর ভ্যালুগুলো যোগ করুন:
   - `MONGODB_URI`: আপনার মঙ্গোডিবি ইউআরআই
   - `JWT_SECRET`: আপনার সিক্রেট কি
   - `ADMIN_EMAIL`: admin@zafran.com
   - `ADMIN_PASSWORD`: আপনার অ্যাডমিন পাসওয়ার্ড
   - `CLOUDINARY_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_SECRET_KEY`
৬. **Deploy Web Service**-এ ক্লিক করুন।  
কয়েক মিনিটের মধ্যে আপনার জাফরান স্টোর লাইভ ইউআরএল (যেমন: `https://zafran-store.onrender.com`) পেয়ে যাবেন!

---

### অপশন খ: Vercel-এ ডেপ্লয়
Vercel সাধারণত ফ্রন্টএন্ডের জন্য বিশ্বসেরা। ফ্রন্টএন্ড ও ব্যাকএন্ড একসাথে চালাতে:

১. [vercel.com](https://vercel.com)-এ যান এবং GitHub অ্যাকাউন্ট দিয়ে লগইন করুন।  
২. **Add New > Project** সিলেক্ট করে `zafranmd` রিপোটি ইমপোর্ট করুন।  
৩. **Framework Preset:** Vite সিলেক্ট করুন।  
৪. **Root Directory:** `./` বা `./frontend` (যদি শুধু ফ্রন্টএন্ড আলাদা করতে চান)।  
৫. **Environment Variables:**
   - `VITE_BACKEND_URL`: আপনার লাইভ ব্যাকএন্ড সার্ভারের URL (যেমন Render-এর URL)।  
৬. **Deploy** বাটনে ক্লিক করুন।

---

### অপশন গ: নিজস্ব ডোমেইন কানেক্ট করা (e.g. zafran.com বা zafranbd.com)
১. Namecheap, GoDaddy বা ডায়াফোস্ট থেকে ডোমেইন কিনুন।  
২. Render বা Vercel ড্যাশবোর্ডের **Settings > Custom Domains**-এ আপনার ডোমেইনটি লিখুন।  
৩. আপনার ডোমেইন প্রোভাইডারের DNS Management-এ গিয়ে Render/Vercel প্রদত্ত **CNAME** বা **A Record** বসিয়ে দিন।  
৪. কয়েক ঘণ্টার মধ্যে বিনামূল্যে SSL Certificate (https://) সহ আপনার নিজস্ব ডোমেইনে জাফরান লাইভ হয়ে যাবে!

---

## ৬. অ্যাডমিন প্যানেল ব্যবহারের নিয়মাবলী

- **অ্যাডমিন ড্যাশবোর্ড লিঙ্ক:** ওয়েবসাইটের যেকোনো পেজের নিচের ফুটার বা সরাসরি `/admin` লিঙ্কে যান।
- **ডিফল্ট অ্যাডমিন লগইন:**  
  - **Email:** `admin@zafran.com`  
  - **Password:** `admin123` (বা আপনার `.env`-এ সেট করা পাসওয়ার্ড)
- **অ্যাডমিন কাজসমূহ:**
  1. নতুন প্রোডাক্ট যোগ করা (ছবি, সাইজ, ক্যাটাগরি, মূল্য সহ)।
  2. বিদ্যমান প্রোডাক্ট তালিকা দেখা ও ডিলিট করা।
  3. গ্রাহকদের প্লেস করা অর্ডার দেখা এবং ডেলিভারি স্ট্যাটাস পরিবর্তন করা।
  4. ডেটাবেস মোড স্ট্যাটাস দেখা (MongoDB Atlas কানেক্টেড নাকি লোকাল মোড)।

---

*গাইডলাইন তৈরি করেছেন: Google AI Studio Coding Assistant | জাফরান ফ্যাশন প্রজেক্ট*  
*ফাউন্ডার: মাহিম আফ্রিদি (Mahim Afridi)*
