export interface Infection {
  date: string;
  aggregatedConfirmed: number;
  aggregatedConfirmedDelta: number;
  aggregatedConfirmedPctChange: number;
  aggregatedConfirmedPctDeltaChange: number;
  aggregatedConfirmedDaysToDouble: number | null;
  activeConfirmed: number;
  activeConfirmedDelta: number;
  activeConfirmedPctChange: number;
  activeConfirmedPctDeltaChange: number;
  activeConfirmedDaysToDouble: number | null;
  recovered: number;
  recoveredDelta: number;
  recoveredPctChange: number;
  recoveredPctDeltaChange: number;
  recoveredDaysToDouble: number | null;
  deaths: number;
  deathsDelta: number;
  deathsPctChange: number;
  deathsPctDeltaChange: number;
  deathsDaysToDouble: number | null;
}
