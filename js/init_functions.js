function scale_dom_elements()
{
    var window_width = $(window).width();
    var window_height = $(window).height();
    var scale_width = window_width / 1920;
    var scale_height = window_height / 971;
    var dom_elements = document.getElementsByTagName("*");

    $("#god_container").width(window_width);
    $("#god_container").height(window_height);

    for(var i = 0; i < dom_elements.length; i++)
    {
        if($(dom_elements[i]).prop('tagName') != "HTML" &&
            $(dom_elements[i]).prop('tagName') != "BODY" &&
            $(dom_elements[i]).prop('tagName') != "HEAD" &&
            $(dom_elements[i]).prop('tagName') != "TITLE" &&
            $(dom_elements[i]).prop('tagName') != "LINK" &&
            $(dom_elements[i]).prop('tagName') != "SCRIPT" &&
            $(dom_elements[i]).prop('tagName') != "STYLE" &&
            $(dom_elements[i]).prop('tagName') != "META" &&
            $(dom_elements[i]).attr("id") != "god_container" &&
            $(dom_elements[i]).attr("id") != "map" &&
            $(dom_elements[i]).attr("id") != "temp" &&
            $(dom_elements[i]).attr("id") != "controls_container" &&
            $(dom_elements[i]).attr("id") != "controls_layout" &&
            $(dom_elements[i]).attr("id") != "loader_container" &&
            $(dom_elements[i]).attr("id") != "loader" &&
            $(dom_elements[i]).attr("id") != "undefined")
        {
            //Scale Width and Height
            var original_width = $(dom_elements[i]).width();
            var original_height = $(dom_elements[i]).height();

            $(dom_elements[i]).width(parseInt(Math.round(original_width * scale_width), 10) + "px");
            $(dom_elements[i]).height(parseInt(Math.round(original_height * scale_height), 10) + "px");

            //Scale Margins
            var original_margin_top = $(dom_elements[i]).css('margin-top').replace("px", "");
            var original_margin_left = $(dom_elements[i]).css('margin-left').replace("px", "");
            var original_margin_bottom = $(dom_elements[i]).css('margin-bottom').replace("px", "");
            var original_margin_right = $(dom_elements[i]).css('margin-right').replace("px", "");

            if(original_margin_top != 0) $(dom_elements[i]).css('margin-top', parseInt(Math.round(original_margin_top * scale_height), 10) + "px");
            if(original_margin_left != 0) $(dom_elements[i]).css('margin-left', parseInt(Math.round(original_margin_left * scale_width), 10) + "px");
            if(original_margin_bottom != 0) $(dom_elements[i]).css('margin-bottom', parseInt(Math.round(original_margin_bottom * scale_height), 10) + "px");
            if(original_margin_right != 0) $(dom_elements[i]).css('margin-right', parseInt(Math.round(original_margin_right * scale_width), 10) + "px");

            //Scale Padding
            var original_padding_top = $(dom_elements[i]).css('padding-top').replace("px", "");
            var original_padding_left = $(dom_elements[i]).css('padding-left').replace("px", "");
            var original_padding_bottom = $(dom_elements[i]).css('padding-bottom').replace("px", "");
            var original_padding_right = $(dom_elements[i]).css('padding-right').replace("px", "");

            if(original_padding_top != 0) $(dom_elements[i]).css('padding-top', parseInt(Math.round(original_padding_top * scale_height), 10) + "px");
            if(original_padding_left != 0) $(dom_elements[i]).css('padding-left', parseInt(Math.round(original_padding_left * scale_width), 10) + "px");
            if(original_padding_bottom != 0) $(dom_elements[i]).css('padding-bottom', parseInt(Math.round(original_padding_bottom * scale_height), 10) + "px");
            if(original_padding_right != 0) $(dom_elements[i]).css('padding-right', parseInt(Math.round(original_padding_right * scale_width), 10) + "px");

            //Scale Font Size
            var original_font_size = $(dom_elements[i]).css('font-size').replace("px", "");

            if(original_font_size != 0) $(dom_elements[i]).css('font-size', parseInt(Math.round(original_font_size * scale_height), 10) + "px");
        }
    }
}

function init_window_layout()
{
    var window_width = $(window).width();
    var window_height = $(window).height();

    var margin = 15;
    var padding = 15;
    var border = 1;
    var map_width_percentage = 75;
    var controls_container_width_percentage = 100 - map_width_percentage;
    var usable_width = window_width - (margin * 3);
    var map_width = Math.round((usable_width / 100) * map_width_percentage - (border * 2));
    var controls_container_width = Math.round((usable_width / 100) * controls_container_width_percentage - (padding * 2));

    $('#god_container').height(window_height +'px');

    $('#map').css('top', margin + "px");
    $('#map').css('left', margin + "px");
    $('#map').css('width', map_width + "px");
    $('#map').css('height', (window_height - (margin * 2) - (border * 2)) + "px");

    $('#controls_container').css('top', margin + "px");
    $('#controls_container').css('left', ((margin * 2) + map_width) + "px");
    $('#controls_container').css('width', controls_container_width + "px");
    $('#controls_container').css('height', (window_height - (margin * 2) - (padding * 2)) + "px");

    $('#map_controls').css('left', (map_width - $('#map_controls').outerWidth()) + 'px');

    scale_dom_elements();

    $("#routes_row").hide();
    $("#route_direction_row").hide();
    $("#stop_action_row").hide();
    $("#route_stops_row").hide();
    $("#route_polylines_row").hide();
    $('#loader_container').hide();

}

function init_google_map()
{
    window.Google_Map = null;

    var custom_styles =
    [{
        featureType: "poi",
        elementType: "labels",
        stylers: [{ visibility: "off" }]
    }];

    var map_options =
    {
        zoom: 8,
        center: new google.maps.LatLng(-34.007776, 18.463081),
        disableDefaultUI: true,
        mapTypeId: google.maps.MapTypeId.TERRAIN,
        styles: custom_styles
    };

    Google_Map = new google.maps.Map(document.getElementById('map'), map_options);

    google.maps.event.addListener(Google_Map, 'click', function(event)
    {
        if(IS_EDITABLE == true)
        {
            if($("input[name=stop_action]:checked").val() == Markers_)
            {
                $('#add_stop').click();

                window.NEW_LATITUDE = event.latLng.lat();
                window.NEW_LONGITUDE = event.latLng.lng();
            }

            if($("input[name=stop_action]:checked").val() == Polylines_)
            {
                var point = new google.maps.LatLng(event.latLng.lat(), event.latLng.lng());
                var polyline = POLYLINES._Get_Polyline(POLYLINE_ID);

                console.log(polyline.stop_1_id + ", New Point Latitude:  " + point.lat());
                console.log(polyline.stop_1_id + ", New Point Longitude: " + point.lng());

                Google_Map.setOptions({draggableCursor: "url('./images/polyline_cursor_plus.png'), default"});

                if(polyline.polyline.getPath().length == 0)
                {
                    polyline._Add_GPS_Position(point);

                    google.maps.event.addListener(polyline.polyline, 'click', function(event)
                    {
                        if(event.vertex != undefined)
                        {
                            var polyline = POLYLINES._Get_Polyline(POLYLINE_ID);
                            window.VERTEX = event.vertex;

                            VERTEX_HIGHTLIGHT.setPosition(polyline.polyline.getPath().getAt(VERTEX));
                            VERTEX_HIGHTLIGHT.setVisible(true);
                        }
                    });

                    POLYLINE_MARKER_START.setPosition(new google.maps.LatLng(event.latLng.lat(), event.latLng.lng()));
                }
                else
                {

                    if(polyline.polyline.getPath().length > 1) POLYLINE_MARKER_START.setVisible(false);

                    if(polyline.last_gps_position != null)
                    {
                        if(get_distance(POLYLINE_MARKER_END.getPosition(), point) < 10)
                            polyline._Add_GPS_Position(POLYLINE_MARKER_END.getPosition());
                        else
                            polyline._Add_GPS_Position(point);
                    }
                    else polyline._Add_GPS_Position(point);
                }
            }
        }
        else
        {
            VERTEX_HIGHTLIGHT.setVisible(false);
            HIGHTLIGHT_CIRCLE.setVisible(false);
        }
    });
}

