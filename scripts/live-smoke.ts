import { FLOOR_ORDER } from "../src/lib/catalog"
import { buildItemListUrl, fetchFloorItems, getDmmCredentials } from "./lib/dmm-client"
import "./lib/env"

async function main() {
  const credentials = getDmmCredentials()
  const urlWithoutOffset = buildItemListUrl({ floor: "comic", sort: "rank", hits: 1 })

  if (!/-99\d$/.test(credentials.affiliateId)) {
    throw new Error("affiliate_id suffix normalization failed")
  }

  if (urlWithoutOffset.searchParams.has("offset")) {
    throw new Error("offset=0 should not be sent")
  }

  for (const floor of FLOOR_ORDER) {
    const rankItems = await fetchFloorItems({ floor, sort: "rank", hits: 1 })
    const dateItems = await fetchFloorItems({ floor, sort: "date", hits: 1 })
    if (!rankItems.length) {
      throw new Error(`rank fetch returned empty for ${floor}`)
    }
    if (!dateItems.length) {
      throw new Error(`date fetch returned empty for ${floor}`)
    }
    console.log(JSON.stringify({ floor, rank: rankItems.length, date: dateItems.length }))
  }

  console.log("live smoke ok")
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
