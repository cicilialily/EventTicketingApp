import * as orderService from '../services/order.service.js';

export async function createOrder(req, res, next) {
  try {
    const { eventId, items } = req.body;
    const userId = req.user.id; // Injected by your Auth Middleware

    if (!eventId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Event ID and at least one ticket item are required.',
      });
    }

    const order = await orderService.createOrderTransaction({ userId, eventId, items });

    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order,
    });
  } catch (error) {
    next(error);
  }
}

export async function payOrder(req, res, next) {
  try {
    const { id } = req.params;
    const paidOrder = await orderService.markOrderPaidTransaction(id);

    return res.status(200).json({
      success: true,
      message: 'Order payment successful',
      data: paidOrder,
    });
  } catch (error) {
    next(error);
  }
}