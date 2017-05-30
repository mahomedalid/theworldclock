storage = {};

storage.idb = {db:null};

storage.idb._init = function ()
{
	 window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

	try {
		var dbOpenRequest = window.indexedDB.open("mislibros");
		dbOpenRequest.onsuccess = function(event){
			storage.idb.db  = dbOpenRequest.result;
			DAO.version = db.version;
			var thisDB = db; // Need to create this variable since the variable db is assigned to other things later
			db.onversionchange = function(e){
				write("Version change triggered, so closing database connection", e.oldVersion, e.newVersion, thisDB);
				thisDB.close();
			};
		};
		dbOpenRequest.onupgradeneeded = function(e){
			write("Database upgrade needed");
			var db = dbOpenRequest.result;
			var transaction = dbOpenRequest.transaction;
			/* Code for ${db.upgrade} */
		};
		dbOpenRequest.onerror = function(e){
			write("DB Open Request Error");
		};
		dbOpenRequest.onblocked = function(e){
			write("DB Open Request Blocked");
		};
	} catch (e) {
		writeError(e);
	}

};


storage.local = {};

storage.local._get = function (id)
{
	if(localStorage[id] == undefined) {
		var list = {};
	} else {
		try {
			var list = JSON.parse(localStorage[id]);
		} catch (e) {
			var list = {};
		}
	}

	return list;
};

storage.local._set = function (id, obj)
{
	localStorage[id] = JSON.stringify(obj);
};


			var app = {
				currentSong : {}
			};
			
/*
			$.getJSON('demo.consulta.js',
				function(data) {
					if(data.success) {
						app.updateList(data.results, 'resultados_gasolineras', '@NOMBRE@ - Distancia: @DISTANCIA_KM@ km - Robo: @PORCENTAJE_ROBO_POR_LITRO@  %');
					}
				});
			*/
			app.baseUrl = "http://m.lacuerda.net/iapp.php?v=4.1a&";
			
			app.apiUrl = function (method) {
				method = method.replace(" ", "_");
				return app.baseUrl + method;
			};
			
			app.search = function (search) {
				$.ajax({
				  url: app.apiUrl("b="+search),
				  dataType: 'jsonp',
				}).always(function() {
					document.getElementById("title").innerHTML = res.title;
					app.updateList(res.items, 'resultados_acordes', '<a onclick="app.loadSong(\'@URL@\')">@TXT@ (@FD@)</a>');
			    });
			};
			
			app.loadSong = function (url) {
				$.ajax({
				  url: app.apiUrl(url),
				  dataType: 'jsonp',
				}).always(function() {
					document.getElementById("song_content").innerHTML = res.body;
					document.getElementById("song_band").innerHTML = res.banda;
					document.getElementById("song_title").innerHTML = res.cancion;
					
					app.currentSong = res;
					
					$.mobile.changePage("#page_song");
			    });
			};
			
			app.loadFav = function (rolacode) {
				var list = storage.local._get("favs");
				var res = list[rolacode];
				
				document.getElementById("song_content").innerHTML = res.body;
				document.getElementById("song_band").innerHTML = res.banda;
				document.getElementById("song_title").innerHTML = res.cancion;
					
				app.currentSong = res;
					
				$.mobile.changePage("#page_song");
			};
			
			
			app.loadClocks = function ()
			{
				var res = storage.local._get("clocks");
				
			};
			
			app.addClock = function (formValues)
			{
				var formObj = {};
			
				for(var key = 0; key < formValues.length; key++) {
					formObj[formValues[key].name] = formValues[key].value;
				}
				
				var timezone = timezones.result[formObj.new_clock_select];
				
				var list = storage.local._get("clocks");
				list[timezone.TimeZoneId] = timezone;
				
				storage.local._set("clocks", list);
				
				renderClocks();
			};
			
			app.removeClock = function (id)
			{
				var list = storage.local._get("clocks");
				delete list[id];
				
				storage.local._set("clocks", list);
				
				renderClocks();
			};
			
			app.apiKey = function () {
				return document.getElementById('api_key').value;
			};
			
			app.userId = function () {
				return document.getElementById('userid').value;
			};
			
			app.generateApiKey = function ()
			{
				var today = new Date();
				
				var hash = $.md5('2014' + app.userId() + 'autoii' + today.getFullYear() + today.getDate());
				return hash;
			};
			
			app.random = function (min, max) {
				return (Math.random()*(max-1))+min;
			};
			
			function init ()
			{
					setInterval(renderClocks, 1000);
					initNewClockSelect();
			}

			function onDeviceReady () { init(); }

			document.addEventListener("deviceready", onDeviceReady, false);
			
			app.updateList = function (list, listId, listItemHtml, clean) {
				if(clean == undefined) { var clean = true; }
				var domList = $('#'+listId);
				var domItem = domList[0]; 
				
				if(clean) { domItem.innerHTML = null };
				
				var limit = 999999; //More than that can cause a performance issue

				//for(var i = 0; i < list.length; i++) {
				for(var i in list) {
					
					var item = document.createElement ('li');

					if(i > limit) { item.innerHTML = "... demasiados resultados, refine su b&uacute;squeda"; domItem.appendChild(item); break; }

					var entity = list[i];
					
					var itemHtml = listItemHtml;
			
					for(var field in entity) {
						if(typeof(entity[field]) == 'string'|| typeof(entity[field]) == 'number' ) { 
							itemHtml = 
							itemHtml.replace(new RegExp("@"+field.toUpperCase()+"@", "gi"), entity[field]); 
						}
					}

					item.innerHTML = itemHtml;
					
					domItem.appendChild (item);
				}

				$('#'+listId).listview('refresh');
			};

var renderClocks = function ()
{
	document.getElementById("listado_mis_relojes").innerHTML = "<li><a><strong>My time</strong><br /><p style='font-size: 2em;' id='myclock_content'></p></a></li>";
	
	var clocks = {"myclock":1};

	for(var key in clocks) {
		renderClock(key);
	}
	
	var list = storage.local._get("clocks");

	app.updateList(list, 'listado_mis_relojes', '<a><strong>@TimeZoneId@</strong><br /><p style="font-size: 2em;" id="@TimeZoneId@_content"></p></a><a onclick="app.removeClock(\'@TimeZoneId@\')"></a>', false);
	
	$('#listado_mis_relojes').listview('refresh');
	
	for(var key in list) {
		renderClock(key, list[key]);
	}

};
	
var clockGetDate = function (timeObject)
{
	if(timeObject == undefined) {
		var date = new Date();
	} else {
		
		var targetTime = new Date();
		var timeZone = parseInt(timeObject.GMT);
		//get the timezone offset from local time in minutes
		var tzDifference = timeZone * 60 + targetTime.getTimezoneOffset();
		//convert the offset to milliseconds, add to targetTime, and make a new Date
		var offsetTime = new Date(targetTime.getTime() + tzDifference * 60 * 1000);
		
		var date = new Date(offsetTime);
	}
	
	return date;
};

var renderClock = function (id, timeObject)
{
	var date = clockGetDate(timeObject);
	
	if(timeObject == undefined) {
		document.getElementById(id+"_content").innerHTML = date.toTimeString().substr(0,9);
	} else {
		document.getElementById(id+"_content").innerHTML = date.toTimeString().substr(0,12) + " " + timeObject.GMT;
	}
};

var initNewClockSelect = function ()
{
	document.getElementById("new_clock_select").innerHTML = "";
	
	for(var i = 0; i < timezones.result.length; i++) {
		var timezone = timezones.result[i];
		
		var optionItem = document.createElement("option");
		
		optionItem.value = i;
		optionItem.innerHTML = timezone.TimeZoneId;
		
		document.getElementById("new_clock_select").appendChild(optionItem);
	}
};

