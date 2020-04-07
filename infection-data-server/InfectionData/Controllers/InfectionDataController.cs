using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using CsvHelper;
using InfectionData.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Diagnostics;
using Microsoft.Extensions.Configuration;

namespace InfectionData.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class InfectionDataController : ControllerBase
    {
        private IConfiguration _configuration;
        private readonly ILogger<InfectionDataController> _logger;
        private static string filename = "/tmp/virus.csv";

        public InfectionDataController(ILogger<InfectionDataController> logger, IConfiguration configuration)
        {
            _logger = logger;
            _configuration = configuration;
        }

        [HttpGet]
        public IEnumerable<Infection> Get(string region, string pStartDate, string pEndDate)
        {
            Helpers.Utils.DownloadRemoteFile(_configuration);

            List<Infection> infections = new List<Infection>();

            IDictionary<string, object> dict = new Dictionary<string, object>();

            using (FileStream file = new FileStream(filename, FileMode.Open, FileAccess.Read, FileShare.ReadWrite))
            using (StreamReader reader = new StreamReader(file))
            using (var csv = new CsvReader(reader, CultureInfo.InvariantCulture))
            {
                int SumAggregatedConfirmed = 0;
                int SumActiveConfirmed = 0;
                int SumRecovered = 0;
                int SumDeaths = 0;

                DateTime dateTime = new DateTime();

                var records = csv.GetRecords<dynamic>();
                foreach (var record in records)
                {
                    string[] data = null;
                    int safeInt = 0;

                    if (region == null)
                        region = "all";

                    if (region.ToLower().Equals("all"))
                    {
                        foreach (KeyValuePair<string, object> kvp in record)
                        {
                            // Debug.WriteLine(kvp.Key + ": " + kvp.Value);

                            if (kvp.Key.Equals("datetime"))
                            {
                                dateTime = DateTime.Parse(kvp.Value.ToString());
                            }

                            else
                            {
                                if (!kvp.Key.Equals("us") && !kvp.Key.Equals("united states"))
                                {
                                    data = kvp.Value.ToString().Split("-");
                                    if (data.Count() == 4)
                                    {
                                        int.TryParse(data[0], out safeInt);
                                        SumAggregatedConfirmed += safeInt;

                                        int.TryParse(data[2], out safeInt);
                                        SumRecovered += safeInt;

                                        int.TryParse(data[3], out safeInt);
                                        SumDeaths += safeInt;
                                    }
                                }
                            }
                        }

                    }
                    else
                    {
                        dict = (IDictionary<string, object>)record;
                        region = region.ToLower();

                        try
                        {
                            data = dict[region].ToString().Split("-");
                        }
                        catch (Exception)
                        {
                        }
                    }

                    if ((data != null) && (data.Count() == 4))
                    {
                        int aggregatedConfirmed = int.Parse(data[0]);

                        if (aggregatedConfirmed > 0)
                        {
                            if (dict.Count() > 0)
                            {
                                dateTime = DateTime.Parse(dict["datetime"].ToString());

                                int.TryParse(data[0], out safeInt);
                                int AggregatedConfirmed = safeInt;

                                int.TryParse(data[2], out safeInt);
                                int Recovered = safeInt;

                                int.TryParse(data[3], out safeInt);
                                int Deaths = safeInt;

                                int ActiveConfirmed = AggregatedConfirmed - (Recovered + Deaths);


                                infections.Add(new Infection
                                {
                                    Date = dateTime.Date.ToString("d"),
                                    AggregatedConfirmed = AggregatedConfirmed,
                                    ActiveConfirmed = ActiveConfirmed,
                                    Recovered = Recovered,
                                    Deaths = Deaths
                                });
                            }
                        }
                    }

                    if (region.ToLower().Equals("all"))
                    {

                        SumActiveConfirmed = SumAggregatedConfirmed - (SumRecovered + SumDeaths);

                        if (SumActiveConfirmed > 0)
                        {
                            infections.Add(new Infection
                            {
                                Date = dateTime.Date.ToString("d"),
                                AggregatedConfirmed = SumAggregatedConfirmed,
                                ActiveConfirmed = SumActiveConfirmed,
                                Recovered = SumRecovered,
                                Deaths = SumDeaths
                            });

                            Debug.WriteLine(SumAggregatedConfirmed + "-" + SumActiveConfirmed + "-" + SumRecovered + "-" + SumDeaths);
                        }

                        SumAggregatedConfirmed = 0;
                        SumActiveConfirmed = 0;
                        SumRecovered = 0;
                        SumDeaths = 0;
                    }
                }
            }

            updateDeltas(infections);
            updateDaysToDouble(infections);

            return infections.ToArray();
        }

        private void updateDeltas(List<Infection> infections)
        {
            int ctr = 0;
            Infection priorInfection = null;

            foreach (Infection infection in infections)
            {
                if (ctr > 0)
                {
                    infection.AggregatedConfirmedDelta = infection.AggregatedConfirmed - priorInfection.AggregatedConfirmed;

                    if (priorInfection.AggregatedConfirmed != 0)
                        infection.AggregatedConfirmedPctChange = (infection.AggregatedConfirmedDelta * 100) / priorInfection.AggregatedConfirmed;

                    infection.ActiveConfirmedDelta = infection.ActiveConfirmed - priorInfection.ActiveConfirmed;

                    if (priorInfection.ActiveConfirmed != 0)
                        infection.ActiveConfirmedPctChange = (infection.ActiveConfirmedDelta * 100) / priorInfection.ActiveConfirmed;

                    infection.RecoveredDelta = infection.Recovered - priorInfection.Recovered;

                    if (priorInfection.Recovered != 0)
                        infection.RecoveredPctChange = (infection.RecoveredDelta * 100) / priorInfection.Recovered;

                    infection.DeathsDelta = infection.Deaths - priorInfection.Deaths;

                    if (priorInfection.Deaths != 0)
                        infection.DeathsPctChange = (infection.DeathsDelta * 100) / priorInfection.Deaths;

                    if (infection.AggregatedConfirmedPctChange > 100)
                        infection.AggregatedConfirmedPctChange = 0;

                    if (infection.ActiveConfirmedPctChange > 100)
                        infection.ActiveConfirmedPctChange = 0;

                    if (infection.RecoveredPctChange > 100)
                        infection.RecoveredPctChange = 0;

                    if (infection.DeathsPctChange > 100)
                        infection.DeathsPctChange = 0;
                }

                if (ctr > 1)
                {
                    if (priorInfection.AggregatedConfirmedDelta != 0)
                        infection.AggregatedConfirmedPctDeltaChange = ((infection.AggregatedConfirmedDelta - priorInfection.AggregatedConfirmedDelta) * 100) / priorInfection.AggregatedConfirmedDelta;

                    if (priorInfection.ActiveConfirmedDelta != 0)
                        infection.ActiveConfirmedPctDeltaChange = ((infection.ActiveConfirmedDelta - priorInfection.ActiveConfirmedDelta) * 100) / priorInfection.ActiveConfirmedDelta;

                    if (priorInfection.RecoveredDelta != 0)
                        infection.RecoveredPctDeltaChange = ((infection.RecoveredDelta - priorInfection.RecoveredDelta) * 100) / priorInfection.RecoveredDelta;

                    if (priorInfection.DeathsDelta != 0)
                        infection.DeathsPctDeltaChange = ((infection.DeathsDelta - priorInfection.DeathsDelta) * 100) / priorInfection.DeathsDelta;

                    //infection.AggregatedConfirmedPctDeltaChange = (int) Math.Log(infection.AggregatedConfirmedPctDeltaChange);
                    //infection.ActiveConfirmedPctDeltaChange = (int) Math.Log(infection.ActiveConfirmedPctDeltaChange);

                    if ((infection.AggregatedConfirmedPctDeltaChange > 1000) || (infection.AggregatedConfirmedPctDeltaChange < -1000))
                        infection.AggregatedConfirmedPctDeltaChange = 0;

                    if ((infection.ActiveConfirmedPctDeltaChange > 1000) || (infection.ActiveConfirmedPctDeltaChange < -1000))
                        infection.ActiveConfirmedPctDeltaChange = 0;

                    if ((infection.RecoveredPctDeltaChange > 1000) || (infection.RecoveredPctDeltaChange < -1000))
                        infection.RecoveredPctDeltaChange = 0;

                    if ((infection.DeathsPctDeltaChange > 1000) || (infection.DeathsPctDeltaChange < -1000))
                        infection.DeathsPctDeltaChange = 0;
                }

                priorInfection = infection;

                ctr++;
            }
        }

        private void updateDaysToDouble(List<Infection> infections)
        {
            int runningTotalAggregatedConfirmed = 0;
            int priorAggregatedConfirmedDoubleAmount = 0;
            int aggregatedConfirmedDaysToDouble = 0;

            int runningTotalActiveConfirmed = 0;
            int priorActiveConfirmedDoubleAmount = 0;
            int activeConfirmedDaysToDouble = 0;

            int runningTotalRecovered = 0;
            int priorRecoveredDoubleAmount = 0;
            int recoveredDaysToDouble = 0;

            int runningTotalDeaths = 0;
            int priorDeathsDoubleAmount = 0;
            int deathsDaysToDouble = 0;

            foreach (Infection infection in infections)
            {
                runningTotalAggregatedConfirmed += infection.AggregatedConfirmed;
                runningTotalActiveConfirmed += infection.ActiveConfirmed;
                runningTotalRecovered += infection.Recovered;
                runningTotalDeaths += infection.Deaths;

                if (priorAggregatedConfirmedDoubleAmount == 0)
                    priorAggregatedConfirmedDoubleAmount = infection.AggregatedConfirmed;

                if (priorActiveConfirmedDoubleAmount == 0)
                    priorActiveConfirmedDoubleAmount = infection.ActiveConfirmed;

                if (priorRecoveredDoubleAmount == 0)
                    priorRecoveredDoubleAmount = infection.Recovered;

                if (priorDeathsDoubleAmount == 0)
                    priorDeathsDoubleAmount = infection.Deaths;

                if (runningTotalAggregatedConfirmed > priorAggregatedConfirmedDoubleAmount * 2)
                {
                    infection.AggregatedConfirmedDaysToDouble = aggregatedConfirmedDaysToDouble;
                    priorAggregatedConfirmedDoubleAmount = runningTotalAggregatedConfirmed;

                    runningTotalAggregatedConfirmed = 0;
                    aggregatedConfirmedDaysToDouble = 1;
                }
                else
                    aggregatedConfirmedDaysToDouble += 1;

                if (runningTotalActiveConfirmed > priorActiveConfirmedDoubleAmount * 2)
                {
                    infection.ActiveConfirmedDaysToDouble = activeConfirmedDaysToDouble;
                    priorActiveConfirmedDoubleAmount = runningTotalActiveConfirmed;

                    runningTotalActiveConfirmed = 0;
                    activeConfirmedDaysToDouble = 1;
                }
                else
                    activeConfirmedDaysToDouble += 1;

                if (runningTotalRecovered > priorRecoveredDoubleAmount * 2)
                {
                    infection.RecoveredDaysToDouble = recoveredDaysToDouble;
                    priorRecoveredDoubleAmount = runningTotalRecovered;

                    runningTotalRecovered = 0;
                    recoveredDaysToDouble = 1;
                }
                else
                    recoveredDaysToDouble += 1;

                if (runningTotalDeaths > priorDeathsDoubleAmount * 2)
                {
                    infection.DeathsDaysToDouble = deathsDaysToDouble;
                    priorDeathsDoubleAmount = runningTotalDeaths;

                    runningTotalDeaths = 0;
                    deathsDaysToDouble = 1;
                }
                else
                    deathsDaysToDouble += 1;
            }
        }
    }
}
