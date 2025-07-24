import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { processDocument } from '../../../lib/documentProcessor'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { fileUrl, fileName, projectId } = await request.json()

    if (!fileUrl) {
      return NextResponse.json({ error: 'No file URL provided' }, { status: 400 })
    }

    // Extract text from document
    const extractedText = await processDocument(fileUrl, fileName)

    if (!extractedText) {
      return NextResponse.json({ error: 'Failed to extract text from document' }, { status: 500 })
    }

    // Use GPT-4o Mini to analyze the lease
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a commercial real estate lease analysis expert. Extract key information from lease documents and return it in a structured JSON format.

Extract the following information:
1. Tenant Information (company name, contact details, addresses)
2. Landlord Information (company name, contact details)
3. Property Details (address, suite/unit number, square footage, property type)
4. Financial Terms (base rent, escalations, security deposit, CAM charges, utilities)
5. Lease Terms (start date, end date, lease term, renewal options)
6. Special Provisions (parking spaces, TI allowances, rent abatements, assignment rights)
7. Legal Clauses (triple net lease, percentage rent, default clauses)

Return ONLY valid JSON in this exact structure:
{
  "tenant": {
    "companyName": "",
    "contactPerson": "",
    "phone": "",
    "email": "",
    "address": ""
  },
  "landlord": {
    "companyName": "",
    "contactPerson": "",
    "phone": "",
    "email": "",
    "address": ""
  },
  "property": {
    "address": "",
    "suite": "",
    "squareFootage": "",
    "propertyType": "",
    "floors": ""
  },
  "financialTerms": {
    "baseRent": "",
    "rentPerSqFt": "",
    "securityDeposit": "",
    "camCharges": "",
    "utilities": "",
    "escalations": ""
  },
  "leaseTerms": {
    "startDate": "",
    "endDate": "",
    "leaseTerm": "",
    "renewalOptions": "",
    "earlyTermination": ""
  },
  "specialProvisions": {
    "parkingSpaces": "",
    "tiAllowance": "",
    "rentAbatements": "",
    "assignmentRights": "",
    "subleaseRights": ""
  },
  "legalClauses": {
    "tripleNet": "",
    "percentageRent": "",
    "defaultClauses": "",
    "insuranceRequirements": ""
  }
}`
        },
        {
          role: "user",
          content: `Please analyze this lease document and extract the key information:\n\n${extractedText.substring(0, 15000)}`
        }
      ],
      temperature: 0.1,
      max_tokens: 2000,
    })

    const analysisResult = completion.choices[0].message.content

    if (!analysisResult) {
      return NextResponse.json({ error: 'Failed to analyze document' }, { status: 500 })
    }

    // Try to parse the JSON response
    let leaseData
    try {
      leaseData = JSON.parse(analysisResult)
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      return NextResponse.json({ error: 'Invalid analysis result format' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      leaseData,
      extractedText: extractedText.substring(0, 1000) + '...', // First 1000 chars for preview
      fileName,
      projectId
    })

  } catch (error) {
    console.error('Processing error:', error)
    return NextResponse.json(
      { error: 'Document processing failed' },
      { status: 500 }
    )
  }
}