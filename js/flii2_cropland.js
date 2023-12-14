var scale = 300
var earth = ee.Geometry.Polygon([-180, -88, 0, 88, 180, 88, 180, -88, 0, -88, -180, 88], null, false).toGeoJSON() // closer to edges makes it difficult...


var rast_cropland_density_300m_direct = ee.Image('users/aduncan/osm_earth/dir_cropland_CorrectlyReduced_density_300m')
Map.addLayer(rast_cropland_density_300m_direct)

var Global_cropland_2011 = ee.ImageCollection('users/potapovpeter/Global_cropland_2011').max().reproject({crs:'EPSG:4326',scale:30})
var Global_cropland_2015 = ee.ImageCollection('users/potapovpeter/Global_cropland_2015').max().reproject({crs:'EPSG:4326',scale:30})
var Global_cropland_2019 = ee.ImageCollection('users/potapovpeter/Global_cropland_2019').max().reproject({crs:'EPSG:4326',scale:30})

var cropland_reduced_2011 = Global_cropland_2011.reduceResolution({reducer:ee.Reducer.mean(),maxPixels: 65535})
                                      .reproject({crs:'EPSG:4326',scale:300}).aside(print).aside(Map.addLayer,{min:0,max:1})
                                      
var cropland_reduced_2015 = Global_cropland_2015.reduceResolution({reducer:ee.Reducer.mean(),maxPixels: 65535})
                                      .reproject({crs:'EPSG:4326',scale:300}).aside(print).aside(Map.addLayer,{min:0,max:1})
                                      
var cropland_reduced_2019 = Global_cropland_2011.reduceResolution({reducer:ee.Reducer.mean(),maxPixels: 65535})
                                      .reproject({crs:'EPSG:4326',scale:300}).aside(print).aside(Map.addLayer,{min:0,max:1})
                                      
Export.image.toAsset({image:cropland_reduced_2011, description:'flii2_crop_2011', assetId:'flii2_crop/flii2_crop_2011', 
                      region:earth, scale:scale, crs:'EPSG:4326', maxPixels:1e13})

Export.image.toAsset({image:cropland_reduced_2015, description:'flii2_crop_2015', assetId:'flii2_crop/flii2_crop_2015', 
                      region:earth, scale:scale, crs:'EPSG:4326', maxPixels:1e13})

Export.image.toAsset({image:cropland_reduced_2019, description:'flii2_crop_2019', assetId:'flii2_crop/flii2_crop_2019', 
                      region:earth, scale:scale, crs:'EPSG:4326', maxPixels:1e13})

 