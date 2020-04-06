using System;

namespace InfectionData.Models
{
    public class Infection
    {
        public string Date { get; set; }
        public string Locale { get; set; }
        public int AggregatedConfirmed { get; set; }
        public int AggregatedConfirmedDelta { get; set; }
        public int AggregatedConfirmedPctChange { get; set; }
        public int AggregatedConfirmedPctDeltaChange { get; set; }
        public int? AggregatedConfirmedDaysToDouble { get; set; }
        public int ActiveConfirmed { get; set; }
        public int ActiveConfirmedDelta { get; set; }
        public int ActiveConfirmedPctChange { get; set; }
        public int ActiveConfirmedPctDeltaChange { get; set; }
        public int? ActiveConfirmedDaysToDouble { get; set; }
        public int Recovered { get; set; }
        public int RecoveredDelta { get; set; }
        public int RecoveredPctChange { get; set; }
        public int RecoveredPctDeltaChange { get; set; }
        public int? RecoveredDaysToDouble { get; set; }
        public int Deaths { get; set; }
        public int DeathsDelta { get; set; }
        public int DeathsPctChange { get; set; }
        public int DeathsPctDeltaChange { get; set; }
        public int? DeathsDaysToDouble { get; set; }

    }
}
