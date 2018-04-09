var iconBase = 'http://maps.google.com/mapfiles/ms/icons/';

var icons = {
	'한식': { name: 'korean', icon: iconBase + 'yellow-dot.png' },
	'중식': { name: 'chinese', icon: iconBase + 'red-dot.png' },
	'일식': { name: 'japanese', icon: iconBase + 'orange-dot.png' },
	'양식': { name: 'western', icon: iconBase + 'purple-dot.png' },
	'아시안': { name: 'asian', icon: iconBase + 'ltblue-dot.png' },
	'분식': { name: 'snack', icon: iconBase + 'green-dot.png' },
	'퓨전': { name: 'fusion', icon: iconBase + 'pink-dot.png' },
	'카페/디저트': { name: 'cafe', icon: iconBase + 'blue-dot.png' },
}

var places = {
	'한식': {},
	'중식': {},
	'일식': {},
	'양식': {},
	'아시안': {},
	'분식': {},
	'퓨전': {},
	'카페/디저트': {}
}

function initMap() {
	var map = new google.maps.Map(document.getElementById('map'), {
		zoom: 16,
		center: {lat:37.5004307,lng:127.0335385} // 회사 위치
	});

	var legend = document.getElementById('legend');
	
	for (var key in icons) {
		var name = key;
		var icon = icons[key].icon;
		var div = document.createElement('div');
		div.innerHTML = '<img style="width:20px;" src="' + icon + '"> ' + name;
		legend.appendChild(div);
	}

	map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(legend);

	var infoWindow = null;

	$.get('https://spreadsheets.google.com/feeds/list/1wubbvjFE_8LqoKFN_7WstUdMfNtJowHpVlY69IepUTw/od6/public/values?alt=json', function(data){
		var entries = data.feed.entry;
		for(var i = 0; i < entries.length; i++){
			var entry 	= entries[i];
			var place = {};

			place.id		= entry['id']		 	? entry['id']['$t']			 	: '';
			place.name 		= entry['gsx$맛집이름'] 	? entry['gsx$맛집이름']['$t']	 	: '';
			place.address	= entry['gsx$주소'] 		? entry['gsx$주소']['$t'] 		: '';
			place.type		= entry['gsx$종류'] 		? entry['gsx$종류']['$t']	 		: '';
			place.menu		= entry['gsx$추천메뉴'] 	? entry['gsx$추천메뉴']['$t'] 		: '';
			place.comment 	= entry['gsx$한줄평'] 	? entry['gsx$한줄평']['$t'] 		: '';
			place.link 		= entry['gsx$관련링크'] 	? entry['gsx$관련링크']['$t'] 		: '';
			place.image		= entry['gsx$대표사진'] 	? entry['gsx$대표사진']['$t']	 	: '';
			place.writer	= entry['gsx$이메일주소'] 	? entry['gsx$이메일주소']['$t'] 	: '';
			place.created 	= entry['gsx$타임스탬프'] 	? entry['gsx$타임스탬프']['$t'] 	: '';
			place.edit 		= entry['gsx$수정']	 	? entry['gsx$수정']['$t']		 	: '';

			place.lat 		= entry['gsx$latitude'] ? parseFloat(entry['gsx$latitude']['$t']) : '';
			place.lng 		= entry['gsx$longitude']? parseFloat(entry['gsx$longitude']['$t']): '';

			place.imageId = place.image.split('id=').length > 0 ? place.image.split('id=')[1] : '';

			var position = {lat: place.lat, lng: place.lng};

			var contentString  = '<div class="card" style="width:20rem; border:none;">';
				contentString += 	'<h5 class="card-title mt-2 mb-0 ml-1"><span class="badge badge-secondary">' + place.type + '</span> ' + place.name + '</h5>';
				contentString += 	'<a class="mb-1" style="text-align:right;" target="_blank" href="' + place.edit + '">수정</a>';
				contentString += place.imageId ? 
									'<img class="card-img-top" src="https://drive.google.com/a/toss.im/thumbnail?id=' + place.imageId + '">' : '';
				contentString += 	'<div class="card-body">';
				contentString +=		'<p class="card-subtitle mb-2 text-muted" style="text-align:right;"><em>' + place.address + '</em></p>';
				contentString += place.menu ?		
										'<h6 class="card-text"><strong>작성자의 추천메뉴</strong></h6><p class="mb-3">- ' + place.menu + '</p>' : '';
				contentString += place.comment ?		
										'<h6 class="card-text"><strong>작성자의 한줄평</strong></h6><p class="mb-2">- ' + place.comment + '</p>' : '';
				contentString += place.link ?
										'<a class="card-text" target="_blank" href="' + place.link + '"><small>' + place.link + '</small></a>' : '';
				contentString += place.writer ?
								 		'<p class="cart-text text-muted mt-1" style="text-align:right;"><small>' + place.writer.split('@')[0] + '님이 ' + place.created + '에 작성</small>&ensp;</p>' : '';
				contentString += 	'</div>';
				contentString += '</div>';

			place.contentString = contentString;

			place.infoWindow = new google.maps.InfoWindow({
				content: place.contentString
			});

			place.marker = new google.maps.Marker({
				position: position,
				map: map,
				title: place.type + ':' + place.name,
				type: place.type,
				icon: icons[place.type].icon
			});

			place.marker.addListener('click', function(e) {
				if (infoWindow){ infoWindow.close(); }

				var place = places[this.title.split(':')[0]][this.title.split(':')[1]];
				infoWindow = place.infoWindow;
				infoWindow.open(map, place.marker);

				DISQUS.reset({
					reload: true,
					config: function () {  
						this.page.identifier = place.name;  
						this.page.title = place.name;  
						this.page.url = 'https://alex-toss.github.io/tosshelin-guide#!' + place.name;
					}
				});
			});

			places[place.type][place.name] = place;

			var anchor = $(
				'<li><a class="dropdown-item" href="#">' +
					'<img style="width:12px;" class="mr-1" src="' + icons[place.type].icon + '">' +
					'<small>' + place.name + '</small>' + 
				'</a></li>'
			).data('type', place.type).data('name', place.name)
			.on('click', function(e){
				if (infoWindow){ infoWindow.close(); }

				var place = places[$(this).data('type')][$(this).data('name')];
				infoWindow = place.infoWindow;
				place.infoWindow.open(map, place.marker);

				DISQUS.reset({
					reload: true,
					config: function () {  
						this.page.identifier = place.name;  
						this.page.title = place.name;  
						this.page.url = 'https://alex-toss.github.io/tosshelin-guide#!' + place.name;
					}
				});
			});
			
			$('#'+icons[place.type].name+'Dropdown ul div div:nth-child('+((Object.keys(places[place.type]).length+2)%3+1)+') ul').append(anchor);
		}

		for(var key in places){
			$('#'+icons[key].name+'Dropdown a span').text('('+Object.keys(places[key]).length+')');
		}
	});
}
