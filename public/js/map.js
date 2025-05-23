// public/js/map.js
mapboxgl.accessToken = window.mapToken;

let parsedListing = {};

try {
  parsedListing = typeof window.listing === "string"
    ? JSON.parse(window.listing)
    : window.listing;
} catch (err) {
  console.error("❌ Failed to parse listing JSON:", err);
}

// ✅ Default to Delhi if geometry is missing or malformed
let coordinates = [77.1025, 28.7041];

if (
  parsedListing?.geometry?.coordinates &&
  Array.isArray(parsedListing.geometry.coordinates) &&
  parsedListing.geometry.coordinates.length === 2 &&
  parsedListing.geometry.coordinates.every(coord => typeof coord === "number")
) {
  coordinates = parsedListing.geometry.coordinates;
}

// ✅ Safe map initialization
if (document.getElementById("map")) {
  const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v12",
    center: coordinates,
    zoom: 13,
  });

  new mapboxgl.Marker({ color: "red" })
    .setLngLat(coordinates)
    .setPopup(
      new mapboxgl.Popup({ offset: 25 }).setHTML(
        `<h4>${parsedListing.title || "Listing"}</h4><p>Exact location will be shared after booking.</p>`
      )
    )
    .addTo(map);

  map.addControl(new mapboxgl.NavigationControl());
  map.addControl(new mapboxgl.ScaleControl());
}
