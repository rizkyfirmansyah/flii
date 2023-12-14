var ESACCI = ee.Image('users/aduncan/cci/ESACCI-LC-L4-LCCS-Map-300m-P1Y-1992_2015-v207');
var ecoreg = ee.FeatureCollection('RESOLVE/ECOREGIONS/2017');
var forest_cover = ee.Image('users/aduncan/wri/forest_cover_map');
var loss_classes_old = ee.Image('users/aduncan/wri/Goode_FinalClassification_19_05pcnt_prj'); 
var loss_classes_new = ee.Image('users/aduncan/wri/Curtis_updated_2021_v20220315').unmask(0)
var systemscale = '300'
var fragmincoresize = '20';

Map.addLayer(loss_classes_old,{min:0,max:5,palette:['orange','red','yellow','green','brown','purple']},'Curtis original',false)
Map.addLayer(loss_classes_new,{min:0,max:5,palette:['orange','red','yellow','green','brown','purple']},'Curtis updated',false)


forest_cover = forest_cover.updateMask(forest_cover.neq(0));
 
var forest_cover_ourdefinition  = forest_cover.neq(1)
                                  .multiply(forest_cover.neq(4))
                                  .multiply(forest_cover.neq(12))
                                  .unmask(0)
                                  .resample()
                                  .reproject({crs:'EPSG:4326',scale:300});


var total_connectivity = function(lossyear,loss_classes,unknown_bool){
      var hansen = ee.Image("UMD/hansen/global_forest_change_2021_v1_9").select('treecover2000').gt(20);
      var hansen_lossyear = ee.Image("UMD/hansen/global_forest_change_2022_v1_10").select('lossyear');
      var hansen_loss = hansen_lossyear.lt(lossyear).updateMask(hansen_lossyear.neq(0)).multiply(loss_classes.neq(4)).multiply(loss_classes.neq(2)).multiply(loss_classes.neq(3)).multiply(loss_classes.neq(unknown_bool)).unmask(0);
      var hansen_above30 = hansen.subtract(hansen_loss).gt(0).reproject({crs:'EPSG:4326', scale:ee.Number.parse(systemscale)});
      var hansen_above30_masked = hansen_above30.updateMask(hansen_above30);
      var hansen_no_islet = hansen_above30_masked.connectedPixelCount().reproject({crs:'EPSG:4326', scale:ee.Number.parse(systemscale)}).gte(ee.Number.parse(fragmincoresize)).unmask(0);
      var gaussian_kernel = ee.Kernel.gaussian({radius:8, sigma:2, units:'pixels'});
      var focal_sum = hansen_no_islet.reproject({crs:'EPSG:4326', scale:10000}).reduceNeighborhood({reducer:ee.Reducer.mean(), kernel:gaussian_kernel}).reproject({crs:'EPSG:4326', scale:5000});

      return focal_sum.resample().reproject({crs:'EPSG:4326', scale:300}).updateMask(hansen_no_islet);
      };

var ESACCI_1992 = ESACCI.select('b1');
var ESACCI_2015 = ESACCI.select('b24');


var bor = ecoreg.filter(ee.Filter.eq('BIOME_NAME','Boreal Forests/Taiga'))
              .reduceToImage(['BIOME_NUM'],ee.Reducer.max()).gt(0)
              .unmask(0)
              .reproject({crs:'EPSG:4326',scale:300});


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

var forest_cover_ourdefinition_a = forest_cover_ourdefinition.multiply(ESACCI_mask.neq(1)).multiply(ESACCI_mask.neq(2))
                          .reproject({crs:'EPSG:4326', scale:300});

var total_connectivity_original = function(){
  var gaussian_kernel = ee.Kernel.gaussian({radius:8, sigma:2, units:'pixels'});
  var focal_sum = forest_cover_ourdefinition_a.reproject({crs:'EPSG:4326', scale:5000}).reduceNeighborhood({reducer:ee.Reducer.mean(), kernel:gaussian_kernel}).reproject({crs:'EPSG:4326', scale:5000});
  return focal_sum.resample().reproject({crs:'EPSG:4326', scale:300});
  };

/*
Map.addLayer(total_connectivity(21,loss_classes_old,0), {palette:['firebrick','orange','blue','green'],min:0,max:1},'Curtis orig / ??? not loss - 2021 conn',false);
Map.addLayer(total_connectivity(21,loss_classes_new,0), {palette:['firebrick','orange','blue','green'],min:0,max:1},'Curtis updated / ??? not loss - 2021 conn',false);
Map.addLayer(total_connectivity(21,loss_classes_old,4), {palette:['firebrick','orange','blue','green'],min:0,max:1},'*Curtis orig / ??? is loss - 2021 conn (flii2v4)',false);
Map.addLayer(total_connectivity(21,loss_classes_new,4), {palette:['firebrick','orange','blue','green'],min:0,max:1},'Curtis updated / ??? is loss - 2021 conn',false);
*/


Map.addLayer(total_connectivity(21,loss_classes_new,0), {palette:['firebrick','orange','blue','green'],min:0,max:1},'Curtis updated / ??? not loss - 2022 conn',false);
Map.addLayer(total_connectivity(21,loss_classes_new,4), {palette:['firebrick','orange','blue','green'],min:0,max:1},'Curtis updated / ??? is loss - 2022 conn',false); // THIS IS THE EXPORT ... global_forest_change_2021_v1_9

var connect_modern = ee.Image('users/aduncan/osm_earth/flii2v6_total_connectivity_PRE2021')
Map.addLayer(connect_modern, {palette:['firebrick','orange','blue','green'],min:0,max:1},'*preprocessed connectivity',false);



var earth = ee.Geometry.Polygon([-180, -88, 0, 88, 180, 88, 180, -88, 0, -88, -180, 88], null, false).toGeoJSON() // closer to edges makes it difficult...
var scale = 300


Export.image.toAsset({image:total_connectivity(22,loss_classes_new,4), description:'total_connectivity_PRE2022_20230829', assetId:'osm_earth/flii2v6_total_connectivity_PRE2022', 
                      region:earth, scale:scale, crs:'EPSG:4326', maxPixels:1e13})








































// Create the panel for the legend items.
var legend = ui.Panel({
  style: {
    position: 'bottom-left',
    padding: '8px 15px',
  }
});



// Create and add the legend title.
var legendTitle = ui.Label({
  value: 'Loss classes',
  style: {
    fontWeight: 'bold',
    fontSize: '18px',
    margin: '0 0 4px 0',
    padding: '0'
  }
});
legend.add(legendTitle);



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




legend.add(makeRow('orange', '???????? loss'));
legend.add(makeRow('red', 'Commodity-driven loss'));
legend.add(makeRow('yellow', 'Shifting agriculture loss'));
legend.add(makeRow('green', 'Forestry loss'));
legend.add(makeRow('brown', 'Wildfire loss'));
legend.add(makeRow('purple', 'Urbanization loss'));



Map.add(legend)















