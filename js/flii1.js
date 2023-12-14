var scale = 300;
 
// PALETTES

var esacci_palette = [
  '000000','000000','000000','000000','000000','000000','000000','000000','000000','000000', // 0 - 9
  'FFFF64','FFFF64','FFFF00','FFFF00','FFFF00','FFFF00','FFFF00','FFFF00','FFFF00','FFFF00', // 10 - 19
  'AAF0F0','AAF0F0','AAF0F0','AAF0F0','AAF0F0','AAF0F0','AAF0F0','AAF0F0','AAF0F0','AAF0F0', // 20 - 29
  'DCF064','DCF064','DCF064','DCF064','DCF064','DCF064','DCF064','DCF064','DCF064','DCF064', // 30 - 39
  'C7C764','C7C764','C7C764','C7C764','C7C764','C7C764','C7C764','C7C764','C7C764','C7C764', // 40 - 49
  '006400','006400','006400','006400','006400','006400','006400','006400','006400','006400', // 50 - 59
  '009F00','009F00','AAC700','AAC700','AAC700','AAC700','AAC700','AAC700','AAC700','AAC700', // 60 - 69
  '003B00','003B00','005000','005000','005000','005000','005000','005000','005000','005000', // 70 - 79
  '275000','275000','276400','276400','276400','276400','276400','276400','276400','276400', // 80 - 89
  '788300','788300','788300','788300','788300','788300','788300','788300','788300','788300', // 90 - 99
  '8C9F00','8C9F00','8C9F00','8C9F00','8C9F00','8C9F00','8C9F00','8C9F00','8C9F00','8C9F00', // 100 - 109
  'BE9600','BE9600','BE9600','BE9600','BE9600','BE9600','BE9600','BE9600','BE9600','BE9600', // 110 - 119
  '966400','784B00','966400','966400','966400','966400','966400','966400','966400','966400', // 120 - 129
  'FFB332','FFB332','FFB332','FFB332','FFB332','FFB332','FFB332','FFB332','FFB332','FFB332', // 130 - 139
  'FFDCD2','FFDCD2','FFDCD2','FFDCD2','FFDCD2','FFDCD2','FFDCD2','FFDCD2','FFDCD2','FFDCD2', // 140 - 149
  'FFEBAE','FFEBAE','FFD278','FFEBAE','FFEBAE','FFEBAE','FFEBAE','FFEBAE','FFEBAE','FFEBAE', // 150 - 159
  '007859','007859','007859','007859','007859','007859','007859','007859','007859','007859', // 160 - 169
  '009678','009678','009678','009678','009678','009678','009678','009678','009678','009678', // 170 - 179
  '00DC83','00DC83','00DC83','00DC83','00DC83','00DC83','00DC83','00DC83','00DC83','00DC83', // 180 - 189
  'C31300','C31300','C31300','C31300','C31300','C31300','C31300','C31300','C31300','C31300', // 190 - 199
  'FFF4D7','DCDCDC','FFF4D7','FFF4D7','FFF4D7','FFF4D7','FFF4D7','FFF4D7','FFF4D7','FFF4D7', // 200 - 209
  '0046C7','0046C7','0046C7','0046C7','0046C7','0046C7','0046C7','0046C7','0046C7','0046C7', // 210 - 219
  'FFFFFF' // 220
  ];

var colorlist = ['224f1a','a3ff76','feff6f','a09568','ffa802','f7797c','fb0102','d87136','a90086','7a1ca5','421137','000000'];

var palette_continuous = ['#2b7c00','#c2d426','#e8c754','#675115'];

var palette_trips = ['#7E5D10','#04FF02','#267301'];




// DATASETS

// Images
var jrc = ee.Image('JRC/GSW1_0/GlobalSurfaceWater').select('occurrence').lte(75).unmask(1).multiply(ee.Image(0).clip(ee.FeatureCollection('users/aduncan/caspian')).unmask(1));
var ocean = ee.Image('users/aduncan/cci/ESACCI-LC-L4-WB-Ocean-Map-150m-P13Y-2000-v40');
var primary = ee.Image('UMD/GLAD/PRIMARY_HUMID_TROPICAL_FORESTS/v1/2001').selfMask();
var ESACCI = ee.Image('users/aduncan/cci/ESACCI-LC-L4-LCCS-Map-300m-P1Y-1992_2015-v207');
var forest_cover = ee.Image('users/aduncan/wri/forest_cover_map');
var loss_classes = ee.Image('users/aduncan/wri/Goode_FinalClassification_19_05pcnt_prj');
var hansenloss = ee.Image('UMD/hansen/global_forest_change_2017_v1_5').select('loss');

//Feature collections
var ecoreg = ee.FeatureCollection('RESOLVE/ECOREGIONS/2017');
var intactforest2016 = ee.FeatureCollection('users/aduncan/ifl/IFL_2016');
var wdpa = ee.FeatureCollection('WCMC/WDPA/current/polygons');
var scapes = ee.FeatureCollection('users/aduncan/scapes/scapes_20191030');
var tp = ee.FeatureCollection('users/aduncan/wri/Tree_plantations');

//Preloaded datasets
var final_metric = ee.Image('users/aduncan/osm_earth/final_metric_20190824');
var ratio = ee.Image('users/wcsbackup/osm_earth/lci_Aug19');
var total_pressure = ee.Image('users/aduncan/osm_earth/fpi_20190824');


// OSM SCORES AND RATIOS

var anthrodirectratio = 1;

var anthroaeroway = '1';
var anthroamenity = '1';
var anthrobarrier =  '1';
var anthrohighway =  '1';
var anthrolanduse =  '1';
var anthromanmade =  '1';
var anthromilitary =  '1';
var anthropower =  '1';
var anthrorailway =  '1';
var anthrowaterway =  '1';
var anthrocropland =  '1';
var anthrodefor =  '1';
var anthrobuiltup =  '1';

var a01=8;
var a02=4;
var a03=3;
var b01=15;
var b02=15;
var b03=15;
var b04=10;
var b05=8;
var b06=7;
var b08=6;
var b09=5;
var b10=5;
var b11=5;
var b12=5;
var b13=4;
var b14=3;
var c01=5;
var c02=3;
var c03=3;
var c04=2;
var d01=15;
var d02=11;
var d03=9;
var d04=7;
var d05=6;
var d06=5;
var d07=4;
var d08=3;
var d09=2;
var d10=2;
var d11=4;
var g01=30;
var g02=15;
var g03=7;
var g04=3;
var h01=20;
var h02=15;
var h03=10;
var h04=10;
var h05=7;
var h06=7;
var h07=7;
var h08=5;
var h09=5;
var h10=7;
var h11=7;
var h12=3;
var i01=10;
var i02=10;
var i03=7;
var i04=5;
var i05=4;
var i06=2;
var j01=20;
var j02=13;
var j03=3;
var j04=3;
var k01=1;
var l01=1;
var m01=0;


// OSM DATA

var rast_aeroway_density_300m_direct = ee.Image('users/aduncan/osm_earth/dir_aeroway_aerodrome_density_300m').multiply(a03) 
                                .add(ee.Image('users/aduncan/osm_earth/dir_aeroway_apron_density_300m').multiply(a01)) 
                                .add(ee.Image('users/aduncan/osm_earth/dir_aeroway_hangar_density_300m').multiply(a02)) 
                                .add(ee.Image('users/aduncan/osm_earth/dir_aeroway_helipad_density_300m').multiply(a01)) 
                                .add(ee.Image('users/aduncan/osm_earth/dir_aeroway_heliport_PG_density_300m').multiply(a03)) 
                                .add(ee.Image('users/aduncan/osm_earth/dir_aeroway_runway_density_300m').multiply(a01)) 
                                .add(ee.Image('users/aduncan/osm_earth/dir_aeroway_spaceport_PG_density_300m').multiply(a03)) 
                                .add(ee.Image('users/aduncan/osm_earth/dir_aeroway_taxiway_density_300m').multiply(a01)) 
                                .add(ee.Image('users/aduncan/osm_earth/dir_aeroway_terminal_PG_density_300m').multiply(a02)) 
                                .multiply(anthrodirectratio);

var rast_amen_tour_leis_aerial_density_300m_direct = (ee.Image('users/aduncan/osm_earth/dir_amenity_aerialway_density_300m').multiply((b09)) 
                                .add(ee.Image('users/aduncan/osm_earth/dir_amenity_alpinecampwild_density_300m').multiply((b14))) 
                                .add(ee.Image('users/aduncan/osm_earth/dir_leisure_beach_resort_density_300m').multiply((b14))) 
                                .add(ee.Image('users/aduncan/osm_earth/dir_amenity_fuel_density_300m').multiply((b01))) 
                                .add(ee.Image('users/aduncan/osm_earth/dir_leisure_golf_course_PG_density_300m').multiply((b14))) 
                                .add(ee.Image('users/aduncan/osm_earth/dir_leisure_marina_density_300m').multiply((b14))) 
                                .add(ee.Image('users/aduncan/osm_earth/dir_leisure_pitch_density_300m').multiply((b14))) 
                                .add(ee.Image('users/aduncan/osm_earth/dir_amenity_sanitary_dump_station_density_300m').multiply((b03))) 
                                ).multiply(anthrodirectratio);

var rast_barrier_density_300m_direct = (ee.Image('users/aduncan/osm_earth/dir_barrier_city_wall_density_300m').multiply((c01)) 
                                .add(ee.Image('users/aduncan/osm_earth/dir_barrier_ditch_density_300m').multiply((c02))) 
                                .add(ee.Image('users/aduncan/osm_earth/dir_barrier_hedge_density_300m').multiply((c04))) 
                                .add(ee.Image('users/aduncan/osm_earth/dir_barrier_retaining_wall_density_300m').multiply((c01))) 
                                .add(ee.Image('users/aduncan/osm_earth/dir_barrier_wall_density_300m').multiply((c01))) 
                                ).multiply(anthrodirectratio);

// INCLUDES GROADS
var  rast_highway_density_300m_direct = (ee.Image('users/aduncan/osm_earth/dir_highway_bridleway_density_300m').multiply((d09)) 
                                .add(ee.Image('users/aduncan/osm_earth/dir_highway_bus_guideway_density_300m').multiply((d06))) 
                                .add(ee.Image('users/aduncan/osm_earth/dir_highway_cycleway_density_300m').multiply((d09))) 
                                .add(ee.Image('users/aduncan/osm_earth/dir_highway_elevator_density_300m').multiply((d11))) 
                                .add(ee.Image('users/aduncan/osm_earth/dir_highway_escape_density_300m').multiply((d08))) 
                                .add(ee.Image('users/yourecoveredinbees/osm_earth/dir_highway_footway_density_300mA').multiply((d10)))
                                .add(ee.Image('users/aduncan/osm_earth/dir_highway_living_street_density_300m').multiply((d07))) 
                                .add(ee.Image('users/aduncan/osm_earth/dir_highway_mini_roundabout_density_300m').multiply((d07))) 
                                .add(ee.Image('users/aduncan/osm_earth/dir_highway_motorway_density_300m').multiply((d01))) 
                                .add(ee.Image('users/aduncan/osm_earth/dir_highway_motorway_link_density_300m').multiply((d01))) 
                                .add(ee.Image('users/yourecoveredinbees/osm_earth/dir_highway_path_density_300mA').multiply((d10)))
                                .add(ee.Image('users/aduncan/osm_earth/dir_highway_pedestrian_density_300m').multiply((d10))) 
                                .add(ee.Image('users/aduncan/osm_earth/dir_highway_primary_density_300m').multiply((d03))) 
                                .add(ee.Image('users/aduncan/osm_earth/dir_highway_primary_link_density_300m').multiply((d03)))
                                .add(ee.Image('users/aduncan/osm_earth/dir_highway_raceway_density_300m').multiply((d01))) 
                                .add(ee.Image('users/aduncan/osm_earth/dir_highway_rest_area_density_300m').multiply((d11))) 
                                .add(ee.Image('users/aduncan/osm_earth/dir_highway_road_density_300m').multiply((d07))) 
                                .add(ee.Image('users/aduncan/osm_earth/dir_highway_secondary_density_300m').multiply((d04))) 
                                .add(ee.Image('users/aduncan/osm_earth/dir_highway_secondary_link_density_300m').multiply((d04))) 
                                .add(ee.Image('users/aduncan/osm_earth/dir_highway_service_density_300mA').multiply((d06)))
                                .add(ee.Image('users/aduncan/osm_earth/dir_highway_steps_density_300m').multiply((d10))) 
                                .add(ee.Image('users/yourecoveredinbees/osm_earth/dir_highway_tertiary_density_300mA').multiply((d05))) 
                                .add(ee.Image('users/aduncan/osm_earth/dir_highway_tertiary_link_density_300m').multiply((d05))) 
                                .add(ee.Image('users/wcsbackup/osm_earth/dir_highway_track_density_300m').multiply((d08))) 
                                .add(ee.Image('users/aduncan/osm_earth/dir_highway_trunk_density_300m').multiply((d02))) 
                                .add(ee.Image('users/aduncan/osm_earth/dir_highway_trunk_link_density_300m').multiply((d02))) 
                                .add(ee.Image('users/aduncan/osm_earth/dir_highway_turning_circle_NO_density_300m').multiply((d07)))
                                .add(ee.Image('users/yourecoveredinbees/osm_earth/dir_highway_unclassified_density_300m_A').multiply((d07)))
                                .add(ee.Image('users/aduncan/intact_default_CROP/groads_additions').multiply((d07)))
                                ).multiply(anthrodirectratio);

var rast_landuse_density_300m_direct = (ee.Image('users/yourecoveredinbees/osm_earth/dir_landuse_basin_PG_density_300m').multiply((b06)) 
                                .add(ee.Image('users/yourecoveredinbees/osm_earth/dir_landuse_cemetery_PG_density_300m').multiply((b14))) 
                                .add(ee.Image('users/yourecoveredinbees/osm_earth/dir_landuse_industrial_PG_density_300m').multiply((b05))) 
                                .add(ee.Image('users/yourecoveredinbees/osm_earth/dir_landuse_landfill_density_300m').multiply((b03))) 
                                .add(ee.Image('users/yourecoveredinbees/osm_earth/dir_landuse_quarry_density_300m').multiply((b02))) 
                                .add(ee.Image('users/yourecoveredinbees/osm_earth/dir_landuse_salt_pond_PG_density_300m').multiply((b13))) 
                                .add(ee.Image('users/yourecoveredinbees/osm_earth/dir_landuse_village_green_PG_density_300m').multiply((b14))) 
                                ).multiply(anthrodirectratio);

var rast_manmade_density_300m_direct = (ee.Image('users/yourecoveredinbees/osm_earth/dir_man_made_adit_density_300m').multiply((b02)) 
                                .add(ee.Image('users/yourecoveredinbees/osm_earth/dir_man_made_beacon_density_300m').multiply((b10))) 
                                .add(ee.Image('users/yourecoveredinbees/osm_earth/dir_man_made_breakwater_PG_density_300m').multiply((b11))) 
                                .add(ee.Image('users/yourecoveredinbees/osm_earth/dir_man_made_chimney_density_300m').multiply((b04))) 
                                .add(ee.Image('users/yourecoveredinbees/osm_earth/dir_man_made_communications_tower_density_300m').multiply((b12))) 
                                .add(ee.Image('users/yourecoveredinbees/osm_earth/dir_man_made_dyke_density_300m').multiply((b11))) 
                                .add(ee.Image('users/yourecoveredinbees/osm_earth/dir_man_made_embankment_density_300m').multiply((b11))) 
                                .add(ee.Image('users/yourecoveredinbees/osm_earth/dir_man_made_gasometer_density_300m').multiply((b01))) 
                                .add(ee.Image('users/yourecoveredinbees/osm_earth/dir_man_made_groyne_density_300m').multiply((b11))) 
                                .add(ee.Image('users/yourecoveredinbees/osm_earth/dir_man_made_lighthouse_density_300m').multiply((b10))) 
                                .add(ee.Image('users/yourecoveredinbees/osm_earth/dir_man_made_mast_density_300m').multiply((b12))) 
                                .add(ee.Image('users/yourecoveredinbees/osm_earth/dir_man_made_mineshaft_density_300m').multiply((b02))) 
                                .add(ee.Image('users/aduncan/osm_earth/dir_man_made_observatorytelescope_density_300m').multiply((b12)))
                                .add(ee.Image('users/yourecoveredinbees/osm_earth/dir_man_made_petroleum_well_density_300m').multiply((b01))) 
                                .add(ee.Image('users/yourecoveredinbees/osm_earth/dir_man_made_pier_density_300m').multiply((b11))) 
                                .add(ee.Image('users/yourecoveredinbees/osm_earth/dir_man_made_pipeline_density_300m').multiply((b01))) 
                                .add(ee.Image('users/yourecoveredinbees/osm_earth/dir_man_made_pumping_station_density_300m').multiply((b06))) 
                                .add(ee.Image('users/yourecoveredinbees/osm_earth/dir_man_made_reservoir_covered_density_300m').multiply((b06))) 
                                .add(ee.Image('users/yourecoveredinbees/osm_earth/dir_man_made_silo_density_300m').multiply((b08))) 
                                .add(ee.Image('users/yourecoveredinbees/osm_earth/dir_man_made_snow_fence_density_300m').multiply((c03))) 
                                .add(ee.Image('users/yourecoveredinbees/osm_earth/dir_man_made_storage_tank_density_300m').multiply((b08))) 
                                .add(ee.Image('users/yourecoveredinbees/osm_earth/dir_man_made_tower_density_300m').multiply((b12))) 
                                .add(ee.Image('users/yourecoveredinbees/osm_earth/dir_man_made_wastewater_plant_density_300m').multiply((b03))) 
                                .add(ee.Image('users/yourecoveredinbees/osm_earth/dir_man_made_watermill_density_300m').multiply((b06))) 
                                .add(ee.Image('users/yourecoveredinbees/osm_earth/dir_man_made_water_tower_density_300m').multiply((b06))) 
                                .add(ee.Image('users/yourecoveredinbees/osm_earth/dir_man_made_water_well_density_300m').multiply((b06))) 
                                .add(ee.Image('users/yourecoveredinbees/osm_earth/dir_man_made_water_works_density_300m').multiply((b06))) 
                                .add(ee.Image('users/yourecoveredinbees/osm_earth/dir_man_made_windmill_density_300m').multiply((h09))) 
                                .add(ee.Image('users/yourecoveredinbees/osm_earth/dir_man_made_works_density_300m').multiply((b08))) 
                                ).multiply(anthrodirectratio);

var rast_military_density_300m_direct = (ee.Image('users/yourecoveredinbees/osm_earth/dir_military_airfield_density_300m').multiply((g04)) 
                                .add(ee.Image('users/yourecoveredinbees/osm_earth/dir_military_ammunition_density_300m').multiply((g03))) 
                                .add(ee.Image('users/yourecoveredinbees/osm_earth/dir_military_barracks_density_300m').multiply((g03))) 
                                .add(ee.Image('users/aduncan/osm_earth/dir_military_bunker_density_300m').multiply((g03)))
                                .add(ee.Image('users/yourecoveredinbees/osm_earth/dir_military_checkpoint_density_300m').multiply((g03))) 
                                .add(ee.Image('users/yourecoveredinbees/osm_earth/dir_military_danger_area_density_300m').multiply((g02))) 
                                .add(ee.Image('users/yourecoveredinbees/osm_earth/dir_military_naval_base_density_300m').multiply((g04))) 
                                .add(ee.Image('users/yourecoveredinbees/osm_earth/dir_military_nuclear_explosion_site_density_300m').multiply((g01))) 
                                .add(ee.Image('users/yourecoveredinbees/osm_earth/dir_military_range_density_300m').multiply((g02))) 
                                .add(ee.Image('users/yourecoveredinbees/osm_earth/dir_military_trench_density_300m').multiply((g02))) 
                                ).multiply(anthrodirectratio);

var rast_power_density_300m_direct = (ee.Image('users/yourecoveredinbees/osm_earth/dir_power_cable_density_300m').multiply((h12)) 
                                .add(ee.Image('users/yourecoveredinbees/osm_earth/dir_power_heliostat_density_300m').multiply((h08))) 
                                .add(ee.Image('users/yourecoveredinbees/osm_earth/dir_power_line_density_300m').multiply((h10))) 
                                .add(ee.Image('users/yourecoveredinbees/osm_earth/dir_power_substation_density_300m').multiply((h11)))
                                .add(ee.Image('users/yourecoveredinbees/osm_earth/dir_power_xbio_density_300m').multiply((h04))) 
                                .add(ee.Image('users/yourecoveredinbees/osm_earth/dir_power_xcoal_density_300m').multiply((h01))) 
                                .add(ee.Image('users/yourecoveredinbees/osm_earth/dir_power_xhydro_density_300m').multiply((h05))) 
                                .add(ee.Image('users/yourecoveredinbees/osm_earth/dir_power_xnuclear_density_300m').multiply((h06))) 
                                .add(ee.Image('users/yourecoveredinbees/osm_earth/dir_power_xoil_density_300m').multiply((h02))) 
                                .add(ee.Image('users/yourecoveredinbees/osm_earth/dir_power_xother_density_300m').multiply((h07))) 
                                .add(ee.Image('users/yourecoveredinbees/osm_earth/dir_power_xsolar_density_300m').multiply((h08))) 
                                .add(ee.Image('users/yourecoveredinbees/osm_earth/dir_power_xwaste_density_300m').multiply((h04))) 
                                .add(ee.Image('users/yourecoveredinbees/osm_earth/dir_power_xwind_density_300m').multiply((h09))) 
                                ).multiply(anthrodirectratio);

var rast_railway_density_300m_direct = (ee.Image('users/yourecoveredinbees/osm_earth/dir_railway_abandoned_density_300m').multiply((i06)) 
                                .add(ee.Image('users/yourecoveredinbees/osm_earth/dir_railway_disused_density_300m').multiply((i06))) 
                                .add(ee.Image('users/yourecoveredinbees/osm_earth/dir_railway_funicular_density_300m').multiply((i01))) 
                                .add(ee.Image('users/yourecoveredinbees/osm_earth/dir_railway_halt_density_300m').multiply((i05)))
                                .add(ee.Image('users/yourecoveredinbees/osm_earth/dir_railway_light_rail_density_300m').multiply((i03))) 
                                .add(ee.Image('users/yourecoveredinbees/osm_earth/dir_railway_miniature_density_300m').multiply((i03))) 
                                .add(ee.Image('users/yourecoveredinbees/osm_earth/dir_railway_monorail_density_300m').multiply((i02)))
                                .add(ee.Image('users/yourecoveredinbees/osm_earth/dir_railway_narrow_gauge_density_300m').multiply((i03))) 
                                .add(ee.Image('users/yourecoveredinbees/osm_earth/dir_railway_platform_density_300m').multiply((i05))) 
                                .add(ee.Image('users/yourecoveredinbees/osm_earth/dir_railway_preserved_density_300m').multiply((i01))) 
                                .add(ee.Image('users/yourecoveredinbees/osm_earth/dir_railway_rail_density_300m').multiply((i01))) 
                                .add(ee.Image('users/yourecoveredinbees/osm_earth/dir_railway_station_density_300m').multiply((i04))) 
                                .add(ee.Image('users/yourecoveredinbees/osm_earth/dir_railway_subway_density_300m').multiply((i02))) 
                                .add(ee.Image('users/yourecoveredinbees/osm_earth/dir_railway_tram_density_300m').multiply((i03))) 
                                ).multiply(anthrodirectratio);

var rast_waterway_density_300m_direct = (ee.Image('users/yourecoveredinbees/osm_earth/dir_waterway_canal_density_300m').multiply((j02)) 
                                .add(ee.Image('users/yourecoveredinbees/osm_earth/dir_waterway_dam_density_300m').multiply((j01))) 
                                .add(ee.Image('users/yourecoveredinbees/osm_earth/dir_waterway_ditch_density_300m').multiply((j03))) 
                                .add(ee.Image('users/yourecoveredinbees/osm_earth/dir_waterway_drain_density_300m').multiply((j03)))
                                .add(ee.Image('users/yourecoveredinbees/osm_earth/dir_waterway_lock_gate_density_300m').multiply((j01))) 
                                .add(ee.Image('users/yourecoveredinbees/osm_earth/dir_waterway_weir_density_300m').multiply((j04))) 
                                ).multiply(anthrodirectratio);

var rast_cropland_density_300m_direct = ee.Image('users/aduncan/osm_earth/dir_cropland_CorrectlyReduced_density_300m').multiply((k01)).multiply(anthrodirectratio);

var rast_defor_density_300m_direct = ee.Image('users/yourecoveredinbees/osm_earth/dir_defor_300m_dropLTE6').multiply((l01)).multiply(anthrodirectratio);

ratio = ratio.where(ratio.gt(1),1);

Map.addLayer(ratio.gte(0),{min:0,max:0,palette:['darkgreen']}, '2018 forest cover',false);


//CREATION OF DIRECT INFRASTRUCTURE PRESSURE SCORE

var hawths_func = function(image,exp_gamma){
              return ee.Image(1).subtract(image.multiply(-1).multiply(ee.Number(exp_gamma)).exp()
                );
              };

var infra = rast_aeroway_density_300m_direct.multiply(ee.Number.parse(anthroaeroway))
                              .add(rast_amen_tour_leis_aerial_density_300m_direct.multiply(ee.Number.parse(anthroamenity)))
                              .add(rast_barrier_density_300m_direct.multiply(ee.Number.parse(anthrobarrier)))
                              .add(rast_highway_density_300m_direct.multiply(ee.Number.parse(anthrohighway)))
                              .add(rast_landuse_density_300m_direct.multiply(ee.Number.parse(anthrolanduse)))
                              .add(rast_manmade_density_300m_direct.multiply(ee.Number.parse(anthromanmade)))
                              .add(rast_military_density_300m_direct.multiply(ee.Number.parse(anthromilitary)))
                              .add(rast_power_density_300m_direct.multiply(ee.Number.parse(anthropower)))
                              .add(rast_railway_density_300m_direct.multiply(ee.Number.parse(anthrorailway)))
                              .add(rast_waterway_density_300m_direct.multiply(ee.Number.parse(anthrowaterway)))
                              .multiply(2);
                              
Map.addLayer(infra,{min:0,max:20},'Raw Direct Infrastructure Pressure Score  (I’)',false);

var infra_hawth_1 = hawths_func(infra,0.198);
Map.addLayer(infra_hawth_1,{min:0,max:1,palette:['white','hotpink']},'Direct Infrastructure Pressure Score (I)',false);


// CREATION OF DIRECT AGRICULTURE PRESSURE SCORE

Map.addLayer(rast_cropland_density_300m_direct.multiply(2),{min:0,max:2},'Raw Direct Agriculture Pressure Score  (A’)',false);

var crop = rast_cropland_density_300m_direct.multiply(2);

var crop_hawth_1 = hawths_func(crop,1.540);
Map.addLayer(crop_hawth_1,{min:0,max:1,palette:['white','orange']},'Direct Agriculture Pressure Score (A)',false);


//CREATION OF DIRECT DEFOR PRESSURE SCORE

Map.addLayer(rast_defor_density_300m_direct,{min:0,max:18},'Raw Direct Deforestation Pressure Score  (H’)',false);

var defor = rast_defor_density_300m_direct;

var defor_hawth_1 = hawths_func(defor,0.955);
Map.addLayer(defor_hawth_1,{min:0,max:1,palette:['red','white','blue','green','pink','orange','black','purple']},' Direct Deforestation Pressure Score (H)',false);

// TOTAL DIRECT PRESSURE SCORE

var total_direct_pressure = infra_hawth_1
                                .add(crop_hawth_1)
                                .add(defor_hawth_1)
                                .updateMask(jrc)
                                .updateMask(ocean)
                                .unmask(0);
                              
Map.addLayer(total_direct_pressure,{min:0,max:2, palette:colorlist},'Direct Pressure Score (P)',false);


// INDIRECT PRESSURE SCORE

var array_calc = function(number){
  var x = ee.Number(0.75).pow(ee.Number(number));
  // the 0s are being recorded as ones after this calculation
  return x;
  };
  

var weight1 = [999999,999999,999999,999999,999999,999999,999999,999999,999999,999999,999999,999999,999999,999999,999999,999999,999999,999999,999999,19,999999,999999,999999,999999,999999,999999,999999,999999,999999,999999,999999,999999,999999,999999,999999,999999,999999,999999,999999].map(function(number){return array_calc(number)});
var weight2 = [999999,999999,999999,999999,999999,999999,999999,999999,999999,999999,999999,999999,999999,18.9736659610103,18.6815416922694,18.4390889145858,18.2482875908947,18.1107702762748,18.0277563773199,18,18.0277563773199,18.1107702762748,18.2482875908947,18.4390889145858,18.6815416922694,18.9736659610103,999999,999999,999999,999999,999999,999999,999999,999999,999999,999999,999999,999999,999999].map(function(number){return array_calc(number)});
var weight3 = [999999,999999,999999,999999,999999,999999,999999,999999,999999,999999,999999,18.7882942280559,18.3847763108502,18.0277563773199,17.7200451466694,17.464249196573,17.2626765016321,17.1172427686237,17.0293863659264,17,17.0293863659264,17.1172427686237,17.2626765016321,17.464249196573,17.7200451466694,18.0277563773199,18.3847763108502,18.7882942280559,999999,999999,999999,999999,999999,999999,999999,999999,999999,999999,999999].map(function(number){return array_calc(number)});
var weight4 = [999999,999999,999999,999999,999999,999999,999999,999999,999999,18.8679622641132,18.3575597506858,17.8885438199983,17.464249196573,17.0880074906351,16.7630546142402,16.4924225024706,16.2788205960997,16.1245154965971,16.0312195418814,16,16.0312195418814,16.1245154965971,16.2788205960997,16.4924225024706,16.7630546142402,17.0880074906351,17.464249196573,17.8885438199983,18.3575597506858,18.8679622641132,999999,999999,999999,999999,999999,999999,999999,999999,999999].map(function(number){return array_calc(number)});
var weight5 = [999999,999999,999999,999999,999999,999999,999999,999999,18.6010752377383,18.0277563773199,17.4928556845359,17,16.5529453572468,16.1554944214035,15.8113883008419,15.52417469626,15.2970585407784,15.1327459504216,15.0332963783729,15,15.0332963783729,15.1327459504216,15.2970585407784,15.52417469626,15.8113883008419,16.1554944214035,16.5529453572468,17,17.4928556845359,18.0277563773199,18.6010752377383,999999,999999,999999,999999,999999,999999,999999,999999].map(function(number){return array_calc(number)});
var weight6 = [999999,999999,999999,999999,999999,999999,999999,18.4390889145858,17.8044938147649,17.2046505340853,16.6433169770932,16.1245154965971,15.6524758424985,15.2315462117278,14.8660687473185,14.560219778561,14.3178210632764,14.142135623731,14.0356688476182,14,14.0356688476182,14.142135623731,14.3178210632764,14.560219778561,14.8660687473185,15.2315462117278,15.6524758424985,16.1245154965971,16.6433169770932,17.2046505340853,17.8044938147649,18.4390889145858,999999,999999,999999,999999,999999,999999,999999].map(function(number){return array_calc(number)});
var weight7 = [999999,999999,999999,999999,999999,999999,18.3847763108502,17.6918060129541,17.0293863659264,16.4012194668567,15.8113883008419,15.2643375224737,14.7648230602334,14.3178210632764,13.9283882771841,13.6014705087354,13.3416640641263,13.1529464379659,13.0384048104053,13,13.0384048104053,13.1529464379659,13.3416640641263,13.6014705087354,13.9283882771841,14.3178210632764,14.7648230602334,15.2643375224737,15.8113883008419,16.4012194668567,17.0293863659264,17.6918060129541,18.3847763108502,999999,999999,999999,999999,999999,999999].map(function(number){return array_calc(number)});
var weight8 = [999999,999999,999999,999999,999999,18.4390889145858,17.6918060129541,16.9705627484771,16.2788205960997,15.6204993518133,15,14.422205101856,13.8924439894498,13.4164078649987,13,12.6491106406735,12.369316876853,12.1655250605964,12.0415945787923,12,12.0415945787923,12.1655250605964,12.369316876853,12.6491106406735,13,13.4164078649987,13.8924439894498,14.422205101856,15,15.6204993518133,16.2788205960997,16.9705627484771,17.6918060129541,18.4390889145858,999999,999999,999999,999999,999999].map(function(number){return array_calc(number)});
var weight9 = [999999,999999,999999,999999,18.6010752377383,17.8044938147649,17.0293863659264,16.2788205960997,15.556349186104,14.8660687473185,14.2126704035519,13.6014705087354,13.0384048104053,12.5299640861417,12.0830459735946,11.7046999107196,11.4017542509914,11.180339887499,11.0453610171873,11,11.0453610171873,11.180339887499,11.4017542509914,11.7046999107196,12.0830459735946,12.5299640861417,13.0384048104053,13.6014705087354,14.2126704035519,14.8660687473185,15.556349186104,16.2788205960997,17.0293863659264,17.8044938147649,18.6010752377383,999999,999999,999999,999999].map(function(number){return array_calc(number)});
var weight10 = [999999,999999,999999,18.8679622641132,18.0277563773199,17.2046505340853,16.4012194668567,15.6204993518133,14.8660687473185,14.142135623731,13.4536240470737,12.8062484748657,12.2065556157337,11.6619037896906,11.180339887499,10.770329614269,10.4403065089106,10.1980390271856,10.0498756211209,10,10.0498756211209,10.1980390271856,10.4403065089106,10.770329614269,11.180339887499,11.6619037896906,12.2065556157337,12.8062484748657,13.4536240470737,14.142135623731,14.8660687473185,15.6204993518133,16.4012194668567,17.2046505340853,18.0277563773199,18.8679622641132,999999,999999,999999].map(function(number){return array_calc(number)});
var weight11 = [999999,999999,999999,18.3575597506858,17.4928556845359,16.6433169770932,15.8113883008419,15,14.2126704035519,13.4536240470737,12.7279220613579,12.0415945787923,11.4017542509914,10.816653826392,10.295630140987,9.8488578017961,9.48683298050514,9.21954445729289,9.05538513813742,9,9.05538513813742,9.21954445729289,9.48683298050514,9.8488578017961,10.295630140987,10.816653826392,11.4017542509914,12.0415945787923,12.7279220613579,13.4536240470737,14.2126704035519,15,15.8113883008419,16.6433169770932,17.4928556845359,18.3575597506858,999999,999999,999999].map(function(number){return array_calc(number)});
var weight12 = [999999,999999,18.7882942280559,17.8885438199983,17,16.1245154965971,15.2643375224737,14.422205101856,13.6014705087354,12.8062484748657,12.0415945787923,11.3137084989848,10.6301458127347,10,9.4339811320566,8.94427190999916,8.54400374531753,8.24621125123532,8.06225774829855,8,8.06225774829855,8.24621125123532,8.54400374531753,8.94427190999916,9.4339811320566,10,10.6301458127347,11.3137084989848,12.0415945787923,12.8062484748657,13.6014705087354,14.422205101856,15.2643375224737,16.1245154965971,17,17.8885438199983,18.7882942280559,999999,999999].map(function(number){return array_calc(number)});
var weight13 = [999999,999999,18.3847763108502,17.464249196573,16.5529453572468,15.6524758424985,14.7648230602334,13.8924439894498,13.0384048104053,12.2065556157337,11.4017542509914,10.6301458127347,9.89949493661167,9.21954445729289,8.60232526704263,8.06225774829855,7.61577310586391,7.28010988928052,7.07106781186548,7,7.07106781186548,7.28010988928052,7.61577310586391,8.06225774829855,8.60232526704263,9.21954445729289,9.89949493661167,10.6301458127347,11.4017542509914,12.2065556157337,13.0384048104053,13.8924439894498,14.7648230602334,15.6524758424985,16.5529453572468,17.464249196573,18.3847763108502,999999,999999].map(function(number){return array_calc(number)});
var weight14 = [999999,18.9736659610103,18.0277563773199,17.0880074906351,16.1554944214035,15.2315462117278,14.3178210632764,13.4164078649987,12.5299640861417,11.6619037896906,10.816653826392,10,9.21954445729289,8.48528137423857,7.81024967590665,7.21110255092798,6.70820393249937,6.32455532033676,6.08276253029822,6,6.08276253029822,6.32455532033676,6.70820393249937,7.21110255092798,7.81024967590665,8.48528137423857,9.21954445729289,10,10.816653826392,11.6619037896906,12.5299640861417,13.4164078649987,14.3178210632764,15.2315462117278,16.1554944214035,17.0880074906351,18.0277563773199,18.9736659610103,999999].map(function(number){return array_calc(number)});
var weight15 = [999999,18.6815416922694,17.7200451466694,16.7630546142402,15.8113883008419,14.8660687473185,13.9283882771841,13,12.0830459735946,11.180339887499,10.295630140987,9.4339811320566,8.60232526704263,7.81024967590665,7.07106781186548,6.40312423743285,5.8309518948453,5.3851648071345,5.09901951359278,5,5.09901951359278,5.3851648071345,5.8309518948453,6.40312423743285,7.07106781186548,7.81024967590665,8.60232526704263,9.4339811320566,10.295630140987,11.180339887499,12.0830459735946,13,13.9283882771841,14.8660687473185,15.8113883008419,16.7630546142402,17.7200451466694,18.6815416922694,999999].map(function(number){return array_calc(number)});
var weight16 = [999999,18.4390889145858,17.464249196573,16.4924225024706,15.52417469626,14.560219778561,13.6014705087354,12.6491106406735,11.7046999107196,10.770329614269,9.8488578017961,8.94427190999916,8.06225774829855,7.21110255092798,6.40312423743285,5.65685424949238,5,4.47213595499958,4.12310562561766,4,4.12310562561766,4.47213595499958,5,5.65685424949238,6.40312423743285,7.21110255092798,8.06225774829855,8.94427190999916,9.8488578017961,10.770329614269,11.7046999107196,12.6491106406735,13.6014705087354,14.560219778561,15.52417469626,16.4924225024706,17.464249196573,18.4390889145858,999999].map(function(number){return array_calc(number)});
var weight17 = [999999,18.2482875908947,17.2626765016321,16.2788205960997,15.2970585407784,14.3178210632764,13.3416640641263,12.369316876853,11.4017542509914,10.4403065089106,9.48683298050514,8.54400374531753,7.61577310586391,6.70820393249937,5.8309518948453,5,4.24264068711929,3.60555127546399,3.16227766016838,3,3.16227766016838,3.60555127546399,4.24264068711929,5,5.8309518948453,6.70820393249937,7.61577310586391,8.54400374531753,9.48683298050514,10.4403065089106,11.4017542509914,12.369316876853,13.3416640641263,14.3178210632764,15.2970585407784,16.2788205960997,17.2626765016321,18.2482875908947,999999].map(function(number){return array_calc(number)});
var weight18 = [999999,18.1107702762748,17.1172427686237,16.1245154965971,15.1327459504216,14.142135623731,13.1529464379659,12.1655250605964,11.180339887499,10.1980390271856,9.21954445729289,8.24621125123532,7.28010988928052,6.32455532033676,5.3851648071345,4.47213595499958,3.60555127546399,2.82842712474619,2.23606797749979,2,2.23606797749979,2.82842712474619,3.60555127546399,4.47213595499958,5.3851648071345,6.32455532033676,7.28010988928052,8.24621125123532,9.21954445729289,10.1980390271856,11.180339887499,12.1655250605964,13.1529464379659,14.142135623731,15.1327459504216,16.1245154965971,17.1172427686237,18.1107702762748,999999].map(function(number){return array_calc(number)});
var weight19 = [999999,18.0277563773199,17.0293863659264,16.0312195418814,15.0332963783729,14.0356688476182,13.0384048104053,12.0415945787923,11.0453610171873,10.0498756211209,9.05538513813742,8.06225774829855,7.07106781186548,6.08276253029822,5.09901951359278,4.12310562561766,3.16227766016838,2.23606797749979,1.4142135623731,1,1.4142135623731,2.23606797749979,3.16227766016838,4.12310562561766,5.09901951359278,6.08276253029822,7.07106781186548,8.06225774829855,9.05538513813742,10.0498756211209,11.0453610171873,12.0415945787923,13.0384048104053,14.0356688476182,15.0332963783729,16.0312195418814,17.0293863659264,18.0277563773199,999999].map(function(number){return array_calc(number)});
var weight20 = [19,18,17,16,15,14,13,12,11,10,9,8,7,6,5,4,3,2,1,999999,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19].map(function(number){return array_calc(number)});



// Assemble a list of lists: the 39x39 kernel weights as a 2-D matrix.
var kernellists = [weight1, weight2, weight3, weight4, weight5, weight6, weight7, weight8, weight9, weight10, weight11, weight12, weight13, weight14,
                  weight15, weight16, weight17, weight18, weight19, weight20, weight19, weight18, weight17, weight16, weight15,  weight14, weight13, weight12, weight11, weight10, weight9, weight8,
                  weight7, weight6, weight5, weight4, weight3, weight2, weight1];
// Create the kernel from the weights.
var fixedkernel = ee.Kernel.fixed(39, 39, kernellists, -20, -20, true);


var total_indirect_pressure = total_direct_pressure.reduceNeighborhood({reducer:ee.Reducer.mean(), kernel:fixedkernel}).multiply(2)
                    .reproject({crs:'EPSG:4326',scale:scale});

Map.addLayer(total_indirect_pressure,{min:0,max:1, palette:colorlist},'Total Indirect Pressure Score (P*)',false);



// LONG_RANGE (D*) SCORE

var array_calc_defaun = function(number){
  return ee.Number(19).subtract(ee.Number(number));
  };

var weight_defaun1 = [19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19].map(function(number){return array_calc_defaun(number)});
var weight_defaun2 = [19,19,19,19,19,19,19,19,19,19,19,19,19,18.9736659610103,18.6815416922694,18.4390889145858,18.2482875908947,18.1107702762748,18.0277563773199,18,18.0277563773199,18.1107702762748,18.2482875908947,18.4390889145858,18.6815416922694,18.9736659610103,19,19,19,19,19,19,19,19,19,19,19,19,19].map(function(number){return array_calc_defaun(number)});
var weight_defaun3 = [19,19,19,19,19,19,19,19,19,19,19,18.7882942280559,18.3847763108502,18.0277563773199,17.7200451466694,17.464249196573,17.2626765016321,17.1172427686237,17.0293863659264,17,17.0293863659264,17.1172427686237,17.2626765016321,17.464249196573,17.7200451466694,18.0277563773199,18.3847763108502,18.7882942280559,19,19,19,19,19,19,19,19,19,19,19].map(function(number){return array_calc_defaun(number)});
var weight_defaun4 = [19,19,19,19,19,19,19,19,19,18.8679622641132,18.3575597506858,17.8885438199983,17.464249196573,17.0880074906351,16.7630546142402,16.4924225024706,16.2788205960997,16.1245154965971,16.0312195418814,16,16.0312195418814,16.1245154965971,16.2788205960997,16.4924225024706,16.7630546142402,17.0880074906351,17.464249196573,17.8885438199983,18.3575597506858,18.8679622641132,19,19,19,19,19,19,19,19,19].map(function(number){return array_calc_defaun(number)});
var weight_defaun5 = [19,19,19,19,19,19,19,19,18.6010752377383,18.0277563773199,17.4928556845359,17,16.5529453572468,16.1554944214035,15.8113883008419,15.52417469626,15.2970585407784,15.1327459504216,15.0332963783729,15,15.0332963783729,15.1327459504216,15.2970585407784,15.52417469626,15.8113883008419,16.1554944214035,16.5529453572468,17,17.4928556845359,18.0277563773199,18.6010752377383,19,19,19,19,19,19,19,19].map(function(number){return array_calc_defaun(number)});
var weight_defaun6 = [19,19,19,19,19,19,19,18.4390889145858,17.8044938147649,17.2046505340853,16.6433169770932,16.1245154965971,15.6524758424985,15.2315462117278,14.8660687473185,14.560219778561,14.3178210632764,14.142135623731,14.0356688476182,14,14.0356688476182,14.142135623731,14.3178210632764,14.560219778561,14.8660687473185,15.2315462117278,15.6524758424985,16.1245154965971,16.6433169770932,17.2046505340853,17.8044938147649,18.4390889145858,19,19,19,19,19,19,19].map(function(number){return array_calc_defaun(number)});
var weight_defaun7 = [19,19,19,19,19,19,18.3847763108502,17.6918060129541,17.0293863659264,16.4012194668567,15.8113883008419,15.2643375224737,14.7648230602334,14.3178210632764,13.9283882771841,13.6014705087354,13.3416640641263,13.1529464379659,13.0384048104053,13,13.0384048104053,13.1529464379659,13.3416640641263,13.6014705087354,13.9283882771841,14.3178210632764,14.7648230602334,15.2643375224737,15.8113883008419,16.4012194668567,17.0293863659264,17.6918060129541,18.3847763108502,19,19,19,19,19,19].map(function(number){return array_calc_defaun(number)});
var weight_defaun8 = [19,19,19,19,19,18.4390889145858,17.6918060129541,16.9705627484771,16.2788205960997,15.6204993518133,15,14.422205101856,13.8924439894498,13.4164078649987,13,12.6491106406735,12.369316876853,12.1655250605964,12.0415945787923,12,12.0415945787923,12.1655250605964,12.369316876853,12.6491106406735,13,13.4164078649987,13.8924439894498,14.422205101856,15,15.6204993518133,16.2788205960997,16.9705627484771,17.6918060129541,18.4390889145858,19,19,19,19,19].map(function(number){return array_calc_defaun(number)});
var weight_defaun9 = [19,19,19,19,18.6010752377383,17.8044938147649,17.0293863659264,16.2788205960997,15.556349186104,14.8660687473185,14.2126704035519,13.6014705087354,13.0384048104053,12.5299640861417,12.0830459735946,11.7046999107196,11.4017542509914,11.180339887499,11.0453610171873,11,11.0453610171873,11.180339887499,11.4017542509914,11.7046999107196,12.0830459735946,12.5299640861417,13.0384048104053,13.6014705087354,14.2126704035519,14.8660687473185,15.556349186104,16.2788205960997,17.0293863659264,17.8044938147649,18.6010752377383,19,19,19,19].map(function(number){return array_calc_defaun(number)});
var weight_defaun10 = [19,19,19,18.8679622641132,18.0277563773199,17.2046505340853,16.4012194668567,15.6204993518133,14.8660687473185,14.142135623731,13.4536240470737,12.8062484748657,12.2065556157337,11.6619037896906,11.180339887499,10.770329614269,10.4403065089106,10.1980390271856,10.0498756211209,10,10.0498756211209,10.1980390271856,10.4403065089106,10.770329614269,11.180339887499,11.6619037896906,12.2065556157337,12.8062484748657,13.4536240470737,14.142135623731,14.8660687473185,15.6204993518133,16.4012194668567,17.2046505340853,18.0277563773199,18.8679622641132,19,19,19].map(function(number){return array_calc_defaun(number)});
var weight_defaun11 = [19,19,19,18.3575597506858,17.4928556845359,16.6433169770932,15.8113883008419,15,14.2126704035519,13.4536240470737,12.7279220613579,12.0415945787923,11.4017542509914,10.816653826392,10.295630140987,9.8488578017961,9.48683298050514,9.21954445729289,9.05538513813742,9,9.05538513813742,9.21954445729289,9.48683298050514,9.8488578017961,10.295630140987,10.816653826392,11.4017542509914,12.0415945787923,12.7279220613579,13.4536240470737,14.2126704035519,15,15.8113883008419,16.6433169770932,17.4928556845359,18.3575597506858,19,19,19].map(function(number){return array_calc_defaun(number)});
var weight_defaun12 = [19,19,18.7882942280559,17.8885438199983,17,16.1245154965971,15.2643375224737,14.422205101856,13.6014705087354,12.8062484748657,12.0415945787923,11.3137084989848,10.6301458127347,10,9.4339811320566,8.94427190999916,8.54400374531753,8.24621125123532,8.06225774829855,8,8.06225774829855,8.24621125123532,8.54400374531753,8.94427190999916,9.4339811320566,10,10.6301458127347,11.3137084989848,12.0415945787923,12.8062484748657,13.6014705087354,14.422205101856,15.2643375224737,16.1245154965971,17,17.8885438199983,18.7882942280559,19,19].map(function(number){return array_calc_defaun(number)});
var weight_defaun13 = [19,19,18.3847763108502,17.464249196573,16.5529453572468,15.6524758424985,14.7648230602334,13.8924439894498,13.0384048104053,12.2065556157337,11.4017542509914,10.6301458127347,9.89949493661167,9.21954445729289,8.60232526704263,8.06225774829855,7.61577310586391,7.28010988928052,7.07106781186548,7,7.07106781186548,7.28010988928052,7.61577310586391,8.06225774829855,8.60232526704263,9.21954445729289,9.89949493661167,10.6301458127347,11.4017542509914,12.2065556157337,13.0384048104053,13.8924439894498,14.7648230602334,15.6524758424985,16.5529453572468,17.464249196573,18.3847763108502,19,19].map(function(number){return array_calc_defaun(number)});
var weight_defaun14 = [19,18.9736659610103,18.0277563773199,17.0880074906351,16.1554944214035,15.2315462117278,14.3178210632764,13.4164078649987,12.5299640861417,11.6619037896906,10.816653826392,10,9.21954445729289,8.48528137423857,7.81024967590665,7.21110255092798,6.70820393249937,6.32455532033676,6.08276253029822,6,6.08276253029822,6.32455532033676,6.70820393249937,7.21110255092798,7.81024967590665,8.48528137423857,9.21954445729289,10,10.816653826392,11.6619037896906,12.5299640861417,13.4164078649987,14.3178210632764,15.2315462117278,16.1554944214035,17.0880074906351,18.0277563773199,18.9736659610103,19].map(function(number){return array_calc_defaun(number)});
var weight_defaun15 = [19,18.6815416922694,17.7200451466694,16.7630546142402,15.8113883008419,14.8660687473185,13.9283882771841,13,12.0830459735946,11.180339887499,10.295630140987,9.4339811320566,8.60232526704263,7.81024967590665,7.07106781186548,6.40312423743285,5.8309518948453,5.3851648071345,5.09901951359278,5,5.09901951359278,5.3851648071345,5.8309518948453,6.40312423743285,7.07106781186548,7.81024967590665,8.60232526704263,9.4339811320566,10.295630140987,11.180339887499,12.0830459735946,13,13.9283882771841,14.8660687473185,15.8113883008419,16.7630546142402,17.7200451466694,18.6815416922694,19].map(function(number){return array_calc_defaun(number)});
var weight_defaun16 = [19,18.4390889145858,17.464249196573,16.4924225024706,15.52417469626,14.560219778561,13.6014705087354,12.6491106406735,11.7046999107196,10.770329614269,9.8488578017961,8.94427190999916,8.06225774829855,7.21110255092798,6.40312423743285,5.65685424949238,5,4.47213595499958,4.12310562561766,4,4.12310562561766,4.47213595499958,5,5.65685424949238,6.40312423743285,7.21110255092798,8.06225774829855,8.94427190999916,9.8488578017961,10.770329614269,11.7046999107196,12.6491106406735,13.6014705087354,14.560219778561,15.52417469626,16.4924225024706,17.464249196573,18.4390889145858,19].map(function(number){return array_calc_defaun(number)});
var weight_defaun17 = [19,18.2482875908947,17.2626765016321,16.2788205960997,15.2970585407784,14.3178210632764,13.3416640641263,12.369316876853,11.4017542509914,10.4403065089106,9.48683298050514,8.54400374531753,7.61577310586391,6.70820393249937,5.8309518948453,5,4.24264068711929,3.60555127546399,3.16227766016838,3,3.16227766016838,3.60555127546399,4.24264068711929,5,5.8309518948453,6.70820393249937,7.61577310586391,8.54400374531753,9.48683298050514,10.4403065089106,11.4017542509914,12.369316876853,13.3416640641263,14.3178210632764,15.2970585407784,16.2788205960997,17.2626765016321,18.2482875908947,19].map(function(number){return array_calc_defaun(number)});
var weight_defaun18 = [19,18.1107702762748,17.1172427686237,16.1245154965971,15.1327459504216,14.142135623731,13.1529464379659,12.1655250605964,11.180339887499,10.1980390271856,9.21954445729289,8.24621125123532,7.28010988928052,6.32455532033676,5.3851648071345,4.47213595499958,3.60555127546399,2.82842712474619,2.23606797749979,2,2.23606797749979,2.82842712474619,3.60555127546399,4.47213595499958,5.3851648071345,6.32455532033676,7.28010988928052,8.24621125123532,9.21954445729289,10.1980390271856,11.180339887499,12.1655250605964,13.1529464379659,14.142135623731,15.1327459504216,16.1245154965971,17.1172427686237,18.1107702762748,19].map(function(number){return array_calc_defaun(number)});
var weight_defaun19 = [19,18.0277563773199,17.0293863659264,16.0312195418814,15.0332963783729,14.0356688476182,13.0384048104053,12.0415945787923,11.0453610171873,10.0498756211209,9.05538513813742,8.06225774829855,7.07106781186548,6.08276253029822,5.09901951359278,4.12310562561766,3.16227766016838,2.23606797749979,1.4142135623731,1,1.4142135623731,2.23606797749979,3.16227766016838,4.12310562561766,5.09901951359278,6.08276253029822,7.07106781186548,8.06225774829855,9.05538513813742,10.0498756211209,11.0453610171873,12.0415945787923,13.0384048104053,14.0356688476182,15.0332963783729,16.0312195418814,17.0293863659264,18.0277563773199,19].map(function(number){return array_calc_defaun(number)});
var weight_defaun20 = [19,18,17,16,15,14,13,12,11,10,9,8,7,6,5,4,3,2,1,19,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19].map(function(number){return array_calc_defaun(number)});



// Assemble a list of lists: the 39x39 kernel weights as a 2-D matrix.
var kernellists_defaun = [weight_defaun1, weight_defaun2, weight_defaun3, weight_defaun4, weight_defaun5, weight_defaun6, weight_defaun7, weight_defaun8, weight_defaun9, weight_defaun10, weight_defaun11, weight_defaun12, weight_defaun13, weight_defaun14,
                  weight_defaun15, weight_defaun16, weight_defaun17, weight_defaun18, weight_defaun19, weight_defaun20, weight_defaun19, weight_defaun18, weight_defaun17, weight_defaun16, weight_defaun15,  weight_defaun14, weight_defaun13, weight_defaun12, weight_defaun11, weight_defaun10, weight_defaun9, weight_defaun8,
                  weight_defaun7, weight_defaun6, weight_defaun5, weight_defaun4, weight_defaun3, weight_defaun2, weight_defaun1];
                  
// Create the kernel from the weights.
var fixedkernel_defaun = ee.Kernel.fixed(39, 39, kernellists_defaun, -20, -20, true);

// Have to unmask the direct pressure, perform the calculation, then mask again because of the changing resolution
var defaun_pressure = total_direct_pressure.reduceNeighborhood({reducer:ee.Reducer.sum(), kernel:fixedkernel_defaun})
                    .reproject({crs:'EPSG:4326',scale:600});
defaun_pressure = defaun_pressure.resample().reproject({crs:'EPSG:4326',scale:300}).multiply(0.25);
defaun_pressure = defaun_pressure.where(defaun_pressure.gte(0.1),0.1);
      
Map.addLayer(defaun_pressure,{min:0,max:0.1, palette:colorlist},'Long-range effects score (D*) - 12km',false);


// TOTAL PRESSURE SCORE

var total_pressure_raw = total_direct_pressure.add(total_indirect_pressure).add(defaun_pressure)
                              .updateMask(jrc)
                              .updateMask(ocean);
                              
Map.addLayer(total_pressure,{min:0,max:3, palette:colorlist},'Forest Pressure Index (FPI)',false);

forest_cover = forest_cover.updateMask(forest_cover.neq(0));

var forest_cover_ourdefinition  = forest_cover.neq(1)
                                  .multiply(forest_cover.neq(4))
                                  .multiply(forest_cover.neq(12))
                                  .unmask(0)
                                  .resample()
                                  .reproject({crs:'EPSG:4326',scale:300});

Map.addLayer(hansenloss,{max:1},'Initial Hansen loss',false);

var hansenloss_type0 = hansenloss.multiply(loss_classes.eq(0)).selfMask();

Map.addLayer(hansenloss_type0,{palette:['orange']},'Curtis - ???????? loss',false);
var hansenloss_type1 = hansenloss.multiply(loss_classes.eq(1)).selfMask();
Map.addLayer(hansenloss_type1,{palette:['red']},'Curtis - Commodity-driven loss',false);
var hansenloss_type2 = hansenloss.multiply(loss_classes.eq(2)).selfMask();
Map.addLayer(hansenloss_type2,{palette:['yellow']},'Curtis - Shifting agriculture loss',false);
var hansenloss_type3 = hansenloss.multiply(loss_classes.eq(3)).selfMask();
Map.addLayer(hansenloss_type3,{palette:['green']},'Curtis - Forestry loss',false);
var hansenloss_type4 = hansenloss.multiply(loss_classes.eq(4)).selfMask();
Map.addLayer(hansenloss_type4,{palette:['brown']},'Curtis - Wildfire loss',false);
var hansenloss_type5 = hansenloss.multiply(loss_classes.eq(5)).selfMask();
Map.addLayer(hansenloss_type5,{palette:['purple']},'Curtis - Urbanization loss',false);

var fragmincoresize = '20';

var systemscale = '300';
var total_connectivity = function(lossyear){
      var hansen = ee.Image('UMD/hansen/global_forest_change_2018_v1_6').select('treecover2000').gt(20);
      var hansen_lossyear = ee.Image('UMD/hansen/global_forest_change_2018_v1_6').select('lossyear');
      var hansen_loss = hansen_lossyear.lte(lossyear).updateMask(hansen_lossyear.neq(0)).multiply(loss_classes.neq(4)).multiply(loss_classes.neq(2)).multiply(loss_classes.neq(3)).unmask(0);
      var hansen_above30 = hansen.subtract(hansen_loss).gt(0).reproject({crs:'EPSG:4326', scale:ee.Number.parse(systemscale)});
      var hansen_above30_masked = hansen_above30.updateMask(hansen_above30);
      var hansen_no_islet = hansen_above30_masked.connectedPixelCount().reproject({crs:'EPSG:4326', scale:ee.Number.parse(systemscale)}).gte(ee.Number.parse(fragmincoresize)).unmask(0);
      var gaussian_kernel = ee.Kernel.gaussian({radius:8, sigma:2, units:'pixels'});
      var focal_sum = hansen_no_islet.reproject({crs:'EPSG:4326', scale:10000}).reduceNeighborhood({reducer:ee.Reducer.mean(), kernel:gaussian_kernel}).reproject({crs:'EPSG:4326', scale:5000});

      return focal_sum.resample().reproject({crs:'EPSG:4326', scale:300}).updateMask(hansen_no_islet);
      };

var ESACCI_1992 = ESACCI.select('b1');
var ESACCI_2015 = ESACCI.select('b24');

Map.addLayer(ESACCI_2015,{min:0,max:220,palette:esacci_palette},'*ESA-CCI land cover 2015',false);

var bor = ecoreg.filter(ee.Filter.eq('BIOME_NAME','Boreal Forests/Taiga'))
              .reduceToImage(['BIOME_NUM'],ee.Reducer.max()).gt(0)
              .unmask(0)
              .reproject({crs:'EPSG:4326',scale:300});



/*

From http://maps.elie.ucl.ac.be/CCI/viewer/download/ESACCI-LC-QuickUserGuide-LC-Maps_v2-0-7.pdf :


0 No Data
10 Cropland, rainfed
  11 Herbaceous cover
  12 Tree or shrub cover
  
20 Cropland,irrigated or post‐flooding

30 Mosaic cropland (>50%) / natural vegetation (tree, shrub, herbaceous cover) (<50%)

40 Mosaic natural vegetation (tree, shrub, herbaceous cover) (>50%) / cropland (<50%)

50 Tree cover, broadleaved, evergreen, closed to open (>15%)

60 Tree cover, broadleaved, deciduous, closed to open (>15%)
  61 Tree cover, broadleaved, deciduous, closed(>40%)
  62 Tree cover, broadleaved, deciduous, open (15‐40%)

70 Tree cover, needleleaved,evergreen,closedtoopen (>15%)
  71 Tree cover, needleleaved, evergreen, closed (>40%)
  72 Tree cover, needleleaved, evergreen, open (15‐40%)
  
80 Tree cover, needleleaved, deciduous, closed to open (>15%)
  81 Tree cover, needleleaved, deciduous, closed (>40%)
  82 Tree cover, needleleaved, deciduous, open (15‐40%)
  
90 Tree cover, mixed leaf type (broadleaved and needleleaved)

100 Mosaic tree and shrub (>50%) / herbaceous cover (<50%)

110 Mosaic herbaceous cover (>50%) / tree and shrub (<50%)

120 Shrubland
  121 Evergreen shrubland
  122 Deciduous shrubland
  
130 Grassland

140 Lichens and mosses

150 Sparse vegetation (tree, shrub, herbaceous cover) (<15%)
  152 Sparse shrub (<15%)
  153 Sparse herbaceous cover (<15%)

160 Tree cover, flooded, fresh or brakish water

170 Tree cover, flooded, saline water

180 Shrub or herbaceous cover, flooded, fresh/saline/brakish water

190 Urban areas

200 Bare areas
  201 Consolidated bare areas
  202 Unconsolidated bare areas
  
210 Water bodies

220 Permanent snow and ice

*/                    


var ESACCI_60 =  ESACCI_2015.eq(ee.Image.constant(60));
var ESACCI_100 =  ESACCI_2015.eq(ee.Image.constant(100));
var ESACCI_120 =  ESACCI_2015.eq(ee.Image.constant(120));
var ESACCI_121 =  ESACCI_2015.eq(ee.Image.constant(121));
var ESACCI_122 =  ESACCI_2015.eq(ee.Image.constant(122));
var ESACCI_130 =  ESACCI_2015.eq(ee.Image.constant(130));
var ESACCI_140 =  ESACCI_2015.eq(ee.Image.constant(140));
var ESACCI_150 =  ESACCI_2015.eq(ee.Image.constant(150));
var ESACCI_152 =  ESACCI_2015.eq(ee.Image.constant(152));
var ESACCI_180 =  ESACCI_2015.eq(ee.Image.constant(180));
var ESACCI_200 =  ESACCI_2015.eq(ee.Image.constant(200));
var ESACCI_201 =  ESACCI_2015.eq(ee.Image.constant(201));
var ESACCI_202 =  ESACCI_2015.eq(ee.Image.constant(202));
var ESACCI_220 =  ESACCI_2015.eq(ee.Image.constant(220));

var ESACCI_mask = ESACCI_60.add(ESACCI_100).add(ESACCI_120).add(ESACCI_121).add(ESACCI_122).add(ESACCI_130).add(ESACCI_140).add(ESACCI_150).add(ESACCI_152)
                    .add(ESACCI_180).add(ESACCI_200).add(ESACCI_201).add(ESACCI_202).add(ESACCI_220)
                    .add(bor);

var forest_cover_ourdefinition_a = forest_cover_ourdefinition.multiply(ESACCI_mask.neq(1))
                          .reproject({crs:'EPSG:4326', scale:300});

var total_connectivity_original = function(){
  var gaussian_kernel = ee.Kernel.gaussian({radius:8, sigma:2, units:'pixels'});
  var focal_sum = forest_cover_ourdefinition_a.reproject({crs:'EPSG:4326', scale:5000}).reduceNeighborhood({reducer:ee.Reducer.mean(), kernel:gaussian_kernel}).reproject({crs:'EPSG:4326', scale:5000});
  return focal_sum.resample().reproject({crs:'EPSG:4326', scale:300});
  };

Map.addLayer(total_connectivity_original(), {palette:['firebrick','orange','blue','green'],min:0,max:1},'*Potential connectivity',false);

Map.addLayer(total_connectivity(2018), {palette:['firebrick','orange','blue','green'],min:0,max:1},'*2018 connectivity',false);


var ratio_0_1 = ratio.multiply(-1).add(1);

var raw_intact = ratio_0_1.add(total_pressure);

Map.addLayer(raw_intact,{min:0,max:2,palette:['white','black']},'FHI\'',false);


// THIS IS SIMPLY RAW_INTACT, PRELOADED
final_metric = final_metric.where(final_metric.lte(0),0);
Map.addLayer(final_metric,{min:0,max:10,palette:palette_continuous.reverse()},'FHI continuous');


// quartiles
var fim_q1 = final_metric.lte(6);
var fim_q2 = final_metric.gt(6).multiply(final_metric.lte(9.6)).multiply(2);
var fim_q3 = final_metric.gt(9.6).multiply(3);

var fim_categorized = fim_q1.add(fim_q2).add(fim_q3);

Map.addLayer(fim_categorized,{min:1,max:3,palette:palette_trips},'FHI - categorized',false);


Map.addLayer(primary,{palette:['darkgreen']},'Primary humid tropical forests',false);

// COMPARISON DATASETS
var empty = ee.Image().byte();

var ifl_outline = empty.paint({
    featureCollection: intactforest2016,
    color: 1,
    width: 3
  });

Map.addLayer(ifl_outline, {palette:['Gold']}, 'Intact Forest Landscapes 2016',false);

var wdpa_outline = empty.paint({
    featureCollection: wdpa,
    color: 1,
    width: 3
  });

Map.addLayer(wdpa_outline, {palette:['White']}, 'Protected areas (WDPA)',false);



var scapes_outline = empty.paint({
    featureCollection: scapes,
    color: 1,
    width: 3
  });

Map.addLayer(scapes_outline, {palette:['Fuchsia']}, 'WCS Landscapes',false);


var tp_outline = empty.paint({
    featureCollection: tp,
    color: 1,
    width: 3
  });

Map.addLayer(tp_outline, {palette:['Fuchsia']}, 'WRI Plantations',false);











// LEGENDS

// Create the panel for the legend items.
var legend = ui.Panel({
  style: {
    position: 'bottom-left',
    padding: '8px 15px',
    shown: false
  }
});


var legend2 = ui.Panel({
  style: {
    position: 'bottom-right',
    padding: '8px 15px',
    shown: false
  }
});

// Create and add the legend title.
var legendTitle = ui.Label({
  value: 'Land cover type',
  style: {
    fontWeight: 'bold',
    fontSize: '18px',
    margin: '0 0 4px 0',
    padding: '0'
  }
});
legend.add(legendTitle);


// Create and add the legend title.
var legendTitle2 = ui.Label({
  value: 'Forest Health Index',
  style: {
    fontWeight: 'bold',
    fontSize: '18px',
    margin: '0 0 4px 0',
    padding: '0'
  }
});
legend2.add(legendTitle2);


// Creates and styles 1 row of the legend.
var makeRow = function(color, name) {
  // Create the label that is actually the colored box.
  var colorBox = ui.Label({
    style: {
      backgroundColor: '' + color,
      // Use padding to give the box height and width.
      padding: '8px',
      margin: '0 0 8px 0'
    }
  });

  // Create the label filled with the description text.
  var description = ui.Label({
    value: name,
    style: {margin: '0 0 4px 6px'},


  });

  return ui.Panel({
    widgets: [colorBox, description],
    layout: ui.Panel.Layout.Flow('horizontal')
  });
};



legend.add(makeRow('000000', 'No Data'));
legend.add(makeRow('FFFF64', '10 Cropland, rainfed'));
legend.add(makeRow('FFFF64', '11 Herbaceous cover'));
legend.add(makeRow('FFFF00', '12 Tree or shrub cover'));
legend.add(makeRow('AAF0F0', '20 Cropland,irrigated or post‐flooding'));
legend.add(makeRow('DCF064', '30 Mosaic cropland (>50%) / natural vegetation (tree, shrub, herbaceous cover) (<50%)'));
legend.add(makeRow('C7C764', '40 Mosaic natural vegetation (tree, shrub, herbaceous cover) (>50%) / cropland (<50%)'));
legend.add(makeRow('006400', '50 Tree cover, broadleaved, evergreen, closed to open (>15%)'));
legend.add(makeRow('009F00', '60 Tree cover, broadleaved, deciduous, closed to open (>15%)'));
legend.add(makeRow('009F00', '61 Tree cover, broadleaved, deciduous, closed(>40%)'));
legend.add(makeRow('AAC700', '62 Tree cover, broadleaved, deciduous, open (15‐40%)'));
legend.add(makeRow('003B00', '70 Tree cover, needleleaved,evergreen,closedtoopen (>15%)'));
legend.add(makeRow('003B00', '71 Tree cover, needleleaved, evergreen, closed (>40%)'));
legend.add(makeRow('005000', '72 Tree cover, needleleaved, evergreen, open (15‐40%)'));
legend.add(makeRow('275000', '80 Tree cover, needleleaved, deciduous, closed to open (>15%)'));
legend.add(makeRow('275000', '81 Tree cover, needleleaved, deciduous, closed (>40%)'));
legend.add(makeRow('276400', '82 Tree cover, needleleaved, deciduous, open (15‐40%)'));
legend.add(makeRow('788300', '90 Tree cover, mixed leaf type (broadleaved and needleleaved)'));
legend.add(makeRow('8C9F00', '100 Mosaic tree and shrub (>50%) / herbaceous cover (<50%)'));
legend.add(makeRow('BE9600', '110 Mosaic herbaceous cover (>50%) / tree and shrub (<50%)'));
legend.add(makeRow('966400', '120 Shrubland'));
legend.add(makeRow('784B00', '121 Evergreen shrubland'));
legend.add(makeRow('966400', '122 Deciduous shrubland'));
legend.add(makeRow('FFB332', '130 Grassland'));
legend.add(makeRow('FFDCD2', '140 Lichens and mosses'));
legend.add(makeRow('FFEBAE', '150 Sparse vegetation (tree, shrub, herbaceous cover) (<15%)'));
legend.add(makeRow('FFD278', '152 Sparse shrub (<15%)'));
legend.add(makeRow('FFEBAE', '153 Sparse herbaceous cover (<15%)'));
legend.add(makeRow('007859', '160 Tree cover, flooded, fresh or brakish water'));
legend.add(makeRow('009678', '170 Tree cover, flooded, saline water'));
legend.add(makeRow('00DC83', '180 Shrub or herbaceous cover, flooded, fresh/saline/brakish water'));
legend.add(makeRow('C31300', '190 Urban areas'));
legend.add(makeRow('FFF4D7', '200 Bare areas'));
legend.add(makeRow('DCDCDC', '201 Consolidated bare areas'));
legend.add(makeRow('FFF4D7', '202 Unconsolidated bare areas'));
legend.add(makeRow('0046C7', '210 Water bodies'));
legend.add(makeRow('FFFFFF', '220 Permanent snow and ice'));
legend.add(makeRow('ffffff', ''));
legend.add(makeRow('ffffff', '(click map to hide)'));


legend2.add(makeRow('675115', '0'));
legend2.add(makeRow('C7AA44', '2.5'));
legend2.add(makeRow('D5CF3D', '5'));
legend2.add(makeRow('9BBE1C', '7.5'));
legend2.add(makeRow('2b7c00', '10'));
legend2.add(makeRow('ffffff', ''));
legend2.add(makeRow('ffffff', '(click map to hide)'));





// Create a button to unhide the panel.
var button = ui.Button({
    style: {
    position: 'bottom-left',
  },
  label: 'ESA-CCI Legend',
  onClick: function() {
    // Hide the button.
    button.style().set('shown', false);
    // Display the panel.
    legend.style().set('shown', true);

    // Temporarily make a map click hide the panel
    // and show the button.
    var listenerId = Map.onClick(function() {
      legend.style().set('shown', false);
      button.style().set('shown', true);
      // Once the panel is hidden, the map should not
      // try to close it by listening for clicks.
      Map.unlisten(listenerId);
    });
  }
});


// Create a button to unhide the panel.
var button2 = ui.Button({
    style: {
    position: 'bottom-left',
  },
  label: 'Index Legend',
  onClick: function() {
    // Hide the button.
    button2.style().set('shown', false);
    // Display the panel.
    legend2.style().set('shown', true);

    // Temporarily make a map click hide the panel
    // and show the button.
    var listenerId = Map.onClick(function() {
      legend2.style().set('shown', false);
      button2.style().set('shown', true);
      // Once the panel is hidden, the map should not
      // try to close it by listening for clicks.
      Map.unlisten(listenerId);
    });
  }
});


// Add the button to the map and the panel to root.
Map.add(button);
Map.add(button2);
ui.root.insert(0, legend);
ui.root.insert(1, legend2);


