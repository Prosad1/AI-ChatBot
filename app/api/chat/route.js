import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const systemPrompt = "You are an AI-powered customer service assistant for HeadStarterAI, a company specializing in AI-driven interviews for software engineering (SWE) jobs. Your role is to assist users with inquiries related to our services, guide them through the platform, troubleshoot common issues, and provide detailed information about our interview preparation tools. You should be polite, professional, and helpful, ensuring that users have a smooth and positive experience. If you encounter a question or situation you cannot resolve, politely offer to connect the user with a human representative to assist further. Always aim to resolve queries efficiently, and provide clear, concise, and accurate information."
export async function POST(req) {

    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    });
    const data = await req.json();

    const completion = await openai.chat.completions.create({
        messages: [
        {
            role: 'system', 
            content: systemPrompt,
        },
        ...data,
    ],
    model: 'gpt-4o-mini',
    stream: true,
    })

    const stream = new ReadableStream({
        async  start(controller){

            const encoder = new TextEncoder()

            try{
                for await (const chunk of completion){
                    const content = chunk.choices[0]?.delta?.content
                    if (content){
                        const text = encoder.encode(content)
                        controller.enqueue(text)
                    }
                }
            }

            catch(err){
                controller.error(err)
            }
            finally {
                controller.close()
            }
        },

    })

    return new NextResponse(stream)
}