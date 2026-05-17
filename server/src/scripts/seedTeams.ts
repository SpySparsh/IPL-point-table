import 'dotenv/config';
import { Timestamp, WriteBatch } from 'firebase-admin/firestore';
import { db } from '../config/firebase';
import { refreshCurrentStandings } from '../services/pointsTableService';
import { MATCH_STATUS } from '../utils/constants';
import type { Match, Team, TeamStats } from '../types';
import type { MatchStatus } from '../utils/constants';

type SeedMatch = Omit<Match, 'id' | 'date'> & {
  id: string;
  date: string;
};

const teams: Team[] = [
  {
    id: 'csk',
    name: 'Chennai Super Kings',
    shortCode: 'CSK',
    logoUrl: '',
    city: 'Chennai',
  },
  {
    id: 'dc',
    name: 'Delhi Capitals',
    shortCode: 'DC',
    logoUrl: '',
    city: 'Delhi',
  },
  {
    id: 'gt',
    name: 'Gujarat Titans',
    shortCode: 'GT',
    logoUrl: '',
    city: 'Ahmedabad',
  },
  {
    id: 'kkr',
    name: 'Kolkata Knight Riders',
    shortCode: 'KKR',
    logoUrl: '',
    city: 'Kolkata',
  },
  {
    id: 'lsg',
    name: 'Lucknow Super Giants',
    shortCode: 'LSG',
    logoUrl: '',
    city: 'Lucknow',
  },
  {
    id: 'mi',
    name: 'Mumbai Indians',
    shortCode: 'MI',
    logoUrl: '',
    city: 'Mumbai',
  },
  {
    id: 'pbks',
    name: 'Punjab Kings',
    shortCode: 'PBKS',
    logoUrl: '',
    city: 'New Chandigarh',
  },
  {
    id: 'rcb',
    name: 'Royal Challengers Bengaluru',
    shortCode: 'RCB',
    logoUrl: '',
    city: 'Bengaluru',
  },
  {
    id: 'rr',
    name: 'Rajasthan Royals',
    shortCode: 'RR',
    logoUrl: '',
    city: 'Jaipur',
  },
  {
    id: 'srh',
    name: 'Sunrisers Hyderabad',
    shortCode: 'SRH',
    logoUrl: '',
    city: 'Hyderabad',
  },
];

function stats(runs: number, wickets: number, overs: number): TeamStats {
  return { runs, wickets, overs };
}

function match(
  matchNumber: number,
  date: string,
  venue: string,
  team1Id: string,
  team1Stats: TeamStats,
  team2Id: string,
  team2Stats: TeamStats,
  winnerId: string | null,
  matchStatus: MatchStatus = MATCH_STATUS.COMPLETED,
): SeedMatch {
  return {
    id: `ipl2026-match-${String(matchNumber).padStart(3, '0')}`,
    team1Id,
    team2Id,
    team1Stats,
    team2Stats,
    winnerId,
    matchStatus,
    venue,
    date,
  };
}

const matches: SeedMatch[] = [
  match(1, '2026-03-28T19:30:00+05:30', 'M.Chinnaswamy Stadium, Bengaluru', 'rcb', stats(203, 4, 15.4), 'srh', stats(201, 9, 20.0), 'rcb'),
  match(2, '2026-03-29T19:30:00+05:30', 'Wankhede Stadium, Mumbai', 'mi', stats(224, 4, 19.1), 'kkr', stats(220, 4, 20.0), 'mi'),
  match(3, '2026-03-30T19:30:00+05:30', 'ACA Stadium, Guwahati', 'rr', stats(128, 2, 12.1), 'csk', stats(127, 10, 19.4), 'rr'),
  match(4, '2026-03-31T19:30:00+05:30', 'New International Cricket Stadium, New Chandigarh', 'pbks', stats(165, 7, 19.1), 'gt', stats(162, 6, 20.0), 'pbks'),
  match(5, '2026-04-01T19:30:00+05:30', 'Bharat Ratna Shri Atal Bihari Vajpayee Ekana Cricket Stadium, Lucknow', 'lsg', stats(141, 10, 18.4), 'dc', stats(145, 4, 17.1), 'dc'),
  match(6, '2026-04-02T19:30:00+05:30', 'Eden Gardens, Kolkata', 'kkr', stats(161, 10, 16.0), 'srh', stats(226, 8, 20.0), 'srh'),
  match(7, '2026-04-03T19:30:00+05:30', 'MA Chidambaram Stadium, Chennai', 'csk', stats(209, 5, 20.0), 'pbks', stats(210, 5, 18.4), 'pbks'),
  match(8, '2026-04-04T15:30:00+05:30', 'Arun Jaitley Stadium, Delhi', 'dc', stats(164, 4, 18.1), 'mi', stats(162, 6, 20.0), 'dc'),
  match(9, '2026-04-04T19:30:00+05:30', 'Narendra Modi Stadium, Ahmedabad', 'gt', stats(204, 8, 20.0), 'rr', stats(210, 6, 20.0), 'rr'),
  match(10, '2026-04-05T15:30:00+05:30', 'Rajiv Gandhi International Stadium, Hyderabad', 'srh', stats(156, 9, 20.0), 'lsg', stats(160, 5, 19.5), 'lsg'),
  match(11, '2026-04-05T19:30:00+05:30', 'M.Chinnaswamy Stadium, Bengaluru', 'rcb', stats(250, 3, 20.0), 'csk', stats(207, 10, 19.4), 'rcb'),
  match(12, '2026-04-06T19:30:00+05:30', 'Eden Gardens, Kolkata', 'kkr', stats(0, 0, 0), 'pbks', stats(0, 0, 0), null, MATCH_STATUS.NO_RESULT),
  match(13, '2026-04-07T19:30:00+05:30', 'ACA Stadium, Guwahati', 'rr', stats(150, 3, 11.0), 'mi', stats(123, 9, 11.0), 'rr'),
  match(14, '2026-04-08T19:30:00+05:30', 'Arun Jaitley Stadium, Delhi', 'dc', stats(209, 8, 20.0), 'gt', stats(210, 4, 20.0), 'gt'),
  match(15, '2026-04-09T19:30:00+05:30', 'Eden Gardens, Kolkata', 'kkr', stats(181, 4, 20.0), 'lsg', stats(182, 7, 20.0), 'lsg'),
  match(16, '2026-04-10T19:30:00+05:30', 'ACA Stadium, Guwahati', 'rr', stats(202, 4, 18.0), 'rcb', stats(201, 8, 20.0), 'rr'),
  match(17, '2026-04-11T15:30:00+05:30', 'New International Cricket Stadium, New Chandigarh', 'pbks', stats(223, 4, 18.5), 'srh', stats(219, 6, 20.0), 'pbks'),
  match(18, '2026-04-11T19:30:00+05:30', 'MA Chidambaram Stadium, Chennai', 'csk', stats(212, 2, 20.0), 'dc', stats(189, 10, 20.0), 'csk'),
  match(19, '2026-04-12T15:30:00+05:30', 'Bharat Ratna Shri Atal Bihari Vajpayee Ekana Cricket Stadium, Lucknow', 'lsg', stats(164, 8, 20.0), 'gt', stats(165, 3, 18.4), 'gt'),
  match(20, '2026-04-12T19:30:00+05:30', 'Wankhede Stadium, Mumbai', 'mi', stats(222, 5, 20.0), 'rcb', stats(240, 4, 20.0), 'rcb'),
  match(21, '2026-04-13T19:30:00+05:30', 'Rajiv Gandhi International Stadium, Hyderabad', 'srh', stats(216, 6, 20.0), 'rr', stats(159, 10, 19.0), 'srh'),
  match(22, '2026-04-14T19:30:00+05:30', 'MA Chidambaram Stadium, Chennai', 'csk', stats(192, 5, 20.0), 'kkr', stats(160, 7, 20.0), 'csk'),
  match(23, '2026-04-15T19:30:00+05:30', 'M.Chinnaswamy Stadium, Bengaluru', 'rcb', stats(149, 5, 15.1), 'lsg', stats(146, 10, 20.0), 'rcb'),
  match(24, '2026-04-16T19:30:00+05:30', 'Wankhede Stadium, Mumbai', 'mi', stats(195, 6, 20.0), 'pbks', stats(198, 3, 16.3), 'pbks'),
  match(25, '2026-04-17T19:30:00+05:30', 'Narendra Modi Stadium, Ahmedabad', 'gt', stats(181, 5, 19.4), 'kkr', stats(180, 10, 20.0), 'gt'),
  match(26, '2026-04-18T15:30:00+05:30', 'M.Chinnaswamy Stadium, Bengaluru', 'rcb', stats(175, 8, 20.0), 'dc', stats(179, 4, 19.5), 'dc'),
  match(27, '2026-04-18T19:30:00+05:30', 'Rajiv Gandhi International Stadium, Hyderabad', 'srh', stats(194, 9, 20.0), 'csk', stats(184, 8, 20.0), 'srh'),
  match(28, '2026-04-19T15:30:00+05:30', 'Eden Gardens, Kolkata', 'kkr', stats(161, 6, 19.4), 'rr', stats(155, 9, 20.0), 'kkr'),
  match(29, '2026-04-19T19:30:00+05:30', 'New International Cricket Stadium, New Chandigarh', 'pbks', stats(254, 7, 20.0), 'lsg', stats(200, 5, 20.0), 'pbks'),
  match(30, '2026-04-20T19:30:00+05:30', 'Narendra Modi Stadium, Ahmedabad', 'gt', stats(100, 10, 15.5), 'mi', stats(199, 5, 20.0), 'mi'),
  match(31, '2026-04-21T19:30:00+05:30', 'Rajiv Gandhi International Stadium, Hyderabad', 'srh', stats(242, 2, 20.0), 'dc', stats(195, 9, 20.0), 'srh'),
  match(32, '2026-04-22T19:30:00+05:30', 'Bharat Ratna Shri Atal Bihari Vajpayee Ekana Cricket Stadium, Lucknow', 'lsg', stats(119, 10, 18.0), 'rr', stats(159, 6, 20.0), 'rr'),
  match(33, '2026-04-23T19:30:00+05:30', 'Wankhede Stadium, Mumbai', 'mi', stats(104, 10, 19.0), 'csk', stats(207, 6, 20.0), 'csk'),
  match(34, '2026-04-24T19:30:00+05:30', 'M.Chinnaswamy Stadium, Bengaluru', 'rcb', stats(206, 5, 18.5), 'gt', stats(205, 3, 20.0), 'rcb'),
  match(35, '2026-04-25T15:30:00+05:30', 'Arun Jaitley Stadium, Delhi', 'dc', stats(264, 2, 20.0), 'pbks', stats(265, 4, 18.5), 'pbks'),
  match(36, '2026-04-25T19:30:00+05:30', 'Sawai Mansingh Stadium, Jaipur', 'rr', stats(228, 6, 20.0), 'srh', stats(229, 5, 18.3), 'srh'),
  match(37, '2026-04-26T15:30:00+05:30', 'MA Chidambaram Stadium, Chennai', 'csk', stats(158, 7, 20.0), 'gt', stats(162, 2, 16.4), 'gt'),
  match(38, '2026-04-26T19:30:00+05:30', 'Bharat Ratna Shri Atal Bihari Vajpayee Ekana Cricket Stadium, Lucknow', 'lsg', stats(155, 8, 20.0), 'kkr', stats(155, 7, 20.0), 'kkr'),
  match(39, '2026-04-27T19:30:00+05:30', 'Arun Jaitley Stadium, Delhi', 'dc', stats(75, 10, 16.3), 'rcb', stats(77, 1, 6.3), 'rcb'),
  match(40, '2026-04-28T19:30:00+05:30', 'New International Cricket Stadium, New Chandigarh', 'pbks', stats(222, 4, 20.0), 'rr', stats(228, 4, 19.2), 'rr'),
  match(41, '2026-04-29T19:30:00+05:30', 'Wankhede Stadium, Mumbai', 'mi', stats(243, 5, 20.0), 'srh', stats(249, 4, 18.4), 'srh'),
  match(42, '2026-04-30T19:30:00+05:30', 'Narendra Modi Stadium, Ahmedabad', 'gt', stats(158, 6, 15.5), 'rcb', stats(155, 10, 19.2), 'gt'),
  match(43, '2026-05-01T19:30:00+05:30', 'Sawai Mansingh Stadium, Jaipur', 'rr', stats(225, 6, 20.0), 'dc', stats(226, 3, 19.1), 'dc'),
  match(44, '2026-05-02T19:30:00+05:30', 'MA Chidambaram Stadium, Chennai', 'csk', stats(160, 2, 18.1), 'mi', stats(159, 7, 20.0), 'csk'),
  match(45, '2026-05-03T15:30:00+05:30', 'Rajiv Gandhi International Stadium, Hyderabad', 'srh', stats(165, 10, 19.0), 'kkr', stats(169, 3, 18.2), 'kkr'),
  match(46, '2026-05-03T19:30:00+05:30', 'Narendra Modi Stadium, Ahmedabad', 'gt', stats(167, 6, 19.5), 'pbks', stats(163, 9, 20.0), 'gt'),
  match(47, '2026-05-04T19:30:00+05:30', 'Wankhede Stadium, Mumbai', 'mi', stats(229, 4, 18.4), 'lsg', stats(228, 5, 20.0), 'mi'),
  match(48, '2026-05-05T19:30:00+05:30', 'Arun Jaitley Stadium, Delhi', 'dc', stats(155, 7, 20.0), 'csk', stats(159, 2, 17.3), 'csk'),
  match(49, '2026-05-06T19:30:00+05:30', 'Rajiv Gandhi International Stadium, Hyderabad', 'srh', stats(235, 4, 20.0), 'pbks', stats(202, 7, 20.0), 'srh'),
  match(50, '2026-05-07T19:30:00+05:30', 'Bharat Ratna Shri Atal Bihari Vajpayee Ekana Cricket Stadium, Lucknow', 'lsg', stats(209, 3, 19.0), 'rcb', stats(203, 6, 19.0), 'lsg'),
  match(51, '2026-05-08T19:30:00+05:30', 'Arun Jaitley Stadium, Delhi', 'dc', stats(142, 8, 20.0), 'kkr', stats(147, 2, 14.2), 'kkr'),
  match(52, '2026-05-09T19:30:00+05:30', 'Sawai Mansingh Stadium, Jaipur', 'rr', stats(152, 10, 16.3), 'gt', stats(229, 4, 20.0), 'gt'),
  match(53, '2026-05-10T15:30:00+05:30', 'MA Chidambaram Stadium, Chennai', 'csk', stats(208, 5, 19.2), 'lsg', stats(203, 8, 20.0), 'csk'),
  match(54, '2026-05-10T19:30:00+05:30', 'Shaheed Veer Narayan Singh International Stadium, Raipur', 'rcb', stats(167, 8, 20.0), 'mi', stats(166, 7, 20.0), 'rcb'),
  match(55, '2026-05-11T19:30:00+05:30', 'Himachal Pradesh Cricket Association Stadium, Dharamsala', 'pbks', stats(210, 5, 20.0), 'dc', stats(216, 7, 19.0), 'dc'),
  match(56, '2026-05-12T19:30:00+05:30', 'Narendra Modi Stadium, Ahmedabad', 'gt', stats(168, 5, 20.0), 'srh', stats(86, 10, 14.5), 'gt'),
  match(57, '2026-05-13T19:30:00+05:30', 'Shaheed Veer Narayan Singh International Stadium, Raipur', 'rcb', stats(194, 4, 19.1), 'kkr', stats(192, 4, 20.0), 'rcb'),
  match(58, '2026-05-14T19:30:00+05:30', 'Himachal Pradesh Cricket Association Stadium, Dharamsala', 'pbks', stats(200, 8, 20.0), 'mi', stats(205, 4, 19.5), 'mi'),
  match(59, '2026-05-15T19:30:00+05:30', 'Bharat Ratna Shri Atal Bihari Vajpayee Ekana Cricket Stadium, Lucknow', 'lsg', stats(188, 3, 16.4), 'csk', stats(187, 5, 20.0), 'lsg'),
  match(60, '2026-05-16T19:30:00+05:30', 'Eden Gardens, Kolkata', 'kkr', stats(247, 2, 20.0), 'gt', stats(218, 4, 20.0), 'kkr'),
];

async function deleteAllMatches(): Promise<number> {
  const snapshot = await db.collection('matches').get();
  let deleted = 0;

  for (let index = 0; index < snapshot.docs.length; index += 500) {
    const batch = db.batch();
    const docs = snapshot.docs.slice(index, index + 500);

    docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    deleted += docs.length;
  }

  return deleted;
}

async function seedTeamsAndMatches(): Promise<void> {
  const resetMatches = process.env.RESET_MATCHES === 'true';

  if (resetMatches) {
    const deleted = await deleteAllMatches();
    console.log(`Deleted ${deleted} existing match document(s).`);
  }

  const batch: WriteBatch = db.batch();

  teams.forEach((team) => {
    batch.set(db.collection('teams').doc(team.id), team);
  });

  matches.forEach((seedMatch) => {
    const { id, date, ...matchData } = seedMatch;

    batch.set(db.collection('matches').doc(id), {
      ...matchData,
      date: Timestamp.fromDate(new Date(date)),
    });
  });

  await batch.commit();
  await refreshCurrentStandings();

  console.log(`Seeded ${teams.length} teams.`);
  console.log(`Seeded ${matches.length} IPL 2026 completed matches through Match 60, May 16 2026.`);
  console.log('Refreshed standings/current for real-time clients.');
}

seedTeamsAndMatches()
  .then((): void => {
    process.exit(0);
  })
  .catch((error: unknown): void => {
    console.error('Failed to seed IPL data:', error);
    process.exit(1);
  });
