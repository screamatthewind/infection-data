using Amazon.S3;
using Amazon.S3.Model;
using Amazon.S3.Transfer;
using Microsoft.Extensions.Configuration;
using System;
using System.Diagnostics;
using System.IO;
using System.Net.Http;

namespace InfectionData.Helpers
{
    public class Utils
    {
        private static int CHUNK_SIZE = 16777216; // 16MB

        static string s3_access_key_id = "";
        static string s3_secret_access_key = "";
        static string s3_bucket_name = "";
        static string s3_access_point = "";

        static void Init(IConfiguration configuration)
        {
            s3_access_key_id = configuration.GetValue<string>("s3_access_key_id");
            s3_secret_access_key = configuration.GetValue<string>("s3_secret_access_key");
            s3_bucket_name = configuration.GetValue<string>("s3_bucket_name");
            s3_access_point = configuration.GetValue<string>("s3_access_point");
        }

        public static void S3CopyFileToLocal(string keyFilename, string destFilename, IConfiguration configuration)
        {
            Init(configuration);

            string fileContents = S3ReadFile(keyFilename, configuration);

            using (StreamWriter outputFile = new StreamWriter(destFilename))
                outputFile.WriteLine(fileContents);

            Console.WriteLine("S3 File: " + keyFilename + " copied to local: " + keyFilename);
        }

        public static void S3WriteFile(string destFilename, string keyFilename, IConfiguration configuration)
        {
            Init(configuration);

            IAmazonS3 client = new AmazonS3Client(s3_access_key_id, s3_secret_access_key, Amazon.RegionEndpoint.USEast1);

            TransferUtility utility = new TransferUtility(client);
            TransferUtilityUploadRequest request = new TransferUtilityUploadRequest();

            request.BucketName = s3_access_point;
            request.Key = keyFilename;
            request.InputStream = new FileStream(destFilename, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
            request.CannedACL = S3CannedACL.NoACL;
            request.PartSize = CHUNK_SIZE;

            utility.Upload(request);

            Console.WriteLine("Wrote file: " + destFilename + " to bucket: " + s3_bucket_name);
        }

        public static string S3ReadFile(string filename, IConfiguration configuration)
        {
            Init(configuration);

            string responseBody = "";

            GetObjectRequest request = new GetObjectRequest
            {
                BucketName = s3_access_point,
                Key = filename
            };

            IAmazonS3 client = new AmazonS3Client(s3_access_key_id, s3_secret_access_key, Amazon.RegionEndpoint.USEast1);

            using (GetObjectResponse response = client.GetObjectAsync(request).Result)
            using (Stream responseStream = response.ResponseStream)
            using (StreamReader reader = new StreamReader(responseStream))
                responseBody = reader.ReadToEnd();

            Console.WriteLine("Read file: " + filename + " from bucket: " + s3_bucket_name);

            return responseBody;
        }

        public static DateTime? S3FileExists(string filename, IConfiguration configuration)
        {
            try
            {
                Init(configuration);

                IAmazonS3 client = new AmazonS3Client(s3_access_key_id, s3_secret_access_key, Amazon.RegionEndpoint.USEast1);

                var request = new GetObjectMetadataRequest
                {
                    BucketName = s3_access_point,
                    Key = filename.Replace('\\', '/')
                };

                GetObjectMetadataResponse response = client.GetObjectMetadataAsync(request).Result;
                Console.WriteLine("File: " + filename + " exists in S3 - last modified: " + response.LastModified);

                return response.LastModified;
            }
            catch (Exception ex)
            {
                Console.WriteLine("File: " + filename + " not found in S3");
                // Console.WriteLine(ex.ToString());
                return null;
            }
        }

        public static void DownloadRemoteFile(IConfiguration configuration)
        {

            try
            {
                string keyFilename = "virus.csv";
                string destFilename = "/tmp/" + keyFilename;

                FileInfo fi = new FileInfo(destFilename);

                if (fi.Exists)
                {
                    DateTime lastmodified = fi.LastWriteTime;

                    if (DateTime.Now.Date.ToString("d") == lastmodified.Date.ToString("d"))
                    {
                        Console.WriteLine("Found file in local cache: " + destFilename);
                        return;
                    }

                    Console.WriteLine("Found an old file in local cache: " + destFilename);
                }
                else
                    Console.WriteLine("File not found in local cache: " + destFilename);

                DateTime? keyFileDateTime = S3FileExists(keyFilename, configuration);
                if (keyFileDateTime != null)
                {
                    
                    if (DateTime.Now.Date.ToString("d") == ((DateTime) keyFileDateTime).Date.ToString("d"))
                    {
                        S3CopyFileToLocal(keyFilename, destFilename, configuration);
                        Console.WriteLine("Found file in S3 cache: " + keyFilename + " copied to local cache: " + destFilename);
                        return;
                    }
                    else
                        Console.WriteLine("Found an old file in s3 cache: " + keyFilename);
                }
                else
                    Console.WriteLine("File: " + keyFilename +" not found in S3");

                HttpClient client = new HttpClient();

                Console.WriteLine("Downloading file from source: " + keyFilename);

                HttpResponseMessage response = client.GetAsync("http://hgis.uw.edu/virus/assets/virus.csv").Result;
                response.EnsureSuccessStatusCode();

                using (FileStream fileStream = new FileStream(destFilename, FileMode.Create, FileAccess.Write, FileShare.ReadWrite))
                {
                    response.Content.CopyToAsync(fileStream).Wait();

                    S3WriteFile(destFilename, keyFilename, configuration);
                }

            }

            catch (HttpRequestException ex)
            {
                Console.WriteLine(ex.ToString());
            }
            catch (Exception ex)
            {
                // For debugging
                Console.WriteLine(ex.ToString());
            }
        }
    }
}
