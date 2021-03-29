function update_route_option(data)
{
    if(data['success'])
    {
        kill_stops_container();

        var route_index = ROUTES._Get_Route_Index();
        var route_via = '';

        switch(MOT_ID)
        {
            case Golden_Arrow:
                route_via = $('#route_via').val().trim(); if(route_via == '') route_via = 'N/A';

                ROUTES.routes[route_index].route_description['route_origin_area_description'] = $('#route_from').val().trim();
                ROUTES.routes[route_index].route_description['route_destination_area_description'] = $('#route_to').val().trim();
                ROUTES.routes[route_index].route_description['route_via_area_description'] = route_via;
                break;

            case Metrorail:
                route_via = $('#route_via').val().trim(); if(route_via == '') route_via = 'N/A';
                var is_express = 0; if($('#route_is_express').prop('checked')) is_express = 1;

                ROUTES.routes[route_index].route_description['route_origin_area_description'] = $('#route_from').val().trim();
                ROUTES.routes[route_index].route_description['route_destination_area_description'] = $('#route_to').val().trim();
                ROUTES.routes[route_index].route_description['route_via_area_description'] = route_via;
                ROUTES.routes[route_index].route_description['is_express'] = is_express;
                break;

            case MyCiTi:
                var route_description = new Array();
                var area_waypoint_count = 1;

                while($('#area_waypoint_' + area_waypoint_count).length)
                {
                    route_description.push($('#area_waypoint_' + area_waypoint_count).val().trim());
                    area_waypoint_count++;
                }

                ROUTES.routes[route_index].route_description = route_description;
                break;
        }

        var item = ROUTES.routes[route_index]._Format_Route_Description();

        var editor_item =   "<div id='route_controls_" + ROUTES.routes[route_index].route_id + "' class='controls'>" +
                                "<div id='route_edit_" + ROUTES.routes[route_index].route_id + "' class='edit_button'></div>" +
                                "<div id='route_delete_" + ROUTES.routes[route_index].route_id + "' class='delete_button'></div>" +
                            "</div>";

        $('#route_' + ROUTES.routes[route_index].route_id).html(item + editor_item);
        $('#route_' + ROUTES.routes[route_index].route_id).css('background-color', '#C8C8C8');
        $('#route_' + ROUTES.routes[route_index].route_id).find('.adverb').css('color', '#777777');
        $('#route_' + ROUTES.routes[route_index].route_id).find('.noun').css('color', '#676767');

        $('#route_' + ROUTES.routes[route_index].route_id).bind('click', function(){ ROUTES.routes[route_index]._On_Route_Option_Click(); });
        $('#route_edit_' + ROUTES.routes[route_index].route_id).bind('click', function(){ ROUTES.routes[route_index]._On_Route_Edit_Button_Click(); });
        $('#route_delete_' + ROUTES.routes[route_index].route_id).bind('click', function(){ ROUTES.routes[route_index]._On_Route_Delete_Button_Click(); });

        $('#route_details_container').fadeOut('fast').remove();

        Get_MOT_List.completed_success();
    }
    else
    {
        Get_MOT_List.completed_fail();
        console.log("Error Message: " + data['error_message']);
    }
}

function insert_route_option(data)
{
    if(data['success'])
    {
        window.ROUTE_ID = parseInt(data['route_id']);

        ROUTES._Insert_Route();

        Get_MOT_List.completed_success();
    }
    else
    {
        Get_MOT_List.completed_fail();
        console.log("Error Message: " + data['error_message']);
    }
}

function delete_route_option(data)
{
    if(data['success'])
    {
        ROUTES._Kill_Route(ROUTE_ID);

        Get_MOT_List.completed_success();
    }
    else
    {
        Get_MOT_List.completed_fail();
        console.log("Error Message: " + data['error_message']);
    }
}

function add_waypoint_row()
{
    var waypoint_order = parseInt($('#add_waypoint_button').closest('tr').attr('id').replace('waypoint_row_', ''));

    if($('#area_waypoint_' + waypoint_order).val().trim() != '')
    {
        waypoint_order++;

        var label = "Area Waypoint " + waypoint_order;
        var minus_button = "<div id='delete_waypoint_" + waypoint_order + "' class='minus_button'></div>";
        if(waypoint_order < 3) minus_button = '';

        var add_button = $('#add_waypoint_button').detach();

        var row_html =  "<tr id='waypoint_row_" + waypoint_order + "'>" +
                            "<td>" +
                                "<label for='area_waypoint_" + waypoint_order + "' class='left_item'>" + label + ":</label>" +
                            "</td>" +
                            "<td>" +
                                minus_button +
                            "</td>" +
                            "<td>" +
                                "<input type='text' id='area_waypoint_" + waypoint_order + "' class='textbox' tabindex='" + waypoint_order + "'>" +
                            "</td>" +
                            "<td>" +
                            "</td>" +
                        "</tr>";

        $('#route_details_layout').append(row_html);

        $('#waypoint_row_' + waypoint_order + ' td:nth-child(4)').append(add_button);
        $('#delete_waypoint_' + waypoint_order).bind('click', delete_waypoint);

        center_dialog('#route_details_container');
    }
}

function delete_waypoint()
{
    var waypoint_order = parseInt($(this).attr('id').replace('delete_waypoint_', ''));
    var add_button_waypoint_order = parseInt($('#add_waypoint_button').closest('tr').attr('id').replace('waypoint_row_', ''));

    if(waypoint_order == add_button_waypoint_order)
    {
        var add_button = $('#add_waypoint_button').detach();
        $('#waypoint_row_' + parseInt(waypoint_order - 1) + ' td:nth-child(4)').append(add_button);
    }

    $('#waypoint_row_' + waypoint_order).remove();

    var not_last = 1;
    waypoint_order++;

    while(not_last)
    {
        if($('#waypoint_row_' + waypoint_order).length)
        {
            var new_waypoint_order = parseInt(waypoint_order - 1);
            var label = "Area Waypoint " + new_waypoint_order + ":";

            $('#waypoint_row_' + waypoint_order).find('label').attr('for', 'area_waypoint_' + new_waypoint_order).html(label);

            if($('#delete_waypoint_' + waypoint_order).length)
                $('#delete_waypoint_' + waypoint_order).attr("id", 'delete_waypoint_' + new_waypoint_order);

            $('#area_waypoint_' + waypoint_order).attr("id", 'area_waypoint_' + new_waypoint_order);
            $('#add_waypoint_' + waypoint_order).attr("id", 'add_waypoint_' + new_waypoint_order);
            $('#waypoint_row_' + waypoint_order).attr("id", 'waypoint_row_' + new_waypoint_order);

            waypoint_order++;
        }
        else not_last = 0;
    }

    center_dialog('#route_details_container');
}

function update_route()
{
    var route_via = '';

    switch(MOT_ID)
    {
        case Golden_Arrow:
            route_via = $('#route_via').val().trim(); if(route_via == '') route_via = 'N/A';

            Update_Golden_Arrow_Description.Send({
                                                     route_id: ROUTE_ID,
                                                     route_from: $('#route_from').val().trim(),
                                                     route_to: $('#route_to').val().trim(),
                                                     route_via: route_via
                                                 });
            break;

        case Metrorail:
            route_via = $('#route_via').val().trim(); if(route_via == '') route_via = 'N/A';
            var is_express = 0; if($('#route_is_express').is(':checked')) is_express = 1;

            Update_Metrorail_Description.Send({
                                                  route_id: ROUTE_ID,
                                                  route_from: $('#route_from').val().trim(),
                                                  route_to: $('#route_to').val().trim(),
                                                  route_via: route_via,
                                                  is_express: is_express
                                              });
            break;

        case MyCiTi:
            var route_description = new Array();
            var area_waypoint_count = 1;

            while($('#area_waypoint_' + area_waypoint_count).length)
            {
                route_description.push($('#area_waypoint_' + area_waypoint_count).val().trim());
                area_waypoint_count++;
            }

            Update_MyCiTi_Description.Send({
                                               route_id: ROUTE_ID,
                                               route_description: route_description
                                           });
            break;
    }
}

function insert_route()
{
    var route_via = '';

    switch(MOT_ID)
    {
        case Golden_Arrow:
            route_via = $('#route_via').val().trim(); if(route_via == '') route_via = 'N/A';

            Insert_Golden_Arrow_Description.Send({
                                                     route_id: ROUTE_ID,
                                                     route_from: $('#route_from').val().trim(),
                                                     route_to: $('#route_to').val().trim(),
                                                     route_via: route_via
                                                 });
            break;

        case Metrorail:
            route_via = $('#route_via').val().trim(); if(route_via == '') route_via = 'N/A';
            var is_express = 0; if($('#route_is_express').is(':checked')) is_express = 1;

            Insert_Metrorail_Description.Send({
                                                  route_id: ROUTE_ID,
                                                  route_from: $('#route_from').val().trim(),
                                                  route_to: $('#route_to').val().trim(),
                                                  route_via: route_via,
                                                  is_express: is_express
                                              });
            break;

        case MyCiTi:
            var route_description = new Array();
            var area_waypoint_count = 1;

            while($('#area_waypoint_' + area_waypoint_count).length)
            {
                route_description.push($('#area_waypoint_' + area_waypoint_count).val().trim());
                area_waypoint_count++;
            }

            Insert_MyCiTi_Description.Send({
                                               route_id: ROUTE_ID,
                                               route_description: route_description
                                           });
            break;
    }
}

function on_route_details_container_loaded(save_function)
{
    center_dialog('#route_details_container');

    $('#save_button').bind('click', save_function);
    $('#cancel_button').bind('click', function(){ $('#route_details_container').fadeOut('fast').remove(); });
    $('#route_details_container').bind('keyup', function(event)
    {
        if(event.keyCode == 13) $('#save_button').click(); // 13 == Enter
        if(event.keyCode == 27) $('#cancel_button').click(); // 27 == Escape
    });
}

function get_sort_order(route_description_1, route_description_2_length)
{
    var sort_order = new Array();

    switch(MOT_ID)
    {
        case Golden_Arrow:
            sort_order.push(route_description_1['route_origin_area_description'].toLowerCase());
            sort_order.push(route_description_1['route_destination_area_description'].toLowerCase());
            sort_order.push(route_description_1['route_via_area_description'].toLowerCase());
            break;

        case Metrorail:
            sort_order.push(route_description_1['route_origin_area_description'].toLowerCase());
            sort_order.push(route_description_1['route_destination_area_description'].toLowerCase());
            sort_order.push(route_description_1['route_via_area_description'].toLowerCase());
            sort_order.push(route_description_1['is_express']);
            break;

        case MyCiTi:
            var j = 0;

            if(route_description_1.length < route_description_2_length)
            {
                for(j = 0; j < route_description_2_length; j++)
                {
                    if(j == 0 || j == 1)
                    {
                        if(j == 0) sort_order.push(route_description_1[j].toLowerCase());
                        if(j == 1) sort_order.push(route_description_1[route_description_1.length - 1].toLowerCase());
                    }
                    else
                    {
                        if(j >= route_description_1.length) sort_order.push('');
                        else sort_order.push(route_description_1[j - 1].toLowerCase());
                    }
                }
            }

            if(route_description_1.length >= route_description_2_length)
            {
                for(j = 0; j < route_description_1.length; j++)
                {
                    if(j == 0 || j == 1)
                    {
                        if(j == 0) sort_order.push(route_description_1[j].toLowerCase());
                        if(j == 1) sort_order.push(route_description_1[route_description_1.length - 1].toLowerCase());
                    }
                    else sort_order.push(route_description_1[j - 1].toLowerCase());
                }
            }
            break;
    }

    return sort_order;
}

function Route(route_id, route_description)
{
    this.route_id = route_id;
    this.route_description = route_description;

    this._Format_Route_Description = function()
    {
        var route_description_html = '';

        switch(MOT_ID)
        {
            case Golden_Arrow:
                route_description_html =    "<span class='noun'>" + this.route_description['route_origin_area_description'] + "</span>&nbsp;" +
                                            "<span class='adverb'>to</span>&nbsp;" +
                                            "<span class='noun'>" + this.route_description['route_destination_area_description'] + "</span>";

                if(this.route_description['route_via_area_description'] != 'N/A')
                    route_description_html +=   "&nbsp;<span class='adverb'>via</span>&nbsp;<span class='noun'>" +
                                                this.route_description['route_via_area_description'] + "</span>";
                break;

            case Metrorail:
                route_description_html =    "<span class='noun'>" + this.route_description['route_origin_area_description'] + "</span>&nbsp;" +
                                            "<span class='adverb'>to</span>&nbsp;" +
                                            "<span class='noun'>" + this.route_description['route_destination_area_description'] + "</span>";

                if(this.route_description['route_via_area_description'] != 'N/A')
                    route_description_html +=   "&nbsp;<span class='adverb'>via</span>&nbsp;<span class='noun'>" +
                                                this.route_description['route_via_area_description'] + "</span>";

                if(this.route_description["is_express"] == '1') route_description_html += "&nbsp;<span class='adverb'>(Express)</span>";
                break;

            case MyCiTi:
                for(var i = 0; i < this.route_description.length; i++)
                {
                    route_description_html += "<span class='noun'>" + this.route_description[i] + "</span>";

                    if(i != (this.route_description.length - 1)) route_description_html += "&nbsp;<span class='adverb'>-</span>&nbsp;";
                }

                break;
        }

        return route_description_html;
    };

    this._On_Route_Option_Click = function()
    {
        HIGHTLIGHT_CIRCLE.setVisible(false);

        window.ROUTE_ID = this.route_id;

        $('#mot_routes_container [style]').removeAttr("style");

        $('#route_' + this.route_id).css('background-color', '#1E90FF');
        $('#route_' + this.route_id).find('.adverb').css('color', '#FFFFFF');
        $('#route_' + this.route_id).find('.noun').css('color', '#AAEDFF');

        Get_Route_Stops.Send({ mot_id: MOT_ID, route_id: ROUTE_ID, route_direction: ROUTE_DIRECTION });
    };

    this._On_Route_Edit_Button_Click = function()
    {
        $('#route_details_container').remove();

        var self = this;

        switch(MOT_ID)
        {
            case Golden_Arrow:
                $.get("route_details_editor_1_and_2.html", function(external_html)
                {
                    $('body').append(external_html);

                    $('#route_editor_header_container').html("Golden Arrow Route Description");

                    $('#route_is_express_row').hide();

                    on_route_details_container_loaded(update_route);

                    $('#route_from').val(self.route_description['route_origin_area_description']);
                    $('#route_to').val(self.route_description['route_destination_area_description']);
                    $('#route_via').val(self.route_description['route_via_area_description']);

                    center_dialog('#route_details_container');

                    $('#route_details_container').fadeIn('slow');
                    $('#route_from').focus();
                });
                break;

            case Metrorail:
                $.get("route_details_editor_1_and_2.html", function(external_html)
                {
                    $('body').append(external_html);

                    $('#route_editor_header_container').html("Metrorail Route Description");

                    on_route_details_container_loaded(update_route);

                    $('#route_from').val(self.route_description['route_origin_area_description']);
                    $('#route_to').val(self.route_description['route_destination_area_description']);
                    $('#route_via').val(self.route_description['route_via_area_description']);

                    if(self.route_description['is_express'] == 1)
                        $('#route_is_express').prop('checked', true);
                    else
                        $('#route_is_express').prop('checked', false);

                    center_dialog('#route_details_container');

                    $('#route_details_container').fadeIn('slow');
                    $('#route_from').focus();
                });
                break;

            case MyCiTi:
                $.get("route_details_editor_3.html", function(external_html)
                {
                    $('body').append(external_html);

                    $('#route_editor_header_container').html("MyCiTi Route Description");

                    on_route_details_container_loaded(update_route);

                    for(var i = 0; i < self.route_description.length; i++)
                    {
                        var waypoint_order = i + 1;
                        var col_spacer = ''; if(i == 0) col_spacer = " style='padding-right: 25px'";
                        var label = "Area Waypoint " + waypoint_order;

                        var add_button = "<div id='add_waypoint_button' class='add_button'></div>";
                        if(i != (self.route_description.length - 1)) add_button = '';

                        var minus_button = "<div id='delete_waypoint_" + waypoint_order + "' class='minus_button'></div>";
                        if(i < 2) minus_button = '';

                        var row_html =  "<tr id='waypoint_row_" + waypoint_order + "'>" +
                                            "<td" + col_spacer + ">" +
                                                "<label for='area_waypoint_" + waypoint_order + "' class='left_item'>" + label + ":</label>" +
                                            "</td>" +
                                            "<td>" +
                                                minus_button +
                                            "</td>" +
                                            "<td>" +
                                                "<input type='text' id='area_waypoint_" + waypoint_order + "' class='textbox' tabindex='" + waypoint_order + "'>" +
                                            "</td>" +
                                            "<td>" +
                                                add_button +
                                            "</td>" +
                                        "</tr>";

                        $('#route_details_layout').append(row_html);

                        $("#area_waypoint_" + waypoint_order).val(self.route_description[i]);

                        if(add_button != '') $('#add_waypoint_button').bind('click', add_waypoint_row);
                        if(minus_button != '') $('#delete_waypoint_' + waypoint_order).bind('click', delete_waypoint);
                    }

                    center_dialog('#route_details_container');

                    $('#route_details_container').fadeIn('slow');
                    $('#area_waypoint_1').focus();
                });
                break;
        }
    };

    this._On_Route_Delete_Button_Click = function()
    {
        $('#confirm_delete_container').remove();

        var self = this;

        switch(MOT_ID)
        {
            case Golden_Arrow:
                $.get("confirm_delete.html", function(external_html)
                {
                    $('body').append(external_html);

                    $('#stop_description_row').hide();

                    $('#confirm_delete_header').html("Are you sure you want to delete that Golden Arrow Route?");

                    center_dialog('#confirm_delete_container');

                    $('#yes_button').bind('click', function(){ Delete_Golden_Arrow_Route.Send({ route_id: self.route_id }); });
                    $('#no_button').bind('click', function(){ $('#confirm_delete_container').fadeOut('fast').remove(); });
                    $('#confirm_delete_container').bind('keyup', function(event)
                    {
                        if(event.keyCode == 13) $('#yes_button').click(); // 13 == Enter
                        if(event.keyCode == 27) $('#no_button').click();  // 27 == Escape
                    });

                    $('#confirm_delete_container').fadeIn('slow');
                });
                break;

            case Metrorail:
                $.get("confirm_delete.html", function(external_html)
                {
                    $('body').append(external_html);

                    $('#stop_description_row').hide();

                    $('#confirm_delete_header').html("Are you sure you want to delete that Metrorail Route?");

                    center_dialog('#confirm_delete_container');

                    $('#yes_button').bind('click', function(){ Delete_Metrorail_Route.Send({ route_id: self.route_id }); });
                    $('#no_button').bind('click', function(){ $('#confirm_delete_container').fadeOut('fast').remove(); });
                    $('#confirm_delete_container').keypress(function(event){ if(event.keyCode == 13) $('#yes_button').click(); }); // 13 == Enter
                    $('#confirm_delete_container').keypress(function(event){ if(event.keyCode == 27) $('#no_button').click(); }); // 27 == Escape

                    $('#confirm_delete_container').fadeIn('slow');
                });
                break;

            case MyCiTi:
                $.get("confirm_delete.html", function(external_html)
                {
                    $('body').append(external_html);

                    $('#stop_description_row').hide();

                    $('#confirm_delete_header').html("Are you sure you want to delete that MyCiTi Route?");

                    center_dialog('#confirm_delete_container');

                    $('#yes_button').bind('click', function(){ Delete_MyCiTi_Route.Send({ route_id: self.route_id }); });
                    $('#no_button').bind('click', function(){ $('#confirm_delete_container').fadeOut('fast').remove(); });
                    $('#confirm_delete_container').keypress(function(event){ if(event.keyCode == 13) $('#yes_button').click(); }); // 13 == Enter
                    $('#confirm_delete_container').keypress(function(event){ if(event.keyCode == 27) $('#no_button').click(); }); // 27 == Escape

                    $('#confirm_delete_container').fadeIn('slow');
                });
                break;
        }
    }
}

function Routes()
{
    this.html_parent = '#mot_routes_container';
    this.routes = new Array();

    this._Get_Route_Index = function()
    {
        var not_found = true;
        var route = null;
        var index = -1;

        for(var i = 0; i < this.routes.length && not_found; i++)
        {
            if(this.routes[i].route_id == ROUTE_ID)
            {
                index = i;
                route = this.routes[i];
                not_found = false;
            }
        }

        return parseInt(index);
    };

    this._Populate_Routes = function(route)
    {
        this.routes.push(route);

        var editor_item =   "<div id='route_controls_" + route.route_id + "' class='controls'>" +
                                "<div id='route_edit_" + route.route_id + "' class='edit_button'></div>" +
                                "<div id='route_delete_" + route.route_id + "' class='delete_button'></div>" +
                            "</div>";

        var item =  "<div id='route_" + route.route_id + "' class='option_container'>" + route._Format_Route_Description() + editor_item + "</div>";

        $(this.html_parent).append(item);

        $('#route_' + route.route_id).bind('click', function(){ route._On_Route_Option_Click(); });
        $('#route_edit_' + route.route_id).bind('click', function(){ route._On_Route_Edit_Button_Click(); });
        $('#route_delete_' + route.route_id).bind('click', function(){ route._On_Route_Delete_Button_Click(); });
    };

    this._Insert_Route = function()
    {
        kill_stops_container();

        var route_via = '';
        var route_index = -1;

        switch(MOT_ID)
        {
            case Golden_Arrow:
                route_via = $('#route_via').val().trim(); if(route_via == '') route_via = 'N/A';

                this.routes.push(new Route(ROUTE_ID,    {
                                                            route_origin_area_description: $('#route_from').val().trim(),
                                                            route_destination_area_description: $('#route_to').val().trim(),
                                                            route_via_area_description: route_via
                                                        }));
                break;

            case Metrorail:
                route_via = $('#route_via').val().trim(); if(route_via == '') route_via = 'N/A';
                var is_express = 0; if($('#route_is_express').prop('checked')) is_express = 1;

                this.routes.push(new Route(ROUTE_ID,    {
                                                            route_origin_area_description: $('#route_from').val().trim(),
                                                            route_destination_area_description: $('#route_to').val().trim(),
                                                            route_via_area_description: route_via,
                                                            is_express: is_express
                                                        }));
                break;

            case MyCiTi:
                var route_description = new Array();
                var area_waypoint_count = 1;

                while($('#area_waypoint_' + area_waypoint_count).length)
                {
                    route_description.push($('#area_waypoint_' + area_waypoint_count).val().trim());
                    area_waypoint_count++;
                }

                this.routes.push(new Route(ROUTE_ID, route_description));
                break;
        }

        route_index = this._Get_Route_Index();

        this._Sort();

        route_index = this._Get_Route_Index();

        var editor_item =   "<div id='route_controls_" + ROUTE_ID + "' class='controls'>" +
            "<div id='route_edit_" + ROUTE_ID + "' class='edit_button'></div>" +
            "<div id='route_delete_" + ROUTE_ID + "' class='delete_button'></div>" +
            "</div>";

        var item =  "<div id='route_" + ROUTE_ID + "' class='option_container'>" + this.routes[route_index]._Format_Route_Description() + editor_item + "</div>";

        if(route_index != 0)
            $('#route_' + this.routes[route_index - 1].route_id).after(item);
        else
            $('#mot_routes_container').prepend(item);

        $('#mot_routes_container [style]').removeAttr("style");

        $('#route_' + this.routes[route_index].route_id).css('background-color', '#C8C8C8');
        $('#route_' + this.routes[route_index].route_id).find('.adverb').css('color', '#777777');
        $('#route_' + this.routes[route_index].route_id).find('.noun').css('color', '#676767');

        $('#route_' + this.routes[route_index].route_id).bind('click', function(){ ROUTES.routes[route_index]._On_Route_Option_Click(); });
        $('#route_edit_' + this.routes[route_index].route_id).bind('click', function(){ ROUTES.routes[route_index]._On_Route_Edit_Button_Click(); });
        $('#route_delete_' + this.routes[route_index].route_id).bind('click', function(){ ROUTES.routes[route_index]._On_Route_Delete_Button_Click(); });

        $('#route_details_container').fadeOut('fast').remove();
    };

    this._Sort = function()
    {
        for(var a = 0; a < this.routes.length; a++)
        {
            for(var b = 0; b < this.routes.length; b++)
            {
                var sort_order_1 = get_sort_order(this.routes[a].route_description, this.routes[b].route_description.length);
                var sort_order_2 = get_sort_order(this.routes[b].route_description, this.routes[a].route_description.length);
                var result = 666;
                var sort_on_next = true;

                for(var i = 0; i < sort_order_1.length && sort_on_next == true; i++)
                {
                    if(sort_order_1[i] > sort_order_2[i])
                    {
                        result = 1;
                        sort_on_next = false;
                    }

                    if(sort_order_1[i] < sort_order_2[i])
                    {
                        result = -1;
                        sort_on_next = false;
                    }

                    if(sort_order_1[i] == sort_order_2[i])
                    {
                        sort_on_next = true;

                        if(i == (sort_order_1.length - 1))
                        {
                            result = 0;
                            sort_on_next = false;
                        }
                    }
                }

                if(result < 0)
                {
                    var temp = this.routes[a];

                    this.routes[a] = this.routes[b];

                    this.routes[b] = temp;
                }
            }
        }
    };

    this._Kill_Route = function(route_id)
    {
        for(var i = 0; i < this.routes.length; i++)
            if(this.routes[i].route_id == route_id)
                this.routes.splice(i, 1);

        $('#route_' + route_id).remove();

        window.ROUTE_ID = null;

        $('#confirm_delete_container').fadeOut('fast').remove();

        kill_stops_container();
    };

    this._Clear = function()
    {
        $(this.html_parent).html('');
        while(this.routes.length) this.routes.pop();
        window.ROUTE_ID = null;
    };
}


