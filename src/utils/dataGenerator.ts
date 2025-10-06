import * as faker from "faker";
import { v4 as uuidv4 } from "uuid";
import {
  User,
  Product,
  Order,
  Analytics,
  Article,
  Notification,
  SystemHealth,
  ApiResponse,
  PaginatedResponse,
} from "../types";

export class DataGenerator {
  static generateUser(): User {
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const username = faker.internet.userName(firstName, lastName);

    return {
      id: uuidv4(),
      username,
      email: faker.internet.email(firstName, lastName),
      firstName,
      lastName,
      avatar: faker.internet.avatar(),
      createdAt: faker.date.past(2).toISOString(),
      updatedAt: faker.date.recent(30).toISOString(),
      isActive: faker.datatype.boolean(),
      role: faker.random.arrayElement(["admin", "user", "moderator"]),
      profile: {
        bio: faker.lorem.paragraph(),
        location: `${faker.address.city()}, ${faker.address.country()}`,
        website: faker.internet.url(),
        socialLinks: {
          ...(faker.datatype.boolean() && { twitter: `@${username}` }),
          ...(faker.datatype.boolean() && { linkedin: faker.internet.url() }),
          ...(faker.datatype.boolean() && {
            github: `https://github.com/${username}`,
          }),
        },
      },
      preferences: {
        theme: faker.random.arrayElement(["light", "dark", "auto"]),
        notifications: {
          email: faker.datatype.boolean(),
          push: faker.datatype.boolean(),
          sms: faker.datatype.boolean(),
        },
        language: faker.random.arrayElement([
          "en",
          "es",
          "fr",
          "de",
          "it",
          "pt",
          "ja",
          "ko",
        ]),
      },
      stats: {
        loginCount: faker.datatype.number({ min: 1, max: 1000 }),
        lastLoginAt: faker.date.recent(7).toISOString(),
        postsCount: faker.datatype.number({ min: 0, max: 500 }),
        followersCount: faker.datatype.number({ min: 0, max: 10000 }),
        followingCount: faker.datatype.number({ min: 0, max: 2000 }),
      },
    };
  }

  static generateProduct(): Product {
    const name = faker.commerce.productName();
    const originalPrice = faker.datatype.number({ min: 10, max: 1000 });
    const hasDiscount = faker.datatype.boolean();
    const discountPercentage = hasDiscount
      ? faker.datatype.number({ min: 5, max: 50 })
      : undefined;
    const price = hasDiscount
      ? Math.round(originalPrice * (1 - discountPercentage! / 100))
      : originalPrice;

    return {
      id: uuidv4(),
      name,
      description: faker.lorem.paragraphs(2),
      category: faker.commerce.department(),
      brand: faker.company.companyName(),
      price: {
        amount: price,
        currency: "USD",
        ...(hasDiscount && { discountPercentage }),
        ...(hasDiscount && { originalPrice }),
      },
      images: Array.from(
        { length: faker.datatype.number({ min: 1, max: 5 }) },
        () => faker.image.imageUrl(800, 600, "product"),
      ),
      specifications: {
        weight: `${faker.datatype.number({ min: 0.1, max: 50 })} lbs`,
        dimensions: `${faker.datatype.number({ min: 1, max: 50 })}x${faker.datatype.number({ min: 1, max: 50 })}x${faker.datatype.number({ min: 1, max: 50 })} inches`,
        material: faker.commerce.productMaterial(),
        color: faker.commerce.color(),
        warranty: `${faker.datatype.number({ min: 1, max: 5 })} years`,
        origin: faker.address.country(),
        certified: faker.datatype.boolean(),
      },
      inventory: {
        stock: faker.datatype.number({ min: 0, max: 1000 }),
        reserved: faker.datatype.number({ min: 0, max: 50 }),
        available: faker.datatype.number({ min: 0, max: 950 }),
        lowStockThreshold: faker.datatype.number({ min: 5, max: 20 }),
      },
      ratings: {
        average: parseFloat(
          faker.datatype.float({ min: 1, max: 5, precision: 0.1 }).toFixed(1),
        ),
        count: faker.datatype.number({ min: 0, max: 1000 }),
        distribution: {
          5: faker.datatype.number({ min: 0, max: 500 }),
          4: faker.datatype.number({ min: 0, max: 300 }),
          3: faker.datatype.number({ min: 0, max: 150 }),
          2: faker.datatype.number({ min: 0, max: 75 }),
          1: faker.datatype.number({ min: 0, max: 25 }),
        },
      },
      tags: Array.from(
        { length: faker.datatype.number({ min: 2, max: 8 }) },
        () => faker.lorem.word(),
      ),
      createdAt: faker.date.past(1).toISOString(),
      updatedAt: faker.date.recent(30).toISOString(),
      isActive: Math.random() > 0.1,
      seoData: {
        title: `${name} - Best Deal Online`,
        description: faker.lorem.sentences(2),
        keywords: Array.from(
          { length: faker.datatype.number({ min: 3, max: 10 }) },
          () => faker.lorem.word(),
        ),
      },
    };
  }

  static generateOrder(): Order {
    const itemCount = faker.datatype.number({ min: 1, max: 5 });
    const items = Array.from({ length: itemCount }, () => {
      const unitPrice = faker.datatype.number({ min: 10, max: 500 });
      const quantity = faker.datatype.number({ min: 1, max: 3 });
      return {
        productId: uuidv4(),
        productName: faker.commerce.productName(),
        quantity,
        unitPrice,
        totalPrice: unitPrice * quantity,
        sku: faker.random.alphaNumeric(8).toUpperCase(),
      };
    });

    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const tax = Math.round(subtotal * 0.08);
    const shippingCost = faker.datatype.number({ min: 5, max: 25 });
    const discount = faker.datatype.boolean()
      ? faker.datatype.number({ min: 5, max: 50 })
      : 0;
    const total = subtotal + tax + shippingCost - discount;

    return {
      id: uuidv4(),
      orderNumber: `ORD-${faker.datatype.number({ min: 100000, max: 999999 })}`,
      customerId: uuidv4(),
      status: faker.random.arrayElement([
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
      ]),
      items,
      shipping: {
        address: {
          street: faker.address.streetAddress(),
          city: faker.address.city(),
          state: faker.address.stateAbbr(),
          zipCode: faker.address.zipCode(),
          country: faker.address.country(),
        },
        method: faker.random.arrayElement([
          "standard",
          "express",
          "overnight",
          "ground",
        ]),
        cost: shippingCost,
        estimatedDelivery: faker.date.future(0.1).toISOString(),
        ...(faker.datatype.boolean() && {
          trackingNumber: faker.random.alphaNumeric(12).toUpperCase(),
        }),
      },
      payment: {
        method: faker.random.arrayElement([
          "credit_card",
          "paypal",
          "bank_transfer",
          "crypto",
        ]),
        status: faker.random.arrayElement([
          "pending",
          "completed",
          "failed",
          "refunded",
        ]),
        transactionId: faker.random.alphaNumeric(16),
        amount: total,
        currency: "USD",
      },
      totals: {
        subtotal,
        tax,
        shipping: shippingCost,
        discount,
        total,
      },
      createdAt: faker.date.past(0.5).toISOString(),
      updatedAt: faker.date.recent(7).toISOString(),
      notes: faker.datatype.boolean() ? faker.lorem.sentence() : undefined,
    };
  }

  static generateAnalytics(): Analytics {
    const startDate = faker.date.past(1);
    const endDate = new Date();
    const days = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    const trends = Array.from({ length: Math.min(days, 30) }, (_, i) => {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      return {
        date: date.toISOString().split("T")[0]!,
        users: faker.datatype.number({ min: 100, max: 5000 }),
        revenue: faker.datatype.number({ min: 1000, max: 50000 }),
        orders: faker.datatype.number({ min: 10, max: 500 }),
        pageViews: faker.datatype.number({ min: 500, max: 20000 }),
      };
    });

    return {
      period: "last_30_days",
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      metrics: {
        totalUsers: faker.datatype.number({ min: 10000, max: 100000 }),
        activeUsers: faker.datatype.number({ min: 1000, max: 10000 }),
        newUsers: faker.datatype.number({ min: 500, max: 5000 }),
        totalRevenue: faker.datatype.number({ min: 50000, max: 1000000 }),
        totalOrders: faker.datatype.number({ min: 1000, max: 10000 }),
        averageOrderValue: faker.datatype.number({ min: 50, max: 500 }),
        conversionRate: parseFloat(
          faker.datatype.float({ min: 1, max: 15, precision: 0.1 }).toFixed(1),
        ),
        bounceRate: parseFloat(
          faker.datatype.float({ min: 20, max: 80, precision: 0.1 }).toFixed(1),
        ),
        pageViews: faker.datatype.number({ min: 100000, max: 1000000 }),
        uniqueVisitors: faker.datatype.number({ min: 50000, max: 500000 }),
      },
      trends,
      topProducts: Array.from({ length: 10 }, () => ({
        id: uuidv4(),
        name: faker.commerce.productName(),
        sales: faker.datatype.number({ min: 10, max: 1000 }),
        revenue: faker.datatype.number({ min: 1000, max: 50000 }),
      })),
      trafficSources: [
        {
          source: "Organic Search",
          visitors: faker.datatype.number({ min: 1000, max: 10000 }),
          percentage: 0,
        },
        {
          source: "Social Media",
          visitors: faker.datatype.number({ min: 500, max: 5000 }),
          percentage: 0,
        },
        {
          source: "Direct",
          visitors: faker.datatype.number({ min: 800, max: 8000 }),
          percentage: 0,
        },
        {
          source: "Email",
          visitors: faker.datatype.number({ min: 300, max: 3000 }),
          percentage: 0,
        },
        {
          source: "Paid Search",
          visitors: faker.datatype.number({ min: 200, max: 2000 }),
          percentage: 0,
        },
      ].map((source) => {
        const totalVisitors = 20000; // Mock total for percentage calculation
        return {
          ...source,
          percentage: parseFloat(
            ((source.visitors / totalVisitors) * 100).toFixed(1),
          ),
        };
      }),
      demographics: {
        ageGroups: {
          "18-24": faker.datatype.number({ min: 500, max: 5000 }),
          "25-34": faker.datatype.number({ min: 1000, max: 10000 }),
          "35-44": faker.datatype.number({ min: 800, max: 8000 }),
          "45-54": faker.datatype.number({ min: 600, max: 6000 }),
          "55+": faker.datatype.number({ min: 400, max: 4000 }),
        },
        countries: {
          "United States": faker.datatype.number({ min: 5000, max: 50000 }),
          Canada: faker.datatype.number({ min: 1000, max: 10000 }),
          "United Kingdom": faker.datatype.number({ min: 800, max: 8000 }),
          Germany: faker.datatype.number({ min: 600, max: 6000 }),
          France: faker.datatype.number({ min: 500, max: 5000 }),
        },
        devices: {
          Desktop: faker.datatype.number({ min: 3000, max: 30000 }),
          Mobile: faker.datatype.number({ min: 4000, max: 40000 }),
          Tablet: faker.datatype.number({ min: 1000, max: 10000 }),
        },
      },
    };
  }

  static generateArticle(): Article {
    const title = faker.lorem.words(faker.datatype.number({ min: 3, max: 8 }));
    const slug = title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");
    const author = {
      id: uuidv4(),
      name: faker.name.findName(),
      avatar: faker.internet.avatar(),
      bio: faker.lorem.sentence(),
    };

    return {
      id: uuidv4(),
      title,
      slug,
      content: faker.lorem.paragraphs(
        faker.datatype.number({ min: 5, max: 15 }),
      ),
      excerpt: faker.lorem.sentences(2),
      author,
      category: faker.random.arrayElement([
        "Technology",
        "Business",
        "Health",
        "Science",
        "Entertainment",
        "Sports",
      ]),
      tags: Array.from(
        { length: faker.datatype.number({ min: 2, max: 6 }) },
        () => faker.lorem.word(),
      ),
      featured: Math.random() < 0.2,
      publishedAt: faker.date.past(1).toISOString(),
      updatedAt: faker.date.recent(30).toISOString(),
      status: faker.random.arrayElement(["draft", "published", "archived"]),
      seo: {
        title: `${title} | Blog`,
        description: faker.lorem.sentences(2),
        keywords: Array.from(
          { length: faker.datatype.number({ min: 3, max: 8 }) },
          () => faker.lorem.word(),
        ),
        ...(faker.datatype.boolean() && { canonicalUrl: faker.internet.url() }),
      },
      metrics: {
        views: faker.datatype.number({ min: 0, max: 50000 }),
        likes: faker.datatype.number({ min: 0, max: 5000 }),
        shares: faker.datatype.number({ min: 0, max: 1000 }),
        comments: faker.datatype.number({ min: 0, max: 500 }),
        readingTime: faker.datatype.number({ min: 2, max: 15 }),
      },
      ...(faker.datatype.boolean() && {
        featuredImage: {
          url: faker.image.imageUrl(1200, 600, "article"),
          alt: faker.lorem.words(3),
          ...(faker.datatype.boolean() && { caption: faker.lorem.sentence() }),
        },
      }),
    };
  }

  static generateNotification(): Notification {
    const userId = uuidv4();
    const type = faker.random.arrayElement([
      "info",
      "success",
      "warning",
      "error",
      "promotion",
    ]) as "info" | "success" | "warning" | "error" | "promotion";

    return {
      id: uuidv4(),
      userId,
      type,
      title: faker.lorem.words(faker.datatype.number({ min: 2, max: 6 })),
      message: faker.lorem.sentences(faker.datatype.number({ min: 1, max: 3 })),
      data: faker.datatype.boolean()
        ? {
            orderId: uuidv4(),
            amount: faker.datatype.number({ min: 10, max: 1000 }),
            productName: faker.commerce.productName(),
          }
        : undefined,
      isRead: faker.datatype.boolean(),
      priority: faker.random.arrayElement(["low", "medium", "high", "urgent"]),
      channels: faker.random.arrayElements(
        ["email", "push", "sms", "in_app"],
        faker.datatype.number({ min: 1, max: 3 }),
      ),
      scheduledFor: faker.datatype.boolean()
        ? faker.date.future(1).toISOString()
        : undefined,
      createdAt: faker.date.recent(7).toISOString(),
      readAt: faker.datatype.boolean()
        ? faker.date.recent(3).toISOString()
        : undefined,
      actionUrl: faker.datatype.boolean() ? faker.internet.url() : undefined,
      actionText: faker.datatype.boolean() ? faker.lorem.words(2) : undefined,
      expiresAt: faker.datatype.boolean()
        ? faker.date.future(1).toISOString()
        : undefined,
    };
  }

  static generateSystemHealth(): SystemHealth {
    const services = [
      "database",
      "redis",
      "api-gateway",
      "user-service",
      "order-service",
      "payment-service",
      "notification-service",
    ];

    return {
      status: faker.random.arrayElement(["healthy", "degraded", "down"]),
      timestamp: new Date().toISOString(),
      uptime: faker.datatype.number({ min: 3600, max: 2592000 }), // 1 hour to 30 days in seconds
      version: `v${faker.datatype.number({ min: 1, max: 3 })}.${faker.datatype.number({ min: 0, max: 20 })}.${faker.datatype.number({ min: 0, max: 50 })}`,
      environment: faker.random.arrayElement([
        "production",
        "staging",
        "development",
      ]),
      services: services.map((serviceName) => ({
        name: serviceName,
        status: faker.random.arrayElement(["healthy", "degraded", "down"]),
        responseTime: faker.datatype.number({ min: 1, max: 500 }),
        lastCheck: faker.date.recent(0.1).toISOString(),
        ...(faker.datatype.boolean() && {
          details: {
            connections: faker.datatype.number({ min: 1, max: 100 }),
            memoryUsage: `${faker.datatype.number({ min: 10, max: 90 })}%`,
            cpuUsage: `${faker.datatype.number({ min: 5, max: 95 })}%`,
          },
        }),
      })),
      performance: {
        cpu: {
          usage: faker.datatype.number({ min: 10, max: 85 }),
          cores: faker.random.arrayElement([2, 4, 8, 16, 32]),
        },
        memory: {
          used: faker.datatype.number({ min: 1, max: 16 }),
          total: faker.random.arrayElement([8, 16, 32, 64]),
          percentage: faker.datatype.number({ min: 20, max: 80 }),
        },
        disk: {
          used: faker.datatype.number({ min: 10, max: 800 }),
          total: faker.random.arrayElement([256, 512, 1024, 2048]),
          percentage: faker.datatype.number({ min: 15, max: 75 }),
        },
      },
      database: {
        status: faker.random.arrayElement([
          "connected",
          "disconnected",
          "error",
        ]),
        responseTime: faker.datatype.number({ min: 1, max: 100 }),
        activeConnections: faker.datatype.number({ min: 5, max: 50 }),
        maxConnections: faker.datatype.number({ min: 100, max: 200 }),
      },
    };
  }

  static createApiResponse<T>(
    data: T,
    success: boolean = true,
    message?: string,
  ): ApiResponse<T> {
    return {
      success,
      ...(success && { data }),
      message,
      ...(!success && {
        error: {
          code: "UNKNOWN_ERROR",
          message: message || "An error occurred",
        },
      }),
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
        version: "v1.0.0",
      },
    };
  }

  static createPaginatedResponse<T>(
    data: T[],
    page: number = 1,
    limit: number = 10,
    total?: number,
  ): PaginatedResponse<T> {
    const actualTotal = total || data.length;
    const totalPages = Math.ceil(actualTotal / limit);

    return {
      success: true,
      data,
      metadata: {
        pagination: {
          page,
          limit,
          total: actualTotal,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
        version: "v1.0.0",
      },
    };
  }

  static generateArray<T>(generator: () => T, count?: number): T[] {
    const length = count || faker.datatype.number({ min: 5, max: 20 });
    return Array.from({ length }, generator);
  }
}
