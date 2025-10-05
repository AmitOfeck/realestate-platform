import axios from "axios";
import * as cheerio from "cheerio";
import { Property } from "../../../../types/Property";

export async function scrapePropertiesByZip(zipcode: string): Promise<Property[]> {
  const url = `https://www.realtor.com/realestateandhomes-search/${zipcode}`;
  const properties: Property[] = [];

  try {
    console.log(`🌍 Fetching data from: ${url}`);
    const { data } = await axios.get(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    const $ = cheerio.load(data);

    $(".BasePropertyCard_propertyCardWrap__J0xUj").each((index, el) => {
      const name = $(el).find(".BasePropertyCard_propertyTitleWrap__kq03O").text().trim() || "Property";
      const priceText = $(el).find(".price-section span").first().text().replace(/[^\d]/g, "");
      const price = parseInt(priceText) || 0;
      const image = $(el).find("img").attr("src") || "";
      const details = $(el).find(".property-meta").text();

      const bedroomsMatch = details.match(/(\d+)\s*beds?/i);
      const bathroomsMatch = details.match(/(\d+)\s*baths?/i);
      const sqftMatch = details.match(/([\d,]+)\s*sqft/i);

      properties.push({
        id: `${zipcode}-${index + 1}`,
        name,
        price,
        lat: 0,
        lng: 0,
        image,
        bedrooms: bedroomsMatch ? parseInt(bedroomsMatch[1]) : undefined,
        bathrooms: bathroomsMatch ? parseInt(bathroomsMatch[1]) : undefined,
        sqft: sqftMatch ? parseInt(sqftMatch[1].replace(/,/g, "")) : undefined,
        zipcode,
      });
    });

    console.log(`✅ Scraped ${properties.length} properties for ${zipcode}`);
  } catch (err) {
    console.error(`❌ Error scraping zipcode ${zipcode}:`, err);
  }

  return properties;
}
