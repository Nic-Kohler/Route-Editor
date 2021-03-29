function insert_stop()
{
    Insert_Stop.Send({
                         route_id: ROUTE_ID,
                         route_direction: ROUTE_DIRECTION,
                         stop_name: $('#stop_name').val().trim(),
                         stop_latitude: $('#stop_latitude').val().trim(),
                         stop_longitude: $('#stop_longitude').val().trim(),
                         stop_order: $('#stop_order').val().trim()
                     });
}

function update_stop()
{
    Update_Stop.Send({
                         mot_id: MOT_ID,
                         route_id: ROUTE_ID,
                         route_direction: ROUTE_DIRECTION,
                         stop_id: STOP_ID,
                         stop_name: $('#stop_name').val().trim(),
                         stop_latitude: $('#stop_latitude').val().trim(),
                         stop_longitude: $('#stop_longitude').val().trim(),
                         stop_order: $('#stop_order').val().trim()
                     });
}

function on_stop_details_container_loaded(save_function)
{
    if(NEW_LATITUDE != null && NEW_LONGITUDE != null)
    {
        var next_stop_order = parseInt(STOPS.stops[STOPS.stops.length - 1].stop_order) + 1;

        $('#stop_latitude').val(NEW_LATITUDE);
        $('#stop_longitude').val(NEW_LONGITUDE);
        $('#stop_order').val(next_stop_order);

        window.NEW_LATITUDE = null;
        window.NEW_LONGITUDE = null;
    }

    center_dialog('#stop_details_container');

    $('#save_button').bind('click', save_function);
    $('#cancel_button').bind('click', function()
    {
        window.NEW_LATITUDE = null;
        window.NEW_LONGITUDE = null;

        $('#stop_details_container').fadeOut('fast').remove();
    });
    $('#import_button').bind('click', function()
    {
        $('#stop_details_container').fadeOut('fast').remove();
        $('#csv').click();
    });
    $('#stop_details_container').bind('keyup', function(event)
    {
        if(event.keyCode == 13) $('#save_button').click(); // 13 == Enter
        if(event.keyCode == 27) $('#cancel_button').click(); // 27 == Escape
    });
}

function Stop(stop_details)
{
    this.stop_id = stop_details['stop_id'];
    this.stop_name = stop_details['stop_name'];
    this.stop_latitude = stop_details['stop_latitude'];
    this.stop_longitude = stop_details['stop_longitude'];
    this.stop_order = stop_details['stop_order'];

    this._Format_Stop_Description = function()
    {
        return "<span class='adverb_no_italic'>" + this.stop_order + ".</span>&nbsp;<span class='noun'>" + this.stop_name + "</span>";
    };

    this._On_Stop_Option_Click = function()
    {
        HIGHTLIGHT_CIRCLE.setVisible(true);

        $('#route_stops_container [style]').removeAttr("style");

        $('#stop_' + this.stop_id).css('background-color', '#1E90FF');
        $('#stop_' + this.stop_id).find('.adverb').css('color', '#FFFFFF');
        $('#stop_' + this.stop_id).find('.noun').css('color', '#AAEDFF');

        window.STOP_ID = this.stop_id;

        var not_found = true;
        var index = -1;

        for(var i = 0; i < MARKERS.length && not_found == true; i++)
        {
            if(MARKERS[i].stop_id == STOP_ID)
            {
                index = i;
                not_found = false;
            }
        }

        HIGHTLIGHT_CIRCLE.setPosition(MARKERS[index].marker.getPosition());
        if($("#auto_pan").is(':checked'))  Google_Map.panTo(MARKERS[index].marker.getPosition());
        if($("#auto_zoom").is(':checked')) Google_Map.setZoom(24);
    };

    this._On_Stop_Edit_Button_Click = function()
    {
        $('#stop_details_container').remove();

        var self = this;

        $.get("stop_details_editor.html", function(external_html)
        {
            $('body').append(external_html);

            $('#import_button').hide();

            switch(MOT_ID)
            {
                case Golden_Arrow:  $('#stop_editor_header_container').html("Golden Arrow Stop Description");   break;
                case Metrorail:     $('#stop_editor_header_container').html("Metrorail Station Description");   break;
                case MyCiTi:        $('#stop_editor_header_container').html("MyCiTi Stop Description");         break;
            }

            on_stop_details_container_loaded(update_stop);

            $('#stop_name').val(self.stop_name);
            $('#stop_latitude').val(self.stop_latitude);
            $('#stop_longitude').val(self.stop_longitude);
            $('#stop_order').val(self.stop_order);

            center_dialog('#stop_details_container');

            $('#stop_details_container').fadeIn('slow');
            $('#stop_name').focus();
        });
    };

    this._On_Stop_Delete_Button_Click = function()
    {
        $('#confirm_delete_container').remove();

        var self = this;

        $.get("confirm_delete.html", function(external_html)
        {
            $('body').append(external_html);

            $('#stop_description_row').hide();

            switch(MOT_ID)
            {
                case Golden_Arrow:  $('#confirm_delete_header').html("Are you sure you want to delete that Golden Arrow Stop?");    break;
                case Metrorail:     $('#confirm_delete_header').html("Are you sure you want to delete that Metrorail Station?");    break;
                case MyCiTi:        $('#confirm_delete_header').html("Are you sure you want to delete that MyCiTi Stop?");          break;
            }

            $('#yes_button').bind('click', function(){ Delete_Stop.Send({
                                                                            mot_id: MOT_ID,
                                                                            route_id: ROUTE_ID,
                                                                            route_direction: ROUTE_DIRECTION,
                                                                            stop_id: self.stop_id
                                                                        }); });

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

function Stops()
{
    this.html_parent = '#route_stops_container';
    this.stops = new Array();

    this._Get_Stop_Index = function()
    {
        var not_found = true;
        var stop = null;
        var index = -1;

        for(var i = 0; i < this.stops.length && not_found; i++)
        {
            if(this.stops[i].stop_id == STOP_ID)
            {
                index = i;
                stop = this.stops[i];
                not_found = false;
            }
        }

        return parseInt(index);
    };

    this._Get_Stop = function(stop_id)
    {
        var not_found = true;
        var stop = null;

        for(var i = 0; i < this.stops.length && not_found; i++)
        {
            if(this.stops[i].stop_id == stop_id)
            {
                stop = this.stops[i];
                not_found = false;
            }
        }

        return stop;
    };

    this._Add_Option = function(stop)
    {
        this.stops.push(stop);

        var editor_item =   "<div id='stop_controls_" + stop.stop_id + "' class='controls'>" +
                                "<div id='stop_edit_" + stop.stop_id + "' class='edit_button'></div>" +
                                "<div id='stop_delete_" + stop.stop_id + "' class='delete_button'></div>" +
                            "</div>";

        var item =  "<div id='stop_" + stop.stop_id + "' class='option_container'>" + stop._Format_Stop_Description() + editor_item + "</div>";

        $(this.html_parent).append(item);

        $('#stop_' + stop.stop_id).bind('click', function(){ stop._On_Stop_Option_Click(); });
        $('#stop_edit_' + stop.stop_id).bind('click', function(){ stop._On_Stop_Edit_Button_Click(); });
        $('#stop_delete_' + stop.stop_id).bind('click', function(){ stop._On_Stop_Delete_Button_Click(); });
    };

    this._Add_Marker = function(stop_id)
    {
        var stop = this._Get_Stop(stop_id);
        var mot_image = null;

        switch(MOT_ID)
        {
            case Golden_Arrow: mot_image = './images/golden_arrow.png'; break;
            case Metrorail:    mot_image = './images/metrorail.png';    break;
            case MyCiTi:       mot_image = './images/myciti.png';       break;
        }

        add_marker(stop.stop_id, new google.maps.Marker({
                                                            position: new google.maps.LatLng(stop.stop_latitude, stop.stop_longitude),
                                                            map: Google_Map,
                                                            zIndex: 10,
                                                            icon: new google.maps.MarkerImage(mot_image, null, null,
                                                                                              new google.maps.Point(16, 16),
                                                                                              new google.maps.Size(32, 32))
                                                        }));

        var marker = get_marker_by_stop_id(stop.stop_id);

        google.maps.event.addListener(marker, 'mousedown', function(){ if(IS_EDITABLE == true) HIGHTLIGHT_CIRCLE.setVisible(false); });

        google.maps.event.addListener(marker, 'mouseup', function()
        {
            HIGHTLIGHT_CIRCLE.setPosition(marker.getPosition());
            HIGHTLIGHT_CIRCLE.setVisible(true);
            HIGHTLIGHT_CIRCLE.setZIndex(-3);

            marker.setZIndex(10);

            window.STOP_ID = stop.stop_id;

            $("#route_stops_container").scrollTo('#stop_' + STOP_ID);

            $('#route_stops_container [style]').removeAttr("style");

            $('#route_stops_container').css('border', '1px solid #C8C8C8');
            $('#stop_' + STOP_ID).css('background-color', '#C8C8C8');
            $('#stop_' + STOP_ID).find('.adverb').css('color', '#777777');
            $('#stop_' + STOP_ID).find('.noun').css('color', '#676767');

        });
    };

    this._Insert_Stop = function()
    {
        var stop_index = -1;
        var stop_order = parseInt($('#stop_order').val().trim());

        this.stops.push(new Stop({
                                     stop_id: STOP_ID,
                                     stop_name: $('#stop_name').val().trim(),
                                     stop_latitude: $('#stop_latitude').val().trim(),
                                     stop_longitude: $('#stop_longitude').val().trim(),
                                     stop_order: stop_order
                                 }));

        for(var i = 0; i < this.stops.length; i++) if(this.stops[i].stop_order >= stop_order && this.stops[i].stop_id != STOP_ID) this.stops[i].stop_order++;

        this.stops.sort(function(a, b){ return a.stop_order - b.stop_order });

        for(var i = 0; i < this.stops.length; i++) $('#stop_' + this.stops[i].stop_id).children("span:first").html(this.stops[i].stop_order + ".");

        stop_index = this._Get_Stop_Index();

        var editor_item =   "<div id='stop_controls_" + STOP_ID + "' class='controls'>" +
                                "<div id='stop_edit_" + STOP_ID + "' class='edit_button'></div>" +
                                "<div id='stop_delete_" + STOP_ID + "' class='delete_button'></div>" +
                            "</div>";

        var item =  "<div id='stop_" + STOP_ID + "' class='option_container'>" + this.stops[stop_index]._Format_Stop_Description() + editor_item + "</div>";

        if(stop_index != 0)
            $('#stop_' + this.stops[stop_index - 1].stop_id).after(item);
        else
            $(this.html_parent).prepend(item);

        $(this.html_parent + ' [style]').removeAttr("style");

        $('#stop_' + this.stops[stop_index].stop_id).css('background-color', '#C8C8C8');
        $('#stop_' + this.stops[stop_index].stop_id).find('.adverb').css('color', '#777777');
        $('#stop_' + this.stops[stop_index].stop_id).find('.noun').css('color', '#676767');

        $('#stop_' + this.stops[stop_index].stop_id).bind('click', function(){ STOPS.stops[stop_index]._On_Stop_Option_Click(); });
        $('#stop_edit_' + this.stops[stop_index].stop_id).bind('click', function(){ STOPS.stops[stop_index]._On_Stop_Edit_Button_Click(); });
        $('#stop_delete_' + this.stops[stop_index].stop_id).bind('click', function(){ STOPS.stops[stop_index]._On_Stop_Delete_Button_Click(); });

        $(this.html_parent).scrollTo('#stop_' + STOP_ID);
        $('#stop_details_container').fadeOut('fast').remove();
    };

    this._Update_Stop = function()
    {
        var new_stop_order = parseInt($('#stop_order').val().trim());
        var new_stop_index = -1;
        for(var i = 0; i < this.stops.length; i++) if(this.stops[i].stop_order == new_stop_order) new_stop_index = i;

        var old_stop_index = -1;
        for(var i = 0; i < this.stops.length; i++) if(this.stops[i].stop_id == STOP_ID) old_stop_index = i;
        var old_stop_order = this.stops[old_stop_index].stop_order;

        if(new_stop_order != old_stop_order)
        {
            if(new_stop_order < old_stop_order)
            {
                for(var i = 0; i < this.stops.length; i++)
                    if(new_stop_order <= parseInt(this.stops[i].stop_order) &&
                        old_stop_order > parseInt(this.stops[i].stop_order) &&
                        this.stops[i].stop_id != STOP_ID) this.stops[i].stop_order++;

                for(var i = 0; i < this.stops.length; i++) if(this.stops[i].stop_id == STOP_ID) this.stops[i].stop_order = parseInt(new_stop_order);

                if(new_stop_index != 0)
                    $('#stop_' + this.stops[new_stop_index - 1].stop_id).after($('#stop_' + STOP_ID).detach());
                else
                    $(this.html_parent).prepend($('#stop_' + STOP_ID).detach());
            }

            if(new_stop_order > old_stop_order)
            {
                for(var i = 0; i < this.stops.length; i++)
                    if(old_stop_order < parseInt(this.stops[i].stop_order) &&
                        new_stop_order >= parseInt(this.stops[i].stop_order) &&
                        this.stops[i].stop_id != STOP_ID) this.stops[i].stop_order--;

                for(var i = 0; i < this.stops.length; i++) if(this.stops[i].stop_id == STOP_ID) this.stops[i].stop_order = parseInt(new_stop_order);

                if(new_stop_index != 0)
                    $('#stop_' + this.stops[new_stop_index].stop_id).after($('#stop_' + STOP_ID).detach());
                else
                    $(this.html_parent).prepend($('#stop_' + STOP_ID).detach());
            }
        }

        var stop_index = this._Get_Stop_Index();

        STOPS.stops[stop_index].stop_name = $('#stop_name').val().trim();
        STOPS.stops[stop_index].stop_latitude = parseFloat($('#stop_latitude').val().trim());
        STOPS.stops[stop_index].stop_longitude = parseFloat($('#stop_longitude').val().trim());

        for(var i = 0; i < this.stops.length; i++)
        {
            $('#stop_' + this.stops[i].stop_id).children("span:eq(0)").html(this.stops[i].stop_order + ".");
            $('#stop_' + this.stops[i].stop_id).children("span:eq(1)").html(this.stops[i].stop_name);
        }

        $(this.html_parent + ' [style]').removeAttr("style");

        $('#stop_' + this.stops[stop_index].stop_id).css('background-color', '#C8C8C8');
        $('#stop_' + this.stops[stop_index].stop_id).find('.adverb').css('color', '#777777');
        $('#stop_' + this.stops[stop_index].stop_id).find('.noun').css('color', '#676767');

        $('#stop_' + this.stops[stop_index].stop_id).bind('click', function(){ STOPS.stops[stop_index]._On_Stop_Option_Click(); });
        $('#stop_edit_' + this.stops[stop_index].stop_id).bind('click', function(){ STOPS.stops[stop_index]._On_Stop_Edit_Button_Click(); });
        $('#stop_delete_' + this.stops[stop_index].stop_id).bind('click', function(){ STOPS.stops[stop_index]._On_Stop_Delete_Button_Click(); });

        $(this.html_parent).scrollTo('#stop_' + STOP_ID);
        $('#stop_details_container').fadeOut('fast').remove();
    };

    this._Kill_Stop = function(stop_id)
    {
        for(var i = 0; i < this.stops.length; i++) if(this.stops[i].stop_id == stop_id) this.stops.splice(i, 1);

        $('#stop_' + stop_id).remove();

        this.stops.sort(function(a, b){ return a.stop_order - b.stop_order });

        for(var i = 0; i < this.stops.length; i++)
        {
            this.stops[i].stop_order = i + 1;
            $('#stop_' + this.stops[i].stop_id).children("span:first").html(this.stops[i].stop_order + ".");
        }

        var marker_index = find_marker_index(stop_id);

        MARKERS[marker_index].marker.setMap(null);
        MARKERS.splice(marker_index, 1);

        window.STOP_ID = null;
        HIGHTLIGHT_CIRCLE.setVisible(false);

        $('#confirm_delete_container').fadeOut('fast').remove();
    };

    this._Clear = function()
    {
        $(this.html_parent).html('');
        while(this.stops.length) this.stops.pop();
        window.STOP_ID = null;
    };
}


