import axios from "axios";
import { $, $$, l } from "./bling";
const options = {
  center: {
    lat: 43.2,
    lng: -79.8
  },
  zoom: 13
};

const loadPlaces = (map, lat = 43.2, lng = -79.8) => {
  axios.get(`/api/stores/near?lat=${lat}&lng=${lng}`).then(res => {
    const places = res.data;
    const bounds = new google.maps.LatLngBounds();
    const infoWindow = new google.maps.InfoWindow();
    const markers = places.map(place => {
      const [placeLng, placeLat] = place.location.coordinates;
      const position = { lat: placeLat, lng: placeLng };
      bounds.extend(position);
      const marker = new google.maps.Marker({ map, position });
      marker.place = place;
      return marker;
    });
    markers.forEach(marker => {
      marker.addListener("click", function() {
        const html = `
        <div class="popup">
          <a href="/store/${marker.place.slug}">
            <img src="/uploads/${this.place.photo || "store.png"}" alt="${this
          .place.name}"/> 
          </a>
          <p>${this.place.name} - ${this.place.location.address}</p>
        </div>
        `;
        infoWindow.setContent(html);
        infoWindow.open(map, marker);
      });
    });
    map.setCenter(bounds.getCenter());
    map.fitBounds(bounds);
  });
};
function makeMap(mapDiv) {
  if (!mapDiv) return;
  const map = new google.maps.Map(mapDiv, options);
  loadPlaces(map);
  const input = $(`[name="geolocate"]`);
  const autoComplete = new google.maps.places.Autocomplete(input);
  autoComplete.addListener("place_changed", () => {
    let place = autoComplete.getPlace();
    loadPlaces(map , place.geometry.location.lat() , place.geometry.location.lng())
  });
}

export default makeMap;
