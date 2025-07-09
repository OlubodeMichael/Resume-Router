import supabase from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';


export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('Waitlist')
      .insert([{ email }]);

    if (error) {
      console.error('Supabase error:', error.message);
      
      // Check if it's a duplicate email error
      if (error.message.includes('duplicate key') || error.message.includes('already exists')) {
        return NextResponse.json(
          { message: 'This email is already on our waitlist!' },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { message: 'Failed to join waitlist. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Successfully joined waitlist!' }, { status: 200 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
 