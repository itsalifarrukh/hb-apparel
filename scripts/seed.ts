import { PrismaClient } from '@prisma/client';
import { generateSlug } from '../src/utils/slug';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create Categories
  const menCategory = await prisma.category.upsert({
    where: { name: 'Men' },
    update: {},
    create: {
      name: 'Men',
      description: 'Men\'s clothing and accessories'
    }
  });

  const womenCategory = await prisma.category.upsert({
    where: { name: 'Women' },
    update: {},
    create: {
      name: 'Women',
      description: 'Women\'s clothing and accessories'
    }
  });

  const kidsCategory = await prisma.category.upsert({
    where: { name: 'Kids' },
    update: {},
    create: {
      name: 'Kids',
      description: 'Children\'s clothing and accessories'
    }
  });

  // Create Subcategories for Men
  const menShirts = await prisma.subcategory.upsert({
    where: { name: 'Men\'s Shirts' },
    update: {},
    create: {
      name: 'Men\'s Shirts',
      description: 'Casual and formal shirts for men',
      categoryId: menCategory.id
    }
  });

  const menPants = await prisma.subcategory.upsert({
    where: { name: 'Men\'s Pants' },
    update: {},
    create: {
      name: 'Men\'s Pants',
      description: 'Trousers, jeans, and casual pants for men',
      categoryId: menCategory.id
    }
  });

  const menAccessories = await prisma.subcategory.upsert({
    where: { name: 'Men\'s Accessories' },
    update: {},
    create: {
      name: 'Men\'s Accessories',
      description: 'Belts, watches, and other accessories',
      categoryId: menCategory.id
    }
  });

  // Create Subcategories for Women
  const womenDresses = await prisma.subcategory.upsert({
    where: { name: 'Women\'s Dresses' },
    update: {},
    create: {
      name: 'Women\'s Dresses',
      description: 'Casual and formal dresses for women',
      categoryId: womenCategory.id
    }
  });

  const womenTops = await prisma.subcategory.upsert({
    where: { name: 'Women\'s Tops' },
    update: {},
    create: {
      name: 'Women\'s Tops',
      description: 'Blouses, t-shirts, and casual tops',
      categoryId: womenCategory.id
    }
  });

  const womenAccessories = await prisma.subcategory.upsert({
    where: { name: 'Women\'s Accessories' },
    update: {},
    create: {
      name: 'Women\'s Accessories',
      description: 'Bags, jewelry, and other accessories',
      categoryId: womenCategory.id
    }
  });

  // Create Subcategories for Kids
  const kidsShirts = await prisma.subcategory.upsert({
    where: { name: 'Kids\' Shirts' },
    update: {},
    create: {
      name: 'Kids\' Shirts',
      description: 'T-shirts and casual shirts for children',
      categoryId: kidsCategory.id
    }
  });

  console.log('✅ Categories and subcategories created');

  // Create Sample Products
  const sampleProducts = [
    {
      name: 'Classic Blue Denim Shirt',
      slug: generateSlug('Classic Blue Denim Shirt'),
      categoryId: menCategory.id,
      subcategoryId: menShirts.id,
      mainImage: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500',
      description: 'A timeless blue denim shirt perfect for casual and semi-formal occasions.',
      price: 59.99,
      discount: 10,
      discountedPrice: 53.99,
      stock: 25,
      sizes: 'S,M,L,XL,XXL',
      colors: 'Blue,Light Blue',
      availabilityStatus: 'in_stock',
      imageUrl: [
        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500',
        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500'
      ],
      isFeatured: true,
      arrivalDate: new Date('2024-01-01')
    },
    {
      name: 'Elegant Black Evening Dress',
      slug: generateSlug('Elegant Black Evening Dress'),
      categoryId: womenCategory.id,
      subcategoryId: womenDresses.id,
      mainImage: 'https://images.unsplash.com/photo-1566479179817-c9d67e2b5d0c?w=500',
      description: 'A sophisticated black evening dress perfect for special occasions.',
      price: 129.99,
      discount: 15,
      discountedPrice: 110.49,
      stock: 15,
      sizes: 'XS,S,M,L,XL',
      colors: 'Black',
      availabilityStatus: 'in_stock',
      imageUrl: [
        'https://images.unsplash.com/photo-1566479179817-c9d67e2b5d0c?w=500'
      ],
      isFeatured: true,
      arrivalDate: new Date('2024-01-15')
    },
    {
      name: 'Comfortable Cotton T-Shirt',
      slug: generateSlug('Comfortable Cotton T-Shirt'),
      categoryId: kidsCategory.id,
      subcategoryId: kidsShirts.id,
      mainImage: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=500',
      description: 'Soft and comfortable cotton t-shirt for kids.',
      price: 19.99,
      discount: 0,
      discountedPrice: 19.99,
      stock: 50,
      sizes: '2T,3T,4T,5T,6T',
      colors: 'Red,Blue,Green,Yellow',
      availabilityStatus: 'in_stock',
      imageUrl: [
        'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=500'
      ],
      isFeatured: false,
      arrivalDate: new Date('2024-02-01')
    },
    {
      name: 'Premium Leather Jacket',
      slug: generateSlug('Premium Leather Jacket'),
      categoryId: menCategory.id,
      subcategoryId: menAccessories.id,
      mainImage: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500',
      description: 'High-quality leather jacket for style and durability.',
      price: 199.99,
      discount: 20,
      discountedPrice: 159.99,
      stock: 8,
      sizes: 'M,L,XL',
      colors: 'Black,Brown',
      availabilityStatus: 'in_stock',
      imageUrl: [
        'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500'
      ],
      isFeatured: true,
      arrivalDate: new Date('2024-01-10')
    },
    {
      name: 'Casual Summer Top',
      slug: generateSlug('Casual Summer Top'),
      categoryId: womenCategory.id,
      subcategoryId: womenTops.id,
      mainImage: 'https://images.unsplash.com/photo-1582142306909-195724d33c05?w=500',
      description: 'Light and breezy summer top perfect for warm weather.',
      price: 39.99,
      discount: 25,
      discountedPrice: 29.99,
      stock: 30,
      sizes: 'XS,S,M,L',
      colors: 'White,Pink,Light Blue',
      availabilityStatus: 'in_stock',
      imageUrl: [
        'https://images.unsplash.com/photo-1582142306909-195724d33c05?w=500'
      ],
      isFeatured: false,
      arrivalDate: new Date('2024-03-01')
    }
  ];

  for (const product of sampleProducts) {
    // Check if product already exists
    const existingProduct = await prisma.product.findFirst({
      where: { name: product.name }
    });
    
    if (!existingProduct) {
      await prisma.product.create({
        data: product
      });
    }
  }

  console.log('✅ Sample products created');

  // Create a Sample Deal
  const existingDeal = await prisma.deal.findFirst({
    where: { name: 'Summer Flash Sale' }
  });
  
  let flashSale;
  if (!existingDeal) {
    flashSale = await prisma.deal.create({
      data: {
        name: 'Summer Flash Sale',
        description: 'Limited time offer - up to 30% off on selected items!',
        discount: 30,
        startTime: new Date(Date.now() - 1000 * 60 * 60 * 24), // Started yesterday
        endTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7) // Ends in 7 days
      }
    });
  } else {
    flashSale = existingDeal;
  }

  // Get some products to add to the deal
  const productsForDeal = await prisma.product.findMany({
    take: 2,
    where: {
      isFeatured: true
    }
  });

  // Add products to the deal
  for (const product of productsForDeal) {
    const existingProductDeal = await prisma.productDeal.findFirst({
      where: {
        productId: product.id,
        dealId: flashSale.id
      }
    });
    
    if (!existingProductDeal) {
      await prisma.productDeal.create({
        data: {
          productId: product.id,
          dealId: flashSale.id
        }
      });
    }
  }

  console.log('✅ Sample deal created');
  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
