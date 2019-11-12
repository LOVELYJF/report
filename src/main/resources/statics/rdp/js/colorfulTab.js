/* 
    Author: Mert Nerukuc
    @knyttneve
*/

(function ($) {
    $.fn.colorfulTab = function (options) {
        var ID = $(this);
        var settings = $.extend({
            theme: '',
            backgroundImage: false,
            overlayColor: "#000",
            overlayOpacity: ".6"
        }, options);
		
		/*额外加入的js*/
		$(".hidebtn").bind("click",function(){
			$(".ui-layout-south").css("overflow","hidden");
			if ($(this).hasClass("off")) {
				$(this).removeClass("off");
				$(".ui-layout-south").animate({height:'298'});
				$("#rdes").animate({bottom:40,height:"-=260px"});
			} else{
				$(this).addClass("off");
				$(".ui-layout-south").animate({height:40});
				$("#rdes").animate({bottom:0,height:"+=260px"});
			}
		});
		
		/*额外加入的js*/
		
        return this.each(function () {
            ID.addClass(settings.theme);
            var activeTab = ID.find(".colorful-tab-menu-item.active");
            var tabMenuItems = ID.find(".colorful-tab-menu-item");
            var tabContents = ID.find(".colorful-tab-content");
            var menuItemClick = ID.find(".colorful-tab-menu-item a");

            function hex2rgb(hex, opacity) {
                var h = hex.replace('#', '');
                h = h.match(new RegExp('(.{' + h.length / 3 + '})', 'g'));
                for (var i = 0; i < h.length; i++) {
                    h[i] = parseInt(h[i].length == 1 ? h[i] + h[i] : h[i], 16);
                }
                if (typeof opacity != 'undefined') {
                    h.push(opacity);
                }
                return '' + h.join(',') + '';
            }
            if (!settings.backgroundImage == true) {
                var activeTabColor = activeTab.attr("tab-color");
                ID.css("background", activeTabColor);
            } else {
                ID.addClass("colorful-tab-background-image")
                var activeTabBg = activeTab.attr("tab-background");
                ID.css("background", "linear-gradient( rgba(" + hex2rgb(settings.overlayColor, settings
                        .overlayOpacity) + "), rgba(" + hex2rgb(settings.overlayColor, settings.overlayOpacity) +
                    ") ),url(" + activeTabBg + ")");
            }
            $(menuItemClick).click(function (e) {
                var activeTabId = $(this).attr("href");
                var activeTabText = $(this).text();
                var menuItem = $(this).parent();
                if (!menuItem.hasClass("active")) {
                    tabMenuItems.removeClass("active");
                    menuItem.addClass("active");
                    tabContents.removeClass("active");
                    $(activeTabId).addClass("active");
                    ID.attr("active-tab", activeTabText);
                    ID.addClass("active");
                    if (!settings.backgroundImage == true) {
                        var tabColor = menuItem.attr("tab-color");
                        ID.css("background", tabColor);
                    } else {
                        var tabImage = menuItem.attr("tab-background");
                        ID.css("background", "linear-gradient( rgba(" + hex2rgb(settings.overlayColor,
                            settings.overlayOpacity) + "), rgba(" + hex2rgb(settings.overlayColor,
                            settings.overlayOpacity) + ") ),url(" + tabImage + ")");
                    }
                    setTimeout(function () {
                        ID.removeClass("active");
                    }, 800);
                }
                
                if ($(".hidebtn").hasClass("off")) {
    				$(".hidebtn").removeClass("off");
    				$(".rt-config").animate({bottom:18});
    				$("#rdes").animate({bottom:0,height:"+=40px"});
    			}
                
                e.preventDefault();
            });
			
        });
    };
})(jQuery);
