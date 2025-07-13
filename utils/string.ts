// export const formatCurrency = (amount: number | null | undefined): string => {
//   if (amount == null || isNaN(Number(amount))) return "0";
//   return Number(amount)
//     .toString()
//     .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
// };
export const formatCurrency = (amount: number | null | undefined): string => {
  if (amount == null || isNaN(Number(amount))) return "0";
  return Number(amount).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });
};
