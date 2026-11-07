export function getCartItemTotal(price: number, quantity: number): number {
  return (Math.round(price * 100) * quantity) / 100;
}

export function getCartTotal(
  items: Array<{ price: number; quantity: number }>,
): number {
  const totalCents = items.reduce(
    (total, item) => total + Math.round(item.price * 100) * item.quantity,
    0,
  );

  return totalCents / 100;
}
