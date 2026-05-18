import { NextResponse } from 'next/server';

const MYQURAN_API = 'https://api.myquran.com/v2/sholat/jadwal';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cityId = searchParams.get('cityId') || '1301'; // Jakarta default
  
  const today = new Date();
  const year = searchParams.get('year') || String(today.getFullYear());
  const month = searchParams.get('month') || String(today.getMonth() + 1).padStart(2, '0');

  try {
    const response = await fetch(
      `${MYQURAN_API}/${cityId}/${year}/${month}`,
      { next: { revalidate: 86400 } } // Cache monthly schedule for 1 day
    );

    if (!response.ok) {
      throw new Error(`MyQuran API error: ${response.status}`);
    }

    const data = await response.json();
    const jadwalArray = data?.data?.jadwal;

    if (!jadwalArray || !Array.isArray(jadwalArray)) {
      throw new Error('Invalid API response structure');
    }

    // Map each day's schedule to clean standardized naming
    const schedule = jadwalArray.map((day: any) => ({
      date: day.date || day.tanggal, // MyQuran has date/tanggal fields
      tanggal: day.tanggal,
      fajr: day.subuh,
      sunrise: day.terbit,
      dhuhr: day.dzuhur,
      asr: day.ashar,
      maghrib: day.maghrib,
      isya: day.isya,
    }));

    return NextResponse.json({
      cityName: data?.data?.lokasi || 'Jakarta',
      schedule
    });
  } catch (error) {
    console.error('Prayer Monthly API error:', error);
    return NextResponse.json({ error: 'Could not load monthly prayer times', schedule: [] }, { status: 200 });
  }
}
