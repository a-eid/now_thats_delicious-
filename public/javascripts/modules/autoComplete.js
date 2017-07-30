const autoComplete = (input, latInput, lngInput) => {
  if (!input) return;
  const dropDown = new google.maps.places.Autocomplete(input);
  dropDown.addListener("place_changed", () => {
    latInput.value = dropDown.getPlace().geometry.location.lat();
    lngInput.value = dropDown.getPlace().geometry.location.lng();
  });
  input.on("keydown", e => {
    if (e.keyCode == 13) e.preventDefault();
  });
};
export default autoComplete;
