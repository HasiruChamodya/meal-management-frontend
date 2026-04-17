// Returns today's date as YYYY-MM-DD in Sri Lanka timezone (Asia/Colombo)
export const getTodaySL = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Colombo" });
