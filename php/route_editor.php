<?php
	header('Access-Control-Allow-Origin: *');
	header("Content-Type: text/plain");
	ini_set('display_errors', 1);
	error_reporting(E_ALL ^ E_NOTICE);

	$jsonObject = json_decode(file_get_contents('php://input'));

	if(isset($jsonObject))
	{
		require_once("../../../includes/common/database.php");

		$json_response = NULL;
		$DB = new Database();

		require_once("functions.php");

		if(isset($jsonObject->action))
		{
			switch($jsonObject->action)
			{
				case "test":
					$json_response = json_encode(array("response" => "YES!"));
					break;

				case "Get_MOT_List":
					$mot_list = $DB->Get_Recordset("SELECT * FROM MOT_Definitions ORDER BY mot_name");

					if($mot_list)
					{
						$json_response = json_encode(array("success"  => true,
						                                   "mot_list" => $mot_list));
					}
					else
					{
						$json_response = json_encode(array("success"       => false,
						                                   "error_message" => "Failed to read database."));
					}
					break;

				case "Get_MOT_Routes":
					$mot_routes = array();

					switch($jsonObject->mot_id)
					{
						case 1:
							$sql = "SELECT 	Routes.route_id,
									        Golden_Arrow_Route_Description_Origin_and_Destination.route_origin_area_description,
									        Golden_Arrow_Route_Description_Origin_and_Destination.route_destination_area_description,
									        Golden_Arrow_Route_Description_Origin_and_Destination.route_via_area_description
									FROM Routes
										JOIN Golden_Arrow_Route_Description_Origin_and_Destination
											ON 	Golden_Arrow_Route_Description_Origin_and_Destination.route_id = Routes.route_id
									ORDER BY	Golden_Arrow_Route_Description_Origin_and_Destination.route_origin_area_description,
												Golden_Arrow_Route_Description_Origin_and_Destination.route_destination_area_description,
									            Golden_Arrow_Route_Description_Origin_and_Destination.route_via_area_description";

							$routes = $DB->Get_Recordset($sql);

							for($i = 0; $i < count($routes); $i ++)
							{
								$mot_routes[] = array("route_id"          => $routes[$i]["route_id"],
								                      "route_description" => array("route_origin_area_description"      => $routes[$i]["route_origin_area_description"],
								                                                   "route_destination_area_description" => $routes[$i]["route_destination_area_description"],
								                                                   "route_via_area_description"         => $routes[$i]["route_via_area_description"]));
							}
							break;

						case 2:
							$sql = "SELECT 	Routes.route_id,
									        Metrorail_Route_Description_Origin_and_Destination.route_origin_area_description,
									        Metrorail_Route_Description_Origin_and_Destination.route_destination_area_description,
									        Metrorail_Route_Description_Origin_and_Destination.route_via_area_description,
									        Metrorail_Route_Description_Origin_and_Destination.is_express
									FROM Routes
										JOIN Metrorail_Route_Description_Origin_and_Destination
											ON 	Metrorail_Route_Description_Origin_and_Destination.route_id = Routes.route_id
									ORDER BY	Metrorail_Route_Description_Origin_and_Destination.route_origin_area_description,
												Metrorail_Route_Description_Origin_and_Destination.route_destination_area_description,
									            Metrorail_Route_Description_Origin_and_Destination.route_via_area_description";

							$routes = $DB->Get_Recordset($sql);

							for($i = 0; $i < count($routes); $i ++)
							{
								$mot_routes[] = array("route_id"          => $routes[$i]["route_id"],
								                      "route_description" => array("route_origin_area_description"      => $routes[$i]["route_origin_area_description"],
								                                                   "route_destination_area_description" => $routes[$i]["route_destination_area_description"],
								                                                   "route_via_area_description"         => $routes[$i]["route_via_area_description"],
								                                                   "is_express"                         => $routes[$i]["is_express"]));
							}
							break;

						case 3:
							$sql = "SELECT 	Routes.route_id
									FROM Routes
										JOIN MyCiti_Route_Description_Waypoints
											ON 	MyCiti_Route_Description_Waypoints.route_id = Routes.route_id
									WHERE MyCiti_Route_Description_Waypoints.waypoint_order = 1
									ORDER BY	MyCiti_Route_Description_Waypoints.area_description";

							$route_ids = $DB->Get_Recordset($sql);

							for($i = 0; $i < count($route_ids); $i ++)
							{
								$sql = "SELECT 	MyCiti_Route_Description_Waypoints.area_description
										FROM Routes
											JOIN MyCiti_Route_Description_Waypoints
												ON 	MyCiti_Route_Description_Waypoints.route_id = Routes.route_id
										WHERE Routes.route_id = {$route_ids[$i]["route_id"]}
										ORDER BY	MyCiti_Route_Description_Waypoints.waypoint_order";

								$route_description_raw = $DB->Get_Recordset($sql);
								$route_description = array();

								for($j = 0; $j < count($route_description_raw); $j ++) $route_description[] = $route_description_raw[$j]['area_description'];

								$mot_routes[] = array("route_id"          => $route_ids[$i]["route_id"],
								                      "route_description" => $route_description);
							}
							break;
					}

					if($mot_routes)
					{
						$json_response = json_encode(array("success"    => true,
						                                   "mot_routes" => $mot_routes));
					}
					else
					{
						$json_response = json_encode(array("success"       => false,
						                                   "error_message" => "Failed to read database."));
					}
					break;

				case "Get_Route_Stops":
					$route_stops = get_route($jsonObject->mot_id, $jsonObject->route_id, $jsonObject->route_direction);

					$polylines = array();

					for($i = 0; $i < (count($route_stops) - 1); $i++)
					{
						$polyline_info = get_polyline($jsonObject->mot_id, $route_stops[$i]['stop_id'], $route_stops[$i + 1]['stop_id']);

						$polylines[] = array("stop_1_id" => $route_stops[$i]['stop_id'],
						                     "stop_2_id" => $route_stops[$i + 1]['stop_id'],
						                     "polyline" => $polyline_info["polyline"],
						                     "is_reversed" => $polyline_info["is_reversed"]);
					}

					if($route_stops)
					{
						$json_response = json_encode(array("success"     => true,
						                                   "route_stops" => $route_stops,
						                                   "polylines"   => $polylines));
					}
					else
					{
						$json_response = json_encode(array("success"       => false,
						                                   "error_message" => "Failed to read database."));
					}
					break;

				case "Get_Route_Description":
					$route_description = get_route_description($jsonObject->route_id);

					if($route_description)
					{
						$json_response = json_encode(array("success"           => true,
						                                   "route_description" => $route_description));
					}
					else
					{
						$json_response = json_encode(array("success"       => false,
						                                   "error_message" => "Failed to read database."));
					}
					break;

				case 'Insert_Golden_Arrow_Description':
					$DB->Run_Query("INSERT INTO Routes (mot_id) VALUE (1)");
					$route_id = $DB->Get_Insert_ID();

					$sql = "INSERT INTO Golden_Arrow_Route_Description_Origin_and_Destination
							(route_id, route_origin_area_description, route_destination_area_description, route_via_area_description)
							VALUES ({$route_id},
								    '{$jsonObject->route_from}',
									'{$jsonObject->route_to}',
									'{$jsonObject->route_via}')";

					if($DB->Run_Query($sql))
					{
						$json_response = json_encode(array("success" => true, "route_id" => $route_id));
					}
					else
					{
						$json_response = json_encode(array("success" => false, "error_message" => "Failed to insert into database."));
					}
					break;

				case 'Insert_Metrorail_Description':
					$DB->Run_Query("INSERT INTO Routes (mot_id) VALUE (2)");
					$route_id = $DB->Get_Insert_ID();

					$sql = "INSERT INTO Metrorail_Route_Description_Origin_and_Destination
							(route_id, route_origin_area_description, route_destination_area_description, route_via_area_description, is_express)
							VALUES ({$route_id},
								    '{$jsonObject->route_from}',
									'{$jsonObject->route_to}',
									'{$jsonObject->route_via}',
									{$jsonObject->is_express})";

					if($DB->Run_Query($sql))
					{
						$json_response = json_encode(array("success" => true, "route_id" => $route_id));
					}
					else
					{
						$json_response = json_encode(array("success" => false, "error_message" => "Failed to insert into database."));
					}
					break;

				case 'Insert_MyCiTi_Description':
					$DB->Run_Query("INSERT INTO Routes (mot_id) VALUE (3)");
					$route_id = $DB->Get_Insert_ID();

					for($i = 0; $i < count($jsonObject->route_description); $i ++)
					{
						$waypoint_order = $i + 1;
						$sql = "INSERT INTO MyCiti_Route_Description_Waypoints
								(route_id, area_description, waypoint_order)
								VALUES ({$route_id},
									    '{$jsonObject->route_description[$i]}',
										{$waypoint_order})";

						$DB->Run_Query($sql);
					}

					if($route_id)
					{
						$json_response = json_encode(array("success" => true, "route_id" => $route_id));
					}
					else
					{
						$json_response = json_encode(array("success" => false, "error_message" => "Failed to insert into database."));
					}
					break;

				case 'Update_Golden_Arrow_Description':
					$sql = "UPDATE Golden_Arrow_Route_Description_Origin_and_Destination
							SET route_origin_area_description = '{$jsonObject->route_from}',
								route_destination_area_description = '{$jsonObject->route_to}',
								route_via_area_description = '{$jsonObject->route_via}'
							WHERE route_id = {$jsonObject->route_id}";

					if($DB->Run_Query($sql))
					{
						$json_response = json_encode(array("success" => true));
					}
					else
					{
						$json_response = json_encode(array("success" => false, "error_message" => "Failed to update database."));
					}
					break;

				case 'Update_Metrorail_Description':
					$sql = "UPDATE Metrorail_Route_Description_Origin_and_Destination
							SET route_origin_area_description = '{$jsonObject->route_from}',
								route_destination_area_description = '{$jsonObject->route_to}',
								route_via_area_description = '{$jsonObject->route_via}',
								is_express = {$jsonObject->is_express}
							WHERE route_id = {$jsonObject->route_id}";

					if($DB->Run_Query($sql))
					{
						$json_response = json_encode(array("success" => true));
					}
					else
					{
						$json_response = json_encode(array("success" => false, "error_message" => "Failed to update database."));
					}
					break;

				case 'Update_MyCiTi_Description':
					$DB->Run_Query("DELETE FROM MyCiti_Route_Description_Waypoints WHERE route_id = {$jsonObject->route_id}");

					$update_success_count = 0;

					for($i = 0; $i < count($jsonObject->route_description); $i ++)
					{
						$waypoint_order = $i + 1;
						$sql = "INSERT INTO MyCiti_Route_Description_Waypoints
								(route_id, area_description, waypoint_order)
								VALUES ({$jsonObject->route_id},
									    '{$jsonObject->route_description[$i]}',
										{$waypoint_order})";

						if($DB->Run_Query($sql)) $update_success_count ++;
					}

					if(count($jsonObject->route_description) == $update_success_count)
					{
						$json_response = json_encode(array("success" => true));
					}
					else
					{
						$json_response = json_encode(array("success" => false, "error_message" => "Failed to update database."));
					}
					break;

				case 'Delete_Golden_Arrow_Route':
					$DB->Run_Query("DELETE FROM Golden_Arrow_Route_Description_Origin_and_Destination WHERE route_id = {$jsonObject->route_id}");
					$DB->Run_Query("DELETE FROM Routes WHERE route_id = {$jsonObject->route_id}");

					$route_definition = $DB->Get_Recordset("SELECT * FROM Route_Definitions WHERE route_id = {$jsonObject->route_id}");

					if(count($route_definition))
					{
						$DB->Get_Recordset("DELETE FROM Route_Definitions WHERE route_id = {$jsonObject->route_id}");

						for($i = 0; $i < count($route_definition); $i ++)
						{
							$DB->Run_Query("DELETE FROM Golden_Arrow_Route_Direction_Info WHERE route_definition_id = {$route_definition[$i]['route_definition_id']}");

							$relationship_count = $DB->Count("SELECT COUNT(*) FROM Route_Definitions WHERE stop_id = {$route_definition[$i]['stop_id']}");

							if($relationship_count == 0) $DB->Run_Query("DELETE FROM Golden_Arrow_Bus_Stops WHERE stop_id = {$route_definition[$i]['stop_id']}");
						}
					}

					$json_response = json_encode(array("success" => true));
					break;

				case 'Delete_Metrorail_Route':
					$DB->Run_Query("DELETE FROM Metrorail_Route_Description_Origin_and_Destination WHERE route_id = {$jsonObject->route_id}");
					$DB->Run_Query("DELETE FROM Routes WHERE route_id = {$jsonObject->route_id}");

					$route_definition = $DB->Get_Recordset("SELECT * FROM Route_Definitions WHERE route_id = {$jsonObject->route_id}");

					if(count($route_definition))
					{

						$DB->Get_Recordset("DELETE FROM Route_Definitions WHERE route_id = {$jsonObject->route_id}");

						for($i = 0; $i < count($route_definition); $i ++)
						{
							$DB->Run_Query("DELETE FROM Metrorail_Route_Direction_Info WHERE route_definition_id = {$route_definition[$i]['route_definition_id']}");

							$relationship_count = $DB->Count("SELECT COUNT(*) FROM Route_Definitions WHERE stop_id = {$route_definition[$i]['stop_id']}");

							if($relationship_count == 0) $DB->Run_Query("DELETE FROM Metrorail_Train_Stations WHERE stop_id = {$route_definition[$i]['stop_id']}");
						}
					}

					$json_response = json_encode(array("success" => true));
					break;

				case 'Delete_MyCiTi_Route':
					$DB->Run_Query("DELETE FROM MyCiti_Route_Description_Waypoints WHERE route_id = {$jsonObject->route_id}");
					$DB->Run_Query("DELETE FROM Routes WHERE route_id = {$jsonObject->route_id}");

					$route_definition = $DB->Get_Recordset("SELECT * FROM Route_Definitions WHERE route_id = {$jsonObject->route_id}");

					if(count($route_definition))
					{
						$DB->Get_Recordset("DELETE FROM Route_Definitions WHERE route_id = {$jsonObject->route_id}");

						for($i = 0; $i < count($route_definition); $i ++)
						{
							$DB->Run_Query("DELETE FROM MyCiti_Route_Direction_Info WHERE route_definition_id = {$route_definition[$i]['route_definition_id']}");

							$relationship_count = $DB->Count("SELECT COUNT(*) FROM Route_Definitions WHERE stop_id = {$route_definition[$i]['stop_id']}");

							if($relationship_count == 0) $DB->Run_Query("DELETE FROM MyCiti_Bus_Stops WHERE stop_id = {$route_definition[$i]['stop_id']}");
						}
					}

					$json_response = json_encode(array("success" => true));
					break;

				case 'Import_Stops':
					for($i = 0; $i < count($jsonObject->stops); $i ++)
					{
						$stop_details = array('stop_name'      => $jsonObject->stops[$i]->stop_name,
						                      'stop_latitude'  => $jsonObject->stops[$i]->stop_latitude,
						                      'stop_longitude' => $jsonObject->stops[$i]->stop_longitude,
						                      'stop_order'     => ($i + 1));

						insert_stop($jsonObject->route_id, $jsonObject->route_direction, $stop_details);
					}

					$json_response = json_encode(array("success" => true));
					break;

				case 'Insert_Stop':
					$stop_id = null;

					$stop_details = array('stop_name'      => $jsonObject->stop_name,
					                      'stop_latitude'  => $jsonObject->stop_latitude,
					                      'stop_longitude' => $jsonObject->stop_longitude,
					                      'stop_order'     => $jsonObject->stop_order);

					$stop_id = insert_stop($jsonObject->route_id, $jsonObject->route_direction, $stop_details);

					if($stop_id)
					{
						$json_response = json_encode(array("success" => true, "stop_id" => $stop_id));
					}
					else
					{
						$json_response = json_encode(array("success" => false, "error_message" => "Failed to insert into database."));
					}
					break;

				case 'Delete_Stop':
					$stop_table_name = null;
					$stop_direction_info_table_name = null;

					switch($jsonObject->mot_id)
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

					$stop_route_relationship_count = $DB->Count("SELECT COUNT(*) FROM Route_Definitions WHERE stop_id = {$jsonObject->stop_id}");

					$route_definition_id = $DB->Run_Query("SELECT route_definition_id FROM Route_Definitions
															WHERE route_id = {$jsonObject->route_id} AND stop_id = {$jsonObject->stop_id}");

					$DB->Run_Query("DELETE FROM Route_Definitions WHERE route_id = {$jsonObject->route_id} AND stop_id = {$jsonObject->stop_id}");

					$DB->Run_Query("DELETE FROM {$stop_direction_info_table_name}
									WHERE route_definition_id = {$route_definition_id['route_definition_id']} AND route_direction = {$jsonObject->route_direction}");

					if($stop_route_relationship_count == 1) $DB->Run_Query("DELETE FROM {$stop_table_name} WHERE stop_id = {$jsonObject->stop_id}");

					reorder_stop_direction_info($jsonObject->route_id, $jsonObject->route_direction, $stop_direction_info_table_name);

					$json_response = json_encode(array("success" => true));
					break;

				case 'Update_Stop':
					$stop_table_name = null;
					$stop_direction_info_table_name = null;

					switch($jsonObject->mot_id)
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

					$DB->Run_Query("UPDATE {$stop_table_name}
									SET stop_name = '{$jsonObject->stop_name}',
										stop_latitude = {$jsonObject->stop_latitude},
										stop_longitude = {$jsonObject->stop_longitude}
									WHERE stop_id = {$jsonObject->stop_id}");

					$old_stop_order = $DB->Get_Record("SELECT 	{$stop_direction_info_table_name}.stop_order
														FROM 	Route_Definitions
															LEFT JOIN {$stop_direction_info_table_name}
																ON	{$stop_direction_info_table_name}.route_definition_id = Route_Definitions.route_definition_id
														WHERE	Route_Definitions.route_id = {$jsonObject->route_id} AND
																{$stop_direction_info_table_name}.route_direction = {$jsonObject->route_direction} AND
																Route_Definitions.stop_id = {$jsonObject->stop_id}");

					$old_stop_order = $old_stop_order['stop_order'];

					$stop_direction_info = $DB->Get_Recordset("SELECT 	Route_Definitions.route_definition_id,
																		{$stop_table_name}.stop_id,
																		{$stop_direction_info_table_name}.stop_order
																FROM 	Route_Definitions
																	JOIN {$stop_table_name}
																		ON {$stop_table_name}.stop_id = Route_Definitions.stop_id
																	LEFT JOIN {$stop_direction_info_table_name}
																		ON	{$stop_direction_info_table_name}.route_definition_id = Route_Definitions.route_definition_id
																WHERE	Route_Definitions.route_id = {$jsonObject->route_id} AND
																		{$stop_direction_info_table_name}.route_direction = {$jsonObject->route_direction}
																ORDER BY {$stop_direction_info_table_name}.stop_order");

					$index = - 1;

					if($jsonObject->stop_order < $old_stop_order)
					{
						for($i = 0; $i < count($stop_direction_info); $i++)
						{
							if($jsonObject->stop_order <= $stop_direction_info[$i]['stop_order'] &&
							   $old_stop_order > $stop_direction_info[$i]['stop_order'] &&
							   $jsonObject->stop_id != $stop_direction_info[$i]['stop_id'])
							{
								$stop_order = $stop_direction_info[$i]['stop_order'] + 1;

								$DB->Run_Query("UPDATE 	{$stop_direction_info_table_name}
												SET 	stop_order = {$stop_order}
												WHERE 	route_definition_id = {$stop_direction_info[$i]['route_definition_id']} AND
										                route_direction = {$jsonObject->route_direction}");
							}

							if($jsonObject->stop_id == $stop_direction_info[$i]['stop_id']) $index = $i;
						}
					}

					if($jsonObject->stop_order > $old_stop_order)
					{
						for($i = 0; $i < count($stop_direction_info); $i++)
						{
							if($old_stop_order < $stop_direction_info[$i]['stop_order'] &&
							   $jsonObject->stop_order >= $stop_direction_info[$i]['stop_order'] &&
							   $jsonObject->stop_id != $stop_direction_info[$i]['stop_id'])
							{
								$stop_order = $stop_direction_info[$i]['stop_order'] - 1;

								$DB->Run_Query("UPDATE 	{$stop_direction_info_table_name}
												SET 	stop_order = {$stop_order}
												WHERE 	route_definition_id = {$stop_direction_info[$i]['route_definition_id']} AND
										                route_direction = {$jsonObject->route_direction}");
							}

							if($jsonObject->stop_id == $stop_direction_info[$i]['stop_id']) $index = $i;
						}
					}

					$DB->Run_Query("UPDATE 	{$stop_direction_info_table_name}
									SET 	stop_order = {$jsonObject->stop_order}
									WHERE 	route_definition_id = {$stop_direction_info[$index]['route_definition_id']} AND
							                route_direction = {$jsonObject->route_direction}");

					$json_response = json_encode(array("success" => true));
					break;

				case 'Update_Stop_GPS':
					$stop_table_name = null;

					switch($jsonObject->mot_id)
					{
						case 1: $stop_table_name = "Golden_Arrow_Bus_Stops";    break;
						case 2: $stop_table_name = "Metrorail_Train_Stations";  break;
						case 3: $stop_table_name = "MyCiti_Bus_Stops";          break;
					}

					$DB->Run_Query("UPDATE {$stop_table_name}
									SET stop_latitude = {$jsonObject->stop_latitude},
										stop_longitude = {$jsonObject->stop_longitude}
									WHERE stop_id = {$jsonObject->stop_id}");

					$json_response = json_encode(array("success" => true));
					break;

				case 'Save_Polyline':
					$polyline_id = $DB->Get_Record("SELECT polyline_id FROM Polylines
													WHERE 	mot_id = {$jsonObject->mot_id} AND
															stop_1_id = {$jsonObject->stop_1_id} AND
															stop_2_id = {$jsonObject->stop_2_id}");

					$encoded_polyline = base64_encode(gzencode($jsonObject->polyline));

					if($polyline_id != null)
						$DB->Run_Query("UPDATE Polylines SET polyline = '{$encoded_polyline}', distance = {$jsonObject->distance}
										WHERE polyline_id = {$polyline_id['polyline_id']}");
					else
						$DB->Run_Query("INSERT INTO Polylines (mot_id, stop_1_id, stop_2_id, polyline, distance)
										VALUES ({$jsonObject->mot_id},
												{$jsonObject->stop_1_id},
												{$jsonObject->stop_2_id},
												'{$encoded_polyline}',
												{$jsonObject->distance})");

					$json_response = json_encode(array("success" => true));
					break;

				case 'Delete_Polyline':
					$DB->Run_Query("DELETE FROM Polylines
									WHERE	mot_id = {$jsonObject->mot_id} AND
											stop_1_id = {$jsonObject->stop_1_id} AND
											stop_2_id = {$jsonObject->stop_2_id}");

					$json_response = json_encode(array("success" => true));
					break;

				default:
					$json_response = json_encode(array("response" => "Access Denied ... HAIBO!!!"));
					break;
			}
		}

		$DB->Kill();
		echo $json_response;
	}
	else echo "Access Denied.";

