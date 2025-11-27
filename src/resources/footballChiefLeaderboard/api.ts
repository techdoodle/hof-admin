import { dataProvider } from '../../providers/dataProvider';

export interface FootballChiefLeaderboardEntry {
  footballChiefId: number;
  footballChiefName: string;
  footballChiefEmail: string;
  footballChiefPhone: string;
  profilePicture: string | null;
  matchCount: number;
}

export const getFootballChiefLeaderboard = async (
  dateFrom?: string,
  dateTo?: string,
): Promise<FootballChiefLeaderboardEntry[]> => {
  try {
    const queryParams: any = {};
    if (dateFrom) queryParams.dateFrom = dateFrom;
    if (dateTo) queryParams.dateTo = dateTo;

    const queryString = new URLSearchParams(queryParams).toString();
    const url = `/admin/football-chief-leaderboard${queryString ? `?${queryString}` : ''}`;

    const response = await dataProvider.custom(url, {
      method: 'GET',
    });

    return response.data || [];
  } catch (error: any) {
    console.error('Error fetching leaderboard:', error);
    throw error;
  }
};

