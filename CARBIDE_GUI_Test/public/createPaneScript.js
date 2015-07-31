

$(function() {
	initializeSortable();
	function initializeSortable() {
		var tabs = $( "%tabBar%" ).tabs({
			activate: function (event, ui) {
			    
			    var tabId = ui.newPanel.attr('id');
			    //mark this new tab as active tab, tell the server
			    $(".menuList").children("li").removeClass("activeTab"); //remove all active tabs and set a new one
				
				$('li[aria-controls="' + tabId + '"]').addClass("activeTab");


				var activeTabId = tabId; //add this tab to the activeTabs array and remove prior instances
				var thisTabLocation = $.inArray(activeTabId, activeTabs);
				if (thisTabLocation > -1) {
					activeTabs.splice(thisTabLocation, 1);
				}
				
			
				
				//inform the server that we've focused this tab in case someone is tracking our movements
				activeTabs.push(activeTabId);
				console.log(activeTabs);
				var statusJSON = {
						"commandSet": "client",
						"command": "tabFocus",
						"tabFocus" : {
							"tabId" :  activeTabId,
							"paneId" : ui.newPanel.closest('.windowPane').attr('id'),
							
						},
										
					};
				wsSendMsg(JSON.stringify(statusJSON));
				if ($('li[aria-controls="' + tabId + '"]').attr('type') == 'terminal') { //there is a terminal on this line. we must make sure it is built fully
					var intervalCounter = 0;
					var interval_id = setInterval(function(){ //wait for terminal creation then check the sizes
						 intervalCounter = intervalCounter + 1;
						 if (intervalCounter > 400) {
						 	clearInterval(interval_id);
						 }
						 else {
						     if (ui.newPanel.find('.terminal').length > 0){
						     	console.log("rock N ROLE");
						     	console.log(ui.newPanel);
						     	console.log(ui.newPanel.find('.terminal'));
						     	console.log(ui.newPanel.find('.terminal').length)
						         // "exit" the interval loop with clearInterval command
						         clearInterval(interval_id);
						         checkTerminalSizes(ui.newPanel.closest('.windowPane').attr('id')); //we must fix the terminal size when a new tab comes into focus
						      }
						 }
					}, 20);
					
				}
				// ui.newPanel.find('.filegreyblock').height(ui.newPanel.find('.ace_editor').height());
				// ui.newPanel.find('.filegreyblock').width(ui.newPanel.find('.ace_editor').width());
			    
			 }
		});
        
        tabs.find( ".ui-tabs-nav" ).sortable({
            connectWith: '.ui-tabs-nav',
            cancel: ".addNewTab",
            helper: function(event, ui){
            	var retVal = '<div class="sortHelper">' + $(ui).find("a").html() + '</div>';

            	return(retVal);
            },
            appendTo: "body",
            receive: function (event, ui) {

		
			moveTab($(this).parent(),$(ui.sender[0]).parent(),$(ui.item[0]));
			/*
                var receiver = $(this).parent(),
                    sender = $(ui.sender[0]).parent(),
                    tab = ui.item[0],
                    tab$ = $(ui.item[0]),
                // Find the id of the associated panel
                     panelId = tab$.attr( "aria-controls" );
               	var newIndex = ui.item.index();
                
                
                console.log("A List of things used in Move Tab:");
                console.log("tab:");
                console.log(tab);
                console.log("tab$:");
                console.log(tab$);
                console.log("newIndex:");
                console.log(newIndex);
 				console.log("This:")
 				console.log($(this));
                
                
                tab$ = $(tab$.removeAttr($.makeArray(tab.attributes).
                              map(function(item){ return item.name;}).
                              join(' ')).remove());
                tab$.find('a').removeAttr('id tabindex role class');

                $(this).append(tab$);

                $($( "#" + panelId ).remove()).appendTo(receiver);
                //var newIndex = $(this).data("ui-sortable").currentItem.index();
               	tabs.tabs("refresh");
                tabs.tabs({ active:newIndex});
                */
                
                
            }
        });

	}
	var tabs = $( "%tabBar%" ).tabs();

/*	$("a").draggable({

		//connectToSortable: ".tabBar",
		drag: function() {
            console.log("<p>dragging...</p>");
        },
        stop: function() {
            console.log("<p>stopping drag...</p>");
            //$("#sortable").sortable("enable");
        }
	});*/
	
	tabs.on("click", "span.ui-icon-close", function() {
			
			closeTab($(this));
		/*	var numberOfTabs = $(this).closest(".menuList").find("li").length;
			var controllerPane = $(this).closest(".windowPane").attr("id");
			var panelId = $(this).closest("li").remove().attr("aria-controls");
			var $paneId = $("#" + panelId);
			$paneId.remove();
			console.log("This:");
			console.log($(this));
			console.log("This.parent(li):");
			console.log($(this).parents('li'));
			if ($(this).parents('li').attr('type') == 'chat') {
				var chatName = $(this).parents('li').attr('filename');
				var statusJSON = {
					"commandSet": "chat",
					"chatCommand": "leaveChannel",
					"chatTarget": chatName,
					"leaveChannel": {
						"status" : true,
					},
				};
				console.log(statusJSON);
				wsSendMsg(JSON.stringify(statusJSON));
			}
			
			console.log("NUMTABS = " + numberOfTabs);
			if (numberOfTabs == 1) { //if this was the last tab, recreate the addNewTabButton
				appendAddTabButton(controllerPane);
			}
			tabs.tabs("refresh");
			*/
	});
	tabs.bind("keyup", function(event) {
		if (event.altKey && event.keyCode === $.ui.keyCode.BACKSPACE) {
			var panelId = tabs.find(".ui-tabs-active").remove().attr("aria-controls");
			$("#" + panelId).remove();
			tabs.tabs("refresh");
		}
		


		
		
	});	

	
});



/*$(function() {
	$("%pane%").click(function() {
		$(".windowPane").addClass("lowZ");
		$(".windowPane").removeClass("highZ");
		$("%pane%").removeClass("lowZ");
		$("%pane%").addClass("highZ");
	});
});*/

/*$(function() {
	$("#editorContextWindow01").menu({
		select: function(event, ui) {
			$("#editorContextWindow01").hide();
			alert("Menu element clicked!");
		}
	});

	$("%pane%").on("contextmenu", function(event) {
		$("#editorContextWindow01").show();
		$("#editorContextWindow01").position({
			collision: "none",
			my: "left top",
			of: event
		});
		console.log(event);

		return false;
	});

	$(document).click(function(event) {
		$("#editorContextWindow01").hide();
	});

	$("#editorContextWindow01").on("contextmenu", function(event) {
		return false;
	});
	$("#editorContextWindow01").hide();
	$(".windowPane").addClass("lowZ");
	$(".windowPane").removeClass("highZ");
	$("%pane%").removeClass("lowZ");
	$("%pane%").addClass("highZ");

});
*/
var handleTarget = '';
var windowLastWidth = '';
$(function() {
	var containerHeight = 0;
	var containerWidth = 0;
	var newHeight = 0;
	$("%pane%").resizable({
		create: function (event, ui) { //stop the container from resizing when a pane is resized (why would it even do that?!)
            $(this).parent().on('resize', function (e) {
                e.stopPropagation();
            });
        },
		containment: "parent",
		cancel: ".maximizedPane",
		handles: "all",
		resize: function( event, ui ) {
			
			
			
			if (handleTarget.hasClass('ui-resizable-w')) { //correct problems when the pane is resized towards the left of the screen
					if ($(ui.element).position().left <= 100) {
						if (ui.size.width < (windowLastWidth - 100)) { //when there is a huge a sudden jump it means the pane tried to resize
							$(ui.element).width(windowLastWidth);
							$(this).resizable('widget').trigger('mouseup');
							console.log("error found");
							return(-1);
						}
					}

			}
			windowLastWidth = ui.size.width;
			
			containerHeight = ui.size.height;
			containerWidth = ui.size.width;
			// This should resize Ace Editor, we need to trigger it to resize when the pre size changes
		    $(this).find('.preAceEdit').each(function() {
        		var editor = getAceEditorByName($(this).attr('srcpath'));
        		console.log("getAceEditorByName returned for " + $(this).attr('srcpath'));
        		console.log(editor);
        		editor[0].resize(true);
    		});
			if( $(ui.element).find(".cContainer").length) {
	
				

				newHeight = $(ui.element).find(".cContainer").height() - $(ui.element).find(".cInputBoxContainer").height();
			//	$(ui.element).find(".cOutputs").css("height", newHeight);

			}
			//else { console.log("there is no chat window."); }
			
			checkTerminalSizes($(this).attr("id"));
		
			
		},
		start: function(event, ui) {
			windowLastWidth = ui.size.width;
			handleTarget = $(event.originalEvent.target); //save a copy of the handle that is being used so that we know what direction they're moving in
			lastPaneFormat = "";
			//ui.element.addClass("activeWindow");
			$(".windowPane").each(function() {
				var cssObj = {
					top: $(this).position().top,
					left: $(this).position().left
				};
				$(this).css(cssObj);
			});
			$(".windowPane").each(function() {
				$(this).css("position", "absolute");
				ui.element.removeClass("activePane");

			});
			focusPane(ui.element.attr("id"));

		},
		stop: function(event, ui) {
			windowLastWidth = 0;
			$(this).attr("oldx", $(this).position().left); //these attributes are used if a pane is restored
			$(this).attr("oldy", $(this).position().top);
			$(this).attr("oldheight", $(this).height());
			$(this).attr("oldwidth", $(this).width());

		}

	});
	$("%pane%").draggable({
		containment: "parent",
		handle: ".paneHeader",
		cancel: ".maximizedPane",
		start: function(event, ui) {
			if (clickedElement == "paneButton") { //don't let them drag a pane button
				return(false);
			}
			else { console.log("allowing drag bc of " + clickedElement); }
			
			$(".windowPane").removeClass("activePane");
			$(".windowPane").each(function() {
				var cssObj = {
					top: $(this).position().top,
					left: $(this).position().left
				};
				$(this).css(cssObj);
			});
			$(".windowPane").each(function() {
				$(this).css("position", "absolute");

			});
			//$( this ).addClass("activeWindow");

			focusPane($(this).attr("id"));
		},
		stop: function(event, ui) {
			$(this).attr("oldx", $(this).position().left); //these attributes are used if a pane is restored
			$(this).attr("oldy", $(this).position().top);
			$(this).attr("oldheight", $(this).height());
			$(this).attr("oldwidth", $(this).width());
		}

	});
	

        

});


var newPaneTab = '<div class="windowPaneTab noSelect" pane="%paneX%" panetitle="%paneTitle%"><span class="windowPaneTabText">%paneTitle%</span><div class="windowPaneTabIcons"><span class="windowPaneTabIcon windowPaneTabFocus ui-icon ui-icon-extlink" style="visibility:hidden"></span><span class="windowPaneTabIcon windowPaneTabClose ui-icon ui-icon-close"></span></div></div>';
$("#toolBarTop").append(newPaneTab);

   