import { prisma } from "@/lib/prisma";

const OrderStatus = {
  PENDING: "PENDING",
  PAID: "PAID",
  CANCELLED: "CANCELLED",
  FAILED: "FAILED",
} as const;
import {
  computeCart,
  generateOrderNumber,
  type CartLineInput,
} from "@/lib/order-catalog";

export interface CreateOrderInput {
  companyName: string;
  ico?: string;
  contactName: string;
  email: string;
  phone?: string;
  lines: CartLineInput[];
}

export async function createPendingOrder(input: CreateOrderInput) {
  const cart = computeCart(input.lines);
  if ("error" in cart) {
    throw new Error(cart.error);
  }

  const orderNumber = generateOrderNumber();

  const order = await prisma.order.create({
    data: {
      orderNumber,
      status: OrderStatus.PENDING,
      companyName: input.companyName.trim(),
      ico: input.ico?.trim() || null,
      contactName: input.contactName.trim(),
      email: input.email.trim().toLowerCase(),
      phone: input.phone?.trim() || null,
      totalAmountHalere: cart.totalAmountHalere,
      items: {
        create: cart.items.map((item) => ({
          courseSlug: item.courseSlug,
          name: item.name,
          quantity: item.quantity,
          unitPriceHalere: item.unitPriceHalere,
          lineTotalHalere: item.lineTotalHalere,
        })),
      },
      payment: {
        create: {
          state: "CREATED",
        },
      },
    },
    include: { items: true, payment: true },
  });

  return { order, cart };
}

export async function markOrderPaid(orderId: string, gopayPaymentId: string, state: string) {
  await prisma.$transaction([
    prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.PAID },
    }),
    prisma.payment.update({
      where: { orderId },
      data: { gopayPaymentId, state },
    }),
  ]);
}

export async function markOrderFailed(orderId: string, gopayPaymentId: string, state: string) {
  await prisma.$transaction([
    prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.FAILED },
    }),
    prisma.payment.update({
      where: { orderId },
      data: { gopayPaymentId, state },
    }),
  ]);
}

export async function getOrderByNumber(orderNumber: string) {
  return prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true, payment: true },
  });
}

export async function getOrderByGoPayId(gopayPaymentId: string) {
  return prisma.payment.findUnique({
    where: { gopayPaymentId },
    include: { order: { include: { items: true } } },
  });
}

export type ManualPaymentMethod = "INVOICE" | "CASH";

export interface CreateManualPaidOrderInput extends CreateOrderInput {
  paymentMethod: ManualPaymentMethod;
  adminNote?: string;
  discountPercentOverride?: number;
}

/** Manuální objednávka (faktura / hotově) – ihned PAID, bez GoPay. */
export async function createManualPaidOrder(input: CreateManualPaidOrderInput) {
  const cart = computeCart(input.lines, {
    discountPercentOverride: input.discountPercentOverride,
  });
  if ("error" in cart) {
    throw new Error(cart.error);
  }

  const orderNumber = generateOrderNumber();

  const order = await prisma.order.create({
    data: {
      orderNumber,
      status: OrderStatus.PAID,
      paymentMethod: input.paymentMethod,
      adminNote: input.adminNote?.trim() || null,
      companyName: input.companyName.trim(),
      ico: input.ico?.trim() || null,
      contactName: input.contactName.trim(),
      email: input.email.trim().toLowerCase(),
      phone: input.phone?.trim() || null,
      totalAmountHalere: cart.totalAmountHalere,
      items: {
        create: cart.items.map((item) => ({
          courseSlug: item.courseSlug,
          name: item.name,
          quantity: item.quantity,
          unitPriceHalere: item.unitPriceHalere,
          lineTotalHalere: item.lineTotalHalere,
        })),
      },
      payment: {
        create: {
          state: "MANUAL",
        },
      },
    },
    include: { items: true, payment: true },
  });

  return { order, cart };
}
