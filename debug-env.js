// Debug script to check environment variables
console.log("Checking environment variables...");
console.log("DATABASE_URL:", process.env.DATABASE_URL ? "SET" : "NOT SET");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log(
  "Available env vars:",
  Object.keys(process.env).filter(
    (key) => key.includes("DATABASE") || key.includes("DB")
  )
);
