import Order from "../models/order.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const dailyOrders = asyncHandler(async (req, res) => {
  const days = Math.max(1, Number(req.query.days) || 30);
  const from = new Date();
  from.setUTCDate(from.getUTCDate() - (days - 1));
  from.setUTCHours(0, 0, 0, 0);

  const pipeline = [
    {
      $addFields: {
        createdAtDate: {
          $cond: {
            if: { $eq: [{ $type: "$createdAt" }, "string"] },
            then: { $toDate: "$createdAt" },
            else: "$createdAt",
          },
        },
      },
    },
    { $match: { createdAtDate: { $gte: from } } },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$createdAtDate",
            timezone: "UTC",
          },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ];

  const agg = await Order.aggregate(pipeline);
  const map = new Map(
    agg.map((d) => {
      d._id, d.count;
    })
  );

  const series = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(from);
    d.setUTCDate(from.getUTCDate() + i);

    const key = d.toISOString().slice(0, 10);
    series.push({ date: key, orders: map.get(key) || 0 });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, series, "Daily orders fetched successfully"));
});

const monthlyRevenue = asyncHandler(async (req, res) => {
  const months = Math.max(1, Number(req.query.months) || 12);
  const now = new Date();
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (months - 1), 1)
  );

  const pipeline = [
    {
      $addFields: {
        createdAtDate: {
          $cond: {
            if: { $eq: [{ $type: "$createdAt" }, "string"] },
            then: { $toDate: "$createdAt" },
            else: "$createdAt",
          },
        },
      },
    },
    { $match: { createdAtDate: { $gte: start } } },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m",
            date: "$createdAtDate",
            timezone: "UTC",
          },
        },
        revenue: { $sum: "$totalAmount" },
      },
    },

    { $sort: { _id: 1 } },
  ];

  const agg = await Order.aggregate(pipeline);
  const map = new Map(agg.map((d) => [d._id, d.revenue]));

  const result = [];
  for (let i = 0; i < months; i++) {
    const d = new Date(
      Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + i, 1)
    );
    const key = `${d.getUTCFullYear()} - ${String(d.getUTCMonth() + 1).padStart(
      2,
      "0"
    )}`;

    result.push({
      month: key,
      revenue: Number((map.get(key) || 0).toFixed(2)),
    });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Monthly revenue fetched successfully"));
});

const topProducts = asyncHandler(async (req, res) => {
  const limit = Math.max(1, Number(req.query.limit) || 10);

  const pipeline = [
    { $unwind: "$orderItems" },
    {
      $group: {
        _id: "$orderItems.product",
        totalQty: { $sum: "$orderItems.quantity" },
        totalSales: {
          $sum: { $multiply: ["$orderItems.quantity", "$orderItems.price"] },
        },
      },
    },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },
    { $sort: { totalSales: -1, totalQty: -1 } },
    { $limit: limit },
    {
      $project: {
        _id: 0,
        productId: "$product._id",
        name: "$product.name",
        category: "$product.category",
        price: "$product.price",
        brand: "$product.brand",
        totalQty: 1,
        totalSales: 1,
      },
    },
  ];

  const result = await Order.aggregate(pipeline);

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Top products fetched successfully"));
});

export { dailyOrders, monthlyRevenue, topProducts };
