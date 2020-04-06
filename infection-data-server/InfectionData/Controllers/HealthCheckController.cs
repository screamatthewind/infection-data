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
    public class HealthCheckController : ControllerBase
    {
        private IConfiguration _configuration;
        private readonly ILogger<RegionsController> _logger;
        private static string filename = "/tmp/virus.csv";

        public HealthCheckController(ILogger<RegionsController> logger, IConfiguration configuration)
        {
            _logger = logger;
            _configuration = configuration;
        }

        [HttpGet]
        public string Get()
        {
            try
            {
                Helpers.Utils.DownloadRemoteFile(_configuration);
            }
            catch (Exception)
            {
                return "error";
            }

            return "ok";
        }
    }
}
