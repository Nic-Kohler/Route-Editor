Array.prototype.clear = function(){ while(this.length) this.pop(); };
function isFloat(n){ return n===Number(n)  && n%1!==0 }
function add_marker(stop_id, marker){ MARKERS.push({ stop_id: stop_id, marker: marker}); }
function get_marker_by_stop_id(stop_id)
{
    var not_found = true;
    var index = -1;

    for(var i = 0; i < MARKERS.length || not_found == true; i++)
    {
        if(MARKERS[i].stop_id == stop_id)
        {
            index = i;
            not_found = false;
        }
    }

    return MARKERS[index].marker;
}

function clear_markers()
{
    for(var i = 0; i < MARKERS.length; i++)  MARKERS[i]["marker"].setMap(null);

    MARKERS.clear();
}

function kill_route_container()
{
    window.ROUTE_ID = null;
    window.ROUTE_DIRECTION = 0;
    $('#route_direction').val('0');
    $("#mot_routes_container").html("");
    $("#routes_row").fadeOut("fast");
    $("#route_direction_row").fadeOut('fast');
}

function kill_stops_container()
{
    clear_markers();

    window.STOP_ID = null;
    $("#route_stops_container").html("");
    $("#route_stops_row").fadeOut("fast");
    $("#stop_action_row").fadeOut("fast");

}

function kill_polyline_container()
{
    clear_markers();

    window.POLYLINE_ID = null;
    $("#route_polylines_container").html("");
    $("#route_polylines_row").fadeOut("fast");
    $("#stop_action_row").fadeOut("fast");

}

function center_dialog(div_id)
{
    $(div_id).css('width', 'auto');
    $(div_id).css('height', 'auto');

    var top = ($(window).height() / 2) - ($(div_id).height() / 2);
    var left = ($(window).width() / 2) - ($(div_id).width() / 2);

    $(div_id).css('top', top + 'px');
    $(div_id).css('left', left + 'px');
}

function get_distance(point_1, point_2)
{
    var R = 6378137;

    var dLat = (point_2.lat() - point_1.lat()) * Math.PI / 180;
    var dLng = (point_2.lng() - point_1.lng()) * Math.PI / 180;

    var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(point_1.lat() * Math.PI / 180 ) * Math.cos(point_2.lat() * Math.PI / 180 ) * Math.sin(dLng/2) * Math.sin(dLng/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;

    return Math.round(d); // Meters
}

function find_marker_index(stop_id)
{
    var not_found = true;
    var index = -1;

    for(var i = 0; i < MARKERS.length && not_found == true; i++)
    {
        if(MARKERS[i].stop_id == stop_id)
        {
            index = i;
            not_found = false;
        }
    }

    return index;
}

function get_polyline_path(encoded_polyline, is_reversed)
{
    var decoded_polyline = JSON.parse(JXG.decompress(encoded_polyline));

    var mvc_polyline = new google.maps.Polyline();
    var mvc_polyline_path = mvc_polyline.getPath();

    if(is_reversed == false)
        for(var i = 0; i < decoded_polyline.length; i++)
            mvc_polyline_path.push(new google.maps.LatLng(decoded_polyline[i]["latitude"], decoded_polyline[i]["longitude"]));
    else
        for(var i = (decoded_polyline.length - 1); i > -1; i--)
            mvc_polyline_path.push(new google.maps.LatLng(decoded_polyline[i]["latitude"], decoded_polyline[i]["longitude"]));

    return mvc_polyline_path;
}
