(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else {
        factory(jQuery);
    }
}(function ($) {
	var defaults = {
			networks: [],
			noOfFeeds: 5,
			zoomAndBackgroundBlur: true,
			iconUrls: {
				facebook: '../img/social-icons/facebook.ico',
				youtube: '../img/social-icons/youtube.png',
				pinterest: '../img/social-icons/pintereset.png',
				instagram: '../img/social-icons/instagram.ico'
			}
		};
	    masonryVars = {
	        srcNode: '.social_feed_item',             // grid items (class, node)
	        margin: '10px',             // margin in pixel, default: 0px
	        width: '200px',             // grid item width in pixel, default: 220px
	        max_width: '',              // dynamic gird item width if specified, (pixel)
	        resizable: true,           // re-layout if window resize
	        transition: 'all 1s ease' // support transition for CSS3, default: all 0.5s ease
	    },
		wrapperSelector = '.social_feed_wrap';
    

    $(window).load(function() {
    	hideFeedLoader();
    });
    
	function hideFeedLoader(){
		$('.loader').hide();
	}	    
	
    function showFeedLoader() {
    	if($('.loader').length == 0)
    		$('body').append('<div class="loader"><div>');
    	else
    		$('.loader').show();
	}
        
	$.fn.socialFeed = function (options) {
		var settings = $.extend({}, defaults, options),
			networkLength = settings.networks.length,
			feedLimit = settings.noOfFeeds,
			socialIconUrl = settings.iconUrls,
			self = $(this);

		zoomEffect = settings.zoomAndBackgroundBlur;
		showFeedLoader();
		if(networkLength > 0){
			initSocialFeed();
		}

		function initSocialFeed() {
			var i, socialFeed = {};
			for(i=0;i<networkLength;i++){
				socialFeed= settings.networks[i];
				getFeed(socialFeed);
			}
		}
		
		function getFeed(socialFeed){
			var media = socialFeed.socialMedia,
				url,
				limit,
				user = socialFeed.user;
			
			if(socialFeed.limit != null ||  socialFeed.limit != undefined)
				limit = socialFeed.limit;
			else 
				limit = feedLimit;
			
			switch(media){
			 	case 'facebook': 
			 		url = "https://graph.facebook.com/"+user+"/photos?limit="+limit;
			 		$.ajax({
			 			  url: url,
			 			  dataType: 'jsonp',
			 			  async: false,
			 			  success: function(data) {
			 				 createFbObj(data);
			 			  }
			 			});
			 		break;
			 	case 'pinterest': 
			 		var ext = socialFeed.user.split('/').length > 1 ? '/rss' : '/feed.rss',
			 			href = "http://www.pinterest.com/"+user;
			 		
			 		url = 'http://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num='+limit+'&callback=?&q=' + encodeURIComponent(href+ext);
			 		$.ajax({
			 			  url: url,
			 			  dataType: 'jsonp',
			 			  async: false,
			 			  success: function(data) {
			 				 createPinObj(data);
			 			  }
			 			});
			 		break;			 		
			 	case 'youtube': 
			 		url = $.fn.youtubeUrlSelector(socialFeed)+"&max-results="+limit;
			 		//url = "https://gdata.youtube.com/feeds/api/users/"+user+"/uploads?alt=json&max-results="+limit;
			 		$.ajax({
			 			  url: url,
			 			  dataType: 'json',
			 			  async: false,
			 			  success: function(data) {
			 				 createYTObj(data);
			 			  }
			 			});
			 		break;		 		
			 	case 'instagram': 			 		
			 		url = $.fn.instaUrlSelector(socialFeed)+'&count='+limit;
			 		$.ajax({
			 		      type: 'GET',
			 			  url: url,
			 			  dataType: 'jsonp',
			 			  async: false,
			 			  success: function(data) {
			 				 createInstaObj(data);
			 			  }
			 			});
			 		break;
			}
			
			function createFbObj(feed){
				var fbList = '',i,
					feedLength = feed.data.length,
					fbObj = {},
					icon = '';
				
				if(socialIconUrl.facebook != null || socialIconUrl.facebook != undefined)
					icon = socialIconUrl.facebook;
				else
					icon = defaults.iconUrls.facebook;
				
				console.log(feed.data);
				for ( i = 0; i < feedLength; i++) {
					fbObj.imgUrl = feed.data[i].source;
					fbObj.link = feed.data[i].link;
					fbObj.iconUrl = socialIconUrl.facebook;
					fbObj.message = "";
					fbObj.title = feed.data[i].from.name;
					fbObj.socialMediaClass = "facebook";
					
					var fbItem = new FeedItems(fbObj);
					fbList += fbItem.singleItem();
				}
				
				self.append(fbList);
				self.shuffle(wrapperSelector);
				
			}
			
			function createPinObj(feed){
				if(feed.responseData == undefined || feed.responseData == null ) throw new Error(feed.responseDetails);
				var pinList = '',i,
					pinFeed = feed.responseData.feed.entries;
					feedLength = pinFeed.length,
					pinObj = {},
					icon = '';
					
				if(socialIconUrl.pinterest != null || socialIconUrl.pinterest != undefined)
					icon = socialIconUrl.pinterest;
				else
					icon = defaults.iconUrls.pinterest;
				
				console.log(feed.responseData.feed.entries);
				for ( i = 0; i < feedLength; i++) {
					pinObj.imgUrl = $('img',pinFeed[i].content).attr('src');
					pinObj.link = pinFeed[i].link;
					pinObj.iconUrl = icon;
					pinObj.message = "";
					pinObj.title = pinFeed[i].contentSnippet;
					pinObj.socialMediaClass = "pinterest";
					
					var pinItem = new FeedItems(pinObj);
					pinList += pinItem.singleItem();
				}
				
				self.append(pinList);
				self.shuffle(wrapperSelector);
				
			}
			
			function createYTObj(data){
				var ytList = '',i,
					ytFeed = data.feed.entry,
					feedLength = ytFeed.length,
					videoId,
					ytObj = {},
					icon = '';
					
				if(socialIconUrl.youtube != null || socialIconUrl.youtube != undefined)
					icon = socialIconUrl.youtube;
				else
					icon = defaults.iconUrls.youtube;
					
				console.log(ytFeed);
				for ( i = 0; i < feedLength; i++) {
					videoId = ytFeed[i].link[2].href.split('v=')[1];
					ytObj.imgUrl = 'http://img.youtube.com/vi/'+videoId+'/mqdefault.jpg';
					ytObj.link = 'https://www.youtube.com/watch?v='+videoId;
					ytObj.iconUrl = icon;
					if(ytFeed[i].content.$t != undefined || ytFeed[i].content.$t != null)
						ytObj.message = ytFeed[i].content.$t.substr(0, 250)+"...";
					else 
						ytObj.message = '';
					ytObj.title = ytFeed[i].title.$t;
					ytObj.socialMediaClass = "youtube";
					
					var ytItem = new FeedItems(ytObj);
					ytList += ytItem.singleItem();
				}
				
				self.append(ytList);
				self.shuffle(wrapperSelector);
				
			}
		}		
		
		function createInstaObj(instaFeed){
			if(instaFeed.data == undefined) throw new Error(instaFeed.meta.error_message);
			var instaList = '',i,
				instaFeed = instaFeed.data,
				feedLength = instaFeed.length,
				videoId,
				instaObj = {},
				icon = '';
			
			if(socialIconUrl.instagram != null || socialIconUrl.instagram != undefined)
				icon = socialIconUrl.instagram;
			else
				icon = defaults.iconUrls.instagram;
				
			console.log(instaFeed);
			for ( i = 0; i < feedLength; i++) {
				instaObj.imgUrl = instaFeed[i].images.standard_resolution.url;
				instaObj.link = instaFeed[i].link;
				instaObj.iconUrl = icon;
				instaObj.message = "";
				instaObj.title = instaFeed[i].user.username;
				instaObj.socialMediaClass = "instagram";
				
				var instaItem = new FeedItems(instaObj);
				instaList += instaItem.singleItem();
			}
			
			self.append(instaList);
			self.shuffle(wrapperSelector);
			
		}		
		
		function FeedItems(feed){
			var content = '';
			this.imgUrl = feed.imgUrl;
			this.link = feed.link;
			this.iconUrl = feed.iconUrl;
			this.message = feed.message;
			this.title = feed.title;
			this.socialMediaClass = feed.socialMediaClass;
			this.linkWrap = function(wrap){
				return '<a href="'+this.link+'" class="social_feed_wrap" target="_blank">'+wrap+'</a>';
			};
			this.singleItem = function(){
				content += '<div class="social_feed_item '+this.socialMediaClass+'">'+
								'<div class="social_feed_main">'+
							   		'<img src="'+this.imgUrl+'" draggable="false" />'+
							   		'<h4>'+this.title+'</h4>';
									if(this.socialMediaClass == 'youtube' && this.message){
										content += '<div class="social_feed_message">'+this.message+'</div>';
									}
					 content += '</div>'+
								'<div class="social_feed_footer">'+
									'<img src="'+this.iconUrl+'" draggable="false" />'+
								'</div>'+
							'</div>';
				content = this.linkWrap(content);
				
				return content;
			};
			this.shareOnFacebook = function (st,sq,si){
				var sq = encodeURIComponent(sq), st = encodeURIComponent(st);
				var s = '<a href="http://www.facebook.com/sharer.php?u='+sq+'&t='+st+'&i='+si+'" class="share-facebook" style="float:right;"><img src="'+defaults.iconUrls.facebook+'" draggable="false" /></a>';
				return s;
		    }
		} 
	};
  
	$.fn.instaUrlSelector = function(type) {
		var url = "https://api.instagram.com/v1/";
		switch (type.get.option) {
	        case "popular":
	        	url += "media/popular";
	            break;
	        case "tagged":
	        	url += "tags/" + type.get.tagName + "/media/recent";
	            break;
	        case "location":
	            url += "locations/" + type.get.locationId + "/media/recent";
	            break;
	        case "user":
	            url += "users/" + type.get.userId + "/media/recent";
	            break;
	    }
		
	    return url = type.accessToken != null || type.accessToken != undefined ? url += "?access_token=" + type.accessToken : url += "?client_id=" + type.clientId;
		
	};
	
	$.fn.youtubeUrlSelector = function(yturltype) {
		var url = "https://gdata.youtube.com/feeds/api/";
		switch (yturltype.get.option) {
	        case "standard":
	        	url += "standardfeeds/most_popular";
	            break;
	        case "search":
	        	url += "videos/";
	            break;
	        case "locationid":
	            url += "standardfeeds/" + yturltype.get.locationId + "/most_popular";
	            break;
	        case "locationcategory":
	            url += "standardfeeds/" + yturltype.get.locationId + "/most_popular_"+yturltype.get.category;
	            break;
	        case "user":
	            url += "users/" + yturltype.get.userId + "/uploads";
	            break;
	    }
		
		if(yturltype.get.option == "search")
			return url += "?q="+yturltype.get.search+"&alt=json";
		else
			return url += "?alt=json";

	};
	
	$.fn.shuffle = function(childSelector) {	      
	    return this.each(function() {
	      var $this = $(this);
	      var unsortedElems = $this.children(childSelector);
	      var elems = unsortedElems.clone();
	      
	      elems.sort(function() { return (Math.round(Math.random())-0.5); });  
	
	      for(var i=0; i < elems.length; i++)
	        unsortedElems.eq(i).replaceWith(elems[i]);

	      $this.buildMasonry(masonryVars);
	      
	    });    
	};
	
    $.fn.extend({
    	filterFeed: function(media) {
    		if(media == 'all'){
    			$(masonryVars.srcNode).show();
    		} else {
    			$(masonryVars.srcNode).hide();
				$('.'+media).show();
    		}
    		this.shuffle(wrapperSelector);
		},
        imagesLoaded: function(cb){
            var images = $(this).find('img');
            var count = images.length;
            if (count == 0) cb();
            for(var i = 0, length = images.length; i< length; i++)
            {
                var image = new Image();
                image.onload = function(e){
                    count --;
                    if (count == 0) cb();
                };
                image.onerror = function(e){
                    count --;
                    if (count == 0) cb();
                };
                image.src = images[i].src;
            }
        },
        buildMasonry: function(option) {
            var $this = $(this),
                options = option || {},
                indexOfSmallest = function (a) {
                    var lowest = 0;
                    for (var i = 1, length = a.length; i < length; i++) {
                        if (a[i] < a[lowest]) lowest = i;
                    }
                    return lowest;
                },
                render = function()
                {
                    $this.css('position', 'relative');
                    var items = [],
                        transition = (options.transition || 'all 0.5s ease') + ', height 0, width 0',
                        width = $this.innerWidth(),
                        item_margin = parseInt(options.margin || 0),
                        item_width = parseInt(options.max_width || options.width || 220),
                        column_count = Math.max(Math.floor(width/(item_width + item_margin)),1),
                        left = column_count == 1 ? item_margin/2 : (width % (item_width + item_margin)) / 2,
                        columns = [];
                    
                    $this.find(options.srcNode).each(function(){
                    	if($(this).css('display') == 'block'){
                    		items.push($(this));
                    	}
                    });
                    
                    
                    if (options.max_width) {
                        column_count = Math.ceil(width/(item_width + item_margin));
                        item_width = (width - column_count * item_margin - item_margin)/column_count;
                        left = item_margin/2;
                    }

                    for (var i = 0; i < column_count; i++) {
                        columns.push(0);
                    }

                    for(var i = 0, length = items.length; i< length; i++)
                    {
                        var $item = $(items[i]), idx = indexOfSmallest(columns);
                        $item.css({
                            'width': item_width,
                            'position': 'absolute',
                            'margin': item_margin/2,
                            'top': columns[idx] + item_margin/2,
                            'left': (item_width + item_margin) * idx + left,
                            'transition': transition,
                            '-moz-transition': transition,
                            '-webkit-transition': transition
                        });
                        if(zoomEffect)
                        	$item.addClass('feed_zoom');
                        columns[idx] += $item.innerHeight() + item_margin;
                    }
                };

            $this.imagesLoaded(render);
            
            if(zoomEffect)
            	$this.blurBackground(options.srcNode);
            
            if (options.resizable) {
                var resize =  $(window).on("resize", render);
                $this.on('remove', resize.unbind);
            }
        },
    	
    	blurBackground : function($selector){
    		var $this = this;
		    $($this).on('mouseover', $selector, function(){
				$($selector).css('opacity','.5');
				$(this).css('opacity','1');
		    });
		    $($this).on('mouseout', $selector, function(){
		    	$($selector).css('opacity','1');
		    });
    	}
    });
}));
