import mongoose from 'mongoose';
import 'dotenv/config';
import Category from './models/Category.js';
import Brand from './models/Brand.js';

const CATEGORIES = [
    // Root categories
    { name: 'Điện thoại', slug: 'dien-thoai', parentId: null, suggestedAttributes: ['Color', 'Storage', 'RAM'] },
    { name: 'Laptop', slug: 'laptop', parentId: null, suggestedAttributes: ['Color', 'Storage', 'RAM', 'CPU'] },
    { name: 'Máy tính bảng', slug: 'may-tinh-bang', parentId: null, suggestedAttributes: ['Color', 'Storage', 'Connectivity'] },
    { name: 'Phụ kiện', slug: 'phu-kien', parentId: null, suggestedAttributes: ['Color', 'Type'] },
    { name: 'Smartwatch & Wearable', slug: 'smartwatch-wearable', parentId: null, suggestedAttributes: ['Color', 'Size'] },
    { name: 'Âm thanh', slug: 'am-thanh', parentId: null, suggestedAttributes: ['Color', 'Type'] },
    { name: 'Gaming', slug: 'gaming', parentId: null, suggestedAttributes: ['Color', 'Storage'] },
    { name: 'Màn hình & TV', slug: 'man-hinh-tv', parentId: null, suggestedAttributes: ['Size', 'Resolution', 'Type'] },
];

const BRANDS = [
    { name: 'Apple', slug: 'apple' },
    { name: 'Samsung', slug: 'samsung' },
    { name: 'Xiaomi', slug: 'xiaomi' },
    { name: 'OPPO', slug: 'oppo' },
    { name: 'Vivo', slug: 'vivo' },
    { name: 'Realme', slug: 'realme' },
    { name: 'Nokia', slug: 'nokia' },
    { name: 'Sony', slug: 'sony' },
    { name: 'ASUS', slug: 'asus' },
    { name: 'Acer', slug: 'acer' },
    { name: 'Lenovo', slug: 'lenovo' },
    { name: 'Dell', slug: 'dell' },
    { name: 'HP', slug: 'hp' },
    { name: 'MSI', slug: 'msi' },
    { name: 'LG', slug: 'lg' },
    { name: 'Logitech', slug: 'logitech' },
    { name: 'JBL', slug: 'jbl' },
    { name: 'Anker', slug: 'anker' },
    { name: 'Baseus', slug: 'baseus' },
];

async function seed() {
    try {
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected!\n');

        // ---- CATEGORIES ----
        console.log('📂 Seeding categories...');
        let seeded = 0, skipped = 0;
        for (const cat of CATEGORIES) {
            const existing = await Category.findOne({ slug: cat.slug });
            if (existing) {
                skipped++;
                console.log(`  ⏭  Skip: ${cat.name} (already exists)`);
            } else {
                await Category.create(cat);
                seeded++;
                console.log(`  ✔  Added: ${cat.name}`);
            }
        }
        console.log(`\n  Categories: ${seeded} added, ${skipped} skipped`);

        // ---- BRANDS ----
        console.log('\n🏷️  Seeding brands...');
        seeded = 0; skipped = 0;
        for (const brand of BRANDS) {
            const existing = await Brand.findOne({ slug: brand.slug });
            if (existing) {
                skipped++;
                console.log(`  ⏭  Skip: ${brand.name} (already exists)`);
            } else {
                await Brand.create(brand);
                seeded++;
                console.log(`  ✔  Added: ${brand.name}`);
            }
        }
        console.log(`\n  Brands: ${seeded} added, ${skipped} skipped`);

        console.log('\n🎉 Seeding complete!');
    } catch (err) {
        console.error('❌ Seeding failed:', err);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected.');
    }
}

seed();
