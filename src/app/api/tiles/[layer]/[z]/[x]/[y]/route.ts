import { NextRequest } from "next/server";

interface RouteParams {
  layer: string;
  z: string;
  x: string;
  y: string;
}

export async function GET(
  _request: NextRequest,
  props: { params: Promise<RouteParams> }
) {
  const { layer, z, x, y } = await props.params;

  const mapboxToken = process.env.MAPBOX_API_KEY?.trim();
  const hasValidMapboxKey =
    Boolean(mapboxToken) &&
    mapboxToken !== "your_mapbox_api_key_here" &&
    (mapboxToken?.length ?? 0) > 10;

  let primaryUrl = "";
  let fallbackUrl = "";

  if (layer === "satellite") {
    if (hasValidMapboxKey) {
      primaryUrl = `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/${z}/${x}/${y}?access_token=${mapboxToken}`;
    } else {
      primaryUrl = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`;
    }
    fallbackUrl = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`;
  } else if (layer === "hybrid") {
    if (hasValidMapboxKey) {
      primaryUrl = `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/tiles/256/${z}/${x}/${y}?access_token=${mapboxToken}`;
    } else {
      primaryUrl = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`;
    }
    fallbackUrl = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`;
  } else {
    // dark mode tiles (CartoDB Dark Matter)
    primaryUrl = `https://a.basemaps.cartocdn.com/dark_all/${z}/${x}/${y}.png`;
    fallbackUrl = `https://b.basemaps.cartocdn.com/dark_all/${z}/${x}/${y}.png`;
  }

  try {
    let response = await fetch(primaryUrl);

    // If primary failed (e.g. Mapbox token invalid or rate limited), try fallback
    if (!response.ok && fallbackUrl && fallbackUrl !== primaryUrl) {
      response = await fetch(fallbackUrl);
    }

    if (!response.ok) {
      return new Response("Tile not found", { status: response.status });
    }

    const contentType =
      response.headers.get("content-type") ||
      (layer === "dark" ? "image/png" : "image/jpeg");
    const buffer = await response.arrayBuffer();

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=604800, stale-while-revalidate=86400",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    // Graceful fallback for offline / disconnected environments
    return new Response("Tile fetch failed", { status: 502 });
  }
}
