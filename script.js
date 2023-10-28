 /* 
  curl -X POST -d '{
    "textQuery" : "Spicy Vegetarian Food in Sydney, Australia"
  }' \
  -H 'Content-Type: application/json' -H 'X-Goog-Api-Key: API_KEY' \
  -H 'X-Goog-FieldMask: places.displayName,places.formattedAddress,places.priceLevel' \
  'https://places.googleapis.com/v1/places:searchText'?
 */


$(document).ready(() => {
  // init 
  const LOC_DEFAULT = { lat: -6.2882807, lon: 106.7582081 }
  const GMAPS_SERVICE = {
    baseUrl: 'https://places.googleapis.com/v1/places:searchText',
    apiKey: 'AIzaSyDrKKE1nUz2AyUtomXFUSnoQyJ-OsSr5mY'
  } 

  getAddressFromLocation ([LOC_DEFAULT.lat,LOC_DEFAULT.lon])

  const map = L.map('map').setView([LOC_DEFAULT.lat,LOC_DEFAULT.lon], 15);
  let marker = L.marker([LOC_DEFAULT.lat,LOC_DEFAULT.lon],{draggable: true, autoPanOnFocus: true}).addTo(map);

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
		maxZoom: 19,
		attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
	}).addTo(map);

  const $mySelect = $(".js-example-data-ajax").select2({
    ajax: {
      url:  GMAPS_SERVICE.baseUrl,
      method: 'POST',
      dataType: 'json',
      delay: 500,
      headers: {
        'X-Goog-Api-Key': GMAPS_SERVICE.apiKey,
        'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.location'
      },
      data: function (params) {
        return {
          textQuery: params.term, // search term
          languageCode: 'id'
        };
      },
      processResults: function (data, params) {
        const tempData = []
        
        data.places.forEach(it => {
          const geo = `${it.location.latitude},${it.location.longitude}`
          const text = it.formattedAddress
  
          tempData.push({id: geo, text: text, title: it.displayName.text })
        })
  
        return {
          results: tempData,
        };
      },
      cache: true
    },
    placeholder: 'Cari Alamat',
    minimumInputLength: 5,
    allowClear: true,
    templateResult: formatRepo,
    templateSelection: formatRepoSelection
  });
  
  function formatRepo (repo) {
    if (repo.loading) {
      return repo.text;
    }
  
    var $container = $(
      "<div class='item'>" +
          "<div class='title'></div>" +
          "<div class='description'></div>" +
      "</div>"
    );
  
    $container.find(".title").text(repo.title);
    $container.find(".description").text(repo.text);
  
    return $container;
  }
  
  function formatRepoSelection (repo) {
    return repo.display_name || repo.text;
  }
  
  
  $mySelect.on('select2:select', function (e) {
    const [lat, lon] = $mySelect.val().split(',')
    const text = `latitude: ${lat}, longitude: ${lon}`
    $('.geo').text(text)

    const location = [lat,lon]
    marker.setLatLng(location,{draggable:'true'}).bindPopup(location).update()
    map.flyToBounds([location])
  });
  
  $mySelect.on('select2:clear', function (e) {    
    const location = [LOC_DEFAULT.lat,LOC_DEFAULT.lon]
    marker.setLatLng(location,{draggable:'true'}).bindPopup(location).update()
    map.flyToBounds([location])
  });
  

  async function onMapClick(e) {      
    marker.setLatLng([e.latlng.lat, e.latlng.lng],{draggable:'true'})
    map.addLayer(marker);
    await getAddressFromLocation ([e.latlng.lat,e.latlng.lng])
  }

  marker.on('dragend', async function(event){
    marker = event.target;
    const position = marker.getLatLng();
    const {lat,lng} = position
    
    marker.setLatLng([lat,lng],{draggable:'true'}).bindPopup([lat,lng]).update();
    await getAddressFromLocation ([lat,lng])
  });

  map.addLayer(marker);

  map.on('click', onMapClick);



  async function getAddressFromLocation (location) {
    const [lat, lon] = location
    $('.geo').text('Loading...')
    const response = await $.ajax({
      header: {
        'Accept-Language': 'id'
      },
      method: "GET",
      url: `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${GMAPS_SERVICE.apiKey}`,
      dataType: "json"
    });

    const text = response.results[0].formatted_address
    const value = `${response.results[0].geometry.location.lat},${response.results[0].geometry.location.lng}`
    const op = new Option(text, value, true, true)
    $('.js-example-data-ajax').append(op)

    let textView = `latitude: ${response.results[0].geometry.location.lat}, longitude: ${response.results[0].geometry.location.lng}`
    $('.geo').text(textView)
  }  

})
