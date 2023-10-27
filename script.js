$(document).ready(() => {
  // init 
  const locDefault = {lat: -6.2882807, lon: 106.7582081}
  getAddressFromLocation ([locDefault.lat,locDefault.lon])

  const map = L.map('map').setView([locDefault.lat,locDefault.lon], 15);
  let marker = L.marker([locDefault.lat,locDefault.lon],{draggable: true, autoPanOnFocus: true}).addTo(map);

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
		maxZoom: 19,
		attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
	}).addTo(map);

  const $mySelect = $(".js-example-data-ajax").select2({
    ajax: {
      url: "https://nominatim.openstreetmap.org/search.php",
      dataType: 'json',
      delay: 250,
      data: function (params) {
        return {
          q: params.term, // search term
          polygon_geojson: 1,
          addressdetails: 1,
          format: 'jsonv2'
        };
      },
      processResults: function (data, params) {
        const tempData = []
        data.forEach(it => {
          const geo = `${it.lat},${it.lon}`
          const text = it.display_name
  
          tempData.push({id: geo, text: text, title: it.name })
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
    const location = [locDefault.lat,locDefault.lon]
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
      method: "GET",
      url: `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`,
      dataType: "json"
    });

    const text = response.display_name
    const value = `${response.lat},${response.lon}`
    const op = new Option(text, value, true, true)
    $('.js-example-data-ajax').append(op)

    let textView = `latitude: ${response.lat}, longitude: ${response.lon}`
    $('.geo').text(textView)
  }  

})
