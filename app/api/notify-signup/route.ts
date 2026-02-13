import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { userName, userEmail } = await request.json();

    const phone = process.env.CALLMEBOT_PHONE;
    const apiKey = process.env.CALLMEBOT_API_KEY;

    if (!phone || !apiKey) {
      console.error('Callmebot credentials not configured');
      return NextResponse.json({ success: false, error: 'Not configured' }, { status: 500 });
    }

    // Format the message
    const message = encodeURIComponent(
      `🌙 New Signup!\n\nName: ${userName || 'Not provided'}\nEmail: ${userEmail}\n\nMy Ramadan Tracker`
    );

    // Send WhatsApp notification via Callmebot
    const callmebotUrl = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${message}&apikey=${apiKey}`;

    const response = await fetch(callmebotUrl);

    if (response.ok) {
      return NextResponse.json({ success: true });
    } else {
      console.error('Callmebot API error:', await response.text());
      return NextResponse.json({ success: false }, { status: 500 });
    }
  } catch (error) {
    console.error('Notification error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
