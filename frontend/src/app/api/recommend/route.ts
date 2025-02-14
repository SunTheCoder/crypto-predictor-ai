import { NextResponse } from 'next/server';

// Make sure to use NEXT_PUBLIC_ prefix if you need to access env vars on the client side
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';
console.log('Using backend URL:', BACKEND_URL); // Add this for debugging

export async function POST(request: Request) {
  try {
    const { emotion } = await request.json();
  
    const response = await fetch(`${BACKEND_URL}/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emotion }),
    });

    if (!response.ok) {
      console.error('Backend error:', await response.text());
      return NextResponse.json(
        { success: false, error: 'Backend service error' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reach backend service' },
      { status: 500 }
    );
  }
} 