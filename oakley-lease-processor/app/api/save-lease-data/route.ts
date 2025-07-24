import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { leaseData, projectId, fileName, fileUrl } = await request.json()

    if (!leaseData || !projectId) {
      return NextResponse.json({ error: 'Missing required data' }, { status: 400 })
    }

    // Save lease data to Supabase
    const { data, error } = await supabase
      .from('lease_documents')
      .insert([
        {
          project_id: projectId,
          file_name: fileName,
          file_url: fileUrl,
          tenant_company: leaseData.tenant?.companyName || '',
          tenant_contact: leaseData.tenant?.contactPerson || '',
          tenant_phone: leaseData.tenant?.phone || '',
          tenant_email: leaseData.tenant?.email || '',
          tenant_address: leaseData.tenant?.address || '',
          landlord_company: leaseData.landlord?.companyName || '',
          landlord_contact: leaseData.landlord?.contactPerson || '',
          landlord_phone: leaseData.landlord?.phone || '',
          landlord_email: leaseData.landlord?.email || '',
          landlord_address: leaseData.landlord?.address || '',
          property_address: leaseData.property?.address || '',
          property_suite: leaseData.property?.suite || '',
          property_square_footage: leaseData.property?.squareFootage || '',
          property_type: leaseData.property?.propertyType || '',
          base_rent: leaseData.financialTerms?.baseRent || '',
          rent_per_sqft: leaseData.financialTerms?.rentPerSqFt || '',
          security_deposit: leaseData.financialTerms?.securityDeposit || '',
          cam_charges: leaseData.financialTerms?.camCharges || '',
          lease_start_date: leaseData.leaseTerms?.startDate || null,
          lease_end_date: leaseData.leaseTerms?.endDate || null,
          lease_term: leaseData.leaseTerms?.leaseTerm || '',
          renewal_options: leaseData.leaseTerms?.renewalOptions || '',
          parking_spaces: leaseData.specialProvisions?.parkingSpaces || '',
          ti_allowance: leaseData.specialProvisions?.tiAllowance || '',
          rent_abatements: leaseData.specialProvisions?.rentAbatements || '',
          triple_net: leaseData.legalClauses?.tripleNet || '',
          percentage_rent: leaseData.legalClauses?.percentageRent || '',
          raw_lease_data: leaseData,
          processed_at: new Date().toISOString(),
          status: 'processed'
        }
      ])
      .select()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Failed to save lease data' }, { status: 500 })
    }

    // Update project document count
    const { error: updateError } = await supabase
      .from('projects')
      .update({ 
        document_count: supabase.sql`document_count + 1`,
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId)

    if (updateError) {
      console.error('Project update error:', updateError)
    }

    return NextResponse.json({
      success: true,
      leaseId: data[0].id,
      message: 'Lease data saved successfully'
    })

  } catch (error) {
    console.error('Save error:', error)
    return NextResponse.json(
      { error: 'Failed to save lease data' },
      { status: 500 }
    )
  }
}