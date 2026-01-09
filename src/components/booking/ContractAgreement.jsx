import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/input";
import { Label } from "../ui/Label";
import { Checkbox } from "../ui/Checkbox";
import { Badge } from "../ui/Badge";
import { Separator } from "../ui/separator";
import { FileText, Shield, AlertCircle, CheckCircle, Signature } from "lucide-react";
import { format } from "date-fns";


export function ContractAgreement({ 
  onContractSigned, 
  propertyAddress, 
  totalPrice, 
  scheduledDateTime,
  initialData = {}
}) {
  const [contractData, setContractData] = useState({
    payerName: initialData.payerName || '',
    payerPhone: initialData.payerPhone || '',
    payerEmail: initialData.payerEmail || '',
    inspectionAddress: propertyAddress,
    reportEmail: initialData.reportEmail || initialData.payerEmail || '',
    relationshipToBuyer: initialData.relationshipToBuyer || 'buyer',
    buyerName: initialData.buyerName || '',
    buyerPhone: initialData.buyerPhone || '',
    buyerEmail: initialData.buyerEmail || '',
    realtorName: initialData.realtorName || '',
    realtorPhone: initialData.realtorPhone || '',
    contractorName: '',
    contractorPhone: '',
    financeCompany: '',
    financePhone: '',
    otherPartyName: '',
    otherPartyRole: '',
    otherPartyPhone: '',
    optOutMedia: false,
  });

  const [hasReadTerms, setHasReadTerms] = useState(false);
  const [isDrawingSignature, setIsDrawingSignature] = useState(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState('');
  const [isFullContractExpanded, setIsFullContractExpanded] = useState(false);
  const [clientInitials, setClientInitials] = useState({});
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const isBuyer = contractData.relationshipToBuyer === 'buyer';
  const needsAuthorization = !isBuyer;

  const updateField = (field, value) => {
    setContractData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000000';
    
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dataUrl = canvas.toDataURL();
    setSignatureDataUrl(dataUrl);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureDataUrl('');
  };

  const handleSubmit = () => {
    if (!hasReadTerms || !signatureDataUrl) {
      return;
    }

    onContractSigned({
      ...contractData,
      signatureDataUrl,
      clientInitials,
      inspectorInitials: 'DP' // Darrell Penn initials
    });
  };

  const isFormValid = () => {
    const requiredFields = [
      contractData.payerName,
      contractData.payerPhone,
      contractData.payerEmail,
      contractData.reportEmail
    ];

    if (needsAuthorization) {
      requiredFields.push(
        contractData.buyerName,
        contractData.buyerPhone,
        contractData.buyerEmail
      );
    }

    const allSectionsInitialed = Object.keys(clientInitials).length === 15 &&
      Object.values(clientInitials).every(initial => initial.trim() !== '');

    return requiredFields.every(field => field.trim() !== '') && 
           hasReadTerms && 
           signatureDataUrl &&
           allSectionsInitialed;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            CDC Home Inspection Service Agreement – 2025 Edition
          </CardTitle>
          <CardDescription>
            This Agreement must be completed and signed before scheduling your inspection.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Inspection Details</h4>
            <p className="text-sm text-blue-700">
              <strong>Property:</strong> {propertyAddress}
            </p>
            <p className="text-sm text-blue-700">
              <strong>Scheduled:</strong> {format(scheduledDateTime, 'EEEE, MMMM d, yyyy \'at\' h:mm a')}
            </p>
            <p className="text-sm text-blue-700">
              <strong>Total Fee:</strong> ${totalPrice.toFixed(2)}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>1. Inspector Credentials and Licensure Authority</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <p><strong>Inspector:</strong> Darrell Penn Jr.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                <Badge variant="outline">Arizona Licensed Home Inspector: #63295</Badge>
                <Badge variant="outline">General Contractor (KB-2): ROC #332240</Badge>
                <Badge variant="outline">Electrical Contractor: ROC #347444</Badge>
                <Badge variant="outline">Plumbing Contractor: ROC #349089</Badge>
                <Badge variant="outline">HVAC Contractor: ROC #349316</Badge>
                <Badge variant="outline">IICRC Certification: #700173848</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Client Information</CardTitle>
          <CardDescription>
            Please provide accurate contact information for all parties involved in this transaction.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="payerName">Payee Name *</Label>
              <Input
                id="payerName"
                value={contractData.payerName}
                onChange={(e) => updateField('payerName', e.target.value)}
                placeholder="Full name of person paying"
              />
            </div>
            <div>
              <Label htmlFor="payerPhone">Payee Phone *</Label>
              <Input
                id="payerPhone"
                value={contractData.payerPhone}
                onChange={(e) => updateField('payerPhone', e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <Label htmlFor="payerEmail">Payee Email *</Label>
              <Input
                id="payerEmail"
                type="email"
                value={contractData.payerEmail}
                onChange={(e) => updateField('payerEmail', e.target.value)}
                placeholder="email@example.com"
              />
            </div>
            <div>
              <Label htmlFor="reportEmail">Email for Report Delivery *</Label>
              <Input
                id="reportEmail"
                type="email"
                value={contractData.reportEmail}
                onChange={(e) => updateField('reportEmail', e.target.value)}
                placeholder="Where should we send the report?"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="relationshipToBuyer">Relationship to Buyer *</Label>
            <select
              id="relationshipToBuyer"
              value={contractData.relationshipToBuyer}
              onChange={(e) => updateField('relationshipToBuyer', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="buyer">I am the buyer</option>
              <option value="realtor">I am the realtor</option>
              <option value="family_member">I am a family member</option>
              <option value="friend">I am a friend</option>
              <option value="spouse">I am the spouse</option>
            </select>
          </div>

          {needsAuthorization && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h4 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Authorization Required
              </h4>
              <p className="text-sm text-orange-700 mb-4">
                Since you are not the buyer, we need buyer information and authorization to communicate with them.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="buyerName">Buyer Name *</Label>
                  <Input
                    id="buyerName"
                    value={contractData.buyerName}
                    onChange={(e) => updateField('buyerName', e.target.value)}
                    placeholder="Full name of buyer"
                  />
                </div>
                <div>
                  <Label htmlFor="buyerPhone">Buyer Phone *</Label>
                  <Input
                    id="buyerPhone"
                    value={contractData.buyerPhone}
                    onChange={(e) => updateField('buyerPhone', e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="buyerEmail">Buyer Email *</Label>
                  <Input
                    id="buyerEmail"
                    type="email"
                    value={contractData.buyerEmail}
                    onChange={(e) => updateField('buyerEmail', e.target.value)}
                    placeholder="buyer@example.com"
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <h4 className="font-semibold mb-3">Additional Authorized Parties (Optional)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="realtorName">Realtor Name</Label>
                <Input
                  id="realtorName"
                  value={contractData.realtorName}
                  onChange={(e) => updateField('realtorName', e.target.value)}
                  placeholder="Realtor full name"
                />
              </div>
              <div>
                <Label htmlFor="realtorPhone">Realtor Phone</Label>
                <Input
                  id="realtorPhone"
                  value={contractData.realtorPhone}
                  onChange={(e) => updateField('realtorPhone', e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <Label htmlFor="contractorName">Contractor Name</Label>
                <Input
                  id="contractorName"
                  value={contractData.contractorName}
                  onChange={(e) => updateField('contractorName', e.target.value)}
                  placeholder="Contractor full name"
                />
              </div>
              <div>
                <Label htmlFor="contractorPhone">Contractor Phone</Label>
                <Input
                  id="contractorPhone"
                  value={contractData.contractorPhone}
                  onChange={(e) => updateField('contractorPhone', e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <Label htmlFor="financeCompany">Finance Company</Label>
                <Input
                  id="financeCompany"
                  value={contractData.financeCompany}
                  onChange={(e) => updateField('financeCompany', e.target.value)}
                  placeholder="Finance company name"
                />
              </div>
              <div>
                <Label htmlFor="financePhone">Finance Phone</Label>
                <Input
                  id="financePhone"
                  value={contractData.financePhone}
                  onChange={(e) => updateField('financePhone', e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Terms Summary</CardTitle>
          <CardDescription>Key points from the full service agreement</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Inspection Standards</h4>
                <p className="text-sm text-gray-600">
                  Visual, non-invasive inspection per Arizona Board of Technical Registration Standards
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Timeline</h4>
                <p className="text-sm text-gray-600">
                  2-3 hours inspection • Report by next day
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Payment Terms</h4>
                <p className="text-sm text-gray-600">
                  Payment due in full prior to inspection • Non-refundable once scheduled, credit applied to new inspection
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Cancellation</h4>
                <p className="text-sm text-gray-600">
                  Full refund before 11:59 PM day of booking • Credit thereafter
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="optOutMedia"
                checked={contractData.optOutMedia}
                onCheckedChange={(checked) => updateField('optOutMedia', checked === true)}
              />
              <Label htmlFor="optOutMedia" className="text-sm">
                I opt out of photo/video recording for training and marketing purposes
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Complete Service Agreement</span>
            <Button 
              variant="outline" 
              onClick={() => setIsFullContractExpanded(!isFullContractExpanded)}
            >
              {isFullContractExpanded ? 'Collapse' : 'View Full Contract'}
            </Button>
          </CardTitle>
          <CardDescription>
            Review the complete CDC Home Inspection Service Agreement (mandatory to view before signing)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isFullContractExpanded && (
            <div className="bg-gray-50 p-6 rounded-lg max-h-96 overflow-y-auto text-sm space-y-4">
              <div className="text-center mb-4">
                <h4 className="font-bold text-lg mb-2">CDC HOME INSPECTION SERVICE AGREEMENT</h4>
                <div className="space-y-1">
                  <p className="font-semibold">CDC Home Inspections</p>
                  <p>2311 E Runaway Bay Place, Gilbert, AZ 85298</p>
                  <p>Phone: (800) 298-4250 | Email: cdchomeinspections@gmail.com</p>
                  <p>Website: www.cdc-residential.com</p>
                  <p className="font-semibold">#63295 Owner | Darrell Penn, Inspector</p>
                </div>
                <div className="mt-3 space-y-1 text-xs">
                  <p>AZ ROC Dual Construction License – KB-2 (ROC #332240)</p>
                  <p>HVAC (ROC #349316) | Plumbing (ROC #349089) | Electrical (ROC #347444)</p>
                  <p>Inspector License #63295 | Adjuster License NIPR #17107555</p>
                  <p>IICRC Certification #700173848 – WRT/ASD Certified</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">1. PARTIES</h4>
                <p className="text-gray-700">
                  This Service Agreement ("Agreement") is entered into between CDC Home Inspections ("Inspector" or "Business") and the undersigned client ("Client"), payee. This Agreement covers the inspection of the property identified by the Client on the scheduled date.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">2. PURPOSE AND SCOPE</h4>
                <p className="text-gray-700">
                  The inspection is intended to provide the Client with a better understanding of the property's condition on the day of inspection. The inspection will be conducted in accordance with the Arizona Standards of Professional Practice for Home Inspectors. This inspection is visual and may be non-invasive, limited to readily accessible areas, and is not a warranty, guarantee, or insurance policy.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">3. GENERAL LIMITATIONS AND EXCLUSIONS</h4>
                <div className="space-y-2">
                  <div>
                    <p className="font-medium">General Limitations:</p>
                    <p className="text-gray-700">
                      A. Inspections are visual and not technically exhaustive, and may not identify concealed or latent defects.<br/>
                      B. Standards apply to buildings with four or fewer dwelling units and their garages/carports (attached/detached).
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">General Exclusions:</p>
                    <p className="text-gray-700">
                      A. Inspectors are not required to report on life expectancy, causes of repair, methods/costs of correction, code/regulation compliance, property value, advisability of purchase, components not observed, pests, cosmetic/underground/uninstalled items.<br/>
                      B. Inspectors are not required to offer warranties, calculate system adequacy, enter unsafe/inaccessible areas, operate shut down systems, disturb insulation or personal belongings, determine hazardous substances, predict future conditions, project operating costs, or evaluate acoustics.
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">4. ACCESS AND INSPECTION</h4>
                <p className="text-gray-700">
                  The Client is responsible for providing full access to the property including all areas, utilities, attics, crawlspaces, and locked areas. The inspection may be visual only. Verbal consultation may be arranged; however, verbal discussions do not override written report. If utilities are off, the inspector will proceed where possible and a re-inspection is available for an additional fee.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">5. DEFICIENCIES AND CONTRACTORS</h4>
                <p className="text-gray-700">
                  Observed deficiencies will be documented. Licensed contractors registered with the Arizona Registrar of Contractors must be used for repairs exceeding $1,000 (materials + labor). Contractor lookup: https://azroc.my.site.com/AZRoc/s/contractor-search.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">6. LEGAL ISSUES AND LIMITATIONS OF LIABILITY</h4>
                <p className="text-gray-700">
                  This inspection is not a warranty or guarantee. Reports may be shared at the directives of the client; however, reports are for Client's use only. CDC has no third-party obligations. CDC may charge prevailing hourly rates for subpoenas, depositions, or expert witness services @ $350/hour. CDC's maximum liability is limited to a refund of the inspection fee, unless the AZBTR determines that the mistakes made were beyond the warrant of a letter of concern.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">7. FEES AND PAYMENT</h4>
                <p className="text-gray-700">
                  Inspection fees are due prior to inspection. In special circumstances, reports will not be released until full payment is received due to an agreed arrangement. Fees are non-refundable. Optional services (pool/spa inspection, BINSR inspection) may be added. Use of the inspection report constitutes acceptance of this Agreement.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">8. UTILITY SERVICES</h4>
                <p className="text-gray-700">
                  Client, seller, or agent must ensure utilities are on at the time of inspection. If not, the inspector will proceed where possible. Re-inspection may be arranged for a fee not exceeding 50% of the original fee.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">9. PARALLEL STUDENTS</h4>
                <p className="text-gray-700">
                  From time to time, trainee inspectors may accompany the inspector. No extra fee will be charged (set at $0.00 per State Board rules) to the client. Only the licensed inspector's report will be issued.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">10. INSPECTOR QUALIFICATIONS AND INSURANCE</h4>
                <p className="text-gray-700">
                  All inspectors are trained by CDC Home Inspections. CDC is licensed and insured above state minimum requirements. When applicable, employees are covered under CDC's Business Owners Policy. Subcontractors must maintain E&O and GL insurance with CDC listed as certificate holder. If subcontractor insurance lapses, they will be removed until reinstated.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">11. STRICT REFUND POLICY</h4>
                <p className="text-gray-700">
                  Reservations require prepayment. Cancellation by 11:59 PM on the day of booking qualifies for a full refund. After that time, only a credit for future inspection or transfer to another client is permitted. Credits are only good for properties that are the same size or less. If a property is changed and has a larger footprint, the difference will be charged to the client. Rescheduling is subject to availability.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">12. RECORDING AND FILMING</h4>
                <p className="text-gray-700">
                  Inspections may be recorded for training and marketing. Digital images, audio, and video remain the property of CDC. Client and their guests may be captured unless they object in writing. Recordings may be posted on any and all social media platforms.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">13. CHARGEBACKS AND FRAUD MANAGEMENT</h4>
                <p className="text-gray-700">
                  Chargebacks inconsistent with this Agreement or refund policy will be disputed. This Agreement and the inspection report serve as acknowledgement of terms. An attempt to submit a disputed payment after receiving an inspection report will be turned over to the Attorney General's Office for prosecution, as this constitutes Fraud.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">14. ACCEPTANCE</h4>
                <p className="text-gray-700">
                  By signing this Agreement, the Client acknowledges having read and understood all terms, and agrees that CDC's liability is limited to refund of the inspection fee.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">15. AUTHORIZATION</h4>
                <p className="text-gray-700">
                  I hereby authorize CDC Home Inspections to obtain details pertaining to the sale of the property from my Realtor, the Escrow Company and/or the seller, in the event that I dispute the transaction and CDC Home Inspections can prove that the inspection was complete.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contract Initials</CardTitle>
          <CardDescription>
            Please initial each section to acknowledge you have read and understood the terms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { section: '1', title: 'PARTIES' },
              { section: '2', title: 'PURPOSE AND SCOPE' },
              { section: '3', title: 'GENERAL LIMITATIONS AND EXCLUSIONS' },
              { section: '4', title: 'ACCESS AND INSPECTION' },
              { section: '5', title: 'DEFICIENCIES AND CONTRACTORS' },
              { section: '6', title: 'LEGAL ISSUES AND LIMITATIONS OF LIABILITY' },
              { section: '7', title: 'FEES AND PAYMENT' },
              { section: '8', title: 'UTILITY SERVICES' },
              { section: '9', title: 'PARALLEL STUDENTS' },
              { section: '10', title: 'INSPECTOR QUALIFICATIONS AND INSURANCE' },
              { section: '11', title: 'STRICT REFUND POLICY' },
              { section: '12', title: 'RECORDING AND FILMING' },
              { section: '13', title: 'CHARGEBACKS AND FRAUD MANAGEMENT' },
              { section: '14', title: 'ACCEPTANCE' },
              { section: '15', title: 'AUTHORIZATION' }
            ].map(({ section, title }) => (
              <div key={section} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-sm">Section {section}: {title}</h4>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`client-initial-${section}`} className="text-sm">
                      Client Initials:
                    </Label>
                    <Input
                      id={`client-initial-${section}`}
                      value={clientInitials[section] || ''}
                      onChange={(e) => {
                        const value = e.target.value.slice(0, 4); // Limit to 4 characters
                        setClientInitials(prev => ({ ...prev, [section]: value }));
                      }}
                      placeholder="____"
                      className="w-16 text-center text-sm"
                      maxLength={4}
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">Inspector Initials:</Label>
                    {clientInitials[section] ? (
                      <div className="flex items-center gap-2">
                        <img 
                          src="/attached_assets/image_1755576105765.png" 
                          alt="Inspector Signature" 
                          className="h-8 w-auto bg-white border border-gray-200 rounded px-2 py-1"
                        />
                        <span className="text-xs text-green-600 font-medium">DP</span>
                      </div>
                    ) : (
                      <div className="w-16 h-8 border border-gray-200 rounded bg-gray-100 flex items-center justify-center">
                        <span className="text-xs text-gray-400">____</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {Object.keys(clientInitials).length === 15 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-sm text-green-700 font-medium">
                    All sections have been initialed. You may proceed to the digital signature.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Agreement Acknowledgment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-2">
            <Checkbox
              id="hasReadTerms"
              checked={hasReadTerms}
              onCheckedChange={(checked) => setHasReadTerms(checked === true)}
            />
            <Label htmlFor="hasReadTerms" className="text-sm leading-relaxed">
              I have read, understood, and agree to the complete CDC Home Inspection Service Agreement terms, 
              including scope of services, limitations of liability, refund policy, and all other conditions 
              outlined in this agreement. I understand that payment or use of the inspection report confirms 
              my acceptance of all stated terms.
            </Label>
          </div>

          {hasReadTerms && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                <Signature className="w-4 h-4" />
                Digital Signature Required
              </h4>
              <p className="text-sm text-green-700 mb-4">
                Please sign below to complete your agreement. Use your mouse or finger to draw your signature.
              </p>
              
              <div className="border-2 border-gray-300 rounded-lg p-2 bg-white">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={200}
                  className="w-full h-32 cursor-crosshair"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                />
              </div>
              
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">Sign above</p>
                <Button variant="outline" size="sm" onClick={clearSignature}>
                  Clear Signature
                </Button>
              </div>
              
              {signatureDataUrl && (
                <div className="mt-2 p-2 bg-green-100 rounded">
                  <p className="text-sm text-green-700 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Signature captured • Date: {format(new Date(), 'MMMM d, yyyy')}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Button 
            onClick={handleSubmit}
            disabled={!isFormValid()}
            className="w-full py-6 text-lg"
          >
            <Shield className="w-5 h-5 mr-2" />
            Complete Agreement & Continue to Payment
          </Button>
          
          {!isFormValid() && (
            <p className="text-sm text-gray-500 text-center mt-2">
              Please complete all required fields, initial all contract sections, read the terms, and provide your signature
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}