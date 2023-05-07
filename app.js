let map, panorama, userMarker;


function initMap() {
  // Initialize the map
  const defaultCenter = { lat: 0, lng: 0 };
  map = new google.maps.Map(document.getElementById("map"), {
    center: defaultCenter,
    zoom: 2,
  });

  // Initialize the Street View panorama
  panorama = new google.maps.StreetViewPanorama(
    document.getElementById("pano"), {
    position: defaultCenter,
    pov: {
      heading: 34,
      pitch: 10,
    },
    addressControl: false, // Add this line to disable the address control

  }
  );

  // Add a click event listener to the map
  map.addListener("click", (event) => {
    userMarker.setPosition(event.latLng);
    getCountryName(panorama.getPosition(), () => {
      checkDistance(event.latLng, panorama.getPosition());
    });
  });

  // Add a marker for user selection
  userMarker = new google.maps.Marker({
    map: map,
    icon: {
      url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
    },
  });


  generateRandomStreetView();
}

let currentCountry = '';

function generateRandomStreetView() {
  // Reset userMarker, displayed information, and numberOfGuesses
  if (userMarker) {
    userMarker.setMap(null);
  }
  document.getElementById("distance").innerHTML = "";
  document.getElementById("country").innerHTML = "";
  document.getElementById("guess-count").innerHTML = "";
  numberOfGuesses = 0;

  const randomLat = Math.random() * 180 - 90;
  const randomLng = Math.random() * 360 - 180;
  const randomLatLng = new google.maps.LatLng(randomLat, randomLng);

  const streetViewService = new google.maps.StreetViewService();
  streetViewService.getPanoramaByLocation(randomLatLng, 5000, (data, status) => {
    if (status === google.maps.StreetViewStatus.OK) {
      panorama.setPano(data.location.pano);
      getCountryName(data.location.latLng);
    } else {
      generateRandomStreetView();
    }
  });
}


let numberOfGuesses = 0;

function checkDistance(userLatLng, svLatLng) {
  if (userLatLng) {
    numberOfGuesses++;

    const distance = google.maps.geometry.spherical.computeDistanceBetween(
      userLatLng,
      svLatLng
    );
    const distanceInKm = distance / 1000;

    if (distance <= 5000) {
      document.getElementById("distance").innerHTML = `${distanceInKm.toFixed(2)} km`;
      document.getElementById("guess-count").innerHTML = `${numberOfGuesses}`;
      userMarker.setMap(map);

      setTimeout(() => {
        alert(`Thank you! We have located the bomb. The distance apart was ${distanceInKm.toFixed(2)} km. It took you ${numberOfGuesses} attempts.`);

        // Reset userMarker and the displayed information
        userMarker.setMap(null);
        document.getElementById("distance").innerHTML = "";
        document.getElementById("country").innerHTML = "";
        document.getElementById("guess-count").innerHTML = "";

        numberOfGuesses = 0;
        generateRandomStreetView(); // Generate a new random coordinate
      }, 100);
    } else {
      // Set the map for the userMarker when the user clicks on the map
      userMarker.setMap(map);

      getCountryName(panorama.getPosition(), () => {
        document.getElementById("distance").innerHTML = `${distanceInKm.toFixed(2)} km`;
        document.getElementById("country").innerHTML = `${currentCountry}`;
        document.getElementById("guess-count").innerHTML = `${numberOfGuesses}`;
      });
    }
  }
}



function getCountryName(latLng, callback) {
  const geocoder = new google.maps.Geocoder();
  geocoder.geocode({ location: latLng }, (results, status) => {
    if (status === google.maps.GeocoderStatus.OK) {
      currentCountry = '';
      for (const component of results[0].address_components) {
        if (component.types.includes('country')) {
          currentCountry = component.long_name;
          break;
        }
      }
      if (callback) callback();
    } else {
      console.error('Geocoder failed:', status);
    }
  });
}


document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('api-key-submit').addEventListener('click', () => {
    apiKey = document.getElementById('api-key-input').value;
    if (apiKey) {
      document.getElementById('api-key-container').style.display = 'none';
      loadGoogleMapsApi();
    } else {
      alert('Please enter a valid Google Maps API key.');
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const apiKeyInput = document.getElementById("api-key-input");
  apiKeyInput.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      document.getElementById("api-key-submit").click();
    }
  });
});
