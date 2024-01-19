#==========================================================#
# FLII processing to update and ingested into GCP
#==========================================================#
# Author: Rizky Firmansyah
# rizky.firmansyah@wri.org
# SCeNe Coalition, 2023
# Original script developed by Adam Duncan 
# Article: https://www.nature.com/articles/s41467-020-19493-3
# Supplementary Material: https://static-content.springer.com/esm/art%3A10.1038%2Fs41467-020-19493-3/MediaObjects/41467_2020_19493_MOESM1_ESM.pdf


import ee
import time
import geopandas as gpd
import os
import json
import logging
from datetime import datetime
from sqlalchemy import create_engine
import psycopg2
import uuid
from dotenv import load_dotenv
import argparse, sys

current_date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
load_dotenv()

def _parse_args(args):
    parser = argparse.ArgumentParser(
        description="Updating FLII scenarion based on land cover datasets",
        epilog="""Example of usage to process FLII data:
            Download the data into your local folder
                python flii.py -y 22
            """,
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument("-y", "--year", help="Specify the following year")
    
    return parser.parse_args(args)

##################################
# Provide a log to trace the process
##################################
LOG_FILE=os.environ['LOG_FILE_FLII']
logging.basicConfig(filename=LOG_FILE, level=logging.INFO, format='%(asctime)s %(message)s', datefmt='%m/%d/%Y %I:%M:%S %p')
logging.getLogger().addHandler(logging.StreamHandler())
_str_decorator = "=" * 20
logging.info(f"\n{_str_decorator} BEGINNING LOG {_str_decorator}")


##################################
# Initialize Earth Engine
##################################
SERVICE_ACCOUNT = os.environ['SERVICE_ACCOUNT']
KEY_IAM = os.environ["KEY_IAM"]
credentials = ee.ServiceAccountCredentials(SERVICE_ACCOUNT, KEY_IAM)
# Using high-volume EE endpoints to make requests simultaneously as recommended by Gorelick in this blogpost https://gorelick.medium.com/fast-er-downloads-a2abd512aa26
ee.Initialize(credentials, opt_url='https://earthengine-highvolume.googleapis.com')

##################################
### SET YOUR INITIAL PARAMETER HERE
##################################
dbname = os.environ['DB_GIS_NAME']
host = os.environ['DB_GIS_HOST']
port = os.environ['DB_GIS_PORT']
passwd = os.environ['DB_GIS_PASS']
user = os.environ['DB_GIS_USER']
db_connection_uri = "postgresql://"+user+":"+passwd+"@"+host+":"+port+"/"+dbname+""
engine = create_engine(db_connection_uri)
psy_conn = psycopg2.connect(
    host=host,
    port=port,
    database=dbname,
    user=user,
    password=passwd
)
cursor = psy_conn.cursor()
bucket_name = 'assets-geo'
uid = str(uuid.uuid4())[:8]
future_forest_cover = f'future_fc_{uid}'
folder_bucket_file = f'benefit/flii'
path_bucket_file = f'{folder_bucket_file}/{future_forest_cover}.tif'
asset_id = f'projects/ee-gis/assets/{future_forest_cover}'
gcs_path = f'gs://{bucket_name}/{path_bucket_file}'

##################################
### TESTING PURPOSES
##################################
aoi_shp = 'https://storage.googleapis.com/assets-geo/baseline/AOI2_4326.shp'
# aoi_shp = 'https://storage.googleapis.com/assets-geo/baseline/gadm_bbox.shp'
aoi_df = gpd.read_file(aoi_shp).to_json()
aoi = ee.FeatureCollection(json.loads(aoi_df)).geometry()

def array_calc(number):
    """Calculate the power of 0.75 raised to the given number.

    Args:
        number (numeric): The exponent for the power calculation.

    Returns:
        numeric: The result of 0.75 raised to the power of the given number.
    """
    return ee.Number(0.75).pow(ee.Number(number))

def array_calc_defaun(number):
    """Subtract the given number from 19.

    Args:
        number (numeric): The number to be subtracted from 19.

    Returns:
        numeric: The result of subtracting the given number from 19.
    """
    return ee.Number(19).subtract(ee.Number(number))

def log2db_gee_c(asset_id, path_bucket_file, local_path):
    """Store information about processed GEE collections in a PostgreSQL database.

    Args:
        asset_id (str): Asset ID of the processed GEE collection.
        path_bucket_file (str): Path to the bucket file.
        local_path (str): Local path of the processed GEE collection.
    """
    try:
        psy_conn = psycopg2.connect(
            host=host,
            port=port,
            database=dbname,
            user=user,
            password=passwd
        )
        cursor = psy_conn.cursor()
        sql_convert2shp = f"INSERT INTO public.gee_collections (asset_id, path_bucket_file, local_path, created) VALUES ("+asset_id+", "+path_bucket_file+", "+local_path+", '{datetime.now()}')"
        cursor.execute(sql_convert2shp)
        psy_conn.commit()
        
    except psycopg2.ProgrammingError as err:
        psy_conn.rollback()
        logging.error(f"Failed to insert record of {str(asset_id)}: {err}")
    
    finally:
        # release the connection back to the pool
        psy_conn.close()

def export2GCP(image, fileName, aoi, scale=300, crs='EPSG:4326'):
    """Export Earth Engine image to Google Cloud Storage.

    Args:
        image: Earth Engine image to export.
        fileName (str): Name to assign to the exported file.
        aoi: Area of interest for the export.
        scale (int, optional): Resolution in meters. Defaults to 300.
        crs (str, optional): Coordinate Reference System. Defaults to 'EPSG:4326'.
    """
    task = ee.batch.Export.image.toCloudStorage(
        image=image, 
        description=fileName,
        bucket=bucket_name,
        fileNamePrefix='benefit/flii/' + fileName,
        region=aoi,
        scale=scale,
        crs=crs,
        maxPixels=1e13)
    
    task.start()
    while task.active():
        print(f"Waiting on (id: {task.id})")
        time.sleep(30)
    
def export2asset(image, assetId, aoi, scale=300, crs='EPSG:4326'):
    """Export Earth Engine image to an Earth Engine asset.

    Args:
        image: Earth Engine image to export.
        assetId (str): Asset ID to assign to the exported image.
        aoi: Area of interest for the export.
        scale (int, optional): Resolution in meters. Defaults to 300.
        crs (str, optional): Coordinate Reference System. Defaults to 'EPSG:4326'.
    """
    task = ee.batch.Export.image.toAsset(
        image=image, 
        description='exporting ' + assetId,
        assetId=assetId, 
        region=aoi,
        scale=scale,
        crs=crs,
        maxPixels=1e13)
    
    task.start()
    while task.active():
        print(f"Waiting on (id: {task.id})")
        time.sleep(30)
    
def export2drive(image, description, aoi, scale=300, crs='EPSG:4326'):
    """Export Earth Engine image to Google Drive.

    Args:
        image: Earth Engine image to export.
        description (str): Description to assign to the exported file.
        aoi: Area of interest for the export.
        scale (int, optional): Resolution in meters. Defaults to 300.
        crs (str, optional): Coordinate Reference System. Defaults to 'EPSG:4326'.
    """
    task = ee.batch.Export.image.toDrive(
        image=image,
        description=description,
        region=aoi,
        scale=scale,
        crs=crs,
        maxPixels=1e13
    )
        
    task.start()
    while task.active():
        print(f"Waiting on (id: {task.id})")
        time.sleep(30)
        
    task.start()
    while task.active():
        print(f"Waiting on (id: {task.id})")
        time.sleep(30)

def mktemp(prefix=None, dir=None):
    """Create a temporary file path with an optional prefix.

    Args:
        prefix (str, optional): Prefix for the temporary file name. Defaults to None.
        dir (str, optional): Directory path to store the temporary file. Defaults to None.

    Returns:
        str: Temporary file path.
    """
    if dir is None:
        dir = os.path.join(os.getcwd(), 'shp')
    if not os.path.exists(dir):
        os.makedirs(dir, exist_ok=True)
    tempfile = None

    if prefix is None: prefix = '' 
    else: prefix = prefix + '_'

    try:
        tempfile = os.path.join(dir, f"{prefix + str(uuid.uuid4())[:10]}.tif")
    except Exception as e:
        logging.error(f"Something went wrong.")

    return tempfile

def rescale_raster(input_raster, out_file):
    """Reproject and resample a raster to match specific resolution and CRS.

    Args:
        input_raster (str): Absolute path of the input raster file.
        out_file (str): Output file name.

    Returns:
        str: Absolute path of the rescaled raster file.
    """

    from rasterio.enums import Resampling
    from rasterio import open, band
    from rasterio.io import MemoryFile
    from rasterio.crs import CRS
    from rasterio.warp import calculate_default_transform, reproject, Resampling

    src_dataset = open(input_raster)
    
    dst_crs = CRS.from_epsg(4326)
    output_file = mktemp(out_file)
    
    # Define the new pixel size (target resolution)
    new_x_resolution = 0.002694945852358564611
    new_y_resolution = -0.002694945852358564611
    target_resolution = (new_x_resolution, new_y_resolution)
    
    def rescale_meta(src):
        # Compute the new dimensions based on the target resolution
        dst_width = int(src.width * (src.transform.a / target_resolution[0]))
        dst_height = int(src.height * (src.transform.e / target_resolution[1]))
        dst_transform = src.transform * src.transform.scale(
                    (src.width / dst_width), (src.height / dst_height))
        
        out_meta = src.meta.copy()
        out_meta.update({
            "driver": "GTiff",
            "height": dst_height,
            "width": dst_width,
            "transform": dst_transform,
            "count": src.count,
            "dtype": src.dtypes[0],
            "crs": src.crs
        })
        return out_meta
    
    def reproject_meta(src, crs):
        transform, width, height = calculate_default_transform(src.crs, dst_crs, src.width, src.height, *src.bounds)
        out_meta = src.meta.copy()
        out_meta.update({
            'crs': crs,
            'transform': transform,
            'width': width,
            'height': height
        })
        return out_meta
    
    def _reproject(out):
        reproject(
            source=band(src_dataset, 1),
            destination=band(out, 1),
            src_transform=src_dataset.transform,
            src_crs=src_dataset.crs,
            dst_transform=out.transform,
            dst_crs=dst_crs,
            resampling=Resampling.nearest)
    
    try:
        with MemoryFile() as mem_file:
            meta_4326 = reproject_meta(src_dataset, dst_crs)
            with mem_file.open(**meta_4326) as mem_dst:
                # rescale the raster in a single-band raster to 300m x 300m
                _reproject(mem_dst)
                meta_rescale = rescale_meta(mem_dst)                
                dst_dataset = open(output_file, 'w', **meta_rescale)
                _reproject(dst_dataset)
    finally:
        # close the dataset
        dst_dataset.close()
        src_dataset.close()
        logging.info(f"Reproject raster completed. Output saved to {output_file}.")
            
        return output_file

class TotalConnectivity(object):
    """Calculate and export the total connectivity of forests.

    Args:
        future_fc (ee.Image, optional): Earth Engine image representing future forest cover.
        asset_id (str, optional): Asset ID for storing the results in Google Earth Engine.
        output_export (str, optional): Output name for exporting to Google Cloud Storage.

    Attributes:
        esacci (ee.Image): Earth Engine image representing Land Cover Classification for the year 2015.
        ecoregion (ee.FeatureCollection): Earth Engine feature collection representing ecoregions.
        forest_cover (ee.Image): Earth Engine image representing the global forest cover map.
        loss_classes_new (ee.Image): Earth Engine image representing updated loss classes.
        systemscale (int): Spatial resolution of the Earth Engine images (in meters).
        fragmincoresize (int): Minimum core size for calculating connectivity.
        crs (str): Coordinate Reference System (e.g., 'EPSG:4326').
        output_export (str): Output name for exporting to Google Cloud Storage.
        asset_id (str): Asset ID for storing the results in Google Earth Engine.
        gaussian_kernel (ee.Kernel): Gaussian kernel for image convolution.
        future_fc (ee.Image): Earth Engine image representing future forest cover.
        forest_cover_ourdefinition (ee.Image): Processed forest cover based on specified criteria.
        boreal_forest (ee.Image): Binary image indicating the presence of boreal forests.

    Methods:
        connectivity_original(lossyear, loss_classes, unknown_bool):
            Calculate the original total connectivity of forests.

        connectivity_modified():
            Calculate the modified total connectivity of forests.

        main():
            Calculate total connectivity based on specific land cover categories.

        export():
            Export the original total connectivity results to Google Cloud Storage.

        export_to_GCP():
            Export the modified total connectivity results to Google Cloud Storage.

        export_to_asset():
            Export the modified total connectivity results to Google Earth Engine asset.
    """
    def __init__(self, future_fc=None, asset_id=None, output_export=None):
        self.esacci = ee.Image('users/aduncan/cci/ESACCI-LC-L4-LCCS-Map-300m-P1Y-1992_2015-v207')
        self.ecoregion = ee.FeatureCollection('RESOLVE/ECOREGIONS/2017')
        self.forest_cover = ee.Image('users/aduncan/wri/forest_cover_map')
        self.loss_classes_new = ee.Image('users/aduncan/wri/Curtis_updated_2021_v20220315').unmask(0)
        self.systemscale = 300
        self.fragmincoresize = 20
        self.crs = 'EPSG:4326'
        self.output_export = output_export or 'sea_total_connectivity_modified'
        self.asset_id = asset_id or f'projects/ee-gis/assets/{future_forest_cover}'
        self.gaussian_kernel = ee.Kernel.gaussian(radius=8, sigma=2, units='pixels')
        self.future_fc = ee.Image(future_fc) or ''
        self.forest_cover = self.forest_cover.updateMask(self.forest_cover.neq(0))
        self.forest_cover_ourdefinition  = self.forest_cover.neq(1).multiply(self.forest_cover.neq(4)).multiply(self.forest_cover.neq(12)).unmask(0).resample().reproject(crs=self.crs, scale=self.systemscale)
        self.boreal_forest = self.ecoregion.filter(ee.Filter.eq('BIOME_NAME','Boreal Forests/Taiga')).reduceToImage(['BIOME_NUM'],ee.Reducer.max()).gt(0).unmask(0).reproject(crs=self.crs,scale=self.systemscale)

    def connectivity_original(self, lossyear, loss_classes, unknown_bool):
        """Calculate the original total connectivity of forests.

        Args:
            lossyear (int): Year of forest loss.
            loss_classes (ee.Image): Earth Engine image representing loss classes.
            unknown_bool (int): Unknown loss class value.

        Returns:
            ee.Image: Resulting total connectivity image.
        """
        hansen = ee.Image("UMD/hansen/global_forest_change_2021_v1_9").select('treecover2000').gt(20)
        hansen_lossyear = ee.Image("UMD/hansen/global_forest_change_2022_v1_10").select('lossyear')
        hansen_loss = hansen_lossyear.lt(lossyear).updateMask(hansen_lossyear.neq(0)).multiply(loss_classes.neq(4)).multiply(loss_classes.neq(2)).multiply(loss_classes.neq(3)).multiply(loss_classes.neq(unknown_bool)).unmask(0)
        hansen_above30 = hansen.subtract(hansen_loss).gt(0).reproject(crs=self.crs, scale=ee.Number(self.systemscale))
        hansen_above30_masked = hansen_above30.updateMask(hansen_above30)
        hansen_no_islet = hansen_above30_masked.connectedPixelCount().reproject(crs=self.crs, scale=ee.Number(self.systemscale)).gte(ee.Number(self.fragmincoresize)).unmask(0)
        focal_sum = hansen_no_islet.reproject(crs=self.crs, scale=10000).reduceNeighborhood(reducer=ee.Reducer.mean(), kernel=self.gaussian_kernel).reproject(crs=self.crs, scale=5000)

        return focal_sum.resample().reproject(crs=self.crs, scale=self.systemscale).updateMask(hansen_no_islet)
    
    def connectivity_modified(self):
        """Calculate the modified total connectivity of forests.

        Returns:
            ee.Image: Resulting modified total connectivity image.
        """
        focal_sum = self.future_fc.connectedPixelCount().reproject(crs=self.crs, scale=ee.Number(self.systemscale))
        final_focal_sum = focal_sum.reduceNeighborhood(reducer=ee.Reducer.mean(), kernel=self.gaussian_kernel)
        return final_focal_sum

    def main(self):
        """Calculate total connectivity based on specific land cover categories.

        Returns:
            ee.Image: Resulting total connectivity image.
        """
        ESACCI_2015 = self.ESACCI.select('b24')
        ESACCI_60 =  ESACCI_2015.eq(ee.Image.constant(60))
        ESACCI_100 =  ESACCI_2015.eq(ee.Image.constant(100))
        ESACCI_120 =  ESACCI_2015.eq(ee.Image.constant(120))
        ESACCI_121 =  ESACCI_2015.eq(ee.Image.constant(121))
        ESACCI_122 =  ESACCI_2015.eq(ee.Image.constant(122))
        ESACCI_130 =  ESACCI_2015.eq(ee.Image.constant(130))
        ESACCI_140 =  ESACCI_2015.eq(ee.Image.constant(140))
        ESACCI_150 =  ESACCI_2015.eq(ee.Image.constant(150))
        ESACCI_152 =  ESACCI_2015.eq(ee.Image.constant(152))
        ESACCI_180 =  ESACCI_2015.eq(ee.Image.constant(180))
        ESACCI_200 =  ESACCI_2015.eq(ee.Image.constant(200))
        ESACCI_201 =  ESACCI_2015.eq(ee.Image.constant(201))
        ESACCI_202 =  ESACCI_2015.eq(ee.Image.constant(202)) 
        ESACCI_220 =  ESACCI_2015.eq(ee.Image.constant(220))

        ESACCI_mask = ESACCI_60.add(ESACCI_100).add(ESACCI_120).add(ESACCI_121).add(ESACCI_122).add(ESACCI_130).add(ESACCI_140).add(ESACCI_150).add(ESACCI_152).add(ESACCI_180).add(ESACCI_200).add(ESACCI_201).add(ESACCI_202).add(ESACCI_220).add(self.boreal_forest)

        forest_cover_ourdefinition_a = self.forest_cover_ourdefinition.multiply(ESACCI_mask.neq(1)).multiply(ESACCI_mask.neq(2)).reproject(crs=self.crs, scale=self.systemscale)

        def total_connectivity():
            focal_sum = forest_cover_ourdefinition_a.reproject(crs=self.crs, scale=5000).reduceNeighborhood(reducer=ee.Reducer.mean(), kernel=self.gaussian_kernel).reproject(crs=self.crs, scale=5000)
            return focal_sum.resample().reproject(crs=self.crs, scale=self.systemscale)
        
        return total_connectivity()

    def export(self):
        """Export the original total connectivity results to Google Cloud Storage."""
        export2GCP(self.connectivity_original(22, self.loss_classes_new, 4), 'aoi_total_connectivity', aoi)

    def export_to_GCP(self):
        """Export the modified total connectivity results to Google Cloud Storage.

        Returns:
            str: Path to the exported file in Google Cloud Storage.
        """
        export2GCP(self.connectivity_modified(), self.output_export, aoi)
        logging.info(f"Total Connectivity has been finished. Output saved to GCS bucket under '{bucket_name}/benefit/flii/{self.output_export}.tif'")
        return '{bucket_name}/benefit/flii/{self.output_export}.tif'

    def export_to_asset(self):
        """Export the modified total connectivity results to Google Earth Engine asset.

        Returns:
            str: Asset ID of the exported result in Google Earth Engine.
        """
        export2asset(self.connectivity_modified(), self.asset_id, aoi)
        logging.info(f"Total Connectivity has been finished. Output saved to GEE asset with the name of '{self.asset_id}'")
        return self.asset_id

class FLII(object):
    
    def __init__(self, connectivity=None, year=None, mask=None):
        """
        Initialize FLII object.

        Parameters:
        - connectivity (ee.Image, optional): An Earth Engine Image representing connectivity.
        - year (str, optional): A string representing the year.
        - mask (boolean, optional): True or False, default to None/False. If setting True, the image result will be cropped by AoI feature.

        """
        self.year = year or ''
        self.mask = mask
        # Raw Weighted Infrastructure (I’)
        self.infrastructure = ee.Image('projects/wcs-forest-second-backup/assets/osm_22_rast_300/new_infra_22')
        # Raw Direct Deforestation Pressure Score (H’)
        self.deforestation = ee.Image('users/aduncan/flii2_defor_direct/flii2v6_defor_dropLTE6_22')
        # Raw Direct Agriculture Pressure Score (A’)
        self.crop = ee.Image('users/aduncan/flii2_crop/flii2_crop_2019')
        self.connectivity = ee.Image(connectivity) if connectivity else ee.Image('users/aduncan/osm_earth/flii2v6_total_connectivity_PRE2022')
        self.boreal_connectivity = ee.Image('users/aduncan/osm_earth/total_connectivity_original_borealfixed')
        # This dataset contains maps of the location and temporal distribution of surface water from 1984 to 2015 and provides statistics on the extent and change of those water surfaces.
        # These data were generated using 3,066,102 scenes from Landsat 5, 7, and 8 acquired between 16 March 1984 and 10 October 2015. Each pixel was individually classified into water / non-water using an expert system and the results were collated into a monthly history for the entire time period and two epochs (1984-1999, 2000-2015) for change detection.
        # self.direct_sanity = ee.Image('users/aduncan/flii2_direct/total_direct_pressure_2017')
        # self.indirect_sanity = ee.Image('users/yourecoveredinbees/flii2_ephemeral/total_indirect_pressure_2017')
        self.water_extent = ee.Image('JRC/GSW1_0/GlobalSurfaceWater').select('occurrence').lte(75).unmask(1).multiply(ee.Image(0).clip(ee.FeatureCollection('users/aduncan/caspian')).unmask(1))
        self.ocean = ee.Image('users/aduncan/cci/ESACCI-LC-L4-WB-Ocean-Map-150m-P13Y-2000-v40')
        self.start_date = '2017-03-01'
        self.end_date = '2017-03-31'
        self.scale = 300
        self.infra_hawths = self.hawths(self.infrastructure, 0.254)
        self.crop_hawths = self.hawths(self.crop, 2.069)
        self.defo_hawths = self.hawths(self.deforestation, 8.535)
        self.total_direct_pressure = self.infra_hawths.updateMask(self.water_extent).updateMask(self.ocean).unmask(0) if connectivity else self.infra_hawths.add(self.crop_hawths).add(self.defo_hawths).updateMask(self.water_extent).updateMask(self.ocean).unmask(0)
        self.crs = 'EPSG:4326'
        self.total_indirect_pressure = self.total_direct_pressure.reduceNeighborhood(
                    reducer=ee.Reducer.mean(),
                    kernel=self.kernelIndirect()).multiply(2).reproject(crs=self.crs,scale=self.scale)
        
        # I have to unmask the direct pressure, perform the calculation, then mask again because of the changing resolution
        self.defaun_pressure = self.total_direct_pressure.reduceNeighborhood(
                    reducer=ee.Reducer.sum(),
                    kernel=self.kernelDefaun()).reproject(crs=self.crs,scale=600)
        self.final_defaun_pressure = self.defaun_pressure.resample().reproject(crs=self.crs,scale=self.scale).multiply(0.25).where(self.defaun_pressure.gte(0.1),0.1)
        self.total_pressure_raw = self.total_direct_pressure.add(self.total_indirect_pressure).add(self.final_defaun_pressure).updateMask(self.water_extent).updateMask(self.ocean) 
        self.ratio = self.connectivity if connectivity else self.connectivity.divide(self.boreal_connectivity.unmask(0.001).where(self.boreal_connectivity.eq(0),0.001))
        self.final_ratio = self.connectivity if connectivity else self.ratio.where(self.ratio.gt(1),1)
        
    def hawths(self, image, exp_gamma):
        """
        Compute the Hawths transformation on the input image.

        Parameters:
        - image (ee.Image): Input Earth Engine Image.
        - exp_gamma (float): Exponential gamma parameter.

        Returns:
        - ee.Image: Transformed Image.

        """
        return ee.Image(1).subtract(image.multiply(-1).multiply(ee.Number(exp_gamma)).exp())
    
    def kernelIndirect(self):
        """
        Generate a fixed kernel for indirect pressure calculation.

        Returns:
        - ee.Kernel: Fixed kernel.

        """
        _weight1 = [999999,999999,999999,999999,999999,999999,999999,999999,999999,999999,999999,999999,999999,999999,999999,999999,999999,999999,999999,19,999999,999999,999999,999999,999999,999999,999999,999999,999999,999999,999999,999999,999999,999999,999999,999999,999999,999999,999999]
        _weight2 = [999999,999999,999999,999999,999999,999999,999999,999999,999999,999999,999999,999999,999999,18.9736659610103,18.6815416922694,18.4390889145858,18.2482875908947,18.1107702762748,18.0277563773199,18,18.0277563773199,18.1107702762748,18.2482875908947,18.4390889145858,18.6815416922694,18.9736659610103,999999,999999,999999,999999,999999,999999,999999,999999,999999,999999,999999,999999,999999]
        _weight3 = [999999,999999,999999,999999,999999,999999,999999,999999,999999,999999,999999,18.7882942280559,18.3847763108502,18.0277563773199,17.7200451466694,17.464249196573,17.2626765016321,17.1172427686237,17.0293863659264,17,17.0293863659264,17.1172427686237,17.2626765016321,17.464249196573,17.7200451466694,18.0277563773199,18.3847763108502,18.7882942280559,999999,999999,999999,999999,999999,999999,999999,999999,999999,999999,999999]
        _weight4 = [999999,999999,999999,999999,999999,999999,999999,999999,999999,18.8679622641132,18.3575597506858,17.8885438199983,17.464249196573,17.0880074906351,16.7630546142402,16.4924225024706,16.2788205960997,16.1245154965971,16.0312195418814,16,16.0312195418814,16.1245154965971,16.2788205960997,16.4924225024706,16.7630546142402,17.0880074906351,17.464249196573,17.8885438199983,18.3575597506858,18.8679622641132,999999,999999,999999,999999,999999,999999,999999,999999,999999]
        _weight5 = [999999,999999,999999,999999,999999,999999,999999,999999,18.6010752377383,18.0277563773199,17.4928556845359,17,16.5529453572468,16.1554944214035,15.8113883008419,15.52417469626,15.2970585407784,15.1327459504216,15.0332963783729,15,15.0332963783729,15.1327459504216,15.2970585407784,15.52417469626,15.8113883008419,16.1554944214035,16.5529453572468,17,17.4928556845359,18.0277563773199,18.6010752377383,999999,999999,999999,999999,999999,999999,999999,999999]
        _weight6 = [999999,999999,999999,999999,999999,999999,999999,18.4390889145858,17.8044938147649,17.2046505340853,16.6433169770932,16.1245154965971,15.6524758424985,15.2315462117278,14.8660687473185,14.560219778561,14.3178210632764,14.142135623731,14.0356688476182,14,14.0356688476182,14.142135623731,14.3178210632764,14.560219778561,14.8660687473185,15.2315462117278,15.6524758424985,16.1245154965971,16.6433169770932,17.2046505340853,17.8044938147649,18.4390889145858,999999,999999,999999,999999,999999,999999,999999]
        _weight7 = [999999,999999,999999,999999,999999,999999,18.3847763108502,17.6918060129541,17.0293863659264,16.4012194668567,15.8113883008419,15.2643375224737,14.7648230602334,14.3178210632764,13.9283882771841,13.6014705087354,13.3416640641263,13.1529464379659,13.0384048104053,13,13.0384048104053,13.1529464379659,13.3416640641263,13.6014705087354,13.9283882771841,14.3178210632764,14.7648230602334,15.2643375224737,15.8113883008419,16.4012194668567,17.0293863659264,17.6918060129541,18.3847763108502,999999,999999,999999,999999,999999,999999]
        _weight8 = [999999,999999,999999,999999,999999,18.4390889145858,17.6918060129541,16.9705627484771,16.2788205960997,15.6204993518133,15,14.422205101856,13.8924439894498,13.4164078649987,13,12.6491106406735,12.369316876853,12.1655250605964,12.0415945787923,12,12.0415945787923,12.1655250605964,12.369316876853,12.6491106406735,13,13.4164078649987,13.8924439894498,14.422205101856,15,15.6204993518133,16.2788205960997,16.9705627484771,17.6918060129541,18.4390889145858,999999,999999,999999,999999,999999]
        _weight9 = [999999,999999,999999,999999,18.6010752377383,17.8044938147649,17.0293863659264,16.2788205960997,15.556349186104,14.8660687473185,14.2126704035519,13.6014705087354,13.0384048104053,12.5299640861417,12.0830459735946,11.7046999107196,11.4017542509914,11.180339887499,11.0453610171873,11,11.0453610171873,11.180339887499,11.4017542509914,11.7046999107196,12.0830459735946,12.5299640861417,13.0384048104053,13.6014705087354,14.2126704035519,14.8660687473185,15.556349186104,16.2788205960997,17.0293863659264,17.8044938147649,18.6010752377383,999999,999999,999999,999999]
        _weight10 = [999999,999999,999999,18.8679622641132,18.0277563773199,17.2046505340853,16.4012194668567,15.6204993518133,14.8660687473185,14.142135623731,13.4536240470737,12.8062484748657,12.2065556157337,11.6619037896906,11.180339887499,10.770329614269,10.4403065089106,10.1980390271856,10.0498756211209,10,10.0498756211209,10.1980390271856,10.4403065089106,10.770329614269,11.180339887499,11.6619037896906,12.2065556157337,12.8062484748657,13.4536240470737,14.142135623731,14.8660687473185,15.6204993518133,16.4012194668567,17.2046505340853,18.0277563773199,18.8679622641132,999999,999999,999999]
        _weight11 = [999999,999999,999999,18.3575597506858,17.4928556845359,16.6433169770932,15.8113883008419,15,14.2126704035519,13.4536240470737,12.7279220613579,12.0415945787923,11.4017542509914,10.816653826392,10.295630140987,9.8488578017961,9.48683298050514,9.21954445729289,9.05538513813742,9,9.05538513813742,9.21954445729289,9.48683298050514,9.8488578017961,10.295630140987,10.816653826392,11.4017542509914,12.0415945787923,12.7279220613579,13.4536240470737,14.2126704035519,15,15.8113883008419,16.6433169770932,17.4928556845359,18.3575597506858,999999,999999,999999]
        _weight12 = [999999,999999,18.7882942280559,17.8885438199983,17,16.1245154965971,15.2643375224737,14.422205101856,13.6014705087354,12.8062484748657,12.0415945787923,11.3137084989848,10.6301458127347,10,9.4339811320566,8.94427190999916,8.54400374531753,8.24621125123532,8.06225774829855,8,8.06225774829855,8.24621125123532,8.54400374531753,8.94427190999916,9.4339811320566,10,10.6301458127347,11.3137084989848,12.0415945787923,12.8062484748657,13.6014705087354,14.422205101856,15.2643375224737,16.1245154965971,17,17.8885438199983,18.7882942280559,999999,999999]
        _weight13 = [999999,999999,18.3847763108502,17.464249196573,16.5529453572468,15.6524758424985,14.7648230602334,13.8924439894498,13.0384048104053,12.2065556157337,11.4017542509914,10.6301458127347,9.89949493661167,9.21954445729289,8.60232526704263,8.06225774829855,7.61577310586391,7.28010988928052,7.07106781186548,7,7.07106781186548,7.28010988928052,7.61577310586391,8.06225774829855,8.60232526704263,9.21954445729289,9.89949493661167,10.6301458127347,11.4017542509914,12.2065556157337,13.0384048104053,13.8924439894498,14.7648230602334,15.6524758424985,16.5529453572468,17.464249196573,18.3847763108502,999999,999999]
        _weight14 = [999999,18.9736659610103,18.0277563773199,17.0880074906351,16.1554944214035,15.2315462117278,14.3178210632764,13.4164078649987,12.5299640861417,11.6619037896906,10.816653826392,10,9.21954445729289,8.48528137423857,7.81024967590665,7.21110255092798,6.70820393249937,6.32455532033676,6.08276253029822,6,6.08276253029822,6.32455532033676,6.70820393249937,7.21110255092798,7.81024967590665,8.48528137423857,9.21954445729289,10,10.816653826392,11.6619037896906,12.5299640861417,13.4164078649987,14.3178210632764,15.2315462117278,16.1554944214035,17.0880074906351,18.0277563773199,18.9736659610103,999999]
        _weight15 = [999999,18.6815416922694,17.7200451466694,16.7630546142402,15.8113883008419,14.8660687473185,13.9283882771841,13,12.0830459735946,11.180339887499,10.295630140987,9.4339811320566,8.60232526704263,7.81024967590665,7.07106781186548,6.40312423743285,5.8309518948453,5.3851648071345,5.09901951359278,5,5.09901951359278,5.3851648071345,5.8309518948453,6.40312423743285,7.07106781186548,7.81024967590665,8.60232526704263,9.4339811320566,10.295630140987,11.180339887499,12.0830459735946,13,13.9283882771841,14.8660687473185,15.8113883008419,16.7630546142402,17.7200451466694,18.6815416922694,999999]
        _weight16 = [999999,18.4390889145858,17.464249196573,16.4924225024706,15.52417469626,14.560219778561,13.6014705087354,12.6491106406735,11.7046999107196,10.770329614269,9.8488578017961,8.94427190999916,8.06225774829855,7.21110255092798,6.40312423743285,5.65685424949238,5,4.47213595499958,4.12310562561766,4,4.12310562561766,4.47213595499958,5,5.65685424949238,6.40312423743285,7.21110255092798,8.06225774829855,8.94427190999916,9.8488578017961,10.770329614269,11.7046999107196,12.6491106406735,13.6014705087354,14.560219778561,15.52417469626,16.4924225024706,17.464249196573,18.4390889145858,999999]
        _weight17 = [999999,18.2482875908947,17.2626765016321,16.2788205960997,15.2970585407784,14.3178210632764,13.3416640641263,12.369316876853,11.4017542509914,10.4403065089106,9.48683298050514,8.54400374531753,7.61577310586391,6.70820393249937,5.8309518948453,5,4.24264068711929,3.60555127546399,3.16227766016838,3,3.16227766016838,3.60555127546399,4.24264068711929,5,5.8309518948453,6.70820393249937,7.61577310586391,8.54400374531753,9.48683298050514,10.4403065089106,11.4017542509914,12.369316876853,13.3416640641263,14.3178210632764,15.2970585407784,16.2788205960997,17.2626765016321,18.2482875908947,999999]
        _weight18 = [999999,18.1107702762748,17.1172427686237,16.1245154965971,15.1327459504216,14.142135623731,13.1529464379659,12.1655250605964,11.180339887499,10.1980390271856,9.21954445729289,8.24621125123532,7.28010988928052,6.32455532033676,5.3851648071345,4.47213595499958,3.60555127546399,2.82842712474619,2.23606797749979,2,2.23606797749979,2.82842712474619,3.60555127546399,4.47213595499958,5.3851648071345,6.32455532033676,7.28010988928052,8.24621125123532,9.21954445729289,10.1980390271856,11.180339887499,12.1655250605964,13.1529464379659,14.142135623731,15.1327459504216,16.1245154965971,17.1172427686237,18.1107702762748,999999]
        _weight19 = [999999,18.0277563773199,17.0293863659264,16.0312195418814,15.0332963783729,14.0356688476182,13.0384048104053,12.0415945787923,11.0453610171873,10.0498756211209,9.05538513813742,8.06225774829855,7.07106781186548,6.08276253029822,5.09901951359278,4.12310562561766,3.16227766016838,2.23606797749979,1.4142135623731,1,1.4142135623731,2.23606797749979,3.16227766016838,4.12310562561766,5.09901951359278,6.08276253029822,7.07106781186548,8.06225774829855,9.05538513813742,10.0498756211209,11.0453610171873,12.0415945787923,13.0384048104053,14.0356688476182,15.0332963783729,16.0312195418814,17.0293863659264,18.0277563773199,999999]
        _weight20 = [19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 999999, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]
        
        weight1 = [array_calc(number) for number in _weight1]
        weight2 = [array_calc(number) for number in _weight2]
        weight3 = [array_calc(number) for number in _weight3]
        weight4 = [array_calc(number) for number in _weight4]
        weight5 = [array_calc(number) for number in _weight5]
        weight6 = [array_calc(number) for number in _weight6]
        weight7 = [array_calc(number) for number in _weight7]
        weight8 = [array_calc(number) for number in _weight8]
        weight9 = [array_calc(number) for number in _weight9]
        weight10 = [array_calc(number) for number in _weight10]
        weight11 = [array_calc(number) for number in _weight11]
        weight12 = [array_calc(number) for number in _weight12]
        weight13 = [array_calc(number) for number in _weight13]
        weight14 = [array_calc(number) for number in _weight14]
        weight15 = [array_calc(number) for number in _weight15]
        weight16 = [array_calc(number) for number in _weight16]
        weight17 = [array_calc(number) for number in _weight17]
        weight18 = [array_calc(number) for number in _weight18]
        weight19 = [array_calc(number) for number in _weight19]
        weight20 = [array_calc(number) for number in _weight20]

        # Assemble a list of lists: the 39x39 kernel weights as a 2-D matrix.
        kernellists = [weight1, weight2, weight3, weight4, weight5, weight6, weight7, weight8, weight9, weight10, weight11, weight12, weight13, weight14,
                        weight15, weight16, weight17, weight18, weight19, weight20, weight19, weight18, weight17, weight16, weight15,  weight14, weight13, weight12, weight11, weight10, weight9, weight8,
                        weight7, weight6, weight5, weight4, weight3, weight2, weight1]
        # Create the kernel from the weights.
        fixedkernel = ee.Kernel.fixed(39, 39, kernellists, -20, -20, True)
        
        return fixedkernel
            
    def kernelDefaun(self):
        """
        Generate a fixed kernel for defaunation pressure calculation.

        Returns:
        - ee.Kernel: Fixed kernel.

        """
        _weight_defaun1 = [19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19]
        _weight_defaun2 = [19,19,19,19,19,19,19,19,19,19,19,19,19,18.9736659610103,18.6815416922694,18.4390889145858,18.2482875908947,18.1107702762748,18.0277563773199,18,18.0277563773199,18.1107702762748,18.2482875908947,18.4390889145858,18.6815416922694,18.9736659610103,19,19,19,19,19,19,19,19,19,19,19,19,19]
        _weight_defaun3 = [19,19,19,19,19,19,19,19,19,19,19,18.7882942280559,18.3847763108502,18.0277563773199,17.7200451466694,17.464249196573,17.2626765016321,17.1172427686237,17.0293863659264,17,17.0293863659264,17.1172427686237,17.2626765016321,17.464249196573,17.7200451466694,18.0277563773199,18.3847763108502,18.7882942280559,19,19,19,19,19,19,19,19,19,19,19]
        _weight_defaun4 = [19,19,19,19,19,19,19,19,19,18.8679622641132,18.3575597506858,17.8885438199983,17.464249196573,17.0880074906351,16.7630546142402,16.4924225024706,16.2788205960997,16.1245154965971,16.0312195418814,16,16.0312195418814,16.1245154965971,16.2788205960997,16.4924225024706,16.7630546142402,17.0880074906351,17.464249196573,17.8885438199983,18.3575597506858,18.8679622641132,19,19,19,19,19,19,19,19,19]
        _weight_defaun5 = [19,19,19,19,19,19,19,19,18.6010752377383,18.0277563773199,17.4928556845359,17,16.5529453572468,16.1554944214035,15.8113883008419,15.52417469626,15.2970585407784,15.1327459504216,15.0332963783729,15,15.0332963783729,15.1327459504216,15.2970585407784,15.52417469626,15.8113883008419,16.1554944214035,16.5529453572468,17,17.4928556845359,18.0277563773199,18.6010752377383,19,19,19,19,19,19,19,19]
        _weight_defaun6 = [19,19,19,19,19,19,19,18.4390889145858,17.8044938147649,17.2046505340853,16.6433169770932,16.1245154965971,15.6524758424985,15.2315462117278,14.8660687473185,14.560219778561,14.3178210632764,14.142135623731,14.0356688476182,14,14.0356688476182,14.142135623731,14.3178210632764,14.560219778561,14.8660687473185,15.2315462117278,15.6524758424985,16.1245154965971,16.6433169770932,17.2046505340853,17.8044938147649,18.4390889145858,19,19,19,19,19,19,19]
        _weight_defaun7 = [19,19,19,19,19,19,18.3847763108502,17.6918060129541,17.0293863659264,16.4012194668567,15.8113883008419,15.2643375224737,14.7648230602334,14.3178210632764,13.9283882771841,13.6014705087354,13.3416640641263,13.1529464379659,13.0384048104053,13,13.0384048104053,13.1529464379659,13.3416640641263,13.6014705087354,13.9283882771841,14.3178210632764,14.7648230602334,15.2643375224737,15.8113883008419,16.4012194668567,17.0293863659264,17.6918060129541,18.3847763108502,19,19,19,19,19,19]
        _weight_defaun8 = [19,19,19,19,19,18.4390889145858,17.6918060129541,16.9705627484771,16.2788205960997,15.6204993518133,15,14.422205101856,13.8924439894498,13.4164078649987,13,12.6491106406735,12.369316876853,12.1655250605964,12.0415945787923,12,12.0415945787923,12.1655250605964,12.369316876853,12.6491106406735,13,13.4164078649987,13.8924439894498,14.422205101856,15,15.6204993518133,16.2788205960997,16.9705627484771,17.6918060129541,18.4390889145858,19,19,19,19,19]
        _weight_defaun9 = [19,19,19,19,18.6010752377383,17.8044938147649,17.0293863659264,16.2788205960997,15.556349186104,14.8660687473185,14.2126704035519,13.6014705087354,13.0384048104053,12.5299640861417,12.0830459735946,11.7046999107196,11.4017542509914,11.180339887499,11.0453610171873,11,11.0453610171873,11.180339887499,11.4017542509914,11.7046999107196,12.0830459735946,12.5299640861417,13.0384048104053,13.6014705087354,14.2126704035519,14.8660687473185,15.556349186104,16.2788205960997,17.0293863659264,17.8044938147649,18.6010752377383,19,19,19,19]
        _weight_defaun10 = [19,19,19,18.8679622641132,18.0277563773199,17.2046505340853,16.4012194668567,15.6204993518133,14.8660687473185,14.142135623731,13.4536240470737,12.8062484748657,12.2065556157337,11.6619037896906,11.180339887499,10.770329614269,10.4403065089106,10.1980390271856,10.0498756211209,10,10.0498756211209,10.1980390271856,10.4403065089106,10.770329614269,11.180339887499,11.6619037896906,12.2065556157337,12.8062484748657,13.4536240470737,14.142135623731,14.8660687473185,15.6204993518133,16.4012194668567,17.2046505340853,18.0277563773199,18.8679622641132,19,19,19]
        _weight_defaun11 = [19,19,19,18.3575597506858,17.4928556845359,16.6433169770932,15.8113883008419,15,14.2126704035519,13.4536240470737,12.7279220613579,12.0415945787923,11.4017542509914,10.816653826392,10.295630140987,9.8488578017961,9.48683298050514,9.21954445729289,9.05538513813742,9,9.05538513813742,9.21954445729289,9.48683298050514,9.8488578017961,10.295630140987,10.816653826392,11.4017542509914,12.0415945787923,12.7279220613579,13.4536240470737,14.2126704035519,15,15.8113883008419,16.6433169770932,17.4928556845359,18.3575597506858,19,19,19]
        _weight_defaun12 = [19,19,18.7882942280559,17.8885438199983,17,16.1245154965971,15.2643375224737,14.422205101856,13.6014705087354,12.8062484748657,12.0415945787923,11.3137084989848,10.6301458127347,10,9.4339811320566,8.94427190999916,8.54400374531753,8.24621125123532,8.06225774829855,8,8.06225774829855,8.24621125123532,8.54400374531753,8.94427190999916,9.4339811320566,10,10.6301458127347,11.3137084989848,12.0415945787923,12.8062484748657,13.6014705087354,14.422205101856,15.2643375224737,16.1245154965971,17,17.8885438199983,18.7882942280559,19,19]
        _weight_defaun13 = [19,19,18.3847763108502,17.464249196573,16.5529453572468,15.6524758424985,14.7648230602334,13.8924439894498,13.0384048104053,12.2065556157337,11.4017542509914,10.6301458127347,9.89949493661167,9.21954445729289,8.60232526704263,8.06225774829855,7.61577310586391,7.28010988928052,7.07106781186548,7,7.07106781186548,7.28010988928052,7.61577310586391,8.06225774829855,8.60232526704263,9.21954445729289,9.89949493661167,10.6301458127347,11.4017542509914,12.2065556157337,13.0384048104053,13.8924439894498,14.7648230602334,15.6524758424985,16.5529453572468,17.464249196573,18.3847763108502,19,19]
        _weight_defaun14 = [19,18.9736659610103,18.0277563773199,17.0880074906351,16.1554944214035,15.2315462117278,14.3178210632764,13.4164078649987,12.5299640861417,11.6619037896906,10.816653826392,10,9.21954445729289,8.48528137423857,7.81024967590665,7.21110255092798,6.70820393249937,6.32455532033676,6.08276253029822,6,6.08276253029822,6.32455532033676,6.70820393249937,7.21110255092798,7.81024967590665,8.48528137423857,9.21954445729289,10,10.816653826392,11.6619037896906,12.5299640861417,13.4164078649987,14.3178210632764,15.2315462117278,16.1554944214035,17.0880074906351,18.0277563773199,18.9736659610103,19]
        _weight_defaun15 = [19,18.6815416922694,17.7200451466694,16.7630546142402,15.8113883008419,14.8660687473185,13.9283882771841,13,12.0830459735946,11.180339887499,10.295630140987,9.4339811320566,8.60232526704263,7.81024967590665,7.07106781186548,6.40312423743285,5.8309518948453,5.3851648071345,5.09901951359278,5,5.09901951359278,5.3851648071345,5.8309518948453,6.40312423743285,7.07106781186548,7.81024967590665,8.60232526704263,9.4339811320566,10.295630140987,11.180339887499,12.0830459735946,13,13.9283882771841,14.8660687473185,15.8113883008419,16.7630546142402,17.7200451466694,18.6815416922694,19]
        _weight_defaun16 = [19,18.4390889145858,17.464249196573,16.4924225024706,15.52417469626,14.560219778561,13.6014705087354,12.6491106406735,11.7046999107196,10.770329614269,9.8488578017961,8.94427190999916,8.06225774829855,7.21110255092798,6.40312423743285,5.65685424949238,5,4.47213595499958,4.12310562561766,4,4.12310562561766,4.47213595499958,5,5.65685424949238,6.40312423743285,7.21110255092798,8.06225774829855,8.94427190999916,9.8488578017961,10.770329614269,11.7046999107196,12.6491106406735,13.6014705087354,14.560219778561,15.52417469626,16.4924225024706,17.464249196573,18.4390889145858,19]
        _weight_defaun17 = [19,18.2482875908947,17.2626765016321,16.2788205960997,15.2970585407784,14.3178210632764,13.3416640641263,12.369316876853,11.4017542509914,10.4403065089106,9.48683298050514,8.54400374531753,7.61577310586391,6.70820393249937,5.8309518948453,5,4.24264068711929,3.60555127546399,3.16227766016838,3,3.16227766016838,3.60555127546399,4.24264068711929,5,5.8309518948453,6.70820393249937,7.61577310586391,8.54400374531753,9.48683298050514,10.4403065089106,11.4017542509914,12.369316876853,13.3416640641263,14.3178210632764,15.2970585407784,16.2788205960997,17.2626765016321,18.2482875908947,19]
        _weight_defaun18 = [19,18.1107702762748,17.1172427686237,16.1245154965971,15.1327459504216,14.142135623731,13.1529464379659,12.1655250605964,11.180339887499,10.1980390271856,9.21954445729289,8.24621125123532,7.28010988928052,6.32455532033676,5.3851648071345,4.47213595499958,3.60555127546399,2.82842712474619,2.23606797749979,2,2.23606797749979,2.82842712474619,3.60555127546399,4.47213595499958,5.3851648071345,6.32455532033676,7.28010988928052,8.24621125123532,9.21954445729289,10.1980390271856,11.180339887499,12.1655250605964,13.1529464379659,14.142135623731,15.1327459504216,16.1245154965971,17.1172427686237,18.1107702762748,19]
        _weight_defaun19 = [19,18.0277563773199,17.0293863659264,16.0312195418814,15.0332963783729,14.0356688476182,13.0384048104053,12.0415945787923,11.0453610171873,10.0498756211209,9.05538513813742,8.06225774829855,7.07106781186548,6.08276253029822,5.09901951359278,4.12310562561766,3.16227766016838,2.23606797749979,1.4142135623731,1,1.4142135623731,2.23606797749979,3.16227766016838,4.12310562561766,5.09901951359278,6.08276253029822,7.07106781186548,8.06225774829855,9.05538513813742,10.0498756211209,11.0453610171873,12.0415945787923,13.0384048104053,14.0356688476182,15.0332963783729,16.0312195418814,17.0293863659264,18.0277563773199,19]
        _weight_defaun20 = [19,18,17,16,15,14,13,12,11,10,9,8,7,6,5,4,3,2,1,19,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19]

        weight1 = [array_calc_defaun(number) for number in _weight_defaun1]
        weight2 = [array_calc_defaun(number) for number in _weight_defaun2]
        weight3 = [array_calc_defaun(number) for number in _weight_defaun3]
        weight4 = [array_calc_defaun(number) for number in _weight_defaun4]
        weight5 = [array_calc_defaun(number) for number in _weight_defaun5]
        weight6 = [array_calc_defaun(number) for number in _weight_defaun6]
        weight7 = [array_calc_defaun(number) for number in _weight_defaun7]
        weight8 = [array_calc_defaun(number) for number in _weight_defaun8]
        weight9 = [array_calc_defaun(number) for number in _weight_defaun9]
        weight10 = [array_calc_defaun(number) for number in _weight_defaun10]
        weight11 = [array_calc_defaun(number) for number in _weight_defaun11]
        weight12 = [array_calc_defaun(number) for number in _weight_defaun12]
        weight13 = [array_calc_defaun(number) for number in _weight_defaun13]
        weight14 = [array_calc_defaun(number) for number in _weight_defaun14]
        weight15 = [array_calc_defaun(number) for number in _weight_defaun15]
        weight16 = [array_calc_defaun(number) for number in _weight_defaun16]
        weight17 = [array_calc_defaun(number) for number in _weight_defaun17]
        weight18 = [array_calc_defaun(number) for number in _weight_defaun18]
        weight19 = [array_calc_defaun(number) for number in _weight_defaun19]
        weight20 = [array_calc_defaun(number) for number in _weight_defaun20]
        
        # Assemble a list of lists: the 39x39 kernel weights as a 2-D matrix.
        kernellists_defaun = [weight1, weight2, weight3, weight4, weight5, weight6, weight7, weight8, weight9, weight10, weight11, weight12, weight13, weight14,
                        weight15, weight16, weight17, weight18, weight19, weight20, weight19, weight18, weight17, weight16, weight15,  weight14, weight13, weight12, weight11, weight10, weight9, weight8,
                        weight7, weight6, weight5, weight4, weight3, weight2, weight1]
        # Create the kernel from the weights.
        fixedkernel_defaun = ee.Kernel.fixed(39, 39, kernellists_defaun, -20, -20, True)
        return fixedkernel_defaun

    def getAsset(self):
        export2asset(self.total_indirect_pressure, 'flii2v2_ephemeral/total_indirect_pressure_20' + self.year, aoi)
        export2asset(self.defaun_pressure, 'flii2v2_ephemeral/total_longrange_pressure_20' + self.year, aoi)
        export2asset(self.defaun_pressure, 'flii2v3_fpi/fpi_20' + self.year, aoi)
        
    def export_sample(self):
        """
        Exports the sample image to Google Cloud Storage (GCS) bucket.

        Returns:
        None
        """
        _file = 'flii2v6_defor_dropLTE6_22'
        export2GCP(self.deforestation, f'{_file}', aoi)
        logging.info(f"Exported finished, saving to GCS bucket '{bucket_name}/{folder_bucket_file}/{_file}'.")
        
    def flii_metric(self):
        """
        Calculates the FLII metric based on the provided input images and parameters.
        Optionally applies a mask and exports the result to a GCS bucket.

        Returns:
        str: The URL of the saved output in the GCS bucket.
        """
        ratio_0_1 = self.final_ratio.multiply(-1).add(1)
        raw_intact = ratio_0_1.add(self.total_pressure_raw)
        final_metric = ee.Image.constant(10).subtract(raw_intact.multiply(ee.Number(10).divide(ee.Number(3))))
        final_metric = final_metric.where(final_metric.lte(0),0)
        # export2GCP(final_metric.multiply(10000).toInt().unmask(-9999), f'flii_{uid}', aoi)
        
        if self.mask:
            _ = ee.Image.constant(1).clip(aoi).mask()
            final_metric = final_metric.updateMask(_).unmask(-9999)
            
        _output_file = f'flii_{uid}'
        export2GCP(final_metric, _output_file, aoi)
        logging.info(f"FLII modeled has been finised. Output saved to GCS bucket under '{bucket_name}/{folder_bucket_file}/{_output_file}.tif'")
        return f'https://storage.googleapis.com/{bucket_name}/{folder_bucket_file}/{_output_file}.tif'


def upload_to_bucket(path_to_file, bucket_name, blob_name):
    """
    Uploads data to a Google Cloud Storage (GCS) bucket.

    Args:
        path_to_file (str): Path to the file to be uploaded.
        bucket_name (str): Name of the GCS bucket.
        blob_name (str): Name to be given to the blob in the bucket.

    Returns:
        str: Public URL of the uploaded file.
    """
    from google.cloud import storage

    # Explicitly use service account credentials by specifying the private key file.
    storage_client = storage.Client.from_service_account_json(KEY_IAM)

    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(blob_name)
    blob.upload_from_filename(path_to_file)
    logging.info(f"File {path_to_file} uploaded to {blob_name}.")
    
    #returns a public url
    return blob.public_url

def check_geetask_status(task_id):
    """
    Checks the status of an Earth Engine task.

    Args:
        task_id (str): Unique task ID. Check on this URL: https://code.earthengine.google.com/tasks

    Returns:
        str: State of the task ('RUNNING', 'COMPLETED', 'FAILED', etc.).
    """
    try:
        task_status = ee.data.getTaskStatus(task_id)[0]
        return task_status['state']
    except Exception as e:
        print(f'Error checking task status: {e}')
        return None
        
def wait_for_task_completion(task_id, polling_interval=15):
    """
    Waits for an Earth Engine task to complete.

    Args:
        task_id (str): Unique task ID. Check on this URL: https://code.earthengine.google.com/tasks
        polling_interval (int, optional): Interval (in seconds) between status checks. Defaults to 30.
    """
    while True:
        status = check_geetask_status(task_id)
        if status is not None:
            print(f'Task {task_id} status: {status}')
            if status in ['COMPLETED', 'FAILED']:
                break
        elif status is None:
            break
        time.sleep(polling_interval)

def start_ee_upload(asset_id, gcs_path):
    """
    Ingests a GeoTIFF file from Google Cloud Storage into Google Earth Engine using the earthengine command.

    Args:
        asset_id (str): Asset ID in Google Earth Engine.
        gcs_path (str): Path to the GeoTIFF file in Google Cloud Storage.

    Returns:
        str: Task ID of the upload task.
    """
    from subprocess import Popen, PIPE
    from re import search
    process = Popen(['earthengine', 'upload', 'image', f'--asset_id={asset_id}', gcs_path], stdout=PIPE, text=True)
    
    # Capture the output of the command
    output, _ = process.communicate()
    # Extract the task ID from the output using a regex
    task_match = search(r'Started upload task with ID: (\w+)', output)

    if task_match:
        task_id = task_match.group(1)
        return task_id
    else:
        print(f'Error: Task ID not found in the command output.')
        return None
    
def start_ee_public(asset_id):
    """
    Sets the access control of an Earth Engine asset to public.

    Args:
        asset_id (str): Asset ID in Google Earth Engine.
    """
    from subprocess import Popen, PIPE
    process = Popen(['earthengine', 'acl', 'set', 'public', asset_id], stdout=PIPE, text=True)
    # Capture the output of the command
    output, _ = process.communicate()
    return None

def remove_asset(asset_id):
    """
    Removes the specified asset from Google Earth Engine.
    This command is irreversible, and once an asset is deleted, it cannot be recovered.

    Args:
        asset_id (str): Asset ID in Google Earth Engine.
    """
    from subprocess import Popen, PIPE
    process = Popen(['earthengine', 'rm', asset_id], stdout=PIPE, text=True)
    # Capture the output of the command
    output, _ = process.communicate()
    return None

def delete_gcs_file(bucket_name, path_bucket_file):
    """
    Deletes a file from Google Cloud Storage.

    Args:
        bucket_name (str): Name of the GCS bucket.
        path_bucket_file (str): Path to the file in the GCS bucket.
    """
    from google.cloud import storage
     
    # Explicitly use service account credentials by specifying the private key file.
    storage_client = storage.Client.from_service_account_json(KEY_IAM)

    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(path_bucket_file)
    
    # Delete the blob
    blob.delete()
    logging.info(f"File gs://{bucket_name}/{path_bucket_file} deleted successfully.")

def cleanup_raster(asset_id, bucket_name, path_bucket_file, local_file=False):
    """
    Deletes intermediary data produced during the FLII model process.

    Args:
        asset_id (str): Asset ID to be removed from Google Earth Engine.
        bucket_name (str): Name of the GCS bucket.
        path_bucket_file (str): Path to the file in the GCS bucket.
        local_file (bool, optional): Whether to delete the local file. Defaults to False.
    """
    remove_asset(asset_id)
    delete_gcs_file(bucket_name, path_bucket_file)
    if local_file:
        os.remove(local_file)
        
def summary_statistics(aoi_shp, raster, stats='mean'):
    """
    Computes summary statistics of a raster within the specified AOI.

    Args:
        aoi_shp (str): Path to the AOI shapefile.
        raster (str): Path to the raster file.
        stats (str, optional): Type of statistics to compute (e.g., 'mean'). Defaults to 'mean'.

    Returns:
        str: Formatted summary statistics.
    """
    from rasterstats import zonal_stats
    
    _ = zonal_stats(aoi_shp, raster, stats=stats)

    avg_stat = [stat[stats] for stat in _]
    round_avg_stat = f'{avg_stat[0]:,.1f}'

    logging.info(f"Summary statistics of FLII Model: {round_avg_stat}")
    return f'{round_avg_stat}'
    
def main(input_raster):
    args = _parse_args(sys.argv[1:])
    start = datetime.now()
    _connectivity = input_raster
    _connectivity_rescale = rescale_raster(_connectivity, 'futureforest')

    try:
        upload_to_bucket(_connectivity_rescale, bucket_name, path_bucket_file)
    finally:
        task_id = start_ee_upload(asset_id, gcs_path)
        try:
            wait_for_task_completion(task_id)
        finally:
            start_ee_public(asset_id)
            fetch_gee = FLII(connectivity=asset_id, mask=True)
            flii_model = fetch_gee.flii_metric()
            summary_statistics(aoi_shp, flii_model)

    logging.info(f"elapsed time to process the data: {datetime.now() - start}")
    
if __name__ == "__main__":
    input_raster = '/Users/rizkyfirmansyah/Documents/PLATFORM/nbs/flii/shp/AOI2_proj_fc_avoided_def.tif'
    main(input_raster)
    
    # cleanup_raster(asset_id, bucket_name, path_bucket_file)