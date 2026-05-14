function checkStock(stock) {
  if (stock <= 0) {
    return "Out of stock";
  }
  return "In stock";
}