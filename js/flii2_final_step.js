var myyear = 22
var infra = ee.Image('projects/wcs-forest-second-backup/assets/osm_22_rast_300/new_infra_22')
var defor = ee.Image('users/aduncan/flii2_defor_direct/flii2v6_defor_dropLTE6_22')
var crop = ee.Image('users/aduncan/flii2_crop/flii2_crop_2019') 
var connect_modern = ee.Image('users/aduncan/osm_earth/flii2v6_total_connectivity_PRE2022')
var connect_orig = ee.Image('users/aduncan/osm_earth/total_connectivity_original_borealfixed')

 
var scale = 300
var earth = ee.Geometry.Polygon([-180, -88, 0, 88, 180, 88, 180, -88, 0, -88, -180, 88], null, false).toGeoJSON() // closer to edges makes it difficult...


var jrc = ee.Image('JRC/GSW1_0/GlobalSurfaceWater').select('occurrence').lte(75).unmask(1).multiply(ee.Image(0).clip(ee.FeatureCollection('users/aduncan/caspian')).unmask(1));
var ocean = ee.Image('users/aduncan/cci/ESACCI-LC-L4-WB-Ocean-Map-150m-P13Y-2000-v40');

var hawths_func = function(image,exp_gamma){
              return ee.Image(1).subtract(image.multiply(-1).multiply(ee.Number(exp_gamma)).exp()
                );
              };
               
var colorlist = ['224f1a','a3ff76','feff6f','a09568','ffa802','f7797c','fb0102','d87136','a90086','7a1ca5','421137','000000'];


Map.addLayer(infra,{min:0,max:20},'Raw Direct Infrastructure Pressure Score  (I’)',false);

var infra_hawth_1 = hawths_func(infra,0.254);
Map.addLayer(infra_hawth_1,{min:0,max:1,palette:['white','hotpink']},'Direct Infrastructure Pressure Score (I)',false);


// CREATION OF DIRECT AGRICULTURE PRESSURE SCORE

Map.addLayer(crop,{min:0,max:1},'Raw Direct Agriculture Pressure Score  (A’)',false);


var crop_hawth_1 = hawths_func(crop,2.069);
Map.addLayer(crop_hawth_1,{min:0,max:1,palette:['white','orange']},'Direct Agriculture Pressure Score (A)',false);


//CREATION OF DIRECT DEFOR PRESSURE SCORE

Map.addLayer(defor,{min:0,max:1},'Raw Direct Deforestation Pressure Score  (H’)',false);


var defor_hawth_1 = hawths_func(defor,8.535);
Map.addLayer(defor_hawth_1,{min:0,max:1,palette:['red','white','blue','green','pink','orange','black','purple']},' Direct Deforestation Pressure Score (H)',false);

// TOTAL DIRECT PRESSURE SCORE

var total_direct_pressure = infra_hawth_1
                                .add(crop_hawth_1)
                                .add(defor_hawth_1)
                                .updateMask(jrc)
                                .updateMask(ocean)
                                .unmask(0);
                                
Map.addLayer(total_direct_pressure,{min:0,max:2, palette:colorlist},'Direct Pressure Score (P)',false);
var direct_sanity = ee.Image('users/aduncan/flii2_direct/total_direct_pressure_2017')
Map.addLayer(direct_sanity,{min:0,max:2, palette:colorlist},'Direct Sanity',false);



Export.image.toAsset({image:total_direct_pressure, description:'total_direct_pressure_20' + myyear, assetId:'flii2v2_direct/total_direct_pressure_20'  + myyear, 
                      region:earth, scale:scale, crs:'EPSG:4326', maxPixels:1e13})
                      

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

Export.image.toAsset({image:total_indirect_pressure, description:'total_indirect_pressure_20' + myyear, assetId:'flii2v2_ephemeral/total_indirect_pressure_20'  + myyear, 
                      region:earth, scale:scale, crs:'EPSG:4326', maxPixels:1e13})
                      
                      
                      
                      
var indirect_sanity = ee.Image('users/yourecoveredinbees/flii2_ephemeral/total_indirect_pressure_2017')
Map.addLayer(indirect_sanity,{min:0,max:1, palette:colorlist},'indirect_sanity(P*)',false);


                      
                      

 

// LONG_RANGE (D*) SCORE



var array_calc_defaun = function(number){
  return ee.Number(19).subtract(ee.Number(number))//.multiply(0.02)
  }

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

//print('kernel',fixedkernel_defaun)

// I have to unmask the direct pressure, perform the calculation, then mask again because of the changing resolution

var defaun_pressure = total_direct_pressure.reduceNeighborhood({reducer:ee.Reducer.sum(), kernel:fixedkernel_defaun})
                    .reproject({crs:'EPSG:4326',scale:600})
defaun_pressure = defaun_pressure.resample().reproject({crs:'EPSG:4326',scale:300}).multiply(0.25)
defaun_pressure = defaun_pressure.where(defaun_pressure.gte(0.1),0.1)

Export.image.toAsset({image:defaun_pressure, description:'total_longrange_pressure_20' + myyear, assetId:'flii2v2_ephemeral/total_longrange_pressure_20'  + myyear, 
                      region:earth, scale:scale, crs:'EPSG:4326', maxPixels:1e13})
                      
                      


//pressure section
var total_pressure_raw = total_direct_pressure.add(total_indirect_pressure).add(defaun_pressure)
                              .updateMask(jrc)
                              .updateMask(ocean)   
                              
Export.image.toAsset({image:defaun_pressure, description:'fpi_20' + myyear, assetId:'flii2v3_fpi/fpi_20'  + myyear, 
                      region:earth, scale:scale, crs:'EPSG:4326', maxPixels:1e13})
                              
                              
                              
var colorlist = ['224f1a','a3ff76','feff6f','a09568','ffa802','f7797c','fb0102','d87136','a90086','7a1ca5','421137','000000']
    Map.addLayer(total_direct_pressure,{'min':0,'max':2, 'palette':colorlist},'Direct Pressure Score (P)',true,0.0)
    Map.addLayer(total_indirect_pressure,{'min':0,'max':1, 'palette':colorlist},'Indirect Pressure Score (P)',true,0.0)
    Map.addLayer(defaun_pressure,{min:0,max:0.1, 'palette':colorlist},'Long-range effects score (D*)',true,0.0)

Map.addLayer(total_pressure_raw,{'min':0,'max':3, 'palette':colorlist},'Forest Pressure Index (FPI)',true,0.0)
// connectivity section


Map.addLayer(connect_modern,{},'connect pre-2021')


  
var ratio = connect_modern.divide(connect_orig.unmask(0.001).where(connect_orig.eq(0),0.001))

ratio = ratio.where(ratio.gt(1),1)

Map.addLayer(ratio,{},'lci')


var ratio_0_1 = ratio.multiply(-1).add(1);

var raw_intact = ratio_0_1.add(total_pressure_raw);

var final_metric = ee.Image.constant(10).subtract(raw_intact.multiply(ee.Number(10).divide(ee.Number(3))))
final_metric = final_metric.where(final_metric.lte(0),0)
var palette_continuous = ['#2b7c00','#c2d426','#e8c754','#675115'];

Map.addLayer(final_metric,{min:0,max:10,palette:palette_continuous.reverse()},'flii test');
var scale = 300
var earth = ee.Geometry.Polygon([-180, -88, 0, 88, 180, 88, 180, -88, 0, -88, -180, 88], null, false).toGeoJSON() // closer to edges makes it difficult...


Export.image.toAsset({image:final_metric, description:'flii2_20' + myyear, assetId:'flii2v6_flii/flii2_20'  + myyear, 
                      region:earth, scale:scale, crs:'EPSG:4326', maxPixels:1e13})
                      
//var sanitycheck = ee.Image('users/aduncan/flii2_flii/flii2_2017')
//Map.addLayer(sanitycheck,{min:0,max:10,palette:palette_continuous},'flii sanity check');


Export.image.toDrive({image:final_metric.multiply(10000).toInt().unmask(-9999), 
                        description:'flii2v6_20' + myyear, 
                      region:earth, scale:scale, crs:'EPSG:4326', maxPixels:1e13})