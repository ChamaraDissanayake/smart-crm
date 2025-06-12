import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { subscriptionPlansService } from '../../services/SubscriptionPlansService';
import { SubscriptionPlan } from '../../types/SubscriptionPlan';
import { useSearchParams } from 'react-router-dom';

const ChoosePlanPage = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan["id"] | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!selectedPlan) return;
      const companyId = searchParams.get('companyId') || '';
      console.log('Selected Plan:', selectedPlan, billingCycle, companyId);
      if (!companyId) {
        console.error('Company ID is required.');
        return;
      }
      await subscriptionPlansService.subscribeToPlan(
        companyId,
        selectedPlan,
        billingCycle
      );
      navigate('/dashboard/home');
    } catch (error) {
      console.log('Error subscribing to plan:', error);
    }
  };

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const plans = await subscriptionPlansService.getAllPlans();

        const orderedPlans = plans.sort((a: SubscriptionPlan, b: SubscriptionPlan) => {
          return a.priceMonthly - b.priceMonthly;
        });
        setPlans(orderedPlans);
      } catch (error) {
        console.error('Error fetching plans:', error);
      }
    };

    fetchPlans();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-[#E1DBF3]">
      <div className="w-full max-w-6xl p-8 bg-white border border-gray-200 shadow-sm rounded-2xl">
        <h2 className="mb-6 text-2xl font-bold text-center text-gray-900">Choose a Plan</h2>

        <div className="flex items-center justify-center mb-8 space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              value="monthly"
              checked={billingCycle === 'monthly'}
              onChange={() => setBillingCycle('monthly')}
              className="text-blue-600 form-radio"
            />
            <span className="text-sm font-medium text-gray-700">Monthly</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              value="yearly"
              checked={billingCycle === 'yearly'}
              onChange={() => setBillingCycle('yearly')}
              className="text-blue-600 form-radio"
            />
            <span className="text-sm font-medium text-gray-700">Yearly</span>
          </label>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map(plan => {
            const price =
              billingCycle === 'monthly'
                ? `$${plan.priceMonthly}/mo`
                : `$${plan.priceYearly}/yr`;
            const isSelected = selectedPlan === plan.id;

            return (
              <label
                key={plan.id}
                className={`border rounded-xl p-5 cursor-pointer hover:shadow-md transition-all flex flex-col items-center text-center ${isSelected ? 'border-blue-600 shadow-md' : 'border-gray-300'
                  }`}
              >
                <input
                  type="radio"
                  name="plan"
                  value={plan.id}
                  checked={isSelected}
                  onChange={() => setSelectedPlan(plan.id)}
                  className="hidden"
                />
                <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                <p className="mt-1 font-bold text-blue-600">{price}</p>
                <p className="mt-2 text-sm text-gray-600">{plan.description}</p>
              </label>
            );
          })}

          <button
            type="submit"
            className={`col-span-full w-full py-2.5 mt-6 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all duration-200 ${!selectedPlan ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            disabled={!selectedPlan}
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChoosePlanPage;
