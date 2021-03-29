$.fn.scrollTo = function(elem)
{
    $(this).scrollTop($(this).scrollTop() - $(this).offset().top + $(elem).offset().top);

    return this;
};

$(document).ready(function()
{
    init_window_layout();
    init_google_map();

    Get_MOT_List.Send({});

    window.Golden_Arrow = '1';
    window.Metrorail = '2';
    window.MyCiTi = '3';
    window.Markers_ = '0';
    window.Polylines_ = '1';

    window.MOT_ID = null;
    window.ROUTE_ID = null;
    window.ROUTE_DIRECTION = 0;
    window.STOP_ID = null;
    window.POLYLINE_ID = null;
    window.VERTEX = null;

    window.ROUTES = new Routes();
    window.STOPS = new Stops();
    window.POLYLINES = new Polylines();

    window.MARKERS = new Array();
    window.HIGHTLIGHT_CIRCLE = new google.maps.Marker({
                                                          map: Google_Map,
                                                          zIndex: -3,
                                                          clickable: false,
                                                          icon: {
                                                              path: google.maps.SymbolPath.CIRCLE,
                                                              fillOpacity: 0,
                                                              strokeOpacity: 0.7,
                                                              strokeColor: '#0000FF',
                                                              strokeWeight: 5.0,
                                                              scale: 20
                                                          }
                                                      });

    window.VERTEX_HIGHTLIGHT = new google.maps.Marker({
                                                          map: Google_Map,
                                                          zIndex: -3,
                                                          clickable: false,
                                                          icon: {
                                                              path: google.maps.SymbolPath.CIRCLE,
                                                              fillOpacity: 0,
                                                              strokeOpacity: 0.7,
                                                              strokeColor: '#0000FF',
                                                              strokeWeight: 5.0,
                                                              scale: 9
                                                          }
                                                      });

    window.POLYLINE_MARKER_START = new google.maps.Marker({
                                                              map: Google_Map,
                                                              zIndex: 20,
                                                              clickable: false,
                                                              visible: false,
                                                              icon: new google.maps.MarkerImage('./images/vertex.png', null, null,
                                                                                                new google.maps.Point(5, 5),
                                                                                                new google.maps.Size(11, 11))
                                                          });

    window.POLYLINE_MARKER_END = new google.maps.Marker({
                                                            map: Google_Map,
                                                            zIndex: 20,
                                                            clickable: false,
                                                            visible: false,
                                                            icon: new google.maps.MarkerImage('./images/vertex.png', null, null,
                                                                                              new google.maps.Point(5, 5),
                                                                                              new google.maps.Size(11, 11))
                                                        });
    window.IS_EDITABLE = false;
    window.NEW_LATITUDE = null;
    window.NEW_LONGITUDE = null;

    $('#mot_list').on('change', function()
    {
        HIGHTLIGHT_CIRCLE.setVisible(false);
        VERTEX_HIGHTLIGHT.setVisible(false);
        window.MOT_ID = this.value;
        POLYLINES._Clear();

        kill_route_container();
        kill_stops_container();
        kill_polyline_container();
        clear_markers();
        $("input[name=stop_action][value='0']").prop("checked",true);

        if(MOT_ID > 0) Get_MOT_Routes.Send({mot_id: MOT_ID});
    });

    $("#mot_routes_container").on('focusin', function()
    {
        HIGHTLIGHT_CIRCLE.setVisible(false);

        $(this).css('border', '1px solid #7A9CD3');

        $('#route_' + ROUTE_ID).css('background-color', '#1E90FF');
        $('#route_' + ROUTE_ID).find('.adverb').css('color', '#FFFFFF');
        $('#route_' + ROUTE_ID).find('.noun').css('color', '#AAEDFF');
    });

    $('#mot_routes_container').on('focusout', function()
    {
        $(this).css('border', '1px solid #C8C8C8');

        $('#route_' + ROUTE_ID).css('background-color', '#C8C8C8');
        $('#route_' + ROUTE_ID).find('.adverb').css('color', '#777777');
        $('#route_' + ROUTE_ID).find('.noun').css('color', '#676767');
    });

    $('#route_direction').on('change', function()
    {
        HIGHTLIGHT_CIRCLE.setVisible(false);
        window.ROUTE_DIRECTION = this.value;
        Get_Route_Stops.Send({ mot_id: MOT_ID, route_id: ROUTE_ID, route_direction: ROUTE_DIRECTION });
    });

    $("#route_stops_container").on('focusin', function()
    {
        HIGHTLIGHT_CIRCLE.setVisible(false);

        $(this).css('border', '1px solid #7A9CD3');

        $('#stop_' + STOP_ID).css('background-color', '#1E90FF');
        $('#stop_' + STOP_ID).find('.adverb').css('color', '#FFFFFF');
        $('#stop_' + STOP_ID).find('.noun').css('color', '#AAEDFF');
    });

    $("#route_stops_container").on('focusout', function()
    {
        $(this).css('border', '1px solid #C8C8C8');

        $('#stop_' + STOP_ID).css('background-color', '#C8C8C8');
        $('#stop_' + STOP_ID).find('.adverb').css('color', '#777777');
        $('#stop_' + STOP_ID).find('.noun').css('color', '#676767');
    });

    $('#add_route').on('click', function()
    {
        switch(MOT_ID)
        {
            case Golden_Arrow:
                $.get("route_details_editor_1_and_2.html", function(external_html)
                {
                    $('body').append(external_html);

                    $('#route_editor_header_container').html("Add Golden Arrow Route Description");
                    $('#route_is_express_row').hide();

                    on_route_details_container_loaded(insert_route);

                    $('#route_details_container').fadeIn('slow');
                    $('#route_from').focus();
                });
                break;

            case Metrorail:
                $.get("route_details_editor_1_and_2.html", function(external_html)
                {
                    $('body').append(external_html);

                    $('#route_editor_header_container').html("Add Metrorail Route Description");

                    on_route_details_container_loaded(insert_route);

                    $('#route_details_container').fadeIn('slow');
                    $('#route_from').focus();
                });
                break;

            case MyCiTi:
                $.get("route_details_editor_3.html", function(external_html)
                {
                    $('body').append(external_html);

                    $('#route_editor_header_container').html("Add MyCiTi Route Description");

                    center_dialog('#route_details_container');

                    on_route_details_container_loaded(insert_route);

                    for(var i = 0; i < 2; i++)
                    {
                        var waypoint_order = i + 1;
                        var col_spacer = ''; if(i == 0) col_spacer = " style='padding-right: 25px'";
                        var label = "Area Waypoint " + waypoint_order;
                        var add_button = "<div id='add_waypoint_button' class='add_button'></div>"; if(i == 0) add_button = '';

                        var row_html =  "<tr id='waypoint_row_" + waypoint_order + "'>" +
                                            "<td" + col_spacer + ">" +
                                                "<label for='area_waypoint_" + waypoint_order + "' class='left_item'>" + label + ":</label>" +
                                            "</td>" +
                                            "<td>" +
                                            "</td>" +
                                            "<td>" +
                                                "<input type='text' id='area_waypoint_" + waypoint_order + "' class='textbox' tabindex='" + waypoint_order + "'>" +
                                            "</td>" +
                                            "<td>" +
                                                add_button +
                                            "</td>" +
                                        "</tr>";

                        $('#route_details_layout').append(row_html);

                        if(add_button != '') $('#add_waypoint_button').bind('click', add_waypoint_row);
                    }

                    $('#route_details_container').fadeIn('slow');
                    $('#area_waypoint_1').focus();
                });
                break;
        }
    });

    $('#add_stop').on('click', function()
    {
        $.get("stop_details_editor.html", function(external_html)
        {
            $('body').append(external_html);

            switch(MOT_ID)
            {
                case Golden_Arrow:  $('#stop_editor_header_container').html("Add Golden Arrow Stop");   break;
                case Metrorail:     $('#stop_editor_header_container').html("Add Metrorail Station");   break;
                case MyCiTi:        $('#stop_editor_header_container').html("Add MyCiTi Stop");         break;
            }

            on_stop_details_container_loaded(insert_stop);

            if(IS_EDITABLE == true) $('#import_button').hide();

            $('#stop_details_container').fadeIn('slow');
            $('#stop_name').focus();
        });
    });

    $('#csv').on('change', function(event)
    {
        var file = event.target.files[0];

        if(file)
        {
            var file_reader = new FileReader();

            file_reader.onload = function(event)
            {
                var rows = event.target.result.split("\r\n");
                rows.pop();

                var error_report = new Array();

                for(var i = 0; i < rows.length; i++)
                {
                    var row_data = rows[i].split(",");

                    if(row_data[0] == "")
                        error_report.push("<div class='line_position'>Row</div>" +
                                          "&nbsp;" +
                                          "<div class='line_number'>" + (i + 1) + ",</div>" +
                                          "<div class='line_position'>&nbsp;Column&nbsp;</div>" +
                                          "<div class='line_number'>1:</div>" +
                                          "<div class='line_text'>Stop Name is blank.</div>");

                    if(!isFloat(parseFloat(row_data[1])))
                        error_report.push("<div class='line_position'>Row</div>" +
                                          "&nbsp;" +
                                          "<div class='line_number'>" + (i + 1) + ",</div>" +
                                          "<div class='line_position'>&nbsp;Column&nbsp;</div>" +
                                          "<div class='line_number'>2:</div>" +
                                          "<div class='line_text'>Stop Latitude is not of type DOUBLE.</div>");

                    if(!isFloat(parseFloat(row_data[2])))
                        error_report.push("<div class='line_position'>Row</div>" +
                                          "&nbsp;" +
                                          "<div class='line_number'>" + (i + 1) + ",</div>" +
                                          "<div class='line_position'>&nbsp;Column&nbsp;</div>" +
                                          "<div class='line_number'>3:</div>" +
                                          "<div class='line_text'>Stop Longitude is not of type DOUBLE.</div>");
                }

                var message_html = '';

                for(var i = 0; i < error_report.length; i++)
                {
                    message_html += "<div class='line'><div class='line_number'>" + (i + 1) + ".</div>" + error_report[i] + "</div>";
                    if(i < (error_report.length - 1)) message_html += "<br>";
                }

                if(message_html == '')
                {
                    var stops = new Array();
                    for(var i = 0; i < rows.length; i++)
                    {
                        var row_data = rows[i].split(",");
                        stops.push({ stop_name: row_data[0], stop_latitude: row_data[1], stop_longitude: row_data[2] });
                    }

                    Import_Stops.Send({
                                          route_id: ROUTE_ID,
                                          route_direction: ROUTE_DIRECTION,
                                          stops: stops
                                      });
                }
                else
                {
                    $.get("message_box.html", function(external_html)
                    {
                        $('body').append(external_html);

                        $('#message_box').html(message_html);
                        $('#ok_button').bind('click', function(){ $('#message_box_container').fadeOut('fast').remove(); });

                        center_dialog('#message_box_container');

                        $('#message_box_container').bind('keyup', function(event)
                        {
                            if(event.keyCode == 13) $('#ok_button').click(); // 13 == Enter
                            if(event.keyCode == 27) $('#ok_button').click();  // 27 == Escape
                        });

                        $('#message_box_container').fadeIn('slow');
                    });
                }

                $('#csv').val('');
                file_reader.abort();
            };

            file_reader.readAsText(file);
        }
        else
        {
            alert("Failed to load file");
        }
    });

    $("input[name=stop_action]:radio").on('change', function()
    {
        clear_markers();
        var bounds = new google.maps.LatLngBounds();

        switch($(this).val())
        {
            case Markers_:
                $('#route_polylines_row').hide();
                VERTEX_HIGHTLIGHT.setVisible(false);
                POLYLINES._Hide_Polylines();

                for(var i = 0; i < STOPS.stops.length; i++)
                {
                    bounds.extend(new google.maps.LatLng(STOPS.stops[i].stop_latitude, STOPS.stops[i].stop_longitude));

                    STOPS._Add_Marker(STOPS.stops[i].stop_id);
                }

                $("#route_stops_row").fadeIn('slow');
                break;

            case Polylines_:
                $('#route_stops_row').hide();
                HIGHTLIGHT_CIRCLE.setVisible(false);
                POLYLINES._Show_Polylines();

                for(var i = 0; i < STOPS.stops.length; i++)
                {
                    bounds.extend(new google.maps.LatLng(STOPS.stops[i].stop_latitude, STOPS.stops[i].stop_longitude));

                    POLYLINES._Add_Marker(STOPS.stops[i].stop_id);
                }

                $('#route_polylines_row').fadeIn('slow');
                break;
        }

        $("#stop_action_row").fadeIn('slow');
        if($("#auto_zoom").is(':checked') && STOPS.stops.length != 0) Google_Map.fitBounds(bounds);
    });

    $("input[name=map_type]:radio").on('change', function()
    {
        if($(this).val() == '0') Google_Map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
        if($(this).val() == '1') Google_Map.setMapTypeId(google.maps.MapTypeId.TERRAIN);
        if($(this).val() == '2') Google_Map.setMapTypeId(google.maps.MapTypeId.SATELLITE);
    });

    $(document).keyup(function(event)
    {
        switch(event.which)
        {
            case 38: // Up
                if($('#mot_routes_container').is(":focus") && ROUTE_ID != null && $('#mot_routes_container').find('#route_' + ROUTE_ID).prev('div').length)
                {
                    HIGHTLIGHT_CIRCLE.setVisible(false);

                    window.ROUTE_ID = $('#mot_routes_container').find('#route_' + ROUTE_ID).prev('div').attr('id').replace('route_', '');

                    $('#mot_routes_container [style]').removeAttr("style");

                    $('#route_' + ROUTE_ID).css('background-color', '#1E90FF');
                    $('#route_' + ROUTE_ID).find('.adverb').css('color', '#FFFFFF');
                    $('#route_' + ROUTE_ID).find('.noun').css('color', '#AAEDFF');

                    $("#mot_routes_container").scrollTo('#route_' + ROUTE_ID);

                    Get_Route_Stops.Send({ mot_id: MOT_ID, route_id: ROUTE_ID, route_direction: ROUTE_DIRECTION });
                }

                if($('#route_stops_container').is(":focus") && STOP_ID != null && $('#route_stops_container').find('#stop_' + STOP_ID).prev('div').length)
                {
                    HIGHTLIGHT_CIRCLE.setVisible(true);

                    window.STOP_ID = $('#route_stops_container').find('#stop_' + STOP_ID).prev('div').attr('id').replace('stop_', '');

                    $('#route_stops_container [style]').removeAttr("style");

                    $('#stop_' + STOP_ID).css('background-color', '#1E90FF');
                    $('#stop_' + STOP_ID).find('.adverb').css('color', '#FFFFFF');
                    $('#stop_' + STOP_ID).find('.noun').css('color', '#AAEDFF');

                    $("#route_stops_container").scrollTo('#stop_' + STOP_ID);

                    var not_found = true;
                    var index = -1;

                    for(var i = 0; i < MARKERS.length && not_found == true; i++)
                    {
                        if(MARKERS[i]["stop_id"] == STOP_ID)
                        {
                            index = i;
                            not_found = false;
                        }
                    }

                    HIGHTLIGHT_CIRCLE.setPosition(MARKERS[index]["marker"].getPosition());
                    Google_Map.panTo(MARKERS[index]["marker"].getPosition());
                }

                if($('#route_polylines_container').is(":focus") && POLYLINE_ID != null && $('#route_polylines_container').find('#polyline_' + POLYLINE_ID).prev('div').length)
                {
                    if(POLYLINE_ID != null)
                    {
                        var polyline = POLYLINES._Get_Polyline(POLYLINE_ID);

                        MARKERS[find_marker_index(polyline.stop_1_id)].marker.setIcon(new google.maps.MarkerImage('./images/target.png', null, null,
                                                                                                                  new google.maps.Point(8, 8),
                                                                                                                  new google.maps.Size(16, 16)));
                        MARKERS[find_marker_index(polyline.stop_2_id)].marker.setIcon(new google.maps.MarkerImage('./images/target.png', null, null,
                                                                                                                  new google.maps.Point(8, 8),
                                                                                                                  new google.maps.Size(16, 16)));
                    }

                    window.POLYLINE_ID = $('#route_polylines_container').find('#polyline_' + POLYLINE_ID).prev('div').attr('id').replace('polyline_', '');

                    $('#polyline_' + POLYLINE_ID).click();
                }
                break;

            case 40: // Down
                if($('#mot_routes_container').is(":focus") && ROUTE_ID != null && $('#mot_routes_container').find('#route_' + ROUTE_ID).next('div').length)
                {
                    HIGHTLIGHT_CIRCLE.setVisible(false);

                    window.ROUTE_ID = $('#mot_routes_container').find('#route_' + ROUTE_ID).next('div').attr('id').replace('route_', '');

                    $('#mot_routes_container [style]').removeAttr("style");

                    $('#route_' + ROUTE_ID).css('background-color', '#1E90FF');
                    $('#route_' + ROUTE_ID).find('.adverb').css('color', '#FFFFFF');
                    $('#route_' + ROUTE_ID).find('.noun').css('color', '#AAEDFF');

                    $("#mot_routes_container").scrollTo('#route_' + ROUTE_ID);

                    Get_Route_Stops.Send({ mot_id: MOT_ID, route_id: ROUTE_ID, route_direction: ROUTE_DIRECTION });
                }

                if($('#route_stops_container').is(":focus") && STOP_ID != null && $('#route_stops_container').find('#stop_' + STOP_ID).next('div').length)
                {
                    HIGHTLIGHT_CIRCLE.setVisible(true);

                    window.STOP_ID = $('#route_stops_container').find('#stop_' + STOP_ID).next('div').attr('id').replace('stop_', '');

                    $('#route_stops_container [style]').removeAttr("style");

                    $('#stop_' + STOP_ID).css('background-color', '#1E90FF');
                    $('#stop_' + STOP_ID).find('.adverb').css('color', '#FFFFFF');
                    $('#stop_' + STOP_ID).find('.noun').css('color', '#AAEDFF');

                    $("#route_stops_container").scrollTo('#stop_' + STOP_ID);

                    var not_found = true;
                    var index = -1;

                    for(var i = 0; i < MARKERS.length && not_found == true; i++)
                    {
                        if(MARKERS[i]["stop_id"] == STOP_ID)
                        {
                            index = i;
                            not_found = false;
                        }
                    }

                    HIGHTLIGHT_CIRCLE.setPosition(MARKERS[index]["marker"].getPosition());
                    Google_Map.panTo(MARKERS[index]["marker"].getPosition());
                }

                if($('#route_polylines_container').is(":focus") && POLYLINE_ID != null && $('#route_polylines_container').find('#polyline_' + POLYLINE_ID).next('div').length)
                {
                    if(POLYLINE_ID != null)
                    {
                        var polyline = POLYLINES._Get_Polyline(POLYLINE_ID);

                        MARKERS[find_marker_index(polyline.stop_1_id)].marker.setIcon(new google.maps.MarkerImage('./images/target.png', null, null,
                                                                                                                  new google.maps.Point(8, 8),
                                                                                                                  new google.maps.Size(16, 16)));
                        MARKERS[find_marker_index(polyline.stop_2_id)].marker.setIcon(new google.maps.MarkerImage('./images/target.png', null, null,
                                                                                                                  new google.maps.Point(8, 8),
                                                                                                                  new google.maps.Size(16, 16)));
                    }

                    window.POLYLINE_ID = $('#route_polylines_container').find('#polyline_' + POLYLINE_ID).next('div').attr('id').replace('polyline_', '');

                    $('#polyline_' + POLYLINE_ID).click();
                }
                break;

            case 17: // Ctrl
                if(IS_EDITABLE == true)
                {
                    window.IS_EDITABLE = false;

                    if($("input[name=stop_action]:checked").val() == Markers_)
                    {
                        var marker = MARKERS[find_marker_index(STOP_ID)].marker;
                        var index = STOPS._Get_Stop_Index();

                        marker.setDraggable(false);

                        STOPS.stops[index].stop_latitude = marker.getPosition().lat();
                        STOPS.stops[index].stop_longitude = marker.getPosition().lng();

                        Update_Stop_GPS.Send({
                                                 mot_id: MOT_ID,
                                                 stop_id: STOP_ID,
                                                 stop_latitude: marker.getPosition().lat(),
                                                 stop_longitude: marker.getPosition().lng()
                                             });
                    }

                    if($("input[name=stop_action]:checked").val() == Polylines_)
                    {
                        Google_Map.setOptions({ draggable: true });

                        var polyline = POLYLINES._Get_Polyline(POLYLINE_ID);

                        polyline.polyline.setEditable(false);
                        polyline.polyline.setOptions({ strokeColor: '#444444' });
                        POLYLINE_MARKER_START.setVisible(false);
                        POLYLINE_MARKER_END.setVisible(false);
                        VERTEX_HIGHTLIGHT.setVisible(false);
                        Google_Map.setOptions({ draggableCursor : "url('https://maps.gstatic.com/mapfiles/openhand_8_8.cur') 8 8, default" });

                        if(polyline.polyline.getPath().length > 0)
                        {
                            var polyline_array = "[";
                            var polyline_before = polyline.polyline.getPath();
                            var distance = 0;

                            for(var i = 0; i < polyline_before.length; i++)
                            {
                                polyline_array += "{\"latitude\":" + polyline_before.getAt(i).lat() + ",\"longitude\":" + polyline_before.getAt(i).lng() + "}";

                                if(i != (polyline_before.length - 1))
                                {
                                    polyline_array += ",";
                                    distance += get_distance(polyline_before.getAt(i), polyline_before.getAt(i + 1));
                                }
                                else polyline_array += "]";
                            }

                            Save_Polyline.Send({
                                                   mot_id: MOT_ID,
                                                   stop_1_id: polyline.stop_1_id,
                                                   stop_2_id: polyline.stop_2_id,
                                                   polyline: polyline_array,
                                                   distance: distance
                                               });
                        }
                    }
                }
                break;

            case 90: // z
                if($("input[name=stop_action]:checked").val() == Polylines_ && VERTEX != null && IS_EDITABLE == true)
                {
                    var polyline = POLYLINES._Get_Polyline(POLYLINE_ID);

                    polyline.polyline.getPath().removeAt(VERTEX);

                    window.VERTEX = null;
                    VERTEX_HIGHTLIGHT.setVisible(false);
                }
                break;

            default: return;
        }
    });

    $(document).keydown(function(event)
    {
        if(event.which == 17) // Ctrl
        {
            if(IS_EDITABLE == false)
            {
                if($("input[name=stop_action]:checked").val() == Markers_)
                {
                    window.IS_EDITABLE = true;

                    MARKERS[find_marker_index(STOP_ID)].marker.setDraggable(true);
                }

                if($("input[name=stop_action]:checked").val() == Polylines_)
                {
                    var polyline = POLYLINES._Get_Polyline(POLYLINE_ID);

                    if(polyline.is_reversed == true)
                    {
                        $.get("message_box.html", function(external_html)
                        {
                            $('body').append(external_html);

                            $('#message_box').html("<div class='confirm_delete_header'>Reversed Polylines can't be Edited.</div>");
                            $('#ok_button').bind('click', function(){ $('#message_box_container').fadeOut('fast').remove(); });

                            center_dialog('#message_box_container');

                            $('#message_box_container').bind('keyup', function(event)
                            {
                                if(event.keyCode == 13) $('#ok_button').click(); // 13 == Enter
                                if(event.keyCode == 27) $('#ok_button').click();  // 27 == Escape
                            });

                            $('#message_box_container').fadeIn('slow');
                        });
                    }
                    else
                    {
                        Google_Map.setOptions({ draggable: false });

                        window.IS_EDITABLE = true;

                        polyline.polyline.setEditable(true);
                        polyline.polyline.setOptions({strokeColor: '#0000FF'});

                        Google_Map.setOptions({draggableCursor: "url('./images/polyline_cursor_plus.png'), default"});

                        var index = POLYLINES._Get_Polyline_Index();

                        if(index >= 0)
                        {
                            if(polyline.polyline.getPath().length == 0)
                            {
                                if(POLYLINES.polylines[index - 1].polyline.getPath().getAt(POLYLINES.polylines[index - 1].polyline.getPath().length - 1) != undefined)
                                {
                                    POLYLINE_MARKER_START.setPosition(POLYLINES.polylines[index - 1].polyline.getPath().getAt(POLYLINES.polylines[index - 1].polyline.getPath().length - 1));
                                    polyline._Add_GPS_Position(POLYLINE_MARKER_START.getPosition());
                                    POLYLINE_MARKER_START.setVisible(true);

                                    google.maps.event.addListener(polyline.polyline, 'click', function(event)
                                    {
                                        if(event.vertex != undefined)
                                        {
                                            console.log("events: polyline click has run.");

                                            var polyline = POLYLINES._Get_Polyline(POLYLINE_ID);
                                            window.VERTEX = event.vertex;


                                            VERTEX_HIGHTLIGHT.setPosition(polyline.polyline.getPath().getAt(VERTEX));
                                            VERTEX_HIGHTLIGHT.setVisible(true);
                                        }
                                    });
                                }
                            }
                        }

                        if(index < (POLYLINES.polylines.length - 1) && index >= 0)
                        {
                            if(POLYLINES.polylines[index + 1].polyline.getPath().getAt(0) != undefined)
                            {
                                POLYLINE_MARKER_END.setPosition(POLYLINES.polylines[index + 1].polyline.getPath().getAt(0));
                                polyline.last_gps_position = POLYLINE_MARKER_END.getPosition();
                                POLYLINE_MARKER_END.setVisible(true);
                            }
                        }
                    }
                }
            }
        }
    });

 });

