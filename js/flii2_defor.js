var myyear = 22
var firstyear = ee.Number(myyear).subtract(16)
 
var scale = 300
var earth = ee.Geometry.Polygon([-180, -88, 0, 88, 180, 88, 180, -88, 0, -88, -180, 88], null, false).toGeoJSON() // closer to edges makes it difficult...



 
//var Global_cropland_2011 = ee.ImageCollection('users/potapovpeter/Global_cropland_2011').max().reproject({crs:'EPSG:4326',scale:30})
var Global_cropland_2015 = ee.ImageCollection('users/potapovpeter/Global_cropland_2015').max().reproject({crs:'EPSG:4326',scale:30})
var Global_cropland_2019 = ee.ImageCollection('users/potapovpeter/Global_cropland_2019').max().reproject({crs:'EPSG:4326',scale:30})


// REMEMBER TO CHANGE THIS BY YEAR

var crop_bool = Global_cropland_2019.eq(0)//  ee.Image('users/yourecoveredinbees/osm_earth/dir_cropland_LargeKernel_density_300m').eq(0)
Map.addLayer(crop_bool,{min:0,max:1},'crop_bool')

var loss_classes = ee.Image('users/aduncan/wri/Curtis_updated_2021_v20220315').unmask(0)
 

var hansen = ee.Image("UMD/hansen/global_forest_change_2022_v1_10").select('lossyear')
Map.addLayer(hansen,{min:0,max:20},'lossyear')
var hansen_lossyearmask = hansen.lt(myyear).multiply(hansen.gte(firstyear))
//hansen = hansen.multiply(hansen_lossyearmask)
Map.addLayer(hansen_lossyearmask,{min:0,max:1},'lossyear mask')

var hansen_bool = hansen_lossyearmask.multiply(loss_classes.neq(4)).multiply(crop_bool).unmask(0)

Map.addLayer(hansen_bool,{min:0,max:1},'lossyear mask step 2')




//Map.addLayer(hansen,{min:0,max:18},'pre-reduceres')

//var hansen_bool = hansen.gt(0)

//Map.addLayer(hansen_bool,{min:0,max:1},'hansen_bool')


var hansen_bool_post_drop = hansen_bool.selfMask().connectedPixelCount(7).reproject(hansen.projection()).eq(7).unmask(0)
Map.addLayer(hansen_bool_post_drop,{},'post-drop')
//Map.addLayer(hansen_bool_drop_lte2,{min:0,max:1,palette:['red','yellow']},'hansen_bool_upto2')

//highest was 18 (year 19) before... so now if highest is 15 (year 16), should add 3. 
// 2013 loss goes back to 2001... 

//hansen = hansen.multiply(hansen_bool_drop_lte6)
//hansen = hansen.updateMask(hansen.neq(0))

//var numbertoadd = ee.Number(19).subtract(myyear)
//hansen = hansen.add(numbertoadd).unmask(0)
//Map.addLayer(hansen,{min:0,max:18},'hansen post-addition')
// now above 19 I don't want the years below 18...
//var removebelowthis = ee.Number(myyear).subtract(19)
//var hansen_too_old = hansen.lte(removebelowthis)
//hansen = hansen.multiply(hansen_too_old.neq(1))
//Map.addLayer(hansen,{},'TEST')

var defor_reduced_res = hansen_bool_post_drop.reduceResolution({reducer:ee.Reducer.mean(),maxPixels: 65535}).reproject({crs:'EPSG:4326',scale:300}).aside(Map.addLayer,{},'hansen_300')
//Map.addLayer(rast_highway_xxx,{min:0,max:1},'post-reduce-res')


var string = ee.String('flii2v6_defor_dropLTE6_').cat(ee.Number(myyear).format()).getInfo()

Export.image.toAsset({image:defor_reduced_res, description:string, assetId:ee.String('flii2_defor_direct/').cat(string).getInfo(), 
                      region:earth, scale:scale, crs:'EPSG:4326', maxPixels:1e13})

