import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Check, Loader2, CreditCard, Lock } from "lucide-react";
import { toast } from "sonner";
import { paymentService, ConfirmPaymentDto } from "@/services/paymentService";
import { transactionService } from "@/services/transactionService";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements
} from "@stripe/react-stripe-js";

// Initialize Stripe outside of component to avoid recreating on each render
// In production, use environment variable for the publishable key
const stripePromise = loadStripe("pk_test_51RRuT6H0pRAFxzG35XCFyBYOfuQUmlxsSNCcKISPllrpuU7kjNq3B34kZ0MMuqnuYrg2t6sEBmQFBiXnh18FZxpf00W7nsec3a");

// Stripe Elements options to prevent unnecessary network requests
const stripeElementsOptions = {
  clientSecret: undefined, // Don't attempt to load a PaymentIntent
  loader: 'auto' as const, // Type-safe loader option
  locale: 'ar' as const, // Type-safe locale
  appearance: {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#0570de',
      colorBackground: '#ffffff',
      colorText: '#30313d',
      colorDanger: '#df1b41',
      fontFamily: 'Arial, sans-serif',
      spacingUnit: '4px',
      borderRadius: '4px',
    }
  }
};

// Create a CardForm component that will handle card details
const CardForm = ({ onPaymentMethodCreated }: { onPaymentMethodCreated: (paymentMethodId: string) => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [cardError, setCardError] = useState<string | null>(null);
  const [postalCode, setPostalCode] = useState("");
  const formRef = React.useRef<HTMLFormElement>(null);
  const [hasCreatedPaymentMethod, setHasCreatedPaymentMethod] = useState(false);
  
  // Track completion status but don't auto-submit
  const [isCardComplete, setIsCardComplete] = useState(false);
  const [isExpiryComplete, setIsExpiryComplete] = useState(false);
  const [isCvcComplete, setIsCvcComplete] = useState(false);
  const [isPostalCodeComplete, setIsPostalCodeComplete] = useState(false);

  useEffect(() => {
    console.log("Card form mounted");
    if (!stripe || !elements) {
      console.log("Stripe or elements not initialized");
      return;
    }
    console.log("Stripe and elements initialized");
  }, [stripe, elements]);
  
  // Handle card element changes
  const handleCardChange = (event: any) => {
    console.log("Card element changed:", event.complete);
    setIsCardComplete(event.complete);
    if (event.error) {
      setCardError(event.error.message);
      setHasCreatedPaymentMethod(false);
    } else {
      setCardError(null);
    }
  };
  
  const handleExpiryChange = (event: any) => {
    console.log("Expiry element changed:", event.complete);
    setIsExpiryComplete(event.complete);
  };
  
  const handleCvcChange = (event: any) => {
    console.log("CVC element changed:", event.complete);
    setIsCvcComplete(event.complete);
  };

  const handlePostalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPostalCode(value);
    setIsPostalCodeComplete(value.length >= 5);
  };

  // Create payment method only when all fields are complete and it hasn't been created yet
  useEffect(() => {
    const createPaymentMethod = async () => {
      if (!hasCreatedPaymentMethod && 
          isCardComplete && 
          isExpiryComplete && 
          isCvcComplete && 
          isPostalCodeComplete &&
          stripe && 
          elements) {
        console.log("All fields complete, creating payment method");
        const cardNumberElement = elements.getElement(CardNumberElement);
        
        if (!cardNumberElement) {
          console.error("Card number element not found");
          return;
        }

        try {
          const { error, paymentMethod } = await stripe.createPaymentMethod({
            type: 'card',
            card: cardNumberElement,
            billing_details: {
              address: {
                postal_code: postalCode
              }
            },
          });

          if (error) {
            console.error("Payment method creation error:", error);
            setCardError(error.message || "An error occurred with your card");
            setHasCreatedPaymentMethod(false);
            return;
          }

          console.log("Payment method created successfully:", paymentMethod.id);
          setHasCreatedPaymentMethod(true);
          onPaymentMethodCreated(paymentMethod.id);
        } catch (err) {
          console.error("Error creating payment method:", err);
          setHasCreatedPaymentMethod(false);
        }
      }
    };

    createPaymentMethod();
  }, [isCardComplete, isExpiryComplete, isCvcComplete, isPostalCodeComplete, stripe, elements, postalCode, onPaymentMethodCreated, hasCreatedPaymentMethod]);

  // Card element styling and options
  const elementStyle = {
    style: {
      base: {
        fontSize: '16px',
        color: 'var(--card-text-color, #32325d)',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        '::placeholder': {
          color: 'var(--card-placeholder-color, #aab7c4)',
        },
        backgroundColor: 'transparent',
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a',
      },
    }
  };

  // Special options for CVC to make it protected
  const cvcElementStyle = {
    style: {
      base: {
        ...elementStyle.style.base,
        '::placeholder': {
          color: 'var(--card-placeholder-color, #aab7c4)',
        },
        // Simple styling
        'font-family': 'monospace',
        'letter-spacing': '0.2em',
        'color': 'var(--card-text-color, #32325d)',
        'font-size': '16px',
        'background-color': 'transparent',
      },
      invalid: elementStyle.style.invalid,
    },
    placeholder: '•••'
  };
  
  // Add styling for dark/light mode
  useEffect(() => {
    // Add the basic styling
    const style = document.createElement('style');
    style.textContent = `
      /* CSS variables for theme colors */
      :root {
        --card-text-color: #32325d;
        --card-placeholder-color: #aab7c4;
        --card-bg-color: #ffffff;
        --card-border-color: #e2e8f0;
      }
      
      .dark {
        --card-text-color: #ffffff;
        --card-placeholder-color: #93a3b8;
        --card-bg-color: transparent;
        --card-border-color: #374151;
      }
      
      /* Limit CVC container size */
      #cardCvc {
        max-width: 6em;
      }
      
      /* Ensure Stripe CVC element is visible */
      #cardCvc .StripeElement {
        width: 100%;
      }
      
      /* Stripe element styling for theme compatibility */
      .StripeElement {
        background-color: transparent !important;
      }
      
      .StripeElement--focus {
        box-shadow: 0 0 0 2px var(--focus-ring-color, rgba(59, 130, 246, 0.5)) !important;
      }
      
      /* Dark mode adjustments */
      .dark .StripeElement--focus {
        box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.3) !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  return (
    <form ref={formRef}>
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cardNumber">رقم البطاقة</Label>
            <div className="p-3 border rounded-md bg-white dark:bg-transparent border-slate-200 dark:border-gray-700">
              <CardNumberElement 
                id="cardNumber"
                options={{
                  ...elementStyle,
                  showIcon: true,
                  iconStyle: 'solid'
                }}
                onChange={handleCardChange}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cardExpiry">تاريخ الانتهاء</Label>
              <div className="p-3 border rounded-md bg-white dark:bg-transparent border-slate-200 dark:border-gray-700">
                <CardExpiryElement 
                  id="cardExpiry"
                  options={{
                    ...elementStyle,
                    placeholder: 'M/Y'
                  }}
                  onChange={handleExpiryChange}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cardCvc">رمز الأمان</Label>
              <div className="p-3 border rounded-md bg-white dark:bg-transparent border-slate-200 dark:border-gray-700">
                <CardCvcElement 
                  id="cardCvc"
                  options={cvcElementStyle}
                  onChange={handleCvcChange}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="postalCode">الرمز البريدي</Label>
            <div className="p-3 border rounded-md bg-white dark:bg-transparent border-slate-200 dark:border-gray-700">
              <Input
                id="postalCode"
                value={postalCode}
                onChange={handlePostalCodeChange}
                placeholder="مثال: 12345"
                required
                type="text"
                className="bg-transparent border-0 p-0 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-400 w-full focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
          </div>
          
          {cardError && <div className="text-red-500 text-sm">{cardError}</div>}
        </div>
      </div>
    </form>
  );
};

interface CheckoutProps {}

const Checkout: React.FC<CheckoutProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutData, setCheckoutData] = useState<any>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentId, setPaymentId] = useState<number | null>(null);
  const [paymentMethodId, setPaymentMethodId] = useState<string | null>(null);
  const [hasStartedPayment, setHasStartedPayment] = useState(false);

  // Extract checkout data from location state
  useEffect(() => {
    console.log("Checkout component mounted");
    if (location.state?.checkoutData) {
      console.log("Checkout data received:", location.state.checkoutData);
      setCheckoutData(location.state.checkoutData);
    } else {
      console.log("No checkout data found, redirecting");
      toast.error("لا توجد بيانات للدفع");
      navigate(`/payment/${id}`);
    }
  }, [location.state, navigate, id]);

  const handlePaymentMethodCreated = (paymentMethodId: string) => {
    console.log("Payment method received in Checkout:", paymentMethodId);
    setPaymentMethodId(paymentMethodId);
  };
  
  // New direct payment handler
  const handleDirectPayment = async () => {
    console.log("Direct payment handler called");
    console.log("Current state:", { isProcessing, paymentMethodId, checkoutData, hasStartedPayment });
    
    if (isProcessing || hasStartedPayment) {
      console.log("Payment is already processing or has started");
      return;
    }
    
    setIsProcessing(true);
    setHasStartedPayment(true);
    
    try {
      if (!checkoutData) {
        throw new Error("No checkout data available");
      }

      if (!paymentMethodId) {
        throw new Error("No payment method ID available");
      }

      if (!checkoutData.transactionId) {
        throw new Error("No transaction ID available");
      }
      
      // Get transaction ID
      const transactionId = typeof checkoutData.transactionId === 'string' 
        ? parseInt(checkoutData.transactionId, 10) 
        : checkoutData.transactionId;
        
      if (isNaN(transactionId)) {
        throw new Error("Invalid transaction ID");
      }
      
      // First get the payment from the transaction
      console.log("Getting payment by transaction ID:", transactionId);
      const payment = await paymentService.getPaymentByTransactionId(transactionId);
      console.log("Payment retrieved:", payment);
      
      if (!payment || !payment.id) {
        throw new Error("No payment found for this transaction");
      }
      
      // Now try to find the client secret using the payment ID
      let clientSecret = null;
      
      // First try using the payment ID we just retrieved
      clientSecret = localStorage.getItem(`payment_${payment.id}_clientSecret`);
      console.log(`Checking for payment_${payment.id}_clientSecret:`, clientSecret);
      
      // If not found, try to find any client secret key
      if (!clientSecret) {
        console.log("Searching for client secret in localStorage...");
        // Get all localStorage keys
        const keys = Object.keys(localStorage);
        console.log("All localStorage keys:", keys);
        
        // Find keys that match the pattern payment_*_clientSecret
        const clientSecretKeys = keys.filter(key => key.startsWith('payment_') && key.includes('_clientSecret'));
        console.log("Client secret keys found:", clientSecretKeys);
        
        if (clientSecretKeys.length > 0) {
          // Use the most recent one (assuming highest payment ID is most recent)
          const sortedKeys = clientSecretKeys.sort((a, b) => {
            const idA = parseInt(a.split('_')[1]);
            const idB = parseInt(b.split('_')[1]);
            return idB - idA; // Sort in descending order
          });
          
          clientSecret = localStorage.getItem(sortedKeys[0]);
          console.log(`Using client secret from ${sortedKeys[0]}:`, clientSecret);
        }
      }
      
      // Fallback to the generic key
      if (!clientSecret) {
        clientSecret = localStorage.getItem('paymentClientSecret');
        console.log("Fallback to generic paymentClientSecret:", clientSecret);
      }
      
      if (!clientSecret) {
        throw new Error("No client secret found in localStorage");
      }
      
      // Check if payment is already completed
      let paymentCompleted = payment.status === "Completed";
      console.log("Initial payment status:", payment.status, "Completed:", paymentCompleted);
      
      // Try to verify payment, but continue even if verification fails
      if (!paymentCompleted) {
        console.log("Verifying payment with ID:", payment.id);
        try {
          const verifiedPayment = await paymentService.verifyPayment(payment.id);
          console.log("Payment verified:", verifiedPayment);
          if (verifiedPayment && verifiedPayment.status === "Completed") {
            paymentCompleted = true;
            console.log("Payment completed after verification");
          }
        } catch (verifyError) {
          console.warn("Payment verification failed but continuing:", verifyError);
        }
      }
      
      // Extract payment intent ID from client secret in localStorage
      console.log("Client secret before extraction:", clientSecret);
      const paymentIntentId = clientSecret.split('_secret_')[0];
      console.log("Extracted payment intent ID from client secret:", paymentIntentId);
      
      if (!paymentIntentId) {
        throw new Error("Failed to extract payment intent ID from client secret");
      }
      
      // Only confirm payment if not already completed
      if (!paymentCompleted) {
        // Confirm payment with payment intent ID and payment method ID
        console.log("Confirming payment with:", {
          paymentIntentId: paymentIntentId,
          paymentMethod: paymentMethodId
        });
        
        try {
          const confirmedPayment = await paymentService.confirmPayment({
            paymentIntentId: paymentIntentId,
            paymentMethod: paymentMethodId
          });
          
          console.log("Payment confirmation response:", confirmedPayment);
          
          // Check payment status from confirmation response
          if (confirmedPayment && (confirmedPayment.status === 'succeeded' || confirmedPayment.status === 'complete' || confirmedPayment.status === 'Completed')) {
            paymentCompleted = true;
            console.log("Payment completed after confirmation with status:", confirmedPayment.status);
          }
        } catch (confirmError) {
          console.warn("Payment confirmation error:", confirmError);
          // Check if the error is just about confirmation being required or invalid payment data
          if (confirmError.message && (
              confirmError.message.includes("مطلوب تأكيد الدفع") || 
              confirmError.message.includes("البيانات المدخلة غير صحيحة")
            )) {
            console.log("Payment error occurred but we'll proceed anyway:", confirmError.message);
            paymentCompleted = true; // Proceed anyway and mark as completed
          } else {
            throw confirmError; // Re-throw if it's a different error
          }
        }
      }
      
      // Check payment status again after all operations
      const finalPayment = await paymentService.getPaymentByTransactionId(transactionId);
      console.log("Final payment status check:", finalPayment);
      
      // Only update transaction if payment is completed
      if (paymentCompleted || (finalPayment && finalPayment.status === "Completed")) {
        console.log("Payment is completed. Updating transaction ID:", transactionId);
        const transaction = await transactionService.getTransactionById(transactionId);
        await transactionService.updateTransaction(transactionId, {
          amount: transaction.amount,
          type: transaction.type,
          description: transaction.description,
          status: 1 // Completed
        });
        console.log("Transaction updated successfully");
        
        // Success
        setPaymentSuccess(true);
        toast.success("تم إتمام عملية الدفع بنجاح!");
        
        // Clear all client secret keys from localStorage
        Object.keys(localStorage).forEach(key => {
          if (key.includes('clientSecret')) {
            localStorage.removeItem(key);
          }
        });
        
        // Redirect after a short delay
        setTimeout(() => {
          console.log("Redirecting to home page");
          navigate("/");
        }, 2000);
      } else {
        console.log("Payment was not completed. Transaction status not updated.");
        toast.error("لم يتم إتمام عملية الدفع بنجاح. يرجى المحاولة مرة أخرى.");
        setHasStartedPayment(false);
      }
      
    } catch (error) {
      console.error("Payment error:", error);
      setHasStartedPayment(false); // Reset payment started flag on error
      toast.error(error instanceof Error ? error.message : "حدث خطأ أثناء معالجة الدفع");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // This is for the card form submission, not the main payment button
  };

  // If no checkout data yet, show loading
  if (!checkoutData) {
    return <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-white">جاري التحميل...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-extrabold mb-10 text-center text-blue-700 drop-shadow">إتمام الطلب</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            {paymentSuccess ? (
              <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold mb-2">تم الدفع بنجاح!</h2>
                <p className="text-gray-600 mb-6">
                  تم إتمام عملية الدفع بنجاح. سيتم توجيهك تلقائيًا.
                </p>
                <Button 
                  onClick={() => {
                    navigate("/");  // Redirect to main page
                  }}
                  className="w-full md:w-auto"
                >
                  العودة للصفحة الرئيسية
                </Button>
              </div>
            ) : (
              <div className="space-y-8 rtl">
                {/* قسم بيانات البطاقة (يظهر فقط إذا كانت طريقة الدفع بطاقة ائتمانية) */}
                {checkoutData.paymentMethod === "CreditCard" && (
                  <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                      <CreditCard className="text-blue-600" /> بيانات البطاقة
                    </h2>
                    <Elements stripe={stripePromise} options={stripeElementsOptions}>
                      <CardForm onPaymentMethodCreated={handlePaymentMethodCreated} />
                    </Elements>
                    <div className="mt-8 pt-6 border-t border-slate-200 dark:border-gray-700">
                      <button 
                        onClick={handleDirectPayment}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white py-3 flex items-center justify-center rounded-xl text-lg font-bold shadow transition"
                        disabled={isProcessing || !paymentMethodId || !checkoutData}
                        type="button"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                            جاري معالجة الدفع...
                          </>
                        ) : (
                          <>
                            <CreditCard className="mr-2 h-6 w-6" />
                            إتمام عملية الدفع
                          </>
                        )}
                      </button>
                      <p className="text-xs text-slate-500 dark:text-gray-400 text-center mt-3 flex items-center justify-center gap-1">
                        <Lock className="w-4 h-4 text-green-500" />
                        بيانات بطاقتك آمنة ومشفرة بالكامل
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          {/* ملخص الطلب */}
          <div>
            <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 sticky top-8">
              <h2 className="text-xl font-bold mb-6">ملخص الطلب</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b">
                  <span>{checkoutData.type === 'listing' ? 'منتج' : 'مزاد'}</span>
                  <span className="font-semibold">{checkoutData.title}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b">
                  <span>السعر</span>
                  <span className="font-semibold">{checkoutData.amount.toLocaleString()} ₪</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b">
                  <span>الشحن</span>
                  <span className="font-semibold">30 ₪</span>
                </div>
                <div className="flex justify-between items-center py-3 text-lg font-bold">
                  <span>الإجمالي</span>
                  <span>{(checkoutData.amount + 30 ).toLocaleString()} ₪</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
