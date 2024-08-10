import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req) {
    const openai = new OpenAI();

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'system', content: 'Say hello!' }],
        });

        console.log('OpenAI response:', response); // Log the entire response
        return NextResponse.json(response); // Send the response back to the client
    } catch (error) {
        console.error('Error connecting to OpenAI:', error); // Log any connection errors
        return NextResponse.json({ error: 'Failed to connect to OpenAI' });
    }
}