import express, { Request, Response } from "express";
import { scrapePropertiesByZip } from "../services/scraperService";
const router = express.Router();

console.log("✅ scraper.routes.ts loaded");


router.get("/:zipcode", async (req: Request, res: Response) => {
  console.log("✅ Scraper route hit with zipcode:", req.params.zipcode);
  console.log("✅ Request received:", req.method, req.url, req.params); 
  const zipcode = req.params.zipcode;
  try {
    const properties = await scrapePropertiesByZip(zipcode);
    res.json({
      success: true,
      zipcode: zipcode,
      message: "Route working successfully!",
      data: properties,
    });
  } catch (error) {
    console.error("Scraping error:", error);
    res
      .status(500)
      .json({ success: false, error: "Internal server error", details: error });
  }
});



export default router;
