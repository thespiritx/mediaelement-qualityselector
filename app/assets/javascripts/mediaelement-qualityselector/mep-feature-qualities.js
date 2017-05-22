(function($) {

	// add extra default options 
	$.extend(mejs.MepDefaults, {
		// this will automatically turn on a <track>
		startQuality: 'low',

		qualitiesText: 'Stream Quality'
	});

	$.extend(MediaElementPlayer.prototype, {
	
		buildqualities: function(player, controls, layers, media) {

			// If list exists, nuke it
			if ($(".mejs__qualities-selector").length > 0) {
				$(".mejs__qualities-selector ul li").remove();
			} else {
				player.qualitiesButton = 
					$('<div class="mejs__button mejs__qualities-button">'+
					  	'<button type="button" aria-controls="' + player.id + '" title="' + player.options.qualitiesText + '" aria-label="' + player.options.qualitiesText + '"></button>'+
						  '<div class="mejs-qualities-selector hide-qualities-selector">'+
		  					'<ul></ul>'+
			  			'</div>'+
				  	'</div>').appendTo(controls);
				player.selectedQuality = player.options.startQuality;
			}

			player.sources = $(player.domNode).find("source");		

			player.qualities = [];
			for (var i = 0; i < player.sources.length; i++) {
				if (player.sources[i].getAttribute("data-plugin-type") == player.media.pluginType) {
					player.qualities.push(player.sources[i]);
				}
			}

      function hideQualitySelector() {
        $( ".mejs__qualities-selector" ).addClass( "hide-qualities-selector" );
      }

      function showQualitySelector() {
        $( ".mejs__qualities-selector" ).removeClass( "hide-qualities-selector" );
      }

			player.qualitiesButton.on('touchstart mouseenter focusin', function() {
        showQualitySelector();
			})
			.on('mouseleave focusout', function() {
        hideQualitySelector();
			})

			// handle clicks to the quality buttons
			.on('click','input[type=button]',function() {
				player.switchQuality(this.getAttribute("value").toLowerCase(), this.getAttribute("name"), this.getAttribute("data-mimetype"));
        $( this ).parent().siblings().children().removeClass( "btn-primary" );
        $( this ).addClass( "btn-primary" );
        setTimeout( hideQualitySelector, 500 );
			});

      // Firefox doesn't support focusin/focusout, so capture the event
      $( ".mejs__qualities-button" ).get( 0 ).addEventListener( "keydown", function( e ) {
        if (( e.target === $( ".mejs__qualities-button input:last" ).get( 0 ) && e.keyCode == 9 ) || ( e.keyCode == 9 && e.shiftKey ))
        {
          hideQualitySelector();
        }
      }, true );

      $( ".mejs__qualities-button" ).get( 0 ).addEventListener( "focus", function( e ) {
        $( ".mejs__qualities-selector input" ).each( function() { $( this ).attr( "tabIndex", "0" )});
        if ( e.target.tagName === "BUTTON" ) {
          showQualitySelector();
        }
      }, true );

			// Gets the index of pre-selected quality, default is the first quality 
			// Though it's possible the pre-selected quality doesn't exist, in which case the first quality will be used
			var selectedIndex = 0;
			for (var i = 0; i < player.qualities.length; i++) {
                                var q = player.qualities[i];
                                var isSelected = q.getAttribute("data-quality") === player.selectedQuality;
                                if (isSelected) {
                                        selectedIndex = i;
                                }
                                player.addQualityButton(q.getAttribute("data-quality"), q.getAttribute("src"), q.getAttribute("type"), isSelected);
			}
			
			// Sets the player to use the selected quality
			// Use the string parameter to avoid checking canPlayType
			if(player.qualities.length>0){
				player.setSrc(player.qualities[selectedIndex].getAttribute("src"));
				player.selectedQuality = player.qualities[selectedIndex].getAttribute("data-quality");
			}

		},

		addQualityButton: function(label, url, mimetype, isSelected) {
			var t = this;
			if (label === '') {
				label = "Unknown"; 
			}
			var selected = isSelected ? "btn-primary" : "";

			t.qualitiesButton.find('ul').append(
				'<li>'+
					'<input type="button" class="btn btn-default btn-xs ' + selected + '" name="' + url + '" id="' + t.id + '_qualities_' + label + '" value="' + label.charAt( 0 ).toUpperCase() + label.slice( 1 ) + '"' + ' data-mimetype="' + mimetype + '"' + ' tabindex="0" />' +
				'</li>'
			);
		},
 
		switchQuality: function(quality, url, mimetype) {
		    this.switchStream(url);
		    this.selectedQuality = quality;
		    $.ajax({type: "POST",
				url: "/media_objects/set_session_quality",
				data: { quality: quality },
				dataType: 'json'}
			);
		}
	});
})(mejs.$);
