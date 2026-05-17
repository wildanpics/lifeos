import { NextResponse } from 'next/server';
import { DailyPrayerSchedule } from '@/types/prayer';

// eQuran.id API for Indonesian prayer times
// Docs: https://equran.id/apidev
const EQURAN_API = 'https://equran.id/api/v2/sholat';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cityId = searchParams.get('cityId') || '29'; // Jakarta default

  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  try {
    const response = await fetch(
      `${EQURAN_API}/${cityId}/${year}/${month}/${day}`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );

    if (!response.ok) {
      throw new Error(`eQuran API error: ${response.status}`);
    }

    const data = await response.json();

    // eQuran.id response structure
    const jadwal = data?.data?.jadwal;

    if (!jadwal) {
      throw new Error('Invalid API response structure');
    }

    const schedule: DailyPrayerSchedule = {
      date: `${year}-${month}-${day}`,
      cityId: Number(cityId),
      cityName: data?.data?.lokasi || 'Jakarta',
      prayers: {
        fajr: jadwal.subuh,
        sunrise: jadwal.terbit,
        dhuhr: jadwal.dzuhur,
        asr: jadwal.ashar,
        maghrib: jadwal.maghrib,
        isya: jadwal.isya,
      },
    };

    return NextResponse.json(schedule);
  } catch (error) {
    console.error('Prayer API error:', error);

    // Fallback Jakarta prayer times (approximate)
    const fallback: DailyPrayerSchedule = {
      date: `${year}-${month}-${day}`,
      cityId: 29,
      cityName: 'Jakarta (Fallback)',
      prayers: {
        fajr: '04:30',
        sunrise: '05:52',
        dhuhr: '11:53',
        asr: '15:12',
        maghrib: '17:52',
        isya: '19:03',
      },
    };

    return NextResponse.json(fallback, { status: 200 });
  }
}
