/**
 * Ski Resort STR Analyzer — RapidAPI Connection Tester
 * Run: node test-apis.mjs
 * Tests every known endpoint path for each subscribed API and shows exactly
 * what comes back so you can see which paths work and what the response shape is.
 */

const KEY = process.env.RAPIDAPI_KEY || "324bb62945msh0c1c9f8832417e3p1b54f5jsn40aed8c43385";
const LOCATION = "Breckenridge, CO";

// ── helper ────────────────────────────────────────────────────────────────────
async function hit(label, host, path, params = {}) {
  const url = new URL(`https://${host}${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const start = Date.now();
  try {
    const r = await fetch(url, {
      headers: { "x-rapidapi-key": KEY, "x-rapidapi-host": host },
    });
    const ms = Date.now() - start;
    let body;
    try { body = await r.json(); } catch { body = await r.text(); }
    const status = r.ok ? "✅" : r.status === 403 ? "🚫" : r.status === 404 ? "❌" : "⚠️";
    console.log(`\n${status} [${r.status}] ${label} (${ms}ms)`);
    console.log(`   ${url.toString().substring(0, 120)}`);
    if (r.ok) {
      // Print abbreviated response to show the shape
      const shaped = JSON.stringify(body, null, 2).split("\n").slice(0, 30).join("\n");
      console.log("   RESPONSE (first 30 lines):\n" + shaped.split("\n").map(l => "   " + l).join("\n"));
    } else {
      console.log("   ERROR:", typeof body === "string" ? body.slice(0, 200) : JSON.stringify(body).slice(0, 200));
    }
    return { ok: r.ok, status: r.status, body };
  } catch (e) {
    console.log(`\n💥 NETWORK ERROR: ${label}`);
    console.log("   " + e.message);
    return { ok: false, error: e.message };
  }
}

// ── tests ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("=".repeat(70));
  console.log("Ski Resort STR Analyzer — RapidAPI Endpoint Discovery");
  console.log(`Key: ${KEY.slice(0, 8)}...${KEY.slice(-6)}`);
  console.log(`Location: ${LOCATION}`);
  console.log("=".repeat(70));

  // ── 1. Private Zillow ────────────────────────────────────────────────────────
  const ZIL = "private-zillow.p.rapidapi.com";
  console.log("\n" + "─".repeat(50));
  console.log("🏠 PRIVATE ZILLOW");
  await hit("Zillow /search",                ZIL, "/search",                       { location: LOCATION, page: "1" });
  await hit("Zillow /propertyExtendedSearch", ZIL, "/propertyExtendedSearch",       { location: LOCATION, home_type: "Houses" });
  await hit("Zillow /forsaleByHomeType",      ZIL, "/forsaleByHomeType",            { location: LOCATION });
  await hit("Zillow /searchByUrl",            ZIL, "/searchByUrl",                  { url: "https://www.zillow.com/homes/Breckenridge-CO_rb/" });
  await hit("Zillow /properties/list",        ZIL, "/properties/list",              { location: LOCATION });
  await hit("Zillow /properties/search",      ZIL, "/properties/search",            { location: LOCATION });
  await hit("Zillow /v2/search",              ZIL, "/v2/search",                    { location: LOCATION });

  // ── 2. Airbnb Market & Rental Intelligence ───────────────────────────────────
  const AIR = "airbnb-market-rental-intelligence-api.p.rapidapi.com";
  const checkin  = new Date(Date.now() + 30*86400000).toISOString().slice(0,10);
  const checkout = new Date(Date.now() + 33*86400000).toISOString().slice(0,10);
  console.log("\n" + "─".repeat(50));
  console.log("🏠 AIRBNB MARKET & RENTAL INTELLIGENCE API");
  await hit("Airbnb /search",        AIR, "/search",        { location: LOCATION, checkin, checkout, adults: "2", currency: "USD" });
  await hit("Airbnb /listings",      AIR, "/listings",      { location: LOCATION, checkin, checkout, adults: "2", currency: "USD" });
  await hit("Airbnb /search-listings",AIR, "/search-listings",{ location: LOCATION });
  await hit("Airbnb /market",        AIR, "/market",        { location: LOCATION });
  await hit("Airbnb /market/stats",  AIR, "/market/stats",  { location: LOCATION });
  await hit("Airbnb /v2/search",     AIR, "/v2/search",     { location: LOCATION, checkin, checkout });
  await hit("Airbnb /properties",    AIR, "/properties",    { location: LOCATION });
  await hit("Airbnb /intelligence",  AIR, "/intelligence",  { location: LOCATION });

  // ── 3. AirDNA ─────────────────────────────────────────────────────────────────
  const ADN = "airdna1.p.rapidapi.com";
  console.log("\n" + "─".repeat(50));
  console.log("📊 AIRDNA");
  await hit("AirDNA /market",                ADN, "/market",                { location: LOCATION, currency: "USD" });
  await hit("AirDNA /market/search",         ADN, "/market/search",         { location: LOCATION });
  await hit("AirDNA /market/occupancy",      ADN, "/market/occupancy",      { location: LOCATION });
  await hit("AirDNA /market-statistics",     ADN, "/market-statistics",     { location: LOCATION });
  await hit("AirDNA /rentalizer",            ADN, "/rentalizer",            { location: LOCATION, bedrooms: "2", currency: "USD" });
  await hit("AirDNA /v1/market",             ADN, "/v1/market",             { location: LOCATION });
  await hit("AirDNA /search",               ADN, "/search",                { location: LOCATION });
  await hit("AirDNA /MarketStats",           ADN, "/MarketStats",           { location: LOCATION });
  await hit("AirDNA /market/rating",         ADN, "/market/rating",         { location: LOCATION });

  console.log("\n" + "=".repeat(70));
  console.log("Done. ✅ = working  🚫 = not subscribed  ❌ = wrong path  💥 = network error");
}

main().catch(console.error);
