<?php

	function get_route($mot_id, $route_id, $route_direction)
	{
		global $DB;

		$stop_table_name = null;
		$route_direction_table_name = null;

		switch($mot_id)
		{
			case 1:
				$stop_table_name = "Golden_Arrow_Bus_Stops";
				$route_direction_table_name = "Golden_Arrow_Route_Direction_Info";
				break;

			case 2:
				$stop_table_name = "Metrorail_Train_Stations";
				$route_direction_table_name = "Metrorail_Route_Direction_Info";
				break;

			case 3:
				$stop_table_name = "MyCiti_Bus_Stops";
				$route_direction_table_name = "MyCiti_Route_Direction_Info";
				break;
		}

		$sql = "SELECT 	Route_Definitions.stop_id,
						{$stop_table_name}.stop_name,
						{$stop_table_name}.stop_latitude,
						{$stop_table_name}.stop_longitude,
						{$route_direction_table_name}.stop_order
				FROM 	Routes
					JOIN	Route_Definitions
						ON	Route_Definitions.route_id = Routes.route_id
					JOIN	{$stop_table_name}
						ON	{$stop_table_name}.stop_id = Route_Definitions.stop_id
					LEFT JOIN {$route_direction_table_name}
						ON	{$route_direction_table_name}.route_definition_id = Route_Definitions.route_definition_id
				WHERE	Route_Definitions.route_id = {$route_id} AND
						{$route_direction_table_name}.route_direction = {$route_direction}
				ORDER BY	{$route_direction_table_name}.route_direction,
							{$route_direction_table_name}.stop_order";

		return $DB->Get_Recordset($sql);
	}


	function get_route_description($route_id)
	{
		global $DB;

		$route_description_table_name = null;

		$mot_id = $DB->Get_Record("SELECT mot_id FROM Routes WHERE route_id = {$route_id}");

		switch($mot_id['mot_id'])
		{
			case 1: $route_description_table_name = "Golden_Arrow_Route_Description_Origin_and_Destination"; break;
			case 2: $route_description_table_name = "Metrorail_Route_Description_Origin_and_Destination"; break;
			case 3: $route_description_table_name = "MyCiti_Route_Description_Waypoints"; break;
		}

		if($mot_id['mot_id'] == 3)
			return $DB->Get_Recordset("SELECT * FROM {$route_description_table_name} WHERE route_id = {$route_id} ORDER BY waypoint_order");
		else
			return $DB->Get_Record("SELECT * FROM {$route_description_table_name} WHERE route_id = {$route_id}");
	}

	function get_stop_id($stop_name, $stop_table_name)
	{
		global $DB;

		$stop_id = $DB->Get_Record("SELECT stop_id FROM {$stop_table_name} WHERE stop_name = '{$stop_name}'");

		if($stop_id['stop_id']) return $stop_id['stop_id']; else return false;
	}

	function insert_stop_direction_info($route_definition_id, $route_id, $route_direction, $stop_order, $stop_direction_info_table_name)
	{
		global $DB;

		$stop_direction_info = $DB->Get_Recordset("SELECT 	Route_Definitions.route_definition_id,
															{$stop_direction_info_table_name}.stop_order
													FROM 	Route_Definitions
														LEFT JOIN {$stop_direction_info_table_name}
															ON	{$stop_direction_info_table_name}.route_definition_id = Route_Definitions.route_definition_id
													WHERE	Route_Definitions.route_id = {$route_id} AND
															{$stop_direction_info_table_name}.route_direction = {$route_direction}
													ORDER BY {$stop_direction_info_table_name}.stop_order");

		if($stop_order <= $stop_direction_info[count($stop_direction_info) - 1]['stop_order'])
		{
			for($i = 0; $i < count($stop_direction_info); $i++)
			{
				if($stop_order <= $stop_direction_info[$i]['stop_order'])
				{
					$new_stop_order = $stop_direction_info[$i]['stop_order'] + 1;

					$DB->Run_Query("UPDATE {$stop_direction_info_table_name}
									SET stop_order = {$new_stop_order}
									WHERE route_definition_id = {$stop_direction_info[$i]['route_definition_id']} AND
										  route_direction = {$route_direction}");
				}
			}
		}

		$DB->Run_Query("INSERT INTO {$stop_direction_info_table_name} (route_definition_id, route_direction, stop_order)
					    VALUES ({$route_definition_id},
					            {$route_direction},
					            {$stop_order})");
	}

	function insert_stop($route_id, $route_direction, $stop_details)
	{
		global $DB;

		$stop_table_name = null;
		$stop_direction_info_table_name = null;

		$mot_id = $DB->Get_Record("SELECT mot_id FROM Routes WHERE route_id = {$route_id}");

		switch($mot_id['mot_id'])
		{
			case 1:
				$stop_table_name = "Golden_Arrow_Bus_Stops";
				$stop_direction_info_table_name = "Golden_Arrow_Route_Direction_Info";
				break;
			case 2:
				$stop_table_name = "Metrorail_Train_Stations";
				$stop_direction_info_table_name = "Metrorail_Route_Direction_Info";
				break;
			case 3:
				$stop_table_name = "MyCiti_Bus_Stops";
				$stop_direction_info_table_name = "MyCiti_Route_Direction_Info";
				break;
		}

		$stop_id = get_stop_id($stop_details['stop_name'], $stop_table_name);

		if(!$stop_id)
		{
			$DB->Run_Query("INSERT INTO {$stop_table_name} (stop_name, stop_latitude, stop_longitude)
						    VALUES ('{$stop_details['stop_name']}',
						            {$stop_details['stop_latitude']},
						            {$stop_details['stop_longitude']})");

			$stop_id = $DB->Get_Insert_ID();
		}

		$DB->Run_Query("INSERT INTO Route_Definitions (route_id, stop_id) VALUES ({$route_id}, {$stop_id})");

		$route_definition_id = $DB->Get_Insert_ID();

		insert_stop_direction_info($route_definition_id, $route_id, $route_direction, $stop_details['stop_order'], $stop_direction_info_table_name);

		return $stop_id;
	}

	function reorder_stop_direction_info($route_id, $route_direction, $stop_direction_info_table_name)
	{
		global $DB;

		$stop_direction_info = $DB->Get_Recordset("SELECT 	Route_Definitions.route_definition_id,
															{$stop_direction_info_table_name}.stop_order
													FROM 	Route_Definitions
														LEFT JOIN {$stop_direction_info_table_name}
															ON	{$stop_direction_info_table_name}.route_definition_id = Route_Definitions.route_definition_id
													WHERE	Route_Definitions.route_id = {$route_id} AND
															{$stop_direction_info_table_name}.route_direction = {$route_direction}
													ORDER BY {$stop_direction_info_table_name}.stop_order");

		for($i = 0; $i < count($stop_direction_info); $i++)
		{
			$stop_order = $i + 1;

			if($stop_order != $stop_direction_info[$i]['stop_order'])
			{
				$DB->Run_Query("UPDATE {$stop_direction_info_table_name}
								SET stop_order = {$stop_order}
								WHERE route_definition_id = {$stop_direction_info[$i]['route_definition_id']} AND
									  route_direction = {$route_direction}");
			}
		}
	}

	function get_polyline($mot_id, $stop_1_id, $stop_2_id)
	{
		global $DB;

		$polyline_info = null;

		$polyline = $DB->Get_Record("SELECT polyline FROM Polylines WHERE mot_id = {$mot_id} AND stop_1_id = {$stop_1_id} AND stop_2_id = {$stop_2_id}");

		if($polyline)
		{
			$polyline_info = array("polyline" => $polyline['polyline'], "is_reversed" => false);
		}
		else
		{
			$polyline = $DB->Get_Record("SELECT polyline FROM Polylines WHERE mot_id = {$mot_id} AND stop_1_id = {$stop_2_id} AND stop_2_id = {$stop_1_id}");

			if($polyline) $polyline_info = array("polyline" => $polyline['polyline'], "is_reversed" => true);
			else $polyline_info = array("polyline" => null, "is_reversed" => false);
		}

		return $polyline_info;
	}

