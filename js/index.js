/* 
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
		$(document).ready(function() {
			// Se creaza folderul AnwarSubhiQasem
			window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onRequestFileSystemSuccess, null); 

			function onRequestFileSystemSuccess(fileSystem) { 
					var entry=fileSystem.root; 
					entry.getDirectory("AnwarSubhiQasem", {create: true, exclusive: false}, onGetDirectorySuccess, onGetDirectoryFail); 
			} 
			
			window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
			window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, null);
			
			function gotFS(fileSystem) {
			  console.log("entered gotFS: " + fileSystem.root.getDirectory);
			}
			
			function onGetDirectorySuccess(dir) { 
				  console.log("Created dir "+dir.name); 
				  console.log("Created path "); 
			} 
			
			function onGetDirectoryFail(error) { 
				 console.log("Error creating directory "+error.code); 
			}
			console.log(' ===> acesta este dir');
			
			
			// Se copiaza directorul alarms -> AnwarSubhiQasem
			// Aici a fost folosit un plugin pentru asta care se numeste asset2sd
			asset2sd.copyDir({
				asset_directory: "www/alarms",
				destination_directory: "AnwarSubhiQasem"
			});
						
			//setez variabilele care vor fi folosite 
			localStorage.setItem("deleteReminderOn"					, false	);
			localStorage.setItem("deleteTimerOn"					, false	);

			//Coloana Active este pentru a afla daca alarma este on(1) sau off(0)
			//Coloana Type este pentru a putea specifica tipul alarmei (primary,secondary). Secondary este situatia prealarmei
			//Coloana SecondaryTo este pentru a sti pentru ce id de alarma este prealarma
			
			var db = window.openDatabase("AlarmApp", "1.0", "Alarm Application", 200000);
			//db.transaction(function(transaction){transaction.executeSql("DROP TABLE Alarms",[],successCB,errorCB)});
			db.transaction(function(transaction) {
				transaction.executeSql('CREATE TABLE IF NOT EXISTS Alarms ( ' + 
											'Id INTEGER PRIMARY KEY,' + 
											'Data INTEGER,' +
											'Message TEXT,' +
											'Title TEXT,' +
											'Repeat TEXT,'+ 
											'Sound TEXT,'+  
											'Active INTEGER,'+ 
											'Type TEXT,' +
											'SecondaryTo INTEGER)',[],successCB,errorCB); 
			});
			
			//functia pentru adaugare superreminder
			$("#addSuperReminder").click(function()
			{
				//alert("incep sa salvez!");
				
				
				if($("#superReminderAlertMessageState").val() == "on")
					var new_message 	= localStorage.getItem("superReminderMessageVal");
				else
					var new_message     = "";  
					
				var datetime    	= localStorage.getItem("quickReminderUnixTime");
				var title			= "";
				var repeat			= "daily";
				var type			= "primary";  
				var active			= "1";
				var secondaryTo		= "0";
				
				if(localStorage.getItem("superReminderSoundStateValue") == "on")
					var soundFile = localStorage.getItem("superReminderMelodyPreview") + ".mp3";
				else
					var soundFile = ""; 
					
				// alert("Stare mesaj alarma: " + $("#superReminderAlertMessageState").val()); 
				// alert("Mesaj: " + new_message);
				// alert("Timp: " + datetime);
				// alert("Titlu: " + title);
				// alert("Repeat: " + repeat);
				// alert("Tip : " + type);
				// alert("Activa: " + active);
				// alert("Secundara : " + secondaryTo);
				// alert("Stare sunet : " + localStorage.getItem("superReminderSoundStateValue"));
				// alert("Fisier sunet : " + soundFile);
					
				//var new_message     = "Mesaj de proba"; 	
				//var datetime    	= 1411680;
				//var title			= "titlu alarma falsa";
				//var repeat			= "daily";
				//var type			= "primary";  
				//var active			= "1";
				//var secondaryTo		= "0";
				//var sound			= "sound";
				//var secondaryTo		= 0;
				var preAlarmStatus  = "on";
				
				db.transaction(function(transaction) 
				{ 
					transaction.executeSql('INSERT INTO Alarms ("Data", "Message", "Title","Repeat","Sound","Active","Type","SecondaryTo")'+ 
										   'VALUES ("'+ datetime +'", "' + new_message + '", "' + title + '","' + repeat + '","' + soundFile + '","' + active + '","' + type + '","' + secondaryTo + '")', [],SuccessCDB,errorCB)
				}); 
				
				function SuccessCDB (transaction,results)
				{
					//alert("am bagat alarma!");
					var inserted_id = results.insertId;
					//alert("Status prealarma : " + preAlarmStatus);
					
					window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem)
					{
						window.plugin.notification.local.add({
							id:      inserted_id,
							title:   title, 
							message: new_message,
							repeat:  repeat, 
							date:    new Date(parseInt(localStorage.getItem("quickReminderUnixTime"))),   
							sound : fileSystem.root.toURL() + 'AnwarSubhiQasem/burglar.mp3'  
						}); 
					}, null);
					
					if(preAlarmStatus == "on")
					{
						//alert("acum bag prealarma!");
						var preAlarmDate 		 = 1415280256;//localStorage.getItem("preAlarmTime");
						var preAlarmMessageState = "on";//$("#superReminderPreAlarmMessageState").val();
						var preAlarmSoundState	 = "on";//$("#superReminderPreAlarmSoundState").val();
						var preAlarmActive		 = 1; 
						var preAlarmRepeat		 = "daily";
						var preAlarmTitle		 = "";
						var preAlarmType		 = "secondary";
						var preAlarmSecondaryTo  = inserted_id; 
						 
						if(preAlarmMessageState == "on")
							var preAlarmMessage = "Pre alarm for " + new_message;
						else
							var preAlarmMessage = "";
							
						if(preAlarmSoundState == "on")
							var preAlarmSound = soundFile;
						else
							var preAlarmSound = "";
						 
						// alert("Data prealarma : " 		+ preAlarmDate);
						// alert("PreAlarmMessageState : " + preAlarmMessageState);
						// alert("PreAlarmSoundState : " 	+ preAlarmSoundState  );
						// alert("PreAlarmActive : " 		+ preAlarmActive);
						// alert("PreAlarmTitle : " 		+ preAlarmTitle);
						// alert("PreAlarmType : " 		+ preAlarmType);
						// alert("PreAlarmSecondaryTo : "	+ preAlarmSecondaryTo);
						// alert("PreAlarmMessage : " 		+ preAlarmMessage);
						// alert("PreAlarmSound : " 		+ preAlarmSound);
							
						db.transaction(function(transaction) 
						{ 
							transaction.executeSql('INSERT INTO Alarms ("Data", "Message", "Title","Repeat","Sound","Active","Type","SecondaryTo")'+ 
												   'VALUES ("'+ preAlarmDate +'", "' + preAlarmMessage + '", "' + preAlarmTitle + '","' + preAlarmRepeat + '","' + preAlarmSound + '","' + preAlarmActive + '","' + preAlarmType + '","' + preAlarmSecondaryTo + '")', [],successCBPreAlarm,errorCB)
						});
						
						function successCBPreAlarm (transaction,results)
						{  
							//alert("am bagat prealarma");
							window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem)
							{
								window.plugin.notification.local.add({
									id:      inserted_id,
									title:   title, 
									message: new_message,
									repeat:  repeat, 
									date:    new Date(parseInt(localStorage.getItem("quickReminderUnixTime"))),   
									sound : fileSystem.root.toURL() + 'AnwarSubhiQasem/burglar.mp3'  
								}); 
							}, null);
						} 
					}
				
				}
				
				populateReminders();  
			});
			
			//functia pentru adaugarea unui reminder
			$('#addQuickReminder').click(function()  
			{ 
				var inserted_id		= "";
				
				var datetime 		= localStorage.getItem("quickReminderUnixTime"); 
				var new_message 	= "Reminder";
				var title 			= $('#titluQuickReminder').val();
				var repeat			= "daily";
				var type			= "primary"; 
				var active			= "1";
				var secondaryTo		= "0";
				var sound			= "burglar.mp3";  
				
				db.transaction(function(transaction) 
				{ 
					transaction.executeSql('INSERT INTO Alarms ("Data", "Message", "Title","Repeat","Sound","Active","Type","SecondaryTo")'+ 
										   'VALUES ("'+ datetime +'", "' + new_message + '", "' + title + '","' + repeat + '","' + sound + '","' + active + '","' + type + '","' + secondaryTo + '")', [],SuccessCDB,errorCB)
				}); 
				function SuccessCDB (transaction,results)
				{ 
					window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem){
						var inserted_id = results.insertId;
						
						window.plugin.notification.local.add({
							id:      inserted_id,
							title:   title, 
							message: new_message,
							repeat:  repeat, 
							date:    new Date(parseInt(localStorage.getItem("quickReminderUnixTime"))),   
							sound : fileSystem.root.toURL() + 'AnwarSubhiQasem/burglar.mp3'  
						}); 
					}, null);
				}
				populateReminders();
			});
			// sfarsit functie adaugare reminder
			
			// DE STERS - functie doar pentru a vedea id-urile in timpul developmentului
			$('#showremindersids').click(function(){
				var options = {
				  date: new Date(),
				  mode: 'date'
				};
				
				datePicker.show(options, function(date){
				  alert("date result " + date);  
				});
				window.plugin.notification.local.getScheduledIds(function (scheduledIds) {
					console.log('Scheduled IDs: ' + scheduledIds.join(' ,'));
				});	
			});

			//

			// functia pentru popularea paginii cu remindere
			function populateReminders() 
			{
				$('#showRemindersBox').html('');
				db.transaction(function(transaction) {
				transaction.executeSql('SELECT * FROM Alarms WHERE Type="primary";', [],
					function(transaction, result) {
						if (result != null && result.rows != null) 
						{
							for (var i = 0; i < result.rows.length; i++) 
							{
								var row = result.rows.item(i);  
								var status_reminder = 'on';
								if(row.Active == 0) {
									status_reminder = 'off';	
								}
								
		        				$('#showRemindersBox').append('<div class="reminder-container" data-id="'+ row.Id +'">' +
																	'<div class="'+ status_reminder +'-reminder">' +
																		status_reminder + 
																	'</div>' +
																	'<div class="delete-reminder">'+
																		'&nbsp;' +
																	'</div>' +
																	'<div class="reminder-details">' +
																		'<p class="reminder-date">'+ moment(row.Data).format('MMMM Do YYYY, h:mm:ss a') +'</p>' +
																		'<p class="reminder-title">'+ row.Title + ' ' + row.Message +'</p>' + 
																		'<p class="reminder-repeat">'+ row.Repeat +'</p>' +
																	'</div>' + 
																	'<div class="reminder-delete">' +
																		'Delete' +
																	'</div>' +
																'</div>'); 
								} 
							}
						}
					);
				});
			}
			//sfarsit functie populare pagina remindere
			
			populateReminders();
			
			$("#reminderEdit").on("click",function()
			{
				if($(this).data("state") == "edit")
					goEditReminder(this);
				else if($(this).data("state") == "cancel")
					goCancelEditReminder(this); 
			}); 
			
			function goEditReminder(el)  
			{
				$(".on-reminder"		).hide();
				$(".off-reminder"		).hide();
				$(".delete-reminder"	).css("display","inline-block");
				$("#reminderEdit"		).text("Done");
				$("#reminderEdit"		).attr("onclick","cancelEditReminder()");
				
				$(el).data("state","cancel");
				
				localStorage.setItem("deleteReminderOn",true); 
			}
			
			function goCancelEditReminder(el)
			{
				$(".on-reminder"		).css("display","inline-block");
				$(".off-reminder"		).css("display","inline-block");
				$(".delete-reminder"	).hide();
				$("#reminderEdit"		).text("Edit");
				$("#reminderEdit"		).attr("onclick","editReminder()");
				$(".reminder-delete"	).hide();
			
				$(el).data("state","edit");
				
				localStorage.setItem("deleteReminderOn",false); 
			}
			
			//functie pentru oprire alarma
			$("#showRemindersBox").on("click",".on-reminder",function()
			{
				$(this).removeClass("on-reminder");
				$(this).addClass("off-reminder");
				$(this).text("off");
				
				var id = $(this).parent().data("id");
				updateActiveState(0,id);
				
				window.plugin.notification.local.cancel(id);
				
			});  
			//
			
			// functie pentru pornire alarma
			$("#showRemindersBox").on("click",".off-reminder",function()
			{
				$(this).removeClass("off-reminder");
				$(this).addClass("on-reminder");
				$(this).text("on");
				
				var id = $(this).parent().data("id");
				updateActiveState(1,id);
				
				populateReminders();
			}); 
			//
			
			//functie care arata butonul de delete pentru reminder
			$("#showRemindersBox").on("click",".delete-reminder",function()
			{
				var id = $(this).parent().data("id"); 
				$(this).parent().find(".reminder-delete").show();
			});
			//
			
			//functie care sterge reminder-ul
			$("#showRemindersBox").on("click",".reminder-delete",function()
			{
				var id = $(this).parent().data("id"); 
				
				db.transaction(function(transaction)  
				{  
					transaction.executeSql('DELETE FROM Alarms WHERE Id=(?)', [id], successCB,errorCB) 
				});
				
				$(this).parent().remove();  
			});
			//
			
			//functie care stabileste ce se intampla cand dai click pe detaliile reminder-ului- anuleaza stergerea sau merge la editare reminder
			$("#showRemindersBox").on("click",".reminder-details",function()
			{
				if(localStorage.getItem("deleteReminderOn"))
					$(this).parent().find(".reminder-delete").hide();
				else
					console.log("Du-ma la editare bai programatorule!");
			});
			
			function updateActiveState(state,id)
			{
				window.plugin.notification.local.getScheduledIds(function (scheduledIds) {
					console.log('Scheduled IDs: ' + scheduledIds.join(' ,'));
				});
				db.transaction(function(transaction)  
				{  
					transaction.executeSql('UPDATE Alarms SET Active=(?) WHERE Id=(?)', [state,id], successCB,errorCB) 
				});
				console.log("state: " + state);
				console.log("id:    " + id	 );
			}
			
						
			
			function getTimestampFromDate(dateString)
			{
				//var dateString = '17-09-2013 10:08',
			    var dateParts = dateString.split(' '),
			    	timeParts = dateParts[1].split(':'),
			    	date;
			
			    dateParts = dateParts[0].split('-');
			
				date = new Date(dateParts[2], parseInt(dateParts[1], 10) - 1, dateParts[0], timeParts[0], timeParts[1]);
				
				return date.getTime(); //1379426880000
				//console.log(date); //Tue Sep 17 2013 10:08:00 GMT-0400
			}
			
			
			
			$(".deleteReminder").click(function()  
			{
				var id = $(this).data("id");
				db.transaction(function(transaction) {
					transaction.executeSql('DELETE FROM Alarms WHERE id=' + id, [], 
						function(tx, results){ });
				});
				
				window.plugin.notification.local.cancel(id, function(){console.log("am sters ca nebunu'")}, scope);	
			}); 
			
			
			$("#superReminderMelody").on("click",function()
			{
				var sound 	 = $("#superReminderMelody input:radio:checked").val(); 
				var my_media = new Media("/android_asset/www/alarms/"+ sound +".mp3",function(){console.log("playAudio():Audio Success");},function(err){console.log("playAudio():Audio Error: " + err);});
			      
			     my_media.play(); 
			});
			
			$("#superReminderPreAlarmMelody").on("click",function()
			{
				var sound 	 = $("#superReminderPreAlarmMelody input:radio:checked").val(); 
				var my_media = new Media("/android_asset/www/alarms/"+ sound +".mp3",function(){console.log("playAudio():Audio Success");},function(err){console.log("playAudio():Audio Error: " + err);});
			      
			     my_media.play();  
			});
			
			
			
					/*
					transaction.executeSql('SELECT * FROM Settings;', [],
						function(transaction, result) {
							console.log(result);
							if (result != null && result.rows != null) 
							{
								for (var i = 0; i < result.rows.length; i++) 
								{
									console.log('Id =' + Id );
									console.log('ReminderSnoozeNag =' + ReminderSnoozeNag );
									console.log('ReminderRelentlessNag =' + ReminderRelentlessNag );
									console.log('ReminderDuetime =' + ReminderDuetime );
									console.log('ReminderQuickPickerHour =' + ReminderQuickPickerHour );
									console.log('ReminderQuickPickerMinute =' + ReminderQuickPickerMinute );
									
									console.log('ReminderAutoViewNotesFromAlert =' + ReminderAutoViewNotesFromAlert );
									console.log('ReminderLongPressToViewNotes =' + ReminderLongPressToViewNotes );
									console.log('ReminderCompletedAutoTrim =' + ReminderCompletedAutoTrim );
									console.log('ReminderMelody =' + ReminderMelody );
									console.log('ReminderPreMelody =' + ReminderPreMelody );
									console.log('ReminderTimerPickerInterval =' + ReminderTimerPickerInterval );
									console.log('QuickReminderMelody =' + QuickReminderMelody );
									console.log('QuickReminderTimerPickerInterval =' + QuickReminderTimerPickerInterval );
									console.log('TimersMelody =' + TimersMelody );
									
									console.log('TimersDisableAutoLock =' + TimersDisableAutoLock );
									console.log('AppIconBadge =' + AppIconBadge );
									console.log('PauseAllAlarms =' + PauseAllAlarms );
									console.log('RemindersAlertsState =' + RemindersAlertsState );
									console.log('RemindersSoundsState =' + RemindersSoundsState );
									console.log('RemindersNagMeState =' + RemindersNagMeState );
									console.log('TimersAlertsState =' + TimersAlertsState );
									console.log('TimersSoundsState =' + TimersSoundsState );
									console.log('TimersNagMeState =' + TimersNagMeState );
									
									saveSuperReminderMessage("Reminder");
									saveSuperReminderTime(moment().format('MMMM Do YYYY') + " " + moment().format('h:mm:ss a'));
									saveSuperReminderRepeat("ui-id-1","Never"); 
									saveSuperReminderRepeatThru("Forever");
									saveSuperReminderLeadTime("off","0");
									saveSuperReminderAlarmState("off");
									saveSuperReminderPreAlarmMelody("Burglar");
									saveSuperReminderMelody("Burglar");
									saveSuperReminderSnooze("Drop-down Panel");
									saveSuperReminderSoundState("off");
									saveSuperReminderPreAlarmMessageState("off");
									saveSuperReminderPreAlarmSoundState("off");
								}
							}
						}
					);
				*/
			
					
			function saveSuperReminderMessage(value)
			{
				localStorage.setItem("superReminderMessageVal", value); 
				$("#superReminderMessagePreview").text(localStorage.getItem("superReminderMessageVal"));
				$("#superReminderMessage").val(localStorage.getItem("superReminderMessageVal")); 
			}
			
			function saveSuperReminderTime( data , timp )
			{
				localStorage.setItem("superReminderDateVal"				, data );
				localStorage.setItem("superReminderTimeVal" 			, timp );
				$("#superReminderTimePreview").text(data + " " + timp);
			}
			
			function saveSuperReminderRepeat( selectedTab ,  value )
			{
				localStorage.setItem("superReminderRepeat"	, value 				 );
				$("#superReminderRepeatPreview").text(localStorage.getItem("superReminderRepeat"));
				localStorage.setItem("idSuperReminderRepeatSelectedTab"	, selectedTab	);
				 
				$('div[data-role="tabs"] [data-role="navbar"] .ui-btn-active').removeClass('ui-btn-active ui-state-persist');
	        	$("#" + localStorage.getItem("idSuperReminderRepeatSelectedTab")).addClass('ui-btn-active ui-state-persist');
			}
			
			function saveSuperReminderRepeatThru( value )
			{
				localStorage.setItem("superReminderRepeatThruPreview"   , value );
				$("#superReminderRepeatThruPreview").text(localStorage.getItem("superReminderRepeatThruPreview"));
			
			}
			
			function saveSuperReminderLeadTime( state , value )
			{
				localStorage.setItem("superReminderPreAlarmState" , state );
				localStorage.setItem("superReminderPreAlarmValue" , value );
				
				$("#preAlarmNumber").val(localStorage.getItem("superReminderPreAlarmState"));
				$("#preAlarmWhen"  ).val(localStorage.getItem("superReminderPreAlarmValue"));
				
				var texzt = "";
				
				if(state == "off")
					texzt = "Pre-alarm off";
				else
					texzt = localStorage.getItem("superReminderPreAlarmValue") + " " + localStorage.getItem("superReminderPreAlarmState");
				
				$("#superReminderLeadTimePreview").text(texzt); 
			}
			
			function saveSuperReminderPreAlarmMelody(value)
			{
				localStorage.setItem("superReminderPreAlarmMelodyPreview" , value);
				$("#superReminderPreAlarmMelodyPreview").text(localStorage.getItem("superReminderPreAlarmMelodyPreview"));
				
				$("#superReminderPreAlarmMelody :radio").each(function()
				{
					$(this).attr("checked",false);
				});
				
				$("#superReminderPreAlarm" + value).attr("checked","checked");
			}
			
			function saveSuperReminderMelody( value )
			{
				localStorage.setItem("superReminderMelodyPreview", value);
				$("#superReminderMelodyPreview").text(localStorage.getItem("superReminderMelodyPreview"));
				
				$("#superReminderMelody :radio").each(function()
				{
					$(this).attr("checked",false);
				});
				
				$("#superReminder" + value).attr("checked","checked");
			}
		
			function saveSuperReminderSnooze( value )
			{
				localStorage.setItem("superReminderSnoozePreview", value ); 
				$("#superReminderSnoozePreview").text(localStorage.getItem("superReminderSnoozePreview"));
			}
			
			function saveSuperReminderAlarmState( value )
			{
				localStorage.setItem("superReminderAlarmStateValue" , value );
				$("#superReminderAlertMessageState").val(localStorage.getItem("superReminderAlarmStateValue"));
			}
			
			function saveSuperReminderSoundState( value )
			{ 
				localStorage.setItem("superReminderSoundStateValue" , value );
				$("#superReminderSoundState").val(localStorage.getItem("superReminderSoundStateValue"));
			}
			
			function saveSuperReminderPreAlarmMessageState( value )
			{
				localStorage.setItem("superReminderPreAlarmMessageStateValue" , value );
				$("#superReminderPreAlarmMessageState").val(localStorage.getItem("superReminderPreAlarmMessageStateValue"));
			}
			
			function saveSuperReminderPreAlarmSoundState( value )
			{
				localStorage.setItem("superReminderPreAlarmSoundStateValue" , value );
				$("#superReminderPreAlarmSoundState").val(localStorage.getItem("superReminderPreAlarmSoundStateValue"));
			}
			
			function saveSuperReminderNotes(value)
			{
				localStorage.setItem("superReminderNotesValue" , value ); 
				$("#superReminderNotes").val(localStorage.getItem("superReminderNotesValue"));
			}
		
			 
			$("#setSuperReminderMessage").on("click",function()
			{
				saveSuperReminderMessage($("#superReminderMessage").val()); 
			});
			
			$("#setSuperReminderTime").on("click",function(){
				
				var data = $("superReminderAlarmDate").val();
				var timp = $("superReminderAlarmTime").val(); 
				
				saveSuperReminderTime(moment(data).format('MMMM Do YYYY') , moment(timp).format('h:mm:ss a'));
			});
			
			$("#setSuperReminderMelody").on("click",function()
			{	
				saveSuperReminderMelody($("#superReminderMelody input:radio:checked").val())
			});
			
			$("#setSuperReminderRepeat").on("click",function()
			{
				var superReminderRepeatVal 	= "Never";
				var selectedTab 			= "ui-id-1";
				
				if($('#superReminderRepeatOff').is(':checked'))
				{
					
				}
				else
				{
					var superReminderRepeatVal   = true;
					var repeatFromCompletionDate = $("superReminderRepeatFromCompletionDate").val();
					var repeatType				 = "";
					
					$('div[data-role="tabs"] a').each(function()
					{
						if($(this).hasClass("ui-btn-active")) 
						{
							selectedTab  = $(this).attr("id");
							repeatType   = $(this).text();
						}
					});
					
					if( repeatType == "Simple")
					{
						var repeatSimpleNumberVal = $("#repeatSimpleNumber").val();
						var repeatSimpleTypeVal   = $("#repeatSimpleType"  ).val();
						
						if(repeatSimpleTypeVal == "day")
							superReminderRepeatVal = "daily";
						else if(repeatSimpleTypeVal == "week")
							superReminderRepeatVal = "weekly";
						else if(repeatSimpleTypeVal == "month")
							superReminderRepeatVal = "monthly";
						else if(repeatSimpleTypeVal == "year")
							superReminderRepeatVal = "yearly";
					}
				}
				
				saveSuperReminderRepeat( selectedTab ,  superReminderRepeatVal ) 
			});
			
			$("#setSuperReminderRepeatThru").on("click",function()
			{
				var valoare = "";
				
				if($('#superReminderRepeatOff').is(':checked'))
				{
					valoare = "Forever";
				}
				else
				{
					var day 	= $("#repeatThruDay"	).val();
					var month 	= $("#repeatThruMonth"	).val();
					var year	= $("#repeatThruYear"	).val();
					
					valoare 	= day + " " + month + " " + year;
				}
				
				saveSuperReminderRepeatThru(valoare);
			});
			
			$("#superReminderAlertState").on("change",function()
			{
				saveSuperReminderAlarmState($("#superReminderAlertMessageState").val());
			});
			
			$("#superReminderSoundState").on("change",function() 
			{
				saveSuperReminderSoundState($("#superReminderSoundState").val());
			});
			
			$("#setSuperReminderLeadTime").on("click",function()
			{
				var preAlarmState = $("#preAlarmWhen").val();
				var preAlarmValue = $("#preAlarmNumber").val();
				
				saveSuperReminderLeadTime(preAlarmState,preAlarmValue);
			});
			
			$("#superReminderPreAlarmMessage").on("change",function()
			{
				var valoare = $(this).val();
				saveSuperReminderPreAlarmMessageState(valoare);
			});
				
			$("#superReminderPreAlarmSoundState").on("change",function()
			{
				var valoare = $(this).val();
				saveSuperReminderPreAlarmSoundState(valoare);
			});	
			
			$("#setSuperReminderPreAlarmMelody").on("click",function()
			{	
				saveSuperReminderPreAlarmMelody($("#superReminderPreAlarmMelody input:radio:checked").val())
			});	
			
			$("#setSuperReminderNotes").on("click",function()
			{
				saveSuperReminderNotes(value);
			});
			
			
			//functie care stabileste ce se intampla cand dai click pe detaliile reminder-ului- anuleaza stergerea sau merge la editare reminder
			$("#showRemindersBox").on("click",".reminder-details",function()
			{
				if(localStorage.getItem("deleteReminderOn"))
					$(this).parent().find(".reminder-delete").hide();
				else
					console.log("Du-ma la editare bai programatorule!");
			});
			
			db.transaction(function(transaction) {
				transaction.executeSql('CREATE TABLE IF NOT EXISTS Settings ( ' + 
										'Id INTEGER PRIMARY KEY,' +
										'ReminderTitle ,' + 
										'ReminderSnooze TEXT,' +
										'ReminderSnoozeNag TEXT,' +
										'ReminderRelentlessNag  TEXT,' + 
										'ReminderDuetime TEXT,'+
										'ReminderQuickPickerHour TEXT,' +
										'ReminderQuickPickerMinute TEXT,' +
										'ReminderAutoViewNotesFromAlert TEXT,'+ 
										'ReminderLongPressToViewNotes TEXT,'+ 
										'ReminderCompletedAutoTrim TEXT,'+
										'ReminderMelody TEXT,'+
										'ReminderPreMelody TEXT,'+
										'ReminderTimerPickerInterval TEXT,'+
										'QuickReminderMelody TEXT,'+ 
										'QuickReminderTimerPickerInterval TEXT,'+
										'TimersMelody TEXT,' +
										'TimersDisableAutoLock TEXT,' +
										'AppIconBadge TEXT,' +
										'PauseAllAlarms TEXT,' +
										'RemindersAlertsState TEXT,' +
										'RemindersSoundsState TEXT,' +
										'RemindersNagMeState TEXT,' +
										'TimersAlertsState TEXT,' +
										'TimersSoundsState TEXT,' +
										'TimersNagMeState TEXT' +
										')',[],successCB,errorCB);
			});
			
			
			// Adaugare si preluare setari initiale.
			db.transaction(function(transaction) 
			{
				transaction.executeSql('SELECT * FROM Settings;', [],
					function(transaction, result) 
					{
						if (result != null && result.rows != null) 
						{
							if(result.rows.lenght == 0) 
							{
								db.transaction(function() 
								{
									function initial_populate(tx) 
									{
										 tx.executeSql('INSERT INTO Settings ( Id ) VALUES ( 1 )');
										 tx.executeSql('UPDATE Settings SET ReminderTitle=? WHERE Id = 1'						, [' '], successCB,errorCB);
										 tx.executeSql('UPDATE Settings SET ReminderSnoozeNag=? WHERE Id = 1'					, [' '], successCB,errorCB);
										 tx.executeSql('UPDATE Settings SET ReminderRelentlessNag=? WHERE Id = 1'				, [' '], successCB,errorCB);
										 tx.executeSql('UPDATE Settings SET ReminderDuetime=? WHERE Id = 1'						, [' '], successCB,errorCB);
										 tx.executeSql('UPDATE Settings SET ReminderQuickPickerHour=? WHERE Id = 1'				, [' '], successCB,errorCB);
										 tx.executeSql('UPDATE Settings SET ReminderQuickPickerMinute=? WHERE Id = 1'			, [' '], successCB,errorCB);
										 tx.executeSql('UPDATE Settings SET ReminderAutoViewNotesFromAlert=? WHERE Id = 1'		, [' '], successCB,errorCB);
										 tx.executeSql('UPDATE Settings SET ReminderLongPressToViewNotes=? WHERE Id = 1'		, [' '], successCB,errorCB);
										 tx.executeSql('UPDATE Settings SET ReminderCompletedAutoTrim=? WHERE Id = 1'			, [''], successCB,errorCB);
										 tx.executeSql('UPDATE Settings SET ReminderMelody=? WHERE Id = 1'						, ['factory'], successCB,errorCB);
										 tx.executeSql('UPDATE Settings SET ReminderPreMelody=? WHERE Id = 1'					, ['horn'	], successCB,errorCB);
										 tx.executeSql('UPDATE Settings SET ReminderTimerPickerInterval=? WHERE Id = 1'			, [' '], successCB,errorCB);
										 tx.executeSql('UPDATE Settings SET QuickReminderMelody=? WHERE Id = 1'					, [' '], successCB,errorCB);
										 tx.executeSql('UPDATE Settings SET QuickReminderTimerPickerInterval=? WHERE Id = 1'	, [' '], successCB,errorCB);
										 tx.executeSql('UPDATE Settings SET TimersMelody=? WHERE Id = 1'						, [' '], successCB,errorCB);
										 tx.executeSql('UPDATE Settings SET TimersDisableAutoLock=? WHERE Id = 1'				, [' '], successCB,errorCB);
										 tx.executeSql('UPDATE Settings SET AppIconBadge=? WHERE Id = 1'						, [' '], successCB,errorCB);
										 tx.executeSql('UPDATE Settings SET PauseAllAlarms=? WHERE Id = 1'						, [' '], successCB,errorCB);
										 tx.executeSql('UPDATE Settings SET RemindersAlertsState=? WHERE Id = 1'				, ['on'], successCB,errorCB);
										 tx.executeSql('UPDATE Settings SET RemindersSoundsState=? WHERE Id = 1'				, ['on'], successCB,errorCB);
										 tx.executeSql('UPDATE Settings SET RemindersNagMeState=? WHERE Id = 1'					, [' '], successCB,errorCB);
										 tx.executeSql('UPDATE Settings SET TimersAlertsState=? WHERE Id = 1'					, ['on'], successCB,errorCB);
										 tx.executeSql('UPDATE Settings SET TimersSoundsState=? WHERE Id = 1'					, ['on'], successCB,errorCB);
										 tx.executeSql('UPDATE Settings SET TimersNagMeState=? WHERE Id = 1'					, ['on'], successCB,errorCB);
									};
								});
							}
							
							for (var i = 0; i < result.rows.length; i++) 
							{
								alert("am ajuns aici"); 
								var row = result.rows.item(i);
								saveSuperReminderMessage(row.ReminderMessage); // In loc de field ar trebui pus rows.NUMECOLOANA
								saveSuperReminderTime(moment().format('MMMM Do YYYY') + " " + moment().format('h:mm:ss a')); // In loc de field ar trebui pus rows.NUMECOLOANA
								saveSuperReminderRepeat("ui-id-1","Never");  // In loc de field ar trebui pus rows.NUMECOLOANA
								saveSuperReminderRepeatThru("Forever"); // In loc de field ar trebui pus rows.NUMECOLOANA
								saveSuperReminderLeadTime("off","0"); // In loc de field ar trebui pus rows.NUMECOLOANA
								saveSuperReminderAlarmState("off"); // In loc de field ar trebui pus rows.NUMECOLOANA
								saveSuperReminderPreAlarmMelody(row.ReminderPreMelody); // In loc de field ar trebui pus rows.NUMECOLOANA
								saveSuperReminderMelody(row.ReminderMelody); // In loc de field ar trebui pus rows.NUMECOLOANA
								saveSuperReminderSnooze("Drop-down Panel"); // In loc de field ar trebui pus rows.NUMECOLOANA
								saveSuperReminderSoundState(row.RemindersSoundState); // In loc de field ar trebui pus rows.NUMECOLOANA
								saveSuperReminderPreAlarmMessageState("off"); // In loc de field ar trebui pus rows.NUMECOLOANA
								saveSuperReminderPreAlarmSoundState("off"); // In loc de field ar trebui pus rows.NUMECOLOANA
							} 
						}
					}
				);
			});
////// TIMERE /////////////////
			//db.transaction(function(transaction){transaction.executeSql("DROP TABLE Timers",[],successCB,errorCB)});
			db.transaction(function(transaction) {
				transaction.executeSql('CREATE TABLE IF NOT EXISTS Timers ( ' + 
											'Id INTEGER PRIMARY KEY,' + 
											'Millis INTEGER,' +
											'PausedValue INTEGER,' +
											'EndDate INTEGER,' +
											'StartPauseTime INTEGER,'+
											'Title TEXT,' + 
											'Repeat TEXT,'+
											'CountType TEXT,' + 
											'Sound TEXT,'+
											'Status TEXT,'+ 
											'LastStarted INTEGER )',[],successCB,errorCB); 
			});
			
			$("#setTimer").on("click",function()
			{
				var hours 	= (parseInt($("#timerHours"	).text()) * 3600)*1000;
		    	var minutes	= (parseInt($("#timerMinutes").text()) * 60)*1000;
		    	var seconds = parseInt($("#timerSecundes").text()) * 1000;
		    	
		    	millis 		= hours + minutes + seconds;
		    	
		    	var nowMilli 		= getCurrentTimeUTC();
		    	var endDate 		= nowMilli + millis;
		    	var startPausedTime = 0;
		    	var title   		= $("#titluTimer").val();
		    	
		    	
		    	if(title == "")
		    	{
		    		if( hours 	!= 0 ) title += $("#timerHours"	).text() 	+ " hours ";
		    		if(minutes 	!= 0 ) title += $("#timerMinutes").text() 	+ " minutes ";
		    		if(seconds 	!= 0 ) title += $("#timerSecundes").text() 	+ " seconds ";
		    		title += "timer";
		    	} 
		    	
		    	var repeat 		= $("#timerAlertMessageState").val();
		    	var countType	= "up";
		    	var sound		= $("#timerMelody input:radio:checked").val();
		    	
		    	db.transaction(function(transaction)  
				{ 
					transaction.executeSql('INSERT INTO Timers ("Millis","PausedValue","EndDate","StartPauseTime","Title","Repeat","CountType","Sound","Status","LastStarted")'+ 
										   'VALUES (? , ? ,?, ? , ? , ? , ? , ? , ? , ?)', [millis , millis , endDate, startPausedTime, title,repeat,countType,sound,"on",nowMilli], 
											successInsertTimer,errorCB) 
				});
				
				function successInsertTimer(tx,results)
				{
					window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem)
					{
						window.plugin.notification.local.add({
							id:      results.insertId + 10456,
							title:   title, 
							message: title, 
							repeat:  repeat,   
							date:  new Date(parseInt(Date.parse(moment().format("YYYY/MM/DD") + " " + $("#timerHours"	).text() + ":" + $("#timerMinutes").text() + ":" + $("#timerSecundes").text()))),   
							sound : fileSystem.root.toURL() + 'AnwarSubhiQasem/'+ sound +'.mp3'  
						}); 
					}, null);
				}
			
				populateTimers(); 
				
			});
			 
			
			
			function populateTimers() 
			{
				$('#showTimersBox').html();
				 
				db.transaction(function(transaction) {
				transaction.executeSql('SELECT * FROM Timers;', [],
					function(transaction, result) {
						if (result != null && result.rows != null) 
						{
							$('#showTimersBox').html('');
							for (var i = 0; i < result.rows.length; i++) 
							{
								var row 		 	 = result.rows.item(i);
								var timerDate	 	 = "";
								var onofTimer    	 = "";
								var onofText	 	 = "";
								var clsPauza	 	 = "";
								var xtrStyleForPause = "";
								var acum 		 	 = getCurrentTimeUTC();
								var diferenta 	 	 = Math.abs(acum - row.EndDate);
								
								if(row.Status == "finished")
								{
									timerDate 		 = returnPrettyType(row.Millis," (finished)");
									onofTimer 		 = "off-timer";
									onofText  		 = "off";
									clsPauza  		 = "pause-button";
									xtrStyleForPause = "style='display:none;'";
								}
								if(row.Status == "paused")
								{
									timerDate = returnPrettyType(row.PausedValue," (paused)");
									onofTimer = "on-timer";
									onofText  = "on";
									clsPauza  = "play-button";
								}
								if(row.Status == "on")
								{
									timerDate = returnPrettyType(diferenta,"");
									onofTimer = "on-timer";
									onofText  = "on";
									clsPauza  = "pause-button";
								}
								if(row.Status == "stopped")
								{
									timerDate 		 = returnPrettyType(row.Millis," (stopped)");
									onofTimer 		 = "off-timer";
									onofText  		 = "off";
									clsPauza  		 = "pause-button";
									xtrStyleForPause = "style='display:none;'";
								}
									  
		        				$('#showTimersBox').append('<div class="timer-container" data-duration="' + row.Millis + '" data-pause="' + row.PausedValue + '" data-sound="'+ row.Sound +'" data-end="' + row.EndDate + '" data-status="' + row.Status +'" data-id="' + row.Id + '">' +
																'<div class="'+ onofTimer +'">' +
																	onofText +
																'</div>' +
																'<div class="delete-timer">' +
																	'&nbsp;' + 
																'</div>' +
																'<div class="timer-details">' +
																	'<p class="timer-date">'+ timerDate +'</p>' +
																	'<p class="timer-title">' + row.Title +'</p>' +
																	'<p class="timer-repeat">Last started:' + moment(row.LastStarted).format("dddd, MMMM Do YYYY, h:mm:ss a") + '</p>' +
																'</div>' +
																'<div class="timer-delete">' + 
																	'Delete' +
																'</div>' +
																'<div class="' + clsPauza + '" ' + xtrStyleForPause + ' >' + 
																	'&nbsp;' +
																'</div>' + 
															'</div>');  
								} 
							}
						}
					);
				});
			}
			
			populateTimers();
			
			function refreshAllTimers()
			{
				$("#showTimersBox").children(".timer-container").each(function()
				{
					var endDate 		= $(this).data("end"	 	 );
					var pausedDate 		= $(this).data("pause"  	 );
					var status  		= $(this).attr("data-status" );
					var id				= $(this).data("id"			 );
					var sound			= $(this).data("sound"		 );
					var duration		= $(this).data("duration"    );
					 
					if(status == "on") 
					{	
						var acum = getCurrentTimeUTC();
						var diferenta = Math.abs(acum - endDate);
						// console.log("Data sfarsit:" + moment(endDate).format("YYYY-MM-DD HH:mm:ss"));
					    // console.log("Data acum : " + moment(getCurrentTimeUTC()).format("YYYY-MM-DD HH:mm:ss"));
					    // console.log("Diferenta in milli:" + diferenta);
					    // console.log("Diferenta: " + returnPrettyType(diferenta,""));
						var remainingTime = returnPrettyType(diferenta,"");
						 
						if(diferenta > 1000) 
						{  
							$(this).attr("data-pause" , diferenta);
							$(this).find(".timer-date").text(remainingTime);  
						}
						else
						{ 
							$(this).find(".timer-date").text(returnPrettyType(duration," (finished)"));
							$(this).attr("data-status" , "finished"	);
							$(this).children(".on-timer").removeClass(".on-timer").addClass(".off-timer").html("off");
							finishedTimer(id,sound);
						} 	
					}
					if(status=="paused")
					{
						$(this).find(".timer-date").text(returnPrettyType(pausedDate ," (paused)")); 
					}
					if(status == "stopped") 
					{
						$(this).find(".timer-date").text(returnPrettyType(pausedDate ," (stopped)")); 
					} 
				});
				
				setTimeout(function(){refreshAllTimers();}, 1000);  
			}
			
			refreshAllTimers();
			
			var myMedia;
			var loopeEnabled = true;
		
		    function finishedTimer(id,sound)
		    {	
		    	var status = "finished"; 
		    	var milli  = ""; 
		    	
		    	db.transaction(function(transaction)  
				{  
					transaction.executeSql('SELECT * FROM Timers WHERE Id=?', [id], function(tx,result)
					{
						var row = result.rows.item(0);
						sound 	= row.Sound;
						milli  	= row.Milli; 
					},errorCB) 
				});  
		    	
		    	db.transaction(function(transaction)  
				{  
					 transaction.executeSql('UPDATE Timers SET Status=?,PausedValue=?,StartPauseTime=0 WHERE Id=?', [status,milli,id], successCB,errorCB) 
				});  
				
				var loop = function (status) 
						   {
							    if (status == Media.MEDIA_STOPPED && loopEnabled)
							    {
							        myMedia.play();
							    }
						   };
				
				myMedia 	= new Media("/android_asset/www/alarms/"+ sound +".mp3", null, null, loop);
				myMedia.play(); 
				loopEnabled = true;
								     
				if(confirm("S-a terminat reminder-ul"))
				{ 
					loopEnabled = false;
					myMedia.stop();
					myMedia.release();
				}
				else
				{
					loopEnabled = false;
					myMedia.stop();
					myMedia.release();
				}
		    }
		    
		    function getCurrentTimeUTC()
			{
			    //RETURN:
			    //      = number of milliseconds between current UTC time and midnight of January 1, 1970
			    var tmLoc = new Date();
			    //The offset is in minutes -- convert it to ms
			    return tmLoc.getTime() + tmLoc.getTimezoneOffset() * 60000;
			}
			
			//console.log("Data UTC: " + getCurrentTimeUTC());
			
			//functie pentru depauzare timer
			$("#showTimersBox").on("click",".play-button",function()
			{
				$(this).removeClass("play-button");
				$(this).addClass("pause-button");
				
				parent = $(this).parent();
				var id = parent.attr("data-id");
				
				db.transaction(function(transaction)  
				{  
					transaction.executeSql('SELECT * FROM Timers WHERE Id=?', [id], function(tx,results)
					{
						var row = results.rows.item(0);
						var timpInCareAStatOprit		= getCurrentTimeUTC() - row.StartPauseTime;
						var noulTimpDeTerminare			= row.EndDate + timpInCareAStatOprit;  
						
						parent.data("end"	  		, noulTimpDeTerminare	);  
						 
						transaction.executeSql('UPDATE Timers SET LastStarted=?,Status="on",EndDate=? WHERE Id=?', [getCurrentTimeUTC(),noulTimpDeTerminare,id],successCB,errorCB)
						
					},errorCB)
				});
				
				parent.attr("data-status" , "on"	);  
			});  
			//
		
			// functie pentru pauzare timer
			$("#showTimersBox").on("click",".pause-button",function()
			{
				$(this).removeClass("pause-button");
				$(this).addClass("play-button");
				
				parent = $(this).parent();
				
				var id 		   	    = parent.attr("data-id"		);
				var pausedMillis    = parent.attr("data-pause"	); 
				var endDate    	    = parent.data("end"			);
				var pausedTime 	    = returnPrettyType(pausedMillis," (paused)");
				var status	   	    = "paused";  
				var startPauseTime  = getCurrentTimeUTC();
				
				parent.data("pause"		    , pausedMillis); 
				parent.attr("data-status"	, "paused"    );
				
				db.transaction(function(transaction)    
				{  
					transaction.executeSql('UPDATE Timers SET Status=? , PausedValue=? , StartPauseTime=? WHERE Id=?', [status,pausedMillis,startPauseTime,id], successCB,errorCB) 
				}); 
			}); 
			//
		
			//functie pentru oprire timer
			$("#showTimersBox").on("click",".on-timer",function()
			{
				$(this).removeClass("on-timer");
				$(this).addClass("off-timer");
				$(this).text("off");
				
				parent = $(this).parent();
				parent.find(".play-button"	 ).hide();
				parent.find(".pause-button"  ).hide();
				
				var id = parent.data("id");
				
				parent.attr("data-status"	, "stopped");
				
				db.transaction(function(transaction)  
				{  
					transaction.executeSql('SELECT * FROM Timers WHERE Id=?', [id], function(tx,results)
					{
						var row = results.rows.item(0);
						parent.attr("data-pause", row.Millis); 
				    	var startPausedTime = 0;  
						
						transaction.executeSql('UPDATE Timers SET StartPauseTime=?,Status="stopped" WHERE Id=?', [startPausedTime,id],successCB,errorCB)
						
					},errorCB)
				});
				
			});  
			//
			
			// functie pentru pornire timer
			$("#showTimersBox").on("click",".off-timer",function()
			{
				$(this).removeClass("off-timer");
				$(this).addClass("on-timer");
				$(this).text("on");
				
				parent = $(this).parent();
				parent.children(".play-button"	).css("display","inline-block");
				parent.children(".pause-button"  ).css("display","inline-block");
				
				var id = parent.data("id");
				
				parent.attr("data-status"	, "on");
				
				db.transaction(function(transaction)  
				{  
					transaction.executeSql('SELECT * FROM Timers WHERE Id=?', [id], function(tx,results)
					{ 
						var row 	 = results.rows.item(0);
						var nowMilli = new Date().getTime();
				    	var endDate  = nowMilli + row.Millis;
						
						parent.data("end",endDate);
							
						transaction.executeSql('UPDATE Timers SET LastStarted=?,EndDate=?, Status="on" WHERE Id=?', [nowMilli,endDate,id],successCB,errorCB)
						
					},errorCB)
				});
				
			}); 
			//
			
			
			function updateTimerState(status,id)
			{
				db.transaction(function(transaction)  
				{  
					transaction.executeSql('SELECT * FROM Timers WHERE Id=?', [id], function(transaction,response)
					{
						var timerDetails = response.rows.item(0);
						var pausedTime;
						
						if(status == "stopped")
						{
							pausedTime = timerDetails.Millis;
							stopTimer();
							$(".timer-date").html(returnPrettyType(pausedTime,"(stopped)"));
						}
						
						if(status == "paused")
						{
							 pausedTime = returnMillisFromCurrentTime(); 
							 stopTimer();
							 $(".timer-date").html(returnPrettyType(pausedTime,"(paused)"))
						}
						
						if(status == "on")
						{
							pausedTime = timerDetails.PausedValue;
							startTimer(pausedTime); 
						}
						
						db.transaction(function(transaction)  
						{  
							transaction.executeSql('UPDATE Timers SET Status=? , PausedValue=? WHERE Id=?', [status,pausedTime,id], successCB,errorCB) 
						});  
						
					} ,errorCB) 
				});  
			}
			
			$("#timerEdit").on("click",function()
			{
				if($(this).data("state") == "edit")
					goEditTimer();
				else if($(this).data("state") == "cancel")
					goCancelEditTimer(); 
			}); 
			
			function goEditTimer()  
			{
				$(".on-timer"		).hide();
				$(".off-timer"		).hide();
				$(".play-button"	).hide();
				$(".pause-button"   ).hide();
				$(".delete-timer"	).css("display","inline-block");
				$("#timerEdit"		).text("Done");
				$("#timerEdit"		).attr("onclick","cancelEditTimer()");
				
				$("#timerEdit").data("state","cancel");
				
				localStorage.setItem("deleteTimerOn",true); 
			}
			
			function goCancelEditTimer()
			{
				$(".on-timer"		).css("display","inline-block");
				$(".off-timer"		).css("display","inline-block");
				$(".play-button"	).css("display","inline-block");
				$(".pause-button"   ).css("display","inline-block");
				$(".delete-timer"	).hide();
				$("#timerEdit"		).text("Edit");
				$("#timerEdit"		).attr("onclick","editTimer()");
				$(".timer-delete"	).hide();
			
				$("#timerEdit").data("state","edit"); 
				
				localStorage.setItem("deleteTimerOn",false); 
			}
			
			//functie care arata butonul de delete pentru reminder
			$("#showTimersBox").on("click",".delete-timer",function()
			{
				var id = $(this).parent().data("id"); 
				$(this).parent().find(".timer-delete").show();
			});
			//
			
			//functie care sterge timer-ul
			$("#showTimersBox").on("click",".timer-delete",function()
			{
				var id = $(this).parent().data("id"); 
				
				db.transaction(function(transaction)  
				{  
					transaction.executeSql('DELETE FROM Timers WHERE Id=(?)', [id], successCB,errorCB) 
				});
				
				$(this).parent().remove();
				//console.log("Au mai ramas: " + $(".timer-container").length);
				if($(".timer-container").length == 0)
					goCancelEditTimer(); 
			});
			//
			
			function returnMillisFromCurrentTime()
			{
				var pieces = $(".timer-date").text().split(":");
				
				var hours 	= (parseInt(pieces[0].replace(/^[0]/,''))*3600)*1000;
				var minutes = (parseInt(pieces[1].replace(/^[0]/,''))*60)*1000;
				var seconds = parseInt(pieces[2].replace(/^[0]/,''))*1000;
						
				return hours+minutes+seconds;
			}
			
			function errorCB(tx, err) {
				alert("Error processing SQL: " + err.message); 
			}
			
			// Transaction success callback
			//
			function successCB(suc) {
				console.log("success!");
			}
	
			
			// var interval;
			// var time;
// 	
			// function startTimer(millis) 
			// {
// 				
				// time=millis;
			    // interval = setInterval(function(){
				    // time -= 1000;
				    // displaytimer();
				// }, 1000); 
			// }
// 			
			// function stopTimer() 
			// {
			    // clearTimeout(interval);
			// }
// 			
			 // function onConfirm(button) {
		        // alert('You selected button ' + button);
		    // }
		
		    // Show a custom confirmation dialog
		    //
		    // function showConfirm() {
		    	// alert("ar trebui sa arat");
		        // navigator.notification.confirm(
		            // 'You are the winner!',  // message
		            // onConfirm,              // callback to invoke with index of button pressed
		            // 'Game Over',            // title
		            // 'Restart,Exit'          // buttonLabels
		        // );
		    // }
		    
		    
		    
		    function replaceTimerTime(result)
		    {
		    	console.log(result);
		    }
		    
		    function returnPrettyType(time,extra)
		    {
		    	var milliseconds = parseInt((time%1000)/100)
			        , seconds = parseInt((time/1000)%60)
			        , minutes = parseInt((time/(1000*60))%60)
			        , hours = parseInt((time/(1000*60*60))%24);
			
			    hours = (hours < 10) ? "0" + hours : hours;
			    minutes = (minutes < 10) ? "0" + minutes : minutes; 
			    seconds = (seconds < 10) ? "0" + seconds : seconds;
			    
			    return hours + ":" + minutes + ":" + seconds + " " + extra;
		    }
			
			// Date Picker
			function getWeekdays() {
				var weekday = new Array(7);
					weekday[0]=  "Sun";
					weekday[1] = "Mon";
					weekday[2] = "Tue";
					weekday[3] = "Wed";
					weekday[4] = "Thu";
					weekday[5] = "Fri";
					weekday[6] = "Sat";
				return weekday;
			}
			
			function getMonths() {
				var months = new Array(12);
					months[1] = 'Jan';
					months[2] = 'Feb';
					months[3] = 'Mar';
					months[4] = 'Apr';
					months[5] = 'May';
					months[6] = 'Jun';
					months[7] = 'Jul';
					months[8] = 'Aug';
					months[9] = 'Sep';
					months[10] = 'Oct';
					months[11] = 'Nov';
					months[12] = 'Dec';
				return months;	
			}
			
			function formatTime(unix) {
					console.log(unix);
				var current_date = new Date( parseFloat(unix) );
				alert(current_date);
					console.log ( current_date );
				var weekdays = getWeekdays(); 
				var months = getMonths();
				
				var current_week_day =  weekdays[current_date.getDay()];
				var current_day = current_date.getDate();
				var current_month = months[current_date.getMonth()];
				var current_year = current_date.getFullYear();
				var current_hour = current_date.getHours();
				var current_minute = current_date.getMinutes();
				var result = current_week_day + ' ' + 
							 current_day + ' ' + 
							 current_month + ' ' + 
							 current_year;
				return result;
			}
			
			function openBirthDate() {
				var now = new Date();
				var days = { };
				var years = { };
				var months = getMonths();
				
				for( var i = 1; i < 32; i += 1 ) 
				{
					days[i] = i;
				}
			
				for( i = now.getFullYear()-50; i < now.getFullYear()+50; i += 1 ) {
					years[i] = i;
				}
			
				SpinningWheel.addSlot(years	, 'right'	, 2104);
				SpinningWheel.addSlot(months, ''		, 10);
				SpinningWheel.addSlot(days	, 'right'	, 12);
				
				SpinningWheel.setCancelAction(cancel);
				SpinningWheel.setDoneAction(done);
				
				SpinningWheel.open();
			}
			
			function getDays(i) {
				var today = new Date();
					today.setDate( today.getDate() + i );
				var dd = today.getDate();
				var mm = today.getMonth()+1; //January is 0!
				
				var months = getMonths();
				mm = months[mm];
				
				var weekday = getWeekdays();
				
				var ww = weekday[today.getDay()];
				var yyyy = today.getFullYear();
				
				if(dd<10){
					dd='0'+dd
				}
				
				var result = new Array(2);
					result['value'] = ww + ' ' + dd + ' ' + mm ;
					result['key'] = today.getTime();
				return result;
			}
			
			
			
			function formatTimeToSave(unix)
			{
				var current_date = moment();
				
				var month = current_date.getUTCMonth() + 1; //months from 1-12
				var day = current_date.getUTCDate();
				var year = current_date.getUTCFullYear();
		
				var result = year + "-" + ("0" + month).slice(-2) + "-"+("0" + day).slice(-2);
				
				return result; 
			}
			
			window.addEventListener('load', function(){ setTimeout(function(){ window.scrollTo(0,0); }, 100); }, true);
			
			
			// Adaugare timer la super reminder 
			
			jQuery('#superReminderAlarmDateTime').click(function(event) {
				event.preventDefault();
				
				if(localStorage.getItem("openTime") == "da")
					openTime();
			});
			
			jQuery('#superReminderTimeContainer').on('pageshow', function() 
			{
				// add current date to input.
				var current_date = new Date();
				var weekdays = getWeekdays(); 
				var months = getMonths();
				
				var current_week_day =  weekdays[current_date.getDay()];
				var current_day = current_date.getDate();
				var current_month = months[current_date.getMonth()];
				var current_year = current_date.getFullYear();
				var current_hour = current_date.getHours();
				var current_minute = current_date.getMinutes();
				var result = current_week_day + ' ' + 
							 current_day + ' ' + 
							 current_month + ' ' + 
							 current_year + ' ' +
							 current_hour + ':' + 
							 current_minute;
				
				$('#superReminderAlarmDateTime').val(result);
				
				// open weelpicker
				if(localStorage.getItem("openTime") == "da")
					openTime();
				
			});
			
			jQuery('#superReminderTimeContainer').on('pagehide', function() 
			{
				localStorage.setItem("openTime","da");
				SpinningWheel.close();
			});
			
			// Adaugare timer la Simple reminder
			localStorage.setItem("openTime"			, "da");
			localStorage.setItem("openSimpleTab"	, "da");
			localStorage.setItem("openMonthTab" 	, "da");
			localStorage.setItem("openDayTab"		, "da");
			localStorage.setItem("repeatThruTab" 	, "da");
			localStorage.setItem("openSnoozeFor" 	, "da");
			localStorage.setItem("openPreAlarm"  	, "da");
			localStorage.setItem("openTimerWheel" 	, "da");
			
			jQuery('#timpQuickReminder').click(function(event) 
			{
				event.preventDefault();
				if(localStorage.getItem("openTime") == "da")
					openTime();
			});
			
			jQuery('#two').on('pageshow', function() 
			{
				// add current date to input.
				var current_date = new Date();
				var weekdays = getWeekdays(); 
				var months = getMonths();
				
				var current_week_day =  weekdays[current_date.getDay()];
				var current_day = current_date.getDate();
				var current_month = months[current_date.getMonth()];
				var current_year = current_date.getFullYear();
				var current_hour = current_date.getHours();
				var current_minute = current_date.getMinutes();
				var result = current_week_day + ' ' + 
							 current_day + ' ' + 
							 current_month + ' ' + 
							 current_year + ' ' +
							 current_hour + ':' + 
							 current_minute;
							 
				$('#timpQuickReminder').val(result);
				
				// open weelpicker
				if(localStorage.getItem("openTime") == "da")
					openTime();
				
			});
			
			jQuery('#two').on('pagehide', function() 
			{
				localStorage.setItem("openTime","da");
				SpinningWheel.close();
			});
			
			function openTime() 
			{
				var now = new Date();
				var minutes = { };
				var hour = { };
				var days = { };
				
				// Current Hour and Minutes
				var current_hour = new Date().getHours();
				var current_minutes = new Date().getMinutes();
				
				for(i=0; i<400; i++) 
				{
					var result = getDays(i); 
					days[result['key']] = result['value'];
				}
				
				for(i=0; i<24; i++) 
				{
					if(current_hour == i) 
					{
						var current_hour_id = i;	
					}
					hour[i] = i;	
				}
				
				for(i=0; i<60; i++) {
					if(current_minutes == i) {
						var current_minutes_id = i;	
					}
					minutes[i] = i;	
				}
				
				SpinningWheel.addSlot(days, 'right', 0);
				SpinningWheel.addSlot(hour, '', current_hour_id);
				SpinningWheel.addSlot(minutes, 'right', current_minutes_id);
				
				SpinningWheel.setCancelAction(cancel);
				SpinningWheel.setDoneAction(done);
				
				SpinningWheel.open();
				
				localStorage.setItem("openTime","nu");
				
			}
		
			function done() 
			{
				var results 		= SpinningWheel.getSelectedValues();
				var unix_time 		= results.keys[0];
				
				var selectedTime 	= formatTime(unix_time);
				var selectedHour 	= results.keys[1];
				var selectedMinute 	= results.keys[2];
				 
				if(selectedHour.length == 1	 ) selectedHour 	= "0" + selectedHour;
				if(selectedMinute.length == 1) selectedMinute 	= "0" + selectedMinute;
				
				selectedTime = selectedTime + ' ' + selectedHour + ':' + selectedMinute;
				localStorage.setItem("quickReminderUnixTime", Date.parse(moment().format("YYYY/MM/DD") + " " + selectedHour + ":" + selectedMinute + ":00"));	
				
				$('#superReminderAlarmDateTime').val(selectedTime);
				$('#timpQuickReminder').val(selectedTime);
				
				localStorage.setItem("openTime","da");
			}
			
			function cancel() 
			{
				localStorage.setItem("openSnoozeFor" 	, "da");
				localStorage.setItem("repeatThruTab" 	, "da");
				localStorage.setItem("openSimpleTab" 	, "da");
				localStorage.setItem("openTime"		 	, "da");
				localStorage.setItem("openPreAlarm"  	, "da");
				localStorage.setItem("openTimerWheel" 	, "da");
				SpinningWheel.close();
			}
			
			// Adaugare weelpicker la adaugare timer
			function openTimerSelect() {
			
				var hours = { };
				var minutes = { };
				var seconds = { };
				
				for(i=0; i<100; i++) {
					hours[i] = i;
				}
				
				for(i=0; i<60; i++) {
					minutes[i] = i;
					seconds[i] = i;
				}
				
				SpinningWheel.addSlot(hours, 'right', 0);
				SpinningWheel.addSlot(minutes, '', 0);
				SpinningWheel.addSlot(seconds, 'right', 0);
				
				SpinningWheel.setCancelAction(cancel);
				SpinningWheel.setDoneAction(WeelTimerDone);
				
				SpinningWheel.open();
				
				localStorage.setItem("openTimerWheel" , "nu");
			}
		
			function WeelTimerDone() 
			{
				var results = SpinningWheel.getSelectedValues();
				$("#timerHours").text(results.keys[0]);
				$("#timerMinutes").text(results.keys[1]); 
				$("#timerSecundes").text(results.keys[2]);
				
				localStorage.setItem("openTimerWheel" , "da");
			}
			
			jQuery('#timerAlertDateTime').click(function(event) 
			{
				if(localStorage.getItem("openTimerWheel") == "da")
				openTimerSelect();
			});
			
			jQuery('#timerAlertDateTime').on('pagehide', function() 
			{
				localStorage.setItem("openTimerWheel" , "da");
				SpinningWheel.close();
			});
			
			// Adaugare weelpicker la adaugare lead
			function openpreAlarmNumber() 
			{
				var number = { };
				var type = Array(5);
				type['Minutes'	] = 'Minutes';
				type['Hours'	] = 'Hours';
				type['Days'		] = 'Days';
				type['Weeks'	] = 'Weeks';
					
				for(i=0; i<100; i++) 
				{
					number[i] = i; 
				}
							
				SpinningWheel.addSlot(number, 'right', 0);
				SpinningWheel.addSlot(type, '', 0);
				
				SpinningWheel.setCancelAction(cancel);
				SpinningWheel.setDoneAction(actionPreAlarmNumberDone);
				
				SpinningWheel.open();
				
				localStorage.setItem("openPreAlarm" , "nu");
			}
		
			function actionPreAlarmNumberDone() 
			{	
				var results = SpinningWheel.getSelectedValues();
				localStorage.setItem("preAlarmTime",moment(parseInt(localStorage.getItem("quickReminderUnixTime"))).subtract(results.keys[0],results.keys[1].toLowerCase()).unix());
				
				var time = '<span id="preAlarmNumberTime">'+results.keys[0]+'</span> <span id="preAlarmNumberType">'+results.keys[1]+'</span> in Advance';
				$('#preAlarmNumber').html(time);
				
				localStorage.setItem("openPreAlarm" , "da");
			}
			
			jQuery('#preAlarmNumber').click(function(event) 
			{
				if(localStorage.getItem("openPreAlarm")== "da")
					openpreAlarmNumber();
			});
			
			jQuery('#six').on('pagehide', function() 
			{
				localStorage.setItem("openPreAlarm" , "da");
				SpinningWheel.close();
			});
			
			// Adaugare weelpicker la adaugare snoozFor
			function snoozeForTime() 
			{
				var hours = { };
				var minutes = { };
				
				for(i=0; i<24; i++) 
				{
					hours[i] = i;
				}
				
				for(i=0; i<60; i++) 
				{
					minutes[i] = i;
				}
				
				SpinningWheel.addSlot(hours, 'right', 0);
				SpinningWheel.addSlot(minutes, '', 0);
				
				SpinningWheel.setCancelAction(cancel);
				SpinningWheel.setDoneAction(preAlarmNumberDone);
				
				SpinningWheel.open();
				localStorage.setItem("openSnoozeFor" , "nu");
			}
		
			function preAlarmNumberDone() 
			{
				var results = SpinningWheel.getSelectedValues();
				var time = '<span id="snoozeForHours">'+results.keys[0]+'</span> hours and <span id="snoozeForMinutes">'+results.keys[1]+'</span> minutes';
				$('#snoozeForTime').html(time);
				
				localStorage.setItem("openSnoozeFor" , "da");
			}
			
			jQuery('#snoozeForTime').click(function(event) 
			{
				if(localStorage.getItem("openSnoozeFor") == "da")
					snoozeForTime();
			});
			
			jQuery('#superReminderSnoozeForContainer').on('pagehide', function() 
			{
				localStorage.setItem("openSnoozeFor" , "da");
				SpinningWheel.close();
			});
			
			// Adaugare weelpicker la adaugare tabul simplu
			function simpleTab() 
			{
				var number 	= { };
				var type 	= { };
				type['Days'		] = 'Days';
				type['Weeks'	] = 'Weeks';
				type['Months'	] = 'Months';
				type['Years'	] = 'Years';
				
				for(i=0; i<100; i++)
				{
					number[i] = i;
				}
				
				SpinningWheel.addSlot(number, 'right', 0);
				SpinningWheel.addSlot(type, '', 0);
				
				SpinningWheel.setCancelAction(cancel);
				SpinningWheel.setDoneAction(simpleTabDone);
				
				SpinningWheel.open();
				localStorage.setItem("openSimpleTab", "nu");
			}
		
			function simpleTabDone() 
			{
				var results = SpinningWheel.getSelectedValues();
				var time = 'Every <span id="repeatSimpleNumber">'+results.keys[0]+'</span> <span id="repeatSimpleType">'+results.keys[1]+'</span>';
				$('#simpleTab').html(time);
				localStorage.setItem("openSimpleTab", "da");
			}
			
			jQuery('#simpleTab').click(function(event) 
			{
				if(localStorage.getItem("openSimpleTab") == "da")
					simpleTab();
			});
			
			jQuery('#simpleTab').on('pagehide', function() 
			{
				localStorage.setItem("openSimpleTab", "da");	
				SpinningWheel.close();
			});
			
			// Adaugare weelpicker la adaugare tabul month
			function monthTab() {
				
				var number = Array(5);
					number['1st'	] = '1st';
					number['2nd'	] = '2nd';
					number['3rd'	] = '3rd';
					number['4th'	] = '4th';
					number['Last'	] = 'Last';

				var type = Array(10);
					type['Monday'		] = 'Monday';
					type['Tuestday'		] = 'Tuestday';
					type['Wednesday'	] = 'Wednesday';
					type['Thursday'		] = 'Thursday';
					type['Friday'		] = 'Friday';
					type['Saturday'		] = 'Saturday';
					type['Sunday'		] = 'Sunday';
					type['Day'			] = 'Day';
					type['Weekday'		] = 'Weekday';
					type['Weekend Day'	] = 'Weekend Day';

				SpinningWheel.addSlot(number, 'right', 0);
				SpinningWheel.addSlot(type, '', 0);
				
				SpinningWheel.setCancelAction(cancel);
				SpinningWheel.setDoneAction(monthTabDone);
				
				SpinningWheel.open();
				localStorage.setItem("openMonthTab" , "nu");
			}
		
			function monthTabDone() 
			{
				var results = SpinningWheel.getSelectedValues();
				var time = 'Every <span id="repeatMonthNumber">' + results.keys[0] + '</span> <span id="repeatMonthType">' + results.keys[1] + '</span>';
				$('#monthTab').html(time);
				localStorage.setItem("openMonthTab" , "da");
			}
			
			jQuery('#monthTab').click(function(event) 
			{
				if(localStorage.getItem("openMonthTab") == "da")
					monthTab();
			});
			
			jQuery('#monthTab').on('pagehide', function() 
			{
				localStorage.setItem("openMonthTab" , "da");
				SpinningWheel.close();
			});
			
			// Adaugare weelpicker la adaugare tabul day
			function dayTab() 
			{
				var number = { };
				
				for(var i = 0; i<60; i++) 
				{
					number[i] = i;	
				}

				SpinningWheel.addSlot(number, '', 0);
		
				SpinningWheel.setCancelAction(cancel);
				SpinningWheel.setDoneAction(dayTabDone);
				
				SpinningWheel.open();
				localStorage.setItem("openDayTab"	, "nu");
			}
		
			function dayTabDone() 
			{
				var results = SpinningWheel.getSelectedValues();
				var time = 'Every <span id="repeatMonthNumber">' + results.keys[0] + '</span> <span id="repeatMonthType">' + results.keys[1] + '</span>';
				$('#dayTab').html(time);
				
				localStorage.setItem("openDayTab"	, "da");
			}
			
			jQuery('#dayTab').click(function(event) 
			{
				if(localStorage.getItem("openDayTab") == "da")
					dayTab();
			});
			
			jQuery('#dayTab').on('pagehide', function() 
			{
				localStorage.setItem("openDayTab"	, "da");
				SpinningWheel.close();
			});
			
			jQuery('#superReminderRepeatContainer').on('pagehide', function() {
				SpinningWheel.close();
			});
			
			$("#tabs li").click( function() 
			{
				localStorage.setItem("openMonthTab" , "da");
				localStorage.setItem("openSimpleTab", "da");
				localStorage.setItem("openDayTab"	, "da");
				
				SpinningWheel.close();
			});
			
			// Adaugare weelpicker la adaugare tabul day
			function repeatThruDate() 
			{
				var day 	= { };
				var months 	= { };
				var year 	= { };
				
				for(var i = 1; i<32; i++) 
				{
					day[i] = i;	
				}
				
				months[1] = 'January';
				months[2] = 'February';
				months[3] = 'March';
				months[4] = 'April';
				months[5] = 'May';
				months[6] = 'June';
				months[7] = 'July';
				months[8] = 'August';
				months[9] = 'September';
				months[10] = 'Octomber';
				months[11] = 'November';
				months[12] = 'December';
				
				for(var i = 2014; i<100; i++) 
				{ 
					year[i] = i;	
				}
				
				SpinningWheel.addSlot(day	 , 'right'	, 0);
				SpinningWheel.addSlot(months , ''		, 0);
				SpinningWheel.addSlot(year	 , 'right'	, 0);
				
				SpinningWheel.setCancelAction(cancel);
				SpinningWheel.setDoneAction(repeatThruDateDone);
				
				SpinningWheel.open();
				localStorage.setItem("repeatThruTab" , "nu");
				
			}
		
			function repeatThruDateDone() 
			{
				var results = SpinningWheel.getSelectedValues();
				var time = '<span id="repeatThruDateDay">' + results.keys[0] + '</span>' +
						   '<span id="repeatThruDateMonth">' + results.keys[1] + '</span>' + 
						   '<span id="repeatThruDateYear">' + results.keys[2] + '</span>';
				$('#repeatThruDate').html(time);
				
				localStorage.setItem("repeatThruTab" , "da");
			}
			
			jQuery('#repeatThruDate').click(function(event) 
			{
				if(localStorage.getItem("repeatThruTab") =="da")
					repeatThruDate();
			});
			
			jQuery('#superReminderRepeatThruContainer').on('pagehide', function() 
			{
				localStorage.setItem("repeatThruTab" , "da");
				SpinningWheel.close();
			});
			
		}); 		
     }
};

function onDocLoad() 
{
	if(( /(ipad|iphone|ipod|android|windows phone)/i.test(navigator.userAgent) )) 
	{
		document.addEventListener('deviceready', initApp, false);
	} 
	else 
	{
		initApp();
	}
}
function initApp() 
{
	initAd();
	// display the banner at startup
	window.plugins.AdMob.createBannerView();
}
function initAd()
{
	if ( window.plugins && window.plugins.AdMob ) 
	{
		var ad_units = {
		// ios : {
		// banner: 'ca-app-pub-6869992474017983/4806197152',
		// interstitial: 'ca-app-pub-6869992474017983/7563979554'
		// },
		android : {
		banner: 'ca-app-pub-1448934350925482/9654808454',
		//interstitial: 'ca-app-pub-6869992474017983/1657046752'
		}//,
		// wp8 : {
		// banner: 'ca-app-pub-6869992474017983/8878394753',
		// interstitial: 'ca-app-pub-6869992474017983/1355127956'
		// }
		};
		var admobid = "";
		if( /(android)/i.test(navigator.userAgent) ) 
		{
			admobid = ad_units.android;
		}
		else if(/(iphone|ipad)/i.test(navigator.userAgent)) 
		{
			admobid = ad_units.ios;
		}
		else
		{
			admobid = ad_units.wp8;
		}
		
		window.plugins.AdMob.setOptions( {
			publisherId: admobid.banner,
			interstitialAdId: admobid.interstitial,
			bannerAtTop: true, // set to true, to put banner at top
			overlap: false, // set to true, to allow banner overlap webview
			offsetTopBar: false, // set to true to avoid ios7 status bar overlap
			isTesting: false, // receiving test ad
			autoShow: true // auto show interstitial ad when loaded
		});
		registerAdEvents();
	}
	else 
	{
		alert( 'admob plugin not ready' );
	}
}
// optional, in case respond to events
function registerAdEvents() 
{
	document.addEventListener('onReceiveAd', function(){});
	document.addEventListener('onFailedToReceiveAd', function(data){});
	document.addEventListener('onPresentAd', function(){});
	document.addEventListener('onDismissAd', function(){ });
	document.addEventListener('onLeaveToAd', function(){ });
	document.addEventListener('onReceiveInterstitialAd', function(){ });
	document.addEventListener('onPresentInterstitialAd', function(){ });
	document.addEventListener('onDismissInterstitialAd', function(){ }); 
}
function onResize() 
{
	var msg = 'web view: ' + window.innerWidth + ' x ' + window.innerHeight;
	document.getElementById('sizeinfo').innerHTML = msg;
}