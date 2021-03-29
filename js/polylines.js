function Polyline(stop_1_id, stop_2_id, is_reversed)
{
    this.stop_1_id = stop_1_id;
    this.stop_2_id = stop_2_id;
    this.is_reversed = is_reversed;
    this.last_gps_position = null;
    this.polyline = new google.maps.Polyline({
                                                 strokeColor: '#444444',
                                                 strokeOpacity: 0.7,
                                                 strokeWeight: 10,
                                                 clickable: true
                                             });

    this._Add_GPS_Position = function(gps_position)
    {
        var path = this.polyline.getPath();
        path.push(gps_position);
    };

    this._Format_Polyline_Description = function()
    {
        var stop_1 = STOPS._Get_Stop(this.stop_1_id);
        var stop_2 = STOPS._Get_Stop(this.stop_2_id);

        return  "<span class='adverb_no_italic'>" +
                    stop_1.stop_order + "." +
                "</span>" +
                "<span class='noun_with_width'>" +
                    stop_1.stop_name +
                "</span>" +
                "<span class='adverb_italic'>" +
                    "&nbsp;to&nbsp;" +
                "</span>" +
                "<span class='noun_with_width'>" +
                    stop_2.stop_name +
                "</span>";
    };

    this._On_Polyline_Option_Click = function()
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

        window.POLYLINE_ID = this.stop_1_id;

        $('#route_polylines_container [style]').removeAttr("style");

        $('#polyline_' + POLYLINE_ID).css('background-color', '#1E90FF');
        $('#polyline_' + POLYLINE_ID).find('.adverb').css('color', '#FFFFFF');
        $('#polyline_' + POLYLINE_ID).find('.noun').css('color', '#AAEDFF');

        var marker_1 = get_marker_by_stop_id(this.stop_1_id);
        var marker_2 = get_marker_by_stop_id(this.stop_2_id);

        marker_1.setIcon(new google.maps.MarkerImage('./images/target_1.png', null, null,
                                                     new google.maps.Point(12, 12),
                                                     new google.maps.Size(24, 24)));
        marker_2.setIcon(new google.maps.MarkerImage('./images/target_2.png', null, null,
                                                     new google.maps.Point(12, 12),
                                                     new google.maps.Size(24, 24)));

        if($("#auto_pan").is(':checked')) Google_Map.panTo(marker_1.getPosition());

        if($("#auto_zoom").is(':checked'))
        {
            var bounds = new google.maps.LatLngBounds();

            bounds.extend(marker_1.getPosition());
            bounds.extend(marker_2.getPosition());

            Google_Map.fitBounds(bounds);
        }
    };

    this._On_Polyline_Reversed_Button_Click = function()
    {
        $('#confirm_delete_container').remove();

        var self = this;

        $.get("confirm_delete.html", function(external_html)
        {
            $('body').append(external_html);

            $('#confirm_delete_header').html("Are you sure you want to remove that reversed Polyline Segment?");
            $('#yes_button').bind('click', function()
            {
                self.last_gps_position = null;
                self.polyline.getPath().clear();
                self.is_reversed = false;

                $('#polyline_reversed_' + self.stop_1_id).remove();

                VERTEX_HIGHTLIGHT.setVisible(false);

                $('#confirm_delete_container').fadeOut('fast').remove();
            });

            center_dialog('#confirm_delete_container');

            $('#no_button').bind('click', function(){ $('#confirm_delete_container').fadeOut('fast').remove(); });
            $('#confirm_delete_container').bind('keyup', function(event)
            {
                if(event.keyCode == 13) $('#yes_button').click(); // 13 == Enter
                if(event.keyCode == 27) $('#no_button').click();  // 27 == Escape
            });

            $('#confirm_delete_container').fadeIn('slow');
        });
    };

    this._On_Polyline_Delete_Button_Click = function()
    {
        $('#confirm_delete_container').remove();
        $('#message_box__container').remove();

        if(this.is_reversed == true)
        {
            $.get("message_box.html", function(external_html)
            {
                $('body').append(external_html);

                $('#message_box').html("<div class='confirm_delete_header'>Reversed Polylines can't be Deleted.</div>");
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
            var self = this;

            $.get("confirm_delete.html", function(external_html)
            {
                $('body').append(external_html);

                $('#confirm_delete_header').html("Are you sure you want to delete that Polyline Segment?");
                $('#yes_button').bind('click', function()
                {
                    Delete_Polyline.Send({
                                             mot_id: MOT_ID,
                                             stop_1_id: self.stop_1_id,
                                             stop_2_id: self.stop_2_id
                                         });
                });

                center_dialog('#confirm_delete_container');

                $('#no_button').bind('click', function(){ $('#confirm_delete_container').fadeOut('fast').remove(); });
                $('#confirm_delete_container').bind('keyup', function(event)
                {
                    if(event.keyCode == 13) $('#yes_button').click(); // 13 == Enter
                    if(event.keyCode == 27) $('#no_button').click();  // 27 == Escape
                });

                $('#confirm_delete_container').fadeIn('slow');
            });
        }
    }
}

function Polylines()
{
    this.html_parent = '#route_polylines_container';
    this.polylines = new Array();

    this._Show_Polylines = function(){ for(var i = 0; i < this.polylines.length; i++) this.polylines[i].polyline.setMap(Google_Map); };
    this._Hide_Polylines = function(){ for(var i = 0; i < this.polylines.length; i++) this.polylines[i].polyline.setMap(null); };

    this._Get_Polyline_Index = function()
    {
        var not_found = true;
        var stop = null;
        var index = -1;

        for(var i = 0; i < this.polylines.length && not_found; i++)
        {
            if(this.polylines[i].stop_1_id == POLYLINE_ID)
            {
                index = i;
                stop = this.polylines[i];
                not_found = false;
            }
        }

        return parseInt(index);
    };

    this._Get_Polyline = function(stop_1_id)
    {
        var not_found = true;
        var polyline = null;

        for(var i = 0; i < this.polylines.length && not_found; i++)
        {
            if(this.polylines[i].stop_1_id == stop_1_id)
            {
                polyline = this.polylines[i];
                not_found = false;
            }
        }

        return polyline;
    };

    this._Add_Option = function(polyline)
    {
        this.polylines.push(polyline);

        var reversed_polyline_button = '';
        if(polyline.is_reversed == true) reversed_polyline_button = "<div id='polyline_reversed_" + polyline.stop_1_id + "' class='reversed_button'></div>";

        var editor_item =   "<div id='polyline_controls_" + polyline.stop_1_id + "' class='controls'>" +
                                reversed_polyline_button +
                                "<div id='polyline_delete_" + polyline.stop_1_id + "' class='delete_button'></div>" +
                            "</div>";

        var item =  "<div id='polyline_" + polyline.stop_1_id + "' class='option_container'>" + polyline._Format_Polyline_Description() + editor_item + "</div>";

        $(this.html_parent).append(item);

        $('#polyline_' + polyline.stop_1_id).bind('click', function(){ polyline._On_Polyline_Option_Click(); });
        if(polyline.is_reversed == true) $('#polyline_reversed_' + polyline.stop_1_id).bind('click', function(){ polyline._On_Polyline_Reversed_Button_Click(); });
        $('#polyline_delete_' + polyline.stop_1_id).bind('click', function(){ polyline._On_Polyline_Delete_Button_Click(); });
    };

    this._Add_Marker = function(stop_id)
    {
        var stop = STOPS._Get_Stop(stop_id);

        add_marker(stop.stop_id, new google.maps.Marker({
                                                              position: new google.maps.LatLng(stop.stop_latitude, stop.stop_longitude),
                                                              map: Google_Map,
                                                              zIndex: 10,
                                                              clickable: false,
                                                              icon: new google.maps.MarkerImage('./images/target.png', null, null,
                                                                                                new google.maps.Point(8, 8),
                                                                                                new google.maps.Size(16, 16))
                                                          }));
    };

    this._Clear = function()
    {
        $(this.html_parent).html('');
        for(var i = 0; i < this.polylines.length; i++) this.polylines[i].polyline.getPath().clear();
        this.polylines.clear();
        window.POLYLINE_ID = null;
    };
}


