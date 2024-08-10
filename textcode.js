//This file contains various versions of code that we are messing with to get out ai to work


//PAGE

export default function Home() {
    const[messages, setMessages] = useState ([
      {
      role: 'assistant',
      content: 'Hi, Im the headstarter support agent. How can I help you today?',
      },
    ])
    
    const [message,setMessage] = useState('')
  
    const sendMessage = async ()=> { 
      setMessage('')
      setMessages((messages)=>[
        ...messages, 
        {role:"user", content:message}, 
        {role: "assistant", content:""},
      ])
      const response = fetch ('/api/chat', {
        method: "POST", 
        header:{
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([...messages, {role: 'user', content: message}]),
      }).then(async(res) => {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
  
        let result = '' 
        return reader.read().then(function proccessText({done, value}){
          if(done){
            return result
          }
          const text = decoder.decode(value || new Int8Array(), {stream:true})
          setMessages((messages)=>{
            let lastMessage = messages[messages.length - 1]
            let otherMessages = messages.slice(0,messages.length - 1)
            return[
              ...otherMessages,
              {
                ...lastMessage,
                content: lastMessage.content + text,
              },
            ]
          })
          return reader.read().then(proccessText)
        })
      })
      
  
    }
  
    
  
    return (
      <Box width="100vw" height="100vh" display="flex" flexDirection="column" justifyContent="center" alignItems="center">
        <Stack direction="column" width="600px" height="700px" border="1px solid black" padding={2} spacing={2}  >
          <Stack direction="column" spacing={2} flexGrow={1} overflow="auto" maxHeight="100%">
            {
              messages.map((message, index) => (
                <Box key={index} display="flex" justifyContent={message.role === 'assistant' ? 'flex-start' : 'flex-end'}>
                  <Box bgcolor= {
                    message.role === 'assistant' ? 'primary.main' : 'secondary.main'} color ="white" borderRadius={16} p={3}>
                  {message.content}
                  </Box>
  
                </Box>
              
              ))}
          </Stack>
          <Stack direction="row" spacing={2} >
            <TextField label="message" fullWidth value={message} onChange={(e) =>  setMessage(e.target.value)}/>
            <Button variant="contained" onClick={sendMessage}>Send</Button>
          </Stack>
        </Stack>
      </Box>
      )
  }



  //ROUTE
  const systemPrompt = "You are an AI-powered customer service assistant for HeadStarterAI, a company specializing in AI-driven interviews for software engineering (SWE) jobs. Your role is to assist users with inquiries related to our services, guide them through the platform, troubleshoot common issues, and provide detailed information about our interview preparation tools. You should be polite, professional, and helpful, ensuring that users have a smooth and positive experience. If you encounter a question or situation you cannot resolve, politely offer to connect the user with a human representative to assist further. Always aim to resolve queries efficiently, and provide clear, concise, and accurate information."
export async function POST(req) {

    const openai = new OpenAI();
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

//chat gpt test

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

//google gemini test
import { NextResponse } from 'next/server';
import { google } from 'googleapis';

// Initialize Google Gemini API
const gemini = google.gemini({
    version: 'v1', // or the appropriate version
    auth: process.env.GOOGLE_API_KEY,
});

export async function POST(req) {
    const data = await req.json();

    try {
        const response = await gemini.chat.completions.create({
            model: 'gpt-4', // Update this based on Google Gemini’s model names
            messages: [
                { role: 'system', content: 'Say hello!' },
                ...data.messages,
            ],
        });

        console.log('Google Gemini response:', response);
        return NextResponse.json(response);
    } catch (error) {
        console.error('Error connecting to Google Gemini:', error);
        return NextResponse.json({ error: 'Failed to connect to Google Gemini' });
    }
}

//changing to gemini
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req) {
    const genAI = new GoogleGenerativeAI(process.env.API_KEY); 

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

    const systemPrompt = "You are an AI-powered customer service assistant for HeadStarterAI, a company specializing in AI-driven interviews for software engineering (SWE) jobs. Your role is to assist users with inquiries related to our services, guide them through the platform, troubleshoot common issues, and provide detailed information about our interview preparation tools. You should be polite, professional, and helpful, ensuring that users have a smooth and positive experience. If you encounter a question or situation you cannot resolve, politely offer to connect the user with a human representative to assist further. Always aim to resolve queries efficiently, and provide clear, concise, and accurate information."

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