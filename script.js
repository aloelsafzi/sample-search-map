$(document).ready(() => {
  const locDefault = {lat: -6.2882807, lon: 106.7582081}
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
    $('.geo').text('Tidak ada data')
  });
  

  function onMapClick(e) {      
    marker.setLatLng([e.latlng.lat, e.latlng.lng],{draggable:'true'})
    let text = `latitude: ${e.latlng.lat}, longitude: ${e.latlng.lng}`
    $('.geo').text(text)

    marker.on('dragend', function(event){
      marker = event.target;
      const position = marker.getLatLng();
      const {lat,lng} = position
      
      marker.setLatLng([lat,lng],{draggable:'true'}).bindPopup([lat,lng]).update();
      text = `latitude: ${lat}, longitude: ${lng}`
      $('.geo').text(text)
    });
    map.addLayer(marker);
  }

  map.on('click', onMapClick);
})
