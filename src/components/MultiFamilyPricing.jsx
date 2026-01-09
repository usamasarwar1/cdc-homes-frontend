import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { PaymentButton } from './PaymentButton';
import { DollarSign } from 'lucide-react';

export function MultiFamilyPricing() {
  const multiFamilyScenarios = [
    {
      units: 2,
      discount: 'Fixed Rate',
      scenarios: [
        { description: '2 Units (must share the same address)', payNow: '$825.00', challenge: '$412.50' },
      ]
    },
    {
      units: 3,
      discount: 'Fixed Rate',
      scenarios: [
        { description: '3 Units (must share the same address)', payNow: '$900.00', challenge: '$450.00' },
      ]
    },
    {
      units: 4,
      discount: 'Fixed Rate',
      scenarios: [
        { description: '4 Units (must share the same address)', payNow: '$950.00', challenge: '$475.00' },
      ]
    },
    {
      units: 5,
      discount: 'Fixed Rate',
      scenarios: [
        { description: '5 Units (must share the same address)', payNow: '$1,050.00', challenge: '$525.00' },
      ]
    },
    {
      units: 6,
      discount: 'Fixed Rate',
      scenarios: [
        { description: '6 Units (must share the same address)', payNow: '$1,500.00', challenge: '$750.00' },
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {multiFamilyScenarios.map((unitGroup, groupIndex) => (
        <Card key={groupIndex} className="border-orange-200">
          <CardHeader>
            <CardTitle className="text-lg text-orange-600 flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              {unitGroup.units} Units ({unitGroup.discount} Discount)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-1 xl:grid-cols-1 gap-4">
              {unitGroup.scenarios.map((scenario, scenarioIndex) => (
                <div key={scenarioIndex} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h5 className="font-semibold text-gray-800 mb-3 text-sm">{scenario.description}</h5>
                  
                  <div className="space-y-3">
                    <div className="bg-green-50 border border-green-200 rounded p-3">
                      <div className="text-green-800 font-medium text-sm mb-1">Pay Now</div>
                      <div className="text-lg font-bold text-green-600 mb-2">{scenario.payNow}</div>
                      <PaymentButton
                        amount={scenario.payNow}
                        type="pay-now"
                        description={`${scenario.description} - Pay Now`}
                        buttonText={`Pay ${scenario.payNow} Now`}
                        className="text-xs py-1"
                      />
                    </div>

                    <div className="bg-purple-50 border border-purple-200 rounded p-3">
                      <div className="text-purple-800 font-medium text-sm mb-1">50% Challenge</div>
                      <div className="text-lg font-bold text-purple-600 mb-2">{scenario.challenge}</div>
                      <PaymentButton
                        amount={scenario.challenge}
                        type="challenge"
                        description={`${scenario.description} - 50% Challenge`}
                        buttonText={`Pay ${scenario.challenge} Now`}
                        className="text-xs py-1"
                      />
                    </div>


                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}


    </div>
  );
}