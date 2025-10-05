import app from "./app";
import expressListEndpoints from "express-list-endpoints";

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
  console.log(`🧭 Scraper API: http://localhost:${PORT}/api/scrape/:zipcode`);

  // print
  setTimeout(() => {
    console.log("📋 Registered routes:");
    console.table(expressListEndpoints(app));
  }, 500);
});
