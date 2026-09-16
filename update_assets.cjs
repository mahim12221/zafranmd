const fs = require('fs');
let content = fs.readFileSync('frontend/src/assets/assets.js', 'utf8');

content = content.replace(/name: "Women Round Neck Cotton Top"/g, 'name: "Pro Wireless Earbuds"');
content = content.replace(/category: "Women",\s*subCategory: "Topwear"/g, 'category: "Electronics",\n        subCategory: "Audio"');

content = content.replace(/name: "Men Round Neck Pure Cotton T-shirt"/g, 'name: "Smart Watch Series X"');
content = content.replace(/category: "Men",\s*subCategory: "Topwear"/g, 'category: "Gadgets",\n        subCategory: "Wearables"');

content = content.replace(/name: "Girls Round Neck Cotton Top"/g, 'name: "Ultra HD Smart TV"');
content = content.replace(/category: "Kids",\s*subCategory: "Topwear"/g, 'category: "Electronics",\n        subCategory: "Accessories"');

fs.writeFileSync('frontend/src/assets/assets.js', content);
