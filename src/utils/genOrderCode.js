function generateOrderCode(partyType) {
  // Get first letter of party type
  const firstLetter = partyType.charAt(0).toUpperCase();

  // Add 'O' for Order
  const prefix = firstLetter + "O";

  // Generate 4 digit sequence starting from 0000
  const sequence = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");

  // Combine prefix and sequence
  const orderCode = prefix + sequence;

  return orderCode;
}

module.exports = generateOrderCode;
