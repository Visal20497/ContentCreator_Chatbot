import { Instructions } from './chat.types';

export const MODEL_KEY = 'SMSS-SELECTED-MODEL';

export const INSTRUCTIONS: Instructions[] = [
    {
        id: 'prompt-0',
        description: 'Ask questions to a Homer from the Simpsons',
        context:
            'I want you to act like Homer from the Simpsons. I want you to respond and answer like Homer. Do not write any explanations. Only answer like Homer. You must know all of the knowledge of Homer.',
    },
    {
        id: 'prompt-1',
        description: 'Summarize a paragraph',
        context: 'Summarize the the following paragraph into bullet points',
    },
    {
        id: 'prompt-6',
        description: 'Translater',
        context:
            'I want you to act as a Spanish translater. I will type a sentence in English and translate it to Spanish.',
    },
    {
        id: 'prompt-10',
        description: 'Travel Guide',
        context:
            'I want you to act as a travel guide. I will write you my location and you will suggest a place to visit near my location. In some cases, I will also give you the type of places I will visit. You will also suggest me places of similar type that are close to my location',
    },
];
export const prompts = [
    {
        category: 'Market Research',
        title: 'Market Analysis Request',
        description:
            'Please provide a comprehensive market analysis of the [industry/sector] in the [specific region/country], including key trends, major players, and growth projections for the next 5 years.',
        id: 1,
    },
    {
        category: 'Market Research',
        title: 'Competitor Benchmarking',
        description:
            'Can you create a competitor benchmarking report for [Company Name], focusing on their market share, product offerings, pricing strategies, and recent innovations?',
        id: 2,
    },
    {
        category: 'Brainstorming Sessions',
        title: 'Product Development Ideas',
        description:
            "Let's brainstorm innovative product development ideas for our [specific product/service]. What are some emerging trends and technologies we could leverage?",
        id: 3,
    },
    {
        category: 'Brainstorming Sessions',
        title: 'Marketing Campaign Strategies',
        description:
            'Can you help brainstorm some creative marketing campaign strategies for our upcoming [event/product launch]? Focus on digital channels and customer engagement.',
        id: 4,
    },
    {
        category: 'Summarization and Organization',
        title: 'Executive Summary Creation',
        description:
            'Please summarize the attached report into an executive summary, highlighting the key findings, conclusions, and recommendations.',
        id: 5,
    },
    {
        category: 'Summarization and Organization',
        title: 'Meeting Notes Organization',
        description:
            'Organize the notes from our last team meeting into a structured format, including action items, responsible parties, and deadlines.',
        id: 6,
    },
    {
        category: 'Kickstarting Deliverables',
        title: 'Project Proposal Outline',
        description:
            'Help me draft an outline for a project proposal on [project topic], including sections for objectives, scope, timeline, budget, and expected outcomes.',
        id: 7,
    },
    {
        category: 'Kickstarting Deliverables',
        title: 'Client Presentation Framework',
        description:
            'Can you create a framework for a client presentation on [specific topic], including an agenda, key points to cover, and suggested visuals?',
        id: 8,
    },
    {
        category: 'Professional Documents and Communications',
        title: 'Business Email Draft',
        description:
            "Draft a professional email to [recipient's name] regarding [specific topic], ensuring to cover [key points] and maintaining a formal tone.",
        id: 9,
    },
    {
        category: 'Professional Documents and Communications',
        title: 'Policy Document Template',
        description:
            'Create a template for a policy document on [specific policy area], including sections for purpose, scope, responsibilities, and procedures.',
        id: 10,
    },
];
export const MODEL_INPUT_LENGTH = 32000;

export const TOKEN_LENGTH = 2000;
export const TEMPERATURE = 0.8;
export const NumberOfQuery = 3;
