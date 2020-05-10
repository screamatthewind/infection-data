using System.Collections.Generic;
using System.Globalization;
using System.IO;
using CsvHelper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Diagnostics;
using System;
using System.Linq;
using Microsoft.Extensions.Configuration;

namespace InfectionData.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class RegionsController : ControllerBase
    {
        private IConfiguration _configuration;
        private readonly ILogger<RegionsController> _logger;
        private static string filename = "/tmp/virus.csv";

        public RegionsController(ILogger<RegionsController> logger, IConfiguration configuration)
        {
            _logger = logger;
            _configuration = configuration;
        }

        [HttpGet]
        public IEnumerable<string> Get()
        {
            Helpers.Utils.DownloadRemoteFile(_configuration);

            List<string> tmpRegions = new List<string>();
            List<string> regions = new List<string>();

            using (FileStream file = new FileStream(filename, FileMode.Open, FileAccess.Read, FileShare.ReadWrite))
            using (StreamReader reader = new StreamReader(file))
            using (var csv = new CsvReader(reader, CultureInfo.InvariantCulture))
            {
                var records = csv.GetRecords<dynamic>();
                foreach (var record in records)
                {
                    var dict = (IDictionary<string, object>) record;
                    foreach (var region in dict)
                        tmpRegions.Add(region.Key);

                    break;
                }
            }

            List<string> favoriteRegions = new List<string>() { "All" };

            tmpRegions.Sort();

            if (tmpRegions.Contains("us"))
                favoriteRegions.Add("US");
            else
                favoriteRegions.Add("United States");

            favoriteRegions.Add("Colorado");
            favoriteRegions.Add("Delaware");
            favoriteRegions.Add("Florida");
            favoriteRegions.Add("Georgia USA");
            favoriteRegions.Add("Maryland");
            favoriteRegions.Add("New York");
            favoriteRegions.Add("Ohio");
            favoriteRegions.Add("Tennessee");
            favoriteRegions.Add("South Korea");
            favoriteRegions.Add("Japan");
            favoriteRegions.Add("Taiwan");

            foreach (string region in favoriteRegions)
                regions.Add(region);

            TextInfo myTI = new CultureInfo("en-US", false).TextInfo;

            foreach (string region in tmpRegions)
            {
                // if (!favoriteRegions.Contains(region, StringComparer.OrdinalIgnoreCase) && !region.Equals("datetime"))
                    regions.Add(myTI.ToTitleCase(region));
            }

            return regions;
        }
    }
}
