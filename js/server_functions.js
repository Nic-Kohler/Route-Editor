function Server_Call(action)
{
    var self = this;
    this.action = action;
    this.before_send = function()
    {
        $('#loader').css('background', "url('./images/loader.gif') no-repeat");
        $('#loader_container').fadeIn('slow');
    };
    this.success = function(){};
    this.completed_success = function()
    {
        $('#loader').css('background', "url('./images/success.gif') no-repeat");
        setTimeout(function(){ $('#loader_container').fadeOut('slow'); }, 2000);
    };
    this.completed_fail = function(){ $('#loader_container').fadeOut('slow'); };
    this.error = function(data, jqXHR, ajaxSettings, thrownError)
    {
        $('#loader').css('background', "url('./images/fail.gif') no-repeat");

        setTimeout(function(){ $('#loader_container').fadeOut('slow'); }, 5000);

        console.log(' ');
        console.log("Server Response - '" + self.action + "': Failed");
        console.log('[responseCode : ' + data['status'] + ' ]');
        console.log('[responseText : ' + data['responseText'] + ' ]');
        console.log('[jqXHR        : ' + jqXHR + ' ]');
        console.log('[ajaxSettings : ' + ajaxSettings + ' ]');
        console.log('[thrownError  : ' + thrownError + ' ]');
    };
}

Server_Call.prototype.Success = function(success){ this.success = success; };
Server_Call.prototype.Send = function(data)
{
    data['action'] = this.action;
    var self = this;

    $.ajax(
        {
            type: 'POST',
            url: "http://unscarredtechnology.co.za/Admin/Route_Editor/php/route_editor.php",
            dataType: 'json',
            data: JSON.stringify(data),
            beforeSend: self.before_send,
            success: self.success,
            error: self.error,
            timeout: 5000
        });
};


// ========================================================================================================== //
// ================================================= ROUTES ================================================= //
// ========================================================================================================== //

var Get_MOT_List = new Server_Call('Get_MOT_List');
Get_MOT_List.Success(function(data)
{
    if(data['success'])
    {
        var mot_list = data['mot_list'];

        for(var i = 0; i < mot_list.length; i++)
        {
            var item = "<option value=" + mot_list[i]['mot_id'] + ">" + mot_list[i]['mot_name']  + "</option>";

            $('#mot_list').append(item);
        }

        Get_MOT_List.completed_success();
    }
    else
    {
        Get_MOT_List.completed_fail();
        console.log("Error Message: " + data['error_message']);
    }
});

var Get_MOT_Routes = new Server_Call('Get_MOT_Routes');
Get_MOT_Routes.Success(function(data)
{
    if(data['success'])
    {
        ROUTES._Clear();

        var mot_routes = data['mot_routes'];

        for(var i = 0; i < mot_routes.length; i++) ROUTES._Populate_Routes(new Route(mot_routes[i]['route_id'], mot_routes[i]['route_description']));

        $("#routes_row").fadeIn('slow');
        $("#route_direction_row").fadeIn('slow');

        Get_MOT_Routes.completed_success();
    }
    else
    {
        Get_MOT_Routes.completed_fail();
        console.log("Error Message: " + data['error_message']);
    }
});

// ====================== INSERT ======================
var Insert_Golden_Arrow_Description = new Server_Call('Insert_Golden_Arrow_Description');
Insert_Golden_Arrow_Description.Success(function(data){ insert_route_option(data); });

var Insert_Metrorail_Description = new Server_Call('Insert_Metrorail_Description');
Insert_Metrorail_Description.Success(function(data){ insert_route_option(data); });

var Insert_MyCiTi_Description = new Server_Call('Insert_MyCiTi_Description');
Insert_MyCiTi_Description.Success(function(data){ insert_route_option(data); });

// ====================== UPDATE ======================
var Update_Golden_Arrow_Description = new Server_Call('Update_Golden_Arrow_Description');
Update_Golden_Arrow_Description.Success(function(data){ update_route_option(data); });

var Update_Metrorail_Description = new Server_Call('Update_Metrorail_Description');
Update_Metrorail_Description.Success(function(data){ update_route_option(data); });

var Update_MyCiTi_Description = new Server_Call('Update_MyCiTi_Description');
Update_MyCiTi_Description.Success(function(data){ update_route_option(data); });

// ====================== DELETE ======================
var Delete_Golden_Arrow_Route = new Server_Call('Delete_Golden_Arrow_Route');
Delete_Golden_Arrow_Route.Success(function(data){ delete_route_option(data); });

var Delete_Metrorail_Route = new Server_Call('Delete_Metrorail_Route');
Delete_Metrorail_Route.Success(function(data){ delete_route_option(data); });

var Delete_MyCiTi_Route = new Server_Call('Delete_MyCiTi_Route');
Delete_MyCiTi_Route.Success(function(data){ delete_route_option(data); });

var test = new Server_Call('test');
test.Success(function(data){ console.log(data['response']); test.completed_success(); });


// ========================================================================================================== //
// ================================================== STOPS ================================================= //
// ========================================================================================================== //

var Get_Route_Stops = new Server_Call('Get_Route_Stops');
Get_Route_Stops.Success(function(data)
{
    if(data['success'])
    {
        var route_stops = data['route_stops'];
        var polylines = data['polylines'];

        if(route_stops != null)
        {
            clear_markers();
            kill_stops_container();
            kill_polyline_container();
            STOPS._Clear();
            POLYLINES._Hide_Polylines();
            POLYLINES._Clear();
            HIGHTLIGHT_CIRCLE.setVisible(false);

            var bounds = new google.maps.LatLngBounds();

            for(var i = 0; i < route_stops.length; i++)
            {
                STOPS._Add_Option(new Stop(route_stops[i]));

                bounds.extend(new google.maps.LatLng(route_stops[i].stop_latitude, route_stops[i].stop_longitude));
            }

            for(var i = 0; i < polylines.length; i++)
            {
                var polyline = new Polyline(polylines[i].stop_1_id, polylines[i].stop_2_id, polylines[i].is_reversed);

                if(polylines[i].polyline != null)
                {
                    polyline.polyline.setPath(get_polyline_path(polylines[i].polyline, polyline.is_reversed));

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
                }

                POLYLINES._Add_Option(polyline);
            }

            if($("input[name=stop_action]:checked").val() == Markers_)
            {
                for(var i = 0; i < route_stops.length; i++) STOPS._Add_Marker(route_stops[i].stop_id);
                POLYLINES._Hide_Polylines();

                $("#route_polylines_row").hide();
                $("#route_stops_row").fadeIn('slow');
                $("#stop_action_row").fadeIn('slow');
            }

            if($("input[name=stop_action]:checked").val() == Polylines_)
            {
                for(var i = 0; i < route_stops.length; i++) POLYLINES._Add_Marker(route_stops[i].stop_id);
                POLYLINES._Show_Polylines();

                $("#route_stops_row").hide();
                $("#route_polylines_row").fadeIn('slow');
                $("#stop_action_row").fadeIn('slow');
            }

            $('#route_stops_container').scrollTo('#stop_' + route_stops[0].stop_id);

            Google_Map.fitBounds(bounds);
            Get_Route_Stops.completed_success();
        }
        else
        {
            $("#route_stops_row").hide();
            $("#route_polylines_row").hide();

            if($("input[name=stop_action]:checked").val() == Markers_) $("#route_stops_row").html('').fadeIn('slow');
            if($("input[name=stop_action]:checked").val() == Polylines_) $("#route_polylines_row").html('').fadeIn('slow');

            $("#stop_action_row").fadeIn('slow');
        }
    }
    else
    {
        Get_Route_Stops.completed_fail();
        clear_markers();
        STOPS._Clear();
        POLYLINES._Clear();

        $("#route_stops_row").hide();
        $("#route_polylines_row").hide();

        $("#route_stops_container").html('');
        $("#route_polylines_container").html('');

        if($("input[name=stop_action]:checked").val() == '0') $("#route_stops_row").fadeIn('slow');
        if($("input[name=stop_action]:checked").val() == '1') $("#route_polylines_row").fadeIn('slow');

        $("#stop_action_row").fadeIn('slow');

        console.log("Error Message: " + data['error_message']);
    }
});

var Import_Stops = new Server_Call('Import_Stops');
Import_Stops.Success(function(data)
{
    if(data['success'])
    {
        Import_Stops.completed_success();

        console.log(data['message']);

        Get_Route_Stops.Send({ mot_id: MOT_ID, route_id: ROUTE_ID, route_direction: ROUTE_DIRECTION });
    }
    else
    {
        Import_Stops.completed_fail();
        console.log("Error Message: " + data['error_message']);
    }
});

// ====================== INSERT ======================
var Insert_Stop = new Server_Call('Insert_Stop');
Insert_Stop.Success(function(data)
{
    if(data['success'])
    {
        window.STOP_ID = parseInt(data['stop_id']);

        STOPS._Insert_Stop();
        STOPS._Add_Marker(STOP_ID);

        Insert_Stop.completed_success();
    }
    else
    {
        Insert_Stop.completed_fail();
        console.log("Error Message: " + data['error_message']);
    }
});

// ====================== UPDATE ======================
var Update_Stop = new Server_Call('Update_Stop');
Update_Stop.Success(function(data)
{
    if(data['success'])
    {
        STOPS._Update_Stop();

        Update_Stop.completed_success();
    }
    else
    {
        Update_Stop.completed_fail();
        console.log("Error Message: " + data['error_message']);
    }
});

var Update_Stop_GPS = new Server_Call('Update_Stop_GPS');
Update_Stop_GPS.Success(function(data)
{
    if(data['success'])
    {
        Update_Stop_GPS.completed_success();
    }
    else
    {
        Update_Stop_GPS.completed_fail();
        console.log("Error Message: " + data['error_message']);
    }
});


// ====================== DELETE ======================
var Delete_Stop = new Server_Call('Delete_Stop');
Delete_Stop.Success(function(data)
{
    if(data['success'])
    {
        STOPS._Kill_Stop(STOP_ID);

        Delete_Stop.completed_success();
    }
    else
    {
        Delete_Stop.completed_fail();
        console.log("Error Message: " + data['error_message']);
    }
});

// ========================================================================================================== //
// ================================================ POLYLINES =============================================== //
// ========================================================================================================== //

var Save_Polyline = new Server_Call('Save_Polyline');
Save_Polyline.Success(function(data)
{
    if(data['success'])
    {
        Save_Polyline.completed_success();
    }
    else
    {
        Save_Polyline.completed_fail();
        console.log("Error Message: " + data['error_message']);
    }
});

var Delete_Polyline = new Server_Call('Delete_Polyline');
Delete_Polyline.Success(function(data)
{
    if(data['success'])
    {
        var polyline = POLYLINES._Get_Polyline(POLYLINE_ID);

        polyline.last_gps_position = null;
        polyline.polyline.getPath().clear();

        VERTEX_HIGHTLIGHT.setVisible(false);

        $('#confirm_delete_container').fadeOut('fast').remove();
        Delete_Polyline.completed_success();
    }
    else
    {
        Delete_Polyline.completed_fail();
        console.log("Error Message: " + data['error_message']);
    }
});


